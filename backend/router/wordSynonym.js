const express = require("express");
const { createSynonymQuiz } = require("../lib/quizService");

const router = express.Router();

router.get("/", async (request, response, next) => {
  try {
    const result = await createSynonymQuiz({
      personalApiKey: request.auth?.personalApiKey,
      bookId: request.auth?.user?.bookId
    });
    response.json({
      mode: "synonym",
      ...result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
