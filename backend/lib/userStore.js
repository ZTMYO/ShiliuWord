const { all, get, run, withTransaction } = require("./db");
const { hashPassword, verifyPassword } = require("./security");
const { containsForbiddenWord } = require("./forbiddenWords");
const { DEFAULT_BOOK_ID } = require("../config");

const HISTORY_RECORD_LIMIT = 50;

function normalizeUsername(value) {
  return String(value || "").trim();
}

function normalizeText(value) {
  return String(value || "").trim();
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(String(value || ""));
  } catch {
    return fallback;
  }
}

function formatUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    username: String(row.username || ""),
    nickname: String(row.nickname || ""),
    passwordHash: String(row.password_hash || ""),
    bookId: Math.max(1, Number(row.book_id || DEFAULT_BOOK_ID)),
    currentStreak: Math.max(0, Number(row.current_streak || 0)),
    bestStreak: Math.max(0, Number(row.best_streak || 0)),
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || "")
  };
}

function formatSafeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname || user.username,
    bookId: Math.max(1, Number(user.bookId || DEFAULT_BOOK_ID)),
    currentStreak: Math.max(0, Number(user.currentStreak || 0)),
    bestStreak: Math.max(0, Number(user.bestStreak || 0))
  };
}

async function getWordleLeaderboard(userId, limit = 20) {
  const normalizedUserId = Number(userId);
  const normalizedLimit = Math.max(1, Math.min(100, Number(limit || 20)));
  const leaderboardRows = await all(
    `
      SELECT id, username, nickname, best_streak
      FROM users
      ORDER BY best_streak DESC, id ASC
      LIMIT ?
    `,
    [normalizedLimit]
  );

  const selfRow = await get(
    `
      SELECT id, username, nickname, current_streak, best_streak
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [normalizedUserId]
  );

  let self = null;
  if (selfRow) {
    const normalizedBestStreak = Math.max(0, Number(selfRow.best_streak || 0));
    const rankRow = await get(
      `
        SELECT COUNT(1) AS count
        FROM users
        WHERE best_streak > ?
           OR (best_streak = ? AND id < ?)
      `,
      [normalizedBestStreak, normalizedBestStreak, normalizedUserId]
    );

    self = {
      rank: Number(rankRow?.count || 0) + 1,
      username: normalizeUsername(selfRow.username),
      nickname: String(selfRow.nickname || "") || normalizeUsername(selfRow.username),
      currentStreak: Math.max(0, Number(selfRow.current_streak || 0)),
      bestStreak: normalizedBestStreak
    };
  }

  return {
    leaderboard: leaderboardRows.map((row) => ({
      id: Number(row.id),
      username: normalizeUsername(row.username),
      nickname: String(row.nickname || "") || normalizeUsername(row.username),
      bestStreak: Math.max(0, Number(row.best_streak || 0))
    })),
    self
  };
}

async function findUserById(userId) {
  const row = await get("SELECT * FROM users WHERE id = ? LIMIT 1", [Number(userId)]);
  return formatUser(row);
}

async function findUserByUsername(username) {
  const row = await get("SELECT * FROM users WHERE username = ? LIMIT 1", [normalizeUsername(username)]);
  return formatUser(row);
}

async function createUser(username, password, nickname) {
  const normalizedUsername = normalizeUsername(username);
  const normalizedPassword = String(password || "");
  const normalizedNickname = String(nickname || "").trim().slice(0, 8) || normalizedUsername;

  if (!/^[a-zA-Z0-9]{3,15}$/.test(normalizedUsername)) {
    throw new Error("用户名需为 3 到 15 位字母数字");
  }

  if (normalizedPassword.length < 6) {
    throw new Error("密码至少 6 位");
  }

  if (containsForbiddenWord(normalizedNickname)) {
    throw new Error("昵称包含违规内容");
  }

  const existingUser = await findUserByUsername(normalizedUsername);
  if (existingUser) {
    throw new Error("用户名已存在");
  }

  const now = new Date().toISOString();
  await run(
    `
      INSERT INTO users (username, nickname, password_hash, book_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [normalizedUsername, normalizedNickname, hashPassword(normalizedPassword), DEFAULT_BOOK_ID, now, now]
  );

  const createdUser = await findUserByUsername(normalizedUsername);
  return createdUser;
}

async function verifyUserCredentials(username, password) {
  const user = await findUserByUsername(username);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null;
  }
  return user;
}

