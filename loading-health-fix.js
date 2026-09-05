/* Beyond Infinity: Soloverse - loading/HUD synchronization fix
 * The health HUD must never be visible during the loading animation.
 * This does not change the loading animation, percentage, duration, or timing.
 */
(() => {
  const get = () => ({
    loading: document.getElementById('loading-screen'),
    gameUI: document.getElementById('game-ui'),
    hud: document.getElementById('hud')
  });

  const sync = () => {
    const { loading, gameUI, hud } = get();
    if (!loading || !gameUI || !hud) return;
    const locked = !loading.classList.contains('hidden') || gameUI.classList.contains('hidden');
    hud.style.setProperty('display', locked ? 'none' : '', 'important');
    hud.setAttribute('data-loading-locked', locked ? 'true' : 'false');
  };

  const install = () => {
    const { loading, gameUI, hud } = get();
    if (!loading || !gameUI || !hud) {
      requestAnimationFrame(install);
      return;
    }

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(loading, { attributes: true, attributeFilter: ['class'] });
    observer.observe(gameUI, { attributes: true, attributeFilter: ['class'] });

    const guard = () => {
      sync();
      if (!loading.classList.contains('hidden')) requestAnimationFrame(guard);
    };
    requestAnimationFrame(guard);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
