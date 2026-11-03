"""Page content for the Kiko site. Copy follows the Kiko website master brief."""
import os

IMG = {
    'wave': ('/assets/img/kiko-wave-560.webp 560w, /assets/img/kiko-wave-900.webp 877w', '/assets/img/kiko-wave-900.webp', 877, 900),
    'wave-r': ('/assets/img/kiko-wave-r-560.webp 560w, /assets/img/kiko-wave-r-900.webp 877w', '/assets/img/kiko-wave-r-900.webp', 877, 900),
    'open': ('/assets/img/kiko-open-760.webp 760w, /assets/img/kiko-open-1400.webp 1400w', '/assets/img/kiko-open-1400.webp', 1400, 1000),
    'coast': ('/assets/img/kiko-coast-800.webp 800w, /assets/img/kiko-coast-1536.webp 1536w', '/assets/img/kiko-coast-1536.webp', 1536, 1024),
}
for _k, _w, _h in (('point', 1717, 2576), ('portrait', 1717, 2576), ('stand', 1717, 2576), ('thumbs', 1717, 2576), ('street', 1449, 2576)):
    IMG['r-' + _k] = (', '.join(f'/assets/img/real/kiko-{_k}-{x}.webp {x}w' for x in (480, 900, 1400)), f'/assets/img/real/kiko-{_k}-900.webp', _w, _h)
ALT = {
    'wave': 'Kiko the KASA Dragon — a green felt dragon with orange spikes and a sunny yellow belly — waving hello',
    'wave-r': 'Kiko the KASA Dragon waving hello',
    'open': 'Kiko the KASA Dragon stretching his arms out wide with a big smile',
    'coast': 'Kiko with his backpack looking out over the ocean and limestone stacks on the Australian coast',
    'r-point': 'The real Kiko costume — a green scaly dragon with orange spikes and a yellow belly — pointing and smiling under a gum tree',
    'r-portrait': 'Close-up of the real Kiko mascot pointing at the camera with a big toothy grin',
    'r-stand': 'The real Kiko mascot standing on a footpath with his wings out',
    'r-thumbs': 'The real Kiko mascot giving two thumbs up on a suburban street',
    'r-street': 'The real Kiko mascot waving from the footpath outside a brick building',
}

SPEAKER = '<svg class="ico" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path class="w1" d="M15.5 8.5a5 5 0 0 1 0 7"/><path class="w2" d="M19 5a10 10 0 0 1 0 14"/><path class="x" d="m22 9-6 6m0-6 6 6"/></svg>'
VIDEOS = {
    'hello': ('Kiko says hello', 'Kiko waving hello on the footpath, then taking off and flying across the sky', 12),
    'my-name': ('“My name is Kiko!”', 'Kiko introducing himself with his name in big letters, then flying and breathing fire', 9),
    'ray-white': ('Kiko visits Ray White', 'Kiko visiting the team at a Ray White real estate office: handshakes, a team photo and lots of smiles', 62),
}
VIDEO_DATES = {'ray-white': '2026-11-02'}   # upload date for schema; others default to 2026-10-28


def video(key, cls=''):
    title, desc, secs = VIDEOS[key]
    return (f'<figure class="vid {cls}" data-vid><div class="vid-frame">'
            f'<video muted loop playsinline preload="none" data-poster="/assets/video/kiko-{key}-poster.webp" width="540" height="960" aria-label="{desc}">'
            f'<source src="/assets/video/kiko-{key}.mp4" type="video/mp4"></video>'
            f'<button class="vid-sound" type="button" data-sound aria-pressed="false" aria-label="Turn sound on">{SPEAKER}</button></div>'
            f'<figcaption>{title}</figcaption></figure>')


def snap(key, caption, tilt='0'):
    return (f'<figure class="snap" style="--tilt:{tilt}deg" data-lightbox="/assets/img/real/kiko-{key[2:]}-1400.webp">'
            + pic(key, '(max-width:700px) 70vw, 280px') + f'<figcaption>{caption}</figcaption></figure>')


def pic(key, sizes, cls='', lazy=True, alt=None, attrs=''):
    srcset, src, w, h = IMG[key]
    a = ALT[key] if alt is None else alt
    load = 'loading="lazy" decoding="async"' if lazy else 'fetchpriority="high"'
    c = f' class="{cls}"' if cls else ''
    return f'<img{c} src="{src}" srcset="{srcset}" sizes="{sizes}" width="{w}" height="{h}" alt="{a}" {load} {attrs}>'


import json as _json
EYES = _json.load(open(__file__.rsplit('/', 1)[0] + '/eyes.json'))


def lids(key):
    """Eyes that follow you (sclera + moving iris) plus eyelids for blinking."""
    out = ''
    for e in EYES.get(key, []):
        W, H = e['W'], e['H']
        ex, ey, ew, eh = e['cx'] - e['rx'], e['cy'] - e['ry'], 2 * e['rx'], 2 * e['ry']
        s = 2 * e['r'] + 2 * e['pad']
        il, it = (e['ix'] - e['r'] - e['pad'] - ex) / ew * 100, (e['iy'] - e['r'] - e['pad'] - ey) / eh * 100
        out += (f'<span class="eye" data-eye style="left:{ex/W*100:.2f}%;top:{ey/H*100:.2f}%;width:{ew/W*100:.2f}%;height:{eh/H*100:.2f}%">'
                f'<img class="iris" data-iris src="/assets/img/eyes/{e["img"]}" alt="" style="left:{il:.2f}%;top:{it:.2f}%;width:{s/ew*100:.2f}%"></span>')
        lw, lh = ew * 1.16, eh * 1.16
        out += (f'<span class="lid" data-lid style="left:{(e["cx"]-lw/2)/W*100:.2f}%;top:{(e["cy"]-lh/2)/H*100:.2f}%;'
                f'width:{lw/W*100:.2f}%;height:{lh/H*100:.2f}%"></span>')
    return out


HAND = _json.load(open(__file__.rsplit('/', 1)[0] + '/hand.json'))


def wave_art(sizes, alt=None, lazy=True):
    """Kiko's waving pose with a separate hand that can wave."""
    W, H = HAND['W'], HAND['H']; x0, y0, x1, y1 = HAND['bbox']; px, py = HAND['pivot']
    bw, bh = x1 - x0, y1 - y0
    a = ALT['wave'] if alt is None else alt
    load = 'loading="lazy" decoding="async"' if lazy else 'fetchpriority="high"'
    body = (f'<img src="/assets/img/kiko-wave-body-900.webp" srcset="/assets/img/kiko-wave-body-560.webp 560w, /assets/img/kiko-wave-body-900.webp 877w" '
            f'sizes="{sizes}" width="877" height="900" alt="{a}" {load}>')
    hand = (f'<img class="kiko-hand" data-wave src="/assets/img/kiko-hand.webp" alt="" width="{bw}" height="{bh}" '
            f'style="left:{x0/W*100:.2f}%;top:{y0/H*100:.2f}%;width:{bw/W*100:.2f}%;transform-origin:{(px-x0)/bw*100:.1f}% {(py-y0)/bh*100:.1f}%">')
    return body + hand + lids('wave')


def live_wave(sizes, alt=None, lazy=True):
    return (f'<div class="kiko-live" data-react><span class="bubble" data-bubble aria-live="polite"></span>'
            f'<div class="kiko-art">{wave_art(sizes, alt, lazy)}</div></div>')


def live(key, sizes, alt=None, lazy=True, flip=False, bubble=True):
    """A Kiko that blinks, looks at you, and reacts to hover/tap."""
    style = ' style="transform:scaleX(-1)"' if flip else ''
    b = '<span class="bubble" data-bubble aria-live="polite"></span>' if bubble else ''
    return (f'<div class="kiko-live" data-react>{b}<div class="kiko-art"{style}>'
            f'{pic(key, sizes, alt=alt, lazy=lazy)}{lids(key)}</div></div>')


def kiko_pop(key='wave', extra_cls='', hint=False, flip=False):
    style = ' style="transform:scaleX(-1)"' if flip else ''
    h = '<span class="tap-hint" aria-hidden="true">Say hi!</span>' if hint else ''
    return f'''<div class="kiko-pop {extra_cls}" data-kiko>
    <div class="kiko-body" data-kiko-body role="button" tabindex="0" aria-label="Say hello to Kiko">
      <span class="bubble" data-bubble aria-live="polite"></span>
      <div class="kiko-tilt" data-tilt><div class="kiko-breath" data-breath><div class="kiko-art"{style}>{wave_art("(max-width:900px) 78vw, 46vw", lazy=False) if key == 'wave' else pic(key, "(max-width:900px) 78vw, 46vw", lazy=False) + lids(key)}</div></div></div>
      <span class="shadow" data-shadow></span>
    </div>{h}
  </div>'''


