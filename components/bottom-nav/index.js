Component({
  properties: {
    active: {type: String, value: "today"}
  },
  methods: {
    go(e) {
      const key = e.currentTarget.dataset.key;
      const map = {
        today: "/pages/today/today",
        wardrobe: "/pages/wardrobe/wardrobe",
        fragrance: "/pages/fragrance/fragrance"
      };
      if (map[key]) wx.reLaunch({url: map[key]});
    }
  }
});
