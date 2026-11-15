# Offene Punkte vor der Veröffentlichung (v60)

Nichts davon ist auf der Seite erfunden worden. Wo eine Angabe fehlt, steht sie nicht da.

## Bitte entscheiden

1. **Sechs 3D-Projekte wieder sichtbar.** Futuristic Bunker, Robot Study, Apocalypse, Character Studies, Isometric Room und Security Camera waren ausgeblendet. Sie stehen jetzt mit ihren vorhandenen Bildern und dem Stand „Folgt“ auf der Projektseite und haben eine Detailseite. Wenn einzelne wieder nur als Name erscheinen sollen: in `src/pages/ProjectDetail.tsx` und `src/components/project-card.tsx` entscheidet `hasMedia`, ob verlinkt wird.
2. **SafeMeet-Screenshots:** In zwei Bildern ist der echte Firebase-Host `safemeet-3a06c.web.app` lesbar. Lassen oder unkenntlich machen?
3. **Lebenslauf (PDF):** spricht noch von „Medientechniker“ und stellt 3D-Design in den Mittelpunkt. Das passt nicht mehr zur neuen Positionierung.
4. **Kontakt-Überschrift** „Arbeiten wir zusammen.“ ist unverändert. Ersetzen?

## Angaben, die fehlen

5. **Module:** Welche sind bestanden? Auf der Engineering-Seite stehen nur Module, zu denen es eine Arbeit auf der Seite gibt. Lichttechnik und Studiotechnik werden bei Lantern Island als Fachgebiete genannt, nicht mehr als belegte Module.
6. **I Need Space:** A0 oder A1?
7. **Lantern Island:** Dreieckszahl der Maya-Szene vor der Portierung (im Code `MAYA_TRIS`, ungeprüft, wird nicht angezeigt).
8. **AIESEC:** Auf der Seite steht die Angabe aus dem Lebenslauf (Global Volunteer, Tunis). Falls es Projektkoordination war: Rolle und Zeitraum nennen.
9. **Was ich gelernt habe:** steht nur bei Lantern Island und I Need Space, weil es dort belegt ist. Für SafeMeet, Qrib und KI Lesebuch je ein, zwei Sätze von dir.
10. **Qrib:** Stand der App (veröffentlicht, Testphase?), Größe des Teams, dein Anteil genau. Zurzeit steht „Gestaltung und Entwicklung von App und Website“.
11. **Live-Adressen:** Qrib-Website, KI Lesebuch, E-Sports Event Planner, falls öffentlich.
12. **Material für „Weitere Arbeiten“:** Bilder oder Video zu Future!comeback, E-Sports Event Planner, E-Sports-Overlays, Abschlussfeier, Gambia Insight, H5P-Kurs, Motion Design. Zu welchem Modul gehört der H5P-Kurs?
13. **KI Lesebuch:** Screenshots in höherer Auflösung (DevTools, Gerätemodus 1440 × 900, DPR 2, „Capture screenshot“).
14. **Über mich:** Welche Aussage zu Code war falsch? Der Absatz ist neu geschrieben, bitte gegenlesen.

## Lantern Island auf itch.io

17. Die itch.io-Seite ließ sich aus meiner Umgebung nicht öffnen, die Adresse steht genau so im Code, wie du sie geschickt hast: `https://wadasxxx.itch.io/lantern-island`. Bitte den Knopf nach dem Hochladen einmal anklicken.
18. Ich schreibe „Die Fassung läuft als Download auf itch.io.“ Falls sie im Browser spielbar ist, sag Bescheid, dann ändere ich den Satz.
19. Auf dem Titelbild steht „The grey has swallowed the island.“ Das Spiel ist auf Englisch. Soll das im deutschen Text so bleiben? Zurzeit steht der Vorspann im Wortlaut da, der Rest ist deutsch.
20. Glimmer: Woher kommen sie, und wofür werden sie ausgegeben? Zurzeit steht nur, dass sie sich rufen und losschicken lassen, weil das auf dem Titelbild steht.

## Campus Quest

21. **Teamkollegen:** Auf der Seite steht nur „Team zu viert“. Wenn die drei einverstanden sind, schick mir die Namen, dann trage ich sie ein.
22. **Panorama-Aufnahmen** stehen beim Team. Hast du selbst fotografiert? Dann wandern sie zu „Mein Anteil“.
23. **Fotos der Räume:** Studio, Bildregie und Aufnahmeraum sind öffentlich zu sehen. Ist das mit der Hochschule geklärt?
24. **Zahlen** (59 Szenen, 42 Panoramen, 280+ Elemente, 22 Zustandsmerker, rund 2 500 geprüfte Spielstände) habe ich aus deinen Unterlagen übernommen. Bitte einmal bestätigen.
25. **Spielbar?** Lässt sich das PaneoVR-Projekt öffentlich erreichbar machen? Dann baue ich einen Knopf wie bei Lantern Island ein.
26. Die mitgelieferte Einzelseite habe ich nicht eingebaut, sondern ihre Inhalte in die Projektseite überführt, damit alles eine Gestaltung, eine Navigation und beide Sprachen hat. Die Panoramen, der Graph und Pannellum sind übernommen.

## Aus der Richtigstellung (v64)

27. **Abschlussdatum.** Oktober 2027 steht jetzt auf der Startseite und der Engineering-Seite. Im Oktober hattest du gesagt, niemand solle wissen, wann du fertig bist. Diesmal hast du es ausdrücklich verlangt, deshalb steht es drin. Ein Wort von dir, und es ist wieder raus.
28. **Bifrost, ZBrush, DaVinci Resolve** stehen jetzt bei den Werkzeugen, aber in keinem Projekt auf der Seite. In welchen Arbeiten kommen sie vor? Dann kann ich sie dort zeigen statt nur zu listen.
29. ~~Unreal Engine unter „Erste Erfahrungen“~~ — erledigt mit dem neuen Lebenslauf: steht jetzt gleichberechtigt bei Echtzeit & VR.
30. **Die sechs 3D-Studien** (Futuristic Bunker, Robot Study, Apocalypse, Character Studies, Isometric Room, Security Camera) stehen weiter auf „Folgt“. Jetzt, wo 3D vorn steht, wirkt das schwach. Sollen sie auf „vollständig gezeigt“ wechseln? Dann brauche ich je zwei, drei Sätze zur Einordnung.
31. ~~Lebenslauf (PDF) veraltet~~ — erledigt: neue einseitige Fassung eingebaut, ohne Adresse und Telefonnummer.
32. **Film, Animation und VFX** nennst du als Zielbereich. Belegt sind Motion Design, die E-Sports-Overlays und die Abschlussfeier, alle ohne Bildmaterial. Mit Material dazu wird dieser Bereich sichtbar.

33. **Hero-Video.** `public/videos/hero.mp4` liegt weiter im Ordner, wird aber nicht mehr geladen. Soll es raus (5,5 MB)?

## Technisch

15. **Sicherungs-Branch:** aus der Sandbox ist kein Push möglich. Vor dem Entpacken von v60 einmal ausführen (siehe Antwort im Chat).
16. **Firebase:** Firestore-Regeln von Qrib prüfen (öffentlicher Web-API-Key in `provider.html`). OpenAI-Schlüssel aus `kilesebuch.zip` erneuern, falls noch nicht geschehen.
