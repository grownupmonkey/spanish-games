import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1300,'height':800})
        await pg.route('**/fonts.g*/**', lambda r: r.abort())
        await pg.goto('file:///home/claude/out/noche-de-leyendas.html')
        await pg.evaluate("document.getElementById('intro').hidden=true")
        for pr,t in [('tuktuk',0),('comedor',1),('market',2),('buses',2),('posada',3),('cafe',3),('arch',4),('park',1)]:
            await pg.evaluate(f"window.__noche.renderScene('{pr}',{t})"); await pg.wait_for_timeout(1100)
            await pg.locator('#viewport').screenshot(path=f'/home/claude/shots/s-{pr}.png')
        await b.close()
asyncio.run(main())
