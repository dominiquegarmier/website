(() => {
  const accentKey = "dominique-garmier-accent";
  const accentInkKey = `${accentKey}-ink`;
  const rainbowKey = `${accentKey}-rainbow`;
  const beforeRainbowAccentKey = `${accentKey}-before-rainbow`;
  const beforeRainbowAccentInkKey = `${beforeRainbowAccentKey}-ink`;
  const rainbowAccent = "oklch(64% 0.28 290)";
  const rainbowAccentInk = "#080808";
  const actions = {
    ":party": confetti,
    ":rainbow": rainbow,
    ":snake": () => location.assign("/snake/"),
  };
  const commands = Object.keys(actions);
  const maxCommandLength = Math.max(...commands.map((item) => item.length));
  let command = "";

  document.querySelectorAll(".site-header a").forEach((link) => {
    link.addEventListener("pointerdown", (event) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = new URL(link.href, location.href);

      if (target.origin !== location.origin || target.href === location.href) {
        return;
      }

      event.preventDefault();
      location.assign(target.href);
    });
  });

  addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const key = event.key.toLowerCase();

    if (key === "escape") {
      command = "";
      return;
    }

    if (key === ":") {
      command = ":";
      return;
    }

    if (!command) return;

    if (key === "enter") {
      actions[command]?.();
      command = "";
      return;
    }

    if (key === "backspace") {
      command = command.slice(0, -1);
      return;
    }

    if (key.length !== 1) return;

    command += key;

    if (command.length > maxCommandLength) {
      command = "";
    }
  });

  function rainbow() {
    const enabled = !document.documentElement.classList.contains("rainbow");

    if (enabled) {
      const accent = sessionStorage.getItem(accentKey);
      const accentInk = sessionStorage.getItem(accentInkKey);

      if (accent !== rainbowAccent) {
        sessionStorage.setItem(beforeRainbowAccentKey, accent ?? "");
        sessionStorage.setItem(beforeRainbowAccentInkKey, accentInk ?? "");
      }

      setAccent(rainbowAccent, rainbowAccentInk);
    } else {
      const accent = sessionStorage.getItem(beforeRainbowAccentKey);
      const accentInk = sessionStorage.getItem(beforeRainbowAccentInkKey);

      if (accent && accentInk) {
        setAccent(accent, accentInk);
      } else {
        setAccent(...generatePlainAccent());
      }

      sessionStorage.removeItem(beforeRainbowAccentKey);
      sessionStorage.removeItem(beforeRainbowAccentInkKey);
    }

    document.documentElement.classList.toggle("rainbow", enabled);
    sessionStorage.setItem(rainbowKey, enabled ? "1" : "0");
  }

  function setAccent(accent, accentInk) {
    sessionStorage.setItem(accentKey, accent);
    sessionStorage.setItem(accentInkKey, accentInk);
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--accent-ink", accentInk);
  }

  function generatePlainAccent() {
    if (!window.generateAccent) return ["#080808", "#ffffff"];

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const accent = window.generateAccent();

      if (!accent.rainbow) {
        return [accent.color, accent.ink];
      }
    }

    return ["oklch(64% 0.24 180)", "#080808"];
  }

  function confetti() {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const pieces = [];
    let frame = 0;

    Object.assign(canvas.style, {
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      zIndex: 999,
    });

    document.body.append(canvas);

    const size = () => {
      canvas.width = innerWidth;
      canvas.height = innerHeight;
    };

    size();
    addEventListener("resize", size, { once: true });

    for (let index = 0; index < 260; index += 1) {
      pieces.push({
        x: innerWidth * (0.25 + Math.random() * 0.5),
        y: innerHeight * (0.08 + Math.random() * 0.12),
        vx: (Math.random() - 0.5) * 18,
        vy: Math.random() * -14 - 5,
        radius: Math.random() * 10 + 6,
        color: `hsl(${Math.random() * 360} 100% 50%)`,
      });
    }

    const draw = () => {
      frame += 1;
      context.clearRect(0, 0, canvas.width, canvas.height);

      for (const piece of pieces) {
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.vy += 0.28;
        piece.vx *= 0.99;
        context.fillStyle = piece.color;
        context.fillRect(piece.x, piece.y, piece.radius, piece.radius * 0.55);
      }

      if (frame < 220) {
        requestAnimationFrame(draw);
      } else {
        canvas.remove();
      }
    };

    draw();
  }
})();
