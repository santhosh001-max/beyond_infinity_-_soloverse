/* Beyond Infinity: Soloverse - Planet Science Cards
 * Level 1: Moon | Level 2: Mars
 * Shows every time before the mission starts.
 * Infinity Mode is intentionally untouched.
 */
(function () {
  'use strict';

  const PLANET_SCIENCE = {
    1: {
      name: 'THE MOON',
      facts: [
        "The Moon's surface gravity is about 1/6 of Earth's.",
        'The Moon is tidally locked with Earth, so we see essentially the same side.',
        'Water ice has been confirmed in permanently shadowed regions near the lunar poles.',
        "The Moon has an extremely thin atmosphere called an exosphere."
      ]
    },
    2: {
      name: 'MARS',
      facts: [
        "Mars has about 38% of Earth's surface gravity.",
        'A Martian day, called a sol, lasts about 24.6 Earth hours.',
        'Mars has two small moons: Phobos and Deimos.',
        'Mars has the largest volcano in the solar system, Olympus Mons.'
      ]
    }
  };

  function showScienceCard(levelId, continueGame) {
    const data = PLANET_SCIENCE[levelId];
    if (!data) {
      continueGame();
      return;
    }

    // Intentionally no sessionStorage/localStorage check:
    // the science card must appear every time the level is played.
    const old = document.getElementById('soloverse-science-card');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'soloverse-science-card';
    overlay.innerHTML = `
      <div class="soloverse-science-panel">
        <div class="soloverse-science-kicker">DID YOU KNOW?</div>
        <div class="soloverse-science-title">${data.name}</div>
        <div class="soloverse-science-line"></div>
        <div class="soloverse-science-facts">
          ${data.facts.map((fact, i) => `
            <div class="soloverse-science-fact">
              <span class="soloverse-science-num">${i + 1}</span>
              <span>${fact}</span>
            </div>
          `).join('')}
        </div>
        <div class="soloverse-science-actions">
          <button id="soloverse-science-start" type="button">START MISSION</button>
          <button id="soloverse-science-skip" type="button">SKIP</button>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.id = 'soloverse-science-card-style';
    style.textContent = `
      #soloverse-science-card {
        position: fixed;
        inset: 0;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
        background: rgba(2, 5, 18, .78);
        backdrop-filter: blur(7px);
        -webkit-backdrop-filter: blur(7px);
        font-family: Arial, Helvetica, sans-serif;
      }
      .soloverse-science-panel {
        width: min(560px, 94vw);
        max-height: 88vh;
        overflow: auto;
        box-sizing: border-box;
        padding: 30px 30px 24px;
        border: 1px solid rgba(255, 255, 255, .2);
        border-radius: 22px;
        background: linear-gradient(145deg, rgba(15, 24, 58, .98), rgba(7, 11, 31, .98));
        box-shadow: 0 25px 80px rgba(0,0,0,.55), inset 0 1px rgba(255,255,255,.08);
        color: #fff;
        text-align: center;
      }
      .soloverse-science-kicker {
        font-size: 13px;
        letter-spacing: 3px;
        font-weight: 800;
        opacity: .72;
        margin-bottom: 8px;
      }
      .soloverse-science-title {
        font-size: clamp(30px, 7vw, 46px);
        line-height: 1;
        font-weight: 900;
        letter-spacing: 2px;
        text-shadow: 0 0 22px rgba(130,190,255,.35);
      }
      .soloverse-science-line {
        width: 72px;
        height: 3px;
        margin: 17px auto 20px;
        border-radius: 10px;
        background: rgba(255,255,255,.75);
      }
      .soloverse-science-facts {
        display: grid;
        gap: 11px;
        text-align: left;
      }
      .soloverse-science-fact {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 13px 14px;
        border-radius: 13px;
        background: rgba(255,255,255,.055);
        border: 1px solid rgba(255,255,255,.08);
        font-size: 15px;
        line-height: 1.4;
      }
      .soloverse-science-num {
        flex: 0 0 25px;
        width: 25px;
        height: 25px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: rgba(255,255,255,.13);
        font-size: 12px;
        font-weight: 800;
      }
      .soloverse-science-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 23px;
      }
      .soloverse-science-actions button {
        border: 0;
        border-radius: 12px;
        padding: 13px 20px;
        font-weight: 900;
        letter-spacing: .7px;
        cursor: pointer;
        touch-action: manipulation;
      }
      #soloverse-science-start {
        color: #06101f;
        background: #fff;
      }
      #soloverse-science-skip {
        color: #fff;
        background: rgba(255,255,255,.09);
        border: 1px solid rgba(255,255,255,.16);
      }
      @media (max-width: 600px) {
        #soloverse-science-card { padding: 12px; }
        .soloverse-science-panel { padding: 23px 17px 18px; border-radius: 18px; }
        .soloverse-science-fact { font-size: 13px; padding: 11px; }
        .soloverse-science-actions button { padding: 12px 14px; font-size: 12px; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    const closeAndContinue = function () {
      overlay.remove();
      continueGame();
    };
    document.getElementById('soloverse-science-start').addEventListener('click', closeAndContinue);
    document.getElementById('soloverse-science-skip').addEventListener('click', closeAndContinue);
  }

  const originalStartLevel = window.startLevel;
  if (typeof originalStartLevel === 'function') {
    window.startLevel = function () {
      const args = Array.prototype.slice.call(arguments);
      let levelId = args[0];
      if (levelId && typeof levelId === 'object') {
        levelId = levelId.id != null ? levelId.id : levelId.level_number;
      }
      levelId = Number(levelId);

      if (levelId === 1 || levelId === 2) {
        showScienceCard(levelId, function () {
          originalStartLevel.apply(this, args);
        }.bind(this));
        return;
      }
      return originalStartLevel.apply(this, args);
    };
  }
})();
