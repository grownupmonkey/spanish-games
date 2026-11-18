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
        await pg.evaluate("window.__fallas.startMascleta()")
        await pg.wait_for_timeout(4200)
        await pg.screenshot(path='/home/claude/fallas/s2a.png')
        await pg.wait_for_timeout(5000)
        await pg.screenshot(path='/home/claude/fallas/s2.png')
        await pg.evaluate("document.getElementById('showText').click(); window.__fallas.openGem(window.__fallas.GEMS[1])")
        await pg.wait_for_timeout(500)
        await pg.screenshot(path='/home/claude/fallas/s3.png')
        print('ERR', errs)
        await b.close()
asyncio.run(main())
