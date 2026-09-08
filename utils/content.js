// 微信小程序运行时按 JS 模块解析 require；JSON 版本保留给内容审校，运行时使用同内容的 JS 镜像。
const perfumePack = require("../content/perfumes.v1.js");
const layeringPack = require("../content/layering.v1.js");
const perfumeImagePack = require("../content/perfume-images.v1.js");

const DEFAULT_BOTTLE_IMAGE = "/assets/bottles/editorial-bottle.png";

const OCCASION_CAP = {"通勤": 2, "正式场合": 2, "约会": 3, "聚会": 4, "独处": 4};
const TEMP_ORDER = ["闷热", "温暖", "微凉", "寒冷"];
const GOALS = ["清醒", "温柔", "松弛", "有存在感", "保持距离"];
const OCCASIONS = ["通勤", "约会", "聚会", "独处", "正式场合"];
const TEMPERATURES = ["闷热", "温暖", "微凉", "寒冷"];

function withImage(item) {
  const imageRecord = perfumeImagePack.records[item.id];
  return Object.assign({}, item, imageRecord || {imagePath: DEFAULT_BOTTLE_IMAGE, imageStatus: "placeholder"});
}

function allPerfumes() { return (perfumePack.records || []).map(withImage); }
function allLayering() { return layeringPack.records || []; }
function getPerfume(id, state) {
  const builtIn = allPerfumes().find((item) => item.id === id);
  if (builtIn) return Object.assign({}, builtIn, {kind: "builtin"});
  const custom = (state.customPerfumes || []).find((item) => item.customId === id);
  return custom ? Object.assign({}, custom, {id: custom.customId, kind: "custom", imagePath: custom.imagePath || DEFAULT_BOTTLE_IMAGE, imageStatus: custom.imagePath ? "user-provided" : "placeholder"}) : null;
}

function isComplete(item) {
  if (!item) return false;
  if (item.kind !== "custom") return true;
  return !!(item.profileComplete && item.family && item.projection && item.temperatures && item.occasions && item.impressionTags);
}

function daysSince(timestamp) {
  if (!timestamp) return 999;
  return Math.floor((Date.now() - timestamp) / 86400000);
}

function tempDistance(a, b) {
  const ai = TEMP_ORDER.indexOf(a);
  const bi = TEMP_ORDER.indexOf(b);
  if (ai < 0 || bi < 0) return 99;
  return Math.abs(ai - bi);
}

function feedbackFor(id, state, selection) {
  const records = (state.records || []).filter((record) => record.mainId === id && record.goal === selection.goal);
  const good = records.filter((record) => record.rating === "很适合").length;
  const fail = records.filter((record) => record.rating === "翻车").length;
  return {good, fail};
}

function scoreOne(item, wardrobeItem, state, selection) {
  const cap = OCCASION_CAP[selection.occasion] || 2;
  const temperatures = item.temperatures || [];
  const tempMatch = temperatures.indexOf(selection.temperature) >= 0;
  const distance = tempMatch ? 0 : (temperatures.length ? Math.min.apply(null, temperatures.map((temperature) => tempDistance(selection.temperature, temperature))) : 99);
  const occasionMatch = (item.occasions || []).indexOf(selection.occasion) >= 0;
  const goals = item.impressionTags || {primary: [], secondary: []};
  let score = 0;
  if ((goals.primary || []).indexOf(selection.goal) >= 0) score += 40;
  else if ((goals.secondary || []).indexOf(selection.goal) >= 0) score += 24;
  if (occasionMatch) score += 20;
  if (tempMatch) score += 15;
  else if (distance === 1) score += 7;
  if (item.projection > cap) score -= item.projection - cap === 1 ? 18 : 80;
  const feedback = feedbackFor(item.id, state, selection);
  score += feedback.good * 12;
  score -= feedback.fail * 25;
  const unused = daysSince(wardrobeItem.lastUsedAt);
  if (unused >= 30) score += 8;
  else if (unused >= 7) score += 4;
  if (unused === 0) score -= 35;
  else if (unused <= 3) score -= 16;
  else if (unused <= 7) score -= 7;
  return {item, wardrobeItem, score, tempMatch, occasionMatch, distance, cap};
}

