/* Beyond Infinity: Soloverse - power-up visual/type override */
(() => {
  const images = {};
  const paths = {
    shield: 'assets/powerups/shield.svg',
    heart: 'assets/powerups/health.svg',
    speed: 'assets/powerups/boost.svg',
    energy: 'assets/powerups/energy.svg'
  };

  Object.entries(paths).forEach(([key, src]) => {
    const img = new Image();
    img.onload = () => { images[key] = img; };
    img.src = src;
  });

  if (typeof POWER_TYPES !== 'undefined') {
    delete POWER_TYPES.magnet;
    delete POWER_TYPES.doubleGun;
    POWER_TYPES.shield = { icon: paths.shield, duration: 6000 };
    POWER_TYPES.heart = { icon: paths.heart, duration: 0 };
    POWER_TYPES.speed = { icon: paths.speed, duration: 7000 };
    POWER_TYPES.energy = { icon: paths.energy, duration: 8000 };
  }

  // game.js passes POWER_TYPES[type].icon to canvas fillText().
  // Those values are image paths, not emoji, so match the paths directly.
  const originalFillText = CanvasRenderingContext2D.prototype.fillText;
  const pathMap = {
    [paths.shield]: 'shield',
    [paths.heart]: 'heart',
    [paths.speed]: 'speed',
    [paths.energy]: 'energy'
  };

  CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth) {
    const key = pathMap[text];
    const img = key ? images[key] : null;
    if (img && img.complete && img.naturalWidth > 0) {
      const size = 42;
      this.drawImage(img, x - 21, y - 34, size, size);
      return;
    }
    return originalFillText.call(this, text, x, y, maxWidth);
  };

  // Convert active-power badge path text into actual images too.
  const originalBadgeRenderer = window.renderActivePowerBadges;
  window.renderActivePowerBadges = function() {
    if (typeof originalBadgeRenderer === 'function') originalBadgeRenderer();
    const root = document.getElementById('active-powers');
    if (!root) return;
    root.querySelectorAll('.p-icon').forEach(icon => {
      const key = pathMap[icon.textContent.trim()];
      const img = key ? images[key] : null;
      if (!img) return;
      icon.textContent = '';
      const badgeImg = document.createElement('img');
      badgeImg.src = paths[key];
      badgeImg.alt = key + ' power-up';
      badgeImg.width = 34;
      badgeImg.height = 34;
      badgeImg.style.objectFit = 'contain';
      icon.appendChild(badgeImg);
    });
  };
})();