PEEK = ('<div class="po po-back" aria-hidden="true"><div class="kiko-live" data-react><span class="bubble" data-bubble></span><div class="kiko-art">' + "{IMG}" + lids('open') + '</div></div></div>'
        '<div class="po po-front" aria-hidden="true">' + "{IMG}" + '</div>')


def peek_html():
    img = pic('open', '(max-width:700px) 260px, 420px', alt='')
    return PEEK.replace('{IMG}', img)


def add_peek(html):
    """Wrap every form-shell that is marked data-peek with Kiko peeking over its top edge."""
    out, i = '', 0
    while True:
        j = html.find('<div class="form-shell" data-peek>', i)
        if j < 0:
            return out + html[i:]
        # find the matching closing div
        k, depth = j, 0
        while True:
            o = html.find('<div', k); c = html.find('</div>', k)
            if o != -1 and o < c:
                depth += 1; k = o + 4
            else:
                depth -= 1; k = c + 6
                if depth == 0:
                    break
        out += html[i:j] + '<div class="peek-wrap" data-peekwrap>' + peek_html() + html[j:k] + '</div>'
        i = k


def inner_hero(title, lede, crumb, key='wave', variant='', buttons='', flip=False):
    pop_cls = 'open' if key == 'open' else ''
    return f'''<section class="hero" aria-labelledby="page-title">
  <div class="stage" data-stage>
    <div class="stage-frame short" data-frame>
      {{{{scene}}}}
      <div class="stage-copy" data-hero-copy>
        <p class="crumbs"><a href="/">Home</a> / {crumb}</p>
        <h1 id="page-title">{title}</h1>
        <p class="lede">{lede}</p>
        {buttons}
      </div>
    </div>
    {kiko_pop(key, pop_cls, flip=flip)}
  </div>
</section>'''


def values_list():
    return '''<ul class="values" aria-label="What Kiko stands for">
  <li><span class="dot c-sun">{{i:heart}}</span>Kindness</li>
  <li><span class="dot c-gum">{{i:users}}</span>Community</li>
  <li><span class="dot c-leaf">{{i:leaf}}</span>Fun</li>
  <li><span class="dot c-orange">{{i:star}}</span>Brighter Futures</li>
</ul>'''


EVENT_TYPES = [
    ('Schools', 'graduation-cap', 'c-sky', 'Visits, fairs and special days'),
    ('Community festivals', 'tent', 'c-orange', 'Festivals, council and cultural days'),
    ('Sporting events', 'trophy', 'c-sun', 'Community sport to big game days'),
    ('Shopping centres', 'shopping-bag', 'c-pink', 'Meet-and-greets and promotions'),
    ('Family events', 'users', 'c-leaf', 'Family days and local celebrations'),
    ('Corporate family days', 'briefcase', 'c-gum', 'Staff family days and celebrations'),
    ('Charity & fundraising', 'heart-handshake', 'c-pink', 'Fundraisers and charity events'),
    ('Special celebrations', 'party-popper', 'c-orange', 'Milestones and special occasions'),
]


def types_grid():
    from urllib.parse import quote
    items = ''.join(
        f'<li><a href="/book?type={quote(t)}#enquire" data-track="type_{i}"><span class="dot {c}">{{{{i:{ic}}}}}</span>{t.replace("&", "&amp;")}<small>{d}</small></a></li>'
        for i, (t, ic, c, d) in enumerate(EVENT_TYPES))
    return f'<ul class="types">{items}</ul>'


# ------------------------------------------------------------------ HOME
HOME = '''
<section class="hero" aria-labelledby="h-hero">
  <div class="stage" data-stage data-hero-home>
    <div class="stage-frame" data-frame>
      {{scene}}
      <div class="stage-copy" data-hero-copy>
        <h1 id="h-hero">Big Adventures.<br>Brighter Tomorrows.</h1>
        <p class="lede">Meet Kiko — The KASA Dragon, spreading kindness, joy and brighter futures for children, families and communities across Australia.</p>
        <div class="btn-row">
          <a class="btn" href="/about">Meet Kiko</a>
          <a class="btn btn-white" href="/book#enquire" data-track="hero_book">{{i:calendar-heart}} Book Kiko</a>
        </div>
        ''' + values_list() + '''
      </div>
    </div>
    ''' + kiko_pop('wave') + '''
  </div>
</section>

<section class="band band-mint" id="meet" aria-labelledby="h-meet">
  [[wave:#fff]]
  <div class="wrap split">
    <div class="portal" data-portal>
      <div class="ring"></div><div class="disc"></div>
      <div class="riser"><div class="riser-art wave" data-riser>''' + live_wave('(max-width:900px) 60vw, 360px', alt='Kiko waving hello') + '''</div></div><div class="hill" aria-hidden="true"><svg viewBox="0 0 1000 300" preserveAspectRatio="none"><path d="M0,300 C10,170 90,50 230,40 C360,30 420,100 520,110 C640,122 720,60 830,70 C950,82 995,190 1000,300Z" fill="#7cc548"/><path d="M40,300 C80,210 200,150 330,160 C460,170 560,200 680,180 C800,160 930,200 970,300Z" fill="#5fa420"/><g fill="#ffd23f"><circle cx="200" cy="80" r="10"/><circle cx="235" cy="66" r="8"/><circle cx="262" cy="86" r="9"/><circle cx="790" cy="100" r="10"/><circle cx="822" cy="88" r="8"/><circle cx="850" cy="104" r="9"/><circle cx="420" cy="215" r="8"/><circle cx="640" cy="230" r="9"/></g></svg></div>
    </div>
    <div>
      <p class="note">Hi, I’m Kiko!</p>
      <h2 id="h-meet">A curious, caring and courageous dragon.</h2>
      <p class="lede">A big personality and an even bigger heart. Kiko loves meeting new people, discovering new places and creating moments that bring families and communities together.</p>
      <a class="btn" href="/about">Learn more about Kiko</a>
      <div class="meet-extra">
        <figure class="polaroid"><span class="tape"></span>''' + pic('coast', '260px', alt='Kiko looking out over the Australian coast') + '''<figcaption>Coast adventures! – Kiko</figcaption></figure>
      </div>
    </div>
  </div>
</section>

<section class="band band-butter real" id="real-kiko" aria-labelledby="h-real">
  [[wave:#e9f7e6]]
  <div class="wrap">
    <div class="split wide-left" style="align-items:end">
      <div><p class="note orange">Yes, he’s real!</p><h2 id="h-real">Meet Kiko in real life.</h2></div>
      <p class="lede">Big scaly waves, high-fives, hugs and photos everyone keeps — this is exactly who turns up at your event.</p>
    </div>
    <div class="real-row" data-real-row>
      ''' + video('hello') + snap('r-point', 'Hi friend!', '-3') + video('my-name') + snap('r-portrait', 'Is that a camera?', '3') + '''
    </div>
    <div class="btn-row"><a class="btn" href="/book#enquire" data-track="real_book">{{i:calendar-heart}} Book the real Kiko</a><a class="btn btn-white" href="/gallery">More photos &amp; videos</a></div>
  </div>
</section>

<section class="band band-sky" id="adventures" aria-labelledby="h-adv">
  [[wave:#fff6d8]]
  <div class="wrap split wide-right">
    <div>
      <p class="note orange">New places. New friends. Bigger adventures.</p>
      <h2 id="h-adv">Exploring. Learning. Smiling.</h2>
      <p class="lede">From schools and sporting events to festivals, community celebrations and special places, Kiko loves exploring Australia and making new friends along the way.</p>
      <a class="btn" href="/adventures">See the adventures</a>
      <nav class="signpost" aria-label="Where Kiko goes" data-signs>
        <a class="sign" href="/adventures#schools">{{i:graduation-cap}} Schools</a>
        <a class="sign" href="/adventures#community-events">{{i:tent}} Community events</a>
        <a class="sign" href="/adventures#sport">{{i:trophy}} Sport</a>
        <a class="sign" href="/adventures#special-places">{{i:map-pin}} Special places</a>
        <a class="sign" href="/adventures#kindness-missions">{{i:heart}} Kindness missions</a>
      </nav>
    </div>
    <div class="adv-card" data-parallax-img>''' + pic('coast', '(max-width:900px) 92vw, 680px') + '''<span class="tag">Postcard from the coast</span></div>
  </div>
</section>

<section class="band band-blush" id="gives-back" aria-labelledby="h-give">
  [[wave:#e4f5ff]]
  <div class="wrap split" style="position:relative;z-index:3">
    <div>
      <p class="note pink">Kindness is at the heart of Kiko.</p>
      <h2 id="h-give">Little moments. Big smiles.</h2>
      <p class="lede">Through community appearances, partnerships and special initiatives, Kiko aims to support children, families and organisations doing meaningful work across Australia.</p>
      <a class="btn btn-pink" href="/gives-back">Discover Kiko Gives Back</a>
    </div>
    <div class="peek-wrap list-peek" data-peekwrap>''' + peek_html() + '''<ul class="areas" aria-label="Areas Kiko can support">
      <li><span class="dot c-pink">{{i:heart}}</span>Children &amp; Families</li>
      <li><span class="dot c-gum">{{i:users}}</span>Community</li>
      <li><span class="dot c-sky">{{i:graduation-cap}}</span>Education</li>
      <li><span class="dot c-orange">{{i:heart-pulse}}</span>Health &amp; Wellbeing</li>
      <li><span class="dot c-sun">{{i:star}}</span>Brighter Futures</li>
    </ul></div>
  </div>
</section>

<section class="band band-white" id="book" aria-labelledby="h-book">
  [[wave:#ffebf2]]
  <div class="wrap">
    <div class="split wide-left" style="align-items:end">
      <div><p class="note">Book Kiko for your event</p><h2 id="h-book">Bring Kiko’s energy, colour and personality to your next event.</h2></div>
      <p class="lede">Pick your kind of event to start an enquiry — we’ll come back to you with availability and a quote.</p>
    </div>
    ''' + types_grid() + '''
    <div class="btn-row"><a class="btn" href="/book#enquire" data-track="home_book">{{i:calendar-heart}} Enquire about Kiko</a></div>
  </div>
</section>

<section class="dusk" aria-labelledby="h-close">
  {{scene:dusk}}
  <div class="wrap dusk-copy">
    <blockquote>“Kind little moments can make a big difference.” — Kiko</blockquote>
    <h2 id="h-close">Let’s make tomorrow brighter together.</h2>
    <div class="btn-row" style="justify-content:center"><a class="btn btn-sun" href="/book#enquire">Book Kiko</a><a class="btn btn-white" href="/gives-back#get-involved">Get involved</a></div>
  </div>
  <div class="dusk-kiko"><div class="dusk-art" data-rise>''' + live('open', '(max-width:700px) 92vw, 640px', alt='Kiko rising over the horizon at sunset') + '''</div></div>
</section>
'''

