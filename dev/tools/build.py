#!/usr/bin/env python3
"""Baut die eigenständige Web-App (PWA) aus der einen Quelldatei imperium.html.

Aufruf:  python3 build.py [pfad/zu/imperium.html] [--assets /home/claude] [--out site]
Ergebnis: site/ (für GitHub Pages, Branch main, Ordner /) und imperium_pwa.zip

Dateiliste der Spieldaten = OFF_MAN im Code (dieselbe Liste wie der Reisemodus der Artifact-Fassung).
"""
import argparse, hashlib, json, os, re, shutil, sys, zipfile
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
ap.add_argument('src', nargs='?', default=os.path.join(HERE, '..', 'imperium.html'))
ap.add_argument('--assets', default='/home/claude')
ap.add_argument('--out', default=os.path.join(HERE, 'site'))
ap.add_argument('--zip', default=os.path.join(HERE, 'imperium_pwa.zip'))
ap.add_argument('--fonts', default=os.path.join(HERE, 'fontsrc'))
A = ap.parse_args()

NAME = 'Imperium der Epochen 2'
SHORT = 'Imperium'
THEME = '#1b150f'
BG = '#0e0b08'
GH_LIMIT = 100 * 1024 * 1024

src = open(A.src, encoding='utf-8').read()
m = re.search(r"const OFF_MAN=(\[.*?\]\]),OFF_VER='([^']*)'", src)
if not m:
    sys.exit('OFF_MAN nicht gefunden')
MAN = json.loads(m.group(1))
OFF_VER = m.group(2)
vm = re.search(r"\bv(\d{3})\b", src[:20000])

# ---------- Ausgabeordner ----------
if os.path.exists(A.out):
    shutil.rmtree(A.out)
os.makedirs(A.out)

def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()[:16]

# ---------- Spieldaten ----------
H = {}
missing = []
for p, size in MAN:
    s = os.path.join(A.assets, p)
    if not os.path.exists(s):
        missing.append(p); continue
    if os.path.getsize(s) != size:
        print('Warnung: Größe weicht von OFF_MAN ab:', p, os.path.getsize(s), size)
    d = os.path.join(A.out, p)
    os.makedirs(os.path.dirname(d), exist_ok=True)
    shutil.copy2(s, d)
    H[p] = sha(d)
if missing:
    sys.exit('Fehlende Dateien: ' + ', '.join(missing))

# ---------- Schriften (lokal, SIL OFL) ----------
FONTS = [('Marcellus', 400, 'fontsource-marcellus-5.3.0/files/marcellus-latin-400-normal.woff2')] + \
        [('Alegreya Sans', w, f'fontsource-alegreya-sans-5.3.0/files/alegreya-sans-latin-{w}-normal.woff2') for w in (400, 500, 700, 800)]
font_css = []
font_files = []
have_fonts = all(os.path.exists(os.path.join(A.fonts, f)) for _, _, f in FONTS)
os.makedirs(os.path.join(A.out, 'fonts'))
if have_fonts:
    for fam, w, f in FONTS:
        bn = os.path.basename(f)
        shutil.copy2(os.path.join(A.fonts, f), os.path.join(A.out, 'fonts', bn))
        font_files.append('fonts/' + bn)
        font_css.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};font-display:swap;src:url({bn}) format('woff2');}}")
    for pkg in ('fontsource-marcellus-5.3.0', 'fontsource-alegreya-sans-5.3.0'):
        shutil.copy2(os.path.join(A.fonts, pkg, 'LICENSE'), os.path.join(A.out, 'fonts', pkg.split('-', 1)[1].rsplit('-', 1)[0] + '-OFL.txt'))
else:
    print('Hinweis: Schriften nicht gefunden, Systemschrift als Rückfall')
open(os.path.join(A.out, 'fonts', 'fonts.css'), 'w').write('\n'.join(font_css) + '\n')

# ---------- Icons aus dem Lorbeer-Wappen ----------
try:
    crest = Image.open(os.path.join(A.assets, 'img/ui_reich.webp')).convert('RGBA')
