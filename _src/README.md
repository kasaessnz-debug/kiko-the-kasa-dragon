# Kiko site source

The HTML pages in the folder above are generated from these files. Edit here, then rebuild:

    cd _src
    python3 build.py

- `pages.py` – all page content (text, sections, photos, videos)
- `build.py` – page shell (head/SEO tags, header, footer) + sitemap/robots
- `scene.py` – the illustrated hero backgrounds
- `sprite.py` – original icon sprite builder. Careful: the live `assets/icons.svg` has extra icons added since, so only rebuild it if you add the missing names first.
- `eyes.json`, `hand.json` – positions for Kiko's moving eyes and waving hand

CSS/JS live in `assets/css/kiko.css` and `assets/js/kiko.js` (edited directly, not generated).
This folder is blocked from the public website by a rule in netlify.toml.
