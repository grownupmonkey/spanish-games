/* ============ 3 · TEXT ANALYSIS: preterite (from the series), object pronouns, impersonal se ============ */
/* ---- simple future ---- */
const FUT_REG = 'ir ver comer beber llevar visitar mirar tomar escuchar pasear caminar comprar cenar merendar bailar celebrar disfrutar encontrar quedar volver regresar acompañar llegar conocer entregar probar buscar votar dar estar ser ofrecer quemar invitar ayudar cantar sacar pedir vivir escribir subir abrir empezar terminar jugar aprender correr esperar descansar dormir levantar ducharse quedarse vestir saludar hablar viajar oír admirar gritar pagar desayunar almorzar mojar sentar trabajar ahorrar estudiar ganar cuidar practicar usar enseñar organizar nadar cocinar preparar vender atender servir mejorar leer compartir decidir intentar llamar pasar cambiar recibir conducir limpiar ayudar comprar explicar mandar enviar contestar pensar necesitar invertir guardar'.split(' ');
const FUT_IRR = { hacer: 'har', tener: 'tendr', poder: 'podr', salir: 'saldr', venir: 'vendr', poner: 'pondr', decir: 'dir', querer: 'querr', saber: 'sabr', haber: 'habr', valer: 'valdr' };
const FUT_END = ['é', 'ás', 'á', 'emos', 'éis', 'án'], PERS = ['yo', 'tu', '3s', 'nos', 'vos', '3p'];
const FUT = new Map(), FUT_SLIP = new Map();
(function buildFuture() {
  const add = (m, f, v) => { m.set(keyOf(f), Object.assign({ form: f }, v)); };
  FUT_REG.forEach(inf => { const base = inf.replace(/se$/, ''); FUT_END.forEach((e, i) => add(FUT, base + e, { inf: base, p: PERS[i] })); });
  Object.entries(FUT_IRR).forEach(([inf, st]) => FUT_END.forEach((e, i) => { add(FUT, st + e, { inf, p: PERS[i] }); add(FUT_SLIP, inf + e, { inf, p: PERS[i], fix: st + e }); }));
  // common slips: -er/-ir stems of irregulars with a vowel, and a missing -r-
  [['hacer', 'hacier'], ['tener', 'tenir'], ['poder', 'podir'], ['salir', 'salier'], ['venir', 'venier'], ['poner', 'ponir'], ['decir', 'decir'], ['querer', 'querir']].forEach(([inf, bad]) => FUT_END.forEach((e, i) => { if (!FUT_SLIP.has(keyOf(bad + e))) add(FUT_SLIP, bad + e, { inf, p: PERS[i], fix: FUT_IRR[inf] + e }); }));
})();
const IR_A = /(?:^| )(voy|vas|va|vamos|vais|van) a ([a-z]*(?:ar|er|ir))(?= |$)/g;
const PRES_PLAN = { vamos: 'iremos', vemos: 'veremos', comemos: 'comeremos', llevamos: 'llevaremos', visitamos: 'visitaremos', salimos: 'saldremos', hacemos: 'haremos', tenemos: 'tendremos', tomamos: 'tomaremos', bebemos: 'beberemos', miramos: 'miraremos', pedimos: 'pediremos', voy: 'iré', veo: 'veré', como: null, llevo: 'llevaré', visito: 'visitaré', hago: 'haré', salgo: 'saldré' };
const NOT_FUT = new Set(['ira', 'cena', 'para', 'sera', 'vera', 'era', 'pena', 'hora', 'ahora', 'fuera', 'tierra']);
function analyzeFuture(raw) {
  const r = { fut: [], slips: [], accents: [], irA: [], present: [] }, n = norm(raw);
  words(raw).forEach(w => {
    const k = keyOf(w), lw = w.toLowerCase();
    if (FUT_SLIP.has(k) && !FUT.has(k)) { const s = FUT_SLIP.get(k); r.slips.push({ wrote: w, fix: s.fix }); r.fut.push({ w, inf: s.inf }); return; }
    const f = FUT.get(k); if (!f) { if (PRES_PLAN[k]) r.present.push({ wrote: w, fix: PRES_PLAN[k] }); return; }
    if (NOT_FUT.has(k) && lw === k) return;
    r.fut.push({ w, inf: f.inf, p: f.p });
    if (f.form !== stripMarks(f.form) && lw === stripMarks(lw)) r.accents.push({ wrote: w, fix: f.form });
  });
  let m; IR_A.lastIndex = 0; while ((m = IR_A.exec(n))) r.irA.push(m[0].trim());
  if (r.irA.length) r.present = r.present.filter(p => !/^(voy|vas|va|vamos|vais|van)$/.test(keyOf(p.wrote)));
  r.verbs = [...new Set(r.fut.map(f => f.inf))];
  return r;
}

