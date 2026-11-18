/* ===================== SCENES: plaza, calle, ofrenda, bunyols, cremà ===================== */
const STATE = {};
function drawThemes() { const ks = shuffle(Object.keys(THEMES)); STATE.theme = ks[0]; STATE.street = ks[1]; STATE.infantil = ks[2]; }
drawThemes();

/* ---------- shared city pieces ---------- */
const PALETTE = [['#E8C9A0', '#F6EBDD'], ['#D99A72', '#F2DEC8'], ['#F0DDB8', '#FFFFFF'], ['#C9B091', '#EFE3D2'], ['#E7B984', '#FAF0E2'], ['#E9A9A0', '#FBEDE6']];
function facadeTex(base, accent, floors, cols, lit) {
  const wins = [];
  const map = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    const fh = h / floors, cw = w / cols;
    for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
      const x = c * cw + cw * .28, y = f * fh + fh * .22, ww = cw * .44, hh = fh * .58, on = lit && f < floors - 1 && Math.random() < .5;
      wins.push([x, y, ww, hh, on, f === floors - 1]);
      g.fillStyle = accent; g.fillRect(x - 3, y - 3, ww + 6, hh + 6);
      g.fillStyle = f === floors - 1 ? '#5B4636' : on ? '#FFD98A' : '#2E3A55'; g.fillRect(x, y, ww, hh);
      g.fillStyle = 'rgba(255,255,255,.16)'; g.fillRect(x, y, ww * .45, hh);
      if (f < floors - 1) { g.fillStyle = '#2B2B33'; g.fillRect(x - 6, y + hh, ww + 12, 4); for (let k = 0; k < 6; k++) g.fillRect(x - 5 + k * (ww + 10) / 5, y + hh - 9, 2, 9); }
    }
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, h - fh * .12, w, fh * .12);
  });
  let emis = null;
  if (lit) emis = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); wins.forEach(([x, y, ww, hh, on, shop]) => { if (on || shop) { g.fillStyle = shop ? '#FFB86A' : '#FFD98A'; g.fillRect(x, y, ww, hh); } }); });
  return { map, emis };
}
function block(parent, x, z, w, d, h, rotY, lit) {
  const [b, a] = pick(PALETTE), floors = Math.max(3, Math.round(h / 3.4)), cols = Math.max(2, Math.round(w / 3.2));
  const { map, emis } = facadeTex(b, a, floors, cols, lit);
  const face = M(0xffffff, { map }); if (lit) { face.emissiveMap = emis; face.emissive = new THREE.Color(0xffffff); face.emissiveIntensity = .9; }
  const side = M(b), roof = M(0xA4553A);
  const m = mesh(new THREE.BoxGeometry(w, h, d), [side, side, roof, side, face, face], x, h / 2, z, parent); m.rotation.y = rotY;
  mesh(new THREE.BoxGeometry(w + .6, .5, d + .6), M(a), 0, h / 2, 0, m).castShadow = false;
  return m;
}
function pavingTex(base = [190, 176, 158], rep = 14) {
  const t = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = `rgb(${base.map(v => v - 20)})`; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 64) { const off = (y / 32) % 2 ? 32 : 0, v = rnd(-12, 12); g.fillStyle = `rgb(${base[0] + v},${base[1] + v},${base[2] + v})`; g.fillRect(x + off + 1, y + 1, 62, 30); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); return t;
}
function ground(parent, size, tex) { const g = mesh(new THREE.PlaneGeometry(size, size), M(0xffffff, { map: tex }), 0, 0, 0, parent); g.rotation.x = -Math.PI / 2; g.castShadow = false; return g; }
const SHIRTS = [0x2A6FDB, 0xF2F2F2, 0x1E1E28, 0xD8323C, 0x5FE0C8, 0xFFC27A, 0x7A4FD6, 0x3E8E5E, 0xE85D9E];
const SKINS = [0xF2C6A0, 0xE0AC85, 0xC68863, 0x8D5A3B, 0xF7D6B8];
function crowd(parent, n, sampler) {
  const bodies = new THREE.InstancedMesh(new THREE.CylinderGeometry(.42, .5, 1.6, 8), M(0xffffff), n);
  const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(.34, 10, 8), M(0xffffff), n);
  bodies.castShadow = heads.castShadow = true;
  const col = new THREE.Color(), base = []; let guard = 0;
  while (base.length < n && guard++ < n * 30) { const p = sampler(); if (!p) continue; const i = base.length; base.push({ x: p[0], z: p[1], s: rnd(.9, 1.12), ph: Math.random() * 6 }); bodies.setColorAt(i, col.setHex(pick(SHIRTS)).convertSRGBToLinear()); heads.setColorAt(i, col.setHex(pick(SKINS)).convertSRGBToLinear()); }
  bodies.count = heads.count = base.length; parent.add(bodies, heads);
  const d = new THREE.Object3D(), C = { excite: 0 };
  C.update = t => {
    base.forEach((c, i) => {
      const hop = Math.max(0, Math.sin(t * (2 + C.excite * 6) + c.ph)) * (.05 + C.excite * .35);
      d.position.set(c.x, .8 * c.s + hop, c.z); d.scale.setScalar(c.s); d.updateMatrix(); bodies.setMatrixAt(i, d.matrix);
      d.position.y = 1.95 * c.s + hop; d.updateMatrix(); heads.setMatrixAt(i, d.matrix);
    });
    bodies.instanceMatrix.needsUpdate = heads.instanceMatrix.needsUpdate = true;
  };
  C.update(0); return C;
}
function barrierLine(parent, pts) {
  const metal = M(0xB8BEC8, { metalness: .6, roughness: .35 });
  pts.forEach(([x, z, r]) => { const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = r; parent.add(b);
    mesh(new THREE.BoxGeometry(4.4, .12, .12), metal, 0, 1.1, 0, b); mesh(new THREE.BoxGeometry(4.4, .12, .12), metal, 0, .3, 0, b);
    for (let k = -2; k <= 2; k++) mesh(new THREE.BoxGeometry(.06, .8, .06), metal, k, .7, 0, b); });
}
function barrierRing(parent, R, n, cx = 0, cz = 0) { const pts = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; pts.push([cx + Math.cos(a) * R, cz + Math.sin(a) * R, -a + Math.PI / 2]); } barrierLine(parent, pts); }
function person(spec, s = .2) { const n = ninot(randSpec(spec)); n.scale.setScalar(s); return n; }
function textPlane(parent, w, h, draw, x, y, z, ry = 0, cw = 512) {
  const t = canvasTex(cw, Math.round(cw * h / w), draw); const m = mesh(new THREE.PlaneGeometry(w, h), M(0xffffff, { map: t }), x, y, z, parent); m.rotation.y = ry; m.castShadow = false; return m;
}
function burnable(F) { F.traverse(o => { if (o.isMesh) o.material = Array.isArray(o.material) ? o.material.map(m => m.clone()) : o.material.clone(); }); }

