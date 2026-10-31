# Gemeinsame Regeln für pruefen.py und backen.py (siehe dev/pc/figuren_bauen.md).
CLIPS = {
    'mensch': ['stehen', 'gehen', 'laufen', 'stehen_bereit', 'schlag_a', 'schlag_b', 'stoss_speer', 'abwehr_schild',
               'treffer', 'sterben_vorn', 'sterben_hinten', 'jubeln', 'fliehen'],
    'mensch_fern': ['bogen', 'schleuder', 'speerwurf', 'armbrust', 'muskete'],   # je nach Einheit, mindestens einer bei Schützen
    'mensch_sarissa': ['sarissa_bereit', 'sarissa_stoss', 'gehen_sarissa'],
    'mensch_reiter': ['reiten', 'schlag_reiter', 'lanze_gesenkt', 'stoss_reiter', 'treffer_reiter', 'wurf_reiter'],
    'mensch_kampf': ['kampf_bereit', 'schlag_c', 'schild_stoss', 'ausweichen', 'parade',
                     'nachsetzen', 'stolpern', 'sterben_knie', 'schild_hoch'],   # Zweikampf (30.10.), freiwillig
    'mensch_varianten': ['gehen_b', 'laufen_b', 'stehen_b', 'schlag_a_b', 'schlag_b_b'],   # P1: weniger Gleichtakt
    'pferd': ['stehen', 'schritt', 'trab', 'galopp', 'ansturm', 'steigen', 'treffer', 'sterben'],
    'elefant': ['stehen', 'gehen', 'ansturm', 'stampfen', 'treffer', 'panik', 'sterben', 'trompeten'],
}
LOOP = {'stehen', 'gehen', 'laufen', 'stehen_bereit', 'kampf_bereit', 'gehen_b', 'laufen_b', 'stehen_b', 'fliehen', 'schritt', 'trab', 'galopp', 'ansturm', 'reiten', 'panik'}
MAX_BONES = {'mensch': 55, 'pferd': 40, 'elefant': 40}
MAX_TRIS = {'mensch': 3000, 'pferd': 2000, 'elefant': 2500}   # Nahstufe inkl. Ausrüstung
HOEHE = {'mensch': (1.55, 1.95), 'pferd': (1.4, 2.6), 'elefant': (2.2, 3.6)}  # Meter, Gesamthöhe in Ruhe
FPS = 30


def skelett_art(name):
    n = name.lower()
    if 'pferd' in n or n.startswith('pf'):
        return 'pferd'
    if 'elefant' in n or n.startswith('el'):
        return 'elefant'
    return 'mensch'
