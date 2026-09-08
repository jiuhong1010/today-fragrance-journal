const STORAGE_KEY = "fragranceJournal:v1";
const SCHEMA_VERSION = 1;
const RECOMMENDATION_RULE_VERSION = "recommendation-v2";

function defaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    contentVersion: 1,
    recommendationRuleVersion: RECOMMENDATION_RULE_VERSION,
    wardrobe: [],
    customPerfumes: [],
    records: [],
    preferences: {reducedMotion: false},
    selection: {goal: "清醒", occasion: "通勤", temperature: "微凉"},
    recommendation: {roundStartedAt: 0, shownIds: [], lastId: ""},
    firstDataNoticeSeen: false
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureState() {
  let state;
  try { state = wx.getStorageSync(STORAGE_KEY); } catch (error) { state = null; }
  if (!state || typeof state !== "object") {
    state = defaultState();
    saveState(state);
    return state;
  }
  if (!state.schemaVersion) state.schemaVersion = 1;
  if (!state.recommendation) state.recommendation = {roundStartedAt: 0, shownIds: [], lastId: ""};
  if (!state.selection) state.selection = {goal: "清醒", occasion: "通勤", temperature: "微凉"};
  if (!state.preferences) state.preferences = {reducedMotion: false};
  if (!Array.isArray(state.wardrobe)) state.wardrobe = [];
  if (!Array.isArray(state.customPerfumes)) state.customPerfumes = [];
  if (!Array.isArray(state.records)) state.records = [];
  if (state.recommendationRuleVersion !== RECOMMENDATION_RULE_VERSION) {
    state.recommendationRuleVersion = RECOMMENDATION_RULE_VERSION;
    state.recommendation = {roundStartedAt: 0, shownIds: [], lastId: ""};
    saveState(state);
  }
  if (state.schemaVersion < SCHEMA_VERSION) {
    // v1 是当前首个发布结构，保留旧字段并补齐缺省值。
    state.schemaVersion = SCHEMA_VERSION;
    saveState(state);
  }
  return state;
}

function getState() { return ensureState(); }

function saveState(state) {
  try { wx.setStorageSync(STORAGE_KEY, state); return true; } catch (error) { return false; }
}

function updateState(mutator) {
  const state = clone(ensureState());
  mutator(state);
  saveState(state);
  return state;
}

function addWardrobe(id, kind) {
  return updateState((state) => {
    const key = kind === "custom" ? "customId" : "id";
    if (state.wardrobe.some((item) => item[key] === id)) return;
    state.wardrobe.push({[key]: id, addedAt: Date.now(), lastUsedAt: 0, useCount: 0, archived: false});
  });
}

function removeWardrobe(id, kind) {
  return updateState((state) => {
    const key = kind === "custom" ? "customId" : "id";
    state.wardrobe = state.wardrobe.filter((item) => item[key] !== id);
  });
}

function saveCustomPerfume(record) {
  return updateState((state) => {
    state.customPerfumes.push(record);
    state.wardrobe.push({customId: record.customId, addedAt: Date.now(), lastUsedAt: 0, useCount: 0, archived: false});
  });
}

function addRecord(record) {
  return updateState((state) => {
    const now = Date.now();
    state.records.unshift(Object.assign({recordId: `record-${now}`, createdAt: now, ruleVersion: RECOMMENDATION_RULE_VERSION}, record));
    state.records = state.records.slice(0, 30);
    const ids = [record.mainId, record.secondaryId].filter(Boolean);
    state.wardrobe.forEach((item) => {
      const itemId = item.id || item.customId;
      if (ids.indexOf(itemId) >= 0) {
        item.lastUsedAt = now;
        item.useCount = (item.useCount || 0) + 1;
      }
    });
  });
}

function setSelection(selection) {
  return updateState((state) => { state.selection = Object.assign({}, state.selection, selection); });
}

function setRecommendation(recommendation) {
  return updateState((state) => { state.recommendation = Object.assign({}, state.recommendation, recommendation); });
}

function clearUserData() {
  const next = defaultState();
  return saveState(next);
}

module.exports = {
  STORAGE_KEY,
  defaultState,
  ensureState,
  getState,
  saveState,
  updateState,
  addWardrobe,
  removeWardrobe,
  saveCustomPerfume,
  addRecord,
  setSelection,
  setRecommendation,
  clearUserData
};
