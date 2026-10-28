# Konzept: Familie und Dynastien ausbauen

Stand: v129 (`/home/claude/imperium.html`), nur gelesen. Auftrag von Moritz: breitere Stammbäume, Familien auch bei den Nachbarn, „was ist da spannend“.

---

## 1. Ist-Stand

### 1.1 Datenmodell (je Reich `S.fac[f].dyn`)
- `dynOf(f)` (Z. ~6656) legt das Haus beim ersten Zugriff an:
  - `house`: kulturabhängig über `cHouse`, `housePool`, `houseList`, `HOUSE_XTRA` (Asien, Steppe, Afrika). Für Orient und Habescha gibt es eigene Listen (`OR_HOUSES`, `HAB_HOUSES`).
  - `ruler`: Person mit `{id, n, sex, age, tr[], e, face}` aus `newPerson`. 90 % männlich.
  - `ruler.sp`: Ehepartner (75 % bei der KI), `from` = Herkunftsreich oder `null` (eigener Adel).
  - `kids[]`: 1–2 Kinder beim Spieler, 0–2 bei der KI.
  - `kin[]`: 1–2 Seitenverwandte. Sie haben nur eine Beschriftung `rel` (Bruder/Vetter/Neffe, Schwester/Base/Nichte), aber keine echte Abstammung.
  - `heir`, `edu`, `since`, `regent`, `past[]` (die letzten 8 Herrscher, aus `dynAfter`), `pret` (Gegenkönig).
- Namen sind kulturgerecht: `orName`, `cGiven`, `FEM_NAMES`, `OR_M/F`, `HAB_M/F`.
- Für Amerika gibt es `AM_HOUSES` und `amRuler` (Porträt).

### 1.2 Ablauf
- **`dynRound(f)`** läuft für alle lebenden spielbaren Reiche, also auch für die KI:
  - Altern: 2 Jahre je Runde, ab Epoche 4 nur 1 Jahr.
  - Tod: `deathRisk`.
  - Volljährigkeit mit 16 bringt Eigenschaften (`adultTraits`, die Erziehung `EDU` wirkt nur beim Erben).
  - Kindersterblichkeit, Geburten (16 % je Runde, höchstens 6 Kinder) und Tod des Ehepartners.
  - Die KI heiratet, wenn sie verwitwet oder ledig ist. In 40 % der Fälle nimmt sie dabei einen Partner aus einem Nachbarhaus mit Beziehung ≥ 20.
- **`dynRound2`** (eingehängt):
  - Ämter prüfen.
  - Gegenkönig beenden oder verjähren lassen (40 Runden).
  - Die KI verheiratet erwachsene Kinder (3 % je Runde).
- **`dynJump(years)`** beim Epochenwechsel: alle altern, über 70 wird abgelöst.
- **`succeed(f, why)`** Thronfolge:
  1. Erbe aus `dynHeir`: der bestimmte Erbe, sonst das älteste Kind gleich welchen Geschlechts. Ist er minderjährig, folgt eine Regentschaft mit Steuern −10 % und Ordnung −1.
  2. Adoptivsohn.
  3. Seitenlinie: ältester männlicher `kin`, Ordnung −2 für 5 Runden.
  4. Kein Erbe: Ein verschwägertes Haus kann über `heirClaim` und `inheritOk` erben (`inheritRealm`, die KI tut das mit 50 %) oder bekommt einen Anspruch (`addClaim`, Kriegsgrund `erbe` für 30 Runden).
  5. Sonst Thronfolgekrise: neues Haus, Ordnung −3 für 8 Runden, Unruhe.
- **`dynAfter`** nach dem Thronwechsel:
  - Ahnen werden notiert.
  - `dynRival` kann einen Thronstreit auslösen: ein fähigerer Verwandter, bei schwachem oder minderjährigem Herrscher mit 35 % Wahrscheinlichkeit.
  - Beim Spieler folgt das Ereignis `THRON_EV` mit drei Wegen: abkaufen, Amt geben, hart bleiben → `dynExile` (Kriegsgrund für ein Nachbarreich) oder `dynRevolt` (ferne Provinzen fallen ab).

