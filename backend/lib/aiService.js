const {
  DEEPSEEK_API_URL,
  DEEPSEEK_MODEL,
  USE_MOCK_DATA,
  RANDOM_OR_SHAPE_PROMPT,
  SYNONYM_PROMPT,
  SYNONYM_SUPPLEMENT_PROMPT,
  FLASHCARD_PROMPT,
  EXAMPLE_PROMPT,
  READING_PROMPT,
  READING_TITLE_TRANSLATE_PROMPT
} = require("../config");
const { normalizeItems, normalizeExamples } = require("./wordService");

function normalizeBookName(bookName) {
  const normalized = String(bookName || "").trim();
  return normalized;
}

function applyBookContext(prompt, bookName) {
  const normalizedBookName = normalizeBookName(bookName);
  return String(prompt || "").replaceAll("{{bookName}}", normalizedBookName);
}

function resolveApiKey(personalApiKey = "") {
  const normalizedPersonalApiKey = String(personalApiKey || "").trim();
  if (normalizedPersonalApiKey) {
    return normalizedPersonalApiKey;
  }

  throw new Error("请先在账号设置中填写个人 API Key");
}

async function requestDeepSeekRaw(prompt, personalApiKey) {
  if (USE_MOCK_DATA) {
    return "";
  }

  const apiKey = resolveApiKey(personalApiKey);

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`DeepSeek 请求失败: ${response.status} ${message}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

async function requestDeepSeek(prompt, personalApiKey) {
  return parseJsonArray(await requestDeepSeekRaw(prompt, personalApiKey));
}

async function validatePersonalApiKey(personalApiKey) {
  const normalizedPersonalApiKey = String(personalApiKey || "").trim();
  if (!normalizedPersonalApiKey) {
    return {
      available: false,
      message: "请先输入 API Key"
    };
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${normalizedPersonalApiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        temperature: 0,
        max_tokens: 1,
        messages: [
          {
            role: "user",
            content: "Reply with OK."
          }
        ]
      })
    });

    if (response.ok) {
      return {
        available: true,
        message: "API Key 可用"
      };
    }

    const message = await response.text();
    return {
      available: false,
      message: `API Key 不可用: ${response.status} ${message}`
    };
  } catch (error) {
    return {
      available: false,
      message: error.message || "API Key 校验失败"
    };
  }
}

function parseJsonArray(content) {
  const text = String(content || "").trim();
  if (!text) {
    return [];
  }

  try {
    return normalizeItems(JSON.parse(text));
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) {
      return [];
    }
    try {
      return normalizeItems(JSON.parse(match[0]));
    } catch {
      return [];
    }
  }
}

function parseRawJsonArray(content) {
  const text = String(content || "").trim();
  if (!text) {
    return [];
  }

  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) {
      return [];
    }
    try {
      const parsed = JSON.parse(match[0]);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

async function generateForWords(words, personalApiKey, options = {}) {
  const prompt = applyBookContext(
    RANDOM_OR_SHAPE_PROMPT.replace("{{words}}", words.join(", ")),
    options?.bookName
  );
  return requestDeepSeek(prompt, personalApiKey);
}

function extractExamplesFromSynonymItems(rawItems) {
  const exampleMap = {};
  for (const item of rawItems) {
    const word = String(item?.word || "").trim().toLowerCase();
    if (!word) {
      continue;
    }
    const examples = Array.isArray(item?.examples) ? item.examples : [];
    if (examples.length) {
      exampleMap[word] = examples;
    }
  }
  return normalizeExamples(exampleMap);
}

function normalizeAnchorText(anchorWords = []) {
  const anchors = Array.isArray(anchorWords) ? anchorWords : [anchorWords];
  return anchors
    .map((item) => String(item || "").trim().toLowerCase())
    .filter(Boolean)
    .join(", ");
}

async function parseSynonymPayload(prompt, personalApiKey) {
  const content = await requestDeepSeekRaw(prompt, personalApiKey);
  const rawItems = parseRawJsonArray(content);
  return {
    items: normalizeItems(rawItems),
    examples: extractExamplesFromSynonymItems(rawItems)
  };
}

async function generateSynonyms(anchorWords = [], personalApiKey, options = {}) {
  const anchorText = normalizeAnchorText(anchorWords);
  const prompt = applyBookContext(
    SYNONYM_PROMPT.replace("{{anchors}}", anchorText || "common English vocabulary"),
    options?.bookName
  );
  return parseSynonymPayload(prompt, personalApiKey);
}

async function supplementSynonyms(anchorWords = [], existingItems = [], missingCount = 0, personalApiKey, options = {}) {
  const anchorText = normalizeAnchorText(anchorWords);
  const prompt = applyBookContext(
    SYNONYM_SUPPLEMENT_PROMPT
    .replace("{{anchors}}", anchorText || "common English vocabulary")
    .replace("{{missingCount}}", String(Math.max(0, Number(missingCount) || 0)))
    .replace(
      "{{existingItems}}",
      JSON.stringify(
        normalizeItems(existingItems).map((item) => ({
          word: item.word,
          wordCn: item.wordCn,
          defEn: item.defEn,
          defCn: item.defCn
        })),
        null,
        2
      )
    ),
    options?.bookName
  );
  return parseSynonymPayload(prompt, personalApiKey);
}

function parseJsonObject(content) {
  const text = String(content || "").trim();
  if (!text) {
    return {};
  }

  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return {};
    }
    try {
      const parsed = JSON.parse(match[0]);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
}

function normalizeExampleMap(exampleMap) {
  if (!exampleMap || typeof exampleMap !== "object" || Array.isArray(exampleMap)) {
    return {};
  }

  const normalized = {};
  for (const [rawWord, rawItems] of Object.entries(exampleMap)) {
    const word = String(rawWord || "").trim().toLowerCase();
    if (!word || !Array.isArray(rawItems)) {
      continue;
    }
    const examples = rawItems
      .map((item) => ({
        en: String(item?.en || "").trim(),
        cn: String(item?.cn || "").trim()
      }))
      .filter((item) => item.en && item.cn)
      .slice(0, 2);
    if (examples.length) {
      normalized[word] = examples;
    }
  }
  return normalized;
}

async function generateExamples(words, personalApiKey, options = {}) {
  const prompt = applyBookContext(
    EXAMPLE_PROMPT.replace("{{words}}", words.join(", ")),
    options?.bookName
  );
  const content = await requestDeepSeekRaw(prompt, personalApiKey);
  return normalizeExampleMap(parseJsonObject(content));
}

function normalizeReadingPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const title = String(payload.title || "").trim();
  const titleCn = sanitizeReadingChineseText(payload.titleCn || payload.title_cn || "");
  const selectedWords = Array.isArray(payload.selectedWords || payload.selected_words)
    ? [...new Set(
        (payload.selectedWords || payload.selected_words)
          .map((word) => String(word || "").trim().toLowerCase())
          .filter(Boolean)
      )]
    : [];
  const realWords = Array.isArray(payload.realWords || payload.real_words)
    ? (payload.realWords || payload.real_words)
        .map((word) => String(word || "").trim())
        .filter(Boolean)
    : [];
  const sentences = Array.isArray(payload.sentences)
    ? payload.sentences
        .map((item) => ({
          en: sanitizeReadingEnglishText(item?.en),
          cn: sanitizeReadingChineseText(item?.cn)
        }))
        .filter((item) => item.en && item.cn)
    : [];

  if (!sentences.length) {
    return null;
  }

  return {
    title,
    titleCn,
    selectedWords,
    realWords,
    sentences
  };
}

function sanitizeReadingEnglishText(text) {
  return String(text || "")
    .replace(/[【\[]\s*([A-Za-z][A-Za-z\s'-]*)\s*[】\]]/g, "$1")
    .trim();
}

function sanitizeReadingChineseText(text) {
  return String(text || "")
    .replace(/\[([^\[\]]+)\]/g, "【$1】")
    .trim();
}

async function translateReadingTitle(title, personalApiKey, options = {}) {
  const source = String(title || "").trim();
  if (!source) {
    return "";
  }

  const prompt = applyBookContext(
    READING_TITLE_TRANSLATE_PROMPT.replace("{{title}}", source),
    options?.bookName
  );
  return sanitizeReadingChineseText(await requestDeepSeekRaw(prompt, personalApiKey));
}

async function generateReadingPassage(items, personalApiKey, options = {}) {
  const availableWords = new Set(
    (Array.isArray(items) ? items : [])
      .map((item) => String(item?.word || "").trim().toLowerCase())
      .filter(Boolean)
  );
  const prompt = applyBookContext(
    READING_PROMPT.replace(
      "{{items}}",
      JSON.stringify(
        (Array.isArray(items) ? items : []).map((item) => ({
          word: item.word,
          wordCn: item.wordCn,
          defEn: item.defEn,
          defCn: item.defCn
        })),
        null,
        2
      )
    ),
    options?.bookName
  );
  const content = await requestDeepSeekRaw(prompt, personalApiKey);
  const payload = normalizeReadingPayload(parseJsonObject(content));
  if (!payload) {
    return null;
  }
  if (payload.selectedWords.length) {
    payload.selectedWords = payload.selectedWords.filter((word) => availableWords.has(word));
  }
  if (!payload.titleCn && payload.title) {
    payload.titleCn = await translateReadingTitle(payload.title, personalApiKey, { bookName: options?.bookName });
  }
  return payload;
}

function normalizeFlashOptionText(value) {
  return String(value || "").trim();
}

function normalizeFlashOptionWord(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeFlashOption(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return {
      word: normalizeFlashOptionWord(value.word || value.optionWord),
      text: normalizeFlashOptionText(value.text || value.option || value.gloss || value.meaning)
    };
  }
  return {
    word: "",
    text: normalizeFlashOptionText(value)
  };
}

function extractFlashOptionPos(text) {
  const source = String(text || "").trim();
  const match = source.match(/^(?:（[^）]*）|\([^)]*\))?\s*([a-z]+)\.\s*/i);
  return match ? match[1].toLowerCase() : "";
}

function normalizeFlashGlossCore(text) {
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
  const normalizedCorrect = correctOption ? normalizeFlashOption(correctOption) : null;

  (Array.isArray(options) ? options : []).forEach((option) => {
    if (!option?.text) {
      return;
    }
    const isDuplicate = kept.some((existing) => areFlashOptionsNearDuplicate(existing, option));
    if (!isDuplicate) {
      kept.push(option);
    }
  });

  if (normalizedCorrect?.text && !kept.some((option) => areFlashOptionsNearDuplicate(option, normalizedCorrect))) {
    kept.unshift(normalizedCorrect);
  }

  return kept;
}

function normalizeFlashQuestions(rawItems, targetWords = []) {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  const targetSet = new Set(
    (Array.isArray(targetWords) ? targetWords : [targetWords])
      .map((item) => String(item || "").trim().toLowerCase())
      .filter(Boolean)
  );

  return rawItems
    .map((item) => {
      const word = String(item?.word || "").trim().toLowerCase();
      const correctOption = normalizeFlashOption({
        word: item?.correctOptionWord || word,
        text: item?.correctOption
      });
      const distractors = Array.isArray(item?.distractors)
        ? item.distractors
            .map(normalizeFlashOption)
            .filter((option) => option.text && option.word && option.word !== word)
        : [];
      const mergedOptions = dedupeFlashOptions(
        [correctOption, ...distractors]
          .filter((option) => option.text)
          .filter(
            (option, index, list) =>
              list.findIndex((candidate) => candidate.text === option.text) === index
          ),
        correctOption
      )
        .filter((option) => option.text)
        .filter((option) => option.word || option.text === correctOption.text);

      return {
        word,
        correctOption,
        distractors: mergedOptions.filter((option) => option.text !== correctOption.text),
        options: mergedOptions
      };
    })
    .filter((item) => {
      if (!item.word || !item.correctOption.text) {
        return false;
      }
      if (targetSet.size && !targetSet.has(item.word)) {
        return false;
      }
      return item.options.length >= 3;
    });
}

async function generateFlashcardOptions(items, personalApiKey, options = {}) {
  const prompt = applyBookContext(
    FLASHCARD_PROMPT.replace(
      "{{items}}",
      JSON.stringify(
        (Array.isArray(items) ? items : []).map((item) => ({
          word: item.word,
          wordCn: item.wordCn,
          defEn: item.defEn,
          defCn: item.defCn
        })),
        null,
        2
      )
    ),
    options?.bookName
  );
  const content = await requestDeepSeekRaw(prompt, personalApiKey);
  return normalizeFlashQuestions(
    parseRawJsonArray(content),
    (Array.isArray(items) ? items : []).map((item) => item.word)
  );
}

module.exports = {
  generateForWords,
  generateSynonyms,
  supplementSynonyms,
  generateExamples,
  generateReadingPassage,
  generateFlashcardOptions,
  validatePersonalApiKey
};
