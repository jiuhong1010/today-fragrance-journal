const storage = require("../../utils/storage");
const content = require("../../utils/content");

Page({
  data: {
    filters: ["全部", "清新", "木质", "花香", "琥珀"],
    activeFilter: "全部",
    count: 0,
    items: [],
    allItems: [],
    empty: true
  },
  onShow() { this.loadWardrobe(); },
  loadWardrobe() {
    const state = storage.getState();
    const items = (state.wardrobe || []).map((entry) => {
      const item = content.getPerfume(entry.id || entry.customId, state);
      if (!item || entry.archived) return null;
      return Object.assign({}, item, {
        lastUsedLabel: entry.lastUsedAt ? `${Math.max(1, Math.floor((Date.now() - entry.lastUsedAt) / 86400000))}天未使用` : "尚未使用",
        entryKind: entry.id ? "builtin" : "custom"
      });
    }).filter(Boolean);
    this.setData({count: items.length, empty: items.length === 0, allItems: items, items: this.applyFilter(items, this.data.activeFilter), reducedMotion: !!state.preferences.reducedMotion});
  },
  applyFilter(items, filter) {
    if (filter === "全部") return items;
    const familyMap = {"清新": "清新系", "花香": "花香系", "木质": "木质系", "琥珀": "琥珀系"};
    return items.filter((item) => item.macroFamily === familyMap[filter]);
  },
  chooseFilter(e) {
    const activeFilter = e.currentTarget.dataset.value;
    this.setData({activeFilter, items: this.applyFilter(this.data.allItems, activeFilter)});
  },
  goAdd() { wx.navigateTo({url: "/pages/add/add"}); },
  goRecords() { wx.navigateTo({url: "/pages/records/records"}); },
  goEducation() { wx.navigateTo({url: "/pages/fragrance/fragrance?education=1"}); },
  goSettings() { wx.navigateTo({url: "/pages/settings/settings"}); },
  openDetail(e) { wx.navigateTo({url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}`}); }
});
