/* ===================== Art: flags, map, city scenes, people, seals ===================== */
/* One light source, top left. Every form: highlight, body, shade; contact shadows under things that stand. */
let _gid = 0, _defs = [];
function G(c, dir = 'h', k = [0.14, -0.22]) { // a lit gradient for a solid colour
  const id = 'g' + (++_gid);
  const [x2, y2] = dir === 'h' ? [1, 0] : dir === 'v' ? [0, 1] : [1, 1];
  _defs.push(`<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${shade(c, k[0])}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, k[1])}"/></linearGradient>`);
  return `url(#${id})`;
}
function RG(c, k = [0.3, -0.3]) { // radial for round forms, lit top-left
  const id = 'g' + (++_gid);
  _defs.push(`<radialGradient id="${id}" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="${shade(c, k[0])}"/><stop offset=".6" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, k[1])}"/></radialGradient>`);
  return `url(#${id})`;
}
function startArt() { _defs = []; }
function defsOut() { return `<defs><filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter><filter id="soft2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter>${_defs.join('')}</defs>`; }
const shadowE = (cx, cy, rx, ry = rx * 0.22, o = 0.28) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#0A0618" opacity="${o}" filter="url(#soft)"/>`;

/* ---- flags (30 × 20) ---- */
const FLAGS = {
  mx: '<rect width="10" height="20" fill="#006847"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#CE1126"/><circle cx="15" cy="10" r="2.6" fill="#8C5A2B"/>',
  us: '<rect width="30" height="20" fill="#fff"/>' + [0, 2, 4, 6, 8, 10, 12].map(i => `<rect y="${i * 1.54}" width="30" height="1.54" fill="#B22234"/>`).join('') + '<rect width="13" height="10.8" fill="#3C3B6E"/>',
  co: '<rect width="30" height="10" fill="#FCD116"/><rect y="10" width="30" height="5" fill="#003893"/><rect y="15" width="30" height="5" fill="#CE1126"/>',
  pr: [0, 1, 2, 3, 4].map(i => `<rect y="${i * 4}" width="30" height="4" fill="${i % 2 ? '#fff' : '#ED0000'}"/>`).join('') + '<path d="M0 0 L14 10 L0 20 Z" fill="#0050F0"/><path d="M4.6 8 l.8 2.3 h2.4 l-1.9 1.4 l.7 2.3 l-2 -1.4 l-2 1.4 l.7 -2.3 l-1.9 -1.4 h2.4 z" fill="#fff"/>',
  es: '<rect width="30" height="20" fill="#AA151B"/><rect y="5" width="30" height="10" fill="#F1BF00"/>',
  ar: '<rect width="30" height="20" fill="#74ACDF"/><rect y="6.67" width="30" height="6.67" fill="#fff"/><circle cx="15" cy="10" r="2.3" fill="#F6B40E"/>',
  pe: '<rect width="10" height="20" fill="#D91023"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#D91023"/>',
  gt: '<rect width="10" height="20" fill="#4997D0"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#4997D0"/><circle cx="15" cy="10" r="2.4" fill="#2E8B57"/>',
  cr: '<rect width="30" height="20" fill="#002B7F"/><rect y="3.3" width="30" height="13.4" fill="#fff"/><rect y="6.67" width="30" height="6.67" fill="#CE1126"/>',
  cu: [0, 1, 2, 3, 4].map(i => `<rect y="${i * 4}" width="30" height="4" fill="${i % 2 ? '#fff' : '#002A8F'}"/>`).join('') + '<path d="M0 0 L15 10 L0 20 Z" fill="#CF142B"/><path d="M5 8 l.8 2.3 h2.4 l-1.9 1.4 l.7 2.3 l-2 -1.4 l-2 1.4 l.7 -2.3 l-1.9 -1.4 h2.4 z" fill="#fff"/>',
  ca: '<rect width="30" height="20" fill="#fff"/><rect width="7.5" height="20" fill="#D52B1E"/><rect x="22.5" width="7.5" height="20" fill="#D52B1E"/><path d="M15 5 l1.2 2.6 1.6 -.6 -.5 3 1.8 -1 .4 1.4 -2 .5 .4 1.6 -2.4 -.6 -.5 2.6 -.5 -2.6 -2.4 .6 .4 -1.6 -2 -.5 .4 -1.4 1.8 1 -.5 -3 1.6 .6 z" fill="#D52B1E"/>'
};
const flagHTML = c => `<span class="flag"><svg viewBox="0 0 30 20" aria-hidden="true">${FLAGS[c] || ''}</svg></span>`;

