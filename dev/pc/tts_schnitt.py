"""Schneidet Gestammel (von XTTS eingefuegte Unsinn-Woerter) aus kurzen Sprecher-Clips heraus.
Aufruf (Python mit faster-whisper, lameenc, av, numpy, z.B. stimme\\venv):
  python tts_schnitt.py [--dry] [--repo <Repo-Wurzel>] [--modell medium] [--auto <bericht.json>] [id ...]
- ids: Clip-ids wie in audio/x_*.json (auch "paket/id" ist moeglich, das Paket wird dann ignoriert).
- --auto: nimmt zusaetzlich alle Clips aus dem Pruefbericht (tts_pruef.py) mit Aehnlichkeit < 0,86.
- --dry: nur anzeigen, nichts schreiben.
Ablauf je Clip: hoeren (faster-whisper, word_timestamps, CPU), Erkennung gegen Soll-Text ausrichten (difflib auf
normalisierten Woertern), eingefuegte Woerter (die im Soll fehlen) herausschneiden, Raender 15 ms aus-/einblenden,
erneut hoeren und bewerten. Uebernommen wird nur, wenn die Aehnlichkeit steigt und keine Soll-Woerter verloren gehen.
Namen-Fehlerkennungen (Austausch statt Einfuegung) werden bewusst nicht angefasst.
Das Paket wird vorher nach <PC-Ordner>/_sicherung/tts_schnitt/ gesichert; geschrieben wird per Textersetzung des
base64-Werts, sonst bleibt die Datei byte-gleich. Danach OFF_MAN in dev/imperium.html anpassen."""
import os, sys, json, re, glob, base64, difflib, shutil, io, argparse
import numpy as np

HIER = os.path.dirname(os.path.abspath(__file__))
ZAHL = {"0":"null","1":"eins","2":"zwei","3":"drei","4":"vier","5":"fuenf","6":"sechs","7":"sieben","8":"acht","9":"neun","10":"zehn","12":"zwoelf","20":"zwanzig","100":"hundert"}
def norm(t):  # wie tts_pruef.py
    t = t.lower().replace("ä","ae").replace("ö","oe").replace("ü","ue").replace("ß","ss")
    t = re.sub(r"[^a-z0-9 ]+", " ", t)
    return [ZAHL.get(w, w) for w in t.split()]
def score(soll, ist):
    a, b = norm(soll), norm(ist)
    if not a: return 1.0, 0
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    extra = sum(j2 - j1 for op, i1, i2, j1, j2 in sm.get_opcodes() if op in ("insert", "replace") and (j2 - j1) > (i2 - i1))
    return sm.ratio(), extra
def treffer(soll, ist):  # Anzahl der Soll-Woerter, die in der Erkennung vorkommen
    a, b = norm(soll), norm(ist)
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    return sum(i2 - i1 for op, i1, i2, j1, j2 in sm.get_opcodes() if op == "equal")

def dekodiere(mp3):
    import av
    c = av.open(io.BytesIO(mp3)); st = c.streams.audio[0]; sr = st.rate; br = st.bit_rate
    rs = av.AudioResampler(format="s16", layout="mono", rate=sr); out = []
    for fr in c.decode(st):
        for f in rs.resample(fr): out.append(f.to_ndarray().reshape(-1))
    for f in rs.resample(None): out.append(f.to_ndarray().reshape(-1))
    c.close()
    return np.concatenate(out).astype(np.float32) / 32768.0, sr, br
