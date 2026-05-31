(() => {
  function generateAccent(exceptHue) {
    if (Math.random() < 0.01) {
      return {
        color: "oklch(64% 0.28 290)",
        hue: 290,
        ink: "#080808",
        mode: "rainbow",
        rainbow: true,
      };
    }

    const modes = [
      ["signal", 34, 48, 64, 0.22, 0.34],
      ["marker", 28, 72, 88, 0.14, 0.28],
      ["ink", 18, 34, 48, 0.16, 0.3],
      ["acid", 14, 78, 92, 0.22, 0.36],
      ["muted", 6, 50, 76, 0.06, 0.16],
    ];

    function pickMode() {
      const total = modes.reduce((sum, mode) => sum + mode[1], 0);
      let roll = Math.random() * total;

      for (const mode of modes) {
        roll -= mode[1];
        if (roll <= 0) {
          return mode;
        }
      }

      return modes[0];
    }

    function sample(min, max) {
      return min + Math.random() * (max - min);
    }

    const mode = pickMode();
    let hue = Math.floor(Math.random() * 360);

    if (Number.isFinite(exceptHue)) {
      while (Math.abs(((((hue - exceptHue) % 360) + 540) % 360) - 180) < 24) {
        hue = Math.floor(Math.random() * 360);
      }
    }

    const lightness = Math.round(sample(mode[2], mode[3]));
    const chroma = sample(mode[4], mode[5]).toFixed(3);

    return {
      color: `oklch(${lightness}% ${chroma} ${hue})`,
      hue,
      ink: lightness >= 68 ? "#080808" : "#ffffff",
      mode: mode[0],
      rainbow: false,
    };
  }

  window.generateAccent = generateAccent;
})();
