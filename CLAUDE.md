# Luminary Studio — Agency Website

Statische Marketing-Website (HTML/CSS/Vanilla JS, kein Build-Step) für die fiktive Webdesign-Agentur **Luminary Studio**. Zielgruppe: KMU, Restaurants, lokale Geschäfte, Start-ups im DACH-Raum. Deutsch primär, Englisch per Toggle.

## Brand Identity (verbindlich)
- **Tagline:** "Where vision meets light." (bleibt in beiden Sprachen Englisch)
- **Ton:** Modern, clean, premium, vertrauenswürdig — High-End-Studio, nicht corporate-kalt
- **Farben:** Navy `#0C2340` (primär) · Steel Blue `#44607D` · Gold `#D9A441` (NUR Akzent) · Off-White `#F7F5F0` (Hintergrund) · Near Black `#1A1A1A` (Text) — als CSS-Variablen in `css/style.css`
- **Typografie:** Space Grotesk Bold für Headlines (letter-spacing −0.015em), Inter Regular für Fließtext (Google Fonts)
- **Logo:** Goldener geometrischer Spark (Inline-SVG) über zweizeiliger Wortmarke „LUMINARY / STUDIO" in Navy; Footer-Variante hell

## Designregeln
- Minimalistisch, viel Weißraum; Gold nie flächig, nur als Highlight
- Border-Radius 8–12px, dezente Hover-Animationen (translateY + Schatten)
- Mobile-first responsive (Hamburger-Nav unter 860px)
- **Genau ein CTA pro Sektion** — nie mehr
- Keine Stock-Foto-Klischees; Portfolio-Thumbnails sind abstrakte SVG-Wireframes
- **Kein Video im Hero** — wurde ausprobiert und explizit verworfen; Hero bleibt hell (Off-White + Gold-Glow)

## Struktur
- `index.html` — Onepager: Hero, Leistungen (5 Cards), Über uns, Projekte (Filter), Kundenstimmen, Preise (Basic €1.490 / Pro €3.490 / Premium €6.900), Kontakt (Navy-Sektion), Footer
- `impressum.html`, `datenschutz.html` — Platzhalter-Rechtsseiten (vor Launch befüllen)
- `js/main.js` — DE/EN-Toggle (Deutsch inline, Englisch in `data-en`-Attributen, localStorage-persistiert), Mobile-Nav, Scroll-Reveals, Portfolio-Filter, Formular-Demo
- `assets/hero.mp4` — generiertes Higgsfield-Video, aktuell UNBENUTZT
- Spec: `docs/superpowers/specs/2026-07-06-luminary-studio-website-design.md`

## Sprachkonvention im Code
Neue sichtbare Texte immer zweisprachig anlegen: Deutsch als Inline-Text, Englisch im `data-en`-Attribut (Platzhalter: `data-en-placeholder`). Anker-IDs bleiben deutsch (`#leistungen`, `#ueber-uns`, `#projekte`, `#preise`, `#kontakt`).

## Entwicklung
Preview-Server: `.claude/launch.json` → `static-site` (npx http-server, Port 8321).

## Offene Punkte
- Gründerfoto ist gesetzt (`assets/founder.jpg`); Impressum-/Datenschutz-Daten und Social-Links (`#`) sind noch Platzhalter
- Kontaktformular ist Frontend-only (Backend/Formspree anbinden)
- 21st.dev MCP-Server konfiguriert, wartet auf gesetzte Env-Variable `API_KEY_21ST`
- UI/UX-Pro-Max-Skills installiert unter `.claude/skills/` (7 Skills)
