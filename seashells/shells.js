// SeaShells Pro: every 3D shell, ear tip, case and glaze lives here.
// Shared by the launch page (main.js) and the options page (options.js).
import * as THREE from "three";
import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry.js";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

/* =========================================================
   Ceramic glaze, painted once on canvases
   ========================================================= */
function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let glaze = null;
export function ceramicMaps() {
  if (glaze) return glaze;
  const W = 1024, H = 512, R = seeded(44);
  const canvas = () => { const c = document.createElement("canvas"); c.width = W; c.height = H; return [c, c.getContext("2d")]; };
  // draw something 9 times so the texture tiles without seams
  const tiled = (fn, x, y) => { for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) fn(x + dx, y + dy); };

  // Colour: warm white glaze, soft mottling, faint growth lines, iron speckles
  const [colC, col] = canvas();
  col.fillStyle = "#fbfaf6";
  col.fillRect(0, 0, W, H);
  for (let i = 0; i < 220; i++) {
    const x = R() * W, y = R() * H, r = 30 + R() * 130, warm = R() < 0.55;
    tiled((px, py) => {
      const g = col.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, warm ? "rgba(222,208,188,0.11)" : "rgba(255,255,255,0.4)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      col.fillStyle = g;
      col.fillRect(px - r, py - r, 2 * r, 2 * r);
    }, x, y);
  }
  const lines = [];
  for (let x = 0; x < W; x += 3 + R() * 9) lines.push([x, 0.5 + R() * 1.0, 0.012 + R() * 0.035]);
  lines.forEach(([x, w, a]) => { col.fillStyle = `rgba(160,148,132,${a})`; col.fillRect(x, 0, w, H); });
  const specks = [];
  for (let i = 0; i < 420; i++) specks.push([R() * W, R() * H, 0.3 + R() ** 4 * 1.1, 0.1 + R() * 0.3]);
  specks.forEach(([x, y, r, a]) => tiled((px, py) => {
    col.fillStyle = `rgba(92,72,56,${a})`;
    col.beginPath(); col.arc(px, py, r, 0, Math.PI * 2); col.fill();
  }, x, y));

  // Bump: orange-peel glaze surface, growth lines as shallow grooves, speckles as pits
  const [bumpC, bump] = canvas();
  const noiseC = document.createElement("canvas");
  noiseC.width = 256; noiseC.height = 128;
  const nctx = noiseC.getContext("2d");
  const img = nctx.createImageData(256, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (R() - 0.5) * 34;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  nctx.putImageData(img, 0, 0);
  bump.imageSmoothingEnabled = true;
  bump.drawImage(noiseC, 0, 0, W, H);
  lines.forEach(([x, w, a]) => { bump.fillStyle = `rgba(0,0,0,${a * 2.2})`; bump.fillRect(x, 0, w + 0.6, H); });
  specks.forEach(([x, y, r]) => { bump.fillStyle = "rgba(0,0,0,0.35)"; bump.beginPath(); bump.arc(x, y, r, 0, Math.PI * 2); bump.fill(); });

  // Roughness (green channel): glossy glaze, a little satin where it's thin
  const [roughC, rough] = canvas();
  rough.fillStyle = "rgb(128,128,128)";
  rough.fillRect(0, 0, W, H);
  for (let i = 0; i < 160; i++) {
    const x = R() * W, y = R() * H, r = 40 + R() * 140, up = R() < 0.5;
    tiled((px, py) => {
      const g = rough.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, up ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)");
      g.addColorStop(1, "rgba(128,128,128,0)");
      rough.fillStyle = g;
      rough.fillRect(px - r, py - r, 2 * r, 2 * r);
    }, x, y);
  }
  lines.forEach(([x, w, a]) => { rough.fillStyle = `rgba(255,255,255,${a * 1.5})`; rough.fillRect(x, 0, w, H); });

  const tex = (c, srgb) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(6, 2);
    t.anisotropy = 8;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  glaze = { map: tex(colC, true), bump: tex(bumpC), rough: tex(roughC) };
  return glaze;
}

