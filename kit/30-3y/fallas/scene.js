/* ===================== ¡Fallas! · 3D prototype: Plaza del Ayuntamiento ===================== */
const $ = s => document.querySelector(s);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];

/* ---------- renderer / scene ---------- */
const host = $('#view3d');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
host.appendChild(renderer.domElement);

const scene = new THREE.Scene();
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
}
scene.background = canvasTex(4, 256, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#5B8FD6'); gr.addColorStop(.55, '#A9C9EE'); gr.addColorStop(.85, '#F4D7B5'); gr.addColorStop(1, '#F6C89A');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
});
scene.fog = new THREE.Fog(0xE9D3C0, 70, 170);

const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 400);
scene.add(new THREE.HemisphereLight(0xCFE3FF, 0xB98A62, 0.75));
const sun = new THREE.DirectionalLight(0xFFE2B8, 1.35);
sun.position.set(-40, 60, 25); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 10, far: 160 });
sun.shadow.bias = -0.0006;
scene.add(sun);

const M = (color, o = {}) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .78, metalness: 0 }, o)); m.color.convertSRGBToLinear(); return m; };
function mesh(geo, mat, x = 0, y = 0, z = 0, parent = scene) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}

/* ---------- ground: paving with a lighter centre ---------- */
const paving = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#CDBBA4'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 64) {
    const off = (y / 32) % 2 ? 32 : 0, v = 190 + Math.random() * 25;
    g.fillStyle = `rgb(${v},${v - 14},${v - 32})`; g.fillRect(x + off + 1, y + 1, 62, 30);
  }
});
paving.wrapS = paving.wrapT = THREE.RepeatWrapping; paving.repeat.set(14, 14);
const ground = mesh(new THREE.PlaneGeometry(240, 240), M(0xffffff, { map: paving }));
ground.rotation.x = -Math.PI / 2; ground.castShadow = false;

/* ---------- façades ---------- */
function facadeTex(base, accent, floors, cols) {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    const fh = h / floors, cw = w / cols;
    for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
      const x = c * cw + cw * .28, y = f * fh + fh * .22, ww = cw * .44, hh = fh * .58;
      g.fillStyle = accent; g.fillRect(x - 3, y - 3, ww + 6, hh + 6);
      g.fillStyle = f === floors - 1 ? '#5B4636' : '#2E3A55'; g.fillRect(x, y, ww, hh);
      g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x, y, ww * .45, hh);
      if (f < floors - 1) { g.fillStyle = '#2B2B33'; g.fillRect(x - 6, y + hh, ww + 12, 4); }
    }
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, h - fh * .12, w, fh * .12);
  });
}
const PALETTE = [['#E8C9A0', '#F6EBDD'], ['#D99A72', '#F2DEC8'], ['#F0DDB8', '#FFFFFF'], ['#C9B091', '#EFE3D2'], ['#E7B984', '#FAF0E2']];
function block(x, z, w, d, h, rotY) {
  const [b, a] = pick(PALETTE), floors = Math.round(h / 3.4), cols = Math.max(2, Math.round(w / 3.2));
  const t = facadeTex(b, a, floors, cols);
  const side = M(b), roof = M(0xA4553A);
  const mats = [side, side, roof, side, M(0xffffff, { map: t }), M(0xffffff, { map: t })];
  const m = mesh(new THREE.BoxGeometry(w, h, d), mats, x, h / 2, z);
  m.rotation.y = rotY;
  const cornice = mesh(new THREE.BoxGeometry(w + .6, .5, d + .6), M(a), 0, h / 2, 0, m);
  cornice.castShadow = false;
  return m;
}
// ring of buildings around the square (the Ayuntamiento goes on the north side)
const RING = 62;
for (let i = 0; i < 18; i++) {
  const a = i / 18 * Math.PI * 2;
  if (Math.abs(Math.atan2(Math.sin(a - Math.PI * 1.5), Math.cos(a - Math.PI * 1.5))) < .45) continue; // gap for the town hall
  const x = Math.cos(a) * RING, z = Math.sin(a) * RING;
  block(x, z, rnd(16, 21), 12, rnd(18, 27), -a + Math.PI / 2);
}

