# Schlachtprofile (Echtzeitschlacht)

- profile_truppen.json: 333 Einträge (108 Spezialeinheiten aus units.json + 225 Basiseinheiten `basis_<gruppe>_e<N>_<rolle>`, Epoche 0 = Antike).
- profile_charaktere.json: 176 Einträge (Format 4.2, Feld `aliase` zusätzlich; Rauschen in heroes.json wie „amerika“, „natur“, Epochen-Genitive ist bewusst ausgenommen).
- dev/imperium.html wurde nicht verändert. Erzeugt per Skript, alle Ids eindeutig.

## Kit-Familien (20), Zahl = Einheiten-Ids
- A1_roemisch_manipel (12): Römische Infanterie der Republik (Manipel, Socii, Berufslegion Caesars): Kettenhemd oder Brustplatte, Montefortino-/Coolus-Helm, Scutum, Gladius, Pilum.
- A2_punisch_libysch (2): Libysches und punisches Fußvolk: Leinenpanzer oder Kettenhemd, Helm (oft erbeutet römisch), Rundschild, Stoßspeer.
- A3_iberisch (1): Iberische Krieger: weiße Tunika mit Purpursaum, Sehnen-/Bronzehelm, Langschild (scutum) oder kleiner Rundschild (caetra), Falcata.
- A4_balearisch (4): Antike Schleuderer und Unbewaffnete-Rüstung-Schützen: Tunika, keine Rüstung, Schleudern und Beutel (auch Nubier, Bogenschützen).
- A5_numidisch (5): Leichte antike Reiter ohne Sattel und Zaum: Tunika, kleiner Rundschild, Wurfspeere (auch Kamel- und Bogenreiter, Näherung).
- A6_keltisch (13): Kelten, Gallier, Germanen, Daker: Hose, teils Oberkörper frei, langer Ovalschild, Langschwert, Kettenhemd nur bei Adel (auch Streitwagen).
- A7_hellenistisch (13): Hellenistische Infanterie: Thrakerhelm oder Pilos, Linothorax, Rund- oder Ovalschild, Sarissa/Dory (auch Peltasten, Kompositbogenschützen).
- A8_elefant_karthagisch (6): Kriegselefant mit Treiber, ohne Turm (nach Konzept), Decke; später auch gepanzerte Elefanten mit Teilen (Panzerdecke, Howdah).
- M1_nordwest_fuss (17): Frühmittelalterliches Fußvolk und Reiter Nord-/Westeuropas (Franken, Sachsen, Angelsachsen, Nordleute, Basken): Tunika, Hose, Kettenhemd (Brünne), Spangenhelm, Rundschild, Speer oder Axt.
- M2_gepanzert_west (15): Hoch- und spätmittelalterlicher Westen: Kettenhemd, Waffenrock, Topfhelm oder Kesselhaube, Dreieck-/Mandelschild, Lanze, Schwert, Hellebarde, Armbrust, Langbogen.
- M3_ostrom_orient_steppe (67): Ostrom, Orient, Persien, Steppe (Ep 1–4): Kaftan, Lamellen oder Kettenhemd, Spitzhelm oder Turban, Kompositbogen, Säbel, später Muskete.
- M4_afrika (20): Afrikanische Krieger (Aksum, Habescha, Mandé, Sahel): Baumwollgewänder, Lederschilde, Speer, Bogen, wenig Rüstung, Reiter mit Lanze.
- N1_pulver_frueh (11): Frühe Neuzeit (16.–17. Jh.): geschlitzte Wämser, Morion/Sturmhaube, Harnisch, Pike, Arkebuse/Muskete, Halbharnisch-Reiter.
- N2_linie (14): Linienzeitalter (18. Jh.–1815): Uniformrock, Dreispitz/Tschako/Bärenmütze, Gamaschen, Muskete mit Bajonett, Kavallerie in Uniform.
- O1_ostasien (48): Ostasien (China, Japan, Korea, Steppengrenze): Lamellen-/Plattenjacke, Helm, Halbbogen/Armbrust, Speer, Säbel, später Luntengewehr.
- S1_suedasien (32): Südasien und Südostasien: Dhoti/Jama, Turban, Rundschild (dhal), Tulwar, Bogen, Speer, später Muskete; Kriegselefanten über A8.
- I1_mesoamerika (11): Mesoamerika (Azteken, Maya, Tarasken, Tlaxcalteken): Baumwollpanzer (ichcahuipilli), Federschmuck, Rundschild (chimalli), Macuahuitl, Atlatl.
- I2_anden (6): Anden und Südamerika (Inka, Muisca, Mapuche): Wollpanzer, Federkrone, Sternkeule, Schleuder, Langspeer (Coligüe).
- I3_nordamerika (5): Nordamerika (Haudenosaunee, Komantschen, Waldkrieger): Leder, Federn, Kriegskeule, Bogen, später Flinte.
- G1_geschuetz (31): Geschütz (4 je Einheit) mit Bedienung: Torsion, Blide, Bombarde, Kanone, Haubitze; Bedienung je Epoche in Tunika, Wams oder Uniform.

