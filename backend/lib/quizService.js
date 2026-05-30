const { USE_MOCK_DATA, WORD_BOOKS } = require("../config");
const {
  generateForWords,
  generateSynonyms,
  supplementSynonyms,
  generateExamples,
  generateFlashcardOptions
} = require("./aiService");
const {
  readBookWords,
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

function hasAiSupport(auth) {
  const normalizedPersonalApiKey = String(auth?.personalApiKey || "").trim();
  return Boolean(normalizedPersonalApiKey);
}

function getBookNameById(bookId) {
  const normalizedBookId = Math.max(1, Number(bookId || 0));
  return (Array.isArray(WORD_BOOKS) ? WORD_BOOKS : []).find((book) => Number(book?.id) === normalizedBookId)?.name || "";
}

function normalizeWordKey(word) {
  return String(word || "").trim().toLowerCase();
}

async function buildLocalWordPools(auth) {
  const bookWords = await readBookWords(auth?.bookId);
  const cache = await readWordCache();
  const cachedWords = [...new Set(Object.keys(cache).map(normalizeWordKey).filter(Boolean))];
  const cacheWordSet = new Set(cachedWords);
  const preferredWords = bookWords.filter((word) => cacheWordSet.has(word));
  const preferredSet = new Set(preferredWords);
  const fallbackWords = cachedWords.filter((word) => !preferredSet.has(word));

  return {
    bookWords,
    preferredWords,
    fallbackWords,
    allWords: [...preferredWords, ...fallbackWords]
  };
}

async function pickLocalWordsPreferBook(auth, count = 5) {
  const targetCount = Math.max(1, Number(count) || 5);
  const pools = await buildLocalWordPools(auth);
  const pickedPreferred = shuffle(pools.preferredWords).slice(0, targetCount);
  if (pickedPreferred.length >= targetCount) {
    return pickedPreferred;
  }

  const needed = targetCount - pickedPreferred.length;
  return [...pickedPreferred, ...shuffle(pools.fallbackWords).slice(0, needed)];
}

async function getQuizWordPool(auth) {
  const bookWords = await readBookWords(auth?.bookId);
  if (hasAiSupport(auth)) {
    return bookWords;
  }

  const pools = await buildLocalWordPools(auth);
  return pools.allWords;
}

async function attachExamples(items, auth) {
  let exampleMap = await readWordExamples();
  const missingWords = [...new Set(
    items
      .map((item) => String(item.word || "").trim().toLowerCase())
      .filter((word) => word && !getWordExamples(exampleMap[word]).length)
  )];

  if (missingWords.length && !USE_MOCK_DATA && hasAiSupport(auth)) {
    try {
      const generatedMap = await generateExamples(missingWords, auth?.personalApiKey, { bookName: getBookNameById(auth?.bookId) });
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

async function resolveItemsForWords(words, auth) {
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
    } else if (hasAiSupport(auth)) {
      for (let attempt = 0; attempt < 2 && remainingWords.length > 0; attempt += 1) {
        try {
          const requestedSet = new Set(remainingWords);
          const batch = normalizeItems(await generateForWords(remainingWords, auth?.personalApiKey, { bookName: getBookNameById(auth?.bookId) })).filter((item) =>
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

  return attachExamples(shuffle([...cachedItems, ...freshItems]).slice(0, 5), auth);
}

async function createRandomQuiz(auth) {
  const wordPool = await getQuizWordPool(auth);
  if (wordPool.length < 5) {
    return {
      items: await attachExamples(shuffle(pickMockSynonymItems(5)), auth),
      source: "mock",
      note: "词库未准备完成，当前使用预置演示数据。"
    };
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const pickedWords = (!USE_MOCK_DATA && !hasAiSupport(auth))
      ? await pickLocalWordsPreferBook(auth, 5)
      : pickRandomWords(wordPool, 5);
    if (pickedWords.length < 5) {
      continue;
    }
    const items = await resolveItemsForWords(pickedWords, auth);
    if (items.length === 5) {
      return {
        items,
        source: USE_MOCK_DATA ? "mock" : hasAiSupport(auth) ? "ai" : "local"
      };
    }
  }

  return {
    items: await attachExamples(shuffle(pickMockSynonymItems(5)), auth),
    source: "mock",
    note: "AI 返回结果不完整，当前回退到演示数据。"
  };
}

async function createShapeQuiz(auth) {
  if (!USE_MOCK_DATA && !hasAiSupport(auth)) {
    throw new Error("当前未配置 API Key，形近词模式暂不可用");
  }

  const wordPool = await getQuizWordPool(auth);
  if (wordPool.length < 5) {
    return {
      items: await attachExamples(shuffle(pickMockSynonymItems(5)), auth),
      source: "mock",
      note: "形近词模式暂用演示数据，待词库补充后自动启用真实筛选。"
    };
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const pickedWords = pickShapeWords(wordPool, 5);
    if (pickedWords.length < 5) {
      continue;
    }
    const items = await resolveItemsForWords(pickedWords, auth);
    if (items.length === 5) {
      return {
        items,
        source: USE_MOCK_DATA ? "mock" : hasAiSupport(auth) ? "ai" : "local"
      };
    }
  }

  return {
    items: await attachExamples(shuffle(pickMockSynonymItems(5)), auth),
    source: "mock",
    note: "形近词结果不完整，当前回退到演示数据。"
  };
}

async function createSynonymQuiz(auth) {
  if (!USE_MOCK_DATA && !hasAiSupport(auth)) {
    throw new Error("当前未配置 API Key，近义词模式暂不可用");
  }

  const wordPool = await readBookWords(auth?.bookId);
  const anchorWords = pickRandomWords(wordPool, 3);

  let items = [];
  let shouldPersistItems = false;

  if (USE_MOCK_DATA) {
    items = pickMockSynonymItems(5);
  } else {
    try {
      let synonymPayload = await generateSynonyms(anchorWords, auth?.personalApiKey, { bookName: getBookNameById(auth?.bookId) });
      items = synonymPayload.items;
      if (Object.keys(synonymPayload.examples || {}).length) {
        await mergeWordExamples(synonymPayload.examples);
      }

      for (let attempt = 0; attempt < 2 && items.length > 0 && items.length < 5; attempt += 1) {
        const supplementPayload = await supplementSynonyms(anchorWords, items, 5 - items.length, auth?.personalApiKey, { bookName: getBookNameById(auth?.bookId) });
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
  }

  return {
    items: await attachExamples(shuffle(items).slice(0, 5), auth),
    source: USE_MOCK_DATA ? "mock" : "ai",
    anchorWords,
    note: wordPool.length
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

  if (correctText) {
    const index = kept.findIndex((option) => areFlashOptionsNearDuplicate(option, correctOption));
    if (index >= 0) {
      kept[index] = correctOption;
    } else {
      kept.unshift(correctOption);
    }
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

function pickLocalDistractors(optionPool, currentWord, existingOptions = [], count = 3) {
  const normalizedCurrentWord = String(currentWord || "").trim().toLowerCase();
  const usedTexts = new Set(
    (Array.isArray(existingOptions) ? existingOptions : [])
      .map((option) => String(option?.text || "").trim())
      .filter(Boolean)
  );
  const usedWords = new Set(
    (Array.isArray(existingOptions) ? existingOptions : [])
      .map((option) => String(option?.word || "").trim().toLowerCase())
      .filter(Boolean)
  );
  usedWords.add(normalizedCurrentWord);

  const distractors = [];

  for (const candidate of shuffle([...(Array.isArray(optionPool) ? optionPool : [])])) {
    if (!candidate?.word || candidate.word === normalizedCurrentWord) {
      continue;
    }
    if (usedWords.has(candidate.word)) {
      continue;
    }

    const glosses = shuffle(Array.isArray(candidate.glosses) ? candidate.glosses : []);
    const pickedGloss = glosses.find((gloss) => {
      const text = String(gloss || "").trim();
      if (!text) {
        return false;
      }
      if (usedTexts.has(text)) {
        return false;
      }
      const option = { word: candidate.word, text };
      return !(Array.isArray(existingOptions) ? existingOptions : []).some((existing) =>
        areFlashOptionsNearDuplicate(existing, option)
      );
    });

    if (!pickedGloss) {
      continue;
    }

    const option = {
      word: candidate.word,
      text: String(pickedGloss || "").trim()
    };
    distractors.push(option);
    usedTexts.add(option.text);
    usedWords.add(option.word);

    if (distractors.length >= count) {
      break;
    }
  }

  return distractors;
}

function buildBookAwareOptionPools(optionPool = [], bookWords = []) {
  const bookSet = new Set(
    (Array.isArray(bookWords) ? bookWords : [])
      .map((word) => String(word || "").trim().toLowerCase())
      .filter(Boolean)
  );

  const allPool = Array.isArray(optionPool) ? optionPool : [];
  const bookPool = allPool.filter((item) => bookSet.has(item.word));

  return { allPool, bookPool };
}

async function buildFlashOptionPools(auth) {
  const [cache, exampleMap, bookWords] = await Promise.all([
    readWordCache(),
    readWordExamples(),
    readBookWords(auth?.bookId)
  ]);

  const optionPool = [
    ...buildLocalFlashOptionPool(cache),
    ...buildParaphraseOptionPool(exampleMap)
  ];

  return buildBookAwareOptionPools(optionPool, bookWords);
}

function ensureFlashOptions(baseOptions, currentWord, correctOption, optionPools) {
  const normalizedCorrectText = String(correctOption?.text || "").trim();
  const normalizedCorrectOption = {
    word: String(correctOption?.word || currentWord || "").trim().toLowerCase(),
    text: normalizedCorrectText
  };

  let options = dedupeFlashOptions(
    (Array.isArray(baseOptions) ? baseOptions : []).filter((option) => option?.text),
    normalizedCorrectOption
  );

  if (options.length > 4) {
    const others = options.filter((option) => option.text !== normalizedCorrectText);
    options = [normalizedCorrectOption, ...shuffle(others).slice(0, 3)];
  }

  if (options.length < 4) {
    const missing = 4 - options.length;
    options.push(
      ...pickLocalDistractors(optionPools?.bookPool || [], currentWord, options, missing)
    );
  }

  if (options.length < 4) {
    const missing = 4 - options.length;
    options.push(
      ...pickLocalDistractors(optionPools?.allPool || [], currentWord, options, missing)
    );
  }

  options = options.slice(0, 4);
  if (!options.some((option) => option.text === normalizedCorrectText)) {
    options = [normalizedCorrectOption, ...options.slice(0, 3)];
  }

  const shuffled = shuffle(options).slice(0, 4);
  const answerIndex = shuffled.findIndex((option) => option.text === normalizedCorrectText);

  return {
    options: shuffled,
    answerIndex
  };
}

async function buildFallbackFlashQuestions(items, auth) {
  const optionPools = await buildFlashOptionPools(auth);
  return items.map((item, index) => {
    const correctText = takePrimaryGloss(item.wordCn) || String(item.wordCn || "").trim() || item.word;
    const ensured = ensureFlashOptions(
      [],
      item.word,
      { word: item.word, text: correctText },
      optionPools
    );

    const hintExample = Array.isArray(item.examples) && item.examples.length > 0 ? item.examples[0] : null;

    return {
      id: `${item.word}-${Date.now()}-${index}`,
      word: item.word,
      wordCn: item.wordCn,
      defEn: item.defEn,
      defCn: item.defCn,
      accent: item.accent || "",
      examples: Array.isArray(item.examples) ? item.examples.slice(0, 2) : [],
      hintExample: hintExample,
      options: ensured.options,
      answerIndex: ensured.answerIndex
    };
  });
}

async function createFlashQuizBatch(count = 5, auth, customWords = null) {
  const requestedBatchSize = Math.max(3, Number(count) || 5);
  const customWordPool = Array.isArray(customWords)
    ? [...new Set(
        customWords
          .map((word) => String(word || "").trim().toLowerCase())
          .filter(Boolean)
      )]
    : [];
  const wordPool = customWordPool.length ? customWordPool : await getQuizWordPool(auth);
  const batchSize = Math.min(8, requestedBatchSize, wordPool.length || requestedBatchSize);
  const pickedWords = wordPool.length >= batchSize
    ? (customWordPool.length || USE_MOCK_DATA || hasAiSupport(auth)
        ? pickRandomWords(wordPool, batchSize)
        : await pickLocalWordsPreferBook(auth, batchSize))
    : pickMockSynonymItems(batchSize).map((item) => item.word);

  let items = await resolveItemsForWords(pickedWords, auth);
  if (!items.length) {
    items = await attachExamples(shuffle(pickMockSynonymItems(batchSize)), auth);
  }

  const normalizedItems = items.slice(0, batchSize);

  if (!normalizedItems.length) {
    return {
      questions: [],
      source: "mock"
    };
  }

  let flashPayload = [];

  if (!USE_MOCK_DATA && hasAiSupport(auth)) {
    try {
      flashPayload = await generateFlashcardOptions(normalizedItems, auth?.personalApiKey, { bookName: getBookNameById(auth?.bookId) });
    } catch {
      flashPayload = [];
    }
  }

  const optionPools = await buildFlashOptionPools(auth);
  const flashMap = new Map(flashPayload.map((item) => [item.word, item]));
  const questions = normalizedItems
    .map((item, index) => {
      const flashItem = flashMap.get(item.word);
      if (!flashItem) {
        return null;
      }
      const ensured = ensureFlashOptions(
        flashItem.options,
        item.word,
        { word: item.word, text: flashItem.correctOption?.text || "" },
        optionPools
      );
      if (ensured.answerIndex < 0) {
        return null;
      }
      return {
        id: `${item.word}-${Date.now()}-${index}`,
        word: item.word,
        wordCn: item.wordCn,
        defEn: item.defEn,
        defCn: item.defCn,
        accent: item.accent || "",
        examples: Array.isArray(item.examples) ? item.examples.slice(0, 2) : [],
        hintExample: flashItem.hintExample || (Array.isArray(item.examples) && item.examples.length > 0 ? item.examples[0] : null),
        options: ensured.options,
        answerIndex: ensured.answerIndex
      };
    })
    .filter((item) => item && item.answerIndex >= 0);

  const safeQuestions = questions.length >= 3
    ? questions
    : await buildFallbackFlashQuestions(normalizedItems, auth);

  return {
    questions: safeQuestions,
    source: USE_MOCK_DATA ? "mock" : hasAiSupport(auth) ? (flashPayload.length ? "ai" : "fallback") : "local"
  };
}

module.exports = {
  createRandomQuiz,
  createShapeQuiz,
  createSynonymQuiz,
  createFlashQuizBatch
};
