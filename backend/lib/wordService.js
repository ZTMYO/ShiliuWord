const fs = require("fs/promises");
const {
  SOURCE_WORD_FILE,
  WORD_CACHE_FILE,
  WORD_EXAMPLE_FILE,
  DEMO_ITEMS
} = require("../config");

async function ensureDataFiles() {
  await fs.mkdir(require("path").dirname(SOURCE_WORD_FILE), { recursive: true });

  try {
    await fs.access(SOURCE_WORD_FILE);
  } catch {
    await fs.writeFile(
      SOURCE_WORD_FILE,
      "# TODO: 后续填入考研英语词库，每行一个英文单词\n",
      "utf8"
    );
  }

  try {
    await fs.access(WORD_CACHE_FILE);
  } catch {
    await fs.writeFile(WORD_CACHE_FILE, "{}\n", "utf8");
  }

  try {
    await fs.access(WORD_EXAMPLE_FILE);
  } catch {
    await fs.writeFile(WORD_EXAMPLE_FILE, "{}\n", "utf8");
  }
}

async function readSourceWords() {
  await ensureDataFiles();
  const content = await fs.readFile(SOURCE_WORD_FILE, "utf8");
  return content
    .split(/\r?\n/)
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item && !item.startsWith("#"));
}

async function appendSourceWords(words) {
  const normalizedWords = uniqueWords(
    words
      .map((item) => String(item || "").trim().toLowerCase())
      .filter(Boolean)
  );
  if (!normalizedWords.length) {
    return [];
  }

  await ensureDataFiles();
  const existingContent = await fs.readFile(SOURCE_WORD_FILE, "utf8");
  const existingWords = new Set(
    existingContent
      .split(/\r?\n/)
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item && !item.startsWith("#"))
  );

  const missingWords = normalizedWords.filter((word) => !existingWords.has(word));
  if (!missingWords.length) {
    return [];
  }

  const prefix = existingContent.endsWith("\n") ? "" : "\n";
  await fs.appendFile(SOURCE_WORD_FILE, `${prefix}${missingWords.join("\n")}\n`, "utf8");
  return missingWords;
}

async function readWordCache() {
  await ensureDataFiles();
  try {
    const content = await fs.readFile(WORD_CACHE_FILE, "utf8");
    return content.trim() ? JSON.parse(content) : {};
  } catch {
    return {};
  }
}

async function writeWordCache(cache) {
  await fs.writeFile(WORD_CACHE_FILE, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
}

async function readWordExamples() {
  await ensureDataFiles();
  try {
    const content = await fs.readFile(WORD_EXAMPLE_FILE, "utf8");
    return content.trim() ? normalizeExamples(JSON.parse(content)) : {};
  } catch {
    return {};
  }
}

async function writeWordExamples(exampleMap) {
  await fs.writeFile(WORD_EXAMPLE_FILE, `${JSON.stringify(exampleMap, null, 2)}\n`, "utf8");
}

function uniqueWords(words) {
  return [...new Set(words.map((item) => item.toLowerCase()))];
}

function shuffle(items) {
  const list = [...items];
  for (let index = list.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
  }
  return list;
}

function pickRandomWords(words, count = 5) {
  return shuffle(uniqueWords(words)).slice(0, count);
}

function wordSignature(word) {
  return `${word.length}-${[...new Set(word)].sort().join("")}`;
}

function buildCharCountMap(word) {
  return [...word].reduce((map, char) => {
    map[char] = (map[char] || 0) + 1;
    return map;
  }, {});
}

function countSharedChars(baseWord, candidate) {
  const baseMap = buildCharCountMap(baseWord);
  const candidateMap = buildCharCountMap(candidate);
  let shared = 0;

  for (const [char, count] of Object.entries(baseMap)) {
    if (candidateMap[char]) {
      shared += Math.min(count, candidateMap[char]);
    }
  }

  return shared;
}

function countSamePositionChars(baseWord, candidate) {
  const compareLength = Math.min(baseWord.length, candidate.length);
  let matches = 0;
  for (let index = 0; index < compareLength; index += 1) {
    if (baseWord[index] === candidate[index]) {
      matches += 1;
    }
  }
  return matches;
}

function shapeScore(baseWord, candidate) {
  const sharedChars = countSharedChars(baseWord, candidate);
  const samePositionChars = countSamePositionChars(baseWord, candidate);
  const lengthPenalty = Math.abs(baseWord.length - candidate.length);
  const firstLetterBonus = baseWord[0] === candidate[0] ? 2 : 0;
  const lastLetterBonus = baseWord[baseWord.length - 1] === candidate[candidate.length - 1] ? 1 : 0;

  return (
    sharedChars * 2 +
    samePositionChars * 3 +
    firstLetterBonus +
    lastLetterBonus -
    lengthPenalty * 5
  );
}

function sortShapeCandidates(baseWord, words) {
  const scored = words.map((word) => ({ word, score: shapeScore(baseWord, word) }));
  const scoreBuckets = new Map();

  for (const item of scored) {
    if (!scoreBuckets.has(item.score)) {
      scoreBuckets.set(item.score, []);
    }
    scoreBuckets.get(item.score).push(item.word);
  }

  return [...scoreBuckets.entries()]
    .sort((left, right) => right[0] - left[0])
    .flatMap(([, bucketWords]) => shuffle(bucketWords));
}

function buildShapeGroup(seed, pool, count = 5) {
  const candidates = pool.filter((word) => word !== seed);
  const sameSignature = candidates.filter((word) => wordSignature(word) === wordSignature(seed));
  let selectedWords = [];

  if (sameSignature.length >= count - 1) {
    selectedWords = shuffle(sameSignature).slice(0, count - 1);
  } else {
    const sameLengthRanked = sortShapeCandidates(
      seed,
      candidates.filter((word) => word.length === seed.length)
    );

    if (sameLengthRanked.length >= count - 1) {
      selectedWords = sameLengthRanked.slice(0, count - 1);
    } else {
      selectedWords = sortShapeCandidates(seed, candidates).slice(0, count - 1);
    }
  }

  const selectedScores = selectedWords.map((word) => shapeScore(seed, word));
  const sameLengthCount = selectedWords.filter((word) => word.length === seed.length).length;
  const sameSignatureCount = selectedWords.filter((word) => wordSignature(word) === wordSignature(seed)).length;
  const minScore = selectedScores.length ? Math.min(...selectedScores) : -999;
  const totalScore = selectedScores.reduce((sum, score) => sum + score, 0);

  return {
    words: shuffle([seed, ...selectedWords]).slice(0, count),
    quality:
      totalScore * 10 +
      minScore * 3 +
      sameLengthCount * 20 +
      sameSignatureCount * 30
  };
}

function pickShapeWords(words, count = 5) {
  const pool = uniqueWords(words);
  if (pool.length <= count) {
    return pool.slice(0, count);
  }

  const seedCandidates = pickRandomWords(pool, Math.min(2, pool.length));
  const shapeGroups = seedCandidates.map((seed) => buildShapeGroup(seed, pool, count));

  if (!shapeGroups.length) {
    return pickRandomWords(pool, count);
  }

  const bestQuality = Math.max(...shapeGroups.map((group) => group.quality));
  const bestGroups = shapeGroups.filter((group) => group.quality === bestQuality);
  return shuffle(bestGroups)[0].words;
}

function normalizeCnGloss(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+\.\s*/i, "")
    .replace(/[（）()]/g, "")
    .replace(/[;；,，、/]/g, "")
    .replace(/\s+/g, "");
}