// roughness here multiplies the roughness map (mid-grey = 0.5)
export const FINISH = {
  gloss:  { color: 0xffffff, roughness: 0.32, clearcoat: 1, ccr: 0.03, bump: 0.12 },
  satin:  { color: 0xfcfbf8, roughness: 0.8, clearcoat: 0.35, ccr: 0.25, bump: 0.3 },
  bisque: { color: 0xf7f5f1, roughness: 1.6, clearcoat: 0, ccr: 1, bump: 0.6 },
};

export function ceramicMaterial(finish = "gloss", side = THREE.FrontSide) {
  const m = ceramicMaps(), f = FINISH[finish];
  return new THREE.MeshPhysicalMaterial({
    color: f.color, map: m.map, bumpMap: m.bump, bumpScale: f.bump,
    roughnessMap: m.rough, roughness: f.roughness,
    clearcoat: f.clearcoat, clearcoatRoughness: f.ccr,
    sheen: 0.12, sheenColor: 0xfff4ea, sheenRoughness: 0.5,
    specularIntensity: 0.6, ior: 1.52, vertexColors: true, side,
  });
}

export function nacreMaterial(side = THREE.FrontSide) {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffe6dc, roughness: 0.14, iridescence: 1, iridescenceIOR: 1.8,
    iridescenceThicknessRange: [200, 800], clearcoat: 0.6, side,
    polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
  });
}

