/* ===================== NINOTS: sculpted, lacquered falla figures =====================
   buildFalla(parent) returns { group, anims[], spots{} }.
   Everything is procedural: lathe profiles, noise-displaced blobs, tapered tubes.        */
const _matCache = {};
function lacq(c, o = {}) {
  const key = c + JSON.stringify(Object.keys(o).length ? o : '');
  if (!o.map && _matCache[key]) return _matCache[key];
  const m = new THREE.MeshPhysicalMaterial(Object.assign({ color: c, roughness: .34, metalness: 0, clearcoat: .9, clearcoatRoughness: .15 }, o));
  if (!o.map) m.color.convertSRGBToLinear();
  if (!o.map) _matCache[key] = m;
  return m;
}
function part(geo, mat, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
  if (parent) parent.add(m); return m;
}
function lathe(pts, seg = 40) {
  const curve = new THREE.SplineCurve(pts.map(([r, y]) => new THREE.Vector2(r, y)));
  return new THREE.LatheGeometry(curve.getPoints(48), seg);
}
function blob(r, amp = .12, freq = 2.2, seed = 1, wS = 36, hS = 26) {
  const g = new THREE.SphereGeometry(r, wS, hS), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const u = v.clone().normalize();
    const n = Math.sin(u.x * freq * 3 + seed) * Math.sin(u.y * freq * 2.6 + seed * 1.7) * Math.sin(u.z * freq * 3.2 + seed * 2.3)
            + .45 * Math.sin(u.x * freq * 6.1 + seed * 3) * Math.sin(u.z * freq * 5.7 + seed);
    v.multiplyScalar(1 + amp * n); p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals(); return g;
}
function taperTube(points, r0, r1, seg = 90, radial = 14, roundEnds = true) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const g = new THREE.TubeGeometry(curve, seg, 1, radial, false), p = g.attributes.position, v = new THREE.Vector3();
  const centers = []; for (let i = 0; i <= seg; i++) centers.push(curve.getPointAt(i / seg));
  for (let i = 0; i < p.count; i++) {
    const ring = Math.floor(i / (radial + 1)), t = ring / seg, c = centers[ring];
    let r = r0 + (r1 - r0) * t; if (roundEnds) r *= Math.min(1, Math.sqrt(Math.min(t, 1 - t) * 14) + .08);
    v.fromBufferAttribute(p, i).sub(c).multiplyScalar(Math.max(.02, r)).add(c); p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals(); return { geo: g, curve };
}

/* ---------- painted fabrics ---------- */
const FAB = {};
function fabric(kind, a, b) {
  const k = kind + a + b; if (FAB[k]) return FAB[k];
  const t = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = a; g.fillRect(0, 0, w, h);
    if (kind === 'dots') { g.fillStyle = b; for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) { g.beginPath(); g.arc(x + ((y / 32) % 2 ? 16 : 0), y + 16, 7, 0, 7); g.fill(); } }
    if (kind === 'stripes') { g.fillStyle = b; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 14, h); }
    if (kind === 'check') { g.fillStyle = b; for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) if (((x + y) / 32) % 2) g.fillRect(x, y, 32, 32); }
    if (kind === 'floral') {
      for (let i = 0; i < 26; i++) {
        const x = (i * 97) % w, y = (i * 61 + (i % 3) * 40) % h, c = [b, '#FFFFFF', '#FFD25A'][i % 3];
        for (let p = 0; p < 5; p++) { const an = p / 5 * 6.28; g.fillStyle = c; g.beginPath(); g.ellipse(x + Math.cos(an) * 9, y + Math.sin(an) * 9, 7, 5, an, 0, 7); g.fill(); }
        g.fillStyle = '#FFB000'; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill();
        g.strokeStyle = '#3E8E5E'; g.lineWidth = 3; g.beginPath(); g.arc(x + 16, y + 14, 10, 3.6, 5.2); g.stroke();
      }
    }
    if (kind === 'brocade') { // Valencian silk: gold scrolls on colour
      g.strokeStyle = b; g.lineWidth = 3;
      for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) {
        g.beginPath(); g.moveTo(x + 32, y + 4); g.bezierCurveTo(x + 60, y + 16, x + 56, y + 48, x + 32, y + 60); g.bezierCurveTo(x + 8, y + 48, x + 4, y + 16, x + 32, y + 4); g.stroke();
        g.beginPath(); g.arc(x + 32, y + 32, 8, 0, 7); g.stroke();
        g.fillStyle = b; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill();
      }
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2);
  return (FAB[k] = lacq(0xffffff, { map: t }));
}

