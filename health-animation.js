/* Beyond Infinity: Soloverse - reference-style animated health HUD
 * Uses the existing #hull-bar / #hull-fill / #hull-label elements.
 * No game.js health logic is changed.
 * Layout: health bar -> PLAYER 1 label, then health bar -> PLAYER 2 label.
 * Each percentage sits immediately to the right of its own bar.
 */
(() => {
  const style = document.createElement('style');
  style.id = 'health-animation-style';
  style.textContent = `
    /* ---------- overall stack ---------- */
    #hull-bars {
      display: flex !important;
      flex-direction: column !important;
      align-items: flex-start !important;
      justify-content: flex-start !important;
      gap: 30px !important;
      width: min(590px, 64vw) !important;
      min-width: 260px !important;
      padding: 8px 0 26px !important;
      overflow: visible !important;
    }

    /* ---------- main futuristic health panel ---------- */
    #hull-bar,
    #hull-bar-p2 {
      --health-pct: 100;
      position: relative !important;
      box-sizing: border-box !important;
      width: min(500px, 54vw) !important;
      min-width: 250px !important;
      height: 64px !important;
      margin: 0 !important;
      overflow: visible !important;
      border: 0 !important;
      border-radius: 0 !important;
      background: linear-gradient(180deg, rgba(11,30,54,.98), rgba(2,10,25,.98)) !important;
      clip-path: polygon(
        0 18%, 3% 0, 82% 0, 84% 12%, 94% 12%, 98% 29%,
        100% 50%, 98% 71%, 94% 88%, 84% 88%, 82% 100%,
        3% 100%, 0 82%
      ) !important;
      box-shadow:
        inset 0 0 0 1px rgba(101,222,255,.85),
        inset 0 0 22px rgba(0,132,255,.22),
        0 0 18px rgba(0,184,255,.26) !important;
      isolation: isolate !important;
      transform: translateZ(0) !important;
    }

    /* angular outer frame */
    #hull-bar::before,
    #hull-bar-p2::before {
      content: '';
      position: absolute;
      inset: 2px;
      z-index: 0;
      pointer-events: none;
      border: 1px solid rgba(0,211,255,.55);
      background:
        linear-gradient(90deg, rgba(0,225,255,.09), transparent 26%, transparent 72%, rgba(0,225,255,.08)),
        linear-gradient(180deg, rgba(255,255,255,.05), transparent 35%, rgba(0,100,190,.08));
      clip-path: polygon(
        0 18%, 3% 0, 82% 0, 84% 12%, 94% 12%, 98% 29%,
        100% 50%, 98% 71%, 94% 88%, 84% 88%, 82% 100%,
        3% 100%, 0 82%
      );
      box-shadow: 0 0 14px rgba(0,207,255,.34);
    }

    /* segmented inner track */
    #hull-bar::after,
    #hull-bar-p2::after {
      content: '';
      position: absolute;
      left: 78px;
      right: 72px;
      top: 33px;
      height: 16px;
      z-index: 1;
      pointer-events: none;
      border: 1px solid rgba(98,211,255,.55);
      background:
        repeating-linear-gradient(
          90deg,
          rgba(17,58,86,.95) 0,
          rgba(17,58,86,.95) calc(10% - 3px),
          rgba(1,9,21,.98) calc(10% - 3px),
          rgba(1,9,21,.98) 10%
        );
      box-shadow: inset 0 0 9px rgba(0,0,0,.75), 0 0 7px rgba(0,179,255,.25);
    }

    /* ---------- hexagonal heart badge ---------- */
    .health-heart {
      position: absolute;
      left: 14px;
      top: 11px;
      width: 52px;
      height: 42px;
      z-index: 5;
      display: grid;
      place-items: center;
      color: #54eaff;
      font-size: 25px;
      line-height: 1;
      background: linear-gradient(145deg, rgba(30,103,148,.9), rgba(3,25,51,.98));
      border: 1px solid rgba(100,235,255,.95);
      clip-path: polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%);
      text-shadow: 0 0 7px #00dfff, 0 0 18px rgba(0,203,255,.75);
      box-shadow: 0 0 16px rgba(0,213,255,.6);
      pointer-events: none;
      animation: healthHeartIdle 2.2s ease-in-out infinite;
    }

    .health-title {
      position: absolute;
      left: 79px;
      top: 7px;
      z-index: 5;
      font: 800 11px/1 Arial, sans-serif;
      letter-spacing: 3px;
      color: rgba(179,239,255,.96);
      text-shadow: 0 0 8px rgba(0,214,255,.8);
      pointer-events: none;
    }

    .health-player {
      position: absolute;
      left: 8px;
      bottom: -24px;
      z-index: 10;
      font: 800 12px/1 Arial, sans-serif;
      letter-spacing: 2.2px;
      color: #dffaff;
      text-shadow: 0 0 7px rgba(0,206,255,.72);
      pointer-events: none;
      white-space: nowrap;
    }

    /* percentage is deliberately outside the bar, on its right */
    .health-percent {
      position: absolute;
      left: calc(100% + 12px);
      top: 50%;
      transform: translateY(-50%);
      z-index: 20;
      min-width: 62px;
      font: 900 25px/1 Arial, sans-serif;
      letter-spacing: 1px;
      color: #f3fdff;
      text-align: left;
      text-shadow: 0 0 8px rgba(0,218,255,.92), 0 0 18px rgba(0,130,255,.52);
      pointer-events: none;
      transition: color .2s ease, text-shadow .2s ease;
    }

    /* Existing label remains the source of the live percentage but is hidden visually. */
    #hull-label,
    #hull-label-p2 {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 1px !important;
      height: 1px !important;
      overflow: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }

    /* ---------- animated fill ---------- */
    #hull-fill,
    #hull-fill-p2 {
      position: absolute !important;
      left: 80px !important;
      top: 34px !important;
      width: calc((100% - 152px) * (var(--health-pct) / 100)) !important;
      height: 14px !important;
      z-index: 3 !important;
      border: 0 !important;
      border-radius: 2px !important;
      transform-origin: left center !important;
      transition:
        width .42s cubic-bezier(.22,.61,.36,1),
        filter .25s ease,
        box-shadow .25s ease !important;
      background:
        linear-gradient(180deg, #baf8ff 0%, #31dcff 25%, #008fdb 72%, #0061a9 100%) !important;
      box-shadow:
        0 0 7px rgba(0,213,255,.95),
        0 0 16px rgba(0,157,255,.55),
        inset 0 1px 2px rgba(255,255,255,.8) !important;
      overflow: hidden !important;
    }

    #hull-fill::after,
    #hull-fill-p2::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(105deg, transparent 0 38%, rgba(255,255,255,.75) 47%, transparent 56% 100%);
      background-size: 240% 100%;
      animation: healthSweep 2.4s linear infinite;
      pointer-events: none;
    }

    /* P2 uses the purple energy variant while keeping the same layout/order. */
    #hull-bar-p2 {
      box-shadow:
        inset 0 0 0 1px rgba(190,126,255,.82),
        inset 0 0 22px rgba(132,45,255,.22),
        0 0 18px rgba(155,72,255,.28) !important;
    }

    #hull-bar-p2::before {
      border-color: rgba(212,154,255,.85);
      box-shadow: 0 0 14px rgba(175,87,255,.4);
    }

    #hull-bar-p2 .health-heart {
      color: #d69bff;
      text-shadow: 0 0 8px #b65cff, 0 0 18px rgba(172,74,255,.8);
      border-color: rgba(218,168,255,.95);
    }

    #hull-bar-p2 .health-title,
    #hull-bar-p2 .health-player,
    #hull-bar-p2 .health-percent {
      color: #f2e5ff;
      text-shadow: 0 0 8px rgba(183,93,255,.9), 0 0 18px rgba(124,47,255,.5);
    }

    #hull-bar-p2::after {
      border-color: rgba(207,146,255,.5);
      background:
        repeating-linear-gradient(
          90deg,
          rgba(59,29,92,.95) 0,
          rgba(59,29,92,.95) calc(10% - 3px),
          rgba(9,4,22,.98) calc(10% - 3px),
          rgba(9,4,22,.98) 10%
        );
    }

    #hull-fill-p2 {
      background: linear-gradient(180deg, #f0d5ff 0%, #c16cff 25%, #8a35df 72%, #5c1ab1 100%) !important;
      box-shadow: 0 0 8px rgba(190,87,255,.95), 0 0 17px rgba(141,49,255,.55), inset 0 1px 2px rgba(255,255,255,.8) !important;
    }

    /* ---------- feedback animation ---------- */
    .health-hud-hit {
      animation: healthHudHit .34s ease-out;
    }

    .health-hud-heal {
      animation: healthHudHeal .5s ease-out;
    }

    .health-hud-critical {
      animation: healthCritical 1s ease-in-out infinite;
    }

    .health-hud-critical .health-heart {
      animation: healthHeartCritical .62s ease-in-out infinite;
    }

    @keyframes healthHeartIdle {
      0%,100% { transform: scale(1); }
      50% { transform: scale(1.055); }
    }

    @keyframes healthHeartCritical {
      0%,100% { transform: scale(1); filter: brightness(1); }
      50% { transform: scale(1.13); filter: brightness(1.55); }
    }

    @keyframes healthSweep {
      0% { background-position: 120% 0; }
      100% { background-position: -120% 0; }
    }

    @keyframes healthHudHit {
      0% { transform: translateZ(0) scale(1); filter: brightness(1); }
      35% { transform: translateZ(0) scale(1.018); filter: brightness(1.55); }
      100% { transform: translateZ(0) scale(1); filter: brightness(1); }
    }

    @keyframes healthHudHeal {
      0% { filter: brightness(1); }
      35% { filter: brightness(1.75); }
      100% { filter: brightness(1); }
    }

    @keyframes healthCritical {
      0%,100% { filter: brightness(1); }
      50% { filter: brightness(1.16); }
    }

    @media (max-width: 700px) {
      #hull-bars {
        width: calc(100vw - 88px) !important;
        min-width: 230px !important;
        gap: 29px !important;
      }

      #hull-bar,
      #hull-bar-p2 {
        width: min(390px, calc(100vw - 125px)) !important;
        min-width: 215px !important;
        height: 58px !important;
      }

      #hull-fill,
      #hull-fill-p2 {
        left: 68px !important;
        top: 31px !important;
        width: calc((100% - 132px) * (var(--health-pct) / 100)) !important;
        height: 13px !important;
      }

      #hull-bar::after,
      #hull-bar-p2::after {
        left: 66px;
        right: 62px;
        top: 30px;
        height: 15px;
      }

      .health-heart {
        left: 9px;
        top: 9px;
        width: 46px;
        height: 38px;
        font-size: 22px;
      }

      .health-title { left: 67px; top: 6px; font-size: 9px; letter-spacing: 2.3px; }
      .health-player { left: 6px; bottom: -22px; font-size: 10px; letter-spacing: 1.8px; }
      .health-percent { left: calc(100% + 8px); font-size: 20px; min-width: 52px; }
    }

    @media (max-width: 420px) {
      #hull-bars { width: calc(100vw - 72px) !important; min-width: 205px !important; }
      #hull-bar,
      #hull-bar-p2 { width: calc(100vw - 126px) !important; min-width: 190px !important; }
      .health-percent { font-size: 18px; left: calc(100% + 6px); }
      .health-title { letter-spacing: 1.7px; }
    }

    @media (prefers-reduced-motion: reduce) {
      .health-heart,
      #hull-fill::after,
      #hull-fill-p2::after,
      .health-hud-hit,
      .health-hud-heal,
      .health-hud-critical,
      .health-hud-critical .health-heart {
        animation: none !important;
      }
    }
  `;
  document.head.appendChild(style);

  const previous = [null, null];
  const displayed = [null, null];
  const elements = [null, null];

  function addHudElements(idx) {
    const bar = document.getElementById(idx === 0 ? 'hull-bar' : 'hull-bar-p2');
    if (!bar || elements[idx]) return;

    bar.classList.add('health-hud-bar');
    bar.setAttribute('data-player', idx === 0 ? '1' : '2');

    const heart = document.createElement('div');
    heart.className = 'health-heart';
    heart.setAttribute('aria-hidden', 'true');
    heart.textContent = '♥';

    const title = document.createElement('div');
    title.className = 'health-title';
    title.textContent = 'HEALTH';

    const player = document.createElement('div');
    player.className = 'health-player';
    player.textContent = idx === 0 ? 'PLAYER 1' : 'PLAYER 2';

    const percent = document.createElement('div');
    percent.className = 'health-percent';
    percent.textContent = '100%';

    bar.appendChild(heart);
    bar.appendChild(title);
    bar.appendChild(player);
    bar.appendChild(percent);

    elements[idx] = { bar, heart, percent };
  }

  function getPercent(labelId, fillId) {
    const label = document.getElementById(labelId);
    if (!label) return null;
    const match = label.textContent.match(/(\d+(?:\.\d+)?)\s*%/);
    if (match) return Math.max(0, Math.min(100, Number(match[1])));

    const fill = document.getElementById(fillId);
    if (!fill) return null;
    const pct = parseFloat(fill.style.width);
    return Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : null;
  }

  function pulse(bar, className, duration) {
    bar.classList.remove(className);
    void bar.offsetWidth;
    bar.classList.add(className);
    window.setTimeout(() => bar.classList.remove(className), duration);
  }

  function update(idx, pct, time) {
    const item = elements[idx];
    if (!item) return;

    item.bar.style.setProperty('--health-pct', pct.toFixed(2));
    item.percent.textContent = `${Math.round(pct)}%`;

    const old = previous[idx];
    if (old !== null && Math.abs(pct - old) >= 1) {
      pulse(item.bar, pct > old ? 'health-hud-heal' : 'health-hud-hit', pct > old ? 520 : 360);
    }

    item.bar.classList.toggle('health-hud-critical', pct > 0 && pct <= 25);

    /* Slightly brighten a healthy bar and warn clearly when low. */
    if (pct <= 25 && pct > 0) {
      item.percent.style.color = '#ff8090';
      item.percent.style.textShadow = '0 0 9px rgba(255,55,85,.95), 0 0 18px rgba(255,25,60,.6)';
    } else if (idx === 0) {
      item.percent.style.color = '#f3fdff';
      item.percent.style.textShadow = '0 0 8px rgba(0,218,255,.92), 0 0 18px rgba(0,130,255,.52)';
    } else {
      item.percent.style.color = '#f2e5ff';
      item.percent.style.textShadow = '0 0 8px rgba(183,93,255,.9), 0 0 18px rgba(124,47,255,.5)';
    }

    previous[idx] = pct;
    displayed[idx] = pct;
  }

  function sync() {
    addHudElements(0);
    addHudElements(1);

    const p1 = getPercent('hull-label', 'hull-fill');
    const p2 = getPercent('hull-label-p2', 'hull-fill-p2');

    if (p1 !== null) update(0, p1);
    if (p2 !== null) update(1, p2);

    /* game.js hides P2 by toggling the existing .hidden class */
    const p2Bar = document.getElementById('hull-bar-p2');
    if (p2Bar && elements[1]) {
      elements[1].bar.parentElement && (elements[1].bar.parentElement.style.overflow = 'visible');
    }
  }

  /* First paint after the game HUD exists. */
  const start = () => {
    sync();
    requestAnimationFrame(loop);
  };

  function loop() {
    sync();
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
