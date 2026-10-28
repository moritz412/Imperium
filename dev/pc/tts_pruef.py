"""Prueft alle bisherigen Sprachclips mit Whisper gegen ihren Text und spricht abweichende neu.
Aufruf ueber warteschlange_tts.py, wenn <jobdir>/pruef.json existiert.
Ergebnis: <jobdir>/bericht.json, <jobdir>/neu/<id>.mp3, <jobdir>/x_pruef.json (id -> base64 mp3)."""
import os, sys, json, re, time, glob, base64, difflib, subprocess, datetime, traceback
J = os.path.abspath(sys.argv[1]); B = os.path.dirname(os.path.abspath(__file__))
LOG = os.path.join(J, "pruef.log")
def log(m):
    line = f"{datetime.datetime.now():%Y-%m-%d %H:%M:%S}  {m}"
    print(line, flush=True); open(LOG, "a", encoding="utf-8").write(line + "\n")

ZAHL = {"0":"null","1":"eins","2":"zwei","3":"drei","4":"vier","5":"fuenf","6":"sechs","7":"sieben","8":"acht","9":"neun","10":"zehn","12":"zwoelf","20":"zwanzig","100":"hundert"}
def norm(t):
    t = t.lower().replace("ä","ae").replace("ö","oe").replace("ü","ue").replace("ß","ss")
    t = re.sub(r"[^a-z0-9 ]+", " ", t)
    return [ZAHL.get(w, w) for w in t.split()]
def score(soll, ist):
    a, b = norm(soll), norm(ist)
    if not a: return 1.0, 0
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    extra = sum(j2 - j1 for op, i1, i2, j1, j2 in sm.get_opcodes() if op in ("insert", "replace") and (j2 - j1) > (i2 - i1))
    return sm.ratio(), extra

def warte_gpu():
    # Nicht gleichzeitig mit TRELLIS (3d_21) laufen
    lg = os.path.join(B, "3d", "run3d.log"); t0 = time.time()
    while os.path.exists(os.path.join(B, "3d", "21_ok.txt")):
        txt = open(lg, encoding="utf-8", errors="ignore").read() if os.path.exists(lg) else ""
        if "ENDE run3d 21" in txt: break
        if time.time() - t0 > 6 * 3600: log("Warte nicht laenger auf TRELLIS"); break
        log("TRELLIS laeuft noch, warte 5 min"); time.sleep(300)

def quellen():
    Q = []
    for f in sorted(glob.glob(os.path.join(B, "warteschlange", "*", "tts.json"))):
        jd = os.path.dirname(f)
        if os.path.abspath(jd) == J: continue
        D = json.load(open(f, encoding="utf-8"))
        for x in D["saetze"]:
            p = os.path.join(jd, "mp3", x["id"] + ".mp3")
            if os.path.exists(p): Q.append({"id": x["id"], "text": x["text"], "spk": x.get("spk"), "mp3": p, "paket": D.get("paket", "?")})
    tj = os.path.join(B, "stimme", "texte.json")
    if os.path.exists(tj):
        for g, d in json.load(open(tj, encoding="utf-8")).items():
            for k, t in d.items():
                p = os.path.join(B, "stimme", "mp3", k + ".mp3")
                if os.path.exists(p): Q.append({"id": k, "text": t, "spk": None, "mp3": p, "paket": "stimme"})
    return Q