/* ---------- face ---------- */
function face(head, R, sp) {
  const skin = lacq(sp.skin), dark = lacq(0x221A2E, { clearcoat: 1 }), white = lacq(0xFFFFFF, { clearcoat: 1 });
  const shine = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const zOn = (x, y) => Math.sqrt(Math.max(0, R * R - x * x - y * y));
  // ears
  [-1, 1].forEach(s => { const e = part(new THREE.SphereGeometry(R * .26, 16, 12), skin, s * R * .97, -R * .02, -R * .05, head); e.scale.set(.5, 1, .8); });
  // nose: bulbous, a touch rosier
  const nose = part(new THREE.SphereGeometry(R * (sp.bigNose ? .3 : .21), 20, 16), lacq(shadeHex(sp.skin, -.06)), 0, -R * .05, zOn(0, 0) * .98 + R * .06, head);
  nose.scale.set(1, .9, 1.15);
  // eyes with lids, irises, pupils and a highlight
  const eyeR = R * (sp.bigEyes ? .3 : .25);
  [-1, 1].forEach(s => {
    const ex = s * R * .36, ey = R * .2, ez = zOn(ex, ey) - eyeR * .45;
    const eye = new THREE.Group(); eye.position.set(ex, ey, ez); head.add(eye);
    part(new THREE.SphereGeometry(eyeR, 24, 18), white, 0, 0, 0, eye);
    const look = sp.look || [0, 0], iris = new THREE.Group(); iris.position.set(look[0] * eyeR * .35, look[1] * eyeR * .35, 0); eye.add(iris);
    const ir = part(new THREE.SphereGeometry(eyeR * .58, 20, 14), lacq(sp.eyeC || 0x3B6FB6, { clearcoat: 1 }), 0, 0, eyeR * .84, iris); ir.scale.z = .42;
    const pu = part(new THREE.SphereGeometry(eyeR * .3, 16, 12), dark, 0, 0, eyeR * 1.0, iris); pu.scale.z = .4;
    const hl = new THREE.Mesh(new THREE.SphereGeometry(eyeR * .12, 10, 8), shine); hl.position.set(eyeR * .18, eyeR * .2, eyeR * 1.1); iris.add(hl);
    // upper lid
    const lid = part(new THREE.SphereGeometry(eyeR * 1.06, 24, 12, 0, Math.PI * 2, 0, Math.PI * .5), skin, 0, 0, 0, eye);
    lid.rotation.x = (sp.lid ?? -.3) + (sp.wink && s > 0 ? 1.1 : 0);
    if (sp.lashes) for (let k = -2; k <= 2; k++) {
      const l = part(new THREE.CylinderGeometry(.03 * R, .015 * R, eyeR * .55, 5), dark, k * eyeR * .3 + s * eyeR * .25, eyeR * .95, eyeR * .45, eye);
      l.rotation.z = -k * .25 - s * .4; l.rotation.x = -.6;
    }
    // brow
    const b = taperTube([[-eyeR * 1.1, 0, 0], [0, eyeR * .35, eyeR * .15], [eyeR * 1.1, 0, 0]], R * .07, R * .07, 20, 8);
    const brow = part(b.geo, lacq(sp.hairC || 0x3B2A20), ex, ey + eyeR * 1.35 + (sp.browUp || 0) * R * .1, ez + eyeR * .55, head);
    brow.rotation.z = s * (sp.browTilt || .1);
  });
  // cheeks
  const blush = new THREE.MeshBasicMaterial({ color: 0xFF6F8A, transparent: true, opacity: .35, depthWrite: false });
  [-1, 1].forEach(s => { const c = new THREE.Mesh(new THREE.CircleGeometry(R * .2, 20), blush); const x = s * R * .55, y = -R * .18; c.position.set(x, y, zOn(x, y) + .01 * R); c.lookAt(c.position.clone().multiplyScalar(2)); head.add(c); });
  // mouth
  const my = -R * .45, mz = zOn(0, my);
  if (sp.mouth === 'open' || sp.mouth === 'o') {
    const mo = part(new THREE.SphereGeometry(R * (sp.mouth === 'o' ? .17 : .3), 24, 16), lacq(0x5A1E2C), 0, my, mz - R * .1, head);
    mo.scale.set(sp.mouth === 'o' ? .8 : 1.2, sp.mouth === 'o' ? 1 : .55, .5);
    if (sp.mouth === 'open') {
      const teeth = part(new THREE.BoxGeometry(R * .48, R * .1, R * .1), white, 0, my + R * .1, mz + R * .02, head); teeth.rotation.x = -.3;
      part(new THREE.SphereGeometry(R * .14, 14, 10), lacq(0xE8586E), 0, my - R * .07, mz - R * .02, head).scale.set(1.3, .5, .6);
    }
    const lip = part(new THREE.TorusGeometry(R * (sp.mouth === 'o' ? .17 : .3), R * .045, 10, 32), lacq(sp.lipC || 0xC24A5E), 0, my, mz - R * .02, head);
    lip.scale.set(sp.mouth === 'o' ? .8 : 1.2, sp.mouth === 'o' ? 1 : .55, 1);
  } else {
    const sm = part(new THREE.TorusGeometry(R * .26, R * .05, 10, 24, Math.PI), lacq(sp.lipC || 0xB13E52), 0, my + R * .06, mz, head);
    sm.rotation.z = Math.PI;
  }
  if (sp.moustache) {
    [-1, 1].forEach(s => { const m = taperTube([[0, 0, 0], [s * R * .25, -R * .05, 0], [s * R * .45, R * .08, -R * .05]], R * .1, R * .03, 20, 10); part(m.geo, lacq(sp.hairC || 0x3B2A20), 0, my + R * .2, mz + R * .05, head); });
  }
}
function shadeHex(hex, f) { const c = new THREE.Color(hex); const h = {}; c.getHSL(h); c.setHSL(h.h, h.s, Math.max(0, Math.min(1, h.l + f))); return c.getHex(); }

