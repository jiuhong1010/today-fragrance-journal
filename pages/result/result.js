const storage = require("../../utils/storage");
const content = require("../../utils/content");

Page({
  data: {
    selection: {},
    status: "loading",
    candidate: null,
    candidateCount: 0,
    reason: {},
    noMatchCopy: "",
    layeringPair: null,
    showToastLabel: "",
    shakeReady: false,
    shakeCooldown: false
  },
  onLoad() {
    this.runRecommendation();
  },
  onShow() {
    this.startShake();
  },
  onHide() {
    this.stopShake();
  },
  onUnload() {
    this.stopShake();
  },
  runRecommendation() {
    const state = storage.getState();
    const selection = state.selection || {goal: "清醒", occasion: "通勤", temperature: "微凉"};
    this.setData({reducedMotion: !!state.preferences.reducedMotion});
    const result = content.recommend(state, selection);
    storage.setRecommendation(state.recommendation);
    if (result.status === "empty") {
      this.setData({selection, status: "empty", candidateCount: 0, noMatchCopy: "你的香柜还没有可推荐的香水。先添加一瓶，今天的味道就有了起点。"});
      return result;
    }
    if (result.status === "no-match") {
      this.setData({selection, status: "no-match", candidateCount: 0, noMatchCopy: `你的香柜里暂时没有同时符合“${selection.goal}”和“${selection.occasion} · ${selection.temperature}”的香水。可以放宽一项环境条件。`});
      return result;
    }
    this.present(result.candidate, selection, result.candidateCount);
    return result;
  },
  present(candidate, selection, candidateCount) {
    const reason = content.recommendationReason(candidate, selection);
    const pairs = content.getLayeringFor(candidate.id, storage.getState());
    this.setData({
      selection,
      status: "ok",
      candidate,
      candidateCount: candidateCount || 1,
      reason,
      layeringPair: pairs[0] || null,
      sprayPlaces: (candidate.defaultSpray && candidate.defaultSpray.places || []).join(" + ")
    });
  },
  startShake() {
    if (this.data.shakeReady) return;
    this.shakeArmedAt = Date.now() + 800;
    try {
      this.shakeHandler = (res) => {
        const magnitude = Math.sqrt(res.x * res.x + res.y * res.y + res.z * res.z);
        if (Date.now() >= this.shakeArmedAt && magnitude > 1.75 && !this.data.shakeCooldown) this.changeOne("shake");
      };
      wx.startAccelerometer({interval: "ui", success: () => this.setData({shakeReady: true})});
      wx.onAccelerometerChange(this.shakeHandler);
    } catch (error) {}
  },
  stopShake() {
    try {
      if (this.shakeHandler && wx.offAccelerometerChange) wx.offAccelerometerChange(this.shakeHandler);
    } catch (error) {}
    this.shakeHandler = null;
    try { wx.stopAccelerometer(); } catch (error) {}
    this.setData({shakeReady: false});
  },
  changeOne(source) {
    if (this.data.shakeCooldown) return;
    const trigger = typeof source === "string" ? source : "tap";
    const previousId = this.data.candidate && this.data.candidate.id;
    this.setData({shakeCooldown: true});
    const result = this.runRecommendation();
    if (trigger === "shake") wx.vibrateShort({type: "light"});
    if (result && result.status === "ok" && result.candidate.id === previousId) {
      wx.showToast({title: "当前条件只有这一瓶合适", icon: "none"});
    }
    setTimeout(() => this.setData({shakeCooldown: false}), 900);
  },
  openDetail() {
    if (!this.data.candidate) return;
    wx.navigateTo({url: `/pages/detail/detail?id=${this.data.candidate.id}`});
  },
  saveToday() {
    if (!this.data.candidate) return;
    wx.showActionSheet({
      itemList: ["很适合", "一般", "翻车"],
      success: (res) => {
        const ratings = ["很适合", "一般", "翻车"];
        storage.addRecord({
          mainId: this.data.candidate.id,
          goal: this.data.selection.goal,
          occasion: this.data.selection.occasion,
          temperature: this.data.selection.temperature,
          rating: ratings[res.tapIndex],
          shortNote: ""
        });
        wx.showToast({title: "已记下今天", icon: "success"});
      }
    });
  },
  showLayering() {
    const pair = this.data.layeringPair;
    if (!pair) return;
    const main = content.getPerfume(pair.primaryId, storage.getState());
    const secondary = content.getPerfume(pair.secondaryId, storage.getState());
    wx.showModal({
      title: "试试叠香",
      content: `${main.nameZh} + ${secondary.nameZh}\n${pair.expectedChange}\n${pair.risk}\n\n${pair.places.primary} 1 喷 · ${pair.places.secondary} 1 喷`,
      showCancel: false,
      confirmText: "知道了"
    });
  },
  goWardrobe() { wx.reLaunch({url: "/pages/wardrobe/wardrobe"}); },
  goToday() { wx.reLaunch({url: "/pages/today/today"}); }
});
