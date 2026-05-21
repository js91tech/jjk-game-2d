import Phaser from 'phaser';
import { api } from '../api/client.js';
import { getState, refreshMe } from '../ui/hud.js';
import { isTouchDevice } from '../input/touch.js';
import { ROOM_CONFIG } from './roomConfig.js';

const W = 768;
const H = 576;

export class InteriorScene extends Phaser.Scene {
  constructor(key) {
    super(key);
    this.roomKey = key;
  }

  init() {
    this.cfg = ROOM_CONFIG[this.roomKey];
  }

  create() {
    if (!this.cfg) {
      this.scene.start('Hub');
      return;
    }

    this.cameras.main.setBackgroundColor('#080810');
    this.add.image(W / 2, H / 2, this.cfg.texture).setDisplaySize(W, H).setDepth(0);

    this.add
      .text(W / 2, 28, this.cfg.title, {
        fontFamily: '"Bebas Neue", sans-serif',
        fontSize: '26px',
        color: '#f3e8ff',
        stroke: '#1e1b4b',
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.add
      .text(W / 2, 52, this.cfg.subtitle, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13px',
        color: '#94a3b8'
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.interactZones = [...(this.cfg.zones || [])];
    if (this.cfg.exit) {
      this.interactZones.push({
        ...this.cfg.exit,
        w: 160,
        h: 48,
        action: 'exit',
        color: 0x64748b
      });
    }

    this.setupZones();
    this.setupFx();
    this.setupInput();

    window.addEventListener('jjk:action', this._onAction);
    window.addEventListener('jjk:interact', this._onInteract);
  }

  shutdown() {
    window.removeEventListener('jjk:action', this._onAction);
    window.removeEventListener('jjk:interact', this._onInteract);
  }

  _onAction = (e) => this.playActionFx(e.detail?.action);

  _onInteract = () => this.tryInteractPointer();

  setupZones() {
    this.zoneHits = [];
    for (const z of this.interactZones) {
      const wx = z.x;
      const wy = z.y;
      const glow = this.add.image(wx, wy, 'zone_glow').setDepth(5).setAlpha(0.65).setTint(z.color || 0xa855f7);
      this.tweens.add({
        targets: glow,
        scale: { from: 0.9, to: 1.1 },
        alpha: { from: 0.4, to: 0.85 },
        duration: 1100,
        yoyo: true,
        repeat: -1
      });

      const label = this.add
        .text(wx, wy - (z.h || 48) / 2 - 10, z.label, {
          fontFamily: '"Bebas Neue", sans-serif',
          fontSize: '12px',
          color: '#f8fafc',
          stroke: '#0f172a',
          strokeThickness: 3,
          align: 'center'
        })
        .setOrigin(0.5)
        .setDepth(6);

      const hit = this.add.zone(wx, wy, z.w || 120, z.h || 80);
      hit.setDepth(7);
      hit.setInteractive({ useHandCursor: true });
      hit.on('pointerup', () => this.triggerZone(z));
      this.zoneHits.push({ hit, glow, label, zone: z });
    }
  }

  setupFx() {
    this.flash = this.add.rectangle(W / 2, H / 2, W, H, 0x22d3ee, 0).setDepth(100).setBlendMode(Phaser.BlendModes.ADD);
  }

  setupInput() {
    if (!isTouchDevice()) {
      this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }
    this.input.on('pointerup', (pointer) => {
      if (isTouchDevice() && !pointer.wasTouch) return;
      this.tryInteractAt(pointer.x, pointer.y);
    });
  }

  tryInteractPointer() {
    const p = this.input.activePointer;
    this.tryInteractAt(p.x, p.y);
  }

  tryInteractAt(px, py) {
    let best = null;
    let bestD = 9999;
    for (const z of this.interactZones) {
      const d = Phaser.Math.Distance.Between(px, py, z.x, z.y);
      const maxD = Math.max(z.w || 120, z.h || 80) * 0.65;
      if (d < maxD && d < bestD) {
        bestD = d;
        best = z;
      }
    }
    if (best) this.triggerZone(best);
    else {
      window.dispatchEvent(
        new CustomEvent('jjk:toast', { detail: { message: 'Tap a glowing hotspot', ok: false } })
      );
    }
  }

  update() {
    if (this.interactKey && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.tryInteractPointer();
    }
  }

  async triggerZone(z) {
    if (z.action === 'exit') {
      const conf = getState().confinement;
      if (conf?.confined && (this.roomKey === 'Hospital' || this.roomKey === 'Prison')) {
        window.dispatchEvent(
          new CustomEvent('jjk:toast', {
            detail: { message: 'You are still confined — escape first.', ok: false }
          })
        );
        return;
      }
      this.scene.start('Hub');
      return;
    }

    try {
      let r;
      const sets = 5;
      if (z.action === 'train-str') r = await api.train('strength', sets);
      else if (z.action === 'train-def') r = await api.train('defense', sets);
      else if (z.action === 'train-spd') r = await api.train('speed', sets);
      else if (z.action === 'train-dex') r = await api.train('dexterity', sets);
      else if (z.action === 'work') r = await api.work();
      else if (z.action === 'escape-pay') {
        const place = this.roomKey === 'Prison' ? 'jail' : 'hospital';
        r = await api.escape(place, 'pay');
      } else if (z.action === 'escape-ce') r = await api.escape('hospital', 'ce');
      else if (z.action === 'escape-item') {
        const place = this.roomKey === 'Prison' ? 'jail' : 'hospital';
        r = await api.escape(place, 'item');
      } else if (z.action === 'crime-hint') {
        window.dispatchEvent(
          new CustomEvent('jjk:toast', {
            detail: { message: 'Use the HUD mission dropdown on the courtyard.', ok: true }
          })
        );
        return;
      } else return;

      window.dispatchEvent(
        new CustomEvent('jjk:toast', { detail: { message: r.message, ok: r.ok !== false } })
      );
      if (r.player) window.dispatchEvent(new CustomEvent('jjk:refresh'));
      this.playActionFx(z.action);

      if (z.action.startsWith('escape') && r.ok !== false) {
        await refreshMe();
        if (!getState().confinement?.confined) {
          this.time.delayedCall(500, () => this.scene.start('Hub'));
        }
      }
    } catch (e) {
      window.dispatchEvent(new CustomEvent('jjk:toast', { detail: { message: e.message, ok: false } }));
    }
  }

  playActionFx(action) {
    const colors = {
      'train-str': 0x22d3ee,
      'train-def': 0x34d399,
      'train-spd': 0xfbbf24,
      'train-dex': 0xa855f7,
      work: 0xfbbf24,
      'escape-pay': 0x34d399,
      'escape-ce': 0x22d3ee,
      'escape-item': 0xc084fc,
      exit: 0x64748b
    };
    const color = colors[action] || 0x7c3aed;
    this.flash.setFillStyle(color);
    this.tweens.add({ targets: this.flash, alpha: { from: 0.4, to: 0 }, duration: 350 });
    this.cameras.main.shake(120, 0.008);
  }
}

export class GymScene extends InteriorScene {
  constructor() {
    super('Gym');
  }
}

export class HospitalScene extends InteriorScene {
  constructor() {
    super('Hospital');
  }
}

export class PrisonScene extends InteriorScene {
  constructor() {
    super('Prison');
  }
}

export class OfficeScene extends InteriorScene {
  constructor() {
    super('Office');
  }
}
