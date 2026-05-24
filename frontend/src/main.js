﻿﻿﻿﻿﻿﻿import "./style.css";

const MODE_LABELS = {
  random: "随机词",
  shape: "形近词",
  synonym: "近义词"
};

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
const PRONOUNCE_ICON = `
  <svg class="pronounce-icon" viewBox="0 0 1024 1024" aria-hidden="true">
    <path d="M64 549.34v-74.67c0-61.85 50.14-112 112-112h9.71c17.8 0 35.01-6.35 48.53-17.92l209.06-179.2a112.024 112.024 0 0 1 74.67-26.88c38.97 0 70.56 31.59 70.56 70.55v605.53c0 38.96-31.59 70.55-70.56 70.55-27.34 0.46-53.89-9.11-74.67-26.88l-209.06-179.2a74.648 74.648 0 0 0-48.53-17.92H176c-61.85 0.03-112-50.11-112-111.96z m653.32 66.08c79.69-45.89 107.09-147.69 61.2-227.38a166.421 166.421 0 0 0-61.2-61.2c-17.4-11.06-40.47-5.93-51.54 11.47s-5.93 40.47 11.47 51.53c0.89 0.57 1.8 1.09 2.74 1.59 44.02 25.19 59.28 81.31 34.08 125.32a91.763 91.763 0 0 1-34.08 34.09c-18.27 9.55-25.34 32.11-15.78 50.38 9.55 18.27 32.11 25.34 50.38 15.79 0.93-0.5 1.84-1.03 2.73-1.59z m116.85 119.46c145.57-117.73 168.13-331.16 50.41-476.73a338.383 338.383 0 0 0-50.41-50.41c-16.62-12.2-39.98-8.61-52.19 8-11.36 15.48-9.13 37.04 5.15 49.86 113.4 91.92 130.81 258.37 38.89 371.77a264.291 264.291 0 0 1-38.89 38.89c-15.34 13.78-16.6 37.38-2.82 52.72 12.83 14.28 34.39 16.51 49.86 5.15v0.75z"></path>
  </svg>
`.trim();
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
  flashPast: [],
  flashFuture: [],
  flashLoading: false,
  flashLoadingPercent: 0,
  flashLoadingTimer: null,
  theme: "light",
  flashPreset: "default",
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
  publicAiEnabled: false
};

let historyLoadObserver = null;
let collectionLoadObserver = null;
let pronunciationAudio = null;

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
  homeView: document.querySelector("#home-view"),
  flashView: document.querySelector("#flash-view"),
  quizView: document.querySelector("#quiz-view"),
  historyView: document.querySelector("#history-view"),
  homeModeList: document.querySelector("#home-mode-list"),
  historyEntryBtn: document.querySelector("#history-entry-btn"),
  flashHistoryBtn: document.querySelector("#flash-history-btn"),
  historyBackBtn: document.querySelector("#history-back-btn"),
  historyFilterBtn: document.querySelector("#history-filter-btn"),
  historyList: document.querySelector("#history-list"),
  flashBackHomeBtn: document.querySelector("#flash-back-home-btn"),
  flashRevealBtn: document.querySelector("#flash-reveal-btn"),
  flashPrevBtn: document.querySelector("#flash-prev-btn"),
  flashNextBtn: document.querySelector("#flash-next-btn"),
  flashPronounceBtn: document.querySelector("#flash-pronounce-btn"),
  flashLoadingView: document.querySelector("#flash-loading-view"),
  flashLoadingBar: document.querySelector("#flash-loading-bar"),
  flashLoadingPercent: document.querySelector("#flash-loading-percent"),
  flashBoard: document.querySelector("#flash-board"),
  flashWord: document.querySelector("#flash-word"),
  flashDetail: document.querySelector("#flash-detail"),
  flashOptionList: document.querySelector("#flash-option-list"),
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
  resultList: document.querySelector("#result-list"),
  closeDialogBtn: document.querySelector("#close-dialog-btn"),
  collectionEntryBtn: document.querySelector("#collection-entry-btn"),
  settingsEntryBtn: document.querySelector("#settings-entry-btn"),
  flashCollectBtn: document.querySelector("#flash-collect-btn"),
  collectionView: document.querySelector("#collection-view"),
  collectionTrainBtn: document.querySelector("#collection-train-btn"),
  collectionBackBtn: document.querySelector("#collection-back-btn"),
  collectionList: document.querySelector("#collection-list"),
  settingsView: document.querySelector("#settings-view"),
  settingsBackBtn: document.querySelector("#settings-back-btn"),
  settingsUsername: document.querySelector("#settings-username"),
  settingsApiKeyInput: document.querySelector("#settings-api-key-input"),
  settingsApiKeyStatus: document.querySelector("#settings-api-key-status"),
  saveApiKeyBtn: document.querySelector("#save-api-key-btn"),
  clearApiKeyBtn: document.querySelector("#clear-api-key-btn"),
  clearHistoryBtn: document.querySelector("#clear-history-btn"),
  settingsLogoutBtn: document.querySelector("#settings-logout-btn")
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

