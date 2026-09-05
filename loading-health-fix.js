/* Beyond Infinity: Soloverse - loading/HUD synchronization fix
 * Keeps the health HUD hidden until the loading screen has completely finished.
 * Does not alter the existing loading animation or loading timing.
 */
(() => {
  const syncHealthHud = () => {
    const loading = document.getElementById('loading-screen');
    const gameUI = document.getElementById('game-ui');
    const hud = document.getElementById('hud');
    if (!loading || !gameUI || !hud) return;

    const loadingVisible = !loading.classList.contains('hidden');
    const gameVisible = !gameUI.classList.contains('hidden');

    // Never allow the health HUD to appear while loading is visible.
    hud.classList.toggle('loading-locked', loadingVisible || !gameVisible);
  };

  const install = () => {
    const loading = document.getElementById('loading-screen');
    const gameUI = document.getElementById('game-ui');
    if (!loading || !gameUI) {
      requestAnimationFrame(install);
      return;
    }

    const style = document.createElement('style');
    style.id = 'loading-health-fix-style';
    style.textContent = '#hud.loading-locked { display: none !important; }';
    document.head.appendChild(style);

    const observer = new MutationObserver(syncHealthHud);
    observer.observe(loading, { attributes: true, attributeFilter: ['class', 'style'] });
    observer.observe(gameUI, { attributes: true, attributeFilter: ['class', 'style'] });

    syncHealthHud();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