/* ---- world map: Americas + Iberia ---- */
const MAP = { lon0: -126, lon1: 6, lat0: 54, lat1: -40, W: 760, H: 420 };
const proj = ([lon, lat]) => [(lon - MAP.lon0) / (MAP.lon1 - MAP.lon0) * MAP.W, (MAP.lat0 - lat) / (MAP.lat0 - MAP.lat1) * MAP.H];
const LAND = {
  nam: [[-126, 54], [-124, 48], [-124.4, 42], [-122.5, 37.5], [-120.5, 34.5], [-117.2, 32.5], [-116.5, 31.5], [-114, 28], [-112, 26], [-110, 23], [-109.5, 23], [-110.5, 24.5], [-112.5, 27.5], [-114.6, 30.6], [-114.8, 31.8], [-113, 31.3], [-111, 28.5], [-109, 26], [-106.5, 23.5], [-105.5, 21], [-105, 19.5], [-103.5, 18.5], [-101, 17.5], [-98, 16.2], [-95, 16], [-94, 16.1], [-92.2, 14.6], [-91, 13.9], [-89, 13.4], [-87.5, 13], [-86, 11.5], [-85.7, 10.5], [-85.5, 9.5], [-84, 9], [-83, 8.2], [-81.5, 7.5], [-80, 7.3], [-79, 8.8], [-77.5, 8], [-77.3, 8.6], [-77.8, 9.3], [-79.5, 9.6], [-81.5, 8.8], [-83, 10], [-83.6, 11], [-83.4, 12.5], [-83.2, 15], [-84.5, 15.8], [-86, 15.9], [-88, 15.7], [-88.5, 16.5], [-88.2, 17.5], [-87.5, 19], [-87, 21.4], [-88, 21.5], [-90, 21.1], [-90.5, 19.5], [-91.5, 18.5], [-94, 18.2], [-95.5, 18.8], [-96.5, 19.8], [-97.4, 21.5], [-97.7, 24], [-97.2, 26], [-97.4, 27.8], [-95, 29.3], [-93.5, 29.7], [-91, 29.2], [-89.5, 29.6], [-89, 30.3], [-87, 30.4], [-85.4, 29.7], [-84, 30], [-83, 29], [-82.7, 27.5], [-81.8, 26], [-81, 25.2], [-80.4, 25.2], [-80, 26.5], [-80.6, 28.5], [-81.3, 30.3], [-81, 31.8], [-79, 33.5], [-76.5, 35], [-75.6, 35.5], [-76, 37], [-75, 38.8], [-74, 40.5], [-72, 41], [-70, 41.7], [-70.5, 43], [-67, 44.8], [-66, 44.5], [-64, 45.5], [-61, 45.5], [-60, 47], [-64.5, 48.8], [-66.5, 49.8], [-60, 50.4], [-57, 51.5], [-56, 53], [-57, 54]],
  sam: [[-77.3, 8.6], [-75.5, 10.5], [-74, 11.3], [-72, 12.3], [-71, 11.5], [-70, 11.5], [-68, 10.6], [-66, 10.6], [-64, 10.6], [-62, 10.7], [-61, 9.5], [-60, 8.5], [-58, 7], [-55, 5.9], [-52, 4.8], [-51, 4], [-50, 1.8], [-49, 0], [-48, -1], [-44, -2.5], [-41, -3], [-38.5, -3.8], [-35.5, -5.2], [-35, -7], [-35, -9], [-37, -11], [-38.5, -13], [-39, -17.5], [-40, -20], [-41, -22], [-43, -23], [-45, -24], [-48, -26], [-48.5, -28.5], [-50.5, -31], [-52.5, -33.5], [-54, -34.8], [-56, -34.9], [-57.5, -34.4], [-58.4, -34.4], [-57.2, -35.5], [-57.5, -37.5], [-60, -38.8], [-62.5, -39], [-63.5, -40.5], [-73.5, -40.5], [-73.3, -37], [-72, -34], [-71.5, -32], [-71.4, -28], [-70.6, -25], [-70.2, -20], [-70.4, -18], [-71.5, -17.2], [-73, -16.2], [-75, -15.3], [-76.3, -13.5], [-77.2, -12], [-78.5, -9], [-79.6, -7], [-81.2, -5.5], [-80.3, -3.5], [-80.9, -2], [-80.1, 0], [-79, 1.5], [-78.8, 2.5], [-77.5, 3.8], [-77.4, 6.5], [-77.9, 7.5]],
  cuba: [[-84.9, 21.9], [-83, 22.9], [-81.5, 23.1], [-80, 23], [-77.5, 21.8], [-75.6, 21], [-74.2, 20.2], [-75, 19.9], [-77.7, 19.9], [-77.3, 20.7], [-79, 21.6], [-81.5, 22.2], [-83, 22.2]],
  hisp: [[-74.4, 18.4], [-73, 19.9], [-71, 19.9], [-69, 19.7], [-68.4, 18.6], [-69.9, 18.3], [-71.4, 17.6], [-72.8, 18.1]],
  pr: [[-67.3, 18.5], [-65.6, 18.45], [-65.6, 18], [-67.2, 17.95]],
  jam: [[-78.3, 18.4], [-76.3, 18.2], [-76.8, 17.9], [-78, 18.2]],
  eur: [[-9.5, 43], [-8, 43.7], [-4, 43.5], [-1.8, 43.4], [-1.2, 46], [-2.2, 47.2], [-4.5, 48], [-1.5, 48.8], [1.5, 50.1], [6, 51.3], [6, 43.2], [3.2, 42.4], [3, 41.8], [1, 41], [0, 40], [-0.3, 39.4], [0.2, 38.8], [-0.7, 37.6], [-2, 36.7], [-4.4, 36.7], [-5.6, 36], [-6.3, 36.8], [-7.4, 37.2], [-8.9, 37], [-8.8, 38.6], [-9.5, 39.3], [-8.8, 41], [-8.9, 42], [-9.3, 42.9]],
  uk: [[-5.7, 50.1], [1.4, 51.2], [1.7, 52.7], [0.2, 53.5], [-0.5, 54], [-3.2, 54], [-3, 53.3], [-4.6, 52.8], [-5.3, 51.7]],
  afr: [[6, 37.1], [-1, 35.8], [-5.9, 35.8], [-6.3, 35.2], [-9.8, 30], [-13, 27.5], [-17, 21], [-17.5, 14.7], [-16.8, 12], [-15, 10.8], [-13, 9], [-11, 7], [-8, 4.5], [-4, 5.2], [0, 5.5], [2, 6.3], [6, 4.3]]
};
const polyPath = pts => 'M' + pts.map(p => proj(p).map(v => v.toFixed(1)).join(' ')).join(' L') + ' Z';
function mapSVG({ pins = [], at = null, visited = [], path = [] } = {}) {
  startArt();
  _defs.push('<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1D2A5C"/><stop offset="1" stop-color="#14183E"/></linearGradient>');
  _defs.push('<linearGradient id="land" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5E7F72"/><stop offset=".5" stop-color="#466858"/><stop offset="1" stop-color="#34503F"/></linearGradient>');
  _defs.push('<radialGradient id="vign" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#05030F" stop-opacity=".55"/></radialGradient>');
  let s = `<rect width="760" height="420" fill="url(#sea)"/>`;
  for (let lon = -120; lon <= 0; lon += 20) { const [x] = proj([lon, 0]); s += `<path d="M${x} 0 V420" stroke="#2C3C78" stroke-width="1" opacity=".5"/>`; }
  for (let lat = -30; lat <= 50; lat += 20) { const [, y] = proj([0, lat]); s += `<path d="M0 ${y} H760" stroke="#2C3C78" stroke-width="1" opacity=".5"/>`; }
  const [, eq] = proj([0, 0]); s += `<path d="M0 ${eq} H760" stroke="#FFC27A" stroke-width="1" stroke-dasharray="4 6" opacity=".35"/><text x="752" y="${eq - 4}" text-anchor="end" class="mapt" font-size="9" fill="#FFC27A" opacity=".6">ECUADOR</text>`;
  const land = Object.values(LAND).map(polyPath).join(' ');
  s += `<path d="${land}" fill="#05030F" opacity=".45" transform="translate(4 5)" filter="url(#soft2)"/>`;
  s += `<path d="${land}" fill="url(#land)" stroke="#86AE9A" stroke-width="1.1" stroke-linejoin="round"/>`;
  s += `<path d="${land}" fill="none" stroke="#C8E6D4" stroke-width=".6" opacity=".35" transform="translate(-.8 -.8)"/>`;
  const labels = [['AMÉRICA DEL NORTE', -104, 42], ['AMÉRICA DEL SUR', -62, -12], ['OCÉANO ATLÁNTICO', -42, 28], ['OCÉANO PACÍFICO', -116, 8], ['EUROPA', -1, 49.5], ['ÁFRICA', -7, 18], ['MAR CARIBE', -76, 14.6]];
  labels.forEach(([t, lo, la]) => { const [x, y] = proj([lo, la]); s += `<text x="${x}" y="${y}" text-anchor="middle" class="mapt" font-size="${t.startsWith('OC') ? 10 : 9}" fill="${t.startsWith('OC') || t.startsWith('MAR') ? '#7F95D8' : '#CFE8DA'}" letter-spacing="2" opacity=".75">${t}</text>`; });
  // travelled path
  if (path.length > 1) s += `<path d="${path.map((id, i) => { const [x, y] = proj(cityOf(id).ll); return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }).join(' ')}" fill="none" stroke="#FFC27A" stroke-width="2" stroke-dasharray="2 5" stroke-linecap="round" opacity=".7"/>`;
  // visited dots
  visited.forEach(id => { const [x, y] = proj(cityOf(id).ll); s += `<circle cx="${x}" cy="${y}" r="3.5" fill="#FFC27A" stroke="#17122E" stroke-width="1.2"/>`; });
  // destination pins
  pins.forEach(p => {
    const c = cityOf(p.id), [x, y] = proj(c.ll), [dx, dy] = c.lbl || [8, -8];
    s += `<g class="pin${p.off ? ' off' : ''}" data-city="${p.id}" tabindex="${p.off ? -1 : 0}" role="button" aria-label="${esc(c.name)}">`
      + `<circle class="halo" cx="${x}" cy="${y}" r="13"/><circle cx="${x}" cy="${y}" r="5" fill="${RG('#FFC27A')}" stroke="#17122E" stroke-width="1.4"/>`
      + `<text x="${x + dx}" y="${y + dy}" text-anchor="${dx < 0 ? 'end' : 'start'}" font-size="12" font-weight="800" fill="#FFF1D6" stroke="#17122E" stroke-width="3" paint-order="stroke" font-family="Manrope, sans-serif">${esc(p.label || c.name)}</text></g>`;
  });
  if (at) {
    const [x, y] = proj(cityOf(at).ll);
    s += `<g><circle cx="${x}" cy="${y}" r="9" fill="none" stroke="#5FE0C8" stroke-width="2"><animate attributeName="r" values="7;15;7" dur="2.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;.2;1" dur="2.2s" repeatCount="indefinite"/></circle><circle cx="${x}" cy="${y}" r="5" fill="#5FE0C8" stroke="#17122E" stroke-width="1.5"/></g>`;
  }
  s += `<g id="planeLayer"></g><rect width="760" height="420" fill="url(#vign)" pointer-events="none"/>`;
  return defsOut() + s;
}
const PLANE = '<g><ellipse cx="0" cy="9" rx="12" ry="3" fill="#000" opacity=".25" filter="url(#soft2)"/><path d="M-13 0 Q-13 -2.6 -9 -2.6 L9 -2 Q14 -1.4 15 0 Q14 1.4 9 2 L-9 2.6 Q-13 2.6 -13 0 Z" fill="#F5F1FF"/><path d="M-2 -2 L-7 -12 L-3 -12 L5 -2 Z M-2 2 L-7 12 L-3 12 L5 2 Z" fill="#DCD4F2"/><path d="M-12 -1 L-15 -7 L-12 -7 L-8 -1 Z" fill="#FFC27A"/><path d="M9 -1.4 Q13 -1 14 0" stroke="#5FE0C8" stroke-width="1.2" fill="none"/></g>';
function flyAnim(from, to, ms = 2200) {
  return new Promise(res => {
    const layer = document.getElementById('planeLayer');
    if (!layer || reduced() || SPEED < 0.1) { res(); return; }
    const [x1, y1] = proj(cityOf(from).ll), [x2, y2] = proj(cityOf(to).ll);
    const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - Math.hypot(x2 - x1, y2 - y1) * 0.25;
    layer.innerHTML = `<path d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" fill="none" stroke="#FFE7A8" stroke-width="2" stroke-dasharray="5 6" opacity=".8"/><g id="plane">${PLANE}</g>`;
    const pl = document.getElementById('plane'), t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / (ms * SPEED)), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const x = (1 - e) ** 2 * x1 + 2 * (1 - e) * e * mx + e * e * x2, y = (1 - e) ** 2 * y1 + 2 * (1 - e) * e * my + e * e * y2;
      const dx = 2 * (1 - e) * (mx - x1) + 2 * e * (x2 - mx), dy = 2 * (1 - e) * (my - y1) + 2 * e * (y2 - my);
      pl.setAttribute('transform', `translate(${x} ${y}) rotate(${Math.atan2(dy, dx) * 180 / Math.PI}) scale(${1 + Math.sin(e * Math.PI) * 0.5})`);
      if (k < 1) requestAnimationFrame(step); else res();
    };
    requestAnimationFrame(step);
  });
}

