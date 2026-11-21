// The window on the home page: starts the street scene and lets the
// visitor lift the lower sash (click it, or drag it with a mouse).
import { startScene } from './street-scene';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const root = document.querySelector<HTMLElement>('[data-window]');
if (root) setup(root);

function setup(root: HTMLElement) {
  const sash = root.querySelector<HTMLButtonElement>('[data-sash]');
  const opening = root.querySelector<HTMLElement>('[data-opening]');
  const caption = root.querySelector<HTMLElement>('[data-caption]');
  const scene = root.querySelector<SVGSVGElement>('[data-scene]');
  if (!sash || !opening || !caption || !scene) return;

  startScene(scene, { reduced });

  let open = 0; // 0 closed … 1 fully open

  const apply = (v: number) => {
    open = v;
    root.style.setProperty('--open', v.toFixed(4));
  };

  const announce = (isOpen: boolean) => {
    root.dataset.open = String(isOpen);
    sash.setAttribute('aria-pressed', String(isOpen));
    sash.setAttribute('aria-label', isOpen ? 'Close the window' : 'Open the window');
    caption.textContent = isOpen ? 'Lower the window' : 'Lift the window';
  };

  let tween = 0;
  const animateTo = (target: number) => {
    cancelAnimationFrame(tween);
    announce(target > 0.5);
    const from = open;
    const start = performance.now();
    const duration = reduced ? 1 : 600 + 600 * Math.abs(target - from);
    // Lifting glides; closing drops onto the sill with a little rebound.
    const drops = target === 0 && from > 0.2 && !reduced;
    const ease = (k: number) => {
      if (!drops) return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      if (k < 0.8) {
        const t = k / 0.8;
        return t * t * (2 - t * 0.9) * (1 / 1.1);
      }
      return 1 - 0.04 * Math.sin((Math.PI * (k - 0.8)) / 0.2);
    };
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / duration);
      const eased = ease(k);
      apply(from + (target - from) * eased);
      if (k < 1) tween = requestAnimationFrame(step);
    };
    tween = requestAnimationFrame(step);
  };

  let drag: { y: number; from: number; moved: boolean } | null = null;
  let skipClick = false;

  sash.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.pointerType !== 'mouse') return;
    drag = { y: e.clientY, from: open, moved: false };
    sash.setPointerCapture(e.pointerId);
  });
  sash.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dy = drag.y - e.clientY;
    if (!drag.moved && Math.abs(dy) < 4) return;
    if (!drag.moved) cancelAnimationFrame(tween);
    drag.moved = true;
    apply(clamp(drag.from + dy / (opening.clientHeight * 0.46), 0, 1));
  });
  const endDrag = () => {
    if (!drag) return;
    if (drag.moved) {
      skipClick = true;
      animateTo(open > (drag.from > 0.5 ? 0.75 : 0.25) ? 1 : 0);
    }
    drag = null;
  };
  sash.addEventListener('pointerup', endDrag);
  sash.addEventListener('pointercancel', endDrag);
  sash.addEventListener('click', () => {
    if (skipClick) {
      skipClick = false;
      return;
    }
    animateTo(open > 0.5 ? 0 : 1);
  });
}
