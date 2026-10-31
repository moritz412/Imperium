#!/usr/bin/env python3
"""Kopiert Städte Roms (dev/staedte) nach staedte/ in der Repo-Wurzel (GitHub Pages), ohne das Hauptspiel neu zu bauen.
Aufruf (im Repo-Wurzelordner):  python dev/tools/deploy_staedte.py
deploy.py ruft dasselbe am Ende auf, weil es die Wurzel leert.
"""
import os, shutil
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'dev', 'staedte')
DST = os.path.join(ROOT, 'staedte')

def kopieren():
    if not os.path.isdir(SRC):
        return
    if os.path.exists(DST):
        shutil.rmtree(DST)
    shutil.copytree(SRC, DST, ignore=shutil.ignore_patterns('BACKLOG.md', 'docs', 'werkzeug'))

if __name__ == '__main__':
    kopieren()
    print('Städte Roms nach staedte/ kopiert. Jetzt: git add -A && git commit -m "..." && git push')
