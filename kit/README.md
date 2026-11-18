# Spanish games: starter kit and design guide

This kit lets a new chat in this project keep building games that match the set. Start here.

## The games so far

### Spanish 10-3Y

| # | Game | Project file | Link |
|---|---|---|---|
| 1 | Primer encuentro con Lucía | claude/primer-encuentro.html | https://claude.ai/artifact/YDDovM7kiV8ELRJCkhf6A8 |
| 2 | Una tarde en Guadalajara (2D) | claude/una-tarde-en-guadalajara.html | https://claude.ai/artifact/JEpHugbBozQEu1hwfVZRsT |
| 2 | Una tarde en Guadalajara 3D | claude/una-tarde-en-guadalajara-3d.html | https://claude.ai/artifact/D9RTmN3efij7FiqBz2dsvm |
| 3 | ¿Quién se comió el pastel? | claude/quien-se-comio-el-pastel.html | https://claude.ai/artifact/KRTVcvVqLWPGZuWATPy7tt |
| 4 | Los quehaceres | claude/los-quehaceres.html | https://claude.ai/artifact/GKgXFT8VFXiUV9E4dxuFnP |
| 5 | La maleta | claude/la-maleta.html | https://claude.ai/artifact/UZ3AFGKycyiyhuokzkjm9A |
| 6 | El primer día de clases (3D hallway) | claude/el-primer-dia-de-clases.html | https://claude.ai/artifact/5RHxGjS4xoUGZngShTWArd |
| 7 | La fiesta de Lucía | claude/la-fiesta-de-lucia.html | https://claude.ai/artifact/Fsi6SoMDZT5sjnEzUhU2ja |
| 8 | El taller de alebrijes | claude/el-taller-de-alebrijes.html | https://claude.ai/artifact/EZAVZimakgk2Zud7L1813p |

### Spanish 20-3Y

| # | Game | City | Project file | Link |
|---|---|---|---|---|
| 1 | Otra vez tarde (daily routine) | Bogotá | claude/otra-vez-tarde.html | https://claude.ai/artifact/STVpHPQLk9bPxp3aHi9fzi |
| 2 | ¿Quedamos? (social life) | San Juan | claude/quedamos.html | https://claude.ai/artifact/ARJWu2Lbf1jsw7EKt5nX3D |
| 3 | El mercado (foods: market, restaurant) | Oaxaca | claude/el-mercado.html | https://claude.ai/artifact/2uABqaf9ECJvpJc2q7MQjz |
| 4 | ¿Moda o no moda? (shopping, fashion, fads) | Madrid | claude/moda.html | https://claude.ai/artifact/QfrwfQhSWKDWa1bzMth1xG |
| 5 | ¡Gol! (sports and exercise) | Buenos Aires | claude/gol.html | https://claude.ai/artifact/NKta7r92RwGUd8GVMgXspQ |
| 6 | La farmacia de guardia (health and safety) | Puerto Viejo, Costa Rica | claude/la-farmacia.html | https://claude.ai/artifact/KfaGtdWtuVrzWzVEUU4KfX |
| 7 | Conexión perdida (vacations and travel) | Lima | claude/conexion-perdida.html | https://claude.ai/artifact/WZkdHmGafPrrF6ZAE8ncmd |
| 8 | Mismo idioma, otro mundo (cultural diversity) | Lethbridge (calls from all seven cities) | claude/mismo-idioma.html | https://claude.ai/artifact/WxJEoQgXyXwUTLW3YcxNCy |

Style reference (design canvas): https://claude.ai/artifact/6Mg2ZNitwpwHHimCCJCDXL ("Atardecer" was chosen).

To update a game, publish to its existing link: read it first with the Artifact tool, then publish with `url`. Publishing without `url` makes a second copy. The teacher sets sharing to "Anyone with the link" from each page's Share menu.

## What the teacher decided