def main():
    if os.name == "nt":
        import ctypes; ctypes.windll.kernel32.SetThreadExecutionState(0x80000000 | 0x00000001)
    P = json.load(open(os.path.join(J, "pruef.json"), encoding="utf-8"))
    GRENZE = P.get("grenze", 0.86); ZIEL = P.get("ziel", 0.94); VERS = P.get("versuche", 6)
    warte_gpu()
    try: import faster_whisper  # noqa
    except ImportError:
        log("installiere faster-whisper")
        subprocess.run([sys.executable, "-m", "pip", "install", "faster-whisper"], check=False)
    from faster_whisper import WhisperModel
    try:
        import torch
        if os.name == "nt": os.add_dll_directory(os.path.join(os.path.dirname(torch.__file__), "lib"))
    except Exception as ex: log(f"torch-DLL {ex}")
    try:
        wm = WhisperModel(P.get("modell", "medium"), device="cuda", compute_type="int8_float16")
        list(wm.transcribe(os.path.join(B, "stimme", "referenz.wav"), language="de")[0])
        log("Whisper auf GPU")
    except Exception as ex:
        log(f"Whisper GPU geht nicht ({ex}), nehme CPU"); wm = WhisperModel("small", device="cpu", compute_type="int8")
    def hoer(path):
        seg, _ = wm.transcribe(path, language="de", beam_size=5, condition_on_previous_text=False, vad_filter=False)
        return " ".join(s.text.strip() for s in seg)
    Q = quellen(); log(f"{len(Q)} Clips zu pruefen")
    bp = os.path.join(J, "bericht.json")
    R = json.load(open(bp, encoding="utf-8")) if os.path.exists(bp) else {}
    for n, x in enumerate(Q, 1):
        k = x["paket"] + "/" + x["id"]
        if k in R and "vorher" in R[k]: continue
        try:
            ist = hoer(x["mp3"]); s, e = score(x["text"], ist)
            R[k] = {"id": x["id"], "paket": x["paket"], "text": x["text"], "vorher": ist, "s0": round(s, 3), "extra0": e, "neu": False}
            if s < GRENZE or e >= 3: log(f"[{n}/{len(Q)}] {k} AUFFAELLIG {s:.2f} (+{e} Woerter): {ist[:120]}")
        except Exception as ex:
            log(f"[{n}/{len(Q)}] {k} Fehler {ex}")
        if n % 20 == 0: json.dump(R, open(bp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump(R, open(bp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    schlecht = [r for r in R.values() if (r["s0"] < GRENZE or r["extra0"] >= 3) and not r.get("fertig")]
    log(f"{len(schlecht)} Clips werden neu gesprochen")
    if schlecht:
        import numpy as np, lameenc
        from TTS.api import TTS
        tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to("cuda")
        try: have = set(tts.speakers or [])
        except Exception: have = set()
        ref = os.path.join(B, "stimme", "referenz.wav"); nd = os.path.join(J, "neu"); os.makedirs(nd, exist_ok=True)
        spk_of = {x["paket"] + "/" + x["id"]: x["spk"] for x in Q}
        for m, r in enumerate(schlecht, 1):
            k = r["paket"] + "/" + r["id"]; spk = spk_of.get(k); best = None
            for tr in range(VERS):
                T = [0.4, 0.3, 0.25, 0.2, 0.35, 0.15][tr % 6]
                try:
                    kw = dict(text=r["text"], language="de", split_sentences=True, temperature=T)
                    if spk and spk in have:
                        try: w = tts.tts(speaker=spk, repetition_penalty=8.0, **kw)
                        except TypeError: w = tts.tts(speaker=spk, **kw)
                    else: w = tts.tts(speaker_wav=ref, **kw)
                    a = np.clip(np.asarray(w, dtype=np.float32), -1, 1); pcm = (a * 32767).astype(np.int16).tobytes()
                    enc = lameenc.Encoder(); enc.set_bit_rate(64); enc.set_in_sample_rate(24000); enc.set_channels(1); enc.set_quality(2)
                    tmp = os.path.join(nd, r["paket"] + "__" + r["id"] + f"_v{tr}.mp3"); open(tmp, "wb").write(enc.encode(pcm) + enc.flush())
                    ist = hoer(tmp); s, e = score(r["text"], ist); q = s - 0.03 * e
                    if best is None or q > best[0]: best = (q, s, e, ist, tmp)
                    if s >= ZIEL and e < 2: break
                except Exception as ex:
                    log(f"  {k} Versuch {tr} Fehler {ex}"); traceback.print_exc()
            if best and best[1] > r["s0"]:
                os.replace(best[4], os.path.join(nd, r["paket"] + "__" + r["id"] + ".mp3"))
                r.update(neu=True, s1=round(best[1], 3), extra1=best[2], nachher=best[3])
            else:
                r.update(neu=False, s1=round(best[1], 3) if best else None, nachher=best[3] if best else None)
            r["fertig"] = True
            for f in glob.glob(os.path.join(nd, r["paket"] + "__" + r["id"] + "_v*.mp3")):
                try: os.remove(f)
                except Exception: pass
            log(f"[{m}/{len(schlecht)}] {k} {r['s0']:.2f} -> {r.get('s1')} {'ersetzt' if r['neu'] else 'behalten'}")
            json.dump(R, open(bp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    out = {}
    for r in R.values():
        p = os.path.join(J, "neu", r["paket"] + "__" + r["id"] + ".mp3")
        if r.get("neu") and os.path.exists(p): out.setdefault(r["paket"], {})[r["id"]] = base64.b64encode(open(p, "rb").read()).decode()
    json.dump(out, open(os.path.join(J, "x_pruef.json"), "w")); log(f"fertig: {sum(len(v) for v in out.values())} ersetzte Clips")

if __name__ == "__main__":
    main()
