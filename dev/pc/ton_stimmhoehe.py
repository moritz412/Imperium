# Misst die mittlere Grundfrequenz (Stimmhöhe) von Stimmen-Geräuschen, um hohe (weiblich klingende) Schreie auszusortieren.
# Aufruf (PC): musik\audiogen\venv\Scripts\python.exe repo\dev\pc\ton_stimmhoehe.py <ordner> [arten,komma]
import sys, os, glob, json
import numpy as np, librosa
ordner = sys.argv[1]
arten = (sys.argv[2] if len(sys.argv) > 2 else "tod,treffer,kriegsgeschrei,sieg_jubel,kampflaerm_nah,sturm").split(",")
out = {}
for a in arten:
    for f in sorted(glob.glob(os.path.join(ordner, "s_%s_*.mp3" % a))):
        y, sr = librosa.load(f, sr=16000, mono=True)
        f0, stimm, _ = librosa.pyin(y, fmin=70, fmax=900, sr=sr, frame_length=1024)
        v = f0[stimm] if stimm is not None else np.array([])
        med = float(np.median(v)) if len(v) else 0.0
        out[os.path.basename(f)[:-4]] = {"f0": round(med), "stimmhaft": round(float(np.mean(stimm)) if stimm is not None else 0, 2)}
        print(os.path.basename(f), out[os.path.basename(f)[:-4]], flush=True)
json.dump(out, open(os.path.join(ordner, "stimmhoehe.json"), "w"), indent=1)
