import asyncio, json, time
from playwright.async_api import async_playwright
THREE='/home/claude/vendor/node_modules/three/build/three.min.js'
LOG=[]
def log(*a):
    print(*a, flush=True)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':1200,'height':1500}); errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)+' '+(e.stack or '')[:400]))
        await pg.route('**/fonts.*/**',lambda r:r.abort())
        await pg.route('**/three.min.js',lambda r:r.fulfill(path=THREE,content_type='application/javascript'))
        await pg.add_init_script('window.__mute=true; window.__timeScale=15; window.__testSpeed=0.04;')
        await pg.goto('file:///home/claude/out/fallas.html'); await pg.wait_for_timeout(2500)
        async def jclick(sel): await pg.evaluate("s=>{const e=document.querySelector(s); if(!e) throw new Error('no '+s); e.click();}", sel)
        async def jfill(sel, v): await pg.evaluate("([s,v])=>{document.querySelector(s).value=v}", [sel, v])
        await jclick('#startBtn')
        await pg.wait_for_timeout(3000); log('ERR-EARLY', errs)
        await pg.wait_for_selector('#checkPlan', timeout=120000)
        week = await pg.evaluate("(()=>{const G=window.__fallasGame; return {cs:G.WEEK.cs.map(c=>c.lines.join(' ')), sols:G.WEEK.sols}})()")
        log('RULES', json.dumps(week['cs'], ensure_ascii=False)); log('SOLUTIONS', len(week['sols']))
        # play every message once
        for i in range(5): await jclick(f'[data-m="{i}"]'); await pg.wait_for_timeout(150)
        # a wrong plan first: mascletà at night
        await jclick('.act[data-a="mascleta"]'); await jclick('td[data-s="mar-n"]')
        sol = week['sols'][0]
        for k,v in sol.items():
            if k=='mascleta': continue
            await jclick(f'.act[data-a="{k}"]'); await jclick(f'td[data-s="{v}"]')
        await jclick('#checkPlan'); await pg.wait_for_timeout(1200)
        log('AFTER WRONG CHECK', await pg.inner_text('#fbs'))
        await jclick('.act[data-a="mascleta"]'); await jclick(f'td[data-s="{sol["mascleta"]}"]')
        await pg.screenshot(path='/home/claude/fallas-game/p-plan.png')
        await jclick('#checkPlan')
        await pg.wait_for_selector('#inp', timeout=60000)
        plan = await pg.evaluate("window.__fallasGame.PLAN")
        DAY={'mar':'martes','mie':'miércoles','jue':'jueves'}; PART={'t':'tarde','n':'noche'}
        def when(k): d,pp = plan[k].split('-'); return f"el {DAY[d]} por la {PART[pp]}"
        draft = f"Hola familia. {when('mascleta').capitalize()} haceremos la mascletà. Vamos a ir a la ofrenda {when('ofrenda')}."
        await jfill('#inp', draft); await jclick('#sendBtn'); await pg.wait_for_timeout(2500)
        log('DRAFT FEEDBACK', (await pg.inner_text('#fbs')).replace('\n',' | '))
        msg = f"¡Hola familia! {when('mascleta').capitalize()} iremos a la mascletà. {when('ofrenda').capitalize()} llevaremos flores a la ofrenda. {when('luces').capitalize()} veremos las luces del barrio. {when('bunyols').capitalize()} comeremos buñuelos con la abuela."
        await jfill('#inp', msg); await jclick('#sendBtn')
        # the week
        t0=time.time(); wrong_done=False; shots=set(); blog_sent=False
        while time.time()-t0 < 1500:
            st = await pg.evaluate("""(()=>({eb:document.getElementById('taskEyebrow').textContent, go:!document.getElementById('goBtn').hidden && !document.getElementById('goBtn').disabled, pick:window.__hasPick&&window.__hasPick(), inp:!!document.getElementById('inp'), ch:[...document.querySelectorAll('.choice:not([disabled])')].map(b=>b.textContent), exp:window.__expect, instr:window.__instr&&window.__instr[0][1], sum:!document.getElementById('summary').hidden, place:document.getElementById('place').textContent}))()""")
            if st['sum']: break
            eb=st['eb']
            if eb not in shots and st['pick']:
                shots.add(eb); await pg.screenshot(path=f"/home/claude/fallas-game/p-{len(shots)}.png")
            if st['pick']:
                if not wrong_done and eb=='La mascletà':
                    wrong_done=True; others=[k for k in ['balcon','cartel','bunyols','quiosco'] if k!=st['exp']]
                    await pg.evaluate(f"window.__pick('{others[0]}')"); log('picked wrong spot on purpose'); await pg.wait_for_timeout(1500); continue
                await pg.evaluate(f"window.__pick({json.dumps(st['exp'])})"); log('pick', eb, st['exp'] if not isinstance(st['exp'],dict) else ''); await pg.wait_for_timeout(1500); continue
            if st['go']:
                log('go', eb, st['place']); await jclick('#goBtn'); await pg.wait_for_timeout(1500); continue
            if st['ch']:
                want = st['exp']['total'] if isinstance(st['exp'],dict) and st['exp']['total'] in st['ch'] else ('01:00' if '01:00' in st['ch'] else st['instr'])
                log('choose', want, st['ch']); await pg.evaluate("w=>[...document.querySelectorAll('.choice')].find(b=>b.textContent===w&&!b.disabled)?.click()", want); await pg.wait_for_timeout(1500); continue
            if st['inp'] and eb=='Los buñuelos':
                order = 'Buenas tardes. Me pone ' + ', '.join(st['exp']['items']) + ', por favor.'
                log('order', order); await jfill('#inp', order); await jclick('#sendBtn'); await pg.wait_for_timeout(1200); continue
            if st['inp'] and eb.startswith('Misión 4') and not blog_sent:
                await pg.screenshot(path='/home/claude/fallas-game/p-blogstart.png')
                D = await pg.evaluate("(()=>{const s=window.__fallasGame.session; return {ev:s.events, c:s.details.cousins&&s.details.cousins.es, n:s.details.ninot&&s.details.ninot.short, b:s.details.bouquet&&s.details.bouquet.desc}})()")
                E={'mascleta':'fuimos a la mascletà en la plaza del Ayuntamiento y encontramos a Jordi y Laia '+D['c'],'luces':'vimos las luces del barrio y voté por el ninot que tenía '+D['n'],'ofrenda':'llevé mi ramo de '+D['b']+' a la ofrenda','bunyols':'comimos buñuelos y la abuela pidió un chocolate','crema':'quemaron la falla en la cremà y fue increíble'}
                txt=' '.join(f"El {e['day']} por la {e['part']} {E[e['act']]}." for e in D['ev'])
                log('BLOG', txt); await jfill('#inp', txt); await jclick('#sendBtn'); blog_sent=True; await pg.wait_for_timeout(2500)
                log('BLOG FEEDBACK', (await pg.inner_text('#fbs')).replace('\n',' | '))
                continue
            await pg.wait_for_timeout(700)
        await pg.wait_for_timeout(3000)
        log('SUMMARY', (await pg.inner_text('#summary'))[:1500].replace('\n',' | '))
        await pg.evaluate("(()=>{const n=document.getElementById('sgrName'); n.value='Ana Prueba'; n.dispatchEvent(new Event('input'));})()"); await pg.wait_for_timeout(300)
        log('CODE', await pg.inner_text('#sgrCode'))
        el = await pg.query_selector('#summary'); await el.screenshot(path='/home/claude/fallas-game/p-summary.png')
        log('ERR', errs); await b.close()
asyncio.run(main())
