import * as THREE from "three";
import { makeShell, makeClamCase, softShadowTexture, studioEnvironment } from "./shells.js";

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

/* =========================================================
   3D story
   ========================================================= */
const story = document.querySelector(".story");
const canvas = document.getElementById("scene");
const beats = [...document.querySelectorAll(".beat")];
const progressBar = document.querySelector(".progress span");

let scrollTarget = 0;
let scrollNow = 0;

function storyProgress() {
  const r = story.getBoundingClientRect();
  const total = r.height - innerHeight;
  return clamp(-r.top / total);
}

function updateBeats(p) {
  beats.forEach((el, i) => {
    const from = +el.dataset.from, to = +el.dataset.to;
    const fadeIn = i === 0 ? 1 : smooth(from, from + 0.035, p);
    const fadeOut = 1 - smooth(to - 0.035, to, p);
    const o = Math.min(fadeIn, fadeOut);
    el.style.opacity = o.toFixed(3);
    el.style.transform = `translate(-50%, ${((1 - o) * 24).toFixed(1)}px)`;
  });
  progressBar.style.transform = `scaleX(${p.toFixed(4)})`;
}

const NOISE_VERT = /* glsl */`
  uniform float uTime;
  uniform float uAmount;
  uniform float uSize;
  attribute float aSeed;
  varying float vAlpha;
  varying float vSeed;
  float hash(float n) { return fract(sin(n) * 43758.5453); }
  void main() {
    vSeed = aSeed;
    // re-roll a jitter every frame-ish: static, not smoke
    float tick = floor(uTime * 24.0);
    vec3 j = vec3(hash(aSeed + tick), hash(aSeed * 1.7 + tick), hash(aSeed * 2.3 + tick)) - 0.5;
    vec3 p = position * (0.55 + 0.45 * uAmount) + j * 0.09 * uAmount;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float flicker = step(0.35, hash(aSeed * 3.1 + tick));
    vAlpha = uAmount * flicker;
    gl_PointSize = uSize * (0.6 + hash(aSeed * 5.0)) * (10.0 / -mv.z);
  }
`;
const NOISE_FRAG = /* glsl */`
  varying float vAlpha;
  varying float vSeed;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    vec3 foam = vec3(0.56, 0.94, 0.89);
    vec3 lilac = vec3(0.73, 0.66, 1.0);
    vec3 shell = vec3(1.0, 0.78, 0.68);
    float k = fract(vSeed * 0.137);
    vec3 col = k < 0.5 ? mix(foam, lilac, k * 2.0) : mix(lilac, shell, (k - 0.5) * 2.0);
    gl_FragColor = vec4(col, (1.0 - d * 2.0) * vAlpha * 0.9);
  }
`;

function makeNoiseCloud(count, rMin, rMax, size) {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2;
    const r = rMin + (rMax - rMin) * Math.pow(Math.random(), 1.8);
    const s = Math.sqrt(1 - u * u);
    pos[i * 3] = r * s * Math.cos(th);
    pos[i * 3 + 1] = r * u;
    pos[i * 3 + 2] = r * s * Math.sin(th);
    seed[i] = Math.random() * 1000;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  const m = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uAmount: { value: 0 }, uSize: { value: size } },
    vertexShader: NOISE_VERT, fragmentShader: NOISE_FRAG,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(g, m);
  pts.frustumCulled = false;
  return pts;
}

