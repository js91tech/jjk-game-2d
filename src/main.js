import Phaser from 'phaser';
import { authenticate } from './discord/auth.js';
import { initHud, refreshMe, loadCrimes, setState } from './ui/hud.js';
import { BootScene } from './scenes/BootScene.js';
import { HubScene } from './scenes/HubScene.js';
import { GymScene, HospitalScene, PrisonScene, OfficeScene } from './scenes/InteriorScene.js';
import { mountTouchControls, isTouchDevice, isDiscordMobile } from './input/touch.js';

async function boot() {
  if (isDiscordMobile()) document.body.classList.add('discord-mobile');

  const status = document.createElement('div');
  status.className = 'hud-panel boot-status';
  status.textContent = 'Connecting to Jujutsu HQ API…';
  document.getElementById('hud').appendChild(status);

  try {
    const auth = await authenticate();
    let me;
    if (auth.bootstrap?.player) {
      setState({
        player: auth.bootstrap.player,
        status: auth.bootstrap.status,
        confinement: auth.bootstrap.confinement,
        crimes: auth.bootstrap.crimes || []
      });
      me = auth.bootstrap;
    } else {
      me = await refreshMe();
      await loadCrimes();
    }
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
    window.addEventListener('jjk:goto', (e) => {
      const scene = e.detail?.scene;
      const game = window.__jjkGame;
      if (game?.scene?.keys?.[scene]) game.scene.start(scene);
    });

    const startScene = me.confinement?.confined
      ? me.confinement.reason === 'jail'
        ? 'Prison'
        : 'Hospital'
      : 'Hub';
    window.__jjkStartScene = startScene;
    window.__jjkConfinement = me.confinement;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'game',
      width: 768,
      height: 576,
      backgroundColor: '#080810',
      scene: [BootScene, HubScene, GymScene, HospitalScene, PrisonScene, OfficeScene],
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
    window.__jjkGame = game;
    game.registry.set('startScene', startScene);
    game.registry.set('confinement', me.confinement);
  } catch (err) {
    const hint = err.message?.includes('OAuth') || err.message?.includes('DISCORD')
      ? err.message
      : `${err.message}. API mapping /api → jjk-api; OAuth redirect http://127.0.0.1/callback; jjk-api DISCORD_CLIENT_SECRET`;
    status.textContent = `Failed: ${hint}`;
    console.error(err);
  }
}

boot();
