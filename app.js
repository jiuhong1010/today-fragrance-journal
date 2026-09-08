const storage = require('./utils/storage');

App({
  globalData: {
    statusBarHeight: 20,
    systemInfo: null
  },
  onLaunch() {
    try {
      const info = typeof wx.getWindowInfo === "function" ? wx.getWindowInfo() : wx.getSystemInfoSync();
      this.globalData.statusBarHeight = info.statusBarHeight || 20;
      this.globalData.systemInfo = info;
    } catch (error) {
      // 低版本或模拟器读取失败时使用保守默认值。
    }
    storage.ensureState();
  }
});