/* ---------- the Ayuntamiento with its clock tower ---------- */
const town = new THREE.Group(); town.position.set(0, 0, -58); scene.add(town);
const stone = M(0xE3CBA7), stoneD = M(0xC9AE88), slate = M(0x5C6E7E, { roughness: .5 });
const tFac = facadeTex('#E3CBA7', '#F7EAD5', 4, 9);
mesh(new THREE.BoxGeometry(46, 20, 14), [stone, stone, stoneD, stone, M(0xffffff, { map: tFac }), stone], 0, 10, 0, town);
mesh(new THREE.BoxGeometry(14, 30, 15), stone, 0, 15, 1, town);
mesh(new THREE.BoxGeometry(15, 1, 16), stoneD, 0, 30.5, 1, town);
mesh(new THREE.CylinderGeometry(4.2, 5.2, 8, 8), stone, 0, 35, 1, town);
mesh(new THREE.SphereGeometry(4.3, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), slate, 0, 39, 1, town);
mesh(new THREE.ConeGeometry(.6, 5, 8), slate, 0, 45, 1, town);
const clockFace = canvasTex(128, 128, (g) => {
  g.fillStyle = '#FFF8EC'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill();
  g.strokeStyle = '#3A2E24'; g.lineWidth = 6; g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.fillStyle = '#3A2E24'; g.fillRect(64 + Math.sin(a) * 48 - 3, 64 - Math.cos(a) * 48 - 3, 6, 6); }
  g.lineWidth = 7; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + 30, 64); g.stroke(); // 2 o'clock-ish: hour hand
  g.lineWidth = 4; g.beginPath(); g.moveTo(64, 64); g.lineTo(64, 18); g.stroke();
});
const clock = mesh(new THREE.CircleGeometry(3.2, 32), M(0xffffff, { map: clockFace }), 0, 25, 8.6, town); clock.castShadow = false;
// balcony where the fallera mayor gives the signal
mesh(new THREE.BoxGeometry(12, .5, 3), stoneD, 0, 9, 8.5, town);
for (let i = -5; i <= 5; i++) mesh(new THREE.CylinderGeometry(.12, .12, 1.4, 6), M(0x2B2B33), i * 1.1, 9.9, 9.8, town);
const flagMat = c => M(c, { side: THREE.DoubleSide });
[[-4, 0xC60B1E], [0, 0xF1BF00], [4, 0x1F4FA0]].forEach(([x, c]) => {
  mesh(new THREE.CylinderGeometry(.08, .08, 5), M(0x333333), x, 33, 9, town);
  const f = mesh(new THREE.PlaneGeometry(2.6, 1.6), flagMat(c), x + 1.3, 34.6, 9, town); f.userData.flag = true;
});

/* ---------- the falla monument (see ninots.js) ---------- */
const FALLA = buildFalla(scene);
const rim = new THREE.DirectionalLight(0xC9DAFF, .45); rim.position.set(40, 30, -40); scene.add(rim);

