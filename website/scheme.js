(() => {
  const key = "dominique-garmier-accent";
  const lastKey = "dominique-garmier-last-accent";
  const navigation = performance.getEntriesByType("navigation")[0];

  if (navigation && navigation.type === "reload") {
    sessionStorage.removeItem(key);
    sessionStorage.removeItem(`${key}-ink`);
    sessionStorage.removeItem(`${key}-rainbow`);
  }

  let accent = sessionStorage.getItem(key);
  let accentInk = sessionStorage.getItem(`${key}-ink`);
  let rainbow = sessionStorage.getItem(`${key}-rainbow`);

  if (accent === null || accentInk === null || rainbow === null) {
    const previousHue = Number(localStorage.getItem(lastKey));
    const next = window.generateAccent(previousHue);
    accent = next.color;
    accentInk = next.ink;
    rainbow = next.rainbow ? "1" : "0";
    sessionStorage.setItem(key, accent);
    sessionStorage.setItem(`${key}-ink`, accentInk);
    sessionStorage.setItem(`${key}-rainbow`, rainbow);
    localStorage.setItem(lastKey, String(next.hue));
  }

  document.documentElement.style.setProperty("--accent", accent);
  document.documentElement.style.setProperty("--accent-ink", accentInk);
  document.documentElement.classList.toggle("rainbow", rainbow === "1");
})();
