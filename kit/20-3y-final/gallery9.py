"""Render every city scene (and the map) for a visual check: python3 gallery9.py <page> <out>"""
import sys
from playwright.sync_api import sync_playwright
page_path, out = sys.argv[1], sys.argv[2]
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1280, 'height': 900}, device_scale_factor=2)
    pg.route('https://fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto('file://' + page_path); pg.wait_for_timeout(300)
    pg.evaluate("document.getElementById('intro').hidden = true")
    ids = pg.evaluate("Object.keys(__scene.CITIES)")
    for id in ids + ['lethbridge']:
        pg.evaluate(f"document.getElementById('sceneSvg').innerHTML = citySVGtest('{id}')")
        pg.locator('#sceneSvg').screenshot(path=f'{out}/c-{id}.png')
    b.close()
