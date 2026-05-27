const crypto = require("crypto");
const path = require("path");
const express = require("express");
const {
  PORT,
  SESSION_SECRET,
  SESSION_COOKIE_NAME,
  SESSION_TTL_HOURS,
  DATA_DIR
} = require("./config");
const { ensureDataFiles, listWordBooks, readAllBookWords, readWordExamples, readWordCache } = require("./lib/wordService");
const { getDatabase } = require("./lib/db");
const { get } = require("./lib/db");
const {
  createUser,
  verifyUserCredentials,
  findUserById,
  formatSafeUser,
  updateUserBook,
  updateUserNickname,
  updateUserPassword,
  applyWordleResult,
  listCollection,
  addCollectionItem,
  removeCollectionItem,
  getWordleLeaderboard,
  listQuizHistory,
  upsertQuizHistory,
  listFlashHistory,
  addFlashHistory,
  clearHistory
} = require("./lib/userStore");
const randomRouter = require("./router/wordRandom");
const shapeRouter = require("./router/wordShape");
const synonymRouter = require("./router/wordSynonym");
const flashRouter = require("./router/wordFlash");
const readingRouter = require("./router/wordReading");
const { validatePersonalApiKey } = require("./lib/aiService");
const { loadForbiddenWords } = require("./lib/forbiddenWords");

const app = express();
const DIST_DIR = path.join(__dirname, "..", "frontend", "dist");
const SESSION_TTL_MS = SESSION_TTL_HOURS * 60 * 60 * 1000;

let _statsCache = null;
let _statsCacheTime = 0;
const STATS_CACHE_TTL = 2 * 60 * 1000;

app.use(express.json());

function parseCookies(request) {
  const header = String(request.headers.cookie || "");
  return header.split(";").reduce((cookies, part) => {
    const [rawKey, ...rawValueParts] = part.trim().split("=");
    if (!rawKey) {
      return cookies;
    }
    cookies[rawKey] = decodeURIComponent(rawValueParts.join("=") || "");
    return cookies;
  }, {});
}

function createSignature(payload) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
}

function createSessionToken(user) {
  const payload = Buffer.from(
    JSON.stringify({
      userId: Number(user.id),
      exp: Date.now() + SESSION_TTL_MS
    }),
    "utf8"
  ).toString("base64url");

  return `${payload}.${createSignature(payload)}`;
}

function readSession(request) {
  const token = parseCookies(request)[SESSION_COOKIE_NAME];
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature || createSignature(payload) !== signature) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!session?.userId || Number(session.exp) <= Date.now()) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function isSecureRequest(request) {
  return request.secure || String(request.headers["x-forwarded-proto"] || "").includes("https");
}

function buildCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (typeof options.maxAge === "number") {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge / 1000))}`);
  }
  if (options.expires instanceof Date) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }

  parts.push(`Path=${options.path || "/"}`);
  parts.push("HttpOnly");
  parts.push(`SameSite=${options.sameSite || "Lax"}`);

  if (options.secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function setSessionCookie(request, response, user) {
  response.setHeader(
    "Set-Cookie",
    buildCookie(SESSION_COOKIE_NAME, createSessionToken(user), {
      maxAge: SESSION_TTL_MS,
      secure: isSecureRequest(request)
    })
  );
}

function clearSessionCookie(request, response) {
  response.setHeader(
    "Set-Cookie",
    buildCookie(SESSION_COOKIE_NAME, "", {
      maxAge: 0,
      expires: new Date(0),
      secure: isSecureRequest(request)
    })
  );
}

async function requireAuth(request, response, next) {
  try {
    const session = readSession(request);
    if (!session) {
      response.status(401).json({
        ok: false,
        message: "请先登录"
      });
      return;
    }

    const user = await findUserById(session.userId);
    if (!user) {
      clearSessionCookie(request, response);
      response.status(401).json({
        ok: false,
        message: "账号不存在或已失效，请重新登录"
      });
      return;
    }

    request.auth = {
      session,
      user,
      personalApiKey: sanitizePersonalApiKeyHeader(request.headers["x-user-api-key"])
    };
    next();
  } catch (error) {
    next(error);
  }
}

function sanitizeUsername(value) {
  return String(value || "").trim();
}

function sanitizePassword(value) {
  return String(value || "");
}

function sanitizePersonalApiKeyHeader(value) {
  return String(Array.isArray(value) ? value[0] : value || "").trim();
}

async function getAuthenticatedUser(request) {
  const session = readSession(request);
  if (!session) {
    return null;
  }
  return findUserById(session.userId);
}

app.get("/api/health", async (request, response) => {
  await ensureDataFiles();
  await getDatabase();
  response.json({
    ok: true,
    message: "backend is running"
  });
});

app.post("/api/auth/register", async (request, response, next) => {
  try {
    const username = sanitizeUsername(request.body?.username);
    const password = sanitizePassword(request.body?.password);
    const confirmPassword = sanitizePassword(request.body?.confirmPassword);

    if (password !== confirmPassword) {
      response.status(400).json({
        ok: false,
        message: "两次输入的密码不一致"
      });
      return;
    }

    const user = await createUser(username, password, username);
    setSessionCookie(request, response, user);
    response.json({
      ok: true,
      user: formatSafeUser(user)
    });
  } catch (error) {
    if (/用户名|密码/.test(error.message || "")) {
      response.status(400).json({
        ok: false,
        message: error.message
      });
      return;
    }
    next(error);
  }
});

app.post("/api/auth/login", async (request, response, next) => {
  try {
    const user = await verifyUserCredentials(
      sanitizeUsername(request.body?.username),
      sanitizePassword(request.body?.password)
    );

    if (!user) {
      response.status(401).json({
        ok: false,
        message: "用户名或密码错误"
      });
      return;
    }

    setSessionCookie(request, response, user);
    response.json({
      ok: true,
      user: formatSafeUser(user)
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/me", async (request, response, next) => {
  try {
    const user = await getAuthenticatedUser(request);
    response.json({
      ok: true,
      authenticated: Boolean(user),
      user: formatSafeUser(user)
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/logout", (request, response) => {
  clearSessionCookie(request, response);
  response.json({
    ok: true
  });
});

app.post("/api/user/api-key/validate", requireAuth, async (request, response, next) => {
  try {
    const result = await validatePersonalApiKey(request.body?.apiKey);
    response.json({
      ok: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/stats", async (request, response, next) => {
  try {
    if (_statsCache && Date.now() - _statsCacheTime < STATS_CACHE_TTL) {
      response.json(_statsCache);
      return;
    }

    const [books, exampleMap, wordCache, userCountRow] = await Promise.all([
      listWordBooks(),
      readWordExamples({ forceRefresh: true }),
      readWordCache({ forceRefresh: true }),
      get("SELECT COUNT(1) AS count FROM users")
    ]);

    const uniqueWordsInBooks = (await readAllBookWords({ forceRefresh: true })).length;

    let examplePairCount = 0;
    let accentedCount = 0;
    for (const entry of Object.values(exampleMap || {})) {
      const normalizedEntry = Array.isArray(entry) ? { examples: entry, paraphrase: "" } : entry;
      const examples = Array.isArray(normalizedEntry?.examples) ? normalizedEntry.examples : [];
      if (examples.length) {
        examplePairCount += examples.length;
      }
      if (normalizedEntry?.accent) {
        accentedCount += 1;
      }
    }

    _statsCache = {
      ok: true,
      words: {
        uniqueWordsInBooks,
        bookCount: Array.isArray(books) ? books.length : 0,
        cachedDefinitionCount: Object.keys(wordCache || {}).length
      },
      examples: {
        examplePairCount,
        accentedEntryCount: accentedCount
      },
      users: {
        registeredUsers: Number(userCountRow?.count || 0)
      }
    };
    _statsCacheTime = Date.now();

    response.json(_statsCache);
  } catch (error) {
    next(error);
  }
});

app.get("/api/user/book", requireAuth, async (request, response, next) => {
  try {
    response.json({
      ok: true,
      bookId: request.auth.user.bookId
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/user/book", requireAuth, async (request, response, next) => {
  try {
    const user = await updateUserBook(request.auth.user.id, request.body?.bookId);
    response.json({
      ok: true,
      user: formatSafeUser(user)
    });
  } catch (error) {
    if (/词书参数不合法/.test(error.message || "")) {
      response.status(400).json({
        ok: false,
        message: error.message
      });
      return;
    }
    next(error);
  }
});

app.post("/api/user/nickname", requireAuth, async (request, response, next) => {
  try {
    const user = await updateUserNickname(request.auth.user.id, request.body?.nickname);
    response.json({
      ok: true,
      user: formatSafeUser(user)
    });
  } catch (error) {
    if (/昵称/.test(error.message || "")) {
      response.status(400).json({
        ok: false,
        message: error.message
      });
      return;
    }
    next(error);
  }
});

app.post("/api/user/password", requireAuth, async (request, response, next) => {
  try {
    await updateUserPassword(request.auth.user.id, request.body?.oldPassword, request.body?.newPassword);
    response.json({
      ok: true
    });
  } catch (error) {
    if (/密码/.test(error.message || "")) {
      response.status(400).json({
        ok: false,
        message: error.message
      });
      return;
    }
    next(error);
  }
});

app.get("/api/books", requireAuth, async (request, response, next) => {
  try {
    response.json({
      ok: true,
      books: await listWordBooks()
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/collection", requireAuth, async (request, response, next) => {
  try {
    response.json({
      ok: true,
      collection: await listCollection(request.auth.user.id)
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/collection", requireAuth, async (request, response, next) => {
  try {
    const result = await addCollectionItem(
      request.auth.user.id,
      request.body?.word,
      request.body?.wordCn
    );
    response.json({
      ok: true,
      ...result
    });
  } catch (error) {
    if (/单词不能为空/.test(error.message || "")) {
      response.status(400).json({
        ok: false,
        message: error.message
      });
      return;
    }
    next(error);
  }
});

app.delete("/api/collection", requireAuth, async (request, response, next) => {
  try {
    await removeCollectionItem(request.auth.user.id, request.query.word);
    response.json({
      ok: true
    });
  } catch (error) {
    if (/缺少删除参数/.test(error.message || "")) {
      response.status(400).json({
        ok: false,
        message: error.message
      });
      return;
    }
    next(error);
  }
});

app.get("/api/history", requireAuth, async (request, response, next) => {
  try {
    const section = String(request.query.section || "quiz").trim();
    if (section === "flash") {
      response.json({
        ok: true,
        section,
        records: await listFlashHistory(request.auth.user.id)
      });
      return;
    }

    response.json({
      ok: true,
      section: "quiz",
      records: await listQuizHistory(request.auth.user.id)
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/history/quiz", requireAuth, async (request, response, next) => {
  try {
    await upsertQuizHistory(request.auth.user.id, request.body || {});
    response.json({
      ok: true
    });
  } catch (error) {
    if (/刷题记录缺少 id/.test(error.message || "")) {
      response.status(400).json({
        ok: false,
        message: error.message
      });
      return;
    }
    next(error);
  }
});

app.post("/api/history/flash", requireAuth, async (request, response, next) => {
  try {
    await addFlashHistory(request.auth.user.id, request.body || {});
    response.json({
      ok: true
    });
  } catch (error) {
    if (/闪卡刷词历史缺少 id/.test(error.message || "")) {
      response.status(400).json({
        ok: false,
        message: error.message
      });
      return;
    }
    next(error);
  }
});

app.delete("/api/history", requireAuth, async (request, response, next) => {
  try {
    await clearHistory(request.auth.user.id);
    response.json({
      ok: true
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/wordle/leaderboard", requireAuth, async (request, response, next) => {
  try {
    const limit = Math.max(1, Math.min(100, Number(request.query.limit || 20)));
    const result = await getWordleLeaderboard(request.auth.user.id, limit);
    response.json({
      ok: true,
      leaderboard: result.leaderboard,
      self: result.self
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/wordle/result", requireAuth, async (request, response, next) => {
  try {
    const won = request.body?.won;
    if (typeof won !== "boolean") {
      response.status(400).json({
        ok: false,
        message: "结算参数不合法"
      });
      return;
    }

    await applyWordleResult(request.auth.user.id, won);
    const user = await findUserById(request.auth.user.id);
    response.json({
      ok: true,
      user: formatSafeUser(user)
    });
  } catch (error) {
    if (/用户不存在/.test(error.message || "")) {
      response.status(404).json({
        ok: false,
        message: error.message
      });
      return;
    }
    next(error);
  }
});

app.get("/api/wordle/words", async (request, response, next) => {
  try {
    const fs = require("fs/promises");
    const path = require("path");
    
    const [answersContent, wordsJsonContent] = await Promise.all([
      fs.readFile(path.join(DATA_DIR, "five-letter-answers.txt"), "utf8"),
      fs.readFile(path.join(DATA_DIR, "five-letter-words.json"), "utf8")
    ]);
    
    const answers = answersContent
      .split(/\r?\n/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length === 5);
    
    const wordsJson = JSON.parse(wordsJsonContent);
    const validWords = Object.keys(wordsJson).map((w) => w.toLowerCase());
    
    response.json({
      ok: true,
      answers,
      validWords
    });
  } catch (err) {
    next(err);
  }
});

app.get("/api/word/info/:word", async (request, response, next) => {
  try {
    const word = String(request.params.word || "").trim().toLowerCase();
    if (!word) {
      return response.json({ ok: false, error: "Missing word" });
    }

    const fs = require("fs/promises");
    const path = require("path");

    const [wordData, wordExamples, fiveLetterWords] = await Promise.all([
      readWordCache(),
      readWordExamples(),
      fs.readFile(path.join(DATA_DIR, "five-letter-words.json"), "utf8")
    ]);

    const fiveLetterWordsJson = JSON.parse(fiveLetterWords);

    const info = {
      word,
      wordCn: wordData[word]?.wordCn || "",
      defEn: wordData[word]?.defEn || "",
      defCn: wordData[word]?.defCn || "",
      examples: wordExamples[word]?.examples || [],
      paraphrase: wordExamples[word]?.paraphrase || fiveLetterWordsJson[word]?.paraphrase || "",
      accent: wordExamples[word]?.accent || fiveLetterWordsJson[word]?.accent || ""
    };

    response.json({
      ok: true,
      info
    });
  } catch (err) {
    next(err);
  }
});

app.use("/api/random", requireAuth, randomRouter);
app.use("/api/shape", requireAuth, shapeRouter);
app.use("/api/synonym", requireAuth, synonymRouter);
app.use("/api/flash", requireAuth, flashRouter);
app.use("/api/reading", requireAuth, readingRouter);

app.use(express.static(DIST_DIR));

app.get("*", (request, response, next) => {
  if (request.path.startsWith("/api/")) {
    next();
    return;
  }
  response.sendFile(path.join(DIST_DIR, "index.html"));
});

app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).json({
    ok: false,
    message: error.message || "服务器异常"
  });
});

Promise.all([ensureDataFiles(), getDatabase()])
  .then(() => {
    loadForbiddenWords();
    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("启动失败:", error);
    process.exit(1);
  });
