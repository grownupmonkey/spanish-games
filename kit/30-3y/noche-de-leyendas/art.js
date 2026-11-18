/* ===================== ART: scenes, portraits, map (all drawn in SVG, no image files) ===================== */
let __uid = 0;
const uid = p => `${p}${++__uid}`;
function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hashStr = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
function shade(hex, f) {   // f < 0 darkens toward night violet, f > 0 lightens
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255;
  if (f < 0) { const k = -f; r = r * (1 - k) + 24 * k; g = g * (1 - k) + 18 * k; b = b * (1 - k) + 52 * k; }
  else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
  return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}

/* Sky palettes: 0 = golden hour … 4 = night */
const SKY = [
  { top: '#3B2A6B', mid: '#B4577A', hor: '#FFB36B', sun: 400, stars: 0, glow: .55, volc: '#5E3F7C', volcLit: '#9A5C86', dark: .08 },
  { top: '#2E2462', mid: '#8E4D86', hor: '#F08A6A', sun: 455, stars: .15, glow: .72, volc: '#4D3672', volcLit: '#7E4E80', dark: .18 },
  { top: '#231C52', mid: '#5E3D7E', hor: '#C76A78', sun: 520, stars: .45, glow: .86, volc: '#3C2D64', volcLit: '#5E3F74', dark: .3 },
  { top: '#1A1542', mid: '#382B68', hor: '#79497C', sun: 600, stars: .75, glow: 1, volc: '#2F2657', volcLit: '#45346A', dark: .42 },
  { top: '#110E30', mid: '#221B4D', hor: '#47306C', sun: 700, stars: 1, glow: 1, volc: '#251E4A', volcLit: '#32285A', dark: .52 }
];
const FACADE_COLORS = ['#E8B04B', '#D9774B', '#C9506A', '#4E8FB8', '#E6D3A3', '#7FA65A', '#D98FA0', '#F0C987', '#B5654A'];

