import "./style.css";
const MODE_LABELS = {
  random: "随机词",
  shape: "形近词",
  synonym: "近义词"
};

const WORD_BOOKS = [
  { id: 1, name: "四级词汇乱序便携版" },
  { id: 2, name: "考研词汇便携版" },
  { id: 3, name: "星火四级词汇必背乱序版" },
  { id: 4, name: "雅思词汇念念不忘乱序版" },
  { id: 5, name: "托福高频词汇精讲" },
  { id: 6, name: "考研英语(二)词汇乱序版" },
  { id: 7, name: "小学英语" },
  { id: 8, name: "高中英语" },
  { id: 9, name: "专八词汇乱序版" }
];

const HOME_ENTRY_ITEMS = [
  { key: "random", label: "随机词", type: "quiz" },
  { key: "shape", label: "形近词", type: "quiz", requiresAi: true },
  { key: "synonym", label: "近义词", type: "quiz", requiresAi: true },
  { key: "flash", label: "闪卡刷词", type: "flash" },
  { key: "reading", label: "阅读训练", type: "reading", requiresAi: true },
  { key: "wordle", label: "Wordle", type: "wordle" }
];

const TONE_KEYS = [
  "blue",
  "purple",
  "cyan",
  "orange",
  "pink"
];

const THEME_STORAGE_KEY = "shiliu-word-theme";
const LEGACY_THEME_STORAGE_KEY = "english-ai-theme";
const PERSONAL_API_KEY_STORAGE_PREFIX = "shiliu-word-personal-api-key";
const LEGACY_PERSONAL_API_KEY_STORAGE_PREFIX = "english-ai-personal-api-key";
const QUIZ_DRAFT_STORAGE_PREFIX = "shiliu-word-drafts-v2";
const LEGACY_QUIZ_DRAFT_STORAGE_PREFIX = "english-ai-word-drafts-v2";
const FLASH_CACHE_STORAGE_PREFIX = "shiliu-word-flash-cache-v1";
const READING_CACHE_STORAGE_PREFIX = "shiliu-word-reading-cache-v1";
const LEGACY_HISTORY_STORAGE_KEY = "english-ai-word-history";
const LEGACY_FLASH_HISTORY_STORAGE_KEY = "english-ai-flash-history";
const LEGACY_QUIZ_DRAFT_STORAGE_KEY = "english-ai-word-drafts";
const LEGACY_USER_STORAGE_KEY = "english-ai-user-role";
const preloadQuizStore = {};
const FLASH_BATCH_SIZE = 5;
const HISTORY_BATCH_SIZE = 16;
const COLLECTION_BATCH_SIZE = 24;
const HISTORY_RECORD_LIMIT = 50;
const MOON_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
`.trim();
const SUN_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="4"></circle>
    <path d="M12 2v2"></path>
    <path d="M12 20v2"></path>
    <path d="M4.93 4.93l1.41 1.41"></path>
    <path d="M17.66 17.66l1.41 1.41"></path>
    <path d="M2 12h2"></path>
    <path d="M20 12h2"></path>
    <path d="M4.93 19.07l1.41-1.41"></path>
    <path d="M17.66 6.34l1.41-1.41"></path>
  </svg>
`.trim();
const TTS_CONFIG = {
  enabled: true,
  lang: "en-US",
  voiceName: "",
  rate: 0.8,
  pitch: 1,
  volume: 1
};
const SPEAKER_ICON_1 = `
  <svg class="pronounce-icon" viewBox="0 0 30 30" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.875 16.0939V13.9063C1.875 12.0943 3.34395 10.6251 5.15625 10.6251H5.44072C5.96221 10.6251 6.46641 10.4391 6.8625 10.1001L12.9873 4.8501C13.596 4.32945 14.374 4.04936 15.1749 4.0626C16.3166 4.0626 17.2421 4.98809 17.2421 6.12949V23.8696C17.2421 25.011 16.3166 25.9365 15.1749 25.9365C14.3739 25.95 13.5961 25.6696 12.9873 25.149L6.8625 19.899C6.4663 19.5601 5.96208 19.374 5.44072 19.374H5.15625C3.34424 19.3749 1.875 17.906 1.875 16.0939ZM21.0152 18.0299C23.3499 16.6854 24.1526 13.703 22.8082 11.3684C22.3791 10.623 21.7606 10.0045 21.0152 9.57539C20.5055 9.25137 19.8296 9.40166 19.5053 9.91143C19.181 10.4212 19.3315 11.0971 19.8413 11.4211C19.8674 11.4378 19.894 11.453 19.9216 11.4677C21.2112 12.2057 21.6583 13.8498 20.92 15.1392C20.6822 15.5551 20.3374 15.8999 19.9216 16.1379C19.3863 16.4177 19.1792 17.0786 19.4593 17.6139C19.7391 18.1491 20.4 18.3563 20.9353 18.0765C20.9625 18.0618 20.9892 18.0463 21.0152 18.0299ZM24.4386 21.5297C28.7033 18.0806 29.3643 11.8277 25.9154 7.56299C25.4765 7.02007 24.9815 6.52504 24.4386 6.08613C23.9517 5.72871 23.2673 5.83389 22.9096 6.32051C22.5768 6.77402 22.6421 7.40566 23.0604 7.78125C26.3827 10.4742 26.8928 15.3507 24.1998 18.6729C23.8607 19.0913 23.4788 19.4732 23.0604 19.8123C22.611 20.216 22.5741 20.9074 22.9778 21.3568C23.3537 21.7752 23.9854 21.8405 24.4386 21.5077V21.5297Z" fill="currentColor"/>
  </svg>
`.trim();
const SPEAKER_ICON_2 = `
  <svg class="pronounce-icon" viewBox="0 0 30 30" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.875 16.0939V13.9063C1.875 12.0943 3.34395 10.6251 5.15625 10.6251H5.44072C5.96221 10.6251 6.46641 10.4391 6.8625 10.1001L12.9873 4.8501C13.596 4.32945 14.374 4.04936 15.1749 4.0626C16.3166 4.0626 17.2421 4.98809 17.2421 6.12949V23.8696C17.2421 25.011 16.3166 25.9365 15.1749 25.9365C14.3739 25.95 13.5961 25.6696 12.9873 25.149L6.8625 19.899C6.4663 19.5601 5.96208 19.374 5.44072 19.374H5.15625C3.34424 19.3749 1.875 17.906 1.875 16.0939ZM21.0152 18.0299C23.3499 16.6854 24.1526 13.703 22.8082 11.3684C22.3791 10.623 21.7606 10.0045 21.0152 9.57539C20.5055 9.25137 19.8296 9.40166 19.5053 9.91143C19.181 10.4212 19.3315 11.0971 19.8413 11.4211C19.8674 11.4378 19.894 11.453 19.9216 11.4677C21.2112 12.2057 21.6583 13.8498 20.92 15.1392C20.6822 15.5551 20.3374 15.8999 19.9216 16.1379C19.3863 16.4177 19.1792 17.0786 19.4593 17.6139C19.7391 18.1491 20.4 18.3562 20.9353 18.0765C20.9625 18.0618 20.9892 18.0463 21.0152 18.0299Z" fill="currentColor"/>
  </svg>
`.trim();
const SPEAKER_ICON_3 = `
  <svg class="pronounce-icon" viewBox="0 0 30 30" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.875 16.0939V13.9063C1.875 12.0943 3.34395 10.6251 5.15625 10.6251H5.44072C5.96221 10.6251 6.46641 10.4391 6.8625 10.1001L12.9873 4.8501C13.596 4.32945 14.374 4.04936 15.1749 4.0626C16.3166 4.0626 17.2421 4.98809 17.2421 6.12949V23.8696C17.2421 25.011 16.3166 25.9365 15.1749 25.9365C14.3739 25.95 13.5961 25.6696 12.9873 25.149L6.8625 19.899C6.4663 19.5601 5.96208 19.374 5.44072 19.374H5.15625C3.34424 19.3749 1.875 17.906 1.875 16.0939Z" fill="currentColor"/>
  </svg>
`.trim();
const PRONOUNCE_ICON = SPEAKER_ICON_1;
const SPEAKER_PULSE_FRAMES = [
  SPEAKER_ICON_1,
  SPEAKER_ICON_3,
  SPEAKER_ICON_2,
  SPEAKER_ICON_1,
  SPEAKER_ICON_3,
  SPEAKER_ICON_2,
  SPEAKER_ICON_1
];
const speakerPulseState = new WeakMap();
const HISTORY_FILTER_OUTLINE_ICON = `
  <svg class="filter-icon" width="30" height="30" viewBox="0 0 30 30" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25.5625 3.9375C25.1875 3.625 24.6875 3.4375 24.125 3.4375H5.8125C4.625 3.4375 3.625 4.4375 3.625 5.625C3.625 6.125 3.8125 6.625 4.125 7.0625L11.625 15.9375V23.3125C11.625 23.6875 11.8125 24 12.125 24.125L16.875 26.5C17 26.5625 17.125 26.625 17.3125 26.625C17.5 26.625 17.625 26.5625 17.8125 26.5C18.0625 26.3125 18.25 26 18.25 25.6875V15.875L25.75 7C26.125 6.5625 26.3125 6 26.25 5.4375C26.3125 4.875 26.0625 4.3125 25.5625 3.9375ZM24.4375 5.8125L16.6875 14.9375C16.5625 15.125 16.4375 15.3125 16.4375 15.5625V24.125L13.5625 22.6875V15.5625C13.5625 15.3125 13.5 15.125 13.3125 14.9375L5.5625 5.8125C5.5625 5.75 5.5 5.6875 5.5 5.625C5.5 5.4375 5.625 5.3125 5.8125 5.3125H24.125C24.1875 5.3125 24.25 5.3125 24.3125 5.375C24.375 5.4375 24.4375 5.5625 24.4375 5.5625C24.5 5.625 24.5 5.75 24.4375 5.8125Z" fill="currentColor"/>
  </svg>
`.trim();
const HISTORY_FILTER_FILLED_ICON = `
  <svg class="filter-icon" width="30" height="30" viewBox="0 0 30 30" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25.5625 3.9375C25.1875 3.625 24.6875 3.4375 24.125 3.4375H5.8125C4.625 3.4375 3.625 4.4375 3.625 5.625C3.625 6.125 3.8125 6.625 4.125 7.0625L11.625 15.9375V23.3125C11.625 23.6875 11.8125 24 12.125 24.125L16.875 26.5C17 26.5625 17.125 26.625 17.3125 26.625C17.5 26.625 17.625 26.5625 17.8125 26.5C18.0625 26.3125 18.25 26 18.25 25.6875V15.875L25.75 7C26.125 6.5625 26.3125 6 26.25 5.4375C26.3125 4.875 26.0625 4.3125 25.5625 3.9375Z" fill="currentColor"/>
  </svg>
`.trim();

const state = {
  isAuthenticated: false,
  authPending: true,
  authMode: "login",
  currentUser: null,
  mode: "random",
  quiz: null,
  placements: Array(5).fill(""),
  optionOrder: [],
  selectedWord: "",
  evaluationResult: null,
  view: "home",
  homeQuizExpanded: false,
  loading: false,
  loadingPercent: 0,
  loadingTimer: null,
  historyRecords: [],
  flashHistoryRecords: [],
  historySection: "quiz",
  currentHistoryId: "",
  wordColors: {},
  toastTimer: null,
  flashQueue: [],
  flashCurrent: null,
  flashSelectedIndex: -1,
  flashEvaluation: null,
  flashDetailVisible: false,
  flashHintExampleVisible: false,
  flashPast: [],
  flashFuture: [],
  flashLoading: false,
  flashLoadingPercent: 0,
  flashLoadingTimer: null,
  theme: "light",
  flashPreset: "default",
  readingExercise: null,
  readingLoading: false,
  readingLoadingPercent: 0,
  readingLoadingTimer: null,
  readingPast: [],
  readingFuture: [],
  readingPreset: "default",
  readingOpenSentenceIndexes: new Set(),
  readingTitleOpen: false,
  resultDialogPayload: null,
  flashPreload: {
    data: null,
    promise: null,
    token: 0
  },
  apiKeyValidationStatus: "idle",
  apiKeyValidationKey: "",
  quizPast: [],
  quizFuture: [],
  collection: [],
  collectionPendingWords: new Set(),
  collectionWordSet: new Set(),
  historyVisibleCount: 0,
  collectionVisibleCount: 0,
  historyWrongOnly: false,
  historyOpenIds: new Set(),
  wordBooks: [],
  wordBooksLoaded: false,
};

let historyLoadObserver = null;
let collectionLoadObserver = null;
let pronunciationAudio = null;
let wordBooksPromise = null;

const elements = {
  authDialog: document.querySelector("#auth-dialog"),
  themeToggleBtns: Array.from(document.querySelectorAll(".theme-toggle-btn")),
  authLoginTabBtn: document.querySelector("#auth-login-tab-btn"),
  authRegisterTabBtn: document.querySelector("#auth-register-tab-btn"),
  authForm: document.querySelector("#auth-form"),
  authUsernameInput: document.querySelector("#auth-username-input"),
  authPasswordInput: document.querySelector("#auth-password-input"),
  authConfirmInput: document.querySelector("#auth-confirm-input"),
  authSubmitBtn: document.querySelector("#auth-submit-btn"),
  captchaDialog: document.querySelector("#captcha-dialog"),
  captchaTarget: document.querySelector("#captcha-target"),
  captchaShapes: document.querySelector("#captcha-shapes"),
  closeCaptchaDialogBtn: document.querySelector("#close-captcha-dialog-btn"),
  welcomeHintBubble: document.querySelector("#welcome-hint-bubble"),
  welcomeHintCloseBtn: document.querySelector("#welcome-hint-close-btn"),
  homeView: document.querySelector("#home-view"),
  flashView: document.querySelector("#flash-view"),
  readingView: document.querySelector("#reading-view"),
  wordleView: document.querySelector("#wordle-view"),
  quizView: document.querySelector("#quiz-view"),
  historyView: document.querySelector("#history-view"),
  homeModeList: document.querySelector("#home-mode-list"),
  historyEntryBtn: document.querySelector("#history-entry-btn"),
  flashHistoryBtn: document.querySelector("#flash-history-btn"),
  historyBackBtn: document.querySelector("#history-back-btn"),
  historyFilterBtn: document.querySelector("#history-filter-btn"),
  historyList: document.querySelector("#history-list"),
  flashBackHomeBtn: document.querySelector("#flash-back-home-btn"),
  flashPrevBtn: document.querySelector("#flash-prev-btn"),
  flashNextBtn: document.querySelector("#flash-next-btn"),
  flashHintBtn: document.querySelector("#flash-hint-btn"),
  flashLoadingView: document.querySelector("#flash-loading-view"),
  flashLoadingBar: document.querySelector("#flash-loading-bar"),
  flashLoadingPercent: document.querySelector("#flash-loading-percent"),
  flashBoard: document.querySelector("#flash-board"),
  flashWord: document.querySelector("#flash-word"),
  flashPhonetic: document.querySelector("#flash-phonetic"),
  flashHintExample: document.querySelector("#flash-hint-example"),
  flashPrevDivider: document.querySelector("#flash-prev-divider"),
  flashPrevSummary: document.querySelector("#flash-prev-summary"),
  flashDetail: document.querySelector("#flash-detail"),
  flashOptionList: document.querySelector("#flash-option-list"),
  readingBackHomeBtn: document.querySelector("#reading-back-home-btn"),
  readingWordListBtn: document.querySelector("#reading-word-list-btn"),
  readingLoadingView: document.querySelector("#reading-loading-view"),
  readingLoadingBar: document.querySelector("#reading-loading-bar"),
  readingLoadingPercent: document.querySelector("#reading-loading-percent"),
  readingBoard: document.querySelector("#reading-board"),
  readingTitleCard: document.querySelector("#reading-title-card"),
  readingTitle: document.querySelector("#reading-title"),
  readingTitleBody: document.querySelector("#reading-title-body"),
  readingTitleCn: document.querySelector("#reading-title-cn"),
  readingSentenceList: document.querySelector("#reading-sentence-list"),
  readingPrevBtn: document.querySelector("#reading-prev-btn"),
  readingToggleAllBtn: document.querySelector("#reading-toggle-all-btn"),
  readingNextBtn: document.querySelector("#reading-next-btn"),
  wordleBackHomeBtn: document.querySelector("#wordle-back-home-btn"),
  wordleNewGameBtn: document.querySelector("#wordle-new-game-btn"),
  wordleSurrenderBtn: document.querySelector("#wordle-surrender-btn"),
  wordleBoard: document.querySelector("#wordle-board"),
  wordleGrid: document.querySelector("#wordle-grid"),
  wordleKeyboard: document.querySelector("#wordle-keyboard"),
  backHomeBtn: document.querySelector("#back-home-btn"),
  submitBtn: document.querySelector("#submit-btn"),
  nextBtn: document.querySelector("#next-btn"),
  prevBtn: document.querySelector("#prev-btn"),
  toast: document.querySelector("#toast"),
  loadingView: document.querySelector("#loading-view"),
  loadingBar: document.querySelector("#loading-bar"),
  loadingPercent: document.querySelector("#loading-percent"),
  quizBoard: document.querySelector("#quiz-board"),
  quizTitle: document.querySelector("#quiz-title"),
  questionList: document.querySelector("#question-list"),
  optionList: document.querySelector("#option-list"),
  dialog: document.querySelector("#result-dialog"),
  resultDialogTitle: document.querySelector("#result-dialog-title"),
  resultList: document.querySelector("#result-list"),
  closeDialogBtn: document.querySelector("#close-dialog-btn"),
  collectionEntryBtn: document.querySelector("#collection-entry-btn"),
  settingsEntryBtn: document.querySelector("#settings-entry-btn"),
  flashCollectBtn: document.querySelector("#flash-collect-btn"),
  collectionView: document.querySelector("#collection-view"),
  collectionFlashBtn: document.querySelector("#collection-flash-btn"),
  collectionReadingBtn: document.querySelector("#collection-reading-btn"),
  collectionBackBtn: document.querySelector("#collection-back-btn"),
  collectionList: document.querySelector("#collection-list"),
  settingsView: document.querySelector("#settings-view"),
  settingsBackBtn: document.querySelector("#settings-back-btn"),
  settingsUsername: document.querySelector("#settings-username"),
  settingsNickname: document.querySelector("#settings-nickname"),
  settingsNicknameDisplay: document.querySelector("#settings-nickname-display"),
  settingsNicknameEdit: document.querySelector("#settings-nickname-edit"),
  settingsNicknameInput: document.querySelector("#settings-nickname-input"),
  settingsNicknameEditBtn: document.querySelector("#settings-nickname-edit-btn"),
  settingsNicknameSaveBtn: document.querySelector("#settings-nickname-save-btn"),
  settingsNicknameCancelBtn: document.querySelector("#settings-nickname-cancel-btn"),
  settingsPasswordEditBtn: document.querySelector("#settings-password-edit-btn"),
  settingsPasswordDisplay: document.querySelector("#settings-password-display"),
  settingsPasswordEdit: document.querySelector("#settings-password-edit"),
  settingsPasswordOldInput: document.querySelector("#settings-password-old-input"),
  settingsPasswordNewInput: document.querySelector("#settings-password-new-input"),
  settingsPasswordConfirmInput: document.querySelector("#settings-password-confirm-input"),
  settingsPasswordSaveBtn: document.querySelector("#settings-password-save-btn"),
  settingsPasswordCancelBtn: document.querySelector("#settings-password-cancel-btn"),
  settingsBookBtn: document.querySelector("#settings-book-btn"),
  settingsAvatarLetter: document.querySelector("#settings-avatar-letter"),
  settingsAvatarIcon: document.querySelector("#settings-avatar-icon"),
  settingsApiKeyInput: document.querySelector("#settings-api-key-input"),
  settingsApiKeyStatus: document.querySelector("#settings-api-key-status"),
  saveApiKeyBtn: document.querySelector("#save-api-key-btn"),
  clearApiKeyBtn: document.querySelector("#clear-api-key-btn"),
  clearHistoryBtn: document.querySelector("#clear-history-btn"),
  settingsLogoutBtn: document.querySelector("#settings-logout-btn"),
  settingsDeleteAccountBtn: document.querySelector("#settings-delete-account-btn"),
  deleteAccountConfirmDialog: document.querySelector("#delete-account-confirm-dialog"),
  deleteAccountConfirmBtn: document.querySelector("#delete-account-confirm-btn"),
  deleteAccountCancelBtn: document.querySelector("#delete-account-cancel-btn"),
  bookDialog: document.querySelector("#book-dialog"),
  bookDialogList: document.querySelector("#book-dialog-list"),
  closeBookDialogBtn: document.querySelector("#close-book-dialog-btn"),
  siteInfoBtn: document.querySelector("#site-info-btn"),
  siteInfoDialog: document.querySelector("#site-info-dialog"),
  closeSiteInfoDialogBtn: document.querySelector("#close-site-info-dialog-btn"),
  siteInfoMetrics: document.querySelector("#site-info-metrics"),
  siteStatBooks: document.querySelector("#site-stat-books"),
  siteStatWords: document.querySelector("#site-stat-words"),
  siteStatDefs: document.querySelector("#site-stat-defs"),
  siteStatExamplePairs: document.querySelector("#site-stat-example-pairs"),
  siteStatAccents: document.querySelector("#site-stat-accents"),
  siteStatUsers: document.querySelector("#site-stat-users"),
  wordleResultDialog: document.querySelector("#wordle-result-dialog"),
  wordleResultTitle: document.querySelector("#wordle-result-title"),
  wordleResultWord: document.querySelector("#wordle-result-word"),
  wordleResultAccent: document.querySelector("#wordle-result-accent"),
  wordleResultParaphrase: document.querySelector("#wordle-result-paraphrase"),
  wordleResultDefs: document.querySelector("#wordle-result-defs"),
  wordleResultExamples: document.querySelector("#wordle-result-examples"),
  closeWordleResultBtn: document.querySelector("#close-wordle-result-btn"),
  wordleNewGameBtn: document.querySelector("#wordle-new-game-btn"),
  wordleHelpDialog: document.querySelector("#wordle-help-dialog"),
  wordleHelpBtn: document.querySelector("#wordle-help-btn"),
  closeWordleHelpBtn: document.querySelector("#close-wordle-help-btn"),
  wordleBottomActions: document.querySelector("#wordle-bottom-actions"),
  wordleBottomNewGameBtn: document.querySelector("#wordle-bottom-new-game-btn"),
  wordleLeaderboardDialog: document.querySelector("#wordle-leaderboard-dialog"),
  wordleLeaderboardBtn: document.querySelector("#wordle-leaderboard-btn"),
  closeWordleLeaderboardBtn: document.querySelector("#close-wordle-leaderboard-btn"),
  wordleLeaderboardList: document.querySelector("#wordle-leaderboard-list"),
  wordleLeaderboardSelfRank: document.querySelector("#wordle-leaderboard-self-rank"),
  wordleLeaderboardSelfUsername: document.querySelector("#wordle-leaderboard-self-username"),
  wordleLeaderboardSelfCurrentStreak: document.querySelector("#wordle-leaderboard-self-current-streak"),
  wordleLeaderboardSelfBestStreak: document.querySelector("#wordle-leaderboard-self-best-streak"),
  wordleWordPreview: document.querySelector("#wordle-word-preview"),
  wordlePreviewWord: document.querySelector("#wordle-preview-word"),
  wordlePreviewAccent: document.querySelector("#wordle-preview-accent"),
  wordlePreviewParaphrase: document.querySelector("#wordle-preview-paraphrase"),
  wordleSurrenderConfirmDialog: document.querySelector("#wordle-surrender-confirm-dialog"),
  wordleSurrenderCancelBtn: document.querySelector("#wordle-surrender-cancel-btn"),
  wordleSurrenderConfirmBtn: document.querySelector("#wordle-surrender-confirm-btn")
};

