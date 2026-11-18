import pathlib, sys, os
GAMEFILE = os.environ.get('GAMEFILE', 'game.js')
sys.path.insert(0, '/home/claude/report')
from report_inject import inject
K = pathlib.Path('/home/claude/src/kit/parts')
B = pathlib.Path(__file__).parent
sfx = (K/'sfx.js').read_text(); SFXJS = sfx[:sfx.index('const CAST = {')]
css = (K/'base.css').read_text() + '\n' + (K/'theme.css').read_text() + '\n' + (B/'game.css').read_text()
page = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Radio Habana · La Habana</title>
<meta name="sg-game" content="34">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Unbounded:wght@500;600;700;800&display=swap">
<style>
{css}
</style>
</head>
<body>
{(K/'band.html').read_text()}
{(B/'body.html').read_text()}
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
(() => {{
'use strict';
{SFXJS}
{(B/'world.js').read_text()}
{(B/'ninots.js').read_text()}
{(B/'common.js').read_text()}
{(B/'scenes.js').read_text()}
{(B/GAMEFILE).read_text()}
}})();
</script>
</body>
</html>
"""
out = pathlib.Path(os.environ.get('OUT', '/home/claude/out/radio-habana.html'))
page = inject(page, 34)
out.write_text(page)
print(len(page))