// Vertex colours: where glaze pools it reads a touch darker and warmer
function paint(geo, shadeAt) {
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  const colors = new Float32Array(pos.count * 3);
  const p = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    const k = shadeAt ? shadeAt(p, uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0) : 0;
    colors[i * 3] = 1 - 0.15 * k;
    colors[i * 3 + 1] = 1 - 0.17 * k;
    colors[i * 3 + 2] = 1 - 0.21 * k;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

/* =========================================================
   Spiral shells (after Paul Bourke's seashell surface)
   grow = size gain per turn, rise = spire height, tube = coil fatness
   ========================================================= */
export const SPECIES = {
  conch:    { turns: 5.0, grow: 2.0, rise: 2.1, tube: 0.85, flare: 0.6, knobs: 0.25, cords: 0.02 },
  turban:   { turns: 4.3, grow: 2.45, rise: 0.85, tube: 1.0, flare: 0.04, knobs: 0, cords: 0.006, cordsN: 26 },
  tower:    { turns: 8.0, grow: 1.45, rise: 2.4, tube: 0.6, flare: 0.1, knobs: 0.06, cords: 0.03 },
  knobby:   { turns: 4.2, grow: 2.3, rise: 1.2, tube: 1.0, flare: 0.3, knobs: 0.4, cords: 0.015 },
  nautilus: { turns: 3.0, grow: 2.5, rise: 0, tube: 0.72, flare: 0.12, knobs: 0, cords: 0.004, annul: 0.025, annulN: 9 },
  ammonite: { turns: 4.5, grow: 1.7, rise: 0, tube: 0.4, flare: 0, knobs: 0, cords: 0, annul: 0.12, annulN: 22 },
  murex:    { turns: 5.0, grow: 2.1, rise: 1.7, tube: 0.75, flare: 0.12, knobs: 0, cords: 0.03, spikes: 0.8, varix: 5 },
};

export function shellPoint(o, u01, v01, target) {
  const T = o.turns * Math.PI * 2;
  const th = u01 * T;
  const G = Math.exp((Math.log(o.grow) / (Math.PI * 2)) * th);
  const s = v01 * Math.PI * 2;
  const lip = 1 + o.flare * smooth(T - Math.PI * 1.2, T, th);
  const shoulder = Math.max(0, Math.cos(s - 0.9)) ** 4;
  const knob = 1 + o.knobs * shoulder * (0.5 + 0.5 * Math.sin(th * 9)) * (1 - smooth(T - Math.PI, T, th));
  const cord = 1 + o.cords * Math.sin(s * (o.cordsN || 14));
  const ann = o.annul ? 1 + o.annul * (0.5 + 0.5 * Math.cos(th * o.annulN)) ** 6 : 1;
  const spike = o.spikes
    ? 1 + o.spikes * Math.max(0, Math.cos(s * 3 - 1.6)) ** 10 * Math.max(0, Math.cos(th * o.varix)) ** 8 * (1 - smooth(T - Math.PI * 0.8, T, th))
    : 1;
  const r = o.tube * G * lip * knob * cord * ann * spike;
  const rad = G + r * Math.cos(s);
  target.set(rad * Math.cos(th), -o.rise * G + r * 1.15 * Math.sin(s), rad * Math.sin(th));
}

const geoCache = new Map();
export function shellGeometry(kind, size = 2.4) {
  const key = `${kind}:${size}`;
  if (geoCache.has(key)) return geoCache.get(key);
  const o = SPECIES[kind];
  const geo = new ParametricGeometry((u, v, t) => shellPoint(o, u, v, t), 280, 72);
  geo.computeBoundingBox();
  const c = geo.boundingBox.getCenter(new THREE.Vector3());
  const dim = geo.boundingBox.getSize(new THREE.Vector3());
  const s = size / Math.max(dim.x, dim.y, dim.z);
  geo.translate(-c.x, -c.y, -c.z);
  geo.scale(s, s, s);

  // glaze pools between the coils and in the grooves
  paint(geo, (p, u, v) => {
    const a = v * Math.PI * 2;
    const suture = smooth(-0.1, -0.85, Math.cos(a));
    const groove = o.cords > 0.004 ? Math.max(0, -Math.sin(a * (o.cordsN || 14))) * Math.min(0.3, o.cords * 12) : 0;
    const ring = o.annul ? (1 - (0.5 + 0.5 * Math.cos(u * o.turns * Math.PI * 2 * o.annulN)) ** 2) * 0.4 : 0;
    return Math.min(1, suture + groove + ring);
  });

  // Where the opening is, and which way it faces: that's where the ear tip goes
  const ring = [], prev = [], p = new THREE.Vector3();
  for (let i = 0; i < 32; i++) {
    shellPoint(o, 1, i / 32, p); ring.push(p.clone().sub(c).multiplyScalar(s));
    shellPoint(o, 0.985, i / 32, p); prev.push(p.clone().sub(c).multiplyScalar(s));
  }
  const avg = pts => pts.reduce((a, b) => a.add(b), new THREE.Vector3()).multiplyScalar(1 / pts.length);
  const mouth = avg(ring);
  const facing = mouth.clone().sub(avg(prev)).normalize();
  const radius = ring.reduce((a, q) => a + q.distanceTo(mouth), 0) / ring.length;
  const out = { geo, mouth, facing, radius, centre: c, scale: s };
  geoCache.set(key, out);
  return out;
}

/* ---------- Ear tip: a real silicone tip on a short ceramic stem ---------- */
let grilleTex = null;
function grilleTexture() {
  if (grilleTex) return grilleTex;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#b4b4b9";
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#6e6e73";
  for (let y = 0; y < 256; y += 9) for (let x = (y / 9) % 2 ? 4.5 : 0; x < 256; x += 9) {
    g.beginPath(); g.arc(x, y, 2.1, 0, Math.PI * 2); g.fill();
  }
  grilleTex = new THREE.CanvasTexture(c);
  grilleTex.colorSpace = THREE.SRGBColorSpace;
  grilleTex.anisotropy = 8;
  return grilleTex;
}

const silicone = () => new THREE.MeshPhysicalMaterial({
  color: 0xeeeef1, roughness: 0.5, sheen: 1, sheenColor: 0xffffff, sheenRoughness: 0.35,
  clearcoat: 0.15, clearcoatRoughness: 0.5, side: THREE.DoubleSide,
});

// profile in units of the tip radius: x = distance from the axis, y = height
const TIP_PROFILE = [
  [0.4, 0.28], [0.8, 0.24], [0.93, 0.13], [0.99, 0.08], [1.03, 0.15], [1.02, 0.34],
  [0.93, 0.57], [0.74, 0.79], [0.5, 0.9], [0.31, 0.92], [0.27, 0.86], [0.27, 0.58],
];

export function makeEarTip(R) {
  const g = new THREE.Group();
  const stem = new THREE.Mesh(paint(new THREE.CylinderGeometry(R * 0.4, R * 0.46, R * 0.5, 48)), ceramicMaterial("satin"));
  stem.position.y = R * 0.1;
  const curve = new THREE.SplineCurve(TIP_PROFILE.map(([x, y]) => new THREE.Vector2(x * R, y * R)));
  const tip = new THREE.Mesh(new THREE.LatheGeometry(curve.getPoints(90), 96), silicone());
  tip.position.y = R * 0.2;
  const grille = new THREE.Mesh(
    new THREE.CircleGeometry(R * 0.27, 48),
    new THREE.MeshStandardMaterial({ map: grilleTexture(), roughness: 0.6, metalness: 0.3 }),
  );
  grille.rotation.x = -Math.PI / 2;
  grille.position.y = R * 0.2 + R * 0.62;
  g.add(stem, tip, grille);
  return g; // points along +y
}
function aim(obj, dir) { obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()); }

