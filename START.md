# Portfolio lokal starten

## 1. Node.js installieren

Falls noch nicht vorhanden: https://nodejs.org — die **LTS**-Version.
Prüfen in der PowerShell:

    node -v

Sollte v20 oder höher zeigen.

**pnpm wird NICHT gebraucht.** Diese Version läuft mit normalem npm.

## 2. In den Ordner wechseln

Ordner entpacken, dann in der PowerShell dorthin wechseln — der Ordner,
in dem die `package.json` liegt:

    cd C:\Users\WADAS\Documents\Production\portfolio

Kontrolle: `dir` muss `package.json`, `index.html` und `src` zeigen.

## 3. Installieren

    npm install

Dauert beim ersten Mal etwa eine Minute.

## 4. Starten

    npm run dev

Der Browser öffnet sich automatisch auf **http://localhost:5173**

Zum Beenden: `Strg + C` im Terminal.

Änderungen an Dateien erscheinen sofort im Browser, ohne Neustart.

---

## Weitere Befehle

| Befehl            | Was es tut                                        |
|-------------------|---------------------------------------------------|
| `npm run dev`     | Entwicklungsserver mit Hot Reload                 |
| `npm run build`   | Fertige Website nach `dist/` bauen (zum Hochladen)|
| `npm run preview` | Den fertigen Build lokal ansehen                  |
| `npm run typecheck` | TypeScript prüfen                               |

## Online stellen

    npm run build

Danach den kompletten Inhalt des Ordners `dist/` auf Netlify, Vercel
oder einen Webspace hochladen. Fertig — es ist eine statische Seite,
es braucht keinen Server und keine Datenbank.

---

## Wo liegt was

    portfolio/
    ├── public/
    │   ├── images/projects/<id>/   ← deine Screenshots
    │   └── videos/hero.mp4         ← Hero-Video
    └── src/
        ├── data/projects.ts        ← ALLE Projektinhalte (hier editieren)
        ├── pages/Home.tsx          ← Seitenaufbau
        └── components/
            ├── project-showcase.tsx   Sticky-Scroll-Präsentation
            ├── motion-primitives.tsx  Reveal / Parallax / SplitText
            ├── lightbox.tsx           Vollbild-Viewer
            └── navbar.tsx

Für Inhaltsänderungen reicht fast immer `src/data/projects.ts`.
Siehe `BILDER-ANLEITUNG.md`.

## Wenn etwas nicht geht

**„npm wird nicht erkannt"** → Node.js ist nicht installiert oder die
PowerShell muss neu geöffnet werden.

**„Cannot find module"** → `npm install` wurde nicht im richtigen Ordner
ausgeführt. Prüfen, ob `package.json` im aktuellen Verzeichnis liegt.

**Port 5173 belegt** → `npm run dev -- --port 3000`
