import { api } from '../api/client.js';

let state = { player: null, status: null, crimes: [], message: '' };

export function getState() {
  return state;
}

export function setState(patch) {
  state = { ...state, ...patch };
  renderHud();
}

export async function refreshMe() {
  const data = await api.me();
  setState({
    player: data.player,
    status: data.status,
    confinement: data.confinement
  });
  return data;
}

export async function loadCrimes() {
  const data = await api.crimes();
  setState({ crimes: data.crimes });
}

function renderHud() {
  const el = document.getElementById('hud');
  if (!el || !state.player) return;
  const p = state.player;
  const conf = state.confinement?.confined
    ? `<div class="alert">${state.confinement.reason === 'jail' ? 'Prison Realm' : 'Infirmary'} — ${state.confinement.minutesLeft}m left</div>`
    : '';

  const crimeOpts = (state.crimes || [])
    .map(
      (c) =>
        `<option value="${c.id}" ${c.locked ? 'disabled' : ''}>${c.name} (Lv${c.min_level})</option>`
    )
    .join('');

  el.innerHTML = `
    <div class="hud-panel">
      <div class="hud-title">${p.username} <span class="badge">${p.grade}</span> Lv.${p.level}</div>
      ${conf}
      <div class="hud-stats">
        <span>CE ${p.ce}</span><span>Coins ${p.coins?.toLocaleString()}</span>
        <span>STR ${p.strength}</span><span>DEF ${p.defense}</span>
        <span>SPD ${p.speed}</span><span>DEX ${p.dexterity}</span>
      </div>
      <div class="hud-msg">${state.message || ''}</div>
      <div class="hud-actions">
        <select id="crime-select">${crimeOpts}</select>
        <button data-action="crime">Mission</button>
        <button data-action="train-str">Train STR</button>
        <button data-action="train-def">Train DEF</button>
        <button data-action="work">Work</button>
        <button data-action="explore">Look</button>
      </div>
      ${state.confinement?.confined ? `<div class="hud-actions">
        <button data-action="escape-pay">Pay bail / bill</button>
        <button data-action="escape-ce">CE heal</button>
      </div>` : ''}
      <p class="hint">${document.body.classList.contains('touch-mode') ? 'Joystick move · tap zones · Interact button' : 'WASD move · E interact'} · Same save as bot</p>
    </div>
  `;

  el.querySelectorAll('[data-action]').forEach((btn) => {
    btn.onclick = () => handleAction(btn.dataset.action);
  });
}

async function handleAction(action) {
  try {
    let r;
    if (action === 'crime') {
      const id = document.getElementById('crime-select')?.value;
      r = await api.crime(id);
    } else if (action === 'train-str') r = await api.train('strength', 5);
    else if (action === 'train-def') r = await api.train('defense', 5);
    else if (action === 'work') r = await api.work();
    else if (action === 'explore') r = await api.explore();
    else if (action === 'escape-pay') {
      const place = state.confinement?.reason === 'jail' ? 'jail' : 'hospital';
      r = await api.escape(place, 'pay');
    } else if (action === 'escape-ce') r = await api.escape('hospital', 'ce');
    setState({ message: r.message, player: r.player || state.player });
    if (r.player) await refreshMe();
    window.dispatchEvent(new CustomEvent('jjk:action', { detail: { action, ok: r.ok } }));
  } catch (e) {
    setState({ message: e.message });
  }
}

export function initHud() {
  renderHud();
}