function initScene() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.environment = studioEnvironment(renderer);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
  camera.position.set(0, 0, 9);

  const key = new THREE.DirectionalLight(0xffffff, 0.8);
  key.position.set(3, 4, 6);
  const rim = new THREE.DirectionalLight(0x8ff0e4, 1.6);
  rim.position.set(-6, 2, -4);
  const rim2 = new THREE.DirectionalLight(0xffc6ad, 1.0);
  rim2.position.set(6, -2, -4);
  scene.add(key, rim, rim2);

  const world = new THREE.Group();
  scene.add(world);

  // The hero pair: one left-handed, one right-handed (very rare in nature, standard here)
  const left = makeShell();
  const leftCloud = makeNoiseCloud(5200, 1.2, 3.6, 2.4);
  left.add(leftCloud);
  world.add(left);

  const right = makeShell();
  right.scale.x = -1;
  const rightCloud = makeNoiseCloud(1400, 1.2, 2.6, 2.0);
  right.add(rightCloud);
  world.add(right);

  // Every other earbud on Earth, now running SeaShells Mode
  // every earbud on Earth, all the same turban, in different white glazes
  const crowdSpec = [
    ["turban", "satin"], ["turban", "gloss"], ["turban", "bisque"], ["turban", "satin"],
    ["turban", "bisque"], ["turban", "gloss"], ["turban", "satin"], ["turban", "gloss"],
  ];
  const crowd = crowdSpec.map(([kind, finish], i) => {
    const b = makeShell({ kind, finish, size: 2.0 });
    const cloud = makeNoiseCloud(1000, 1.1, 2.3, 2.2);
    b.add(cloud);
    const a = (i / crowdSpec.length) * Math.PI * 2 + 0.3;
    b.userData = { a, cloud, spin: 0.4 + Math.random() * 0.6, bob: Math.random() * 6 };
    b.scale.setScalar(0.62);
    world.add(b);
    return b;
  });

  const clam = makeClamCase();
  clam.visible = false;
  scene.add(clam);

  // The whole world hisses
  const field = makeNoiseCloud(9000, 6, 26, 3.2);
  scene.add(field);

  const clouds = [leftCloud, rightCloud, field, ...crowd.map(b => b.userData.cloud)];

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener("pointermove", e => {
    mouse.tx = (e.clientX / innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize);
  resize();

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(story);

  const clock = new THREE.Clock();
  const narrow = () => innerWidth < 760;
  const qFree = new THREE.Quaternion(), qDock = new THREE.Quaternion(), eul = new THREE.Euler();
  const freePos = new THREE.Vector3(), dockPos = new THREE.Vector3();

  function place(obj, x, y, z, rx, ry, rz, s, mirror, dock, dx, dockRz) {
    freePos.set(x, y, z);
    dockPos.set(dx * 0.78, 0.2, 0.1);
    obj.position.lerpVectors(freePos, dockPos, dock);
    qFree.setFromEuler(eul.set(rx, ry, rz));
    qDock.setFromEuler(eul.set(0.12, dockRz * 0.3, 0));   // resting flat, spiral up, turned slightly inwards
    obj.quaternion.slerpQuaternions(qFree, qDock, dock);
    const sc = lerp(s, 0.42, dock);
    obj.scale.set(mirror ? -sc : sc, sc, sc);
  }

  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.1);
    scrollTarget = storyProgress();
    scrollNow = lerp(scrollNow, scrollTarget, reduceMotion ? 1 : 1 - Math.exp(-dt * 7));
    const p = scrollNow;
    updateBeats(p);
    if (!visible) return;

    const t = clock.elapsedTime;
    const idle = reduceMotion ? 0 : t;
    mouse.x = lerp(mouse.x, mouse.tx, 0.05);
    mouse.y = lerp(mouse.y, mouse.ty, 0.05);
    clouds.forEach(c => { c.material.uniforms.uTime.value = reduceMotion ? 0 : t; });

    const fit = narrow() ? 1.45 : 1;
    const gap = narrow() ? 1.2 : 1.9;
    const budSize = narrow() ? 0.72 : 1;

    const rise = smooth(0.07, 0.165, p);      // hero shell rises from under the title
    const hiss = smooth(0.13, 0.24, p);       // the ocean starts, left ear only
    const split = smooth(0.29, 0.4, p);       // the right shell arrives
    const crowdIn = smooth(0.45, 0.58, p);    // every earbud on Earth
    const fieldIn = smooth(0.6, 0.72, p) * (1 - smooth(0.78, 0.86, p));
    const crowdOut = smooth(0.78, 0.86, p);
    const dock = smooth(0.82, 0.92, p);       // into the clam case
    const caseIn = smooth(0.78, 0.86, p);
    const lidShut = smooth(0.93, 0.985, p);
    const lift = smooth(0.42, 0.5, p) * (1 - smooth(0.6, 0.68, p));   // the SeaShells Mode beat has tall text: hold the shells above it

    const lx = lerp(0, -gap, split) * (1 - crowdIn * 0.5);
    const stand = 1 - smooth(0.24, 0.36, p);
    // standing up it's taller: once risen it sits a little higher and smaller, clear of the words below
    const y0 = lerp(-0.75, lerp(0.55, 0.66, stand), rise);
    const s0 = lerp(0.74, 0.9, rise) * lerp(1, 0.86, crowdIn) * budSize * lerp(1, lerp(0.82, 0.7, rise), stand);
    // hero: the shell stands upright, ear tip on top, turning on its vertical axis like a product
    // on a turntable; it eases back to its resting tilt as the second shell arrives
    const spinL = -0.6 + p * 4.6 + idle * (0.15 + 0.25 * stand) + mouse.x * 0.2;
    const tiltX = lerp(0.3, 0.06, stand) + mouse.y * 0.08;
    const rollZ = lerp(0.32, Math.PI / 2, stand);
    place(left, lx, y0 + Math.sin(idle * 0.8) * 0.06, 0, tiltX, spinL, rollZ, s0, false, dock, -0.95, Math.PI / 2);
    place(right, lerp(9, gap, split) * (1 - crowdIn * 0.5), 0.3 + Math.sin(idle * 0.8 + 1.4) * 0.06, 0,
      tiltX, -spinL, -rollZ, s0, true, dock, 0.95, -Math.PI / 2);
    right.visible = split > 0.001;

    leftCloud.material.uniforms.uAmount.value = hiss * (0.85 + 0.15 * Math.sin(idle * 0.5)) * (1 - dock);
    rightCloud.material.uniforms.uAmount.value = fieldIn * 0.7 * (1 - dock);

    const ringR = 5.2 * (narrow() ? 0.82 : 1);
    crowd.forEach((b, i) => {
      const { a, cloud, spin, bob } = b.userData;
      const radius = (lerp(16, 5.2, crowdIn) + crowdOut * 16) * (narrow() ? 0.82 : 1);
      const away = radius - ringR;   // how far this shell still is from its place in the ring
      const orbit = a + p * 1.6 + idle * 0.04;
      // they arrive from above and behind, and leave the same way, so they never cross the words
      b.position.set(
        Math.cos(orbit) * radius,
        Math.sin(orbit * 1.3 + bob) * 1.1 + 0.2 + away * 0.25,
        Math.sin(orbit) * ringR * 0.55 - 2 - away * 0.8,
      );
      b.rotation.set(0.2, idle * spin + i, 0.3 * Math.sin(idle + i));
      b.visible = crowdIn > 0.001 && crowdOut < 0.999;
      cloud.material.uniforms.uAmount.value = smooth(0.5 + i * 0.012, 0.6 + i * 0.012, p) * (1 - crowdOut);
    });

    field.material.uniforms.uAmount.value = fieldIn * 0.65;
    field.rotation.y = idle * 0.02;

    clam.visible = caseIn > 0.001;
    clam.position.set(0, lerp(-4, -0.1, caseIn), 0);
    clam.scale.setScalar(lerp(0.5, 0.78, caseIn) * budSize);
    clam.rotation.y = lerp(0.5, 0, caseIn) + mouse.x * 0.08;
    clam.userData.hinge.rotation.x = lerp(-1.95, 0, lidShut);
    // the shells ride inside the case
    if (dock > 0) {
      [left, right].forEach(s => { s.position.multiplyScalar(budSize); s.position.y += clam.position.y * dock; });
    }

    const spin = smooth(0.6, 0.78, p) * 0.9 * (1 - caseIn);
    world.rotation.y = spin + mouse.x * 0.05;
    const wide = lerp(8.5, 10, split) + crowdIn * 6 + fieldIn * 5;
    camera.position.set(
      mouse.x * 0.25,
      lerp(mouse.y * -0.15 + fieldIn * 1.2, 4.6, caseIn) - lift * 0.95,
      lerp(wide, lerp(12.8, 11, lidShut), caseIn) * fit,   // step back while the lid is open, so it fits
    );
    camera.lookAt(0, lerp(lerp(0.1, -0.2, crowdIn) - fieldIn * 1.6, -0.3, caseIn) - lift * 0.95, 0);

    renderer.render(scene, camera);
  }
  frame();
}

/* ---------- Studio shot: the pair on a soft grey sweep ---------- */
function initStudio() {
  const el = document.getElementById("studio");
  if (!el) return;
  const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  scene.environment = studioEnvironment(renderer);
  const key = new THREE.DirectionalLight(0xfff6ee, 0.5);
  key.position.set(4, 6, 5);
  const cool = new THREE.DirectionalLight(0xdff7f3, 0.25);
  cool.position.set(-5, 2, 3);
  scene.add(key, cool);

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  camera.position.set(0, 1.4, 11);
  camera.lookAt(0, -0.1, 0);

  const pair = new THREE.Group();
  const shadowTex = softShadowTexture();
  const shells = [-1, 1].map(side => {
    const holder = new THREE.Group();
    const sh = makeShell();
    if (side > 0) sh.scale.x = -1;
    holder.add(sh);
    holder.position.x = side * 1.45;
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 1.3),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(side * 1.45, -1.22, 0.1);
    pair.add(holder, shadow);
    return { holder, side };
  });
  scene.add(pair);

  const mouse = { x: 0, tx: 0 };
  el.addEventListener("pointermove", e => {
    const r = el.getBoundingClientRect();
    mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
  });
  el.addEventListener("pointerleave", () => { mouse.tx = 0; });

  const resize = () => {
    const w = el.clientWidth, h = el.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 640 ? 15 : 11;
    camera.lookAt(0, -0.1, 0);   // no caption over this shot, so the pair stays centred
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(el);
  resize();

  let on = false;
  new IntersectionObserver(([e]) => { on = e.isIntersecting; }, { threshold: 0 }).observe(el);
  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    if (!on) return;
    const t = reduceMotion ? 0 : clock.getElapsedTime();
    mouse.x = lerp(mouse.x, mouse.tx, 0.06);
    shells.forEach(({ holder, side }) => {
      holder.rotation.set(0.42, side * -0.5 + Math.sin(t * 0.35) * 0.3 + mouse.x * 0.5, side * 0.06);
      holder.position.y = Math.sin(t * 0.8 + side) * 0.05;
    });
    renderer.render(scene, camera);
  })();
}