/* ---------- barriers, the rope of firecrackers, and the crowd ---------- */
const metal = M(0xB8BEC8, { metalness: .6, roughness: .35 });
const BARRIER_R = 30;
for (let i = 0; i < 40; i++) {
  const a = i / 40 * Math.PI * 2, b = new THREE.Group();
  b.position.set(Math.cos(a) * BARRIER_R, 0, Math.sin(a) * BARRIER_R); b.rotation.y = -a + Math.PI / 2; scene.add(b);
  mesh(new THREE.BoxGeometry(4.4, .12, .12), metal, 0, 1.1, 0, b);
  mesh(new THREE.BoxGeometry(4.4, .12, .12), metal, 0, .3, 0, b);
  for (let k = -2; k <= 2; k++) mesh(new THREE.BoxGeometry(.06, .8, .06), metal, k * 1, .7, 0, b);
}
// firecracker strings on poles across the south half of the square
const poles = [[-20, 18], [0, 24], [20, 18], [-24, 0], [24, 0]];
poles.forEach(([x, z]) => mesh(new THREE.CylinderGeometry(.15, .2, 7, 8), M(0x6B5A4A), x, 3.5, z));
const crackers = [];
const crackerMat = M(0xD8202E, { roughness: .5 });
function stringBetween(a, b) {
  const [x1, z1] = a, [x2, z2] = b, n = 18;
  for (let i = 1; i < n; i++) {
    const t = i / n, sag = Math.sin(t * Math.PI) * 1.6;
    const c = mesh(new THREE.CylinderGeometry(.13, .13, .6, 6), crackerMat, x1 + (x2 - x1) * t, 6.6 - sag - .5, z1 + (z2 - z1) * t);
    c.castShadow = false; crackers.push(c);
  }
}
for (let i = 0; i < poles.length - 1; i++) stringBetween(poles[i], poles[i + 1]);
stringBetween([-24, 0], [-20, 18]); stringBetween([24, 0], [20, 18]);

// crowd: instanced bodies and heads behind the barriers
const CROWD = 420;
const bodyGeo = new THREE.CylinderGeometry(.42, .5, 1.6, 8), headGeo = new THREE.SphereGeometry(.34, 10, 8), skirtGeo = new THREE.ConeGeometry(.85, 1.5, 12);
const bodies = new THREE.InstancedMesh(bodyGeo, M(0xffffff), CROWD), heads = new THREE.InstancedMesh(headGeo, M(0xffffff), CROWD);
bodies.castShadow = heads.castShadow = true;
const SHIRTS = [0x2A6FDB, 0xF2F2F2, 0x1E1E28, 0xD8323C, 0x5FE0C8, 0xFFC27A, 0x7A4FD6, 0x3E8E5E, 0xE85D9E];
const SKINS = [0xF2C6A0, 0xE0AC85, 0xC68863, 0x8D5A3B, 0xF7D6B8];
const dummy = new THREE.Object3D(), col = new THREE.Color(), crowdBase = [];
for (let i = 0; i < CROWD; i++) {
  const a = Math.random() * Math.PI * 2, r = rnd(BARRIER_R + 1.2, BARRIER_R + 13);
  const x = Math.cos(a) * r, z = Math.sin(a) * r;
  if (z < -44 && Math.abs(x) < 26) { i--; continue; }
  const s = rnd(.9, 1.12);
  crowdBase.push({ x, z, s, ph: Math.random() * 6 });
  bodies.setColorAt(i, col.setHex(pick(SHIRTS)).convertSRGBToLinear());
  heads.setColorAt(i, col.setHex(pick(SKINS)).convertSRGBToLinear());
}
scene.add(bodies, heads);
// a few falleras in traditional dress near the balcony
const falleras = [];
for (let i = 0; i < 9; i++) {
  const g = new THREE.Group(); g.position.set(-12 + i * 3, 0, -40 + Math.random()); scene.add(g);
  mesh(skirtGeo, lacq(pick([0xF6D9A8, 0xBFD8F2, 0xF2C1D1, 0xE9E1F7])), 0, .75, 0, g);
  mesh(new THREE.CylinderGeometry(.3, .4, .9, 8), lacq(0xFFF4E2), 0, 1.9, 0, g);
  mesh(new THREE.SphereGeometry(.3, 10, 8), lacq(pick(SKINS)), 0, 2.6, 0, g);
  [-1, 1].forEach(s => mesh(new THREE.SphereGeometry(.2, 8, 6), lacq(0x3B2A20), s * .32, 2.65, -.05, g)); // side buns
  mesh(new THREE.ConeGeometry(.12, .35, 6), M(0xF1BF00, { metalness: .7, roughness: .3 }), 0, 3, -.15, g); // peineta
  falleras.push(g);
}

