/* ---------- shared full-body figures (feet at y = 34) ---------- */
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255];
  return '#' + c.map(v => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f))).toString(16).padStart(2, '0')).join('');
}
/* family member, feet at y = 34 */
function famSVG(p, sc = 1) {
  const skin = p.skin, hair = p.hairC || HAIR[p.hair], shirt = p.shirtC || SHIRT[p.shirt], kid = p.age < 15, fem = !!p.fem;
  const k = sc * (kid ? 0.84 : 1), skinD = shade(skin, -0.16), shirtD = shade(shirt, -0.25), hairD = shade(hair, -0.28);
  const pants = p.pantsC || (fem ? '#2F3A6B' : kid ? '#3B5B8C' : '#2E2A45');
  let s = '';
  if (p.style === 'long') s += `<path d="M-15 -30 C-19 -12 -17 0 -12 6 L12 6 C17 0 19 -12 15 -30 Z" fill="${hairD}"/>`;
  if (fem && !kid) {
    s += `<rect x="-8" y="16" width="5.5" height="16" rx="2.5" fill="${skinD}"/><rect x="2.5" y="16" width="5.5" height="16" rx="2.5" fill="${skinD}"/>`;
    s += `<path d="M-13 8 L13 8 L16.5 23 Q0 26 -16.5 23 Z" fill="${pants}"/>`;
  } else {
    s += `<rect x="-9" y="9" width="7.5" height="23" rx="3" fill="${pants}"/><rect x="1.5" y="9" width="7.5" height="23" rx="3" fill="${pants}"/>`;
  }
  s += `<ellipse cx="-5.5" cy="32.5" rx="5.5" ry="2.8" fill="#2A1D17"/><ellipse cx="5.5" cy="32.5" rx="5.5" ry="2.8" fill="#2A1D17"/>`;
  s += `<rect x="-19" y="-6" width="6.5" height="21" rx="3.2" fill="${skin}"/><rect x="12.5" y="-6" width="6.5" height="21" rx="3.2" fill="${skin}"/>`;
  s += `<path d="M-13 -8 Q0 -12 13 -8 L14 14 Q0 16.5 -14 14 Z" fill="${shirt}" stroke="${shirtD}" stroke-width="1.2"/><path d="M-9 -5 Q-11 3 -10 11" stroke="#FFFFFF" stroke-opacity=".22" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M9 -5 Q11 3 10 11" stroke="#000000" stroke-opacity=".16" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M-13 -8 L-20 -3 L-19.5 5 L-13 5 Z M13 -8 L20 -3 L19.5 5 L13 5 Z" fill="${shirt}" stroke="${shirtD}" stroke-width="1.2" stroke-linejoin="round"/>`;
  s += `<rect x="-3.5" y="-14" width="7" height="6" fill="${skinD}"/><path d="M-4.5 -9.6 L0 -4.5 L4.5 -9.6 Z" fill="${skinD}"/>`;
  s += `<circle cx="-12.6" cy="-25" r="3" fill="${skinD}"/><circle cx="12.6" cy="-25" r="3" fill="${skinD}"/>`;
  s += `<ellipse cx="0" cy="-26" rx="12.5" ry="13.5" fill="${skin}"/><path d="M9 -31 Q13 -25 11 -17" stroke="${skinD}" stroke-width="2" fill="none" opacity=".55" stroke-linecap="round"/>`;
  if (p.style === 'short') s += `<path d="M-13 -24 C-15.5 -43 15.5 -43 13 -24 C11 -32 6 -35 -1 -33 C-6 -35 -11 -31 -13 -24 Z" fill="${hair}"/>`;
  else if (p.style === 'long') s += `<path d="M-13.8 -20 C-17 -45 17 -45 13.8 -20 C12.5 -30 8 -34 3 -35.5 C-2 -31 -8 -31 -13.8 -20 Z" fill="${hair}"/>`;
  else if (p.style === 'curly') s += `<g fill="${hair}">` + [[-11, -34, 6], [-4, -39, 6.5], [4, -39, 6.5], [11, -34, 6], [-14, -27, 4.5], [14, -27, 4.5], [0, -35, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('') + `</g>`;
  else s += `<path d="M-13.4 -21 Q-14.5 -30 -10 -33 L-9 -24 Z M13.4 -21 Q14.5 -30 10 -33 L9 -24 Z" fill="${hair}"/><ellipse cx="-4" cy="-35" rx="4.5" ry="2" fill="#fff" opacity=".28"/>`;
  s += `<path d="M-8 -30.8 q3 -2 6 0 M2 -30.8 q3 -2 6 0" stroke="${p.style === 'bald' ? hair : hairD}" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
  s += `<ellipse cx="-5" cy="-25.5" rx="1.9" ry="2.3" fill="#1D1410"/><ellipse cx="5" cy="-25.5" rx="1.9" ry="2.3" fill="#1D1410"/><circle cx="-4.4" cy="-26.4" r=".7" fill="#fff"/><circle cx="5.6" cy="-26.4" r=".7" fill="#fff"/>`;
  s += `<circle cx="-8.6" cy="-20.5" r="2.6" fill="#E0705E" opacity=".35"/><circle cx="8.6" cy="-20.5" r="2.6" fill="#E0705E" opacity=".35"/>`;
  if (p.beard) s += `<path d="M-12.4 -25 Q-12.5 -10 0 -9 Q12.5 -10 12.4 -25 Q10 -16 5 -16.5 Q0 -18.5 -5 -16.5 Q-10 -16 -12.4 -25 Z" fill="${hair}"/>`;
  s += `<path d="M-3.6 -18.6 q3.6 3 7.2 0" stroke="${p.beard ? '#F2D9C4' : '#7A3B2A'}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  if (p.glasses) s += `<g stroke="#17132B" stroke-width="2"><circle cx="-5.3" cy="-25.5" r="4.7" fill="rgba(255,255,255,.2)"/><circle cx="5.3" cy="-25.5" r="4.7" fill="rgba(255,255,255,.2)"/><path d="M-.7 -26 h1.4 M-10 -26.6 L-12.6 -27.6 M10 -26.6 L12.6 -27.6" fill="none"/></g>`;
  if (p.flower) s += `<g transform="translate(9 -37)"><g fill="#F06C8E">${[0, 72, 144, 216, 288].map(r => `<ellipse cx="0" cy="-3.2" rx="2.6" ry="3.4" transform="rotate(${r})"/>`).join('')}</g><circle r="1.8" fill="#FFC27A"/></g>`;
  if (p.party) s += `<path d="M-6 -38 L0 -56 L6 -38 Z" fill="${p.party}" stroke="#17122E" stroke-width=".8"/><circle cx="0" cy="-56" r="2.2" fill="#FFC27A"/>`;
  return `<g transform="translate(0 34) scale(${k}) translate(0 -34)"><ellipse cx="0" cy="34" rx="${kid ? 12 : 15}" ry="3" fill="#0B0820" opacity=".38"/>${s}</g>`;
}
