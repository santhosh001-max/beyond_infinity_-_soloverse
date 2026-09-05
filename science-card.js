/* Beyond Infinity: Soloverse - Moon scientific facts card */
(() => {
  'use strict';

  const MOON_SCIENCE = {
    name: 'THE MOON',
    facts: [
      "The Moon's surface gravity is about 1/6 of Earth's.",
      'The Moon is tidally locked with Earth, so we see essentially the same side.',
      'Water ice has been confirmed in permanently shadowed regions near the lunar poles.',
      'The Moon has an extremely thin atmosphere called an exosphere.'
    ]
  };

  function showMoonScienceCard(continueGame) {
    const storageKey = 'soloverse_science_seen_moon';

    // Show only once per browser session. Death/retry will not show it again.
    try {
      if (sessionStorage.getItem(storageKey) === '1') {
        continueGame();
        return;
      }
      sessionStorage.setItem(storageKey, '1');
    } catch (e) {
      // Continue normally if browser storage is unavailable.
    }

    const existing = document.getElementById('soloverse-moon-science');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'soloverse-moon-science';
    overlay.innerHTML = `
      <div class="soloverse-science-card" role="dialog" aria-modal="true" aria-labelledby="soloverse-science-title">
        <div class="soloverse-science-orb" aria-hidden="true">🌙</div>
        <div class="soloverse-science-kicker">DID YOU KNOW?</div>
        <div id="soloverse-science-title" class="soloverse-science-title">${MOON_SCIENCE.name}</div>

        <div class="soloverse-science-facts">
          ${MOON_SCIENCE.facts.map(fact => `
            <div class="soloverse-science-fact">
              <span aria-hidden="true">✦</span>
              <p>${fact}</p>
            </div>
          `).join('')}
        </div>

        <button id="soloverse-science-start" type="button">START MISSION</button>
        <button id="soloverse-science-skip" type="button">SKIP</button>
      </div>
    `;

    document.body.appendChild(overlay);

    const finish = () => {
      overlay.remove();
      continueGame();
    };

    document.getElementById('soloverse-science-start').addEventListener('click', finish);
    document.getElementById('soloverse-science-skip').addEventListener('click', finish);
  }

  const style = document.createElement('style');
  style.textContent = `
    #soloverse-moon-science {
      position: fixed;
      inset: 0;
      z-index: 100000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
      background: rgba(2, 5, 18, .84);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .soloverse-science-card {
      width: min(560px, 94vw);
      max-height: 90vh;
      overflow-y: auto;
      box-sizing: border-box;
      padding: 28px;
      border: 1px solid rgba(100, 190, 255, .55);
      border-radius: 22px;
      background: linear-gradient(145deg, rgba(20, 29, 65, .98), rgba(7, 12, 32, .98));
      box-shadow: 0 0 35px rgba(70, 150, 255, .25), inset 0 0 25px rgba(100, 160, 255, .05);
      color: #fff;
      text-align: center;
      animation: soloverseScienceIn .3s ease-out;
    }

    .soloverse-science-orb {
      font-size: 48px;
      line-height: 1;
      margin-bottom: 8px;
    }

    .soloverse-science-kicker {
      font-size: 23px;
      font-weight: 800;
      letter-spacing: 3px;
    }

    .soloverse-science-title {
      margin-top: 5px;
      font-size: 15px;
      letter-spacing: 4px;
      opacity: .72;
    }

    .soloverse-science-facts {
      margin: 23px 0;
      text-align: left;
    }

    .soloverse-science-fact {
      display: flex;
      gap: 11px;
      align-items: flex-start;
      margin: 10px 0;
      padding: 12px 14px;
      border-radius: 12px;
      background: rgba(255,255,255,.055);
    }

    .soloverse-science-fact span {
      flex: 0 0 auto;
      font-size: 18px;
    }

    .soloverse-science-fact p {
      margin: 0;
      font-size: 15px;
      line-height: 1.45;
    }

    #soloverse-science-start {
      width: 100%;
      padding: 13px 16px;
      border: 0;
      border-radius: 12px;
      background: linear-gradient(90deg, #277cff, #5d9dff);
      color: #fff;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
    }

    #soloverse-science-skip {
      margin-top: 11px;
      padding: 5px 10px;
      border: 0;
      background: transparent;
      color: rgba(255,255,255,.55);
      cursor: pointer;
    }

    @keyframes soloverseScienceIn {
      from { opacity: 0; transform: scale(.94); }
      to { opacity: 1; transform: scale(1); }
    }

    @media (max-width: 600px) {
      .soloverse-science-card {
        padding: 20px;
        border-radius: 18px;
      }

      .soloverse-science-kicker {
        font-size: 20px;
      }

      .soloverse-science-fact p {
        font-size: 14px;
      }
    }
  `;
  document.head.appendChild(style);

  // game.js is loaded first. We intercept ONLY the existing level-start
  // function, and ONLY when level 1 (The Moon) is selected.
  // Infinity Mode does not call this wrapper and remains unchanged.
  const originalStartLevel = window.startLevel;

  if (typeof originalStartLevel === 'function' && !originalStartLevel.__soloverseScienceWrapped) {
    const wrappedStartLevel = function (...args) {
      const first = args[0];
      const levelId = typeof first === 'object' && first !== null
        ? Number(first.id ?? first.level_number)
        : Number(first);

      if (levelId === 1) {
        showMoonScienceCard(() => originalStartLevel.apply(this, args));
        return;
      }

      return originalStartLevel.apply(this, args);
    };

    wrappedStartLevel.__soloverseScienceWrapped = true;
    window.startLevel = wrappedStartLevel;
  }
})();