try {
  initStudio();
} catch (err) {
  console.warn("Studio shot unavailable", err);
}

try {
  initScene();
} catch (err) {
  console.warn("3D unavailable, showing the flat version", err);
  canvas.style.background = "radial-gradient(60% 50% at 50% 45%, rgba(143,240,228,.25), transparent), #000";
  const loop = () => { updateBeats(storyProgress()); requestAnimationFrame(loop); };
  loop();
}

/* =========================================================
   SeaShells Mode preview: a real Paris room, three listening modes
   ========================================================= */
const playBtn = document.getElementById("play");
const playLabel = document.getElementById("play-label");
const balance = document.getElementById("balance");
const balanceRead = document.getElementById("balance-read");
const intensity = document.getElementById("intensity");
const intensityRead = document.getElementById("intensity-read");
const squealBtn = document.getElementById("squeal");
const demoNote = document.getElementById("demo-note");
const consoleEl = document.querySelector(".console");
const meterL = document.getElementById("meter-l");
const meterR = document.getElementById("meter-r");
const modeBtns = [...document.querySelectorAll(".mode")];
const sealDialog = document.getElementById("seal-warning");

const audio = { ctx: null, playing: false, mode: "transparency", resting: false, timer: 0, sealOk: false, humHoldUntil: 0 };

// The hum: a band of the room's own rumble, between 50 and 150 Hz, that keeps gliding to a new spot.
// q sets how narrow it is; target is its level before the Ocean intensity slider.
const HUM = { lo: 50, hi: 150, q: 6, target: 0.05, move: [3, 5] };   // move: seconds per glide

const NC_LEVEL = 0.1;
// One volume for the whole demo. Every mode keeps its level relative to the others.
const DEMO_GAIN = 0.72;
const isOcean = mode => mode === "ocean";
// the Ocean intensity slider sets the hum's level (1 at the default 25%)
const humLevel = () => (0.05 + (+intensity.value / 100) * 0.75) / 0.2375;

const MODES = {
  transparency: { rank: 0, read: "Transparency: the room and the street, as they are",
                  note: "Transparency: you hear the room and the street as if you weren't wearing anything." },
  off: { rank: 1, read: "Off: the street, muffled only by the ear tips",
         note: "Off: no noise cancelling. The street, muffled only by the ear tips." },
  nc: { rank: 2, read: "Noise Cancellation: nearly silent, as advertised",
        note: "Noise cancelling working as advertised. The street fades to almost nothing. Enjoy it while it lasts." },
  ocean: { rank: 3, read: null,
           note: "SeaShells Mode: noise cancelling still works, but a low hum drifts underneath it, mostly in one ear. That's the bug owners describe." },
};

function normalise(buf, target) {
  const d = buf.getChannelData(0);
  let sum = 0;
  for (let i = 0; i < d.length; i++) sum += d[i] * d[i];
  const k = target / Math.sqrt(sum / d.length);
  for (let i = 0; i < d.length; i++) d[i] *= k;
  return buf;
}
async function loadLoop(ctx, url) {
  const res = await fetch(url);
  return normalise(await ctx.decodeAudioData(await res.arrayBuffer()), 0.08);
}
function loopSource(ctx, buf) {
  const s = ctx.createBufferSource();
  s.buffer = buf; s.loop = true;
  return s;
}
const rand = (lo, hi) => lo + Math.random() * (hi - lo);

async function buildAudio() {
  // iPhones mute web audio on silent unless the page asks for media playback
  if (navigator.audioSession) navigator.audioSession.type = "playback";
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  audio.ctx = ctx;
  const [roomBuf, streetBuf] = await Promise.all([loadLoop(ctx, "audio/roomtone.wav"), loadLoop(ctx, "audio/street.wav")]);
  const room = loopSource(ctx, roomBuf), street = loopSource(ctx, streetBuf);

  // what reaches the ear from outside: the room and the street
  const outside = ctx.createGain();
  room.connect(outside);
  const streetIn = ctx.createGain(); streetIn.gain.value = 0.6;
  street.connect(streetIn).connect(outside);

  // Transparency: the outside, passed straight through
  const transBus = ctx.createGain(); transBus.gain.value = 0;
  outside.connect(transBus);

  // Off: only the ear tips' seal, which muffles the highs
  const offLp = ctx.createBiquadFilter(); offLp.type = "lowpass"; offLp.frequency.value = 900; offLp.Q.value = 0.5;
  const offBus = ctx.createGain(); offBus.gain.value = 0;
  outside.connect(offLp).connect(offBus);

  // Noise Cancellation, working: the anti-noise removes most of the low rumble,
  // the ear tips block most of the highs, and only a faint, thin remainder is left
  const ncShelf = ctx.createBiquadFilter(); ncShelf.type = "lowshelf"; ncShelf.frequency.value = 300; ncShelf.gain.value = -20;
  // two lowpass stages in a row: a steep cut, so no highs leak through
  const ncLp1 = ctx.createBiquadFilter(); ncLp1.type = "lowpass"; ncLp1.frequency.value = 520; ncLp1.Q.value = 0.6;
  const ncLp = ctx.createBiquadFilter(); ncLp.type = "lowpass"; ncLp.frequency.value = 520; ncLp.Q.value = 0.6;
  const ncBus = ctx.createGain(); ncBus.gain.value = 0;
  outside.connect(ncShelf).connect(ncLp1).connect(ncLp).connect(ncBus);

  // slow level control, so a moving hum keeps a steady overall loudness
  function autoLevel(source, target) {
    const gain = ctx.createGain(); gain.gain.value = 0.3;     // start low, only ever rise into place
    const ana = ctx.createAnalyser(); ana.fftSize = 4096;
    source.connect(ana);
    source.connect(gain);
    const data = new Float32Array(ana.fftSize);
    setInterval(() => {
      ana.getFloatTimeDomainData(data);
      let sum = 0;
      for (const v of data) sum += v * v;
      const rms = Math.sqrt(sum / data.length);
      if (rms < 1e-5) return;
      gain.gain.setTargetAtTime(Math.min(3, Math.max(0.1, target / rms)), ctx.currentTime, 2.5);
    }, 250);
    return gain;
  }
  // SeaShells Mode: a band of the room that wanders (the hum), on top of the noise cancelling
  const oceanBus = ctx.createGain(); oceanBus.gain.value = 0;
  const humBand = ctx.createBiquadFilter(); humBand.type = "bandpass"; humBand.Q.value = HUM.q; humBand.frequency.value = 90;
  room.connect(humBand);
  autoLevel(humBand, HUM.target).connect(oceanBus);

  // Two layers. The baseline (every listening mode, and noise cancelling under the
  // Ocean modes) sits in both ears. Only the hum on top is lopsided.
  const centre = ctx.createGain();
  transBus.connect(centre); offBus.connect(centre); ncBus.connect(centre);
  const hums = ctx.createGain();
  oceanBus.connect(hums);
  const earL = ctx.createGain(), earR = ctx.createGain();
  const merger = ctx.createChannelMerger(2);
  centre.connect(merger, 0, 0); centre.connect(merger, 0, 1);
  hums.connect(earL).connect(merger, 0, 0);
  hums.connect(earR).connect(merger, 0, 1);

  const master = ctx.createGain(); master.gain.value = 0;
  const gate = ctx.createGain(); gate.gain.value = 1;        // rest timer
  const limiter = ctx.createDynamicsCompressor();             // safety: no sudden loud peaks
  limiter.threshold.value = -12; limiter.knee.value = 6; limiter.ratio.value = 8; limiter.attack.value = 0.005; limiter.release.value = 0.2;
  merger.connect(master).connect(gate).connect(limiter).connect(ctx.destination);
  // one-shot sounds (squeak, crackle): their own stereo path, audible with or without the preview
  const fx = ctx.createChannelMerger(2);
  fx.connect(limiter);
  // meters read each ear after everything
  const split = ctx.createChannelSplitter(2);
  const anaL = ctx.createAnalyser(), anaR = ctx.createAnalyser();
  anaL.fftSize = anaR.fftSize = 1024;
  gate.connect(split);
  split.connect(anaL, 0); split.connect(anaR, 1);

  room.start(); street.start();
  Object.assign(audio, { master, gate, earL, earR, anaL, anaR, merger, fx, transBus, offBus, ncBus, oceanBus, offLp, ncLp, ncLp1, ncShelf, humBand });
  applyMode(); applyIntensity(); applyGate();
  drift();
  meterLoop();
  eqLoop();
}