/* ---------- buñuelos stand (a gem lives here) ---------- */
const stand = new THREE.Group(); stand.position.set(38, 0, 22); stand.rotation.y = -2.2; scene.add(stand);
mesh(new THREE.BoxGeometry(5, 2.2, 2.4), M(0xF4E6D0), 0, 1.1, 0, stand);
const awning = canvasTex(256, 64, (g, w, h) => { for (let x = 0; x < w; x += 32) { g.fillStyle = (x / 32) % 2 ? '#FFFFFF' : '#D8323C'; g.fillRect(x, 0, 32, h); } });
const aw = mesh(new THREE.BoxGeometry(5.6, .2, 3), M(0xffffff, { map: awning }), 0, 3.8, .3, stand); aw.rotation.x = .2;
[-2.5, 2.5].forEach(x => mesh(new THREE.CylinderGeometry(.08, .08, 3.8), M(0x6B5A4A), x, 1.9, 1.4, stand));
const sign = canvasTex(256, 64, (g) => { g.fillStyle = '#2E2A45'; g.fillRect(0, 0, 256, 64); g.fillStyle = '#FFC27A'; g.font = '700 30px Manrope, sans-serif'; g.textAlign = 'center'; g.fillText('Bunyols · Buñuelos', 128, 42); });
mesh(new THREE.PlaneGeometry(4.4, 1.1), M(0xffffff, { map: sign }), 0, 2.8, 1.22, stand).castShadow = false;

// street sign in valenciano
const plaque = canvasTex(512, 160, (g) => {
  g.fillStyle = '#F7F1E6'; g.fillRect(0, 0, 512, 160); g.strokeStyle = '#1F4FA0'; g.lineWidth = 10; g.strokeRect(8, 8, 496, 144);
  g.fillStyle = '#1F4FA0'; g.font = '800 46px Manrope, sans-serif'; g.textAlign = 'center';
  g.fillText("Plaça de", 256, 66); g.fillText("l'Ajuntament", 256, 122);
});
const plaqueMesh = mesh(new THREE.PlaneGeometry(4, 1.25), M(0xffffff, { map: plaque }), -31.5, 4.5, 30.5);
plaqueMesh.rotation.y = Math.PI * .78; plaqueMesh.castShadow = false;
mesh(new THREE.CylinderGeometry(.1, .1, 4), M(0x333333), -31.5, 2, 30.5);

