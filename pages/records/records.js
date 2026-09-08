const storage = require("../../utils/storage");
const content = require("../../utils/content");

Page({
  data: {records: [], empty: true},
  onShow() { this.load(); },
  load() {
    const state = storage.getState();
    const records = (state.records || []).map((record) => {
      const item = content.getPerfume(record.mainId, state);
      return Object.assign({}, record, {name: item ? item.nameZh : "已删除的香水", family: item ? item.family : "", dateLabel: this.dateLabel(record.createdAt)});
    });
    this.setData({records, empty: !records.length});
  },
  dateLabel(timestamp) {
    const d = new Date(timestamp || Date.now());
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  }
});