function startsWithPartOfSpeech(value) {
  return /^(?:（[^）]*）|\([^)]*\))?\s*[a-z]+\.\s*/i.test(String(value || "").trim());
}

function normalizeWordCnPunctuation(value) {
  const parts = String(value || "")
    .trim()
    .split(/[;；]/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) {
    return String(value || "").trim();
  }

  return parts.reduce((result, part, index) => {
    if (index === 0) {
      return part;
    }
    return `${result}${startsWithPartOfSpeech(part) ? "；" : "，"}${part}`;
  }, "");
}

function normalizeExampleItems(rawItems) {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems
    .map((item) => ({
      en: String(item?.en || "").trim(),
      cn: String(item?.cn || "").trim()
    }))
    .filter((item) => item.en && item.cn)
    .slice(0, 2);
}

function normalizeParaphrase(value) {
  const source = String(value || "")
    .trim()
    .replace(/\r\n?/g, "\n");

  if (!source) {
    return "";
  }

  return normalizeWordCnPunctuation(
    source
      .split(/\n+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .join("；")
      .replace(/,/g, "，")
      .replace(/;/g, "；")
  );
}

function normalizeAccent(value) {
  let source = String(value || "").trim();
  if (!source) {
    return "";
  }
  source = source.replace(/^\/+/, "").replace(/\/+$/, "").trim();
  if (!source) {
    return "";
  }
  return `/${source}/`;
}

function normalizeExampleEntry(rawEntry) {
  if (Array.isArray(rawEntry)) {
    const examples = normalizeExampleItems(rawEntry);
    return examples.length ? { examples, paraphrase: "" } : null;
  }

  if (!rawEntry || typeof rawEntry !== "object") {
    return null;
  }

  const examples = normalizeExampleItems(rawEntry.examples);
  const paraphrase = normalizeParaphrase(rawEntry.paraphrase);
  const accent = normalizeAccent(rawEntry.accent);

  if (!examples.length && !paraphrase && !accent) {
    return null;
  }

  const entry = { examples, paraphrase };
  if (accent) {
    entry.accent = accent;
  }
  return entry;
}

function getWordExamples(entry) {
  return normalizeExampleEntry(entry)?.examples || [];
}

function getWordParaphrase(entry) {
  return normalizeExampleEntry(entry)?.paraphrase || "";
}

function getWordAccent(entry) {
  return normalizeExampleEntry(entry)?.accent || "";
}

function normalizeItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  const seenWords = new Set();

  return items
    .map((item) => ({
      word: String(item.word || "").trim().toLowerCase(),
      wordCn: normalizeWordCnPunctuation(item.wordCn),
      defEn: String(item.defEn || "").trim(),
      defCn: String(item.defCn || "").trim()
    }))
    .filter((item) => {
      const defEnLower = item.defEn.toLowerCase();
      const normalizedWordCn = normalizeCnGloss(item.wordCn);
      const normalizedDefCn = normalizeCnGloss(item.defCn);
      if (!item.word || !item.wordCn || !item.defEn || !item.defCn) {
        return false;
      }
      if (defEnLower.includes(item.word)) {
        return false;
      }
      if (normalizedWordCn && normalizedWordCn === normalizedDefCn) {
        return false;
      }
      if (seenWords.has(item.word)) {
        return false;
      }
      seenWords.add(item.word);
      return true;
    });
}

