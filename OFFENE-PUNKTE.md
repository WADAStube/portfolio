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

## Technisch

15. **Sicherungs-Branch:** aus der Sandbox ist kein Push möglich. Vor dem Entpacken von v60 einmal ausführen (siehe Antwort im Chat).
16. **Firebase:** Firestore-Regeln von Qrib prüfen (öffentlicher Web-API-Key in `provider.html`). OpenAI-Schlüssel aus `kilesebuch.zip` erneuern, falls noch nicht geschehen.