/* ---------- The face plate: a glazed "cat's eye" that seals the opening ---------- */
// Turban snails really do close their shell with a smooth domed lid called an operculum.
function apertureRing(o, c, s, n = 72) {
  const raw = [], p = new THREE.Vector3();
  for (let i = 0; i < n; i++) { shellPoint(o, 1, i / n, p); raw.push(p.clone().sub(c).multiplyScalar(s)); }
  // average away the ridges so the rim is one clean curve
  const k = 4;
  return raw.map((_, i) => {
    const acc = new THREE.Vector3();
    for (let j = -k; j <= k; j++) acc.add(raw[(i + j + n) % n]);
    return acc.multiplyScalar(1 / (2 * k + 1));
  });
}
function ringNormal(pts) {
  const nrm = new THREE.Vector3();
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    nrm.x += (a.y - b.y) * (a.z + b.z);
    nrm.y += (a.z - b.z) * (a.x + b.x);
    nrm.z += (a.x - b.x) * (a.y + b.y);
  }
  return nrm.normalize();
}

function makeFacePlate(ring, centre, normal, radius) {
  const rings = 18, N = ring.length, pos = [], uv = [], idx = [];
  const e1 = ring[0].clone().sub(centre).normalize(), e2 = normal.clone().cross(e1).normalize();
  for (let k = 0; k <= rings; k++) {
    const q = 1 - k / rings;                        // 1 at the rim, 0 at the centre
    for (let i = 0; i < N; i++) {
      const p = centre.clone().addScaledVector(ring[i].clone().sub(centre), q * 0.94)
        .addScaledVector(normal, radius * (0.07 * (1 - q * q) - 0.05));
      pos.push(p.x, p.y, p.z);
      const d = p.clone().sub(centre);
      uv.push(0.5 + d.dot(e1) / (radius * 4), 0.5 + d.dot(e2) / (radius * 4));
    }
  }
  for (let k = 0; k < rings; k++) for (let i = 0; i < N; i++) {
    const a = k * N + i, b = k * N + (i + 1) % N, c = (k + 1) * N + i, d = (k + 1) * N + (i + 1) % N;
    idx.push(a, b, d, a, d, c);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  paint(geo);
  return geo;
}

export function makeShell({ kind = "turban", finish = "gloss", size = 2.4 } = {}) {
  if (kind === "turban") return makeTurban({ finish, size });
  const { geo, mouth, facing, radius } = shellGeometry(kind, size);
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, ceramicMaterial(finish, THREE.BackSide)), new THREE.Mesh(geo, nacreMaterial(THREE.FrontSide)));
  const tip = makeEarTip(radius * 0.32);
  aim(tip, facing);
  tip.position.copy(mouth).addScaledVector(facing, radius * 0.05);
  g.add(tip);
  return g;
}

