import pathlib, sys, os
sys.path.insert(0, '/home/claude/report')
from report_inject import inject
K = pathlib.Path('/home/claude/src/kit/parts'); B = pathlib.Path(__file__).parent
sfx = (K/'sfx.js').read_text(); SFXJS = sfx[:sfx.index('const CAST = {')]
css = (K/'base.css').read_text() + '\n' + (K/'theme.css').read_text() + '\n' + (B/'game.css').read_text()
js = SFXJS + ''.join((B/f).read_text() for f in ['g_head.js', 'g_lang.js', 'g_ui.js', 'data.js', 'art.js', 'g_main.js'])
page = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Se busca · Barcelona</title>
<meta name="sg-game" content="36">
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
<script>
(() => {{
'use strict';
{js}
}})();
</script>
</body>
</html>
"""
page = inject(page, 36)
out = pathlib.Path(os.environ.get('OUT', '/home/claude/out/se-busca.html'))
out.write_text(page); print(len(page))