/* ---------- the town-hall square (day and night versions) ---------- */
function plazaWorld(g, night) {
  ground(g, 260, pavingTex());
  for (let i = 0; i < 18; i++) {
    const a = i / 18 * Math.PI * 2;
    if (Math.abs(Math.atan2(Math.sin(a - Math.PI * 1.5), Math.cos(a - Math.PI * 1.5))) < .45) continue;
    block(g, Math.cos(a) * 62, Math.sin(a) * 62, rnd(16, 21), 12, rnd(18, 27), -a + Math.PI / 2, night);
  }
  const town = new THREE.Group(); town.position.set(0, 0, -58); g.add(town);
  const stone = M(0xE3CBA7), stoneD = M(0xC9AE88), slate = M(0x5C6E7E, { roughness: .5 });
  const tf = facadeTex('#E3CBA7', '#F7EAD5', 4, 9, night), tface = M(0xffffff, { map: tf.map });
  if (night) { tface.emissiveMap = tf.emis; tface.emissive = new THREE.Color(0xffffff); tface.emissiveIntensity = 1; stone.emissive = new THREE.Color(0x3A2A18); }
  mesh(new THREE.BoxGeometry(46, 20, 14), [stone, stone, stoneD, stone, tface, stone], 0, 10, 0, town);
  mesh(new THREE.BoxGeometry(14, 30, 15), stone, 0, 15, 1, town);
  mesh(new THREE.BoxGeometry(15, 1, 16), stoneD, 0, 30.5, 1, town);
  mesh(new THREE.CylinderGeometry(4.2, 5.2, 8, 8), stone, 0, 35, 1, town);
  mesh(new THREE.SphereGeometry(4.3, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), slate, 0, 39, 1, town);
  mesh(new THREE.ConeGeometry(.6, 5, 8), slate, 0, 45, 1, town);
  const clockFace = canvasTex(128, 128, c => { c.fillStyle = '#FFF8EC'; c.beginPath(); c.arc(64, 64, 60, 0, 7); c.fill(); c.strokeStyle = '#3A2E24'; c.lineWidth = 6; c.stroke(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.fillStyle = '#3A2E24'; c.fillRect(64 + Math.sin(a) * 48 - 3, 64 - Math.cos(a) * 48 - 3, 6, 6); } c.lineWidth = 7; c.beginPath(); c.moveTo(64, 64); c.lineTo(94, 64); c.stroke(); c.lineWidth = 4; c.beginPath(); c.moveTo(64, 64); c.lineTo(64, 18); c.stroke(); });
  const cm = M(0xffffff, { map: clockFace }); if (night) { cm.emissiveMap = clockFace; cm.emissive = new THREE.Color(0xffffff); cm.emissiveIntensity = .8; }
  mesh(new THREE.CircleGeometry(3.2, 32), cm, 0, 25, 8.6, town).castShadow = false;
  mesh(new THREE.BoxGeometry(12, .5, 3), stoneD, 0, 9, 8.5, town);
  for (let i = -5; i <= 5; i++) mesh(new THREE.CylinderGeometry(.12, .12, 1.4, 6), M(0x2B2B33), i * 1.1, 9.9, 9.8, town);
  const flags = [];
  [[-4, 0xC60B1E], [0, 0xF1BF00], [4, 0x1F4FA0]].forEach(([x, c]) => { mesh(new THREE.CylinderGeometry(.08, .08, 5), M(0x333333), x, 33, 9, town); flags.push(mesh(new THREE.PlaneGeometry(2.6, 1.6), M(c, { side: THREE.DoubleSide }), x + 1.3, 34.6, 9, town)); });
  barrierRing(g, 30, 40);
  const cr = crowd(g, 420, () => { const a = Math.random() * Math.PI * 2, r = rnd(31.2, 43), x = Math.cos(a) * r, z = Math.sin(a) * r; return z < -44 && Math.abs(x) < 26 ? null : [x, z]; });
  textPlane(g, 4, 1.25, (c, w, h) => { c.fillStyle = '#F7F1E6'; c.fillRect(0, 0, w, h); c.strokeStyle = '#1F4FA0'; c.lineWidth = 10; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = '#1F4FA0'; c.font = '800 46px Manrope, sans-serif'; c.textAlign = 'center'; c.fillText('Plaça de', w / 2, 66); c.fillText("l'Ajuntament", w / 2, 122); }, -31.5, 4.5, 30.5, Math.PI * .78);
  mesh(new THREE.CylinderGeometry(.1, .1, 4), M(0x333333), -31.5, 2, 30.5, g);
  return { crowd: cr, flags, anims: [t => { cr.update(t); flags.forEach(f => f.rotation.y = Math.sin(t * 2 + f.position.x) * .25); }] };
}

/* =========================================================================================
   1 · PLAZA DEL AYUNTAMIENTO · la mascletà (day)
   ========================================================================================= */
defineScene('plaza', {
  place: '<b>Día 2 · Martes</b> · Plaza del Ayuntamiento · 13:58', look: 'day',
  cam: { th: .35, ph: 1.12, r: 92, target: [0, 17, -2] },
  line: ['¡Ya son casi las dos! Aquí estaremos muy bien para ver la mascletà.', 'Your host sister: "It\'s almost two! We\'ll have a great view of the mascletà from here."'],
  build(g) {
    const W = plazaWorld(g, false), F = buildFalla(g, STATE.theme);
    for (let i = 0; i < 9; i++) { const f = person({ hair: 'fallera', skirt: true, pose: 'hold', propR: 'bouquet' }, .2); f.position.set(-12 + i * 3, 0, -40 + Math.random()); g.add(f); }
    // firecracker strings on poles
    const poles = [[-20, 18], [0, 24], [20, 18], [-24, 0], [24, 0]], crackers = [], cm = M(0xD8202E, { roughness: .5 });
    poles.forEach(([x, z]) => mesh(new THREE.CylinderGeometry(.15, .2, 7, 8), M(0x6B5A4A), x, 3.5, z, g));
    const string = (a, b) => { for (let i = 1; i < 18; i++) { const t = i / 18, c = mesh(new THREE.CylinderGeometry(.13, .13, .6, 6), cm, a[0] + (b[0] - a[0]) * t, 6.1 - Math.sin(t * Math.PI) * 1.6, a[1] + (b[1] - a[1]) * t, g); c.castShadow = false; crackers.push(c); } };
    for (let i = 0; i < poles.length - 1; i++) string(poles[i], poles[i + 1]);
    string([-24, 0], [-20, 18]); string([24, 0], [20, 18]);
    const fl = new THREE.PointLight(0xFFD27A, 0, 40); fl.position.set(0, 7, 12); g.add(fl);
    // buñuelos stand and a newspaper kiosk: meeting points
    const stand = new THREE.Group(); stand.position.set(38, 0, 22); stand.rotation.y = -2.2; g.add(stand);
    mesh(new THREE.BoxGeometry(5, 2.2, 2.4), M(0xF4E6D0), 0, 1.1, 0, stand);
    const awT = canvasTex(256, 64, c => { for (let x = 0; x < 256; x += 32) { c.fillStyle = (x / 32) % 2 ? '#FFFFFF' : '#D8323C'; c.fillRect(x, 0, 32, 64); } });
    mesh(new THREE.BoxGeometry(5.6, .2, 3), M(0xffffff, { map: awT }), 0, 3.8, .3, stand).rotation.x = .2;
    [-2.5, 2.5].forEach(x => mesh(new THREE.CylinderGeometry(.08, .08, 3.8), M(0x6B5A4A), x, 1.9, 1.4, stand));
    textPlane(stand, 4.4, 1.1, c => { c.fillStyle = '#2E2A45'; c.fillRect(0, 0, 512, 128); c.fillStyle = '#FFC27A'; c.font = '700 56px Manrope, sans-serif'; c.textAlign = 'center'; c.fillText('Bunyols · Buñuelos', 256, 84); }, 0, 2.8, 1.22);
    const kiosk = new THREE.Group(); kiosk.position.set(-40, 0, -16); kiosk.rotation.y = 1.1; g.add(kiosk);
    mesh(new THREE.BoxGeometry(3.6, 2.8, 2.6), M(0x2F6B4F), 0, 1.4, 0, kiosk);
    mesh(new THREE.ConeGeometry(2.9, 1.4, 4), M(0x24503B), 0, 3.5, 0, kiosk).rotation.y = Math.PI / 4;
    for (let i = 0; i < 6; i++) mesh(new THREE.BoxGeometry(.5, .7, .05), M([0xF2F2F2, 0xFFD25A, 0xFF7AA8][i % 3]), -1.3 + i * .52, 1.6, 1.33, kiosk);
    textPlane(kiosk, 3.2, .7, c => { c.fillStyle = '#F7F1E6'; c.fillRect(0, 0, 512, 112); c.fillStyle = '#24503B'; c.font = '800 60px Manrope, sans-serif'; c.textAlign = 'center'; c.fillText('PREMSA · PRENSA', 256, 78); }, 0, 2.55, 1.32);
    const SPOTS = {
      balcon: { pos: new THREE.Vector3(0, 0, -41), es: 'debajo del balcón del Ayuntamiento', en: 'under the town-hall balcony', rx: /balc[oó]n|ayuntamiento/ },
      cartel: { pos: new THREE.Vector3(-29, 0, 33), es: 'al lado del cartel en valenciano', en: 'next to the sign in Valencian', rx: /cartel|letrero|se[nñ]al|valenciano/ },
      bunyols: { pos: new THREE.Vector3(34, 0, 18), es: 'junto al puesto de buñuelos', en: 'by the buñuelos stand', rx: /puesto|bu[nñ]uelo|bunyol/ },
      quiosco: { pos: new THREE.Vector3(-36, 0, -13), es: 'al lado del quiosco de periódicos', en: 'next to the newspaper kiosk', rx: /quiosco|kiosco|peri[oó]dico|prensa/ },
    };
    const hot = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const targets = Object.entries(SPOTS).map(([id, sp]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 7, 16), hot); m.position.copy(sp.pos).add(new THREE.Vector3(0, 3.5, 0)); g.add(m); return { obj: m, id }; });
    Object.values(SPOTS).forEach(sp => { for (let k = 0; k < 3; k++) { const d = person({}, .2); d.position.set(sp.pos.x + rnd(-3, 3), 0, sp.pos.z + rnd(-2.5, 2.5)); d.lookAt(0, 0, 0); g.add(d); } });
    let cousins = null;
    const placeCousins = id => {
      if (cousins) g.remove(cousins); cousins = new THREE.Group(); const p = SPOTS[id].pos;
      [false, true].forEach((sk, i) => { const c = person({ skirt: sk, pose: 'wave', hat: i ? null : 'cap', hatC: 0xFFD25A }, .22); c.position.set(p.x + (i ? 1.3 : -1.3), 0, p.z + 1); c.lookAt(0, 0, 0); cousins.add(c); });
      g.add(cousins);
    };
    let show = null;
    const startShow = onEnd => { if (show) return; show = { t: 0, i: 0, next: 1.2, onEnd }; };
    const step = (t, dt) => {
      W.crowd.excite = show && !show.ended ? 1 : 0; fl.intensity *= .86;
      if (!show) return; show.t += dt; const n = crackers.length;
      while (show.t > show.next && show.i < n) {
        const c = crackers[show.i++], p = show.i / n; c.visible = false;
        flash(g, c.position.x, c.position.y, c.position.z); puff(g, c.position.x, c.position.y, c.position.z);
        bang(.25 + p * .45); fl.intensity = 3 + p * 6; shake = Math.max(shake, .08 + p * .5);
        show.next += Math.max(.035, .32 * Math.pow(1 - p, 1.6));
      }
      if (show.i >= n && !show.ended) {
        show.ended = true; const done = show.onEnd;
        for (let k = 0; k < 26; k++) setTimeout(() => { const a = Math.random() * 6.28, r = rnd(4, 22); puff(g, Math.cos(a) * r, .8, Math.sin(a) * r + 6, 1.8); flash(g, Math.cos(a) * r, 1, Math.sin(a) * r + 6); bang(.8, true); shake = 1.1; fl.intensity = 10; }, k * 70 * (window.__testSpeed || 1));
        setTimeout(() => done && done(), 3000 * (window.__testSpeed || 1));
      }
    };
    return { anims: [...W.anims, ...F.anims, step], api: { SPOTS, targets, placeCousins, startShow },
      gems: [
        { id: 'mascleta', pos: new THREE.Vector3(0, 12.5, -47.5), es: 'Del 1 al 19 de marzo, a las dos de la tarde, hay una mascletà en esta plaza. Desde el balcón, la fallera mayor dice: «Senyor pirotècnic, pot començar la mascletà!».', en: 'Every day from 1 to 19 March at 2 p.m. there is a mascletà here: a daytime show judged by rhythm and noise, not light. The fallera mayor starts it from the town-hall balcony, in valenciano.' },
        { id: 'valenciano', pos: new THREE.Vector3(-31.5, 6, 30.5), es: 'En Valencia se hablan dos idiomas: castellano y valenciano. «Plaça de l\'Ajuntament» significa «Plaza del Ayuntamiento».', en: 'Valencia has two official languages, Spanish and Valencian. Street signs are often in valenciano.' },
      ] };
  },
});

