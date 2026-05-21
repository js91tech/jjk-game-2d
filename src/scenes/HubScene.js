import Phaser from 'phaser';
import { api } from '../api/client.js';

const TILE = 48;
const MAP_W = 16;
const MAP_H = 12;

export class HubScene extends Phaser.Scene {
  constructor() {
    super('Hub');
  }

  create() {
    this.cameras.main.setBackgroundColor('#0f0f18');
    this.drawMap();
    this.player = this.add.rectangle(8 * TILE, 6 * TILE, 28, 28, 0x22d3ee);
    this.player.setStrokeStyle(2, 0xffffff);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.add
      .text(16, MAP_H * TILE - 8, 'Tokyo Jujutsu High — Courtyard', {
        fontSize: '14px',
        color: '#94a3b8'
      })
      .setOrigin(0, 1);

    this.interactZones = [
      { x: 8, y: 3, label: 'Training', action: 'train' },
      { x: 12, y: 6, label: 'Mission Board', action: 'crime' },
      { x: 4, y: 8, label: 'Exit Gate', action: 'move' }
    ];
    for (const z of this.interactZones) {
      const g = this.add.rectangle(z.x * TILE, z.y * TILE, TILE - 4, TILE - 4, 0x7c3aed, 0.35);
      g.setStrokeStyle(1, 0xc084fc);
      this.add
        .text(z.x * TILE, z.y * TILE - 20, z.label, { fontSize: '11px', color: '#e9d5ff' })
        .setOrigin(0.5);
    }

    this.flash = this.add.rectangle(400, 300, 800, 600, 0x22d3ee, 0);
    this.flash.setScrollFactor(0).setDepth(100);

    window.addEventListener('jjk:action', (e) => this.playActionFx(e.detail?.action));
  }

  drawMap() {
    const g = this.add.graphics();
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const shade = (x + y) % 2 === 0 ? 0x1a1a2e : 0x14141f;
        g.fillStyle(shade, 1);
        g.fillRect(x * TILE, y * TILE, TILE, TILE);
      }
    }
    g.fillStyle(0x312e81, 0.6);
    g.fillRect(7 * TILE, 2 * TILE, 2 * TILE, 3 * TILE);
    g.fillStyle(0x4c1d95, 0.5);
    g.fillRect(11 * TILE, 4 * TILE, 3 * TILE, 4 * TILE);
  }

  playActionFx(action) {
    const colors = {
      crime: 0xef4444,
      'train-str': 0x22d3ee,
      'train-def': 0x34d399,
      work: 0xfbbf24,
      attack: 0xf97316
    };
    this.tweens.add({
      targets: this.flash,
      alpha: { from: 0.4, to: 0 },
      duration: 400,
      fillColor: colors[action] || 0x7c3aed
    });
    this.cameras.main.shake(120, 0.008);
  }

  update() {
    const speed = 3;
    let dx = 0;
    let dy = 0;
    if (this.cursors.left.isDown || this.wasd.left.isDown) dx -= speed;
    if (this.cursors.right.isDown || this.wasd.right.isDown) dx += speed;
    if (this.cursors.up.isDown || this.wasd.up.isDown) dy -= speed;
    if (this.cursors.down.isDown || this.wasd.down.isDown) dy += speed;

    this.player.x = Phaser.Math.Clamp(this.player.x + dx, TILE, (MAP_W - 1) * TILE);
    this.player.y = Phaser.Math.Clamp(this.player.y + dy, TILE, (MAP_H - 1) * TILE);

    for (const z of this.interactZones) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        z.x * TILE,
        z.y * TILE
      );
      if (dist < TILE && Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('E'))) {
        this.triggerZone(z);
      }
    }
  }

  async triggerZone(z) {
    try {
      let r;
      if (z.action === 'train') r = await api.train('strength', 3);
      else if (z.action === 'crime') r = await api.crime('petty_cleanup');
      else if (z.action === 'move') r = await api.move('north');
      window.dispatchEvent(
        new CustomEvent('jjk:toast', { detail: { message: r.message, ok: r.ok !== false } })
      );
      if (r.player) window.dispatchEvent(new CustomEvent('jjk:refresh'));
      this.playActionFx(z.action);
    } catch (e) {
      window.dispatchEvent(new CustomEvent('jjk:toast', { detail: { message: e.message, ok: false } }));
    }
  }
}
