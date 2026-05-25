const crypto = require("crypto");
const path = require("path");
const express = require("express");
const {
  PORT,
  SESSION_SECRET,
  SESSION_COOKIE_NAME,
  SESSION_TTL_HOURS
} = require("./config");
const { ensureDataFiles } = require("./lib/wordService");
const { getDatabase } = require("./lib/db");
const {
  createUser,
  verifyUserCredentials,
  findUserById,
  formatSafeUser,
  listCollection,
  addCollectionItem,
  removeCollectionItem,
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

const app = express();
const DIST_DIR = path.join(__dirname, "..", "frontend", "dist");
const SESSION_TTL_MS = SESSION_TTL_HOURS * 60 * 60 * 1000;

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

    const user = await createUser(username, password);
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
    if (/百词斩历史缺少 id/.test(error.message || "")) {
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
    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("启动失败:", error);
    process.exit(1);
  });
