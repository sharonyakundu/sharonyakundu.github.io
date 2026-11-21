// Moves the cars, trams and people in the street scene.
// Positions use the same one-point perspective as Scene.astro:
// an object at depth z (1 = bottom edge of the picture) sits at
// dy = G / z below the horizon, and its size grows with dy.
//
// Vehicles are real boxes in 3D. Sideways (X) and height (Y) are measured
// in camera heights (the window is about 28 m above the street); depth (Z)
// is the same number as above, so a point (X, Y, Z) lands on screen at
// x = VP.x + X·G/Z and y = VP.y + (1 − Y)·G/Z.

const VP = { x: 250, y: 170 };
const G = 430;
const M = 1 / 28; // one metre sideways or up
const MZ = 430 / (830 * 28); // one metre along the street
// The sun is low, ahead and a little to the left, so shadows fall towards
// us and to the right: a point Y high throws its shadow this far per unit.
const SUN = { x: 0.6, z: -1.24 };

type Pt = [number, number];
const project = (X: number, Y: number, Z: number): Pt => {
  const k = G / Z;
  return [VP.x + k * X, VP.y + k * (1 - Y)];
};
const fmt = (list: Pt[]) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

// Smallest convex outline around some points (for shadows).
const hull = (list: Pt[]) => {
  const p = [...list].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Pt[] = [];
  for (const q of p) {
    while (lower.length > 1 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
    lower.push(q);
  }
  const upper: Pt[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (upper.length > 1 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
    upper.push(q);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
};

// Body shapes in metres. cab: cabin bottom and roof, from back to front
// (positive is towards the front of the vehicle).
type Model = {
  len: number;
  wid: number;
  h0: number; // bottom of the body
  h1: number; // waistline, where the windows start
  h2: number; // roof
  cab: [number, number, number, number];
  wheel: number;
  axle: number;
  boxy?: boolean;
  tram?: boolean;
};
const MODELS: Record<string, Model> = {
  hatch: { len: 4.1, wid: 1.78, h0: 0.3, h1: 0.95, h2: 1.48, cab: [-1.9, 0.8, -1.7, 0.0], wheel: 0.31, axle: 1.3 },
  sedan: { len: 4.7, wid: 1.82, h0: 0.3, h1: 0.92, h2: 1.44, cab: [-1.35, 0.9, -1.0, 0.25], wheel: 0.32, axle: 1.45 },
  suv: { len: 4.6, wid: 1.9, h0: 0.38, h1: 1.05, h2: 1.72, cab: [-2.05, 0.85, -1.95, 0.2], wheel: 0.36, axle: 1.4 },
  van: { len: 5.3, wid: 2.0, h0: 0.36, h1: 1.1, h2: 2.4, cab: [-2.6, 1.75, -2.6, 1.35], wheel: 0.34, axle: 1.75, boxy: true },
  tram: { len: 30, wid: 2.4, h0: 0.4, h1: 1.05, h2: 3.4, cab: [0, 0, 0, 0], wheel: 0, axle: 0, tram: true },
};
const CAR_MODELS = ['hatch', 'hatch', 'sedan', 'sedan', 'suv', 'van'];

type Lane = { inv: number; dir: 1 | -1; speed: number; zMin: number; zMax: number };

// dir -1: coming towards the viewer; dir 1: driving away.
const CAR_LANES: Lane[] = [
  { inv: 0.4184, dir: -1, speed: 0.26, zMin: 0.62, zMax: 9 },
  { inv: 0.7559, dir: 1, speed: 0.24, zMin: 0.62, zMax: 9 },
];
const TRAM_INV = 0.575;
const WALK_LANES = [1.031, 1.176, 0.14]; // two on the pavement, one on the riverside path

const CAR_COLOURS = ['#f2f0ea', '#c9ccce', '#4b4f55', '#24262a', '#b8322a', '#2f55a8', '#2f5a48', '#d8c8a8', '#f2f0ea', '#8d939a'];
const SHIRTS = ['#2f55e8', '#c0392b', '#e8b74a', '#3d6b5a', '#f2efe8', '#2b2b2b', '#8e6e9e', '#d98c5f', '#6a8caf'];
const PANTS = ['#2b2f3a', '#3d3d3d', '#5b6b80', '#6b5a48', '#1f1f24'];
const SKIN = ['#f1c9a5', '#e0b08a', '#c98f62', '#a8714a', '#6b4428'];
const HAIR = ['#2a1d14', '#5b3a21', '#c9a35e', '#8a8580', '#1a1410'];

const pick = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)];
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Mix a colour towards a target (warm sunlight, or shade).
const mix = (hex: string, target: [number, number, number], k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v, i) => Math.round(v + (target[i] - v) * k));
  return `rgb(${c[0]} ${c[1]} ${c[2]})`;
};