// glide the hum to a new random frequency, easing in and out, then start the next glide straight away
function drift() {
  const f = audio.humBand.frequency, now = audio.ctx.currentTime;
  const from = f.value, to = rand(HUM.lo, HUM.hi), dur = rand(...HUM.move);
  const curve = new Float32Array(64);
  for (let i = 0; i < curve.length; i++) {
    const x = i / (curve.length - 1);
    curve[i] = from + (to - from) * (1 - Math.cos(Math.PI * x)) / 2;   // slow start, slow finish
  }
  f.cancelScheduledValues(now);
  f.setValueAtTime(from, now);
  f.setValueCurveAtTime(curve, now, dur);
  audio.timer = setTimeout(drift, dur * 1000);
}

function ramp(param, value, time = 0.25) {
  const now = audio.ctx.currentTime;
  param.cancelScheduledValues(now);
  param.setTargetAtTime(value, now, time / 3);
}

function applyMode() {
  modeBtns.forEach(b => b.setAttribute("aria-checked", String(b.dataset.mode === audio.mode)));
  demoNote.textContent = MODES[audio.mode].note;
  // the sliders only mean something in the Ocean modes
  const ocean = isOcean(audio.mode);
  [balance, intensity].forEach(el => {
    el.disabled = !ocean;
    el.closest(".control").classList.toggle("is-off", !ocean);
  });
  applyBalance();
  if (!audio.offBus) return;
  ramp(audio.transBus.gain, audio.mode === "transparency" ? 0.55 : 0, 0.4);
  ramp(audio.offBus.gain, audio.mode === "off" ? 0.7 : 0, 0.4);
  ramp(audio.ncBus.gain, audio.mode === "nc" || ocean ? NC_LEVEL : 0, 0.4);   // the baseline under the hum
  // during the fade-in into SeaShells Mode, leave the hum's own schedule alone
  if (!(ocean && audio.ctx.currentTime < audio.humHoldUntil)) ramp(audio.oceanBus.gain, ocean ? humLevel() : 0, 0.4);
}

// Entering SeaShells Mode: about a second of clean noise cancelling, then the hum fades in
const HUM_ATTACK = { hold: 1.0, fade: 3.5 };   // seconds
function enterOcean() {
  const g = audio.oceanBus.gain, now = audio.ctx.currentTime, level = humLevel();
  const start = now + HUM_ATTACK.hold, end = start + HUM_ATTACK.fade;
  g.cancelScheduledValues(now);
  g.setValueAtTime(0, now);
  // rise from 40 dB below to full: an exponential ramp, so it grows evenly to the ear
  g.setValueAtTime(level * 0.01, start);
  g.exponentialRampToValueAtTime(level, end);
  audio.humHoldUntil = end;
}

