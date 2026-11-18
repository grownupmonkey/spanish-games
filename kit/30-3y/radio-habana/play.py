import asyncio, json, time
from playwright.async_api import async_playwright
THREE='/home/claude/vendor/node_modules/three/build/three.min.js'
def log(*a): print(*a, flush=True)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':1200,'height':1500}); errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)+' '+(e.stack or '')[:400]))
        await pg.route('**/fonts.*/**',lambda r:r.abort())
        await pg.route('**/three.min.js',lambda r:r.fulfill(path=THREE,content_type='application/javascript'))
        await pg.add_init_script('window.__mute=true; window.__timeScale=10; window.__testSpeed=0.04;')
        await pg.goto('file:///home/claude/out/radio-habana.html'); await pg.wait_for_timeout(3000)
        async def jclick(sel): await pg.evaluate("s=>{const e=document.querySelector(s); if(e) e.click();}", sel)
        async def send(text): await pg.evaluate("v=>{document.getElementById('inp').value=v; document.getElementById('sendBtn').click();}", text)
        async def fbtext(): return (await pg.inner_text('#fbs')).replace('\n',' | ')[:500]
        await jclick('#startBtn')
        t0=time.time(); stage={'q':0,'sum':False,'calls':0,'wrongpron':False,'wrongpick':False,'rev':False}; shots=set()
        QS=['¿Has tocado con artistas famosos?','¿Ha tocado usted en otros países?','¿Cuántos discos ha grabado?','¿Cuántas canciones ha escribido?','¿Ha ganado algún premio?']
        while time.time()-t0 < 1500:
            st = await pg.evaluate("""(()=>({eb:document.getElementById('taskEyebrow').textContent, go:!document.getElementById('goBtn').hidden && !document.getElementById('goBtn').disabled, pick:window.__hasPick&&window.__hasPick(), inp:!!document.getElementById('inp'), exp:window.__expect, call:window.__call, sum:!document.getElementById('summary').hidden}))()""")
            if st['sum']: break
            eb=st['eb']
            if eb not in shots and (st['inp'] or st['pick'] or st['go']):
                shots.add(eb); await pg.screenshot(path=f"/home/claude/habana/p-{len(shots)}.png"); log('SHOT', len(shots), eb)
            if st['pick']:
                if not stage['wrongpick']:
                    stage['wrongpick']=True; await pg.evaluate(f"window.__pick({(st['exp']+1)%12})"); log('wrong record on purpose'); await pg.wait_for_timeout(1500); continue
                await pg.evaluate(f"window.__pick({st['exp']})"); log('pick record', st['exp']); await pg.wait_for_timeout(1500); continue
            if st['go']: log('go', eb); await jclick('#goBtn'); await pg.wait_for_timeout(1500); continue
            if st['inp'] and eb.startswith('Misión 1') and stage['q'] < len(QS):
                q=QS[stage['q']]; stage['q']+=1; await send(q); await pg.wait_for_timeout(2500); log('Q', q, '=>', await fbtext()); continue
            if st['inp'] and eb.startswith('Misión 2') and not stage['sum']:
                G = await pg.evaluate("window.__radio.SHOW.guest")
                nums={2:'dos',3:'tres',4:'cuatro',5:'cinco',12:'doce',15:'quince',20:'veinte',25:'veinticinco',30:'treinta'}
                txt=f"{G['name']} ha grabado {nums[G['discos']]} discos. Ha tocado en {G['countries'][0]} y en {G['countries'][1]}. Ha escrito {nums[G['canciones']]} canciones. " + ("Ha ganado el premio Cubadisco." if G['premio'] else "Nunca ha ganado un premio.")
                stage['sum']=True; await send(txt); await pg.wait_for_timeout(2500); log('SUMMARY', txt, '=>', await fbtext()); continue
            if st['inp'] and eb.startswith('Misión 3') and st['call']:
                c=st['call']; key=c['id']; n=stage.setdefault('sent',{}).get(key,0)
                if n >= 2: await pg.wait_for_timeout(800); continue
                if not stage['wrongpron'] and not c['played']:
                    stage['wrongpron']=True; wrong={'la':'lo','lo':'la','los':'las','las':'los'}[c['pr']]; txt=f"Sí, {wrong} pongo ahora."
                else:
                    txt = f"Lo siento, ya {c['pr']} hemos puesto esta noche." if c['played'] else f"¡Claro! {c['pr'].capitalize()} pongo ahora mismo para tu abuela."
                stage['sent'][key]=n+1; await send(txt); await pg.wait_for_timeout(3000); log('CALL', c, txt, '=>', await fbtext()); continue
            if st['inp'] and 'reseña' in eb and not stage['rev']:
                C = await pg.evaluate("window.__radio.SHOW.concert")
                txt=f"Esta noche he visto a {C['band']} en el Malecón. Han tocado «{C['songs'][0]}» y «{C['songs'][2]}». A las nueve hemos escuchado el cañonazo y ha sido muy emocionante. " + ("El solo de trompeta me ha encantado." if C['extra']=='solo' else "Todo el público ha cantado con ellos.") + " Nunca he visto una banda tan buena. ¡Los recomiendo!"
                stage['rev']=True; await send(txt); await pg.wait_for_timeout(3000); log('REVIEW', txt, '=>', await fbtext()); continue
            await pg.wait_for_timeout(800)
        await pg.wait_for_timeout(2500)
        log('SUMMARY TEXT', (await pg.inner_text('#summary'))[:900].replace('\n',' | '))
        await pg.evaluate("(()=>{const n=document.getElementById('sgrName'); n.value='Ana Prueba'; n.dispatchEvent(new Event('input'));})()"); await pg.wait_for_timeout(400)
        code = await pg.inner_text('#sgrCode'); log('CODE', code, await pg.evaluate("c=>JSON.stringify(window.__report.decode(c,'Ana Prueba'))", code))
        el = await pg.query_selector('#summary'); await el.screenshot(path='/home/claude/habana/p-summary.png')
        log('ERR', errs); await b.close()
asyncio.run(main())
