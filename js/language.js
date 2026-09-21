(() => {
  const siteRoot = new URL("../", document.currentScript.src);
  const rootPath = siteRoot.pathname;
  const isRootHomepage = window.location.pathname === rootPath || window.location.pathname === `${rootPath}index.html`;

  // Never redirect from a localized page or a nested documentation route.
  if (!isRootHomepage) return;

  let savedLanguage = null;
  try {
    savedLanguage = window.localStorage.getItem("luma-language");
  } catch {
    // Fall back to the browser preference when storage is unavailable.
  }

  const browserLanguage = navigator.languages?.[0] || navigator.language || "en";
  const preferredLanguage = savedLanguage || browserLanguage;
  const prefersChinese = preferredLanguage === "zh-Hans" || /^zh(?:-|$)/i.test(preferredLanguage);

  if (!prefersChinese) return;

  const target = new URL("cn/", siteRoot);
  target.search = window.location.search;
  target.hash = window.location.hash;
  window.location.replace(target.href);
})();
