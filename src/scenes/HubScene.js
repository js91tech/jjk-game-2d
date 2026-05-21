import Phaser from 'phaser';
import { api } from '../api/client.js';
import { touchState, isTouchDevice } from '../input/touch.js';

const TILE = 48;
const MAP_W = 16;
const MAP_H = 12;
const WORLD_W = MAP_W * TILE;
const WORLD_H = MAP_H * TILE;

/** Special floor cells [x,y] */
const CURSED_CELLS = new Set(['7,2', '7,3', '8,2', '8,3', '11,4', '12,4', '12,5', '13,5']);

export class HubScene extends Phaser.Scene {
  constructor() {
    super('Hub');
  }

  create() {
    this.cameras.main.setBackgroundColor('#080810');
    this.buildWorld();
    this.spawnPlayer();
    this.setupInput();
    this.setupZones();
    this.setupAtmosphere();
    this.setupFx();

    this.scale.on('resize', () => this.fitCamera());
    this.fitCamera();
  }

  buildWorld() {
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const key = CURSED_CELLS.has(`${x},${y}`)
          ? 'tile_cursed'
          : (x + y) % 2 === 0
            ? 'tile_floor_a'
            : 'tile_floor_b';
        this.add.image(x * TILE + TILE / 2, y * TILE + TILE / 2, key).setDepth(0);
      }
    }

    const decor = [
      { tex: 'tree', x: 2, y: 2 },
      { tex: 'tree', x: 14, y: 2 },
      { tex: 'tree', x: 1, y: 9 },
      { tex: 'tree', x: 14, y: 10 }
    ];
    for (const d of decor) {
      const t = this.add.image(d.x * TILE + TILE / 2, d.y * TILE + TILE / 2 + 8, d.tex);
      t.setDepth(2);
    }

    this.add.image(8 * TILE, 2.5 * TILE, 'dojo').setDepth(3).setScale(1.1);
    this.add.image(12 * TILE, 6 * TILE, 'mission_board').setDepth(3);
    this.add.image(4 * TILE, 8 * TILE, 'torii').setDepth(3).setScale(0.95);

    const title = this.add
      .text(WORLD_W / 2, WORLD_H - 14, '東京呪術高等専門学校 — 中庭', {
        fontFamily: '"Bebas Neue", "Segoe UI", sans-serif',
        fontSize: '18px',
        color: '#94a3b8',
        stroke: '#0f0f18',
        strokeThickness: 4
      })
      .setOrigin(0.5, 1)
      .setDepth(4)
      .setAlpha(0.85);
    title.setShadow(0, 0, '#7c3aed', 8, true, true);
  }

  spawnPlayer() {
    this.playerShadow = this.add.image(8 * TILE, 6 * TILE + 14, 'shadow').setDepth(8);
    this.playerAura = this.add.image(8 * TILE, 6 * TILE, 'player_aura').setDepth(9);
    this.player = this.add.image(8 * TILE, 6 * TILE, 'player').setDepth(10);

    this.tweens.add({
      targets: this.playerAura,
      angle: 360,
      duration: 8000,
      repeat: -1,
      ease: 'Linear'
    });
    this.tweens.add({
      targets: this.player,
      y: this.player.y - 3,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  setupZones() {
    this.interactZones = [
      { x: 8, y: 3, label: 'Enter Gym', action: 'enter-gym', color: 0x22d3ee },
      { x: 12, y: 6, label: 'Mission Board', action: 'crime', color: 0xa855f7 },
      { x: 10, y: 9, label: 'Company Office', action: 'enter-office', color: 0xfbbf24 },
      { x: 4, y: 8, label: 'Domain Gate', action: 'move', color: 0xa855f7 },
      { x: 2, y: 5, label: 'Infirmary', action: 'enter-hospital', color: 0x34d399 },
      { x: 14, y: 5, label: 'Prison Realm', action: 'enter-prison', color: 0xef4444 }
    ];
    this.zoneSprites = [];

    for (const z of this.interactZones) {
      const wx = z.x * TILE;
      const wy = z.y * TILE;
      const glow = this.add.image(wx, wy, 'zone_glow').setDepth(5).setAlpha(0.7);
      this.tweens.add({
        targets: glow,
        scale: { from: 0.85, to: 1.15 },
        alpha: { from: 0.45, to: 0.85 },
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      const label = this.add
        .text(wx, wy - 28, z.label, {
          fontFamily: '"Bebas Neue", sans-serif',
          fontSize: '13px',
          color: '#f3e8ff',
          stroke: '#1e1b4b',
          strokeThickness: 3
        })
        .setOrigin(0.5)
        .setDepth(6);

      const hit = this.add.zone(wx, wy, TILE, TILE);
      hit.setDepth(7);
      hit.setInteractive({ useHandCursor: true });
      hit.on('pointerup', () => this.triggerZone(z));

      this.zoneSprites.push({ glow, label, zone: z });
    }
  }

  setupAtmosphere() {
    this.ambient = this.add.particles(0, 0, 'particle_ce', {
      x: { min: 0, max: WORLD_W },
      y: { min: 0, max: WORLD_H },
      lifespan: 4000,
      speedY: { min: -8, max: -18 },
      speedX: { min: -6, max: 6 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.5, end: 0 },
      frequency: 180,
      blendMode: 'ADD',
      quantity: 1
    });
    this.ambient.setDepth(11);

    this.curseParticles = this.add.particles(8 * TILE, 3 * TILE, 'particle_curse', {
      lifespan: 2000,
      speedY: { min: -20, max: -40 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.7, end: 0 },
      frequency: 120,
      blendMode: 'ADD',
      quantity: 2
    });
    this.curseParticles.setDepth(11);
  }

  setupFx() {
    this.flash = this.add.rectangle(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 0x22d3ee, 0);
    this.flash.setDepth(100).setBlendMode(Phaser.BlendModes.ADD);

    this.vignette = this.add
      .image(this.scale.width / 2, this.scale.height / 2, 'vignette')
      .setScrollFactor(0)
      .setDepth(200)
      .setAlpha(0.65)
      .setScale(Math.max(this.scale.width, this.scale.height) / 128);
  }

  setupInput() {
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

    window.addEventListener('jjk:action', (e) => this.playActionFx(e.detail?.action));
    window.addEventListener('jjk:interact', () => this.tryInteractNearest());

    this.input.on('pointerup', (pointer) => {
      if (!isTouchDevice() || pointer.wasTouch) return;
      if (pointer.y < this.scale.height * 0.22) return;
      this.movePlayerToward(pointer.worldX, pointer.worldY);
      this.spawnClickRipple(pointer.worldX, pointer.worldY);
    });
  }

  spawnClickRipple(x, y) {
    const ring = this.add.circle(x, y, 4, 0x22d3ee, 0.5).setDepth(12);
    this.tweens.add({
      targets: ring,
      scale: 3,
      alpha: 0,
      duration: 400,
      onComplete: () => ring.destroy()
    });
  }

  fitCamera() {
    const zoom = Math.min(this.scale.width / WORLD_W, this.scale.height / WORLD_H) * 0.92;
    this.cameras.main.setZoom(zoom);
    if (this.vignette) {
      this.vignette.setPosition(this.scale.width / 2, this.scale.height / 2);
      this.vignette.setScale(Math.max(this.scale.width, this.scale.height) / 128);
    }
  }

  playActionFx(action) {
    const colors = {
      crime: 0xef4444,
      train: 0x22d3ee,
      'train-str': 0x22d3ee,
      'train-def': 0x34d399,
      work: 0xfbbf24,
      attack: 0xf97316,
      move: 0xa855f7,
      'enter-gym': 0x22d3ee,
      'enter-office': 0xfbbf24,
      'enter-hospital': 0x34d399,
      'enter-prison': 0xef4444
    };
    const color = colors[action] || 0x7c3aed;
    this.flash.setFillStyle(color);
    this.tweens.add({
      targets: this.flash,
      alpha: { from: 0.45, to: 0 },
      duration: 350
    });
    this.cameras.main.shake(140, 0.01);

    const burst = this.add.particles(this.player.x, this.player.y, 'particle_ce', {
      speed: { min: 60, max: 140 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      lifespan: 500,
      quantity: 16,
      blendMode: 'ADD'
    });
    burst.setDepth(15);
    this.time.delayedCall(500, () => burst.destroy());
  }

  movePlayerToward(wx, wy) {
    const dx = wx - this.player.x;
    const dy = wy - this.player.y;
    const len = Math.hypot(dx, dy);
    if (len < 8) return;
    const step = Math.min(len, 28);
    this.setPlayerPos(
      this.player.x + (dx / len) * step,
      this.player.y + (dy / len) * step
    );
  }

  setPlayerPos(x, y) {
    const px = Phaser.Math.Clamp(x, TILE, (MAP_W - 1) * TILE);
    const py = Phaser.Math.Clamp(y, TILE, (MAP_H - 1) * TILE);
    this.player.setPosition(px, py);
    this.playerShadow.setPosition(px, py + 14);
    this.playerAura.setPosition(px, py);
    this.cameras.main.centerOn(px, py);
  }

  tryInteractNearest() {
    let best = null;
    let bestD = TILE * 1.35;
    for (const z of this.interactZones) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, z.x * TILE, z.y * TILE);
      if (d < bestD) {
        bestD = d;
        best = z;
      }
    }
    if (best) this.triggerZone(best);
    else {
      window.dispatchEvent(
        new CustomEvent('jjk:toast', {
          detail: { message: 'Walk to a glowing zone to interact', ok: false }
        })
      );
    }
  }

  update(time, delta) {
    const speed = 3.8;
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

    if (dx !== 0 || dy !== 0) {
      this.setPlayerPos(this.player.x + dx, this.player.y + dy);
      this.player.setFlipX(dx < 0);
    }

    if (touchState.interact) this.tryInteractNearest();

    const near = this.nearestZoneDist();
    if (near < TILE * 1.4) {
      this.playerAura.setTint(0x88ffff);
    } else {
      this.playerAura.clearTint();
    }
  }

  nearestZoneDist() {
    let min = 9999;
    for (const z of this.interactZones) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, z.x * TILE, z.y * TILE);
      if (d < min) min = d;
    }
    return min;
  }

  async triggerZone(z) {
    try {
      if (z.action === 'enter-gym') return this.scene.start('Gym');
      if (z.action === 'enter-office') return this.scene.start('Office');
      if (z.action === 'enter-hospital') return this.scene.start('Hospital');
      if (z.action === 'enter-prison') return this.scene.start('Prison');

      let r;
      if (z.action === 'crime') {
        const sel = document.getElementById('crime-select');
        const mission = sel?.value || 'petty_cleanup';
        r = await api.crime(mission);
      } else if (z.action === 'move') r = await api.move('north');
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