/* =========================================================================================
   2 · UNA CALLE DEL BARRIO · street falla, falla infantil and light arches (dusk)
   ========================================================================================= */
defineScene('calle', {
  place: '<b>Día 3 · Miércoles</b> · Una calle del barrio · 20:30', look: 'dusk',
  cam: { th: 1.0, ph: 1.3, r: 33, target: [0, 7, 0], minR: 14, maxR: 38, maxPh: 1.48, drift: .012 },
  line: ['¡Qué bonita es la falla de mi barrio! Esta noche volveremos para ver las luces.', 'Nerea: "Isn\'t my neighbourhood\'s falla beautiful? Tonight we\'ll come back to see the lights."'],
  build(g) {
    ground(g, 260, pavingTex([150, 146, 150], 16));
    const road = mesh(new THREE.PlaneGeometry(240, 14), M(0x45424C), 0, .02, 0, g); road.rotation.x = -Math.PI / 2; road.castShadow = false;
    const cross = mesh(new THREE.PlaneGeometry(14, 240), M(0x45424C), 0, .021, 0, g); cross.rotation.x = -Math.PI / 2; cross.castShadow = false;
    for (const side of [-1, 1]) for (let x = -110; x < 110; x += rnd(15, 19)) {
      if (Math.abs(x) < 38) continue;
      block(g, x, side * 19, rnd(13, 16), 18, rnd(17, 26), side < 0 ? 0 : Math.PI, true);
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (let k = 0; k < 4; k++) block(g, sx * 19, sz * (44 + k * 17), 18, rnd(13, 16), rnd(17, 26), sx < 0 ? Math.PI / 2 : -Math.PI / 2, true);
    // corner buildings close the little square
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { block(g, sx * 28, sz * 33, 22, 18, rnd(18, 24), sz < 0 ? 0 : Math.PI, true); }
    // the neighbourhood falla in the crossing, and the children's falla down the street
    const PROPS_ES = { phone: ['un móvil', /m[oó]vil|tel[eé]fono/], selfie: ['un palo de selfi', /selfi/], paella: ['una paella', /paella/], book: ['un libro', /libro/], firework: ['un cohete', /cohete|petardo/], bouquet: ['un ramo de flores', /ramo|flores/], orange: ['una naranja', /naranja/], plant: ['una planta', /planta/], mic: ['un micrófono', /micr[oó]fono/], tray: ['una bandeja', /bandeja/] };
    const COLS = [['#D8323C', 'roja', 'rojo'], ['#2A6FDB', 'azul', 'azul'], ['#3E8E5E', 'verde', 'verde'], ['#FFD25A', 'amarilla', 'amarillo'], ['#7A4FD6', 'morada', 'morado'], ['#FF7AA8', 'rosa', 'rosa'], ['#FF8A1E', 'naranja', 'naranja']];
    const pool = shuffle(ESCENAS.filter(e => PROPS_ES[e.propR] && !e.hair));
    const cols = shuffle(COLS), skirt = Math.random() < .5;
    const mk = (e, col, sk) => randSpec(Object.assign({}, e, { pattern: null, topC: col[0], skirt: sk, hair: sk ? pick(['long', 'bun', 'curly']) : pick(['short', 'curly', 'bald']), lashes: sk }));
    const tSpec = mk(pool[0], cols[0], skirt), dSpec = mk(pool[0], cols[1], skirt);
    const others = pool.slice(1, 6).map((e, i) => mk(e, cols[(i + 2) % cols.length], Math.random() < .5));
    const specs = shuffle([tSpec, dSpec, ...others]);
    const garment = skirt ? `un vestido ${cols[0][2]}` : `una camiseta ${cols[0][1]}`;
    const vote = { idx: specs.indexOf(tSpec), desc: `tiene ${PROPS_ES[pool[0].propR][0]} y lleva ${garment}`, short: `${PROPS_ES[pool[0].propR][0]}, ${garment}`, rx: PROPS_ES[pool[0].propR][1] };
    const F = buildFalla(g, STATE.street, { scale: .44, escenas: specs });
    const FI = buildFalla(g, STATE.infantil, { scale: .2, small: true }); FI.group.position.set(-17, 0, -12);
    barrierRing(g, 7.2, 12); barrierRing(g, 4, 8, -17, -12);
    // light arches (luces): thousands of bulbs, animated in waves
    const bulbs = [];
    const arch = (x, span, hgt, rich) => {
      for (let i = 0; i <= 60; i++) { const a = i / 60 * Math.PI; bulbs.push([x, 3.5 + Math.sin(a) * hgt, Math.cos(a) * span]); }
      for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI; bulbs.push([x, 3.5 + Math.sin(a) * hgt * .62, Math.cos(a) * span * .62]); }
      for (let k = -3; k <= 3; k++) { const z = k / 3 * span * .85, top = 3.5 + Math.sqrt(Math.max(0, 1 - (z / span) ** 2)) * hgt; for (let j = 1; j < (rich ? 9 : 5); j++) bulbs.push([x, top - j * .55, z]); }
      if (rich) for (let r = 0; r < 3; r++) for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2; bulbs.push([x, 3.5 + hgt + 2.4 + Math.sin(a) * (1.2 + r * .7), Math.cos(a) * (1.2 + r * .7)]); }
      [-1, 1].forEach(s => mesh(new THREE.CylinderGeometry(.12, .15, 3.6, 8), M(0x2B2B33), x, 1.8, s * span, g));
    };
    for (let x = -100; x <= 100; x += 8) { if (Math.abs(x) < 36) continue; const gate = Math.abs(x) === 36; arch(x, 6.6, gate ? 10 : 6.5, gate || Math.abs(x) % 24 === 4); }
    const B = new THREE.InstancedMesh(new THREE.SphereGeometry(.14, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }), bulbs.length);
    const d = new THREE.Object3D(), col = new THREE.Color(), PAL = [0xFFD98A, 0xFF7AA8, 0x5FE0C8, 0xFFFFFF, 0xB98CFF].map(c => new THREE.Color(c));
    bulbs.forEach((p, i) => { d.position.set(...p); d.updateMatrix(); B.setMatrixAt(i, d.matrix); B.setColorAt(i, PAL[0]); });
    g.add(B);
    const glowL = [-70, -40, 40, 70].map(x => { const l = new THREE.PointLight(0xFFC27A, .8, 30); l.position.set(x, 9, 0); g.add(l); return l; });
    const lights = (t) => {
      for (let i = 0; i < bulbs.length; i++) {
        const p = bulbs[i], w = Math.sin(p[0] * .25 - t * 3 + p[1] * .4);
        col.copy(PAL[(Math.floor((p[0] + 200) / 8) + (w > .6 ? 1 : 0)) % PAL.length]).multiplyScalar(w > .6 ? 1.6 : .9);
        B.setColorAt(i, col);
      }
      B.instanceColor.needsUpdate = true;
    };
    // the casal (club tent) with its banner
    const casal = new THREE.Group(); casal.position.set(18, 0, -15); g.add(casal);
    mesh(new THREE.BoxGeometry(14, .2, 6), M(0xFFFFFF), 0, 4, 0, casal);
    for (const x of [-7, 7]) for (const z of [-3, 3]) mesh(new THREE.CylinderGeometry(.1, .1, 4), M(0x9A9AA2), x, 2, z, casal);
    textPlane(casal, 9, 1.5, (c, w, h) => { c.fillStyle = '#D8323C'; c.fillRect(0, 0, w, h); c.fillStyle = '#FFE7A8'; c.font = '800 54px Unbounded, Manrope, sans-serif'; c.textAlign = 'center'; c.fillText('Falla Carrer del Sol', w / 2, 82); }, 0, 3.2, 3.05);
    for (let i = 0; i < 3; i++) { mesh(new THREE.BoxGeometry(3, .1, 1.2), M(0xF2F2F2), -4 + i * 4, 1, 0, casal); }
    const ppl = [];
    for (let i = 0; i < 16; i++) { const p = person({}, .2); const a = rnd(0, 6.28), r = rnd(9, 20); p.position.set(Math.cos(a) * r, 0, Math.sin(a) * r * .9); p.lookAt(0, 0, 0); g.add(p); ppl.push(p); }
    const cr = crowd(g, 220, () => { const a = Math.random() * 6.28, r = rnd(8.5, 24), x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.hypot(x + 17, z + 12) < 5 || Math.hypot(x - 18, z + 15) < 8) return null; return [x, z]; });
    const voteTargets = F.escenas.map((e, i) => ({ obj: e.group, id: i }));
    return { api: { vote, targets: voteTargets }, anims: [...F.anims, ...FI.anims, lights, t => { cr.update(t); glowL.forEach((l, i) => l.intensity = .7 + Math.sin(t * 3 + i) * .2); }],
      gems: [{ id: 'ninots', pos: F.spots.giantFace.clone().add(new THREE.Vector3(0, 2, 0)), es: 'Los ninots son de cartón, madera y corcho. Muchos son caricaturas. Cada año, la gente vota para salvar un ninot del fuego: el ninot indultat.', en: 'Ninots are made of cardboard, wood and cork, and many are satirical. Each year the public votes to save one from the fire, the ninot indultat, which goes to the Fallas Museum. Every neighbourhood builds its own falla, plus a smaller falla infantil for children.' }] };
  },
});