# ------------------------------------------------------------------ ABOUT
ABOUT = inner_hero('About Kiko', 'A kinder, brighter Australia — one smile at a time.', 'About Kiko', 'open',
                   buttons='<div class="btn-row"><a class="btn" href="#story">Read Kiko’s story</a><a class="btn btn-white" href="/book#enquire">Book Kiko</a></div>') + '''
<section class="section">
  <div class="wrap split wide-left">
    <div>
      <p class="note">Hello from Kiko</p>
      <h2>A friendly, playful and caring character.</h2>
      <p class="lede measure">Kiko — The KASA Dragon was created to bring smiles, spark imagination and encourage kindness.</p>
      <p class="measure">Whether Kiko is meeting children, appearing at a community event, cheering at a sporting occasion or exploring somewhere new, every Kiko appearance is about creating positive memories.</p>
    </div>
    <blockquote class="quote-card">“Kind little moments can make a big difference.”<cite>— Kiko</cite></blockquote>
  </div>
</section>

<section class="band band-mint" id="story" aria-labelledby="h-story">
  [[wave:#fff]]
  <div class="wrap split">
    <figure class="postcard" style="margin:0">
      ''' + pic('r-thumbs', '(max-width:760px) 92vw, 380px') + '''
      <figcaption class="pc-body"><span class="stamp">{{i:heart}}</span><p class="note">Dear Australia,</p><p>Even the smallest act of kindness can make someone’s day a little brighter. See you on the next adventure!</p><p class="note" style="font-size:1.6rem">– Kiko x</p></figcaption>
    </figure>
    <div>
      <h2 id="h-story">Kiko’s story</h2>
      <p class="lede">Kiko believes even the smallest act of kindness can make someone’s day a little brighter. That simple idea sits at the heart of Kiko’s world.</p>
      <p>Kiko was created as more than a mascot. The long-term vision is to build a recognisable Australian character connected with children, families, community, adventure and giving back.</p>
      <p>As Kiko explores Australia, the story will continue to grow through events, adventures, community partnerships, storytelling and new experiences.</p>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="h-stand">
  <div class="wrap">
    <h2 id="h-stand">What Kiko stands for</h2>
    <div class="cards c4">
      <div class="card"><span class="dot c-sun">{{i:heart}}</span><h3>Kindness</h3><p>Small acts can create meaningful change.</p></div>
      <div class="card"><span class="dot c-gum">{{i:users}}</span><h3>Community</h3><p>Bringing people together and celebrating the communities around us.</p></div>
      <div class="card"><span class="dot c-leaf">{{i:leaf}}</span><h3>Fun</h3><p>Creating happy, colourful and memorable experiences.</p></div>
      <div class="card"><span class="dot c-orange">{{i:star}}</span><h3>Brighter Futures</h3><p>Encouraging children to dream big, be confident and believe in what is possible.</p></div>
    </div>
  </div>
</section>

<section class="band band-butter" aria-labelledby="h-pers">
  [[wave:#fff]]
  <div class="wrap split wide-left">
    <div>
      <h2 id="h-pers">Kiko’s personality</h2>
      <p class="lede">Big heart, bigger smile, and always up for an adventure.</p>
      <ul class="chips sun"><li>Friendly</li><li>Curious</li><li>Playful</li><li>Caring</li><li>Courageous</li><li>Positive</li><li>Adventurous</li><li>Family-friendly</li></ul>
    </div>
    <div>
      <h3>Kiko &amp; KASA</h3>
      <p>Kiko — The KASA Dragon was created by KASA Essentials as part of a long-term vision to create something that goes beyond products.</p>
      <p>Kiko represents the community, family and imagination side of KASA. While KASA Essentials and Kiko remain connected, Kiko is growing into his own recognisable character and brand.</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="cta-panel">
      <div><h2>Same little dragon. Bigger possibilities.</h2><p class="lede" style="color:#e6f6ea">Follow Kiko as he explores schools, festivals, sport and special places across Australia.</p><div class="btn-row"><a class="btn btn-sun" href="/adventures">Explore Kiko’s Adventures</a></div></div>
      <div class="kiko-side">''' + live('wave-r', '340px', alt='') + '''</div>
    </div>
  </div>
</section>
'''

# ------------------------------------------------------------------ ADVENTURES
def where(id_, icon, color, title, text, extra=''):
    return f'''<div class="card" id="{id_}"><span class="dot {color}">{{{{i:{icon}}}}}</span><h3>{title}</h3><p>{text}</p>{extra}</div>'''


ADVENTURES = inner_hero('Kiko’s Adventures', 'Exploring. Learning. Smiling. Making a brighter Australia together.', 'Adventures', 'wave-r',
                        buttons='<div class="btn-row"><a class="btn" href="/book#enquire">Invite Kiko</a></div>') + '''
<section class="section">
  <div class="wrap split wide-left">
    <div>
      <p class="note orange">Everywhere Kiko goes becomes part of the adventure.</p>
      <h2>Experiences, friendships and memories.</h2>
      <p class="lede measure">From meeting children at schools to appearing at community celebrations, supporting sporting events and discovering some of Australia’s most special places.</p>
    </div>
    <div class="anchors" aria-label="Jump to">
      <a href="#schools">{{i:graduation-cap}} Schools</a><a href="#community-events">{{i:tent}} Community events</a><a href="#sport">{{i:trophy}} Sport</a><a href="#special-places">{{i:map-pin}} Special places</a><a href="#kindness-missions">{{i:heart}} Kindness missions</a>
    </div>
  </div>
</section>

<section class="band band-sky" aria-labelledby="h-where">
  [[wave:#fff]]
  <div class="wrap">
    <h2 id="h-where">Where Kiko goes</h2>
    <div class="cards">
      ''' + where('schools', 'graduation-cap', 'c-sky', 'Schools', 'Kiko loves visiting schools and being part of positive experiences for students — special appearances, reading activities, kindness initiatives, celebrations and community programs.', '<a href="/book?type=Schools#enquire">Invite Kiko to your school</a>') + '''
      ''' + where('community-events', 'tent', 'c-orange', 'Community events', 'Festivals, cultural celebrations, council events and local community days give Kiko a chance to meet families and celebrate the communities that make Australia special.', '<a href="/book?type=Community%20festivals#enquire">Invite Kiko to your event</a>') + '''
      ''' + where('sport', 'trophy', 'c-sun', 'Sports &amp; recreation', 'Kiko loves the excitement of sport. From community sport to major sporting occasions, Kiko helps create a fun and family-friendly atmosphere.', '<a href="/book?type=Sporting%20events#enquire">Bring Kiko to game day</a>') + '''
      ''' + where('special-places', 'map-pin', 'c-leaf', 'Special places', 'Museums, zoos, attractions, landmarks and unique Australian destinations can become part of Kiko’s growing adventure story.', '<a href="/contact?reason=Brand%20Collaboration">Suggest a special place</a>') + '''
      ''' + where('kindness-missions', 'heart', 'c-pink', 'Kindness missions', 'Some adventures have an even bigger purpose. Kiko can support charities, community organisations and initiatives that help children and families.', '<a href="/gives-back">See Kiko Gives Back</a>') + '''
    </div>
  </div>
</section>

<section class="section" aria-labelledby="h-latest">
  <div class="wrap adv-feature">
    ''' + video('ray-white') + '''
    <div>
      <p class="note orange">Latest adventure</p>
      <h2 id="h-latest">Kiko visits Ray White</h2>
      <p class="lede measure">Kiko popped into a Ray White real estate office to say hello to the team. Handshakes, a team photo and plenty of smiles all round.</p>
      <p class="measure">Workplaces love a Kiko visit too: office celebrations, open days, client events and team days. Turn the sound on to join in.</p>
      <div class="btn-row"><a class="btn" href="/book?type=Corporate%20family%20days#enquire" data-track="adv_book">{{i:calendar-heart}} Invite Kiko to your workplace</a></div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="h-snaps">
  <div class="wrap">
    <h2 id="h-snaps">Snapshots from Kiko’s adventures</h2>
    <p class="lede">Follow Kiko as the journey grows. New adventures, new friends and new memories will be added here.</p>
    <div class="split" style="margin-top:30px;align-items:stretch">
      <figure class="postcard" style="margin:0">
        ''' + pic('coast', '(max-width:760px) 92vw, 340px') + '''
        <figcaption class="pc-body"><span class="stamp">{{i:map-pin}}</span><h3>Postcard from the coast</h3><p>Backpack on, sea breeze in his spikes. Kiko’s first postcard from the Australian coastline — and the start of a big adventure story.</p></figcaption>
      </figure>
      <div class="empty">
        <span class="dot c-leaf" style="width:60px;height:60px;border-radius:18px;display:grid;place-items:center;color:#fff;margin:0 auto 14px">{{i:camera}}</span>
        <h3>Your event could be Kiko’s next adventure.</h3>
        <p>Every real appearance gets its own story here — photos, who Kiko met and what made the day special.</p>
        <a class="btn" href="/book#enquire">Invite Kiko</a>
      </div>
    </div>
  </div>
</section>

<section class="section tight">
  <div class="wrap">
    <div class="cta-panel">
      <div><h2>Have somewhere Kiko should explore next?</h2><p>Schools, festivals, sporting clubs, attractions — tell us where, and Kiko will pack his backpack.</p><div class="btn-row"><a class="btn btn-sun" href="/book#enquire">Invite Kiko</a></div></div>
      <div class="kiko-side">''' + live('wave-r', '340px', alt='') + '''</div>
    </div>
  </div>
</section>
'''