/* ---------- smoke + flashes for the mascletà ---------- */
const smokeTex = canvasTex(128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.5, 'rgba(235,235,235,.55)'); gr.addColorStop(1, 'rgba(230,230,230,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const smoke = [];
function puff(x, y, z, big = 1) {
  const mat = new THREE.SpriteMaterial({ map: smokeTex, color: 0xEDE7E0, transparent: true, depthWrite: false, opacity: .9, fog: true });
  const s = new THREE.Sprite(mat); s.position.set(x, y, z); const k = rnd(2, 3.5) * big; s.scale.set(k, k, 1);
  scene.add(s); smoke.push({ s, vy: rnd(.6, 1.6), grow: rnd(1.4, 2.4) * big, life: 0, max: rnd(6, 10) });
}
const flashLight = new THREE.PointLight(0xFFD27A, 0, 40); flashLight.position.set(0, 7, 12); scene.add(flashLight);
const flashGeo = new THREE.SphereGeometry(.7, 8, 6), flashes = [];
function flash(x, y, z) {
  const m = new THREE.Mesh(flashGeo, new THREE.MeshBasicMaterial({ color: pick([0xFFF3C4, 0xFFC27A, 0xFFFFFF]), transparent: true }));
  m.position.set(x, y, z); scene.add(m); flashes.push({ m, life: 0 });
}

/* ---------- audio: synthesized bangs (Web Audio, no files) ---------- */
let AC = null;
function bang(gainAmt = .5, low = false) {
  if (window.__mute) return;
  AC = AC || new (window.AudioContext || window.webkitAudioContext)();
  const n = AC.sampleRate * .35, buf = AC.createBuffer(1, n, AC.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, low ? 2 : 5);
  const src = AC.createBufferSource(); src.buffer = buf;
  const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = low ? 380 : rnd(1400, 3200);
  const g = AC.createGain(); g.gain.value = gainAmt;
  src.connect(f).connect(g).connect(AC.destination); src.start();
}

/* ---------- the show: a rhythm that builds to the terremoto ---------- */
let show = null;
function startMascleta() {
  if (show) return;
  $('#goBtn').disabled = true; $('#goBtn').textContent = '¡Pum, pum, pum!';
  say('Senyor pirotècnic, pot començar la mascletà!', 'The fallera mayor gives the signal from the balcony, in valenciano.', true);
  const order = crackers.slice();
  show = { t: 0, i: 0, order, next: 1.2 };
}
function stepShow(dt) {
  if (!show) return;
  show.t += dt;
  const n = show.order.length;
  while (show.t > show.next && show.i < n) {
    const c = show.order[show.i++];
    c.visible = false; flash(c.position.x, c.position.y, c.position.z); puff(c.position.x, c.position.y, c.position.z);
    const p = show.i / n;
    bang(.25 + p * .45);
    flashLight.intensity = 3 + p * 6;
    shake = Math.max(shake, .08 + p * .5);
    show.next += Math.max(.035, .32 * Math.pow(1 - p, 1.6)); // faster and faster
  }
  if (show.i >= n && !show.ended) { // terremoto: ground bursts
    show.ended = show.t;
    for (let k = 0; k < 26; k++) setTimeout(() => {
      const a = Math.random() * 6.28, r = rnd(4, 22);
      puff(Math.cos(a) * r, .8, Math.sin(a) * r + 6, 1.8); flash(Math.cos(a) * r, 1, Math.sin(a) * r + 6);
      bang(.8, true); shake = 1.1; flashLight.intensity = 10;
    }, k * 70);
    setTimeout(() => {
      say('¡Qué fuerte! Mañana a las dos volveremos a la plaza, ¿vale?', 'Your host sister: "That was intense! Tomorrow at two we\'ll come back to the square, OK?"');
      $('#goBtn').textContent = 'Otra vez'; $('#goBtn').disabled = false;
      $('#goBtn').onclick = () => { crackers.forEach(c => c.visible = true); show = null; $('#goBtn').textContent = '¡Que empiece la mascletà!'; $('#goBtn').onclick = startMascleta; };
    }, 3600);
  }
}

/* ---------- gems: "Datos de Valencia" sparkles ---------- */
const sparkTex = canvasTex(128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 2, 64, 64, 60);
  gr.addColorStop(0, 'rgba(255,248,220,1)'); gr.addColorStop(.25, 'rgba(255,231,168,.9)'); gr.addColorStop(1, 'rgba(255,194,122,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 4;
  g.beginPath(); g.moveTo(64, 8); g.lineTo(64, 120); g.moveTo(8, 64); g.lineTo(120, 64); g.stroke();
});
const GEMS = [
  { id: 'mascleta', pos: [0, 12.5, -47.5], es: 'Del 1 al 19 de marzo, a las dos de la tarde, hay una mascletà en esta plaza. Desde el balcón, la fallera mayor dice: «Senyor pirotècnic, pot començar la mascletà!».',
    en: 'Every day from 1 to 19 March at 2 p.m. there is a mascletà here: a daytime show judged by rhythm and noise, not by light. The fallera mayor starts it from the town-hall balcony, in valenciano.' },
  { id: 'ninots', pos: FALLA.spots.giantFace.toArray(), es: 'Los ninots son las figuras de la falla. Son de cartón, madera y corcho. Muchos son caricaturas de políticos y famosos.',
    en: 'Ninots are the figures that make up a falla. Many are satirical caricatures. Artists work on them for most of the year.' },
  { id: 'indultat', pos: FALLA.spots.indultat.toArray(), es: 'Cada año, la gente vota para salvar un ninot del fuego. Es el ninot indultat, y va al Museo Fallero.',
    en: 'Each year the public votes to save one ninot from the fire: the ninot indultat ("pardoned ninot"). It goes to the Fallas Museum.' },
  { id: 'cremà', pos: FALLA.spots.plinth.toArray(), es: 'La noche del 19 de marzo es la cremà: queman casi todas las fallas de la ciudad. ¡Todo el trabajo del año termina en el fuego!',
    en: 'On the night of 19 March, the cremà, almost every falla in the city is burned. The town-square falla burns last.' },
  { id: 'valenciano', pos: [-31.5, 6, 30.5], es: 'En Valencia se hablan dos idiomas: castellano y valenciano. «Plaça de l\'Ajuntament» significa «Plaza del Ayuntamiento».',
    en: 'Valencia has two official languages, Spanish and Valencian. Street signs are often in valenciano.' },
  { id: 'bunyols', pos: [38, 5, 22], es: 'En las Fallas, la gente come buñuelos de calabaza con chocolate caliente. En valenciano se llaman «bunyols».',
    en: 'The festival snack: pumpkin fritters (buñuelos de calabaza) dipped in hot chocolate.' },
];
const found = new Set();
GEMS.forEach(gm => {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTex, transparent: true, depthWrite: false, depthTest: false }));
  s.position.set(...gm.pos); s.scale.set(2.6, 2.6, 1); s.userData.gem = gm; s.renderOrder = 10; scene.add(s); gm.sprite = s;
});
function openGem(gm) {
  found.add(gm.id); gm.sprite.material.opacity = .35;
  $('#gemEs').textContent = gm.es; $('#gemEn').textContent = gm.en;
  $('#gemCount').textContent = `${found.size}/6`;
  $('#gemCard').hidden = false;
  speak(gm.es);
}
$('#gemClose').onclick = () => $('#gemCard').hidden = true;