/* ---- people ---- */
function personFig(look, x, y, sc = 1.6) { // feet at (x, y)
  return `<g transform="translate(${x} ${y - 34 * sc}) scale(${sc})">${famSVG(look)}</g>`;
}
function headSVG(look) { return `<svg viewBox="-22 -50 44 44" aria-hidden="true"><rect x="-30" y="-60" width="60" height="70" fill="#4A3170"/><circle cx="0" cy="-28" r="20" fill="#6A3F7E" opacity=".6"/>${famSVG(look)}</svg>`; }
const ACC_SVG = {
  sombrero: c => `<g><ellipse cx="0" cy="-37" rx="19" ry="4.2" fill="#1E1A2A"/><path d="M-11 -37 Q-11 -54 0 -54 Q11 -54 11 -37 Z" fill="${G('#2B2638')}"/><rect x="-11" y="-42" width="22" height="3.4" fill="#8A2A3A"/></g>`,
  gafas: () => `<g><rect x="-11.5" y="-29.5" width="9.6" height="7" rx="3" fill="#15121F"/><rect x="1.9" y="-29.5" width="9.6" height="7" rx="3" fill="#15121F"/><path d="M-1.9 -27 h3.8" stroke="#15121F" stroke-width="1.6"/><path d="M-9.5 -28 l3 0" stroke="#fff" stroke-width="1" opacity=".5"/></g>`,
  bufanda: () => `<g><path d="M-10 -12 Q0 -6 10 -12 L11 -7 Q0 -1 -11 -7 Z" fill="${G('#D23A3A')}"/><path d="M5 -8 L9 8 L4 9 L2 -6 Z" fill="#B02C2C"/></g>`,
  gorra: () => `<g><path d="M-13 -33 Q-12 -46 0 -46 Q12 -46 13 -33 Z" fill="${G('#2F5DA8')}"/><path d="M-1 -34 Q12 -35 21 -31 Q12 -29 -1 -31 Z" fill="#244A88"/></g>`
};
function suspectLook(s) { return { skin: s.skin, hairC: FEATS.pelo.vals[s.f.pelo].c, style: s.style, shirtC: s.shirtC, fem: s.fem, beard: s.beard, age: 40 }; }
function suspectSVG(s, { hideAcc = false } = {}) {
  startArt();
  const look = suspectLook(s);
  let body = famSVG(look);
  if (!hideAcc) body += ACC_SVG[s.f.acc]();
  return `<svg viewBox="-30 -60 60 98" aria-hidden="true">${defsOut()}<rect x="-30" y="-60" width="60" height="98" rx="8" fill="#2C2454"/><ellipse cx="0" cy="35" rx="17" ry="3.5" fill="#000" opacity=".3"/>${body}</svg>`;
}

