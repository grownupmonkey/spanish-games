import asyncio
from playwright.async_api import async_playwright
THREE='/home/claude/vendor/node_modules/three/build/three.min.js'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        pg=await b.new_page(viewport={'width':1200,'height':1400}); errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)+' '+(e.stack or '')[:300]))
        await pg.route('**/fonts.*/**',lambda r:r.abort())
        await pg.route('**/three.min.js',lambda r:r.fulfill(path=THREE,content_type='application/javascript'))
        await pg.add_init_script('window.__mute=true; window.__timeScale=15; window.__testSpeed=0.04;')
        await pg.goto('file:///home/claude/out/fallas.html'); await pg.wait_for_timeout(2500)
        await pg.screenshot(path='/home/claude/fallas-game/p-intro.png')
        await pg.evaluate("""(()=>{const G=window.__fallasGame; document.getElementById('intro').hidden=true;
          G.session={started:Date.now()-14*60000,textShown:false,textReason:'',missions:[],writing:[{scene:'Mensaje a la familia',text:'El martes por la tarde iremos a la mascletà…'}],transcript:[],stats:{messages:3,replays:7,slow:1,hints:0,misses:2},
            events:[{act:'mascleta',day:'martes',part:'tarde'},{act:'ofrenda',day:'miércoles',part:'tarde'},{act:'luces',day:'miércoles',part:'noche'},{act:'bunyols',day:'jueves',part:'tarde'},{act:'crema',day:'viernes',part:'noche'}],
            details:{futVerbs:4,futSlips:0,weekMisses:2,cousins:{rx:/quiosco/},ninot:{rx:/naranja/},bouquet:{rx:/blanc|verde/},order:[['un chocolate',2.8,/chocolate/],['seis buñuelos',3.5,/bu[nñ]uelo/]]}};
          G.finishMission('plan',3); G.finishMission('mensaje',3); G.finishMission('semana',2);
          G.missionBlog().then(()=>G.endSession());})()""")
        await pg.wait_for_selector('#inp', timeout=60000)
        blog='El martes por la tarde fuimos a la mascletà y encontramos a Jordi y Laia al lado del quiosco. El miércoles por la tarde llevé mi ramo de claveles blancos a la ofrenda. Esa noche vimos las luces del barrio y voté por el ninot que tenía una naranja. El jueves comimos buñuelos y la abuela pidió un chocolate. El viernes quemaron la falla y fue increíble.'
        await pg.evaluate("v=>{document.getElementById('inp').value=v; document.getElementById('sendBtn').click();}", blog)
        await pg.wait_for_selector('#summary:not([hidden])', timeout=60000); await pg.wait_for_timeout(1500)
        print('FB', (await pg.inner_text('#fbs')).replace('\n',' | ')[:600])
        await pg.evaluate("(()=>{const n=document.getElementById('sgrName'); n.value='Ana Prueba'; n.dispatchEvent(new Event('input'));})()")
        await pg.wait_for_timeout(400)
        code = await pg.inner_text('#sgrCode'); print('CODE', code)
        print('DECODE', await pg.evaluate("c=>JSON.stringify(window.__report.decode(c,'Ana Prueba'))", code))
        print('TEAMS', await pg.evaluate("window.__report.teamsText()"))
        el = await pg.query_selector('#summary'); await el.screenshot(path='/home/claude/fallas-game/p-summary.png')
        print('ERR', errs); await b.close()
asyncio.run(main())