/* ---------- speech (one Spanish voice; hide audio if none) ---------- */
let VOZ = null;
function rankVoice(v) {
  const n = (v.name + ' ' + v.lang).toLowerCase(); let s = 0;
  if (!/^es/.test(v.lang.toLowerCase())) return -1;
  if (/natural|online/.test(n)) s += 50; if (/google/.test(n)) s += 30;
  s += ({ 'es-mx': 8, 'es-us': 6, 'es-419': 4, 'es-es': 9 })[v.lang.toLowerCase()] || 1; // Valencia: Spain voice preferred here
  return s;
}
function pickVoice() { const vs = speechSynthesis.getVoices().filter(v => rankVoice(v) >= 0).sort((a, b) => rankVoice(b) - rankVoice(a)); VOZ = vs[0] || null; document.body.classList.toggle('no-tts', !VOZ); }
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; } else document.body.classList.add('no-tts');
function speak(t, slow) {
  if (!VOZ || window.__mute) return;
  speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t.replace(/[«»]/g, '')); u.voice = VOZ; u.lang = VOZ.lang; u.rate = slow ? .7 : .95; speechSynthesis.speak(u);
}
let lastLine = '';
function say(es, en, noSpeak) {
  lastLine = es; $('#lineEs').textContent = es; $('#lineEn').textContent = en;
  if (!noSpeak) speak(es); else speak(es);
}
$('#replay').onclick = () => speak(lastLine);
$('#slow').onclick = () => speak(lastLine, true);
$('#showText').onchange = e => document.body.classList.toggle('show-text', e.target.checked);

/* ---------- camera: drag to orbit, wheel to zoom, gentle idle drift ---------- */
const orbit = { th: .35, ph: 1.12, r: 92, tTh: .35, tPh: 1.12, tR: 92, target: new THREE.Vector3(0, 17, -2) };
let drag = null, moved = 0, shake = 0;
renderer.domElement.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; moved = 0; renderer.domElement.setPointerCapture(e.pointerId); });
renderer.domElement.addEventListener('pointermove', e => {
  if (drag) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved += Math.abs(dx) + Math.abs(dy);
    orbit.tTh -= dx * .005; orbit.tPh = Math.min(1.5, Math.max(.55, orbit.tPh - dy * .004));
    drag = { x: e.clientX, y: e.clientY };
  } else hover(e);
});
renderer.domElement.addEventListener('pointerup', e => { if (moved < 6) click(e); drag = null; });
renderer.domElement.addEventListener('wheel', e => { e.preventDefault(); orbit.tR = Math.min(125, Math.max(30, orbit.tR + e.deltaY * .05)); }, { passive: false });