// a soft two-note chime when the mode changes: rising towards more cancelling, falling towards Off
function chime(up) {
  const ctx = audio.ctx, t0 = ctx.currentTime + 0.02;
  const notes = up ? [622.25, 932.33] : [932.33, 622.25];   // E flat 5 and B flat 5, a fifth apart
  const out = ctx.createGain(); out.gain.value = 0.09;
  out.connect(ctx.destination);                               // both ears, whatever the asymmetry
  notes.forEach((f, i) => {
    const t = t0 + i * 0.11;
    [[1, 1], [2.01, 0.18]].forEach(([mult, level]) => {        // the note plus a faint bright partial
      const osc = ctx.createOscillator(); osc.type = "sine";
      osc.frequency.setValueAtTime(f * mult * 1.05, t);           // starts a touch sharp, settles: the "bubble"
      osc.frequency.exponentialRampToValueAtTime(f * mult, t + 0.045);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(level, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      osc.connect(g).connect(out);
      osc.start(t); osc.stop(t + 0.35);
    });
  });
}

let building = null;
async function ready() {
  if (!audio.ctx) building = buildAudio();
  await building;
  audio.ctx.resume();
}

modeBtns.forEach(b => b.addEventListener("click", async () => {
  const next = b.dataset.mode;
  if (next === audio.mode && audio.playing) return;
  // picking a mode starts the preview straight away, in that mode
  if (!audio.ctx) playLabel.textContent = "Loading the room…";
  await ready();
  const entering = next === "ocean" && (audio.mode !== "ocean" || !audio.playing);
  if (next !== audio.mode) chime(MODES[next].rank > MODES[audio.mode].rank);
  audio.mode = next;
  applyMode();
  if (entering) enterOcean();
  if (!audio.playing) setPlaying(true);
}));

function applyBalance() {
  const b = +balance.value / 100;
  // only SeaShells Mode is lopsided; the other modes sit in both ears
  const centred = !isOcean(audio.mode);
  const l = centred || b <= 0 ? 1 : 1 - b, r = centred || b >= 0 ? 1 : 1 + b;
  balanceRead.textContent =
    b <= -0.98 ? "100% left" :
    b >= 0.98 ? "100% right" :
    Math.abs(b) < 0.03 ? "Centre" :
    `${Math.round(Math.abs(b) * 100)}% ${b < 0 ? "left" : "right"}`;
  if (audio.earL) { ramp(audio.earL.gain, l, 0.3); ramp(audio.earR.gain, r, 0.3); }
}

function applyIntensity() {
  const i = +intensity.value / 100;
  intensityRead.textContent = `${Math.round(i * 100)}%`;
  if (audio.oceanBus) applyMode();
}

function applyGate() {
  if (!audio.gate) return;
  ramp(audio.gate.gain, audio.resting ? 0 : 1, 0.4);
}

function setPlaying(on) {
  audio.playing = on;
  playBtn.setAttribute("aria-pressed", String(on));
  playLabel.textContent = on ? "Exit preview" : "Enter preview";
  consoleEl.style.setProperty("--glow", on ? 1 : 0);
  if (!audio.master) return;
  ramp(audio.master.gain, on ? DEMO_GAIN : 0, on ? 1.5 : 0.3);
}

playBtn.addEventListener("click", async () => {
  const turnOn = !audio.playing;
  if (!audio.ctx) playLabel.textContent = "Loading the room…";
  await ready();
  if (turnOn && audio.mode === "ocean") enterOcean();
  setPlaying(turnOn);
});
balance.addEventListener("input", applyBalance);
intensity.addEventListener("input", applyIntensity);
applyMode();

// the live EQ drawing: what each mode does to the room, and where the hum is
const eqCanvas = document.getElementById("eq");
const eqRead = document.getElementById("eq-read");
function eqLoop() {
  const g = eqCanvas.getContext("2d");
  const N = 220, fMin = 20, fMax = 2000;
  const freqs = new Float32Array(N);
  for (let i = 0; i < N; i++) freqs[i] = fMin * Math.pow(fMax / fMin, i / (N - 1));
  const m1 = new Float32Array(N), m2 = new Float32Array(N), ph = new Float32Array(N);
  const xOf = f => Math.log(f / fMin) / Math.log(fMax / fMin);
  const tick = () => {
    requestAnimationFrame(tick);
    const dpr = Math.min(devicePixelRatio, 2);
    const w = eqCanvas.clientWidth, h = eqCanvas.clientHeight;
    if (eqCanvas.width !== w * dpr) { eqCanvas.width = w * dpr; eqCanvas.height = h * dpr; }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    g.fillStyle = "rgba(143,240,228,0.07)";                  // the 50 to 150 Hz band
    g.fillRect(xOf(50) * w, 0, (xOf(150) - xOf(50)) * w, h);
    g.fillStyle = "#6e6e73";
    g.font = "11px -apple-system, system-ui, sans-serif";
    [50, 150, 500, 1000].forEach(f => g.fillText(`${f >= 1000 ? f / 1000 + " k" : f} Hz`, xOf(f) * w + 4, h - 6));
    if (!audio.humBand) return;
    const mode = audio.mode;
    if (mode === "ocean") {
      // the quiet noise-cancelled floor, with the hum band standing up out of it
      audio.ncShelf.getFrequencyResponse(freqs, m1, ph);
      audio.ncLp.getFrequencyResponse(freqs, m2, ph);
      const band = new Float32Array(N);
      audio.humBand.getFrequencyResponse(freqs, band, ph);
      for (let i = 0; i < N; i++) { m1[i] = m1[i] * m2[i] * m2[i] * NC_LEVEL + band[i] * 0.9; m2[i] = 1; }
    } else if (mode === "transparency") {
      m1.fill(1); m2.fill(1);
    } else if (mode === "nc") {
      audio.ncShelf.getFrequencyResponse(freqs, m1, ph);
      audio.ncLp.getFrequencyResponse(freqs, m2, ph);
      for (let i = 0; i < N; i++) m2[i] *= m2[i] * NC_LEVEL;   // two identical lowpass stages
    } else {
      audio.offLp.getFrequencyResponse(freqs, m1, ph);
      m2.fill(1);
    }
    const yOf = db => h * 0.5 - (db / 24) * (h * 0.42);
    const grad = g.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, "#8ff0e4"); grad.addColorStop(0.5, "#b9a8ff"); grad.addColorStop(1, "#ffc6ad");
    g.strokeStyle = isOcean(mode) ? grad : "#8e8e93";
    g.lineWidth = 2.5;
    g.beginPath();
    for (let i = 0; i < N; i++) {
      const db = 20 * Math.log10(m1[i] * m2[i] + 1e-6);
      const x = (i / (N - 1)) * w, y = yOf(Math.max(-24, db));
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
    eqRead.textContent = mode === "ocean" ? `SeaShells Mode. Hum: ${Math.round(audio.humBand.frequency.value)} Hz` : MODES[mode].read;
  };
  tick();
}

// Squeaky seal: a warning first, then a short squeal in a random ear
async function squeal() {
  await ready();
  const ctx = audio.ctx, now = ctx.currentTime;
  const osc = ctx.createOscillator(); osc.type = "sine";
  osc.frequency.setValueAtTime(2850, now);
  osc.frequency.exponentialRampToValueAtTime(3350, now + 0.9);
  const vib = ctx.createOscillator(); vib.frequency.value = 9;
  const vibDepth = ctx.createGain(); vibDepth.gain.value = 40;
  vib.connect(vibDepth).connect(osc.frequency);
  const g = ctx.createGain(); g.gain.value = 0;
  g.gain.setTargetAtTime(0.012, now, 0.05);
  g.gain.setTargetAtTime(0, now + 0.9, 0.12);
  const ear = Math.random() < 0.5 ? 0 : 1;                    // the seal can go on either side
  osc.connect(g).connect(audio.fx, 0, ear);
  osc.start(now); vib.start(now);
  osc.stop(now + 1.6); vib.stop(now + 1.6);
  demoNote.textContent = soundNote("squeal", ear ? "right" : "left");
}

squealBtn.addEventListener("click", () => {
  if (audio.sealOk || !sealDialog?.showModal) return squeal();
  sealDialog.showModal();
});
// accepting once covers the rest of the visit; a page refresh asks again
sealDialog?.querySelector(".sheet-ok").addEventListener("click", e => {
  e.preventDefault();
  audio.sealOk = true;
  sealDialog.close();
  squeal();
});
sealDialog?.querySelector(".sheet-cancel").addEventListener("click", e => {
  e.preventDefault();
  sealDialog.close();
});

// Crackling: how owners describe it. "Like heavy rain", "raining in the distance", static or
// crackling with noise cancelling on, and every so often a "bick", "like that feeling when you put
// your head underwater for a second". Sparse, uneven clicks, filtered rough rather than sharp.
function crackleBuffer(ctx, seconds = 5) {
  const sr = ctx.sampleRate, n = Math.floor(sr * seconds);
  const buf = ctx.createBuffer(1, n, sr), d = buf.getChannelData(0);
  let rate = 25, t = 0;
  while (t < seconds) {
    rate = Math.min(80, Math.max(4, rate + rand(-9, 9)));      // density wanders: clusters, then gaps
    t += -Math.log(1 - Math.random()) / rate;                  // random gaps between clicks
    const i = Math.floor(t * sr);
    if (i >= n) break;
    const amp = Math.random() ** 2.2 * (Math.random() < 0.5 ? -1 : 1);
    const len = Math.floor(sr * rand(0.0003, 0.003));          // each click is a tiny rough burst
    for (let k = 0; k < len && i + k < n; k++) d[i + k] += amp * (Math.random() * 2 - 1) * Math.exp(-k / (len / 4));
  }
  // the "bick": one soft low pressure thump, like going under water
  const b = Math.floor(sr * rand(1.6, 3.2));
  for (let k = 0; k < sr * 0.09 && b + k < n; k++) d[b + k] += 0.9 * Math.sin(2 * Math.PI * 70 * k / sr) * Math.exp(-k / (sr * 0.025));
  // fade in and out
  const f = Math.floor(sr * 0.15);
  for (let k = 0; k < f; k++) { d[k] *= k / f; d[n - 1 - k] *= k / f; }
  return buf;
}

async function crackle() {
  await ready();
  const ctx = audio.ctx, now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = crackleBuffer(ctx);
  const band = ctx.createBiquadFilter(); band.type = "bandpass"; band.frequency.value = 2200; band.Q.value = 0.6;
  const soften = ctx.createBiquadFilter(); soften.type = "lowpass"; soften.frequency.value = 6000;
  const g = ctx.createGain(); g.gain.value = 0.15;            // subtle on purpose
  const ear = Math.random() < 0.5 ? 0 : 1;
  src.connect(band).connect(soften).connect(g).connect(audio.fx, 0, ear);
  src.start(now);
  demoNote.textContent = soundNote("crackle", ear ? "right" : "left");
}
document.getElementById("crackle").addEventListener("click", crackle);

/* ---------- More sounds owners report (all from the saved threads in research/) ---------- */
function noiseBuffer(ctx, seconds) {
  const b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}
function fadeEnvelope(param, t0, dur, level, edge = 0.4) {
  param.setValueAtTime(0, t0);
  param.linearRampToValueAtTime(level, t0 + edge);
  param.setValueAtTime(level, t0 + dur - edge);
  param.linearRampToValueAtTime(0, t0 + dur);
}
// play a short sound in a random ear, then say what it was
async function playReported(build, note) {
  await ready();
  const ctx = audio.ctx, t0 = ctx.currentTime + 0.02;
  const out = ctx.createGain();
  const ear = Math.random() < 0.5 ? 0 : 1;
  out.connect(audio.fx, 0, ear);
  build(ctx, out, t0);
  demoNote.textContent = note(ear ? "right" : "left");
}

const REPORTED = {
  // "a very quiet fan running", "heavy rain or a waterfall"; louder in a quiet room
  hiss: [(ctx, out, t0) => {
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx, 5);
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 3500;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 11000;
    src.connect(hp).connect(lp).connect(out);
    fadeEnvelope(out.gain, t0, 5, 0.03, 0.6);
    src.start(t0);
  }, ear => `Hiss in your ${ear} ear, "similar to a very quiet fan running". Support hears nothing.`],

  // "a high-pitched whistle mixed with the sound of the sea"
  whistle: [(ctx, out, t0) => {
    const osc = ctx.createOscillator(); osc.frequency.value = 7200;
    const wob = ctx.createOscillator(); wob.frequency.value = 0.35;
    const wobDepth = ctx.createGain(); wobDepth.gain.value = 45;
    wob.connect(wobDepth).connect(osc.frequency);
    const tone = ctx.createGain(); tone.gain.value = 0.18;
    osc.connect(tone).connect(out);
    const sea = ctx.createBufferSource(); sea.buffer = noiseBuffer(ctx, 5);
    const band = ctx.createBiquadFilter(); band.type = "bandpass"; band.frequency.value = 900; band.Q.value = 0.5;
    sea.connect(band).connect(out);
    fadeEnvelope(out.gain, t0, 5, 0.05, 0.5);
    [osc, wob, sea].forEach(n => { n.start(t0); n.stop(t0 + 5.1); });
  }, ear => `A high-pitched whistle mixed with the sea, in your ${ear} ear. It's within spec.`],

  // "gusts of wind that sound like they are blowing through a small gap"
  wind: [(ctx, out, t0) => {
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx, 6);
    const band = ctx.createBiquadFilter(); band.type = "bandpass"; band.Q.value = 1.4; band.frequency.value = 500;
    src.connect(band).connect(out);
    out.gain.setValueAtTime(0, t0);
    let t = t0;
    while (t < t0 + 5.5) {                                       // irregular gusts, rising and falling
      const len = rand(0.7, 1.6), peak = rand(0.05, 0.16);
      out.gain.linearRampToValueAtTime(peak, t + len * 0.45);
      band.frequency.linearRampToValueAtTime(rand(350, 900), t + len * 0.45);
      out.gain.linearRampToValueAtTime(rand(0.005, 0.03), t + len);
      t += len;
    }
    out.gain.linearRampToValueAtTime(0, t + 0.3);
    src.start(t0); src.stop(t + 0.4);
  }, ear => `Gusts of wind in your ${ear} ear, "blowing through a small gap". The window is closed. Have you checked?`],

  // "like that feeling when you put your head underwater for a second"; "underwater clicks"
  clicks: [(ctx, out, t0) => {
    out.gain.value = 0.35;
    let t = t0;
    for (let i = 0; i < 5; i++) {
      t += rand(0.6, 1.3);
      const thump = ctx.createOscillator(); thump.frequency.setValueAtTime(95, t); thump.frequency.exponentialRampToValueAtTime(55, t + 0.08);
      const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      thump.connect(g).connect(out);
      thump.start(t); thump.stop(t + 0.16);
      const tick = ctx.createBufferSource(); tick.buffer = noiseBuffer(ctx, 0.01);
      const tg = ctx.createGain(); tg.gain.value = 0.12;
      const tlp = ctx.createBiquadFilter(); tlp.type = "lowpass"; tlp.frequency.value = 1800;
      tick.connect(tlp).connect(tg).connect(out);
      tick.start(t);
    }
  }, ear => `Underwater clicks in your ${ear} ear, "like that feeling when you put your head underwater". Probably your ears.`],

  // "I can even hear myself breathing with this noise"
  breathing: [(ctx, out, t0) => {
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx, 8);
    const band = ctx.createBiquadFilter(); band.type = "bandpass"; band.frequency.value = 800; band.Q.value = 0.9;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2200;
    src.connect(band).connect(lp).connect(out);
    out.gain.setValueAtTime(0, t0);
    let t = t0;
    for (let i = 0; i < 2; i++) {                                // in, out, twice
      out.gain.linearRampToValueAtTime(0.07, t + 1.4); out.gain.linearRampToValueAtTime(0.004, t + 2.0);
      out.gain.linearRampToValueAtTime(0.05, t + 2.6); out.gain.linearRampToValueAtTime(0, t + 3.8);
      t += 3.9;
    }
    src.start(t0); src.stop(t + 0.2);
  }, () => `That's you, breathing, amplified. One owner could "hear myself breathing with this noise". Some customers find it calming.`],
};
Object.entries(REPORTED).forEach(([id, [build]]) => {
  document.getElementById(`fx-${id}`).addEventListener("click", () => playReported(build, ear => soundNote(`fx-${id}`, ear)));
});

