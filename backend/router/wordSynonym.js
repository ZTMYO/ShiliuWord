const express = require("express");
const { createSynonymQuiz } = require("../lib/quizService");

const router = express.Router();

router.get("/", async (request, response, next) => {
  try {
    const result = await createSynonymQuiz(request.auth?.personalApiKey);
    response.json({
      mode: "synonym",
      ...result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
