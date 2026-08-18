# Projekte & Bilder pflegen

Alles läuft über eine einzige Datei:
`src/data/projects.ts`

## Neues Projekt hinzufügen

**1. Bilder ablegen** unter
`public/images/projects/<projekt-id>/`

Empfehlung: JPG, max. 1920 px breit, Qualität ~84.
Die Bilder werden **nicht beschnitten** — jedes Seitenverhältnis geht.

**2. Eintrag ergänzen** im Array `projectsData`:

    {
      id:             "neues-projekt",        // = Ordnername, eindeutig
      title:          "Projekt Titel",
      category:       "Sci-Fi Environment",   // Untertitel
      filterCategory: "3D Modeling",
      role:           "3D Environment Artist",
      year:           "2026",
      featured:       true,                   // optional, zeigt "Featured"
      tools:          ["Autodesk Maya", "Arnold"],
      description:    "Ein Satz.",
      longDescription:"Längerer Text für die Info-Spalte.",
      shots: [
        { src: "/images/projects/neues-projekt/01.jpg",
          caption: "Final render", w: 1920, h: 1080 },
        { src: "/images/projects/neues-projekt/02.jpg",
          caption: "Wireframe",    w: 1270, h: 680 },
      ],
    }

## Wichtig: w und h

`w` und `h` sind die **echten Pixelmaße** des Bildes. Sie sorgen dafür, dass

- die Seite beim Laden nicht springt,
- Hochformat automatisch schmaler gesetzt wird als Querformat.

Maße auslesen: Rechtsklick auf die Datei → Eigenschaften/Informationen.

## Reihenfolge

Die Reihenfolge im Array = Reihenfolge auf der Seite. Nummerierung,
Sprungmarken im Index, Parallax und Lightbox ergeben sich automatisch.

## Bild entfernen

Zeile aus `shots` löschen. Ganzes Projekt: den kompletten Block löschen.
Kein weiterer Code muss angefasst werden.

## Noch offen

- **Portrait** im About-Bereich (aktuell Platzhalter):
  Bild nach `public/images/avatar.jpg` legen, dann in `src/pages/Home.tsx`
  den Platzhalter-Block durch ein `<img>` ersetzen.
- **Social-Links** in `src/pages/Home.tsx` zeigen noch auf `#`.
- **Bio und Tools-Liste** im About-Bereich stehen noch auf dem alten Stand.

## Vergleichs-Regler (Shaded / Wireframe)

Zwei Ansichten uebereinander mit ziehbarem Griff. Im Projekt:

    compare: {
      before: { src: ".../02.jpg", caption: "Viewport", w: 1272, h: 683 },
      after:  { src: ".../03.jpg", caption: "Wireframe", w: 1272, h: 685 },
      beforeLabel: "Shaded",
      afterLabel: "Wireframe",
    },

**Wichtig:** Beide Bilder muessen aus DERSELBEN Kamera stammen.
In Maya also nur die Anzeige umschalten (Taste 4 / 5) und die
Kamera nicht bewegen. Sonst springt das Bild beim Ziehen und der
Effekt wirkt kaputt.

Aktuell aktiv bei "Isometric Room" und "Asset & Texturing Studies".
Bei den anderen Projekten unterscheiden sich die Blickwinkel.

## Lebenslauf-Download

Standardmaessig ausgeblendet, damit kein toter Link entsteht.
Zum Aktivieren: PDF nach `public/` legen und in
`src/pages/Home.tsx` ganz oben eintragen:

    const CV_FILE: string | null = "/Issam-Selmi-CV.pdf";

Der Button erscheint dann im Kontaktbereich.
