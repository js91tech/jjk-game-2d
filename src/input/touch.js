/** Virtual joystick + interact button for Discord mobile / touch devices. */

export const touchState = { dx: 0, dy: 0, interact: false };

export function isTouchDevice() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches
  );
}

export function isDiscordMobile() {
  const ua = navigator.userAgent || '';
  return /Discord/i.test(ua) && /iPhone|iPad|Android|Mobile/i.test(ua);
}

export function mountTouchControls(onInteract) {
  if (!isTouchDevice()) return;

  document.body.classList.add('touch-mode');

  const root = document.createElement('div');
  root.id = 'touch-controls';
  root.innerHTML = `
    <div id="joystick-zone" class="joystick-zone" aria-label="Move">
      <div id="joystick-knob" class="joystick-knob"></div>
    </div>
    <button type="button" id="btn-interact" class="btn-interact">Interact</button>
  `;
  document.body.appendChild(root);

  const zone = document.getElementById('joystick-zone');
  const knob = document.getElementById('joystick-knob');
  const btn = document.getElementById('btn-interact');
  const maxR = 42;
  let active = false;
  let startX = 0;
  let startY = 0;

  function pointerPos(e) {
    const t = e.touches?.[0] || e.changedTouches?.[0] || e;
    return { x: t.clientX, y: t.clientY };
  }

  function onStart(e) {
    e.preventDefault();
    active = true;
    const p = pointerPos(e);
    const rect = zone.getBoundingClientRect();
    startX = rect.left + rect.width / 2;
    startY = rect.top + rect.height / 2;
    moveKnob(p.x, p.y);
  }

  function moveKnob(px, py) {
    let dx = px - startX;
    let dy = py - startY;
    const len = Math.hypot(dx, dy);
    if (len > maxR) {
      dx = (dx / len) * maxR;
      dy = (dy / len) * maxR;
    }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    touchState.dx = len > 8 ? dx / maxR : 0;
    touchState.dy = len > 8 ? dy / maxR : 0;
  }

  function onEnd() {
    active = false;
    knob.style.transform = 'translate(0, 0)';
    touchState.dx = 0;
    touchState.dy = 0;
  }

  zone.addEventListener('touchstart', onStart, { passive: false });
  zone.addEventListener('touchmove', (e) => active && (e.preventDefault(), moveKnob(pointerPos(e).x, pointerPos(e).y)), {
    passive: false
  });
  zone.addEventListener('touchend', onEnd);
  zone.addEventListener('touchcancel', onEnd);

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    touchState.interact = true;
    onInteract?.();
    setTimeout(() => {
      touchState.interact = false;
    }, 100);
  });

  btn.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
}
