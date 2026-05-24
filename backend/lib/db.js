const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");
const { SQLITE_FILE } = require("../config");

let databasePromise = null;

function locateSqlJsFile(file) {
  return path.join(__dirname, "..", "node_modules", "sql.js", "dist", file);
}

function ensureDatabaseDir() {
  fs.mkdirSync(path.dirname(SQLITE_FILE), { recursive: true });
}

function persistDatabase(db) {
  ensureDatabaseDir();
  fs.writeFileSync(SQLITE_FILE, Buffer.from(db.export()));
}

function runSchema(db) {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS collections (
      user_id INTEGER NOT NULL,
      word TEXT NOT NULL,
      word_cn TEXT NOT NULL DEFAULT '',
      collected_at TEXT NOT NULL,
      PRIMARY KEY (user_id, word),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quiz_history (
      user_id INTEGER NOT NULL,
      id TEXT NOT NULL,
      mode TEXT NOT NULL,
      created_at TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 1,
      placements_json TEXT NOT NULL,
      result_json TEXT NOT NULL,
      items_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (user_id, id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_quiz_history_user_created_at
      ON quiz_history(user_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS flash_history (
      user_id INTEGER NOT NULL,
      id TEXT NOT NULL,
      word TEXT NOT NULL,
      word_cn TEXT NOT NULL DEFAULT '',
      is_correct INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_flash_history_user_created_at
      ON flash_history(user_id, created_at DESC);
  `);

}

async function createDatabase() {
  const SQL = await initSqlJs({
    locateFile: locateSqlJsFile
  });

  ensureDatabaseDir();
  const db = fs.existsSync(SQLITE_FILE)
    ? new SQL.Database(fs.readFileSync(SQLITE_FILE))
    : new SQL.Database();

  runSchema(db);
  persistDatabase(db);
  return db;
}

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = createDatabase();
  }
  return databasePromise;
}

function executePrepared(db, sql, params = [], mode = "run") {
  const statement = db.prepare(sql);
  try {
    statement.bind(params);

    if (mode === "get") {
      return statement.step() ? statement.getAsObject() : null;
    }

    if (mode === "all") {
      const rows = [];
      while (statement.step()) {
        rows.push(statement.getAsObject());
      }
      return rows;
    }

    statement.step();
    return null;
  } finally {
    statement.free();
  }
}

async function run(sql, params = []) {
  const db = await getDatabase();
  executePrepared(db, sql, params, "run");
  persistDatabase(db);
}

async function get(sql, params = []) {
  const db = await getDatabase();
  return executePrepared(db, sql, params, "get");
}

async function all(sql, params = []) {
  const db = await getDatabase();
  return executePrepared(db, sql, params, "all");
}

async function withTransaction(callback) {
  const db = await getDatabase();
  db.exec("BEGIN");
  try {
    const result = await callback({
      run(sql, params = []) {
        return executePrepared(db, sql, params, "run");
      },
      get(sql, params = []) {
        return executePrepared(db, sql, params, "get");
      },
      all(sql, params = []) {
        return executePrepared(db, sql, params, "all");
      }
    });
    db.exec("COMMIT");
    persistDatabase(db);
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

module.exports = {
  getDatabase,
  run,
  get,
  all,
  withTransaction
};
