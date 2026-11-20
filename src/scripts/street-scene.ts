// Moves the cars and people in the street scene.
// Positions use the same one-point perspective as Scene.astro:
// an object at depth z (1 = bottom edge of the picture) sits at
// dy = G / z below the horizon, and its size grows with dy.

const VP = { x: 250, y: 170 };
const G = 430;

type Lane = { inv: number; dir: 1 | -1; speed: number; zMin: number; zMax: number };

// dir -1: coming towards the viewer; dir 1: driving away.
const CAR_LANES: Lane[] = [
  { inv: 0.4184, dir: -1, speed: 0.34, zMin: 0.62, zMax: 9 },
  { inv: 0.7559, dir: 1, speed: 0.31, zMin: 0.62, zMax: 9 },
];
const WALK_LANES = [1.031, 1.176, 0.14]; // two on the pavement, one on the riverside path

const CAR_COLOURS = ['#f2f0ea', '#c9ccce', '#4b4f55', '#24262a', '#b8322a', '#2f55a8', '#2f5a48', '#d8c8a8', '#f2f0ea'];
const SHIRTS = ['#2f55e8', '#c0392b', '#e8b74a', '#3d6b5a', '#f2efe8', '#2b2b2b', '#8e6e9e', '#d98c5f', '#6a8caf'];
const PANTS = ['#2b2f3a', '#3d3d3d', '#5b6b80', '#6b5a48', '#1f1f24'];
const SKIN = ['#f1c9a5', '#e0b08a', '#c98f62', '#a8714a', '#6b4428'];
const HAIR = ['#2a1d14', '#5b3a21', '#c9a35e', '#8a8580', '#1a1410'];

const pick = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)];
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type Car = { el: SVGGElement; lane: Lane; z: number };
type Walker = { el: SVGGElement; inv: number; dir: 1 | -1; z: number; speed: number };

export function startScene(svg: SVGSVGElement, { reduced }: { reduced: boolean }) {
  const carLayer = svg.querySelector<SVGGElement>('[data-cars]');
  const walkLayer = svg.querySelector<SVGGElement>('[data-walkers]');
  const carTpl = svg.querySelector<SVGGElement>('#tpl-car');
  const walkTpl = svg.querySelector<SVGGElement>('#tpl-walker');
  if (!carLayer || !walkLayer || !carTpl || !walkTpl) return;

  const cars: Car[] = [];
  const walkers: Walker[] = [];
  const nextSpawn = new Map<Lane, number>();

  const makeCar = (lane: Lane, z: number) => {
    const el = carTpl.cloneNode(true) as SVGGElement;
    el.removeAttribute('id');
    el.style.setProperty('--c', pick(CAR_COLOURS));
    carLayer.append(el);
    const car = { el, lane, z };
    cars.push(car);
    placeCar(car);
    return car;
  };

  const dressWalker = (el: SVGGElement) => {
    el.style.setProperty('--shirt', pick(SHIRTS));
    el.style.setProperty('--pants', pick(PANTS));
    el.style.setProperty('--skin', pick(SKIN));
    el.style.setProperty('--hair', pick(HAIR));
    el.style.setProperty('--step', `${(-Math.random() * 0.7).toFixed(2)}s`);
  };

  const makeWalker = (inv: number) => {
    const el = walkTpl.cloneNode(true) as SVGGElement;
    el.removeAttribute('id');
    dressWalker(el);
    walkLayer.append(el);
    const w: Walker = {
      el,
      inv,
      dir: Math.random() < 0.5 ? 1 : -1,
      z: 1 + Math.random() * 6.5,
      speed: 0.035 + Math.random() * 0.02,
    };
    walkers.push(w);
    placeWalker(w);
  };

  const placeCar = (car: Car) => {
    const dy = G / car.z;
    const x = VP.x + dy * car.lane.inv;
    const y = VP.y + dy;
    const s = (dy / G) * 1.6;
    const angle = (Math.atan2(1, car.lane.inv) * 180) / Math.PI + (car.lane.dir < 0 ? 90 : -90);
    car.el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${s.toFixed(3)} ${(s * 0.74).toFixed(3)})`);
    car.el.style.opacity = clamp((car.lane.zMax - car.z) / 1.8, 0, 1).toFixed(2);
  };

  const placeWalker = (w: Walker) => {
    const dy = G / w.z;
    const x = VP.x + dy * w.inv;
    const y = VP.y + dy;
    const s = (dy / G) * 1.35;
    w.el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)})`);
    w.el.style.opacity = clamp((8 - w.z) / 1.5, 0, 1).toFixed(2);
  };

  // Starting traffic, spread out so the street is never empty.
  [2.2, 4.9, 7.6].forEach((z) => makeCar(CAR_LANES[0], z));
  [1.5, 4.0, 6.8].forEach((z) => makeCar(CAR_LANES[1], z));
  WALK_LANES.forEach((inv, i) => {
    for (let k = 0; k < (i < 2 ? 5 : 3); k++) makeWalker(inv);
  });

  if (reduced) return;

  let last = 0;
  let clock = 0;
  let sortTimer = 0;
  let running = false;
  let raf = 0;

  const frame = (now: number) => {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    clock += dt;

    for (let i = cars.length - 1; i >= 0; i--) {
      const car = cars[i];
      car.z += car.lane.dir * car.lane.speed * dt;
      if (car.z < car.lane.zMin || car.z > car.lane.zMax) {
        car.el.remove();
        cars.splice(i, 1);
        continue;
      }
      placeCar(car);
    }

    for (const lane of CAR_LANES) {
      const due = nextSpawn.get(lane) ?? 0;
      if (clock < due) continue;
      const start = lane.dir < 0 ? lane.zMax : lane.zMin;
      const crowded = cars.some((c) => c.lane === lane && Math.abs(c.z - start) < (lane.dir < 0 ? 1.6 : 0.5));
      if (crowded) {
        nextSpawn.set(lane, clock + 1);
        continue;
      }
      makeCar(lane, start);
      nextSpawn.set(lane, clock + 3 + Math.random() * 6);
    }

    for (const w of walkers) {
      w.z += w.dir * w.speed * dt;
      if (w.z < 0.85 || w.z > 8) {
        w.z = w.dir > 0 ? 0.86 : 7.9;
        dressWalker(w.el);
      }
      placeWalker(w);
    }

    // Keep nearer people drawn on top of farther ones.
    sortTimer += dt;
    if (sortTimer > 0.5) {
      sortTimer = 0;
      walkers.sort((a, b) => b.z - a.z).forEach((w) => walkLayer.append(w.el));
    }

    raf = requestAnimationFrame(frame);
  };

  let onScreen = true;
  const update = () => {
    const should = onScreen && !document.hidden;
    if (should && !running) {
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    } else if (!should && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  };

  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    update();
  }).observe(svg);
  document.addEventListener('visibilitychange', update);
  update();
}
