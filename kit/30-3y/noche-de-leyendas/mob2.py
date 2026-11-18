import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        ctx=await b.new_context(viewport={'width':390,'height':600},device_scale_factor=2,has_touch=True,is_mobile=True)
        pg=await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.route('**/fonts.g*/**', lambda r: r.abort())
        await pg.add_init_script('window.__testSpeed=0.03; window.__mute=true;')
        await pg.goto('file:///home/claude/out/noche-de-leyendas.html')
        await pg.evaluate("document.getElementById('intro').hidden=true")
        await pg.evaluate("window.__noche.state.run=window.__noche.buildRun()")
        await pg.evaluate("window.__noche.setText(true)")
        await pg.evaluate("""(()=>{const g=document.getElementById('gemPop');
          g.innerHTML='<p class="eyebrow">Dato de Antigua</p><h3>El Hermano Pedro</h3><p class="es-text es">'+'Hermano Pedro cuidaba a los enfermos y a los pobres. '.repeat(4)+'</p><p class="en">'+'Hermano Pedro cared for the sick and poor; he became the first saint. '.repeat(4)+'</p><div class="row"><button class="btn ghost small">Escuchar</button><button class="btn primary small" id="gemClose">Cerrar</button></div>'; g.hidden=false;})()""")
        await pg.wait_for_timeout(300)
        r=await pg.evaluate("(()=>{const g=document.getElementById('gemPop');const c=document.getElementById('gemClose').getBoundingClientRect();return [getComputedStyle(g).position,g.scrollHeight,g.clientHeight,c.bottom,innerHeight]})()")
        print(r)
        await pg.screenshot(path='/home/claude/shots/m_gem.png')
        print(errs); await b.close()
asyncio.run(main())
