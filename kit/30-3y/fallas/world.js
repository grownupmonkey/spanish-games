/* ===================== WORLD: renderer, looks, camera, gems, particles, scene switching ===================== */
const $ = s => document.querySelector(s);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const host = $('#view3d');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
host.appendChild(renderer.domElement);
window.__renderer = renderer;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xE9D3C0, 70, 170);
const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 500);
const hemi = new THREE.HemisphereLight(0xCFE3FF, 0xB98A62, .75); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xFFE2B8, 1.35); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 10, far: 200 }); sun.shadow.bias = -.0006;
scene.add(sun, sun.target);
const rim = new THREE.DirectionalLight(0xC9DAFF, .45); rim.position.set(40, 30, -40); scene.add(rim);

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
}
const M = (color, o = {}) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .78, metalness: 0 }, o)); m.color.convertSRGBToLinear(); return m; };
function mesh(geo, mat, x = 0, y = 0, z = 0, parent = scene) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}

/* ---------- lighting looks ---------- */
const SKIES = {
  day: [['#5B8FD6', 0], ['#A9C9EE', .55], ['#F4D7B5', .85], ['#F6C89A', 1]],
  golden: [['#4E6FB8', 0], ['#C9A6C8', .5], ['#F7B98A', .8], ['#FFD08A', 1]],
  dusk: [['#1E1846', 0], ['#4A2F6E', .45], ['#B5577A', .78], ['#F29A6A', 1]],
  night: [['#05040F', 0], ['#0E0B2A', .6], ['#2A1B45', .9], ['#4A2A3A', 1]],
};
const _sky = {};
function skyTex(k) {
  if (_sky[k]) return _sky[k];
  return (_sky[k] = canvasTex(512, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); SKIES[k].forEach(([c, s]) => gr.addColorStop(s, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    if (k === 'night' || k === 'dusk') for (let i = 0; i < (k === 'night' ? 220 : 60); i++) { g.fillStyle = `rgba(255,255,255,${rnd(.3, .9)})`; g.fillRect(rnd(0, w), rnd(0, h * .6), rnd(1, 2.2), rnd(1, 2.2)); }
  }));
}
const LOOKS = {
  day: { sky: 'day', fog: 0xE9D3C0, near: 80, far: 190, hemi: [0xCFE3FF, 0xB98A62, .75], sun: [0xFFE2B8, 1.35, [-40, 60, 25]], rim: .45 },
  golden: { sky: 'golden', fog: 0xEFC4A0, near: 70, far: 180, hemi: [0xFFE0C0, 0x8A5A42, .62], sun: [0xFFC08A, 1.25, [-70, 35, 35]], rim: .35 },
  dusk: { sky: 'dusk', fog: 0x3A2852, near: 50, far: 160, hemi: [0x8A7AC8, 0x3A2440, .6], sun: [0xFF9F7A, .5, [-70, 22, 10]], rim: .5 },
  night: { sky: 'night', fog: 0x0E0B22, near: 50, far: 170, hemi: [0x4A4F8A, 0x140C18, .42], sun: [0x9FB4FF, .22, [30, 60, -20]], rim: .2 },
};
function setLook(k) {
  const L = LOOKS[k]; scene.background = skyTex(L.sky);
  scene.fog.color.set(L.fog).convertSRGBToLinear(); scene.fog.near = L.near; scene.fog.far = L.far;
  hemi.color.set(L.hemi[0]); hemi.groundColor.set(L.hemi[1]); hemi.intensity = L.hemi[2];
  sun.color.set(L.sun[0]); sun.intensity = L.sun[1]; sun.position.set(...L.sun[2]); rim.intensity = L.rim;
}