/* ---------- What each sound is: owners' words, from the saved threads in research/ ---------- */
const TIPS = {
  ocean: {
    name: "SeaShells Mode: the ocean hum",
    what: "Our simulation of the most reported sound. Noise cancelling keeps working, and a low hum drifts underneath it, mostly in one ear. It's built in your browser from owners' descriptions, not recorded from AirPods.",
    when: "Most noticeable in a quiet room, with noise cancelling on and nothing playing.",
    quote: "To me it sounds like I'm putting my ear to a seashell.",
    source: "An owner on Reddit",
  },
  "fx-hiss": {
    name: "Hiss",
    what: "A steady white noise, like a quiet fan, distant rain or a waterfall.",
    when: "With noise cancelling, Transparency or Adaptive on, worst in a quiet room. Owners say only Off mode stops it.",
    quote: "It's a white noise. Similar to a very quiet fan running.",
    source: "An owner on the MacRumors Forums",
  },
  crackle: {
    name: "Crackling",
    what: "Static or crackling that comes and goes.",
    when: "Mostly with noise cancelling on and nothing playing.",
    quote: "a static-like sound or a crackling issue when using the earbuds, particularly when Active Noise Cancellation is on but no media is playing.",
    source: "MacRumors, December 2025",
  },
  squeal: {
    name: "Squeaky seal",
    what: "A squeal that can build into a screech, like a microphone too close to a speaker.",
    when: "When the fit shifts in your ear, or while you adjust them. One owner got it on a flight.",
    quote: "the seashell sound to get louder and louder until it becomes a loud screech, like a really bad feedback loop",
    source: "An owner on Reddit",
  },
  "fx-whistle": {
    name: "Whistle",
    what: "A high-pitched whistle over a sea-like hiss.",
    when: "It comes and goes. Some owners hear it in Transparency or Adaptive mode, others on flights.",
    quote: "It sounds like a high-pitched whistle mixed with the sound of the sea (like static or white noise).",
    source: "An owner on Reddit",
  },
  "fx-wind": {
    name: "Wind gusts",
    what: "Gusts of wind that seem to come from one side of the room.",
    when: "On and off, often on one side. Take the earbuds out and the room is silent.",
    quote: "it sounds like it's windy outside and off to my right.",
    source: "An owner on Reddit",
  },
  "fx-clicks": {
    name: "Underwater clicks",
    what: "A short click, like dipping your head underwater for a second.",
    when: "For one owner, every 30 seconds or so.",
    quote: "every thirty seconds or so I get this 'bick' idk how else to describe it.",
    source: "An owner on Reddit",
  },
  "fx-breathing": {
    name: "Breathing",
    what: "Your own breathing, chewing and jaw movements, louder in the faulty earbud.",
    when: "Along with the hiss, on the affected side.",
    quote: "I can even hear myself breathing with this noise.",
    source: "An owner on Reddit",
  },
};
function soundNote(key, ear) {
  const t = TIPS[key];
  return `${t.name}, in your ${ear} ear. ${t.what} ${t.when}`;
}

