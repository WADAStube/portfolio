# Website veroeffentlichen — mit eigener Domain

Ziel: **https://issamselmi.com** zeigt direkt deine Seite.
Keine Weiterleitung, kein Unterordner, kein Fremdname in der URL.

Das Portfolio ist eine statische Seite. Sie braucht keinen Server
und keine Datenbank — dadurch ist das Hosting kostenlos und schnell.

---

## Schritt 1 — Domain kaufen

Empfehlung: **Namecheap**, **Porkbun** oder **INWX** (deutsch).
Kosten ca. 10–15 EUR im Jahr fuer eine .com.

Vorschlaege: `issamselmi.com`, `issam-selmi.com`, `selmi.studio`

**Wichtig:** WHOIS-Privacy aktivieren (meist gratis), sonst steht
deine Privatadresse oeffentlich im Domain-Register.

---

## Schritt 2 — Bei Netlify hochladen

1. Build erzeugen:

       npm run build

   Es entsteht der Ordner `dist/`.

2. Auf https://app.netlify.com registrieren (kostenlos).

3. "Add new site" → "Deploy manually".

4. Den **Inhalt** von `dist/` in das Feld ziehen —
   nicht den Ordner selbst, sondern seinen Inhalt.

5. Die Seite ist sofort online unter einer Adresse wie
   `random-name-12345.netlify.app`.

---

## Schritt 3 — Domain verbinden

In Netlify: **Site configuration → Domain management → Add domain**

Domain eintragen, z.B. `issamselmi.com`. Netlify zeigt dir dann die
noetigen Eintraege. Die traegst du beim Domain-Anbieter ein
(dort unter "DNS" oder "Nameserver").

### Variante A — Netlify DNS (empfohlen, weniger Fehlerquellen)

Netlify gibt dir vier Nameserver, etwa:

    dns1.p01.nsone.net
    dns2.p01.nsone.net
    dns3.p01.nsone.net
    dns4.p01.nsone.net

Diese beim Domain-Anbieter als Nameserver eintragen und die
vorhandenen ersetzen. Alles Weitere macht Netlify automatisch.

### Variante B — DNS beim Anbieter lassen

Dann brauchst du zwei Eintraege:

    Typ    Name    Wert
    A      @       <IP aus deinem Netlify-Dashboard>
    CNAME  www     <dein-name>.netlify.app

Den A-Record-Wert bitte aus dem Netlify-Dashboard uebernehmen und
nicht hier abschreiben — er kann sich aendern.

**Wartezeit:** DNS-Aenderungen brauchen 10 Minuten bis 24 Stunden.
Meist ist es nach etwa einer Stunde erledigt.

---

## Schritt 4 — Keine Weiterleitung

Damit `issamselmi.com` die echte Adresse ist und nicht auf
`www.issamselmi.com` umgeleitet wird:

Netlify → **Domain management → Primary domain**

Dort `issamselmi.com` (ohne www) als Primary domain setzen.
Die www-Variante bleibt als Weiterleitung bestehen — das ist
richtig so, damit auch Leute ankommen, die www eintippen.

---

## Schritt 5 — HTTPS

Netlify stellt automatisch ein kostenloses Zertifikat aus
(Let's Encrypt), sobald die DNS-Eintraege greifen. Nichts zu tun.

Kontrolle: Die Seite muss unter `https://` erreichbar sein und das
Schloss-Symbol im Browser zeigen.

---

## Spaeter aktualisieren

Nach jeder Aenderung:

    npm run build

Dann in Netlify unter **Deploys** den Inhalt von `dist/` erneut
hineinziehen. Fertig.

### Komfortabler: ueber GitHub

Projekt auf GitHub legen und Netlify damit verbinden. Dann genuegt
ein `git push`, und Netlify baut und veroeffentlicht selbststaendig.

    Build command:      npm run build
    Publish directory:  dist

---

## Vor dem Livegang noch erledigen

- Social-Links in `src/pages/Home.tsx` zeigen noch auf `#`
  (Instagram, LinkedIn, ArtStation)
- `public/opengraph.jpg` ist noch die alte Grafik. Das ist das
  Vorschaubild beim Teilen auf LinkedIn und WhatsApp — am besten
  durch einen starken Render ersetzen, 1200x630 px.