async function updateUserBook(userId, bookId) {
  const { WORD_BOOKS } = require("../config");
  const validBookIds = WORD_BOOKS.map(b => b.id);
  const normalizedBookId = Number(bookId || 0);
  if (!Number.isFinite(normalizedBookId) || !validBookIds.includes(normalizedBookId)) {
    throw new Error("词书参数不合法");
  }

  const now = new Date().toISOString();
  await run(
    "UPDATE users SET book_id = ?, updated_at = ? WHERE id = ?",
    [normalizedBookId, now, Number(userId)]
  );
  return findUserById(userId);
}

async function applyWordleResult(userId, won) {
  const normalizedUserId = Number(userId);
  const didWin = Boolean(won);

  return withTransaction(async (db) => {
    const row = db.get(
      `
        SELECT id, current_streak, best_streak
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [normalizedUserId]
    );

    if (!row) {
      throw new Error("用户不存在");
    }

    const currentStreak = Math.max(0, Number(row.current_streak || 0));
    const bestStreak = Math.max(0, Number(row.best_streak || 0));
    const nextCurrentStreak = didWin ? currentStreak + 1 : 0;
    const nextBestStreak = didWin ? Math.max(bestStreak, nextCurrentStreak) : bestStreak;
    const updatedAt = new Date().toISOString();

    db.run(
      `
        UPDATE users
        SET current_streak = ?, best_streak = ?, updated_at = ?
        WHERE id = ?
      `,
      [nextCurrentStreak, nextBestStreak, updatedAt, normalizedUserId]
    );

    return {
      currentStreak: nextCurrentStreak,
      bestStreak: nextBestStreak
    };
  });
}

async function listCollection(userId) {
  const rows = await all(
    `
      SELECT word, word_cn, collected_at
      FROM collections
      WHERE user_id = ?
      ORDER BY datetime(collected_at) DESC, word ASC
    `,
    [Number(userId)]
  );

  return rows.map((row) => ({
    word: normalizeText(row.word),
    wordCn: normalizeText(row.word_cn),
    collectedAt: normalizeText(row.collected_at)
  }));
}

async function addCollectionItem(userId, word, wordCn) {
  const normalizedWord = normalizeText(word);
  if (!normalizedWord) {
    throw new Error("单词不能为空");
  }

  const existing = await get(
    "SELECT word, word_cn, collected_at FROM collections WHERE user_id = ? AND word = ? LIMIT 1",
    [Number(userId), normalizedWord]
  );
  if (existing) {
    return {
      exists: true,
      item: {
        word: normalizeText(existing.word),
        wordCn: normalizeText(existing.word_cn),
        collectedAt: normalizeText(existing.collected_at)
      }
    };
  }

  const collectedAt = new Date().toISOString();
  await run(
    "INSERT INTO collections (user_id, word, word_cn, collected_at) VALUES (?, ?, ?, ?)",
    [Number(userId), normalizedWord, normalizeText(wordCn), collectedAt]
  );

  return {
    exists: false,
    item: {
      word: normalizedWord,
      wordCn: normalizeText(wordCn),
      collectedAt
    }
  };
}

async function removeCollectionItem(userId, word) {
  const normalizedWord = normalizeText(word);
  if (!normalizedWord) {
    throw new Error("缺少删除参数");
  }

  await run("DELETE FROM collections WHERE user_id = ? AND word = ?", [Number(userId), normalizedWord]);
}

async function listQuizHistory(userId) {
  const rows = await all(
    `
      SELECT id, mode, created_at, completed, placements_json, result_json, items_json
      FROM quiz_history
      WHERE user_id = ?
      ORDER BY datetime(created_at) DESC, id DESC
      LIMIT ?
    `,
    [Number(userId), HISTORY_RECORD_LIMIT]
  );

  return rows.map((row) => ({
    id: normalizeText(row.id),
    mode: normalizeText(row.mode),
    createdAt: normalizeText(row.created_at),
    completed: Boolean(Number(row.completed)),
    placements: safeJsonParse(row.placements_json, []),
    result: safeJsonParse(row.result_json, []),
    items: safeJsonParse(row.items_json, [])
  }));
}

async function upsertQuizHistory(userId, record) {
  if (!record?.id) {
    throw new Error("刷题记录缺少 id");
  }

  const normalizedRecord = {
    id: normalizeText(record.id),
    mode: normalizeText(record.mode) || "random",
    createdAt: normalizeText(record.createdAt) || new Date().toISOString(),
    completed: record.completed === false ? 0 : 1,
    placements: JSON.stringify(Array.isArray(record.placements) ? record.placements : []),
    result: JSON.stringify(Array.isArray(record.result) ? record.result : []),
    items: JSON.stringify(Array.isArray(record.items) ? record.items : []),
    updatedAt: new Date().toISOString()
  };

  await withTransaction(async (db) => {
    const existing = db.get(
      "SELECT id FROM quiz_history WHERE user_id = ? AND id = ? LIMIT 1",
      [Number(userId), normalizedRecord.id]
    );
    if (existing) {
      db.run(
        `
          UPDATE quiz_history
          SET mode = ?, created_at = ?, completed = ?, placements_json = ?, result_json = ?, items_json = ?, updated_at = ?
          WHERE id = ? AND user_id = ?
        `,
        [
          normalizedRecord.mode,
          normalizedRecord.createdAt,
          normalizedRecord.completed,
          normalizedRecord.placements,
          normalizedRecord.result,
          normalizedRecord.items,
          normalizedRecord.updatedAt,
          normalizedRecord.id,
          Number(userId)
        ]
      );
      return;
    }

    db.run(
      `
        INSERT INTO quiz_history (id, user_id, mode, created_at, completed, placements_json, result_json, items_json, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        normalizedRecord.id,
        Number(userId),
        normalizedRecord.mode,
        normalizedRecord.createdAt,
        normalizedRecord.completed,
        normalizedRecord.placements,
        normalizedRecord.result,
        normalizedRecord.items,
        normalizedRecord.updatedAt
      ]
    );
  });
}

