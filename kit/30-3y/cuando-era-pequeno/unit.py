import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page()
        await pg.route('**/fonts.g*/**', lambda r: r.abort())
        await pg.goto('file:///home/claude/out/noche-de-leyendas.html')
        r = await pg.evaluate('''() => { const N = window.__noche; const A = (t,p) => { const a = N.analyzePast(t,p); return {pret:a.pret, imp:a.imp, pretYo:a.pretYo, slips:a.slips.map(s=>s.wrote+'>'+s.fix), pres:a.present.map(s=>s.wrote+'>'+s.fix), acc:a.accents.map(s=>s.wrote+'>'+s.fix), paMiss:a.pa.missing.map(m=>m.fix), paOk:a.pa.ok}; };
          return {
            a: A('Primero fui al mercado y compre un regalo. Despues comí en un comedor y camine por la calle.', 'yo'),
            b: A('Yo fue al parque y yo comió pepián. Voy a la posada.', 'yo'),
            c: A('El perro blanco llego y vio la muchacha. Ella hació un dibujo y teneó miedo. El perro corre a la casa.', 'any'),
            d: A('Era pequeña y negra. Tenía mi pasaporte adentro.', 'yo'),
            e: A('Celestina murió y el Sombrerón lloró. Estaba muy triste. Vio a Celestina en la ventana.', 'any'),
            n: [N.parseNums('treinta y cinco'), N.parseNums('Q45'), N.parseNums('me lo deja en ciento veinte?'), N.parseNums('sesenta y dos quetzales')],
            dirs: N.makeDirections({col:3,row:4}, 'el Parque Central', 'la farmacia').lines
          }; }''')
        for k,v in r.items(): print(k, json.dumps(v, ensure_ascii=False))
        await b.close()
asyncio.run(main())
