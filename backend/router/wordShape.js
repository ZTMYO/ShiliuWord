const express = require("express");
const { createShapeQuiz } = require("../lib/quizService");

const router = express.Router();

router.get("/", async (request, response, next) => {
  try {
    const result = await createShapeQuiz(request.auth?.personalApiKey);
    response.json({
      mode: "shape",
      ...result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
