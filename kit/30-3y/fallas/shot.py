import asyncio
from playwright.async_api import async_playwright
THREE = '/home/claude/vendor/node_modules/three/build/three.min.js'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        pg = await b.new_page(viewport={'width': 1440, 'height': 1000})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
        await pg.route('**/fonts.*/**', lambda r: r.abort())
        await pg.route('**/three.min.js', lambda r: r.fulfill(path=THREE, content_type='application/javascript'))
        await pg.add_init_script('window.__mute = true; window.__timeScale = 6;')
        await pg.goto('file:///home/claude/out/fallas-prototipo.html')
        await pg.wait_for_timeout(2500)
        await pg.screenshot(path='/home/claude/fallas/s1.png')
        await pg.evaluate("0")
        await pg.wait_for_timeout(4200)
        await pg.screenshot(path='/home/claude/fallas/s2a.png')
        await pg.wait_for_timeout(5000)
        await pg.screenshot(path='/home/claude/fallas/s2.png')
        await pg.evaluate("document.getElementById('showText').click(); window.__fallas.openGem(window.__fallas.GEMS[1])")
        await pg.wait_for_timeout(500)
        await pg.screenshot(path='/home/claude/fallas/s3.png')
        for name, js in [('c1', "Object.assign(window.__orbit,{tR:46,r:46,tPh:1.25,ph:1.25,tTh:.2,th:.2}); window.__orbit.target.set(0,26,0)"),
                         ('c2', "Object.assign(window.__orbit,{tR:30,r:30,tPh:1.32,ph:1.32,tTh:.9,th:.9}); window.__orbit.target.set(6,10,6)"),
                         ('c3', "Object.assign(window.__orbit,{tR:26,r:26,tPh:1.15,ph:1.15,tTh:2.6,th:2.6}); window.__orbit.target.set(0,22,0)"),
                         ('c4', "Object.assign(window.__orbit,{tR:22,r:22,tPh:1.25,ph:1.25,tTh:0,th:0}); window.__orbit.target.set(0,30,0)"),
                         ('c5', "Object.assign(window.__orbit,{tR:20,r:20,tPh:1.3,ph:1.3,tTh:-1.0,th:-1.0}); window.__orbit.target.set(-6,18,6)")]:
            await pg.evaluate("document.getElementById('gemClose').click();" + js)
            await pg.wait_for_timeout(1500)
            await pg.screenshot(path=f'/home/claude/fallas/{name}.png', clip={'x':96,'y':328,'width':1248,'height':620})
        print('ERR', errs)
        await b.close()
asyncio.run(main())
