import * as THREE from "three";
import { OPTIONS, fit, softShadowTexture, studioEnvironment } from "./shells.js";

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const list = document.getElementById("options");
const canvas = document.getElementById("views");

// One renderer, one canvas, ten little stages drawn into each card's rectangle
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.setClearColor(0x000000, 0);
const env = studioEnvironment(renderer);
const shadowTex = softShadowTexture();

const stages = OPTIONS.map((opt, i) => {
  const li = document.createElement("li");
  li.className = "option";
  li.innerHTML = `<div class="view" role="img" aria-label="${opt.name} shell earbud in white ceramic"></div>
    <div class="option-text"><h2></h2><p></p></div>`;
  li.querySelector("h2").textContent = opt.name;
  li.querySelector("p").textContent = opt.line;
  list.appendChild(li);
  const view = li.querySelector(".view");

  const scene = new THREE.Scene();
  scene.environment = env;
  const key = new THREE.DirectionalLight(0xfff4ea, 0.5);
  key.position.set(4, 6, 5);
  const cool = new THREE.DirectionalLight(0xdff7f3, 0.25);
  cool.position.set(-5, 2, 3);
  const rim = new THREE.DirectionalLight(0xffffff, 0.3);
  rim.position.set(0, 3, -6);
  scene.add(key, cool, rim);

  const turntable = new THREE.Group();
  turntable.add(fit(opt.build(), 2.4));
  turntable.position.y = 0.1;
  scene.add(turntable);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 1.7),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.35;
  scene.add(shadow);

  const camera = new THREE.PerspectiveCamera(26, 4 / 3, 0.1, 100);
  camera.position.set(0, 1.3, 8.6);
  camera.lookAt(0, -0.1, 0);

  // drag to turn
  const state = { angle: (i % 3 - 1) * 0.25, vel: 0, dragging: false, lastX: 0 };
  view.addEventListener("pointerdown", e => { state.dragging = true; state.lastX = e.clientX; view.setPointerCapture(e.pointerId); });
  view.addEventListener("pointermove", e => {
    if (!state.dragging) return;
    const dx = e.clientX - state.lastX;
    state.lastX = e.clientX;
    state.angle += dx * 0.012;
    state.vel = dx * 0.012;
  });
  const stop = () => { state.dragging = false; };
  view.addEventListener("pointerup", stop);
  view.addEventListener("pointercancel", stop);

  return { view, scene, camera, turntable, state };
});

function draw() {
  requestAnimationFrame(draw);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) {
    renderer.setSize(w, h, false);
  }
  renderer.setScissorTest(false);
  renderer.clear();
  renderer.setScissorTest(true);

  stages.forEach(({ view, scene, camera, turntable, state }) => {
    const r = view.getBoundingClientRect();
    if (r.bottom < 0 || r.top > h || r.right < 0 || r.left > w) return;
    if (!state.dragging) {
      state.vel *= 0.94;
      state.angle += state.vel + (reduceMotion ? 0 : 0.004);
    }
    turntable.rotation.y = state.angle;
    const bottom = h - r.bottom;
    renderer.setViewport(r.left, bottom, r.width, r.height);
    renderer.setScissor(r.left, bottom, r.width, r.height);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  });
}
draw();