/* ---------- particle sprites (smoke, flashes, fire, sparks) ---------- */
const TEX = {
  smoke: canvasTex(128, 128, g => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.5, 'rgba(235,235,235,.55)'); gr.addColorStop(1, 'rgba(230,230,230,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }),
  fire: canvasTex(128, 128, g => { const gr = g.createRadialGradient(64, 70, 2, 64, 64, 62); gr.addColorStop(0, 'rgba(255,250,210,1)'); gr.addColorStop(.25, 'rgba(255,200,90,.95)'); gr.addColorStop(.6, 'rgba(255,90,30,.55)'); gr.addColorStop(1, 'rgba(180,30,10,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }),
  spark: canvasTex(64, 64, g => { const gr = g.createRadialGradient(32, 32, 1, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.3, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }),
  gem: canvasTex(128, 128, g => { const gr = g.createRadialGradient(64, 64, 2, 64, 64, 60); gr.addColorStop(0, 'rgba(255,248,220,1)'); gr.addColorStop(.25, 'rgba(255,231,168,.9)'); gr.addColorStop(1, 'rgba(255,194,122,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 4; g.beginPath(); g.moveTo(64, 8); g.lineTo(64, 120); g.moveTo(8, 64); g.lineTo(120, 64); g.stroke(); }),
};
let PARTS = [];
function sprite(parent, tex, color, x, y, z, size, additive, opacity = 1) {
  const m = new THREE.SpriteMaterial({ map: tex, color, transparent: true, depthWrite: false, opacity, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, fog: !additive });
  const s = new THREE.Sprite(m); s.position.set(x, y, z); s.scale.set(size, size, 1); parent.add(s); return s;
}
function addPart(obj, max, upd) { PARTS.push({ obj, life: 0, max, upd }); }
function stepParts(dt) {
  for (let i = PARTS.length - 1; i >= 0; i--) {
    const p = PARTS[i]; p.life += dt; p.upd(p, dt, p.life / p.max);
    if (p.life > p.max) { p.obj.parent && p.obj.parent.remove(p.obj); p.obj.material && p.obj.material.dispose(); PARTS.splice(i, 1); }
  }
}
function clearParts() { PARTS.forEach(p => { p.obj.parent && p.obj.parent.remove(p.obj); p.obj.material && p.obj.material.dispose(); }); PARTS = []; }
function puff(parent, x, y, z, big = 1, color = 0xEDE7E0, vy = 1) {
  const s = sprite(parent, TEX.smoke, color, x, y, z, rnd(2, 3.5) * big, false, .9);
  const up = rnd(.6, 1.6) * vy, grow = rnd(1.4, 2.4) * big;
  addPart(s, rnd(6, 10), (p, dt, f) => { s.position.y += up * dt; s.position.x += dt * .8; const k = s.scale.x + grow * dt; s.scale.set(k, k, 1); s.material.opacity = .9 * (1 - f); });
}
function flash(parent, x, y, z, color) {
  const s = sprite(parent, TEX.spark, color || pick([0xFFF3C4, 0xFFC27A, 0xFFFFFF]), x, y, z, 1.4, true);
  addPart(s, .18, (p, dt, f) => { const k = 1.4 + f * 6; s.scale.set(k, k, 1); s.material.opacity = 1 - f; });
}
function flame(parent, x, y, z, size = 3, rise = 3) {
  const s = sprite(parent, TEX.fire, pick([0xFFFFFF, 0xFFE0A0, 0xFFC080]), x, y, z, size, true, .95);
  const vx = rnd(-.5, .5), vz = rnd(-.5, .5);
  addPart(s, rnd(.6, 1.2), (p, dt, f) => { s.position.y += rise * dt * (1 + f); s.position.x += vx * dt; s.position.z += vz * dt; const k = size * (1 - f * .7); s.scale.set(k, k * 1.25, 1); s.material.opacity = .95 * (1 - f); });
}
function ember(parent, x, y, z, v, color = 0xFFB050, life = 1.6, grav = 6, size = .5) {
  const s = sprite(parent, TEX.spark, color, x, y, z, size, true); const vel = v.clone();
  addPart(s, life * rnd(.7, 1.2), (p, dt, f) => { vel.y -= grav * dt; s.position.addScaledVector(vel, dt); s.material.opacity = 1 - f; });
}

/* ---------- audio: synthesized bangs, crackle and whoosh (Web Audio, no files) ---------- */
let AC = null;
function noiseHit({ gain = .5, freq = 2000, decay = 5, len = .35, type = 'lowpass', sweep = 0 } = {}) {
  if (window.__mute || !SFXON) return;
  AC = AC || new (window.AudioContext || window.webkitAudioContext)();
  const n = Math.floor(AC.sampleRate * len), buf = AC.createBuffer(1, n, AC.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay);
  const src = AC.createBufferSource(); src.buffer = buf;
  const f = AC.createBiquadFilter(); f.type = type; f.frequency.value = freq;
  if (sweep) f.frequency.exponentialRampToValueAtTime(Math.max(60, freq * sweep), AC.currentTime + len);
  const g = AC.createGain(); g.gain.value = gain; src.connect(f).connect(g).connect(AC.destination); src.start();
}
let SFXON = true;
const bang = (gain = .5, low = false) => noiseHit({ gain, freq: low ? 380 : rnd(1400, 3200), decay: low ? 2 : 5 });
const crackle = () => noiseHit({ gain: .12, freq: rnd(2500, 5000), decay: 9, len: .08, type: 'highpass' });
const whoosh = () => noiseHit({ gain: .18, freq: 600, decay: .6, len: 1.1, type: 'bandpass', sweep: 5 });

/* ---------- speech: one Spanish voice; hide audio if none ---------- */
let VOZ = null;
function rankVoice(v) {
  const n = (v.name + ' ' + v.lang).toLowerCase(); if (!/^es/.test(v.lang.toLowerCase())) return -1; let s = 0;
  if (/natural|online/.test(n)) s += 50; if (/google/.test(n)) s += 30;
  return s + (({ 'es-es': 9, 'es-mx': 8, 'es-us': 6, 'es-419': 4 })[v.lang.toLowerCase()] || 1);
}
function pickVoice() { const vs = speechSynthesis.getVoices().filter(v => rankVoice(v) >= 0).sort((a, b) => rankVoice(b) - rankVoice(a)); VOZ = vs[0] || null; document.body.classList.toggle('no-tts', !VOZ); }
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; } else document.body.classList.add('no-tts');
function speak(t, slow) {
  if (!VOZ || window.__mute) return;
  speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t.replace(/[«»]/g, '')); u.voice = VOZ; u.lang = VOZ.lang; u.rate = slow ? .7 : .95; speechSynthesis.speak(u);
}
let lastLine = '';
function say(es, en, who = 'Nerea') { lastLine = es; $('#who').textContent = who; $('#lineEs').textContent = es; $('#lineEn').textContent = en; speak(es); }
$('#replay').onclick = () => speak(lastLine);
$('#slow').onclick = () => speak(lastLine, true);
$('#showText').onchange = e => document.body.classList.toggle('show-text', e.target.checked);

/* ---------- gems: six "Datos de Valencia" spread across the week ---------- */
const found = new Set();
function addGem(group, gem) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TEX.gem, transparent: true, depthWrite: false, depthTest: false, opacity: found.has(gem.id) ? .35 : 1 }));
  s.position.copy(gem.pos); s.scale.set(2.6, 2.6, 1); s.renderOrder = 10; s.userData.gem = gem; group.add(s); gem.sprite = s; return s;
}
function openGem(gem) {
  found.add(gem.id); gem.sprite.material.opacity = .35;
  $('#gemEs').textContent = gem.es; $('#gemEn').textContent = gem.en; $('#gemCount').textContent = `${found.size}/6`; $('#gemCard').hidden = false;
  speak(gem.es);
}
$('#gemClose').onclick = () => $('#gemCard').hidden = true;

/* ---------- camera: drag to orbit, wheel to zoom, idle drift ---------- */
const orbit = { th: .35, ph: 1.12, r: 92, tTh: .35, tPh: 1.12, tR: 92, target: new THREE.Vector3(0, 17, -2), minR: 30, maxR: 125, minPh: .55, maxPh: 1.5, drift: .02 };
let drag = null, moved = 0, shake = 0;
const cv = renderer.domElement;
cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; moved = 0; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove', e => {
  if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved += Math.abs(dx) + Math.abs(dy); orbit.tTh -= dx * .005; orbit.tPh = Math.min(orbit.maxPh, Math.max(orbit.minPh, orbit.tPh - dy * .004)); drag = { x: e.clientX, y: e.clientY }; }
  else cv.style.cursor = hitGem(e) ? 'pointer' : 'grab';
});
cv.addEventListener('pointerup', e => { if (moved < 6) { const g = hitGem(e); if (g) openGem(g); } drag = null; });
cv.addEventListener('wheel', e => { e.preventDefault(); orbit.tR = Math.min(orbit.maxR, Math.max(orbit.minR, orbit.tR + e.deltaY * .05)); }, { passive: false });
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
function hitGem(e) {
  if (!CUR) return null;
  const r = cv.getBoundingClientRect(); mouse.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  ray.setFromCamera(mouse, camera); const h = ray.intersectObjects(CUR.gems.map(g => g.sprite)); return h[0] && h[0].object.userData.gem;
}

