(() => {
  let timer;
  document.addEventListener('input', event => {
    if (!event.target.matches('#matrix input')) return;
    clearTimeout(timer);
    timer = setTimeout(() => window.StrategiesApp?.analyse(), 180);
  });
})();