- Combined Spanish 10-3Y / 20-3Y / 30-3Y class in Lethbridge, Alberta. Program of studies: the POS PDF in this project. Check outcome codes against it; never invent them.
- Games are about fluency and mastery, not quizzes: scenes, conversations, mysteries, open typed input, listening and following directions.
- Students play on Windows lab computers (64 GB RAM, some with RTX 4070 GPUs), so 3D (three.js) is fine. No Chromebooks.
- Hosting on GitHub Pages later.
- No save system. Each game ends with a summary (stats, stars, badges, transcript) that becomes a printable end-of-session report with a code, submitted to Teams. It is used for formative assessment and pacing, not marks.
- Every playthrough is procedurally different (new culprit, new timetable, new guests, and so on).
- Instructions are in English; the game world is in Spanish.
- Not a Duolingo clone. Polished enough that students connect with it rather than dismiss it.
- Audio: one Spanish voice only (best available: Natural/Online, then Google, then es-MX > es-US > es-419 > es-ES). Never let an English voice read Spanish. If no Spanish voice exists, hide the audio buttons (`body.no-tts`). Avoid "Mmm" and similar in spoken lines (the voice spells it out).
- Accents: every text input has the accent bar (á é í ó ú ñ ü ¿ ¡) plus typing shortcuts (a' → á, n~ → ñ, ? → ¿). Missing accents get gentle feedback, never a fail.
- Look: "Atardecer" (dusk, cinematic). Tokens: --bg #17122E, --surface #221B44, --accent #5FE0C8 (teal), --sun #FFC27A (warm). Fonts: Unbounded (display) and Manrope (body). Skyline band with string lights at the top of every page. Glass cards with 22px radius. Pill buttons; the primary button is warm (--sun).
- Lucía, the guide: teal top, long dark hair, a pink flower in her hair, a shorter neck. Portrait: `luciaSVG()` in sfx.js. Full body: `famSVG({...flower:true})` in figures.js.
- Sound: synthesized Web Audio (no files), warm marimba and chime. Mistakes get a soft low "bonk", never a buzzer. There is a mute switch.
- Each page has a "Para el profe" section: how the scene works, what is randomized, which grammar is checked, and the outcomes with codes.

### Added for 20-3Y (Nov 2026)

- **One city per game**, a tour of the Spanish-speaking world. Lucía opens each game as the guide and closes it by naming the next city.
- **Hidden gems in every city:** six clickable "Datos de [city]" sparkles in the scene (a cultural fact in Spanish plus an English explanation), plus local words in the dialogue. Finding all six earns a badge.
- **Regional accents (LC–4.3 a) are deferred.** Voice choice lives in one place (`VOZ`, `rankVoice`, `speak` in base.js), so region-matched voices can be added later and every game picks them up on rebuild.
- **Printable reports (built Nov 2026):** every game ends with an *Informe de la sesión* panel under its summary: name, course (10/20/30-3Y), a 12-character code, *Imprimir informe* and *Copiar para Teams*. A code checker is in every page's *Para el profe*. See “The end-of-session report” below.

## The 30-3Y plan (draft, 17 Nov 2026, not yet approved)

Grammar from LC–1.4 at 30-3Y, checked against the POS. **Structured (b), checked in student input:** irregular present (conocer, saber, dar, poner, traer, preferir); preterite; imperfect; perfect; simple future; direct object pronouns; por/para; hace + time; personal a; impersonal se. **Modelled (a), never marked:** preterite vs. imperfect *contrast*, conditional, present subjunctive, negative commands, irregular tú commands, indirect object pronouns, possessive pronouns, comparatives/superlatives/diminutives. So each tense is checked where its use is clear-cut; the choice between preterite and imperfect is not marked.

**Audio-only by default.** Every 30-3Y game opens with spoken dialogue only. Text lives in a ⚙ Ajustes menu (Mostrar texto, off by default). No per-message "Ver texto" button. Replay and Lento stay unlimited. If text is turned on, the printed report and Teams text say so. A machine with no Spanish voice falls back to text automatically and the report says why. An accommodation switch (URL parameter) turns text on for students who need it.

| # | Game | Field (LC–1.3 a) | Setting and mechanic | Grammar checked |
|---|---|---|---|---|
| 1 | Noche de leyendas | Folk tales, legends and fables; literature | Antigua, Guatemala. A storyteller tells legends (El Sombrerón, La Llorona) by audio; students rebuild the story, then tell the ending in their own words. | Preterite (events), imperfect (description), personal a |
| 2 | Cuando era pequeño | Children's games and childhood | Montevideo. Abuelos explain the games they played (rayuela, escondidas); students play them, then compare childhoods. | Imperfect (habitual), hace + time |
| 3 | ¡Fallas! | Cultural celebrations | Valencia, Las Fallas. Plan the week, live it, then write the blog post afterwards. | Simple future, preterite |
| 4 | Radio Habana | Music; arts and entertainment | Havana community radio. Interview a musician, take listener requests, review a concert or film. | Perfect tense, direct object pronouns |
| 5 | Se me rompió | Technology | Medellín phone-repair help desk. Customers explain what happened; students troubleshoot. | Preterite (tú/yo questions), direct object pronouns, impersonal se |
| 6 | Se busca | The world of work | Barcelona summer job fair. Read postings, interview for a job, describe future plans. | Perfect, preterite, simple future, saber/conocer |
| 7 | El examen de manejo | Driving | Santiago de Chile (possibly 3D). Driving test by audio instructions, then an accident report. | por/para, preterite |
| 8 | Voluntarios | The environment; relationships | Galápagos volunteer club. Coordinate tasks with teammates, compare then and now, make pledges. | Imperfect (antes había), simple future, por/para, hace + time |

## The 20-3Y plan

Grammar targets come from LC–1.4 at 20-3Y. **Structured (b), checked in student input:** reflexive verbs; affirmative tú/ustedes commands; ir a + infinitive and tener que + infinitive; present progressive; demonstratives and possessives; me/te/le/nos/les gusta(n) and caer bien/mal; querer, poder, venir, salir, jugar, saber; alguien/nadie/algo/nada. **Modelled (a), in what students read and hear, never marked:** preterite, imperfect, perfect, future, hace + time, por/para, direct object pronouns. **Independent (c), assumed:** present regular verbs, ser/estar/tener, agreement, questions.

| # | Game | Field (LC–1.3 a) | City and mechanic | Grammar checked | Status |
|---|---|---|---|---|---|
| 1 | Otra vez tarde | Daily routine | Bogotá. Time loop: get Mateo to la ruta with commands; then write your own routine. | Reflexives, tú commands, tener que, primero/luego/por último | **Built** |
| 2 | ¿Quedamos? | Social life | San Juan. Phone group chat: plan a weekend around clashing schedules, invite, decline politely, handle a cancellation. | querer/poder/salir/venir, tener que, register | **Built** |
| 3 | El mercado | Foods | Oaxaca. Market shopping on a budget with usted, then ordering for a family at a fonda. | Demonstratives, quantities, le/les gusta | **Built** |
| 4 | ¿Moda o no moda? | Shopping, fashion, fads | Madrid. Style customers from a second-hand shop; poll characters on trends. | Demonstratives, possessives, opinions | **Built** (Madrid) |
| 5 | ¡Gol! | Sports and exercise | Buenos Aires. Follow radio commentary (unguided listening), then commentate; ustedes-command warm-up. | Present progressive, ustedes commands | **Built** (Buenos Aires) |
| 6 | La farmacia de guardia | Health and safety | Costa Rican beach town. Locals describe symptoms and accidents; give advice. | me duele, tener/estar, tener que, tú vs. usted, hace (modelled) | **Built** (Puerto Viejo) |
| 7 | Conexión perdida | Vacations and travel | Lima airport (maybe 3D). Cancelled flight, gate changes, lost bag, rebooking; then a postcard. | ir a + infinitive, problem solving | **Built** (Lima, 2D) |
| 8 | Mismo idioma, otro mundo | Cultural diversity | Video calls with teens from the seven cities: guess where they're from by words and customs; compare with Lethbridge. | Regional vocabulary; irregular present, pronouns after prepositions, alguien/nadie/también (comparatives are 30-3Y modelled, so not checked) | **Built** (Lethbridge) |

Suggested build order: 1, 2, 3, 6, 5, 4, 7, 8. Each game gets a harder tier for 30-3Y students (for example, producing the preterite where 20-3Y only reads it).

### Notes on Otra vez tarde (s20-1)

- Turn-based clock: each command costs minutes (`DUR`). Mateo has to reach the stop before la ruta with everything done; otherwise the morning repeats and discoveries become sticky notes on the family board.
- `newMorning()` picks a workable order first, then fits Papá and Valentina into the bathroom gaps, and rejects mornings where "shower first" works (no puzzle) or where idle waiting would be needed. Slack is 3–6 minutes after the expert line (get up, phone away, then the six tasks).
- `parseClause()` maps commands to actions and forms: imp, tener, usted, stmt, first, inf, bare (gets a joke), stem (vestete), tenerSe. Clauses split on commas and y/luego/después. `accentSlips()` flags levantate → levántate and so on.
- `checkRoutine()` counts first-person reflexives and sequence words and corrects yo levanto, me levanta, me vesto.
- `window.__scene` exposes the main functions for tests.

### Notes on ¿Quedamos? (s20-2)

- Phone UI: one `makeFeed` per chat (group, Camila, four friends, Doña Maritza, Sebastián, Lucía). `say(chat, who, text)` handles unread badges; only the open chat is read aloud.
- `newWeekend()` picks four friends with 2–3 busy slots (tener que / ir a reasons), two liked and one disliked activity, and keeps only weekends with one or two plans that work for everyone (`goodPlans`).
- `entities()` pulls activity, day(s) and morning/afternoon/evening from any message; `formSlips()` notes tú in the group, ustedes in a private chat, usted with friends, *te gusto*, *tú puede*.
- Missions: ask (all four known) → plan (proposal in the group; stars by number of proposals; best plan used after four) → permiso (usted check, who/when, curfew negotiation) → cambio (kind reply to a cancellation, then a polite decline of a clashing invitation; accepting by mistake means cancelling politely).
- Gem sparkles: `.gem .ring` has `pointer-events: all` so the whole ring is clickable (done in s20-1 too).

### Notes on El mercado (s20-3)

- Continuity: the host family is Don Manuel's (Lucía's uncle, the alebrije carver from 10-3Y Escena 8), with Abuela Chayo and his nephew Tomás.
- `newMarket()` picks a recipe (4–5 items) and lays out three stalls. Every listed item sits in two baskets in different rows (0 = front, near the student = este; 1 = counter, near the vendor = ese; 2 = back shelf = aquel) with its two prices; rows hold at most four baskets. The budget is 115% of the all-cheap total, so buying all the dearer baskets always goes over. Overspending never blocks: the vendor lets it go for what you have, then sells *fiado*.
- Vendor parsing (`vendorClause`): clauses split on punctuation and *y* + quantity; `productsIn`, `demsIn` (rejects *está/estás* as verbs), `qtyOf` (kilo, medio, cuarto, kilo y medio, docena, media docena, manojo, pieces; ignores haggling numbers). No demonstrative with two baskets → *¿Cuáles?* and a pending purchase; pronoun use (*esos*, *aquellos*) resolves against the pending or last product. Prices are spoken neutrally (*los de adelante / del mostrador / de atrás*). Haggling refunds about 10% once per stall.
- Fonda: `newFamily()` gives each of three people two preferences from different topics so 1–2 of the seven dishes fit. `answerFor` handles topics (carne, picante, frijoles, queso), dish questions and general questions; learned preferences show as third-person *le gusta* notes. Orders are split on *para*; the waitress asks for missing people; a wrong dish gets a complaint and must be changed.
- `gustarCheck(n)` (number agreement after gusta(n)/encanta(n), coordination accepted, *mi gusta*, *yo gusto*, *usted gusta*, *tú gustas*, *le/les* with *a + person*) is reusable in later games.

