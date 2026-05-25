const { USE_MOCK_DATA } = require("../config");
const {
  generateForWords,
  generateSynonyms,
  supplementSynonyms,
  generateExamples,
  generateFlashcardOptions
} = require("./aiService");
const {
  readSourceWords,
  appendSourceWords,
  readWordCache,
  readWordExamples,
  pickRandomWords,
  pickShapeWords,
  buildMockItems,
  pickMockSynonymItems,
  mergeCacheItems,
  mergeWordExamples,
  getCachedItems,
  getWordExamples,
  getWordParaphrase,
  getWordAccent,
  normalizeItems,
  shuffle
} = require("./wordService");

function hasAiSupport(personalApiKey = "") {
  const normalizedPersonalApiKey = String(personalApiKey || "").trim();
  return Boolean(normalizedPersonalApiKey);
}

async function getLocalWordPool() {
  const cache = await readWordCache();
  return Object.keys(cache)
    .map((word) => String(word || "").trim().toLowerCase())
    .filter(Boolean);
}

async function getQuizWordPool(user) {
  if (!hasAiSupport(user)) {
    return getLocalWordPool();
  }

  const sourceWords = await readSourceWords();
  if (sourceWords.length) {
    return sourceWords;
  }

  return getLocalWordPool();
}

async function attachExamples(items, user) {
  let exampleMap = await readWordExamples();
  const missingWords = [...new Set(
    items
      .map((item) => String(item.word || "").trim().toLowerCase())
      .filter((word) => word && !getWordExamples(exampleMap[word]).length)
  )];

  if (missingWords.length && !USE_MOCK_DATA && hasAiSupport(user)) {
    try {
      const generatedMap = await generateExamples(missingWords, user);
      if (Object.keys(generatedMap).length) {
        exampleMap = await mergeWordExamples(generatedMap);
      }
    } catch {
      // Keep returning available local examples if the AI example generation fails.
    }
  }

  return items.map((item) => ({
    ...item,
    examples: getWordExamples(exampleMap[item.word]).slice(0, 2),
    accent: getWordAccent(exampleMap[item.word])
  }));
}

async function resolveItemsForWords(words, user) {
  const targetWords = [...new Set(words.map((word) => String(word || "").trim().toLowerCase()))].slice(0, 5);
  const cache = await readWordCache();
  const cachedItems = getCachedItems(targetWords, cache);
  const cachedWordSet = new Set(cachedItems.map((item) => item.word));
  let remainingWords = targetWords.filter((word) => !cachedWordSet.has(word));

  let freshItems = [];
  let shouldPersistFreshItems = false;

  if (remainingWords.length > 0) {
    if (USE_MOCK_DATA) {
      freshItems = buildMockItems(Math.max(0, 5 - cachedItems.length), cachedItems.map((item) => item.word));
    } else if (hasAiSupport(user)) {
      for (let attempt = 0; attempt < 2 && remainingWords.length > 0; attempt += 1) {
        try {
          const requestedSet = new Set(remainingWords);
          const batch = normalizeItems(await generateForWords(remainingWords, user)).filter((item) =>
            requestedSet.has(item.word)
          );
          const batchWordSet = new Set(batch.map((item) => item.word));
          freshItems = normalizeItems([...freshItems, ...batch]);
          remainingWords = remainingWords.filter((word) => !batchWordSet.has(word));
        } catch {
          break;
        }
      }
      shouldPersistFreshItems = freshItems.length > 0;
    }

    if (shouldPersistFreshItems) {
      await mergeCacheItems(freshItems);
    }
  }

  return attachExamples(shuffle([...cachedItems, ...freshItems]).slice(0, 5), user);
}

async function createRandomQuiz(user) {
  const wordPool = await getQuizWordPool(user);
  if (wordPool.length < 5) {
    return {
      items: await attachExamples(shuffle(pickMockSynonymItems(5)), user),
      source: "mock",
      note: "词库未准备完成，当前使用预置演示数据。"
    };
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const pickedWords = pickRandomWords(wordPool, 5);
    if (pickedWords.length < 5) {
      continue;
    }
    const items = await resolveItemsForWords(pickedWords, user);
    if (items.length === 5) {
      return {
        items,
        source: USE_MOCK_DATA ? "mock" : hasAiSupport(user) ? "ai" : "local"
      };
    }
  }

  return {
    items: await attachExamples(shuffle(pickMockSynonymItems(5)), user),
    source: "mock",
    note: "AI 返回结果不完整，当前回退到演示数据。"
  };
}

async function createShapeQuiz(user) {
  if (!USE_MOCK_DATA && !hasAiSupport(user)) {
    throw new Error("当前未配置 API Key，形近词模式暂不可用");
  }

  const wordPool = await getQuizWordPool(user);
  if (wordPool.length < 5) {
    return {
      items: await attachExamples(shuffle(pickMockSynonymItems(5)), user),
      source: "mock",
      note: "形近词模式暂用演示数据，待词库补充后自动启用真实筛选。"
    };
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const pickedWords = pickShapeWords(wordPool, 5);
    if (pickedWords.length < 5) {
      continue;
    }
    const items = await resolveItemsForWords(pickedWords, user);
    if (items.length === 5) {
      return {
        items,
        source: USE_MOCK_DATA ? "mock" : hasAiSupport(user) ? "ai" : "local"
      };
    }
  }

  return {
    items: await attachExamples(shuffle(pickMockSynonymItems(5)), user),
    source: "mock",
    note: "形近词结果不完整，当前回退到演示数据。"
  };
}

