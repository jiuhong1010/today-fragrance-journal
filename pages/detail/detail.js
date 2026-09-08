const storage = require("../../utils/storage");
const content = require("../../utils/content");

Page({
  data: {item: null, isOwned: false, sprayPlaces: ""},
  onLoad(options) { this.id = options.id; this.load(); },
  onShow() { if (this.id) this.load(); },
  load() {
    const state = storage.getState();
    const item = content.getPerfume(this.id, state);
    if (!item) return;
    const isOwned = (state.wardrobe || []).some((entry) => (entry.id || entry.customId) === this.id);
    this.setData({item, isOwned, sprayPlaces: (item.defaultSpray.places || []).join(" + "), temperaturesText: (item.temperatures || []).join("、"), reducedMotion: !!state.preferences.reducedMotion});
  },
  toggleWardrobe() {
    if (this.data.isOwned) storage.removeWardrobe(this.id, this.data.item.kind === "custom" ? "custom" : "builtin");
    else storage.addWardrobe(this.id, this.data.item.kind === "custom" ? "custom" : "builtin");
    this.setData({isOwned: !this.data.isOwned});
    wx.showToast({title: this.data.isOwned ? "已放入香柜" : "已移出香柜", icon: "success"});
  }
});
