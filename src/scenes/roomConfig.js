/** Interior room definitions — hotspots in 768×576 space. */
export const ROOM_CONFIG = {
  Gym: {
    texture: 'room_gym',
    title: 'Cursed Pit Gym',
    subtitle: 'Tap equipment to train · Exit to courtyard',
    zones: [
      { x: 520, y: 300, w: 140, h: 100, label: 'Power rack — STR', action: 'train-str', color: 0x22d3ee },
      { x: 180, y: 280, w: 130, h: 90, label: 'Bench — DEF', action: 'train-def', color: 0x34d399 },
      { x: 600, y: 200, w: 120, h: 80, label: 'Dumbbells — SPD', action: 'train-spd', color: 0xfbbf24 },
      { x: 320, y: 360, w: 120, h: 80, label: 'Rowing — DEX', action: 'train-dex', color: 0xa855f7 }
    ],
    exit: { x: 384, y: 500, label: '← Courtyard' }
  },
  Hospital: {
    texture: 'room_hospital',
    title: "Shoko's Infirmary",
    subtitle: 'Escape or wait out the timer',
    zones: [
      { x: 280, y: 260, w: 160, h: 100, label: 'Pay medical bill', action: 'escape-pay', color: 0x34d399 },
      { x: 480, y: 260, w: 160, h: 100, label: 'CE escape (40)', action: 'escape-ce', color: 0x22d3ee },
      { x: 380, y: 180, w: 140, h: 80, label: 'Reversal Kit', action: 'escape-item', color: 0xc084fc }
    ],
    exit: { x: 384, y: 500, label: '← Courtyard' }
  },
  Prison: {
    texture: 'room_prison',
    title: 'Prison Realm',
    subtitle: 'Pay bail, use a key, or ask an ally on PvP',
    zones: [
      { x: 300, y: 280, w: 160, h: 100, label: 'Pay bail', action: 'escape-pay', color: 0xfbbf24 },
      { x: 500, y: 280, w: 160, h: 100, label: 'Prison Key', action: 'escape-item', color: 0xa855f7 }
    ],
    exit: { x: 384, y: 500, label: '← Courtyard' }
  },
  Office: {
    texture: 'room_office',
    title: 'Company Office',
    subtitle: 'Clock in for coins when enrolled in a company',
    zones: [
      { x: 400, y: 280, w: 180, h: 110, label: 'Clock in', action: 'work', color: 0xfbbf24 },
      { x: 200, y: 240, w: 120, h: 80, label: 'Mission board', action: 'crime-hint', color: 0xa855f7 }
    ],
    exit: { x: 384, y: 500, label: '← Courtyard' }
  }
};
