# Seite bei einem anderen Anbieter online stellen

Falls Netlify ausfaellt oder das Konto gesperrt ist: Der komplette
Code liegt auf GitHub, ein Umzug dauert etwa zehn Minuten.
Es muss nichts am Projekt geaendert werden — die noetigen
Konfigurationsdateien liegen bereits bei:

    netlify.toml      fuer Netlify
    public/_redirects fuer Cloudflare Pages und Netlify
    vercel.json       fuer Vercel

---

## Variante 1 — Cloudflare Pages (Empfehlung)

1. Konto auf https://dash.cloudflare.com anlegen
2. Workers & Pages → Create → Pages → Connect to Git
3. Repository `portfolio` auswaehlen
4. Einstellungen:

       Framework preset:    None
       Build command:       npm run build
       Output directory:    dist

5. Save and Deploy

Die Seite ist danach unter <name>.pages.dev erreichbar.

**Domain verbinden:** Custom domains → Set up a domain →
`issamselmi.de` eintragen. Cloudflare fuehrt durch die
Nameserver-Umstellung beim Registrar. Danach ein bis zwei
Stunden warten.

---

## Variante 2 — Vercel

1. Konto auf https://vercel.com anlegen
2. Add New → Project → Repository `portfolio` importieren
3. Vercel erkennt Vite selbst. Falls nachgefragt:

       Build command:      npm run build
       Output directory:   dist

4. Deploy

**Domain verbinden:** Settings → Domains → `issamselmi.de`.
Hier kann die DNS beim Registrar bleiben, es genuegen zwei
Eintraege, die Vercel anzeigt.

---

## Wichtig zur Domain

Die Domain gehoert dir beim Registrar, nicht beim Hoster.
Sie geht nie verloren.

**Aber:** Wenn beim Registrar die Nameserver des Hosters
eingetragen sind (bei Netlify z. B. dns1.p01.nsone.net), laeuft
die gesamte Namensaufloesung ueber diesen Hoster. Faellt er aus,
ist die Domain komplett nicht erreichbar — nicht nur die Seite.

Beim neuen Anbieter also entweder dessen Nameserver eintragen
oder die DNS beim Registrar behalten und dort nur A- und
CNAME-Eintraege setzen. Die zweite Variante macht dich vom
Hoster unabhaengiger.

---

## Aktualisieren bleibt gleich

    git add .
    git commit -m "beschreibung"
    git push

Cloudflare und Vercel bauen genau wie Netlify automatisch neu.
