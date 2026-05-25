const express = require("express");
const { createReadingExercise } = require("../lib/readingService");
const { listCollection } = require("../lib/userStore");

const router = express.Router();

router.get("/", async (request, response, next) => {
  try {
    const preset = String(request.query.preset || "").trim().toLowerCase();
    let customWords = null;

    if (preset === "collection") {
      const collection = await listCollection(request.auth.user.id);
      customWords = collection.map((item) => item.word).filter(Boolean);

      if (customWords.length <= 5) {
        throw new Error("收藏夹单词需超过 5 个后才能开始阅读训练");
      }
    }

    const result = await createReadingExercise(
      {
        personalApiKey: request.auth?.personalApiKey,
        bookId: request.auth?.user?.bookId
      },
      customWords
    );
    response.json({
      mode: "reading",
      preset: preset || "default",
      ...result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