# ------------------------------------------------------------------ GIVES BACK
GIVES = inner_hero('Kiko Gives Back', 'Stronger communities. Brighter futures.', 'Kiko Gives Back', 'open', flip=True,
                   buttons='<div class="btn-row"><a class="btn btn-pink" href="#get-involved">Get involved</a><a class="btn btn-white" href="#initiatives">See our initiatives</a></div>') + '''
<section class="section">
  <div class="wrap split wide-left">
    <div>
      <p class="note pink">Because a kinder tomorrow matters</p>
      <h2>Kindness has the power to make a real difference.</h2>
      <p class="lede measure">Through Kiko Gives Back, we aim to support children, families, charities, community organisations and initiatives creating positive outcomes across Australia.</p>
      <p class="measure">Kiko Gives Back is the community side of Kiko’s journey — using Kiko’s growing visibility to create smiles, support worthwhile causes, bring people together and help organisations doing meaningful work.</p>
    </div>
    <nav class="anchors" aria-label="On this page" style="align-self:center">
      <a href="#families">{{i:heart}} Children &amp; families</a><a href="#schools-education">{{i:graduation-cap}} Schools &amp; education</a><a href="#community-events">{{i:tent}} Community events</a><a href="#initiatives">{{i:sparkles}} Our initiatives</a><a href="#partners">{{i:handshake}} Our partners</a><a href="#impact">{{i:star}} Our impact</a><a href="#help">{{i:hand-heart}} How you can help</a>
    </nav>
  </div>
</section>

<section class="band band-blush" aria-labelledby="h-areas">
  [[wave:#fff]]
  <div class="wrap">
    <h2 id="h-areas">Where Kiko can help</h2>
    <div class="cards">
      <div class="card" id="families"><span class="dot c-pink">{{i:heart}}</span><h3>Supporting children &amp; families</h3><p>Where appropriate, Kiko can support organisations and initiatives helping children and families through difficult circumstances — including hospital-related activities, family programs, special events and community initiatives.</p></div>
      <div class="card" id="schools-education"><span class="dot c-sky">{{i:graduation-cap}}</span><h3>Schools &amp; education</h3><p>Kiko believes children should be encouraged to dream, learn, explore and treat others with kindness — through positive appearances, community programs, reading activities, kindness initiatives and educational experiences.</p><a href="/contact?reason=School%20Enquiry">Make a school enquiry</a></div>
      <div class="card"><span class="dot c-gum">{{i:users}}</span><h3>Community together</h3><p>Kiko is open to partnerships with local community groups, charities, councils, schools and organisations creating stronger and more connected communities.</p></div>
      <div class="card" id="community-events"><span class="dot c-orange">{{i:tent}}</span><h3>Community events</h3><p>Local festivals, council events, cultural celebrations, community days, family events, charity events, fundraising activities and sporting community events.</p><a href="/book?type=Community%20festivals#enquire">Invite Kiko to your event</a></div>
      <div class="card"><span class="dot c-sun">{{i:gift}}</span><h3>Giving with purpose</h3><p>As Kiko grows, giving back grows with him. The long-term aim is for community involvement to be a permanent part of the Kiko story — not an occasional activity.</p></div>
    </div>
  </div>
</section>

<section class="section" id="initiatives" aria-labelledby="h-init">
  <div class="wrap split wide-left">
    <div>
      <p class="note pink">Little moments. Big smiles.</p>
      <h2 id="h-init">Our initiatives</h2>
      <p class="lede measure">Kiko Gives Back initiatives will grow around simple ideas that create meaningful moments for children, families and communities. As each one launches, it will be documented here.</p>
      <ul class="chips"><li>Community appearances</li><li>Children’s activities</li><li>School kindness campaigns</li><li>Hospital &amp; family-support activities</li><li>Fundraising collaborations</li><li>Special-event appearances</li><li>Community giveaways</li><li>Seasonal initiatives</li><li>Partnership campaigns</li></ul>
    </div>
    <div class="empty" style="align-self:center">
      <h3>Have an initiative idea?</h3>
      <p>Charities, schools and community groups — tell us what you’re working on and how Kiko could help.</p>
      <a class="btn btn-pink" href="/contact?reason=Charity%20%2F%20Kiko%20Gives%20Back">Share your idea</a>
    </div>
  </div>
</section>

<section class="band band-mint" id="partners" aria-labelledby="h-partners">
  [[wave:#fff]]
  <div class="wrap split">
    <div>
      <h2 id="h-partners">Our partners make a difference</h2>
      <p class="lede">Kiko is proud to connect with organisations whose work helps children, families and communities.</p>
      <p>Partners appear here once a relationship is agreed — with their story, photos and how Kiko is involved.</p>
    </div>
    <div class="empty">
      <span class="dot c-gum" style="width:60px;height:60px;border-radius:18px;display:grid;place-items:center;color:#fff;margin:0 auto 14px">{{i:handshake}}</span>
      <h3>Become one of Kiko’s first partners</h3>
      <p>Charities, councils, schools and businesses doing meaningful work — let’s talk.</p>
      <a class="btn" href="/contact?reason=Community%20Partnership">Partner with Kiko</a>
    </div>
  </div>
</section>

<section class="section" id="impact" aria-labelledby="h-impact">
  <div class="wrap split wide-left">
    <div>
      <h2 id="h-impact">Our impact story is only beginning</h2>
      <p class="lede measure">Kiko’s journey is just getting started. As Kiko grows, this is where we’ll share the real impact of community appearances, partnerships and Kiko Gives Back initiatives.</p>
      <p class="measure">Only genuine, verifiable numbers will be published — the goal is to show meaningful moments, not just big figures.</p>
    </div>
    <ul class="ticks" aria-label="What we'll report">
      <li>{{i:check}} Children and families reached</li><li>{{i:check}} Community events attended</li><li>{{i:check}} Schools visited</li><li>{{i:check}} Charity appearances</li><li>{{i:check}} Community organisations supported</li><li>{{i:check}} Fundraising initiatives</li><li>{{i:check}} Cities and communities visited</li><li>{{i:check}} Stories and testimonials</li>
    </ul>
  </div>
</section>

<section class="band band-butter" id="help" aria-labelledby="h-help">
  [[wave:#fff]]
  <div class="wrap">
    <h2 id="h-help">How you can help</h2>
    <p class="lede">There are many ways organisations, businesses and communities can support Kiko Gives Back.</p>
    <ul class="chips"><li>Partnering with Kiko</li><li>Supporting a community initiative</li><li>Sponsoring an appearance</li><li>Inviting Kiko to a community event</li><li>Collaborating on a charity activity</li><li>Supporting a school initiative</li><li>Providing products or services</li><li>Introducing Kiko to organisations doing meaningful work</li></ul>
  </div>
</section>

<section class="section" id="get-involved">
  <div class="wrap">
    <div class="cta-panel pink">
      <div>
        <h2>Get involved</h2>
        <p>If you represent a charity, school, community organisation or business with an idea that could help create a positive difference, we would love to hear from you.</p>
        <div class="btn-row"><a class="btn btn-sun" href="/contact?reason=Community%20Partnership">Partner with Kiko</a><a class="btn btn-white" href="/contact?reason=Charity%20%2F%20Kiko%20Gives%20Back">Community enquiry</a></div>
        <p class="note" style="color:#fff;margin-top:24px">It’s not just about today. It’s about a brighter tomorrow.</p>
      </div>
      <div class="kiko-side">''' + live('wave-r', '340px', alt='') + '''</div>
    </div>
  </div>
</section>
'''

