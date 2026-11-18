import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1440, 'height': 1000})
        errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.route('**/fonts.*/**', lambda r: r.abort())
        await pg.add_init_script('window.__testSpeed = 0.03; window.__mute = true;')
        await pg.goto('file:///home/claude/out/cuando-era-pequeno.html')
        await pg.wait_for_timeout(400)
        await pg.evaluate("document.getElementById('intro').hidden = true")
        async def scene(props, t, who, lm=None, step=None, name=''):
            await pg.evaluate(f"(()=>{{const N=window.__noche; N.renderScene('{props}',{t},{repr(lm) if lm else 'null'}); N.showSpeaker(N.CAST.{who}); }})()")
            await pg.wait_for_timeout(500)
            await pg.screenshot(path=f'/home/claude/sh/{name or props}.png', clip={'x':20,'y':290,'width':1400,'height':560})
        import os; os.makedirs('/home/claude/sh', exist_ok=True)
        for props, t, who in [('bus',0,'DRIVERS[0]'),('plaza',1,'ABUELAS[0]'),('park',2,'ABUELOS[0]'),('kiosco',1,'KIOSQUEROS[0]'),('confiteria',2,'CONFITERAS[0]'),('candombe',3,'TAMBOREROS[0]'),('escuela',2,'MAESTRAS[0]'),('casa',4,'HOSTS.hugo')]:
            await scene(props,t,who, 'salvo' if props=='bus' else None)
        # hop UI
        await pg.evaluate("""(()=>{const N=window.__noche; N.renderScene('plaza',1); const w=N.CAST.ABUELAS[0]; N.showSpeaker(w); window.__p=N.STEPS.hop({task:'Listen and tap the squares.',rounds:2},{vars:{},who:w,sc:{},pen(){}}); })()""")
        await pg.wait_for_timeout(900)
        await pg.screenshot(path='/home/claude/sh/hop-ui.png')
        await pg.evaluate("""(()=>{const N=window.__noche; const ex=N.state.testExpect; ex.forEach(n=>document.querySelector('#ia .hsq[data-n="'+n+'"]').click()); })()""")
        await pg.wait_for_timeout(1200)
        await pg.screenshot(path='/home/claude/sh/hop-ui2.png')
        await pg.reload(); await pg.wait_for_timeout(400)
        await pg.evaluate("document.getElementById('intro').hidden = true")
        await pg.evaluate("""(()=>{const N=window.__noche; N.renderScene('park',2); const w=N.CAST.ABUELOS[0]; N.showSpeaker(w); window.__p=N.STEPS.hide({task:'Listen to the clue and click where the child is hiding.',rounds:2},{vars:{},who:w,sc:{},pen(){}}); })()""")
        await pg.wait_for_timeout(900)
        await pg.screenshot(path='/home/claude/sh/hide-ui.png')
        print('ERR', errs)
        await b.close()
asyncio.run(main())
