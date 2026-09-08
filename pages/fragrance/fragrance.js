const content = require("../../utils/content");
const storage = require("../../utils/storage");

const allFamilies = [
  {key: "fresh", name: "清新", descriptor: "明亮、通透", macro: "清新系", children: [{name: "柑橘", feel: "像剥开的柑橘皮，明亮、带汁感。", materials: "柠檬、橙、佛手柑", tip: "适合闷热天气或想显得清醒时。"}, {name: "水生", feel: "像靠近水面时的凉意，轻、开阔。", materials: "海水、莲花、杜松", tip: "适合通勤；不等于洗衣液式干净。"}, {name: "绿意", feel: "像折断叶梗时冒出的青涩汁液。", materials: "紫罗兰叶、罗勒、青草", tip: "适合温暖天气和需要降噪的时刻。"}, {name: "果香", feel: "像刚切开的水果，柔软、多汁。", materials: "梨、桃、黑醋栗", tip: "果香不一定甜，也可能带酸和清脆。"}]},
  {key: "floral", name: "花香", descriptor: "柔软、盛放", macro: "花香系", children: [{name: "柔和花香", feel: "像贴近一瓣柔软的花，轻、透明。", materials: "玫瑰、紫罗兰、白麝香", tip: "想要温柔但不占空间时可以从这里开始。"}, {name: "经典花香", feel: "像一束完整花束，明亮、饱满。", materials: "茉莉、牡丹、晚香玉", tip: "扩散可能更明显，室内先少喷。"}, {name: "花香琥珀", feel: "花瓣外多了一层温暖树脂。", materials: "橙花、香草、广藿香", tip: "适合微凉或寒冷天气。"}]},
  {key: "wood", name: "木质", descriptor: "干燥、沉静", macro: "木质系", children: [{name: "纯木质", feel: "像刚削开的木头，平滑、清晰。", materials: "檀香、雪松、纸莎草", tip: "不等于男性，重点是干湿和距离感。"}, {name: "苔藓木质", feel: "像湿润林下的木头，安静、有土壤感。", materials: "橡苔、香根草、柏树", tip: "适合微凉和想保持边界时。"}, {name: "干燥木质", feel: "像铅笔木屑或干燥树皮，轮廓清楚。", materials: "雪松、香根草、桦木", tip: "皮肤较干时先少量试喷。"}, {name: "芳香草本", feel: "像针叶、草本和烟气交错。", materials: "柏木、鼠尾草、迷迭香", tip: "气息可能偏冷，不必用喷数堆存在感。"}]},
  {key: "amber", name: "琥珀", descriptor: "温暖、包裹", macro: "琥珀系", children: [{name: "柔和琥珀", feel: "像温热的奶油和树脂，柔软、包裹。", materials: "香草、零陵香豆、杏仁", tip: "寒冷天气更容易显得平衡。"}, {name: "经典琥珀", feel: "像暖色树脂和香辛料，深、稳。", materials: "琥珀、香草、没药", tip: "扩散较高的作品要从一喷开始。"}, {name: "木质琥珀", feel: "像壁炉、酒液和深色木头。", materials: "烟草、栗子、干邑", tip: "室内慎用，优先分区喷。"}]}
];

const allPerfumes = content.allPerfumes().map((item) => Object.assign({}, item, {
  materialLine: (item.keyMaterials || []).map((material) => material.name).join(" · ")
}));
const feelingPresets = ["干净", "雨后", "温柔", "安静", "暖甜", "有存在感"];
const feelingAliases = {
  "干净": ["清新", "柑橘", "水生", "白麝香", "清醒", "茶", "干净"],
  "雨后": ["水生", "绿意", "海水", "青草", "雪松", "清新", "凉意"],
  "温柔": ["柔和花香", "花香", "玫瑰", "白麝香", "柔软", "温柔"],
  "安静": ["木质", "沉静", "保持距离", "檀香", "雪松", "苔藓", "安静"],
  "暖甜": ["琥珀", "香草", "甜润", "温暖", "零陵香豆", "杏仁"],
  "有存在感": ["有存在感", "经典花香", "花香琥珀", "经典琥珀", "聚会", "扩散"]
};

function termsFor(search) {
  if (!search) return [];
  const aliases = Object.keys(feelingAliases).filter((key) => key.indexOf(search) >= 0 || search.indexOf(key) >= 0).reduce((items, key) => items.concat(feelingAliases[key]), []);
  return [search].concat(aliases);
}