# ------------------------------------------------------------------ BOOK
FAQS = [
    ('How much does it cost to book Kiko?', 'Every event is different, so pricing depends on your location, date, how long you would like Kiko to stay and what you would like Kiko to do. Send an enquiry and we’ll come back to you with availability and a quote.'),
    ('Where can Kiko appear?', 'Kiko appears at events across Australia. Let us know your venue and suburb in the enquiry form and we’ll confirm what’s possible for your location.'),
    ('What kinds of events can Kiko attend?', 'Schools, community festivals, sporting events, shopping centres, council events, family days, corporate family events, charity events, fundraisers, cultural celebrations, promotional appearances and special occasions.'),
    ('What can Kiko do at my event?', 'Depending on the event and agreed package, a Kiko appearance can include meet-and-greets, photo opportunities, audience interaction, event walk-arounds, stage appearances, community engagement, brand or event photography, social-media content and special themed appearances.'),
    ('Is my booking confirmed when I send the form?', 'Not yet. Submitting an enquiry does not confirm a booking. We’ll reply with availability and a quote, and your date is secured once the booking is confirmed — usually with a deposit.'),
    ('How far ahead should I book?', 'As early as you can. Weekends, school holidays and the festive season fill up first, so get your enquiry in once you have a date.'),
    ('Can Kiko support a charity or school initiative?', 'Yes — giving back is at the heart of Kiko. Tell us about your initiative through the contact page and choose “Charity / Kiko Gives Back” or “School Enquiry”.'),
]


def faq_html():
    return ''.join(f'<details><summary>{q}{{{{i:chevron-down}}}}</summary><p>{a}</p></details>' for q, a in FAQS)


FAQ_SCHEMA = {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQS]}
SERVICE_SCHEMA = {"@type": "Service", "name": "Kiko — The KASA Dragon mascot appearances",
                  "serviceType": "Mascot and costume character appearances for events",
                  "provider": {"@id": "https://kikothekasadragon.com/#kiko"},
                  "areaServed": {"@type": "Country", "name": "Australia"},
                  "audience": {"@type": "Audience", "audienceType": "Schools, community festivals, sporting events, shopping centres, councils, corporate family days, charities"},
                  "description": "Book Kiko — The KASA Dragon for meet-and-greets, photo opportunities, walk-arounds, stage appearances and themed appearances at events across Australia.",
                  "offers": {"@type": "Offer", "availability": "https://schema.org/InStock", "priceSpecification": {"@type": "PriceSpecification", "priceCurrency": "AUD"}, "description": "Quoted per event"}}

_S = 'https://kikothekasadragon.com'
VIDEO_SCHEMA = [{"@type": "VideoObject", "name": f"{t} — Kiko the KASA Dragon", "description": d, "uploadDate": VIDEO_DATES.get(k, "2026-10-28"),
                 "duration": f"PT{n}S", "thumbnailUrl": f"{_S}/assets/video/kiko-{k}-poster.webp", "contentUrl": f"{_S}/assets/video/kiko-{k}.mp4",
                 "publisher": {"@id": f"{_S}/#kiko"}} for k, (t, d, n) in VIDEOS.items()]
GALLERY_SCHEMA = {"@type": "ImageGallery", "name": "Photos of the real Kiko — The KASA Dragon", "creator": {"@type": "Organization", "name": "The Circle Design Studio"},
                  "image": [{"@type": "ImageObject", "contentUrl": f"{_S}/assets/img/real/kiko-{k}-1400.webp", "description": ALT['r-' + k]} for k in ('point', 'portrait', 'stand', 'thumbs', 'street')]}

TYPE_OPTS = ''.join(f'<label><input type="radio" name="event_type" value="{t}" required><span>{{{{i:{ic}}}}}{t.replace("&", "&amp;")}</span></label>' for t, ic, c, d in EVENT_TYPES) + '<label><input type="radio" name="event_type" value="Something else" required><span>{{i:sparkles}}Something else</span></label>'
ACTS = ['Meet-and-greet', 'Photo opportunities', 'Audience interaction', 'Event walk-arounds', 'Stage appearance', 'Community engagement', 'Social-media content', 'Special themed appearance']
ACT_OPTS = ''.join(f'<label><input type="checkbox" name="kiko_activities" value="{a}"><span>{a}</span></label>' for a in ACTS)

