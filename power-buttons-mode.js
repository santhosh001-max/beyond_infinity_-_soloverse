// Show Player 2 power buttons only when the game's existing Player 2 HUD is active.
// This follows the game's own two-player state instead of guessing from state.players.
(function () {
  const P2_SELECTOR = '#power-buttons-p2';
  const P2_HULL_SELECTOR = '#hull-bar-p2';

  function syncPlayer2Buttons() {
    const buttons = document.querySelector(P2_SELECTOR);
    const p2Hull = document.querySelector(P2_HULL_SELECTOR);
    if (!buttons) return;

    // game.js already adds/removes the "hidden" class on this element when
    // Player 2 is active. Use that same source of truth for the power buttons.
    const showP2 = !!p2Hull && !p2Hull.classList.contains('hidden');

    buttons.hidden = !showP2;
    buttons.style.display = showP2 ? '' : 'none';
    buttons.setAttribute('aria-hidden', showP2 ? 'false' : 'true');
  }

  function startSync() {
    syncPlayer2Buttons();

    const p2Hull = document.querySelector(P2_HULL_SELECTOR);
    if (p2Hull) {
      new MutationObserver(syncPlayer2Buttons).observe(p2Hull, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    // Also do a lightweight periodic check for mode/run transitions.
    setInterval(syncPlayer2Buttons, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSync, { once: true });
  } else {
    startSync();
  }
})();