/* ---- preterite (tables from the series engine) ---- */
const VERBS = {
  ar: 'caminar llegar entrar tomar comprar visitar pagar buscar mirar hablar escuchar bailar cantar gritar regresar encontrar dejar llevar quedar pasar sacar tocar trabajar viajar usar jugar empezar cruzar ayudar terminar esperar preguntar contestar mostrar sentar almorzar cenar desayunar probar pensar llamar ganar votar entregar disfrutar merendar celebrar quemar admirar saludar explotar acabar durar lanzar mojar invitar preparar levantar acostar despertar encantar gustar asustar emocionar arder derramar tropezar frenar resbalar saltar agarrar dañar cargar calentar guardar secar limpiar apagar regalar olvidar golpear bajar cuidar cocinar nadar estudiar ahorrar enseñar organizar practicar intentar cambiar mejorar participar colaborar repartir_ explicar'.split(' ').filter(v => !/_$/.test(v)),
  er: 'comer beber correr perder ver aprender conocer volver romper caer leer creer morder prender recoger meter parecer aparecer desaparecer ofrecer responder esconder sorprender vender mover entender encender atender'.split(' '),
  ir: 'salir vivir subir abrir escribir recibir decidir descubrir seguir pedir sentir dormir repetir servir preferir compartir oir vestir'.split(' ')
};
const IRR_STEM = { tener: 'tuv', estar: 'estuv', andar: 'anduv', poder: 'pud', poner: 'pus', saber: 'sup', querer: 'quis', venir: 'vin', hacer: 'hic', decir: 'dij', traer: 'traj' };
const E_I = { pedir: 1, sentir: 1, repetir: 1, servir: 1, preferir: 1, vestir: 1, seguir: 1 }, O_U = { dormir: 1 };
const Y_VERBS = { caer: 'ca', leer: 'le', creer: 'cre', oir: 'o' };
const FORMS = new Map(), PRET_NOS = {};
function addForm(form, inf, tense, person) { const k = keyOf(form); if (!FORMS.has(k)) FORMS.set(k, []); FORMS.get(k).push({ form, inf, tense, person, acc: form !== stripMarks(form) }); }
(function buildPret() {
  const P = ['yo', 'tu', '3s', 'nos', '3p'];
  const all = [...VERBS.ar.map(v => [v, 'ar']), ...VERBS.er.map(v => [v, 'er']), ...VERBS.ir.map(v => [v, 'ir']), ...Object.keys(IRR_STEM).map(v => [v, 'irr'])];
  for (const [inf, cls] of all) {
    const stem = inf.slice(0, -2); let pret;
    if (IRR_STEM[inf]) { const s = IRR_STEM[inf], j = /j$/.test(s); pret = [s + 'e', s + 'iste', inf === 'hacer' ? 'hizo' : s + 'o', s + 'imos', s + (j ? 'eron' : 'ieron')]; }
    else if (cls === 'ar') { const yo = /car$/.test(inf) ? stem.slice(0, -1) + 'qué' : /gar$/.test(inf) ? stem + 'ué' : /zar$/.test(inf) ? stem.slice(0, -1) + 'cé' : stem + 'é'; pret = [yo, stem + 'aste', stem + 'ó', stem + 'amos', stem + 'aron']; }
    else if (Y_VERBS[inf]) { const b = Y_VERBS[inf]; pret = [b + 'í', b + 'íste', b + 'yó', b + 'ímos', b + 'yeron']; }
    else { let s3 = stem; if (E_I[inf]) s3 = stem.replace(/e(?=[^e]*$)/, 'i'); if (O_U[inf]) s3 = stem.replace(/o(?=[^o]*$)/, 'u'); pret = inf === 'ver' ? ['vi', 'viste', 'vio', 'vimos', 'vieron'] : [stem + 'í', stem + 'iste', s3 + 'ió', stem + 'imos', s3 + 'ieron']; }
    pret.forEach((f, i) => addForm(f, inf, 'pret', P[i])); PRET_NOS[inf] = pret[3];
    const imp = cls === 'ar' || inf === 'estar' || inf === 'andar' ? ['aba', 'abas', 'aba', 'ábamos', 'aban'] : ['ía', 'ías', 'ía', 'íamos', 'ían'];
    if (inf !== 'ver') imp.forEach((e, i) => addForm((inf === 'oir' ? 'o' : stem) + e, inf, 'imp', P[i]));
  }
  [['fui', 'yo'], ['fuiste', 'tu'], ['fue', '3s'], ['fuimos', 'nos'], ['fueron', '3p']].forEach(([f, p]) => addForm(f, 'ir/ser', 'pret', p)); PRET_NOS.ir = 'fuimos'; PRET_NOS.ser = 'fuimos';
  [['di', 'yo'], ['diste', 'tu'], ['dio', '3s'], ['dimos', 'nos'], ['dieron', '3p']].forEach(([f, p]) => addForm(f, 'dar', 'pret', p)); PRET_NOS.dar = 'dimos';
  ['era', 'eras', 'era', 'éramos', 'eran'].forEach((f, i) => addForm(f, 'ser', 'imp', P[i]));
  ['iba', 'ibas', 'iba', 'íbamos', 'iban'].forEach((f, i) => addForm(f, 'ir', 'imp', P[i]));
  ['veía', 'veíamos', 'veían'].forEach(f => addForm(f, 'ver', 'imp', '3s'));
  addForm('había', 'haber', 'imp', '3s'); addForm('hubo', 'haber', 'pret', '3s'); PRET_NOS.haber = 'hubo';
})();
const SLIPS = {
  fuemos: 'fuimos', fueimos: 'fuimos', hacimos: 'hicimos', hacemos_: 'hicimos', tenimos: 'tuvimos', teniamos_: 'tuvimos', estuvemos: 'estuvimos', podimos: 'pudimos', ponimos: 'pusimos', venimos_: 'vinimos', decimos_: 'dijimos', pidimos: 'pedimos', durmimos: 'dormimos',
  hacio: 'hizo', tenio: 'tuvo', ponio: 'puso', venio: 'vino', pudio: 'pudo', estuvio: 'estuvo', pedio: 'pidió', dormio: 'durmió', seguio: 'siguió', leio: 'leyó', caio: 'cayó', creio: 'creyó', oio: 'oyó',
  llege: 'llegué', page: 'pagué', juge: 'jugué', busce: 'busqué', toce: 'toqué', sace: 'saqué', empeze: 'empecé', cruze: 'crucé', almorze: 'almorcé', lanze: 'lancé',
  hacieron: 'hicieron', tenieron: 'tuvieron', poderon: 'pudieron', venieron: 'vinieron', pedieron: 'pidieron', dijieron: 'dijeron', trajieron: 'trajeron',
  hize: 'hice', teni: 'tuve', estuvi: 'estuve', podi: 'pude', poni: 'puse', hici: 'hice', vini: 'vine', andi: 'anduve', ande: 'anduve', pidi: 'pedí'
};
const SLIP_ACCENT = { fué: 'fue', fuí: 'fui', dió: 'dio', vió: 'vio' };
const NOT_VERBS = new Set(['duro', 'dura', 'caja', 'cuido_', 'cena', 'nada', 'hora', 'paso', 'camino', 'baile', 'viaje', 'noche', 'calle', 'parte', 'pasa', 'mira', 'queda', 'llega', 'trabajo', 'compra', 'visita', 'cambio', 'vista', 'como', 'bajo', 'llamo', 'gusto', 'helado', 'hecho', 'a', 'llevo', 'paseo', 'canto', 'grito', 'pago', 'gana', 'vuelta']);
function analyzePast(raw) {
  const r = { pret: [], imp: [], present: [], slips: [], accents: [], future: [] }, seen = new Set();
  words(raw).forEach(w => {
    const k = keyOf(w), lw = w.toLowerCase();
    if (SLIP_ACCENT[lw]) r.accents.push({ wrote: w, fix: SLIP_ACCENT[lw], note: 'One-syllable preterites have no accent.' });
    if (SLIPS[k]) { r.slips.push({ wrote: w, fix: SLIPS[k] }); r.pret.push(SLIPS[k]); return; }
    const fut = FUT.get(k); if (fut && !NOT_FUT.has(k) && !FORMS.has(k)) { r.future.push({ wrote: w, fix: PRET_NOS[fut.inf] || null }); return; }
    const c = FORMS.get(k); if (!c) return;
    const hasAcc = w !== stripMarks(w);
    if (NOT_VERBS.has(k) && !hasAcc) return;
    const pret = c.filter(x => x.tense === 'pret'), imp = c.filter(x => x.tense === 'imp');
    if (imp.length && !pret.length) { r.imp.push(w); return; }
    if (pret.length) {
      r.pret.push(pret[0].inf + ':' + k);
      const acc = pret.find(x => x.acc); if (acc && !hasAcc && !pret.some(x => !x.acc) && !seen.has(k)) { seen.add(k); r.accents.push({ wrote: w, fix: acc.form }); }
    }
  });
  r.distinct = new Set(r.pret.map(p => p.split(':')[0])).size;
  return r;
}