/* =========================================================================================
   3 · PLAZA DE LA VIRGEN · la ofrenda de flores (golden afternoon)
   ========================================================================================= */
defineScene('ofrenda', {
  place: '<b>Día 4 · Jueves</b> · Plaza de la Virgen · 18:00', look: 'golden',
  cam: { th: .12, ph: 1.28, r: 46, target: [0, 10, -10], maxR: 90 },
  line: ['Mañana mi madre llevará su ramo a la Virgen. ¡Mira, el manto de flores ya está casi terminado!', 'Nerea: "Tomorrow my mum will take her bouquet to the Virgin. Look, the cloak of flowers is almost finished!"'],
  build(g) {
    ground(g, 240, pavingTex([206, 196, 178], 16));
    // basilica with its blue-tiled dome, and the Miguelete tower
    const bas = new THREE.Group(); bas.position.set(8, 0, -46); g.add(bas);
    const ochre = M(0xE2B98A), ochreD = M(0xC99A6A);
    mesh(new THREE.BoxGeometry(30, 18, 16), ochre, 0, 9, 0, bas);
    mesh(new THREE.BoxGeometry(31, 1, 17), ochreD, 0, 18.5, 0, bas);
    mesh(new THREE.CylinderGeometry(3, 3, 7, 24, 1, false, 0, Math.PI), M(0x3A2A24), 0, 3.5, 8.05, bas).rotation.y = -Math.PI / 2;
    const tiles = canvasTex(256, 128, c => { c.fillStyle = '#1F5FB8'; c.fillRect(0, 0, 256, 128); c.fillStyle = '#F2F6FF'; for (let y = 0; y < 128; y += 16) for (let x = 0; x < 256; x += 16) { c.beginPath(); c.moveTo(x + 8, y + 2); c.lineTo(x + 14, y + 8); c.lineTo(x + 8, y + 14); c.lineTo(x + 2, y + 8); c.fill(); } c.fillStyle = '#F1BF00'; for (let x = 0; x < 256; x += 32) c.fillRect(x, 0, 4, 128); });
    tiles.wrapS = THREE.RepeatWrapping; tiles.repeat.set(3, 1);
    mesh(new THREE.CylinderGeometry(7, 7, 5, 24), ochre, 0, 21.5, 0, bas);
    mesh(new THREE.SphereGeometry(7.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M(0xffffff, { map: tiles, roughness: .3 }), 0, 24, 0, bas);
    mesh(new THREE.CylinderGeometry(1.2, 1.4, 3, 12), ochre, 0, 32, 0, bas);
    mesh(new THREE.ConeGeometry(1.4, 2.4, 12), M(0xffffff, { map: tiles }), 0, 34.6, 0, bas);
    const mig = new THREE.Group(); mig.position.set(-34, 0, -30); g.add(mig);
    mesh(new THREE.CylinderGeometry(5, 5.3, 46, 8), M(0xD9BC92), 0, 23, 0, mig);
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + Math.PI / 8; const w = mesh(new THREE.BoxGeometry(1.6, 4.5, .4), M(0x2A2028), Math.cos(a) * 4.9, 40, Math.sin(a) * 4.9, mig); w.rotation.y = -a + Math.PI / 2; }
    mesh(new THREE.CylinderGeometry(5.6, 5.6, .8, 8), M(0xC9AE88), 0, 46.4, 0, mig);
    mesh(new THREE.CylinderGeometry(1.6, 1.8, 4, 8), M(0xD9BC92), 0, 48.8, 0, mig);
    block(g, -22, -50, 20, 14, 22, 0, false); block(g, 32, -48, 16, 14, 20, 0, false);
    for (let i = 0; i < 9; i++) { const a = -.3 + i / 8 * (Math.PI + .6); block(g, Math.cos(a) * 58, Math.sin(a) * 58 + 4, rnd(15, 20), 12, rnd(17, 24), -a + Math.PI / 2, false); }
    // the Virgin: wooden frame, sculpted head and the cloak of flowers
    const V = new THREE.Group(); V.position.set(0, 0, -10); V.scale.setScalar(1.35); g.add(V);
    mesh(new THREE.BoxGeometry(12, 1.2, 10), M(0xB8A68E), 0, .6, 0, V);
    const prof = y => 4.4 - (y - 1.2) * .27, wood = M(0x9A6B3E);
    for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2, x0 = Math.cos(a) * prof(1.2), z0 = Math.sin(a) * prof(1.2), x1 = Math.cos(a) * prof(12), z1 = Math.sin(a) * prof(12);
      const len = Math.hypot(x1 - x0, 10.8, z1 - z0), b = mesh(new THREE.CylinderGeometry(.06, .06, len, 5), wood, (x0 + x1) / 2, 6.6, (z0 + z1) / 2, V); b.lookAt(V.localToWorld(new THREE.Vector3(x1, 12, z1))); b.rotateX(Math.PI / 2); }
    for (let y = 2; y < 12; y += 1.1) mesh(new THREE.TorusGeometry(prof(y), .05, 5, 40), wood, 0, y, 0, V).rotation.x = Math.PI / 2;
    // flowers: sorted bottom-up so the cloak fills as bouquets arrive
    const fl = [], front = Math.PI / 2;
    for (let y = 1.4; y < 11.8; y += .3) { const r = prof(y) + .12, n = Math.floor(Math.PI * 2 * r / .34); for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + (y * 7 % 1) * .3, da = Math.atan2(Math.sin(a - front), Math.cos(a - front));
      const mx = da * r * .9, my = y - 6.2, ell = (mx / 2.6) ** 2 + (my / 3.4) ** 2;
      let c = 0xC8102E; if (ell < 1) c = 0xFFFFFF; else if (ell < 1.35) c = 0xF1BF00; if (y < 2.2) c = 0xFFFFFF; if (y > 2.2 && y < 2.6) c = 0xFF7AA8; if (ell < .18) c = 0xFF7AA8;
      fl.push([Math.cos(a) * r, y, Math.sin(a) * r, c]); } }
    const FL = new THREE.InstancedMesh(new THREE.SphereGeometry(.2, 7, 5), M(0xffffff, { roughness: .9 }), fl.length);
    const d = new THREE.Object3D(), col = new THREE.Color();
    fl.forEach((p, i) => { d.position.set(p[0], p[1], p[2]); d.rotation.set(rnd(0, 3), rnd(0, 3), 0); d.scale.setScalar(rnd(.85, 1.2)); d.updateMatrix(); FL.setMatrixAt(i, d.matrix); FL.setColorAt(i, col.setHex(p[3]).convertSRGBToLinear()); });
    FL.castShadow = true; V.add(FL);
    let fill = .55; FL.count = Math.floor(fl.length * fill);
    // head, crown, halo and the Child
    const skin = lacq(0xEAC9A8), gold = lacq(0xF1BF00, { metalness: .85, roughness: .2 });
    const head = new THREE.Group(); head.position.set(0, 13.2, 0); V.add(head);
    part(new THREE.SphereGeometry(1.05, 32, 24), skin, 0, 0, 0, head).scale.set(.9, 1.1, .9);
    part(new THREE.SphereGeometry(1.18, 32, 16, Math.PI, Math.PI, 0, Math.PI * .8), lacq(0x1F2F6B, { side: THREE.DoubleSide }), 0, .05, -.05, head);
    [-1, 1].forEach(s => { const e = part(new THREE.SphereGeometry(.09, 10, 8), lacq(0x3A2A24), s * .32, .12, .9, head); e.scale.y = .5; });
    part(new THREE.TorusGeometry(.18, .04, 8, 16, Math.PI), lacq(0xB0505A), 0, -.42, .88, head).rotation.z = Math.PI;
    part(new THREE.CylinderGeometry(.75, .6, .7, 16, 1, true), gold, 0, 1.25, 0, head);
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; part(new THREE.ConeGeometry(.12, .5, 6), gold, Math.cos(a) * .7, 1.8, Math.sin(a) * .7, head); }
    const halo = part(new THREE.TorusGeometry(1.9, .07, 8, 48), gold, 0, .6, -.6, head);
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; const r = part(new THREE.CylinderGeometry(.03, .03, .7, 4), gold, Math.cos(a) * 2.25, .6 + Math.sin(a) * 2.25, -.6, head); r.rotation.z = a - Math.PI / 2; }
    part(new THREE.CylinderGeometry(.55, 1.1, 1.4, 16), lacq(0xC8102E), 0, 12, 0, V);
    const child = new THREE.Group(); child.position.set(-1.7, 10.6, 1.4); V.add(child);
    part(new THREE.SphereGeometry(.5, 20, 16), skin, 0, .7, 0, child); part(new THREE.CylinderGeometry(.35, .5, 1, 12), lacq(0xFFFFFF), 0, 0, 0, child);
    part(new THREE.TorusGeometry(.8, .04, 6, 32), gold, 0, .9, -.3, child);
    const staff = part(new THREE.CylinderGeometry(.06, .06, 5, 8), gold, 1.9, 10.5, 1.2, V); flower(V, lacq(0xFFFFFF), .4, 1.9, 13.1, 1.2);
    // ladders and the two vestidores who place the flowers
    [-1, 1].forEach(s => { const lad = new THREE.Group(); lad.position.set(s * 3.2, 1.2, -3.2); V.add(lad); [-.4, .4].forEach(x => mesh(new THREE.BoxGeometry(.1, 10, .1), wood, x, 5, 0, lad)); for (let y = .5; y < 10; y += .7) mesh(new THREE.BoxGeometry(.8, .06, .08), wood, 0, y, 0, lad);
      const v = person({ skirt: false, topC: '#F2F2F2', pose: 'offer', propR: 'bouquet' }, .17); v.position.set(s * 2.6, 1.2 + (s > 0 ? 6 : 3.5), -2.6); v.lookAt(V.localToWorld(new THREE.Vector3(0, 6, 0))); V.add(v); });
    // flower baskets at the foot
    for (let i = 0; i < 10; i++) { const a = Math.PI * .25 + i / 9 * Math.PI * .5, b = new THREE.Group(); b.position.set(Math.cos(a) * 5.5, 1.2, Math.sin(a) * 4.5); V.add(b); mesh(new THREE.CylinderGeometry(.5, .35, .5, 10), M(0xB98A52), 0, .25, 0, b); for (let k = 0; k < 7; k++) mesh(new THREE.SphereGeometry(.18, 6, 5), M(k % 3 ? 0xC8102E : 0xFFFFFF), rnd(-.3, .3), .6 + rnd(0, .2), rnd(-.3, .3), b); }
    // the procession: falleras and falleros walk up with bouquets
    const path = z => [Math.sin(z * .05) * 1.5, z];
    const walkers = [];
    for (let i = 0; i < 22; i++) { const fem = i % 3 !== 2, w = person(fem ? { hair: 'fallera', skirt: true, pose: 'hold', propR: 'bouquet' } : { skirt: false, pattern: 'stripes', topC: '#2E2A45', patC: '#F1BF00', pose: 'hold', propR: 'bouquet', scarf: 0xC8102E }, .2); g.add(w); walkers.push({ w, z: 50 - i * 2.4, side: i % 2 ? 1 : -1 }); }
    barrierLine(g, [...Array(12)].flatMap((_, k) => [[-4.5, 48 - k * 4.4, Math.PI / 2], [4.5, 48 - k * 4.4, Math.PI / 2]]));
    const cr = crowd(g, 260, () => { const s = Math.random() < .5 ? -1 : 1, x = s * rnd(5.5, 14), z = rnd(-2, 52); return Math.hypot(x - 9, z - 16) < 6 ? null : [x, z]; });
    const deliver = () => { fill = Math.min(1, fill + .022); FL.count = Math.floor(fl.length * fill); for (let k = 0; k < 6; k++) ember(V, rnd(-1, 1), 3 + fill * 8, 4, new THREE.Vector3(rnd(-1.5, 1.5), rnd(1, 3), rnd(0, 2)), pick([0xFF4060, 0xFFFFFF]), 1.4, 3, .5); };
    const walk = (t, dt) => {
      walkers.forEach(o => { o.z -= dt * 1.6; if (o.z < 1.5) { o.z += 49.8; deliver(); }
        const [x] = path(o.z); o.w.position.set(x + o.side * .9, Math.abs(Math.sin(t * 5 + o.z)) * .06, o.z); o.w.rotation.y = Math.PI; });
      cr.update(t); head.rotation.y = Math.sin(t * .3) * .05;
    };
    const table = new THREE.Group(); table.position.set(9, 0, 16); table.rotation.y = -.35; g.add(table);
    mesh(new THREE.BoxGeometry(7, .15, 2.4), M(0xF7F1E6), 0, 1.05, 0, table);
    [[-3.3, -1], [3.3, -1], [-3.3, 1], [3.3, 1]].forEach(([x, z]) => mesh(new THREE.BoxGeometry(.12, 1, .12), M(0x9A6B3E), x, .5, z, table));
    const FLW = [['rojos', 0xC8102E], ['blancos', 0xFFFFFF], ['rosas', 0xFF7AA8], ['amarillos', 0xFFD25A]];
    const RIB = [['amarilla', 0xF1BF00], ['azul', 0x2A6FDB], ['verde', 0x3E8E5E], ['morada', 0x7A4FD6]];
    const pairs = [[0, 1], [2, 1], [0, 3], [2, 3], [0, 2], [1, 3]];
    const fp = shuffle(pairs), rb = shuffle([0, 1, 2, 3]);
    const combos = [[fp[0], rb[0]], [fp[0], rb[1]], [fp[1], rb[0]], [fp[2], rb[2]]];
    const order = shuffle([0, 1, 2, 3]), btargets = [];
    combos.forEach(([pr, r], k) => {
      const b = new THREE.Group(); b.position.set(-2.4 + order[k] * 1.6, 1.15, 0); b.scale.setScalar(1.5); table.add(b);
      const wrap = mesh(new THREE.ConeGeometry(.42, 1.1, 14, 1, true), M(0xF4EFE6, { side: THREE.DoubleSide }), 0, .45, 0, b); wrap.rotation.x = Math.PI;
      for (let i = 0; i < 9; i++) mesh(new THREE.SphereGeometry(.15, 8, 6), M(FLW[pr[i % 2]][1], { roughness: .9 }), rnd(-.28, .28), 1.05 + rnd(0, .25), rnd(-.28, .28), b);
      mesh(new THREE.TorusGeometry(.2, .06, 8, 16), M(RIB[r][1]), 0, .5, 0, b).rotation.x = Math.PI / 2;
      mesh(new THREE.BoxGeometry(.1, .5, .02), M(RIB[r][1]), .12, .25, .2, b).rotation.z = .3;
      btargets.push({ obj: b, id: k });
    });
    const bouquet = { idx: 0, desc: `claveles ${FLW[combos[0][0][0]][0]} y ${FLW[combos[0][0][1]][0]}, con una cinta ${RIB[combos[0][1]][0]}`, rx: new RegExp(FLW[combos[0][0][0]][0].slice(0, 4) + '|' + RIB[combos[0][1]][0].slice(0, 4)) };
    const focus = on => { if (on) { orbit.target.set(9, 2, 16); orbit.tR = 14; orbit.tPh = 1.15; orbit.tTh = .1; } else { orbit.target.set(0, 10, -10); orbit.tR = 46; orbit.tPh = 1.28; } };
    return { anims: [walk], api: { deliver, bouquet, targets: btargets, focus },
      gems: [{ id: 'ofrenda', pos: new THREE.Vector3(3.2, 20.5, -8), es: 'El 17 y el 18 de marzo es la Ofrenda: miles de falleras y falleros llevan flores a la Virgen de los Desamparados. Con los claveles hacen un manto enorme.', en: 'On 17 and 18 March, during the Ofrenda, thousands of falleros carry bouquets to the Virgin of the Forsaken. Workers on ladders place the carnations on a wooden frame to form her giant cloak.' }] };
  },
});