/* ---------- The launch model: a sculpted turban ---------- */
// One smooth turned form with the spiral seam cut in, a flat oval facet on the side,
// a mother-of-pearl inlay in the facet, and the ear tip coming out of the inlay.
const TURBAN_PROFILE = [
  [0.0, 1.02], [0.1, 0.99], [0.27, 0.9], [0.46, 0.76], [0.65, 0.58], [0.83, 0.38],
  [0.96, 0.18], [1.03, -0.04], [1.01, -0.27], [0.9, -0.47], [0.7, -0.61], [0.42, -0.69], [0.0, -0.71],
];
const TURNS = 4.2;

function turbanGeometry() {
  const curve = new THREE.SplineCurve(TURBAN_PROFILE.map(([x, y]) => new THREE.Vector2(x, y)));
  // listed base first, so the lathe's faces point outwards (top first turns it inside out)
  const pts = curve.getPoints(220).reverse();
  pts[0].x = 0; pts[pts.length - 1].x = 0;
  const geo = new THREE.LatheGeometry(pts, 220);
  const pos = geo.attributes.position, v = new THREE.Vector3();
  const yMax = 1.02, yMin = -0.71;
  const shade = new Float32Array(pos.count);
  // facet: a flat oval on the side, facing forward and a little down (towards the ear canal)
  // near one end of the oval, angled outwards towards the ear canal (the mirrored shell flips it)
  const n0 = new THREE.Vector3(0.42, -0.1, 1).normalize();
  const p0 = new THREE.Vector3(0.5, -0.05, 0.33);
  const facetR = 0.24;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const r = Math.hypot(v.x, v.z);
    if (r < 1e-5) { pos.setY(i, v.y * 0.64); continue; } // apex and base centre: same squash as the rest
    const phi = Math.atan2(v.x, v.z);                       // 0 faces +z
    const t = clamp((yMax - v.y) / (yMax - yMin));
    const whorl = (Math.log(1 + t * 9) / Math.log(10)) * TURNS;
    const h = whorl + phi / (Math.PI * 2);
    const f = h - Math.floor(h);
    const seamFade = 1 - smooth(0.62, 0.8, t);              // the seam stops on the body whorl
    const seam = (Math.exp(-((f / 0.045) ** 2)) + Math.exp(-(((1 - f) / 0.045) ** 2))) * seamFade;
    const bulge = Math.sin(Math.PI * f) * seamFade;
    const k = 1 - 0.05 * seam + 0.025 * bulge;
    v.x *= k; v.z *= k;
    v.y -= 0.02 * seam;
    // earbud proportions: an oval seen from the front, and thin front to back
    v.x *= 0.9; v.y *= 0.64; v.z *= 0.44;
    // flatten the facet
    const d = v.clone().sub(p0).dot(n0);
    const along = v.clone().sub(p0).addScaledVector(n0, -d);
    const blend = 1 - smooth(facetR * 0.9, facetR * 1.15, along.length());
    if (d > 0) v.addScaledVector(n0, -d * blend);
    pos.setXYZ(i, v.x, v.y, v.z);
    shade[i] = seam * 0.9;
  }
  geo.computeVertexNormals();
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    colors[i * 3] = 1 - 0.16 * shade[i]; colors[i * 3 + 1] = 1 - 0.18 * shade[i]; colors[i * 3 + 2] = 1 - 0.22 * shade[i];
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return { geo, n0, p0, facetR };
}

let turbanCache = null;
export function makeTurban({ finish = "gloss", size = 2.4 } = {}) {
  turbanCache ??= turbanGeometry();
  const { geo, n0, p0, facetR } = turbanCache;
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, ceramicMaterial(finish)));

  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n0);
  const pearl = new THREE.MeshPhysicalMaterial({
    color: 0xfffaf6, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.03, emissive: 0x2a2624,
    iridescence: 0.75, iridescenceIOR: 1.5, iridescenceThicknessRange: [260, 680],
  });
  const inlay = new THREE.Mesh(new THREE.CircleGeometry(facetR * 0.9, 96), pearl);
  inlay.quaternion.copy(q);
  inlay.position.copy(p0).addScaledVector(n0, 0.004);
  const bezel = new THREE.Mesh(
    new THREE.TorusGeometry(facetR * 0.9, 0.007, 12, 128),
    new THREE.MeshStandardMaterial({ color: 0xc8c4bd, roughness: 0.5 }),
  );
  bezel.quaternion.copy(q);
  bezel.position.copy(inlay.position);
  const tip = makeEarTip(0.34);
  aim(tip, n0.clone().add(new THREE.Vector3(0.12, 0, 0)).normalize());
  tip.position.copy(p0).addScaledVector(n0, 0.0);
  g.add(inlay, bezel, tip);
  g.scale.setScalar(size / 2.4 * 1.35);
  const outer = new THREE.Group();
  outer.add(g);
  return outer;
}