### Notes on Mismo idioma, otro mundo (s20-8)

- Back home in Lethbridge. Five of the seven friends from the trip call (random each playthrough): Valentina (Bogotá), Camila (San Juan), Tomás (Oaxaca), Alba (Madrid), Martina (Buenos Aires), Kevin (Puerto Viejo, who uses usted, as many Costa Ricans do), Rodrigo (Lima, new). Their camera backgrounds (`cityBG`) are blurred with an SVG filter until the right guess.
- `CITIES[k]`: greeting, a first line with a hint, answers for five topics (`TOPICS`: comida, clima, palabras, ciudad, libre), a fact regex for the final post, and the local word for "cool". Questions fill the clue notebook; at least one before guessing. Guess by clicking a map pin or *Eres de… / Creo que eres de…* (city or country words); a wrong guess gives an unasked clue, three wrong guesses and the caller tells you. After the guess the caller asks about Lethbridge (`ASKBACK`, five topics shuffled across the calls) and needs a sentence of four words or more; the reaction models *nadie, también, algo*.
- Checks: `grammarSlips` (irregular yo forms *conoco, sabo, prefero, poneo, traio…*; *preferes, conozces*; pronouns after prepositions *para yo → para mí, con yo → conmigo, para tú → para ti, con ti → contigo, para mi, → para mí*, and *con tú amigo → con tu amigo*); `gustarSlips`; usted / su with a friend. JavaScript's \b doesn't treat accented letters as word characters, so accented patterns use lookaheads.
- Mi mundo hispano: `postFacts` splits the raw post into sentences, finds city words and checks for that city's facts; a sentence that names one city but only has another city's facts is questioned (*En Madrid comen arepas*). Needs two cities with a fact, a Lethbridge sentence and a connector; 3 stars with *alguien/nadie/algo/nada/también/tampoco*, no slips and no doubtful facts. Lucía closes the 20-3Y trip.
- Gems (all in the room): the globe (Spanish around the world), Equatorial Guinea (star on the map), the ñ key, the 23 April calendar (Día del Idioma), the rodeo poster (English words from Spanish) and the Lethbridge Viaduct through the window.

