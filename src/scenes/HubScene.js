import Phaser from 'phaser';
import { api } from '../api/client.js';
import { touchState, isTouchDevice } from '../input/touch.js';

const TILE = 48;
const MAP_W = 16;
const MAP_H = 12;
const WORLD_W = MAP_W * TILE;
const WORLD_H = MAP_H * TILE;

export class HubScene extends Phaser.Scene {
  constructor() {
    super('Hub');
  }

  create() {
    this.cameras.main.setBackgroundColor('#0f0f18');
    this.drawMap();
    this.player = this.add.rectangle(8 * TILE, 6 * TILE, 28, 28, 0x22d3ee);
    this.player.setStrokeStyle(2, 0xffffff);
    this.player.setDepth(10);

    if (!isTouchDevice()) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
      });
      this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    this.interactZones = [
      { x: 8, y: 3, label: 'Training', action: 'train' },
      { x: 12, y: 6, label: 'Mission Board', action: 'crime' },
      { x: 4, y: 8, label: 'Exit Gate', action: 'move' }
    ];
    for (const z of this.interactZones) {
      const hit = this.add.zone(z.x * TILE, z.y * TILE, TILE, TILE);
      hit.setInteractive({ useHandCursor: true });
      const g = this.add.rectangle(z.x * TILE, z.y * TILE, TILE - 4, TILE - 4, 0x7c3aed, 0.35);
      g.setStrokeStyle(1, 0xc084fc);
      this.add
        .text(z.x * TILE, z.y * TILE - 20, z.label, { fontSize: '11px', color: '#e9d5ff' })
        .setOrigin(0.5);
      hit.on('pointerup', () => this.triggerZone(z));
    }

    this.add
      .text(16, WORLD_H - 8, 'Tokyo Jujutsu High — Courtyard', {
        fontSize: '14px',
        color: '#94a3b8'
      })
      .setOrigin(0, 1)
      .setScrollFactor(0);

    this.flash = this.add.rectangle(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 0x22d3ee, 0);
    this.flash.setDepth(100);

    this.input.on('pointerup', (pointer) => {
      if (!isTouchDevice() || pointer.wasTouch) return;
      if (pointer.y < this.scale.height * 0.25) return;
      this.movePlayerToward(pointer.worldX, pointer.worldY);
    });

    window.addEventListener('jjk:action', (e) => this.playActionFx(e.detail?.action));
    window.addEventListener('jjk:interact', () => this.tryInteractNearest());

    this.scale.on('resize', () => this.fitCamera());
    this.fitCamera();
  }

  fitCamera() {
    const zoom = Math.min(this.scale.width / WORLD_W, this.scale.height / WORLD_H) * 0.95;
    this.cameras.main.setZoom(zoom);
    this.cameras.main.centerOn(WORLD_W / 2, WORLD_H / 2);
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
      train: 0x22d3ee,
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

  movePlayerToward(wx, wy) {
    const dx = wx - this.player.x;
    const dy = wy - this.player.y;
    const len = Math.hypot(dx, dy);
    if (len < 8) return;
    const step = Math.min(len, 24);
    this.player.x = Phaser.Math.Clamp(this.player.x + (dx / len) * step, TILE, (MAP_W - 1) * TILE);
    this.player.y = Phaser.Math.Clamp(this.player.y + (dy / len) * step, TILE, (MAP_H - 1) * TILE);
  }

  tryInteractNearest() {
    let best = null;
    let bestD = TILE * 1.2;
    for (const z of this.interactZones) {
      const d = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        z.x * TILE,
        z.y * TILE
      );
      if (d < bestD) {
        bestD = d;
        best = z;
      }
    }
    if (best) this.triggerZone(best);
    else {
      window.dispatchEvent(
        new CustomEvent('jjk:toast', { detail: { message: 'Walk to a purple zone to interact', ok: false } })
      );
    }
  }

  update() {
    const speed = 3.5;
    let dx = 0;
    let dy = 0;

    if (isTouchDevice()) {
      dx = touchState.dx * speed;
      dy = touchState.dy * speed;
    } else {
      if (this.cursors?.left?.isDown || this.wasd?.left?.isDown) dx -= speed;
      if (this.cursors?.right?.isDown || this.wasd?.right?.isDown) dx += speed;
      if (this.cursors?.up?.isDown || this.wasd?.up?.isDown) dy -= speed;
      if (this.cursors?.down?.isDown || this.wasd?.down?.isDown) dy += speed;
      if (this.interactKey && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.tryInteractNearest();
      }
    }

    this.player.x = Phaser.Math.Clamp(this.player.x + dx, TILE, (MAP_W - 1) * TILE);
    this.player.y = Phaser.Math.Clamp(this.player.y + dy, TILE, (MAP_H - 1) * TILE);

    if (touchState.interact) this.tryInteractNearest();
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