/* =========================================================
   Clam halves: the magnetic case, and the Pearl option
   ========================================================= */
export function clamHalf(top, { w = 2.4, d = 1.6, hTop = 0.55, hBot = 0.7, ribs = 18 } = {}) {
  const geo = new THREE.SphereGeometry(1, 128, 40, 0, Math.PI * 2, top ? 0 : Math.PI / 2, Math.PI / 2);
  const pos = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const a = Math.atan2(v.z, v.x);
    const fl = 1 + 0.05 * Math.cos(a * ribs) * Math.min(1, Math.abs(v.y) * 3);
    pos.setXYZ(i, v.x * w * fl, v.y * (top ? hTop : hBot), v.z * d * fl);
  }
  geo.computeVertexNormals();
  paint(geo, p => {
    const a = Math.atan2(p.z / d, p.x / w);
    return Math.max(0, -Math.cos(a * ribs)) * 0.45;
  });
  return new THREE.Mesh(geo, ceramicMaterial("gloss", THREE.DoubleSide));
}

export function makeClamCase() {
  const cradle = new THREE.MeshStandardMaterial({ color: 0xe6e3de, roughness: 0.85 });
  const caseG = new THREE.Group();
  caseG.add(clamHalf(false));
  const floor = new THREE.Mesh(new THREE.CircleGeometry(1, 64), cradle);
  floor.rotation.x = -Math.PI / 2;
  floor.scale.set(2.3, 1.5, 1);
  floor.position.y = 0.002;
  caseG.add(floor);
  const hinge = new THREE.Group();
  hinge.position.set(0, 0, -1.6);
  const lid = clamHalf(true);
  lid.position.z = 1.6;
  hinge.add(lid);
  caseG.add(hinge);
  const magnet = new THREE.Mesh(new THREE.CircleGeometry(0.09, 24), new THREE.MeshStandardMaterial({ color: 0xc9c6c0, metalness: 0.8, roughness: 0.3 }));
  magnet.position.set(0, 0.004, 1.42);
  magnet.rotation.x = -Math.PI / 2;
  caseG.add(magnet);
  caseG.userData.hinge = hinge;
  return caseG;
}

/* =========================================================
   The other earbud options
   ========================================================= */
function makeCowrie() {
  const geo = new THREE.SphereGeometry(1, 128, 96);
  const pos = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    let { x, y, z } = v;
    if (y < 0) y *= 0.5;                                     // flat underside
    const slit = Math.exp(-((z / 0.14) ** 2)) * (y < 0 ? 1 : 0); // the long opening
    const teeth = slit * 0.04 * Math.sin(x * 46);
    pos.setXYZ(i, x * 1.3, y * 0.75 + slit * 0.3 + teeth, z * 0.88);
  }
  geo.computeVertexNormals();
  paint(geo, p => (p.y < -0.05 ? Math.exp(-((p.z / 0.12) ** 2)) * 1.6 : 0));
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, ceramicMaterial("gloss")));
  const slit = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 2.1, 8, 24), new THREE.MeshStandardMaterial({ color: 0x4a403a, roughness: 0.6 }));
  slit.rotation.z = Math.PI / 2;
  slit.scale.set(1, 1, 0.5);
  slit.position.set(0, -0.11, 0);
  g.add(slit);
  const toothMat = ceramicMaterial("gloss");
  for (let i = 0; i < 18; i++) {
    const tooth = new THREE.Mesh(paint(new THREE.BoxGeometry(0.04, 0.1, 0.32)), toothMat);
    tooth.position.set(-1.0 + i * 0.118, -0.17, 0);
    g.add(tooth);
  }
  const tip = makeEarTip(0.3);
  aim(tip, new THREE.Vector3(0, -1, 0));
  tip.position.set(0.35, -0.3, 0.02);
  g.add(tip);
  g.rotation.x = -1.05;
  return g;
}