function skyLayer(t, rng) {
  const P = SKY[t], g = uid('sky'), sg = uid('sun');
  let s = `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.top}"/><stop offset=".55" stop-color="${P.mid}"/><stop offset="1" stop-color="${P.hor}"/></linearGradient>`
    + `<radialGradient id="${sg}"><stop offset="0" stop-color="#FFE7B0"/><stop offset=".4" stop-color="#FFC27A" stop-opacity=".7"/><stop offset="1" stop-color="#FFC27A" stop-opacity="0"/></radialGradient></defs>`
    + `<rect width="1200" height="520" fill="url(#${g})"/>`;
  if (P.stars > 0) {
    s += `<g opacity="${P.stars}">`;
    for (let i = 0; i < 70; i++) s += `<circle class="twinkle" style="animation-delay:${(rng() * 4).toFixed(2)}s" cx="${(rng() * 1200).toFixed(0)}" cy="${(rng() * 300).toFixed(0)}" r="${(rng() * 1.4 + .4).toFixed(1)}" fill="#FFF6E0"/>`;
    s += '</g>';
  }
  if (P.sun < 560) s += `<circle cx="300" cy="${P.sun}" r="170" fill="url(#${sg})"/>`;
  if (t >= 3) s += `<g class="moon"><circle cx="1010" cy="96" r="30" fill="#FFF3D6" opacity=".95"/><circle cx="1022" cy="88" r="27" fill="${P.top}" opacity=".85"/><circle cx="1010" cy="96" r="60" fill="#FFF3D6" opacity=".07"/></g>`;
  s += `<g class="clouds" opacity="${.5 - t * .08}"><ellipse cx="200" cy="140" rx="160" ry="14" fill="${shade(P.hor, .2)}"/><ellipse cx="880" cy="210" rx="210" ry="12" fill="${shade(P.mid, .25)}"/></g>`;
  return s;
}
function volcanoLayer(t) {
  const P = SKY[t], g = uid('vg');
  let s = `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${P.volcLit}"/><stop offset=".55" stop-color="${P.volc}"/><stop offset="1" stop-color="${shade(P.volc, -.25)}"/></linearGradient></defs>`;
  // Fuego and Acatenango (southwest)
  s += `<path d="M-20 480 L110 270 L150 250 L196 286 L248 232 L282 236 L430 480 Z" fill="${shade(P.volc, -.15)}"/>`;
  s += `<g class="smoke"><circle cx="266" cy="214" r="14" fill="#CFC6EC" opacity=".22"/><circle cx="280" cy="196" r="18" fill="#CFC6EC" opacity=".16"/><circle cx="300" cy="176" r="22" fill="#CFC6EC" opacity=".1"/></g>`;
  if (t >= 2) s += `<circle class="lava" cx="265" cy="236" r="10" fill="#FF6A3D" opacity=".6"/>`;
  // Volcán de Agua (south)
  s += `<path d="M400 480 L690 158 Q760 126 830 158 L1130 480 Z" fill="url(#${g})"/>`;
  s += `<path d="M690 158 Q760 126 830 158 L812 178 Q760 164 708 178 Z" fill="${shade(P.volcLit, .12)}" opacity=".6"/>`;
  s += `<ellipse cx="760" cy="300" rx="260" ry="10" fill="${shade(P.hor, .1)}" opacity=".25"/>`;
  return s;
}
function building(x, w, top, color, rng, t, opts = {}) {
  const P = SKY[t], c = shade(color, -P.dark), base = 600;
  let s = `<rect x="${x}" y="${top}" width="${w}" height="${base - top}" fill="${c}"/>`;
  s += `<rect x="${x}" y="${base - 26}" width="${w}" height="26" fill="${shade(c, -.25)}"/>`;              // plinth
  s += `<rect x="${x - 6}" y="${top - 12}" width="${w + 12}" height="14" rx="3" fill="${shade('#9A4A30', -P.dark)}"/>`; // tiled eave
  for (let k = x - 4; k < x + w + 4; k += 12) s += `<path d="M${k} ${top - 12} q6 -6 12 0" fill="none" stroke="${shade('#C2603A', -P.dark)}" stroke-width="3"/>`;
  const doorX = x + w / 2 - 30;
  s += `<path d="M${doorX} ${base} V${base - 92} a30 30 0 0 1 60 0 V${base} Z" fill="${shade('#5A3A28', -P.dark)}" stroke="${shade('#3A2418', -P.dark)}" stroke-width="3"/>`;
  s += `<line x1="${doorX + 30}" y1="${base - 120}" x2="${doorX + 30}" y2="${base}" stroke="#2A1810" stroke-width="2" opacity=".6"/>`;
  [[doorX + 14, base - 50], [doorX + 46, base - 50], [doorX + 14, base - 24], [doorX + 46, base - 24]].forEach(([a, b]) => { s += `<circle cx="${a}" cy="${b}" r="2.2" fill="#C9A15A" opacity=".8"/>`; });
  const nWin = w > 200 ? 2 : 1;
  for (let i = 0; i < nWin; i++) {
    const wx = nWin === 1 ? (rng() < .5 ? x + 14 : x + w - 64) : (i === 0 ? x + 14 : x + w - 64), wy = top + 40;
    const lit = rng() < .45 + t * .12;
    s += `<rect x="${wx - 6}" y="${wy - 6}" width="62" height="88" rx="4" fill="${shade(c, -.2)}"/>`;
    s += `<rect class="${lit ? 'winglow' : ''}" x="${wx}" y="${wy}" width="50" height="76" rx="3" fill="${lit ? '#FFC874' : shade('#2A2152', -.1)}" opacity="${lit ? (.55 + P.glow * .45).toFixed(2) : .9}"/>`;
    if (lit) s += `<rect x="${wx - 20}" y="${wy - 20}" width="90" height="116" fill="#FFC874" opacity="${(.06 * P.glow).toFixed(2)}" rx="20"/>`;
    for (let b = 1; b < 5; b++) s += `<line x1="${wx + b * 10}" y1="${wy}" x2="${wx + b * 10}" y2="${wy + 76}" stroke="#1E1630" stroke-width="2.4"/>`;
    s += `<path d="M${wx} ${wy + 10} q25 -16 50 0" fill="none" stroke="#1E1630" stroke-width="2.4"/>`;
    s += `<rect x="${wx - 8}" y="${wy + 76}" width="66" height="7" rx="2" fill="${shade(c, -.3)}"/>`;
  }
  if (opts.lantern) {
    const lx = rng() < .5 ? doorX - 18 : doorX + 78, ly = base - 130, lg = uid('lg');
    s += `<defs><radialGradient id="${lg}"><stop offset="0" stop-color="#FFD98A" stop-opacity=".9"/><stop offset="1" stop-color="#FFB25A" stop-opacity="0"/></radialGradient></defs>`;
    s += `<circle class="lanternglow" cx="${lx}" cy="${ly + 14}" r="${50 + P.glow * 30}" fill="url(#${lg})" opacity="${(.35 + P.glow * .5).toFixed(2)}"/>`;
    s += `<path d="M${lx} ${ly - 14} v8" stroke="#1E1630" stroke-width="3"/><path d="M${lx - 9} ${ly - 6} h18 l-4 26 h-10 z" fill="#2A2033"/><rect x="${lx - 6}" y="${ly - 2}" width="12" height="18" fill="#FFE2A0"/>`;
  }
  if (opts.flowers) {
    const fx = x + 10 + rng() * (w - 60);
    s += `<g class="sway">`;
    for (let i = 0; i < 14; i++) s += `<circle cx="${(fx + rng() * 70).toFixed(0)}" cy="${(top - 8 + rng() * 40).toFixed(0)}" r="${(6 + rng() * 7).toFixed(0)}" fill="${['#D9417E', '#E8579A', '#B8306A', '#3F7D4E'][i % 4]}" opacity="${(.75 - P.dark * .4).toFixed(2)}"/>`;
    s += '</g>';
  }
  return s;
}
function facadeRows(rng, t, gap = [430, 770]) {
  let s = '', x = -30;
  while (x < gap[0]) {
    const w = 150 + Math.floor(rng() * 110), wEff = Math.min(w, gap[0] - x);
    if (wEff < 90) break;
    s += building(x, wEff, 300 + Math.floor(rng() * 70), pick(FACADE_COLORS), rng, t, { lantern: rng() < .7, flowers: rng() < .45 });
    x += wEff;
  }
  x = gap[1];
  while (x < 1230) {
    const w = 150 + Math.floor(rng() * 110);
    s += building(x, w, 300 + Math.floor(rng() * 70), pick(FACADE_COLORS), rng, t, { lantern: rng() < .7, flowers: rng() < .45 });
    x += w;
  }
  return s;
}
function distantStreet(t, rng, landmark) {
  const P = SKY[t];
  let s = '';
  // receding street: small far buildings
  for (let i = 0; i < 4; i++) {
    const x = 440 + i * 82, h = 40 + rng() * 30;
    s += `<rect x="${x}" y="${470 - h}" width="80" height="${h + 20}" fill="${shade(pick(FACADE_COLORS), -P.dark - .25)}"/>`;
    if (rng() < .6) s += `<rect x="${x + 30}" y="${470 - h + 12}" width="12" height="16" fill="#FFC874" opacity="${(.4 + P.glow * .4).toFixed(2)}"/>`;
  }
  if (landmark === 'merced') s += mercedFacade(600, 470, .9, t);
  if (landmark === 'catedral') s += catedralFacade(600, 470, .9, t);
  s += `<path d="M300 675 L540 470 L660 470 L900 675 Z" fill="${shade('#5A4A66', -P.dark)}"/>`;
  for (let r = 0; r < 9; r++) {
    const y = 480 + r * r * 2.4, half = 64 + (y - 470) * 1.17;
    for (let k = -half; k < half; k += 18 + r * 3) s += `<ellipse cx="${(600 + k + (r % 2) * 8).toFixed(0)}" cy="${y.toFixed(0)}" rx="${4 + r}" ry="${1.6 + r * .4}" fill="${shade('#7A6A86', -P.dark)}" opacity=".55"/>`;
  }
  return s;
}
function mercedFacade(cx, base, k, t) {
  const P = SKY[t], c = shade('#F2C14E', -P.dark * .8), w = 200 * k, h = 150 * k, x = cx - w / 2, y = base - h;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
  s += `<path d="M${x - 10} ${y} L${cx} ${y - 50 * k} L${x + w + 10} ${y} Z" fill="${c}"/>`;
  s += `<rect x="${x - 26}" y="${y - 10}" width="${30 * k}" height="${h + 10}" fill="${shade(c, -.08)}"/><rect x="${x + w - 4}" y="${y - 10}" width="${30 * k}" height="${h + 10}" fill="${shade(c, -.08)}"/>`;
  for (let i = 0; i < 18; i++) s += `<circle cx="${x + 12 + (i % 6) * 34 * k}" cy="${y + 20 + Math.floor(i / 6) * 34 * k}" r="${3.5 * k}" fill="#FFF6E0" opacity=".85"/>`;
  s += `<path d="M${cx - 22 * k} ${base} V${base - 60 * k} a${22 * k} ${22 * k} 0 0 1 ${44 * k} 0 V${base} Z" fill="#4A3020"/>`;
  return s;
}
function catedralFacade(cx, base, k, t) {
  const P = SKY[t], c = shade('#EADBC4', -P.dark * .8), w = 230 * k, h = 130 * k, x = cx - w / 2, y = base - h;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
  [x - 6, x + w - 34 * k].forEach(tx => { s += `<rect x="${tx}" y="${y - 70 * k}" width="${40 * k}" height="${h + 70 * k}" fill="${shade(c, -.06)}"/><path d="M${tx} ${y - 70 * k} q${20 * k} -30 ${40 * k} 0" fill="${shade(c, -.1)}"/><rect x="${tx + 12 * k}" y="${y - 50 * k}" width="${16 * k}" height="${24 * k}" rx="8" fill="#2A2033"/>`; });
  for (let i = 0; i < 3; i++) s += `<path d="M${x + 50 * k + i * 50 * k} ${base} V${base - 50 * k} a${16 * k} ${16 * k} 0 0 1 ${32 * k} 0 V${base} Z" fill="#3A2A2A"/>`;
  return s;
}
function streetFront(t) {
  const P = SKY[t];
  return `<rect x="0" y="596" width="1200" height="10" fill="${shade('#8A7A70', -P.dark)}"/><rect x="0" y="606" width="1200" height="70" fill="${shade('#4E4058', -P.dark)}"/>`;
}

