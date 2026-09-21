(() => {
  let savedLanguage = null;
  try {
    savedLanguage = window.localStorage.getItem("luma-language");
  } catch {
    // Fall back to the browser preference when storage is unavailable.
  }

  const browserLanguage = navigator.languages?.[0] || navigator.language || "en";
  const preferredLanguage = savedLanguage || browserLanguage;
  const prefersChinese = preferredLanguage === "zh-Hans" || /^zh(?:-|$)/i.test(preferredLanguage);

  if (prefersChinese) return;

  const target = new URL("./en/", window.location.href);
  target.search = window.location.search;
  target.hash = window.location.hash;
  window.location.replace(target.href);
})();