function eligibleWardrobe(state) {
  return (state.wardrobe || []).filter((entry) => !entry.archived).map((entry) => {
    const item = getPerfume(entry.id || entry.customId, state);
    return {entry, item};
  }).filter(({item}) => item && isComplete(item));
}

function beginRoundIfNeeded(state) {
  const now = Date.now();
  if (!state.recommendation || !state.recommendation.roundStartedAt || now - state.recommendation.roundStartedAt > 10 * 60 * 1000) {
    state.recommendation = {roundStartedAt: now, shownIds: [], lastId: ""};
  }
}

function chooseWeighted(pool) {
  if (!pool.length) return null;
  const max = pool[0].score;
  const top = pool.filter((entry) => max - entry.score <= 8);
  const total = top.reduce((sum, entry) => sum + Math.max(1, entry.score - max + 9), 0);
  let cursor = Math.random() * total;
  for (let i = 0; i < top.length; i += 1) {
    cursor -= Math.max(1, top[i].score - max + 9);
    if (cursor <= 0) return top[i];
  }
  return top[0];
}

function recommend(state, selection) {
  const all = eligibleWardrobe(state);
  if (!all.length) return {status: "empty", direction: selection.goal};
  beginRoundIfNeeded(state);
  const shown = state.recommendation.shownIds || [];
  const scored = all.map(({entry, item}) => scoreOne(item, entry, state, selection));
  const environmentPool = scored.filter((entry) => entry.score > -20 && (entry.occasionMatch || entry.tempMatch));
  if (!environmentPool.length) return {status: "no-match", direction: selection.goal, candidates: scored.sort((a, b) => b.score - a.score)};

  environmentPool.sort((a, b) => b.score - a.score || daysSince(b.wardrobeItem.lastUsedAt) - daysSince(a.wardrobeItem.lastUsedAt));
  let candidatePool = environmentPool.filter((entry) => shown.indexOf(entry.item.id) < 0 && entry.item.id !== state.recommendation.lastId);
  let cycleReset = false;
  if (!candidatePool.length) {
    cycleReset = true;
    candidatePool = environmentPool.filter((entry) => entry.item.id !== state.recommendation.lastId);
    if (!candidatePool.length) candidatePool = environmentPool;
  }

  const chosen = chooseWeighted(candidatePool);
  if (!chosen) return {status: "no-match", direction: selection.goal, candidates: environmentPool};
  const nextShown = (cycleReset ? [] : shown).concat(chosen.item.id);
  state.recommendation.shownIds = nextShown.slice(-environmentPool.length);
  state.recommendation.lastId = chosen.item.id;
  return {status: "ok", candidate: chosen.item, score: chosen.score, candidates: environmentPool, candidateCount: environmentPool.length};
}

function recommendationReason(item, selection) {
  const firstMaterial = item.keyMaterials && item.keyMaterials[0] ? item.keyMaterials[0].name : item.family;
  const projectionText = item.projection <= 2 ? "扩散不强" : item.projection === 3 ? "扩散适中" : "扩散比较明显";
  return {
    first: `${firstMaterial}把气息往“${selection.goal}”的方向推。`,
    second: `${projectionText}，适合${selection.temperature}的${selection.occasion}空间。`
  };
}

function getLayeringFor(id, state) {
  const owned = new Set((state.wardrobe || []).map((entry) => entry.id || entry.customId));
  return allLayering().filter((pair) => {
    const usesCurrent = pair.primaryId === id || pair.secondaryId === id;
    const other = pair.primaryId === id ? pair.secondaryId : pair.primaryId;
    return usesCurrent && owned.has(other) && (pair.contentStatus === "draft" || pair.contentStatus === "publishable");
  });
}

module.exports = {
  allPerfumes,
  allLayering,
  getPerfume,
  eligibleWardrobe,
  recommend,
  recommendationReason,
  getLayeringFor,
  GOALS,
  OCCASIONS,
  TEMPERATURES,
  OCCASION_CAP
};
