// 内置香水的本地实物图索引。
// 当前图片用于开发预览，来源为公开香水目录的产品瓶身参考图；正式发布前需替换为品牌授权素材并完成审校。
const catalogIds = {
  "adp-colonia-edc": 1681,
  "jm-lime-basil-mandarin-cologne": 5585,
  "chanel-chance-eau-fraiche-edt": 1483,
  "guerlain-mandarine-basilic-edt": 2060,
  "issey-leau-dissey-edt": 720,
  "armani-acqua-di-gio-edt": 410,
  "mm-sailing-day-edt": 47891,
  "diptyque-philosykos-edt": 72040,
  "hermes-un-jardin-sur-le-nil-edt": 18,
  "aesop-tacit-edp": 32134,
  "jm-wood-sage-sea-salt-cologne": 25529,
  "jm-english-pear-freesia-cologne": 10314,
  "chanel-chance-eau-tendre-edt": 8069,
  "atelier-orange-sanguine-cologne-absolue": 9420,
  "byredo-bal-dafrique-edp": 6458,
  "diptyque-eau-rose-edt": 14214,
  "mfk-a-la-rose-edp": 29083,
  "prada-infusion-iris-edp": 31040,
  "jm-wild-bluebell-cologne": 12310,
  "chanel-gabrielle-edp": 43718,
  "dior-jadore-edp": 210,
  "gucci-bloom-edp": 44894,
  "jm-peony-blush-suede-cologne": 18767,
  "le-labo-lys-41-edp": 18382,
  "chanel-coco-mademoiselle-edp": 611,
  "narciso-rodriguez-for-her-edt": 209,
  "ysl-libre-edp": 56077,
  "lancome-la-vie-est-belle-edp": 14982,
  "dior-hypnotic-poison-edt": 219,
  "jm-myrrh-tonka-cologne-intense": 42027,
  "guerlain-mon-guerlain-edp": 43297,
  "guerlain-shalimar-edp": 53,
  "serge-lutens-ambre-sultan-edp": 2760,
  "guerlain-linstant-edp": 51,
  "mm-by-the-fireplace-edt": 31623,
  "mm-jazz-club-edt": 20541,
  "tom-ford-tobacco-vanille-edp": 1825,
  "by-kilian-angels-share-edp": 62615,
  "le-labo-santal-33-edp": 12201,
  "diptyque-tam-dao-edt": 3956,
  "escentric-molecules-molecule-01-edt": 845,
  "byredo-super-cedar-edp": 35530,
  "chanel-sycomore-edp": 41780,
  "terre-d-hermes-edt": 17,
  "diptyque-orpheon-edp": 65738,
  "lalique-encre-noire-edt": 1834,
  "comme-des-garcons-wonderwood-edp": 8991,
  "creed-aventus-edp": 9828,
  "aesop-hwyl-edp": 46895,
  "le-labo-the-noir-29-edp": 31872
};

const records = Object.keys(catalogIds).reduce((result, id) => {
  const catalogId = catalogIds[id];
  result[id] = {
    imagePath: `/assets/perfumes/${id}.jpg`,
    imageAssetVersion: 1,
    imageStatus: "catalog-reference",
    imageSourceUrl: `https://fimgs.net/mdimg/perfume/375x500.${catalogId}.jpg`
  };
  return result;
}, {});

module.exports = {
  contentVersion: 1,
  contentStatus: "development-only",
  sourcePolicy: "公开目录实物参考图；正式发布前替换为品牌授权素材并复核具体浓度与版本",
  records
};