/* ---- seals (gold icons on a disc) ---- */
const SYM = {
  sol: '<circle r="7" fill="#7A4A12"/>' + Array.from({ length: 8 }, (_, i) => `<path d="M0 -9 L2.4 -13 L0 -16 L-2.4 -13 Z" fill="#7A4A12" transform="rotate(${i * 45})"/>`).join('') + '<circle r="4" fill="#E9A93A"/>',
  concha: '<path d="M0 10 L-12 -4 Q-10 -12 0 -12 Q10 -12 12 -4 Z" fill="#7A4A12"/><path d="M0 10 L-6 -11 M0 10 L0 -12 M0 10 L6 -11 M0 10 L-10 -6 M0 10 L10 -6" stroke="#E9A93A" stroke-width="1.4"/>',
  balsa: '<path d="M-14 4 L14 4 L11 9 L-11 9 Z" fill="#7A4A12"/><rect x="-3" y="-10" width="6" height="14" rx="2" fill="#7A4A12"/><circle cy="-12" r="3.4" fill="#7A4A12"/>' + [-10, -6, 6, 10].map(x => `<rect x="${x - 1.5}" y="-3" width="3" height="7" fill="#7A4A12"/><circle cx="${x}" cy="-5" r="2" fill="#7A4A12"/>`).join(''),
  garita: '<path d="M-7 10 V-3 H7 V10 Z" fill="#7A4A12"/><path d="M-9 -3 Q0 -16 9 -3 Z" fill="#7A4A12"/><circle cy="-13" r="2" fill="#7A4A12"/><rect x="-2" y="0" width="4" height="5" rx="2" fill="#E9A93A"/>',
  jicara: '<path d="M-12 -2 Q0 16 12 -2 Z" fill="#7A4A12"/><ellipse cy="-2" rx="12" ry="3.5" fill="#9C6A1C"/><path d="M-7 4 h14" stroke="#E9A93A" stroke-width="1.4"/>',
  oso: '<path d="M-10 8 Q-12 -2 -6 -4 Q-5 -9 0 -9 Q5 -9 6 -4 Q12 -2 10 8 Z" fill="#7A4A12"/><circle cx="-5" cy="-10" r="2.2" fill="#7A4A12"/><circle cx="5" cy="-10" r="2.2" fill="#7A4A12"/><path d="M8 -4 Q14 -10 12 -14" stroke="#7A4A12" stroke-width="2.4" fill="none"/><circle cx="12" cy="-14" r="2.6" fill="#B5482B"/>',
  bandoneon: '<rect x="-14" y="-7" width="7" height="14" rx="1.5" fill="#7A4A12"/><rect x="7" y="-7" width="7" height="14" rx="1.5" fill="#7A4A12"/>' + [-5, -2, 1, 4].map(x => `<path d="M${x} -6 L${x + 1.5} 0 L${x} 6" stroke="#7A4A12" stroke-width="1.6" fill="none"/>`).join(''),
  nudo: '<path d="M-12 -10 H12" stroke="#7A4A12" stroke-width="2.6"/>' + [-8, -2, 4, 10].map((x, i) => `<path d="M${x} -10 V10" stroke="#7A4A12" stroke-width="1.6"/>${Array.from({ length: i + 1 }, (_, k) => `<circle cx="${x}" cy="${-4 + k * 4}" r="1.9" fill="#7A4A12"/>`).join('')}`).join(''),
  volcan: '<path d="M-14 9 L-4 -8 L4 -8 L14 9 Z" fill="#7A4A12"/><path d="M-3 -10 Q0 -16 3 -10 M-1 -13 Q2 -18 -2 -20" stroke="#7A4A12" stroke-width="1.6" fill="none"/>',
  tortuga: '<ellipse rx="10" ry="7.5" fill="#7A4A12"/><circle cx="12" cy="0" r="3" fill="#7A4A12"/><path d="M-6 -7 l-3 -4 M6 -7 l3 -4 M-6 7 l-3 4 M6 7 l3 4" stroke="#7A4A12" stroke-width="2.6" stroke-linecap="round"/><path d="M-5 -3 h10 M-5 3 h10 M0 -6 v12" stroke="#E9A93A" stroke-width="1.1"/>',
  galeon: '<path d="M-13 3 L13 3 L9 9 L-9 9 Z" fill="#7A4A12"/><path d="M-1 3 V-13" stroke="#7A4A12" stroke-width="1.6"/><path d="M0 -12 L9 -4 L0 -2 Z M-2 -10 L-10 -2 L-2 0 Z" fill="#7A4A12"/>'
};
function sealSVG(sym, on = true, sz = 48) {
  startArt();
  const disc = on ? `<circle r="20" fill="${RG('#F2C46D', [0.35, -0.35])}"/><circle r="17" fill="none" stroke="#9C6A1C" stroke-width="1.2"/>` : `<circle r="20" fill="#2C2454" stroke="rgba(255,255,255,.2)" stroke-dasharray="3 3"/>`;
  return `<svg viewBox="-22 -22 44 44" width="${sz}" height="${sz}" aria-hidden="true">${defsOut()}${disc}<g opacity="${on ? 1 : 0.25}">${SYM[sym] || ''}</g>${on ? '<ellipse cx="-7" cy="-10" rx="6" ry="3" fill="#fff" opacity=".35" transform="rotate(-30 -7 -10)"/>' : ''}</svg>`;
}
function medalSVG(syms, filled) { // seven slots around a central star
  startArt();
  let s = `<circle cx="0" cy="0" r="70" fill="${RG('#E9A93A', [0.3, -0.45])}"/><circle r="64" fill="none" stroke="#7A4A12" stroke-width="2"/><circle r="22" fill="${RG('#FBD98C')}" stroke="#7A4A12" stroke-width="1.5"/>`;
  s += `<path d="M0 -14 L4 -4 L14 -4 L6 3 L9 13 L0 7 L-9 13 L-6 3 L-14 -4 L-4 -4 Z" fill="#9C6A1C"/>`;
  syms.forEach((sym, i) => {
    const a = -Math.PI / 2 + i * 2 * Math.PI / 7, x = Math.cos(a) * 44, y = Math.sin(a) * 44;
    const on = filled.includes(sym);
    s += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="14" fill="${on ? RG('#FBD98C') : '#5A3A12'}" stroke="#7A4A12" stroke-width="1.4"/>${on ? `<g transform="scale(.62)">${SYM[sym]}</g>` : '<circle r="3" fill="#3A250C"/>'}</g>`;
  });
  s += `<ellipse cx="-26" cy="-40" rx="22" ry="9" fill="#fff" opacity=".22" transform="rotate(-35 -26 -40)"/>`;
  return `<svg viewBox="-74 -74 148 148" aria-hidden="true">${defsOut()}${s}</svg>`;
}

/* ---- scene building blocks ---- */
function sky(top, mid, low, sun = true) {
  const id = 'sky' + (++_gid);
  _defs.push(`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset=".6" stop-color="${mid}"/><stop offset="1" stop-color="${low}"/></linearGradient>`);
  let s = `<rect width="760" height="420" fill="url(#${id})"/>`;
  s += [[60, 30], [140, 60], [250, 24], [420, 40], [530, 18], [690, 52], [610, 30], [330, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#FFF1D6" opacity=".7"/>`).join('');
  if (sun) { const rid = 'sun' + (++_gid); _defs.push(`<radialGradient id="${rid}"><stop offset="0" stop-color="#FFE3A3"/><stop offset=".4" stop-color="#FFC27A" stop-opacity=".6"/><stop offset="1" stop-color="#FFC27A" stop-opacity="0"/></radialGradient>`); s += `<circle cx="110" cy="210" r="120" fill="url(#${rid})"/>`; }
  return s;
}
function ground(c1, c2, y = 300, tiles = true) {
  let s = `<rect x="0" y="${y}" width="760" height="${420 - y}" fill="${G(c1, 'v', [0.08, -0.3])}"/>`;
  if (tiles) for (let k = 1; k < 6; k++) { const yy = y + k * k * 4.2; s += `<path d="M0 ${yy} H760" stroke="${c2}" stroke-width="1" opacity=".5"/>`; }
  if (tiles) for (let k = -8; k <= 8; k++) s += `<path d="M${380 + k * 22} ${y} L${380 + k * 90} 420" stroke="${c2}" stroke-width="1" opacity=".35"/>`;
  return s + `<rect x="0" y="${y}" width="760" height="6" fill="#000" opacity=".18"/>`;
}
function building(x, y, w, h, c, { win = 'arch', rows = 2, cols = 3, roof = null, trim = '#F6E4C4' } = {}) {
  let s = shadowE(x + w / 2, y + h, w * 0.55, 5, 0.25) + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${G(c)}"/><rect x="${x}" y="${y}" width="${w}" height="5" fill="${trim}" opacity=".85"/>`;
  s += `<rect x="${x + w - 6}" y="${y}" width="6" height="${h}" fill="#000" opacity=".12"/>`;
  const gw = w / cols, gh = (h - 14) / rows;
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const wx = x + k * gw + gw * 0.28, wy = y + 12 + r * gh + gh * 0.18, ww = gw * 0.44, wh = gh * 0.55;
    const lit = (r + k + Math.round(x)) % 3 !== 0;
    s += win === 'arch' ? `<path d="M${wx} ${wy + wh} V${wy + ww / 2} A${ww / 2} ${ww / 2} 0 0 1 ${wx + ww} ${wy + ww / 2} V${wy + wh} Z" fill="${lit ? '#FFC77A' : '#2A2152'}" opacity="${lit ? 0.85 : 1}"/>`
      : `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="1.5" fill="${lit ? '#FFC77A' : '#2A2152'}" opacity="${lit ? 0.85 : 1}"/>`;
    s += `<rect x="${wx - 1}" y="${wy + wh}" width="${ww + 2}" height="2" fill="${trim}" opacity=".7"/>`;
  }
  if (roof) s += `<path d="M${x - 6} ${y} L${x + w / 2} ${y - roof} L${x + w + 6} ${y} Z" fill="${G('#A8553A')}"/>`;
  return s;
}
function palm(x, y, h = 120, lean = 8) {
  let s = shadowE(x + 10, y, 22, 4, 0.22) + `<path d="M${x - 4} ${y} Q${x + lean * 0.5} ${y - h * 0.6} ${x + lean} ${y - h} L${x + lean + 5} ${y - h} Q${x + lean * 0.5 + 5} ${y - h * 0.6} ${x + 4} ${y} Z" fill="${G('#8A6A4A')}"/>`;
  const tx = x + lean + 2, ty = y - h;
  [[-60, 34], [-25, 40], [10, 38], [45, 36], [80, 30], [-95, 26], [120, 24]].forEach(([a, l]) => {
    const r = a * Math.PI / 180, ex = tx + Math.cos(r) * l, ey = ty + Math.sin(r) * l * 0.5 + 10;
    s += `<path d="M${tx} ${ty} Q${(tx + ex) / 2} ${ty - 14} ${ex} ${ey}" stroke="#2E7D5B" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M${tx} ${ty} Q${(tx + ex) / 2} ${ty - 16} ${ex} ${ey}" stroke="#56B087" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>`;
  });
  return s;
}
function tree(x, y, r = 34, c = '#2E6B4E') { return shadowE(x, y, r * 0.8, 5) + `<rect x="${x - 4}" y="${y - r * 1.2}" width="8" height="${r * 1.2}" fill="${G('#6A4A30')}"/><circle cx="${x}" cy="${y - r * 1.5}" r="${r}" fill="${RG(c)}"/>`; }
function mountain(pts, c) { return `<path d="M${pts}" fill="${G(c, 'd', [0.12, -0.25])}"/>`; }
const sparkle = (x, y) => `<path class="spark" d="M${x} ${y - 6} L${x + 1.6} ${y - 1.6} L${x + 6} ${y} L${x + 1.6} ${y + 1.6} L${x} ${y + 6} L${x - 1.6} ${y + 1.6} L${x - 6} ${y} L${x - 1.6} ${y - 1.6} Z"/>`;
function gemG(id, title, cx, cy, r, inner) { return `<g class="gem" data-gem="${id}" tabindex="0" role="button" aria-label="${esc(title)}"><circle class="ring" cx="${cx}" cy="${cy}" r="${r}"/>${inner}${sparkle(cx + r * 0.7, cy - r * 0.7)}</g>`; }
function hotG(cls, data, label, cx, cy, r, inner, tag) {
  return `<g class="hot ${cls}" ${data} tabindex="0" role="button" aria-label="${esc(label)}"><circle class="ring" cx="${cx}" cy="${cy}" r="${r}"/>${inner}${tag || ''}</g>`;
}
const bubble = (x, y) => `<g class="bubble"><path d="M${x - 14} ${y - 22} h28 a6 6 0 0 1 6 6 v10 a6 6 0 0 1 -6 6 h-10 l-6 6 l-1 -6 h-11 a6 6 0 0 1 -6 -6 v-10 a6 6 0 0 1 6 -6 Z" fill="#FFF1D6" stroke="#17122E" stroke-width="1.2"/><text x="${x}" y="${y - 10}" text-anchor="middle" font-size="13" font-weight="800" fill="#17122E" font-family="Manrope, sans-serif">?</text></g>`;
const nameTag = (x, y, t) => `<text class="tag" x="${x}" y="${y}" text-anchor="middle" font-size="12" font-weight="800" fill="#FFF1D6" stroke="#17122E" stroke-width="3" paint-order="stroke" font-family="Manrope, sans-serif">${esc(t)}</text>`;