### 1.3 Handlungen des Spielers (Hof → Familie, `famHtml` plus vorgeschaltetes `dynTreeHtml`)
- **Heirat des Herrschers:** eigener Adel (Ordnung +1) oder ein anderes Reich (`marry`, `WED_REL` = +25 Beziehung, Kosten `marryCost`, Sperre 12 Runden).
- **Kinder verheiraten** (`kidWed`): Der Ehepartner existiert nur als `{n, from}`, nicht als Person.
- **Erbe bestimmen und Erziehung wählen** (4 Richtungen).
- **Adoption** (`adoptCands`, `adopt`).
- **Familie im Dienst:** `dynMakeGen` (Feldherr mit Eigenschaft aus `DYN_GT`) und `dynMakeGov` (Statthalter). Ein Amt halbiert das Risiko eines Thronstreits.
- **Hofereignisse `DYN_EV`:** krank, erbstreit, brautwerbung, talent, thronwarnung.
- **Diplomatie:** Im Fenster gibt es nur den Knopf „Ehe stiften“, wenn der eigene Herrscher ledig ist. Die Kirchenseite zeigt den Abschnitt „Heiratsallianzen und Erbansprüche“ mit Verschwägerung (40 Runden) und Ansprüchen.

### 1.4 Was fehlt oder dünn ist
| Bereich | Befund |
|---|---|
| Stammbaum | Er hat nur 2 Ebenen: das Herrscherpaar mit seinen Kindern und eine flache Seitenlinie. Enkel fehlen, denn ein verheiratetes Kind bekommt nie Kinder. Geschwister des Herrschers entstehen nur, wenn sie beim Thronwechsel in `kin` rutschen. `kin` hat weder Eltern noch Kinder, „Vetter“ ist nur ein Etikett. Die Ahnen sind Namenslisten ohne Verbindung. |
| Fremde Häuser | Die KI-Dynastien existieren vollständig, man sieht sie aber nirgends. Die Diplomatie zeigt weder Herrscher noch Erben, Haus oder Alter. Damit fehlt der Reiz, eine Heirat gezielt zu planen. |
| Verwandtschaft | `d.wed` ist nur ein Zeitstempel je Reichspaar. Es gibt kein Gedächtnis dafür, wer mit wem verheiratet ist und welches Kind aus welcher Ehe stammt. Ein Erbanspruch entsteht nur, wenn ein Haus ganz ausstirbt (`heirClaim`). Es gibt keinen Anspruch über die Mutter und keine Personalunion bei lebenden Erben. |
| Herrscherinnen | Sie kommen vor: 10 % beim Start, das Erbe ist unabhängig vom Geschlecht, dazu `TITLE_FEM`. Es gibt aber keine Hausgesetze, deshalb erben Töchter überall gleich. Das ist historisch falsch für Frankreich (Salisches Recht), die Osmanen, China und andere. |
| Hausgesetze | Überall gilt Primogenitur ohne Rücksicht auf das Geschlecht. Es fehlen Seniorat (Steppe, Rus), Wahl (HRR, Polen), Tanistry (Kelten, Gälen), die chinesische Kronprinzen-Bestimmung und die Inka-Panaca. |
| Regentschaft | Es gibt nur den Steuerabschlag. Der Regent selbst fehlt, auch die Mutter als Regentin. |
| Familie in Ämtern | Es gibt weder Loyalität als Wert noch Botschafter, Geiseln oder Mündel. |
| Ereignisse | Es gibt 5 Familienereignisse, alle aus Sicht des eigenen Hofes. Es fehlt alles, was zwischen den Häusern spielt. |
| Chronik | Die Ahnen (`past`) sind nicht mit dem „Buch des Reiches“ verbunden. Für die Chronik ist schon beschlossen: Gliederung nach Epoche und darin nach Herrscher. |

---

## 2. Ideen im Einzelnen

Bewertung: Spielspaß ★–★★★, Aufwand S/M/L.