const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
function hitGem(e) {
  const r = renderer.domElement.getBoundingClientRect();
  mouse.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  ray.setFromCamera(mouse, camera);
  const h = ray.intersectObjects(GEMS.map(g => g.sprite));
  return h[0] && h[0].object.userData.gem;
}
function hover(e) { renderer.domElement.style.cursor = hitGem(e) ? 'pointer' : 'grab'; }
function click(e) { const g = hitGem(e); if (g) openGem(g); }

/* ---------- loop ---------- */
function resize() { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
window.addEventListener('resize', resize); resize();
const clockT = new THREE.Clock();
function frame() {
  const dt = Math.min(clockT.getDelta(), .05) * (window.__timeScale || 1), t = clockT.elapsedTime;
  if (!drag) orbit.tTh += dt * .02;
  orbit.th += (orbit.tTh - orbit.th) * .08; orbit.ph += (orbit.tPh - orbit.ph) * .08; orbit.r += (orbit.tR - orbit.r) * .08;
  camera.position.set(orbit.target.x + orbit.r * Math.sin(orbit.ph) * Math.sin(orbit.th), orbit.target.y + orbit.r * Math.cos(orbit.ph), orbit.target.z + orbit.r * Math.sin(orbit.ph) * Math.cos(orbit.th));
  if (shake > 0) { camera.position.x += rnd(-1, 1) * shake; camera.position.y += rnd(-1, 1) * shake; shake *= .9; if (shake < .01) shake = 0; }
  camera.lookAt(orbit.target);

  // crowd idles (and jumps during the show)
  const excite = show ? 1 : 0;
  crowdBase.forEach((c, i) => {
    const hop = Math.max(0, Math.sin(t * (2 + excite * 6) + c.ph)) * (.05 + excite * .35);
    dummy.position.set(c.x, .8 * c.s + hop, c.z); dummy.scale.setScalar(c.s); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); bodies.setMatrixAt(i, dummy.matrix);
    dummy.position.y = 1.95 * c.s + hop; dummy.updateMatrix(); heads.setMatrixAt(i, dummy.matrix);
  });
  bodies.instanceMatrix.needsUpdate = heads.instanceMatrix.needsUpdate = true;

  FALLA.anims.forEach(f => f(t));
  scene.traverse(o => { if (o.userData.flag) o.rotation.y = Math.sin(t * 2 + o.position.x) * .25; });
  GEMS.forEach((g, i) => { const k = 2.3 + Math.sin(t * 3 + i) * .35; g.sprite.scale.set(k, k, 1); });

  stepShow(dt);
  for (let i = smoke.length - 1; i >= 0; i--) {
    const p = smoke[i]; p.life += dt; p.s.position.y += p.vy * dt; p.s.position.x += dt * .8;
    const k = p.s.scale.x + p.grow * dt; p.s.scale.set(k, k, 1); p.s.material.opacity = .9 * (1 - p.life / p.max);
    if (p.life > p.max) { scene.remove(p.s); p.s.material.dispose(); smoke.splice(i, 1); }
  }
  for (let i = flashes.length - 1; i >= 0; i--) {
    const f = flashes[i]; f.life += dt; f.m.scale.setScalar(1 + f.life * 10); f.m.material.opacity = 1 - f.life / .18;
    if (f.life > .18) { scene.remove(f.m); f.m.material.dispose(); flashes.splice(i, 1); }
  }
  flashLight.intensity *= .86;
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();

$('#goBtn').onclick = startMascleta;
say('¡Ya son casi las dos! Aquí estaremos muy bien para ver la mascletà.', 'Your host sister: "It\'s almost two! We\'ll have a great view of the mascletà from here."');
window.__fallas = { startMascleta, openGem, GEMS, found }; window.__orbit = orbit;
