# KIKO site changes, November 2026

The page generator `_src/build.py` is not in this repo (it is on a laptop in repair), so these
edits were made directly in the HTML. **If the generator comes back, re-apply everything below to it,
or the next build will undo them.**

## 2026-11-02

Socials (from the Kiko card, `kiko.html`, in the Kasa repo):
- Instagram: https://www.instagram.com/kikothekasadragon/
- Facebook: https://www.facebook.com/profile.php?id=61593852687662
- YouTube: https://www.youtube.com/@KikoTheKasaDragon

### On every page except `admin.html` (private dashboard, has no footer or schema)
404, about, adventures, book, contact, deposit, gallery, gives-back, index, privacy, shop, terms, thank-you, plus the new page.

1. **Schema.** In the `#kiko` Organization, `parentOrganization` was `{"@id": ".../#kasa"}`. It now carries
   `"@type": "Organization"`, `"name": "Kasa Essentials Pty Ltd"` and `"url": "https://kasaessentials.com"`, and
   `sameAs` lists the three socials. The `#kasa` node's name changed from "KASA Essentials Pty Ltd" to match.
2. **Footer socials.** "Kiko’s social pages are on their way." replaced with real links to the three socials, in the HTML itself.
3. **Footer credit.** Added to `.foot-base`: `<a href="https://kasaessentials.com" rel="noopener">Created by KASA Essentials</a>`.
4. **Menu.** "School Events" added straight after "Events & Bookings", in both `.nav-links` and `.mobile-menu`.

### Titles
Each also replaced in `og:title` and the WebPage schema name.
- `index.html`: "Kiko — The KASA Dragon | Book Australia’s friendliest dragon mascot" became "Kiko — The KASA Dragon | Mascot from Melbourne, Australia"
- `book.html`: "Book Kiko — Dragon mascot for events across Australia | Kiko — The KASA Dragon" became "Book Kiko — Dragon mascot from Melbourne, across Australia"

### Other files
- `assets/js/config.js`: `socials.instagram`, `facebook` and `youtube` filled in, because `kiko.js` fills every `data-socials` block from it, including the one on `gallery.html`.
- `llms.txt`: added "Based in Melbourne", the parent company link, a Social section and the School events page.
- `sitemap.xml`: added `/school-events.html`; every `lastmod` set to 2026-11-02, as every listed page changed.
- **New page `school-events.html`**: built from the `about.html` template. Every fact comes from `book.html`, `adventures.html` or `terms.html`, except the words "fete", "sports day" and "kindness week", which are the owner's.
- **Header breakpoint.** `assets/css/kiko.css`: the hamburger menu now takes over at `max-width:1260px` instead of `1120px`, because the extra menu item pushed the "Book Kiko" button off screen below about 1240px wide. The stylesheet link on every page changed from `kiko.css?v=202610120204` to `kiko.css?v=202611020100`, because assets are cached as immutable. `admin.html` does not use this link.
- **New file `CHANGES-2026-11.md`**: this log.
