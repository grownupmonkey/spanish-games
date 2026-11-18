import asyncio, sys
from playwright.async_api import async_playwright
THREE='/home/claude/vendor/node_modules/three/build/three.min.js'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':1100,'height':900}); errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)+' '+(e.stack or '')[:300]))
        await pg.route('**/fonts.*/**',lambda r:r.abort())
        await pg.route('**/three.min.js',lambda r:r.fulfill(path=THREE,content_type='application/javascript'))
        await pg.add_init_script('window.__mute=true; window.__timeScale=6;')
        await pg.goto('file:///home/claude/out/fallas-prototipo.html'); await pg.wait_for_timeout(2500)
        if __import__('os').environ.get('THEMES'): await pg.evaluate("(()=>{const F=window.__fallas; F.STATE.theme='planeta'; F.STATE.street='comer'; F.STATE.infantil='suenos'; Object.keys(F.BUILT).forEach(k=>{F.BUILT[k].group.parent.remove(F.BUILT[k].group); delete F.BUILT[k];});})()")
        clip=None
        for k in sys.argv[1:]:
            if ':' in k:
                k, js = k.split(':',1)
            else: js=''
            await pg.evaluate(f"window.__fallas.enterScene('{k}')"); await pg.wait_for_timeout(1500)
            if js: await pg.evaluate(js); await pg.wait_for_timeout(int(js.split('//')[-1]) if '//' in js else 1500)
            ft = await pg.evaluate("new Promise(r=>{const t0=performance.now();requestAnimationFrame(()=>requestAnimationFrame(()=>r(Math.round((performance.now()-t0)/2))))})"); info = await pg.evaluate("(()=>{const r=window.__renderer.info.render; return [r.calls, r.triangles]})()"); print(k,'frame ms',ft,'calls/tris',info, flush=True); await pg.screenshot(path=f'/home/claude/fallas/x-{k}.png', full_page=False, timeout=180000)
            for extra in range(int(__import__('os').environ.get('EXTRA','0'))):
                await pg.wait_for_timeout(40000); await pg.screenshot(path=f'/home/claude/fallas/x-{k}-{extra}.png', timeout=180000)
        print('ERR', errs); await b.close()
asyncio.run(main())
