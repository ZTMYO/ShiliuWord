const fs = require("fs");
const path = require("path");
const { DATA_DIR } = require("../config");

const FORBIDDEN_WORDS_PATH = path.join(DATA_DIR, "违规词库.txt");

let forbiddenWordsSet = null;
let forbiddenWordsLoaded = false;

function loadForbiddenWords() {
  if (forbiddenWordsLoaded) {
    return;
  }

  try {
    const content = fs.readFileSync(FORBIDDEN_WORDS_PATH, "utf8");
    const words = content
      .split(/\r?\n/)
      .map((line) => line.trim().toLowerCase())
      .filter((word) => word.length > 0);
    
    forbiddenWordsSet = new Set(words);
    forbiddenWordsLoaded = true;
    console.log(`Loaded ${forbiddenWordsSet.size} forbidden words`);
  } catch (error) {
    console.error("Failed to load forbidden words:", error.message);
    forbiddenWordsSet = new Set();
    forbiddenWordsLoaded = true;
  }
}

function containsForbiddenWord(text) {
  loadForbiddenWords();
  
  if (!text || typeof text !== "string") {
    return false;
  }

  const normalizedText = text.trim().toLowerCase();
  
  if (forbiddenWordsSet.has(normalizedText)) {
    return true;
  }

  for (const word of forbiddenWordsSet) {
    if (normalizedText.includes(word)) {
      return true;
    }
  }

  return false;
}

module.exports = {
  containsForbiddenWord,
  loadForbiddenWords
};