function syncToastHost() {
  const host = elements.authDialog?.open
    ? elements.authDialog
    : elements.dialog?.open
      ? elements.dialog
      : document.body;
  if (elements.toast.parentElement !== host) {
    host.appendChild(elements.toast);
  }
  elements.toast.classList.toggle("in-dialog", host !== document.body);
}

function showToast(message, type = "", duration = 2200) {
  if (state.toastTimer) {
    window.clearTimeout(state.toastTimer);
  }

  syncToastHost();
  elements.toast.textContent = message;
  elements.toast.className = `toast is-visible${type ? ` ${type}` : ""}`;
  if (elements.dialog?.open || elements.authDialog?.open) {
    elements.toast.classList.add("in-dialog");
  }

  if (duration <= 0) {
    return;
  }

  state.toastTimer = window.setTimeout(() => {
    elements.toast.className = "toast";
  }, duration);
}

function buildPronunciationUrl(word) {
  return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(String(word || "").trim())}&type=2`;
}

function getSpeechSynthesis() {
  return typeof window !== "undefined" ? window.speechSynthesis : null;
}

function isTtsAvailable() {
  return Boolean(getSpeechSynthesis()) && typeof window.SpeechSynthesisUtterance === "function";
}

function normalizeLang(value) {
  return String(value || "").trim().toLowerCase();
}

function resolvePreferredVoice() {
  const synth = getSpeechSynthesis();
  if (!synth) {
    return null;
  }

  const voices = typeof synth.getVoices === "function" ? synth.getVoices() : [];
  if (!voices.length) {
    return null;
  }

  const targetName = String(TTS_CONFIG.voiceName || "").trim();
  if (targetName) {
    const byName = voices.find((voice) => String(voice?.name || "").trim() === targetName);
    if (byName) {
      return byName;
    }
  }

  const targetLang = normalizeLang(TTS_CONFIG.lang);
  if (targetLang) {
    const byLang = voices.find((voice) => normalizeLang(voice?.lang) === targetLang);
    if (byLang) {
      return byLang;
    }
    const byPrefix = voices.find((voice) => normalizeLang(voice?.lang).startsWith(targetLang.split("-")[0] || ""));
    if (byPrefix) {
      return byPrefix;
    }
  }

  return voices.find((voice) => voice?.default) || voices[0] || null;
}

let ttsPlayToken = 0;
let activeTtsButton = null;
let youdaoPlayToken = 0;

function speakEnglishText(text, sourceButton, options = {}) {
  const silent = Boolean(options?.silent);
  if (!TTS_CONFIG.enabled) {
    return;
  }
  if (!isTtsAvailable()) {
    if (!silent) {
      showToast("当前浏览器不支持 TTS", "error");
    }
    return;
  }

  const normalized = String(text || "").trim();
  if (!normalized) {
    return;
  }

  const synth = getSpeechSynthesis();
  if (!synth) {
    if (!silent) {
      showToast("当前浏览器不支持 TTS", "error");
    }
    return;
  }

  try {
    ttsPlayToken += 1;
    const token = ttsPlayToken;
    if (activeTtsButton) {
      stopPronounceButtonPulse(activeTtsButton);
    }
    activeTtsButton = sourceButton || null;
    if (typeof synth.cancel === "function") {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(normalized);
    utterance.lang = String(TTS_CONFIG.lang || "en-US");
    utterance.rate = Math.min(2, Math.max(0.5, Number(TTS_CONFIG.rate || 1)));
    utterance.pitch = Math.min(2, Math.max(0, Number(TTS_CONFIG.pitch || 1)));
    utterance.volume = Math.min(1, Math.max(0, Number(TTS_CONFIG.volume || 1)));
    const voice = resolvePreferredVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      if (token !== ttsPlayToken) {
        return;
      }
      startPronounceButtonPulse(sourceButton);
    };
    utterance.onend = () => {
      if (token !== ttsPlayToken) {
        return;
      }
      stopPronounceButtonPulse(sourceButton);
      if (activeTtsButton === sourceButton) {
        activeTtsButton = null;
      }
    };
    utterance.onerror = (event) => {
      if (token !== ttsPlayToken) {
        return;
      }
      const errorCode = String(event?.error || "").trim().toLowerCase();
      if (errorCode === "interrupted" || errorCode === "canceled" || errorCode === "cancelled") {
        stopPronounceButtonPulse(sourceButton);
        if (activeTtsButton === sourceButton) {
          activeTtsButton = null;
        }
        return;
      }
      stopPronounceButtonPulse(sourceButton);
      if (activeTtsButton === sourceButton) {
        activeTtsButton = null;
      }
      if (!silent) {
        showToast("TTS 播放失败", "error");
      }
    };

    synth.speak(utterance);
  } catch {
    if (!silent) {
      showToast("TTS 播放失败", "error");
    }
  }
}

function startPronounceButtonPulse(button, durationMs = 0) {
  if (!button?.classList?.contains("pronounce-btn")) {
    return;
  }

  const previous = speakerPulseState.get(button);
  if (previous) {
    window.clearInterval(previous.intervalId);
    if (previous.timeoutId) {
      window.clearTimeout(previous.timeoutId);
    }
  }

  const baseHtml = PRONOUNCE_ICON;
  let frameIndex = 0;
  button.innerHTML = SPEAKER_PULSE_FRAMES[frameIndex] || baseHtml;

  const intervalId = window.setInterval(() => {
    frameIndex = (frameIndex + 1) % SPEAKER_PULSE_FRAMES.length;
    button.innerHTML = SPEAKER_PULSE_FRAMES[frameIndex] || baseHtml;
  }, 160);

  const timeoutId = typeof durationMs === "number" && durationMs > 0
    ? window.setTimeout(() => {
        stopPronounceButtonPulse(button);
      }, durationMs)
    : 0;

  speakerPulseState.set(button, { intervalId, timeoutId, baseHtml });
}

function stopPronounceButtonPulse(button) {
  if (!button?.classList?.contains("pronounce-btn")) {
    return;
  }

  const previous = speakerPulseState.get(button);
  if (!previous) {
    button.innerHTML = PRONOUNCE_ICON;
    return;
  }

  window.clearInterval(previous.intervalId);
  if (previous.timeoutId) {
    window.clearTimeout(previous.timeoutId);
  }
  button.innerHTML = previous.baseHtml || PRONOUNCE_ICON;
  speakerPulseState.delete(button);
}

function pulsePronounceButton(button) {
  startPronounceButtonPulse(button, 960);
}

function playWordPronunciation(word, sourceButton = null) {
  const normalizedWord = String(word || "").trim();
  if (!normalizedWord) {
    return;
  }

  try {
    if (!pronunciationAudio) {
      pronunciationAudio = new Audio();
    }
    youdaoPlayToken += 1;
    const token = youdaoPlayToken;
    let finished = false;

    const cleanup = () => {
      if (finished) {
        return;
      }
      finished = true;
      pronunciationAudio.removeEventListener("error", onError);
      pronunciationAudio.removeEventListener("ended", onEnded);
      pronunciationAudio.removeEventListener("pause", onPause);
    };

    const onEnded = () => {
      if (token !== youdaoPlayToken) {
        return;
      }
      cleanup();
    };

    const onPause = () => {
      if (token !== youdaoPlayToken) {
        return;
      }
      cleanup();
    };

    const onError = () => {
      if (token !== youdaoPlayToken) {
        return;
      }
      cleanup();
      speakEnglishText(normalizedWord, sourceButton, { silent: true });
    };

    pronunciationAudio.addEventListener("error", onError);
    pronunciationAudio.addEventListener("ended", onEnded);
    pronunciationAudio.addEventListener("pause", onPause);

    pronunciationAudio.pause();
    pronunciationAudio.volume = 1;
    pronunciationAudio.src = buildPronunciationUrl(normalizedWord);
    pronunciationAudio.currentTime = 0;
    const playPromise = pronunciationAudio.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => {
          pulsePronounceButton(sourceButton);
        })
        .catch(() => {
          if (token !== youdaoPlayToken) {
            return;
          }
          cleanup();
          speakEnglishText(normalizedWord, sourceButton, { silent: true });
        });
      return;
    }
    pulsePronounceButton(sourceButton);
  } catch {
    speakEnglishText(normalizedWord, sourceButton, { silent: true });
  }
}

const CAPTCHA_SHAPES = [
  { type: "circle", name: "圆形" },
  { type: "square", name: "方形" },
  { type: "triangle", name: "三角形" },
  { type: "diamond", name: "菱形" }
];

let captchaState = {
  targetShape: null,
  shapes: [],
  callback: null,
  isOpen: false
};

function generateRandomPosition(existingPositions, shapeSize, containerWidth, containerHeight, extraMargin = 0) {
  let attempts = 0;
  const maxAttempts = 100;
  const margin = Math.max(15, 20 + extraMargin);
  
  const availableWidth = Math.max(shapeSize + 20, containerWidth - margin * 2);
  const availableHeight = Math.max(shapeSize + 20, containerHeight - margin * 2);
  
  while (attempts < maxAttempts) {
    const x = Math.random() * (availableWidth - shapeSize) + margin;
    const y = Math.random() * (availableHeight - shapeSize) + margin;
    
    let overlaps = false;
    for (const pos of existingPositions) {
      const dx = Math.abs(x - pos.x);
      const dy = Math.abs(y - pos.y);
      if (dx < shapeSize + 15 && dy < shapeSize + 15) {
        overlaps = true;
        break;
      }
    }
    
    if (!overlaps) {
      return { x, y };
    }
    attempts++;
  }
  
  return { 
    x: Math.random() * (availableWidth - shapeSize) + margin, 
    y: Math.random() * (availableHeight - shapeSize) + margin 
  };
}

function renderCaptcha() {
  if (!elements.captchaShapes) {
    return;
  }
  
  const containerWidth = elements.captchaShapes.offsetWidth || 340;
  const containerHeight = elements.captchaShapes.offsetHeight || 200;
  
  let shapeSize = 50;
  let triangleWidth = 50;
  let triangleHeight = 43;
  
  if (containerWidth < 360) {
    shapeSize = 36;
    triangleWidth = 36;
    triangleHeight = 31;
  } else if (containerWidth < 420) {
    shapeSize = 42;
    triangleWidth = 42;
    triangleHeight = 36;
  }
  
  const diamondExtraSize = shapeSize * 0.5;
  
  const shuffledShapes = [...CAPTCHA_SHAPES].sort(() => Math.random() - 0.5);
  const targetIndex = Math.floor(Math.random() * shuffledShapes.length);
  captchaState.targetShape = shuffledShapes[targetIndex];
  
  if (elements.captchaTarget) {
    elements.captchaTarget.textContent = captchaState.targetShape.name;
  }
  
  const positions = [];
  captchaState.shapes = shuffledShapes.map((shape, index) => {
    const extraMargin = shape.type === "diamond" ? diamondExtraSize : 0;
    const pos = generateRandomPosition(positions, shapeSize, containerWidth, containerHeight, extraMargin);
    positions.push(pos);
    return { ...shape, x: pos.x, y: pos.y };
  });
  
  elements.captchaShapes.innerHTML = captchaState.shapes.map(shape => {
    let shapeHtml = "";
    
    if (shape.type === "circle") {
      shapeHtml = `<div class="captcha-shape captcha-shape-circle" style="left:${shape.x}px;top:${shape.y}px;width:${shapeSize}px;height:${shapeSize}px;background:var(--accent);" data-shape-type="${shape.type}"></div>`;
    } else if (shape.type === "square") {
      shapeHtml = `<div class="captcha-shape captcha-shape-square" style="left:${shape.x}px;top:${shape.y}px;width:${shapeSize}px;height:${shapeSize}px;background:var(--accent);" data-shape-type="${shape.type}"></div>`;
    } else if (shape.type === "triangle") {
      shapeHtml = `<div class="captcha-shape captcha-shape-triangle" style="left:${shape.x}px;top:${shape.y}px;width:0;height:0;border-left:${triangleWidth/2}px solid transparent;border-right:${triangleWidth/2}px solid transparent;border-bottom:${triangleHeight}px solid var(--accent);background:transparent;" data-shape-type="${shape.type}"></div>`;
    } else if (shape.type === "diamond") {
      const diamondSize = shapeSize - Math.max(8, shapeSize * 0.2);
      const diamondOffset = diamondSize / 2;
      shapeHtml = `<div class="captcha-shape captcha-shape-diamond" style="left:${shape.x + diamondOffset}px;top:${shape.y + diamondOffset}px;width:${diamondSize}px;height:${diamondSize}px;background:var(--accent);" data-shape-type="${shape.type}"></div>`;
    }
    
    return shapeHtml;
  }).join("");
}

function openCaptchaDialog(callback) {
  captchaState.callback = callback;
  captchaState.isOpen = true;
  if (elements.captchaDialog) {
    elements.captchaDialog.showModal();
    setTimeout(() => {
      renderCaptcha();
    }, 50);
  }
}

function closeCaptchaDialog() {
  captchaState.isOpen = false;
  if (elements.captchaDialog) {
    elements.captchaDialog.close();
  }
}

function setView(view) {
  state.view = view;
  elements.homeView.classList.toggle("is-hidden", view !== "home");
  elements.flashView.classList.toggle("is-hidden", view !== "flash");
  elements.readingView.classList.toggle("is-hidden", view !== "reading");
  elements.wordleView.classList.toggle("is-hidden", view !== "wordle");
  elements.quizView.classList.toggle("is-hidden", view !== "quiz");
  elements.historyView.classList.toggle("is-hidden", view !== "history");
  elements.collectionView.classList.toggle("is-hidden", view !== "collection");
  elements.settingsView.classList.toggle("is-hidden", view !== "settings");
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function loadThemePreference() {
  try {
    const savedTheme =
      window.localStorage.getItem(THEME_STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
    return savedTheme === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function saveThemePreference(theme) {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
}

function supportsViewTransition() {
  return typeof document.startViewTransition === "function";
}

function setTransitionOriginFromEvent(event) {
  const x = event?.clientX ?? window.innerWidth;
  const y = event?.clientY ?? 0;
  document.documentElement.style.setProperty("--theme-transition-x", `${(x / window.innerWidth) * 100}%`);
  document.documentElement.style.setProperty("--theme-transition-y", `${(y / window.innerHeight) * 100}%`);
}

function renderThemeToggle() {
  if (!elements.themeToggleBtns.length) {
    return;
  }
  const isDark = state.theme === "dark";
  elements.themeToggleBtns.forEach((button) => {
    button.innerHTML = isDark ? SUN_ICON : MOON_ICON;
    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute("aria-label", isDark ? "切换浅色模式" : "切换暗色模式");
    button.setAttribute("title", isDark ? "切换浅色模式" : "切换暗色模式");
    button.classList.toggle("is-active", isDark);
  });
}

function applyTheme(theme) {
  state.theme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = state.theme;
  renderThemeToggle();
}

function toggleTheme() {
  const nextTheme = state.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  saveThemePreference(nextTheme);
}

function toggleThemeWithTransition(event) {
  const nextTheme = state.theme === "dark" ? "light" : "dark";
  setTransitionOriginFromEvent(event);

  if (!supportsViewTransition()) {
    toggleTheme();
    return;
  }

  document.startViewTransition(() => {
    applyTheme(nextTheme);
    saveThemePreference(nextTheme);
  });
}

function getQuizDraftStorageKey() {
  const userId = state.currentUser?.id || "guest";
  return `${QUIZ_DRAFT_STORAGE_PREFIX}-${userId}`;
}

function getLegacyQuizDraftStorageKey() {
  const userId = state.currentUser?.id || "guest";
  return `${LEGACY_QUIZ_DRAFT_STORAGE_PREFIX}-${userId}`;
}

function getPersonalApiKeyStorageKey() {
  const userId = state.currentUser?.id || "guest";
  return `${PERSONAL_API_KEY_STORAGE_PREFIX}-${userId}`;
}

function getReadingCacheStorageKey() {
  const userId = state.currentUser?.id || "guest";
  return `${READING_CACHE_STORAGE_PREFIX}-${userId}`;
}

function getFlashCacheStorageKey() {
  const userId = state.currentUser?.id || "guest";
  return `${FLASH_CACHE_STORAGE_PREFIX}-${userId}`;
}

function getLegacyPersonalApiKeyStorageKey() {
  const userId = state.currentUser?.id || "guest";
  return `${LEGACY_PERSONAL_API_KEY_STORAGE_PREFIX}-${userId}`;
}

function loadLocalPersonalApiKey() {
  if (!state.currentUser?.id) {
    return "";
  }

  try {
    const currentKey = getPersonalApiKeyStorageKey();
    const legacyKey = getLegacyPersonalApiKeyStorageKey();
    const savedApiKey = String(
      window.localStorage.getItem(currentKey) || window.localStorage.getItem(legacyKey) || ""
    ).trim();
    if (savedApiKey && !window.localStorage.getItem(currentKey)) {
      window.localStorage.setItem(currentKey, savedApiKey);
      window.localStorage.removeItem(legacyKey);
    }
    return savedApiKey;
  } catch {
    return "";
  }
}

function saveLocalPersonalApiKey(apiKey) {
  if (!state.currentUser?.id) {
    return;
  }
  window.localStorage.setItem(getPersonalApiKeyStorageKey(), String(apiKey || "").trim());
  window.localStorage.removeItem(getLegacyPersonalApiKeyStorageKey());
}

function clearLocalPersonalApiKey() {
  if (!state.currentUser?.id) {
    return;
  }
  window.localStorage.removeItem(getPersonalApiKeyStorageKey());
  window.localStorage.removeItem(getLegacyPersonalApiKeyStorageKey());
}

function clearLegacyLocalData() {
  try {
    window.localStorage.removeItem(LEGACY_HISTORY_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_FLASH_HISTORY_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_QUIZ_DRAFT_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_USER_STORAGE_KEY);
  } catch {
    // ignore local cleanup failures
  }
}

function renderAuthMode() {
  const isRegister = state.authMode === "register";
  elements.authLoginTabBtn.classList.toggle("is-active", !isRegister);
  elements.authRegisterTabBtn.classList.toggle("is-active", isRegister);
  elements.authLoginTabBtn.setAttribute("aria-pressed", String(!isRegister));
  elements.authRegisterTabBtn.setAttribute("aria-pressed", String(isRegister));
  elements.authConfirmInput.classList.toggle("is-hidden", !isRegister);
  elements.authConfirmInput.toggleAttribute("disabled", !isRegister);
  elements.authSubmitBtn.textContent = isRegister ? "注册" : "登录";
  elements.authPasswordInput.setAttribute("autocomplete", isRegister ? "new-password" : "current-password");
}

function openAuthDialog() {
  if (!elements.authDialog.open) {
    elements.authDialog.showModal();
  }
}

function closeAuthDialog() {
  if (elements.authDialog.open) {
    elements.authDialog.close();
  }
}

function focusAdjacentAuthInput(direction) {
  const authInputs = [
    elements.authUsernameInput,
    elements.authPasswordInput,
    elements.authConfirmInput
  ].filter((input) => input && !input.disabled && !input.classList.contains("is-hidden"));

  const currentIndex = authInputs.indexOf(document.activeElement);
  if (currentIndex < 0) {
    return;
  }

  const nextIndex = currentIndex + direction;
  const nextInput = authInputs[nextIndex];
  if (!nextInput) {
    return;
  }

  nextInput.focus();
  nextInput.select?.();
}

function setApiKeyValidationState(status = "idle", apiKey = "") {
  state.apiKeyValidationStatus = status;
  state.apiKeyValidationKey = String(apiKey || "").trim();
}

function renderApiKeyAvailabilityStatus(apiKey = "") {
  const normalizedApiKey = String(apiKey || "").trim();
  if (!normalizedApiKey) {
    elements.settingsApiKeyStatus.textContent = "";
    elements.settingsApiKeyStatus.className = "settings-status";
    return;
  }

  if (state.apiKeyValidationKey !== normalizedApiKey) {
    elements.settingsApiKeyStatus.textContent = "";
    elements.settingsApiKeyStatus.className = "settings-status";
    return;
  }

  if (state.apiKeyValidationStatus === "available") {
    elements.settingsApiKeyStatus.textContent = "当前可用";
    elements.settingsApiKeyStatus.className = "settings-status is-success";
    return;
  }

  if (state.apiKeyValidationStatus === "unavailable") {
    elements.settingsApiKeyStatus.textContent = "当前不可用";
    elements.settingsApiKeyStatus.className = "settings-status is-error";
    return;
  }

  elements.settingsApiKeyStatus.textContent = "";
  elements.settingsApiKeyStatus.className = "settings-status";
}

async function validatePersonalApiKeyValue(apiKey) {
  const normalizedApiKey = String(apiKey || "").trim();
  if (!normalizedApiKey) {
    return {
      available: false,
      message: "请先输入 API Key"
    };
  }

  return requestJson(
    "/api/user/api-key/validate",
    {
      method: "POST",
      headers: {
        "X-User-Api-Key": normalizedApiKey
      },
      body: JSON.stringify({
        apiKey: normalizedApiKey
      })
    },
    { redirectOnUnauthorized: false }
  );
}

async function refreshStoredPersonalApiKeyStatus(apiKey = loadLocalPersonalApiKey()) {
  const normalizedApiKey = String(apiKey || "").trim();
  if (!normalizedApiKey || !state.isAuthenticated) {
    setApiKeyValidationState();
    renderApiKeyAvailabilityStatus("");
    return;
  }

  if (
    state.apiKeyValidationStatus === "checking" &&
    state.apiKeyValidationKey === normalizedApiKey
  ) {
    return;
  }

  setApiKeyValidationState("checking", normalizedApiKey);
  renderApiKeyAvailabilityStatus(normalizedApiKey);

  try {
    const data = await validatePersonalApiKeyValue(normalizedApiKey);
    if (loadLocalPersonalApiKey() !== normalizedApiKey) {
      return;
    }
    setApiKeyValidationState(data.available ? "available" : "unavailable", normalizedApiKey);
  } catch {
    if (loadLocalPersonalApiKey() !== normalizedApiKey) {
      return;
    }
    setApiKeyValidationState("unavailable", normalizedApiKey);
  }

  renderApiKeyAvailabilityStatus(normalizedApiKey);
}

function getBookName(bookId) {
  const normalizedBookId = Math.max(1, Number(bookId || 0));
  const runtimeBooks = Array.isArray(state.wordBooks) ? state.wordBooks : [];
  const runtimeName = runtimeBooks.find((book) => Number(book?.id) === normalizedBookId)?.name;
  if (runtimeName) {
    return String(runtimeName || "").trim();
  }
  return WORD_BOOKS.find((book) => book.id === normalizedBookId)?.name || "";
}

async function ensureWordBooksLoaded(force = false) {
  if (!state.isAuthenticated) {
    return [];
  }
  if (!force && state.wordBooksLoaded && Array.isArray(state.wordBooks) && state.wordBooks.length) {
    return state.wordBooks;
  }
  if (!force && wordBooksPromise) {
    return wordBooksPromise;
  }

  wordBooksPromise = (async () => {
    try {
      const data = await requestJson("/api/books");
      const books = Array.isArray(data.books) ? data.books : [];
      state.wordBooks = books
        .map((book) => ({
          id: Math.max(1, Number(book?.id || 0)),
          name: String(book?.name || "").trim(),
          wordCount: Math.max(0, Number(book?.wordCount || 0))
        }))
        .filter((book) => book.id && book.name);
      state.wordBooksLoaded = true;
      return state.wordBooks;
    } catch {
      state.wordBooksLoaded = false;
      return [];
    } finally {
      wordBooksPromise = null;
    }
  })();

  return wordBooksPromise;
}

function resolveBookDialogBooks() {
  if (Array.isArray(state.wordBooks) && state.wordBooks.length) {
    return state.wordBooks;
  }
  return WORD_BOOKS.map((book) => ({
    id: book.id,
    name: book.name,
    wordCount: 0
  }));
}

function renderBookDialog() {
  if (!elements.bookDialogList) {
    return;
  }

  const books = resolveBookDialogBooks();
  const currentBookId = Math.max(1, Number(state.currentUser?.bookId || 0));
  elements.bookDialogList.innerHTML = "";

  books.forEach((book, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `book-card book-card-${TONE_KEYS[index % TONE_KEYS.length] || "blue"}`;
    button.dataset.bookId = String(book.id);
    button.classList.toggle("is-active", book.id === currentBookId);

    const nameNode = document.createElement("span");
    nameNode.className = "book-card-name";
    nameNode.textContent = book.name;

    const countNode = document.createElement("span");
    countNode.className = "book-card-count";
    const count = Math.max(0, Number(book.wordCount || 0));
    countNode.textContent = count ? `${count.toLocaleString("zh-CN")} 词` : "";

    button.appendChild(nameNode);
    button.appendChild(countNode);
    elements.bookDialogList.appendChild(button);
  });
}

function openBookDialog() {
  if (!elements.bookDialog) {
    return;
  }
  renderBookDialog();
  if (!elements.bookDialog.open) {
    elements.bookDialog.showModal();
  }
  void ensureWordBooksLoaded().then(() => {
    if (elements.bookDialog?.open) {
      renderBookDialog();
    }
  });
}

function closeBookDialog() {
  if (elements.bookDialog?.open) {
    elements.bookDialog.close();
  }
}

function openSiteInfoDialog() {
  if (!elements.siteInfoDialog || elements.siteInfoDialog.open) {
    return;
  }
  elements.siteInfoDialog.showModal();
  void loadAndRenderSiteStats();
}

function closeSiteInfoDialog() {
  if (elements.siteInfoDialog?.open) {
    elements.siteInfoDialog.close();
  }
}

function formatStatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    return "-";
  }
  return number.toLocaleString("zh-CN");
}

async function loadAndRenderSiteStats() {
  if (!elements.siteInfoDialog?.open) {
    return;
  }
  if (elements.siteInfoMetrics) {
    elements.siteInfoMetrics.classList.add("is-hidden");
  }
  if (elements.siteStatBooks) elements.siteStatBooks.textContent = "";
  if (elements.siteStatWords) elements.siteStatWords.textContent = "";
  if (elements.siteStatDefs) elements.siteStatDefs.textContent = "";
  if (elements.siteStatExamplePairs) elements.siteStatExamplePairs.textContent = "";
  if (elements.siteStatAccents) elements.siteStatAccents.textContent = "";
  if (elements.siteStatUsers) elements.siteStatUsers.textContent = "";
  try {
    const data = await requestJson("/api/stats");
    if (!elements.siteInfoDialog?.open) {
      return;
    }
    if (elements.siteStatBooks) elements.siteStatBooks.textContent = formatStatNumber(data?.words?.bookCount);
    if (elements.siteStatWords) elements.siteStatWords.textContent = formatStatNumber(data?.words?.uniqueWordsInBooks ?? data?.words?.totalWordsInBooks);
    if (elements.siteStatDefs) elements.siteStatDefs.textContent = formatStatNumber(data?.words?.cachedDefinitionCount);
    if (elements.siteStatExamplePairs) elements.siteStatExamplePairs.textContent = formatStatNumber(data?.examples?.examplePairCount ?? data?.examples?.exampleSentenceCount);
    if (elements.siteStatAccents) elements.siteStatAccents.textContent = formatStatNumber(data?.examples?.accentedEntryCount);
    if (elements.siteStatUsers) elements.siteStatUsers.textContent = formatStatNumber(data?.users?.registeredUsers);
    if (elements.siteInfoMetrics) {
      elements.siteInfoMetrics.classList.remove("is-hidden");
    }
  } catch {
    if (!elements.siteInfoDialog?.open) {
      return;
    }
    if (elements.siteInfoMetrics) {
      elements.siteInfoMetrics.classList.add("is-hidden");
    }
  }
}

function clearLocalCachesForBookChange() {
  try {
    window.localStorage.removeItem(getQuizDraftStorageKey());
    window.localStorage.removeItem(getLegacyQuizDraftStorageKey());
    window.localStorage.removeItem(getFlashCacheStorageKey());
    window.localStorage.removeItem(getReadingCacheStorageKey());
  } catch {
    // ignore cleanup failures
  }
}

async function updateUserBook(bookId) {
  const normalizedBookId = Math.max(1, Number(bookId || 0));
  const currentBookId = Math.max(1, Number(state.currentUser?.bookId || 0));
  if (normalizedBookId === currentBookId) {
    return;
  }

  try {
    const data = await requestJson("/api/user/book", {
      method: "POST",
      body: JSON.stringify({ bookId: normalizedBookId })
    });
    state.currentUser = data.user || state.currentUser;
    clearLocalCachesForBookChange();
    state.quiz = null;
    state.quizPast = [];
    state.quizFuture = [];
    state.evaluationResult = null;
    state.currentHistoryId = "";
    state.placements = Array(5).fill("");
    state.optionOrder = [];
    state.selectedWord = "";
    state.flashQueue = [];
    state.flashCurrent = null;
    state.flashPast = [];
    state.flashFuture = [];
    state.readingExercise = null;
    state.readingPast = [];
    state.readingFuture = [];
    state.readingOpenSentenceIndexes = new Set();
    state.readingTitleOpen = false;
    renderSessionUi();
    renderBookDialog();
    showToast("已切换词书", "success");
  } catch (error) {
    showToast(error.message || "切换词书失败", "error");
  }
}

function renderSessionUi() {
  const username = state.currentUser?.username || "";
  const nickname = state.currentUser?.nickname || username;
  elements.settingsUsername.textContent = username || "-";
  elements.settingsNickname.textContent = nickname || "-";
  if (elements.settingsBookBtn) {
    elements.settingsBookBtn.textContent = state.currentUser?.bookId ? getBookName(state.currentUser.bookId) : "选择词书";
  }
  const firstChar = String(nickname || "").trim().slice(0, 1);
  const hasLetter = Boolean(firstChar);
  if (elements.settingsAvatarLetter) {
    elements.settingsAvatarLetter.textContent = hasLetter ? firstChar.toUpperCase() : "";
    elements.settingsAvatarLetter.classList.toggle("is-hidden", !hasLetter);
  }
  if (elements.settingsAvatarIcon) {
    elements.settingsAvatarIcon.classList.toggle("is-hidden", hasLetter);
  }
  if (elements.settingsEntryBtn) {
    elements.settingsEntryBtn.title = username ? `账号设置：${username}` : "账号设置";
  }
  const localPersonalApiKey = loadLocalPersonalApiKey();
  elements.settingsApiKeyInput.value = localPersonalApiKey;
  renderApiKeyAvailabilityStatus(localPersonalApiKey);
  if (localPersonalApiKey && state.isAuthenticated && state.apiKeyValidationKey !== localPersonalApiKey) {
    void refreshStoredPersonalApiKeyStatus(localPersonalApiKey);
  }
  renderHomeModes();
}

function hasAvailableAiCapability() {
  return Boolean(loadLocalPersonalApiKey());
}

function shouldSkipAiLoading() {
  return state.isAuthenticated && !hasAvailableAiCapability();
}

function requireAuthFromHomeEntry() {
  if (state.isAuthenticated) {
    return true;
  }
  openAuthDialog();
  return false;
}

function loadQuizDraftMap() {
  try {
    const currentKey = getQuizDraftStorageKey();
    const legacyKey = getLegacyQuizDraftStorageKey();
    const raw = window.localStorage.getItem(currentKey) || window.localStorage.getItem(legacyKey);
    if (raw && !window.localStorage.getItem(currentKey)) {
      window.localStorage.setItem(currentKey, raw);
      window.localStorage.removeItem(legacyKey);
    }
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveQuizDraftMap(draftMap) {
  window.localStorage.setItem(getQuizDraftStorageKey(), JSON.stringify(draftMap));
  window.localStorage.removeItem(getLegacyQuizDraftStorageKey());
}

function hasHistoryRecord(id) {
  return Boolean(id) && state.historyRecords.some((record) => record.id === id);
}

function getQuizDraft(mode) {
  const normalizedMode = String(mode || "random").trim().toLowerCase() || "random";
  const draftMap = loadQuizDraftMap();
  const draft = draftMap[normalizedMode];
  if (!draft || typeof draft !== "object") {
    return null;
  }
  if (String(draft.mode || "").trim().toLowerCase() !== normalizedMode) {
    return null;
  }
  if (!draft.quiz || !Array.isArray(draft.quiz.items) || draft.quiz.items.length !== 5) {
    return null;
  }
  if (!Array.isArray(draft.placements) || !Array.isArray(draft.optionOrder)) {
    return null;
  }
  return draft;
}

function saveCurrentQuizDraft() {
  if (!state.quiz || state.loading || hasHistoryRecord(state.currentHistoryId)) {
    return;
  }

  const draftMap = loadQuizDraftMap();
  draftMap[state.mode] = {
    mode: state.mode,
    quiz: state.quiz,
    placements: [...state.placements],
    optionOrder: [...state.optionOrder],
    selectedWord: state.selectedWord,
    currentHistoryId: state.currentHistoryId,
    evaluationResult: state.evaluationResult ? cloneSerializable(state.evaluationResult) : null,
    quizPast: cloneSerializable(state.quizPast) || [],
    quizFuture: cloneSerializable(state.quizFuture) || []
  };
  saveQuizDraftMap(draftMap);
}

function clearQuizDraft(mode = state.mode) {
  const draftMap = loadQuizDraftMap();
  if (!(mode in draftMap)) {
    return;
  }
  delete draftMap[mode];
  saveQuizDraftMap(draftMap);
}

function restoreQuizDraft(draft) {
  state.mode = String(draft?.mode || state.mode || "random").trim().toLowerCase() || "random";
  state.loading = false;
  state.loadingPercent = 0;
  state.quiz = draft.quiz;
  state.placements = Array.isArray(draft.placements)
    ? [...draft.placements].slice(0, 5)
    : Array(5).fill("");
  while (state.placements.length < 5) {
    state.placements.push("");
  }
  state.optionOrder = Array.isArray(draft.optionOrder)
    ? [...draft.optionOrder]
    : draft.quiz.items.map((item) => item.word);
  state.selectedWord = draft.selectedWord || "";
  state.evaluationResult = draft.evaluationResult ? cloneSerializable(draft.evaluationResult) : null;
  state.currentHistoryId = draft.currentHistoryId || new Date().toISOString();
  state.quizPast = Array.isArray(draft.quizPast) ? [...draft.quizPast] : [];
  state.quizFuture = Array.isArray(draft.quizFuture) ? [...draft.quizFuture] : [];
  buildWordColorMap(state.optionOrder);
  setView("quiz");
  renderLoadingState();
  renderQuizHeader();
  renderQuestions();
  renderOptions();
  renderSubmitButton();
  renderQuizNavButtons();
  renderHomeModes();
}

function cloneSerializable(value) {
  if (value == null) {
    return value;
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

function loadFlashCacheMap() {
  try {
    const raw = window.localStorage.getItem(getFlashCacheStorageKey());
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveFlashCacheMap(cacheMap) {
  try {
    window.localStorage.setItem(getFlashCacheStorageKey(), JSON.stringify(cacheMap));
  } catch {
    // ignore local cache failures
  }
}

function getWordleCacheStorageKey() {
  return "wordle-game-cache";
}

function loadWordleCache() {
  try {
    const raw = window.localStorage.getItem(getWordleCacheStorageKey());
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveWordleCache(snapshot) {
  try {
    if (snapshot) {
      window.localStorage.setItem(getWordleCacheStorageKey(), JSON.stringify(snapshot));
    } else {
      window.localStorage.removeItem(getWordleCacheStorageKey());
    }
  } catch {
    // ignore local cache failures
  }
}

function clearWordleCache() {
  saveWordleCache(null);
}

function createWordleSnapshot() {
  return {
    targetWord: wordleState.targetWord,
    guesses: cloneSerializable(wordleState.guesses) || [],
    currentGuess: wordleState.currentGuess,
    gameOver: wordleState.gameOver,
    keyStates: cloneSerializable(wordleState.keyStates) || {},
    resultDialogClosed: wordleState.resultDialogClosed
  };
}

function hasIncompleteWordleGame() {
  const cache = loadWordleCache();
  return cache && !cache.gameOver;
}

function restoreWordleGame(snapshot) {
  wordleState.targetWord = snapshot.targetWord || "";
  wordleState.guesses = Array.isArray(snapshot.guesses) ? [...snapshot.guesses] : [];
  wordleState.currentGuess = snapshot.currentGuess || "";
  wordleState.gameOver = Boolean(snapshot.gameOver);
  wordleState.keyStates = {};
  wordleState.resultDialogClosed = Boolean(snapshot.resultDialogClosed);
  
  for (const guess of wordleState.guesses) {
    updateKeyStates(guess);
  }

  setView("wordle");
  renderWordleGame();
}

function createFlashSessionSnapshot() {
  return {
    preset: state.flashPreset,
    current: createFlashSnapshot(),
    queue: cloneSerializable(state.flashQueue) || []
  };
}

function getFlashCache(preset = state.flashPreset) {
  const normalizedPreset = String(preset || "default").trim().toLowerCase() || "default";
  const cacheMap = loadFlashCacheMap();
  const snapshot = cacheMap[normalizedPreset];
  if (!snapshot || typeof snapshot !== "object" || !snapshot.current?.question?.word) {
    return null;
  }
  return snapshot;
}

function saveCurrentFlashCache(snapshot = null) {
  const cacheMap = loadFlashCacheMap();
  const nextSnapshot = snapshot || createFlashSessionSnapshot();
  const normalizedPreset = String(nextSnapshot?.preset || state.flashPreset || "default").trim().toLowerCase() || "default";

  if (!nextSnapshot?.current?.question?.word) {
    delete cacheMap[normalizedPreset];
    saveFlashCacheMap(cacheMap);
    return;
  }

  cacheMap[normalizedPreset] = nextSnapshot;
  saveFlashCacheMap(cacheMap);
}

function clearFlashCache(preset = state.flashPreset) {
  const normalizedPreset = String(preset || "default").trim().toLowerCase() || "default";
  const cacheMap = loadFlashCacheMap();
  if (!(normalizedPreset in cacheMap)) {
    return;
  }
  delete cacheMap[normalizedPreset];
  saveFlashCacheMap(cacheMap);
}

function getReadingCache() {
  try {
    const raw = window.localStorage.getItem(getReadingCacheStorageKey());
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    if (!parsed.exercise || !Array.isArray(parsed.exercise.sentences) || !parsed.exercise.sentences.length) {
      return null;
    }
    if (parsed.preset && typeof parsed.preset !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveReadingCache(snapshot = null) {
  try {
    const nextSnapshot = snapshot || createReadingSnapshot();
    if (!nextSnapshot?.exercise) {
      return;
    }
    window.localStorage.setItem(getReadingCacheStorageKey(), JSON.stringify(nextSnapshot));
  } catch {
    // ignore local cache failures
  }
}

function clearReadingCache() {
  try {
    window.localStorage.removeItem(getReadingCacheStorageKey());
  } catch {
    // ignore local cache failures
  }
}

function getPreloadEntry(mode) {
  if (!preloadQuizStore[mode]) {
    preloadQuizStore[mode] = {
      data: null,
      promise: null
    };
  }
  return preloadQuizStore[mode];
}

function resetQuizStateForLock() {
  if (elements.dialog.open) {
    elements.dialog.close();
  }

  state.loading = false;
  state.loadingPercent = 0;
  state.mode = "random";
  state.quiz = null;
  state.placements = Array(5).fill("");
  state.optionOrder = [];
  state.selectedWord = "";
  state.evaluationResult = null;
  state.currentHistoryId = "";

  if (state.loadingTimer) {
    window.clearInterval(state.loadingTimer);
    state.loadingTimer = null;
  }

  renderLoadingState();
  renderSubmitButton();
}

function handleUnauthorized(message = "登录状态已失效，请重新登录。", options = {}) {
  const { openDialog = true, toastType = "error" } = options;
  state.isAuthenticated = false;
  state.currentUser = null;
  state.historyRecords = [];
  state.flashHistoryRecords = [];
  state.collection = [];
  syncCollectionWordSet();
  resetQuizStateForLock();
  setView("home");
  if (openDialog) {
    openAuthDialog();
  } else {
    closeAuthDialog();
  }
  renderAccountFeatures();
  renderSessionUi();
  showToast(message, toastType, 2600);
}

async function requestJson(url, options = {}, config = {}) {
  const { redirectOnUnauthorized = true } = config;
  const requestOptions = { ...options };
  const headers = new Headers(requestOptions.headers || {});
  const personalApiKey = loadLocalPersonalApiKey();

  if (requestOptions.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (personalApiKey && !headers.has("X-User-Api-Key")) {
    headers.set("X-User-Api-Key", personalApiKey);
  }

  requestOptions.headers = headers;

  const response = await fetch(url, requestOptions);
  const rawText = await response.text();
  let data = {};

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { message: rawText };
    }
  }

  if (response.status === 401 && redirectOnUnauthorized) {
    handleUnauthorized(data.message || "登录状态已失效，请重新登录。");
    throw new Error(data.message || "登录状态已失效");
  }

  if (!response.ok) {
    throw new Error(data.message || "请求失败");
  }

  return data;
}

function setAuthMode(mode) {
  state.authMode = mode === "register" ? "register" : "login";
  renderAuthMode();
}

async function checkAuthStatus() {
  state.authPending = true;

  try {
    const data = await requestJson("/api/auth/me", {}, { redirectOnUnauthorized: false });
    state.isAuthenticated = Boolean(data.authenticated);
    state.currentUser = data.user || null;
  } catch {
    state.isAuthenticated = false;
    state.currentUser = null;
  } finally {
    state.authPending = false;
    if (state.isAuthenticated) {
      await loadUserDataFromBackend();
      closeAuthDialog();
      setView("home");
    } else {
      setView("home");
    }
    renderAccountFeatures();
    renderSessionUi();
  }
}

async function logout() {
  if (!state.isAuthenticated) {
    openAuthDialog();
    return;
  }

  try {
    await requestJson(
      "/api/auth/logout",
      {
        method: "POST"
      },
      { redirectOnUnauthorized: false }
    );
  } catch {
    // Ignore logout transport errors and force the UI back to auth mode.
  }

  state.currentUser = null;
  state.isAuthenticated = false;
  handleUnauthorized("已退出登录", { openDialog: false, toastType: "success" });
}

async function deleteAccount() {
  if (!state.isAuthenticated) {
    return;
  }

  const dialog = elements.deleteAccountConfirmDialog;
  const confirmBtn = elements.deleteAccountConfirmBtn;
  const cancelBtn = elements.deleteAccountCancelBtn;

  let resolvePromise;
  const confirmPromise = new Promise((resolve) => {
    resolvePromise = resolve;
  });

  const handleConfirm = () => {
    dialog.close();
    confirmBtn.removeEventListener("click", handleConfirm);
    cancelBtn.removeEventListener("click", handleCancel);
    resolvePromise(true);
  };

  const handleCancel = () => {
    dialog.close();
    confirmBtn.removeEventListener("click", handleConfirm);
    cancelBtn.removeEventListener("click", handleCancel);
    resolvePromise(false);
  };

  confirmBtn.addEventListener("click", handleConfirm);
  cancelBtn.addEventListener("click", handleCancel);

  dialog.showModal();

  const confirmed = await confirmPromise;

  if (!confirmed) {
    return;
  }

  try {
    await requestJson(
      "/api/auth/delete",
      {
        method: "DELETE",
        body: JSON.stringify({})
      },
      { redirectOnUnauthorized: false }
    );

    state.currentUser = null;
    state.isAuthenticated = false;
    showToast("账号已注销", "success");
    setView("home");
    renderAccountFeatures();
    renderSessionUi();
  } catch (error) {
    showToast(error.message || "注销失败", "error");
  }
}

async function submitAuthForm() {
  const username = elements.authUsernameInput.value.trim();
  const password = elements.authPasswordInput.value;
  const confirmPassword = elements.authConfirmInput.value;

  if (state.authMode === "register") {
    openCaptchaDialog(async (captchaPassed) => {
      if (captchaPassed) {
        await doSubmitAuth(username, password, confirmPassword);
      }
    });
  } else {
    await doSubmitAuth(username, password, confirmPassword);
  }
}

let welcomeHintBubbleTimer = null;

function showWelcomeHintBubble() {
  if (welcomeHintBubbleTimer) {
    clearTimeout(welcomeHintBubbleTimer);
  }
  elements.welcomeHintBubble.classList.remove("is-hidden");
  
  welcomeHintBubbleTimer = setTimeout(() => {
    hideWelcomeHintBubble();
  }, 8000);
}

function hideWelcomeHintBubble() {
  if (welcomeHintBubbleTimer) {
    clearTimeout(welcomeHintBubbleTimer);
    welcomeHintBubbleTimer = null;
  }
  elements.welcomeHintBubble.classList.add("is-hidden");
}

async function doSubmitAuth(username, password, confirmPassword) {
  try {
    const originalAuthMode = state.authMode;
    const data = await requestJson(
      originalAuthMode === "register" ? "/api/auth/register" : "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
          confirmPassword
        })
      },
      { redirectOnUnauthorized: false }
    );
    state.currentUser = data.user || null;
    state.isAuthenticated = Boolean(state.currentUser);
    elements.authForm.reset();
    const nextModeMessage = originalAuthMode === "register" ? "注册成功" : "登录成功";
    setAuthMode("login");
    await loadUserDataFromBackend();
    closeAuthDialog();
    renderAccountFeatures();
    renderSessionUi();
    setView("home");
    showToast(nextModeMessage, "success");
    
    if (originalAuthMode === "register") {
      setTimeout(() => {
        showWelcomeHintBubble();
      }, 300);
    }
  } catch (error) {
    showToast(error.message || "登录失败", "error");
  }
}

async function savePersonalApiKey() {
  const apiKey = elements.settingsApiKeyInput.value.trim();
  if (!apiKey) {
    showToast("请先输入 API Key", "error");
    return;
  }

  setApiKeyValidationState("checking", apiKey);
  renderApiKeyAvailabilityStatus(apiKey);

  try {
    const data = await validatePersonalApiKeyValue(apiKey);
    if (!data.available) {
      setApiKeyValidationState("unavailable", apiKey);
      renderApiKeyAvailabilityStatus(apiKey);
      showToast(data.message || "API Key 不可用", "error");
      return;
    }

    saveLocalPersonalApiKey(apiKey);
    setApiKeyValidationState("available", apiKey);
    renderSessionUi();
    showToast("个人 API Key 已保存，当前可用", "success");
  } catch (error) {
    setApiKeyValidationState("unavailable", apiKey);
    renderApiKeyAvailabilityStatus(apiKey);
    showToast(error.message || "API Key 校验失败", "error");
  }
}

async function clearPersonalApiKey() {
  clearLocalPersonalApiKey();
  setApiKeyValidationState();
  renderSessionUi();
  showToast("当前设备的个人 API Key 已清空", "success");
}

async function clearUserHistory() {
  if (!state.isAuthenticated) {
    openAuthDialog();
    return;
  }

  const confirmed = window.confirm("确定清空全部刷题记录吗？这会删除匹配历史和闪卡刷词历史，但不会影响收藏夹。");
  if (!confirmed) {
    return;
  }

  try {
    await requestJson(
      "/api/history",
      {
        method: "DELETE"
      },
      { redirectOnUnauthorized: false }
    );

    state.historyRecords = [];
    state.flashHistoryRecords = [];
    state.historyOpenIds = new Set();
    resetHistoryVisibleCount();
    renderHistory();
    showToast("刷题记录已清空", "success");
  } catch (error) {
    showToast(error.message || "清空刷题记录失败", "error");
  }
}

async function requestQuizData(mode) {
  return requestJson(`/api/${mode}`);
}

function warmNextQuiz(mode) {
  const entry = getPreloadEntry(mode);
  if (entry.data || entry.promise) {
    return;
  }

  const preloadPromise = requestQuizData(mode)
    .then((data) => {
      entry.data = data;
      return data;
    })
    .catch(() => null)
    .finally(() => {
      if (entry.promise === preloadPromise) {
        entry.promise = null;
      }
    });

  entry.promise = preloadPromise;
}

async function resolveQuizData(mode) {
  const entry = getPreloadEntry(mode);

  if (entry.data) {
    const data = entry.data;
    entry.data = null;
    return data;
  }

  if (entry.promise) {
    try {
      const data = await entry.promise;
      if (entry.data === data) {
        entry.data = null;
      }
      if (data) {
        return data;
      }
    } catch {
      // Fall back to a direct request if the background preload fails.
    }
  }

  return requestQuizData(mode);
}

function formatHistoryTime(value) {
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function escapeHtmlAttribute(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightExampleWord(text, word) {
  const source = String(text || "");
  const keyword = String(word || "").trim();

  if (!source || !keyword) {
    return escapeHtml(source);
  }

  const pattern = new RegExp(`(^|[^A-Za-z])(${escapeRegExp(keyword)})(?=[^A-Za-z]|$)`, "gi");
  let result = "";
  let lastIndex = 0;
  let match = pattern.exec(source);

  while (match) {
    const prefix = match[1] || "";
    const matchedWord = match[2] || "";
    const matchStart = match.index + prefix.length;
    const matchEnd = matchStart + matchedWord.length;

    result += escapeHtml(source.slice(lastIndex, match.index));
    result += escapeHtml(prefix);
    result += `<strong class="example-hit">${escapeHtml(matchedWord)}</strong>`;

    lastIndex = matchEnd;
    match = pattern.exec(source);
  }

  if (!result) {
    return escapeHtml(source);
  }

  result += escapeHtml(source.slice(lastIndex));
  return result;
}

function highlightReadingWords(text, words = []) {
  const source = sanitizeReadingEnglishText(text);
  const normalizedWords = [...new Set(
    (Array.isArray(words) ? words : [words])
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .sort((left, right) => right.length - left.length)
  )];

  if (!source || !normalizedWords.length) {
    return escapeHtml(source);
  }

  const pattern = new RegExp(`(^|[^A-Za-z])(${normalizedWords.map(escapeRegExp).join("|")})(?=[^A-Za-z]|$)`, "gi");
  let result = "";
  let lastIndex = 0;
  let match = pattern.exec(source);

  while (match) {
    const prefix = match[1] || "";
    const matchedWord = match[2] || "";
    const matchStart = match.index + prefix.length;
    const matchEnd = matchStart + matchedWord.length;

    result += escapeHtml(source.slice(lastIndex, match.index));
    result += escapeHtml(prefix);
    result += `<strong class="reading-hit">${escapeHtml(matchedWord)}</strong>`;

    lastIndex = matchEnd;
    match = pattern.exec(source);
  }

  if (!result) {
    return escapeHtml(source);
  }

  result += escapeHtml(source.slice(lastIndex));
  return result;
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

function highlightReadingChinese(text) {
  const source = sanitizeReadingChineseText(text);
  if (!source) {
    return "";
  }

  return escapeHtml(source).replace(/【([^【】]+)】/g, '<strong class="reading-hit-cn">$1</strong>');
}

function renderHistory() {
  elements.historyList.innerHTML = "";
  disconnectHistoryLoadObserver();
  renderHistoryFilterButton();
  renderHistorySwitchButton();
  const visibleRecords = getFilteredHistoryRecords();

  if (state.historySection === "flash") {
    if (!visibleRecords.length) {
      const empty = document.createElement("div");
      empty.className = "history-empty";
      empty.innerHTML = state.historyWrongOnly
        ? "<p>当前没有答错的闪卡刷词记录。</p><p>关闭筛选后可查看全部历史。</p>"
        : "<p>还没有闪卡刷词历史。</p><p>先去刷几个单词吧。</p>";
      elements.historyList.appendChild(empty);
      return;
    }

    if (!state.historyVisibleCount) {
      resetHistoryVisibleCount();
    }
    state.historyVisibleCount = Math.min(state.historyVisibleCount, visibleRecords.length);

    visibleRecords.slice(0, state.historyVisibleCount).forEach((record) => {
      const itemNode = document.createElement("div");
      itemNode.className = "flash-history-item";
      itemNode.dataset.lang = "en";
      itemNode.dataset.wordEn = record.word || "";
      itemNode.dataset.wordCn = record.wordCn || "";
      itemNode.setAttribute("role", "button");
      itemNode.setAttribute("tabindex", "0");
      const dotClass = record.isCorrect ? "flash-history-dot is-correct" : "flash-history-dot is-wrong";
      itemNode.innerHTML = `
        <span class="flash-history-main">
          <span class="${dotClass}"></span>
          <span class="flash-history-word">${escapeHtml(record.word)}</span>
        </span>
        <span class="flash-history-side">
          <span class="flash-history-time">${formatHistoryTime(record.createdAt)}</span>
          ${createInlinePronounceButton(record.word, "flash-history-pronounce-btn")}
          ${createInlineCollectButton(record.word, record.wordCn, "flash-history-collect-btn")}
        </span>
      `;
      elements.historyList.appendChild(itemNode);
    });

    appendListLoadSentinel({
      container: elements.historyList,
      loadedCount: state.historyVisibleCount,
      totalCount: visibleRecords.length,
      emptyText: "继续加载闪卡刷词历史",
      onVisible: loadMoreHistoryItems,
      observerType: "history"
    });
    return;
  }

  if (!visibleRecords.length) {
    const empty = document.createElement("div");
    empty.className = "history-empty";
    empty.innerHTML = state.historyWrongOnly
      ? "<p>当前没有做错的普通刷题记录。</p><p>关闭筛选后可查看全部历史。</p>"
      : state.flashHistoryRecords.length
        ? "<p>当前没有匹配模式历史。</p><p>如果你刚刷的是闪卡刷词，点右上角切换查看。</p>"
        : "<p>还没有刷题记录。</p><p>先去做几道题吧。</p>";
    elements.historyList.appendChild(empty);
    return;
  }

  if (!state.historyVisibleCount) {
    resetHistoryVisibleCount();
  }
  state.historyVisibleCount = Math.min(state.historyVisibleCount, visibleRecords.length);

  visibleRecords.slice(0, state.historyVisibleCount).forEach((record) => {
    const card = document.createElement("details");
    card.className = "history-item";
    card.dataset.historyId = String(record.id || "");
    if (record.completed && state.historyOpenIds.has(String(record.id || ""))) {
      card.open = true;
    }
    const correctCount = Array.isArray(record.result)
      ? record.result.filter(Boolean).length
      : 0;
    const summaryWordsHtml = Array.isArray(record.items)
      ? record.items
          .map((item, index) => {
            const isCorrect = Boolean(record.result?.[index]);
            const answer = record.placements?.[index] || item.word;
            return `<span class="history-word-chip ${isCorrect ? "is-correct" : "is-wrong"}">${answer}</span>`;
          })
          .join("")
      : "";
    const questionHtml = Array.isArray(record.items)
      ? record.items
          .map((item, index) => {
            const defHtml = `
              <p class="history-def">
                <button
                  type="button"
                  class="history-def-tts-btn pronounce-btn"
                  data-tts-text="${escapeHtmlAttribute(item.defEn)}"
                  aria-label="朗读释义"
                  title="朗读"
                >
                  ${PRONOUNCE_ICON}
                </button>
                ${index + 1}. ${item.defEn}
              </p>
            `;
            
            return `
              <div class="history-question-card">
                <div
                  class="history-question"
                  data-lang="en"
                  data-index="${index + 1}"
                  data-def-en="${escapeHtmlAttribute(item.defEn)}"
                  data-def-cn="${escapeHtmlAttribute(item.defCn)}"
                  data-answer-en="${escapeHtmlAttribute(item.word)}"
                  data-answer-cn="${escapeHtmlAttribute(item.wordCn)}"
                  data-word-en="${escapeHtmlAttribute(item.word)}"
                  data-word-cn="${escapeHtmlAttribute(item.wordCn)}"
                >
                  ${defHtml}
                  <p class="history-answer">${item.word}</p>
                </div>
                <span class="history-question-side">
                  ${createInlinePronounceButton(item.word, "history-pronounce-btn")}
                  ${createInlineCollectButton(item.word, item.wordCn, "history-collect-btn")}
                </span>
              </div>
            `;
          })
          .join("")
      : "";

    card.innerHTML = `
      <summary class="history-summary-row">
        <div class="history-summary-top">
          <div class="history-summary-meta">
            <span class="history-mode">${MODE_LABELS[record.mode] || "未知模式"}</span>
            <span class="history-time">${formatHistoryTime(record.createdAt)}</span>
          </div>
          <div class="history-summary-side">
            <strong class="history-summary-score">${correctCount} / 5</strong>
            <span class="history-status">${record.completed ? "展开" : "未完成"}</span>
          </div>
        </div>
        <div class="history-word-row">${summaryWordsHtml}</div>
      </summary>
      <div class="history-detail">
        <div class="history-questions">${questionHtml}</div>
      </div>
    `;
    card.addEventListener("toggle", () => {
      const historyId = String(record.id || "");
      if (historyId) {
        if (card.open) {
          state.historyOpenIds.add(historyId);
        } else {
          state.historyOpenIds.delete(historyId);
        }
      }
      const status = card.querySelector(".history-status");
      if (!status || !record.completed) {
        return;
      }
      status.textContent = card.open ? "收起" : "展开";
    });
    elements.historyList.appendChild(card);
  });

  appendListLoadSentinel({
    container: elements.historyList,
    loadedCount: state.historyVisibleCount,
    totalCount: visibleRecords.length,
    emptyText: "继续加载刷题记录",
    onVisible: loadMoreHistoryItems,
    observerType: "history"
  });
}

function appendFlashHistoryRecord() {
  if (!state.flashCurrent) {
    return;
  }

  const record = {
    id: `${state.flashCurrent.word}-${Date.now()}`,
    word: state.flashCurrent.word,
    wordCn: state.flashCurrent.wordCn,
    isCorrect: state.flashEvaluation?.isCorrect ?? false,
    createdAt: new Date().toISOString()
  };
  state.flashHistoryRecords.unshift(record);
  state.flashHistoryRecords = state.flashHistoryRecords.slice(0, HISTORY_RECORD_LIMIT);
  requestJson("/api/history/flash", {
    method: "POST",
    body: JSON.stringify(record)
  }).catch(() => {
    // Keep the in-memory history if sync fails temporarily.
  });

  if (state.view === "history" && state.historySection === "flash") {
    renderHistory();
  }
}

function upsertHistoryRecord() {
  if (!state.quiz || !state.currentHistoryId) {
    return;
  }

  const record = {
    id: state.currentHistoryId,
    mode: state.mode,
    createdAt: state.currentHistoryId,
    completed: true,
    placements: [...state.placements],
    result: Array.isArray(state.evaluationResult) ? [...state.evaluationResult] : [],
    items: state.quiz.items.map((item) => ({
      word: item.word,
      wordCn: item.wordCn,
      defEn: item.defEn,
      defCn: item.defCn
    }))
  };

  const index = state.historyRecords.findIndex((item) => item.id === record.id);
  if (index >= 0) {
    state.historyRecords[index] = record;
  } else {
    state.historyRecords.unshift(record);
    state.historyRecords = state.historyRecords.slice(0, HISTORY_RECORD_LIMIT);
  }

  requestJson("/api/history/quiz", {
    method: "POST",
    body: JSON.stringify(record)
  }).catch(() => {
    // Keep the in-memory history if sync fails temporarily.
  });
  if (state.view === "history") {
    renderHistory();
  }
}

function normalizeCollectionWord(value) {
  return String(value || "").trim();
}

function syncCollectionWordSet() {
  state.collectionWordSet = new Set(
    state.collection
      .map((item) => normalizeCollectionWord(item.word))
      .filter(Boolean)
  );
}

function hasCollectedWord(word) {
  const normalizedWord = normalizeCollectionWord(word);
  if (!normalizedWord) {
    return false;
  }
  return state.collectionWordSet.has(normalizedWord);
}

function getCollectedItem(word) {
  const normalizedWord = normalizeCollectionWord(word);
  if (!normalizedWord) {
    return null;
  }
  return state.collection.find((item) => normalizeCollectionWord(item.word) === normalizedWord) || null;
}

function sortCollectionByNewest(items) {
  return [...items].sort((left, right) => {
    const leftTime = new Date(left?.collectedAt || 0).getTime();
    const rightTime = new Date(right?.collectedAt || 0).getTime();
    return rightTime - leftTime;
  });
}

async function loadCollection() {
  try {
    const data = await requestJson("/api/collection", {}, { redirectOnUnauthorized: false });
    return sortCollectionByNewest(data.collection || []);
  } catch {
    return [];
  }
}

async function addToCollection(wordItem) {
  const normalizedWord = normalizeCollectionWord(wordItem.word);
  try {
    if (!normalizedWord || hasCollectedWord(normalizedWord) || state.collectionPendingWords.has(normalizedWord)) {
      return "exists";
    }

    state.collectionPendingWords.add(normalizedWord);
    const data = await requestJson("/api/collection", {
      method: "POST",
      body: JSON.stringify(wordItem)
    });
    if (data.exists) {
      syncCollectionWordSet();
      return "exists";
    }
    state.collection.unshift({
      word: normalizedWord,
      wordCn: data.item?.wordCn || wordItem.wordCn || "",
      collectedAt: data.item?.collectedAt || new Date().toISOString()
    });
    syncCollectionWordSet();
    return "added";
  } catch {
    return "error";
  } finally {
    if (normalizedWord) {
      state.collectionPendingWords.delete(normalizedWord);
    }
  }
}

async function removeCollectionItem(word) {
  try {
    const query = new URLSearchParams({ word });
    await requestJson(`/api/collection?${query.toString()}`, {
      method: "DELETE"
    });
    state.collection = state.collection.filter((item) => item.word !== word);
    syncCollectionWordSet();
    return true;
  } catch {
    return false;
  }
}

const STAR_OUTLINE_ICON = `
  <svg class="collect-icon is-outline" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
  </svg>
