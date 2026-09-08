Component({
  properties: {
    title: {type: String, value: "今日用香志"},
    showBack: {type: Boolean, value: false}
  },
  data: {
    statusBarHeight: 20,
    navigationHeight: 44,
    backTop: 6
  },
  lifetimes: {
    attached() {
      try {
        const info = typeof wx.getWindowInfo === "function" ? wx.getWindowInfo() : wx.getSystemInfoSync();
        const statusBarHeight = info.statusBarHeight || 20;
        const capsule = typeof wx.getMenuButtonBoundingClientRect === "function" ? wx.getMenuButtonBoundingClientRect() : null;
        const navigationHeight = capsule && capsule.height ? (capsule.top - statusBarHeight) * 2 + capsule.height : 44;
        const backTop = capsule && capsule.height ? capsule.top - statusBarHeight : 6;
        this.setData({statusBarHeight, navigationHeight, backTop});
      } catch (error) {}
    }
  },
  methods: {
    goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        wx.navigateBack({delta: 1});
        return;
      }
      wx.reLaunch({url: "/pages/today/today"});
    }
  }
});
