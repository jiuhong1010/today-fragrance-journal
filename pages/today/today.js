const storage = require("../../utils/storage");
const content = require("../../utils/content");

Page({
  data: {
    goalOptions: content.GOALS,
    primaryGoalOptions: content.GOALS.filter((goal) => goal !== "保持距离"),
    occasionOptions: content.OCCASIONS,
    temperatureOptions: content.TEMPERATURES,
    occasionIndex: 0,
    temperatureIndex: 2,
    selection: {goal: "清醒", occasion: "通勤", temperature: "微凉"},
    shakeReady: false,
    shakeCooldown: false
  },
  onLoad() {
    const state = storage.getState();
    this.setData({selection: state.selection, occasionIndex: content.OCCASIONS.indexOf(state.selection.occasion), temperatureIndex: content.TEMPERATURES.indexOf(state.selection.temperature), reducedMotion: !!state.preferences.reducedMotion});
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
  chooseGoal(e) {
    const goal = e.currentTarget.dataset.value;
    this.setData({"selection.goal": goal});
    storage.setSelection({goal});
  },
  chooseOccasion(e) {
    const occasion = this.data.occasionOptions[e.detail.value];
    this.setData({"selection.occasion": occasion, occasionIndex: e.detail.value});
    storage.setSelection({occasion});
  },
  chooseTemperature(e) {
    const temperature = this.data.temperatureOptions[e.detail.value];
    this.setData({"selection.temperature": temperature, temperatureIndex: e.detail.value});
    storage.setSelection({temperature});
  },
  startShake() {
    if (this.data.shakeReady) return;
    try {
      this.shakeHandler = (res) => {
        const magnitude = Math.sqrt(res.x * res.x + res.y * res.y + res.z * res.z);
        if (magnitude > 1.75 && !this.data.shakeCooldown) this.reveal("shake");
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
  reveal(source) {
    if (this.data.shakeCooldown) return;
    const trigger = typeof source === "string" ? source : "tap";
    this.setData({shakeCooldown: true});
    storage.setSelection(this.data.selection);
    wx.vibrateShort({type: "light"});
    setTimeout(() => {
      wx.navigateTo({url: `/pages/result/result?source=${trigger}`});
      this.setData({shakeCooldown: false});
    }, trigger === "shake" ? 180 : 0);
  },
  goEducation() {
    wx.navigateTo({url: "/pages/fragrance/fragrance?education=1"});
  }
});