/* ---------- hair and hats ---------- */
function hair(head, R, sp) {
  const hm = lacq(sp.hairC || 0x3B2A20, { roughness: .45 });
  const style = sp.hair || 'short';
  if (style !== 'bald') {
    const cap = part(new THREE.SphereGeometry(R * 1.07, 40, 20, 0, Math.PI * 2, 0, Math.PI * .5), hm, 0, R * .02, -R * .02, head);
    cap.rotation.x = -.62;
    const back = part(new THREE.SphereGeometry(R * 1.06, 32, 24, Math.PI, Math.PI, 0, Math.PI * .78), hm, 0, 0, -R * .04, head);
    back.rotation.y = Math.PI / 2 - Math.PI / 2;
    // sculpted tufts along the hairline
    for (let i = 0; i < 7; i++) { const a = -1.2 + i * .4; part(blob(R * .26, .18, 3, i + 3), hm, Math.sin(a) * R * .95, R * .62 + Math.cos(a) * R * .08 - Math.abs(a) * R * .12, Math.cos(a) * R * .62, head); }
  }
  if (style === 'long' || style === 'flowing') {
    part(blob(R * 1.0, .1, 2, 5), hm, 0, -R * .55, -R * .5, head).scale.set(1.05, 1.25, .6);
    for (let s of [-1, 1]) for (let k = 0; k < 3; k++) {
      const x0 = s * R * (.8 + k * .12), pts = [[x0, R * .3, -R * .2 - k * .2]];
      for (let i = 1; i <= 6; i++) pts.push([x0 + s * Math.sin(i * .9) * R * .3, R * .3 - i * R * (style === 'flowing' ? .55 : .35), -R * .2 - k * .25 + Math.cos(i) * R * .15]);
      part(taperTube(pts, R * .24, R * .06, 40, 10).geo, hm, 0, 0, 0, head);
    }
  }
  if (style === 'bun') { part(blob(R * .55, .12, 3, 4), hm, 0, R * 1.05, -R * .35, head); }
  if (style === 'curly') for (let i = 0; i < 18; i++) {
    const a = i / 18 * Math.PI * 2, el = .35 + (i % 3) * .25;
    part(blob(R * .32, .2, 3, i), hm, Math.cos(a) * R * Math.cos(el) * 1.02, R * (.2 + Math.sin(el) * .95), Math.sin(a) * R * Math.cos(el) * 1.02 - R * .15, head);
  }
  if (style === 'fallera') { // side buns (rodetes) and a gold peineta
    [-1, 1].forEach(s => { const r = part(new THREE.TorusGeometry(R * .32, R * .16, 12, 24), hm, s * R * .98, R * .25, -R * .1, head); r.rotation.y = Math.PI / 2; part(new THREE.SphereGeometry(R * .12, 12, 10), lacq(0xF1BF00, { metalness: .8, roughness: .25 }), s * R * 1.08, R * .25, -R * .1, head); });
    part(blob(R * .45, .1, 3, 9), hm, 0, R * .9, -R * .45, head);
    const pe = part(new THREE.CylinderGeometry(R * .7, R * .7, R * .08, 32, 1, false, 0, Math.PI), lacq(0xF1BF00, { metalness: .85, roughness: .2 }), 0, R * 1.3, -R * .55, head);
    pe.rotation.x = Math.PI / 2; pe.rotation.z = Math.PI / 2 + Math.PI / 2;
  }
  // hats
  const hat = sp.hat;
  if (hat === 'chef') { part(new THREE.CylinderGeometry(R * .8, R * .75, R * .9, 28), lacq(0xffffff), 0, R * 1.15, -R * .05, head); part(blob(R * .95, .14, 2.5, 3), lacq(0xffffff), 0, R * 1.85, -R * .05, head).scale.set(1.1, .75, 1.1); }
  if (hat === 'cap') { part(new THREE.SphereGeometry(R * 1.08, 28, 14, 0, Math.PI * 2, 0, Math.PI * .5), lacq(sp.hatC || 0xD8323C), 0, R * .2, -R * .05, head); const br = part(new THREE.CylinderGeometry(R * .7, R * .7, R * .08, 24, 1, false, 0, Math.PI), lacq(sp.hatC || 0xD8323C), 0, R * .25, R * .55, head); br.rotation.y = -Math.PI / 2; }
  if (hat === 'helmet') { const h = part(new THREE.SphereGeometry(R * 1.45, 32, 24), new THREE.MeshPhysicalMaterial({ color: 0xBFE6FF, transparent: true, opacity: .28, roughness: .05, clearcoat: 1, depthWrite: false }), 0, 0, 0, head); h.castShadow = false; part(new THREE.TorusGeometry(R * 1.2, R * .18, 12, 32), lacq(0xF2F2F2), 0, -R * 1.05, 0, head).rotation.x = Math.PI / 2; }
  if (hat === 'beret') part(blob(R * .9, .08, 2, 7), lacq(sp.hatC || 0x2E2A45), R * .2, R * .95, -R * .1, head).scale.set(1.15, .35, 1.15);
  if (hat === 'flowers') for (let i = 0; i < 9; i++) { const a = -1.3 + i * .32; flower(head, lacq([0xFF7AA8, 0xFFD25A, 0xFFFFFF][i % 3]), R * .22, Math.sin(a) * R * 1.0, R * .7 + Math.cos(a) * R * .35, -R * .1); }
}
function flower(parent, petalMat, r, x, y, z) {
  const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  for (let p = 0; p < 6; p++) { const a = p / 6 * Math.PI * 2, pe = part(new THREE.SphereGeometry(r * .55, 12, 8), petalMat, Math.cos(a) * r * .6, Math.sin(a) * r * .6, 0, g); pe.scale.set(1, .6, .35); pe.rotation.z = a; }
  part(new THREE.SphereGeometry(r * .35, 12, 10), lacq(0xFFB000), 0, 0, r * .1, g);
  return g;
}