const NS = 'http://www.w3.org/2000/svg';
const add = (parent: Element, cls: string) => {
  const el = document.createElementNS(NS, 'polygon');
  el.setAttribute('class', cls);
  parent.append(el);
  return el;
};

type Parts = Record<string, SVGPolygonElement>;
type Vehicle = { el: SVGGElement; parts: Parts; model: Model; inv: number; dir: 1 | -1; speed: number; z: number; zMin: number; zMax: number };
type Walker = { el: SVGGElement; inv: number; dir: 1 | -1; z: number; speed: number };

export function startScene(svg: SVGSVGElement, { reduced }: { reduced: boolean }) {
  const carLayer = svg.querySelector<SVGGElement>('[data-cars]');
  const walkLayer = svg.querySelector<SVGGElement>('[data-walkers]');
  const walkTpl = svg.querySelector<SVGGElement>('#tpl-walker');
  if (!carLayer || !walkLayer || !walkTpl) return;

  const vehicles: Vehicle[] = [];
  const walkers: Walker[] = [];
  const nextSpawn = new Map<Lane, number>();

  const makeVehicle = (model: Model, colour: string, inv: number, dir: 1 | -1, speed: number, z: number, zMin: number, zMax: number) => {
    const el = document.createElementNS(NS, 'g');
    el.setAttribute('class', 'car');
    el.style.setProperty('--top', mix(colour, [255, 236, 206], 0.2));
    el.style.setProperty('--side', mix(colour, [40, 30, 25], 0.08));
    el.style.setProperty('--near', mix(colour, [30, 22, 18], 0.42));
    const parts: Parts = {};
    // Order matters: what is drawn later sits on top.
    for (const [key, cls] of [
      ['shadow', 'k-shadow'],
      ['beam', 'k-beam'],
      ['side', 'k-side'],
      ['near', 'k-near'],
      ['top', 'k-top'],
      ['band', 'k-glass'],
      ['stripe', 'k-near'],
      ['glass', 'k-glass'],
      ['pillar', 'k-side'],
      ['shield', 'k-shield'],
      ['roof', 'k-top'],
      ['wheelA', 'k-wheel'],
      ['wheelB', 'k-wheel'],
      ['lightA', dir < 0 ? 'k-head' : 'k-tail'],
      ['lightB', dir < 0 ? 'k-head' : 'k-tail'],
      ['gear', 'k-near'],
    ] as const) {
      parts[key] = add(el, cls);
    }
    carLayer.append(el);
    const v: Vehicle = { el, parts, model, inv, dir, speed, z, zMin, zMax };
    vehicles.push(v);
    placeVehicle(v);
    return v;
  };

  const placeVehicle = (v: Vehicle) => {
    const { model: m, dir, parts } = v;
    // A point on the vehicle: u metres forward, s metres sideways, h metres up.
    const P = (u: number, s: number, h: number) => project(v.inv + s * M, h * M, v.z + dir * u * MZ);
    const groundShadow = (u: number, s: number, h: number) =>
      project(v.inv + s * M + SUN.x * h * M, 0, v.z + dir * u * MZ + SUN.z * h * M);

    const L = m.len / 2;
    const W = m.wid / 2;
    const uNear = -dir * L; // the end facing us: the back if it drives away
    const set = (key: string, list: Pt[] | null) => {
      const el = parts[key];
      if (!list) el.setAttribute('points', '');
      else el.setAttribute('points', fmt(list));
    };

    // Shadow on the road: the outline of the footprint and the roof, cast by the sun.
    const corners: Pt[] = [];
    for (const u of [-L, L]) for (const s of [-W, W]) corners.push(groundShadow(u, s, 0), groundShadow(u, s, m.h2));
    set('shadow', hull(corners));

    // Headlight beams on the road in front.
    const uF = L; // the front, in the direction it drives
    set('beam', m.tram ? null : [P(uF, -0.6, 0), P(uF, 0.6, 0), P(uF + 13, 2.6, 0), P(uF + 13, -2.6, 0)]);

    const bodyTop = m.tram ? m.h2 : m.h1;
    // Inner side (facing the river and us), the end facing us, and the top.
    set('side', [P(-L, -W, m.h0), P(L, -W, m.h0), P(L, -W, bodyTop), P(-L, -W, bodyTop)]);
    set('near', [P(uNear, -W, m.h0), P(uNear, W, m.h0), P(uNear, W, bodyTop), P(uNear, -W, bodyTop)]);
    set('top', [P(-L, -W, bodyTop), P(L, -W, bodyTop), P(L, W, bodyTop), P(-L, W, bodyTop)]);

    const light = (s0: number, s1: number, h0: number, h1: number): Pt[] => [P(uNear, s0, h0), P(uNear, s1, h0), P(uNear, s1, h1), P(uNear, s0, h1)];

    if (m.tram) {
      // Long window band, a coloured stripe, the driver's window and roof gear.
      const e = L - 1.2;
      set('band', [P(-e, -W, 1.15), P(e, -W, 1.15), P(e, -W, 2.55), P(-e, -W, 2.55)]);
      set('stripe', [P(-L, -W, 0.55), P(L, -W, 0.55), P(L, -W, 0.8), P(-L, -W, 0.8)]);
      set('shield', [P(uNear, -W + 0.15, 1.2), P(uNear, W - 0.15, 1.2), P(uNear, W - 0.2, 2.7), P(uNear, -W + 0.2, 2.7)]);
      set('gear', [P(-2, -0.7, m.h2), P(2, -0.7, m.h2), P(2, -0.7, m.h2 + 0.45), P(-2, -0.7, m.h2 + 0.45)]);
      set('glass', null);
      set('pillar', null);
      set('roof', null);
      set('wheelA', null);
      set('wheelB', null);
      set('lightA', light(-W + 0.15, -W + 0.45, 0.6, 0.8));
      set('lightB', light(W - 0.45, W - 0.15, 0.6, 0.8));
    } else {
      // Cabin: narrower and shorter at the roof.
      const [b0, b1, t0, t1] = m.cab;
      const sb = -W + 0.08;
      const st = -W + 0.24;
      const glassCls = m.boxy ? 'k-side' : 'k-glass';
      parts.glass.setAttribute('class', glassCls);
      set('glass', [P(b0, sb, m.h1), P(b1, sb, m.h1), P(t1, st, m.h2), P(t0, st, m.h2)]);
      // The pillar between the side windows (on a van: its side window).
      if (m.boxy) {
        parts.pillar.setAttribute('class', 'k-glass');
        set('pillar', [P(b1 - 1.1, sb, m.h1 + 0.15), P(b1 - 0.15, sb, m.h1 + 0.15), P(t1 - 0.1, st, m.h2 - 0.2), P(t1 - 1.0, st, m.h2 - 0.2)]);
      } else {
        const pm = (b0 + b1) / 2 - 0.1;
        const pt = (t0 + t1) / 2 - 0.1;
        set('pillar', [P(pm - 0.07, sb, m.h1), P(pm + 0.07, sb, m.h1), P(pt + 0.06, st, m.h2), P(pt - 0.06, st, m.h2)]);
      }
      // Windscreen if it comes towards us, rear window if it drives away.
      const ub = dir < 0 ? b1 : b0;
      const ut = dir < 0 ? t1 : t0;
      set('shield', [P(ub, sb, m.h1), P(ub, -sb, m.h1), P(ut, -st, m.h2), P(ut, st, m.h2)]);
      set('roof', [P(t0, st, m.h2), P(t1, st, m.h2), P(t1, -st, m.h2), P(t0, -st, m.h2)]);
      // Wheels on the side we can see.
      const wheel = (uc: number): Pt[] =>
        Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return P(uc + Math.cos(a) * m.wheel, -W - 0.01, m.wheel + Math.sin(a) * m.wheel);
        });
      set('wheelA', wheel(-m.axle));
      set('wheelB', wheel(m.axle));
      set('band', null);
      set('stripe', null);
      set('gear', null);
      set('lightA', light(-W + 0.12, -W + 0.42, 0.62, 0.78));
      set('lightB', light(W - 0.42, W - 0.12, 0.62, 0.78));
    }

    v.el.style.opacity = clamp((v.zMax - v.z) / 1.8, 0, 1).toFixed(2);
  };

  const makeCar = (lane: Lane, z: number) =>
    makeVehicle(MODELS[pick(CAR_MODELS)], pick(CAR_COLOURS), lane.inv, lane.dir, lane.speed * (0.9 + Math.random() * 0.2), z, lane.zMin, lane.zMax);

  const makeTram = (z?: number) => {
    const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
    const start = z ?? (dir < 0 ? 9.5 : 0.6);
    makeVehicle(MODELS.tram, '#eeece5', TRAM_INV, dir, 0.13, start, 0.6, 9.5);
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
      speed: 0.022 + Math.random() * 0.012,
    };
    walkers.push(w);
    placeWalker(w);
  };

  const placeWalker = (w: Walker) => {
    const dy = G / w.z;
    const x = VP.x + dy * w.inv;
    const y = VP.y + dy;
    const s = (dy / G) * 1.35;
    w.el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(3)})`);
    w.el.style.opacity = clamp((8 - w.z) / 1.5, 0, 1).toFixed(2);
  };

  // Farther vehicles are drawn first, so nearer ones cover them.
  const sortVehicles = () => vehicles.sort((a, b) => b.z - a.z).forEach((v) => carLayer.append(v.el));

  // Starting traffic, spread out so the street is never empty.
  [2.2, 4.9, 7.6].forEach((z) => makeCar(CAR_LANES[0], z));
  [1.5, 4.0, 6.8].forEach((z) => makeCar(CAR_LANES[1], z));
  makeTram(3.6);
  sortVehicles();
  WALK_LANES.forEach((inv, i) => {
    for (let k = 0; k < (i < 2 ? 5 : 3); k++) makeWalker(inv);
  });

  if (reduced) return;

  let last = 0;
  let clock = 0;
  let sortTimer = 0;
  let nextTram = 25 + Math.random() * 20;
  let running = false;
  let raf = 0;

  const frame = (now: number) => {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    clock += dt;

    for (let i = vehicles.length - 1; i >= 0; i--) {
      const v = vehicles[i];
      v.z += v.dir * v.speed * dt;
      if (v.z < v.zMin || v.z > v.zMax) {
        v.el.remove();
        vehicles.splice(i, 1);
        continue;
      }
      placeVehicle(v);
    }

    for (const lane of CAR_LANES) {
      const due = nextSpawn.get(lane) ?? 0;
      if (clock < due) continue;
      const start = lane.dir < 0 ? lane.zMax : lane.zMin;
      const crowded = vehicles.some((c) => c.inv === lane.inv && Math.abs(c.z - start) < (lane.dir < 0 ? 1.6 : 0.5));
      if (crowded) {
        nextSpawn.set(lane, clock + 1);
        continue;
      }
      makeCar(lane, start);
      nextSpawn.set(lane, clock + 3 + Math.random() * 6);
    }

    if (clock > nextTram && !vehicles.some((v) => v.model.tram)) {
      makeTram();
      nextTram = clock + 30 + Math.random() * 30;
    }

    for (const w of walkers) {
      w.z += w.dir * w.speed * dt;
      if (w.z < 0.85 || w.z > 8) {
        w.z = w.dir > 0 ? 0.86 : 7.9;
        dressWalker(w.el);
      }
      placeWalker(w);
    }

    // Keep nearer people and vehicles drawn on top of farther ones.
    sortTimer += dt;
    if (sortTimer > 0.4) {
      sortTimer = 0;
      walkers.sort((a, b) => b.z - a.z).forEach((w) => walkLayer.append(w.el));
      sortVehicles();
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
