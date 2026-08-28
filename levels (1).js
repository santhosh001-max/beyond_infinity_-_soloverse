// Root-level levels.js wrapper
// This script is intentionally defensive:
// - If the full game (game.js) provides startLevel(), we wire the overlay
//   hotspot buttons to that function (no overwriting).
// - Otherwise we load the lightweight fallback at js/levels.js (used by
//   standalone pages) and bind handlers after it loads.
// - We also retry binding for a short window in case scripts load later.
(function(){
  if (window.__levels_wrapper_loaded) return;
  window.__levels_wrapper_loaded = true;

  function safeAddClick(el, fn) {
    if (!el) return false;
    if (el.__levels_bound) return true;
    el.addEventListener('click', fn);
    el.__levels_bound = true;
    return true;
  }

  function bindOverlayHotspots() {
    // Attach handlers to overlay hotspots if present. Idempotent.
    // Level hotspots
    for (let i = 1; i <= 8; i++) {
      const id = 'level-' + i;
      const el = document.getElementById(id);
      if (!el) continue;
      safeAddClick(el, () => {
        if (typeof window.startLevel === 'function') return window.startLevel(i);
        console.warn('startLevel() not available when clicking', id);
      });
    }

    // Back / settings / upgrade / collect
    safeAddClick(document.getElementById('btn-back'), () => {
      if (typeof window.goBack === 'function') return window.goBack();
      if (typeof window.showScreen === 'function') return window.showScreen('title');
      console.warn('goBack/showScreen not available for btn-back');
    });
    safeAddClick(document.getElementById('btn-settings'), () => {
      if (typeof window.showOverlay === 'function') return window.showOverlay('settings');
      console.warn('showOverlay not available for btn-settings');
    });
    safeAddClick(document.getElementById('btn-upgrade'), () => {
      if (typeof window.renderShop === 'function') { window.renderShop(); if (typeof window.showOverlay === 'function') return window.showOverlay('shop'); }
      console.warn('renderShop/showOverlay not available for btn-upgrade');
    });
    safeAddClick(document.getElementById('btn-collect-stars'), () => {
      // no-op placeholder
      console.log('Collect Stars clicked');
    });

    // Also bind small page-level buttons (index.html variants)
    for (const id of ['mode-levels','btn-level-select-back','btn-settings-levels','btn-shop-levels']) {
      const el = document.getElementById(id);
      if (!el) continue;
      // Many of these are wired elsewhere; only add a no-op guard to avoid missing handlers
      safeAddClick(el, () => {
        // Prefer existing functions if available
        if (id === 'mode-levels' && typeof window.renderLevelSelect === 'function' && typeof window.showScreen === 'function') return window.renderLevelSelect() && window.showScreen('levelSelect');
        if (id === 'btn-level-select-back' && typeof window.showScreen === 'function') return window.showScreen('home');
        if (id === 'btn-settings-levels' && typeof window.showOverlay === 'function') return window.showOverlay('settings');
        if (id === 'btn-shop-levels' && typeof window.renderShop === 'function') { window.renderShop(); if (typeof window.showOverlay === 'function') return window.showOverlay('shop'); }
        console.warn('No handler available for', id);
      });
    }
  }

  // Try to bind immediately if possible
  if (document.readyState !== 'loading') bindOverlayHotspots();
  else document.addEventListener('DOMContentLoaded', bindOverlayHotspots);

  // If the game's startLevel appears after this script runs (scripts loaded later),
  // retry binding periodically for a short time and then stop.
  let attempts = 0;
  const maxAttempts = 30; // ~3 seconds if interval 100ms
  const interval = setInterval(() => {
    attempts++;
    bindOverlayHotspots();
    if (typeof window.startLevel === 'function' || attempts >= maxAttempts) {
      clearInterval(interval);
      if (typeof window.startLevel === 'function') {
        console.log('levels wrapper: startLevel detected, overlay hotspots bound');
      } else if (attempts >= maxAttempts) {
        console.log('levels wrapper: finished retry attempts (startLevel not detected)');
      }
    }
  }, 100);

  // If there is already a real startLevel, do not load the fallback js/levels.js
  // (that file contains a lightweight stub). Only load fallback when startLevel
  // is missing so standalone pages still work.
  if (typeof window.startLevel === 'function') {
    // Nothing more to do (we already bound above).
    return;
  }

  // Load fallback implementation (relative path from repo root)
  var script = document.createElement('script');
  script.src = 'js/levels.js';
  script.onload = function(){
    console.log('Loaded js/levels.js via root-level wrapper');
    // bind after fallback defines startLevel/goBack
    bindOverlayHotspots();
  };
  script.onerror = function(){
    console.error('Failed to load js/levels.js from expected path "js/levels.js". Check that file exists and the server serves it.');
    // still attempt binding in case the full game loads later
  };
  document.head.appendChild(script);
})();
