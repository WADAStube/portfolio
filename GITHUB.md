# Updates ueber GitHub — einmalige Einrichtung

Danach gilt: Datei aendern → `git push` → Seite ist in ein bis zwei
Minuten aktualisiert. Kein Hochladen mehr von Hand.

---

## WICHTIG vorweg

Deine Domain **issamselmi.de** haengt bereits an der bestehenden
Netlify-Seite. Lege deshalb **KEINE neue Seite** in Netlify an —
sonst musst du die Domain umziehen.

Stattdessen verbindest du die **vorhandene** Seite mit GitHub.
Das steht unten in Schritt 4.

---

## Schritt 1 — Git installieren (falls noch nicht vorhanden)

Pruefen in der PowerShell:

    git --version

Falls Fehler: https://git-scm.com/download/win installieren,
danach PowerShell neu oeffnen.

Einmalig Name und Mail hinterlegen:

    git config --global user.name "Issam Selmi"
    git config --global user.email "issam-selmi@outlook.com"

---

## Schritt 2 — Repository auf GitHub anlegen

1. https://github.com/new oeffnen
2. Repository name: `portfolio`
3. **Private** waehlen (empfohlen — der Code muss nicht oeffentlich
   sein, die Website ist es ja trotzdem)
4. **Nichts** ankreuzen bei README, .gitignore oder Lizenz
5. "Create repository"

---

## Schritt 3 — Projekt hochladen

In der PowerShell in den Projektordner wechseln:

    cd C:\Users\WADAS\Documents\Production\portfolio-v9

Dann:

    git init
    git add .
    git commit -m "Portfolio"
    git branch -M main
    git remote add origin https://github.com/WADAStube/portfolio.git
    git push -u origin main

Beim ersten Push fragt GitHub nach Anmeldung — das oeffnet ein
Browserfenster. Dort einfach bestaetigen.

**Kontrolle:** Auf github.com/WADAStube/portfolio muessen die
Ordner `src` und `public` liegen — aber KEIN `node_modules`.
Dafuer sorgt die Datei `.gitignore`.

---

## Schritt 4 — Netlify mit GitHub verbinden

Im Netlify-Dashboard deine **bestehende** Seite oeffnen, dann:

**Site configuration → Build & deploy → Continuous deployment**

Dort auf **"Link repository"** klicken, GitHub waehlen, das
Repository `portfolio` auswaehlen.

Build-Einstellungen musst du nicht ausfuellen — die Datei
`netlify.toml` im Projekt regelt das bereits:

    Build command:      npm run build
    Publish directory:  dist
    Node version:       22

Speichern. Netlify baut die Seite einmal komplett neu.
Deine Domain bleibt dabei unveraendert.

---

## Ab jetzt: so machst du Updates

Aendere etwas, zum Beispiel einen Text in
`src/components/about-section.tsx`. Lokal pruefen:

    npm run dev

Wenn es passt:

    git add .
    git commit -m "About-Text angepasst"
    git push

Fertig. Netlify merkt die Aenderung selbst, baut neu und
veroeffentlicht. Nach ein bis zwei Minuten ist issamselmi.de aktuell.

Den Fortschritt siehst du in Netlify unter **Deploys**.

---

## Kurzfassung fuer jedes Update

    git add .
    git commit -m "beschreibung"
    git push

Diese drei Zeilen sind alles, was du kuenftig brauchst.

---

## Wenn etwas schiefgeht

**Deploy schlaegt fehl** → In Netlify unter "Deploys" den roten
Eintrag anklicken, das Log zeigt die Ursache. Meist ein Tippfehler
im Code. Lokal `npm run build` ausfuehren, dann siehst du denselben
Fehler und kannst ihn beheben.

**Alte Version zurueckholen** → In Netlify unter "Deploys" einen
frueheren Eintrag oeffnen und "Publish deploy" klicken. Die Seite
springt sofort zurueck. Sehr nuetzlich, falls mal etwas kaputtgeht.

**"failed to push some refs"** → Jemand (oder du an einem anderen
Rechner) hat zwischendurch etwas geaendert. Loesung:

    git pull --rebase
    git push

**Datei zu gross** → GitHub nimmt einzelne Dateien bis 100 MB.
Dein Hero-Video liegt bei 5,5 MB, alles unproblematisch.

---

## Bilder oder Projekte hinzufuegen

Genau wie bisher: Dateien nach `public/images/projects/<id>/`
legen und `src/data/projects.ts` ergaenzen (siehe
BILDER-ANLEITUNG.md). Danach die drei Git-Zeilen von oben.