/* ---- props ---- */
function propTuktuk(t) {
  const P = SKY[t];
  return `<g class="bob"><ellipse cx="820" cy="646" rx="180" ry="12" fill="#000" opacity=".3"/>`
    + `<path d="M690 470 Q700 446 740 444 L930 444 Q956 446 960 470 L960 600 L680 600 Z" fill="#1E1630"/>`
    + `<path d="M676 600 L676 520 Q680 486 720 482 L800 482 L812 600 Z" fill="${shade('#C8322E', -P.dark * .6)}"/>`
    + `<path d="M800 482 L950 482 Q966 484 966 504 L966 600 L800 600 Z" fill="${shade('#D9473A', -P.dark * .6)}"/>`
    + `<path d="M700 520 Q704 496 728 494 L790 494 L790 560 L700 560 Z" fill="#9FC7E6" opacity=".55"/>`
    + `<rect x="820" y="500" width="120" height="60" rx="10" fill="#1E1630" opacity=".5"/>`
    + `<rect x="676" y="586" width="290" height="16" rx="6" fill="#2A2033"/>`
    + `<g><rect x="900" y="510" width="34" height="8" fill="#4FA3E0"/><rect x="900" y="518" width="34" height="8" fill="#F4F0E6"/><rect x="900" y="526" width="34" height="8" fill="#4FA3E0"/></g>`
    + `<circle cx="690" cy="560" r="10" fill="#FFE7A8"/><circle cx="690" cy="560" r="${40 + P.glow * 30}" fill="#FFE7A8" opacity="${(.12 + P.glow * .1).toFixed(2)}"/>`
    + [[720, 620], [900, 620]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="26" fill="#14102A"/><circle cx="${a}" cy="${b}" r="10" fill="#8A8295"/>`).join('') + `</g>`;
}
function propComedor(t) {
  const P = SKY[t];
  let s = `<path d="M-10 70 Q600 150 1210 70" stroke="#14102A" stroke-width="2" fill="none"/>`;
  for (let i = 0; i < 12; i++) { const x = 40 + i * 100, y = 70 + Math.sin(Math.PI * (x + 10) / 1220) * 72; s += `<circle cx="${x}" cy="${y + 8}" r="16" fill="#FFE7A8" opacity="${(.2 * P.glow).toFixed(2)}"/><circle class="bulb" style="animation-delay:${i * .3}s" cx="${x}" cy="${y + 8}" r="4" fill="#FFE7A8"/>`; }
  s += `<rect x="360" y="560" width="900" height="120" fill="#5A3A28"/>`;
  const stripes = ['#C9506A', '#F2C14E', '#3E7BD8', '#3FA36B', '#8A4FC7', '#E07A2F'];
  for (let i = 0; i < 18; i++) s += `<rect x="${360 + i * 50}" y="560" width="50" height="56" fill="${shade(stripes[i % 6], -P.dark * .5)}"/><path d="M${360 + i * 50} 588 l12 -8 l12 8 l12 -8 l12 8" stroke="#F4F0E6" stroke-width="2" fill="none" opacity=".6"/>`;
  s += `<ellipse cx="760" cy="560" rx="70" ry="14" fill="#2A1810" opacity=".4"/><path d="M700 560 Q696 500 760 494 Q824 500 820 560 Z" fill="#A0522D"/><ellipse cx="760" cy="496" rx="52" ry="10" fill="#6A3018"/>`;
  s += `<g class="steam"><path d="M740 480 q-10 -20 0 -40 q10 -20 0 -40" stroke="#F4F0E6" stroke-width="4" fill="none" opacity=".35"/><path d="M770 478 q10 -22 0 -44 q-10 -20 0 -40" stroke="#F4F0E6" stroke-width="4" fill="none" opacity=".3"/></g>`;
  s += `<ellipse cx="960" cy="556" rx="64" ry="18" fill="#C9A15A"/><path d="M904 548 Q960 520 1016 548" fill="#F4F0E6"/><path d="M910 548 l20 -10 l20 10 l20 -10 l20 10 l20 -10" stroke="#C9506A" stroke-width="3" fill="none"/>`;
  s += `<rect x="1060" y="520" width="40" height="40" rx="6" fill="#E6D3A3"/><rect x="560" y="528" width="34" height="34" rx="5" fill="#8A4FC7" opacity=".85"/>`;
  return s;
}
function propMarket(t, rng) {
  const P = SKY[t];
  let s = `<rect x="420" y="380" width="800" height="230" fill="${shade('#3A2A4A', -P.dark)}"/>`;
  s += `<path d="M400 380 L1220 380 L1200 340 L420 340 Z" fill="${shade('#B85C38', -P.dark)}"/>`;
  for (let k = 420; k < 1220; k += 40) s += `<path d="M${k} 380 q20 18 40 0" fill="${shade(k % 80 ? '#F4F0E6' : '#B85C38', -P.dark)}"/>`;
  const cols = ['#D8433E', '#3E7BD8', '#8A4FC7', '#3FA36B', '#E8B83A', '#E07A2F', '#C9506A'];
  for (let i = 0; i < 9; i++) {
    const x = 450 + i * 84, c = shade(cols[i % cols.length], -P.dark * .6), h = 150 + (i % 3) * 20;
    s += `<g class="sway" style="animation-delay:${i * .2}s"><rect x="${x}" y="400" width="66" height="${h}" fill="${c}"/>`;
    for (let r = 0; r < 4; r++) s += `<path d="M${x} ${430 + r * 32} l11 -10 l11 10 l11 -10 l11 10 l11 -10 l11 10" stroke="${shade(cols[(i + r + 2) % cols.length], .3)}" stroke-width="4" fill="none"/>`;
    s += `<rect x="${x}" y="${400 + h - 8}" width="66" height="8" fill="${shade(c, -.3)}"/></g>`;
  }
  s += `<rect x="380" y="590" width="860" height="90" fill="#5A3A28"/>`;
  for (let i = 0; i < 6; i++) s += `<rect x="${430 + i * 130}" y="566" width="100" height="26" rx="6" fill="${shade(cols[(i + 3) % cols.length], -P.dark * .5)}"/>`;
  return s;
}
function propPark(t) {
  const P = SKY[t];
  let s = '';
  [[120, 420, 120], [1080, 400, 140]].forEach(([x, y, r]) => { s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${shade('#2E5A40', -P.dark)}"/><circle cx="${x - r * .4}" cy="${y - r * .3}" r="${r * .6}" fill="${shade('#3A7050', -P.dark)}"/><rect x="${x - 10}" y="${y + r * .6}" width="20" height="${600 - y - r * .6}" fill="#3A2A26"/>`; });
  s += `<ellipse cx="760" cy="606" rx="230" ry="30" fill="${shade('#6A6280', -P.dark)}"/><ellipse cx="760" cy="596" rx="220" ry="26" fill="${shade('#3E6E9E', -P.dark)}" opacity=".9"/>`;
  s += `<rect x="738" y="470" width="44" height="126" fill="${shade('#9A92A8', -P.dark)}"/><ellipse cx="760" cy="470" rx="90" ry="16" fill="${shade('#9A92A8', -P.dark)}"/><ellipse cx="760" cy="420" rx="46" ry="10" fill="${shade('#9A92A8', -P.dark)}"/><rect x="750" y="420" width="20" height="50" fill="${shade('#9A92A8', -P.dark)}"/>`;
  s += `<g class="water"><path d="M760 410 q-30 30 -60 60 M760 410 q30 30 60 60" stroke="#9FD3F0" stroke-width="3" fill="none" opacity=".6"/></g>`;
  [[520, 450], [1010, 450]].forEach(([x, y]) => { s += `<rect x="${x - 3}" y="${y}" width="6" height="${600 - y}" fill="#14102A"/><circle cx="${x}" cy="${y}" r="10" fill="#FFE7A8"/><circle cx="${x}" cy="${y}" r="${46 + P.glow * 30}" fill="#FFE7A8" opacity="${(.1 + P.glow * .1).toFixed(2)}"/>`; });
  s += `<rect x="900" y="560" width="140" height="10" rx="3" fill="#5A3A28"/><rect x="910" y="570" width="8" height="30" fill="#3A2418"/><rect x="1022" y="570" width="8" height="30" fill="#3A2418"/>`;
  return s;
}
function propBuses(t, paints) {
  const P = SKY[t];
  let s = '';
  [400, 640, 880].forEach((x, i) => {
    const [a, b] = paints[i] || ['#D8433E', '#F2C14E'];
    s += `<g class="bob" style="animation-delay:${i * .4}s"><ellipse cx="${x + 110}" cy="636" rx="130" ry="10" fill="#000" opacity=".3"/>`
      + `<rect x="${x}" y="440" width="220" height="170" rx="18" fill="${shade(a, -P.dark * .5)}"/><rect x="${x}" y="540" width="220" height="24" fill="${shade(b, -P.dark * .5)}"/>`
      + `<path d="M${x} 560 q110 -24 220 0" stroke="${shade(b, .2)}" stroke-width="5" fill="none"/>`
      + `<rect x="${x + 18}" y="462" width="184" height="62" rx="8" fill="#1E1630" opacity=".75"/><rect x="${x + 26}" y="468" width="80" height="50" fill="#9FC7E6" opacity=".25"/>`
      + `<rect x="${x + 10}" y="420" width="200" height="20" rx="4" fill="#2A2033"/><rect x="${x + 30}" y="406" width="40" height="18" rx="4" fill="#C9A15A"/><rect x="${x + 120}" y="408" width="56" height="16" rx="4" fill="#8A4FC7"/>`
      + `<circle cx="${x + 30}" cy="586" r="9" fill="#FFE7A8"/><circle cx="${x + 190}" cy="586" r="9" fill="#FFE7A8"/>`
      + `<circle cx="${x + 110}" cy="494" r="22" fill="#FFC27A"/><text x="${x + 110}" y="503" text-anchor="middle" font-family="Unbounded, sans-serif" font-weight="700" font-size="24" fill="#17122E">${i + 1}</text>`
      + `<circle cx="${x + 50}" cy="616" r="20" fill="#14102A"/><circle cx="${x + 170}" cy="616" r="20" fill="#14102A"/></g>`;
  });
  return s;
}
function propPosada(t) {
  const P = SKY[t];
  let s = `<rect x="0" y="250" width="1200" height="360" fill="${shade('#E6D3A3', -P.dark)}"/>`;
  for (let i = 0; i < 6; i++) { const x = 30 + i * 200; s += `<path d="M${x} 600 V360 a70 70 0 0 1 140 0 V600 Z" fill="${shade('#2A2152', -P.dark * .3)}"/><rect x="${x - 30}" y="300" width="30" height="300" fill="${shade('#D9C49A', -P.dark)}"/>`; }
  s += `<rect x="0" y="232" width="1200" height="24" fill="${shade('#9A4A30', -P.dark)}"/>`;
  s += `<ellipse cx="420" cy="600" rx="120" ry="20" fill="${shade('#9A92A8', -P.dark)}"/><rect x="408" y="520" width="24" height="80" fill="${shade('#9A92A8', -P.dark)}"/><ellipse cx="420" cy="520" rx="60" ry="12" fill="${shade('#9A92A8', -P.dark)}"/>`;
  for (let i = 0; i < 16; i++) s += `<circle cx="${180 + (i * 37) % 160}" cy="${460 + (i * 23) % 120}" r="${10 + (i % 3) * 4}" fill="${['#D9417E', '#3F7D4E', '#E8579A'][i % 3]}" opacity=".8"/>`;
  s += `<rect x="700" y="520" width="520" height="160" fill="#5A3A28"/><rect x="700" y="510" width="520" height="16" fill="#7A5236"/>`;
  s += `<path d="M850 510 a18 14 0 0 1 36 0 Z" fill="#C9A15A"/><circle cx="868" cy="494" r="4" fill="#C9A15A"/>`;
  s += `<rect x="960" y="480" width="70" height="30" rx="8" fill="#1E1630"/><path d="M968 480 q27 -26 54 0" stroke="#1E1630" stroke-width="8" fill="none"/>`;
  s += `<rect x="1060" y="300" width="110" height="140" rx="6" fill="#5A3A28"/>`;
  for (let i = 0; i < 6; i++) s += `<circle cx="${1080 + (i % 3) * 34}" cy="${330 + Math.floor(i / 3) * 60}" r="4" fill="#C9A15A"/><rect x="${1076 + (i % 3) * 34}" y="${334 + Math.floor(i / 3) * 60}" width="8" height="22" rx="2" fill="#C9A15A"/>`;
  return s;
}
function propCafe(t) {
  const P = SKY[t];
  let s = `<rect x="0" y="0" width="1200" height="610" fill="#3A2633"/>`;
  s += `<rect x="560" y="60" width="560" height="380" rx="10" fill="#14102A"/>`;
  s += `<g clip-path="inset(0)"><svg x="566" y="66" width="548" height="368" viewBox="380 120 800 520" preserveAspectRatio="xMidYMid slice">${skyLayer(t, mulberry(7))}${volcanoLayer(t)}</svg></g>`;
  s += `<path d="M840 60 V440 M560 250 H1120" stroke="#3A2633" stroke-width="10"/>`;
  s += `<rect x="70" y="80" width="400" height="20" fill="#5A3A28"/><rect x="70" y="200" width="400" height="20" fill="#5A3A28"/>`;
  for (let i = 0; i < 7; i++) s += `<rect x="${86 + i * 54}" y="${40}" width="40" height="40" rx="6" fill="${['#C9A15A', '#8A5A3A', '#E6D3A3'][i % 3]}"/><rect x="${86 + i * 54}" y="${160}" width="40" height="40" rx="6" fill="${['#8A5A3A', '#E6D3A3', '#C9A15A'][i % 3]}"/>`;
  s += `<rect x="90" y="260" width="300" height="180" rx="8" fill="#1E2A26" stroke="#7A5236" stroke-width="8"/>`;
  for (let i = 0; i < 5; i++) s += `<path d="M120 ${300 + i * 28} q40 -8 80 0 t80 0" stroke="#F4F0E6" stroke-width="3" fill="none" opacity=".5"/>`;
  [200, 520, 840, 1100].forEach((x, i) => { s += `<line x1="${x}" y1="0" x2="${x}" y2="${60 + i % 2 * 20}" stroke="#14102A" stroke-width="2"/><circle class="bulb" style="animation-delay:${i * .5}s" cx="${x}" cy="${70 + i % 2 * 20}" r="10" fill="#FFD98A"/><circle cx="${x}" cy="${70 + i % 2 * 20}" r="60" fill="#FFD98A" opacity=".1"/>`; });
  s += `<rect x="0" y="520" width="1200" height="160" fill="#5A3A28"/><rect x="0" y="508" width="1200" height="18" fill="#7A5236"/>`;
  s += `<rect x="700" y="420" width="150" height="90" rx="10" fill="#B8B4C4"/><rect x="716" y="436" width="118" height="20" rx="4" fill="#5A5468"/><rect x="740" y="470" width="14" height="24" fill="#3A3448"/><rect x="796" y="470" width="14" height="24" fill="#3A3448"/>`;
  s += `<g class="steam"><path d="M960 470 q-8 -18 0 -36 q8 -18 0 -36" stroke="#F4F0E6" stroke-width="3" fill="none" opacity=".35"/></g><path d="M940 476 h44 v28 a12 12 0 0 1 -12 12 h-20 a12 12 0 0 1 -12 -12 z" fill="#F4F0E6"/><path d="M984 482 q14 0 14 12 q0 12 -14 12" stroke="#F4F0E6" stroke-width="5" fill="none"/>`;
  return s;
}
function propArco(t) {
  const P = SKY[t], c = shade('#F4B740', -P.dark * .7), d = shade('#D8962C', -P.dark * .7), w = '#FFF3D6', lg = uid('al');
  let s = `<defs><radialGradient id="${lg}"><stop offset="0" stop-color="#FFD98A" stop-opacity=".9"/><stop offset="1" stop-color="#FFB25A" stop-opacity="0"/></radialGradient></defs>`;
  s += `<path fill-rule="evenodd" d="M330 200 H870 V610 H330 Z M470 610 V410 A130 120 0 0 1 730 410 V610 Z" fill="${c}"/>`;
  s += `<rect x="322" y="186" width="556" height="18" rx="4" fill="${d}"/>`;
  s += `<rect x="540" y="96" width="120" height="96" fill="${c}"/><path d="M528 100 H672 L600 50 Z" fill="${d}"/><circle cx="600" cy="140" r="30" fill="${w}"/><circle cx="600" cy="140" r="30" fill="none" stroke="${d}" stroke-width="5"/><path d="M600 140 V120 M600 140 L614 148" stroke="#2A2033" stroke-width="4" stroke-linecap="round"/>`;
  for (let i = 0; i < 9; i++) s += `<rect x="${352 + i * 58}" y="228" width="30" height="42" rx="15" fill="${shade(d, -.2)}"/>`;
  s += `<path d="M470 610 V410 A130 120 0 0 1 730 410 V610" stroke="${w}" stroke-width="9" fill="none" opacity=".85"/>`;
  s += `<path d="M330 300 H470 M730 300 H870" stroke="${d}" stroke-width="6"/>`;
  [[400, 470], [800, 470]].forEach(([x, y]) => { s += `<circle class="lanternglow" cx="${x}" cy="${y}" r="${70 + P.glow * 30}" fill="url(#${lg})" opacity="${(.4 + P.glow * .4).toFixed(2)}"/><path d="M${x} ${y - 26} v8" stroke="#1E1630" stroke-width="3"/><path d="M${x - 10} ${y - 18} h20 l-4 30 h-12 z" fill="#2A2033"/><rect x="${x - 7}" y="${y - 13}" width="14" height="20" fill="#FFE2A0"/>`; });
  for (let i = 0; i < 16; i++) { const x = 60 + i * 72 + (i % 2) * 20, h = 70 + (i % 3) * 16; s += `<path d="M${x - 24} 680 Q${x - 26} ${680 - h} ${x} ${680 - h - 6} Q${x + 26} ${680 - h} ${x + 24} 680 Z" fill="#0E0B1E" opacity=".92"/><circle cx="${x}" cy="${680 - h - 22}" r="17" fill="#0E0B1E"/>`; }
  return s;
}