BOOK = inner_hero('Bring Kiko to your event', 'Big smiles. Big energy. One unforgettable little dragon.', 'Events &amp; Bookings', 'wave',
                  buttons='<div class="btn-row"><a class="btn" href="#enquire">Start your enquiry</a><a class="btn btn-white" href="#faq">Questions</a></div>') + '''
<section class="section">
  <div class="wrap split">
    <div>
      <p class="note">Looking for something different?</p>
      <h2>Colour, personality and photos everyone keeps.</h2>
      <p class="lede">Kiko brings colour, personality, interaction and memorable photo opportunities to family and community events across Australia.</p>
      <h3 style="margin-top:28px">Kiko could be perfect for</h3>
      <ul class="chips"><li>Schools</li><li>Community events</li><li>Festivals</li><li>Sporting events</li><li>Shopping centres</li><li>Council events</li><li>Family days</li><li>Corporate family events</li><li>Charity events</li><li>Fundraisers</li><li>Cultural celebrations</li><li>Promotional appearances</li><li>Special occasions</li></ul>
    </div>
    <div class="card book-card" style="background:var(--mint);border-color:transparent">
      <figure class="polaroid book-pol"><span class="tape"></span>''' + pic('r-stand', '200px', alt='The real Kiko mascot standing with his wings out') + '''<figcaption>This is me! – Kiko</figcaption></figure>
      <h3>What a Kiko appearance can include</h3>
      <p>Depending on the event and agreed package:</p>
      <ul class="ticks">
        <li>{{i:check}} Meet-and-greet appearances</li><li>{{i:check}} Photo opportunities</li><li>{{i:check}} Audience interaction</li><li>{{i:check}} Event walk-arounds</li><li>{{i:check}} Stage appearances</li><li>{{i:check}} Community engagement</li><li>{{i:check}} Brand or event photography</li><li>{{i:check}} Social-media content opportunities</li><li>{{i:check}} Special themed appearances</li>
      </ul>
      <p style="margin-top:18px"><b>Every event is different.</b> Appearances are tailored to your location, duration, audience and purpose.</p>
    </div>
  </div>
</section>

<section class="band band-sky" id="enquire" aria-labelledby="h-form">
  [[wave:#fff]]
  <div class="wrap" style="max-width:920px">
    <p class="note">Tell us a little about your event</p>
    <h2 id="h-form">Booking enquiry</h2>
    <div class="form-shell" data-peek>
      <ol class="steps" aria-hidden="true"><li class="on"><span>Your event</span></li><li><span>The details</span></li><li><span>Your details</span></li></ol>
      <form name="booking" method="POST" action="/thank-you?f=booking" data-netlify="true" netlify-honeypot="bot-field" data-steps novalidate>
        <input type="hidden" name="form-name" value="booking">
        <p class="hp"><label>Leave this empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
        <input type="hidden" name="utm_source"><input type="hidden" name="utm_medium"><input type="hidden" name="utm_campaign"><input type="hidden" name="referrer"><input type="hidden" name="landing_page">

        <fieldset class="step on" data-step="1" style="border:0;padding:0;margin:0">
          <legend class="sr-only">Step 1 of 3: your event</legend>
          <div class="field full"><span class="legend">Event type</span><div class="pick" role="radiogroup" aria-label="Event type">''' + TYPE_OPTS + '''</div><p class="err">Choose the kind of event.</p></div>
          <div class="fgrid" style="margin-top:20px">
            <div class="field"><label for="f-date">Event date</label><input id="f-date" name="event_date" type="date" required><p class="err">Add the date of your event.</p></div>
            <div class="field"><label for="f-state">State or territory</label><select id="f-state" name="state" required><option value="">Choose…</option><option>NSW</option><option>VIC</option><option>QLD</option><option>WA</option><option>SA</option><option>TAS</option><option>ACT</option><option>NT</option></select><p class="err">Choose a state or territory.</p></div>
            <div class="field"><label for="f-start">Start time</label><input id="f-start" name="start_time" type="time"></div>
            <div class="field"><label for="f-end">Finish time</label><input id="f-end" name="finish_time" type="time"></div>
            <div class="field full"><label for="f-venue">Venue / suburb</label><input id="f-venue" name="venue_suburb" type="text" autocomplete="address-level2" placeholder="e.g. Docklands, Melbourne" required><p class="err">Tell us where the event is.</p></div>
          </div>
        </fieldset>

        <fieldset class="step" data-step="2" style="border:0;padding:0;margin:0">
          <legend class="sr-only">Step 2 of 3: the details</legend>
          <div class="fgrid">
            <div class="field"><label for="f-ename">Event name <span class="opt">(optional)</span></label><input id="f-ename" name="event_name" type="text"></div>
            <div class="field"><label for="f-att">Estimated attendance</label><select id="f-att" name="attendance"><option value="">Choose…</option><option>Under 50</option><option>50–200</option><option>200–1,000</option><option>1,000–5,000</option><option>5,000+</option></select></div>
            <div class="field full"><span class="legend">What kind of appearance?</span>
              <div class="pkgs">
                <label><input type="radio" name="appearance_style" value="Quick hello"><span class="pk"><b>Quick hello</b><small>A short meet-and-greet with photos.</small></span></label>
                <label><input type="radio" name="appearance_style" value="Party star"><span class="pk"><b>Party star</b><small>Walk-arounds, interaction and plenty of photos.</small></span></label>
                <label><input type="radio" name="appearance_style" value="Big day out"><span class="pk"><b>Big day out</b><small>Longer or multiple appearances across the day.</small></span></label>
              </div>
            </div>
            <div class="field full"><span class="legend">What would you like Kiko to do?</span><div class="pick">''' + ACT_OPTS + '''</div></div>
            <div class="field full"><label for="f-about">Tell us about your event</label><textarea id="f-about" name="event_details" placeholder="Who’s coming, what’s happening, anything Kiko should know"></textarea></div>
          </div>
        </fieldset>

        <fieldset class="step" data-step="3" style="border:0;padding:0;margin:0">
          <legend class="sr-only">Step 3 of 3: your details</legend>
          <div class="fgrid">
            <div class="field"><label for="f-name">Your name</label><input id="f-name" name="name" type="text" autocomplete="name" required><p class="err">Add your name.</p></div>
            <div class="field"><label for="f-org">Organisation / company <span class="opt">(optional)</span></label><input id="f-org" name="organisation" type="text" autocomplete="organization"></div>
            <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" required><p class="err">Add an email we can reply to.</p></div>
            <div class="field"><label for="f-phone">Phone</label><input id="f-phone" name="phone" type="tel" autocomplete="tel" required><p class="err">Add a phone number.</p></div>
            <div class="field full"><label for="f-heard">How did you hear about Kiko? <span class="opt">(optional)</span></label><select id="f-heard" name="heard_about"><option value="">Choose…</option><option>Saw Kiko at an event</option><option>Instagram</option><option>Facebook</option><option>TikTok</option><option>Google search</option><option>Friend or colleague</option><option>KASA Essentials</option><option>Other</option></select></div>
            <div class="field full"><label class="check"><input type="checkbox" name="understand_not_confirmed" value="yes" required><span>I understand that submitting an enquiry does not confirm a booking.</span></label><p class="err">Tick this box to continue.</p></div>
          </div>
        </fieldset>

        <div class="form-nav">
          <button class="btn btn-white" type="button" data-prev hidden>{{i:chevron-left}} Back</button>
          <button class="btn" type="button" data-next style="margin-left:auto">Next {{i:chevron-right}}</button>
          <button class="btn" type="submit" data-submit hidden style="margin-left:auto">{{i:send}} Send booking enquiry</button>
        </div>
      </form>
      <p class="form-foot">For partnerships, media or community opportunities, please use our <a href="/contact">Contact page</a>. Prefer to talk? Call {{tel}}.</p>
    </div>
  </div>
</section>

<section class="section" id="deposit" aria-labelledby="h-dep">
  <div class="wrap" style="max-width:920px">
    <div class="deposit">
      <span class="dot">{{i:ticket}}</span>
      <div>
        <h3 id="h-dep">Got your quote? Secure your date.</h3>
        <p>Pay your booking deposit securely with Stripe. Have your booking reference from your quote email ready.</p>
      </div>
      <a class="btn btn-sun" href="/deposit">Pay deposit</a>
    </div>
  </div>
</section>

<section class="band band-mint" id="faq" aria-labelledby="h-faq">
  [[wave:#fff]]
  <div class="wrap" style="max-width:920px">
    <h2 id="h-faq">Booking questions</h2>
    <div class="faq">''' + faq_html() + '''</div>
  </div>
</section>
'''

# ------------------------------------------------------------------ DEPOSIT
DEPOSIT = inner_hero('Secure your Kiko booking', 'Pay your booking deposit securely through Stripe.', '<a href="/book">Events &amp; Bookings</a> / Deposit', 'wave-r') + '''
<section class="section">
  <div class="wrap" style="max-width:760px">
    <div class="form-shell">
      <h2>Booking deposit</h2>
      <p>Use the booking reference from your Kiko quote email. Your date is locked in once the deposit is paid and you’ll get a receipt by email.</p>
      <form data-deposit novalidate>
        <div class="fgrid">
          <div class="field"><label for="d-ref">Booking reference</label><input id="d-ref" name="ref" type="text" required placeholder="e.g. KIKO-1042"><p class="err">Add the reference from your quote.</p></div>
          <div class="field"><label for="d-email">Email</label><input id="d-email" name="email" type="email" autocomplete="email" required><p class="err">Add the email the quote was sent to.</p></div>
          <div class="field full"><label for="d-date">Event date</label><input id="d-date" name="event_date" type="date"></div>
        </div>
        <p class="dep-amount" data-deposit-amount hidden></p>
        <div class="form-nav"><button class="btn btn-sun" type="submit">{{i:ticket}} Continue to secure payment</button></div>
        <p class="form-foot" data-deposit-msg role="status"></p>
      </form>
      <p class="form-foot">By paying a deposit you agree to our <a href="/terms">booking terms</a>. Don’t have a quote yet? <a href="/book#enquire">Send a booking enquiry</a> first.</p>
    </div>
  </div>
</section>
'''

# ------------------------------------------------------------------ GALLERY
GALLERY = inner_hero('Kiko’s Gallery', 'Big adventures deserve big memories.', 'Gallery', 'open') + '''
<section class="section">
  <div class="wrap">
    <p class="lede">The real Kiko, in real life. Tap any photo to see it big, and turn the sound on in the videos. Photos from Kiko’s events land here as his adventures grow.</p>
    <div class="filters" role="toolbar" aria-label="Filter gallery">
      <button type="button" aria-pressed="true" data-filter="all">Everything</button><button type="button" aria-pressed="false" data-filter="photos">Photos</button><button type="button" aria-pressed="false" data-filter="videos">Videos</button>
    </div>
    <div class="g-grid real-grid">
      <div class="g-item" data-cat="videos">''' + video('hello') + '''</div>
      <div class="g-item" data-cat="photos">''' + snap('r-point', 'Hi friend!') + '''</div>
      <div class="g-item" data-cat="photos">''' + snap('r-portrait', 'Picture time') + '''</div>
      <div class="g-item" data-cat="videos">''' + video('my-name') + '''</div>
      <div class="g-item" data-cat="videos">''' + video('ray-white') + '''</div>
      <div class="g-item" data-cat="photos">''' + snap('r-thumbs', 'Two thumbs up') + '''</div>
      <div class="g-item" data-cat="photos">''' + snap('r-stand', 'Wings out!') + '''</div>
      <div class="g-item" data-cat="photos">''' + snap('r-street', 'See you soon!') + '''</div>
    </div>
    <p class="credit">Photos: The Circle Design Studio</p>
    <div class="empty" data-gallery-empty hidden style="margin-top:16px"><h3>Nothing here yet.</h3><a class="btn" href="/book#enquire">Invite Kiko to your event</a></div>
  </div>
</section>
<section class="band band-mint">
  [[wave:#fff]]
  <div class="wrap" style="text-align:center">
    <h2>Want photos like these at your event?</h2>
    <p class="lede" style="margin-inline:auto">Kiko loves a camera. Book an appearance and your guests go home with photos they’ll keep.</p>
    <div class="btn-row" style="justify-content:center;margin-top:20px"><a class="btn" href="/book#enquire" data-track="gallery_book">{{i:calendar-heart}} Book Kiko</a></div>
    <div class="socials" data-socials style="justify-content:center;margin-top:20px">{{socials}}</div>
  </div>
</section>
'''