function matches(text, terms) {
  const value = String(text || "").toLowerCase();
  return terms.some((term) => value.indexOf(String(term).toLowerCase()) >= 0);
}

function perfumeSearchText(item) {
  const materials = (item.keyMaterials || []).reduce((parts, material) => parts.concat([material.name, material.feel]), []);
  const tags = (item.impressionTags && (item.impressionTags.primary || []).concat(item.impressionTags.secondary || [])) || [];
  return [item.nameZh, item.nameEn, item.brand, item.family, item.macroFamily, item.concentration]
    .concat(materials, tags, item.strongFeatures || [], item.temperatures || [], item.occasions || [])
    .join(" ");
}

function filteredFamilyData(search) {
  const terms = termsFor(search);
  if (!terms.length) return allFamilies;
  return allFamilies.map((family) => {
    const familyHit = matches([family.name, family.descriptor, family.macro].join(" "), terms);
    const children = familyHit ? family.children : family.children.filter((child) => matches([child.name, child.feel, child.materials, child.tip].join(" "), terms));
    return Object.assign({}, family, {children});
  }).filter((family) => family.children.length);
}

function filteredPerfumeData(search) {
  const terms = termsFor(search);
  if (!terms.length) return allPerfumes;
  return allPerfumes.filter((item) => matches(perfumeSearchText(item), terms));
}

Page({
  data: {
    families: allFamilies,
    feelingPresets,
    perfumeCount: allPerfumes.length,
    expanded: "",
    search: "",
    filteredFamilies: allFamilies,
    perfumeResults: allPerfumes,
    displayedPerfumes: allPerfumes.slice(0, 6),
    resultCount: allPerfumes.length,
    catalogLimit: 6,
    catalogOpen: false,
    showPerfumeList: false,
    canLoadMore: allPerfumes.length > 6,
    showBack: false,
    educationCards: [
      {title: "前中后调是什么？", body: "它不是固定三段，而是不同分子挥发速度造成的感受变化。"},
      {title: "木质不等于男性", body: "木质描述的是气味的纹理和重量，不决定谁应该使用。"},
      {title: "扩散和留香不是一回事", body: "一瓶香可以贴肤但留得久，也可以扩散明显但很快变轻。"},
      {title: "先少量，再叠香", body: "两瓶组合从各一喷、分区开始，给皮肤和距离留出判断时间。"}
    ]
  },
  onLoad(options) {
    const state = storage.getState();
    this.setData({reducedMotion: !!state.preferences.reducedMotion});
    if (options && options.education) this.setData({showEducation: true, showBack: true});
  },
  onSearch(e) {
    const search = e.detail.value.trim();
    this.applySearch(search);
  },
  chooseFeeling(e) {
    this.applySearch(e.currentTarget.dataset.value);
  },
  clearSearch() {
    this.applySearch("");
  },
  applySearch(search) {
    const perfumeResults = filteredPerfumeData(search);
    const catalogLimit = 6;
    this.setData({
      search,
      expanded: "",
      filteredFamilies: filteredFamilyData(search),
      perfumeResults,
      displayedPerfumes: perfumeResults.slice(0, catalogLimit),
      resultCount: perfumeResults.length,
      catalogLimit,
      showPerfumeList: !!search || this.data.catalogOpen,
      canLoadMore: perfumeResults.length > catalogLimit
    });
  },
  toggleCatalog() {
    if (this.data.search) {
      this.setData({catalogOpen: true}, () => this.applySearch(""));
      return;
    }
    const catalogOpen = !this.data.catalogOpen;
    const catalogLimit = 6;
    this.setData({
      catalogOpen,
      catalogLimit,
      showPerfumeList: catalogOpen,
      perfumeResults: allPerfumes,
      displayedPerfumes: allPerfumes.slice(0, catalogLimit),
      resultCount: allPerfumes.length,
      canLoadMore: catalogOpen && allPerfumes.length > catalogLimit
    });
  },
  loadMore() {
    const catalogLimit = Math.min(this.data.catalogLimit + 6, this.data.perfumeResults.length);
    this.setData({
      catalogLimit,
      displayedPerfumes: this.data.perfumeResults.slice(0, catalogLimit),
      canLoadMore: catalogLimit < this.data.perfumeResults.length
    });
  },
  openPerfume(e) {
    wx.navigateTo({url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}`});
  },
  toggleFamily(e) {
    const expanded = e.currentTarget.dataset.name;
    this.setData({expanded: this.data.expanded === expanded ? "" : expanded});
  },
  openEducation() { this.setData({showEducation: true}); }
});
