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
  if (hat === 'antennae') [-1, 1].forEach(s => { const a = part(new THREE.CylinderGeometry(R * .05, R * .05, R * .9, 8), lacq(0x2E2A45), s * R * .45, R * 1.25, 0, head); a.rotation.z = -s * .35; part(new THREE.SphereGeometry(R * .16, 12, 10), lacq(0xFF7AA8, { emissive: 0xFF3A80, emissiveIntensity: .4 }), s * R * .62, R * 1.68, 0, head); });
  if (hat === 'fireman') { part(new THREE.SphereGeometry(R * 1.12, 28, 14, 0, Math.PI * 2, 0, Math.PI * .5), lacq(0xF2C200), 0, R * .25, -R * .05, head); const br = part(new THREE.CylinderGeometry(R * 1.35, R * 1.35, R * .08, 28), lacq(0xF2C200), 0, R * .28, -R * .1, head); br.scale.z = 1.15; }
  if (sp.shades) { const sm = lacq(0x14121E, { clearcoat: 1, roughness: .1 }); [-1, 1].forEach(s => part(new THREE.SphereGeometry(R * .3, 18, 12), sm, s * R * .36, R * .2, R * .9, head).scale.set(1.1, .75, .35)); part(new THREE.BoxGeometry(R * .3, R * .06, R * .06), sm, 0, R * .24, R * .97, head); }
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
  if (kind === 'plant') { const pot = part(new THREE.CylinderGeometry(.55, .4, .7, 14), lacq(0xC9622E), 0, -1.0, .45, h); for (let i = 0; i < 6; i++) { const lf = part(new THREE.SphereGeometry(.45, 10, 8), lacq(0x3E8E5E), Math.cos(i) * .3, .7 + (i % 3) * .2, Math.sin(i * 1.3) * .3, pot); lf.scale.set(.5, 1.2, .25); lf.rotation.z = Math.cos(i) * .6; } }
  if (kind === 'mic') { const m = part(new THREE.CylinderGeometry(.14, .1, 1.0, 10), lacq(0x1E1E28), 0, -.8, .3, h); part(new THREE.SphereGeometry(.32, 14, 10), lacq(0xC9CED8, { metalness: .8, roughness: .3 }), 0, -.65, 0, m); }
  if (kind === 'tray') { const tr = part(new THREE.CylinderGeometry(1.0, 1.0, .08, 24), lacq(0xC9CED8, { metalness: .7, roughness: .3 }), 0, -.5, .5, h); [[-.4, 0], [.35, .2], [0, -.45]].forEach(([x, z], i) => part(new THREE.CylinderGeometry(.18, .15, .6, 12), lacq(i ? 0xF6EEDD : 0x5A2E1E), x, .35, z, tr)); }
  if (kind === 'wand') { const w = part(new THREE.CylinderGeometry(.05, .05, 1.6, 6), lacq(0xF1BF00, { metalness: .7 }), 0, -1.1, .3, h); part(starGeo(.45, .2), lacq(0xFFD25A, { emissive: 0xFFB000, emissiveIntensity: .3 }), 0, -.9, 0, w); }
  if (kind === 'firework') { const r = part(new THREE.CylinderGeometry(.12, .12, 1.2, 10), lacq(0xD8323C), 0, -1, .3, h); part(new THREE.ConeGeometry(.15, .35, 10), lacq(0xFFD25A), 0, .75, 0, r); }
}

