import pathlib, re
K = pathlib.Path('/home/claude/src/kit/parts')
B = pathlib.Path('/home/claude/build2')
sfx = (K/'sfx.js').read_text()
sfx = sfx[:sfx.index('const CAST = {')]   # keep SFX + Lucía portrait; the game has its own CAST
css = (K/'base.css').read_text() + '\n' + (K/'theme.css').read_text() + '\n' + (B/'game.css').read_text()
data = (B/'data.js').read_text()
page = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cuando era pequeño · Montevideo</title>
<meta name="sg-game" content="32">
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Unbounded:wght@500;600;700;800&display=swap">
<!-- ============================ GAME DATA (edit content here) ============================ -->
<script>
{data}
</script>
<!-- ============================ STYLES ============================ -->
<style>
{css}
</style>
</head>
<body>
{(K/'band.html').read_text()}
{(B/'body.html').read_text()}
<!-- ============================ ENGINE (no content below this line) ============================ -->
<script>
(() => {{
'use strict';
{sfx}
{(B/'art.js').read_text()}
{(B/'engine.js').read_text()}
document.getElementById('introFace').innerHTML = luciaSVG('happy');
}})();
</script>
</body>
</html>
"""
out = pathlib.Path('/home/claude/out/cuando-era-pequeno.html')
out.write_text(page)
print(len(page))
