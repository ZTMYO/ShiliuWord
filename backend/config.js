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

function requireEnvText(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) {
    throw new Error(`缺少环境变量 ${name}，请在 backend/.env 中配置`);
  }
  return value;
}

const SESSION_SECRET = requireEnvText("SESSION_SECRET");

module.exports = {
  ROOT_DIR,
  DATA_DIR,
  SQLITE_FILE: process.env.SQLITE_FILE || path.join(DATA_DIR, "app.sqlite"),
  WORD_BOOK_DIR: path.join(DATA_DIR, "books"),
  DEFAULT_BOOK_ID: 2,
  WORD_BOOKS: [
    { id: 1, name: "四级词汇乱序便携版", file: "book-1.txt" },
    { id: 2, name: "考研词汇便携版", file: "book-2.txt" },
    { id: 3, name: "星火四级词汇必背乱序版", file: "book-3.txt" },
    { id: 4, name: "雅思词汇念念不忘乱序版", file: "book-4.txt" },
    { id: 5, name: "托福高频词汇精讲", file: "book-5.txt" },
    { id: 6, name: "考研英语(二)词汇乱序版", file: "book-6.txt" },
    { id: 7, name: "小学英语", file: "book-7.txt"},
    { id: 8, name: "高中英语", file: "book-8.txt"},
    { id: 9, name: "专八词汇乱序版", file: "book-9.txt"}
  ],
  WORD_CACHE_FILE: path.join(DATA_DIR, "word-data.json"),
  WORD_EXAMPLE_FILE: path.join(DATA_DIR, "word-examples.json"),
  PORT: Number(process.env.PORT || 3000),
  SESSION_SECRET,
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME || "word_unlock",
  SESSION_TTL_HOURS: Math.max(1, Number(process.env.SESSION_TTL_HOURS || 24 * 30)),
  DEEPSEEK_API_URL:
    process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/chat/completions",
  DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL || "deepseek-chat",
  USE_MOCK_DATA: String(process.env.USE_MOCK_DATA || "false") === "true",
  RANDOM_OR_SHAPE_PROMPT: `You are generating concise vocabulary-learning content for Chinese learners.
Target word book: {{bookName}}
Adjust difficulty, senses, and examples to match the typical learner level implied by this word book.
If the word book suggests a lower level (e.g., primary school), keep definitions simple and concrete; if higher (e.g., TEM-8), allow more advanced but still common senses.

For each word, generate concise content:
1. wordCn: dictionary-style Chinese gloss with part of speech. Use comma for multiple meanings under the same part of speech, and use semicolon only when switching to a different part of speech. Example: "adj. 牙齿的，牙科的，齿音的；n. 牙齿音".
2. defEn: short English definition, DO NOT contain the original word.
3. defCn: Chinese paraphrase of defEn only, without part of speech.
4. defCn must NOT copy wordCn, must NOT be identical to the base meaning in wordCn, and should read like a Chinese explanation of defEn.
5. Keep defCn concise but explanatory, suitable for review at this level.

Strictly return pure JSON array:
[{"word":"","wordCn":"","defEn":"","defCn":""}]
No extra text, no explanation.
Words: {{words}}`,
  SYNONYM_PROMPT: `Target word book: {{bookName}}
Use these anchor words as reference points: {{anchors}}.
Generate exactly 5 English words that are true near-synonyms in the shared semantic neighborhood suggested by these anchors, with difficulty matching the target word book.
Hard constraints:
1. All 5 words must belong to the same part of speech.
2. They must stay in the common semantic neighborhood implied by the anchors, and be close in meaning and comparable in usage, not just topic-related, not antonyms, not cause-effect pairs, and not words from the same broad field.
3. A learner should be able to confuse them because of semantic similarity, not because they appear in the same context.
4. Restrict the difficulty to match the target word book; avoid overly rare/technical words unless the book is clearly advanced.
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
7. Each English example must use the target word naturally in a concise, clear sentence suitable for study (or exam prep if the book implies it).
8. Each Chinese example must be a fluent translation of the English sentence.

Self-check before output:
- Remove any word that is only loosely related rather than semantically close.
- Remove any word whose main meaning does not match the same core sense as the other four.
- Remove any word whose main meaning is not close to the common sense implied by the anchors.
- Remove any antonym, near-antonym, opposite-direction word, contrastive word, or semantically conflicting word immediately.
- Remove any word that feels above the target word book's typical vocabulary range.
- Keep the final set tightly grouped around one shared meaning.
- Ensure every returned word includes exactly 2 usable bilingual examples.
- If you cannot find 5 safe near-synonyms, return [] instead of forcing a bad set.

Only output pure JSON array:
[{"word":"","wordCn":"","defEn":"","defCn":"","examples":[{"en":"","cn":""},{"en":"","cn":""}]}]
No redundant content at all.`,
  SYNONYM_SUPPLEMENT_PROMPT: `Target word book: {{bookName}}
Use these anchor words as reference points: {{anchors}}.
The existing synonym set is incomplete. Keep all existing valid items unchanged, and supplement exactly {{missingCount}} additional near-synonym items so that the full set reaches 5 words under one shared core meaning, with difficulty matching the target word book.

Existing items:
{{existingItems}}

Hard constraints:
1. The new items must belong to the same part of speech and same semantic cluster as the existing items.
2. Do NOT repeat any existing word.
3. Do NOT add antonyms, near-antonyms, opposite-direction words, contrastive words, or semantically conflicting words.
4. Restrict the difficulty to match the target word book; avoid overly rare/technical words unless the book is clearly advanced.
5. If safe supplementation is impossible, return [].

For each returned item:
1. wordCn: dictionary-style Chinese gloss with part of speech. Use comma for multiple meanings under the same part of speech, and use semicolon only when switching to a different part of speech. Example: "v. 减轻，缓和；n. 缓和".
2. defEn: brief English definition that does NOT contain the word itself.
3. defCn: Chinese paraphrase of defEn only, without part of speech.
4. examples: exactly 2 bilingual examples in the form [{"en":"","cn":""},{"en":"","cn":""}].

Only output pure JSON array:
[{"word":"","wordCn":"","defEn":"","defCn":"","examples":[{"en":"","cn":""},{"en":"","cn":""}]}]
No redundant content at all.`,
  FLASHCARD_PROMPT: `You are generating multiple-choice meaning options for a Chinese learner in a compact vocabulary quiz.
Target word book: {{bookName}}
Adjust difficulty and sense selection to fit the learner level and exam-focus implied by the word book.
If the word book name clearly indicates an exam track (e.g., 考研, 四级/六级, 雅思, 托福, 专八), prefer the common exam-relevant meaning; otherwise prefer the most common learner-relevant meaning in general usage.
For each input word, create exactly 1 correct concise Chinese gloss and exactly 3 concise distractor glosses.
That means 4 options total per word: 1 correct + 3 distractors (NOT 3 options total).
The distractors array must contain exactly 3 items for every word.
For every option, also provide the actual English word that matches that gloss.

Input items:
{{items}}

Hard constraints:
1. Keep each option short and suitable for a compact button, preferably in the style of "n. xxx", "v. xxx", "adj. xxx", "adv. xxx".
2. The correct option must match the intended sense implied by the word book (exam-relevant if the book suggests an exam track).
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
13. Do NOT return two options with the same part of speech and the same Chinese meaning.
14. Do NOT return one option whose Chinese gloss is just a substring , such as "v. 拒绝" vs "v. 拒绝，排斥".
15. Do NOT label any distractor as "拼写错误" or mention spelling in the Chinese gloss. The Chinese text should be a normal, legitimate meaning of some English word.

Return pure JSON array only:
[{"word":"","correctOption":"","correctOptionWord":"","distractors":[{"word":"","text":""},{"word":"","text":""},{"word":"","text":""}]}]

No markdown, no commentary, no extra text.`,
  EXAMPLE_PROMPT: `Generate 2 natural bilingual example sentences for each word.
Target word book: {{bookName}}
Make sentences appropriate for the learner level implied by the word book.
Requirements:
1. Each English sentence must use the target word in a normal context.
2. English sentences should be concise, clear, and suitable for study (or exam prep if the book implies it).
3. Chinese sentences should be fluent translations of the English sentences.
4. Return exactly 2 examples per word when possible.
5. Do not add explanations or markdown.

Return pure JSON object in this format:
{"word":[{"en":"","cn":""}]}

Words: {{words}}`,
  READING_TITLE_TRANSLATE_PROMPT: `Translate the following English reading title into natural, concise Chinese.
Target word book: {{bookName}}

Hard constraints:
1. Keep the tone and complexity appropriate for the target word book.
2. Do not explain, annotate, or add quotation marks.
3. Return plain Chinese text only.

Title: {{title}}`,
  READING_PROMPT: `Write a short bilingual English reading exercise for Chinese learners, with difficulty matching the target word book.
Target word book: {{bookName}}

Use these candidate words:
{{items}}

Requirements:
- Write 5 to 8 sentence pairs.
- Choose the largest natural subset and use as many candidate words as possible, but skip any word that would make the passage awkward.
- Keep the passage coherent and natural. If the target word book is advanced, you may include longer/complex sentences; otherwise keep sentence structures simpler.
- Each English sentence must have one natural Chinese translation.
- In each English sentence, try to use at most 1 target word. If you use multiple target words in one sentence, you must mark each one in Chinese with separate 【】 in the same order as the English target words appear.
- CRITICAL: For EVERY target word used in the English sentence, you MUST mark its EXACT translation in the Chinese sentence with 【】. NO EXCEPTIONS.
- In Chinese, mark ONLY the Chinese phrase that translates the used target word sense with 【】. The marked phrase must be the best direct translation of the target word in that sentence, consistent with the provided wordCn/defCn for that word (do NOT invent an unrelated highlight).
- For each used target word in English, the paired Chinese sentence must contain exactly one corresponding marked phrase 【】 for that word. Do not mark anything if no target word is used in that English sentence.
- The content inside 【】 must be Chinese only, never English, pinyin, or mixed text.
- Do not add any marker in English.
- selectedWords must list exactly the lowercase target words you actually used in the English sentences (no extras, no missing).
- Return pure JSON only.

Self-check before output (MANDATORY):
1. First, for EACH sentence pair:
   - Count the number of target words used in the English sentence
   - Count the number of 【】 markers in the Chinese sentence
   - THESE TWO NUMBERS MUST BE EXACTLY EQUAL
   - If they are not equal, FIX IT BEFORE PROCEEDING
2. For EVERY target word in English, verify that its Chinese translation is properly marked with 【】 in the Chinese sentence
3. Ensure every 【】 phrase is the translation of a used target word in that sentence, not other phrases
4. DO NOT skip any word's Chinese marking - EVERY used target word MUST have its translation marked

Example sentence pair:
{"en":"Public trust may erode when institutions ignore obvious risks.","cn":"当机构忽视明显风险时，公众【信任】可能会被削弱。"}

Return JSON:
{"title":"","titleCn":"","selectedWords":[""],"sentences":[{"en":"","cn":""}]}

title: short formal English title
titleCn: natural Chinese translation of the title`,
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