## Charaktere ohne Porträt (brauchen FLUX-Porträt)
Vorhanden sind nur Szenenbilder sc_*_x1, keine Porträts; als vorhanden gewertet: Cäsar, Hannibal, Karl, Kleopatra, Kaleb, Harun, Saladin, Subutai, Mansa Musa, Dandolo, Cuauhtémoc, Süleyman, Akbar, Napoleon, Washington.
Es fehlen 161: Titus Labienus, Ariovist, Gnaeus Pompeius, Hasdrubal Barkas, Publius Cornelius Scipio, Publius Cornelius Scipio Africanus, Tiberius Sempronius
Longus, Quintus Fabius Maximus, Graf Roland, Karlmann, Widukind, Desiderius, Tassilo, Ragnar Lodbrok, Björn Eisenseite, Håkon Jarl, Gudfred, Egbert, Offa,
Æthelberht, Graf Odo, Harald Hardrada, Apollodoros, Achillas, Octavian, Marcus Agrippa, Marcus Antonius, Vercingetorix, Rufio, Abraha, Dhu Nuwas, Jafar al-
Barmaki, Ali ibn Isa, Nikephoros, Rafi ibn al-Layth, al-Adil, Nur ad-Din, Guido von Lusignan, Raimund von Tripolis, Richard Löwenherz, Batu Khan, Möngke, Köten
Khan, Juri von Wladimir, Heinrich der Fromme, König Béla, Saran Mandian, Alexios III., Lamba Doria, Bonifatius von Montferrat, Ulman Stromer, Burggraf Albrecht,
Karl IV., Stephan II., Albrecht Achilles, Erhard Schürstab, Willibald Pirckheimer, Temüjin, Boʼorchu, Jelme, Megüjin Seʼültü, Toghrul, Toqtoʼa Beki, Tayang
Khan, Li Anquan, Wanyan Jiujin, Heshilie Zhizhong, Kublai, Bayan, Liu Bingzhong, Ariq Böke, Lü Wenhuan, Jia Sidao, Ismail, Ala ad-Din, Zheng He, Zhu Neng, Chen
Zuyi, Hiawatha, Der Friedensstifter, Atironta, Tlacaelel, Moctezuma Ilhuicamina, Atonal, Herr von Cempoala, Tzitzipandácuare, Kʼiqʼab, Tutul Xiu, Cuitláhuac,
Hernán Cortés, Pánfilo de Narváez, Francisco Pizarro, Diego de Almagro, Kolumbus, Isabella und Ferdinand, Ferdinand II. von Aragón, Boabdil, Moctezuma,
Atahualpa, Chalcuchímac, Quisquis, Atoc, Huanca Auqui, Tito Atauchi, Cusi Yupanqui, Uscovilca, Minchancaman, Pargalı İbrahim, Philippe de Villiers, König Ludwig
II., Niklas Salm, Gonzalo Fernández de Córdoba, Johann II., Afonso de Albuquerque, Vasco da Gama, Robert Clive, Eyre Coote, Siraj ud-Daula, Lally, Haidar Ali,
Bairam Khan, Hemu, Rana Udai Singh, Man Singh, Marschall Ney, Wellington, Blücher, Jourdan, Kellermann, Masséna, Beaulieu, Erzherzog Karl, Kutusow, Nathanael
Greene, William Howe, John Burgoyne, Friedrich Wilhelm, Konrad von Burgsdorff, Johan Banér, Ottavio Piccolomini, Johann Georg I., Friedrich der Große, Oda
Nobunaga, Shibata Katsuie, Imagawa Yoshimoto, Matsudaira Motoyasu, Asakura Yoshikage, Miyoshi Nagayoshi, Mōri Motonari, Chōsokabe Kunichika, Yi Sun-sin, Gwon
Yul, Kim Myeong-won, Konishi Yukinaga, Katō Kiyomasa, Kobayakawa Takakage, Naresuan, Ekathotsarot, Phraya Pasein, Nanda Bayin, Satha.

## Unsicher/prüfen
1. sc_pachacutec_x1 zeigt einen römisch wirkenden Soldaten, nicht verwendet.
2. Scipio: Vater und Sohn getrennt (zwei Einträge für „Publius Cornelius Scipio“).
3. Dschingis Khan zweimal in SC_LEG (mongolen/temujin) mit verschiedenen Eigenschaften.
4. Anachronismen zum Szenariojahr: Hardrada, Håkon Jarl, Lamba Doria, Egbert, Odo, Nikephoros, Albrecht Achilles, Moctezuma/Atahualpa in „kastilien“.
5. Unsichere Namen: Stephan II., Burggraf Albrecht, Atonal, Saran Mandian, Megüjin Seʼültü, Satha, Phraya Pasein, Chōsokabe Kunichika.
6. Kellermann (Vater oder Sohn) und Jourdan als Gegner Napoleons sind historisch ungenau.
7. Leibwache Beaulieu/Banér/Piccolomini nur Platzhalter (keine österreichische/schwedische Einheit im Code).
8. Streitwagen, Sichelwagen, Geobukseon und Elefantentürme: Sonderobjekte, Zuordnung zu Kits nur Näherung.
9. Indigene Artillerie (Tlaxcalteken) als Platzhalter; Aussehen vieler Figuren „unbekannt, plausibel“.
10. Alter bei Szenariostart geschätzt; Doppelnamen „Isabella und Ferdinand“, „Chalcuchímac und Quisquis“ in zwei Einträge geteilt.
