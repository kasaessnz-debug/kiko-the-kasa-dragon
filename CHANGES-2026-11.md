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

### Phone number (owner, 2026-11-02)
+61 449 966 222, the same number as Kasa, because Kiko is part of KASA Essentials.
- Every page except `admin.html`: `"telephone": "+61449966222"` added to the `#kiko` Organization schema, and a `tel:` link added as the last item in the footer's "Work with Kiko" list.
- `contact.html`: "Phone:" line added after the email line.
- `book.html`: "Prefer to talk? Call ..." added to the note under the enquiry form.
- `llms.txt`: "Phone:" added under Contact.
- `assets/js/config.js`: `phone` deliberately left blank. If it is set, `kiko.js` adds a second, script-written "Call or text" line on the contact page.

## 2026-11-02 (later): generator is back

The page generator is now in this repo at `_src/` (recovered from the 28 Oct update, which also adds the
real costume photos and videos, the Gallery rewrite and the visitor counter in Kiko HQ).
Everything listed above is now built into it, so running `python _src/build.py` keeps these changes:
- `_src/build.py`: `PHONE` (schema `telephone` + footer link), `SOCIALS` (footer links + schema `sameAs`), Kasa Essentials parent company, "Created by KASA Essentials" credit, School Events in the menu and sitemap.
- `_src/pages.py`: the new titles, the gallery socials (`{{socials}}`), the phone lines on Contact and Book (`{{tel}}`), and the School Events page, whose content lives in `_src/school_events.html`.
- The stylesheet version is set automatically on every build, so no manual `?v=` change is needed.
- Fixed: the Contact page list had its first two points repeated after the phone edit; it now shows each point once.

## 2026-11-02 (evening): Ray White video
- New video `assets/video/kiko-ray-white.mp4` (62s, 540x960, from the owner's IMG_1572.MOV) + poster.
- `adventures.html`: new "Latest adventure: Kiko visits Ray White" section above the snapshots, with an "Invite Kiko to your workplace" button. VideoObject schema on that page.
- `gallery.html`: the video added under Videos.
- `llms.txt`: Adventures line mentions the new video.
- All in the generator (`_src/pages.py`: `VIDEOS['ray-white']`, `VIDEO_DATES`; `.adv-feature` styles at the end of `assets/css/kiko.css`).

## 2026-11-02 (night): one address for every page
Search Console called /book.html "unknown to Google". Live, /book and /book.html both answered 200 with no redirect (the old /book 301 had no `force`, so Netlify never used it), so each page had two addresses.
Chosen form: the clean one, `/book`. Both forms answered 200, so that test was a tie; clean matches kasaessentials.com, whose forced `.html` 301s are proven live with no loop.
- Every page except `404.html`: canonical, `og:url`, schema URLs and internal links use the clean form. `404.html` keeps its filename because Netlify needs it; its links changed, its noindex canonical did not.
- `sitemap.xml`, `llms.txt`, `robots.txt`, `admin.webmanifest`: clean form.
- `netlify.toml`: forced 301 from `/<page>.html` to `/<page>` for all 13 pages, and `/index.html` to `/`. `/bookings` now goes straight to `/book`, `/hq` straight to `/admin` (no chains). Removed the old `/book` and `/admin` redirects, which pointed at the `.html` form and would have looped. `/admin` gets the same noindex and no-store headers as `/admin.html`.
- `netlify/functions/create-deposit.js`, `submission-created.js`: Stripe return addresses and the emailed deposit link use the clean form. Old emailed links still work through the 301, which keeps `?ref=`.
- `assets/js/kiko.js`: the book-link cheer now looks for `/book`.
- `_src/build.py` and `_src/pages.py`: same changes, so a rebuild keeps them. Not run: Python isn't installed on this PC.
