/* ===================== ART: flat illustrations as SVG (rendered to PixiJS textures) ===================== */
const PAL = { ink: '#17122E', brick: '#B5583A', brick2: '#C96B48', brick3: '#9C4A30', green: '#3E8E5E', green2: '#5FAE6E', green3: '#86C47F', sky: '#8EC9F0', sky2: '#CFE8F7', cream: '#F6EEDF', teal: '#2BA39A', sun: '#FFC27A', pink: '#FF7AA8', yellow: '#FFD25A', blue: '#2A6FDB', violet: '#7A4FD6', red: '#D8323C', wood: '#B98A52', wood2: '#8A5A32', grey: '#9AA0AC', dark: '#2E2A45' };
const lg = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
const shadow = (cx, cy, rx, ry = rx * .22, o = .22) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#17122E" opacity="${o}"/>`;
let SEED = 7; const srnd = () => { SEED = (SEED * 16807) % 2147483647; return SEED / 2147483647; };

/* ---- hills of Medellín with brick houses (used in the shop window and the Metrocable scene) ---- */
function hillsSVG(w, h, seed = 3, skyTop = '#7FC0EE', skyBot = '#D6EEFA') {
  SEED = seed * 97 + 11;
  let s = `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
  s += `<circle cx="${w * .82}" cy="${h * .16}" r="${h * .07}" fill="#FFF3C8" opacity=".9"/>`;
  [[.18, '#8FB7D8', .55], [.32, '#6E9FBF', .7]].forEach(([y, c, o]) => { s += `<path d="M0 ${h * (y + .2)} ${Array.from({ length: 9 }, (_, i) => `Q ${w * (i + .5) / 8} ${h * (y + .05 + srnd() * .12)} ${w * (i + 1) / 8} ${h * (y + .2)}`).join(' ')} V${h} H0Z" fill="${c}" opacity="${o}"/>`; });
  const layers = [[.42, PAL.green2], [.56, PAL.green], [.7, '#357A50']];
  layers.forEach(([y, c], li) => {
    const pts = Array.from({ length: 7 }, (_, i) => [w * i / 6, h * (y + srnd() * .1 - .05)]);
    s += `<path d="M0 ${h} L0 ${pts[0][1]} ${pts.map(([x, yy], i) => i ? `Q ${x - w / 12} ${yy - h * .06} ${x} ${yy}` : '').join(' ')} L${w} ${h}Z" fill="${c}"/>`;
    for (let k = 0; k < 70 - li * 10; k++) {
      const x = srnd() * w, i = Math.min(5, Math.floor(x / (w / 6))), t = (x - pts[i][0]) / (w / 6), yy = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t + srnd() * h * .22 + 6;
      if (yy > h) continue;
      const bw = 14 + srnd() * 16 + li * 6, bh = 12 + srnd() * 14 + li * 5, col = [PAL.brick, PAL.brick2, PAL.brick3, '#D9B48A', '#E8D6C0', '#F2C1A0'][Math.floor(srnd() * 6)];
      s += `<rect x="${x}" y="${yy}" width="${bw}" height="${bh}" fill="${col}"/><rect x="${x + bw * .2}" y="${yy + bh * .3}" width="${bw * .22}" height="${bh * .3}" fill="#3A2A28" opacity=".7"/>`;
      if (srnd() < .3) s += `<rect x="${x - 1}" y="${yy - 3}" width="${bw + 2}" height="3" fill="#E9E1D3"/>`;
    }
  });
  return svgDoc(w, h, s, lg('sky', [[0, skyTop], [1, skyBot]]));
}

/* ---- the repair shop (wall with a window hole, shelves, sign) ---- */
function shopWallSVG() {
  const w = W, h = H, wx = 110, wy = 110, ww = 700, wh = 400;
  let s = `<path fill-rule="evenodd" d="M0 0H${w}V${h}H0Z M${wx} ${wy}h${ww}v${wh}h${-ww}Z" fill="url(#wall)"/>`;
  s += `<rect x="0" y="560" width="${w}" height="340" fill="#2BA39A"/><rect x="0" y="556" width="${w}" height="10" fill="#1F7F78"/>`;
  for (let x = 0; x < w; x += 80) s += `<rect x="${x}" y="566" width="2" height="334" fill="#1F7F78" opacity=".5"/>`;
  s += `<rect x="${wx - 14}" y="${wy - 14}" width="${ww + 28}" height="${wh + 28}" rx="6" fill="none" stroke="#FFFFFF" stroke-width="20"/><rect x="${wx + ww / 2 - 6}" y="${wy}" width="12" height="${wh}" fill="#FFFFFF"/><rect x="${wx - 30}" y="${wy + wh + 10}" width="${ww + 60}" height="18" rx="4" fill="#E9E1D3"/>`;
  s += [0, 1, 2, 3, 4].map(i => `<path d="M${wx + 20 + i * 140} ${wy + wh + 10} q 20 -40 40 0" fill="${[PAL.pink, PAL.yellow, '#FF8A1E', PAL.pink, '#B98CFF'][i]}"/><rect x="${wx + 30 + i * 140}" y="${wy + wh + 2}" width="22" height="14" fill="${PAL.brick}"/>`).join('');
  // sign
  s += `<rect x="900" y="40" width="640" height="96" rx="20" fill="${PAL.ink}"/><text x="1220" y="98" font-family="Arial Black, Arial" font-weight="900" font-size="40" fill="${PAL.sun}" text-anchor="middle">REPARACIONES EL PARCERO</text><text x="1220" y="126" font-family="Arial" font-weight="700" font-size="20" fill="#5FE0C8" text-anchor="middle">Celulares · Tabletas · Medellín</text>`;
  // shelves
  for (let r = 0; r < 3; r++) {
    const y = 190 + r * 120; s += `<rect x="1180" y="${y + 80}" width="360" height="12" fill="${PAL.wood2}"/>`;
    for (let k = 0; k < 6; k++) { const bx = 1192 + k * 56, c = [PAL.blue, PAL.red, PAL.dark, PAL.yellow, PAL.teal, '#F2F2F2'][(k + r) % 6]; s += `<rect x="${bx}" y="${y + 18}" width="44" height="62" rx="5" fill="${c}"/><rect x="${bx + 8}" y="${y + 26}" width="28" height="44" rx="4" fill="#17122E" opacity=".35"/>`; }
  }
  s += `<rect x="1180" y="560" width="360" height="12" fill="${PAL.wood2}" opacity=".0"/>`;
  // tool board
  s += `<rect x="930" y="190" width="220" height="300" rx="12" fill="#E8DCC6"/>`;
  for (let i = 0; i < 6; i++) s += `<rect x="${955 + (i % 3) * 64}" y="${215 + Math.floor(i / 3) * 130}" width="10" height="${80 + (i % 2) * 20}" rx="4" fill="${[PAL.red, PAL.blue, PAL.yellow][i % 3]}"/><rect x="${952 + (i % 3) * 64}" y="${290 + Math.floor(i / 3) * 130 + (i % 2) * 20}" width="16" height="30" rx="3" fill="#7C8290"/>`;
  return [svgDoc(w, h, s, lg('wall', [[0, '#F6EEDF'], [1, '#EBDDC6']])), w, h];
}
function counterSVG() {
  const w = W, h = 300;
  const s = `<rect x="0" y="40" width="${w}" height="${h - 40}" fill="url(#ctr)"/><rect x="0" y="20" width="${w}" height="40" rx="6" fill="#D9B07A"/><rect x="0" y="54" width="${w}" height="10" fill="#7A5230" opacity=".5"/>
    ${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 100 + 6}" y="80" width="88" height="200" rx="8" fill="#8A5A32" opacity=".35"/>`).join('')}
    <rect x="600" y="8" width="420" height="22" rx="8" fill="#2E2A45"/><rect x="616" y="12" width="388" height="14" rx="6" fill="#3E8E5E" opacity=".7"/>`;
  return [svgDoc(w, h, s, lg('ctr', [[0, '#B98A52'], [1, '#8A5A32']])), w, h];
}
function cabinSVG(c = PAL.red) { const s = `<rect x="47" y="0" width="6" height="34" fill="#4A4F5C"/><rect x="10" y="30" width="80" height="62" rx="12" fill="${c}"/><rect x="18" y="40" width="64" height="26" rx="5" fill="#BFE3F7"/><rect x="48" y="40" width="4" height="26" fill="${c}"/><rect x="10" y="78" width="80" height="6" fill="#17122E" opacity=".2"/>`; return [svgDoc(100, 96, s), 100, 96]; }
function posterSilleteroSVG() {
  let fl = ''; for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, r = 50 + (i % 3) * 14; fl += `<circle cx="${110 + Math.cos(a) * r}" cy="${118 + Math.sin(a) * r * .8}" r="${12 + (i % 2) * 5}" fill="${[PAL.pink, PAL.yellow, '#FF8A1E', '#FFFFFF', '#B98CFF'][i % 5]}"/>`; }
  const s = `<rect width="220" height="300" rx="10" fill="#2E2A45"/><rect x="10" y="10" width="200" height="280" rx="6" fill="#FFF4E2"/>${fl}<circle cx="110" cy="118" r="34" fill="${PAL.green}"/><rect x="60" y="190" width="100" height="10" fill="${PAL.wood2}"/><text x="110" y="240" font-family="Arial Black,Arial" font-size="22" font-weight="900" fill="${PAL.ink}" text-anchor="middle">FERIA DE</text><text x="110" y="266" font-family="Arial Black,Arial" font-size="22" font-weight="900" fill="${PAL.red}" text-anchor="middle">LAS FLORES</text>`;
  return [svgDoc(220, 300, s), 220, 300];
}
function primaveraSVG() { const s = `<rect width="200" height="130" rx="14" fill="#FFFFFF"/><rect x="6" y="6" width="188" height="118" rx="10" fill="#5FB4E8"/><circle cx="56" cy="56" r="26" fill="#FFD25A"/>${Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2; return `<rect x="54" y="18" width="4" height="12" fill="#FFD25A" transform="rotate(${a * 57.3} 56 56)"/>`; }).join('')}<text x="140" y="70" font-family="Arial Black,Arial" font-size="40" font-weight="900" fill="#FFFFFF" text-anchor="middle">24°</text><text x="100" y="110" font-family="Arial" font-size="17" font-weight="700" fill="#FFFFFF" text-anchor="middle">Medellín · hoy</text>`; return [svgDoc(200, 130, s), 200, 130]; }
function stickerSVG() { const s = `<rect x="4" y="4" width="232" height="92" rx="46" fill="${PAL.yellow}" stroke="#17122E" stroke-width="5"/><text x="120" y="60" font-family="Arial Black,Arial" font-size="27" font-weight="900" fill="${PAL.ink}" text-anchor="middle">¿Qué más, parce?</text>`; return [svgDoc(240, 100, s), 240, 100]; }
function tintoSVG() { const s = `${shadow(60, 104, 50, 10, .25)}<ellipse cx="60" cy="96" rx="52" ry="12" fill="#FFFFFF"/><path d="M26 40 h68 l-8 54 h-52z" fill="#FFFFFF"/><path d="M92 50 q22 4 10 26 q-6 8 -14 6" fill="none" stroke="#FFFFFF" stroke-width="8"/><ellipse cx="60" cy="42" rx="34" ry="8" fill="#3A1E12"/><path d="M48 30 q-8 -14 4 -26 M66 30 q-8 -14 4 -26" fill="none" stroke="#FFFFFF" stroke-width="4" opacity=".7"/>`; return [svgDoc(120, 120, s), 120, 120]; }

/* ---- customers behind the counter (bust) ---- */
const CUSTOMERS = [
  { id: 'gloria', name: 'Doña Gloria', fem: true, skin: '#E0AC85', hair: '#B8B8C0', style: 'bun', top: PAL.pink, glasses: true, pitch: 1.0, rate: .88 },
  { id: 'hernan', name: 'Don Hernán', fem: false, skin: '#C68863', hair: '#E6E6EA', style: 'bald', top: '#F2F2F2', moustache: true, pitch: .78, rate: .9, hat: true },
  { id: 'valentina', name: 'Valentina', fem: true, skin: '#F2C6A0', hair: '#2B1D16', style: 'long', top: PAL.teal, earrings: true, pitch: 1.2, rate: 1.02 },
  { id: 'santiago', name: 'Santiago', fem: false, skin: '#8D5A3B', hair: '#17110E', style: 'curly', top: PAL.yellow, pitch: .92, rate: 1.0 },
  { id: 'marcela', name: 'Marcela', fem: true, skin: '#C68863', hair: '#5A2E1E', style: 'ponytail', top: PAL.violet, pitch: 1.1, rate: .98 },
  { id: 'julian', name: 'Julián', fem: false, skin: '#F2C6A0', hair: '#8A5A2B', style: 'short', top: PAL.blue, glasses: true, pitch: .86, rate: .96, beard: true },
];
function bustSVG(c) {
  const w = 460, h = 560, sk = c.skin, hr = c.hair;
  let back = '', front = '';
  if (c.style === 'long') back = `<path d="M130 170 q-30 200 10 300 h180 q40 -100 10 -300z" fill="${hr}"/>`;
  if (c.style === 'ponytail') back = `<path d="M330 150 q70 40 40 200 q-30 -40 -50 -60z" fill="${hr}"/>`;
  if (c.style === 'bun') back = `<circle cx="230" cy="84" r="46" fill="${hr}"/>`;
  if (c.style === 'bald') front = `<path d="M140 190 q-10 -40 20 -60 M320 190 q10 -40 -20 -60" stroke="${hr}" stroke-width="22" fill="none" stroke-linecap="round"/>`;
  else if (c.style === 'curly') front = Array.from({ length: 14 }, (_, i) => { const a = Math.PI + i / 13 * Math.PI; return `<circle cx="${230 + Math.cos(a) * 100}" cy="${200 + Math.sin(a) * 100}" r="34" fill="${hr}"/>`; }).join('');
  else front = `<path d="M128 220 q-6 -120 102 -126 q108 6 102 126 q-30 -70 -102 -76 q-72 6 -102 76z" fill="${hr}"/>`;
  const eyes = `<ellipse cx="190" cy="232" rx="12" ry="15" fill="#17122E"/><ellipse cx="270" cy="232" rx="12" ry="15" fill="#17122E"/><circle cx="194" cy="226" r="4" fill="#fff"/><circle cx="274" cy="226" r="4" fill="#fff"/><path d="M172 204 q18 -10 36 -2 M252 202 q18 -8 36 2" stroke="${c.style === 'bald' ? '#8A8A90' : hr}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  const glasses = c.glasses ? `<g fill="none" stroke="#2E2A45" stroke-width="6"><circle cx="190" cy="232" r="30"/><circle cx="270" cy="232" r="30"/><path d="M220 232 h20"/></g>` : '';
  const ear = c.earrings ? `<circle cx="128" cy="270" r="9" fill="${PAL.yellow}"/><circle cx="332" cy="270" r="9" fill="${PAL.yellow}"/>` : '';
  const beard = c.beard ? `<path d="M150 260 q80 110 160 0 q-10 70 -80 76 q-70 -6 -80 -76z" fill="${hr}" opacity=".9"/>` : '';
  const mous = c.moustache ? `<path d="M190 288 q40 -18 80 0 q-40 8 -80 0z" fill="${hr}"/>` : '';
  const hat = c.hat ? `<ellipse cx="230" cy="140" rx="150" ry="26" fill="#F2E6C9"/><path d="M150 140 q10 -80 80 -84 q70 4 80 84z" fill="#F2E6C9"/><rect x="152" y="118" width="156" height="16" fill="#17122E"/>` : '';
  const s = `${back}<path d="M60 ${h} q10 -170 170 -180 q160 10 170 180z" fill="${c.top}"/><path d="M180 390 q50 40 100 0 l-10 -40 h-80z" fill="${sk}"/><rect x="196" y="300" width="68" height="80" fill="${sk}"/>
    <ellipse cx="230" cy="236" rx="104" ry="118" fill="${sk}"/><ellipse cx="128" cy="244" rx="16" ry="26" fill="${sk}"/><ellipse cx="332" cy="244" rx="16" ry="26" fill="${sk}"/>
    <ellipse cx="166" cy="276" rx="20" ry="12" fill="#FF6F8A" opacity=".25"/><ellipse cx="294" cy="276" rx="20" ry="12" fill="#FF6F8A" opacity=".25"/>
    <path d="M226 246 q-10 34 4 40" stroke="#17122E" stroke-width="4" fill="none" opacity=".35"/>${front}${eyes}${glasses}${ear}${beard}${mous}${hat}`;
  return [svgDoc(w, h, s), w, h];
}
function mouthSVG(open) { return [svgDoc(80, 50, open ? `<ellipse cx="40" cy="22" rx="22" ry="16" fill="#5A1E2C"/><ellipse cx="40" cy="30" rx="12" ry="6" fill="#E8586E"/><rect x="24" y="8" width="32" height="6" rx="3" fill="#fff"/>` : `<path d="M18 20 q22 18 44 0" stroke="#7A2E3A" stroke-width="6" fill="none" stroke-linecap="round"/>`), 80, 50]; }

