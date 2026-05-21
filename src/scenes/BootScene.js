import Phaser from 'phaser';
import { registerGameTextures } from '../graphics/AssetFactory.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    registerGameTextures(this);
    const bar = this.add.graphics();
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
      bar.destroy();
      text.destroy();
      this.scene.start('Hub');
    });
  }
}
