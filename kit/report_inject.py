"""Add the end-of-session report (parts/report.css + parts/report.js) to a built game page.

build.py calls inject() for every 20-3Y scene. The 10-3Y pages were built before this kit,
so they are patched as finished pages:

    python3 report_inject.py <page.html> <game id> [out.html]     (default: overwrite)

Game ids (also in GAMES in parts/report.js): 10-3Y 1 primer-encuentro, 2 guadalajara,
3 guadalajara-3d, 4 pastel, 5 quehaceres, 6 maleta, 7 primer-dia, 8 fiesta, 9 alebrijes;
20-3Y 21-28 = s20-1 ... s20-8. Running it twice replaces the earlier copy.
"""
import pathlib
import re
import sys

PARTS = pathlib.Path(__file__).parent
START, END = '<!-- sg-report -->', '<!-- /sg-report -->'
OLD_NOTE = re.compile(r'\s*In the (site version|next build) this becomes the printable report with a save code\.?')


def inject(html, gid):
    css = (PARTS / 'report.css').read_text()
    js = (PARTS / 'report.js').read_text()
    html = re.sub(re.escape(START) + r'.*?' + re.escape(END) + r'\n?', '', html, flags=re.S)
    html = re.sub(r'<meta name="sg-game" content="\d+">\n?', '', html)
    html = OLD_NOTE.sub('', html)
    meta = f'<meta name="sg-game" content="{gid}">\n'
    m = re.search(r'</title>\n?', html)
    html = html[:m.end()] + meta + html[m.end():] if m else meta + html
    block = f'{START}\n<style>\n{css}</style>\n<script>\n{js}</script>\n{END}\n'
    i = html.rfind('</body>')
    return html[:i] + block + html[i:] if i >= 0 else html + block


if __name__ == '__main__':
    src, gid = pathlib.Path(sys.argv[1]), int(sys.argv[2])
    out = pathlib.Path(sys.argv[3]) if len(sys.argv) > 3 else src
    out.write_text(inject(src.read_text(), gid))
    print(f'{src.name} -> {out} (game {gid})')

