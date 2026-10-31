#!/bin/bash
# Lädt alle ES-Module von Städte Roms wirklich (nicht nur Syntax) – findet z. B. doppelte Importe, die `node --check` übersieht.
# Fehler wegen fehlender Browser-Objekte (window, THREE, …) werden ignoriert.
cd "$(dirname "$0")/.." || exit 1
T=$(mktemp -d); cp js/*.js "$T/"; echo '{"type":"module"}' > "$T/package.json"
fehler=0
for f in "$T"/*.js; do
  node -e "import('$f').catch(e=>{ if(!/window|document|THREE|localStorage|navigator|AudioContext|requestAnimationFrame/.test(e.message)) { console.log('FEHLER', '$(basename $f)', e.message); process.exit(1) } })" || fehler=1
done
rm -rf "$T"; [ $fehler = 0 ] && echo "Module geladen: ok"; exit $fehler
