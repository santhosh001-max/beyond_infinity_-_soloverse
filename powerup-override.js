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
    img.src = src;
    images[key] = img;
  });

  // Remove the old magnet and weapon-style power-up types.
  if (typeof POWER_TYPES !== 'undefined') {
    delete POWER_TYPES.magnet;
    delete POWER_TYPES.doubleGun;
    POWER_TYPES.shield = { icon: 'assets/powerups/shield.svg', duration: 6000 };
    POWER_TYPES.heart = { icon: 'assets/powerups/health.svg', duration: 0 };
    POWER_TYPES.speed = { icon: 'assets/powerups/boost.svg', duration: 7000 };
    POWER_TYPES.energy = { icon: 'assets/powerups/energy.svg', duration: 8000 };
  }

  // The game renderer still calls fillText for the old emoji icons.
  // Replace only those power-up emoji draws with the new artwork.
  const originalFillText = CanvasRenderingContext2D.prototype.fillText;
  const iconMap = {
    '🛡️': 'shield',
    '❤️': 'heart',
    '💨': 'speed',
    '🔫': 'energy',
    '🧲': 'energy'
  };
  CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth) {
    const key = iconMap[text];
    if (key && images[key] && images[key].complete && images[key].naturalWidth) {
      const size = 34;
      this.drawImage(images[key], x - 3, y - size + 3, size, size);
      return;
    }
    return originalFillText.call(this, text, x, y, maxWidth);
  };
})();
