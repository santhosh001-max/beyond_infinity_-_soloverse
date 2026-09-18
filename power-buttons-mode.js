// Keep power buttons completely hidden during loading and outside active gameplay.
// Player 2 is shown only when the game's existing Player 2 HUD is active.
(function () {
  const P1_SELECTOR = '#power-buttons-p1';
  const P2_SELECTOR = '#power-buttons-p2';
  const P2_HULL_SELECTOR = '#hull-bar-p2';
  const LOADING_SELECTOR = '#loading-screen';
  const GAME_UI_SELECTOR = '#game-ui';
  const PAUSE_SELECTOR = '#overlay-pause';
  const END_OVERLAY_SELECTORS = ['#overlay-win', '#overlay-lose'];

  function isLoading() {
    const loading = document.querySelector(LOADING_SELECTOR);
    return !!loading && !loading.classList.contains('hidden');
  }

  function isPaused() {
    const pause = document.querySelector(PAUSE_SELECTOR);
    return !!pause && !pause.classList.contains('hidden');
  }

  function isEndOverlayOpen() {
    return END_OVERLAY_SELECTORS.some((selector) => {
      const overlay = document.querySelector(selector);
      return !!overlay && !overlay.classList.contains('hidden');
    });
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
    const pause = document.querySelector(PAUSE_SELECTOR);

    // Never show any power buttons during the loading screen or before gameplay.
    // Power buttons are gameplay-only: hide them while the pause menu is open.
    if (isLoading() || isPaused() || isEndOverlayOpen() || !isGameUIActive()) {
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
    const pause = document.querySelector(PAUSE_SELECTOR);
    const endOverlays = END_OVERLAY_SELECTORS.map((selector) => document.querySelector(selector)).filter(Boolean);

    // Watch screen, pause, and end-of-level overlay class changes.
    [loading, gameUI, p2Hull, pause, ...endOverlays].forEach((element) => {
      if (!element) return;
      new MutationObserver(syncPowerButtons).observe(element, {
        attributes: true,
        attributeFilter: ['class']
      });
    });

    // Lightweight safety check for transitions between screens/runs.
    setInterval(syncPowerButtons, 100);
  }



  // Gameplay actions for the six supplied power buttons.
  // P1 (blue) and P2 (purple) share the same numbered functions.
  function bindGameplayPowers() {
    const buttons = document.querySelectorAll('.power-button-cluster .power-button');
    const cooldown = new WeakMap();

    function fire(player) {
      if (!player || !player.alive) return;
      const now = performance.now();
      if (now - (player.lastManualShotAt || 0) < 120) return;
      player.lastManualShotAt = now;
      const x = player.x + player.w / 2 - 10;
      state.bullets.push({ x, y: player.y, w: 20, h: 9, vy: -11, char: player.char });
      // Double Gun means exactly two beams total, replacing the single beam.
      if (isPowerActive(player, 'doubleGun')) {
        state.bullets.pop();
        state.bullets.push({ x: player.x + 4, y: player.y, w: 20, h: 9, vy: -11, char: player.char });
        state.bullets.push({ x: player.x + player.w - 24, y: player.y, w: 20, h: 9, vy: -11, char: player.char });
      }
      if (typeof Sound !== 'undefined') Sound.shoot();
    }

    function activate(player, type) {
      if (!player || !player.alive || typeof POWER_TYPES === 'undefined') return;
      const now = performance.now();
      player.activePowers[type] = now + (POWER_TYPES[type]?.duration || 6000);
      if (typeof Sound !== 'undefined') Sound.power(type);
      if (typeof renderActivePowerBadges === 'function') renderActivePowerBadges();
    }

    function special(player) {
      if (!player || !player.alive) return;
      const now = performance.now();
      if (now - (player.lastSpecialAt || 0) < 1500) return;
      player.lastSpecialAt = now;

      // Blue Fighter: focused 3-shot plasma burst.
      // Purple Fighter: wider 5-shot plasma burst.
      const count = player.char === 'purple' ? 5 : 3;
      const center = player.x + player.w / 2;
      const spread = player.char === 'purple' ? 22 : 16;
      for (let i = 0; i < count; i++) {
        const offset = i - (count - 1) / 2;
        state.bullets.push({
          x: center - 10 + offset * spread,
          y: player.y,
          w: 20,
          h: 11,
          vy: -13,
          char: player.char,
          special: true
        });
      }
      if (typeof Sound !== 'undefined') Sound.power('energy');
    }

    function usePower(player, type) {
      if (!player || !player.alive) return;
      const now = performance.now();
      const last = cooldown.get(player) || {};
      if (last[type] && now - last[type] < 350) return;
      last[type] = now;
      cooldown.set(player, last);

      if (type === 'attack') fire(player);
      else if (type === 'heal') {
        player.hearts = Math.min(player.maxHearts, player.hearts + 1);
        if (typeof renderHull === 'function') renderHull(player.index);
        if (typeof Sound !== 'undefined') Sound.power('heart');
      } else if (type === 'shield') activate(player, 'shield');
      else if (type === 'boost') activate(player, 'speed');
      else if (type === 'double-gun') activate(player, 'doubleGun');
      else if (type === 'special') special(player);
    }

    // Keyboard shortcuts for gameplay powers.
    // Player 1: L Attack, U Heal, J Shield, I Boost, O Double Gun, P Special.
    // Player 2: Space Attack, Q Heal, E Shield, F Boost, C Double Gun, R Special.
    const keyPowers = {
      l: ['p1', 'attack'],
      u: ['p1', 'heal'],
      j: ['p1', 'shield'],
      i: ['p1', 'boost'],
      o: ['p1', 'double-gun'],
      p: ['p1', 'special'],
      ' ': ['p2', 'attack'],
      q: ['p2', 'heal'],
      e: ['p2', 'shield'],
      f: ['p2', 'boost'],
      c: ['p2', 'double-gun'],
      r: ['p2', 'special']
    };
    const pressedPowerKeys = new Set();

    window.addEventListener('keydown', (event) => {
      if (!state.running || state.paused) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const mapping = keyPowers[key];
      if (!mapping || pressedPowerKeys.has(key)) return;

      // These keys are dedicated to gameplay powers.
      event.preventDefault();
      pressedPowerKeys.add(key);
      const player = mapping[0] === 'p2' ? p2() : p1();
      usePower(player, mapping[1]);
    });

    window.addEventListener('keyup', (event) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      pressedPowerKeys.delete(key);
    });

    buttons.forEach((button) => {
      if (button.dataset.powerBound === '1') return;
      button.dataset.powerBound = '1';
      button.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const cluster = button.closest('.power-button-cluster');
        const player = cluster?.id === 'power-buttons-p2' ? p2() : p1();
        usePower(player, button.dataset.power);
      });
    });
  }

  bindGameplayPowers();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSync, { once: true });
  } else {
    startSync();
  }
})();