/* object pronouns: lo / la / los / las before a conjugated verb, or attached to an infinitive or gerund */
const CONJ = new Set('tengo tiene devuelvo entrego reparo arreglo cambio reviso seco limpio dejo llevo preparo mando envio recoge puede pueden recoja recogemos cambiamos reparamos arreglamos entregamos devolvemos pongo pones pone ponemos ponen pondre pondremos pondra pongamos ponga toco tocamos tocare tocaremos escucho escuchamos escuchas escucha dedico dedicamos busco buscamos encuentro encontramos tengo tenemos quiero queremos puedo podemos voy vamos he has ha hemos han habia pusimos puse pusieron sono toque tocamos escuche dejo dejamos paso pasamos recomiendo recomendamos recomiendas recomendaria adoro adoramos conozco conocemos vi vimos oi oimos encanta encantan pongo programo programamos'.split(' '));
const NOUN_AFTER_ART = /^(cancion|canciones|disco|discos|bolero|boleros|son|sones|musica|banda|orquesta|trompeta|noche|abuela|mama|radio|primera|ultima|misma|grabacion|letra|version|siguiente|otra|otro|que|del|de)$/;
function analyzeDOP(raw) {
  const toks = words(raw), keys = toks.map(keyOf), r = { prons: [], misplaced: [], le: [] };
  keys.forEach((k, i) => {
    const nx = keys[i + 1] || '', pv = keys[i - 1] || '';
    if (/^(lo|la|los|las)$/.test(k)) {
      if (CONJ.has(nx) || (nx === 'ya' && CONJ.has(keys[i + 2] || '')) || (nx === 'he' || nx === 'hemos' || nx === 'ha' || nx === 'han')) r.prons.push({ p: k, how: 'before', at: i });
      else if (CONJ.has(pv) && !NOUN_AFTER_ART.test(nx) && !/^(mejor|primero)$/.test(nx)) r.misplaced.push({ p: k, verb: toks[i - 1], fix: `${k} ${toks[i - 1].toLowerCase()}` });
    }
    const m = k.match(/^([a-z]+(?:ar|er|ir|ando|iendo))(lo|la|los|las)$/);
    if (m && !/^(bola|hola|sola|cola|escuela|abuela|perla|isla|mesa|sala|ola|vela|tela|lola|bella|ella|aquella|calle|carla|marla|darla|habana|cubana|semana|mananas?|ventana|hermana|charla|parla)$/.test(k)) r.prons.push({ p: m[2], how: 'attached', at: i });
    if (k === 'le' && (CONJ.has(nx) || /^(pongo|ponemos|tocamos)$/.test(nx))) r.le.push(toks[i]);
  });
  return r;
}

