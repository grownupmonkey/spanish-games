import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1440,'height':1000})
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.route('**/fonts.g*/**', lambda r: r.abort())
        await pg.add_init_script('window.__testSpeed=0.03; window.__mute=true;')
        await pg.goto('file:///home/claude/out/noche-de-leyendas.html')
        await pg.click('#startBtn')
        for _ in range(200):
            await pg.wait_for_timeout(150)
            if await pg.query_selector('#goBtn'): break
            if await pg.query_selector('#ia .choice:not([disabled])'): await (await pg.query_selector('#ia .choice:not([disabled])')).click()
            if await pg.query_selector('#inp'):
                await pg.click('#helpBtn'); await pg.click('#helpBtn')
                c=await pg.query_selector('#ia .acard:not(.wrongpick) .achoose')
                if c: await c.click()
                st=await pg.evaluate('(window.__noche.state.step||{}).type')
                if st=='num':
                    a=await pg.evaluate('String(window.__noche.tpl(window.__noche.state.step.answer, window.__noche.state.ctx.vars))'); await pg.fill('#inp',a); await pg.click('#sendBtn')
        await pg.wait_for_timeout(1500)
        await pg.locator('#stage').screenshot(path='/home/claude/shots/map.png')
        await pg.evaluate("window.__noche.setText(true)")
        await pg.evaluate("document.querySelector('#sceneLayer').hidden=false; document.querySelector('#mapLayer').hidden=true")
        print(errs); await b.close()
asyncio.run(main())
