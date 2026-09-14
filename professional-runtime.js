/* Beyond Infinity: Soloverse — runtime stability layer.
   Additive safety improvements; gameplay code remains untouched. */
(() => {
  'use strict';

  // Avoid a runaway frame after the browser suspends the tab/app.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.state && state.running && !state.paused && typeof window.togglePause === 'function') {
      try { window.togglePause(); } catch (_) {}
    }
  });

  // Mobile browsers can leave a held control active when focus is lost.
  const releaseKeys = () => {
    if (!window.state || !Array.isArray(state.players)) return;
    state.players.forEach(p => {
      if (!p || !p.keys) return;
      p.keys.left = false;
      p.keys.right = false;
      p.keys.up = false;
      p.keys.down = false;
    });
  };
  window.addEventListener('blur', releaseKeys);
  window.addEventListener('pagehide', releaseKeys);

  // Keep the game viewport synchronized after orientation changes without
  // firing a resize storm during Android browser UI transitions.
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (typeof window.resizeCanvas === 'function') {
        try { window.resizeCanvas(); } catch (_) {}
      }
    }, 120);
  }, { passive: true });

  // Suppress browser gestures only while the actual game is visible.
  document.addEventListener('touchmove', e => {
    const game = document.getElementById('game-ui');
    if (game && !game.classList.contains('hidden')) e.preventDefault();
  }, { passive: false });
})();
