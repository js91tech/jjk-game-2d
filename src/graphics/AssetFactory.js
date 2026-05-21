/**
 * Procedural JJK-themed textures (no external spritesheet required).
 */
export function registerGameTextures(scene) {
  if (scene.textures.exists('tile_floor_a')) return;

  makeFloorTile(scene, 'tile_floor_a', 0x1c1830, 0x252042, 0x2a2650);
  makeFloorTile(scene, 'tile_floor_b', 0x161428, 0x1e1a38, 0x221f3d);
  makeCursedTile(scene, 'tile_cursed', 0x312e81, 0x22d3ee);
  makeBuilding(scene, 'dojo', 0x4c1d95, 0x7c3aed, 'dojo');
  makeBuilding(scene, 'mission_board', 0x5b21b6, 0xa855f7, 'board');
  makeTorii(scene, 'torii', 0xef4444, 0xfbbf24);
  makePlayer(scene);
  makeZoneGlow(scene);
  makeShadow(scene);
  makeVignette(scene);
  makeParticle(scene);
  makeTree(scene);
}

function makeFloorTile(scene, key, base, mid, highlight) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const s = 48;
  g.fillStyle(base, 1);
  g.fillRect(0, 0, s, s);
  g.fillStyle(mid, 0.85);
  g.fillRect(2, 2, s - 4, s - 4);
  for (let i = 0; i < 6; i++) {
    const px = Phaser.Math.Between(4, s - 8);
    const py = Phaser.Math.Between(4, s - 8);
    g.fillStyle(highlight, Phaser.Math.FloatBetween(0.15, 0.35));
    g.fillRect(px, py, 2, 2);
  }
  g.lineStyle(1, highlight, 0.2);
  g.strokeRect(1, 1, s - 2, s - 2);
  g.generateTexture(key, s, s);
  g.destroy();
}

function makeCursedTile(scene, key, purple, cyan) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const s = 48;
  g.fillStyle(purple, 0.5);
  g.fillRect(0, 0, s, s);
  g.lineStyle(2, cyan, 0.4);
  for (let i = 0; i < 4; i++) {
    g.beginPath();
    g.moveTo(Phaser.Math.Between(0, s), Phaser.Math.Between(0, s));
    g.lineTo(Phaser.Math.Between(0, s), Phaser.Math.Between(0, s));
    g.strokePath();
  }
  g.fillStyle(cyan, 0.25);
  g.fillCircle(s / 2, s / 2, 10);
  g.generateTexture(key, s, s);
  g.destroy();
}

function makeBuilding(scene, key, dark, light, type) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const w = 96;
  const h = 80;
  g.fillStyle(0x0a0812, 0.5);
  g.fillEllipse(w / 2, h - 4, w * 0.9, 14);
  g.fillStyle(dark, 1);
  g.fillRoundedRect(8, 20, w - 16, h - 24, 6);
  g.fillStyle(light, 0.9);
  if (type === 'dojo') {
    g.fillTriangle(w / 2, 4, 12, 28, w - 12, 28);
    g.fillRect(20, 36, w - 40, 8);
    g.fillStyle(0x22d3ee, 0.5);
    g.fillRect(28, 48, w - 56, 20);
  } else {
    g.fillRect(14, 28, w - 28, h - 40);
    g.fillStyle(0xfbbf24, 0.8);
    g.fillRect(22, 36, w - 44, 6);
    g.fillRect(22, 48, w - 44, 6);
  }
  g.lineStyle(2, 0xffffff, 0.15);
  g.strokeRoundedRect(8, 20, w - 16, h - 24, 6);
  g.generateTexture(key, w, h);
  g.destroy();
}

function makeTorii(scene, key, red, gold) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const w = 80;
  const h = 72;
  g.fillStyle(red, 1);
  g.fillRect(6, 16, 10, h - 20);
  g.fillRect(w - 16, 16, 10, h - 20);
  g.fillRect(4, 12, w - 8, 10);
  g.fillStyle(gold, 0.9);
  g.fillRect(2, 8, w - 4, 6);
  g.fillStyle(0x000000, 0.35);
  g.fillRect(22, 28, w - 44, h - 36);
  g.generateTexture(key, w, h);
  g.destroy();
}

function makePlayer(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(0x22d3ee, 0.35);
  g.fillCircle(32, 40, 28);
  g.fillStyle(0x1e1b4b, 1);
  g.fillRoundedRect(18, 14, 28, 34, 8);
  g.fillStyle(0x0f172a, 1);
  g.fillCircle(32, 12, 11);
  g.fillStyle(0xffffff, 0.9);
  g.fillRect(26, 10, 12, 4);
  g.fillStyle(0x7c3aed, 1);
  g.fillRoundedRect(14, 38, 36, 22, 4);
  g.fillStyle(0x22d3ee, 0.8);
  g.fillRect(38, 42, 8, 16);
  g.lineStyle(2, 0xc084fc, 0.6);
  g.strokeCircle(32, 32, 22);
  g.generateTexture('player', 64, 64);
  g.destroy();

  const aura = scene.make.graphics({ x: 0, y: 0, add: false });
  aura.lineStyle(3, 0x22d3ee, 0.5);
  aura.strokeCircle(32, 32, 26);
  aura.lineStyle(2, 0xa855f7, 0.35);
  aura.strokeCircle(32, 32, 30);
  aura.generateTexture('player_aura', 64, 64);
  aura.destroy();
}

function makeZoneGlow(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const s = 64;
  for (let r = 28; r > 0; r -= 4) {
    g.fillStyle(0xa855f7, 0.08);
    g.fillCircle(s / 2, s / 2, r);
  }
  g.fillStyle(0x22d3ee, 0.2);
  g.fillCircle(s / 2, s / 2, 8);
  g.generateTexture('zone_glow', s, s);
  g.destroy();
}

function makeShadow(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(0x000000, 0.45);
  g.fillEllipse(32, 16, 48, 20);
  g.generateTexture('shadow', 64, 32);
  g.destroy();
}

function makeVignette(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const w = 256;
  const h = 256;
  g.fillStyle(0x000000, 0.55);
  g.fillRect(0, 0, w, 12);
  g.fillRect(0, h - 12, w, 12);
  g.fillRect(0, 0, 12, h);
  g.fillRect(w - 12, 0, 12, h);
  g.generateTexture('vignette', w, h);
  g.destroy();
}

function makeParticle(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(0x22d3ee, 1);
  g.fillCircle(4, 4, 4);
  g.fillStyle(0xffffff, 0.6);
  g.fillCircle(3, 3, 2);
  g.generateTexture('particle_ce', 8, 8);
  g.destroy();

  const p2 = scene.make.graphics({ x: 0, y: 0, add: false });
  p2.fillStyle(0xc084fc, 1);
  p2.fillCircle(3, 3, 3);
  p2.generateTexture('particle_curse', 6, 6);
  p2.destroy();
}

function makeTree(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(0x0a0812, 0.4);
  g.fillEllipse(20, 52, 36, 10);
  g.fillStyle(0x3f2e5c, 1);
  g.fillRect(16, 28, 8, 26);
  g.fillStyle(0x5b21b6, 0.85);
  g.fillCircle(20, 22, 18);
  g.fillStyle(0x7c3aed, 0.5);
  g.fillCircle(14, 18, 10);
  g.fillCircle(26, 20, 12);
  g.generateTexture('tree', 40, 56);
  g.destroy();
}
