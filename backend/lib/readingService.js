const { PUBLIC_MODEL_ENABLED, DEEPSEEK_API_KEY } = require("../config");
const { generateForWords, generateReadingPassage } = require("./aiService");
const {
  readWordCache,
  readWordExamples,
  mergeCacheItems,
  normalizeItems,
  pickRandomWords,
  getCachedItems
} = require("./wordService");

function hasAiSupport(personalApiKey = "") {
  const normalizedPersonalApiKey = String(personalApiKey || "").trim();
  return Boolean(normalizedPersonalApiKey || (PUBLIC_MODEL_ENABLED && DEEPSEEK_API_KEY));
}

async function resolveReadingItems(words, user) {
  const targetWords = [...new Set(
    words
      .map((word) => String(word || "").trim().toLowerCase())
      .filter(Boolean)
  )];
  const cache = await readWordCache();
  const cachedItems = getCachedItems(targetWords, cache);
  const cachedWordSet = new Set(cachedItems.map((item) => item.word));
  let remainingWords = targetWords.filter((word) => !cachedWordSet.has(word));
  let freshItems = [];

  for (let attempt = 0; attempt < 2 && remainingWords.length > 0; attempt += 1) {
    try {
      const requestedSet = new Set(remainingWords);
      const batch = normalizeItems(await generateForWords(remainingWords, user)).filter((item) =>
        requestedSet.has(item.word)
      );
      if (!batch.length) {
        break;
      }
      const batchWordSet = new Set(batch.map((item) => item.word));
      freshItems = normalizeItems([...freshItems, ...batch]);
      remainingWords = remainingWords.filter((word) => !batchWordSet.has(word));
    } catch {
      break;
    }
  }

  if (freshItems.length) {
    await mergeCacheItems(freshItems, new Set(targetWords));
  }

  return [...cachedItems, ...freshItems];
}

async function createReadingExercise(user, customWords = null) {
  if (!hasAiSupport(user)) {
    throw new Error("当前未配置 API Key，阅读训练暂不可用");
  }

  const cache = await readWordCache();
  const wordPool = (Array.isArray(customWords) && customWords.length
    ? customWords
    : Object.keys(cache))
    .map((word) => String(word || "").trim().toLowerCase())
    .filter(Boolean);

  if (wordPool.length < 5) {
    throw new Error("本地词库不足，暂时无法生成阅读训练");
  }

  const targetCount = Math.min(wordPool.length, Math.max(5, Math.floor(Math.random() * 6) + 5));
  const pickedWords = pickRandomWords(wordPool, targetCount);
  const items = await resolveReadingItems(pickedWords, user);
  const exampleMap = await readWordExamples();

  if (items.length < 5) {
    throw new Error("可用词义不足，暂时无法生成阅读训练");
  }

  const passage = await generateReadingPassage(items, user);
  if (!passage) {
    throw new Error("阅读训练生成失败，请稍后再试");
  }

  return {
    title: passage.title || "Reading Practice",
    titleCn: passage.titleCn || "",
    words: items.map((item) => ({
      word: item.word,
      wordCn: item.wordCn,
      defEn: item.defEn,
      defCn: item.defCn,
      examples: Array.isArray(exampleMap[item.word]?.examples) ? exampleMap[item.word].examples.slice(0, 2) : []
    })),
    sentences: passage.sentences
  };
}

module.exports = {
  createReadingExercise
};
