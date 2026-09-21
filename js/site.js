(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-demo-root]").forEach((root) => {
    const image = root.querySelector("[data-demo-image]");
    const tabs = [...root.querySelectorAll("[data-src]")];
    let current = 0;
    let timer;

    const select = (index) => {
      current = index;
      tabs.forEach((tab, tabIndex) => {
        const active = tabIndex === index;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
      });
      image.classList.add("is-changing");
      window.setTimeout(() => {
        image.src = tabs[index].dataset.src;
        image.alt = tabs[index].dataset.alt;
        image.classList.remove("is-changing");
      }, reduceMotion ? 0 : 150);
    };

    const stop = () => window.clearInterval(timer);
    const start = () => {
      if (reduceMotion) return;
      stop();
      timer = window.setInterval(() => select((current + 1) % tabs.length), 2800);
    };

    tabs.forEach((tab, index) => tab.addEventListener("click", () => {
      select(index);
    }));
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);
    start();
  });
})();
