# Schlachtmusik mit MusicGen-medium (CC-BY-NC 4.0), nutzt die Funktionen aus Desktop\imperium-bilder\musik\gen_musik.py.
# Je Stück aus schlacht_musik.json zwei Fassungen (_a, _b), ca. 102 s, schleifenfähig.
# Aufruf (PC): musik\venv\Scripts\python.exe repo\dev\pc\schlacht_musik.py [ids,komma]
import os, sys, json, time, hashlib
import numpy as np, torch
BASE = r"C:\Users\anmel\Desktop\imperium-bilder"
sys.path.insert(0, os.path.join(BASE, "musik"))
import gen_musik as G
from transformers import AutoProcessor, MusicgenForConditionalGeneration

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(BASE, "musik", "schlacht"); os.makedirs(OUT, exist_ok=True)
N_CONT = 4   # 30 + 4*18 = 102 s

def finish(x):   # wie G.finish, aber kräftiger (Schlacht) und kürzeres Ausblenden
    x = x - x.mean()
    x = x * (0.13 / (np.sqrt(np.mean(x ** 2)) + 1e-9))
    pk = np.max(np.abs(x))
    if pk > 0.97: x = x * (0.97 / pk)
    fi, fo = int(1.0 * G.SR), int(4.0 * G.SR)
    x[:fi] *= np.linspace(0, 1, fi) ** 2; x[-fo:] *= np.linspace(1, 0, fo) ** 2
    return x

def main():
    items = json.load(open(os.path.join(HERE, "schlacht_musik.json"), encoding="utf-8"))
    want = [s for s in (sys.argv[1].split(",") if len(sys.argv) > 1 else []) if s]
    if want: items = [i for i in items if i["id"] in want]
    jobs = [(i, v) for i in items for v in "ab" if not os.path.exists(os.path.join(OUT, "m_%s_%s.mp3" % (i["id"], v)))]
    G.log(f"Schlachtmusik: {len(jobs)} Fassungen zu erzeugen")
    if not jobs: return
    if os.name == "nt":
        import ctypes; ctypes.windll.kernel32.SetThreadExecutionState(0x80000000 | 0x00000001)
    dev = "cuda" if torch.cuda.is_available() else "cpu"
    proc = AutoProcessor.from_pretrained(G.MODEL)
    model = MusicgenForConditionalGeneration.from_pretrained(G.MODEL, torch_dtype=torch.float16 if dev == "cuda" else torch.float32).to(dev)
    for it, v in jobs:
        t0 = time.time()
        seed = int(hashlib.sha256((it["id"] + v).encode()).hexdigest()[:8], 16)
        torch.manual_seed(seed); np.random.seed(seed % 2**32)
        x = G.gen(model, proc, it["p"], None, G.FIRST_S)
        for _ in range(N_CONT):
            pr = x[-G.PROMPT_S * G.SR:]
            y = G.gen(model, proc, it["p"], pr, G.NEW_S)
            x = G.crossfade(x, y[len(pr) - int(G.XF * G.SR):], int(G.XF * G.SR))
        x = finish(x)
        G.mp3(x, os.path.join(OUT, "m_%s_%s.mp3" % (it["id"], v)))
        G.log(f"schlacht m_{it['id']}_{v}: {len(x)/G.SR:.1f} s, {time.time()-t0:.0f} s ok")
    G.log("Schlachtmusik fertig.")

if __name__ == "__main__":
    main()