// one shared card, shown on hover (computers) or keyboard focus
const tip = document.createElement("div");
tip.className = "tip"; tip.id = "tip"; tip.setAttribute("role", "tooltip"); tip.hidden = true;
document.body.appendChild(tip);
function showTip(el) {
  const t = TIPS[el.dataset.tip];
  if (!t) return;
  const line = (cls, label, text) => {
    const p = document.createElement("p"); p.className = cls;
    if (label) { const b = document.createElement("b"); b.textContent = label; p.append(b, " "); }
    p.append(text); return p;
  };
  const h = document.createElement("strong"); h.textContent = t.name;
  const q = document.createElement("blockquote"); q.textContent = t.quote;
  const s = document.createElement("span"); s.className = "tip-src"; s.textContent = t.source;
  tip.replaceChildren(h, line("tip-what", "", t.what), line("tip-when", "When:", t.when), q, s);
  tip.hidden = false;
  const r = el.getBoundingClientRect(), w = tip.offsetWidth, ht = tip.offsetHeight;
  const x = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), innerWidth - w - 12);
  const y = r.top - ht - 12 > 100 ? r.top - ht - 12 : r.bottom + 12;
  tip.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
}
const hideTip = () => { tip.hidden = true; };
const canHover = matchMedia("(hover: hover)").matches;
document.querySelectorAll("[data-tip]").forEach(el => {
  el.setAttribute("aria-describedby", "tip");
  if (canHover) {
    el.addEventListener("pointerenter", () => showTip(el));
    el.addEventListener("pointerleave", hideTip);
  }
  el.addEventListener("focus", () => { if (el.matches(":focus-visible")) showTip(el); });
  el.addEventListener("blur", hideTip);
});
addEventListener("scroll", hideTip, { passive: true });

function meterLoop() {
  const data = new Float32Array(audio.anaL.fftSize);
  const rms = a => { a.getFloatTimeDomainData(data); let s = 0; for (const v of data) s += v * v; return Math.sqrt(s / data.length); };
  const tick = () => {
    requestAnimationFrame(tick);
    meterL.style.transform = `scaleX(${clamp(rms(audio.anaL) * 16).toFixed(3)})`;
    meterR.style.transform = `scaleX(${clamp(rms(audio.anaR) * 16).toFixed(3)})`;
  };
  tick();
}

/* =========================================================
   Support Desk simulator
   ========================================================= */
const log = document.getElementById("chat-log");
const replies = document.getElementById("chat-replies");
const wait = ms => new Promise(r => setTimeout(r, reduceMotion ? Math.min(ms, 150) : ms));
let chatRun = 0;