### A. Breiterer Stammbaum (★★★, M)
- **Echte Personen statt Etiketten:** Jede Person bekommt `pa` (Vater- oder Mutter-ID) und optional `ma`. Daraus lassen sich Bruder, Onkel, Vetter und Neffe berechnen statt raten (`relOf(a,b)`).
- **Enkel:** Verheiratete Kinder und Seitenverwandte bekommen selbst Kinder, mit geringerer Rate als das Herrscherpaar (≈ 8 % je Runde, höchstens 4). So wächst ein echter Zweig.
- **Geschwister des Herrschers:** Beim Start entstehen 1–3 Geschwister mit Eltern-ID statt bloß „kin“. Sie können eigene Kinder haben, das sind dann Neffen und Nichten.
- **Ahnen mit Verbindung:** `past[]` wird zu Personen mit `pa`. Der Baum zeigt 2 Ahnen-Generationen, ältere werden zur Ahnenreihe zusammengeklappt.
- **Begrenzung, damit Spielstand und KI schlank bleiben:**
  - Lebende Personen je Haus: Spieler höchstens 24, KI höchstens 10.
  - Wer stirbt, wandert als Kurzform `{id, n, pa, y0, y1, h}` in `past`, höchstens 40.
  - Entfernte Verwandte jenseits von Vettern 2. Grades, ohne Amt und ohne Anspruch, verlassen den Hof und werden nicht mehr geführt.
- **Baumansicht auf dem iPad:** waagrecht scrollbar, Generationen als Zeilen, Karten wie die vorhandenen `.dtp`. Ein Tipp auf eine Person öffnet ein Blatt mit Eigenschaften, Amt, Ehe und Aktionen. Zoom über zwei Stufen: kompakt (nur Namen und Krone) und ausführlich. Keine Linien-Grafik mit SVG-Kreuzungen, sondern eingerückte Zweige. Das ist auf dem Tablet lesbarer.
- **Risiken:** Spielstandgröße (mit der Begrenzung unkritisch, geschätzt +30–60 KB bei 90 Reichen), Übersicht, Laufzeit von `dynRound` bei 90 Reichen (KI ohne Enkel-Simulation, siehe unten).

### B. Familien der Nachbarn sichtbar (★★★, S–M)
- **Diplomatie, neuer Abschnitt „Herrscherhaus“:** Herrscher (Name, Alter, Eigenschaften, Porträt wie in `famHtml`), Ehepartner (Herkunft!), Erbe (Alter, minderjährig?), Zahl der Kinder und Hausgesetz.
- **Gegenseitige Verwandtschaft** in einer Zeile, zum Beispiel: „Die Königin von Kastilien ist die Schwester deines Herrschers.“
- **Zu sehen nur mit Kontakt** (`inContact`). Ohne Botschaft oder Handel ist alles unscharf: „ein Sohn, etwa 10 Jahre“.
- **Hinweise im Ereignisprotokoll:** „In Frankreich ist Ludwig gestorben; sein Sohn Karl (8) regiert unter Vormundschaft.“ Nur für Nachbarn und Verschwägerte, damit es nicht zu viele werden.
- **KI unverändert:** Sie hat ihre Häuser schon, nur die Anzeige ist neu.

### C. Verwandtschaft zwischen Häusern → Erbansprüche, Personalunion (★★★, M–L)
Das ist der eigentliche Kern, „wie Habsburg“.
- **Heirat merkt sich die Person:** Der Ehepartner wird eine echte Person mit `from: g` und `pa`, also mit Eltern im Haus g. Kinder aus der Ehe tragen ein Blutrecht auf das Haus g (`claimOn: g`).
- **Ansprüche entstehen in drei Fällen:**
  1. Haus g stirbt aus. Das gibt es schon, wird aber über das Blut statt nur über `d.wed` geprüft.
  2. Der Erbe in g ist minderjährig oder eine Frau, und das Hausgesetz von g lässt keine Frau zu. Ein Anspruch über die Mutterseite entsteht dann als **schwacher Anspruch** (nur Kriegsgrund, keine Erbschaft).
  3. Ein Thronstreit in g. Der Spieler kann den Prätendenten unterstützen (siehe D).
- **Personalunion:** Erbt dein Herrscher oder Erbe den Thron von g und g ist nicht der Spieler, wird g ein **verbundenes Reich**:
  - Es bleibt eine eigene Fraktion. Die KI regiert es, außenpolitisch folgt es dir.
  - Es gilt als dauerhafter Verbündeter mit Vasallen-ähnlicher Bindung: Ordnung und Gold bleiben dort, ein Tribut fließt.
  - Nach 1–2 Generationen kann es eingegliedert werden (Ereignis, Ordnung −) oder sich lösen (bei Herrscherwechsel ohne Blutsverwandtschaft).
  - So ist das Reich nicht gleich doppelt so groß, das ist eine Bremse für die Balance.
