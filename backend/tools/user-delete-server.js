const path = require("path");
const express = require("express");
const { all, get, run } = require("../lib/db");

const app = express();
const PORT = Number(process.env.DB_USER_DELETE_PORT || 3031);
const PAGE_FILE = path.join(__dirname, "user-delete.html");

app.use(express.json());

app.get("/api/health", async (request, response) => {
  response.json({
    ok: true,
    message: "user delete tool is running"
  });
});

app.get("/api/users", async (request, response, next) => {
  try {
    const users = await all(
      `
        SELECT
          u.id,
          u.username,
          u.created_at,
          (
            SELECT COUNT(*)
            FROM collections c
            WHERE c.user_id = u.id
          ) AS collection_count,
          (
            SELECT COUNT(*)
            FROM quiz_history q
            WHERE q.user_id = u.id
          ) AS quiz_history_count,
          (
            SELECT COUNT(*)
            FROM flash_history f
            WHERE f.user_id = u.id
          ) AS flash_history_count
        FROM users u
        ORDER BY datetime(u.created_at) DESC, u.id DESC
      `
    );

    response.json({
      ok: true,
      users: users.map((row) => ({
        id: Number(row.id),
        username: String(row.username || ""),
        createdAt: String(row.created_at || ""),
        collectionCount: Number(row.collection_count || 0),
        quizHistoryCount: Number(row.quiz_history_count || 0),
        flashHistoryCount: Number(row.flash_history_count || 0)
      }))
    });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/users/:userId", async (request, response, next) => {
  try {
    const userId = Number(request.params.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      response.status(400).json({
        ok: false,
        message: "用户 id 无效"
      });
      return;
    }

    const user = await get(
      `
        SELECT id, username
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [userId]
    );

    if (!user) {
      response.status(404).json({
        ok: false,
        message: "用户不存在"
      });
      return;
    }

    await run("DELETE FROM users WHERE id = ?", [userId]);

    response.json({
      ok: true,
      message: `已删除用户 ${String(user.username || "")}`
    });
  } catch (error) {
    next(error);
  }
});

app.get("/", (request, response) => {
  response.sendFile(PAGE_FILE);
});

app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).json({
    ok: false,
    message: error.message || "服务器异常"
  });
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`User delete tool running at http://127.0.0.1:${PORT}`);
});
