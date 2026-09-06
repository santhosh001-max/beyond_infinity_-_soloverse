// Keep power buttons completely hidden during loading and outside active gameplay.
// Player 2 is shown only when the game's existing Player 2 HUD is active.
(function () {
  const P1_SELECTOR = '#power-buttons-p1';
  const P2_SELECTOR = '#power-buttons-p2';
  const P2_HULL_SELECTOR = '#hull-bar-p2';
  const LOADING_SELECTOR = '#loading-screen';
  const GAME_UI_SELECTOR = '#game-ui';

  function isLoading() {
    const loading = document.querySelector(LOADING_SELECTOR);
    return !!loading && !loading.classList.contains('hidden');
  }

  function isGameUIActive() {
    const gameUI = document.querySelector(GAME_UI_SELECTOR);
    return !!gameUI && !gameUI.classList.contains('hidden');
  }

  function forceHidden(element) {
    if (!element) return;
    element.hidden = true;
    element.style.setProperty('display', 'none', 'important');
    element.setAttribute('aria-hidden', 'true');
  }

  function show(element) {
    if (!element) return;
    element.hidden = false;
    element.style.removeProperty('display');
    element.setAttribute('aria-hidden', 'false');
  }

  function syncPowerButtons() {
    const p1 = document.querySelector(P1_SELECTOR);
    const p2 = document.querySelector(P2_SELECTOR);
    const p2Hull = document.querySelector(P2_HULL_SELECTOR);

    // Never show any power buttons during the loading screen or before gameplay.
    if (isLoading() || !isGameUIActive()) {
      forceHidden(p1);
      forceHidden(p2);
      return;
    }

    // Player 1 is available in active gameplay.
    show(p1);

    // Player 2 follows the game's own HUD state.
    const showP2 = !!p2Hull && !p2Hull.classList.contains('hidden');
    if (showP2) {
      show(p2);
    } else {
      forceHidden(p2);
    }
  }

  function startSync() {
    syncPowerButtons();

    const loading = document.querySelector(LOADING_SELECTOR);
    const gameUI = document.querySelector(GAME_UI_SELECTOR);
    const p2Hull = document.querySelector(P2_HULL_SELECTOR);

    // Watch the same class changes used by the game's screen/loading system.
    [loading, gameUI, p2Hull].forEach((element) => {
      if (!element) return;
      new MutationObserver(syncPowerButtons).observe(element, {
        attributes: true,
        attributeFilter: ['class']
      });
    });

    // Lightweight safety check for transitions between screens/runs.
    setInterval(syncPowerButtons, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSync, { once: true });
  } else {
    startSync();
  }
})();