- **Bestehende Erbschaft `inheritRealm`** (ganzes Reich fällt zu) bleibt nur für kleine Reiche (≤ 60 %).
- **Kriegsgrund „Erbfolge“** (`cbOf` Art `erbe`) mit Stärke: stark aus Blut und erloschenem Haus, schwach aus Blut über die Mutterseite.
- **Risiken:** Balance, weil die Personalunion den Spieler stark machen kann (Bremse: nur Nachbarreich, höchstens 1 verbundenes Reich je Epoche). Die KI muss auch Ansprüche gegen den Spieler erheben können, sonst ist das einseitig. Schnittstelle zu Glaube & Diplomatie: Beziehung, Kriegsgründe.

### D. Thronprätendenten im Exil (★★, S–M)
- **Gibt es zur Hälfte schon:** `dynExile`. Der Exilant wird eine Person am fremden Hof (`exile: {from, n, id}`), sichtbar in der Diplomatie: „Am Hof von X lebt Y, der Anspruch auf deinen Thron erhebt.“
- **Spiegelbildlich:** Flieht ein Prinz aus einem KI-Reich, kann er an **deinen** Hof kommen. Er bringt einen Kriegsgrund, und erobert der Spieler die Hauptstadt, wird er dort als Vasallenkönig eingesetzt (ein „Marionettenkönig“-Effekt ohne neue Fraktion).
- **Handlungen:** ausliefern (Beziehung +), beherbergen (Kriegsgrund bleibt), verheiraten (Blutrecht ins eigene Haus).
- **Risiken:** KI-Logik („Wer setzt den Exilanten ein?“) bleibt einfach: nur der Spieler und die KI mit Kriegsgrund.

### E. Geiseln und Mündel (★★, S)
- **Friedensvertrag:** Er kann eine Geisel enthalten, einen Sohn des Unterlegenen, der am Hof des Siegers lebt. Bei Vertragsbruch stirbt sie oder wird zum Druckmittel. Historisch sachlich: Geiseln wurden erzogen, nicht misshandelt (Theoderich in Konstantinopel, Tokugawa Ieyasu bei den Imagawa).
- **Wirkung:**
  - Solange die Geisel lebt, ist ein Kriegsbruch teurer: Beziehung −30, Ordnung −2.
  - Kehrt sie zurück, bringt sie die Eigenschaft „Kenner von X“ mit: bessere Beziehung, Spionagebonus.
- **Mündel:** Ein minderjähriger Erbe eines verbündeten Hauses wächst am eigenen Hof auf. Das gibt eine Beziehung, die über den Tod hinaus hält.
- **Aufwand klein,** braucht nur ein Feld am Vertrag und an der Person.

### F. Verlobung von Kindern (★★, S)
- **Verlobung schon ab 6 Jahren:** Beziehung +10 sofort, +15 bei der Hochzeit mit 16. Sie kann gebrochen werden (Beziehung −20).
- **Planbar:** Man bindet einen Nachbarn langfristig. Das ist der Habsburg-Weg, ohne dass Kinder sofort heiraten müssen.

### G. Familie im Amt mit Loyalität (★★, S–M)
- **Gibt es zur Hälfte:** Feldherr und Statthalter als Ämter, das Flag `loyal`. Neu ist ein Wert **Loyalität 0–100** je Person, sichtbar im Baum.
  - Steigt durch Amt, Geschenke und Ehrentitel. Das hängt am Heer-Konzept, siehe dort.
  - Sinkt, wenn jemand übergangen wird (Erbe gewechselt), durch Verlust eines Amtes und durch einen schwachen Herrscher.
- **Neues Amt Botschafter:** Ein Familienmitglied lebt an einem fremden Hof. Beziehung +1 je Runde bis +20, dafür gibt es Infos über das fremde Haus wie unter B, aber genau.
- **Verrat:** Ein Statthalter mit niedriger Loyalität kann sich bei einem Thronstreit dem Prätendenten anschließen. Das verknüpft sich mit der schon beschlossenen Statthalter-Abtrünnigkeit mit Vorwarnung über 2 Runden, die es in Hof 2 schon gibt.

