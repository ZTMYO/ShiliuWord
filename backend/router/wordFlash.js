const express = require("express");
const { createFlashQuizBatch } = require("../lib/quizService");

const router = express.Router();

router.get("/", async (request, response, next) => {
  try {
    const count = Number(request.query.count || 5);
    const result = await createFlashQuizBatch(count, request.auth?.personalApiKey);
    response.json({
      mode: "flash",
      ...result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