/* ---------- hands and arms ---------- */
function hand(skin) {
  const g = new THREE.Group();
  const palm = part(new THREE.SphereGeometry(.42, 16, 12), skin, 0, -.2, 0, g); palm.scale.set(1, 1.15, .55);
  for (let f = 0; f < 4; f++) { const fi = part(new THREE.CylinderGeometry(.09, .08, .5, 8), skin, -.24 + f * .16, -.66, .02, g); fi.rotation.x = .25; part(new THREE.SphereGeometry(.085, 8, 6), skin, -.24 + f * .16, -.9, .08, g); }
  const th = part(new THREE.CylinderGeometry(.1, .09, .42, 8), skin, .4, -.3, .14, g); th.rotation.z = .8;
  return g;
}
function arm(parent, side, sp, sleeveMat, skin) {
  const g = new THREE.Group(); g.position.set(side * 1.18, 5.45, 0); parent.add(g);
  part(new THREE.SphereGeometry(.5, 16, 12), sleeveMat, 0, 0, 0, g);
  part(new THREE.CylinderGeometry(.44, .38, 1.9, 16), sleeveMat, 0, -.95, 0, g);
  const el = new THREE.Group(); el.position.y = -1.9; g.add(el);
  part(new THREE.SphereGeometry(.38, 14, 10), sp.shortSleeve ? skin : sleeveMat, 0, 0, 0, el);
  part(new THREE.CylinderGeometry(.36, .3, 1.7, 14), sp.shortSleeve ? skin : sleeveMat, 0, -.85, 0, el);
  if (!sp.shortSleeve) part(new THREE.CylinderGeometry(.34, .34, .25, 14), lacq(0xffffff), 0, -1.65, 0, el);
  const h = hand(skin); h.position.y = -1.75; el.add(h);
  const p = (side > 0 ? sp.armR : sp.armL) || [.25, 0, .2];
  g.rotation.order = 'ZXY'; g.rotation.z = side * p[0]; g.rotation.x = -p[1]; el.rotation.x = -p[2];
  return { g, el, h };
}

