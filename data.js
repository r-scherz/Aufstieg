"use strict";
/* ============ Daten: Übungen ============ */
const EQUIP=[
 {id:'stange',n:'Klimmzugstange'},{id:'tisch',n:'Stabiler Tisch / niedrige Stange (Rudern)'},
 {id:'barren',n:'Barren / Dip-Station'},{id:'ringe',n:'Ringe'},{id:'band',n:'Widerstandsbänder'},
 {id:'parallette',n:'Paralletten'},{id:'sprossen',n:'Sprossenwand'},{id:'weste',n:'Gewichtsweste'},{id:'matte',n:'Matte'}
];
const CHAINS={
 push:{n:'Drücken',ic:'💪',steps:[
  {id:'p0',n:'Wand-Liegestütz',t:'r',g:15,q:'Wand Liegestütz richtig',c:['Hände schulterbreit auf Schulterhöhe an die Wand','Körper gerade wie ein Brett, Bauch fest','Ellbogen ca. 45° vom Körper, Brust zur Wand','Langsam runter, kräftig wegdrücken']},
  {id:'p1',n:'Schräge Liegestütz (Hände erhöht)',t:'r',g:12,q:'Incline Push Up Anleitung',c:['Hände auf Tisch, Bank oder Bett','Po und Bauch anspannen, kein Hohlkreuz','Brust bis knapp an die Kante','Je niedriger die Erhöhung, desto schwerer']},
  {id:'p2',n:'Knie-Liegestütz',t:'r',g:12,q:'Knie Liegestütz richtig',c:['Knie auf Matte, Linie Knie–Kopf bleibt gerade','Hände etwas breiter als die Schultern','Brust bis knapp über den Boden','Hüfte nicht abknicken lassen']},
  {id:'p3',n:'Liegestütz',t:'r',g:10,q:'Liegestütz richtig ausführen',c:['Ganzkörperspannung, Gesäß fest','Ellbogen ca. 45°, nicht seitlich ausstellen','Brust berührt fast den Boden','Oben Arme ganz strecken']},
  {id:'p4',n:'Liegestütz (Ausdauer)',t:'r',g:20,q:'Liegestütz Technik',c:['Wie Liegestütz, saubere Technik vor Tempo','2 Sekunden runter, 1 Sekunde hoch','Bei Technikverlust Satz beenden','Atmen: runter ein, hoch aus']},
  {id:'p5',n:'Diamant-Liegestütz',t:'r',g:12,q:'Diamond Push Up Anleitung',c:['Hände eng, Daumen und Zeigefinger bilden eine Raute','Ellbogen eng am Körper','Brust zu den Händen','Trainiert besonders den Trizeps']},
  {id:'p6',n:'Archer-Liegestütz',t:'r',g:8,u:1,q:'Archer Push Up Tutorial',c:['Hände sehr breit aufsetzen','Gewicht auf einen Arm verlagern, der andere bleibt gestreckt','Seiten abwechseln, Wiederholungen pro Seite','Hüfte bleibt gerade']},
  {id:'p7',n:'Pseudo-Planche-Liegestütz',t:'r',g:10,q:'Pseudo Planche Push Up',c:['Hände auf Hüfthöhe, Finger leicht nach außen','Schultern deutlich vor die Hände lehnen','Ellbogen eng führen','Handgelenke gut aufwärmen']},
  {id:'p8',n:'Einarmiger Liegestütz (erhöht)',t:'r',g:6,u:1,q:'One Arm Push Up Progression',c:['Hand auf Bank oder Tisch','Beine breit für Stabilität','Rumpf nicht verdrehen','Langsam tiefer werden mit der Erhöhung']}
 ]},
 pull:{n:'Ziehen',ic:'🧗',steps:[
  {id:'l0',n:'Totes Hängen',t:'s',g:30,need:['stange'],q:'Dead Hang richtig',c:['Daumen um die Stange, schulterbreit greifen','Körper locker hängen lassen','Ruhig atmen','Am Anfang Füße leicht am Boden zur Entlastung']},
  {id:'l1',n:'Schulterblatt-Klimmzüge',t:'r',g:10,need:['stange'],q:'Scapula Pull Ups Anleitung',c:['Arme bleiben gestreckt','Schulterblätter nach unten ziehen, Körper hebt sich wenige cm','1 Sekunde halten, kontrolliert lösen','Basis für jeden Klimmzug']},
  {id:'l2',n:'Rudern (Tisch / niedrige Stange)',t:'r',g:12,need:['tisch'],park:'Australian Pull-ups an niedriger Stange',q:'Australian Pull Up Tisch Rudern',c:['Körper gerade, Fersen am Boden','Brust zur Kante bzw. Stange ziehen','Schulterblätter zusammenziehen','Je flacher der Körper, desto schwerer']},
  {id:'l3',n:'Negative Klimmzüge',t:'r',g:5,need:['stange'],q:'Negative Klimmzüge Anleitung',c:['Mit Sprung oder Stuhl hoch, Kinn über die Stange','5 Sekunden langsam ablassen','Unten Schultern aktiv lassen','Lieber weniger und dafür langsam']},
  {id:'l4',n:'Klimmzüge mit Band',t:'r',g:8,need:['stange','band'],q:'Klimmzug mit Widerstandsband',c:['Band an der Stange befestigen, Fuß oder Knie hinein','Volle Bewegung von gestreckt bis Kinn über Stange','Mit dünnerem Band steigern','Kein Schwung']},
  {id:'l5',n:'Klimmzüge',t:'r',g:5,need:['stange'],q:'Klimmzug richtig ausführen',c:['Schulterbreit, Handflächen nach vorne','Aus dem Hang zuerst die Schulterblätter aktivieren','Kinn über die Stange','Kontrolliert runter, kein Schwung']},
  {id:'l6',n:'Klimmzüge (Ausdauer)',t:'r',g:10,need:['stange'],q:'Mehr Klimmzüge schaffen',c:['Saubere Technik wie bei Klimmzügen','Ganz unten kurz Arme strecken','Beine ruhig halten','Bei Technikverlust Satz beenden']},
  {id:'l7',n:'Explosive Klimmzüge',t:'r',g:5,need:['stange'],q:'Explosive Pull Ups Muscle Up',c:['So schnell wie möglich hochziehen','Ziel: Brust bzw. Schlüsselbein zur Stange','Kontrolliert ablassen','Vorstufe zum Muscle-up']},
  {id:'l8',n:'Archer-Klimmzüge',t:'r',g:4,u:1,need:['stange'],q:'Archer Pull Up Tutorial',c:['Sehr breiter Griff','Zu einer Hand ziehen, der andere Arm bleibt gestreckt','Seiten abwechseln','Wiederholungen pro Seite']},
  {id:'l9',n:'Muscle-up (negativ)',t:'r',g:3,need:['stange'],q:'Muscle Up negativ lernen',c:['Oben im Stütz über der Stange starten','Langsam durch den Übergang absenken','Ellbogen nah am Körper','Erst wenn explosive Klimmzüge sicher sitzen']}
 ]},
 legs:{n:'Beine',ic:'🦵',steps:[
  {id:'b0',n:'Kniebeuge zum Stuhl',t:'r',g:15,q:'Box Squat Kniebeuge Stuhl',c:['Füße schulterbreit, Zehen leicht nach außen','Po nach hinten, kurz am Stuhl antippen','Knie zeigen in Richtung Zehen','Brust aufrecht']},
  {id:'b1',n:'Kniebeuge',t:'r',g:20,q:'Kniebeuge richtig',c:['Fersen bleiben am Boden','Mindestens bis Oberschenkel waagrecht','Knie nicht nach innen fallen lassen','Oben Hüfte ganz strecken']},
  {id:'b2',n:'Ausfallschritte',t:'r',g:12,u:1,q:'Ausfallschritt richtig',c:['Großer Schritt nach vorne','Hinteres Knie Richtung Boden','Oberkörper aufrecht','Wiederholungen pro Bein']},
  {id:'b3',n:'Bulgarian Split Squat',t:'r',g:10,u:1,q:'Bulgarian Split Squat Anleitung',c:['Hinterer Fuß auf Stuhl oder Bank','Vorderes Knie über dem Fuß','Gerade nach unten absenken','Wiederholungen pro Bein']},
  {id:'b4',n:'Sprung-Kniebeugen',t:'r',g:12,q:'Jump Squat Technik',c:['Kniebeuge, dann explosiv abspringen','Weich und leise landen','Knie zeigen nach außen','Im 6. Stock: lieber leise, sonst Kniebeuge mit Zehenstand']},
  {id:'b5',n:'Shrimp Squat (assistiert)',t:'r',g:6,u:1,q:'Shrimp Squat Progression',c:['Ein Bein nach hinten anwinkeln','Mit der Hand an Tür oder Stange festhalten','Hinteres Knie Richtung Boden','Pro Bein']},
  {id:'b6',n:'Pistol Squat (assistiert)',t:'r',g:6,u:1,q:'Assisted Pistol Squat',c:['Ein Bein gestreckt nach vorne','An Türrahmen oder Stange festhalten','So tief wie kontrolliert möglich','Pro Bein']},
  {id:'b7',n:'Pistol Squat',t:'r',g:5,u:1,q:'Pistol Squat Tutorial',c:['Arme nach vorne als Gegengewicht','Ferse bleibt am Boden','Ganz runter, kontrolliert hoch','Pro Bein']},
  {id:'b8',n:'Pistol Squat (Ausdauer)',t:'r',g:10,u:1,q:'Pistol Squat Technik',c:['Saubere Technik wie beim Pistol Squat','Gleichmäßiges Tempo','Knie stabil über dem Fuß','Pro Bein']}
 ]},
 core:{n:'Rumpf',ic:'🔥',steps:[
  {id:'c0',n:'Unterarmstütz',t:'s',g:30,q:'Plank richtig',c:['Ellbogen unter den Schultern','Körper eine gerade Linie','Po und Bauch fest, nicht durchhängen','Ruhig weiteratmen']},
  {id:'c1',n:'Unterarmstütz (lang)',t:'s',g:60,q:'Plank Technik',c:['Wie Unterarmstütz','Ellbogen aktiv Richtung Füße ziehen','Spannung halten statt nur aushalten','Bei Hohlkreuz abbrechen']},
  {id:'c2',n:'Hollow Body (Knie gebeugt)',t:'s',g:20,q:'Hollow Body Hold Anfänger',c:['Rückenlage, unterer Rücken fest am Boden','Schultern und Füße leicht anheben','Knie gebeugt zur Erleichterung','Arme nach vorne']},
  {id:'c3',n:'Hollow Body Hold',t:'s',g:30,q:'Hollow Body Hold',c:['Beine gestreckt, Arme über dem Kopf','Unterer Rücken bleibt am Boden','Je flacher, desto schwerer','Wichtigste Grundposition im Calisthenics']},
  {id:'c4',n:'Hängendes Knieheben',t:'r',g:10,need:['stange'],q:'Hanging Knee Raise',c:['Aktiv an der Stange hängen','Knie zur Brust ziehen, Becken einrollen','Langsam ablassen','Kein Schwung']},
  {id:'c5',n:'Hängendes Beinheben',t:'r',g:10,need:['stange'],q:'Hanging Leg Raise Technik',c:['Beine gestreckt bis auf Hüfthöhe','Becken leicht einrollen','Kontrolliert ablassen','Kein Schwingen']},
  {id:'c6',n:'Tuck L-Sit',t:'s',g:15,q:'Tuck L Sit Anfänger',c:['Auf Händen, Paralletten oder zwei Stühlen stützen','Knie zur Brust, Füße vom Boden','Schultern nach unten drücken','Arme gestreckt']},
  {id:'c7',n:'L-Sit',t:'s',g:15,q:'L Sit Tutorial',c:['Beine gestreckt nach vorne','Schultern runter, Brust raus','Zehen spitz','Am Anfang ein Bein gestreckt, eines angewinkelt']},
  {id:'c8',n:'Toes to Bar',t:'r',g:8,need:['stange'],q:'Toes to Bar Anleitung',c:['Aus aktivem Hang','Zehen bis an die Stange','Langsam ablassen','Kein Kipping']},
  {id:'c9',n:'Dragon Flag (negativ)',t:'r',g:5,q:'Dragon Flag Negativ',c:['Auf Bank oder Boden, hinter dem Kopf festhalten','Körper gestreckt nach oben','Langsam als Brett ablassen','Rücken nicht durchhängen']}
 ]}
};
const ORDER=['push','pull','legs','core'];
const WARM=['Hampelmann – 60 s','Armkreisen vorwärts und rückwärts – 30 s','Schulterblätter kreisen – 10×','Hüftkreisen – 10× pro Richtung','Handgelenke kreisen und dehnen – 30 s','Leichte Kniebeugen – 10×','Katze–Kuh – 8×'];
const COOL=['Brust dehnen im Türrahmen – 30 s pro Seite','Lat dehnen an der Stange oder Tür – 30 s','Hüftbeuger im Ausfallschritt – 30 s pro Seite','Oberschenkel-Rückseite – 30 s pro Seite','Kindhaltung – 45 s'];
const DAYS=[1,2,3,4,5,6,0], DN=['So','Mo','Di','Mi','Do','Fr','Sa'], DNL=['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];

/* ============ Einrichtung (Fragenkatalog) ============ */
const OB=[
 {t:'Willkommen bei AUFSTIEG',sub:'Dein Calisthenics-Training von leicht bis schwer. Ein paar Fragen, dann baut die App deinen Plan. Jede Frage kannst du überspringen.',f:[{k:'name',type:'text',l:'Wie soll dich die App nennen?',ph:'z. B. Ricardo'}]},
 {t:'Dein Ziel',f:[
  {k:'goal',type:'one',l:'Hauptziel',o:['Muskelaufbau','Abnehmen','Halten & fit bleiben']},
  {k:'skills',type:'multi',l:'Welche Skills reizen dich?',o:['Erster Klimmzug','10 Klimmzüge am Stück','Muscle-up','Handstand','L-Sit','Pistol Squat','Front Lever','Planche (langfristig)']},
  {k:'goal3',type:'area',l:'Was willst du in 3 Monaten schaffen?',ph:'z. B. 5 saubere Klimmzüge, sichtbar mehr Brust'}]},
 {t:'Körper',sub:'Für Kalorienziele (ab Version 2) und die Trainingsbelastung.',f:[
  {k:'sex',type:'one',l:'Geschlecht (für den Grundumsatz)',o:['Männlich','Weiblich']},
  {k:'height',type:'num',l:'Größe (cm)'},{k:'weight',type:'num',l:'Gewicht (kg)',step:.1},{k:'age',type:'num',l:'Alter'}]},
 {t:'Alltag & Aktivität',sub:'Daraus berechnet die App, wie viel Energie du im Alltag verbrauchst – ohne das Training aus der App.',f:[
  {k:'job',type:'one',l:'Wie sieht deine Arbeit überwiegend aus?',o:['Fast nur sitzend (Büro, Steuerpult)','Gemischt (sitzen, stehen, etwas gehen)','Viel stehen und gehen (Werkstatt, Anlage, Rundgänge)','Körperlich schwer (heben, tragen, klettern)']},
  {k:'jobH',type:'num',l:'Wie viele Stunden dauert ein Arbeitstag (inkl. Pausen)?',step:.5},
  {k:'jobD',type:'one',l:'Arbeitstage pro Woche',o:['3','4','5','6']},
  {k:'commute',type:'one',l:'Wie kommst du zur Arbeit?',o:['Auto / Motorrad','Öffis','Fahrrad','Zu Fuß','Homeoffice']},
  {k:'walkMin',type:'num',l:'Wie viele Minuten bist du pro Tag zügig zu Fuß oder mit dem Rad unterwegs (Arbeitsweg, Einkaufen, Hund …)?'},
  {k:'steps',type:'one',l:'Schritte pro Tag (steht in der Health-App am iPhone)',o:['Unter 5.000','5.000–8.000','8.000–12.000','Über 12.000','Weiß ich nicht']},
  {k:'leisure',type:'one',l:'Wie verbringst du deine Freizeit meistens?',o:['Überwiegend sitzend (PC, Couch)','Gemischt','Aktiv (viel unterwegs, Haushalt, Garten, basteln)']},
  {k:'sportH',type:'num',l:'Stunden pro Woche für anderen Sport (Laufen, Rad, Fußball …) – ohne dieses Training',step:.5},
  {k:'sleep',type:'num',l:'Wie viele Stunden schläfst du im Schnitt?',step:.5}]},
 {t:'Trainingserfahrung',f:[
  {k:'exp',type:'one',l:'Wie lange trainierst du schon (insgesamt)?',o:['Neu bzw. kaum','Unter 1 Jahr','1–3 Jahre','Über 3 Jahre']},
  {k:'last',type:'one',l:'Wann hast du zuletzt regelmäßig trainiert?',o:['Läuft gerade','Vor weniger als 3 Monaten','Vor 3–12 Monaten','Länger her oder nie']},
  {k:'sports',type:'multi',l:'Machst du noch andere Sportarten?',o:['Laufen','Radfahren','Fitnessstudio','Fußball','Kampfsport','Schwimmen','Wandern','Keine']}]},
 {t:'Einschränkungen',sub:'Freiwillig. Bei markierten Bereichen zeigt die App Hinweise und du wählst leichtere Varianten.',f:[
  {k:'limits',type:'multi',l:'Gibt es Bereiche, die Probleme machen?',o:['Schulter','Ellbogen','Handgelenk','Rücken','Hüfte','Knie','Keine']}]},
 {t:'Deine Trainingswoche',sub:'Unsicher? Tipp auf „Empfehlung“: 3 Ganzkörper-Tage mit Ruhetag dazwischen sind für den Start ideal.',f:[
  {k:'days',type:'days',l:'An welchen Tagen willst du trainieren?'},
  {k:'dur',type:'one',l:'Wie lange darf eine Einheit dauern?',o:['20 min','30 min','45 min','60 min']},
  {k:'tod',type:'one',l:'Wann trainierst du meistens?',o:['Früh','Mittag','Abend','Wechselnd']}]},
 {t:'Geräte',sub:'Die App wählt nur Übungen, für die du die Geräte hast.',f:[
  {k:'home',type:'equip',l:'Daheim vorhanden'},{k:'park',type:'equip',l:'Im Calisthenics-Park vorhanden'}]},
 {t:'Vorlieben',f:[
  {k:'style',type:'one',l:'Wie trainierst du lieber?',o:['Kurz & intensiv (kurze Pausen)','Ausgewogen','Länger & ruhig (lange Pausen)']},
  {k:'fav',type:'area',l:'Übungen, die du gerne machst',ph:'optional'},
  {k:'dislike',type:'area',l:'Übungen, die du nicht magst',ph:'optional'}]},
 {t:'Ernährung',sub:'Wird ab Version 2 für den Essenstracker verwendet.',f:[
  {k:'meals',type:'one',l:'Wie viele Mahlzeiten am Tag?',o:['2','3','4','5 oder mehr']},
  {k:'prep',type:'one',l:'Machst du Mealprep?',o:['Ja, für die ganze Woche','Teilweise','Nein']},
  {k:'noeat',type:'area',l:'Was isst du nicht? (Abneigungen, Ernährungsform)',ph:'optional'}]},
 {t:'Einstufungstest',test:1,sub:'Mach die Tests nach einem kurzen Aufwärmen, mit 2–3 Minuten Pause dazwischen. Nur saubere Wiederholungen zählen. Was du nicht testen kannst, lässt du leer.',f:[
  {k:'t_pu',type:'num',l:'Liegestütz: max. saubere Wiederholungen am Stück'},
  {k:'t_kpu',type:'num',l:'Knie-Liegestütz: max. Wiederholungen (nur falls unter 5 normale)'},
  {k:'t_pull',type:'num',l:'Klimmzüge: max. saubere Wiederholungen (0 ist okay)'},
  {k:'t_hang',type:'num',l:'Hängen an der Stange: Sekunden'},
  {k:'t_plank',type:'num',l:'Unterarmstütz: Sekunden'},
  {k:'t_knee',type:'num',l:'Hängendes Knieheben: max. Wiederholungen'},
  {k:'t_sq',type:'num',l:'Kniebeugen: max. saubere Wiederholungen'},
  {k:'t_pistol',type:'one',l:'Schaffst du einen Pistol Squat (einbeinig)?',o:['Ja','Nein']},
  {k:'t_toes',type:'one',l:'Beweglichkeit: Zehen mit gestreckten Beinen berühren?',o:['Ja','Knapp nicht','Weit weg']},
  {k:'t_deep',type:'one',l:'Beweglichkeit: 30 s tiefe Hocke mit Fersen am Boden?',o:['Ja','Nein']}]},
 {t:'Dein Plan steht',result:1,f:[]}
];
