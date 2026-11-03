"""Erzeugt die App-Icons für Limes (Porphyr-Grund, goldenes Tor mit roten Bannern)."""
from PIL import Image, ImageDraw, ImageFilter
import os
OUT=os.path.join(os.path.dirname(__file__),'..','icons')
S=1024*2
def icon(pad=0.0):
    im=Image.new('RGB',(S,S),'#1a0f13'); d=ImageDraw.Draw(im)
    # Porphyr-Verlauf
    for r in range(int(S*.75),0,-8):
        t=r/(S*.75); c=(int(26+(74-26)*(1-t)),int(15+(47-15)*(1-t)),int(19+(58-19)*(1-t)))
        d.ellipse([S/2-r,S*.42-r,S/2+r,S*.42+r],fill=c)
    k=1-pad*2; ox=S*pad; sc=lambda v:ox+v*k*S
    gold='#e8c060'; dark='#a8792f'; red='#b52a24'
    # Boden-Linie / Weg
    d.polygon([(sc(.44),sc(.93)),(sc(.56),sc(.93)),(sc(.535),sc(.70)),(sc(.465),sc(.70))],fill='#6b4a3a')
    # Türme
    for cx in (.30,.70):
        d.rectangle([sc(cx-.11),sc(.36),sc(cx+.11),sc(.80)],fill=gold)
        d.rectangle([sc(cx+.03),sc(.36),sc(cx+.11),sc(.80)],fill=dark)
        for i in range(3):
            x0=cx-.11+i*.08
            d.rectangle([sc(x0),sc(.30),sc(x0+.05),sc(.37)],fill=gold if i<2 else dark)
        # Fenster
        d.rounded_rectangle([sc(cx-.025),sc(.46),sc(cx+.025),sc(.56)],radius=int(S*.02*k),fill='#2a1a14')
        # Fahne
        d.rectangle([sc(cx-.006),sc(.14),sc(cx+.006),sc(.31)],fill='#3a2410')
        d.polygon([(sc(cx+.006),sc(.15)),(sc(cx+.13),sc(.18)),(sc(cx+.10),sc(.215)),(sc(cx+.13),sc(.25)),(sc(cx+.006),sc(.25))],fill=red)
    # Mauer mit Bogen
    d.rectangle([sc(.41),sc(.44),sc(.59),sc(.80)],fill=gold)
    for i in range(3):
        x0=.41+i*.065; d.rectangle([sc(x0),sc(.39),sc(x0+.04),sc(.45)],fill=gold)
    d.rectangle([sc(.41),sc(.62),sc(.59),sc(.64)],fill=dark)
    d.pieslice([sc(.445),sc(.56),sc(.555),sc(.70)],180,360,fill='#2a1a14'); d.rectangle([sc(.445),sc(.63),sc(.555),sc(.80)],fill='#2a1a14')
    # Tafel
    d.rectangle([sc(.455),sc(.475),sc(.545),sc(.52)],fill=red)
    # Fuß
    d.rectangle([sc(.15),sc(.80),sc(.85),sc(.83)],fill=dark)
    return im.resize((S//2,S//2),Image.LANCZOS)
base=icon(0.06); mask=icon(0.14)
for n,sz,im in [('icon-180.png',180,base),('icon-192.png',192,base),('icon-512.png',512,base),('icon-maskable-512.png',512,mask),('favicon-64.png',64,base),('icon-152.png',152,base),('icon-167.png',167,base),('apple-touch-icon.png',180,base)]:
    im.resize((sz,sz),Image.LANCZOS).save(os.path.join(OUT,n),optimize=True)
print('ok')