### H. Rivalität unter Geschwistern (★★, S)
- **Erbstreit** (Ereignis gibt es schon) mit Folgen: Der übergangene Bruder bekommt Loyalität −30 und kann später nach `dynRival` greifen.
- **Neue Ereignisse:**
  - „Der Zweitgeborene fordert ein eigenes Lehen“: Apanage, also eine Provinz unter seiner Verwaltung, oder Ablehnung.
  - „Zwei Söhne zerstritten“
  - „Die Schwester wünscht die Heirat mit einem Fremden“

### I. Regentschaft mit Person (★★, S)
- **Regent als echte Person:** Bei einem minderjährigen Erben wird ein Regent bestimmt, und zwar per Ereignis mit Wahl:
  - Mutter/Witwe (Ordnung +, Steuern −5 %)
  - Onkel (Militär +, Risiko Thronraub)
  - Kanzler (Verwaltung +, Adel murrt)
- Historisch: Theophanu, Blanka von Kastilien, Kösem Sultan, Kaiserinwitwe Cixi.
- **Witwe als Regentin:** Das ist der Hauptweg, wie in der Geschichte Frauen regierten, auch wo sie nicht erben durften.
- **Risiko:** Der Onkel kann sich vor der Volljährigkeit krönen. Das ist ein Ereignis, kein Automatismus.

### J. Hausgesetze je Kultur (★★★, M)
Ein Feld `law` je Haus, beim Anlegen aus Kultur und Epoche gesetzt. Es bestimmt `dynHeir` und den Weg in `succeed`. Sichtbar ist es im Baum und in der Diplomatie unter B. Ein Wechsel ist selten möglich, über ein Ereignis oder ein Hof-Amt mit Kosten.

| Gesetz | Wo (Vorschlag) | Regel | Spielgefühl |
|---|---|---|---|
| Primogenitur, männlich bevorzugt | Europa MA/NZ (Kastilien, England) | Söhne vor Töchtern, Töchter vor Seitenlinie | Standard |
| Salisches Recht | Frankreich, Teile des HRR | Nur Männer erben, Töchter vererben keinen Anspruch | Erbstreite über Mutterlinien (100-jähriger Krieg) |
| Gleiche Primogenitur | einzelne (Aksum? Kusch) | Ältestes Kind | selten |
| Wahlmonarchie | HRR (Kaiser), Polen ab NZ | Kurfürsten/Adel wählen aus Kandidaten (eigene Söhne bevorzugt, wenn Beziehungen gut) | Wahlkampf mit Gold |
| Seniorat | Steppe, Rus, frühe Osmanen | Ältester Mann des Hauses (Bruder vor Sohn) | Onkel erben, Neffen murren → Thronstreit häufiger |
| Tanistry | Kelten, Gälen, Pikten | Fähigster erwachsener Mann wird Tanist bei Lebzeiten | Erbe nach Eigenschaften, nie minderjährig |
| Bestimmung durch Herrscher | China (Kronprinz), Rom (Adoption), Mogulreich | Herrscher wählt frei unter Söhnen/Adoptierten | Adoption gestärkt |
| Osmanische Thronfolge | Osmanen | Einer der Söhne setzt sich durch, die Brüder werden ausgeschaltet. **Sachlich formuliert, nie als Belohnung.** Ab NZ Kafes, also das Seniorat des Hauses | hohe Stabilität nach dem Wechsel, aber kaum Seitenlinie |
| Inka (Panaca) | Inka | Sohn der Coya (Hauptfrau), der verstorbene Herrscher behält seinen Hof (Panaca) und seine Güter | Thronstreit mit der Panaca des Vorgängers (Huáscar/Atahualpa) – passt zur neuen Geschichte |
| Mandat des Himmels | China | Bestimmung durch Herrscher, bei Krise neues Haus (gibt es) | vorhandene Mandat-Mechanik nutzen |

**Risiken:**
- KI und Balance: Das Seniorat erzeugt mehr Thronwechsel. Mit Begrenzung lösen, etwa höchstens 1 Thronstreit je 20 Runden und Haus.
- Historische Vereinfachung muss im Text als „vereinfacht“ erkennbar sein.

