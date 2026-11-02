"""Builds the static Kiko site into ../kiko from page templates.
Template tokens:  {{i:name}} icon · {{scene}} / {{scene:dusk}} hero layers
"""
import json, re, os, datetime
from scene import scene

OUT = os.environ.get('KIKO_OUT', os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = 'https://kikothekasadragon.com'   # change to the real domain when it's live
YEAR = datetime.date.today().year

NAV = [('index.html', 'Home'), ('about.html', 'About Kiko'), ('adventures.html', 'Adventures'),
       ('gives-back.html', 'Kiko Gives Back'), ('book.html', 'Events & Bookings'),
       ('school-events.html', 'School Events'),
       ('shop.html', 'Shop'), ('contact.html', 'Contact')]


def icon(name, cls='ico'):
    sym = name if name.startswith('s-') else 'i-' + name
    return f'<svg class="{cls}" aria-hidden="true"><use href="/assets/icons.svg#{sym}"/></svg>'


def tokens(html):
    html = re.sub(r'\{\{i:([\w-]+)\}\}', lambda m: icon(m.group(1)), html)
    html = html.replace('{{scene:dusk}}', scene('dusk')).replace('{{scene}}', scene('day'))
    html = html.replace('{{year}}', str(YEAR)).replace('{{socials}}', social_links()).replace('{{tel}}', f'<a href="tel:{PHONE}">{PHONE_SHOW}</a>')
    html = re.sub(r'\[\[wave:([^\]]+)\]\]', lambda m: wave(m.group(1)), html)
    html = re.sub(r'\[\[wave-b:([^\]]+)\]\]', lambda m: wave(m.group(1), True), html)
    return html


WAVE = '<svg class="wave{cls}" viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden="true"><path fill="currentColor" d="M0,0 L1440,0 L1440,26 C1200,64 980,8 720,36 C470,62 250,10 0,40 Z"/></svg>'


def wave(color='#fff', bottom=False):
    return WAVE.replace('{cls}', ' bottom' if bottom else '').replace('class="wave', f'style="color:{color}" class="wave', 1)


PHONE = '+61449966222'          # same number as Kasa (Kiko is part of KASA Essentials)
PHONE_SHOW = '+61 449 966 222'
SOCIALS = [('instagram', 'https://www.instagram.com/kikothekasadragon/', 'Instagram'),
           ('facebook', 'https://www.facebook.com/profile.php?id=61593852687662', 'Facebook'),
           ('youtube', 'https://www.youtube.com/@KikoTheKasaDragon', 'YouTube')]


def social_links():
    return ''.join(f'<a href="{u}" target="_blank" rel="noopener" aria-label="Kiko on {n}"><svg aria-hidden="true"><use href="/assets/icons.svg#s-{k}"/></svg></a>' for k, u, n in SOCIALS)


ORG = {
    "@type": "Organization", "@id": f"{SITE}/#kasa", "name": "Kasa Essentials Pty Ltd",
    "url": "https://kasaessentials.com", "address": {"@type": "PostalAddress", "addressCountry": "AU"}
}
BRAND = {
    "@type": "Organization", "@id": f"{SITE}/#kiko", "name": "Kiko — The KASA Dragon",
    "alternateName": ["Kiko", "Kiko the KASA Dragon", "Kiko the dragon mascot"],
    "url": SITE + "/", "logo": f"{SITE}/assets/img/icon-512.png", "image": f"{SITE}/assets/img/og-kiko-real.jpg",
    "description": "Kiko — The KASA Dragon is a friendly Australian family character who appears at schools, community festivals, sporting events, shopping centres, corporate family days and charity events.",
    "telephone": PHONE,
    "parentOrganization": {"@type": "Organization", "@id": f"{SITE}/#kasa", "name": "Kasa Essentials Pty Ltd", "url": "https://kasaessentials.com"},
    "sameAs": [u for _, u, _ in SOCIALS], "areaServed": {"@type": "Country", "name": "Australia"},
    "slogan": "Big Adventures. Brighter Tomorrows."
}


def head(page):
    url = f"{SITE}/{'' if page['file'] == 'index.html' else page['file']}"
    graph = [ORG, BRAND, {"@type": "WebSite", "@id": f"{SITE}/#site", "url": SITE + "/", "name": "Kiko — The KASA Dragon", "publisher": {"@id": f"{SITE}/#kiko"}, "inLanguage": "en-AU"},
             {"@type": "WebPage", "@id": url + "#page", "url": url, "name": page['title'], "description": page['desc'], "isPartOf": {"@id": f"{SITE}/#site"}, "about": {"@id": f"{SITE}/#kiko"}, "inLanguage": "en-AU"}]
    if page['file'] != 'index.html':
        graph.append({"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": page['crumb'], "item": url}]})
    graph += page.get('schema', [])
    ld = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False)
    robots = '<meta name="robots" content="noindex">' if page.get('noindex') else ''
    pre = {'/assets/img/kiko-wave-900.webp': 'kiko-wave', '/assets/img/kiko-wave-r-900.webp': 'kiko-wave-r', '/assets/img/kiko-open-1400.webp': 'kiko-open'}
    pk = pre.get(page.get('preload', '/assets/img/kiko-wave-900.webp'), 'kiko-wave')
    small, big, bw = {'kiko-wave': ('560', '900', '877'), 'kiko-wave-r': ('560', '900', '877'), 'kiko-open': ('760', '1400', '1400')}[pk]
    if pk == 'kiko-wave': pk = 'kiko-wave-body'
    preload_tag = f'<link rel="preload" as="image" imagesrcset="/assets/img/{pk}-{small}.webp {small}w, /assets/img/{pk}-{big}.webp {bw}w" imagesizes="(max-width:900px) 78vw, 46vw" fetchpriority="high">'
    return f'''<!doctype html>
<html lang="en-AU" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{page['title']}</title>
<meta name="description" content="{page['desc']}">
{robots}
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#13843f">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Kiko — The KASA Dragon">
<meta property="og:title" content="{page['title']}">
<meta property="og:description" content="{page['desc']}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/assets/img/og-kiko-real.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:locale" content="en_AU">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/icon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/img/icon-180.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/shantell.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/figtree.woff2" as="font" type="font/woff2" crossorigin>
{preload_tag}
<link rel="stylesheet" href="/assets/css/kiko.css?v={page['v']}">
<script>document.documentElement.classList.replace('no-js','js')</script>
<script type="application/ld+json">{ld}</script>
</head>
<body data-page="{page['key']}">
<a class="skip" href="#main">Skip to content</a>
'''