function playWordPronunciation(word) {
  const normalizedWord = String(word || "").trim();
  if (!normalizedWord) {
    return;
  }

  try {
    if (!pronunciationAudio) {
      pronunciationAudio = new Audio();
    }
    pronunciationAudio.pause();
    pronunciationAudio.src = buildPronunciationUrl(normalizedWord);
    pronunciationAudio.currentTime = 0;
    pronunciationAudio.play().catch(() => {
      showToast("朗读播放失败", "error");
    });
  } catch {
    showToast("朗读播放失败", "error");
  }
}

function setView(view) {
  state.view = view;
  elements.homeView.classList.toggle("is-hidden", view !== "home");
  elements.flashView.classList.toggle("is-hidden", view !== "flash");
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

function renderSessionUi() {
  const username = state.currentUser?.username || "";
  elements.settingsUsername.textContent = username || "-";
  const localPersonalApiKey = loadLocalPersonalApiKey();
  elements.settingsApiKeyInput.value = localPersonalApiKey;
  renderApiKeyAvailabilityStatus(localPersonalApiKey);
  if (localPersonalApiKey && state.isAuthenticated && state.apiKeyValidationKey !== localPersonalApiKey) {
    void refreshStoredPersonalApiKeyStatus(localPersonalApiKey);
  }
  renderHomeModes();
}

function hasAvailableAiCapability() {
  return Boolean(loadLocalPersonalApiKey() || state.publicAiEnabled);
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
  const draftMap = loadQuizDraftMap();
  const draft = draftMap[mode];
  if (!draft || typeof draft !== "object") {
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
  if (!state.quiz || state.loading || state.evaluationResult || hasHistoryRecord(state.currentHistoryId)) {
    return;
  }

  const draftMap = loadQuizDraftMap();
  draftMap[state.mode] = {
    mode: state.mode,
    quiz: state.quiz,
    placements: [...state.placements],
    optionOrder: [...state.optionOrder],
    selectedWord: state.selectedWord,
    currentHistoryId: state.currentHistoryId
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
  state.evaluationResult = null;
  state.currentHistoryId = draft.currentHistoryId || new Date().toISOString();
  buildWordColorMap(state.optionOrder);
  setView("quiz");
  renderLoadingState();
  renderQuestions();
  renderOptions();
  renderSubmitButton();
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
    state.publicAiEnabled = Boolean(data.publicAiEnabled);
  } catch {
    state.isAuthenticated = false;
    state.currentUser = null;
    state.publicAiEnabled = false;
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

async function submitAuthForm() {
  const username = elements.authUsernameInput.value.trim();
  const password = elements.authPasswordInput.value;
  const confirmPassword = elements.authConfirmInput.value;

  try {
    const data = await requestJson(
      state.authMode === "register" ? "/api/auth/register" : "/api/auth/login",
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
    const nextModeMessage = state.authMode === "register" ? "注册成功" : "登录成功";
    setAuthMode("login");
    await loadUserDataFromBackend();
    closeAuthDialog();
    renderAccountFeatures();
    renderSessionUi();
    setView("home");
    showToast(nextModeMessage, "success");
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

  const confirmed = window.confirm("确定清空全部刷题记录吗？这会删除匹配历史和百词斩历史，但不会影响收藏夹。");
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
        ? "<p>当前没有答错的百词斩记录。</p><p>关闭筛选后可查看全部历史。</p>"
        : "<p>还没有百词斩历史。</p><p>先去刷几个单词吧。</p>";
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
      emptyText: "继续加载百词斩历史",
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
        ? "<p>当前没有匹配模式历史。</p><p>如果你刚刷的是百词斩，点右上角切换查看。</p>"
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
            return `
              <div class="history-question-card">
                <button
                  type="button"
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
                  <p class="history-def">${index + 1}. ${item.defEn}</p>
                  <p class="history-answer">${item.word}</p>
                </button>
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
  const label = isFlashSection ? "切换普通历史" : "切换百词斩历史";
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
  elements.collectionTrainBtn.classList.toggle("is-hidden", !showTrainButton);
  elements.collectionList.innerHTML = "";
  disconnectCollectionLoadObserver();
  if (!state.collection.length) {
    const empty = document.createElement("div");
    empty.className = "history-empty";
    empty.innerHTML = "<p>还没有收藏单词。</p><p>在百词斩页面点击星星收藏单词吧。</p>";
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
    showToast("收藏夹单词需超过 5 个后才能开始专项训练", "error");
    return;
  }
  setFlashPreset("collection");
  loadFlashQuestion({ forceNew: true });
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
    question: state.flashCurrent,
    selectedIndex: state.flashSelectedIndex,
    evaluation: state.flashEvaluation ? { ...state.flashEvaluation } : null,
    detailVisible: state.flashDetailVisible
  };
}

function restoreFlashSnapshot(snapshot) {
  state.flashCurrent = snapshot?.question || null;
  state.flashSelectedIndex = Number.isInteger(snapshot?.selectedIndex) ? snapshot.selectedIndex : -1;
  state.flashEvaluation = snapshot?.evaluation ? { ...snapshot.evaluation } : null;
  state.flashDetailVisible = Boolean(snapshot?.detailVisible);
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

function renderQuizNavButtons() {
  elements.prevBtn.disabled = state.quizPast.length === 0;
  elements.nextBtn.disabled = !state.quiz && state.quizFuture.length === 0;
}

function renderFlashNavButtons() {
  elements.flashPrevBtn.disabled = state.flashPast.length === 0;
  elements.flashNextBtn.disabled = !state.flashCurrent && state.flashQueue.length === 0 && !state.flashFuture.length;
  elements.flashPronounceBtn.disabled = !state.flashCurrent;
}

function renderFlashRevealButton() {
  const shouldShow = Boolean(state.flashCurrent && state.flashEvaluation);
  elements.flashRevealBtn.classList.toggle("is-hidden", !shouldShow);
  if (shouldShow) {
    elements.flashRevealBtn.textContent = state.flashDetailVisible ? "查看选项" : "查看释义";
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
              <p><strong>例句 ${index + 1}：</strong>${highlightExampleWord(example.en, current.word)}</p>
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
      appendFlashHistoryRecord();
      warmFlashBatch();
      renderFlashOptions();
      renderFlashRevealButton();
      renderFlashDetail();
      renderFlashNavButtons();
    });
    elements.flashOptionList.appendChild(button);
  });
}

function renderFlashQuestion() {
  elements.flashWord.textContent = state.flashCurrent ? state.flashCurrent.word : "word";
  renderFlashLayoutState();
  renderFlashRevealButton();
  renderFlashDetail();
  renderFlashOptions();
  renderFlashNavButtons();
  renderCollectButton();
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
    detailVisible: false
  });
  renderFlashQuestion();
  warmFlashBatchWhenNeeded();
}

async function loadFlashQuestion(options = {}) {
  const { forceNew = false } = options;
  if (!forceNew && state.flashCurrent) {
    setView("flash");
    renderFlashLoadingState();
    renderFlashQuestion();
    return;
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
    showToast(error.message || "百词斩题目加载失败", "error", 2600);
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
}

function goToNextFlashQuestion() {
  if (state.flashFuture.length) {
    if (state.flashCurrent) {
      state.flashPast.push(createFlashSnapshot());
    }
    restoreFlashSnapshot(state.flashFuture.pop());
    renderFlashQuestion();
    return;
  }

  if (state.flashCurrent) {
    state.flashPast.push(createFlashSnapshot());
  }
  state.flashFuture = [];
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
  [
    ...Object.entries(MODE_LABELS),
    ["flash", "百词斩"]
  ].forEach(([mode, label]) => {
    const button = document.createElement("button");
    button.className = "home-mode-btn";
    button.textContent = label;
    if ((mode === "synonym" || mode === "shape") && state.isAuthenticated && !hasAvailableAiCapability()) {
      button.setAttribute("title", `未配置 API Key 时，${label}模式暂不可用`);
      button.setAttribute("aria-disabled", "true");
    }
    button.addEventListener("click", () => {
      if (!requireAuthFromHomeEntry()) {
        return;
      }
      if ((mode === "synonym" || mode === "shape") && !hasAvailableAiCapability()) {
        showToast(`未配置 API Key，${label}模式暂不可用`, "error");
        return;
      }
      if (mode === "flash") {
        setFlashPreset("default");
        loadFlashQuestion();
        return;
      }
      state.mode = mode;
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
  elements.quizTitle.textContent = `${MODE_LABELS[state.mode] || "匹配"}模式`;
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
  elements.resultList.innerHTML = "";
  state.quiz.items.forEach((item, index) => {
    const examplesHtml = Array.isArray(item.examples) && item.examples.length
      ? item.examples
          .map(
            (example, exampleIndex) => `
              <div class="example-item">
                <p><strong>例句 ${exampleIndex + 1}：</strong>${highlightExampleWord(example.en, item.word)}</p>
                <p>${escapeHtml(example.cn)}</p>
              </div>
            `
          )
          .join("")
      : '<div class="example-item"><p>当前暂无本地例句。</p></div>';

    const section = document.createElement("section");
    section.className = "result-item";
    section.innerHTML = `
      <div class="result-item-header">
        <h4>${index + 1}. ${item.word}</h4>
        <span class="result-item-actions">
          ${createInlinePronounceButton(item.word, "result-pronounce-btn")}
          ${createInlineCollectButton(item.word, item.wordCn, "result-collect-btn")}
        </span>
      </div>
      <p>${item.wordCn}</p>
      <p>${item.defCn}</p>
      <p class="result-def-en">${item.defEn}</p>
      <div class="example-list">${examplesHtml}</div>
    `;
    elements.resultList.appendChild(section);
  });
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
  const { forceNew = false } = options;
  if (elements.dialog.open) {
    elements.dialog.close();
  }

  if (!forceNew) {
    const draft = getQuizDraft(state.mode);
    if (draft) {
      restoreQuizDraft(draft);
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
    renderResults();
    elements.dialog.showModal();
    return;
  }

  if (state.placements.some((word) => !word)) {
    showToast("还有空格未填写，填满 5 个答案后再提交。", "error");
    return;
  }

  state.evaluationResult = state.quiz.items.map((item, index) => state.placements[index] === item.word);
  upsertHistoryRecord();
  clearQuizDraft();
  warmNextQuiz(state.mode);
  renderQuestions();
  renderSubmitButton();
  showToast("已完成判题，可查看释义或继续调整。");
}

function bindEvents() {
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
      closeAuthDialog();
      syncToastHost();
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
    renderFlashLoadingState();
    setView("home");
  });
  elements.flashRevealBtn.addEventListener("click", () => {
    if (!state.flashCurrent || !state.flashEvaluation) {
      return;
    }
    state.flashDetailVisible = !state.flashDetailVisible;
    renderFlashQuestion();
  });
  elements.flashPrevBtn.addEventListener("click", goToPrevFlashQuestion);
  elements.flashNextBtn.addEventListener("click", () => {
    goToNextFlashQuestion();
  });
  elements.flashPronounceBtn.addEventListener("click", () => {
    playWordPronunciation(state.flashCurrent?.word || "");
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
    const pronounceBtn = event.target.closest(".history-pronounce-btn, .flash-history-pronounce-btn");
    if (pronounceBtn) {
      playWordPronunciation(pronounceBtn.dataset.word || "");
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
    defNode.textContent = `${label ? `${label}. ` : ""}${nextLang === "en" ? question.dataset.defEn || "" : question.dataset.defCn || ""}`;
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
  elements.collectionTrainBtn.addEventListener("click", () => {
    startCollectionFlashTraining();
  });
  elements.collectionBackBtn.addEventListener("click", () => {
    setView("home");
  });
  elements.settingsEntryBtn.addEventListener("click", () => {
    if (!requireAuthFromHomeEntry()) {
      return;
    }
    renderSessionUi();
    setView("settings");
  });
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
      playWordPronunciation(pronounceBtn.dataset.word || "");
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
    const pronounceBtn = event.target.closest(".result-pronounce-btn");
    if (pronounceBtn) {
      playWordPronunciation(pronounceBtn.dataset.word || "");
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
}
async function initializeApp() {
  try {
    applyTheme(loadThemePreference());
    clearLegacyLocalData();
    renderLoadingState();
    renderFlashLoadingState();
    renderSubmitButton();
    renderQuizHeader();
    renderFlashNavButtons();
    renderQuizNavButtons();
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
