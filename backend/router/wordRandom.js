const express = require("express");
const { createRandomQuiz } = require("../lib/quizService");

const router = express.Router();

router.get("/", async (request, response, next) => {
  try {
    const result = await createRandomQuiz({
      personalApiKey: request.auth?.personalApiKey,
      bookId: request.auth?.user?.bookId
    });
    response.json({
      mode: "random",
      ...result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
