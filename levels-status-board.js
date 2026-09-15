/* Beyond Infinity: Soloverse — Levels Mode Status Board
   Dedicated HUD for Levels gameplay only.
   Legacy path/score/hull HUD is hidden while Levels mode is active. */
(() => {
  'use strict';

  const LEVELS = {
    1: { name: 'THE MOON', task: 'REACH THE MOON', emoji: '🌕', target: 2500 },
    2: { name: 'MARS', task: 'REACH MARS', emoji: '🔴', target: 3200 },
    3: { name: 'VENUS', task: 'REACH VENUS', emoji: '🟠', target: 4000 },
    4: { name: 'MERCURY', task: 'REACH MERCURY', emoji: '⚪', target: 4800 },
    5: { name: 'JUPITER', task: 'REACH JUPITER', emoji: '🟤', target: 5600 },
    6: { name: 'SATURN', task: 'REACH SATURN', emoji: '🪐', target: 6400 },
    7: { name: 'URANUS', task: 'REACH URANUS', emoji: '🔵', target: 7200 },
    8: { name: 'NEPTUNE', task: 'REACH NEPTUNE', emoji: '🔵', target: 8000 }
  };

  const el = id => document.getElementById(id);
  const text = (id, value) => { const n = el(id); if (n) n.textContent = value; };

  function numberFrom(value, fallback = 0) {
    const n = Number(String(value ?? '').replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : fallback;
  }

  function levelNumber() {
    const current = window.state && window.state.currentLevel;
    if (current && Number.isFinite(Number(current.level_number))) {
      return Math.max(1, Math.min(8, Number(current.level_number)));
    }
    const label = el('level-label');
    const match = label && String(label.textContent).match(/(\d+)/);
    return match ? Math.max(1, Math.min(8, Number(match[1]))) : 1;
  }

  function isLevelsMode() {
    return !!(window.state && window.state.mode === 'levels');
  }

  function readHull() {
    const label = el('hull-label');
    const match = label && String(label.textContent).match(/(\d+(?:\.\d+)?)\s*%/);
    return match ? Number(match[1]) : 100;
  }

  function readScore() {
    const n = el('score-current');
    return n ? numberFrom(n.textContent, 0) : 0;
  }

  function readBest() {
    const n = el('score-best');
    return n ? numberFrom(n.textContent, 0) : 0;
  }

  function readCoins() {
    const n = el('coin-count');
    return n ? numberFrom(n.textContent, 0) : 0;
  }

  function readProgress() {
    const fill = el('path-fill');
    if (!fill) return 0;
    const n = Number(String(fill.style.width || '').replace('%', ''));
    return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
  }

  function ensureBoard() {
    if (el('bi-level-status-board')) return el('bi-level-status-board');
    const gameUI = el('game-ui');
    if (!gameUI) return null;

    const board = document.createElement('section');
    board.id = 'bi-level-status-board';
    board.setAttribute('aria-label', 'Levels mode status board');
    board.innerHTML = `
      <div class="bi-hud-panel bi-ship-panel">
        <div class="bi-ship-mark">✦</div>
        <div>
          <div class="bi-kicker">CURRENT MISSION</div>
          <div class="bi-ship-name" id="bi-ship-name">AURORA</div>
          <div class="bi-level-name" id="bi-level-name">LEVEL 01 • THE MOON</div>
        </div>
        <span class="bi-level-chip">SOLOVERSE / LEVELS</span>
      </div>

      <div class="bi-hud-panel bi-stat">
        <div class="bi-stat-head"><span>HEALTH</span><span id="bi-hull-value">100 / 100</span></div>
        <div class="bi-stat-value">HULL INTEGRITY</div>
        <div class="bi-meter"><div class="bi-meter-fill" id="bi-hull-meter"></div></div>
      </div>

      <div class="bi-hud-panel bi-stat">
        <div class="bi-stat-head"><span>SHIELD</span><span id="bi-shield-value">100 / 100</span></div>
        <div class="bi-stat-value">PROTECTION</div>
        <div class="bi-meter"><div class="bi-meter-fill" id="bi-shield-meter"></div></div>
      </div>

      <div class="bi-hud-panel bi-stat">
        <div class="bi-stat-head"><span>SPEED</span><span id="bi-speed-value">80 / 100</span></div>
        <div class="bi-stat-value">CRUISE</div>
        <div class="bi-meter"><div class="bi-meter-fill" id="bi-speed-meter"></div></div>
      </div>

      <div class="bi-hud-panel bi-stat">
        <div class="bi-stat-head"><span>DISTANCE</span><span id="bi-distance-value">0 / 2,500</span></div>
        <div class="bi-stat-value">MISSION PROGRESS</div>
        <div class="bi-meter"><div class="bi-meter-fill" id="bi-distance-meter"></div></div>
      </div>

      <div class="bi-hud-panel bi-objective">
        <div class="bi-planet-orb" id="bi-planet-orb">🌕</div>
        <div>
          <div class="bi-kicker">PRIMARY OBJECTIVE</div>
          <div class="bi-objective-title" id="bi-objective-title">THE MOON</div>
          <div class="bi-objective-sub" id="bi-objective-sub">REACH THE MOON</div>
        </div>
      </div>

      <div class="bi-hud-panel bi-right">
        <div class="bi-mini">SCORE<b id="bi-score">0</b></div>
        <div class="bi-mini">RUPEES<b id="bi-coins">0</b></div>
        <div class="bi-mini">BEST<b id="bi-best">0</b></div>
        <div class="bi-mini">STATUS<b id="bi-status">READY</b></div>
        <span class="bi-board-corner">LEVEL HUD</span>
      </div>

      <div class="bi-hud-panel bi-controls" aria-label="Level HUD controls">
        <button class="bi-control-btn" id="bi-pause" type="button" aria-label="Pause" title="Pause">Ⅱ</button>
        <button class="bi-control-btn" id="bi-settings" type="button" aria-label="Settings" title="Settings">⚙</button>
      </div>`;

    gameUI.appendChild(board);

    const pause = el('bi-pause');
    const settings = el('bi-settings');
    if (pause) pause.addEventListener('click', () => {
      if (typeof window.togglePause === 'function') window.togglePause();
      else el('btn-pause-ingame')?.click();
    });
    if (settings) settings.addEventListener('click', () => {
      el('hotspot-settings')?.click();
      el('btn-settings-levels')?.click();
    });

    return board;
  }

  function update() {
    const board = ensureBoard();
    if (!board) return;

    const level = levelNumber();
    const info = LEVELS[level] || LEVELS[1];
    const hull = Math.max(0, Math.min(100, readHull()));
    const progress = readProgress();
    const distance = Math.round(info.target * progress / 100);

    text('bi-level-name', `LEVEL ${String(level).padStart(2, '0')} • ${info.name}`);
    text('bi-objective-title', info.name);
    text('bi-objective-sub', info.task);
    text('bi-planet-orb', info.emoji);
    text('bi-hull-value', `${Math.round(hull)} / 100`);
    text('bi-distance-value', `${distance.toLocaleString()} / ${info.target.toLocaleString()}`);
    text('bi-score', readScore().toLocaleString());
    text('bi-best', readBest().toLocaleString());
    text('bi-coins', readCoins().toLocaleString());

    const hullMeter = el('bi-hull-meter');
    const distanceMeter = el('bi-distance-meter');
    if (hullMeter) hullMeter.style.width = `${hull}%`;
    if (distanceMeter) distanceMeter.style.width = `${progress}%`;

    const gameState = window.state;
    const rawSpeed = gameState && Number.isFinite(Number(gameState.speed)) ? Number(gameState.speed) : 8;
    const speed = Math.max(0, Math.min(100, rawSpeed * 10));
    const shield = el('shield-indicator');
    const shieldMatch = shield && String(shield.textContent || '').match(/([0-9]+)\s*%/);
    const shieldValue = shieldMatch ? Number(shieldMatch[1]) : 100;

    text('bi-speed-value', `${Math.round(speed)} / 100`);
    text('bi-shield-value', `${Math.round(Math.max(0, Math.min(100, shieldValue)))} / 100`);
    const speedMeter = el('bi-speed-meter');
    const shieldMeter = el('bi-shield-meter');
    if (speedMeter) speedMeter.style.width = `${speed}%`;
    if (shieldMeter) shieldMeter.style.width = `${shieldValue}%`;

    text('bi-status', gameState?.running ? 'NOMINAL' : 'READY');
  }

  function syncMode() {
    const active = isLevelsMode();
    document.body.classList.toggle('bi-levels-mode', active);
    const board = el('bi-level-status-board');
    if (board) board.style.display = active ? 'grid' : 'none';
  }

  function init() {
    ensureBoard();
    update();
    syncMode();

    setInterval(() => {
      update();
      syncMode();
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