except Exception:
    crest = Image.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app_icon.png')).convert('RGBA')
APPICON = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app_icon.png')
def icon(sz, pad=0.12):
    if os.path.exists(APPICON):
        src = Image.open(APPICON).convert('RGB')
        if pad <= 0.12:
            return src.resize((sz, sz), Image.LANCZOS)
        im = Image.new('RGB', (sz, sz), '#2c2a22')
        c = int(sz * (1 - 2 * (pad - 0.12)))
        im.paste(src.resize((c, c), Image.LANCZOS), ((sz - c) // 2, (sz - c) // 2))
        return im
    im = Image.new('RGBA', (sz, sz), BG)
    g = Image.new('L', (sz, sz), 0)
    ImageDraw.Draw(g).ellipse((-sz * .2, -sz * .2, sz * 1.2, sz * 1.2), fill=255)
    g = g.filter(ImageFilter.GaussianBlur(sz * .18))
    im = Image.composite(Image.new('RGBA', (sz, sz), '#3a2a18'), im, g)
    c = int(sz * (1 - 2 * pad))
    cr = crest.resize((c, c), Image.LANCZOS)
    im.alpha_composite(cr, ((sz - c) // 2, (sz - c) // 2))
    return im.convert('RGB')
os.makedirs(os.path.join(A.out, 'icons'))
ICONS = {}
for sz in (180, 192, 512):
    pth = f'icons/icon-{sz}.png'
    icon(sz).save(os.path.join(A.out, pth), optimize=True)
    ICONS[sz] = pth
icon(512, pad=0.22).save(os.path.join(A.out, 'icons/icon-maskable-512.png'), optimize=True)
shutil.copy2(os.path.join(A.out, ICONS[180]), os.path.join(A.out, 'apple-touch-icon.png'))
icon(64).save(os.path.join(A.out, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

# ---------- Manifest ----------
manifest = {
    'name': NAME, 'short_name': SHORT, 'lang': 'de', 'start_url': './', 'scope': './', 'id': './',
    'display': 'standalone', 'orientation': 'landscape', 'background_color': BG, 'theme_color': THEME,
    'description': 'Strategiespiel durch fünf Epochen – private Fassung.',
    'icons': [
        {'src': ICONS[192], 'sizes': '192x192', 'type': 'image/png'},
        {'src': ICONS[512], 'sizes': '512x512', 'type': 'image/png'},
        {'src': 'icons/icon-maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'},
    ],
}
open(os.path.join(A.out, 'manifest.webmanifest'), 'w').write(json.dumps(manifest, ensure_ascii=False, indent=1))

# ---------- index.html ----------
head = f'''<!doctype html>
<html lang="de"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="{THEME}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="{SHORT}">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" sizes="180x180" href="./apple-touch-icon.png?v=2">
<link rel="apple-touch-icon-precomposed" sizes="180x180" href="./apple-touch-icon.png?v=2">
<link rel="icon" type="image/png" sizes="192x192" href="{ICONS[192]}">
<link rel="stylesheet" href="fonts/fonts.css">
<style>html{{background:{BG}}}</style>
<script>window.__IMP_TARGET='pwa';</script>
'''
body = src
body = re.sub(r'<link rel="preconnect" href="https://fonts\.g[^"]*"[^>]*>\n?', '', body)
body = re.sub(r'<link href="https://fonts\.googleapis\.com/css2[^"]*" rel="stylesheet">\n?', '', body)
assert 'fonts.googleapis' not in body, 'Google-Fonts-Verweis übrig'
body = body.replace('<title>Imperium der Epochen</title>', f'<title>{NAME}</title>', 1)
index = head + body + '\n</html>\n'
open(os.path.join(A.out, 'index.html'), 'w', encoding='utf-8').write(index)
H['index.html'] = sha(os.path.join(A.out, 'index.html'))

# ---------- Lizenzen ----------
LIZ = f'''<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Lizenzen</title>
<style>body{{background:{BG};color:#efe3c8;font:17px/1.5 'Alegreya Sans',system-ui,sans-serif;margin:0;padding:24px 16px}}main{{max-width:760px;margin:auto}}h1,h2{{font-family:Marcellus,serif;color:#e0c48a;font-weight:400}}a{{color:#e0c48a}}li{{margin:.4em 0}}small{{color:#b9a888}}</style>
<link rel="stylesheet" href="fonts/fonts.css"></head><body><main>
<h1>{NAME} – Lizenzen und Hinweise</h1>
<p>Private, nicht-kommerzielle Fassung. Keine Werbung, kein Verkauf.</p>
<h2>Musik</h2><p><b>Musik erzeugt mit MusicGen (Meta), CC-BY-NC 4.0.</b> Modellgewichte: Creative Commons Namensnennung – Nicht kommerziell 4.0 (<a href="https://creativecommons.org/licenses/by-nc/4.0/deed.de">Lizenztext</a>). Nutzung nur nicht-kommerziell.</p>
<h2>Stimmen</h2><p>Stimmen erzeugt mit Coqui XTTS-v2, Coqui Public Model License (nur nicht-kommerzielle Nutzung).</p>
<h2>Bilder</h2><p>Bilder erzeugt mit FLUX.1 [schnell] (Black Forest Labs), Apache License 2.0. Freistellen mit rembg/IS-Net (MIT/Apache 2.0).</p>
<h2>3D-Modelle</h2><p>3D-Modelle erzeugt mit TRELLIS (Microsoft), MIT License.</p>
<h2>Software</h2><ul><li>three.js r128 – MIT License, Copyright 2010-2021 three.js authors.</li></ul>
<h2>Schriften</h2><ul><li>Marcellus – SIL Open Font License 1.1 (<a href="fonts/marcellus-OFL.txt">Lizenz</a>)</li><li>Alegreya Sans – SIL Open Font License 1.1, Copyright 2013 The Alegreya Sans Project Authors (<a href="fonts/alegreya-sans-OFL.txt">Lizenz</a>)</li><li>Eingebunden über Fontsource.</li></ul>
<h2>Inhalte</h2><p>Texte, Spielregeln und historische Darstellungen: eigene Texte.</p>
<p><small>Stand {OFF_VER}. Einschätzung ohne Rechtsberatung.</small></p>
<p><a href="./">Zurück zum Spiel</a></p></main></body></html>
'''
open(os.path.join(A.out, 'LIZENZEN.html'), 'w', encoding='utf-8').write(LIZ)

open(os.path.join(A.out, 'robots.txt'), 'w').write('User-agent: *\nDisallow: /\n')
open(os.path.join(A.out, '.nojekyll'), 'w').write('')
open(os.path.join(A.out, '404.html'), 'w', encoding='utf-8').write(f'''<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Nicht gefunden</title>
<style>body{{background:{BG};color:#efe3c8;font:18px/1.5 system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px;text-align:center}}a{{color:#e0c48a}}</style></head>
<body><div><h1 style="font-weight:400">Seite nicht gefunden</h1><p><a href="./">Zum Spiel</a></p></div></body></html>
''')

# ---------- Service Worker ----------
SHELL = ['./', 'index.html', 'manifest.webmanifest', 'apple-touch-icon.png', 'favicon.ico', 'fonts/fonts.css', 'LIZENZEN.html'] + \
        list(ICONS.values()) + ['icons/icon-maskable-512.png'] + font_files
# Kern (vorab beim Installieren, ~25 MB): Einzelbilder, Oberfläche, Bauten, Startwelten, Heere, Grundklänge
CORE_RX = re.compile(r'^(img/[^/]+\.webp|img/pb_ui\.json|img/pb_bau\.json|img/pb_spr\.json|saves/.*|models/(army\d|kit\d|c_kit)\.json|snd/g_base\.json)$')
CORE = [p for p, _ in MAN if CORE_RX.match(p)]
core_mb = sum(s for p, s in MAN if p in CORE) / 1e6
sver = hashlib.sha256(json.dumps(H, sort_keys=True).encode()).hexdigest()[:10]
VERSION = f'{OFF_VER}-{sver}'
sw = f'''// Service Worker – {NAME}. Erzeugt von build.py, nicht von Hand ändern.
const VERSION={json.dumps(VERSION)};
const SHELL_CACHE='imp-shell-'+VERSION, ASSETS='imp-assets', META='imp-meta';
const SHELL={json.dumps(SHELL)};
const CORE={json.dumps(CORE)};
const H={json.dumps({k: v for k, v in H.items() if k != 'index.html'}, separators=(',', ':'))};
const RX=/^(img|audio|models|saves|snd)\\//;
const BASE=new URL('./',self.location).href;
const rel=u=>{{const s=new URL(u,BASE).href;return s.startsWith(BASE)?decodeURIComponent(s.slice(BASE.length).split(/[?#]/)[0]):null;}};

self.addEventListener('install',e=>{{e.waitUntil((async()=>{{
  const sc=await caches.open(SHELL_CACHE);await sc.addAll(SHELL.map(u=>new Request(u,{{cache:'reload'}})));
  const ac=await caches.open(ASSETS);
  for(const p of CORE){{try{{if(await ac.match(p))continue;const r=await fetch(new Request(p,{{cache:'reload'}}));if(r.ok)await ac.put(p,r);}}catch(err){{}}}}
}})());}});

self.addEventListener('activate',e=>{{e.waitUntil((async()=>{{
  for(const k of await caches.keys())if(k.startsWith('imp-shell-')&&k!==SHELL_CACHE)await caches.delete(k);
  // geänderte oder entfernte Spieldateien aus dem Cache werfen (Vergleich der Datei-Hashes mit der Vorversion)
  try{{const mc=await caches.open(META),old=await mc.match('__hashes');const O=old?await old.json():null;
    if(O){{const ac=await caches.open(ASSETS);for(const p in O)if(O[p]!==H[p])await ac.delete(p);}}
    await mc.put('__hashes',new Response(JSON.stringify(H),{{headers:{{'Content-Type':'application/json'}}}}));}}catch(err){{}}
  await self.clients.claim();
}})());}});

self.addEventListener('message',e=>{{if(e.data==='skip')self.skipWaiting();}});

self.addEventListener('fetch',e=>{{const q=e.request;if(q.method!=='GET')return;const p=rel(q.url);if(p===null)return;
  if(q.mode==='navigate'||p===''||p==='index.html'){{
    e.respondWith(caches.open(SHELL_CACHE).then(c=>c.match('index.html')).then(r=>r||fetch(q)));return;}}
  if(RX.test(p)){{e.respondWith((async()=>{{const ac=await caches.open(ASSETS);const hit=await ac.match(p);if(hit)return hit;
    const r=await fetch(q);if(r.ok&&r.status===200&&H[p])try{{await ac.put(p,r.clone());}}catch(err){{}}return r;}})());return;}}
  e.respondWith(caches.open(SHELL_CACHE).then(c=>c.match(p)).then(r=>r||fetch(q)));
}});
'''
open(os.path.join(A.out, 'service-worker.js'), 'w', encoding='utf-8').write(sw)
open(os.path.join(A.out, 'version.json'), 'w').write(json.dumps({'version': VERSION, 'files': H}, indent=0))

# ---------- Prüfen + Zip ----------
files = []
for root, _, fs in os.walk(A.out):
    for f in fs:
        fp = os.path.join(root, f)
        files.append((os.path.relpath(fp, A.out), os.path.getsize(fp)))
big = [f for f in files if f[1] >= GH_LIMIT]
if big:
    sys.exit('Datei zu groß für GitHub: %s' % big)
if os.path.exists(A.zip):
    os.remove(A.zip)
with zipfile.ZipFile(A.zip, 'w', zipfile.ZIP_DEFLATED) as z:
    for rp, _ in sorted(files):
        z.write(os.path.join(A.out, rp), rp)
tot = sum(s for _, s in files)
print(f'Version {VERSION} · {len(files)} Dateien · {tot/1e6:.1f} MB · größte {max(files,key=lambda x:x[1])} · Kern-Precache {core_mb:.1f} MB · Zip {os.path.getsize(A.zip)/1e6:.1f} MB')