### K. Ahnengalerie und Chronik (★★, S)
- Jeder Herrscher bekommt beim Tod einen **Beinamen** aus seinen Eigenschaften und Taten (der Weise, der Eroberer, der Unglückliche) und eine Zeile Bilanz: Regierungszeit, Gewinne und Verluste.
- **„Buch des Reiches“:** Die Kapitel nach Herrscher (bereits beschlossen) ziehen Daten und Beinamen aus `past`.
- **Ahnengalerie** im Familienfenster: eine Reihe von Porträts mit Beinamen.

### L. Familienereignisse zwischen Häusern (★★, S je Ereignis)
Neue Ereignisse, die die Verbindungen nutzen:
- „Deine Tochter, Königin von X, bittet um Hilfe gegen einen Aufstand“: Hilfe schicken (Beziehung, Anspruch stärker) oder ablehnen.
- „Der Erbe von X wirbt um deine Tochter“: das gibt es als Brautwerbung, neu dabei: ein konkreter Name und ein konkretes Alter.
- „Dein Neffe am Hof von X wurde zum Erben bestimmt“: Personalunion möglich.
- „Ein Bastard erhebt Anspruch“: sachlich, selten, nur in passenden Kulturen.
- „Hochzeitsfest“: Gold gegen Ordnung und Ansehen.
- „Seuche am Hof“: mehrere Familienmitglieder sterben. Das verbindet sich mit dem vorhandenen Seuchensystem.

---

## 3. Leistung und Spielstand
- **Heute:** etwa 90 Reiche mit je etwa 6 Personen.
- **Mit Phase 1:**
  - Spieler: höchstens 24 Lebende plus 40 Ahnen in Kurzform.
  - KI: höchstens 10 Lebende plus 8 Ahnen, ohne Enkel-Simulation. Die KI-Kinder heiraten nur „auf dem Papier“, ihre Kinder entstehen erst, wenn sie relevant werden, also beim Erbfall.
  - Geschätzter Zuwachs im Spielstand: +40–80 KB. Laufzeit von `dynRound`: vernachlässigbar.
- **Rechnen statt Speichern:** Verwandtschaftsgrade werden bei Bedarf berechnet (`relOf`), nicht gespeichert.

---

## 4. Schnittstellen zu laufenden Arbeiten
| Andere Arbeit | Schnittstelle |
|---|---|
| **Glaube & Diplomatie** (Fork läuft) | Beziehungsaufschlüsselung: neue Posten „Verwandtschaft“ und „Verlobung“ statt nur „Heirat“. Kriegsgründe `cbOf`: Art `erbe` wird zweistufig (stark/schwach), neu `praet` (Prätendent einsetzen). Heiraten über Glaubensgrenzen: Malus oder Bedingung, etwa Konversion des Ehepartners. Geistliche Häupter (Papst/Patriarch) können Ehen dispensieren oder annullieren (Phase 2). Abstimmung: Familie fasst `relAdd`-Gründe nur über eigene Schlüssel an. |
| **Heer & Feldzüge** (beschlossen) | Ehrentitel und Ruhm der Feldherren gelten auch für Familienmitglieder. Loyalität steigt durch Ehrentitel. |
| **Chronik („Buch des Reiches“)** | Kapitel je Herrscher aus `past`, Beinamen. |
| **Hof/Statthalter (Hof 2)** | Familien-Statthalter, Abtrünnigkeit mit Vorwarnung, Loyalität. |
| **Geschichten** | Helden sind meist Herrscher. Neue Hausregeln dürfen Geschichtsstarts nicht stören (`S.scen` → Hausgesetz fest, kein Thronstreit vor Akt-Ende). `dynAfter` prüft `S.scen` schon. Atahualpa/Huáscar passt zur Panaca-Regel. |
| **Kontakt/Diplomatie-Sicht** | Sichtbarkeit fremder Häuser nur mit `inContact`. |

---

## 5. Empfehlung

