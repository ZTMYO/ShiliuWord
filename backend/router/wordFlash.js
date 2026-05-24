const express = require("express");
const { createFlashQuizBatch } = require("../lib/quizService");
const { listCollection } = require("../lib/userStore");

const router = express.Router();

router.get("/", async (request, response, next) => {
  try {
    const count = Number(request.query.count || 5);
    const preset = String(request.query.preset || "").trim().toLowerCase();
    let customWords = null;

    if (preset === "collection") {
      const collection = await listCollection(request.auth.user.id);
      customWords = collection.map((item) => item.word).filter(Boolean);

      if (customWords.length <= 5) {
        throw new Error("收藏夹单词需超过 5 个后才能开始专项训练");
      }
    }

    const result = await createFlashQuizBatch(count, request.auth?.personalApiKey, customWords);
    response.json({
      mode: "flash",
      preset: preset || "default",
      ...result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
