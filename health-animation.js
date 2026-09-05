/* Beyond Infinity: Soloverse - animated health HUD integration
 * Works with the existing HUD and renderHull() without changing game logic.
 * The game already updates #hull-fill / #hull-label; this layer adds the
 * futuristic segmented styling, smooth transition and feedback animation.
 */
(() => {
  const style = document.createElement('style');
  style.id = 'health-animation-style';
  style.textContent = `
    #hull-bars { gap: 6px !important; }
    #hull-bar, #hull-bar-p2 {
      width: 190px !important;
      height: 25px !important;
      border-radius: 6px !important;
      border: 1px solid rgba(0, 196, 255, .78) !important;
      background: rgba(2, 12, 28, .88) !important;
      box-shadow: 0 0 7px rgba(0, 190, 255, .28), inset 0 0 10px rgba(0, 90, 160, .18) !important;
      overflow: hidden !important;
    }
    #hull-bar::before, #hull-bar-p2::before {
      content: '♥'; position: absolute; left: 6px; top: 50%; transform: translateY(-50%);
      z-index: 4; width: 24px; text-align: center; color: #24d8ff; font-size: 17px; line-height: 1;
      text-shadow: 0 0 7px rgba(0, 210, 255, .95); pointer-events: none;
    }
    #hull-bar::after, #hull-bar-p2::after {
      content: ''; position: absolute; inset: 2px; z-index: 3; pointer-events: none;
      background: repeating-linear-gradient(90deg, transparent 0, transparent calc(10% - 2px),
        rgba(0, 18, 38, .72) calc(10% - 2px), rgba(0, 18, 38, .72) 10%);
      mix-blend-mode: multiply;
    }
    #hull-fill, #hull-fill-p2 {
      position: relative; z-index: 1; width: 100%; height: 100%;
      transition: width .32s cubic-bezier(.22,.61,.36,1), background .25s ease, box-shadow .25s ease !important;
      box-shadow: 0 0 9px rgba(0, 205, 255, .72), inset 0 0 8px rgba(255,255,255,.12) !important;
    }
    #hull-label, #hull-label-p2 {
      z-index: 5 !important; left: 28px !important; justify-content: center !important;
      width: calc(100% - 34px) !important; font-size: 11px !important; letter-spacing: 1.4px !important;
      color: #fff !important; text-shadow: 0 0 6px rgba(0,0,0,.95), 0 1px 2px rgba(0,0,0,.8) !important;
    }
    .health-hud-pulse { animation: healthHudPulse .42s ease-out; }
    .health-hud-heal { animation: healthHudHeal .55s ease-out; }
    .health-hud-low { animation: healthHudLow 1s ease-in-out infinite; }
    @keyframes healthHudPulse { 0%{transform:scale(1)} 35%{transform:scale(1.035)} 100%{transform:scale(1)} }
    @keyframes healthHudHeal { 0%{filter:brightness(1)} 35%{filter:brightness(1.7)} 100%{filter:brightness(1)} }
    @keyframes healthHudLow {
      0%,100%{box-shadow:0 0 7px rgba(255,70,70,.38),inset 0 0 10px rgba(120,0,0,.16)}
      50%{box-shadow:0 0 16px rgba(255,55,55,.82),inset 0 0 12px rgba(150,0,0,.22)}
    }
    #hull-bar.health-critical, #hull-bar-p2.health-critical { border-color: rgba(255,64,64,.95) !important; }
    #hull-bar.health-critical::before, #hull-bar-p2.health-critical::before {
      color:#ff4d5d !important; text-shadow:0 0 8px rgba(255,50,70,1) !important;
    }
    @media (max-width:520px) {
      #hull-bar,#hull-bar-p2{width:145px !important;height:22px !important}
      #hull-label,#hull-label-p2{font-size:9px !important;left:25px !important;width:calc(100% - 30px) !important}
      #hull-bar::before,#hull-bar-p2::before{font-size:15px;left:4px;width:21px}
    }
  `;
  document.head.appendChild(style);

  const previous = [null, null];

  function animateElement(el, className) {
    if (!el) return;
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
    window.setTimeout(() => el.classList.remove(className), 650);
  }

  function decorate(idx, pct, previousPct) {
    const bar = document.getElementById(idx === 0 ? 'hull-bar' : 'hull-bar-p2');
    const fill = document.getElementById(idx === 0 ? 'hull-fill' : 'hull-fill-p2');
    if (!bar || !fill) return;
    bar.classList.toggle('health-critical', pct > 0 && pct <= 25);
    bar.classList.toggle('health-hud-low', pct > 0 && pct <= 25);
    if (previousPct !== null && pct !== previousPct) {
      animateElement(bar, pct > previousPct ? 'health-hud-heal' : 'health-hud-pulse');
    }
    if (pct > 66) {
      fill.style.background = 'linear-gradient(90deg,#00a9ff,#39eaff,#00d9ff)';
      fill.style.boxShadow = '0 0 10px rgba(0,210,255,.85), inset 0 0 8px rgba(255,255,255,.14)';
    } else if (pct > 33) {
      fill.style.background = 'linear-gradient(90deg,#ffd54a,#ff9f1a,#ffd54a)';
      fill.style.boxShadow = '0 0 10px rgba(255,177,40,.75), inset 0 0 8px rgba(255,255,255,.12)';
    } else if (pct > 0) {
      fill.style.background = 'linear-gradient(90deg,#ff304f,#ff6b35,#ff304f)';
      fill.style.boxShadow = '0 0 12px rgba(255,45,70,.9), inset 0 0 8px rgba(255,255,255,.10)';
    } else {
      fill.style.background = 'linear-gradient(90deg,#ff304f,#b00020)';
      fill.style.boxShadow = '0 0 6px rgba(255,45,70,.55)';
    }
  }

  function readPercent(id, fillId) {
    const label = document.getElementById(id);
    if (!label) return null;
    const match = label.textContent.match(/(\d+)\s*%/);
    if (match) return Math.max(0, Math.min(100, Number(match[1])));
    const fill = document.getElementById(fillId);
    if (!fill) return null;
    const width = parseFloat(getComputedStyle(fill).width);
    const parent = parseFloat(getComputedStyle(fill.parentElement).width);
    return parent > 0 ? Math.round((width / parent) * 100) : null;
  }

  function tick() {
    const p1 = readPercent('hull-label', 'hull-fill');
    const p2 = readPercent('hull-label-p2', 'hull-fill-p2');
    if (p1 !== null) { decorate(0, p1, previous[0]); previous[0] = p1; }
    if (p2 !== null) { decorate(1, p2, previous[1]); previous[1] = p2; }
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
