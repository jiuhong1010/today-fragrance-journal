const storage = require("../../utils/storage");
const content = require("../../utils/content");

const familyOptions = ["柑橘", "水生", "绿意", "果香", "柔和花香", "经典花香", "花香琥珀", "柔和琥珀", "经典琥珀", "木质琥珀", "纯木质", "苔藓木质", "干燥木质", "芳香草本"];
const macroMap = {"柑橘": "清新系", "水生": "清新系", "绿意": "清新系", "果香": "清新系", "柔和花香": "花香系", "经典花香": "花香系", "花香琥珀": "花香系", "柔和琥珀": "琥珀系", "经典琥珀": "琥珀系", "木质琥珀": "琥珀系", "纯木质": "木质系", "苔藓木质": "木质系", "干燥木质": "木质系", "芳香草本": "木质系"};

Page({
  data: {
    mode: "builtin",
    search: "",
    filters: ["全部", "清新", "花香", "木质", "琥珀"],
    activeFilter: "全部",
    perfumes: [],
    catalog: [],
    addedIds: [],
    familyOptions,
    intensityOptions: ["轻", "适中", "浓郁"],
    projectionOptions: ["贴肤", "适中", "明显", "强"],
    temperatureOptions: content.TEMPERATURES,
    occasionOptions: content.OCCASIONS,
    goalOptions: content.GOALS,
    form: {name: "", family: "绿意", intensity: "适中", projection: "适中", temperature: "微凉", occasion: "通勤", goal: "清醒", feeling: ""},
    familyIndex: 2,
    intensityIndex: 1,
    projectionIndex: 1,
    temperatureIndex: 2,
    occasionIndex: 0,
    goalIndex: 0
  },
  onLoad() { this.refresh(); },
  refresh() {
    const state = storage.getState();
    const addedIds = (state.wardrobe || []).map((item) => item.id || item.customId);
    const perfumes = content.allPerfumes().map((item) => Object.assign({}, item, {added: addedIds.indexOf(item.id) >= 0}));
    this.setData({addedIds, catalog: perfumes, perfumes: this.filtered(perfumes, this.data.search, this.data.activeFilter), reducedMotion: !!state.preferences.reducedMotion});
  },
  switchMode(e) { this.setData({mode: e.currentTarget.dataset.mode}); },
  onSearch(e) { const search = e.detail.value.trim(); this.setData({search, perfumes: this.filtered(this.data.catalog, search, this.data.activeFilter)}); },
  chooseFilter(e) { const activeFilter = e.currentTarget.dataset.value; this.setData({activeFilter, perfumes: this.filtered(this.data.catalog, this.data.search, activeFilter)}); },
  filtered(items, search, filter) {
    const map = {"清新": "清新系", "花香": "花香系", "木质": "木质系", "琥珀": "琥珀系"};
    return items.filter((item) => (!search || item.nameZh.indexOf(search) >= 0 || item.nameEn.toLowerCase().indexOf(search.toLowerCase()) >= 0 || item.family.indexOf(search) >= 0) && (filter === "全部" || item.macroFamily === map[filter]));
  },
  addBuiltin(e) {
    const id = e.currentTarget.dataset.id;
    if (this.data.addedIds.indexOf(id) >= 0) return;
    storage.addWardrobe(id, "builtin");
    this.setData({addedIds: this.data.addedIds.concat(id), perfumes: this.data.perfumes.map((item) => item.id === id ? Object.assign({}, item, {added: true}) : item)});
    wx.showToast({title: "已放入香柜", icon: "success"});
  },
  inputForm(e) { this.setData({[`form.${e.currentTarget.dataset.key}`]: e.detail.value}); },
  choosePicker(e) {
    const key = e.currentTarget.dataset.key;
    const ranges = {family: this.data.familyOptions, intensity: this.data.intensityOptions, projection: this.data.projectionOptions, temperature: this.data.temperatureOptions, occasion: this.data.occasionOptions, goal: this.data.goalOptions};
    const indexKeys = {family: "familyIndex", intensity: "intensityIndex", projection: "projectionIndex", temperature: "temperatureIndex", occasion: "occasionIndex", goal: "goalIndex"};
    const value = ranges[key][e.detail.value];
    this.setData({[`form.${key}`]: value, [indexKeys[key]]: e.detail.value});
  },
  saveManual() {
    const form = this.data.form;
    if (!form.name.trim()) { wx.showToast({title: "先写下香水名称", icon: "none"}); return; }
    const customId = `custom-${Date.now()}`;
    const record = {
      customId,
      id: customId,
      brand: "我的记录",
      nameZh: form.name.trim(),
      nameEn: "",
      concentration: "自定义",
      macroFamily: macroMap[form.family],
      family: form.family,
      keyMaterials: [],
      intensity: this.data.intensityOptions.indexOf(form.intensity) + 1,
      projection: this.data.projectionOptions.indexOf(form.projection) + 1,
      longevity: "未记录",
      temperatures: [form.temperature],
      occasions: [form.occasion],
      impressionTags: {primary: [form.goal], secondary: []},
      strongFeatures: [],
      profile: {clearSoft: 50, skinDiffusion: 50, drySweet: 50, dailyDramatic: 50},
      defaultSpray: {places: ["手腕"], sprays: 1, refresh: "先少量试喷"},
      feeling: form.feeling.trim(),
      profileComplete: true,
      contentStatus: "user-created",
      sourceStatus: "user-input"
    };
    storage.saveCustomPerfume(record);
    wx.showToast({title: "已添加", icon: "success"});
    setTimeout(() => wx.navigateBack(), 500);
  }
});