def kodiere(a, sr, kbit):
    import lameenc
    enc = lameenc.Encoder(); enc.set_bit_rate(kbit); enc.set_in_sample_rate(sr); enc.set_channels(1); enc.set_quality(2)
    pcm = (np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes()
    return bytes(enc.encode(pcm) + enc.flush())

def finde_pakete(repo):
    P = {}
    for f in sorted(glob.glob(os.path.join(repo, "audio", "x_*.json"))):
        d = json.load(open(f, encoding="utf-8"))
        for k, v in d.items(): P.setdefault(k, (f, v))
    return P

def stille_punkt(a, sr, t, lo, hi):
    """Zeitpunkt mit geringster Energie (5-ms-Fenster) in [lo,hi] (Sekunden), Naehe zu t leicht bevorzugt."""
    w = max(1, int(sr * 0.005)); i0 = max(0, int(lo * sr)); i1 = min(len(a) - w, int(hi * sr))
    if i1 <= i0: return min(max(t, 0), len(a) / sr)
    best = None
    for i in range(i0, i1, w // 2 or 1):
        e = float(np.sqrt(np.mean(a[i:i + w] ** 2))) + 0.002 * abs(i / sr - t)
        if best is None or e < best[0]: best = (e, i)
    return (best[1] + w // 2) / sr

def schneide(a, sr, bereiche, fade=0.015):
    """bereiche: [(t0,t1)] Sekunden, werden entfernt. Raender werden ein-/ausgeblendet."""
    teile = []; pos = 0; n = len(a); f = max(1, int(fade * sr))
    for t0, t1 in sorted(bereiche):
        i0, i1 = int(t0 * sr), int(t1 * sr)
        teile.append((pos, i0)); pos = i1
    teile.append((pos, n)); out = []
    for k, (s, e) in enumerate(teile):
        if e <= s: continue
        seg = a[s:e].copy()
        if k > 0: seg[:f] *= np.linspace(0, 1, min(f, len(seg)))[:len(seg[:f])]          # nach einem Schnitt einblenden
        if k < len(teile) - 1: seg[-f:] *= np.linspace(1, 0, min(f, len(seg)))[-len(seg[-f:]):]  # vor einem Schnitt ausblenden
        out.append(seg)
    return np.concatenate(out) if out else a

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("ids", nargs="*"); ap.add_argument("--dry", action="store_true")
    ap.add_argument("--repo", default=os.path.abspath(os.path.join(HIER, "..", "..")))
    ap.add_argument("--modell", default="medium"); ap.add_argument("--auto"); ap.add_argument("--grenze", type=float, default=0.86)
    ap.add_argument("--sicherung")
    A = ap.parse_args()
    pc = os.path.abspath(os.path.join(A.repo, ".."))
    sich = A.sicherung or os.path.join(pc, "_sicherung", "tts_schnitt")
    os.environ.setdefault("HF_HOME", os.path.join(pc, "hf"))
    ids = [i.split("/")[-1] for i in A.ids]; explizit = set(ids)
    if A.auto:
        R = json.load(open(A.auto, encoding="utf-8"))
        for k, r in R.items():
            if min(r.get("s0", 1), r.get("s1") or 1) < A.grenze and r["id"] not in ids: ids.append(r["id"])
    if not ids: sys.exit("keine ids")
    from faster_whisper import WhisperModel
    wm = WhisperModel(A.modell, device="cpu", compute_type="int8")
    def hoer(mp3):
        import tempfile
        fd, p = tempfile.mkstemp(suffix=".mp3"); os.write(fd, mp3); os.close(fd)
        try:
            seg, _ = wm.transcribe(p, language="de", beam_size=5, condition_on_previous_text=False, vad_filter=False, word_timestamps=True)
            W = [w for s in seg for w in s.words]
        finally: os.remove(p)
        return W, " ".join(w.word.strip() for w in W)
    # Soll-Texte
    T = {}
    for f in glob.glob(os.path.join(pc, "warteschlange", "*", "tts.json")):
        for x in json.load(open(f, encoding="utf-8"))["saetze"]: T.setdefault(x["id"], x["text"])
    tj = os.path.join(pc, "stimme", "texte.json")
    if os.path.exists(tj):
        for g, d in json.load(open(tj, encoding="utf-8")).items():
            for k, t in d.items(): T.setdefault(k, t)
    Pak = finde_pakete(A.repo); neu = {}  # datei -> {id: (alt_b64, neu_b64)}
    for cid in ids:
        if cid not in Pak or cid not in T: print(f"{cid}: nicht gefunden (Paket/Text)"); continue
        f, b64 = Pak[cid]; soll = T[cid]; mp3 = base64.b64decode(b64)
        a, sr, br = dekodiere(mp3); kbit = int(round((br or 64000) / 1000))
        W, ist = hoer(mp3); s0, e0 = score(soll, ist); h0 = treffer(soll, ist)
        print(f"\n{cid}  ({os.path.basename(f)}, {sr} Hz, {kbit} kbit, {len(mp3)} B)\n  Soll : {soll}\n  Ist  : {ist}\n  Aehnlichkeit {s0:.3f}")
        # Wortliste (normalisiert, ein Eintrag je Token) mit Zeiten
        tok = []
        for wi, w in enumerate(W):
            for t in norm(w.word): tok.append((t, wi))
        sm = difflib.SequenceMatcher(None, norm(soll), [t for t, _ in tok], autojunk=False)
        weg = set()
        for op, i1, i2, j1, j2 in sm.get_opcodes():
            if op == "insert": weg.update(tok[j][1] for j in range(j1, j2))
            elif op == "replace" and (j2 - j1) > (i2 - i1):
                ist_t = [t for t, _ in tok[j1:j2]]; soll_t = norm(soll)[i1:i2]
                if cid in explizit:  # nur bei ausdruecklich genannten ids: ueberzaehlige, unaehnliche Woerter streichen, die aehnlichsten bleiben
                    sim = [max(difflib.SequenceMatcher(None, t, s).ratio() for s in soll_t) for t in ist_t]
                    behalte = set(sorted(range(len(ist_t)), key=lambda k: -sim[k])[:len(soll_t)])
                    for k in range(len(ist_t)):
                        if k not in behalte and sim[k] < 0.4: weg.add(tok[j1 + k][1])
                    print(f"  (Mehrwort '{' '.join(ist_t)}' fuer '{' '.join(soll_t)}': ueberzaehlig = {[ist_t[k] for k in range(len(ist_t)) if tok[j1+k][1] in weg]})")
                else: print(f"  (Austausch/Mehrwort '{' '.join(ist_t)}' fuer '{' '.join(soll_t)}' nicht geschnitten)")
        if not weg: print("  nichts zu schneiden"); continue
        # zusammenhaengende Gruppen von Wortindizes
        gr = [];
        for wi in sorted(weg):
            if gr and wi == gr[-1][-1] + 1: gr[-1].append(wi)
            else: gr.append([wi])
        print("  Schnitt:", "; ".join(" ".join(W[i].word.strip() for i in g) + f" [{W[g[0]].start:.2f}-{W[g[-1]].end:.2f}s]" for g in gr))
        dauer = len(a) / sr; beste = None
        for rand in (0.0, 0.03, 0.06):
            ber = []
            for g in gr:
                vor = W[g[0] - 1].end if g[0] > 0 else 0.0
                nach = W[g[-1] + 1].start if g[-1] + 1 < len(W) else dauer
                t0 = stille_punkt(a, sr, W[g[0]].start - rand, max(vor, W[g[0]].start - rand - 0.05), W[g[0]].start - rand + 0.05) if g[0] > 0 else 0.0
                ende = g[-1] + 1 >= len(W)
                t1 = dauer if ende else stille_punkt(a, sr, W[g[-1]].end + rand, W[g[-1]].end + rand - 0.05, min(nach, W[g[-1]].end + rand + 0.05))
                if t1 > t0: ber.append((max(0, t0), min(dauer, t1)))
            b = schneide(a, sr, ber)
            m = kodiere(b, sr, kbit); W1, ist1 = hoer(m); s1, e1 = score(soll, ist1); h1 = treffer(soll, ist1)
            print(f"  Rand {rand:.2f}: {s1:.3f} (+{e1}) Treffer {h1}/{h0}  -> {ist1}")
            if s1 > s0 and h1 >= h0 and (beste is None or s1 > beste[0]): beste = (s1, m, ist1, e1)
        if not beste: print("  -> Original behalten (keine Verbesserung ohne Verlust)"); continue
        print(f"  -> UEBERNOMMEN {s0:.3f} -> {beste[0]:.3f}, {len(mp3)} -> {len(beste[1])} B")
        neu.setdefault(f, {})[cid] = (b64, base64.b64encode(beste[1]).decode())
    if A.dry or not neu: print("\n--dry: nichts geschrieben" if A.dry else "\nNichts zu schreiben"); return
    os.makedirs(sich, exist_ok=True)
    for f, d in neu.items():
        z = os.path.join(sich, os.path.basename(f))
        if not os.path.exists(z): shutil.copy2(f, z); print("gesichert:", z)
        txt = open(f, encoding="utf-8", newline="").read()
        for cid, (alt, nw) in d.items():
            assert txt.count(alt) == 1, cid
            txt = txt.replace(alt, nw, 1)
        open(f, "w", encoding="utf-8", newline="").write(txt)
        json.load(open(f, encoding="utf-8"))
        print(f"{os.path.relpath(f, A.repo)}: {os.path.getsize(f)} Bytes ({len(d)} Clips ersetzt)")

if __name__ == "__main__":
    main()