/* ---------- props ---------- */
function prop(kind, h) {
  if (kind === 'phone') { const p = part(new THREE.BoxGeometry(.55, .95, .1), lacq(0x1E1E28), 0, -.5, .3, h); part(new THREE.PlaneGeometry(.46, .8), new THREE.MeshBasicMaterial({ color: 0x7FE7FF }), 0, 0, .06, p); }
  if (kind === 'selfie') { const s = part(new THREE.CylinderGeometry(.05, .05, 3.2), lacq(0x333333), 0, -1.6, .2, h); const p = part(new THREE.BoxGeometry(.55, .95, .1), lacq(0x1E1E28), 0, -1.7, 0, s); }
  if (kind === 'orange') { const o = part(new THREE.SphereGeometry(.7, 18, 14), lacq(0xFF8A1E), 0, -.9, .3, h); part(new THREE.SphereGeometry(.2, 8, 6), lacq(0x3E8E5E), 0, .7, 0, o).scale.set(1.6, .4, .8); }
  if (kind === 'fan') { const f = part(new THREE.CircleGeometry(1.1, 24, 0, Math.PI), lacq(0xD8323C, { side: THREE.DoubleSide, map: undefined }), 0, -.9, .3, h); f.rotation.z = Math.PI * .1; }
  if (kind === 'bouquet') for (let i = 0; i < 7; i++) flower(h, lacq([0xFF7AA8, 0xFFFFFF, 0xFFD25A, 0xB98CFF][i % 4]), .3, Math.cos(i) * .35, -1 + Math.sin(i * 2) * .25, .4 + (i % 2) * .2);
  if (kind === 'guitar') {
    const gt = new THREE.Group(); gt.position.set(.2, -.6, .7); gt.rotation.set(0, 0, -.9); h.add(gt);
    part(new THREE.SphereGeometry(.85, 20, 14), lacq(0xC9762E), 0, -.9, 0, gt).scale.set(1, 1.05, .35);
    part(new THREE.SphereGeometry(.65, 20, 14), lacq(0xC9762E), 0, .25, 0, gt).scale.set(1, 1, .35);
    part(new THREE.CircleGeometry(.25, 16), lacq(0x2B1A10), 0, -.3, .24, gt);
    part(new THREE.BoxGeometry(.22, 2.2, .12), lacq(0x5A3A22), 0, 1.6, 0, gt);
  }
  if (kind === 'book') part(new THREE.BoxGeometry(.9, 1.1, .25), lacq(0x2A6FDB), 0, -.7, .35, h);
  if (kind === 'paella') { const pan = part(new THREE.CylinderGeometry(1.4, 1.2, .25, 28), lacq(0x2B2B33, { metalness: .6 }), 0, -.9, .6, h); part(new THREE.CylinderGeometry(1.25, 1.25, .1, 28), lacq(0xF2B632), 0, .12, 0, pan); for (let i = 0; i < 8; i++) part(new THREE.SphereGeometry(.16, 8, 6), lacq(i % 2 ? 0xE8586E : 0x3E8E5E), Math.cos(i) * .8, .2, Math.sin(i * 1.7) * .8, pan); }
  if (kind === 'firework') { const r = part(new THREE.CylinderGeometry(.12, .12, 1.2, 10), lacq(0xD8323C), 0, -1, .3, h); part(new THREE.ConeGeometry(.15, .35, 10), lacq(0xFFD25A), 0, .75, 0, r); }
}

/* ---------- a full ninot ---------- */
function ninot(sp) {
  const g = new THREE.Group(), skin = lacq(sp.skin || 0xF2C6A0);
  const top = sp.topMat || (sp.pattern ? fabric(sp.pattern, sp.topC, sp.patC || '#FFFFFF') : lacq(sp.topC || 0x2A6FDB));
  const belly = sp.belly || 1;
  // legs or skirt
  if (sp.skirt) {
    const sk = part(lathe([[0, .35], [2.1, .32], [2.05, .6], [1.6, 1.6], [1.2, 2.6], [1.0, 3.25], [0, 3.3]]), sp.skirtMat || top, 0, 0, 0, g);
    part(new THREE.TorusGeometry(2.08, .14, 10, 40), lacq(sp.trimC || 0xF1BF00, { metalness: .5 }), 0, .45, 0, g).rotation.x = Math.PI / 2;
    sk.scale.set(belly, 1, belly);
  } else {
    const pm = lacq(sp.pantsC || 0x2E2A45);
    [-1, 1].forEach(s => {
      part(new THREE.CylinderGeometry(.55, .48, 2.6, 16), pm, s * .55, 1.75, 0, g);
      const shoe = part(new THREE.SphereGeometry(.55, 16, 12), lacq(sp.shoeC || 0x1E1E28), s * .58, .32, .25, g); shoe.scale.set(.9, .55, 1.45);
    });
  }
  // torso
  const torso = part(lathe([[0, 2.9], [1.05, 3.0], [1.18, 3.6], [1.05, 4.4], [1.25, 5.2], [1.1, 5.75], [.5, 6.0], [0, 6.05]]), top, 0, 0, 0, g);
  torso.scale.set(belly, 1, belly * .92);
  if (sp.apron) part(lathe([[0, 3.0], [1.12, 3.05], [1.22, 3.6], [1.12, 4.5], [0, 4.55]], 40), lacq(sp.apron), 0, 0, .06, g).scale.set(belly * 1.02, 1, belly * .96);
  if (sp.scarf) part(new THREE.TorusGeometry(.62, .22, 12, 28), lacq(sp.scarf), 0, 5.95, .05, g).rotation.x = Math.PI / 2;
  part(new THREE.CylinderGeometry(.42, .5, .6, 16), skin, 0, 6.1, 0, g);
  // head
  const R = sp.headR || 1.7, head = new THREE.Group(); head.position.set(0, 6.3 + R * .92, 0); g.add(head);
  const hd = part(new THREE.SphereGeometry(R, 40, 30), skin, 0, 0, 0, head); hd.scale.set(1, 1.06, .98);
  part(new THREE.SphereGeometry(R * .55, 20, 14), skin, 0, -R * .55, R * .35, head).scale.set(1.25, .8, 1); // jaw/chin
  face(head, R, sp); hair(head, R, sp);
  head.rotation.set(sp.headTilt?.[0] || 0, sp.headTilt?.[1] || 0, sp.headTilt?.[2] || 0);
  // arms
  const L = arm(g, -1, sp, sp.sleeveMat || top, skin), Rr = arm(g, 1, sp, sp.sleeveMat || top, skin);
  if (sp.propL) prop(sp.propL, L.h); if (sp.propR) prop(sp.propR, Rr.h);
  if (sp.propBody === 'guitar') {
    const gt = new THREE.Group(); gt.position.set(.1, 4.1, 1.35); gt.rotation.set(.15, 0, -.95); g.add(gt);
    part(new THREE.SphereGeometry(.95, 22, 16), lacq(0xC9762E), 0, -.7, 0, gt).scale.set(1, 1.05, .35);
    part(new THREE.SphereGeometry(.72, 22, 16), lacq(0xC9762E), 0, .45, 0, gt).scale.set(1, 1, .35);
    part(new THREE.CircleGeometry(.28, 18), lacq(0x2B1A10), 0, -.1, .27, gt);
    part(new THREE.BoxGeometry(.24, 2.6, .12), lacq(0x5A3A22), 0, 2.2, 0, gt);
    part(new THREE.BoxGeometry(.36, .55, .14), lacq(0x3B2416), 0, 3.6, 0, gt);
  }
  g.userData = { head, L, R: Rr };
  return g;
}

