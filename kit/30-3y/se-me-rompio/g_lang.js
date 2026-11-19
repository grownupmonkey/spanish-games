/* ============ 3 · TEXT ANALYSIS: preterite (from the series), object pronouns, impersonal se ============ */
/* ---- simple future ---- */
const FUT_REG = 'ir ver comer beber llevar visitar mirar tomar escuchar pasear caminar comprar cenar merendar bailar celebrar disfrutar encontrar quedar volver regresar acompañar llegar conocer entregar probar buscar votar dar estar ser ofrecer quemar invitar ayudar cantar sacar pedir vivir escribir subir abrir empezar terminar jugar aprender correr esperar descansar dormir levantar ducharse quedarse vestir saludar hablar viajar oír admirar gritar pagar desayunar almorzar mojar sentar'.split(' ');
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
  ar: 'caminar llegar entrar tomar comprar visitar pagar buscar mirar hablar escuchar bailar cantar gritar regresar encontrar dejar llevar quedar pasar sacar tocar trabajar viajar usar jugar empezar cruzar ayudar terminar esperar preguntar contestar mostrar sentar almorzar cenar desayunar probar pensar llamar ganar votar entregar disfrutar merendar celebrar quemar admirar saludar explotar acabar durar lanzar mojar invitar preparar levantar acostar despertar encantar gustar asustar emocionar arder derramar tropezar frenar resbalar saltar agarrar dañar cargar calentar guardar secar limpiar apagar regalar olvidar golpear bajar'.split(' '),
  er: 'comer beber correr perder ver aprender conocer volver romper caer leer creer morder prender recoger meter parecer aparecer desaparecer ofrecer responder esconder sorprender vender mover entender encender'.split(' '),
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
const NOT_VERBS = new Set(['cena', 'nada', 'hora', 'paso', 'camino', 'baile', 'viaje', 'noche', 'calle', 'parte', 'pasa', 'mira', 'queda', 'llega', 'trabajo', 'compra', 'visita', 'cambio', 'vista', 'como', 'bajo', 'llamo', 'gusto', 'helado', 'hecho', 'a', 'llevo', 'paseo', 'canto', 'grito', 'pago', 'gana', 'vuelta']);
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
