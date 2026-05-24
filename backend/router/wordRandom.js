const express = require("express");
const { createRandomQuiz } = require("../lib/quizService");

const router = express.Router();

router.get("/", async (request, response, next) => {
  try {
    const result = await createRandomQuiz(request.auth?.personalApiKey);
    response.json({
      mode: "random",
      ...result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