/* ---- phones ---- */
function phoneSVG(color = '#2E2A45', screen = '#7FE7FF', w = 120, h = 230) {
  const s = `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="18" fill="${color}"/><rect x="10" y="20" width="${w - 20}" height="${h - 40}" rx="8" fill="${screen}"/><rect x="${w / 2 - 14}" y="8" width="28" height="5" rx="2.5" fill="#000" opacity=".5"/><rect x="18" y="30" width="${w - 36}" height="${(h - 60) * .45}" rx="6" fill="#FFFFFF" opacity=".25"/>`;
  return [svgDoc(w, h, s), w, h];
}
function phoneCloseSVG(damage) {
  const w = 420, h = 780; let d = '';
  if (damage === 'crack') d = '';
  if (damage === 'water') d = Array.from({ length: 14 }, (_, i) => `<path d="M${60 + (i * 53) % 300} ${120 + (i * 97) % 520} q10 18 0 26 q-10 -8 0 -26z" fill="#BFE6FF" opacity=".9"/>`).join('') + `<rect x="34" y="60" width="352" height="640" rx="20" fill="#1B5C8C" opacity=".35"/>`;
  if (damage === 'port') d = `<path d="M150 760 l20 -26 l14 18 l18 -22 l16 20 l20 -18 l16 28" stroke="#F2F2F2" stroke-width="6" fill="none"/><rect x="170" y="740" width="80" height="22" rx="8" fill="#000"/><path d="M175 745 l20 14 M215 742 l20 16" stroke="#FFC27A" stroke-width="5"/>`;
  if (damage === 'coffee') d = `<circle cx="210" cy="60" r="40" fill="#5A2E1E" opacity=".75"/><path d="M120 90 q40 30 20 80 q40 -10 60 30 q30 -40 70 -10" fill="#5A2E1E" opacity=".55"/><circle cx="210" cy="56" r="10" fill="#000"/>`;
  if (damage === 'camera') d = `<g transform="translate(300 90)"><circle r="44" fill="#17122E"/><circle r="30" fill="#2A3A5A"/><path d="M-30 -10 l60 20 M-20 24 l30 -50 M0 -30 l10 60" stroke="#FFFFFF" stroke-width="4"/></g>`;
  if (damage === 'battery') d = `<ellipse cx="210" cy="390" rx="170" ry="120" fill="#FFFFFF" opacity=".18"/><path d="M40 300 q170 -60 340 0" stroke="#FFFFFF" stroke-width="5" fill="none" opacity=".6"/><path d="M40 480 q170 60 340 0" stroke="#FFFFFF" stroke-width="5" fill="none" opacity=".6"/>`;
  const screen = damage === 'water' || damage === 'battery' ? '#1E1E28' : damage === 'camera' || damage === 'coffee' ? '#2E2A45' : '#5FB4E8';
  const s = `<rect x="6" y="6" width="${w - 12}" height="${h - 12}" rx="46" fill="#2E2A45"/><rect x="34" y="60" width="${w - 68}" height="${h - 140}" rx="20" fill="${screen}"/><rect x="${w / 2 - 40}" y="26" width="80" height="12" rx="6" fill="#000" opacity=".6"/>${d}`;
  return [svgDoc(w, h, s), w, h];
}

