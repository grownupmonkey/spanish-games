"""Full playthrough of Las siete ciudades de oro with screenshots.
usage: python3 shots9.py <abs page> <abs out dir> [wrong_flights] [width]"""
import re, sys
from playwright.sync_api import sync_playwright

page_path, out = sys.argv[1], sys.argv[2]
WRONG = int(sys.argv[3]) if len(sys.argv) > 3 else 1
WIDTH = int(sys.argv[4]) if len(sys.argv) > 4 else 1280
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width': WIDTH, 'height': 1000}, device_scale_factor=1)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type == 'error' else None)
    pg.add_init_script('window.__testSpeed = 0.05;')
    pg.route('https://fonts.googleapis.com/**', lambda r: r.abort())
    pg.route('https://cdnjs.cloudflare.com/**', lambda r: r.fulfill(path='/home/claude/kit/tests/three.min.js') if 'three' in r.request.url else r.abort())
    pg.goto('file://' + page_path)
    pg.wait_for_timeout(300)
    pg.screenshot(path=f'{out}/00-intro.png')
    pg.click('#startBtn')
    idle = lambda: pg.wait_for_function('!__scene.S.busy', timeout=30000)
    pg.wait_for_timeout(600)
    pg.screenshot(path=f'{out}/01-attic.png')
    pg.click('#sceneSvg .hot.seal .ring', force=True)
    for i in range(3):
        pg.wait_for_selector('.gemcard .btn.primary', timeout=10000)
        pg.wait_for_timeout(150)
        if i == 0: pg.screenshot(path=f'{out}/02-letter.png')
        pg.click('.gemcard .btn.primary')
    pg.wait_for_function("document.querySelector('#actions .choice')", timeout=20000)
    pg.wait_for_timeout(300)
    pg.screenshot(path=f'{out}/03-clues.png')

    def fly(correct=True, shot=None):
        pg.locator('#actions .choice', has_text=re.compile(r'(Ir|Volver) al aeropuerto')).click()
        pg.wait_for_selector('#sceneSvg .pin', timeout=5000)
        if shot: pg.screenshot(path=shot)
        if correct:
            dest = pg.evaluate('__scene.S.G.legs[__scene.S.leg].id')
        else:
            dest = pg.evaluate('__scene.S.flightOpts.list.find(id => id !== __scene.S.G.legs[__scene.S.leg].id)')
        pg.click(f'#sceneSvg .pin[data-city="{dest}"] .halo', force=True)
        pg.wait_for_timeout(200)
        idle()
        return dest

    fly(True, f'{out}/04-map.png')
    for stop in range(7):
        pg.wait_for_function("__scene.S.phase === 'city' || __scene.S.phase === 'end'", timeout=20000)
        if pg.evaluate("__scene.S.phase") == 'end': break
        pg.wait_for_timeout(400)
        city = pg.evaluate('__scene.S.G.route[__scene.S.i]')
        # ¿Te acuerdas?: answer right on even stops
        if pg.evaluate("!__scene.S.remDone"):
            pg.wait_for_function("[...document.querySelectorAll('#actions .choice')].length >= 3", timeout=10000)
            right = pg.evaluate("__scene.CITIES[__scene.S.G.route[__scene.S.i]].remember.opts[0]")
            if stop % 2 == 0: pg.locator('#actions .choice', has_text=right).first.click()
            else: pg.locator('#actions .choice', has_text='Saltar').click()
            pg.wait_for_timeout(200)
        for k in range(3):
            pg.click(f'#sceneSvg .wit[data-wit="{k}"] .ring', force=True)
            pg.wait_for_timeout(100)
            idle()
        pg.click('#sceneSvg .gem .ring', force=True)
        pg.wait_for_timeout(200)
        pg.screenshot(path=f'{out}/10-{stop}-{city}.png')
        pg.click('.gemcard .btn.primary')
        pg.click('#sceneSvg .hot.seal .ring', force=True)
        pg.wait_for_timeout(300)
        pg.screenshot(path=f'{out}/11-{stop}-{city}-puzzle.png')
        pg.evaluate('window.__pzSolve()')
        pg.wait_for_selector('.gemcard.letter', timeout=10000)
        pg.wait_for_timeout(200)
        pg.screenshot(path=f'{out}/12-{stop}-{city}-letter.png')
        pg.click('.gemcard .btn.primary')
        idle()
        if stop < WRONG:
            fly(False)
            pg.wait_for_timeout(300)
            pg.screenshot(path=f'{out}/13-{stop}-wrong.png')
        fly(True)
    pg.wait_for_function("__scene.S.phase === 'warrant' || __scene.S.phase === 'end'", timeout=30000)
    if pg.evaluate("__scene.S.phase") == 'warrant':
        pg.wait_for_timeout(300)
        pg.screenshot(path=f'{out}/20-granada.png', full_page=True)
        c = pg.evaluate('__scene.S.G.culprit')
        other = (c + 1) % 5
        pg.click(f'.sus[data-i="{other}"]')
        pg.wait_for_timeout(300)
        pg.click(f'.sus[data-i="{c}"]')
        pg.wait_for_function("__scene.S.phase === 'duel' && document.querySelector('#puzzle .ecard')", timeout=20000)
        pg.wait_for_timeout(300)
        pg.screenshot(path=f'{out}/21-duel.png')
        for ci in range(4):
            pg.wait_for_function(f"__scene.S.finale.ci === {ci} && !__scene.S.busy && document.querySelector('#puzzle .ecard')", timeout=20000)
            if ci == 1:  # one wrong card first
                bad = pg.evaluate("__scene.S.cards.findIndex(c => !__scene.S.finale.claims[__scene.S.finale.ci].ok(c))")
                pg.click(f'#puzzle .ecard[data-i="{bad}"]')
                pg.wait_for_timeout(200)
            good = pg.evaluate("__scene.S.cards.findIndex(c => __scene.S.finale.claims[__scene.S.finale.ci].ok(c))")
            pg.click(f'#puzzle .ecard[data-i="{good}"]')
            if ci == 0:
                pg.wait_for_timeout(150)
                pg.screenshot(path=f'{out}/22-protesto.png')
            pg.wait_for_timeout(200)
        pg.wait_for_function("__scene.S.phase === 'lock'", timeout=30000)
        pg.wait_for_timeout(300)
        pg.screenshot(path=f'{out}/23-lock.png')
        for k in range(7):
            sid = pg.evaluate(f"__scene.S.finale.slots[{k}].id")
            pg.click(f'#puzzle .sealbtn[data-id="{sid}"]')
            pg.click(f'#puzzle .slot[data-k="{k}"]')
            pg.wait_for_timeout(60)
        pg.wait_for_selector('.gemcard.letter', timeout=10000)
        pg.wait_for_timeout(200)
        pg.screenshot(path=f'{out}/24-lastletter.png')
        pg.click('.gemcard .btn.primary')
        pg.wait_for_selector('.gemcard .btn.primary', timeout=5000)
        pg.click('.gemcard .btn.primary')
        pg.wait_for_selector('#cine canvas, #cine svg', timeout=15000)
        pg.wait_for_timeout(2500)
        pg.screenshot(path=f'{out}/25-cine-a.png')
        pg.wait_for_function("__scene.S.phase === 'end'", timeout=60000)
    pg.wait_for_timeout(600)
    pg.locator('#summary').screenshot(path=f'{out}/30-summary.png')
    print('phase', pg.evaluate('__scene.S.phase'), 'won', pg.evaluate('__scene.S.won'), 'hours left', pg.evaluate('156 - __scene.S.t'), 'stars', pg.evaluate('__scene.S.stopStars'))
    print('ERRORS:', errs[:12])
    b.close()