/* ---------- the plaza falla: "Soñar despiertos" ---------- */
function buildFalla(parent) {
  const F = new THREE.Group(); parent.add(F);
  const anims = [], spots = {};
  // ornate plinth with painted bands and the lema
  const band = canvasTex(1024, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#F1BF00'); gr.addColorStop(.12, '#FFE7A0'); gr.addColorStop(.2, '#1F3F8F'); gr.addColorStop(.8, '#1F3F8F'); gr.addColorStop(.88, '#FFE7A0'); gr.addColorStop(1, '#F1BF00');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#F1BF00'; g.lineWidth = 5;
    for (let x = 0; x < w; x += 128) { g.beginPath(); g.moveTo(x, 128); g.bezierCurveTo(x + 30, 60, x + 90, 60, x + 64, 120); g.bezierCurveTo(x + 50, 150, x + 90, 190, x + 128, 128); g.stroke(); g.fillStyle = '#FF7AA8'; g.beginPath(); g.arc(x + 64, 112, 9, 0, 7); g.fill(); }
    g.fillStyle = '#FFF4D6'; g.font = '800 56px Unbounded, Manrope, sans-serif'; g.textAlign = 'center';
    g.fillText('SOÑAR DESPIERTOS', w / 2, 148);
  });
  band.wrapS = THREE.RepeatWrapping; band.repeat.set(3, 1);
  const plinthMat = lacq(0xffffff, { map: band });
  part(lathe([[0, 0], [12.4, 0], [12.4, .7], [11.8, 1.0], [11.6, 3.4], [12.3, 3.7], [12.3, 4.2], [0, 4.2]], 64), plinthMat, 0, 0, 0, F);
  part(new THREE.TorusGeometry(12.3, .28, 12, 80), lacq(0xF1BF00, { metalness: .7, roughness: .25 }), 0, 4.2, 0, F).rotation.x = Math.PI / 2;
  // cloud bank
  const cloudMats = [lacq(0xFFFFFF), lacq(0xEADFFF), lacq(0xFFE1EE), lacq(0xDDF3FF)];
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2, r = 5.5 + (i % 3) * .9;
    part(blob(2.4 + (i % 4) * .5, .14, 2, i), cloudMats[i % 4], Math.cos(a) * r, 5.4 + (i % 2) * 1.2, Math.sin(a) * r, F).scale.set(1.25, .85, 1.1);
  }
  part(blob(5.2, .12, 2, 11), cloudMats[0], 0, 7.2, 0, F).scale.set(1.15, .6, 1.15);
  // giant flowers on the clouds
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + .3; const fl = flower(F, lacq([0xFF7AA8, 0xFFD25A, 0xB98CFF, 0x6FD3FF][i % 4]), 1.6, Math.cos(a) * 8.5, 7.6, Math.sin(a) * 8.5); fl.lookAt(Math.cos(a) * 30, 14, Math.sin(a) * 30); }

  // the giant: a dreamer lifting a Valencian orange to the sky
  const giant = ninot({ skin: 0xF5CDA8, skirt: true, pattern: 'floral', topC: '#2BB3A3', patC: '#FF7AA8', trimC: 0xF1BF00,
    hair: 'flowing', hairC: 0x5A2E1E, hat: 'flowers', lashes: true, bigEyes: true, eyeC: 0x2E8B57, look: [0, .1], lid: -.35, mouth: 'open', lipC: 0xD8405A,
    armL: [2.55, .35, .35], armR: [2.55, .35, .35], headTilt: [-.32, 0, 0], seed: 4 });
  giant.scale.setScalar(2.55); giant.position.y = 8.6; F.add(giant);
  const orange = new THREE.Group(); orange.position.set(0, 8.6 + 13.4 * 2.55, 1.6); F.add(orange);
  part(blob(3.4, .03, 6, 2), lacq(0xFF8A1E, { clearcoat: 1, roughness: .5 }), 0, 0, 0, orange);
  [0, 1, 2].forEach(i => { const lf = part(new THREE.SphereGeometry(1.1, 16, 10), lacq(0x3E8E5E), Math.cos(i * 2) * .9, 3.4, Math.sin(i * 2) * .9, orange); lf.scale.set(1.6, .25, .7); lf.rotation.y = i * 2; });
  part(new THREE.CylinderGeometry(.18, .22, 1, 8), lacq(0x5A3A22), 0, 3.6, 0, orange);
  const glow = new THREE.PointLight(0xFFB050, .8, 30); orange.add(glow);
  anims.push(t => { giant.rotation.y = Math.sin(t * .35) * .08; orange.position.y = 8.6 + 13.4 * 2.55 + Math.sin(t * 1.2) * .3; orange.rotation.y = t * .3; glow.intensity = .7 + Math.sin(t * 2) * .2; });
  spots.giantFace = new THREE.Vector3(0, 8.6 + 8.6 * 2.55, 6);
  spots.top = new THREE.Vector3(0, orange.position.y + 4.5, 1.6);

  // four ribbons spiralling up, each carrying a character
  const RIB = [[0x5FE0C8, 0], [0xFF7AA8, Math.PI / 2], [0xFFC27A, Math.PI], [0xB98CFF, Math.PI * 1.5]];
  const riderSpecs = [
    { skin: 0xE0AC85, topC: 0xffffff, apron: 0x2A6FDB, scarf: 0xD8323C, hat: 'chef', moustache: true, bigNose: true, belly: 1.35, hairC: 0x2B1D16, mouth: 'open', armL: [2.2, .3, .6], armR: [2.2, .3, .6], propR: 'paella', look: [.3, .4] },
    { skin: 0xF7D6B8, topC: 0xF2F2F2, pantsC: 0xF2F2F2, hat: 'helmet', hair: 'curly', hairC: 0xD9822B, mouth: 'o', bigEyes: true, lashes: true, armL: [1.4, .2, .4], armR: [2.6, 0, .2], look: [0, .8] },
    { skin: 0x8D5A3B, pattern: 'stripes', topC: '#2E2A45', patC: '#FFD25A', hair: 'short', hairC: 0x1A1210, hat: 'beret', hatC: 0xD8323C, mouth: 'smile', propBody: 'guitar', armL: [.35, .9, 1.5], armR: [.25, .6, 1.7], look: [.4, 0], wink: true },
    { skin: 0xF2C6A0, pattern: 'brocade', topC: '#F6D9A8', patC: '#C99A2E', skirt: true, hair: 'fallera', hairC: 0x3B2A20, lashes: true, mouth: 'smile', armL: [.5, .7, 1.2], armR: [1.2, .6, .5], propL: 'bouquet', propR: 'fan', look: [-.3, .2] },
  ];
  RIB.forEach(([c, a0], i) => {
    const pts = [];
    for (let k = 0; k <= 12; k++) { const t = k / 12, a = a0 + t * Math.PI * 1.15, r = 13.5 - t * 3.5; pts.push([Math.cos(a) * r, 4.8 + t * 17 + Math.sin(t * 7) * 1.2, Math.sin(a) * r]); }
    const end = pts[pts.length - 1]; // curl at the top
    for (let k = 1; k <= 5; k++) { const a = a0 + Math.PI * 1.15 + k * .9; pts.push([end[0] + Math.cos(a) * (1.8 - k * .25), end[1] + Math.sin(k * 1.2) * 1.4, end[2] + Math.sin(a) * (1.8 - k * .25)]); }
    const tt = taperTube(pts, .95, .3, 140, 16);
    part(tt.geo, lacq(c), 0, 0, 0, F);
    // gold piping alongside
    const pip = taperTube(pts.map(p => [p[0] * 1.0, p[1] + .9, p[2] * 1.0]), .18, .07, 140, 8);
    part(pip.geo, lacq(0xF1BF00, { metalness: .7, roughness: .25 }), 0, 0, 0, F);
    // rider sits on the ribbon
    const tR = .45 + i * .08, pos = tt.curve.getPointAt(tR), ahead = tt.curve.getPointAt(Math.min(1, tR + .02));
    const rider = ninot(riderSpecs[i]); rider.scale.setScalar(1.05);
    rider.position.copy(pos).add(new THREE.Vector3(0, .75, 0));
    rider.lookAt(new THREE.Vector3(pos.x * 3, pos.y + 1, pos.z * 3)); F.add(rider);
    const y0 = rider.position.y; anims.push(t => { rider.position.y = y0 + Math.sin(t * 1.4 + i) * .25; });
    spots['rider' + i] = rider.position.clone().add(new THREE.Vector3(0, 12, 0));
  });

  // escenas around the base: little stories in sculpted miniature
  const scenes = [
    { skin: 0xF7D6B8, pattern: 'check', topC: '#5FE0C8', patC: '#2E8B7A', hair: 'short', hairC: 0xC9A15A, hat: 'cap', hatC: 0x2A6FDB, mouth: 'open', armR: [1.0, 1.4, 1.2], propR: 'phone', look: [.4, -.4], lid: .9 },
    { skin: 0xE0AC85, topC: 0xFFD25A, pantsC: 0x3B5B8C, hair: 'bun', hairC: 0x2B1D16, mouth: 'open', bigEyes: true, lashes: true, armR: [2.7, .2, .2], propR: 'selfie', look: [.6, .6] },
    { skin: 0xC68863, pattern: 'dots', topC: '#D8323C', patC: '#FFFFFF', skirt: true, hair: 'long', hairC: 0x1A1210, lashes: true, mouth: 'smile', armL: [.6, .9, 1.3], armR: [.6, .9, 1.3], propR: 'paella', look: [0, -.3] },
    { skin: 0xF2C6A0, topC: 0x7A4FD6, pantsC: 0x2E2A45, hair: 'bald', hairC: 0x8A8A8A, moustache: true, bigNose: true, belly: 1.4, mouth: 'o', armL: [.3, 1.5, .4], armR: [.3, 1.5, .4], propR: 'book', look: [0, -.6], browUp: 1 },
    { skin: 0x8D5A3B, topC: 0x3E8E5E, pantsC: 0x1E1E28, hair: 'curly', hairC: 0x1A1210, mouth: 'open', bigEyes: true, armR: [2.3, .4, .3], propR: 'firework', look: [.5, .5] },
    { skin: 0xF5CDA8, pattern: 'brocade', topC: '#BFD8F2', patC: '#C99A2E', skirt: true, hair: 'fallera', hairC: 0x5A2E1E, lashes: true, mouth: 'smile', armL: [.5, .9, 1.2], armR: [.5, .9, 1.2], propR: 'bouquet', look: [0, 0] },
    { skin: 0xF7D6B8, topC: 0xFF7AA8, pantsC: 0x2A6FDB, hair: 'long', hairC: 0xE8C25A, mouth: 'open', lashes: true, armL: [1.6, .1, .3], armR: [1.6, .1, .3], propL: 'orange', propR: 'orange', look: [0, .3] },
  ];
  scenes.forEach((sp, i) => {
    const a = i / scenes.length * Math.PI * 2 + .25, n = ninot(sp); n.scale.setScalar(.62);
    n.position.set(Math.cos(a) * 10.4, 4.2, Math.sin(a) * 10.4); n.rotation.y = -a + Math.PI / 2; F.add(n);
    if (i === 3) spots.indultat = n.position.clone().add(new THREE.Vector3(0, 7.5, 0));
    const hd = n.userData.head, ph = i; anims.push(t => { hd.rotation.z = Math.sin(t * 1.6 + ph) * .06; });
  });
  // butterflies
  for (let i = 0; i < 6; i++) {
    const b = new THREE.Group(); F.add(b);
    const wm = lacq([0xFF7AA8, 0x6FD3FF, 0xFFD25A][i % 3], { side: THREE.DoubleSide });
    const wl = part(new THREE.CircleGeometry(.9, 16), wm, -.5, 0, 0, b), wr = part(new THREE.CircleGeometry(.9, 16), wm, .5, 0, 0, b);
    wl.geometry.translate(-.45, 0, 0); wr.geometry.translate(.45, 0, 0); wl.position.x = wr.position.x = 0;
    part(new THREE.CylinderGeometry(.08, .08, .9, 6), lacq(0x221A2E), 0, 0, 0, b).rotation.x = Math.PI / 2;
    const ph = i * 1.1;
    anims.push(t => { const a = t * .25 + ph; b.position.set(Math.cos(a) * (14 + (i % 2) * 3), 14 + i * 3 + Math.sin(t + ph) * 1.5, Math.sin(a) * (14 + (i % 2) * 3)); b.rotation.set(Math.PI / 2, 0, -a); const f = Math.sin(t * 12 + ph) * .9; wl.rotation.y = f; wr.rotation.y = -f; });
  }
  spots.plinth = new THREE.Vector3(5, 2.2, 11.8);
  return { group: F, anims, spots };
}