/* =========================================================================================
   4 · LA XOCOLATERIA · buñuelos, chocolate y horchata (evening, close-up)
   ========================================================================================= */
defineScene('bunyols', {
  place: '<b>Día 4 · Jueves</b> · Puesto de buñuelos · 19:30', look: 'dusk',
  cam: { th: .3, ph: 1.28, r: 13, target: [0, 2.2, -4.5], minR: 6, maxR: 30, minPh: .8, maxPh: 1.5, drift: .006 },
  line: ['¿Qué vas a pedir? Yo pediré seis buñuelos y un chocolate.', 'Nerea: "What are you going to order? I\'ll order six buñuelos and a hot chocolate."'],
  build(g) {
    ground(g, 120, pavingTex([170, 160, 150], 22));
    for (let x = -40; x < 40; x += rnd(11, 14)) block(g, x, -16, rnd(10, 13), 8, rnd(14, 20), 0, true);
    for (let x = -40; x < 40; x += rnd(11, 14)) block(g, x, 22, rnd(10, 13), 8, rnd(14, 20), Math.PI, true);
    // string lights across the street
    const bl = [];
    for (let k = 0; k < 6; k++) { const x0 = -20 + k * 8; for (let i = 0; i <= 30; i++) { const t = i / 30; bl.push([x0 + t * 6, 9 - Math.sin(t * Math.PI) * 2.2, -12 + t * 30]); } }
    const BL = new THREE.InstancedMesh(new THREE.SphereGeometry(.12, 6, 4), new THREE.MeshBasicMaterial({ color: 0xFFD98A, fog: false }), bl.length);
    const d = new THREE.Object3D(); bl.forEach((p, i) => { d.position.set(...p); d.updateMatrix(); BL.setMatrixAt(i, d.matrix); }); g.add(BL);
    // the stall
    const S = new THREE.Group(); S.position.set(0, 0, -6); g.add(S);
    const front = canvasTex(512, 96, c => { c.fillStyle = '#F4E6D0'; c.fillRect(0, 0, 512, 96); c.fillStyle = '#8A2E2A'; c.fillRect(0, 0, 512, 10); c.fillRect(0, 86, 512, 10); c.font = '800 44px Unbounded, Manrope, sans-serif'; c.textAlign = 'center'; c.fillStyle = '#5A2E1E'; c.fillText('Xocolateria · Bunyols', 256, 62); });
    mesh(new THREE.BoxGeometry(7, 1.1, 1.4), [M(0xF4E6D0), M(0xF4E6D0), M(0xC9A27A), M(0xF4E6D0), M(0xffffff, { map: front }), M(0xF4E6D0)], 0, .55, 1.4, S);
    mesh(new THREE.BoxGeometry(7.4, .1, 1.6), M(0xD9C2A2), 0, 1.15, 1.4, S);
    mesh(new THREE.BoxGeometry(7, 3.2, .2), M(0xF4E6D0), 0, 1.6, -1.2, S);
    [-3.5, 3.5].forEach(x => { mesh(new THREE.CylinderGeometry(.08, .08, 3.6), M(0x6B5A4A), x, 1.8, 2.1, S); mesh(new THREE.CylinderGeometry(.08, .08, 3.6), M(0x6B5A4A), x, 1.8, -1.1, S); });
    const aw = canvasTex(256, 64, c => { for (let x = 0; x < 256; x += 32) { c.fillStyle = (x / 32) % 2 ? '#FFFFFF' : '#D8323C'; c.fillRect(x, 0, 32, 64); } });
    const awn = mesh(new THREE.BoxGeometry(7.8, .12, 3.8), M(0xffffff, { map: aw }), 0, 3.75, .6, S); awn.rotation.x = .18;
    for (let i = 0; i < 16; i++) mesh(new THREE.ConeGeometry(.25, .4, 3), M(i % 2 ? 0xFFFFFF : 0xD8323C), -3.75 + i * .5, 3.25, 2.55, S).rotation.x = Math.PI;
    textPlane(S, 3.2, 2.1, (c, w, h) => {
      c.fillStyle = '#26323A'; c.fillRect(0, 0, w, h); c.strokeStyle = '#B98A52'; c.lineWidth = 14; c.strokeRect(0, 0, w, h);
      c.fillStyle = '#FFE7A8'; c.font = '700 40px Manrope, sans-serif'; c.textAlign = 'left';
      [['Buñuelos (6)', '3,50 €'], ['Chocolate caliente', '2,80 €'], ['Horchata', '3,00 €'], ['Fartons (3)', '1,50 €'], ['Churros (6)', '3,00 €']].forEach(([a, b], i) => { c.fillText(a, 34, 82 + i * 62); c.textAlign = 'right'; c.fillText(b, w - 34, 82 + i * 62); c.textAlign = 'left'; });
      c.fillStyle = '#FFFFFF'; c.font = '800 34px Unbounded, Manrope, sans-serif'; c.textAlign = 'center'; c.fillText('PRECIOS', w / 2, 40);
    }, 1.6, 2.0, -1.08);
    // fryer with oil, floating buñuelos, bubbles and steam
    const fry = new THREE.Group(); fry.position.set(-2.2, 1.2, 1.3); S.add(fry);
    mesh(new THREE.CylinderGeometry(.85, .7, .6, 24), M(0x8A8F99, { metalness: .7, roughness: .3 }), 0, .3, 0, fry);
    mesh(new THREE.CylinderGeometry(.78, .78, .02, 24), M(0xD9A23A, { emissive: 0x5A3008, roughness: .2 }), 0, .55, 0, fry);
    const bun = c => { const t = mesh(new THREE.TorusGeometry(.17, .08, 8, 16), M(c, { roughness: .6 }), 0, 0, 0, fry); t.rotation.x = Math.PI / 2; return t; };
    const floating = [0, 1, 2, 3].map(i => { const b = bun(0xC98A3A); b.position.set(Math.cos(i * 1.6) * .4, .6, Math.sin(i * 1.6) * .4); return b; });
    // trays and cups on the counter
    const tray = new THREE.Group(); tray.position.set(-.6, 1.22, 1.5); S.add(tray);
    mesh(new THREE.BoxGeometry(1.1, .05, .7), M(0xC9CED8, { metalness: .6 }), 0, 0, 0, tray);
    for (let i = 0; i < 9; i++) { const b = mesh(new THREE.TorusGeometry(.13, .06, 8, 14), M(0xB8762E), -.35 + (i % 3) * .35, .07 + Math.floor(i / 3) * .05, -.2 + Math.floor(i / 3) * .2, tray); b.rotation.x = Math.PI / 2; }
    const cups = [];
    for (let i = 0; i < 3; i++) { const c = new THREE.Group(); c.position.set(.7 + i * .45, 1.2, 1.7); S.add(c); mesh(new THREE.CylinderGeometry(.14, .11, .26, 14), M(0xFFFFFF), 0, .13, 0, c); mesh(new THREE.CylinderGeometry(.12, .12, .02, 14), M(0x4A2414, { roughness: .3 }), 0, .25, 0, c); cups.push(c); }
    for (let i = 0; i < 2; i++) { const c = new THREE.Group(); c.position.set(2.3 + i * .45, 1.2, 1.55); S.add(c); mesh(new THREE.CylinderGeometry(.13, .1, .5, 14), M(0xF6EEDD, { transparent: true, opacity: .95 }), 0, .25, 0, c); const fa = mesh(new THREE.CylinderGeometry(.07, .07, .62, 8), M(0xE8C08A), .25, .07, 0, c); fa.rotation.z = Math.PI / 2; }
    // vendors and queue
    const v1 = person({ skirt: false, topC: 0xffffff, apron: 0x8A2E2A, hat: 'cap', hatC: 0x8A2E2A, pose: 'hold' }, .2); v1.position.set(-1.6, 0, -.2); S.add(v1);
    const v2 = person({ skirt: true, topC: 0xffffff, apron: 0x8A2E2A, pose: 'offer', propR: 'tray' }, .2); v2.position.set(1.2, 0, -.2); S.add(v2);
    const queue = [];
    for (let i = 0; i < 5; i++) { const p = person({ pose: pick(['hold', 'phone', 'point', 'shrug']), propR: i === 1 ? 'phone' : undefined }, .2); p.position.set(rnd(-1.5, 1.5), 0, -2.6 + i * 1.6); p.rotation.y = Math.PI + rnd(-.3, .3); g.add(p); queue.push(p); }
    // two high tables with friends
    [[-6, 0], [6, 1]].forEach(([x, z]) => { mesh(new THREE.CylinderGeometry(.5, .5, .05, 20), M(0x2B2B33, { metalness: .5 }), x, 1.1, z, g); mesh(new THREE.CylinderGeometry(.05, .05, 1.1), M(0x2B2B33), x, .55, z, g); for (let k = 0; k < 2; k++) { const p = person({ pose: 'hold', propR: k ? 'phone' : undefined }, .2); const a = k * Math.PI + .4; p.position.set(x + Math.cos(a) * .9, 0, z + Math.sin(a) * .9); p.lookAt(x, 0, z); g.add(p); } });
    const warm = new THREE.PointLight(0xFFB070, 1.4, 16); warm.position.set(0, 3.2, -4); g.add(warm);
    let tSteam = 0;
    const anim = (t, dt) => {
      floating.forEach((b, i) => { b.position.y = .6 + Math.sin(t * 3 + i) * .02; b.rotation.z = t * .3 + i; });
      tSteam += dt; if (tSteam > .25) { tSteam = 0; const c = pick(cups); puff(S, c.position.x, c.position.y + .4, c.position.z, .12, 0xFFFFFF, .5); puff(fry, rnd(-.4, .4), .7, rnd(-.4, .4), .18, 0xFFFFFF, .6);
        ember(fry, rnd(-.5, .5), .58, rnd(-.5, .5), new THREE.Vector3(0, rnd(.3, .6), 0), 0xFFE7A8, .4, 0, .12); }
      warm.intensity = 1.3 + Math.sin(t * 8) * .05;
    };
    const drop = () => {
      const b = bun(0xF0C27A); b.position.set(0, 1.4, 0); const iv = setInterval(() => { b.position.y -= .1; if (b.position.y <= .6) { clearInterval(iv); noiseHit({ gain: .2, freq: 4000, decay: 1.5, len: 1.2, type: 'highpass' }); for (let i = 0; i < 6; i++) puff(fry, rnd(-.3, .3), .7, rnd(-.3, .3), .2, 0xFFFFFF, .8); floating.push(b); } }, 40);
    };
    const MENU = { bunyols: ['seis buñuelos', 3.5, /bu[nñ]uelo|bunyol/], chocolate: ['un chocolate', 2.8, /chocolate/], horchata: ['una horchata', 3.0, /horchata|orxata/], fartons: ['tres fartons', 1.5, /farton/], churros: ['seis churros', 3.0, /churro/] };
    return { anims: [anim], api: { drop, MENU },
      gems: [{ id: 'bunyols', pos: new THREE.Vector3(-2.2, 2.9, -4.7), es: 'En las Fallas se comen buñuelos de calabaza con chocolate. También se bebe horchata, hecha con chufa, con fartons para mojar.', en: 'The festival snacks: pumpkin fritters dipped in hot chocolate, and horchata, a cold drink made from tiger nuts (chufa), with long sweet fartons for dunking.' }] };
  },
});

