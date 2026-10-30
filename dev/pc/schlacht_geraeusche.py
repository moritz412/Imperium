# Schlachtgeräusche mit AudioGen-medium (CC-BY-NC 4.0). Liste in schlacht_geraeusche.json: id, Prompt, Dauer, Anzahl Varianten.
# Ausgabe: Desktop\imperium-bilder\musik\geraeusche\s_<id>_<n>.mp3 (mono 32 kHz -> 96 kbit/s), plus pruef.json (Länge, Lautheit, Stille).
# Aufruf (PC): musik\audiogen\venv\Scripts\python.exe repo\dev\pc\schlacht_geraeusche.py [ids,komma]
import os, sys, json, time
import numpy as np, torch
BASE = r"C:\Users\anmel\Desktop\imperium-bilder"
os.environ.setdefault("HF_HOME", os.path.join(BASE, "musik", "hf"))
from audiocraft.models import AudioGen
import lameenc

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(BASE, "musik", "geraeusche"); os.makedirs(OUT, exist_ok=True)
SR = 16000   # AudioGen liefert 16 kHz

def mp3(x, path, sr):
    enc = lameenc.Encoder(); enc.set_bit_rate(64); enc.set_in_sample_rate(sr); enc.set_channels(1); enc.set_quality(2)
    open(path, "wb").write(enc.encode((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()) + enc.flush())

def zuschnitt(x, sr, kurz):
    """Kurze Geräusche: Stille vorn/hinten abschneiden, kurz ausblenden. Teppiche: Schleife durch Überblendung der Enden."""
    x = x - x.mean()
    if kurz:
        a = np.abs(x); thr = 0.02 * a.max()
        idx = np.where(a > thr)[0]
        if len(idx): x = x[max(0, idx[0] - int(.01 * sr)): idx[-1] + int(.05 * sr)]
        fo = min(len(x) // 4, int(.08 * sr)); x[-fo:] *= np.linspace(1, 0, fo)
    else:
        n = int(.8 * sr); w = np.linspace(0, 1, n)
        x = np.concatenate([x[n:-n], x[-n:] * (1 - w) + x[:n] * w])   # Ende fließt in den Anfang
    pk = np.max(np.abs(x)) + 1e-9
    return x * (0.9 / pk)

def main():
    items = json.load(open(os.path.join(HERE, "schlacht_geraeusche.json"), encoding="utf-8"))
    want = [s for s in (sys.argv[1].split(",") if len(sys.argv) > 1 else []) if s]
    if want: items = [i for i in items if i["id"] in want]
    model = AudioGen.get_pretrained("facebook/audiogen-medium")
    pruef = {}
    pp = os.path.join(OUT, "pruef.json")
    if os.path.exists(pp): pruef = json.load(open(pp))
    for it in items:
        model.set_generation_params(duration=it["dauer"], top_k=250, cfg_coef=3.0)
        n = it["n"]; t0 = time.time()
        torch.manual_seed(hash(it["id"]) % 2**31)
        wav = model.generate([it["p"]] * n).cpu().numpy()[:, 0]
        for k in range(n):
            x = zuschnitt(wav[k].astype(np.float32), SR, it["dauer"] <= 4)
            name = "s_%s_%d" % (it["id"], k + 1)
            mp3(x, os.path.join(OUT, name + ".mp3"), SR)
            rms = float(np.sqrt(np.mean(x ** 2))); still = float(np.mean(np.abs(x) < 0.01))
            pruef[name] = {"s": round(len(x) / SR, 2), "rms": round(rms, 3), "still": round(still, 2)}
        print(f"{it['id']}: {n} Varianten, {time.time()-t0:.0f} s", flush=True)
        json.dump(pruef, open(pp, "w"), indent=1)
    print("Geräusche fertig.")

if __name__ == "__main__":
    main()
