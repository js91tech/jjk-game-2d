import Phaser from 'phaser';
import { authenticate } from './discord/auth.js';
import { initHud, refreshMe, loadCrimes, setState } from './ui/hud.js';
import { HubScene } from './scenes/HubScene.js';

async function boot() {
  const status = document.createElement('div');
  status.className = 'hud-panel';
  status.style.margin = '20px';
  status.textContent = 'Connecting to Jujutsu HQ API…';
  document.getElementById('hud').appendChild(status);

  try {
    await authenticate();
    await refreshMe();
    await loadCrimes();
    initHud();
    status.remove();

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
      width: 800,
      height: 576,
      backgroundColor: '#0f0f18',
      scene: [HubScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    });
  } catch (err) {
    status.textContent = `Failed: ${err.message}. Start API: npm run start:api (in jjkbot)`;
    console.error(err);
  }
}

boot();