`.trim();

const STAR_FILLED_ICON = `
  <svg class="collect-icon is-filled" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
  </svg>
`.trim();

function getCollectIcon(isCollected) {
  return isCollected ? STAR_FILLED_ICON : STAR_OUTLINE_ICON;
}

function syncCollectButtonVisual(button, word) {
  if (!button) {
    return;
  }

  const isCollected = hasCollectedWord(word);
  button.classList.toggle("is-active", isCollected);
  button.setAttribute("aria-pressed", String(isCollected));
  button.setAttribute("aria-label", isCollected ? "取消收藏单词" : "收藏单词");
  button.setAttribute("title", isCollected ? "取消收藏" : "收藏");
  button.innerHTML = getCollectIcon(isCollected);
}

function syncResultCollectButtons() {
  const buttons = elements.resultList.querySelectorAll(".result-collect-btn");
  buttons.forEach((button) => {
    syncCollectButtonVisual(button, button.dataset.word || "");
  });
}

function syncHistoryCollectButtons() {
  const buttons = elements.historyList.querySelectorAll(".history-collect-btn, .flash-history-collect-btn");
  buttons.forEach((button) => {
    syncCollectButtonVisual(button, button.dataset.word || "");
  });
}

function renderCollectButton() {
  if (!state.isAuthenticated || state.flashLoading || !state.flashCurrent) {
    elements.flashCollectBtn.classList.add("is-hidden");
    return;
  }
  elements.flashCollectBtn.classList.remove("is-hidden");
  syncCollectButtonVisual(elements.flashCollectBtn, state.flashCurrent?.word || "");
}

function renderHistoryFilterButton() {
  if (!elements.historyFilterBtn) {
    return;
  }

  const label = state.historyWrongOnly ? "显示全部历史" : "只看错题";
  elements.historyFilterBtn.setAttribute("aria-pressed", String(state.historyWrongOnly));
  elements.historyFilterBtn.setAttribute("aria-label", label);
  elements.historyFilterBtn.setAttribute("title", label);
  elements.historyFilterBtn.innerHTML = state.historyWrongOnly
    ? HISTORY_FILTER_FILLED_ICON
    : HISTORY_FILTER_OUTLINE_ICON;
}

function renderHistorySwitchButton() {
  if (!elements.flashHistoryBtn) {
    return;
  }

  const isFlashSection = state.historySection === "flash";
  const label = isFlashSection ? "切换普通历史" : "切换闪卡刷词历史";
  elements.flashHistoryBtn.setAttribute("aria-pressed", String(isFlashSection));
  elements.flashHistoryBtn.setAttribute("aria-label", label);
  elements.flashHistoryBtn.setAttribute("title", label);
}

function createInlineCollectButton(word, wordCn, extraClass = "") {
  if (!state.isAuthenticated) {
    return "";
  }
  const isCollected = hasCollectedWord(word);
  const buttonClassName = ["icon-btn", "collect-btn", "collection-remove-btn", extraClass, isCollected ? "is-active" : ""]
    .filter(Boolean)
    .join(" ");

  return `
    <button
      type="button"
      class="${buttonClassName}"
      data-word="${escapeHtmlAttribute(word || "")}"
      data-word-cn="${escapeHtmlAttribute(wordCn || "")}"
      aria-pressed="${String(isCollected)}"
      aria-label="${isCollected ? "取消收藏单词" : "收藏单词"}"
      title="${isCollected ? "取消收藏" : "收藏"}"
    >
      ${getCollectIcon(isCollected)}
    </button>
  `;
}

function createInlinePronounceButton(word, extraClass = "") {
  if (!word) {
    return "";
  }

  const buttonClassName = ["icon-btn", "pronounce-btn", extraClass]
    .filter(Boolean)
    .join(" ");

  return `
    <button
      type="button"
      class="${buttonClassName}"
      data-word="${escapeHtmlAttribute(word || "")}"
      aria-label="朗读单词"
      title="朗读"
    >
      ${PRONOUNCE_ICON}
    </button>
  `;
}

async function toggleCollection(wordItem) {
  const normalizedWord = normalizeCollectionWord(wordItem.word);
  if (!normalizedWord) {
    return "error";
  }

  if (hasCollectedWord(normalizedWord)) {
    const success = await removeCollectionItem(normalizedWord);
    return success ? "removed" : "error";
  }

  return addToCollection({
    word: normalizedWord,
    wordCn: wordItem.wordCn || ""
  });
}

function refreshCollectUi() {
  renderCollectButton();
  syncResultCollectButtons();
  syncHistoryCollectButtons();
  if (state.view === "history") {
    state.historyOpenIds = new Set(
      Array.from(elements.historyList.querySelectorAll(".history-item[open]"))
        .map((node) => node.dataset.historyId || "")
        .filter(Boolean)
    );
    renderHistory();
  }
  if (state.view === "collection") {
    renderCollection();
  }
}

async function toggleCollect() {
  if (!state.flashCurrent) {
    return;
  }
  const result = await toggleCollection({
    word: state.flashCurrent.word,
    wordCn: state.flashCurrent.wordCn
  });
  refreshCollectUi();
  if (result === "added") {
    showToast("已收藏", "success");
  } else if (result === "removed") {
    showToast("已取消收藏", "success");
  } else {
    showToast("收藏操作失败", "error");
  }
}

function renderCollection() {
  const showTrainButton = state.collection.length > 5;
  elements.collectionFlashBtn.classList.toggle("is-hidden", !showTrainButton);
  elements.collectionReadingBtn.classList.toggle("is-hidden", !showTrainButton);
  elements.collectionList.innerHTML = "";
  disconnectCollectionLoadObserver();
  if (!state.collection.length) {
    const empty = document.createElement("div");
    empty.className = "history-empty";
    empty.innerHTML = "<p>还没有收藏单词。</p><p>在闪卡刷词页面点击星星收藏单词吧。</p>";
    elements.collectionList.appendChild(empty);
    return;
  }

  if (!state.collectionVisibleCount) {
    state.collectionVisibleCount = Math.min(COLLECTION_BATCH_SIZE, state.collection.length);
  }
  state.collectionVisibleCount = Math.min(state.collectionVisibleCount, state.collection.length);

  state.collection.slice(0, state.collectionVisibleCount).forEach((item) => {
    const itemNode = document.createElement("div");
    itemNode.className = "collection-item";
    itemNode.dataset.lang = "en";
    itemNode.dataset.wordEn = item.word || "";
    itemNode.dataset.wordCn = item.wordCn || "";
    itemNode.dataset.collectedAt = item.collectedAt || "";
    itemNode.innerHTML = `
      <span class="collection-word">${escapeHtml(item.word)}</span>
      <span class="collection-side">
        <span class="collection-time">${formatHistoryTime(item.collectedAt)}</span>
        ${createInlinePronounceButton(item.word, "collection-pronounce-btn")}
        <button
          type="button"
          class="icon-btn collection-remove-btn"
          data-word="${escapeHtmlAttribute(item.word || "")}"
          data-collected-at="${escapeHtmlAttribute(item.collectedAt || "")}"
          aria-label="取消收藏"
          title="取消收藏"
        >
          <svg class="collect-icon is-filled" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
          </svg>
        </button>
      </span>
    `;
    elements.collectionList.appendChild(itemNode);
  });

  appendListLoadSentinel({
    container: elements.collectionList,
    loadedCount: state.collectionVisibleCount,
    totalCount: state.collection.length,
    emptyText: "继续加载收藏",
    onVisible: loadMoreCollectionItems,
    observerType: "collection"
  });
}

function startCollectionFlashTraining() {
  if (state.collection.length <= 5) {
    showToast("收藏夹单词需超过 5 个后才能开始闪卡刷词", "error");
    return;
  }
  setFlashPreset("collection");
  loadFlashQuestion({ forceNew: true });
}

function startCollectionReadingTraining() {
  if (state.collection.length <= 5) {
    showToast("收藏夹单词需超过 5 个后才能开始阅读训练", "error");
    return;
  }
  loadReadingExercise({ forceNew: true, preset: "collection" });
}

function renderAccountFeatures() {
  renderCollectButton();
}

function disconnectHistoryLoadObserver() {
  if (historyLoadObserver) {
    historyLoadObserver.disconnect();
    historyLoadObserver = null;
  }
}

function disconnectCollectionLoadObserver() {
  if (collectionLoadObserver) {
    collectionLoadObserver.disconnect();
    collectionLoadObserver = null;
  }
}

function appendListLoadSentinel({ container, loadedCount, totalCount, emptyText, onVisible, observerType }) {
  if (loadedCount >= totalCount) {
    return;
  }

  const sentinel = document.createElement("div");
  sentinel.className = "list-load-sentinel";
  sentinel.textContent = emptyText;
  container.appendChild(sentinel);

  if (typeof IntersectionObserver !== "function") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tool-btn list-load-more-btn";
    button.textContent = "加载更多";
    button.addEventListener("click", onVisible);
    sentinel.appendChild(button);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    const targetEntry = entries[0];
    if (!targetEntry?.isIntersecting) {
      return;
    }

    if (observerType === "history") {
      disconnectHistoryLoadObserver();
    } else {
      disconnectCollectionLoadObserver();
    }

    onVisible();
  }, {
    root: null,
    threshold: 0.1
  });

  observer.observe(sentinel);
  if (observerType === "history") {
    historyLoadObserver = observer;
  } else {
    collectionLoadObserver = observer;
  }
}

function getHistoryRecordsForView() {
  return state.historySection === "flash" ? state.flashHistoryRecords : state.historyRecords;
}

function getFilteredHistoryRecords() {
  const records = getHistoryRecordsForView();
  if (!state.historyWrongOnly) {
    return records;
  }

  if (state.historySection === "flash") {
    return records.filter((record) => !record.isCorrect);
  }

  return records.filter((record) => Array.isArray(record.result) && record.result.some((item) => !item));
}

function resetHistoryVisibleCount() {
  state.historyVisibleCount = Math.min(HISTORY_BATCH_SIZE, getFilteredHistoryRecords().length);
}

function loadMoreHistoryItems() {
  const records = getFilteredHistoryRecords();
  if (state.historyVisibleCount >= records.length) {
    return;
  }
  state.historyVisibleCount = Math.min(records.length, state.historyVisibleCount + HISTORY_BATCH_SIZE);
  renderHistory();
}

function resetCollectionVisibleCount() {
  state.collectionVisibleCount = Math.min(COLLECTION_BATCH_SIZE, state.collection.length);
}

function loadMoreCollectionItems() {
  if (state.collectionVisibleCount >= state.collection.length) {
    return;
  }
  state.collectionVisibleCount = Math.min(state.collection.length, state.collectionVisibleCount + COLLECTION_BATCH_SIZE);
  renderCollection();
}

async function loadHistory(section = "quiz") {
  const data = await requestJson(`/api/history?section=${section}`, {}, { redirectOnUnauthorized: false });
  return Array.isArray(data.records) ? data.records : [];
}

async function loadUserDataFromBackend() {
  try {
    const [quizHistory, flashHistory, collection] = await Promise.all([
      loadHistory("quiz"),
      loadHistory("flash"),
      loadCollection()
    ]);
    state.historyRecords = Array.isArray(quizHistory) ? quizHistory : [];
    state.flashHistoryRecords = Array.isArray(flashHistory) ? flashHistory : [];
    state.collection = Array.isArray(collection) ? collection : [];
  } catch {
    state.historyRecords = [];
    state.flashHistoryRecords = [];
    state.collection = [];
  }

  syncCollectionWordSet();
  resetHistoryVisibleCount();
  resetCollectionVisibleCount();
  renderHistory();
  renderCollection();
  renderAccountFeatures();
}

function renderLoadingProgress() {
  elements.loadingBar.style.width = `${state.loadingPercent}%`;
  elements.loadingPercent.textContent = `${state.loadingPercent}%`;
}

function renderLoadingState() {
  elements.loadingView.classList.toggle("is-hidden", !state.loading || state.view !== "quiz");
  elements.quizBoard.classList.toggle("is-hidden", state.loading || state.view !== "quiz");
  renderLoadingProgress();
}

function startLoadingProgress() {
  if (state.loadingTimer) {
    window.clearInterval(state.loadingTimer);
  }

  state.loadingPercent = 0;
  renderLoadingProgress();
  const intervalMs = 120;
  const maxPercent = 92;
  state.loadingTimer = window.setInterval(() => {
    if (state.loadingPercent >= maxPercent) {
      window.clearInterval(state.loadingTimer);
      state.loadingTimer = null;
      return;
    }
    state.loadingPercent += state.loadingPercent < 60 ? 8 : 4;
    if (state.loadingPercent > maxPercent) {
      state.loadingPercent = maxPercent;
    }
    renderLoadingProgress();
  }, intervalMs);
}

function finishLoadingProgress() {
  if (state.loadingTimer) {
    window.clearInterval(state.loadingTimer);
    state.loadingTimer = null;
  }

  return new Promise((resolve) => {
    const stepToComplete = () => {
      if (state.loadingPercent >= 100) {
        state.loadingPercent = 100;
        renderLoadingProgress();
        window.setTimeout(resolve, 120);
        return;
      }

      const remaining = 100 - state.loadingPercent;
      state.loadingPercent += Math.max(2, Math.ceil(remaining / 4));
      if (state.loadingPercent > 100) {
        state.loadingPercent = 100;
      }
      renderLoadingProgress();
      window.setTimeout(stepToComplete, 45);
    };

    stepToComplete();
  });
}

function renderFlashLoadingProgress() {
  elements.flashLoadingBar.style.width = `${state.flashLoadingPercent}%`;
  elements.flashLoadingPercent.textContent = `${state.flashLoadingPercent}%`;
}

function renderFlashLoadingState() {
  elements.flashLoadingView.classList.toggle("is-hidden", !state.flashLoading || state.view !== "flash");
  elements.flashBoard.classList.toggle("is-hidden", state.flashLoading || state.view !== "flash");
  renderFlashLoadingProgress();
  renderCollectButton();
}

function startFlashLoadingProgress() {
  if (state.flashLoadingTimer) {
    window.clearInterval(state.flashLoadingTimer);
  }

  state.flashLoadingPercent = 0;
  renderFlashLoadingProgress();
  state.flashLoadingTimer = window.setInterval(() => {
    if (state.flashLoadingPercent >= 92) {
      window.clearInterval(state.flashLoadingTimer);
      state.flashLoadingTimer = null;
      return;
    }
    state.flashLoadingPercent += state.flashLoadingPercent < 60 ? 8 : 4;
    if (state.flashLoadingPercent > 92) {
      state.flashLoadingPercent = 92;
    }
    renderFlashLoadingProgress();
  }, 120);
}

function finishFlashLoadingProgress() {
  if (state.flashLoadingTimer) {
    window.clearInterval(state.flashLoadingTimer);
    state.flashLoadingTimer = null;
  }

  return new Promise((resolve) => {
    const stepToComplete = () => {
      if (state.flashLoadingPercent >= 100) {
        state.flashLoadingPercent = 100;
        renderFlashLoadingProgress();
        window.setTimeout(resolve, 100);
        return;
      }

      const remaining = 100 - state.flashLoadingPercent;
      state.flashLoadingPercent += Math.max(3, Math.ceil(remaining / 3));
      if (state.flashLoadingPercent > 100) {
        state.flashLoadingPercent = 100;
      }
      renderFlashLoadingProgress();
      window.setTimeout(stepToComplete, 35);
    };

    stepToComplete();
  });
}

function resetFlashState() {
  state.flashQueue = [];
  state.flashCurrent = null;
  state.flashSelectedIndex = -1;
  state.flashEvaluation = null;
  state.flashDetailVisible = false;
  state.flashHintExampleVisible = false;
  state.flashPast = [];
  state.flashFuture = [];
}

function resetFlashPreload() {
  state.flashPreload.token += 1;
  state.flashPreload.data = null;
  state.flashPreload.promise = null;
}

function setFlashPreset(preset = "default") {
  const normalizedPreset = String(preset || "default").trim().toLowerCase() || "default";
  if (state.flashPreset === normalizedPreset) {
    return;
  }
  state.flashPreset = normalizedPreset;
  resetFlashPreload();
  resetFlashState();
}

function createFlashSnapshot() {
  return {
    question: cloneSerializable(state.flashCurrent),
    selectedIndex: state.flashSelectedIndex,
    evaluation: state.flashEvaluation ? { ...state.flashEvaluation } : null,
    detailVisible: state.flashDetailVisible,
    hintExampleVisible: state.flashHintExampleVisible
  };
}

function restoreFlashSnapshot(snapshot) {
  state.flashCurrent = cloneSerializable(snapshot?.question) || null;
  state.flashSelectedIndex = Number.isInteger(snapshot?.selectedIndex) ? snapshot.selectedIndex : -1;
  state.flashEvaluation = snapshot?.evaluation ? { ...snapshot.evaluation } : null;
  state.flashDetailVisible = Boolean(snapshot?.detailVisible);
  state.flashHintExampleVisible = Boolean(snapshot?.hintExampleVisible);
}

function restoreFlashSessionSnapshot(snapshot) {
  state.flashPreset = String(snapshot?.preset || state.flashPreset || "default").trim().toLowerCase() || "default";
  restoreFlashSnapshot(snapshot?.current);
  state.flashQueue = Array.isArray(snapshot?.queue) ? [...snapshot.queue] : [];
  state.flashPast = [];
  state.flashFuture = [];
  resetFlashPreload();
}

function persistLearningProgress() {
  saveCurrentQuizDraft();
  if (state.flashCurrent?.word) {
    saveCurrentFlashCache();
  } else {
    clearFlashCache();
  }
}

function createQuizSnapshot() {
  return {
    mode: state.mode,
    quiz: state.quiz ? { ...state.quiz, items: state.quiz.items.map(item => ({ ...item })) } : null,
    placements: [...state.placements],
    optionOrder: [...state.optionOrder],
    selectedWord: state.selectedWord,
    evaluationResult: state.evaluationResult ? [...state.evaluationResult] : null,
    currentHistoryId: state.currentHistoryId,
    wordColors: { ...state.wordColors }
  };
}

function restoreQuizSnapshot(snapshot) {
  if (!snapshot) return;
  state.mode = snapshot.mode;
  state.quiz = snapshot.quiz;
  state.placements = [...snapshot.placements];
  state.optionOrder = [...snapshot.optionOrder];
  state.selectedWord = snapshot.selectedWord;
  state.evaluationResult = snapshot.evaluationResult ? [...snapshot.evaluationResult] : null;
  state.currentHistoryId = snapshot.currentHistoryId;
  state.wordColors = { ...snapshot.wordColors };
  renderQuizHeader();
  renderQuestions();
  renderOptions();
  renderSubmitButton();
  renderQuizNavButtons();
}

function cloneReadingExercise(exercise) {
  if (!exercise) {
    return null;
  }
  return {
    ...exercise,
    words: Array.isArray(exercise.words) ? exercise.words.map((item) => ({
      ...item,
      examples: Array.isArray(item.examples) ? item.examples.map((example) => ({ ...example })) : []
    })) : [],
    sentences: Array.isArray(exercise.sentences) ? exercise.sentences.map((item) => ({ ...item })) : []
  };
}

function createReadingSnapshot() {
  return {
    exercise: cloneReadingExercise(state.readingExercise),
    preset: state.readingPreset,
    openSentenceIndexes: [...state.readingOpenSentenceIndexes],
    titleOpen: state.readingTitleOpen
  };
}

function restoreReadingSnapshot(snapshot) {
  state.readingExercise = cloneReadingExercise(snapshot?.exercise);
  state.readingPreset = String(snapshot?.preset || "default").trim().toLowerCase() || "default";
  state.readingOpenSentenceIndexes = new Set(
    Array.isArray(snapshot?.openSentenceIndexes)
      ? snapshot.openSentenceIndexes.filter((index) => Number.isInteger(index))
      : []
  );
  state.readingTitleOpen = Boolean(snapshot?.titleOpen);
  saveReadingCache(createReadingSnapshot());
}

function renderQuizNavButtons() {
  elements.prevBtn.disabled = state.quizPast.length === 0;
  elements.nextBtn.disabled = !state.quiz && state.quizFuture.length === 0;
}

function renderFlashNavButtons() {
  elements.flashPrevBtn.disabled = state.flashPast.length === 0;
  const hasNextCandidate = state.flashFuture.length > 0 || state.flashQueue.length > 0 || Boolean(state.flashCurrent);
  elements.flashNextBtn.disabled = !state.flashCurrent || !state.flashEvaluation || !hasNextCandidate;
  elements.flashHintBtn.disabled = !state.flashCurrent;
}

function warmFlashBatchForCurrentState() {
  if (!state.flashCurrent) {
    return;
  }
  if (state.flashQueue.length <= 1) {
    warmFlashBatch();
  }
}

function isReadingFullyExpanded() {
  if (!state.readingExercise) {
    return false;
  }
  const sentenceCount = Array.isArray(state.readingExercise.sentences) ? state.readingExercise.sentences.length : 0;
  const titleReady = Boolean(state.readingExercise.titleCn);
  return state.readingOpenSentenceIndexes.size >= sentenceCount && (!titleReady || state.readingTitleOpen);
}

function renderReadingToggleAllButton() {
  const hasExercise = Boolean(state.readingExercise);
  elements.readingToggleAllBtn.disabled = !hasExercise;
  elements.readingToggleAllBtn.textContent = hasExercise && isReadingFullyExpanded() ? "折叠全部" : "展开全部";
}

function renderReadingNavButtons() {
  elements.readingPrevBtn.disabled = state.readingPast.length === 0;
  elements.readingNextBtn.disabled = state.readingLoading || (!state.readingExercise && state.readingFuture.length === 0);
  renderReadingToggleAllButton();
}

function syncReadingTitleCardState() {
  const hasTitleCn = Boolean(state.readingExercise?.titleCn);
  elements.readingTitleCard.open = hasTitleCn && state.readingTitleOpen;
  elements.readingTitleBody.classList.toggle("is-hidden", !hasTitleCn || !state.readingTitleOpen);
}

function setReadingAllExpanded(expanded) {
  if (!state.readingExercise) {
    return;
  }
  const sentenceCount = Array.isArray(state.readingExercise.sentences) ? state.readingExercise.sentences.length : 0;
  state.readingOpenSentenceIndexes = expanded
    ? new Set(Array.from({ length: sentenceCount }, (_, index) => index))
    : new Set();
  state.readingTitleOpen = expanded && Boolean(state.readingExercise.titleCn);
  renderReadingExercise();
  saveReadingCache(createReadingSnapshot());
}

function renderFlashRevealButton() {
  if (state.flashCurrent && state.flashEvaluation) {
    elements.flashHintBtn.textContent = state.flashDetailVisible ? "查看选项" : "查看释义";
  } else {
    elements.flashHintBtn.textContent = "提示";
  }
}

function renderFlashLayoutState() {
  elements.flashBoard.classList.toggle("is-detail-open", Boolean(state.flashDetailVisible && state.flashCurrent));
  elements.flashBoard.classList.toggle("is-options-only", Boolean(!state.flashDetailVisible && state.flashCurrent && state.flashEvaluation));
}

function renderFlashDetail() {
  elements.flashDetail.innerHTML = "";
  if (!state.flashCurrent || !state.flashDetailVisible) {
    elements.flashDetail.classList.add("is-hidden");
    renderFlashLayoutState();
    return;
  }

  const current = state.flashCurrent;
  const examplesHtml = Array.isArray(current.examples) && current.examples.length
    ? current.examples
        .map(
          (example, index) => `
            <div class="flash-example-item">
              <p>
                <button
                  type="button"
                  class="example-tts-btn pronounce-btn"
                  data-tts-text="${escapeHtmlAttribute(example.en)}"
                  aria-label="朗读例句 ${index + 1}"
                  title="朗读"
                >
                  ${PRONOUNCE_ICON}
                </button>
                ${highlightExampleWord(example.en, current.word)}
              </p>
              <p>${escapeHtml(example.cn)}</p>
            </div>
          `
        )
        .join("")
    : '<div class="flash-example-item"><p>当前暂无本地例句。</p></div>';

  elements.flashDetail.innerHTML = `
    <div class="flash-definition-card">
      <p class="flash-definition-cn">${escapeHtml(current.wordCn)}</p>
      <p class="flash-definition-def">${escapeHtml(current.defCn)}</p>
      <p class="flash-definition-en">${escapeHtml(current.defEn)}</p>
    </div>
    <div class="flash-example-list">${examplesHtml}</div>
  `;
  elements.flashDetail.classList.remove("is-hidden");
  renderFlashLayoutState();
}

function renderFlashOptions() {
  elements.flashOptionList.innerHTML = "";

  if (!state.flashCurrent) {
    return;
  }

  state.flashCurrent.options.forEach((option, index) => {
    const optionText = typeof option === "string" ? option : option?.text || "";
    const optionWord = typeof option === "string" ? "" : option?.word || "";
    const button = document.createElement("button");
    const isSelected = state.flashSelectedIndex === index;
    const isCorrect = state.flashEvaluation && index === state.flashCurrent.answerIndex;
    const isWrong = state.flashEvaluation && isSelected && index !== state.flashCurrent.answerIndex;
    const showOptionWord =
      Boolean(state.flashEvaluation) &&
      Boolean(optionWord) &&
      optionWord !== state.flashCurrent.word;

    button.className = `flash-option-btn${isSelected ? " is-active" : ""}${
      isCorrect ? " is-correct" : ""
    }${isWrong ? " is-wrong" : ""}`;
    button.innerHTML = `
      <span class="flash-option-main">${escapeHtml(optionText)}</span>
      ${
        showOptionWord
          ? `<span class="flash-option-word">${escapeHtml(optionWord)}</span>`
          : ""
      }
    `;
    button.disabled = Boolean(state.flashEvaluation);
    button.addEventListener("click", () => {
      if (state.flashEvaluation) {
        return;
      }
      state.flashSelectedIndex = index;
      state.flashEvaluation = {
        isCorrect: index === state.flashCurrent.answerIndex
      };
      state.flashDetailVisible = false;
      state.flashHintExampleVisible = false;
      appendFlashHistoryRecord();
      warmFlashBatch();
      renderFlashQuestion();
      renderFlashOptions();
      renderFlashRevealButton();
      renderFlashDetail();
      renderFlashNavButtons();
      saveCurrentFlashCache();
    });
    elements.flashOptionList.appendChild(button);
  });
}

function renderFlashQuestion() {
  elements.flashWord.textContent = state.flashCurrent ? state.flashCurrent.word : "";
  const flashAccent = state.flashCurrent ? String(state.flashCurrent.accent || "").trim() : "";
  if (elements.flashPhonetic) {
    if (flashAccent) {
      elements.flashPhonetic.innerHTML = `
        <button
          type="button"
          class="flash-phonetic-tts-btn pronounce-btn"
          data-word="${escapeHtmlAttribute(state.flashCurrent?.word || "")}"
          aria-label="朗读单词"
          title="朗读"
        >
          ${PRONOUNCE_ICON}
        </button>
        ${escapeHtml(flashAccent)}
      `;
      elements.flashPhonetic.classList.remove("is-hidden");
    } else {
      elements.flashPhonetic.textContent = "";
      elements.flashPhonetic.classList.add("is-hidden");
    }
  }
  
  if (elements.flashHintExample) {
    const hintExample = state.flashCurrent?.hintExample;
    const fallbackExample = state.flashCurrent?.examples?.[0];
    const exampleToUse = hintExample || fallbackExample;
    const showHint = Boolean(!state.flashEvaluation && state.flashHintExampleVisible && exampleToUse);
    if (showHint) {
      elements.flashHintExample.innerHTML = `
        <div class="flash-hint-example-content">
          <p class="flash-hint-example-en">${highlightExampleWord(exampleToUse.en, state.flashCurrent.word)}</p>
        </div>
      `;
      elements.flashHintExample.classList.remove("is-hidden");
    } else {
      elements.flashHintExample.innerHTML = "";
      elements.flashHintExample.classList.add("is-hidden");
    }
  }
  
  renderFlashPrevHeader();
  renderFlashLayoutState();
  renderFlashRevealButton();
  renderFlashDetail();
  renderFlashOptions();
  renderFlashNavButtons();
  renderCollectButton();
}

function renderFlashPrevHeader() {
  if (!elements.flashPrevSummary) {
    return;
  }
  const prevSnapshot = state.flashPast.length ? state.flashPast[state.flashPast.length - 1] : null;
  const prevQuestion = prevSnapshot?.question || null;
  const prevWord = String(prevQuestion?.word || "").trim();
  const prevWordCn = String(prevQuestion?.wordCn || "").trim();
  const shouldShow = Boolean(prevWord);
  if (elements.flashPrevDivider) {
    elements.flashPrevDivider.classList.toggle("is-hidden", !shouldShow);
  }
  elements.flashPrevSummary.classList.toggle("is-hidden", !shouldShow);
  if (!shouldShow) {
    return;
  }
  const enNode = elements.flashPrevSummary.querySelector(".flash-prev-en");
  const cnNode = elements.flashPrevSummary.querySelector(".flash-prev-cn");
  if (enNode) {
    enNode.textContent = prevWord;
  }
  if (cnNode) {
    cnNode.textContent = prevWordCn;
    cnNode.classList.toggle("is-hidden", !prevWordCn);
  }
}

function requestReadingExercise(preset = "default") {
  const searchParams = new URLSearchParams();
  if (preset && preset !== "default") {
    searchParams.set("preset", preset);
  }
  const query = searchParams.toString();
  return requestJson(query ? `/api/reading?${query}` : "/api/reading");
}

function renderReadingLoadingProgress() {
  elements.readingLoadingBar.style.width = `${state.readingLoadingPercent}%`;
  elements.readingLoadingPercent.textContent = `${Math.floor(state.readingLoadingPercent)}%`;
}

function renderReadingLoadingState() {
  elements.readingLoadingView.classList.toggle("is-hidden", !state.readingLoading || state.view !== "reading");
  elements.readingBoard.classList.toggle("is-hidden", state.readingLoading || state.view !== "reading" || !state.readingExercise);
  renderReadingLoadingProgress();
  renderReadingNavButtons();
}

function startReadingLoadingProgress() {
  if (state.readingLoadingTimer) {
    window.clearInterval(state.readingLoadingTimer);
  }

  state.readingLoadingPercent = 0;
  renderReadingLoadingProgress();
  const intervalMs = 80;
  const maxPercent = 92;
  state.readingLoadingTimer = window.setInterval(() => {
    if (state.readingLoadingPercent >= maxPercent) {
      window.clearInterval(state.readingLoadingTimer);
      state.readingLoadingTimer = null;
      return;
    }
    state.readingLoadingPercent += state.readingLoadingPercent < 40 ? 1.2 : state.readingLoadingPercent < 70 ? 0.7 : 0.4;
    if (state.readingLoadingPercent > maxPercent) {
      state.readingLoadingPercent = maxPercent;
    }
    renderReadingLoadingProgress();
  }, intervalMs);
}

function finishReadingLoadingProgress() {
  if (state.readingLoadingTimer) {
    window.clearInterval(state.readingLoadingTimer);
    state.readingLoadingTimer = null;
  }

  return new Promise((resolve) => {
    const stepToComplete = () => {
      if (state.readingLoadingPercent >= 100) {
        state.readingLoadingPercent = 100;
        renderReadingLoadingProgress();
        window.setTimeout(resolve, 150);
        return;
      }

      const remaining = 100 - state.readingLoadingPercent;
      state.readingLoadingPercent += Math.max(0.8, remaining / 6);
      if (state.readingLoadingPercent > 100) {
        state.readingLoadingPercent = 100;
      }
      renderReadingLoadingProgress();
      window.setTimeout(stepToComplete, 50);
    };

    stepToComplete();
  });
}

function renderReadingExercise() {
  if (!state.readingExercise) {
    state.readingTitleOpen = false;
    state.readingOpenSentenceIndexes = new Set();
    elements.readingTitle.textContent = "Reading Practice";
    elements.readingTitleCn.textContent = "";
    syncReadingTitleCardState();
    elements.readingSentenceList.innerHTML = `
      <div class="history-empty">
        <p>还没有阅读训练内容。</p>
        <p>返回首页开始生成一篇新的双语短文吧。</p>
      </div>
    `;
    renderReadingLoadingState();
    return;
  }

  const words = Array.isArray(state.readingExercise.words) ? state.readingExercise.words : [];
  elements.readingTitle.textContent = state.readingExercise.title || "Reading Practice";
  elements.readingTitleCn.textContent = state.readingExercise.titleCn || "";
  syncReadingTitleCardState();

  elements.readingSentenceList.innerHTML = "";
  const highlightWords = words.map((item) => item.word);
  (Array.isArray(state.readingExercise.sentences) ? state.readingExercise.sentences : []).forEach((sentence, index) => {
    const details = document.createElement("details");
    details.className = "reading-card";
    details.open = state.readingOpenSentenceIndexes.has(index);
    details.innerHTML = `
      <summary class="reading-card-summary">
        <p class="reading-card-en">${highlightReadingWords(sentence.en, highlightWords)}</p>
      </summary>
      <div class="reading-card-body">
        <p class="reading-card-cn">${highlightReadingChinese(sentence.cn)}</p>
      </div>
    `;
    details.addEventListener("toggle", () => {
      if (details.open) {
        state.readingOpenSentenceIndexes.add(index);
      } else {
        state.readingOpenSentenceIndexes.delete(index);
      }
      renderReadingToggleAllButton();
      saveReadingCache(createReadingSnapshot());
    });
    elements.readingSentenceList.appendChild(details);
  });

  renderReadingLoadingState();
}

function openReadingWordListDialog() {
  const items = Array.isArray(state.readingExercise?.words) ? state.readingExercise.words : [];
  if (!items.length) {
    showToast("当前还没有可查看的重点单词", "error");
    return;
  }

  openResultDialog({
    title: "重点单词",
    items,
    showIndex: false
  });
}

async function loadReadingExercise(options = {}) {
  const {
    forceNew = false,
    preset = "default",
    pastSnapshot = null,
    clearFuture = false
  } = options;
  const normalizedPreset = String(preset || "default").trim().toLowerCase() || "default";
  if (!hasAvailableAiCapability()) {
    showToast("未配置 API Key，阅读训练暂不可用", "error");
    return;
  }

  if (!forceNew && state.readingExercise) {
    state.readingPreset = normalizedPreset;
    setView("reading");
    renderReadingLoadingState();
    renderReadingExercise();
    return;
  }

  if (!forceNew && !state.readingExercise) {
    const cachedSnapshot = getReadingCache();
    if (cachedSnapshot?.exercise) {
      restoreReadingSnapshot(cachedSnapshot);
      state.readingPast = [];
      state.readingFuture = [];
      setView("reading");
      renderReadingLoadingState();
      renderReadingExercise();
      return;
    }
  }

  const previousExercise = cloneReadingExercise(state.readingExercise);
  const previousPreset = state.readingPreset;
  const previousOpenSentenceIndexes = new Set(state.readingOpenSentenceIndexes);
  const previousTitleOpen = state.readingTitleOpen;
  state.readingLoading = true;
  startReadingLoadingProgress();
  setView("reading");
  renderReadingLoadingState();
  renderReadingExercise();

  try {
    const data = await requestReadingExercise(normalizedPreset);
    state.readingPreset = normalizedPreset;
    state.readingExercise = data;
    state.readingOpenSentenceIndexes = new Set();
    state.readingTitleOpen = false;
    if (pastSnapshot?.exercise) {
      state.readingPast.push(pastSnapshot);
    }
    if (clearFuture) {
      state.readingFuture = [];
    }
    await finishReadingLoadingProgress();
    state.readingLoading = false;
    renderReadingLoadingState();
    renderReadingExercise();
    saveReadingCache(createReadingSnapshot());
  } catch (error) {
    if (state.readingLoadingTimer) {
      window.clearInterval(state.readingLoadingTimer);
      state.readingLoadingTimer = null;
    }
    state.readingLoadingPercent = 0;
    state.readingLoading = false;
    state.readingExercise = previousExercise;
    state.readingPreset = previousPreset;
    state.readingOpenSentenceIndexes = new Set(previousOpenSentenceIndexes);
    state.readingTitleOpen = previousTitleOpen;
    renderReadingLoadingState();
    renderReadingExercise();
    showToast(error.message || "阅读训练生成失败", "error", 2600);
  }
}

function goToPrevReadingExercise() {
  if (!state.readingPast.length) {
    return;
  }
  if (state.readingExercise) {
    state.readingFuture.push(createReadingSnapshot());
  }
  restoreReadingSnapshot(state.readingPast.pop());
  setView("reading");
  renderReadingLoadingState();
  renderReadingExercise();
}

function goToNextReadingExercise() {
  if (state.readingFuture.length) {
    if (state.readingExercise) {
      state.readingPast.push(createReadingSnapshot());
    }
    restoreReadingSnapshot(state.readingFuture.pop());
    setView("reading");
    renderReadingLoadingState();
    renderReadingExercise();
    return;
  }

  loadReadingExercise({
    forceNew: true,
    preset: state.readingPreset || "default",
    pastSnapshot: state.readingExercise ? createReadingSnapshot() : null,
    clearFuture: true
  });
}

function requestFlashBatch(count = FLASH_BATCH_SIZE) {
  const searchParams = new URLSearchParams({
    count: String(count)
  });
  if (state.flashPreset !== "default") {
    searchParams.set("preset", state.flashPreset);
  }
  return requestJson(`/api/flash?${searchParams.toString()}`);
}

function warmFlashBatchWhenNeeded() {
  if (!state.flashCurrent) {
    return;
  }
  if (state.flashQueue.length === 0) {
    warmFlashBatch();
  }
}

function warmFlashBatch() {
  if (state.flashPreload.data || state.flashPreload.promise) {
    return;
  }

  const preloadToken = state.flashPreload.token;
  const preloadPromise = requestFlashBatch()
    .then((data) => {
      if (state.flashPreload.token === preloadToken) {
        state.flashPreload.data = data;
      }
      return data;
    })
    .catch(() => null)
    .finally(() => {
      if (state.flashPreload.promise === preloadPromise) {
        state.flashPreload.promise = null;
      }
    });

  state.flashPreload.promise = preloadPromise;
}

async function resolveFlashBatch() {
  if (state.flashPreload.data) {
    const data = state.flashPreload.data;
    state.flashPreload.data = null;
    return data;
  }

  if (state.flashPreload.promise) {
    try {
      const data = await state.flashPreload.promise;
      if (state.flashPreload.data === data) {
        state.flashPreload.data = null;
      }
      if (data) {
        return data;
      }
    } catch {
      // Fall back to a direct request if the background preload fails.
    }
  }

  return requestFlashBatch();
}

function shiftFlashQuestionFromQueue() {
  const nextQuestion = state.flashQueue.shift() || null;
  restoreFlashSnapshot({
    question: nextQuestion,
    selectedIndex: -1,
    evaluation: null,
    detailVisible: false,
    hintExampleVisible: false
  });
  renderFlashQuestion();
  warmFlashBatchWhenNeeded();
  saveCurrentFlashCache();
}

async function loadFlashQuestion(options = {}) {
  const { forceNew = false, fromHome = false } = options;
  
  if (fromHome) {
    state.flashPast = [];
    state.flashFuture = [];
  }
  
  if (!forceNew && !fromHome && state.flashCurrent) {
    setView("flash");
    renderFlashLoadingState();
    renderFlashQuestion();
    renderFlashNavButtons();
    saveCurrentFlashCache();
    return;
  }

  if (!forceNew) {
    const cachedSnapshot = getFlashCache(state.flashPreset);
    if (cachedSnapshot?.current?.question?.word) {
      restoreFlashSessionSnapshot(cachedSnapshot);
      if (fromHome) {
        state.flashPast = [];
        state.flashFuture = [];
      }
      setView("flash");
      renderFlashLoadingState();
      renderFlashQuestion();
      renderFlashNavButtons();
      warmFlashBatchForCurrentState();
      saveCurrentFlashCache();
      return;
    }
  }

  if (state.flashQueue.length) {
    shiftFlashQuestionFromQueue();
    setView("flash");
    renderFlashLoadingState();
    if (state.flashQueue.length <= 1) {
      warmFlashBatch();
    }
    return;
  }

  state.flashLoading = !shouldSkipAiLoading();
  state.flashLoadingPercent = 0;
  setView("flash");
  if (state.flashLoading) {
    startFlashLoadingProgress();
  } else {
    state.flashCurrent = null;
    state.flashSelectedIndex = -1;
    state.flashEvaluation = null;
    state.flashDetailVisible = false;
  }
  renderFlashLoadingState();
  renderFlashQuestion();
  renderFlashNavButtons();

  try {
    const data = await resolveFlashBatch();
    if (state.flashLoading) {
      await finishFlashLoadingProgress();
    }
    state.flashLoading = false;
    state.flashQueue = Array.isArray(data.questions) ? [...data.questions] : [];
    shiftFlashQuestionFromQueue();
    renderFlashLoadingState();
    if (state.flashQueue.length <= 1) {
      warmFlashBatch();
    }
  } catch (error) {
    if (state.flashLoading) {
      await finishFlashLoadingProgress();
    }
    state.flashLoading = false;
    renderFlashLoadingState();
    showToast(error.message || "闪卡刷词题目加载失败", "error", 2600);
  }
}

function goToPrevFlashQuestion() {
  if (!state.flashPast.length) {
    return;
  }
  if (state.flashCurrent) {
    state.flashFuture.push(createFlashSnapshot());
  }
  restoreFlashSnapshot(state.flashPast.pop());
  renderFlashQuestion();
  warmFlashBatchForCurrentState();
  saveCurrentFlashCache();
}

function goToNextFlashQuestion() {
  if (state.flashFuture.length) {
    if (state.flashCurrent) {
      state.flashPast.push(createFlashSnapshot());
    }
    restoreFlashSnapshot(state.flashFuture.pop());
    renderFlashQuestion();
    warmFlashBatchForCurrentState();
    saveCurrentFlashCache();
    return;
  }

  if (state.flashCurrent) {
    state.flashPast.push(createFlashSnapshot());
  }
  state.flashFuture = [];
  
  if (state.flashQueue.length) {
    shiftFlashQuestionFromQueue();
    return;
  }
  
  saveCurrentFlashCache();
  loadFlashQuestion({ forceNew: true });
}

function goToPrevQuizQuestion() {
  if (!state.quizPast.length) return;
  if (state.quiz) {
    state.quizFuture.push(createQuizSnapshot());
  }
  restoreQuizSnapshot(state.quizPast.pop());
}

function goToNextQuizQuestion() {
  if (state.quizFuture.length) {
    if (state.quiz) {
      state.quizPast.push(createQuizSnapshot());
    }
    restoreQuizSnapshot(state.quizFuture.pop());
    return;
  }
  if (state.quiz) {
    state.quizPast.push(createQuizSnapshot());
  }
  state.quizFuture = [];
  clearQuizDraft();
  loadQuiz({ forceNew: true });
}

function renderHomeModes() {
  elements.homeModeList.innerHTML = "";
  const quizItems = HOME_ENTRY_ITEMS.filter((item) => item.type === "quiz");
  const otherItems = HOME_ENTRY_ITEMS.filter((item) => item.type !== "quiz");

  if (quizItems.length) {
    const group = document.createElement("details");
    group.className = "home-mode-group";
    group.open = Boolean(state.homeQuizExpanded);
    group.addEventListener("toggle", () => {
      state.homeQuizExpanded = group.open;
    });

    const summary = document.createElement("summary");
    summary.className = "home-mode-btn home-mode-summary";
    summary.innerHTML = '<span>单词匹配</span><span class="home-mode-caret" aria-hidden="true"></span>';
    group.appendChild(summary);

    const sublist = document.createElement("div");
    sublist.className = "home-mode-sublist";

    quizItems.forEach(({ key, label, requiresAi = false }) => {
      const button = document.createElement("button");
      button.className = "home-mode-btn home-submode-btn";
      button.textContent = label;
      if (requiresAi && state.isAuthenticated && !hasAvailableAiCapability()) {
        button.setAttribute("title", `未配置 API Key 时，${label}模式暂不可用`);
        button.setAttribute("aria-disabled", "true");
      }
      button.addEventListener("click", () => {
        if (!requireAuthFromHomeEntry()) {
          return;
        }
        if (requiresAi && !hasAvailableAiCapability()) {
          showToast(`未配置 API Key，${label}模式暂不可用`, "error");
          return;
        }
        state.mode = key;
        renderHomeModes();
        loadQuiz({ fromHome: true });
      });
      sublist.appendChild(button);
    });

    group.appendChild(sublist);
    elements.homeModeList.appendChild(group);
  }

  otherItems.forEach(({ key, label, type, requiresAi = false }) => {
    const button = document.createElement("button");
    button.className = "home-mode-btn";
    button.textContent = label;
    if (requiresAi && state.isAuthenticated && !hasAvailableAiCapability()) {
      button.setAttribute("title", `未配置 API Key 时，${label}模式暂不可用`);
      button.setAttribute("aria-disabled", "true");
    }
    button.addEventListener("click", () => {
      if (type === "wordle") {
        if (!requireAuthFromHomeEntry()) {
          return;
        }
        const cache = loadWordleCache();
        if (cache && !cache.gameOver) {
          restoreWordleGame(cache);
        } else {
          startWordleGame();
        }
        return;
      }
      if (!requireAuthFromHomeEntry()) {
        return;
      }
      if (requiresAi && !hasAvailableAiCapability()) {
        showToast(`未配置 API Key，${label}模式暂不可用`, "error");
        return;
      }
      if (type === "flash") {
        state.flashPreset = "default";
        loadFlashQuestion({ fromHome: true });
        return;
      }
      if (type === "reading") {
        loadReadingExercise();
        return;
      }
      state.mode = key;
      renderHomeModes();
      loadQuiz();
    });
    elements.homeModeList.appendChild(button);
  });
}

function getAvailableWords() {
  if (!state.quiz) {
    return [];
  }

  const usedWords = new Set(state.placements.filter(Boolean));
  return state.optionOrder.filter((word) => !usedWords.has(word));
}

function getWordTone(word) {
  return state.wordColors[word] || TONE_KEYS[0];
}

function getToneClass(word) {
  return `tone-${getWordTone(word)}`;
}

function buildWordColorMap(words) {
  const colors = {};
  words.forEach((word, index) => {
    colors[word] = TONE_KEYS[index % TONE_KEYS.length];
  });
  state.wordColors = colors;
}

function shuffleWords(words) {
  const shuffled = [...words];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function createResultIcon(isCorrect) {
  const icon = document.createElement("span");
  icon.className = `slot-result-icon ${isCorrect ? "is-correct" : "is-wrong"}`;
  icon.innerHTML = isCorrect
    ? '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 10.5 8.2 14l7.3-8"/></svg>'
    : '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15"/></svg>';
  return icon;
}

function renderSubmitButton() {
  elements.submitBtn.textContent = state.evaluationResult ? "查看释义" : "提交";
}

function clearEvaluationState() {
  state.evaluationResult = null;
  renderSubmitButton();
}

function renderQuizHeader() {
  if (!elements.quizTitle) {
    return;
  }
  elements.quizTitle.textContent = `单词匹配-${MODE_LABELS[state.mode] || "随机词"}`;
}

function renderQuestions() {
  elements.questionList.innerHTML = "";

  if (!state.quiz) {
    return;
  }

  state.quiz.items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "question-row";

    const questionCard = document.createElement("div");
    questionCard.className = "question-card";
    questionCard.innerHTML = `<p>${index + 1}. ${item.defEn}</p>`;

    const slotButton = document.createElement("button");
    const placedWord = state.placements[index];
    const slotToneClass = placedWord ? getToneClass(placedWord) : "";
    const resultClass = state.evaluationResult
      ? state.evaluationResult[index]
        ? " correct"
        : " wrong"
      : "";

    slotButton.className = `slot-btn${placedWord ? " filled" : ""}${slotToneClass ? ` ${slotToneClass}` : ""}${resultClass}`;
    if (placedWord) {
      const text = document.createElement("span");
      text.className = "slot-word-text";
      text.textContent = placedWord;
      slotButton.appendChild(text);

      if (state.evaluationResult) {
        slotButton.appendChild(createResultIcon(Boolean(state.evaluationResult[index])));
      }
    } else {
      const text = document.createElement("span");
      text.className = "slot-placeholder-text";
      text.textContent = "点击填入单词";
      slotButton.appendChild(text);
    }
    slotButton.addEventListener("click", () => onSlotClick(index));

    row.append(questionCard, slotButton);
    elements.questionList.appendChild(row);
  });
}

function renderOptions() {
  elements.optionList.innerHTML = "";
  const availableWords = getAvailableWords();

  if (!availableWords.length) {
    const empty = document.createElement("p");
    empty.className = "empty-note";
    empty.textContent = "当前没有可选单词，可直接提交或点击已填单词撤回。";
    elements.optionList.appendChild(empty);
    return;
  }

  availableWords.forEach((word, index) => {
    const button = document.createElement("button");
    const colorClass = getToneClass(word);
    button.className = `option-btn ${colorClass}${
      state.selectedWord === word ? " is-active" : ""
    }`;
    button.textContent = word;
    button.addEventListener("click", () => {
      clearEvaluationState();
      state.selectedWord = state.selectedWord === word ? "" : word;
      saveCurrentQuizDraft();
      renderOptions();
      renderQuestions();
    });
    elements.optionList.appendChild(button);
  });
}

function renderResults() {
  const dialogTitle = state.resultDialogPayload?.title || "答案解析";
  const items = Array.isArray(state.resultDialogPayload?.items)
    ? state.resultDialogPayload.items
    : Array.isArray(state.quiz?.items)
      ? state.quiz.items
      : [];
  const showIndex = state.resultDialogPayload?.showIndex !== false;

  elements.resultDialogTitle.textContent = dialogTitle;
  elements.resultList.innerHTML = "";
  items.forEach((item, index) => {
    const examplesHtml = Array.isArray(item.examples) && item.examples.length
      ? item.examples
          .map(
            (example, exampleIndex) => `
              <div class="example-item">
                <p>
                  <button
                    type="button"
                    class="example-tts-btn pronounce-btn"
                    data-tts-text="${escapeHtmlAttribute(example.en)}"
                    aria-label="朗读例句 ${exampleIndex + 1}"
                    title="朗读"
                  >
                    ${PRONOUNCE_ICON}
                  </button>
                  ${highlightExampleWord(example.en, item.word)}
                </p>
                <p>${escapeHtml(example.cn)}</p>
              </div>
            `
          )
          .join("")
      : '<div class="example-item"><p>当前暂无本地例句。</p></div>';
    const accentText = String(item.accent || "").trim();
    const accentHtml = accentText ? `<p class="result-phonetic">${escapeHtml(accentText)}</p>` : "";

    const section = document.createElement("section");
    section.className = "result-item";
    section.innerHTML = `
      <div class="result-item-header">
        <h4>${showIndex ? `${index + 1}. ` : ""}${item.word}</h4>
        <span class="result-item-actions">
          ${createInlinePronounceButton(item.word, "result-pronounce-btn")}
          ${createInlineCollectButton(item.word, item.wordCn, "result-collect-btn")}
        </span>
      </div>
      ${accentHtml}
      <p>${item.wordCn}</p>
      <p>${item.defCn}</p>
      <p class="result-def-en">${item.defEn}</p>
      <div class="example-list">${examplesHtml}</div>
    `;
    elements.resultList.appendChild(section);
  });
}

function openResultDialog(payload = null) {
  state.resultDialogPayload = payload;
  renderResults();
  elements.dialog.showModal();
}

function onSlotClick(index) {
  const placedWord = state.placements[index];
  if (placedWord) {
    clearEvaluationState();
    if (state.selectedWord) {
      state.placements[index] = state.selectedWord;
      state.selectedWord = "";
      saveCurrentQuizDraft();
      renderQuestions();
      renderOptions();
      return;
    }
    state.placements[index] = "";
    if (!state.selectedWord) {
      state.selectedWord = placedWord;
    }
    saveCurrentQuizDraft();
    renderQuestions();
    renderOptions();
    return;
  }

  if (!state.selectedWord) {
    showToast("先点击下方一个单词，再点上方空格。");
    return;
  }

  clearEvaluationState();
  state.placements[index] = state.selectedWord;
  state.selectedWord = "";
  saveCurrentQuizDraft();
  renderQuestions();
  renderOptions();
}

async function loadQuiz(options = {}) {
  const { forceNew = false, fromHome = false } = options;
  if (elements.dialog.open) {
    elements.dialog.close();
  }

  if (fromHome) {
    state.quizPast = [];
    state.quizFuture = [];
  }

  if (!forceNew) {
    const draft = getQuizDraft(state.mode);
    if (draft) {
      restoreQuizDraft(draft);
      if (fromHome) {
        state.quizPast = [];
        state.quizFuture = [];
      }
      renderQuizNavButtons();
      return;
    }
  }

  const preloadEntry = getPreloadEntry(state.mode);
  const hasReadyPreload = Boolean(preloadEntry.data);
  state.loading = !hasReadyPreload && !shouldSkipAiLoading();
  state.placements = Array(5).fill("");
  state.optionOrder = [];
  state.selectedWord = "";
  state.evaluationResult = null;
  state.quiz = null;
  state.currentHistoryId = new Date().toISOString();
  setView("quiz");
  renderQuizHeader();
  if (state.loading) {
    startLoadingProgress();
  } else {
    if (state.loadingTimer) {
      window.clearInterval(state.loadingTimer);
      state.loadingTimer = null;
    }
    state.loadingPercent = 0;
    renderLoadingProgress();
    renderQuestions();
    renderOptions();
  }
  renderLoadingState();
  renderSubmitButton();
  renderQuizNavButtons();

  try {
    const data = await resolveQuizData(state.mode);

    if (state.loading) {
      await finishLoadingProgress();
    }
    state.loading = false;
    state.quiz = data;
    state.optionOrder = shuffleWords(data.items.map((item) => item.word));
    buildWordColorMap(state.optionOrder);
    saveCurrentQuizDraft();
    renderLoadingState();
    renderQuestions();
    renderOptions();
    renderSubmitButton();
    renderQuizNavButtons();
  } catch (error) {
    if (state.loading) {
      await finishLoadingProgress();
    }
    state.loading = false;
    state.optionOrder = [];
    state.evaluationResult = null;
    state.quiz = null;
    renderLoadingState();
    renderSubmitButton();
    renderQuizNavButtons();
    showToast(error.message || "题目加载失败", "error", 2600);
  }
}

function submitQuiz() {
  if (!state.quiz) {
    return;
  }

  if (state.evaluationResult) {
    openResultDialog();
    return;
  }

  if (state.placements.some((word) => !word)) {
    showToast("还有空格未填写，填满 5 个答案后再提交。", "error");
    return;
  }

  state.evaluationResult = state.quiz.items.map((item, index) => state.placements[index] === item.word);
  upsertHistoryRecord();
  saveCurrentQuizDraft();
  warmNextQuiz(state.mode);
  renderQuestions();
  renderSubmitButton();
  showToast("已完成判题，可查看释义或继续调整。");
}

function bindEvents() {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      persistLearningProgress();
    }
  });
  window.addEventListener("pagehide", () => {
    persistLearningProgress();
  });
  if (elements.welcomeHintCloseBtn) {
    elements.welcomeHintCloseBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      hideWelcomeHintBubble();
    });
  }
  document.addEventListener("click", (event) => {
    if (!elements.welcomeHintBubble.classList.contains("is-hidden")) {
      const target = event.target;
      const isInsideBubble = elements.welcomeHintBubble.contains(target);
      const isInsideAvatar = elements.settingsEntryBtn.contains(target);
      if (!isInsideBubble && !isInsideAvatar) {
        hideWelcomeHintBubble();
      }
    }
  });

  elements.themeToggleBtns.forEach((button) => {
    button.addEventListener("click", (event) => {
      toggleThemeWithTransition(event);
    });
  });
  elements.authDialog.addEventListener("click", (event) => {
    const rect = elements.authDialog.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!inside) {
      if (captchaState.isOpen) {
        return;
      }
      closeAuthDialog();
      syncToastHost();
    }
  });
  elements.authDialog.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!captchaState.isOpen) {
        elements.authForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      }
    }
    if (event.key === "Escape") {
      if (captchaState.isOpen) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  });
  elements.authLoginTabBtn.addEventListener("click", () => {
    setAuthMode("login");
  });
  elements.authRegisterTabBtn.addEventListener("click", () => {
    setAuthMode("register");
  });
  elements.authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitAuthForm();
  });
  elements.authForm.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusAdjacentAuthInput(-1);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusAdjacentAuthInput(1);
      return;
    }
    if (event.key === "Enter") {
      if (captchaState.isOpen) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }
  });
  elements.historyEntryBtn.addEventListener("click", () => {
    if (!requireAuthFromHomeEntry()) {
      return;
    }
    state.historySection = state.historyRecords.length ? "quiz" : state.flashHistoryRecords.length ? "flash" : "quiz";
    resetHistoryVisibleCount();
    renderHistory();
    setView("history");
  });
  elements.flashHistoryBtn.addEventListener("click", () => {
    state.historySection = state.historySection === "flash" ? "quiz" : "flash";
    resetHistoryVisibleCount();
    renderHistory();
  });
  elements.historyFilterBtn?.addEventListener("click", () => {
    state.historyWrongOnly = !state.historyWrongOnly;
    resetHistoryVisibleCount();
    renderHistory();
  });
  elements.historyBackBtn.addEventListener("click", () => {
    setView("home");
  });
  elements.flashBackHomeBtn.addEventListener("click", () => {
    if (state.flashLoadingTimer) {
      window.clearInterval(state.flashLoadingTimer);
      state.flashLoadingTimer = null;
    }
    state.flashLoading = false;
    state.flashLoadingPercent = 0;
    saveCurrentFlashCache();
    renderFlashLoadingState();
    setView("home");
  });
  elements.readingBackHomeBtn.addEventListener("click", () => {
    if (state.readingLoadingTimer) {
      window.clearInterval(state.readingLoadingTimer);
      state.readingLoadingTimer = null;
    }
    state.readingLoading = false;
    state.readingLoadingPercent = 0;
    state.readingPast = [];
    state.readingFuture = [];
    if (state.readingExercise) {
      saveReadingCache(createReadingSnapshot());
    } else {
      clearReadingCache();
    }
    renderReadingLoadingState();
    setView("home");
  });
  elements.readingWordListBtn.addEventListener("click", () => {
    openReadingWordListDialog();
  });
  elements.readingTitleCard.addEventListener("toggle", () => {
    if (!state.readingExercise?.titleCn) {
      state.readingTitleOpen = false;
      syncReadingTitleCardState();
      return;
    }
    state.readingTitleOpen = elements.readingTitleCard.open;
    syncReadingTitleCardState();
    renderReadingToggleAllButton();
    saveReadingCache(createReadingSnapshot());
  });
  elements.readingPrevBtn.addEventListener("click", () => {
    goToPrevReadingExercise();
  });
  elements.readingToggleAllBtn.addEventListener("click", () => {
    setReadingAllExpanded(!isReadingFullyExpanded());
  });
  elements.readingNextBtn.addEventListener("click", () => {
    goToNextReadingExercise();
  });
  elements.flashPrevBtn.addEventListener("click", goToPrevFlashQuestion);
  elements.flashNextBtn.addEventListener("click", () => {
    goToNextFlashQuestion();
  });
  elements.flashHintBtn.addEventListener("click", () => {
    if (!state.flashCurrent) {
      return;
    }
    if (!state.flashEvaluation) {
      state.flashHintExampleVisible = true;
      renderFlashQuestion();
      saveCurrentFlashCache();
    } else {
      state.flashDetailVisible = !state.flashDetailVisible;
      if (state.flashDetailVisible) {
        state.flashHintExampleVisible = false;
      }
      renderFlashQuestion();
      saveCurrentFlashCache();
    }
  });
  elements.flashPhonetic.addEventListener("click", (event) => {
    const ttsBtn = event.target.closest(".flash-phonetic-tts-btn");
    if (ttsBtn) {
      event.preventDefault();
      event.stopPropagation();
      playWordPronunciation(ttsBtn.dataset.word || "", ttsBtn);
      return;
    }
  });
  elements.flashDetail.addEventListener("click", (event) => {
    const ttsBtn = event.target.closest(".example-tts-btn");
    if (!ttsBtn) {
      return;
    }
    speakEnglishText(ttsBtn.dataset.ttsText || "", ttsBtn);
  });
  elements.backHomeBtn.addEventListener("click", () => {
    if (elements.dialog.open) {
      elements.dialog.close();
    }
    saveCurrentQuizDraft();
    if (state.loadingTimer) {
      window.clearInterval(state.loadingTimer);
      state.loadingTimer = null;
    }
    state.loadingPercent = 0;
    state.loading = false;
    state.selectedWord = "";
    state.optionOrder = [];
    state.evaluationResult = null;
    renderLoadingState();
    renderSubmitButton();
    setView("home");
  });
  elements.closeCaptchaDialogBtn?.addEventListener("click", closeCaptchaDialog);
  elements.captchaDialog?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
    }
  });
  elements.captchaShapes?.addEventListener("click", (event) => {
    const shapeEl = event.target.closest(".captcha-shape");
    if (!shapeEl) {
      return;
    }
    const shapeType = shapeEl.dataset.shapeType;
    if (shapeType === captchaState.targetShape?.type) {
      const callback = captchaState.callback;
      closeCaptchaDialog();
      if (typeof callback === "function") {
        callback(true);
      }
      captchaState.callback = null;
    } else {
      showToast("验证失败，请重试", "error", 2000);
      closeCaptchaDialog();
      captchaState.callback = null;
    }
  });
  elements.prevBtn.addEventListener("click", goToPrevQuizQuestion);
  elements.nextBtn.addEventListener("click", goToNextQuizQuestion);
  elements.submitBtn.addEventListener("click", submitQuiz);
  elements.closeDialogBtn.addEventListener("click", () => {
    if (elements.dialog.open) {
      elements.dialog.close();
    }
    syncToastHost();
  });
  elements.dialog.addEventListener("click", (event) => {
    const rect = elements.dialog.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!inside) {
      if (elements.dialog.open) {
        elements.dialog.close();
      }
      syncToastHost();
    }
  });
  elements.dialog.addEventListener("close", () => {
    syncToastHost();
  });
  elements.historyList.addEventListener("click", (event) => {
    const historyDefTtsBtn = event.target.closest(".history-def-tts-btn");
    if (historyDefTtsBtn) {
      event.preventDefault();
      event.stopPropagation();
      speakEnglishText(historyDefTtsBtn.dataset.ttsText || "", historyDefTtsBtn);
      return;
    }

    const pronounceBtn = event.target.closest(".history-pronounce-btn, .flash-history-pronounce-btn");
    if (pronounceBtn) {
      playWordPronunciation(pronounceBtn.dataset.word || "", pronounceBtn);
      return;
    }

    const collectBtn = event.target.closest(".history-collect-btn, .flash-history-collect-btn");
    if (collectBtn) {
      const word = collectBtn.dataset.word || "";
      const wordCn = collectBtn.dataset.wordCn || "";
      toggleCollection({ word, wordCn }).then((result) => {
        refreshCollectUi();
        if (result === "added") {
          showToast("已收藏", "success");
        } else if (result === "removed") {
          showToast("已取消收藏", "success");
        } else {
          showToast("收藏操作失败", "error");
        }
      });
      return;
    }

    const flashHistoryItem = event.target.closest(".flash-history-item");
    if (flashHistoryItem) {
      const nextLang = flashHistoryItem.dataset.lang === "cn" ? "en" : "cn";
      flashHistoryItem.dataset.lang = nextLang;
      const wordNode = flashHistoryItem.querySelector(".flash-history-word");
      if (wordNode) {
        wordNode.textContent = nextLang === "cn"
          ? flashHistoryItem.dataset.wordCn || ""
          : flashHistoryItem.dataset.wordEn || "";
      }
      return;
    }

    const question = event.target.closest(".history-question");
    if (!question) {
      return;
    }
    const defNode = question.querySelector(".history-def");
    const answerNode = question.querySelector(".history-answer");
    const currentLang = question.dataset.lang === "cn" ? "cn" : "en";
    const nextLang = currentLang === "en" ? "cn" : "en";
    question.dataset.lang = nextLang;
    const label = question.dataset.index || "";
    const defText = `${label ? `${label}. ` : ""}${nextLang === "en" ? question.dataset.defEn || "" : question.dataset.defCn || ""}`;
    
    if (nextLang === "en") {
      const ttsText = question.dataset.defEn || "";
      defNode.innerHTML = `
        <button
          type="button"
          class="history-def-tts-btn pronounce-btn"
          data-tts-text="${escapeHtmlAttribute(ttsText)}"
          aria-label="朗读释义"
          title="朗读"
        >
          ${PRONOUNCE_ICON}
        </button>
        ${defText}
      `;
    } else {
      defNode.textContent = defText;
    }
    
    if (answerNode) {
      answerNode.textContent = nextLang === "en" ? question.dataset.answerEn || "" : question.dataset.answerCn || "";
    }
  });
  elements.collectionEntryBtn.addEventListener("click", () => {
    if (!requireAuthFromHomeEntry()) {
      return;
    }
    resetCollectionVisibleCount();
    renderCollection();
    setView("collection");
  });
  elements.collectionFlashBtn.addEventListener("click", () => {
    startCollectionFlashTraining();
  });
  elements.collectionReadingBtn.addEventListener("click", () => {
    startCollectionReadingTraining();
  });
  elements.collectionBackBtn.addEventListener("click", () => {
    setView("home");
  });
  if (elements.siteInfoBtn) {
    elements.siteInfoBtn.addEventListener("click", () => {
      openSiteInfoDialog();
    });
  }
  if (elements.closeSiteInfoDialogBtn) {
    elements.closeSiteInfoDialogBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeSiteInfoDialog();
    });
  }
  if (elements.siteInfoDialog) {
    elements.siteInfoDialog.addEventListener("click", (event) => {
      if (event.target === elements.siteInfoDialog) {
        closeSiteInfoDialog();
      }
    });
  }
  elements.settingsEntryBtn.addEventListener("click", () => {
    if (!requireAuthFromHomeEntry()) {
      return;
    }
    renderSessionUi();
    setView("settings");
  });
  if (elements.settingsBookBtn) {
    elements.settingsBookBtn.addEventListener("click", () => {
      openBookDialog();
    });
  }
  if (elements.closeBookDialogBtn) {
    elements.closeBookDialogBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeBookDialog();
    });
  }
  if (elements.bookDialog) {
    elements.bookDialog.addEventListener("click", (event) => {
      if (event.target === elements.bookDialog) {
        closeBookDialog();
      }
    });
  }
  if (elements.bookDialogList) {
    elements.bookDialogList.addEventListener("click", (event) => {
      const card = event.target.closest(".book-card");
      if (!card) {
        return;
      }
      const bookId = Math.max(1, Number(card.dataset.bookId || 0));
      closeBookDialog();
      void updateUserBook(bookId);
    });
  }
  elements.settingsBackBtn.addEventListener("click", () => {
    setView("home");
  });
  elements.saveApiKeyBtn.addEventListener("click", () => {
    savePersonalApiKey();
  });
  elements.clearApiKeyBtn.addEventListener("click", () => {
    clearPersonalApiKey();
  });
  elements.clearHistoryBtn.addEventListener("click", () => {
    clearUserHistory();
  });
  elements.settingsLogoutBtn.addEventListener("click", () => {
    logout();
  });
  elements.settingsDeleteAccountBtn.addEventListener("click", () => {
    deleteAccount();
  });
  elements.settingsNicknameEditBtn.addEventListener("click", () => {
    const currentNickname = state.currentUser?.nickname || state.currentUser?.username || "";
    elements.settingsNicknameInput.value = currentNickname;
    elements.settingsNicknameDisplay.classList.add("is-hidden");
    elements.settingsNicknameEdit.classList.remove("is-hidden");
    elements.settingsNicknameInput.focus();
  });
  async function saveNickname() {
    const newNickname = elements.settingsNicknameInput.value.trim();
    if (!newNickname) {
      showToast("昵称不能为空", "error");
      return;
    }
    try {
      const data = await requestJson("/api/user/nickname", {
        method: "POST",
        body: JSON.stringify({ nickname: newNickname })
      });
      state.currentUser = data.user || state.currentUser;
      elements.settingsNicknameDisplay.classList.remove("is-hidden");
      elements.settingsNicknameEdit.classList.add("is-hidden");
      renderSessionUi();
      showToast("昵称已更新", "success");
    } catch (error) {
      showToast(error.message || "更新失败", "error");
    }
  }

  elements.settingsNicknameCancelBtn.addEventListener("click", () => {
    elements.settingsNicknameDisplay.classList.remove("is-hidden");
    elements.settingsNicknameEdit.classList.add("is-hidden");
  });
  elements.settingsNicknameSaveBtn.addEventListener("click", saveNickname);
  elements.settingsNicknameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveNickname();
    }
  });

  async function savePassword() {
    const oldPassword = elements.settingsPasswordOldInput.value.trim();
    const newPassword = elements.settingsPasswordNewInput.value.trim();
    const confirmPassword = elements.settingsPasswordConfirmInput.value.trim();

    if (!oldPassword) {
      showToast("请输入旧密码", "error");
      elements.settingsPasswordOldInput.focus();
      return;
    }
    if (!newPassword) {
      showToast("请输入新密码", "error");
      elements.settingsPasswordNewInput.focus();
      return;
    }
    if (newPassword.length < 6) {
      showToast("新密码至少 6 位", "error");
      elements.settingsPasswordNewInput.focus();
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("两次输入的新密码不一致", "error");
      elements.settingsPasswordConfirmInput.focus();
      return;
    }

    try {
      await requestJson("/api/user/password", {
        method: "POST",
        body: JSON.stringify({
          oldPassword: oldPassword,
          newPassword: newPassword
        })
      });

      elements.settingsPasswordOldInput.value = "";
      elements.settingsPasswordNewInput.value = "";
      elements.settingsPasswordConfirmInput.value = "";
      elements.settingsPasswordDisplay.classList.remove("is-hidden");
      elements.settingsPasswordEdit.classList.add("is-hidden");
      showToast("密码已更新", "success");
    } catch (error) {
      showToast(error.message || "更新失败", "error");
    }
  }

  elements.settingsPasswordEditBtn.addEventListener("click", () => {
    elements.settingsPasswordDisplay.classList.add("is-hidden");
    elements.settingsPasswordEdit.classList.remove("is-hidden");
    elements.settingsPasswordOldInput.focus();
  });

  elements.settingsPasswordCancelBtn.addEventListener("click", () => {
    elements.settingsPasswordOldInput.value = "";
    elements.settingsPasswordNewInput.value = "";
    elements.settingsPasswordConfirmInput.value = "";
    elements.settingsPasswordDisplay.classList.remove("is-hidden");
    elements.settingsPasswordEdit.classList.add("is-hidden");
  });

  elements.settingsPasswordSaveBtn.addEventListener("click", savePassword);
  elements.settingsPasswordConfirmInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      savePassword();
    }
  });

  elements.settingsApiKeyInput.addEventListener("input", () => {
    setApiKeyValidationState();
    renderApiKeyAvailabilityStatus(elements.settingsApiKeyInput.value);
  });
  elements.flashCollectBtn.addEventListener("click", () => {
    toggleCollect();
  });
  elements.collectionList.addEventListener("click", (event) => {
    const pronounceBtn = event.target.closest(".collection-pronounce-btn");
    if (pronounceBtn) {
      playWordPronunciation(pronounceBtn.dataset.word || "", pronounceBtn);
      return;
    }

    const removeBtn = event.target.closest(".collection-remove-btn");
    if (removeBtn) {
      const word = removeBtn.dataset.word || "";
      removeCollectionItem(word).then((success) => {
        if (success) {
          renderCollection();
          showToast("已取消收藏", "success");
        } else {
          showToast("删除失败", "error");
        }
      });
      return;
    }

    const collectionItem = event.target.closest(".collection-item");
    if (collectionItem) {
      const nextLang = collectionItem.dataset.lang === "cn" ? "en" : "cn";
      collectionItem.dataset.lang = nextLang;
      const wordNode = collectionItem.querySelector(".collection-word");
      if (wordNode) {
        wordNode.textContent = nextLang === "cn"
          ? collectionItem.dataset.wordCn || ""
          : collectionItem.dataset.wordEn || "";
      }
    }
  });
  elements.resultList.addEventListener("click", (event) => {
    const exampleBtn = event.target.closest(".example-tts-btn");
    if (exampleBtn) {
      speakEnglishText(exampleBtn.dataset.ttsText || "", exampleBtn);
      return;
    }
    const pronounceBtn = event.target.closest(".result-pronounce-btn");
    if (pronounceBtn) {
      playWordPronunciation(pronounceBtn.dataset.word || "", pronounceBtn);
      return;
    }

    const collectBtn = event.target.closest(".result-collect-btn");
    if (!collectBtn) {
      return;
    }

    const word = collectBtn.dataset.word || "";
    const wordCn = collectBtn.dataset.wordCn || "";
    toggleCollection({ word, wordCn }).then((result) => {
      refreshCollectUi();
      if (result === "added") {
        showToast("已收藏", "success");
      } else if (result === "removed") {
        showToast("已取消收藏", "success");
      } else {
        showToast("收藏操作失败", "error");
      }
    });
  });
  elements.wordleBackHomeBtn.addEventListener("click", () => {
    setView("home");
  });
  
  if (elements.wordleSurrenderBtn) {
    elements.wordleSurrenderBtn.addEventListener("click", () => {
      if (!wordleState.gameOver && !wordleState.isRevealing) {
        elements.wordleSurrenderConfirmDialog.showModal();
      }
    });
  }
  
  if (elements.wordleSurrenderCancelBtn) {
    elements.wordleSurrenderCancelBtn.addEventListener("click", () => {
      elements.wordleSurrenderConfirmDialog.close();
    });
  }
  
  if (elements.wordleSurrenderConfirmBtn) {
    elements.wordleSurrenderConfirmBtn.addEventListener("click", async () => {
      elements.wordleSurrenderConfirmDialog.close();
      wordleState.guesses.push(wordleState.targetWord);
      wordleState.gameOver = true;
      wordleState.surrendered = true;
      clearWordleCache();
      renderWordleGrid();
      await syncWordleResult(false);
      await showWordleResultDialog(false);
    });
  }
  
  if (elements.wordleHelpBtn) {
    elements.wordleHelpBtn.addEventListener("click", () => {
      elements.wordleHelpDialog.showModal();
    });
  }
  
  if (elements.closeWordleHelpBtn) {
    elements.closeWordleHelpBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      elements.wordleHelpDialog.close();
    });
  }
  
  if (elements.wordleHelpDialog) {
    elements.wordleHelpDialog.addEventListener("click", (event) => {
      if (event.target === elements.wordleHelpDialog) {
        elements.wordleHelpDialog.close();
      }
    });
  }
  
  if (elements.closeWordleResultBtn) {
    elements.closeWordleResultBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      elements.wordleResultDialog.close();
    });
  }
  
  if (elements.wordleResultDialog) {
    elements.wordleResultDialog.addEventListener("click", (event) => {
      if (event.target === elements.wordleResultDialog) {
        elements.wordleResultDialog.close();
      }
    });
  }
  
  if (elements.wordleNewGameBtn) {
    elements.wordleNewGameBtn.addEventListener("click", (event) => {
      elements.wordleResultDialog.close();
      startWordleGame();
    });
  }
  
  if (elements.wordleResultAccent) {
    elements.wordleResultAccent.addEventListener("click", (event) => {
      const ttsBtn = event.target.closest(".wordle-result-word-tts-btn");
      if (ttsBtn) {
        event.preventDefault();
        event.stopPropagation();
        playWordPronunciation(ttsBtn.dataset.word || "", ttsBtn);
        return;
      }
    });
  }
  
  if (elements.wordleResultExamples) {
    elements.wordleResultExamples.addEventListener("click", (event) => {
      const ttsBtn = event.target.closest(".wordle-result-example-tts-btn");
      if (ttsBtn) {
        event.preventDefault();
        event.stopPropagation();
        speakEnglishText(ttsBtn.dataset.ttsText || "", ttsBtn);
        return;
      }
    });
  }
  
  document.addEventListener("click", (event) => {
    if (!elements.wordleWordPreview.classList.contains("is-hidden")) {
      const clickedPreview = event.target.closest(".wordle-word-preview");
      if (!clickedPreview) {
        hideWordleWordPreview();
      }
    }
  });
  
  if (elements.wordleLeaderboardBtn) {
    elements.wordleLeaderboardBtn.addEventListener("click", async () => {
      await showWordleLeaderboardDialog();
    });
  }
  
  if (elements.closeWordleLeaderboardBtn) {
    elements.closeWordleLeaderboardBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      elements.wordleLeaderboardDialog.close();
    });
  }
  
  if (elements.wordleLeaderboardDialog) {
    elements.wordleLeaderboardDialog.addEventListener("click", (event) => {
      if (event.target === elements.wordleLeaderboardDialog) {
        elements.wordleLeaderboardDialog.close();
      }
    });
  }
}

const WORDLE_KEYBOARD_LAYOUT = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "⌫"],
  ["Z", "X", "C", "V", "B", "N", "M", "Enter"]
];

const WORDLE_REVEAL_STEP_MS = 140;
const WORDLE_REVEAL_DURATION_MS = 520;

let wordleState = {
  targetWord: "",
  guesses: [],
  currentGuess: "",
  gameOver: false,
  isRevealing: false,
  answers: [],
  validWords: [],
  keyStates: {},
  resultDialogClosed: false,
  previewWordInfo: null,
  previewHideTimer: null,
  surrendered: false
};

async function loadWordleWords() {
  try {
    const response = await fetch("/api/wordle/words");
    const data = await response.json();
    if (data.ok && data.answers && data.validWords) {
      wordleState.answers = data.answers;
      wordleState.validWords = data.validWords;
    } else {
      throw new Error("Invalid response");
    }
  } catch (err) {
    console.error("Failed to load Wordle words:", err);
    wordleState.answers = [
      "apple", "table", "chair", "water", "music"
    ];
    wordleState.validWords = [
      "abase", "abate", "abide", "abode", "abort", "about", "above", "abuse", "acorn", "actor",
      "acute", "adapt", "adept", "admit", "adopt", "adore", "adorn", "adult", "after", "again",
      "agent", "agile", "agony", "agree", "ahead", "alarm", "album", "alert", "alike", "alive"
    ];
  }
}

function initWordleGame() {
  if (!wordleState.validWords.length) {
    loadWordleWords();
  }
}

async function startWordleGame() {
  if (!wordleState.validWords.length) {
    await loadWordleWords();
  }
  
  if (wordleState.answers.length) {
    wordleState.targetWord = wordleState.answers[Math.floor(Math.random() * wordleState.answers.length)].toLowerCase();
  } else {
    wordleState.targetWord = "apple";
  }

  hideWordleWordPreview();
  wordleState.guesses = [];
  wordleState.currentGuess = "";
  wordleState.gameOver = false;
  wordleState.isRevealing = false;
  wordleState.keyStates = {};
  wordleState.resultDialogClosed = false;
  wordleState.surrendered = false;
  
  saveWordleCache(createWordleSnapshot());
  
  setView("wordle");
  renderWordleGame();
}

function renderWordleGame(skipLastRowColor = false) {
  renderWordleGrid(null, skipLastRowColor);
  renderWordleKeyboard();
}

function renderWordleLeaderboardItem(item, rank) {
  const el = document.createElement("div");
  el.className = "wordle-leaderboard-item";
  
  el.innerHTML = `
    <span class="wordle-leaderboard-rank">${rank}</span>
    <span class="wordle-leaderboard-username">${item.nickname || item.username}</span>
    <span class="wordle-leaderboard-streak-wrap">
      <span class="wordle-leaderboard-streak">${item.bestStreak}</span>
      <span class="wordle-leaderboard-streak-label">最高连胜</span>
    </span>
  `;
  return el;
}

function renderWordleLeaderboard(list) {
  elements.wordleLeaderboardList.innerHTML = "";
  list.forEach((item, index) => {
    const el = renderWordleLeaderboardItem(item, index + 1);
    elements.wordleLeaderboardList.appendChild(el);
  });
}

function renderWordleLeaderboardSelf(rank, username, currentStreak, bestStreak, nickname) {
  elements.wordleLeaderboardSelfRank.textContent = rank ?? "-";
  elements.wordleLeaderboardSelfUsername.textContent = nickname || username || "-";
  elements.wordleLeaderboardSelfCurrentStreak.textContent = currentStreak ?? "-";
  elements.wordleLeaderboardSelfBestStreak.textContent = bestStreak ?? "-";
}

async function syncWordleResult(won) {
  if (!state.isAuthenticated) {
    return;
  }

  try {
    const data = await requestJson("/api/wordle/result", {
      method: "POST",
      body: JSON.stringify({ won: Boolean(won) })
    });
    state.currentUser = data.user || state.currentUser;
    renderSessionUi();
  } catch (error) {
    console.error("Failed to sync Wordle result:", error);
  }
}

async function showWordleLeaderboardDialog() {
  try {
    const data = await requestJson("/api/wordle/leaderboard");
    const leaderboard = Array.isArray(data.leaderboard) ? data.leaderboard : [];
    const self = data.self || null;

    renderWordleLeaderboard(leaderboard);
    renderWordleLeaderboardSelf(
      self?.rank || "-", 
      self?.username || "-", 
      self?.currentStreak ?? "-", 
      self?.bestStreak ?? "-",
      self?.nickname
    );
    elements.wordleLeaderboardDialog.showModal();
  } catch (error) {
    showToast(error.message || "加载排行榜失败", "error");
  }
}

function renderWordleGrid(animateCol = null, skipLastRowColor = false) {
  elements.wordleGrid.innerHTML = "";
  
  for (let row = 0; row < 6; row++) {
    const rowEl = document.createElement("div");
    rowEl.className = "wordle-row";
    
    for (let col = 0; col < 5; col++) {
      const cell = document.createElement("div");
      cell.className = "wordle-cell";
      
      const guess = wordleState.guesses[row];
      if (guess) {
        const letter = guess[col];
        cell.textContent = letter.toUpperCase();
        const isLastRow = row === wordleState.guesses.length - 1;
        if (!skipLastRowColor || !isLastRow) {
          const result = getLetterResult(guess, col);
          cell.classList.add(`is-${result}`);
        }
      } else if (row === wordleState.guesses.length && wordleState.currentGuess[col]) {
        cell.textContent = wordleState.currentGuess[col].toUpperCase();
        cell.classList.add("is-filled");
        if (animateCol === col) {
          cell.classList.add("is-pop");
        }
      }
      
      rowEl.appendChild(cell);
    }
    
    elements.wordleGrid.appendChild(rowEl);
  }
}

function animateWordleRevealRow(rowIndex) {
  const row = elements.wordleGrid.querySelectorAll(".wordle-row")[rowIndex];
  if (!row) {
    return 0;
  }

  const guess = wordleState.guesses[rowIndex];
  const cells = [...row.querySelectorAll(".wordle-cell")];
  cells.forEach((cell, index) => {
    cell.classList.remove("is-flip");
    cell.style.animationDelay = `${index * WORDLE_REVEAL_STEP_MS}ms`;
    void cell.offsetWidth;
    
    const result = getLetterResult(guess, index);
    cell.classList.add("is-flip");
    
    window.setTimeout(() => {
      cell.classList.add(`is-${result}`);
    }, WORDLE_REVEAL_DURATION_MS / 2 + index * WORDLE_REVEAL_STEP_MS);
    
    window.setTimeout(() => {
      cell.classList.remove("is-flip");
      cell.style.animationDelay = "";
    }, WORDLE_REVEAL_DURATION_MS + index * WORDLE_REVEAL_STEP_MS);
  });

  return WORDLE_REVEAL_DURATION_MS + Math.max(cells.length - 1, 0) * WORDLE_REVEAL_STEP_MS;
}

function getLetterResult(guess, index) {
  const target = wordleState.targetWord;
  const letter = guess[index];
  
  if (letter === target[index]) {
    return "correct";
  }
  
  if (target.includes(letter)) {
    const targetLetters = target.split("");
    const guessLetters = guess.split("");
    
    for (let i = 0; i < 5; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        targetLetters[i] = null;
        guessLetters[i] = null;
      }
    }
    
    let assignedBefore = 0;
    for (let i = 0; i < index; i++) {
      if (guessLetters[i] === letter && targetLetters.includes(letter)) {
        assignedBefore++;
        targetLetters[targetLetters.indexOf(letter)] = null;
      }
    }
    
    if (targetLetters.includes(letter)) {
      return "present";
    }
  }
  
  return "absent";
}

function renderWordleKeyboard() {
  elements.wordleKeyboard.innerHTML = "";
  
  WORDLE_KEYBOARD_LAYOUT.forEach(row => {
    const rowEl = document.createElement("div");
    rowEl.className = "wordle-keyboard-row";
    
    row.forEach(key => {
      const button = document.createElement("button");
      button.className = "wordle-key";
      button.dataset.key = key;
      button.setAttribute('tabindex', '-1');
      const releasePressedState = () => button.classList.remove("is-pressed");
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          e.stopPropagation();
        }
      });
      button.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          e.stopPropagation();
        }
      });
      button.addEventListener('focus', (e) => {
        e.preventDefault();
        button.blur();
      });
      button.addEventListener("pointerdown", () => {
        button.classList.add("is-pressed");
      });
      button.addEventListener("pointerup", releasePressedState);
      button.addEventListener("pointerleave", releasePressedState);
      button.addEventListener("pointercancel", releasePressedState);
      
      if (key === "⌫") {
        button.innerHTML = `<svg viewBox="0 0 1024 1024" width="26" height="26" aria-hidden="true"><path d="M494.48 673.68l113.136-113.152 113.152 113.136 56.56-56.56-113.136-113.12 113.136-113.152-56.56-56.56-113.152 113.136-113.136-113.136-56.56 56.56 113.136 113.136-113.136 113.136 56.56 56.56zM324.912 160L22.576 508.64 325.264 848H1008V160H324.912zM928 768H361.2L128.928 507.904 361.536 240H928v528z" fill="currentColor"></path></svg>`;
      } else {
        button.textContent = key;
      }
      
      if (key === "Enter") {
        button.classList.add("is-enter");
      } else if (key === "⌫") {
        button.classList.add("is-backspace");
      }
      
      const normalizedKey = key === "ENTER" ? "ENTER" : key === "⌫" ? "BACKSPACE" : key.toLowerCase();
      if (wordleState.keyStates[normalizedKey]) {
        button.classList.add(`is-${wordleState.keyStates[normalizedKey]}`);
      }
      
      button.addEventListener("click", () => handleWordleKey(key));
      rowEl.appendChild(button);
    });
    
    elements.wordleKeyboard.appendChild(rowEl);
  });
}

async function showWordleWordPreview(word) {
  if (!word || word.length !== 5 || !wordleState.validWords.includes(word)) {
    hideWordleWordPreview();
    return;
  }
  
  if (wordleState.previewHideTimer) {
    clearTimeout(wordleState.previewHideTimer);
    wordleState.previewHideTimer = null;
  }
  
  try {
    const response = await fetch(`/api/word/info/${word}`);
    const data = await response.json();
    if (data.ok && data.info) {
      wordleState.previewWordInfo = data.info;
      elements.wordlePreviewWord.textContent = word;
      elements.wordlePreviewAccent.textContent = data.info.accent || "";
      elements.wordlePreviewParaphrase.textContent = data.info.paraphrase || "";
      elements.wordleWordPreview.classList.remove("is-hidden");
    } else {
      hideWordleWordPreview();
    }
  } catch (err) {
    console.error("Failed to load word info for preview:", err);
    hideWordleWordPreview();
  }
}

function hideWordleWordPreview() {
  if (wordleState.previewHideTimer) {
    clearTimeout(wordleState.previewHideTimer);
    wordleState.previewHideTimer = null;
  }
  elements.wordleWordPreview.classList.add("is-hidden");
  wordleState.previewWordInfo = null;
}

function handleWordleKey(key) {
  const normalizedKey = key === "Enter" ? "ENTER" : key;
  
  if (wordleState.gameOver && wordleState.resultDialogClosed && normalizedKey === "ENTER") {
    if (wordleState.surrendered) {
      wordleState.resultDialogClosed = false;
      showWordleResultDialog(false);
      return;
    }
    const won = wordleState.guesses[wordleState.guesses.length - 1] === wordleState.targetWord;
    wordleState.resultDialogClosed = false;
    showWordleResultDialog(won);
    return;
  }
  
  if (wordleState.gameOver || wordleState.isRevealing) return;
  
  if (normalizedKey === "ENTER") {
    if (wordleState.currentGuess.length === 5 && wordleState.validWords.includes(wordleState.currentGuess) && wordleState.currentGuess !== wordleState.targetWord) {
      showWordleWordPreview(wordleState.currentGuess);
    }
    submitWordleGuess();
  } else if (key === "⌫") {
    if (wordleState.currentGuess.length > 0) {
      wordleState.currentGuess = wordleState.currentGuess.slice(0, -1);
      renderWordleGrid();
      hideWordleWordPreview();
      if (!wordleState.gameOver) {
        saveWordleCache(createWordleSnapshot());
      }
    }
  } else if (wordleState.currentGuess.length < 5) {
    wordleState.currentGuess += key.toLowerCase();
    renderWordleGrid(wordleState.currentGuess.length - 1);
    hideWordleWordPreview();
    if (!wordleState.gameOver) {
      saveWordleCache(createWordleSnapshot());
    }
  }
}

function submitWordleGuess() {
  if (wordleState.currentGuess.length !== 5) {
    shakeCurrentRow();
    renderWordleMessage("单词不够长");
    return;
  }
  
  if (wordleState.validWords.length && !wordleState.validWords.includes(wordleState.currentGuess)) {
    shakeCurrentRow();
    renderWordleMessage("单词无效");
    return;
  }
  
  const guess = wordleState.currentGuess;
  wordleState.guesses.push(guess);
  
  const won = guess === wordleState.targetWord;
  const lost = wordleState.guesses.length >= 6;
  const revealedRowIndex = wordleState.guesses.length - 1;
  
  wordleState.currentGuess = "";
  wordleState.gameOver = won || lost;
  wordleState.isRevealing = true;
  wordleState.resultDialogClosed = false;
  
  if (wordleState.gameOver) {
    clearWordleCache();
  } else {
    saveWordleCache(createWordleSnapshot());
  }
  
  renderWordleGame(true);
  hideWordleWordPreview();
  const revealDuration = animateWordleRevealRow(revealedRowIndex);
  
  window.setTimeout(() => {
    updateKeyStates(guess);
    renderWordleKeyboard();
  }, revealDuration);
  
  if (won || lost) {
    syncWordleResult(won);
    setTimeout(async () => {
      await showWordleResultDialog(won);
    }, revealDuration + 120);
    return;
  }

  window.setTimeout(() => {
    wordleState.isRevealing = false;
  }, revealDuration);
}

async function showWordleResultDialog(won) {
  const word = wordleState.targetWord;
  
  elements.wordleResultTitle.textContent = won ? "恭喜答对！" : "再接再厉";
  elements.wordleResultWord.textContent = word.toUpperCase();
  elements.wordleResultAccent.innerHTML = `
    <button
      type="button"
      class="wordle-result-word-tts-btn pronounce-btn"
      data-word="${escapeHtmlAttribute(word)}"
      aria-label="朗读单词"
      title="朗读"
    >
      ${PRONOUNCE_ICON}
    </button>
  `;
  elements.wordleResultAccent.classList.remove("is-hidden");
  elements.wordleResultParaphrase.textContent = "";
  elements.wordleResultParaphrase.classList.add("is-hidden");
  elements.wordleResultDefs.innerHTML = "";
  elements.wordleResultDefs.classList.add("is-hidden");
  elements.wordleResultExamples.innerHTML = "";
  elements.wordleResultExamples.classList.add("is-hidden");
  
  const onResultDialogClose = () => {
    wordleState.resultDialogClosed = true;
    elements.wordleResultDialog.removeEventListener("close", onResultDialogClose);
  };
  elements.wordleResultDialog.addEventListener("close", onResultDialogClose);
  
  elements.wordleResultDialog.showModal();
  
  let wordInfo = null;
  try {
    const response = await fetch(`/api/word/info/${word}`);
    const data = await response.json();
    if (data.ok && data.info) {
      wordInfo = data.info;
    }
  } catch (err) {
    console.error("Failed to load word info:", err);
  }
  
  if (wordInfo && wordInfo.accent) {
    elements.wordleResultAccent.innerHTML = `
      <button
        type="button"
        class="wordle-result-word-tts-btn pronounce-btn"
        data-word="${escapeHtmlAttribute(word)}"
        aria-label="朗读单词"
        title="朗读"
      >
        ${PRONOUNCE_ICON}
      </button>
      ${escapeHtml(wordInfo.accent)}
    `;
  }
  
  if (wordInfo && wordInfo.paraphrase) {
    elements.wordleResultParaphrase.textContent = wordInfo.paraphrase;
    elements.wordleResultParaphrase.classList.remove("is-hidden");
  }
  
  if (wordInfo && (wordInfo.wordCn || wordInfo.defEn || wordInfo.defCn)) {
    let defHtml = "";
    if (wordInfo.wordCn) {
      defHtml += `<p class="wordle-result-wordcn">${wordInfo.wordCn}</p>`;
    }
    if (wordInfo.defEn) {
      defHtml += `<p class="wordle-result-defen">${wordInfo.defEn}</p>`;
    }
    if (wordInfo.defCn) {
      defHtml += `<p class="wordle-result-defcn">${wordInfo.defCn}</p>`;
    }
    elements.wordleResultDefs.innerHTML = defHtml;
    elements.wordleResultDefs.classList.remove("is-hidden");
  }
  
  if (wordInfo && wordInfo.examples && wordInfo.examples.length) {
    let examplesHtml = "";
    wordInfo.examples.forEach(example => {
      if (example.en && example.cn) {
        examplesHtml += `
          <div class="wordle-result-example">
            <button
              type="button"
              class="wordle-result-example-tts-btn example-tts-btn"
              data-tts-text="${escapeHtmlAttribute(example.en)}"
              aria-label="朗读例句"
              title="朗读"
            >
              ${PRONOUNCE_ICON}
            </button>
            <p class="wordle-result-example-en">${highlightExampleWord(example.en, word)}</p>
            <p class="wordle-result-example-cn">${example.cn}</p>
          </div>
        `;
      }
    });
    if (examplesHtml) {
      elements.wordleResultExamples.innerHTML = examplesHtml;
      elements.wordleResultExamples.classList.remove("is-hidden");
    }
  }
}

function updateKeyStates(guess) {
  for (let i = 0; i < 5; i++) {
    const letter = guess[i].toLowerCase();
    const result = getLetterResult(guess, i);
    const currentState = wordleState.keyStates[letter];
    
    if (!currentState || 
        (currentState === "absent" && (result === "correct" || result === "present")) ||
        (currentState === "present" && result === "correct")) {
      wordleState.keyStates[letter] = result;
    }
  }
}

function shakeCurrentRow() {
  renderWordleGrid();
  const rows = elements.wordleGrid.querySelectorAll(".wordle-row");
  const currentRow = rows[wordleState.guesses.length];
  if (currentRow) {
    const cells = currentRow.querySelectorAll(".wordle-cell");
    cells.forEach(cell => {
      cell.classList.add("is-shake");
      setTimeout(() => cell.classList.remove("is-shake"), 400);
    });
  }
}

function renderWordleMessage(message) {
  if (message) {
    showToast(message, "error");
  }
}

document.addEventListener("keydown", (event) => {
  if (state.view !== "wordle") return;
  
  if (event.key === "Tab") {
    event.preventDefault();
    return;
  }
  
  if (elements.wordleResultDialog?.open) {
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      elements.wordleResultDialog.close();
      startWordleGame();
    }
    return;
  }
  
  const key = event.key.toUpperCase();
  
  if (key === "ENTER") {
    event.preventDefault();
    event.stopPropagation();
    handleWordleKey("ENTER");
  } else if (key === "BACKSPACE") {
    handleWordleKey("⌫");
  } else if (/^[A-Z]$/.test(key)) {
    handleWordleKey(key);
  }
}, true);

document.addEventListener("keyup", (event) => {
  if (state.view !== "wordle") return;
  
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    event.stopPropagation();
  }
}, true);

initWordleGame();

async function initializeApp() {
  try {
    applyTheme(loadThemePreference());
    clearLegacyLocalData();
    
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(button => {
      button.setAttribute('tabindex', '-1');
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          e.stopPropagation();
        }
      });
      button.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          e.stopPropagation();
        }
      });
      button.addEventListener('focus', (e) => {
        e.preventDefault();
        button.blur();
      });
    });
    
    renderLoadingState();
    renderFlashLoadingState();
    renderSubmitButton();
    renderQuizHeader();
    renderFlashNavButtons();
    renderReadingNavButtons();
    renderQuizNavButtons();
    renderReadingExercise();
    renderHomeModes();
    renderHistory();
    renderCollection();
    renderAccountFeatures();
    renderSessionUi();
    renderAuthMode();
    renderHistoryFilterButton();
    renderHistorySwitchButton();
    bindEvents();
    await checkAuthStatus();
  } finally {
    document.body.classList.add("app-ready");
  }
}

initializeApp();
