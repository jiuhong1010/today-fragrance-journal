function clamp(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 50;
  return Math.max(0, Math.min(100, number));
}

Component({
  properties: {
    profile: {type: Object, value: {}}
  },
  data: {
    ariaLabel: "香气维度图"
  },
  observers: {
    profile(profile) {
      this.scheduleDraw(profile || {});
    }
  },
  lifetimes: {
    ready() {
      this.componentReady = true;
      this.scheduleDraw(this.properties.profile || {});
    },
    detached() {
      if (this.drawTimer) clearTimeout(this.drawTimer);
    }
  },
  pageLifetimes: {
    show() {
      this.scheduleDraw(this.properties.profile || {});
    }
  },
  methods: {
    scheduleDraw(profile) {
      const values = this.profileValues(profile);
      this.setData({ariaLabel: `香气维度：清冽 ${values[0]}，扩散 ${values[1]}，甜润 ${values[2]}，戏剧 ${values[3]}`});
      if (!this.componentReady) return;
      if (this.drawTimer) clearTimeout(this.drawTimer);
      this.drawTimer = setTimeout(() => this.draw(values), 40);
    },
    profileValues(profile) {
      return [
        clamp(profile.clearSoft),
        clamp(profile.skinDiffusion),
        clamp(profile.drySweet),
        clamp(profile.dailyDramatic)
      ];
    },
    draw(values) {
      this.createSelectorQuery().select("#profileRadar").fields({node: true, size: true}).exec((result) => {
        const target = result && result[0];
        if (!target || !target.node || !target.width || !target.height) return;
        const canvas = target.node;
        const context = canvas.getContext("2d");
        const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : {pixelRatio: 2};
        const ratio = windowInfo.pixelRatio || 2;
        canvas.width = target.width * ratio;
        canvas.height = target.height * ratio;
        context.scale(ratio, ratio);
        context.clearRect(0, 0, target.width, target.height);

        const centerX = target.width / 2;
        const centerY = target.height / 2;
        const radius = Math.min(target.width, target.height) * .42;
        const pointFor = (axis, scale) => {
          if (axis === 0) return [centerX, centerY - radius * scale];
          if (axis === 1) return [centerX + radius * scale, centerY];
          if (axis === 2) return [centerX, centerY + radius * scale];
          return [centerX - radius * scale, centerY];
        };
        const diamond = (scale) => [0, 1, 2, 3].map((axis) => pointFor(axis, scale));
        const trace = (points) => {
          context.beginPath();
          context.moveTo(points[0][0], points[0][1]);
          points.slice(1).forEach((point) => context.lineTo(point[0], point[1]));
          context.closePath();
        };

        context.lineWidth = 1;
        [1, .75, .5, .25].forEach((scale, index) => {
          trace(diamond(scale));
          context.strokeStyle = index === 0 ? "rgba(190,174,204,.28)" : "rgba(190,174,204,.13)";
          context.stroke();
        });

        context.strokeStyle = "rgba(190,174,204,.15)";
        context.beginPath();
        context.moveTo(centerX, centerY - radius);
        context.lineTo(centerX, centerY + radius);
        context.moveTo(centerX - radius, centerY);
        context.lineTo(centerX + radius, centerY);
        context.stroke();

        const profilePoints = values.map((value, axis) => pointFor(axis, value / 100));
        trace(profilePoints);
        context.fillStyle = "rgba(180,154,209,.24)";
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = "#b49ad1";
        context.stroke();

        profilePoints.forEach((point) => {
          context.beginPath();
          context.arc(point[0], point[1], 3, 0, Math.PI * 2);
          context.fillStyle = "#d66187";
          context.fill();
          context.lineWidth = 1.5;
          context.strokeStyle = "#f0d7e0";
          context.stroke();
        });
      });
    }
  }
});