/* Full scene: cfg = { props, landmark, paints }, t = 0..4 */
function sceneSVG(cfg, t, seed) {
  const rng = mulberry(seed || 1);
  const pr = cfg.props;
  let back = `<g class="plx" data-depth="4">${skyLayer(t, rng)}</g><g class="plx" data-depth="9">${volcanoLayer(t)}</g>`;
  let mid = '', front = '';
  if (pr === 'cafe') { mid = ''; front = propCafe(t); back = ''; }
  else if (pr === 'posada') { front = propPosada(t); }
  else if (pr === 'arch') {
    mid = `<g class="plx" data-depth="16">${distantStreet(t, rng, null)}</g>`;
    front = facadeRows(rng, t, [330, 870]) + propArco(t);
  } else {
    mid = `<g class="plx" data-depth="16">${distantStreet(t, rng, cfg.landmark)}</g>`;
    front = facadeRows(rng, t) + streetFront(t);
    if (pr === 'tuktuk') front += propTuktuk(t);
    if (pr === 'comedor') front += propComedor(t);
    if (pr === 'market') front += propMarket(t, rng);
    if (pr === 'park') front += propPark(t);
    if (pr === 'buses') front += propBuses(t, cfg.paints || []);
  }
  const vg = uid('vig');
  return `<svg class="scene" viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><radialGradient id="${vg}" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#07051A" stop-opacity=".6"/></radialGradient></defs>`
    + back + mid + `<g class="plx" data-depth="26">${front}</g><rect width="1200" height="675" fill="url(#${vg})" pointer-events="none"/></svg>`;
}