### Notes on Conexión perdida (s20-7)

- Lima airport (Jorge Chávez), on the way to Lucía in Cusco. Built in 2D like the other scenes (the plan said "maybe 3D"). Fictional airline Inti Air (flights IN 2xxx). Staff and Doña Ermelinda get usted; Lucía (by text) gets tú. Peruvian Spanish: ¡ya!, al toque, chévere, joven.
- La maleta perdida: `newBag()` = the student's bag (type maleta/bolso/mochila, colour, size, detail: cinta / pegatina de Canadá / llavero de oso / etiqueta) plus five lookalikes, four differing in exactly one attribute and one in two, so every detail is needed. The photo and Don Julio's screen are drawn by `bagSVG`. Each matching detail rules out candidates; a detail that doesn't match the photo is questioned (colour words right after cinta/etiqueta/llavero are ignored for the bag's colour). One left → "¿Es esta?" → "¿Dónde se va a quedar?" (Hostal Inti Wasi, from Lucía's message). `bagSlips`: article and adjective agreement with the bag noun the student used.
- ¡Cancelado!: `SCEN` = three situations from Lucía (arrive today and not on a waiting list; arrive tomorrow but don't spend; arrive before 22:00), each with three flights and exactly one right one. Students explain the problem first, then ask (`ATTR`: llega, precio, escala, asientos; a question without a flight answers for all three; `optRef` finds a flight by departure time in digits or words, ordinal, or "de mañana"). At least two answers before choosing. After choosing, they text Lucía with ir a + infinitive and a time; a choice that doesn't fit her plans makes her object and sends them back to the counter.
- La puerta: `newGates()` = the gate, a new gate, five domestic flights for the monitor (one may be delayed, with a new time), the flight Doña Ermelinda asks about and a distractor gate change. Announcements (Megafonía) come before and after she asks. The monitor hides your new gate ("CAMBIO DE PUERTA"), so the student has to listen. Her answer needs the time (the new time if it's delayed; digits or words via `parseTimes`, including 24-hour words like "quince cuarenta") and the gate (`gatesIn`). Gate signs 10–20 become clickable after the change.
- La postal: at least three ir a + infinitive plans with at least two different verbs; 3 stars with greeting, closing and no slips. `irA` (all missions): counts voy/vas/va/vamos/van + a + infinitive (clitics allowed), corrects a conjugated verb after a (`PRES2INF`), a missing a, and the form of ir with the subject (yo, X y yo, mis padres, Lucía…; `subjectOf` stops at y/de/las…, and a vocative like "Lucía," or "Querida familia:" at the start of a sentence is ignored). Destinations (voy a Cusco, vamos a la playa) are not judged.
- Gems: Machu Picchu poster and the Nazca hummingbird (arrivals), Inca Kola (departures), ceviche and the alpaca shop with Quechua words (gates), the condor (plane window).

### Notes on ¿Moda o no moda? (s20-4)

- Madrid, Segunda Vuelta (a second-hand shop in Malasaña) run by Nerea, with her grandmother Doña Carmen (who sews, and explains: tú with most people, usted with older people). The friends and Lucía use vosotros; students may use vosotros or ustedes.
- El probador: `newShop()` = three customers (at least one older → usted), each with an item (`ITEMS`: tops, trousers, shoes) and a problem (`CONDS`: top grande / pequeño / colores (clashing polka dots with pink or purple trousers), trousers largo / corto, shoes grande / pequeño). `customerSVG` draws famSVG with a skin-coloured base and clothing overlays (`topSVG`, `bottomSVG`, `shoesSVG`). Round 1: `splitSugg` cuts the message at the suggestion (pruébate, talla, otro color, Carmen…); `verdictOf` reads the opinion part (`COND_RE`, generic bad, generic good); `suggOk` checks the direction of the fix (smaller / bigger / shorter / longer / another colour; *otra talla* → "¿más grande o más pequeña?"). A correct fix alone counts as the verdict too. Two wrong verdicts → Nerea models; three failed fixes → Nerea models. Round 2: the fixed outfit needs a positive opinion. `agreementSlips`: demonstrative agreement (and a one-time note that ese/esa fits clothes the customer is wearing), quedar number, adjective agreement (skipped when another clothing noun is closer). Register by te/le, pruébate/pruébese.
- ¿De quién es?: `newBench()` = five items, each in its owner's colour (Lucas azul, Alba morado, Hugo rojo, Irene amarillo; one friend has two), plus the group's bag of bocatas. Items and friends are clickable (the highlight box is clickable, not just the shapes). `toFriends`: general *¿De quién es…?* → a colour clue (*a Hugo le encanta el rojo*); *de Hugo* to someone else → yes/no; tu/tus/tuyo to the addressee (name in the message or last clicked) returns it or gets "No, no es mía… yo llevo…"; vuestro / de ustedes / su (to the group) for the bag; su to a friend and mi are corrected. `possSlips`: tu/tus, mi/mis, su/sus, vuestro, tuyo/suyo, demonstrative and es/son agreement.
- La encuesta: `newPoll()` = three trends (at least one singular) with opinions −2…2 per person, each trend liked by someone and disliked by someone. People and trends are clickable. Register and parecer/gustar number are checked when one trend is asked. Six answers from all four people → the post. `reportsIn` splits the raw post into sentences first, then reads each *a X (no) le/les gusta(n)/encanta(n)/parece(n)* with the trend after it, maps people (names, *los chicos* = Iker and Carla, *todos*), and checks it against the poll (reports about things not asked don't count). Needs two correct results and an opinion (*creo que, me parece que…*); 3 stars with *porque*, no slips, and at least eight poll answers. `gustarCheck` (from s20-3) plus *a Iker y Carla le → les*.
- Gems: el Rastro (poster), the tiled street sign and the cat (madrileños = gatos) through the window, el oso y el madroño and chocolate con churros on the counter, the Palacio de Cristal in the Retiro.

### Notes on ¡Gol! (s20-5)

- Buenos Aires, Club Sol de Mayo's under-17 girls' team vs. Deportivo Riachuelo. Martina (#10) is Lucía's cousin. Characters use *voseo* (*sos, tenés, mirá, ¿jugás?*); students' vos forms are accepted, never corrected. Lucía introduces vos at the start (LC–4.3 a).
- Warm-up: `newBoard()` = five of ten exercises (`EX`; the first is always correr or caminar), shown as pictograms (`PICT`) on the whiteboard in the scene and bigger in the board under it. `parseWarm()` splits on punctuation and *y / luego / después* and looks up each clause in `FORMS` (ok / tu / ud / ind / inf), with `needs` for ambiguous words (*den / de / da* need *vuelta*, *tomen / toma* need *agua*, *levanten / suban* need *brazos / manos*). A tú/vos command makes one player do it alone (*¿Yo sola?*). Out-of-order commands are done but don't advance. The players are a custom `playerSVG` with separate limbs; poses are CSS classes `ex-<id>` (rotations happen around each limb's local origin, set by a wrapping translate).
- Radio: `newMatch()` gives a random first half (1–0, 0–1 or 1–1) as commentary lines in the present progressive, plus four Don Beto questions (score; scorer; card or save; what the players are doing now). The question list shows during the commentary, so students know what to listen for. `checkAnswer` accepts digits or words, *empatando*, *ganando / perdiendo* with the right team, names or a number + team (*la diez* alone asks which team). Two tries, then Beto gives the answer. The score pill stays hidden until the radio questions are done.
- Commentary: `newPlays()` = a foul (dribble, push, fall, yellow card) and a save in random order, then Martina's goal. A small animation engine moves the player tokens with CSS transitions (`moveTo`, `ballTo`, `fx`); *Ver otra vez* replays. `progressives()` finds estar + gerund (clitics before or after), and corrects: gerund forms (*correndo, pasiendo, pediendo*; only for verbs in `VERBS`, so *tremendo* is ignored), estar + infinitive, estar + conjugated verb, *ser* for *estar*, and estar agreement from the subject before it (`subjectNumber`: names joined by *y*, *las/los…* → plural; *la hinchada* → singular). The simple present (*Martina corre*) gets a tip. `checkRelato` assigns each progressive to one action (`ACTIONS` verb sets), needs two actions + a player's name; three tries, then El Tano models the call. The checklist shows only names until an action is called.
- Interview: `TOPICS` regexes (desde, deportes, entrenar, sentir, partido, favorita, futuro, gusta, poder, posición); three topics → Martina asks *¿Y vos? ¿Jugás algún deporte?*, but further questions are still answered. `jugarSlips` (*jugas → juegas / jugás* by the raw accent, *juegar, juga, jugan, juegamos*, *jugo* (juice) → *juego*); *usted* is flagged.
- Gems: Obelisco, the *hinchada*'s bombo, *fileteado* on the colectivo (all on the pitch view), *choripán*, *mate*, *bandoneón* (in the canteen).

### Notes on La farmacia de guardia (s20-6)

- Puerto Viejo de Talamanca, on the Caribbean coast. Doña Fefi (Afro-Caribbean, from Limón) runs the late-night pharmacy and explains *ustedeo*. Costa Rican words: *mae, diay, tuanis, upe, pura vida, zancudos*.
- `newShift()`: four patients (two adults → usted, two teens → tú, from eight people), three of seven regular cases (quemadura, torcedura, resfriado, cortada, picaduras, estómago, insolación) plus one serious case (fiebre / quebrado / profunda), never first. Each case has answers per topic (síntoma, dónde, desde, causa, fiebre, otros), a patient-file summary, advice keys (regexes in `KEYS`), harmful advice with negation handled (`no tomar sol` is fine), good shelf products and a model answer.
- Questions (`Q`) are answered only when the message is a question or not advice; body-part yes/no questions get *No, la cabeza no…*. *¿Te pican…?* counts as *dónde*. Advice needs two good keys + a good product (clicking the shelf inserts *Le/Te recomiendo…*); the serious case needs *médico / doctor / clínica / hospital / EBAIS*, and selling a product first gets Fefi's correction. After four advice tries Fefi models the answer (1 star). Stars per patient: −1 for fewer than two questions before advice, −1 for a register slip, −1 for harmful advice / wrong product.
- Checks: register (`TU_R` / `UD_R` and command forms), `dolerSlips` (duele/duelen, pica/pican agreement, *tu duele*), `tenerSlips` (*tienes que bebe → beber*, *ponerse/ponerte* by register; only known conjugated forms in `INF_GUESS` are corrected).
- La charla (`checkTalk`): sentences split on punctuation, clauses on commas and *y*. Ustedes commands from `UCMD`; accents noted from `UACC`; clause-initial tú (`TU2U`), statements (`IND2U`, *se ponen*, *tienen* without *que*), usted (`UD2U`) and infinitives are corrected. Poster rules count per sentence with a command, so *Si hay bandera roja, no entren al mar* counts. Pass: 4 commands, 3 rules; 3 stars at 6 commands, 4 rules, no slips.
- Gems: pura vida (counter sign), perezoso, mono congo (synth howl), tortuga, patí (counter), EBAIS (through the window; the sloth, monkey and turtle reappear at the beach).

## The end-of-session report

- Files: `kit/parts/report.js` + `kit/parts/report.css`, added to a finished page by `kit/report_inject.py` (build.py calls it for every 20-3Y scene; the 10-3Y pages, built before this kit, are patched as finished pages: `python3 kit/report_inject.py page.html <game id> out.html`). Re-running replaces the earlier copy (between `<!-- sg-report -->` markers). It also removes the old “In the site version this becomes the printable report…” note from outcomes.
- Game ids (`<meta name="sg-game">`, and `GAMES` in report.js): 10-3Y 1 primer-encuentro, 2 guadalajara, 3 guadalajara-3d, 4 pastel, 5 quehaceres, 6 maleta, 7 primer-dia, 8 fiesta, 9 alebrijes; 20-3Y 21–28 = s20-1…s20-8. A new game needs a new id in both places.
- No game code changes: report.js watches `#summary`; when a game shows its summary it reads it from the page (`.stat .v/.k`, `.mrow` stars ★/☆, `.badge` / `.badge.off`, the first `ol` (transcript / what they wrote) and `.outcomes`) and adds the panel before *Jugar otra vez*. Restarting (summary hidden) resets the timer. Any new game whose summary uses `renderSummary` (or the same classes) gets the report for free.
- The code: 48 bits of facts (game, course, stars, max stars, badges, max badges, minutes, day since 2026-01-01), masked with a hash of the normalised name (lowercase, no accents), scrambled, plus a 12-bit check; Crockford base-32, `XXXX-XXXX-XXXX`. The checker needs the name as written on the report (case and accents don't matter). It deters copying and editing a report; it is not secure (the key is in the page).
- Printing: a print-only sheet `#sgrSheet` (white, one page for most games) holds the name, course, date, minutes, code, stats, missions, badges, the student's lines and outcomes. `html.sgr-ready` turns on the print rules only while a summary is showing, so Ctrl+P also prints the report. In the claude.ai preview the print window may be blocked: the panel says to use Ctrl+P. Copy for Teams uses the clipboard, or shows the text selected for Ctrl+C.
- Name and course are remembered in localStorage (per browser) for convenience only.

## How the code is organised

Single-file HTML games. `kit/build.py` stitches shared parts and a scene into `kit/out/<game>.html`:

- `parts/head.html` (title + fonts), `parts/base.css` + `scenes/<id>.css` + `parts/theme.css`
- `parts/band.html` (the skyline) + `scenes/<id>.html` (page body)
- JS: `parts/sfx.js` (sound, `SFX`, Lucía and cast portraits, `CAST`) + `parts/base.js` (shared engine) + optional `parts/figures.js` (famSVG people) + `scenes/<id>.js` + `parts/hooks.js` (sound hooks)
- 20-3Y scene ids are `s20-1`, `s20-2`… Add each one to `SCENES` in build.py.
- Scene 6 of 10-3Y also loads three.js r128 from cdnjs: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`

Usage: `cd kit && python3 build.py s20-1` (or no arguments to build all).

base.js API (most used):
- `$`, `sleep(ms)` (scaled by `window.__testSpeed`), `pick`, `shuffle`, `rand`, `esc`, `capFirst`, `stars(n)`
- Text: `norm`, `keyOf`, `words`, `looksEnglish`, `numWord(n)`, `NUMWORDS`
- Speech: `speak(text, who, slow)`, `VOZ`, `tts`
- Feedback: `fb(kind 'ok'|'err'|'warn'|'info', es, en, append, box)`, `clearFb()`, `chipEl()`
- Input: `attachAccentInput([inputs], barEl)`, `reviewAccents(raw)` → `{issues, correct}`, `accentChips()`
- Chat: `makeFeed({feed, people, clock, challenge, autoplay, onReveal})` → `.say(who, text, {name, voice, ini, fast})`, `.me(text)`, `.reset()`. Portraits come from `CAST[who]` (add entries, e.g. a famSVG head crop).
- End: `renderSummary(el, {eyebrow, title, stats, rows, badges, listTitle, list, outcomes, onAgain})`
- House drawing for 10-3Y s4: `ROOMS`, `houseSVG()`, `personSVG()`.
- SFX: `SFX.play(name, {delay, force})` with tap, soft, message, step, turn, whoosh, hint, wrong, correct, perfect, star, door, bell, mission, fanfare, badge. Also `SFX.mission(stars, delayMs)` and `SFX.celebrate(badgeCount)`.

## Getting the source onto disk

`project_read` can return a large file inline instead of saving it, and inline text can't be unpacked. Use one of these instead, in order:

1. **The kit artifact** (current shared parts + 20-3Y scenes + build + tests): https://claude.ai/artifact/M3gpTdBXeo3Tw2bQ4nvMS8. Read it with the Artifact tool, `action: "read"`, `paths: ["parts/head.html", "parts/base.css", "parts/theme.css", "parts/band.html", "parts/sfx.js", "parts/base.js", "parts/figures.js", "parts/hooks.js", "scenes/s20-1.html", "scenes/s20-1.css", "scenes/s20-1.js", "scenes/s20-2.html", "scenes/s20-2.css", "scenes/s20-2.js", "scenes/s20-3.html", "scenes/s20-3.css", "scenes/s20-3.js", "scenes/s20-4.html", "scenes/s20-4.css", "scenes/s20-4.js", "scenes/s20-5.html", "scenes/s20-5.css", "scenes/s20-5.js", "scenes/s20-6.html", "scenes/s20-6.css", "scenes/s20-6.js", "scenes/s20-7.html", "scenes/s20-7.css", "scenes/s20-7.js", "scenes/s20-8.html", "scenes/s20-8.css", "scenes/s20-8.js", "parts/report.js", "parts/report.css", "build.py", "report_inject.py", "split_ref.py", "tests/run.js", "tests/run2.js", "tests/run3.js", "tests/run4.js", "tests/run5.js", "tests/run6.js", "tests/run7.js", "tests/run8.js", "tests/run-report.js", "tests/shots.py", "tests/shots2.py", "tests/shots3.py", "tests/shots4.py", "tests/shots5.py", "tests/shots6.py", "tests/shots7.py", "tests/shots8.py", "tests/shots-report.py"]` and an `out_dir`, then copy into `/home/claude/kit/`. When you add a scene, republish this artifact with the new files (read it first, then publish with `url` and `files`; pass `root: "/home/claude/kit"` so relative paths resolve).
2. **Bundles in the project** (same format: gzip + base64 of `===== FILE: path =====` … `===== END FILE =====` blocks): `claude/kit/spanish-games-source-20-3y.b64.txt` (the kit above) and `claude/kit/spanish-games-source.b64.txt` (the original 10-3Y build tree with s3–s8 sources and the old tests). Unpack with:

```python
import base64, gzip, pathlib, re
src = pathlib.Path('PATH').read_text()
text = gzip.decompress(base64.b64decode(''.join(src.split()))).decode()
for name, body in re.findall(r'===== FILE: (.+?) =====\n(.*?)\n===== END FILE =====\n', text, re.S):
    p = pathlib.Path('/home/claude') / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(body)
```

3. **From any built game:** `Artifact` read with `path: "index.html"` saves the page to disk; `python3 kit/split_ref.py <saved index.html> kit/parts/` cuts it back into the shared parts.

## Testing

- Logic tests (jsdom): `cd kit/tests && npm i jsdom@24 && node run.js ../out/otra-vez-tarde.html && node run2.js ../out/quedamos.html && node run3.js ../out/el-mercado.html && node run4.js ../out/moda.html 10 && node run5.js ../out/gol.html 10 && node run6.js ../out/la-farmacia.html 12 && node run7.js ../out/conexion-perdida.html 10 && node run8.js ../out/mismo-idioma.html 10`. run2.js plays a perfect weekend and a messy one (proposal too early, English, wrong forms, a bad plan, tú with Doña Maritza, accepting the clashing invitation). It sets `window.__testSpeed = 0.002`, then checks the parser, 300 random mornings, a perfect first morning, the routine checker and a failed morning that loops to day 2. Run it several times: every run is a different morning.
- Visual check (Playwright Chromium, already installed in the sandbox): `python3 kit/tests/shots.py` (s20-1), `shots2.py` (s20-2) or `shots3.py` (s20-3) `<abs path to built page> <abs out dir>`. Block Google Fonts (harmless). For three.js pages, launch with `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist` and route cdnjs to a local `three@0.128.0`.
- Report: `node kit/tests/run-report.js kit/out/*.html kit/out/ten/*.html` (fake summary on every page: panel, code, decode, wrong name, print sheet, Teams text, checker, restart; plus 2000 random code round trips and typo detection). `python3 kit/tests/shots-report.py <abs page> <abs out dir> [prefix]` screenshots the panel (desktop, 390px) and the print view, and writes a PDF. run8.js also checks the report after a real playthrough.
- Look at the screenshots before publishing. People drawn over clickable things need `pointer-events: none` (as `#dyn` and `#mateo` have in s20-1).

## Ideas not built yet

- Region-matched voices for LC–4.3 a (deferred).
- A home/hub page linking all games, with level filters (10-3Y / 20-3Y / 30-3Y).
- A GitHub Pages bundle (one folder with an index page and every game).
