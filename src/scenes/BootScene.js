import Phaser from 'phaser';
import { registerGameTextures } from '../graphics/AssetFactory.js';

const ROOM_ASSETS = [
  ['room_gym', 'assets/rooms/gym.png'],
  ['room_hospital', 'assets/rooms/hospital.png'],
  ['room_prison', 'assets/rooms/prison.png'],
  ['room_office', 'assets/rooms/office.png']
];

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    for (const [key, path] of ROOM_ASSETS) {
      this.load.image(key, path);
    }
  }

  create() {
    registerGameTextures(this);
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;
    const text = this.add
      .text(cx, cy, 'Channeling cursed energy…', {
        fontFamily: '"Bebas Neue", "Segoe UI", sans-serif',
        fontSize: '22px',
        color: '#c084fc'
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: text,
      alpha: { from: 0.4, to: 1 },
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    this.time.delayedCall(400, () => {
      text.destroy();
      const conf = this.registry.get('confinement') || window.__jjkConfinement;
      const start =
        this.registry.get('startScene') ||
        window.__jjkStartScene ||
        (conf?.confined ? (conf.reason === 'jail' ? 'Prison' : 'Hospital') : 'Hub');
      this.scene.start(start);
    });
  }
}