const REAL = text => ({ text, real: true });   // owners report hearing this from Apple staff
const SCRIPT = {
  start: {
    them: ["Hi, I'm Kevin. Thanks for waiting 40 minutes.", "What brings you in today?"],
    replies: [["There's an ocean sound in my right AirPod.", "diag"], ["Noise cancelling makes a hissing static.", "diag"]],
  },
  diag: {
    them: ["Oh no, that sounds frustrating.", "Let me run a quick diagnostic. It checks everything."],
    diag: true, next: "passed",
  },
  passed: {
    them: [REAL("Good news! All tests passed."), REAL("Honestly, this is the first time we've heard of a case like this."), "Your AirPods are working as designed."],
    replies: [["But I can hear it right now.", "personal"], ["It's all over Reddit.", "reddit"]],
  },
  personal: {
    them: ["Sound is very personal. Everyone hears things a little differently.", "Some people hear the ocean. Some people hear their own thoughts."],
    next: "clean",
  },
  reddit: {
    them: ["I can't comment on third-party forums.", "But a lot of people there find the sound calming."],
    next: "clean",
  },
  clean: {
    them: ["Have you tried cleaning them?"],
    replies: [["Yes. Three times.", "cloth"], ["They're brand new.", "brandnew"]],
  },
  cloth: {
    them: ["With a dry cloth? It was too dry. Or not dry enough.", "It's hard to say, which is your fault."],
    next: "ears",
  },
  brandnew: {
    them: ["Brand-new pairs don't make noise.", "So if yours do, what did you do to them?"],
    next: "ears",
  },
  ears: {
    them: ["Mind if I take a quick look at your ears?", "…", "Yes. They're quite unique. We see a lot of unique ears with this."],
    replies: [["Can I get a refund?", "swap"], ["Is this a known issue?", "known"]],
  },
  swap: {
    them: ["I can offer you a brand-new replacement pair!", "It may also hear the ocean. That's how you know it's genuine."],
    replies: [["Is this a known issue?", "known"]],
  },
  known: {
    them: ["There's no known issue.", REAL("What you're hearing is normal. Expected behavior, really."), "There are just a lot of people with the same unknown one."],
    replies: [["So nothing changes?", "end"]],
  },
  end: {
    them: ["Everything changes! Your ears will have a whole new pair to adjust to.", "Is there anything else I can help you with today?"],
    closed: true,
  },
};

const DIAG_ROWS = [
  ["Firmware", "Up to date", false],
  ["Ear Tip Fit Test", "Good seal", false],
  ["Microphones", "Passed", false],
  ["Noise cancellation", "Working as designed", false],
];

function bubble(text, who) {
  const el = document.createElement("div");
  el.className = `msg ${who}`;
  el.textContent = text;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
  return el;
}

async function say(text, run, real) {
  const typing = document.createElement("div");
  typing.className = "msg them typing";
  typing.setAttribute("aria-label", "Kevin is typing");
  typing.innerHTML = "<span></span><span></span><span></span>";
  log.appendChild(typing);
  log.scrollTop = log.scrollHeight;
  await wait(500 + Math.min(text.length * 18, 1100));
  typing.remove();
  if (run !== chatRun) return false;
  bubble(text, "them");
  if (real) {
    const tag = document.createElement("div");
    tag.className = "msg-tag";
    tag.textContent = "Said to a real owner";
    log.appendChild(tag);
    log.scrollTop = log.scrollHeight;
  }
  return true;
}

async function runDiagnostic(run) {
  const box = document.createElement("div");
  box.className = "diag";
  box.innerHTML = "<strong>AirPods Diagnostics</strong>";
  const bar = document.createElement("div");
  bar.className = "diag-bar";
  bar.innerHTML = "<i></i>";
  log.appendChild(box);
  box.appendChild(bar);
  for (let i = 0; i < DIAG_ROWS.length; i++) {
    await wait(750);
    if (run !== chatRun) return false;
    const [label, result, warn] = DIAG_ROWS[i];
    const row = document.createElement("div");
    row.className = "diag-row";
    row.innerHTML = `<span>${label}</span><b class="${warn ? "warn" : ""}">${result}</b>`;
    box.insertBefore(row, bar);
    bar.firstChild.style.width = `${((i + 1) / DIAG_ROWS.length) * 100}%`;
    log.scrollTop = log.scrollHeight;
  }
  await wait(500);
  return run === chatRun;
}

async function play(nodeId, run) {
  const node = SCRIPT[nodeId];
  replies.innerHTML = "";
  for (const line of node.them) {
    const real = typeof line === "object";
    if (!(await say(real ? line.text : line, run, real))) return;
  }
  if (node.diag && !(await runDiagnostic(run))) return;
  if (node.next) return play(node.next, run);
  if (node.closed) {
    const c = document.createElement("div");
    c.className = "closed";
    c.textContent = `Case ${Math.floor(1e9 + Math.random() * 9e9)} closed. Cause: your ears.`;
    log.appendChild(c);
    log.scrollTop = log.scrollHeight;
    const again = document.createElement("button");
    again.className = "pill big";
    again.textContent = "Practice again";
    again.addEventListener("click", startChat);
    replies.appendChild(again);
    return;
  }
  node.replies.forEach(([label, next]) => {
    const b = document.createElement("button");
    b.className = "reply";
    b.textContent = label;
    b.addEventListener("click", () => {
      if (run !== chatRun) return;
      replies.innerHTML = "";
      bubble(label, "me");
      play(next, run);
    });
    replies.appendChild(b);
  });
}

function startChat() {
  chatRun++;
  log.innerHTML = "";
  replies.innerHTML = "";
  play("start", chatRun);
}

// start the conversation when it scrolls into view
let chatStarted = false;
new IntersectionObserver(([e]) => {
  if (e.isIntersecting && !chatStarted) { chatStarted = true; startChat(); }
}, { threshold: 0.35 }).observe(document.querySelector(".chat"));

/* =========================================================
   Petition: each signature is saved privately (see petition-api/). Nothing can be read back.
   ========================================================= */
const PETITION_API = "https://seashells-petition-api.vercel.app/api/sign";
const petition = document.getElementById("petition-form");
const petitionError = document.getElementById("petition-error");
petition?.addEventListener("submit", async e => {
  e.preventDefault();
  const f = petition.elements;
  const btn = petition.querySelector('button[type="submit"]');
  const label = btn.textContent;
  const data = {
    name: f.name.value,
    country: f.country.value,
    models: [...petition.querySelectorAll('input[name="models"]:checked')].map(i => i.value),
    sounds: [...petition.querySelectorAll('input[name="sounds"]:checked')].map(i => i.value),
    side: petition.querySelector('input[name="side"]:checked')?.value || "",
    story: f.story.value,
    email: f.email.value,
    website: f.website.value,   // hidden; only bots fill it
  };
  btn.disabled = true;
  btn.textContent = "Sending…";
  petitionError.hidden = true;
  try {
    const res = await fetch(PETITION_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || !out.success) throw new Error(out.error || "We couldn't save your signature right now. Please try again in a moment.");
    const done = document.getElementById("petition-done");
    done.querySelector(".done-title").textContent = `Thank you, ${data.name.trim().split(/\s+/)[0]}.`;
    petition.hidden = true;
    done.hidden = false;
    done.focus();
  } catch (err) {
    petitionError.textContent = err instanceof TypeError
      ? "We couldn't reach the petition. Check your connection and try again."
      : err.message;
    petitionError.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
});