def header(page):
    links = ''.join(
        f'<li><a href="/{f if f != "index.html" else ""}"{" aria-current=\"page\"" if f == page["file"] else ""}>{t}</a></li>'
        for f, t in NAV)
    mlinks = ''.join(f'<a href="/{f if f != "index.html" else ""}">{t}</a>' for f, t in NAV)
    return f'''<header class="site-head" id="top">
  <nav class="nav wrap" aria-label="Main">
    <a class="logo" href="/" aria-label="Kiko — The KASA Dragon, home">
      <img src="/assets/img/kiko-head-360.webp" alt="" width="46" height="46">
      <span><b>Kiko</b><small>The KASA Dragon</small></span>
    </a>
    <ul class="nav-links">{links}</ul>
    <a class="btn btn-sm" href="/book.html#enquire" data-track="nav_book">{icon('calendar-heart')}<span>Book Kiko</span></a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu">{icon('menu')}</button>
  </nav>
</header>
<div class="mobile-menu" id="mobile-menu" aria-label="Menu">
  <button class="menu-btn close" type="button" aria-label="Close menu" style="display:inline-flex">{icon('x')}</button>
  {mlinks}
  <a class="btn" href="/book.html#enquire">{icon('calendar-heart')} Book Kiko</a>
</div>
'''