# ------------------------------------------------------------------ SHOP
SHOP = inner_hero('The Kiko Shop', 'Take a little Kiko adventure home with you.', 'Shop', 'wave') + '''
<section class="section">
  <div class="wrap split">
    <div>
      <p class="note orange">Something exciting is coming.</p>
      <h2>Kiko’s world is only beginning.</h2>
      <p class="lede">We’re exploring a range of fun Kiko products for children, families and Kiko fans.</p>
      <ul class="chips sun"><li>Kiko plush toys</li><li>Storybooks</li><li>Children’s apparel</li><li>Caps</li><li>Backpacks</li><li>Drink bottles</li><li>School accessories</li><li>Collectables</li><li>Activity books</li><li>Limited editions</li></ul>
    </div>
    <div class="form-shell" data-peek>
      <h3>Be first to hear when Kiko products arrive</h3>
      <form name="kiko-updates" method="POST" action="/thank-you?f=updates" data-netlify="true" netlify-honeypot="bot-field" data-simple novalidate>
        <input type="hidden" name="form-name" value="kiko-updates">
        <p class="hp"><label>Leave this empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
        <input type="hidden" name="utm_source"><input type="hidden" name="utm_medium"><input type="hidden" name="utm_campaign"><input type="hidden" name="referrer"><input type="hidden" name="landing_page">
        <div class="fgrid">
          <div class="field"><label for="u-name">First name</label><input id="u-name" name="first_name" type="text" autocomplete="given-name"></div>
          <div class="field"><label for="u-email">Email</label><input id="u-email" name="email" type="email" autocomplete="email" required><p class="err">Add your email.</p></div>
          <div class="field full"><span class="legend">I’m most excited about <span class="opt">(optional)</span></span><div class="pick"><label><input type="checkbox" name="interest" value="Plush toys"><span>Plush toys</span></label><label><input type="checkbox" name="interest" value="Storybooks"><span>Storybooks</span></label><label><input type="checkbox" name="interest" value="Apparel"><span>Apparel</span></label><label><input type="checkbox" name="interest" value="School gear"><span>School gear</span></label></div></div>
        </div>
        <div class="form-nav"><button class="btn" type="submit">{{i:send}} Keep me updated</button></div>
        <p style="margin:14px 0 0;font-size:.92rem;color:var(--forest-2)">You must be 18 or over to sign up. Under 18? Ask a parent or guardian to sign up for you.</p>
      </form>
    </div>
  </div>
</section>
'''

# ------------------------------------------------------------------ CONTACT
REASONS = ['Event Booking', 'Community Partnership', 'Charity / Kiko Gives Back', 'School Enquiry', 'Corporate Opportunity', 'Sponsorship', 'Media / Press', 'Brand Collaboration', 'Licensing / Commercial Opportunity', 'General Enquiry']
CONTACT = inner_hero('Say hello to Kiko', 'Big adventures often start with a simple hello.', 'Contact', 'wave') + '''
<section class="section">
  <div class="wrap split wide-right" style="align-items:start">
    <div>
      <h2>We’d love to hear from you.</h2>
      <p class="lede">Whether you’d like Kiko at an event, have a partnership idea, represent an organisation or just want to say hi.</p>
      <ul class="ticks"><li>{{i:calendar-heart}} <span>Booking an event? The <a href="/book#enquire">booking enquiry</a> gets you a quote fastest.</span></li><li>{{i:handshake}} <span>Partnerships, sponsorship, media and licensing — use this form.</span></li><li>{{i:mail}} <span data-email-line>Prefer email? Kiko’s inbox is being set up.</span></li><li>{{i:mail}} <span>Phone: {{tel}}</span></li></ul>
      <div class="card" style="margin-top:28px;background:var(--mint);border-color:transparent">
        <h3>Kiko — The KASA Dragon</h3>
        <p style="margin:0">Created and owned by <b>KASA Essentials Pty Ltd</b><br>Australia</p>
      </div>
    </div>
    <div class="form-shell" data-peek>
      <form name="contact" method="POST" action="/thank-you?f=contact" data-netlify="true" netlify-honeypot="bot-field" data-simple novalidate>
        <input type="hidden" name="form-name" value="contact">
        <p class="hp"><label>Leave this empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
        <input type="hidden" name="utm_source"><input type="hidden" name="utm_medium"><input type="hidden" name="utm_campaign"><input type="hidden" name="referrer"><input type="hidden" name="landing_page">
        <div class="fgrid">
          <div class="field"><label for="c-name">Name</label><input id="c-name" name="name" type="text" autocomplete="name" required><p class="err">Add your name.</p></div>
          <div class="field"><label for="c-org">Organisation <span class="opt">(optional)</span></label><input id="c-org" name="organisation" type="text" autocomplete="organization"></div>
          <div class="field"><label for="c-email">Email</label><input id="c-email" name="email" type="email" autocomplete="email" required><p class="err">Add an email we can reply to.</p></div>
          <div class="field"><label for="c-phone">Phone <span class="opt">(optional)</span></label><input id="c-phone" name="phone" type="tel" autocomplete="tel"></div>
          <div class="field full"><label for="c-reason">What are you contacting us about?</label><select id="c-reason" name="reason" required><option value="">Choose…</option>''' + ''.join(f'<option>{r}</option>' for r in REASONS) + '''</select><p class="err">Choose a reason.</p></div>
          <div class="field full"><label for="c-msg">Your message</label><textarea id="c-msg" name="message" required></textarea><p class="err">Add a short message.</p></div>
        </div>
        <div class="form-nav"><button class="btn" type="submit">{{i:send}} Send message</button></div>
      </form>
    </div>
  </div>
</section>
'''

# ------------------------------------------------------------------ THANK YOU / 404 / LEGAL
THANKS = inner_hero('Thank you!', 'Kiko’s doing a happy dance. Your message is on its way.', 'Thank you', 'open') + '''
<section class="section">
  <div class="wrap split">
    <div data-thanks>
      <h2>What happens next</h2>
      <ul class="ticks"><li>{{i:check}} We’ll read your message and reply by email.</li><li>{{i:check}} For bookings, we’ll confirm availability and send a quote with your booking reference.</li><li>{{i:check}} Your date is secured once the booking is confirmed with a deposit.</li></ul>
      <div class="btn-row"><a class="btn" href="/adventures">Explore Kiko’s Adventures</a><a class="btn btn-white" href="/">Back home</a></div>
    </div>
    <blockquote class="quote-card">“Kind little moments can make a big difference.”<cite>— Kiko</cite></blockquote>
  </div>
</section>
'''

NOTFOUND = inner_hero('Kiko got a little lost', 'This page has wandered off on its own adventure.', 'Not found', 'wave-r',
                      buttons='<div class="btn-row"><a class="btn" href="/">Take me home</a><a class="btn btn-white" href="/book#enquire">Book Kiko</a></div>')

PRIVACY = '''
<section class="section" style="padding-top:150px">
  <div class="wrap measure">
    <h1 style="font-size:clamp(2.2rem,5vw,3.4rem)">Privacy Policy</h1>
    <p><i>Last updated: November 2026</i></p>
    <p>Kiko — The KASA Dragon is created and owned by KASA Essentials Pty Ltd (“we”, “us”). We respect your privacy and handle personal information in line with the <i>Privacy Act 1988</i> (Cth) and the Australian Privacy Principles.</p>
    <h3>What we collect</h3>
    <p>When you send a booking enquiry, a contact message or sign up for updates, we collect the details you give us — such as your name, organisation, email, phone number and event details. We also record basic information about how you found the site (for example the referring website or campaign link). If you pay a deposit, Stripe processes the payment; we receive your name, email, phone and the amount paid, but we never see or store your full card details.</p>
    <h3>How we use it</h3>
    <p>To reply to you, prepare quotes, manage bookings and deposits, send booking confirmations and updates you asked for, and improve how we reach families and organisations. We don’t sell your personal information.</p>
    <h3>Who we share it with</h3>
    <p>Only service providers that help us run the site and bookings, and only as needed: our website host (Netlify), our payment processor (Stripe) and our email provider (Brevo). Some of these providers may store information outside Australia. The site counts visits anonymously (which pages are viewed and roughly where visitors came from) without cookies and without storing anything that identifies you. If we later add analytics or advertising tools (such as Google Analytics or Meta), they may set cookies to measure visits; you can block cookies in your browser settings.</p>
    <h3>Keeping it safe</h3>
    <p>Booking details are kept in a private, password-protected system and are only used by the KASA Essentials team to manage your booking.</p>
    <h3>Your choices</h3>
    <p>You can ask to access, correct or delete your information, or unsubscribe from updates at any time, by emailing <a href="mailto:info@kasaessentials.com">info@kasaessentials.com</a> or using the <a href="/contact">contact page</a>. If you have a privacy concern, contact us first; if you’re not satisfied with our response you can contact the Office of the Australian Information Commissioner (oaic.gov.au).</p>
    <h3>Children</h3>
    <p>This site is for parents, guardians, schools and event organisers. We don’t knowingly collect personal information from children. If you’re a parent or guardian and think your child has given us their details, email <a href="mailto:info@kasaessentials.com">info@kasaessentials.com</a> and we’ll delete them.</p>
  </div>
</section>
'''