async function createSynonymQuiz(user) {
  if (!USE_MOCK_DATA && !hasAiSupport(user)) {
    throw new Error("当前未配置 API Key，近义词模式暂不可用");
  }

  const sourceWords = await readSourceWords();
  const anchorWords = pickRandomWords(sourceWords, 3);

  let items = [];
  let shouldPersistItems = false;

  if (USE_MOCK_DATA) {
    items = pickMockSynonymItems(5);
  } else {
    try {
      let synonymPayload = await generateSynonyms(anchorWords, user);
      items = synonymPayload.items;
      if (Object.keys(synonymPayload.examples || {}).length) {
        await mergeWordExamples(synonymPayload.examples);
      }

      for (let attempt = 0; attempt < 2 && items.length > 0 && items.length < 5; attempt += 1) {
        const supplementPayload = await supplementSynonyms(anchorWords, items, 5 - items.length, user);
        items = normalizeItems([...items, ...supplementPayload.items]);
        if (Object.keys(supplementPayload.examples || {}).length) {
          await mergeWordExamples(supplementPayload.examples);
        }
      }

      shouldPersistItems = items.length === 5;
      if (!shouldPersistItems) {
        items = pickMockSynonymItems(5);
      }
    } catch {
      items = pickMockSynonymItems(5);
    }
  }

  if (shouldPersistItems) {
    await mergeCacheItems(items);
    await appendSourceWords(items.map((item) => item.word));
  }

  return {
    items: await attachExamples(shuffle(items).slice(0, 5), user),
    source: USE_MOCK_DATA ? "mock" : "ai",
    anchorWords,
    note: sourceWords.length
      ? `近义词模式会围绕基准词 ${anchorWords.join(" / ") || "当前词库"} 生成同一语义片区的题目；若首次结果不足 5 个，会自动补全后再返回。`
      : "词库未准备时，近义词模式仍可正常出题，并自动补全词义与例句缓存。"
  };
}

function takePrimaryGloss(value = "") {
  const source = String(value || "").trim();
  if (!source) {
    return "";
  }
  return source
    .split(/[；;]/)
    .map((part) => part.trim())
    .find(Boolean) || "";
}

function splitGlossChoices(value = "") {
  const source = String(value || "").trim();
  if (!source) {
    return [];
  }
  return [...new Set(
    source
      .split(/[；;]/)
      .map((part) => part.trim())
      .filter(Boolean)
  )];
}

function extractFlashOptionPos(text = "") {
  const source = String(text || "").trim();
  const match = source.match(/^(?:（[^）]*）|\([^)]*\))?\s*([a-z]+)\.\s*/i);
  return match ? match[1].toLowerCase() : "";
}

function normalizeFlashGlossCore(text = "") {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/^(?:（[^）]*）|\([^)]*\))?\s*[a-z]+\.\s*/i, "")
    .replace(/[（）()]/g, "")
    .replace(/[;；,，、/]/g, "")
    .replace(/\s+/g, "");
}

function areFlashOptionsNearDuplicate(left, right) {
  const leftText = String(left?.text || "").trim();
  const rightText = String(right?.text || "").trim();
  if (!leftText || !rightText) {
    return false;
  }
  if (leftText === rightText) {
    return true;
  }

  const leftPos = extractFlashOptionPos(leftText);
  const rightPos = extractFlashOptionPos(rightText);
  if (leftPos && rightPos && leftPos !== rightPos) {
    return false;
  }

  const leftCore = normalizeFlashGlossCore(leftText);
  const rightCore = normalizeFlashGlossCore(rightText);
  if (!leftCore || !rightCore) {
    return false;
  }

  return (
    leftCore === rightCore ||
    leftCore.includes(rightCore) ||
    rightCore.includes(leftCore)
  );
}

function dedupeFlashOptions(options = [], correctOption = null) {
  const kept = [];
  const correctText = String(correctOption?.text || "").trim();

  (Array.isArray(options) ? options : []).forEach((option) => {
    if (!option?.text) {
      return;
    }
    if (kept.some((existing) => areFlashOptionsNearDuplicate(existing, option))) {
      return;
    }
    kept.push(option);
  });

  if (correctText && !kept.some((option) => areFlashOptionsNearDuplicate(option, correctOption))) {
    kept.unshift(correctOption);
  }

  return kept;
}

function buildLocalFlashOptionPool(cache = {}) {
  return Object.entries(cache)
    .map(([word, item]) => ({
      word: String(word || "").trim().toLowerCase(),
      glosses: splitGlossChoices(item?.wordCn)
    }))
    .filter((item) => item.word && item.glosses.length);
}

