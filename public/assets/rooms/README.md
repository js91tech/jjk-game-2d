# Interior room backgrounds

Exported from the 2×2 isometric room sheet (1024×558 source).

| File | Scene use |
|------|-----------|
| `hospital.png` | Hospital / recovery |
| `prison.png` | Jail / escape |
| `office.png` | Companies |
| `gym.png` | Stat training |

- **768×576** — Matches Phaser game canvas; use for full-screen interior scenes.
- **native/** — Uncropped 512×279 quadrants from the source sheet (no upscale).

Load in Phaser: `this.load.image('room_hospital', 'assets/rooms/hospital.png')` (path relative to `public/`).