TERMS = '''
<section class="section" style="padding-top:150px">
  <div class="wrap measure">
    <h1 style="font-size:clamp(2.2rem,5vw,3.4rem)">Terms of Use &amp; Booking Terms</h1>
    <p><i>Last updated: October 2026</i></p>
    <p>This website and Kiko — The KASA Dragon appearances are provided by KASA Essentials Pty Ltd (“we”, “us”). By using this site or booking Kiko you agree to these terms. Nothing in these terms limits your rights under the Australian Consumer Law.</p>
    <h3>1. Enquiries and quotes</h3>
    <p>Sending an enquiry does not confirm a booking. We’ll reply with availability and a written quote showing the price, what’s included and the deposit. Quotes are valid for 14 days.</p>
    <h3>2. Confirming a booking</h3>
    <p>Your date is secured once the deposit shown in your quote is paid. We’ll confirm your booking in writing. Until the deposit is paid, the date may be offered to someone else.</p>
    <h3>3. Paying the balance</h3>
    <p>The remaining balance is due no later than 7 days before the event, unless your quote says otherwise. If the balance isn’t paid by then, we may treat the booking as cancelled by you.</p>
    <h3>4. If you need to cancel or change the date</h3>
    <ul>
      <li><b>More than 14 days before the event:</b> you can move your booking to another available date within 12 months at no cost, or cancel and receive your deposit back less a $50 administration fee.</li>
      <li><b>14 days or less before the event:</b> the deposit is non-refundable, but we’ll do our best to move your booking to another available date within 6 months.</li>
      <li><b>Balance payments</b> are refunded in full if you cancel more than 7 days before the event.</li>
    </ul>
    <h3>5. If we need to cancel</h3>
    <p>If we can’t attend for reasons on our side (such as performer illness or an emergency), we’ll offer you a new date or a full refund of everything you’ve paid.</p>
    <h3>6. Weather, safety and venue</h3>
    <p>For outdoor events please provide a shaded or covered area and a private space nearby where the performer can rest and change. Kiko’s performer takes regular short breaks (usually 10 minutes every 30–40 minutes) for safety in the costume. We may shorten or pause an appearance in extreme heat, storms or if the area isn’t safe; if this happens on the day the booking is still payable, but we’ll try to make up the time.</p>
    <h3>7. Children and supervision</h3>
    <p>Children must be supervised by a parent, guardian, teacher or event staff at all times while with Kiko. Kiko’s performer is never left alone with children.</p>
    <h3>8. Photos</h3>
    <p>Guests are welcome to take photos with Kiko. We may take photos of Kiko at your event for our website and social media; we won’t publish photos where children can be identified without permission. Tell us if your event has any photo restrictions.</p>
    <h3>9. Kiko’s character and content</h3>
    <p>Kiko — The KASA Dragon, his name, likeness, artwork and the content on this site belong to KASA Essentials Pty Ltd. Please don’t copy or use them commercially without written permission. For licensing, use the <a href="/contact?reason=Licensing%20%2F%20Commercial%20Opportunity">contact page</a>.</p>
    <h3>10. Contact</h3>
    <p>Questions about these terms or your booking? Email <a href="mailto:info@kasaessentials.com">info@kasaessentials.com</a> or <a href="/contact">get in touch</a>.</p>
  </div>
</section>
'''

BOOK = add_peek(BOOK)
SHOP = add_peek(SHOP)
CONTACT = add_peek(CONTACT)

# ------------------------------------------------------------------ SCHOOL EVENTS
# Written by hand on 2 Nov 2026 (while this generator was on the laptop); kept as finished HTML.
SCHOOL = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'school_events.html')).read()

PAGES = [
    dict(file='index.html', key='home', crumb='Home', prio='1.0', body=HOME,
         title='Kiko — The KASA Dragon | Mascot from Melbourne, Australia',
         desc='Meet Kiko — The KASA Dragon. Book Kiko for schools, festivals, sporting events, shopping centres, corporate family days and charity events across Australia.',
         schema=[SERVICE_SCHEMA] + [v for v in VIDEO_SCHEMA if 'ray-white' not in v['contentUrl']]),
    dict(file='about.html', key='about', crumb='About Kiko', body=ABOUT, preload='/assets/img/kiko-open-1400.webp',
         title='About Kiko — The KASA Dragon | A kinder, brighter Australia',
         desc='Kiko — The KASA Dragon is a friendly, playful and caring Australian character created to bring smiles, spark imagination and encourage kindness.'),
    dict(file='adventures.html', key='adventures', crumb='Adventures', body=ADVENTURES, preload='/assets/img/kiko-wave-r-900.webp',
         title='Kiko’s Adventures | Schools, festivals, sport and special places', schema=[v for v in VIDEO_SCHEMA if 'ray-white' in v['contentUrl']],
         desc='Follow Kiko — The KASA Dragon to schools, community events, sporting occasions and special places across Australia. Invite Kiko to your next event.'),
    dict(file='gives-back.html', key='gives', crumb='Kiko Gives Back', body=GIVES, preload='/assets/img/kiko-open-1400.webp',
         title='Kiko Gives Back | Stronger communities, brighter futures',
         desc='Kiko Gives Back supports children, families, schools, charities and community organisations across Australia. Partner with Kiko or invite him to a community event.'),
    dict(file='book.html', key='book', crumb='Events & Bookings', prio='0.9', body=BOOK,
         title='Book Kiko — Dragon mascot from Melbourne, across Australia',
         desc='Book Kiko — The KASA Dragon for your school, festival, sporting event, shopping centre, council event, corporate family day or fundraiser. Send an enquiry for a quote.',
         schema=[SERVICE_SCHEMA, FAQ_SCHEMA]),
    dict(file='school-events.html', key='school-events', crumb='School Events', body=SCHOOL, preload='/assets/img/kiko-open-1400.webp',
         title='Kiko at School Events | Fetes, sports days, kindness weeks',
         desc='What a Kiko visit looks like at a school fete, sports day or kindness week, who books it, and how the quote and deposit work. Book Kiko — The KASA Dragon.'),
    dict(file='deposit.html', key='deposit', crumb='Booking deposit', body=DEPOSIT, noindex=True, preload='/assets/img/kiko-wave-r-900.webp',
         title='Pay your booking deposit | Kiko — The KASA Dragon', desc='Secure your Kiko — The KASA Dragon booking with a deposit paid through Stripe.'),
    dict(file='gallery.html', key='gallery', crumb='Gallery', body=GALLERY, preload='/assets/img/kiko-open-1400.webp',
         title='Photos & videos of the real Kiko | Kiko — The KASA Dragon', desc='See the real Kiko — The KASA Dragon mascot: photos and videos of Australia’s friendliest dragon, ready for your school, festival or community event.',
         schema=VIDEO_SCHEMA + [GALLERY_SCHEMA]),
    dict(file='shop.html', key='shop', crumb='Shop', body=SHOP,
         title='The Kiko Shop — coming soon | Kiko — The KASA Dragon', desc='Kiko plush toys, storybooks, apparel and more are on the way. Join the list to be first to hear.'),
    dict(file='contact.html', key='contact', crumb='Contact', body=CONTACT,
         title='Contact Kiko — The KASA Dragon | Partnerships, media and enquiries', desc='Get in touch about bookings, partnerships, sponsorship, schools, charity initiatives, media, brand collaborations and licensing.'),
    dict(file='thank-you.html', key='thanks', crumb='Thank you', body=THANKS, noindex=True, preload='/assets/img/kiko-open-1400.webp',
         title='Thank you | Kiko — The KASA Dragon', desc='Thanks for getting in touch with Kiko — The KASA Dragon.'),
    dict(file='404.html', key='notfound', crumb='Not found', body=NOTFOUND, noindex=True, preload='/assets/img/kiko-wave-r-900.webp',
         title='Page not found | Kiko — The KASA Dragon', desc='This page wandered off on its own adventure.'),
    dict(file='privacy.html', key='privacy', crumb='Privacy Policy', body=PRIVACY, prio='0.2',
         title='Privacy Policy | Kiko — The KASA Dragon', desc='How KASA Essentials handles personal information collected through the Kiko website.'),
    dict(file='terms.html', key='terms', crumb='Terms of Use', body=TERMS, prio='0.2',
         title='Terms of Use | Kiko — The KASA Dragon', desc='Terms for using the Kiko — The KASA Dragon website.'),
]
