const storage = require("../../utils/storage");

Page({
  data: {schemaVersion: 1, contentVersion: 1, reducedMotion: false},
  onShow() {
    const state = storage.getState();
    this.setData({schemaVersion: state.schemaVersion, contentVersion: state.contentVersion, reducedMotion: !!state.preferences.reducedMotion});
  },
  toggleMotion(e) {
    const reducedMotion = !!e.detail.value;
    storage.updateState((state) => { state.preferences.reducedMotion = reducedMotion; });
    this.setData({reducedMotion});
  },
  clearData() {
    wx.showModal({
      title: "清除本地数据？",
      content: "将删除香柜、手动添加的香水、用香记录和偏好。内置资料不会删除，操作无法撤销。",
      confirmColor: "#d65c84",
      success: (res) => {
        if (!res.confirm) return;
        storage.clearUserData();
        wx.showToast({title: "已清除", icon: "success"});
        this.onShow();
      }
    });
  }
});