/* ---------- scenes ---------- */
const DEFS = {}, BUILT = {};
let CUR = null, CURKEY = null;
function defineScene(key, def) { DEFS[key] = def; }
function disposeGroup(g) { g.traverse(o => { if (o.geometry) o.geometry.dispose(); }); g.parent && g.parent.remove(g); }
function enterScene(key) {
  if (CUR && CUR.onExit) CUR.onExit();
  clearParts(); $('#gemCard').hidden = true;
  const def = DEFS[key];
  if (!BUILT[key]) { const g = new THREE.Group(); scene.add(g); const r = def.build(g) || {}; BUILT[key] = Object.assign({ group: g, anims: [], gems: [] }, r); (def.gems || []).forEach(gm => BUILT[key].gems.push(gm)); BUILT[key].gems.forEach(gm => addGem(g, gm)); }
  for (const k in BUILT) BUILT[k].group.visible = k === key;
  CUR = BUILT[key]; CURKEY = key;
  setLook(def.look);
  const c = def.cam; Object.assign(orbit, { tTh: c.th, th: c.th, tPh: c.ph, ph: c.ph, tR: c.r, r: c.r, minR: c.minR || 30, maxR: c.maxR || 125, minPh: c.minPh || .55, maxPh: c.maxPh || 1.5, drift: c.drift ?? .02 });
  orbit.target.set(...c.target);
  $('#place').innerHTML = def.place;
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.k === key));
  const btn = $('#goBtn');
  if (CUR.action) { btn.hidden = false; btn.disabled = false; btn.textContent = CUR.action.label; btn.onclick = () => CUR.action.fn(btn); } else btn.hidden = true;
  if (CUR.onEnter) CUR.onEnter();
  say(...def.line);
}
function rebuild(keys) { keys.forEach(k => { if (BUILT[k]) { disposeGroup(BUILT[k].group); delete BUILT[k]; } }); }