/* ---- present perfect (from Radio Habana) ---- */
const AUX = { he: 'yo', has: 'tu', ha: '3s', hemos: 'nos', habeis: 'vos', han: '3p' };
const AUX_SLIP = { a: 'ha', e: 'he', an: 'han', emos: 'hemos', as: 'has' };
const IRR_PART = { hecho: 'hacer', escrito: 'escribir', visto: 'ver', puesto: 'poner', vuelto: 'volver', dicho: 'decir', roto: 'romper', abierto: 'abrir', muerto: 'morir', cubierto: 'cubrir', descubierto: 'descubrir', compuesto: 'componer', devuelto: 'devolver', resuelto: 'resolver' };
const PART_SLIP = { hacido: 'hecho', escribido: 'escrito', vido: 'visto', veido: 'visto', ponido: 'puesto', volvido: 'vuelto', decido: 'dicho', rompido: 'roto', abrido: 'abierto', morido: 'muerto', devolvido: 'devuelto', descubrido: 'descubierto', resolvido: 'resuelto', cubrido: 'cubierto' };
const ACC_PART = { leido: 'leído', oido: 'oído', traido: 'traído', caido: 'caído', creido: 'creído' };
const isPart = k => IRR_PART[k] || PART_SLIP[k] || /^[a-z]+(ado|ido|ada|ida|ados|idos|adas|idas)$/.test(k);
function analyzePerfect(raw) {
  const toks = words(raw), keys = toks.map(keyOf), r = { forms: [], slips: [], parts: new Set() };
  keys.forEach((k, i) => {
    let j = i + 1; const auxP = AUX[k], auxSlip = AUX_SLIP[k];
    if (!auxP && !auxSlip) return;
    if (keys[j] && /^(ya|nunca|siempre|tambien)$/.test(keys[j]) && keys[j + 1] && isPart(keys[j + 1])) j++;
    const nx = keys[j]; if (!nx || !isPart(nx)) return;
    if (auxSlip) { if (/^(a|e)$/.test(k) && !/(ado|ido|cho|to|sto)$/.test(nx)) return; if (k === 'a' && /^(todos?|nadie|toda|todas|lado|mercado|pasado|helado)$/.test(nx)) return; r.slips.push({ wrote: `${toks[i]} ${toks[j]}`, fix: `${auxSlip} ${toks[j]}`, note: 'The helper verb haber has an h: he, has, ha, hemos, han.' }); }
    let part = nx;
    if (PART_SLIP[nx]) { r.slips.push({ wrote: toks[j], fix: PART_SLIP[nx], note: 'Irregular participle' }); part = PART_SLIP[nx]; }
    else if (/(ada|idos|idas|adas|ados)$/.test(nx) && !/^(nada|todos?)$/.test(nx)) r.slips.push({ wrote: toks[j], fix: nx.replace(/(ada|adas|ados)$/, 'ado').replace(/(ida|idas|idos)$/, 'ido'), note: 'In the perfect, the participle doesn’t change: he trabajado, ha cuidado.' });
    else if (ACC_PART[nx] && toks[j] === nx) r.slips.push({ wrote: toks[j], fix: ACC_PART[nx], note: 'Accent' });
    r.forms.push({ aux: toks[i], part, text: `${toks[i]} ${toks[j]}` }); r.parts.add(part.replace(/(a|os|as)$/, 'o'));
  });
  r.count = r.forms.length; r.distinct = r.parts.size;
  return r;
}

