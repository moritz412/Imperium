#!/usr/bin/env python3
"""Baut den Ableger „Limes“ (Tower Defense) aus dev/limes/limes.html nach limes/ in der Repo-Wurzel (GitHub Pages).
Die Quelldatei ist zugleich die claude.ai-Artifact-Fassung (ohne <head>). Hier bekommt sie Kopf, Manifest, Icon,
Service Worker und lokale Kopien von Three.js r128 (offline spielbar).
Aufruf (im Repo-Wurzelordner):  python dev/tools/deploy_limes.py   – deploy.py ruft es am Ende mit auf.
"""
import os, shutil, hashlib, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'dev', 'limes')
DST = os.path.join(ROOT, 'limes')
HEAD = '''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<meta name="theme-color" content="#231519">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Limes">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<link rel="icon" type="image/png" href="icons/favicon-64.png">
<link rel="stylesheet" href="../fonts/fonts.css">
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);box-sizing:border-box;height:100%}
*,*::before,*::after{box-sizing:inherit}body{margin:0;font:14px system-ui,sans-serif;-webkit-text-size-adjust:100%;overscroll-behavior:none}
img{max-width:100%}[hidden]{display:none!important}</style>
'''
TAIL = '''<script>if('serviceWorker' in navigator) addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));</script>
</body>
</html>
'''
def bauen():
    if not os.path.isfile(os.path.join(SRC, 'limes.html')):
        return
    src = open(os.path.join(SRC, 'limes.html'), encoding='utf-8').read()
    # CDN-Skripte durch lokale Kopien ersetzen
    src = src.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'lib/three.min.js')
    src = re.sub(r'https://cdn\.jsdelivr\.net/npm/three@0\.128\.0/examples/js/(?:shaders|postprocessing)/', 'lib/', src)
    # Titel in den Kopf, Rest in den Body
    m = re.search(r'<title>.*?</title>\s*', src, re.S)
    title = m.group(0) if m else '<title>Limes</title>\n'
    if m: src = src[:m.start()] + src[m.end():]
    src = src.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '')
    html = HEAD + title + '</head>\n<body>\n' + src + '\n' + TAIL
    if os.path.exists(DST): shutil.rmtree(DST)
    os.makedirs(DST)
    for d in ('icons', 'lib'):
        shutil.copytree(os.path.join(SRC, d), os.path.join(DST, d))
    shutil.copy(os.path.join(SRC, 'manifest.webmanifest'), DST)
    ver = hashlib.sha1(html.encode('utf-8')).hexdigest()[:10]
    open(os.path.join(DST, 'index.html'), 'w', encoding='utf-8').write(html)
    sw = open(os.path.join(SRC, 'sw.js'), encoding='utf-8').read().replace('__VER__', ver)
    open(os.path.join(DST, 'sw.js'), 'w', encoding='utf-8').write(sw)
    return ver

if __name__ == '__main__':
    v = bauen()
    print('Limes nach limes/ gebaut (Version %s). Jetzt: git add -A && git commit -m "..." && git push' % v)