/* ---------- loop ---------- */
function resize() { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
window.addEventListener('resize', resize); resize();
const clockT = new THREE.Clock();
function frame() {
  const dt = Math.min(clockT.getDelta(), .05) * (window.__timeScale || 1), t = clockT.elapsedTime;
  if (!drag) orbit.tTh += dt * orbit.drift;
  orbit.th += (orbit.tTh - orbit.th) * .08; orbit.ph += (orbit.tPh - orbit.ph) * .08; orbit.r += (orbit.tR - orbit.r) * .08;
  camera.position.set(orbit.target.x + orbit.r * Math.sin(orbit.ph) * Math.sin(orbit.th), orbit.target.y + orbit.r * Math.cos(orbit.ph), orbit.target.z + orbit.r * Math.sin(orbit.ph) * Math.cos(orbit.th));
  if (shake > 0) { camera.position.x += rnd(-1, 1) * shake; camera.position.y += rnd(-1, 1) * shake; shake *= .9; if (shake < .01) shake = 0; }
  camera.lookAt(orbit.target);
  if (CUR) { CUR.anims.forEach(f => f(t, dt)); CUR.gems.forEach((g, i) => { const k = 2.3 + Math.sin(t * 3 + i) * .35; g.sprite.scale.set(k, k, 1); }); }
  stepParts(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