### Phase 1 (ein Lauf, „Häuser werden lebendig“)
1. **Echte Abstammung** (`pa`/`ma`) und berechnete Verwandtschaft (`relOf`). Enkel beim Spieler. Geschwister und Neffen als Personen. Ahnen mit Beinamen. (A, K)
2. **Neuer Stammbaum** im Familienfenster: Generationen als Zeilen, waagrecht scrollbar, Personenblatt beim Antippen, kompakte und ausführliche Ansicht. (A)
3. **Fremde Häuser in der Diplomatie:** Herrscher, Ehepartner, Erbe und Hausgesetz, Verwandtschaft in einem Satz, nur mit Kontakt. Meldungen bei Thronwechseln von Nachbarn. (B)
4. **Heirat mit Gedächtnis:** Der Ehepartner wird eine Person aus dem fremden Haus. Kinder tragen Blutrecht. Erbanspruch über Blut statt Zeitstempel. Verlobung ab 6 Jahren. (C-Teil, F)
5. **Regentschaft mit Person:** Mutter, Onkel oder Kanzler als Wahl. (I)
6. **Hausgesetze, 5 Grundformen:** Primogenitur männlich bevorzugt, Salisch, Seniorat, Bestimmung durch Herrscher, Wahl. Zugeordnet nach Kultur. (J-Teil)
7. **4–6 neue Familienereignisse,** davon 2 zwischen Häusern. (H, L)

### Phase 2
- **Personalunion** als „verbundenes Reich“, mit Eingliederung oder Loslösung. (C)
- **Prätendenten in beide Richtungen** und Marionettenkönig. (D)
- **Geiseln und Mündel** im Friedensvertrag. (E)
- **Loyalität als Wert** und Botschafter-Amt. (G)
- **Weitere Hausgesetze:** Tanistry, osmanisch, Inka-Panaca, Wahlmonarchie mit Kurfürsten. Wechsel des Hausgesetzes per Hof-Amt. (J)
- **Heirat über Glaubensgrenzen,** Dispens durch geistliche Häupter. (Schnittstelle Glaube)

---

## 6. Entscheidungsfragen für Moritz

1. **Wie groß soll der Stammbaum werden?**
   - a) Herrscherpaar, Kinder, Enkel, Geschwister, Neffen und 2 Ahnen-Generationen. Begrenzung: 24 Lebende. **(empfohlen)**
   - b) Kleiner: nur Geschwister und Enkel dazu, Seitenlinie bleibt flach.
   - c) Groß: bis Vettern 2. Grades und unbegrenzte Ahnenreihe, mit Zoom.

2. **Wie viel siehst du von fremden Häusern?**
   - a) Herrscher, Ehepartner, Erbe, Hausgesetz und Verwandtschaft, nur mit Kontakt. **(empfohlen)**
   - b) Der ganze fremde Stammbaum, nur mit Botschafter oder Verschwägerung.
   - c) Nur Herrscher und Erbe.

3. **Personalunion, also dass ein Erbe eine fremde Krone erbt?**
   - a) Ja, als „verbundenes Reich“ (eigene Fraktion, folgt dir, später eingliederbar), Phase 2. **(empfohlen)**
   - b) Ja, das fremde Reich fällt direkt an dich (wie `inheritRealm` heute, nur häufiger).
   - c) Nein, Blutrecht bringt nur Kriegsgründe.

4. **Hausgesetze, und dürfen Frauen erben?**
   - a) Nach Kultur und Epoche: Salisch in Frankreich, Seniorat in der Steppe, Bestimmung in China und so weiter. Frauen erben dort, wo es historisch üblich war, sonst regieren sie als Regentin. **(empfohlen)**
   - b) Einheitlich wie heute, Frauen erben überall.
   - c) Nach Kultur, aber der Spieler kann sein Hausgesetz einmal je Epoche frei wählen.

5. **Spannung oder Ruhe, wie oft greifen Familienkonflikte ein?**
   - a) Mittel: Thronstreit höchstens alle 20 Runden je Haus, 4–6 neue Familienereignisse, Exil und Geiseln in Phase 2. **(empfohlen)**
   - b) Viel: Geschwisterrivalität, Onkel-Thronraub und Bastarde häufig, wie ein Drama.
   - c) Wenig: nur Anzeigen und Planbarkeit, kaum neue Störungen.

**Ohne Rückfrage gilt:** Gewalt innerhalb von Familien (osmanische Thronfolge, Thronraub) erscheint nur sachlich im Text und wird nie als Spielvorteil belohnt. Alle Begriffe stehen auf Deutsch, Titel kulturgerecht über `TITLE_FEM` und `RANK_N`.
