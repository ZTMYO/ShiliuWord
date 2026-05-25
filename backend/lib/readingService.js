const { WORD_BOOKS } = require("../config");
const { generateForWords, generateReadingPassage } = require("./aiService");
const {
  readBookWords,
  readWordCache,
  readWordExamples,
  mergeCacheItems,
  normalizeItems,
  pickRandomWords,
  getCachedItems
} = require("./wordService");

function hasAiSupport(auth) {
  const normalizedPersonalApiKey = String(auth?.personalApiKey || "").trim();
  return Boolean(normalizedPersonalApiKey);
}

function getBookNameById(bookId) {
  const normalizedBookId = Math.max(1, Number(bookId || 0));
  return (Array.isArray(WORD_BOOKS) ? WORD_BOOKS : []).find((book) => Number(book?.id) === normalizedBookId)?.name || "";
}

function isReadingCandidate(word) {
  const normalized = String(word || "").trim().toLowerCase();
  return normalized.length >= 3;
}

async function resolveReadingItems(words, auth) {
  const targetWords = [...new Set(
    words
      .map((word) => String(word || "").trim().toLowerCase())
      .filter(Boolean)
  )].filter(isReadingCandidate);
  const cache = await readWordCache();
  const cachedItems = getCachedItems(targetWords, cache);
  const cachedWordSet = new Set(cachedItems.map((item) => item.word));
  let remainingWords = targetWords.filter((word) => !cachedWordSet.has(word));
  let freshItems = [];

  for (let attempt = 0; attempt < 2 && remainingWords.length > 0; attempt += 1) {
    try {
      const requestedSet = new Set(remainingWords);
      const batch = normalizeItems(await generateForWords(remainingWords, auth?.personalApiKey, { bookName: getBookNameById(auth?.bookId) })).filter((item) =>
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

async function createReadingExercise(auth, customWords = null) {
  if (!hasAiSupport(auth)) {
    throw new Error("当前未配置 API Key，阅读训练暂不可用");
  }

  const wordPool = (Array.isArray(customWords) && customWords.length
    ? customWords
    : await readBookWords(auth?.bookId))
    .map((word) => String(word || "").trim().toLowerCase())
    .filter(Boolean)
    .filter(isReadingCandidate);

  if (wordPool.length < 6) {
    throw new Error("本地词库不足，暂时无法生成阅读训练");
  }

  const targetCount = Math.min(wordPool.length, 10);
  const pickedWords = pickRandomWords(wordPool, targetCount);
  const items = await resolveReadingItems(pickedWords, auth);
  const exampleMap = await readWordExamples();

  if (items.length < 6) {
    throw new Error("可用词义不足，暂时无法生成阅读训练");
  }

  const passage = await generateReadingPassage(items, auth?.personalApiKey, { bookName: getBookNameById(auth?.bookId) });
  if (!passage) {
    throw new Error("阅读训练生成失败，请稍后再试");
  }

  const selectedWordSet = new Set(
    (Array.isArray(passage.selectedWords) ? passage.selectedWords : [])
      .map((word) => String(word || "").trim().toLowerCase())
      .filter(Boolean)
  );
  const displayItems = selectedWordSet.size
    ? items.filter((item) => selectedWordSet.has(item.word))
    : items;

  return {
    title: passage.title || "Reading Practice",
    titleCn: passage.titleCn || "",
    words: displayItems.map((item) => ({
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