/* ---- saber vs conocer (30-3Y: irregular present conocer, saber) ---- */
const SABER = { se: 'yo', sabes: 'tu', sabe: '3s', sabemos: 'nos', sabeis: 'vos', saben: '3p' };
const CONOCER = { conozco: 'yo', conoces: 'tu', conoce: '3s', conocemos: 'nos', conoceis: 'vos', conocen: '3p' };
const SC_SLIP = { sabo: 'sé', conoco: 'conozco', conozo: 'conozco', conosco: 'conozco', conozgo: 'conozco' };
const PLACEISH = /^(barcelona|madrid|espana|la ciudad|el barrio|los barrios|el gotico|la playa|las playas|el mercado|la boqueria|el born|gracia|montjuic|la sagrada|el parque|el centro|la zona|el museo|los museos|el metro|la costa|el mar|la montana|mucha gente|a)$/;
const NOT_INF = /^(mar|lugar|hogar|bar|par|azar|mujer|ayer|placer|taller|alrededor|sur|interior|exterior|mayor|menor|mejor|peor|color|amor|calor|favor|dolor|actor|profesor|director|directora|ordenador|jugador|nadador|camarer[oa]|deber)$/;
const isInf = k => /^[a-z]+(ar|er|ir|arlo|erlo|irlo|arla|erla|irla)$/.test(k) && !NOT_INF.test(k);
function analyzeSC(raw) {
  const toks = words(raw), keys = toks.map(keyOf), r = { saber: [], conocer: [], slips: [] };
  keys.forEach((k0, i) => {
    let k = k0; const lw = toks[i].toLowerCase();
    if (SC_SLIP[k]) { r.slips.push({ wrote: toks[i], fix: SC_SLIP[k], note: SC_SLIP[k] === 'sé' ? 'saber, yo form: sé' : 'conocer, yo form: conozco' }); k = keyOf(SC_SLIP[k]); }
    const nx = keys[i + 1] || '', nx2 = nx + ' ' + (keys[i + 2] || '');
    if (SABER[k] !== undefined) {
      if (k === 'se' && lw === 'sé' && (PLACEISH.test(nx) || PLACEISH.test(nx2))) { r.slips.push({ wrote: `${toks[i]} ${toks[i + 1]}`, fix: `conozco ${toks[i + 1]}`, note: 'Places and people: conocer (conozco Barcelona, conozco a Marta).', mix: true }); return; }
      if (k === 'se') { const nextIsSC = isInf(nx) || /^(que|como|donde|cuando|cual|quien|mucho|poco|bastante|un poco|algo|nada|hablar)$/.test(nx); if (!nextIsSC) return; if (lw === 'se') r.slips.push({ wrote: toks[i], fix: 'sé', note: 'Sé (I know) has an accent; se without one is a pronoun.', acc: true }); }
      if (PLACEISH.test(nx) || PLACEISH.test(nx2)) { r.slips.push({ wrote: `${toks[i]} ${toks[i + 1]}`, fix: `${k === 'se' ? 'conozco' : k.replace(/^sab/, 'conoc').replace('conoce' + 'mos', 'conocemos')} ${toks[i + 1]}`, note: 'Places and people: conocer (conozco Barcelona, conozco a Marta).', mix: true }); return; }
      r.saber.push(`${toks[i]} ${toks[i + 1] || ''}`.trim());
    } else if (CONOCER[k] !== undefined) {
      if (isInf(nx)) { r.slips.push({ wrote: `${toks[i]} ${toks[i + 1]}`, fix: `${{ conozco: 'sé', conoces: 'sabes', conoce: 'sabe', conocemos: 'sabemos', conoceis: 'sabéis', conocen: 'saben' }[k]} ${toks[i + 1]}`, note: 'Knowing how to do something: saber + infinitive (sé nadar).', mix: true }); return; }
      if (nx === 'que') { r.slips.push({ wrote: `${toks[i]} que`, fix: `${{ conozco: 'sé', conoces: 'sabes', conoce: 'sabe', conocemos: 'sabemos', conocen: 'saben' }[k] || 'sé'} que`, note: 'Knowing a fact: saber que…', mix: true }); return; }
      r.conocer.push(`${toks[i]} ${toks[i + 1] || ''}`.trim());
    }
  });
  return r;
}
