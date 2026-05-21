import Phaser from 'phaser';
import { authenticate } from './discord/auth.js';
import { initHud, refreshMe, loadCrimes, setState } from './ui/hud.js';
import { BootScene } from './scenes/BootScene.js';
import { HubScene } from './scenes/HubScene.js';
import { mountTouchControls, isTouchDevice, isDiscordMobile } from './input/touch.js';

async function boot() {
  if (isDiscordMobile()) document.body.classList.add('discord-mobile');

  const status = document.createElement('div');
  status.className = 'hud-panel boot-status';
  status.textContent = 'Connecting to Jujutsu HQ API…';
  document.getElementById('hud').appendChild(status);

  try {
    await authenticate();
    await refreshMe();
    await loadCrimes();
    initHud();
    status.remove();

    mountTouchControls(() => window.dispatchEvent(new CustomEvent('jjk:interact')));

    window.addEventListener('jjk:refresh', async () => {
      await refreshMe();
      await loadCrimes();
    });
    window.addEventListener('jjk:toast', (e) => {
      setState({ message: e.detail?.message || '' });
    });

    new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'game',
      width: 768,
      height: 576,
      backgroundColor: '#080810',
      scene: [BootScene, HubScene],
      render: {
        antialias: true,
        pixelArt: false,
        roundPixels: true
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      fps: {
        target: 60,
        forceSetTimeOut: true
      },
      input: {
        activePointers: 2,
        touch: { capture: true }
      },
      dom: { createContainer: false },
      banner: false
    });
  } catch (err) {
    status.textContent = `Failed: ${err.message}. Start API: npm run start:api (in jjkbot)`;
    console.error(err);
  }
}

boot();