function makeScallopBud() {
  const g = new THREE.Group();
  const bodyGeo = paint(new THREE.SphereGeometry(0.8, 64, 48));
  const body = new THREE.Mesh(bodyGeo, ceramicMaterial("satin"));
  body.scale.set(1, 1, 0.6);
  g.add(body);
  // the fan: a wedge of a fluted dome, hinge at the bottom
  const span = 2.0;
  const fanGeo = new THREE.SphereGeometry(1, 128, 32, -span / 2 - Math.PI / 2, span, 0, Math.PI / 2);
  const pos = fanGeo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const a = Math.atan2(v.z, v.x);
    const fl = 1 + 0.07 * Math.cos(a * 15) * Math.min(1, (1 - v.y) * 4);
    pos.setXYZ(i, v.x * 1.25 * fl, v.y * 0.28, v.z * 1.25 * fl);
  }
  fanGeo.computeVertexNormals();
  paint(fanGeo, p => Math.max(0, -Math.cos(Math.atan2(p.z, p.x) * 15)) * 0.5);
  const fan = new THREE.Mesh(fanGeo, ceramicMaterial("gloss", THREE.DoubleSide));
  fan.rotation.x = Math.PI / 2;
  fan.position.set(0, -0.62, 0.5);
  g.add(fan);
  const earL = new THREE.Mesh(paint(new THREE.BoxGeometry(0.38, 0.22, 0.08)), ceramicMaterial("gloss"));
  earL.position.set(-0.24, -0.6, 0.55);
  const earR = earL.clone();
  earR.position.x = 0.24;
  g.add(earL, earR);
  const tip = makeEarTip(0.3);
  aim(tip, new THREE.Vector3(0.3, 0.1, -1));
  tip.position.set(0.12, 0.05, -0.5);
  g.add(tip);
  g.rotation.y = -0.3;
  return g;
}

function makeAbalone() {
  const geo = new THREE.SphereGeometry(1, 128, 64, 0, Math.PI * 2, 0, Math.PI / 2);
  const pos = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    pos.setXYZ(i, v.x * 1.35 - v.y * 0.55, v.y * 0.5, v.z * 0.95);
  }
  geo.computeVertexNormals();
  const spire = new THREE.Vector2(-0.95, 0.15);
  paint(geo, p => {
    const d = Math.hypot(p.x - spire.x, p.z - spire.y);
    return (0.5 + 0.5 * Math.cos(d * 38)) ** 4 * 0.45;
  });
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, ceramicMaterial("gloss", THREE.FrontSide)), new THREE.Mesh(geo, nacreMaterial(THREE.BackSide)));
  // the row of breathing holes
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x3a3532 });
  for (let i = 0; i < 6; i++) {
    const a = -0.2 + i * 0.32;
    const ex = Math.cos(a) * 0.78, ez = Math.sin(a) * 0.78;
    const y = Math.sqrt(Math.max(0, 1 - ex * ex - ez * ez));
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.06 + i * 0.008, 20), holeMat);
    hole.position.set(ex * 1.35 - y * 0.55, y * 0.5 + 0.004, ez * 0.95);
    hole.lookAt(hole.position.clone().add(new THREE.Vector3(ex / 1.35, y / 0.5, ez / 0.95).normalize()));
    g.add(hole);
  }
  const tip = makeEarTip(0.3);
  aim(tip, new THREE.Vector3(0, -1, 0.25));
  tip.position.set(-0.1, -0.08, 0.05);
  g.add(tip);
  g.rotation.x = 0.85;
  return g;
}