def footer(page):
    import pages as P
    BUDDY_EYES = P.lids('head')
    return f'''<footer class="site-foot">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <a class="logo" href="/"><img src="/assets/img/kiko-head-360.webp" alt="" width="46" height="46" loading="lazy"><span><b>Kiko</b><small>The KASA Dragon</small></span></a>
        <p class="owner">Kiko — The KASA Dragon is created and owned by KASA Essentials Pty Ltd.</p>
        <a class="kasa-mark" href="https://kasaessentials.com" rel="noopener" aria-label="KASA Essentials"><b>KASA</b><span>ESSENTIALS</span></a>
      </div>
      <div>
        <h4>Explore</h4>
        <ul><li><a href="/about.html">About Kiko</a></li><li><a href="/adventures.html">Kiko’s Adventures</a></li><li><a href="/gives-back.html">Kiko Gives Back</a></li><li><a href="/gallery.html">Gallery</a></li></ul>
      </div>
      <div>
        <h4>Work with Kiko</h4>
        <ul><li><a href="/book.html">Events &amp; Bookings</a></li><li><a href="/book.html#deposit">Pay a booking deposit</a></li><li><a href="/contact.html?reason=Community%20Partnership">Partner with Kiko</a></li><li><a href="/shop.html">Shop</a></li><li><a href="/contact.html">Contact</a></li><li><a href="tel:{PHONE}">{PHONE_SHOW}</a></li></ul>
      </div>
      <div>
        <h4>Follow Kiko’s adventures</h4>
        <div class="socials" data-socials>{social_links()}</div>
        <p class="foot-tag" style="margin-top:18px">A kinder, brighter Australia.</p>
      </div>
    </div>
    <div class="foot-base">
      <span>© Kiko — The KASA Dragon {YEAR}. All rights reserved.</span>
      <span><a href="https://kasaessentials.com" rel="noopener">Created by KASA Essentials</a></span>
      <span><a href="/privacy.html">Privacy Policy</a> · <a href="/terms.html">Terms of Use</a> · <a href="/contact.html">Contact</a></span>
    </div>
  </div>
</footer>
<a class="buddy" href="/book.html#enquire" data-buddy aria-label="Book Kiko for your event" data-track="buddy_book"><span class="buddy-bubble">Want me at your event?</span><span class="kiko-art buddy-art"><img src="/assets/img/kiko-head-360.webp" alt="" width="360" height="360" loading="lazy">{BUDDY_EYES}</span></a>
<div class="book-bar" aria-hidden="true"><a class="btn" href="/book.html#enquire" tabindex="-1" data-track="bar_book">{icon('calendar-heart')} Book Kiko for your event</a></div>
<script src="/assets/js/config.js?v={page['v']}"></script>
<script src="/assets/js/gsap.min.js" defer></script>
<script src="/assets/js/ScrollTrigger.min.js" defer></script>
<script src="/assets/js/lenis.min.js" defer></script>
<script src="/assets/js/kiko.js?v={page['v']}" defer></script>
</body>
</html>
'''


def build():
    import pages as P
    v = datetime.datetime.now().strftime('%Y%m%d%H%M')
    for page in P.PAGES:
        page['v'] = v
        body = tokens(page['body'])
        html = head(page) + header(page) + '<main id="main">\n' + body + '\n</main>\n' + footer(page)
        open(os.path.join(OUT, page['file']), 'w').write(html)
        print('built', page['file'], len(html))
    # sitemap (most important pages first, one line each)
    order = ['index.html', 'book.html', 'school-events.html', 'about.html', 'adventures.html', 'gives-back.html', 'gallery.html', 'shop.html', 'contact.html', 'privacy.html', 'terms.html']
    today = datetime.date.today().isoformat()
    urls = '\n'.join(f'  <url><loc>{SITE}/{"" if f == "index.html" else f}</loc><lastmod>{today}</lastmod></url>' for f in order)
    open(os.path.join(OUT, 'sitemap.xml'), 'w').write(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}\n</urlset>\n')
    open(os.path.join(OUT, 'robots.txt'), 'w').write(f'User-agent: *\nAllow: /\nDisallow: /thank-you.html\nDisallow: /admin.html\n\nSitemap: {SITE}/sitemap.xml\n')


if __name__ == '__main__':
    build()
