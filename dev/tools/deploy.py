#!/usr/bin/env python3
"""Baut die Web-App aus dev/imperium.html neu und legt sie ins Wurzelverzeichnis des Repos (GitHub Pages).
Aufruf (im Repo-Wurzelordner):  python dev/tools/deploy.py
Danach: git add -A && git commit -m "vNNN: ..." && git push
Die Spieldaten (img/, audio/, models/, snd/, saves/) liegen bereits im Repo-Wurzelordner und werden als Quelle benutzt.
"""
import os, shutil, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
KEEP = {'.git', 'dev', '.gitignore', 'CLAUDE.md', '_build'}
B = os.path.join(ROOT, '_build')
# Assets aus dem Repo in einen Arbeitsordner kopieren (build.py leert den Ausgabeordner)
A = os.path.join(ROOT, '_build_assets')
if os.path.exists(A): shutil.rmtree(A)
os.makedirs(A)
for d in ('img', 'audio', 'models', 'snd', 'saves'):
    if os.path.isdir(os.path.join(ROOT, d)): shutil.copytree(os.path.join(ROOT, d), os.path.join(A, d))
r = subprocess.run([sys.executable, os.path.join(ROOT, 'dev', 'tools', 'build.py'), os.path.join(ROOT, 'dev', 'imperium.html'),
                    '--assets', A, '--out', B, '--zip', os.path.join(A, 'imperium_pwa.zip')])
if r.returncode: sys.exit('Build fehlgeschlagen')
for n in os.listdir(ROOT):
    if n in KEEP or n == '_build_assets': continue
    p = os.path.join(ROOT, n)
    shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)
for n in os.listdir(B):
    shutil.move(os.path.join(B, n), os.path.join(ROOT, n))
shutil.rmtree(B); shutil.rmtree(A)
# Testseiten (Prototypen) liegen als Quelle in dev/proto und werden nach proto/ kopiert – die Wurzel wird oben geleert!
P = os.path.join(ROOT, 'dev', 'proto')
if os.path.isdir(P): shutil.copytree(P, os.path.join(ROOT, 'proto'))
print('Fertig. Jetzt: git add -A && git commit -m "..." && git push')