function makePearl() {
  const g = new THREE.Group();
  const size = { w: 1.25, d: 0.95, hTop: 0.3, hBot: 0.38, ribs: 16 };
  g.add(clamHalf(false, size));
  const hinge = new THREE.Group();
  hinge.position.z = -0.95;
  const lid = clamHalf(true, size);
  lid.position.z = 0.95;
  hinge.add(lid);
  hinge.rotation.x = -0.85;
  g.add(hinge);
  const tip = makeEarTip(0.34);
  aim(tip, new THREE.Vector3(0, 0.75, 1));
  tip.position.set(0, 0.16, 0.12);
  g.add(tip);
  g.rotation.x = 0.25;
  return g;
}

function standUp(shell) {
  const g = new THREE.Group();
  shell.rotation.x = Math.PI / 2 - 0.25;
  g.add(shell);
  return g;
}

// Centre an object and scale it to a common size
export function fit(obj, size = 2.4) {
  const holder = new THREE.Group();
  holder.add(obj);
  holder.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  const c = box.getCenter(new THREE.Vector3()), d = box.getSize(new THREE.Vector3());
  const s = size / Math.max(d.x, d.y, d.z);
  obj.position.sub(c);
  holder.scale.setScalar(s);
  return holder;
}

export const OPTIONS = [
  { id: "turban", name: "Turban", line: "The launch model. Low and round, with a glazed lid where the snail used to be.", build: () => makeShell({ kind: "turban" }) },
  { id: "conch", name: "Conch", line: "Knobbed spire, flared lip. Louder-looking, same ocean.", build: () => makeShell({ kind: "conch" }) },
  { id: "auger", name: "Auger", line: "Eight tight turns that point backwards, away from your face.", build: () => makeShell({ kind: "tower" }) },
  { id: "nautilus", name: "Nautilus", line: "One perfect spiral. The ocean, chambered.", build: () => standUp(makeShell({ kind: "nautilus" })) },
  { id: "ammonite", name: "Ammonite", line: "The fossil edition. The hiss is 200 million years old too.", build: () => standUp(makeShell({ kind: "ammonite", finish: "satin" })) },
  { id: "murex", name: "Murex", line: "Spikes included. Hard to lose, harder to wear.", build: () => makeShell({ kind: "murex" }) },
  { id: "cowrie", name: "Cowrie", line: "Glazed like porcelain. The ear tip comes out of the slit.", build: makeCowrie },
  { id: "abalone", name: "Ear Shell", line: "Abalone are literally called ear shells. Nature named it first.", build: makeAbalone },
  { id: "scallop", name: "Scallop", line: "A round bud with a fluted scallop face. The safe choice.", build: makeScallopBud },
  { id: "pearl", name: "Pearl", line: "A tiny clam, half open. The ear tip is the pearl.", build: makePearl },
];

// Product-photo lighting: a grey sweep with big softboxes and strip lights
export function studioEnvironment(renderer) {
  const scene = new THREE.Scene();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(50, 64, 32), new THREE.ShaderMaterial({
    side: THREE.BackSide,
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: "varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(vec3(0.66), vec3(1.0), pow(h, 0.8)) : mix(vec3(0.66), vec3(0.3), pow(-h, 0.6)); gl_FragColor = vec4(c, 1.0); }",
  }));
  scene.add(dome);
  const panel = (w, h, power, x, y, z) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(power, power, power), side: THREE.DoubleSide }));
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    scene.add(m);
  };
  panel(16, 11, 5, -9, 15, 12);    // key softbox, top front left
  panel(3, 30, 3.6, -20, 2, 3);    // left strip
  panel(3, 30, 2.6, 20, 1, -3);    // right strip
  panel(24, 4, 2.2, 0, 7, -20);    // back rim
  panel(12, 6, 1.1, 4, -12, 10);   // white card bounce from below
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(scene, 0.03).texture;
  pm.dispose();
  return tex;
}

export function softShadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, "rgba(0,0,0,0.42)");
  grd.addColorStop(0.5, "rgba(0,0,0,0.12)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}
