import asyncio, sys, json, time
from playwright.async_api import async_playwright
PAGE = 'file:///home/claude/out/noche-de-leyendas.html'
OUT = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/shots'
SHOTS = '--shots' in sys.argv
import os; os.makedirs(OUT, exist_ok=True)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1440, 'height': 1000})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)+' '+(e.stack or '')[:600]))
        pg.on('console', lambda m: errs.append('console:' + m.text) if m.type == 'error' else None)
        await pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
        await pg.route('**/fonts.gstatic.com/**', lambda r: r.abort())
        await pg.add_init_script('window.__testSpeed = 0.03; window.__mute = true;')
        await pg.goto(PAGE)
        await pg.wait_for_timeout(500)
        if SHOTS: await pg.screenshot(path=f'{OUT}/00-intro.png')
        await pg.click('#startBtn')
        n = 0; last = None; stuck = 0; shot_i = 1; seen_types = set()
        t0 = time.time()
        while time.time() - t0 < 240:
            n += 1
            await pg.wait_for_timeout(120)
            if await pg.is_visible('#summary'):
                break
            info = await pg.evaluate('''() => { const s = window.__noche.state; const st = s.step || {}; return { type: st.type, id: st.id, idx: s.run && s.run.idx, task: document.getElementById('task').innerText, hasInp: !!document.getElementById('inp'), hasCards: !!document.querySelector('#ia .acard .achoose'), choices: document.querySelectorAll('#ia .choice:not([disabled])').length, mapCand: !!document.querySelector('#mapOver .cand'), go: !!document.getElementById('goBtn') && !document.getElementById('goBtn').disabled, cont: !!document.getElementById('contBtn'), order: !!document.getElementById('pool'), gemOpen: !document.getElementById('gemPop').hidden, title: !document.getElementById('titleCard').hidden }; }''')
            key = json.dumps(info, sort_keys=True)
            if key == last: stuck += 1
            else: stuck = 0; last = key
            if stuck > 120: print('STUCK', info); break
            if info['title']: continue
            if SHOTS and info['type'] and (info['type'], info['id'], info['idx']) not in seen_types and stuck == 3:
                seen_types.add((info['type'], info['id'], info['idx']))
                await pg.screenshot(path=f'{OUT}/{shot_i:02d}-{info["idx"]}-{info["type"]}.png'); shot_i += 1
            if info['gemOpen']:
                await pg.click('#gemClose'); continue
            if info['go']:
                if SHOTS and ('hub', info['idx']) not in seen_types:
                    seen_types.add(('hub', info['idx'])); await pg.wait_for_timeout(300); await pg.screenshot(path=f'{OUT}/{shot_i:02d}-{info["idx"]}-hub.png'); shot_i += 1
                # visit a side encounter once
                side = await pg.query_selector('#mapOver .sidepin')
                if side and not await pg.evaluate('window.__sideDone'):
                    await pg.evaluate('window.__sideDone = true')
                    await side.dispatch_event("click"); continue
                # click a map gem once
                gem = await pg.query_selector('#mapOver .mgem')
                if gem: await gem.dispatch_event("click"); continue
                await pg.click('#goBtn'); continue
            if info['cont']:
                await pg.click('#contBtn'); continue
            if info['order']:
                if not await pg.query_selector('#pool .ocard'): continue
                # place cards in correct order using hidden text
                ev = await pg.evaluate('window.__noche.state.finaleLegend.events')
                for e in ev:
                    cards = await pg.query_selector_all('#pool .ocard')
                    for c in cards:
                        t = await c.eval_on_selector('.es-text', 'x => x.textContent')
                        if t == e:
                            await (await c.query_selector('.btn')).click(); break
                if await pg.is_enabled('#checkOrd'): await pg.click('#checkOrd')
                await pg.wait_for_timeout(300); continue
            if info['mapCand'] and info['type'] == 'map':
                await pg.wait_for_timeout(200)
                await pg.evaluate('window.__noche.state.mapTarget.dispatchEvent(new MouseEvent("click", {bubbles:true}))'); await pg.wait_for_timeout(300); continue
            if info['choices']:
                bs = await pg.query_selector_all('#ia .choice:not([disabled])')
                await bs[0].click(); continue
            if info['hasCards']:
                cs = await pg.query_selector_all('#ia .acard:not(.wrongpick) .achoose')
                if cs: await cs[0].click()
                continue
            if info['hasInp']:
                t = info['type']
                ans = await pg.evaluate('''() => { const s = window.__noche.state, st = s.step || {}, V = s.ctx && s.ctx.vars, N = window.__noche;
                   if (st.type === 'num') return String(N.tpl(st.answer, V));
                   if (st.type === 'write') return st.model;
                   if (st.type === 'finale') return 'Entonces el perro blanco llegó y los dos perros pelearon en la calle. El perro negro desapareció. Chepe estaba muy asustado, pero el perro blanco lo acompañó a su casa. Al día siguiente vio a su madre y le contó todo.';
                   return ''; }''')
                if ans:
                    await pg.fill('#inp', ans); await pg.click('#sendBtn'); await pg.wait_for_timeout(200); continue
                # talk/haggle/side: try a typed answer once, then help → options
                tried = await pg.evaluate('window.__tried = (window.__tried||0)+1')
                if tried % 4 == 1:
                    guess = await pg.evaluate('''() => { const s = window.__noche.state, st = s.step || {}, V = (s.ctx && s.ctx.vars) || {};
                       if (st.id === 'dest') return 'Buenas tardes, voy a la ' + V.posada.name + ', por favor. ¿Cuánto me cobra?';
                       if (st.type === 'haggle') return '¿Me lo deja en ' + window.__noche.tpl(st.floor, V) + ' quetzales?';
                       return 'Sí, gracias. Soy de Canadá. Me gusta mucho. Son las siete.'; }''')
                    await pg.fill('#inp', guess); await pg.click('#sendBtn'); continue
                await pg.click('#helpBtn'); await pg.wait_for_timeout(100); continue
        if SHOTS: await pg.screenshot(path=f'{OUT}/99-end.png', full_page=True)
        sess = await pg.evaluate('JSON.stringify({missions: window.__noche.session.missions, legends: window.__noche.session.legends.map(l=>l.id), gems: window.__noche.session.gems, sides: window.__noche.session.sides, finale: window.__noche.session.finale, writing: window.__noche.session.writing.length, text: window.__noche.session.textShown, reason: window.__noche.session.textReason})')
        print('ENDED', await pg.is_visible('#summary'), round(time.time()-t0,1), 's')
        print(sess)
        print('ERRORS', errs[:10])
        await b.close()
asyncio.run(main())