/* ---------- merge a figure's static pieces into one mesh per material (far fewer draw calls) ---------- */
function mergeByMaterial(root) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), buckets = new Map(), victims = [];
  root.traverse(o => {
    if (!o.isMesh || Array.isArray(o.material) || o.userData.keep) return;
    let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    const k = o.material.uuid; if (!buckets.has(k)) buckets.set(k, { mat: o.material, geos: [], cast: o.castShadow }); buckets.get(k).geos.push(g); victims.push(o);
  });
  victims.forEach(o => { o.parent.remove(o); o.geometry.dispose(); });
  for (const { mat, geos, cast } of buckets.values()) {
    const n = geos.reduce((s, g) => s + g.attributes.position.count, 0), P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2);
    let o = 0; geos.forEach(g => { P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); U.set(g.attributes.uv.array, o * 2); o += g.attributes.position.count; g.dispose(); });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(N, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    geo.computeBoundingBox(); geo.computeBoundingSphere();
    const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true; root.add(m);
  }
  // drop now-empty helper groups
  const empties = []; root.traverse(o => { if (o !== root && !o.isMesh && o.children.length === 0) empties.push(o); }); empties.forEach(o => o.parent && o.parent.remove(o));
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
  mergeByMaterial(g);
  return g;
}


/* ---------- shapes for decorations and held objects ---------- */
function starGeo(r, depth) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + Math.PI / 2, rr = i % 2 ? r * .45 : r; i ? s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: depth * .3, bevelThickness: depth * .3, bevelSegments: 2 }); g.center(); return g;
}
function noteMesh(parent, mat, x, y, z, s = 1) {
  const n = new THREE.Group(); n.position.set(x, y, z); n.scale.setScalar(s); parent.add(n);
  part(new THREE.SphereGeometry(.7, 16, 12), mat, 0, 0, 0, n).scale.set(1.25, .9, .7);
  part(new THREE.CylinderGeometry(.12, .12, 2.6, 8), mat, .75, 1.3, 0, n);
  const f = part(new THREE.BoxGeometry(.9, .28, .2), mat, 1.15, 2.4, 0, n); f.rotation.z = -.5;
  return n;
}
function heldObject(kind) {
  const g = new THREE.Group();
  if (kind === 'orange') {
    part(blob(3.4, .03, 6, 2), lacq(0xFF8A1E, { clearcoat: 1, roughness: .5 }), 0, 0, 0, g);
    [0, 1, 2].forEach(i => { const lf = part(new THREE.SphereGeometry(1.1, 16, 10), lacq(0x3E8E5E), Math.cos(i * 2) * .9, 3.4, Math.sin(i * 2) * .9, g); lf.scale.set(1.6, .25, .7); lf.rotation.y = i * 2; });
    part(new THREE.CylinderGeometry(.18, .22, 1, 8), lacq(0x5A3A22), 0, 3.6, 0, g);
  }
  if (kind === 'globe') {
    const tex = canvasTex(512, 256, (c, w, h) => {
      c.fillStyle = '#2A7FD0'; c.fillRect(0, 0, w, h);
      const land = [[60, 70, 50, 40], [110, 150, 30, 55], [250, 60, 45, 30], [270, 130, 35, 55], [370, 80, 70, 40], [420, 180, 30, 20], [180, 20, 120, 12]];
      land.forEach(([x, y, rx, ry], i) => { c.fillStyle = i === 6 ? '#F4F8FF' : '#4CB86A'; c.beginPath(); c.ellipse(x, y, rx, ry, i * .4, 0, 7); c.fill(); });
      c.fillStyle = '#F4F8FF'; c.fillRect(0, h - 14, w, 14);
    });
    part(new THREE.SphereGeometry(3.5, 40, 28), lacq(0xffffff, { map: tex }), 0, 0, 0, g);
    part(new THREE.TorusGeometry(4.0, .16, 10, 60), lacq(0xF1BF00, { metalness: .7, roughness: .25 }), 0, 0, 0, g).rotation.x = .4;
    for (let i = 0; i < 3; i++) { const lf = part(new THREE.SphereGeometry(.8, 12, 8), lacq(0x3E8E5E), Math.cos(i * 2.1) * 1.2, 3.6, Math.sin(i * 2.1) * 1.2, g); lf.scale.set(.5, 1.4, .3); lf.rotation.z = Math.cos(i * 2.1) * .7; }
  }
  if (kind === 'paella') {
    const pan = new THREE.Group(); pan.rotation.x = .55; g.add(pan);
    part(new THREE.CylinderGeometry(4.6, 4.1, .6, 48), lacq(0x2B2B33, { metalness: .6, roughness: .35 }), 0, 0, 0, pan);
    part(new THREE.CylinderGeometry(4.3, 4.3, .2, 48), lacq(0xF2B632, { roughness: .7, clearcoat: .3 }), 0, .32, 0, pan);
    [-1, 1].forEach(s => part(new THREE.TorusGeometry(.7, .16, 8, 16), lacq(0x2B2B33, { metalness: .6 }), s * 5.0, .2, 0, pan).rotation.x = Math.PI / 2);
    for (let i = 0; i < 22; i++) { const a = i * 2.39, r = Math.sqrt(i / 22) * 3.8; const k = i % 3;
      const m = part(new THREE.SphereGeometry(k ? .35 : .55, 10, 8), lacq([0xE8586E, 0x3E8E5E, 0xFFF06A][k]), Math.cos(a) * r, .5, Math.sin(a) * r, pan); m.scale.y = k === 0 ? .6 : .5; }
    for (let i = 0; i < 4; i++) { const a = i * 1.57 + .4, l = part(new THREE.SphereGeometry(.7, 12, 8, 0, Math.PI), lacq(0xFFE45A), Math.cos(a) * 3.2, .6, Math.sin(a) * 3.2, pan); l.rotation.set(-Math.PI / 2, 0, a); }
  }
  if (kind === 'planet') {
    const tex = canvasTex(256, 128, (c, w, h) => { const cs = ['#B98CFF', '#8A5BE0', '#FF9AC8', '#C9A8FF', '#7A4FD6']; for (let y = 0; y < h; y += 12) { c.fillStyle = cs[(y / 12) % cs.length]; c.fillRect(0, y, w, 12); } });
    part(new THREE.SphereGeometry(3.2, 40, 28), lacq(0xffffff, { map: tex }), 0, 0, 0, g);
    const ring = part(new THREE.TorusGeometry(5.0, .45, 4, 64), lacq(0xFFD25A, { clearcoat: 1 }), 0, 0, 0, g); ring.scale.z = .15; ring.rotation.x = 1.2;
    const moon = part(new THREE.SphereGeometry(.8, 18, 14), lacq(0xE8E8F2), 6.5, 1.5, 0, g); moon.userData.orbit = true;
  }
  if (kind === 'mic') {
    const grille = canvasTex(128, 128, (c) => { c.fillStyle = '#C9CED8'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#7C8290'; c.lineWidth = 2; for (let i = 0; i < 128; i += 8) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 128); c.moveTo(0, i); c.lineTo(128, i); c.stroke(); } });
    part(new THREE.SphereGeometry(2.6, 32, 24), lacq(0xffffff, { map: grille, metalness: .7, roughness: .3 }), 0, .6, 0, g);
    part(new THREE.CylinderGeometry(2.0, 2.0, .7, 32), lacq(0xF1BF00, { metalness: .8, roughness: .2 }), 0, -1.6, 0, g);
    part(new THREE.CylinderGeometry(1.1, .7, 5.5, 24), lacq(0x1E1E28, { clearcoat: 1 }), 0, -4.6, 0, g);
  }
  return g;
}

/* ---------- random characters ---------- */
const N_SKIN = [0xF7D6B8, 0xF2C6A0, 0xE0AC85, 0xC68863, 0x8D5A3B, 0x6B4228];
const N_HAIR = [0x1A1210, 0x2B1D16, 0x5A2E1E, 0x8A5A2B, 0xD9822B, 0xE8C25A, 0x9A9AA2];
const N_COL = ['#2A6FDB', '#D8323C', '#2BB3A3', '#FFD25A', '#7A4FD6', '#FF7AA8', '#3E8E5E', '#F2F2F2', '#2E2A45', '#FF8A1E'];
const POSES = {
  wave: { armL: [.3, .2, .3], armR: [2.6, .2, .3] }, cheer: { armL: [2.5, .3, .35], armR: [2.5, .3, .35] },
  hold: { armL: [.5, .9, 1.3], armR: [.5, .9, 1.3] }, point: { armL: [.3, .1, .3], armR: [1.5, 1.2, .1] },
  phone: { armL: [.3, .2, .3], armR: [1.0, 1.4, 1.2] }, offer: { armL: [.3, .2, .3], armR: [.9, 1.2, .4] },
  shrug: { armL: [1.2, .6, 1.4], armR: [1.2, .6, 1.4] },
};
function randSpec(o = {}) {
  const skirt = o.skirt ?? Math.random() < .4, pat = Math.random() < .55 ? pick(['dots', 'stripes', 'check', 'floral', 'brocade']) : null;
  const pose = POSES[o.pose || pick(Object.keys(POSES))];
  const base = {
    skin: pick(N_SKIN), hairC: pick(N_HAIR), skirt, hair: pick(skirt ? ['long', 'bun', 'curly', 'fallera', 'flowing'] : ['short', 'curly', 'bald', 'short', 'long']),
    pattern: pat, topC: pick(N_COL), patC: pick(['#FFFFFF', '#FFD25A', '#2E2A45', '#FF7AA8']), pantsC: pick([0x2E2A45, 0x3B5B8C, 0x1E1E28, 0x6B4F3A, 0x3E8E5E]),
    lashes: skirt, mouth: pick(['open', 'smile', 'o', 'open', 'smile']), bigEyes: Math.random() < .45, bigNose: Math.random() < .3,
    moustache: !skirt && Math.random() < .25, belly: Math.random() < .3 ? 1.3 : 1, eyeC: pick([0x3B6FB6, 0x2E8B57, 0x6B4228, 0x4A3A2A]),
    hat: Math.random() < .25 ? pick(['cap', 'beret']) : null, hatC: parseInt(pick(N_COL).slice(1), 16),
    look: [rnd(-.4, .4), rnd(-.2, .5)], wink: Math.random() < .12, seed: Math.random() * 9, browTilt: rnd(-.25, .3),
  };
  if (base.hair === 'fallera') { base.pattern = 'brocade'; base.topC = pick(['#F6D9A8', '#BFD8F2', '#F2C1D1', '#E9E1F7']); base.patC = '#C99A2E'; base.hat = null; }
  return Object.assign(base, pose, o);
}

/* ---------- themes: each playthrough draws one for the plaza and others for the street ---------- */
const THEMES = {
  suenos: { lema: 'SOÑAR DESPIERTOS', es: 'Soñar despiertos', band: ['#1F3F8F', '#F1BF00', '#FF7AA8'], ribbons: [0x5FE0C8, 0xFF7AA8, 0xFFC27A, 0xB98CFF], deco: 'flowers', clouds: [0xFFFFFF, 0xEADFFF, 0xFFE1EE, 0xDDF3FF], held: 'orange',
    giant: { skin: 0xF5CDA8, skirt: true, pattern: 'floral', topC: '#2BB3A3', patC: '#FF7AA8', trimC: 0xF1BF00, hair: 'flowing', hairC: 0x5A2E1E, hat: 'flowers', lashes: true, bigEyes: true, eyeC: 0x2E8B57, mouth: 'open', lipC: 0xD8405A },
    riders: [{ topC: 0xffffff, apron: 0x2A6FDB, scarf: 0xD8323C, hat: 'chef', moustache: true, bigNose: true, belly: 1.35, skirt: false, pose: 'cheer', propR: 'paella' }, { topC: 0xF2F2F2, pantsC: 0xF2F2F2, hat: 'helmet', hair: 'curly', skirt: false, mouth: 'o', pose: 'wave' }, { pattern: 'stripes', topC: '#2E2A45', patC: '#FFD25A', hat: 'beret', hatC: 0xD8323C, skirt: false, propBody: 'guitar', armL: [.35, .9, 1.5], armR: [.25, .6, 1.7], wink: true }, { hair: 'fallera', skirt: true, pose: 'hold', propL: 'bouquet', propR: 'fan' }] },
  planeta: { lema: 'CUIDEMOS EL PLANETA', es: 'Cuidemos el planeta', band: ['#1E6B45', '#FFD25A', '#6FD3FF'], ribbons: [0x7CE0A3, 0x6FD3FF, 0xFFD25A, 0x3E8E5E], deco: 'leaves', clouds: [0xE6FFF0, 0xD6F4FF, 0xFFFFFF, 0xE8F7D8], held: 'globe',
    giant: { skin: 0xC68863, skirt: true, pattern: 'brocade', topC: '#3E8E5E', patC: '#FFD25A', trimC: 0xFFD25A, hair: 'bun', hairC: 0x9A9AA2, hat: 'flowers', lashes: true, bigEyes: true, eyeC: 0x6B4228, mouth: 'smile', belly: 1.15 },
    riders: [{ pose: 'hold', propR: 'plant', hat: 'cap', hatC: 0x3E8E5E }, { pose: 'cheer', propL: 'plant', propR: 'plant' }, { pose: 'offer', propR: 'orange', pattern: 'check', topC: '#6FD3FF', patC: '#FFFFFF' }, { pose: 'point', propR: 'book', shades: true }] },
  comer: { lema: '¡A LA MESA!', es: '¡A la mesa!', band: ['#B8322E', '#FFD25A', '#FFFFFF'], ribbons: [0xFFD25A, 0xD8323C, 0x7CE0A3, 0xFF8A1E], deco: 'veggies', clouds: [0xFFF4E2, 0xFFE9C9, 0xFFFFFF, 0xFFE1D6], held: 'paella',
    giant: { skin: 0xE0AC85, topC: 0xFFFFFF, apron: 0xD8323C, scarf: 0x2A6FDB, hat: 'chef', moustache: true, bigNose: true, belly: 1.45, hairC: 0x2B1D16, mouth: 'open', eyeC: 0x3B6FB6, pantsC: 0x2E2A45, skirt: false },
    riders: [{ topC: 0xffffff, hat: 'chef', pose: 'hold', propR: 'tray', skirt: false }, { pose: 'offer', propR: 'orange', apron: 0x2BB3A3 }, { pose: 'cheer', propL: 'orange', propR: 'orange', skirt: true }, { pose: 'hold', propR: 'paella', moustache: true, skirt: false }] },
  espacio: { lema: 'RUMBO A LAS ESTRELLAS', es: 'Rumbo a las estrellas', band: ['#14123A', '#B98CFF', '#FFD25A'], ribbons: [0x6FD3FF, 0xB98CFF, 0xFFD25A, 0xFF7AA8], deco: 'stars', clouds: [0xE4E0FF, 0xD6E8FF, 0xF2E6FF, 0xFFFFFF], held: 'planet',
    giant: { skin: 0xF7D6B8, topC: 0xF2F2F2, pantsC: 0xF2F2F2, shoeC: 0xE6E6EE, hat: 'helmet', hair: 'curly', hairC: 0xD9822B, bigEyes: true, lashes: true, mouth: 'open', eyeC: 0x2E8B57, skirt: false, scarf: 0xFF7AA8 },
    riders: [{ skin: 0x7CE0A3, hair: 'bald', hat: 'antennae', bigEyes: true, mouth: 'o', topC: '#7A4FD6', pose: 'wave', skirt: false }, { topC: 0xF2F2F2, pantsC: 0xF2F2F2, hat: 'helmet', pose: 'cheer', skirt: false }, { skin: 0x9AD0FF, hair: 'bald', hat: 'antennae', bigEyes: true, mouth: 'open', topC: '#FFD25A', pose: 'point', propR: 'wand', skirt: true }, { pose: 'hold', propR: 'firework', shades: true }] },
  musica: { lema: '¡QUE SUENE LA MÚSICA!', es: '¡Que suene la música!', band: ['#4A1F6B', '#FF7AA8', '#5FE0C8'], ribbons: [0xFF7AA8, 0x5FE0C8, 0xFFD25A, 0x7A4FD6], deco: 'notes', clouds: [0xF6E6FF, 0xFFE6F2, 0xE6FFFA, 0xFFFFFF], held: 'mic',
    giant: { skin: 0x8D5A3B, pattern: 'dots', topC: '#D8323C', patC: '#FFFFFF', skirt: true, trimC: 0x14121E, hair: 'fallera', hairC: 0x1A1210, lashes: true, bigEyes: true, eyeC: 0x4A3A2A, mouth: 'open', lipC: 0xC2183C },
    riders: [{ pattern: 'stripes', topC: '#2E2A45', patC: '#FFD25A', hat: 'beret', hatC: 0xD8323C, skirt: false, propBody: 'guitar', armL: [.35, .9, 1.5], armR: [.25, .6, 1.7] }, { pose: 'point', propR: 'mic', shades: true, skirt: false }, { hair: 'fallera', skirt: true, pose: 'cheer', propR: 'fan' }, { pose: 'cheer', shades: true, hat: 'cap' }] },
};
const ESCENAS = [{ pose: 'phone', propR: 'phone', lid: .6 }, { pose: 'wave', propR: 'selfie' }, { pose: 'hold', propR: 'paella' }, { pose: 'hold', propR: 'book', mouth: 'o' }, { pose: 'cheer', propR: 'firework' },
  { pose: 'hold', propR: 'bouquet', hair: 'fallera', skirt: true }, { pose: 'offer', propR: 'orange' }, { pose: 'hold', propR: 'plant' }, { pose: 'shrug' }, { pose: 'point', propR: 'mic' }, { pose: 'hold', propR: 'tray' }];

/* ---------- a falla monument in any theme, at any scale ---------- */
function buildFalla(parent, key, opts = {}) {
  const T = THEMES[key], F = new THREE.Group(); parent.add(F);
  const anims = [], spots = {}, nScenes = opts.small ? 5 : 7;
  const band = canvasTex(1024, 256, (g, w, h) => {
    const [bg, gold, acc] = T.band, gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, gold); gr.addColorStop(.12, '#FFF1C2'); gr.addColorStop(.2, bg); gr.addColorStop(.8, bg); gr.addColorStop(.88, '#FFF1C2'); gr.addColorStop(1, gold);
    g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = gold; g.lineWidth = 5;
    for (let x = 0; x < w; x += 128) { g.beginPath(); g.moveTo(x, 128); g.bezierCurveTo(x + 30, 60, x + 90, 60, x + 64, 120); g.bezierCurveTo(x + 50, 150, x + 90, 190, x + 128, 128); g.stroke(); g.fillStyle = acc; g.beginPath(); g.arc(x + 64, 112, 9, 0, 7); g.fill(); }
    g.fillStyle = '#FFF4D6'; g.font = '800 54px Unbounded, Manrope, sans-serif'; g.textAlign = 'center'; g.fillText(T.lema, w / 2, 150);
  });
  band.wrapS = THREE.RepeatWrapping; band.repeat.set(3, 1);
  part(lathe([[0, 0], [12.4, 0], [12.4, .7], [11.8, 1.0], [11.6, 3.4], [12.3, 3.7], [12.3, 4.2], [0, 4.2]], 64), lacq(0xffffff, { map: band }), 0, 0, 0, F);
  part(new THREE.TorusGeometry(12.3, .28, 12, 80), lacq(0xF1BF00, { metalness: .7, roughness: .25 }), 0, 4.2, 0, F).rotation.x = Math.PI / 2;
  const cloudMats = T.clouds.map(c => lacq(c));
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = 5.5 + (i % 3) * .9; part(blob(2.4 + (i % 4) * .5, .14, 2, i), cloudMats[i % 4], Math.cos(a) * r, 5.4 + (i % 2) * 1.2, Math.sin(a) * r, F).scale.set(1.25, .85, 1.1); }
  part(blob(5.2, .12, 2, 11), cloudMats[0], 0, 7.2, 0, F).scale.set(1.15, .6, 1.15);
  // decorations on the clouds and floating around
  const decoMat = i => lacq([T.ribbons[0], T.ribbons[1], T.ribbons[2], 0xFFFFFF][i % 4]);
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2 + .3, x = Math.cos(a) * 8.5, z = Math.sin(a) * 8.5;
    let d;
    if (T.deco === 'flowers') d = flower(F, decoMat(i), 1.6, x, 7.6, z);
    if (T.deco === 'leaves') { d = new THREE.Group(); d.position.set(x, 7.4, z); F.add(d); for (let k = 0; k < 5; k++) { const l = part(new THREE.SphereGeometry(1.2, 14, 10), lacq(k % 2 ? 0x3E8E5E : 0x7CE0A3), 0, 0, 0, d); l.scale.set(.45, 1.5, .2); l.rotation.set(0, k * 1.25, .5); l.position.y = .8; } }
    if (T.deco === 'veggies') { d = new THREE.Group(); d.position.set(x, 7.6, z); F.add(d); const k = i % 3; if (k === 0) part(blob(1.2, .06, 4, i), lacq(0xE8402E), 0, 0, 0, d).scale.set(1, .8, 1); if (k === 1) { part(new THREE.SphereGeometry(.9, 14, 10), lacq(0x3E8E5E), 0, 0, 0, d).scale.set(.8, 1.5, .8); } if (k === 2) part(new THREE.ConeGeometry(.7, 2.6, 14), lacq(0xFF8A1E), 0, 0, 0, d).rotation.z = Math.PI * .8; }
    if (T.deco === 'stars') { d = part(starGeo(1.4, .5), lacq([0xFFD25A, 0xFFFFFF, 0xB98CFF][i % 3], { emissive: 0xFFB000, emissiveIntensity: .15 }), x, 8, z, F); }
    if (T.deco === 'notes') d = noteMesh(F, lacq([0x14121E, 0xFF7AA8, 0x5FE0C8][i % 3]), x, 7.2, z, .8);
    if (d) d.lookAt(Math.cos(a) * 30, 14, Math.sin(a) * 30);
  }
  if (T.deco === 'stars' || T.deco === 'notes') for (let i = 0; i < 8; i++) {
    const m = T.deco === 'stars' ? part(starGeo(.9, .35), lacq(0xFFD25A, { emissive: 0xFFB000, emissiveIntensity: .25 }), 0, 0, 0, F) : noteMesh(F, lacq([0x14121E, 0xFF7AA8][i % 2]), 0, 0, 0, .55);
    const ph = i * .8; anims.push(t => { const a = t * .2 + ph; m.position.set(Math.cos(a) * 15, 16 + i * 2.2 + Math.sin(t + ph), Math.sin(a) * 15); m.rotation.y = -a; });
  }
  // the giant, arms up, lifting the theme's object
  const giant = ninot(Object.assign({ armL: [2.55, .35, .35], armR: [2.55, .35, .35], headTilt: [-.32, 0, 0], look: [0, .1], lid: -.35, seed: 4 }, T.giant));
  giant.scale.setScalar(2.55); giant.position.y = 8.6; F.add(giant);
  const held = heldObject(T.held), hy = 8.6 + 13.4 * 2.55; held.position.set(0, hy, 1.6); F.add(held);
  const glow = new THREE.PointLight(0xFFB050, .6, 30); held.add(glow);
  anims.push(t => {
    giant.rotation.y = Math.sin(t * .35) * .08; held.position.y = hy + Math.sin(t * 1.2) * .3; held.rotation.y = t * .3;
    held.children.forEach(c => { if (c.userData.orbit) { c.position.set(Math.cos(t) * 6.5, 1.5, Math.sin(t) * 6.5); } });
  });
  spots.giantFace = new THREE.Vector3(0, 8.6 + 8.6 * 2.55, 6); spots.top = new THREE.Vector3(0, hy + 4.5, 1.6);
  // ribbons with riders
  T.ribbons.forEach((c, i) => {
    const a0 = i * Math.PI / 2, pts = [];
    for (let k = 0; k <= 12; k++) { const t = k / 12, a = a0 + t * Math.PI * 1.15, r = 13.5 - t * 3.5; pts.push([Math.cos(a) * r, 4.8 + t * 17 + Math.sin(t * 7) * 1.2, Math.sin(a) * r]); }
    const end = pts[pts.length - 1];
    for (let k = 1; k <= 5; k++) { const a = a0 + Math.PI * 1.15 + k * .9; pts.push([end[0] + Math.cos(a) * (1.8 - k * .25), end[1] + Math.sin(k * 1.2) * 1.4, end[2] + Math.sin(a) * (1.8 - k * .25)]); }
    const tt = taperTube(pts, .95, .3, 140, 16);
    part(tt.geo, lacq(c), 0, 0, 0, F);
    part(taperTube(pts.map(p => [p[0], p[1] + .9, p[2]]), .18, .07, 140, 8).geo, lacq(0xF1BF00, { metalness: .7, roughness: .25 }), 0, 0, 0, F);
    const tR = .45 + i * .08, pos = tt.curve.getPointAt(tR);
    const rider = ninot(randSpec(T.riders[i])); rider.scale.setScalar(1.05);
    rider.position.copy(pos).add(new THREE.Vector3(0, .75, 0)); rider.lookAt(new THREE.Vector3(pos.x * 3, pos.y + 1, pos.z * 3)); F.add(rider);
    const y0 = rider.position.y; anims.push(t => { rider.position.y = y0 + Math.sin(t * 1.4 + i) * .25; });
  });
  // little stories around the base
  shuffle(ESCENAS).slice(0, nScenes).forEach((e, i) => {
    const a = i / nScenes * Math.PI * 2 + .25, n = ninot(randSpec(e)); n.scale.setScalar(.62);
    n.position.set(Math.cos(a) * 10.4, 4.2, Math.sin(a) * 10.4); n.rotation.y = -a + Math.PI / 2; F.add(n);
    if (i === 0) spots.escena = n.position.clone().add(new THREE.Vector3(0, 7.5, 0));
  });
  // butterflies (dream / planet themes) or none
  if (T.deco === 'flowers' || T.deco === 'leaves') for (let i = 0; i < 6; i++) {
    const b = new THREE.Group(); F.add(b);
    const wm = lacq([0xFF7AA8, 0x6FD3FF, 0xFFD25A][i % 3], { side: THREE.DoubleSide });
    const wl = part(new THREE.CircleGeometry(.9, 16), wm, 0, 0, 0, b), wr = part(new THREE.CircleGeometry(.9, 16), wm, 0, 0, 0, b);
    wl.geometry.translate(-.45, 0, 0); wr.geometry.translate(.45, 0, 0);
    part(new THREE.CylinderGeometry(.08, .08, .9, 6), lacq(0x221A2E), 0, 0, 0, b).rotation.x = Math.PI / 2;
    const ph = i * 1.1;
    anims.push(t => { const a = t * .25 + ph; b.position.set(Math.cos(a) * (14 + (i % 2) * 3), 14 + i * 3 + Math.sin(t + ph) * 1.5, Math.sin(a) * (14 + (i % 2) * 3)); b.rotation.set(Math.PI / 2, 0, -a); const f = Math.sin(t * 12 + ph) * .9; wl.rotation.y = f; wr.rotation.y = -f; });
  }
  spots.plinth = new THREE.Vector3(5, 2.2, 11.8);
  const s = opts.scale || 1; F.scale.setScalar(s);
  for (const k in spots) spots[k].multiplyScalar(s);
  return { group: F, anims, spots, theme: T };
}
