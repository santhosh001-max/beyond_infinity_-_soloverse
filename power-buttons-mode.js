// Show Player 2 power buttons only when a second active player exists.
// Single-player games keep the Player 2 cluster completely hidden.
(function () {
  const P2_SELECTOR = '#power-buttons-p2';

  function syncPlayer2Buttons() {
    const el = document.querySelector(P2_SELECTOR);
    if (!el) return;

    let showP2 = false;
    try {
      // The game engine keeps the active players in the global state object.
      showP2 = Array.isArray(state?.players) && state.players.length > 1;
    } catch (_) {
      showP2 = false;
    }

    el.hidden = !showP2;
    el.setAttribute('aria-hidden', showP2 ? 'false' : 'true');
  }

  function startSync() {
    syncPlayer2Buttons();
    // The player/mode state can change when a run starts, so re-check cheaply.
    setInterval(syncPlayer2Buttons, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSync, { once: true });
  } else {
    startSync();
  }
})();