/* ---- portraits ---- */
function bustSVG(L = {}) {
  const skin = L.skin || '#A86E50', hair = L.hair || '#1E1612', col = L.color || '#3E7BD8', acc = L.accent || '#F2C14E';
  const st = L.style || 'short', old = L.age === 'old', clip = uid('tc'), bg = uid('pb');
  let s = `<svg viewBox="0 0 200 220" aria-hidden="true"><defs><radialGradient id="${bg}" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="#7B4A80"/><stop offset="1" stop-color="#2A2152"/></radialGradient>`
    + `<clipPath id="${clip}"><path d="M18 222 C 20 168 54 146 100 146 C 146 146 180 168 182 222 Z"/></clipPath></defs><rect width="200" height="220" fill="url(#${bg})"/>`;
  if (st === 'long') s += `<path d="M56 86 C 44 150 52 196 64 214 L 136 214 C 148 196 156 150 144 86 Z" fill="${hair}"/>`;
  s += `<path d="M18 222 C 20 168 54 146 100 146 C 146 146 180 168 182 222 Z" fill="${col}"/>`;
  if (L.outfit === 'huipil') {
    s += `<g clip-path="url(#${clip})">`;
    for (let r = 0; r < 4; r++) s += `<path d="M0 ${170 + r * 14} l10 -7 l10 7 l10 -7 l10 7 l10 -7 l10 7 l10 -7 l10 7 l10 -7 l10 7 l10 -7 l10 7 l10 -7 l10 7 l10 -7 l10 7 l10 -7 l10 7 l10 -7 l10 7" stroke="${r % 2 ? acc : '#F4F0E6'}" stroke-width="3.5" fill="none"/>`;
    s += `</g><path d="M80 150 L100 172 L120 150" fill="${acc}"/>`;
  } else if (L.outfit === 'uniform') {
    s += `<path d="M78 150 L100 176 L122 150 L112 148 L100 162 L88 148 Z" fill="#E8E4F0"/><path d="M100 176 L96 222 H104 Z" fill="#14102A"/><path d="M128 178 l8 -4 l8 4 v10 l-8 6 l-8 -6 z" fill="#E8B83A"/>`;
  } else if (L.outfit === 'apron') {
    s += `<path d="M66 176 Q100 168 134 176 L138 222 H62 Z" fill="${acc}"/><path d="M76 176 L86 150 M124 176 L114 150" stroke="${acc}" stroke-width="5"/>`;
  } else if (L.outfit === 'jacket') {
    s += `<path d="M84 148 L100 190 L116 148 Z" fill="#E8E4F0"/><path d="M84 148 L70 200 L100 190 Z M116 148 L130 200 L100 190 Z" fill="${shade(col, -.25)}"/>`;
  } else {
    s += `<path d="M84 148 L100 168 L116 148 Z" fill="${shade(col, -.2)}"/>`;
  }
  s += `<rect x="86" y="118" width="28" height="36" rx="11" fill="${shade(skin, -.12)}"/>`;
  s += `<ellipse cx="62" cy="92" rx="7" ry="10" fill="${shade(skin, -.06)}"/><ellipse cx="138" cy="92" rx="7" ry="10" fill="${shade(skin, -.06)}"/>`;
  s += `<ellipse cx="100" cy="88" rx="38" ry="43" fill="${skin}"/>`;
  if (st === 'short') s += `<path d="M62 84 C 60 52 80 42 100 42 C 124 42 142 54 138 84 C 132 70 120 62 100 62 C 82 62 70 70 62 84 Z" fill="${hair}"/>`;
  if (st === 'curly') { s += `<g fill="${hair}">`; [[70, 60], [84, 48], [100, 44], [116, 48], [130, 60], [64, 76], [136, 76]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="13"/>`; }); s += '</g>'; }
  if (st === 'long' || st === 'braid' || st === 'bun') s += `<path d="M60 92 C 58 50 82 40 100 40 C 120 40 142 50 140 92 C 132 70 118 58 100 60 C 84 58 70 70 60 92 Z" fill="${hair}"/><path d="M100 42 V60" stroke="${shade(hair, .15)}" stroke-width="2"/>`;
  if (st === 'bun') s += `<circle cx="100" cy="36" r="15" fill="${hair}"/>`;
  if (st === 'braid') s += `<g fill="${hair}"><ellipse cx="146" cy="130" rx="9" ry="13"/><ellipse cx="148" cy="152" rx="8" ry="12"/><ellipse cx="149" cy="172" rx="7" ry="11"/></g><path d="M142 104 q8 10 4 26" stroke="${hair}" stroke-width="10" fill="none"/><circle cx="149" cy="186" r="5" fill="${acc}"/>`;
  if (st === 'bald') s += `<path d="M62 92 C 60 76 64 66 70 62 L72 92 Z M138 92 C 140 76 136 66 130 62 L128 92 Z" fill="${hair}"/>`;
  s += `<path d="M78 80 q9 -5 18 0 M104 80 q9 -5 18 0" stroke="${shade(hair, -.1)}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  s += `<ellipse cx="87" cy="92" rx="4.2" ry="5" fill="#1C1733"/><ellipse cx="113" cy="92" rx="4.2" ry="5" fill="#1C1733"/><circle cx="88.5" cy="90" r="1.4" fill="#FFE7A8"/><circle cx="114.5" cy="90" r="1.4" fill="#FFE7A8"/>`;
  s += `<path d="M100 96 q-4 10 0 14" stroke="${shade(skin, -.25)}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  s += `<circle cx="78" cy="106" r="7" fill="#E06F7A" opacity=".22"/><circle cx="122" cy="106" r="7" fill="#E06F7A" opacity=".22"/>`;
  if (old) s += `<path d="M74 100 q-4 4 -2 8 M126 100 q4 4 2 8 M90 70 q10 -3 20 0" stroke="${shade(skin, -.25)}" stroke-width="1.6" fill="none"/>`;
  if (L.beard) s += `<path d="M66 100 C 70 136 90 140 100 140 C 110 140 130 136 134 100 C 128 118 116 126 100 126 C 84 126 72 118 66 100 Z" fill="${hair}"/>`;
  if (L.mustache) s += `<path d="M86 116 C 92 110 98 112 100 115 C 102 112 108 110 114 116 C 108 118 104 118 100 117 C 96 118 92 118 86 116 Z" fill="${hair}"/>`;
  s += `<path d="M90 122 Q100 129 110 122" stroke="#4A2030" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  if (L.glasses) s += `<g fill="none" stroke="#1C1733" stroke-width="2.4"><circle cx="87" cy="92" r="10"/><circle cx="113" cy="92" r="10"/><path d="M97 92 h6"/></g>`;
  if (L.hat === 'sombrero') s += `<ellipse cx="100" cy="56" rx="72" ry="13" fill="#D9B36A"/><path d="M68 56 C 70 26 84 18 100 18 C 116 18 130 26 132 56 Z" fill="#E6C37A"/><rect x="69" y="44" width="62" height="8" fill="#7A3B2A"/>`;
  if (L.hat === 'cap') s += `<path d="M62 70 C 62 40 80 34 100 34 C 122 34 138 42 138 70 Z" fill="${L.outfit === 'uniform' ? '#1E2A4A' : shade(col, -.2)}"/><path d="M62 68 Q50 72 46 78 L100 74 Z" fill="${L.outfit === 'uniform' ? '#14102A' : shade(col, -.4)}"/>${L.outfit === 'uniform' ? '<circle cx="100" cy="52" r="6" fill="#E8B83A"/>' : ''}`;
  return s + '</svg>';
}

/* ---- map of Antigua (grid) ---- */
const MAP = { x0: 250, dx: 122, y0: 74, dy: 64, cols: 7, rows: 8 };
const nodeXY = (c, r) => [MAP.x0 + (c - 1) * MAP.dx, MAP.y0 + (r - 1) * MAP.dy];
function glyphSVG(kind, x, y, color) {
  if (kind === 'church') return `<g transform="translate(${x} ${y})"><path d="M-14 8 V-8 L0 -18 L14 -8 V8 Z" fill="${color}"/><rect x="-4" y="-2" width="8" height="10" fill="#2A2033"/><path d="M0 -26 V-18 M-4 -23 H4" stroke="${color}" stroke-width="2"/></g>`;
  if (kind === 'arch') return `<g transform="translate(${x} ${y})"><path d="M-18 8 V-10 H18 V8 H8 V0 A8 8 0 0 0 -8 0 V8 Z" fill="${color}"/><rect x="-5" y="-18" width="10" height="8" fill="${color}"/></g>`;
  if (kind === 'fountain') return `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="4" rx="16" ry="6" fill="${color}" opacity=".8"/><rect x="-2" y="-12" width="4" height="16" fill="#CFC6EC"/><ellipse cx="0" cy="-12" rx="8" ry="3" fill="#CFC6EC"/></g>`;
  if (kind === 'tank') return `<g transform="translate(${x} ${y})"><rect x="-18" y="-6" width="36" height="14" rx="3" fill="${color}"/><path d="M-16 -6 V-14 M0 -6 V-14 M16 -6 V-14" stroke="#CFC6EC" stroke-width="3"/><path d="M-18 -14 H18" stroke="#CFC6EC" stroke-width="3"/></g>`;
  if (kind === 'stall') return `<g transform="translate(${x} ${y})"><path d="M-16 -4 L0 -16 L16 -4 Z" fill="${color}"/><rect x="-12" y="-4" width="24" height="12" fill="#5A3A28"/></g>`;
  if (kind === 'cloister') return `<g transform="translate(${x} ${y})"><rect x="-16" y="-10" width="32" height="18" fill="${color}"/><path d="M-12 8 V0 a4 4 0 0 1 8 0 V8 M4 8 V0 a4 4 0 0 1 8 0 V8" fill="#2A2033"/></g>`;
  if (kind === 'door') return `<g transform="translate(${x} ${y})"><circle r="18" fill="#FFC27A" opacity=".18"/><path d="M-9 9 V-4 a9 9 0 0 1 18 0 V9 Z" fill="#FFC27A"/><circle cx="4" cy="2" r="1.6" fill="#17122E"/></g>`;
  if (kind === 'bed') return `<g transform="translate(${x} ${y})"><rect x="-14" y="-4" width="28" height="12" rx="3" fill="${color}"/><rect x="-14" y="-12" width="10" height="8" rx="2" fill="#F4F0E6"/></g>`;
  return `<circle cx="${x}" cy="${y}" r="8" fill="${color}"/>`;
}
function mapBaseSVG(t, rng) {
  const P = SKY[Math.min(t, 4)];
  const W = 1200, H = 675, g = uid('mg');
  let s = `<defs><radialGradient id="${g}" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#2C2454"/><stop offset="1" stop-color="#140F30"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#${g})"/>`;
  // volcanoes at the south edge
  s += `<path d="M-20 675 L60 600 L84 594 L108 606 L140 586 L160 589 L250 675 Z" fill="${P.volc}" opacity=".9"/><g class="smoke"><circle cx="155" cy="574" r="10" fill="#CFC6EC" opacity=".2"/><circle cx="166" cy="560" r="14" fill="#CFC6EC" opacity=".14"/></g>`;
  s += `<path d="M420 675 L580 598 Q610 586 640 598 L800 675 Z" fill="${P.volcLit}" opacity=".95"/><text class="mlbl" x="610" y="650" text-anchor="middle" opacity=".7">Volcán de Agua</text>`;
  s += `<path d="M1000 0 Q1080 50 1200 36 V0 Z" fill="#3A2C62" opacity=".7"/><text class="mlbl" x="1110" y="22" text-anchor="middle" opacity=".7">Cerro de la Cruz</text>`;
  // blocks
  for (let c = 1; c < MAP.cols; c++) for (let r = 1; r < MAP.rows; r++) {
    const [x, y] = nodeXY(c, r);
    if ((c === 3 && r === 4)) { s += `<rect x="${x + 9}" y="${y + 9}" width="${MAP.dx - 18}" height="${MAP.dy - 18}" rx="10" fill="#22503F"/><circle cx="${x + MAP.dx / 2}" cy="${y + MAP.dy / 2}" r="12" fill="#3E6E9E"/>`; continue; }
    const col = shade(pick(FACADE_COLORS), -.62);
    s += `<rect x="${x + 9}" y="${y + 9}" width="${MAP.dx - 18}" height="${MAP.dy - 18}" rx="8" fill="${col}"/>`;
    s += `<rect x="${x + 22}" y="${y + 22}" width="${MAP.dx - 44}" height="${MAP.dy - 44}" rx="4" fill="${shade(col, -.25)}"/>`;
    for (let k = 0; k < 3; k++) if (rng() < .6) s += `<rect class="winglow" x="${(x + 14 + rng() * (MAP.dx - 34)).toFixed(0)}" y="${(y + 12 + rng() * (MAP.dy - 28)).toFixed(0)}" width="4" height="4" fill="#FFC874" opacity="${(.4 + rng() * .5).toFixed(2)}"/>`;
  }
  // streets
  for (let c = 1; c <= MAP.cols; c++) { const [x] = nodeXY(c, 1); s += `<line x1="${x}" y1="${MAP.y0 - 30}" x2="${x}" y2="${nodeXY(1, MAP.rows)[1] + 26}" stroke="#4B4185" stroke-width="${c === 3 ? 5 : 3}" opacity=".9"/>`; }
  for (let r = 1; r <= MAP.rows; r++) { const [, y] = nodeXY(1, r); s += `<line x1="${MAP.x0 - 40}" y1="${y}" x2="${nodeXY(MAP.cols, 1)[0] + 40}" y2="${y}" stroke="#4B4185" stroke-width="3" opacity=".9"/>`; }
  // labels
  STREETS.avenidas.forEach((n, i) => { const [x] = nodeXY(i + 1, 1); s += `<text class="mlbl street" x="${x}" y="${MAP.y0 - 44}" text-anchor="middle">${esc(n.split(' · ')[0])}</text>`; });
  STREETS.calles.forEach((n, i) => { const [, y] = nodeXY(1, i + 1); s += `<text class="mlbl street" x="${MAP.x0 - 50}" y="${y + 5}" text-anchor="end">${esc(n)}</text>`; });
  s += `<g transform="translate(1150 90)"><circle r="20" fill="none" stroke="#5FE0C8" stroke-width="2" opacity=".6"/><path d="M0 -16 L6 4 L0 0 L-6 4 Z" fill="#5FE0C8"/><text class="mlbl" y="34" text-anchor="middle">N</text></g>`;
  // landmarks
  for (const [k, L] of Object.entries(LANDMARKS)) {
    const [x, y] = nodeXY(L.col, L.row);
    const P2 = k === 'parque' ? [x + MAP.dx / 2, y + MAP.dy / 2 - 6, y + MAP.dy / 2 + 22] : [x, y - 20, y + 30];
    s += `<g class="lm" data-lm="${k}">${glyphSVG(L.glyph, P2[0], P2[1], L.color)}<text class="mlbl lmname" x="${P2[0]}" y="${P2[2]}" text-anchor="middle">${esc(capFirst(L.name.replace(/^(el|la) /, '').replace('Arco de Santa Catalina', 'Arco')))}</text></g>`;
  }
  return s;
}
