#!/bin/bash
# Syntaxcheck aller <script>-Blöcke einer Datei: bash chkf.sh <html>
F=${1:-/home/claude/imperium.html};D=$(mktemp -d)
python3 - "$F" "$D" <<'PY'
import re,sys
h=open(sys.argv[1]).read()
s=re.findall(r'<script>(.*?)</script>',h,re.S)
for i,x in enumerate(s): open(f'{sys.argv[2]}/x{i}.js','w').write(x)
print(len(s),'Blöcke')
PY
ok=1;for f in $D/x*.js;do node --check $f >/dev/null 2>&1||{ echo FAIL $f;node --check $f 2>&1|head -5;ok=0;};done;[ $ok = 1 ]&&echo checked;rm -rf $D
