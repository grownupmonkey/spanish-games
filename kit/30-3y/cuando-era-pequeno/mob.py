import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        ctx=await b.new_context(viewport={'width':390,'height':700},device_scale_factor=2,has_touch=True,is_mobile=True)
        pg=await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.route('**/fonts.g*/**', lambda r: r.abort())
        await pg.add_init_script('window.__testSpeed=0.03; window.__mute=true;')
        await pg.goto('file:///home/claude/out/cuando-era-pequeno.html')
        await pg.wait_for_timeout(800)
        await pg.screenshot(path='/home/claude/mshots/m_intro1.png')
        sh=await pg.evaluate("(()=>{const i=document.getElementById('intro');return [i.scrollHeight,i.clientHeight,getComputedStyle(i).position]})()")
        print('intro scroll/client/pos',sh)
        await pg.evaluate("document.getElementById('intro').scrollTo(0,99999)")
        await pg.wait_for_timeout(300)
        await pg.screenshot(path='/home/claude/mshots/m_intro2.png')
        vis=await pg.evaluate("(()=>{const r=document.getElementById('startBtn').getBoundingClientRect();return [r.top,r.bottom,innerHeight]})()")
        print('btn',vis)
        await pg.tap('#startBtn'); await pg.wait_for_timeout(2500)
        print('intro hidden', await pg.evaluate("document.getElementById('intro').hidden"))
        await pg.screenshot(path='/home/claude/mshots/m_scene.png')
        print(errs); await b.close()
asyncio.run(main())