async function listFlashHistory(userId) {
  const rows = await all(
    `
      SELECT id, word, word_cn, is_correct, created_at
      FROM flash_history
      WHERE user_id = ?
      ORDER BY datetime(created_at) DESC, id DESC
      LIMIT ?
    `,
    [Number(userId), HISTORY_RECORD_LIMIT]
  );

  return rows.map((row) => ({
    id: normalizeText(row.id),
    word: normalizeText(row.word),
    wordCn: normalizeText(row.word_cn),
    isCorrect: Boolean(Number(row.is_correct)),
    createdAt: normalizeText(row.created_at)
  }));
}

async function addFlashHistory(userId, record) {
  if (!record?.id) {
    throw new Error("闪卡刷词历史缺少 id");
  }

  await run(
    `
      INSERT OR REPLACE INTO flash_history (id, user_id, word, word_cn, is_correct, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      normalizeText(record.id),
      Number(userId),
      normalizeText(record.word),
      normalizeText(record.wordCn),
      record.isCorrect ? 1 : 0,
      normalizeText(record.createdAt) || new Date().toISOString()
    ]
  );
}

async function updateUserNickname(userId, nickname) {
  const normalizedUserId = Number(userId);
  const normalizedNickname = String(nickname || "").trim().slice(0, 8);
  
  if (!normalizedNickname) {
    throw new Error("昵称不能为空");
  }

  if (containsForbiddenWord(normalizedNickname)) {
    throw new Error("昵称包含违规内容");
  }

  const now = new Date().toISOString();
  await run(
    "UPDATE users SET nickname = ?, updated_at = ? WHERE id = ?",
    [normalizedNickname, now, normalizedUserId]
  );
  return findUserById(normalizedUserId);
}

async function clearHistory(userId) {
  await withTransaction(async (db) => {
    db.run("DELETE FROM quiz_history WHERE user_id = ?", [Number(userId)]);
    db.run("DELETE FROM flash_history WHERE user_id = ?", [Number(userId)]);
  });
}

async function updateUserPassword(userId, oldPassword, newPassword) {
  const normalizedUserId = Number(userId);
  const normalizedOldPassword = String(oldPassword || "");
  const normalizedNewPassword = String(newPassword || "");

  const user = await findUserById(normalizedUserId);
  if (!user) {
    throw new Error("用户不存在");
  }

  const row = await get("SELECT password_hash FROM users WHERE id = ? LIMIT 1", [normalizedUserId]);
  if (!row || !verifyPassword(normalizedOldPassword, row.password_hash)) {
    throw new Error("旧密码不正确");
  }

  if (normalizedNewPassword.length < 6) {
    throw new Error("新密码至少 6 位");
  }

  const now = new Date().toISOString();
  await run(
    "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
    [hashPassword(normalizedNewPassword), now, normalizedUserId]
  );

  return findUserById(normalizedUserId);
}

module.exports = {
  createUser,
  verifyUserCredentials,
  findUserById,
  findUserByUsername,
  updateUserBook,
  updateUserNickname,
  updateUserPassword,
  applyWordleResult,
  formatSafeUser,
  listCollection,
  addCollectionItem,
  removeCollectionItem,
  getWordleLeaderboard,
  listQuizHistory,
  upsertQuizHistory,
  listFlashHistory,
  addFlashHistory,
  clearHistory
};