/* ---- people for the accident pictures (full body, feet at bottom) ---- */
function personSVG(o = {}) {
  const w = 200, h = 420, sk = o.skin || '#E0AC85', hr = o.hair || '#2B1D16', top = o.top || PAL.blue, pants = o.pants || PAL.dark, pose = o.pose || 'stand', fem = !!o.fem;
  let arms = '', legs = '';
  if (pose === 'run') { legs = `<path d="M92 290 l-40 70 l-6 50" stroke="${pants}" stroke-width="30" fill="none" stroke-linecap="round"/><path d="M110 290 l40 50 l30 50" stroke="${pants}" stroke-width="30" fill="none" stroke-linecap="round"/>`; arms = `<path d="M70 180 l-40 50 l10 50" stroke="${top}" stroke-width="24" fill="none" stroke-linecap="round"/><path d="M130 180 l40 30 l20 -30" stroke="${top}" stroke-width="24" fill="none" stroke-linecap="round"/>`; }
  else { legs = `<rect x="76" y="280" width="24" height="130" rx="12" fill="${pants}"/><rect x="104" y="280" width="24" height="130" rx="12" fill="${pants}"/>`; }
  if (pose === 'stand') arms = `<rect x="44" y="170" width="24" height="120" rx="12" fill="${top}"/><rect x="132" y="170" width="24" height="120" rx="12" fill="${top}"/><circle cx="56" cy="294" r="13" fill="${sk}"/><circle cx="144" cy="294" r="13" fill="${sk}"/>`;
  if (pose === 'photo') arms = `<rect x="44" y="170" width="24" height="120" rx="12" fill="${top}"/><circle cx="56" cy="294" r="13" fill="${sk}"/><path d="M144 180 l30 -10 l-8 -60" stroke="${top}" stroke-width="24" fill="none" stroke-linecap="round"/><circle cx="166" cy="104" r="13" fill="${sk}"/>`;
  if (pose === 'reach') arms = `<path d="M60 180 l-30 40" stroke="${top}" stroke-width="24" fill="none" stroke-linecap="round"/><path d="M140 180 l46 20" stroke="${top}" stroke-width="24" fill="none" stroke-linecap="round"/><circle cx="190" cy="202" r="13" fill="${sk}"/>`;
  const skirt = fem && o.skirt !== false ? `<path d="M70 250 h60 l20 80 h-100z" fill="${pants}"/>` : '';
  const hair = fem ? `<path d="M58 90 q0 -70 42 -70 q42 0 42 70 l8 70 q-20 10 -30 -30 q-20 -40 -20 -50 q-10 20 -40 30 l-10 50 q-10 -10 8 -70z" fill="${hr}"/>` : `<path d="M60 80 q0 -56 40 -58 q40 2 40 58 q-14 -26 -40 -28 q-26 2 -40 28z" fill="${hr}"/>`;
  const s = `${shadow(100, 410, 60, 10)}${legs}<rect x="64" y="150" width="72" height="140" rx="28" fill="${top}"/>${skirt}${arms}<rect x="90" y="128" width="20" height="26" fill="${sk}"/><circle cx="100" cy="90" r="44" fill="${sk}"/>${hair}<circle cx="86" cy="92" r="5" fill="#17122E"/><circle cx="114" cy="92" r="5" fill="#17122E"/><path d="M88 112 q12 9 24 0" stroke="#7A2E3A" stroke-width="4" fill="none" stroke-linecap="round"/>${o.helmet ? `<path d="M52 72 q48 -70 96 0z" fill="${PAL.red}"/>` : ''}`;
  return [svgDoc(w, h, s), w, h];
}
function dogSVG() { const s = `${shadow(110, 150, 80, 12)}<ellipse cx="110" cy="100" rx="70" ry="36" fill="#C9822E"/><rect x="58" y="110" width="16" height="40" rx="8" fill="#C9822E"/><rect x="140" y="110" width="16" height="40" rx="8" fill="#C9822E"/><circle cx="178" cy="70" r="32" fill="#C9822E"/><ellipse cx="200" cy="80" rx="18" ry="12" fill="#E8B87A"/><circle cx="214" cy="76" r="6" fill="#17122E"/><circle cx="182" cy="62" r="5" fill="#17122E"/><path d="M160 46 q-10 -26 10 -30 q6 16 0 30z" fill="#8A5A22"/><path d="M40 90 q-30 -10 -24 -40" stroke="#C9822E" stroke-width="12" fill="none" stroke-linecap="round"/>`; return [svgDoc(240, 160, s), 240, 160]; }
function sofaSVG() { const s = `${shadow(220, 214, 200, 14)}<rect x="20" y="40" width="400" height="110" rx="30" fill="#5FA8D3"/><rect x="0" y="110" width="440" height="80" rx="26" fill="#4A8FBC"/><rect x="40" y="96" width="170" height="40" rx="16" fill="#76BBE0"/><rect x="230" y="96" width="170" height="40" rx="16" fill="#76BBE0"/><rect x="20" y="186" width="16" height="30" fill="#5A3A22"/><rect x="404" y="186" width="16" height="30" fill="#5A3A22"/>`; return [svgDoc(440, 220, s), 440, 220]; }
function cableSVG() { const s = `<path d="M10 20 q60 60 120 10 q60 -40 120 30" stroke="#F2F2F2" stroke-width="8" fill="none" stroke-linecap="round"/><rect x="240" y="38" width="34" height="22" rx="5" fill="#F2F2F2"/>`; return [svgDoc(280, 70, s), 280, 70]; }
function umbrellaSVG() { const s = `<path d="M10 90 q100 -110 200 0 q-25 -20 -50 0 q-25 -20 -50 0 q-25 -20 -50 0 q-25 -20 -50 0z" fill="${PAL.red}"/><rect x="106" y="80" width="8" height="120" fill="#2E2A45"/><path d="M110 200 q0 16 -16 16" stroke="#2E2A45" stroke-width="8" fill="none"/>`; return [svgDoc(220, 220, s), 220, 220]; }
function cloudSVG(c = '#7C8290') { const s = `<g fill="${c}"><circle cx="70" cy="70" r="46"/><circle cx="130" cy="54" r="56"/><circle cx="190" cy="74" r="44"/><rect x="40" y="70" width="190" height="46" rx="23"/></g>`; return [svgDoc(260, 130, s), 260, 130]; }
function puddleSVG() { const s = `<ellipse cx="140" cy="40" rx="134" ry="30" fill="#4F8FC0" opacity=".85"/><ellipse cx="120" cy="34" rx="70" ry="10" fill="#BFE6FF" opacity=".6"/>`; return [svgDoc(280, 80, s), 280, 80]; }
function busStopSVG() { const s = `<rect x="10" y="20" width="12" height="260" fill="#4A4F5C"/><rect x="230" y="20" width="12" height="260" fill="#4A4F5C"/><rect x="0" y="0" width="252" height="34" rx="6" fill="${PAL.green}"/><text x="126" y="24" font-family="Arial Black,Arial" font-size="20" fill="#fff" text-anchor="middle">PARADERO</text><rect x="30" y="60" width="190" height="150" fill="#BFE3F7" opacity=".45"/><rect x="40" y="200" width="170" height="14" fill="${PAL.wood2}"/>`; return [svgDoc(252, 290, s), 252, 290]; }
function sunSVG() { const s = `<circle cx="110" cy="110" r="56" fill="#FFD25A"/>${Array.from({ length: 12 }, (_, i) => `<rect x="106" y="10" width="8" height="30" rx="4" fill="#FFD25A" transform="rotate(${i * 30} 110 110)"/>`).join('')}`; return [svgDoc(220, 220, s), 220, 220]; }
function carSVG(c = PAL.red) { const s = `${shadow(200, 190, 190, 14)}<path d="M20 150 q0 -40 40 -46 l60 -50 q20 -14 60 -14 h80 q30 0 50 20 l40 44 q50 6 50 46 v20 h-380z" fill="${c}"/><path d="M134 64 l-40 40 h110 v-48 h-40q-20 0 -30 8z M224 56 v48 h96 l-34 -38 q-10 -10 -30 -10z" fill="#BFE3F7"/><circle cx="96" cy="176" r="28" fill="#1E1E28"/><circle cx="96" cy="176" r="12" fill="#C9CED8"/><circle cx="304" cy="176" r="28" fill="#1E1E28"/><circle cx="304" cy="176" r="12" fill="#C9CED8"/><rect x="370" y="130" width="22" height="12" rx="4" fill="#FFF2C0"/>`; return [svgDoc(400, 210, s), 400, 210]; }
function glassesSVG() { const s = `<g fill="#17122E"><ellipse cx="40" cy="30" rx="32" ry="22"/><ellipse cx="120" cy="30" rx="32" ry="22"/></g><path d="M72 26 q8 -8 16 0" stroke="#17122E" stroke-width="6" fill="none"/><path d="M14 22 l-12 -6 M146 22 l12 -6" stroke="#17122E" stroke-width="5"/>`; return [svgDoc(160, 60, s), 160, 60]; }
function bagSVG(c = PAL.pink) { const s = `<path d="M50 40 q0 -34 40 -34 q40 0 40 34" stroke="#2E2A45" stroke-width="7" fill="none"/><rect x="20" y="40" width="140" height="140" rx="10" fill="${c}"/><text x="90" y="124" font-family="Arial Black,Arial" font-size="22" fill="#fff" text-anchor="middle">OFERTA</text>`; return [svgDoc(180, 190, s), 180, 190]; }
function arepaSVG() { const s = `${shadow(90, 86, 80, 10)}<ellipse cx="90" cy="70" rx="84" ry="14" fill="#FFFFFF"/><ellipse cx="90" cy="56" rx="62" ry="22" fill="#E8C27A"/><ellipse cx="90" cy="50" rx="56" ry="16" fill="#F2D08F"/>${[[70, 46], [100, 52], [86, 44], [112, 46]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#C9822E" opacity=".6"/>`).join('')}<rect x="60" y="34" width="60" height="14" rx="6" fill="#FFF7D6"/>`; return [svgDoc(180, 100, s), 180, 100]; }
function tableSVG() { const s = `<rect x="0" y="0" width="420" height="26" rx="8" fill="#D9B07A"/><rect x="30" y="26" width="16" height="190" fill="#8A5A32"/><rect x="374" y="26" width="16" height="190" fill="#8A5A32"/>`; return [svgDoc(420, 220, s), 420, 220]; }
function bikeSVG() { const s = `${shadow(170, 200, 150, 12)}<circle cx="70" cy="140" r="56" fill="none" stroke="#17122E" stroke-width="10"/><circle cx="270" cy="140" r="56" fill="none" stroke="#17122E" stroke-width="10"/><path d="M70 140 l70 -80 h90 l40 80 M140 60 l40 80 h-110 M230 60 l-10 -26 h-26" stroke="${PAL.teal}" stroke-width="10" fill="none" stroke-linejoin="round"/><rect x="120" y="44" width="44" height="12" rx="6" fill="#17122E"/>`; return [svgDoc(340, 210, s), 340, 210]; }
function helmetSVG() { const s = `<path d="M10 90 q0 -80 90 -80 q90 0 90 80z" fill="${PAL.red}"/><path d="M40 40 h120 M30 64 h140" stroke="#fff" stroke-width="8" opacity=".5"/><rect x="10" y="86" width="180" height="12" rx="6" fill="#17122E"/>`; return [svgDoc(200, 110, s), 200, 110]; }
function bottleSVG() { const s = `<rect x="16" y="30" width="48" height="120" rx="14" fill="#5FB4E8" opacity=".9"/><rect x="26" y="8" width="28" height="26" rx="4" fill="${PAL.blue}"/><rect x="16" y="70" width="48" height="30" fill="#FFFFFF" opacity=".5"/>`; return [svgDoc(80, 160, s), 80, 160]; }
function treeSVG() { const s = `<rect x="88" y="200" width="24" height="120" fill="#7A5230"/><circle cx="100" cy="130" r="80" fill="${PAL.green}"/><circle cx="60" cy="170" r="50" fill="${PAL.green2}"/><circle cx="146" cy="160" r="54" fill="#357A50"/>`; return [svgDoc(200, 320, s), 200, 320]; }
function motionSVG() { const s = `<g stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity=".9"><path d="M20 10 v40"/><path d="M50 0 v60"/><path d="M80 10 v40"/></g>`; return [svgDoc(100, 70, s), 100, 70]; }
function heatSVG() { const s = `<g stroke="#FF8A1E" stroke-width="6" fill="none" stroke-linecap="round"><path d="M20 90 q-14 -20 0 -40 q14 -20 0 -40"/><path d="M60 90 q-14 -20 0 -40 q14 -20 0 -40"/><path d="M100 90 q-14 -20 0 -40 q14 -20 0 -40"/></g>`; return [svgDoc(120, 100, s), 120, 100]; }
function splashSVG() { const s = `<g fill="#BFE6FF">${Array.from({ length: 9 }, (_, i) => { const a = Math.PI + i / 8 * Math.PI; return `<ellipse cx="${100 + Math.cos(a) * 70}" cy="${80 + Math.sin(a) * 60}" rx="9" ry="15" transform="rotate(${a * 57.3 + 90} ${100 + Math.cos(a) * 70} ${80 + Math.sin(a) * 60})"/>`; }).join('')}</g>`; return [svgDoc(200, 100, s), 200, 100]; }

/* ---- backgrounds for the six accident pictures ---- */
function bgMetrocable() { const [svg] = [hillsSVG(W, H, 5)]; return [svg.replace('</svg>', `<rect x="1180" y="420" width="380" height="300" fill="#E9E1D3"/><rect x="1160" y="400" width="420" height="40" fill="${PAL.green}"/><text x="1370" y="428" font-family="Arial Black,Arial" font-size="28" fill="#fff" text-anchor="middle">ESTACIÓN</text><rect x="1220" y="480" width="300" height="140" fill="#BFE3F7" opacity=".6"/><rect x="0" y="720" width="${W}" height="180" fill="#C9C0B0"/><path d="M-20 140 L1400 470" stroke="#3A3F4C" stroke-width="6"/></svg>`), W, H]; }
function bgRain() { let s = `<rect width="${W}" height="${H}" fill="url(#rs)"/>`; for (let i = 0; i < 9; i++) s += `<rect x="${i * 190 - 20}" y="${180 + (i % 3) * 40}" width="170" height="${520 - (i % 3) * 40}" fill="${['#C9B8A8', '#B5A090', '#D9C8B0'][i % 3]}"/>${Array.from({ length: 8 }, (_, k) => `<rect x="${i * 190 + (k % 3) * 50}" y="${210 + (i % 3) * 40 + Math.floor(k / 3) * 90}" width="30" height="46" fill="#5A6A80" opacity=".6"/>`).join('')}`; s += `<rect x="0" y="700" width="${W}" height="200" fill="#5A5F6C"/><rect x="0" y="690" width="${W}" height="20" fill="#9AA0AC"/>${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 170 + 40}" y="800" width="90" height="10" fill="#E6E6EA" opacity=".6"/>`).join('')}`; return [svgDoc(W, H, s, lg('rs', [[0, '#7C8290'], [1, '#B8BEC8']])), W, H]; }
function bgLiving() { const s = `<rect width="${W}" height="${H}" fill="#F2E3C6"/><rect x="0" y="640" width="${W}" height="260" fill="#C9A27A"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 140}" y="640" width="2" height="260" fill="#A8825A"/>`).join('')}<rect x="980" y="140" width="460" height="330" fill="#FFFFFF"/><rect x="996" y="156" width="428" height="298" fill="url(#gd)"/><rect x="1206" y="156" width="10" height="298" fill="#FFFFFF"/><circle cx="1100" cy="380" r="60" fill="${PAL.green2}"/><circle cx="1320" cy="400" r="50" fill="${PAL.green}"/><ellipse cx="560" cy="790" rx="420" ry="60" fill="${PAL.pink}" opacity=".5"/><rect x="200" y="160" width="220" height="160" rx="8" fill="#FFFFFF"/><rect x="214" y="174" width="192" height="132" fill="${PAL.sky}"/><path d="M214 306 l60 -70 l40 40 l40 -60 l52 90z" fill="${PAL.green}"/>`; return [svgDoc(W, H, s, lg('gd', [[0, '#8EC9F0'], [1, '#CFE8F7']])), W, H]; }
function bgCafe() { const s = `<rect width="${W}" height="${H}" fill="#FFF0D6"/>${Array.from({ length: 40 }, (_, i) => `<rect x="${(i % 10) * 160}" y="${560 + Math.floor(i / 10) * 85}" width="160" height="85" fill="${(i + Math.floor(i / 10)) % 2 ? '#E8D6B8' : '#F6E8CC'}"/>`).join('')}<rect x="900" y="120" width="560" height="260" rx="14" fill="#2E2A45"/><text x="1180" y="180" font-family="Arial Black,Arial" font-size="40" fill="${PAL.sun}" text-anchor="middle">LA ESQUINA</text><text x="960" y="250" font-family="Arial" font-weight="700" font-size="32" fill="#FFF4E2">Tinto ........ $2.000</text><text x="960" y="300" font-family="Arial" font-weight="700" font-size="32" fill="#FFF4E2">Arepa con queso .. $5.000</text><text x="960" y="350" font-family="Arial" font-weight="700" font-size="32" fill="#FFF4E2">Buñuelo ...... $1.500</text><rect x="80" y="160" width="600" height="20" fill="${PAL.wood2}"/><rect x="80" y="280" width="600" height="20" fill="${PAL.wood2}"/>${Array.from({ length: 10 }, (_, i) => `<rect x="${100 + i * 58}" y="${i % 2 ? 100 : 220}" width="40" height="60" rx="8" fill="${[PAL.red, PAL.yellow, PAL.green, PAL.blue][i % 4]}"/>`).join('')}`; return [svgDoc(W, H, s), W, H]; }
function bgCiclovia() { const s = `<rect width="${W}" height="${H}" fill="url(#cs)"/><path d="M0 420 q400 -60 800 -10 q400 40 800 -20 V900 H0z" fill="${PAL.green2}"/><path d="M0 520 L1600 520 L1600 820 L0 820z" fill="#6A6F7C"/><path d="M0 666 h1600" stroke="#FFD25A" stroke-width="10" stroke-dasharray="60 40"/><rect x="0" y="820" width="${W}" height="80" fill="${PAL.green}"/><rect x="60" y="300" width="14" height="230" fill="#4A4F5C"/><rect x="20" y="260" width="200" height="60" rx="10" fill="${PAL.blue}"/><text x="120" y="300" font-family="Arial Black,Arial" font-size="28" fill="#fff" text-anchor="middle">CICLOVÍA</text>`; return [svgDoc(W, H, s, lg('cs', [[0, '#8EC9F0'], [1, '#E6F4FB']])), W, H]; }
function bgParking() { const s = `<rect width="${W}" height="${H}" fill="url(#ps)"/><rect x="200" y="160" width="1200" height="380" rx="20" fill="#E9E1D3"/><rect x="200" y="160" width="1200" height="70" rx="20" fill="${PAL.violet}"/><text x="800" y="210" font-family="Arial Black,Arial" font-size="42" fill="#fff" text-anchor="middle">CENTRO COMERCIAL</text>${Array.from({ length: 6 }, (_, i) => `<rect x="${260 + i * 190}" y="270" width="140" height="200" fill="#BFE3F7" opacity=".7"/>`).join('')}<rect x="0" y="540" width="${W}" height="360" fill="#7C8290"/>${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 190 + 30}" y="600" width="10" height="200" fill="#FFFFFF" opacity=".8"/>`).join('')}<text x="1440" y="640" font-family="Arial Black,Arial" font-size="30" fill="#FFFFFF" opacity=".9" text-anchor="middle">PARQUEADERO</text>`; return [svgDoc(W, H, s, lg('ps', [[0, '#5FB4E8'], [1, '#CFE8F7']])), W, H]; }