function buildParaphraseOptionPool(exampleMap = {}) {
  return Object.entries(exampleMap)
    .map(([word, entry]) => ({
      word: String(word || "").trim().toLowerCase(),
      glosses: splitGlossChoices(getWordParaphrase(entry))
    }))
    .filter((item) => item.word && item.glosses.length);
}

function pickLocalDistractors(optionPool, currentWord, correctText, count = 3) {
  const normalizedCurrentWord = String(currentWord || "").trim().toLowerCase();
  const usedTexts = new Set([String(correctText || "").trim()]);
  const distractors = [];

  for (const candidate of shuffle([...optionPool])) {
    if (candidate.word === normalizedCurrentWord) {
      continue;
    }

    const availableGlosses = shuffle(
      candidate.glosses.filter((gloss) => !usedTexts.has(gloss))
    );
    const pickedGloss = availableGlosses[0];
    if (!pickedGloss) {
      continue;
    }

    distractors.push({
      word: candidate.word,
      text: pickedGloss
    });
    usedTexts.add(pickedGloss);

    if (distractors.length >= count) {
      break;
    }
  }

  return distractors;
}

async function buildFallbackFlashQuestions(items) {
  const cache = await readWordCache();
  const exampleMap = await readWordExamples();
  const optionPool = [
    ...buildLocalFlashOptionPool(cache),
    ...buildParaphraseOptionPool(exampleMap)
  ];

  return items.map((item, index) => {
    const correctOption = {
      word: item.word,
      text: takePrimaryGloss(item.wordCn) || String(item.wordCn || "").trim() || item.word
    };
    const distractors = pickLocalDistractors(optionPool, item.word, correctOption.text);

    const uniqueOptions = dedupeFlashOptions([correctOption, ...distractors], correctOption);
    const options = shuffle(uniqueOptions).slice(0, 4);
    const ensuredOptions = options.some((option) => option.text === correctOption.text)
      ? options
      : shuffle([correctOption, ...options.slice(0, 3)]).slice(0, 4);

    return {
      id: `${item.word}-${Date.now()}-${index}`,
      word: item.word,
      wordCn: item.wordCn,
      defEn: item.defEn,
      defCn: item.defCn,
      accent: item.accent || "",
      examples: Array.isArray(item.examples) ? item.examples.slice(0, 2) : [],
      options: ensuredOptions,
      answerIndex: ensuredOptions.findIndex((option) => option.text === correctOption.text)
    };
  });
}

async function createFlashQuizBatch(count = 5, user, customWords = null) {
  const requestedBatchSize = Math.max(3, Number(count) || 5);
  const customWordPool = Array.isArray(customWords)
    ? [...new Set(
        customWords
          .map((word) => String(word || "").trim().toLowerCase())
          .filter(Boolean)
      )]
    : [];
  const wordPool = customWordPool.length ? customWordPool : await getQuizWordPool(user);
  const batchSize = Math.min(8, requestedBatchSize, wordPool.length || requestedBatchSize);
  const pickedWords = wordPool.length >= batchSize
    ? pickRandomWords(wordPool, batchSize)
    : pickMockSynonymItems(batchSize).map((item) => item.word);

  let items = await resolveItemsForWords(pickedWords, user);
  if (!items.length) {
    items = await attachExamples(shuffle(pickMockSynonymItems(batchSize)), user);
  }

  const normalizedItems = items.slice(0, batchSize);

  if (!normalizedItems.length) {
    return {
      questions: [],
      source: "mock"
    };
  }

  let flashPayload = [];

  if (!USE_MOCK_DATA && hasAiSupport(user)) {
    try {
      flashPayload = await generateFlashcardOptions(normalizedItems, user);
    } catch {
      flashPayload = [];
    }
  }

  const flashMap = new Map(flashPayload.map((item) => [item.word, item]));
  const questions = normalizedItems
    .map((item, index) => {
      const flashItem = flashMap.get(item.word);
      if (!flashItem) {
        return null;
      }
      const options = shuffle([...flashItem.options]);
      return {
        id: `${item.word}-${Date.now()}-${index}`,
        word: item.word,
        wordCn: item.wordCn,
        defEn: item.defEn,
        defCn: item.defCn,
        accent: item.accent || "",
        examples: Array.isArray(item.examples) ? item.examples.slice(0, 2) : [],
        options,
        answerIndex: options.findIndex((option) => option.text === flashItem.correctOption.text)
      };
    })
    .filter((item) => item && item.answerIndex >= 0);

  const safeQuestions = questions.length >= 3
    ? questions
    : await buildFallbackFlashQuestions(normalizedItems);

  return {
    questions: safeQuestions,
    source: USE_MOCK_DATA ? "mock" : hasAiSupport(user) ? (flashPayload.length ? "ai" : "fallback") : "local"
  };
}

module.exports = {
  createRandomQuiz,
  createShapeQuiz,
  createSynonymQuiz,
  createFlashQuizBatch
};
