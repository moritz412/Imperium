#!/bin/bash
# Syntaxcheck aller <script>-Blöcke einer Datei: bash chkf.sh <html>
# Zerlegen mit Node (auf dem PC gibt es kein python3 im PATH)
F=${1:-/home/claude/imperium.html};D=$(mktemp -d)
node -e '
const fs=require("fs"),[f,d]=process.argv.slice(1),h=fs.readFileSync(f,"utf8");
const s=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
s.forEach((x,i)=>fs.writeFileSync(d+"/x"+i+".js",x));console.log(s.length,"Blöcke");' "$F" "$D"
ok=1;for f in $D/x*.js;do node --check $f >/dev/null 2>&1||{ echo FAIL $f;node --check $f 2>&1|head -5;ok=0;};done;[ $ok = 1 ]&&echo checked;rm -rf $D
