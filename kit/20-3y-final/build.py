"""Stitch the shared parts and a scene into one self-contained game page.

  kit/parts/   head.html base.css theme.css band.html sfx.js base.js figures.js hooks.js
  kit/scenes/  <id>.html <id>.css <id>.js   (scene page body, styles, script)
  The end-of-session report (parts/report.css + report.js) is added by report_inject.py.

Usage:  python3 build.py s20-1            -> out/s20-1.html
        python3 build.py                   -> every scene in SCENES
"""
import pathlib
import sys

from report_inject import inject

KIT = pathlib.Path(__file__).parent
PARTS, SCENES_DIR, OUT = KIT / 'parts', KIT / 'scenes', KIT / 'out'

# id: (page title, output file name, uses figures.js, report game id)
SCENES = {
    's20-1': ('Otra vez tarde', 'otra-vez-tarde.html', True, 21),
    's20-2': ('¿Quedamos?', 'quedamos.html', True, 22),
    's20-3': ('El mercado', 'el-mercado.html', True, 23),
    's20-4': ('¿Moda o no moda?', 'moda.html', True, 24),
    's20-5': ('¡Gol!', 'gol.html', True, 25),
    's20-6': ('La farmacia de guardia', 'la-farmacia.html', True, 26),
    's20-7': ('Conexión perdida', 'conexion-perdida.html', True, 27),
    's20-8': ('Mismo idioma, otro mundo', 'mismo-idioma.html', True, 28),
    's20-9': ('Las siete ciudades de oro', 'las-siete-ciudades.html', True, 29),
}


def scene_js(sid):
    d = SCENES_DIR / sid
    if d.is_dir():  # a big scene can be split into numbered files
        return '\n\n'.join(f.read_text() for f in sorted(d.glob('*.js')))
    return (SCENES_DIR / f'{sid}.js').read_text()


def part(name):
    return (PARTS / name).read_text()


def build(sid):
    title, outname, figures, gid = SCENES[sid]
    head = part('head.html').replace('<title>El taller de alebrijes</title>', f'<title>{title}</title>')
    css = part('base.css') + '\n/* ---- scene ---- */\n' + (SCENES_DIR / f'{sid}.css').read_text() + '\n\n' + part('theme.css')
    js = part('sfx.js') + '\n' + part('base.js') + '\n\n/* ===================== Scene ===================== */\n'
    if figures:
        js += part('figures.js') + '\n\n'
    js += scene_js(sid) + '\n\n' + part('hooks.js')
    page = (head + '<style>\n' + css + '</style>\n\n' + part('band.html') + (SCENES_DIR / f'{sid}.html').read_text()
            + "\n<script>\n(() => {\n'use strict';\n" + js + '\n})();\n</script>\n')
    page = inject(page, gid)
    if not page.lstrip().lower().startswith('<!doctype'):
        page = '<!DOCTYPE html>\n<html lang="es">\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' + page
    OUT.mkdir(exist_ok=True)
    (OUT / outname).write_text(page)
    print(f'{sid} -> out/{outname} ({len(page):,} bytes)')


for sid in (sys.argv[1:] or SCENES):
    build(sid)