function normalizeExamples(exampleMap) {
  if (!exampleMap || typeof exampleMap !== "object" || Array.isArray(exampleMap)) {
    return {};
  }

  const normalized = {};
  for (const [rawWord, rawEntry] of Object.entries(exampleMap)) {
    const word = String(rawWord || "").trim().toLowerCase();
    if (!word) {
      continue;
    }

    const entry = normalizeExampleEntry(rawEntry);
    if (entry) {
      normalized[word] = entry;
    }
  }
  return normalized;
}

async function mergeWordParaphrases(paraphraseMap, overwriteExisting = false) {
  const normalized = normalizeExamples(paraphraseMap);
  if (!Object.keys(normalized).length) {
    return {};
  }

  const currentMap = await readWordExamples();
  let changed = false;

  for (const [word, entry] of Object.entries(normalized)) {
    if (!entry.paraphrase) {
      continue;
    }

    const currentEntry = normalizeExampleEntry(currentMap[word]) || {
      examples: [],
      paraphrase: ""
    };

    const shouldUpdate = overwriteExisting
      ? currentEntry.paraphrase !== entry.paraphrase
      : !currentEntry.paraphrase;

    if (!shouldUpdate) {
      continue;
    }

    currentMap[word] = {
      examples: currentEntry.examples,
      paraphrase: entry.paraphrase,
      ...(currentEntry.accent ? { accent: currentEntry.accent } : {})
    };
    changed = true;
  }

  if (changed) {
    await writeWordExamples(currentMap);
  }

  return currentMap;
}

function buildMockItems(count = 5, excludedWords = []) {
  const excludedSet = new Set(excludedWords);
  return shuffle(DEMO_ITEMS)
    .filter((item) => !excludedSet.has(item.word))
    .slice(0, count);
}

function pickMockSynonymItems(count = 5) {
  return buildMockItems(count);
}

async function mergeCacheItems(items, allowWordSet = null) {
  const normalized = normalizeItems(items);
  if (!normalized.length) {
    return;
  }

  const cache = await readWordCache();
  let changed = false;
  const syncedParaphrases = {};

  for (const item of normalized) {
    if (allowWordSet && !allowWordSet.has(item.word)) {
      continue;
    }
    if (!cache[item.word]) {
      cache[item.word] = {
        wordCn: item.wordCn,
        defEn: item.defEn,
        defCn: item.defCn
      };
      syncedParaphrases[item.word] = {
        paraphrase: item.wordCn
      };
      changed = true;
    }
  }

  if (changed) {
    await writeWordCache(cache);
    await mergeWordParaphrases(syncedParaphrases, true);
  }
}

async function mergeWordExamples(exampleMap) {
  const normalized = normalizeExamples(exampleMap);
  if (!Object.keys(normalized).length) {
    return {};
  }

  const currentMap = await readWordExamples();
  let changed = false;

  for (const [word, entry] of Object.entries(normalized)) {
    const currentEntry = normalizeExampleEntry(currentMap[word]) || { examples: [], paraphrase: "" };

    let entryChanged = false;

    if (!currentEntry.examples.length && entry.examples.length) {
      currentEntry.examples = entry.examples;
      entryChanged = true;
    }

    if (!currentEntry.paraphrase && entry.paraphrase) {
      currentEntry.paraphrase = entry.paraphrase;
      entryChanged = true;
    }

    if (entryChanged) {
      currentMap[word] = currentEntry;
      changed = true;
    }
  }

  if (changed) {
    await writeWordExamples(currentMap);
  }

  return currentMap;
}

function getCachedItems(words, cache) {
  return words
    .map((word) => {
      const hit = cache[word];
      return hit
        ? {
            word,
            wordCn: hit.wordCn,
            defEn: hit.defEn,
            defCn: hit.defCn
          }
        : null;
    })
    .filter(Boolean);
}

module.exports = {
  ensureDataFiles,
  readSourceWords,
  appendSourceWords,
  readWordCache,
  writeWordCache,
  pickRandomWords,
  pickShapeWords,
  normalizeItems,
  normalizeExamples,
  buildMockItems,
  pickMockSynonymItems,
  mergeCacheItems,
  mergeWordExamples,
  mergeWordParaphrases,
  getCachedItems,
  getWordExamples,
  getWordParaphrase,
  getWordAccent,
  readWordExamples,
  writeWordExamples,
  shuffle
};
