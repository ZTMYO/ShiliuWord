const fs = require("fs");
const path = require("path");

const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, "data");
const ENV_FILE = path.join(ROOT_DIR, ".env");

loadEnvFile();

function loadEnvFile() {
  if (!fs.existsSync(ENV_FILE)) {
    return;
  }

  const lines = fs.readFileSync(ENV_FILE, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const splitIndex = line.indexOf("=");
    if (splitIndex <= 0) {
      continue;
    }
    const key = line.slice(0, splitIndex).trim();
    const value = line.slice(splitIndex + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function decodeMaskedSecret(value) {
  const masked = String(value || "").trim();
  if (!masked) {
    return "";
  }

  try {
    const reversed = Buffer.from(masked, "base64").toString("utf8");
    return reversed.split("").reverse().join("");
  } catch {
    return "";
  }
}

function requireEnvText(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) {
    throw new Error(`缺少环境变量 ${name}，请在 backend/.env 中配置`);
  }
  return value;
}

const DEEPSEEK_API_KEY =
  process.env.DEEPSEEK_API_KEY || decodeMaskedSecret(process.env.DEEPSEEK_API_KEY_MASKED);
const SESSION_SECRET = requireEnvText("SESSION_SECRET");

module.exports = {
  ROOT_DIR,
  DATA_DIR,
  SQLITE_FILE: process.env.SQLITE_FILE || path.join(DATA_DIR, "app.sqlite"),
  SOURCE_WORD_FILE: path.join(DATA_DIR, "source-word.txt"),
  WORD_CACHE_FILE: path.join(DATA_DIR, "word-data.json"),
  WORD_EXAMPLE_FILE: path.join(DATA_DIR, "word-examples.json"),
  PORT: Number(process.env.PORT || 3000),
  SESSION_SECRET,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME || "word_unlock",
  SESSION_TTL_HOURS: Math.max(1, Number(process.env.SESSION_TTL_HOURS || 24 * 30)),
  PUBLIC_MODEL_ENABLED: String(process.env.PUBLIC_MODEL_ENABLED || "false") === "true",
  DEEPSEEK_API_KEY,
  DEEPSEEK_API_URL:
    process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/chat/completions",
  DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL || "deepseek-chat",
  USE_MOCK_DATA: String(process.env.USE_MOCK_DATA || "false") === "true",
  RANDOM_OR_SHAPE_PROMPT: `For each word, generate concise exam-oriented content.
1. wordCn: dictionary-style Chinese gloss with part of speech. Use comma for multiple meanings under the same part of speech, and use semicolon only when switching to a different part of speech. Example: "adj. 牙齿的，牙科的，齿音的；n. 牙齿音".
2. defEn: short English definition, DO NOT contain the original word.
3. defCn: Chinese paraphrase of defEn only, without part of speech.
4. defCn must NOT copy wordCn, must NOT be identical to the base meaning in wordCn, and should read like a Chinese explanation of defEn.
5. Keep defCn concise but explanatory, suitable for reviewing the meaning from the English definition.

Strictly return pure JSON array:
[{"word":"","wordCn":"","defEn":"","defCn":""}]
No extra text, no explanation.
Words: {{words}}`,
  SYNONYM_PROMPT: `Use these anchor words as reference points: {{anchors}}.
Generate exactly 5 postgraduate-level English words that are true near-synonyms in the shared semantic neighborhood suggested by these anchors.
Hard constraints:
1. All 5 words must belong to the same part of speech.
2. They must stay in the common semantic neighborhood implied by the anchors, and be close in meaning and comparable in usage, not just topic-related, not antonyms, not cause-effect pairs, and not words from the same broad field.
3. A learner should be able to confuse them because of semantic similarity, not because they appear in the same context.
4. Restrict the difficulty to the typical postgraduate entrance exam range in China; do NOT use IELTS/TOEFL-style advanced words, highly literary words, obscure words, highly technical words, or overly rare words.
5. Ensure the 5 words are distinct and each one is a valid standalone vocabulary item.
6. Do NOT repeatedly default to the "alleviate/ease/relieve/mitigate" cluster unless the anchors genuinely point to that sense.
7. If one anchor is an outlier, follow the common core meaning shared by the other anchors instead of forcing a wrong cluster.

For each word:
1. wordCn: dictionary-style Chinese gloss with part of speech, and keep all 5 words aligned to the same core Chinese meaning as much as possible. Use comma for multiple meanings under the same part of speech, and use semicolon only when switching to a different part of speech. Example: "adj. 温和的，轻微的；n. 温和派".
2. defEn: brief English definition centered on the shared core meaning, but reflecting the word's own nuance, and DO NOT contain the original word.
3. defCn: Chinese paraphrase of defEn only, without part of speech.
4. defCn must NOT copy wordCn, must NOT be identical to the base meaning in wordCn, and should be a Chinese explanation of defEn.
5. Keep defCn concise but explanatory, suitable for review.
6. examples: exactly 2 bilingual examples for each word, in the form [{"en":"","cn":""},{"en":"","cn":""}].
7. Each English example must use the target word naturally in a concise, exam-friendly sentence.
8. Each Chinese example must be a fluent translation of the English sentence.

Self-check before output:
- Remove any word that is only loosely related rather than semantically close.
- Remove any word whose main meaning does not match the same core sense as the other four.
- Remove any word whose main meaning is not close to the common postgraduate-exam sense implied by the anchors.
- Remove any antonym, near-antonym, opposite-direction word, contrastive word, or semantically conflicting word immediately.
- Remove any word that feels above the normal Chinese postgraduate entrance exam vocabulary range.
- Keep the final set tightly grouped around one shared meaning.
- Ensure every returned word includes exactly 2 usable bilingual examples.
- If you cannot find 5 safe near-synonyms, return [] instead of forcing a bad set.

Only output pure JSON array:
[{"word":"","wordCn":"","defEn":"","defCn":"","examples":[{"en":"","cn":""},{"en":"","cn":""}]}]
No redundant content at all.`,
  SYNONYM_SUPPLEMENT_PROMPT: `Use these anchor words as reference points: {{anchors}}.
The existing synonym set is incomplete. Keep all existing valid items unchanged, and supplement exactly {{missingCount}} additional postgraduate-level near-synonym items so that the full set reaches 5 words under one shared core meaning.

Existing items:
{{existingItems}}

Hard constraints:
1. The new items must belong to the same part of speech and same semantic cluster as the existing items.
2. Do NOT repeat any existing word.
3. Do NOT add antonyms, near-antonyms, opposite-direction words, contrastive words, or semantically conflicting words.
4. Restrict the difficulty to the typical postgraduate entrance exam range in China; do NOT use IELTS/TOEFL-style advanced words, highly literary words, obscure words, highly technical words, or overly rare words.
5. If safe supplementation is impossible, return [].

For each returned item:
1. wordCn: dictionary-style Chinese gloss with part of speech. Use comma for multiple meanings under the same part of speech, and use semicolon only when switching to a different part of speech. Example: "v. 减轻，缓和；n. 缓和".
2. defEn: brief English definition that does NOT contain the word itself.
3. defCn: Chinese paraphrase of defEn only, without part of speech.
4. examples: exactly 2 bilingual examples in the form [{"en":"","cn":""},{"en":"","cn":""}].

Only output pure JSON array:
[{"word":"","wordCn":"","defEn":"","defCn":"","examples":[{"en":"","cn":""},{"en":"","cn":""}]}]
No redundant content at all.`,
  FLASHCARD_PROMPT: `You are generating multiple-choice meaning options for a Chinese learner in a "Baicizhan"-style vocabulary quiz.
For each input word, create exactly 1 correct concise Chinese gloss and exactly 3 concise distractor glosses.
For every option, also provide the actual English word that matches that gloss.

Input items:
{{items}}

Hard constraints:
1. Keep each option short and suitable for a compact button, preferably in the style of "n. xxx", "v. xxx", "adj. xxx", "adv. xxx".
2. The correct option must match the common exam-oriented meaning of the given word.
3. Distractors must be plausible but clearly incorrect for that word.
4. Avoid long dictionary strings, long explanations, multiple semicolon senses, or full-sentence definitions.
5. The 4 options for each word must be distinct.
6. Keep the part of speech on the correct option when natural.
7. Return results for every input word in the same order.
8. correctOptionWord must equal the given target word.
9. Each distractor must include both "word" and "text".
10. Distractor words should be common standalone English words, not phrases, and should match their own gloss naturally.
11. Every distractor "word" must be non-empty and must NOT equal the target word.
12. Do NOT use another meaning, part of speech, or paraphrase of the target word as a distractor.

Return pure JSON array only:
[{"word":"","correctOption":"","correctOptionWord":"","distractors":[{"word":"","text":""},{"word":"","text":""},{"word":"","text":""}]}]

No markdown, no commentary, no extra text.`,
  EXAMPLE_PROMPT: `Generate 2 natural bilingual example sentences for each word.
Requirements:
1. Each English sentence must use the target word in a normal context.
2. English sentences should be concise, clear, and exam-friendly.
3. Chinese sentences should be fluent translations of the English sentences.
4. Return exactly 2 examples per word when possible.
5. Do not add explanations or markdown.

Return pure JSON object in this format:
{"word":[{"en":"","cn":""}]}

Words: {{words}}`,
  DEMO_ITEMS: [
    {
      word: "abandon",
      wordCn: "v. 放弃；遗弃",
      defEn: "to leave something completely and stop supporting it",
      defCn: "彻底离开某事物并停止支持它"
    },
    {
      word: "brief",
      wordCn: "adj. 简短的；短暂的",
      defEn: "lasting for a very short time or using few words",
      defCn: "持续时间很短或用词很少"
    },
    {
      word: "convert",
      wordCn: "v. 转化；改变",
      defEn: "to change something into a different form or purpose",
      defCn: "把某物变成不同的形式或用途"
    },
    {
      word: "decline",
      wordCn: "v. 下降；拒绝",
      defEn: "to become less in amount or to politely refuse",
      defCn: "数量减少，或礼貌地拒绝"
    },
    {
      word: "retain",
      wordCn: "v. 保留；保持",
      defEn: "to continue to keep or hold something",
      defCn: "继续保有某物"
    },
    {
      word: "rigid",
      wordCn: "adj. 僵硬的；严格的",
      defEn: "stiff and not easy to bend or not willing to change",
      defCn: "坚硬不易弯曲，或不愿改变"
    },
    {
      word: "submit",
      wordCn: "v. 提交；屈从",
      defEn: "to formally present something or accept another authority",
      defCn: "正式提交某物，或接受他人权威"
    },
    {
      word: "sustain",
      wordCn: "v. 维持；支撑",
      defEn: "to keep something going for a period of time",
      defCn: "让某事持续一段时间"
    },
    {
      word: "transmit",
      wordCn: "v. 传输；传播",
      defEn: "to send something from one place to another",
      defCn: "把某物从一处传到另一处"
    },
    {
      word: "vivid",
      wordCn: "adj. 生动的；鲜明的",
      defEn: "producing strong and clear images in the mind",
      defCn: "在脑海中产生强烈清晰印象的"
    }
  ]
};