/* =========================================================================================
   5 · LA CREMÀ · the plaza falla burns (night, 19 March)
   ========================================================================================= */
defineScene('crema', {
  place: '<b>Día 5 · 19 de marzo</b> · Plaza del Ayuntamiento · 00:55', look: 'night',
  cam: { th: .35, ph: 1.15, r: 96, target: [0, 15, 0] },
  line: ['Es la última noche de las Fallas. Dentro de un momento quemarán la falla.', 'Nerea: "It\'s the last night of Fallas. In a moment they\'ll burn the falla."'],
  build(g) {
    const W = plazaWorld(g, true), F = buildFalla(g, STATE.theme); burnable(F.group);
    // a fire engine and the bomberos who protect the buildings
    const truck = new THREE.Group(); truck.position.set(44, 0, 30); truck.rotation.y = -2.3; g.add(truck);
    const red = M(0xC8102E, { roughness: .4 });
    mesh(new THREE.BoxGeometry(9, 2.6, 3), red, 0, 1.9, 0, truck); mesh(new THREE.BoxGeometry(3, 2.2, 3), red, 5.4, 1.7, 0, truck);
    mesh(new THREE.BoxGeometry(1.2, 1, 3.05), M(0x9FD0FF, { emissive: 0x203040 }), 6.2, 2.3, 0, truck);
    for (const x of [-3, 0, 5]) for (const z of [-1.55, 1.55]) mesh(new THREE.CylinderGeometry(.75, .75, .5, 16), M(0x1E1E28), x, .75, z, truck).rotation.x = Math.PI / 2;
    const lad = mesh(new THREE.BoxGeometry(9, .3, 1), M(0xC9CED8, { metalness: .6 }), -.5, 3.4, 0, truck);
    const beacon = mesh(new THREE.BoxGeometry(1.4, .3, .4), new THREE.MeshBasicMaterial({ color: 0x3A7BFF }), 5.4, 2.95, 0, truck);
    const hoses = [];
    [[-24, 20, 3.6], [24, 20, -.6], [-30, -8, 1.9], [30, -8, 1.2]].forEach(([x, z, ry]) => {
      const b = person({ skirt: false, topC: 0x1E2A44, pantsC: 0x1E2A44, hat: 'fireman', pose: 'offer', scarf: 0xF2C200 }, .22); b.position.set(x, 0, z); b.rotation.y = ry; g.add(b);
      const target = new THREE.Vector3(x * 1.9, rnd(10, 18), z * 1.9); hoses.push({ from: new THREE.Vector3(x, 2, z), target });
    });
    // fire state
    const parts = []; F.group.updateMatrixWorld(true);
    let minY = 1e9, maxY = -1e9; const wp = new THREE.Vector3();
    F.group.traverse(o => { if (o.isMesh) { const bb = new THREE.Box3().setFromObject(o), c = bb.getCenter(new THREE.Vector3()); minY = Math.min(minY, bb.min.y); maxY = Math.max(maxY, bb.max.y); parts.push({ m: o, p: c, bb }); } });
    parts.forEach(p => { p.isBase = p.bb.max.y < 4.6; p.start = (p.bb.min.y - minY) / (maxY - minY) * 14 + rnd(0, 3); p.dur = rnd(9, 14) + (p.bb.max.y - p.bb.min.y) * .15; p.y0 = p.m.position.y; });
    // the wooden skeleton inside the monument, revealed as the figures burn away
    const skel = new THREE.Group(); g.add(skel);
    const beamM = new THREE.MeshStandardMaterial({ color: 0x3A2414, emissive: 0xFF5A10, emissiveIntensity: 0, roughness: .9 });
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, r = k % 2 ? 4.5 : 3; const b = mesh(new THREE.BoxGeometry(.4, maxY * .78, .4), beamM, Math.cos(a) * r, maxY * .39 + 4, Math.sin(a) * r, skel); b.rotation.z = Math.cos(a) * .06; }
    for (let y = 7; y < maxY * .8; y += 4) mesh(new THREE.TorusGeometry(4.2 - y * .04, .18, 6, 20), beamM, 0, y, 0, skel).rotation.x = Math.PI / 2;
    for (let k = 0; k < 14; k++) { const b = mesh(new THREE.BoxGeometry(.3, 9, .3), beamM, rnd(-4, 4), rnd(8, maxY * .7), rnd(-4, 4), skel); b.rotation.set(rnd(-1, 1), rnd(0, 3), rnd(-1, 1)); }
    skel.visible = false;
    const orange = new THREE.Color(0xFF8A40);
    const inBox = bb => new THREE.Vector3(rnd(bb.min.x, bb.max.x), rnd(bb.min.y, bb.max.y), rnd(bb.min.z, bb.max.z));
    const fire = new THREE.PointLight(0xFF7A2A, 0, 140); fire.position.set(0, 12, 6); g.add(fire);
    const char = new THREE.Color(0x140C08);
    let phase = 'idle', T = 0, fuse = null;
    const rocket = () => {
      const x = rnd(-50, 50), z = rnd(-60, -30), y0 = 2, top = rnd(40, 60), c = pick([0xFF4D6D, 0x5FE0C8, 0xFFD25A, 0xB98CFF, 0xFFFFFF]);
      const s = sprite(g, TEX.spark, 0xFFE7A8, x, y0, z, .9, true); whoosh();
      addPart(s, 1.2, (p, dt, f) => { s.position.y = y0 + (top - y0) * Math.sin(f * Math.PI / 2); if (p.life + dt >= p.max) { bang(.35); for (let k = 0; k < 40; k++) { const v = new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize().multiplyScalar(rnd(9, 14)); ember(g, s.position.x, s.position.y, s.position.z, v, c, 1.8, 4, .9); } } });
    };
    let CB = {};
    const start = cbs => { if (phase !== 'idle') return; CB = cbs || {}; phase = 'fireworks'; T = 0; };
    const step = (t, dt) => {
      W.anims.forEach(f => f(t)); beacon.material.color.setHex(Math.sin(t * 10) > 0 ? 0x3A7BFF : 0xFF2A2A);
      if (phase === 'idle') { F.anims.forEach(f => f(t)); return; }
      T += dt;
      if (phase === 'fireworks') { if (Math.random() < dt * 3.5) rocket(); if (T > 6) { phase = 'fuse'; T = 0; fuse = { p: new THREE.Vector3(0, .3, 29) }; CB.onFuse && CB.onFuse(); } }
      if (phase === 'fuse') { fuse.p.z -= dt * 7; fuse.p.x = Math.sin(fuse.p.z * .6) * 1.2; for (let k = 0; k < 3; k++) ember(g, fuse.p.x, fuse.p.y, fuse.p.z, new THREE.Vector3(rnd(-2, 2), rnd(2, 5), rnd(-2, 2)), 0xFFE7A8, .5, 9, .4); if (Math.random() < .5) crackle();
        if (fuse.p.z < 12.5) { phase = 'burn'; T = 0; bang(.9, true); W.crowd.excite = 1; CB.onBurn && CB.onBurn(); } }
      if (phase === 'burn' || phase === 'after') {
        let burning = 0;
        for (const p of parts) {
          const k = (T - p.start) / p.dur; if (k < 0 || p.done) continue;
          const mats = Array.isArray(p.m.material) ? p.m.material : [p.m.material];
          mats.forEach(m => { if (m.color) m.color.lerp(char, Math.min(1, dt * 1.2)); if (m.emissive) { m.emissive.setHex(0xFF4A10); m.emissiveIntensity = k < 1 ? (.4 + Math.random() * .6) * (1 - k) : 0; } });
          if (k < 1) burning++;
          if (k > .55 && !p.isBase) { p.m.position.y -= dt * (k - .5) * 2.5; p.m.scale.multiplyScalar(1 - dt * .12); }
          if (k >= 1) { p.done = true; if (!p.isBase) p.m.visible = false; }
        }
        const live = parts.filter(p => !p.done && T > p.start), frac = Math.min(1, live.length / (parts.length * .35));
        for (let k = 0; k < 14 + frac * 50; k++) { const p = inBox(pick(live.length ? live : parts).bb); if (!live.length && k > 6) break; flame(g, p.x + rnd(-1.5, 1.5), Math.max(4.5, p.y - 2), p.z + rnd(-1.5, 1.5), rnd(4, 11) * (.6 + frac * .7), rnd(4, 9)); }
        for (let k = 0; k < frac * 10; k++) flame(g, rnd(-6, 6), rnd(4.5, 8), rnd(-6, 6), rnd(10, 18), rnd(6, 12));
        if (T > 6) { skel.visible = true; beamM.emissiveIntensity = .6 + Math.random() * .8; }
        if (phase === 'after') { skel.children.forEach(b => { b.position.y = Math.max(5, b.position.y - dt * 6); b.rotation.z += dt * .3; }); }
        hemi.color.lerp(orange, Math.min(1, dt * frac));
        if (live.length && Math.random() < .6) puff(g, rnd(-6, 6), maxY * .6 + rnd(0, 10), rnd(-6, 6), 3, 0x3A302C, 2.5);
        if (Math.random() < .5) ember(g, rnd(-8, 8), rnd(4, 20), rnd(-8, 8), new THREE.Vector3(rnd(-2, 2), rnd(4, 9), rnd(-2, 2)), 0xFFA040, 2.5, -1, .35);
        if (Math.random() < live.length / 300) crackle();
        fire.intensity = (1.5 + frac * 7) * (0.85 + Math.random() * .3);
        if (phase === 'burn' && T > 26 && burning < 4) { phase = 'after'; W.crowd.excite = 0; CB.onEnd && CB.onEnd(); }
        if (phase === 'after') { for (let k = 0; k < 2; k++) flame(g, rnd(-7, 7), 4.5, rnd(-7, 7), rnd(1.5, 3), 1.5); fire.intensity = 1.2 + Math.random() * .4; }
      }
      // bomberos keep the façades wet
      if (phase === 'burn' || phase === 'after') hoses.forEach(h => { if (Math.random() < .6) { const v = h.target.clone().sub(h.from).multiplyScalar(.9); v.y += 9; ember(g, h.from.x, h.from.y, h.from.z, v, 0xBFE6FF, 1.1, 9, .45); } });
    };
    return { anims: [step], api: { start }, onExit() { if (phase !== 'idle') setTimeout(() => rebuild(['crema']), 0); },
      gems: [{ id: 'crema', pos: F.spots.plinth.clone().add(new THREE.Vector3(0, 3, 0)), es: 'La noche del 19 de marzo es la cremà: queman casi todas las fallas. La falla de esta plaza se quema la última. Los bomberos mojan los edificios.', en: 'On the night of 19 March almost every falla is burned. The town-square falla goes last, around 1 a.m., while firefighters soak the nearby buildings.' }] };
  },
});

