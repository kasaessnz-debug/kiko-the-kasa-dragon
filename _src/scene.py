"""Illustrated parallax scene layers for Kiko page heroes.
Each layer is its own SVG so it can move independently (scroll + pointer parallax).
All layers share viewBox 0 0 1600 900 and anchor to the bottom (xMidYMax slice)."""
import random

PAR = 'preserveAspectRatio="xMidYMax slice" viewBox="0 0 1600 900" aria-hidden="true" focusable="false"'


def _cloud(x, y, s, o=0.95):
    parts = [(0, 0, 38), (42, -22, 50), (96, -8, 44), (136, 8, 30), (-34, 10, 26)]
    c = ''.join(f'<circle cx="{x+dx*s:.1f}" cy="{y+dy*s:.1f}" r="{r*s:.1f}"/>' for dx, dy, r in parts)
    return f'<g fill="#fff" opacity="{o}">{c}<rect x="{x-50*s:.1f}" y="{y+5*s:.1f}" width="{200*s:.1f}" height="{34*s:.1f}" rx="{17*s:.1f}"/></g>'


def _balloon(x, y, s, a, b, uid):
    rx, ry = 34 * s, 42 * s
    stripes = ''.join(
        f'<rect x="{x - rx + i * (2*rx/6):.1f}" y="{y-ry:.1f}" width="{2*rx/6:.1f}" height="{2*ry+30*s:.1f}" fill="{a if i % 2 else b}"/>'
        for i in range(6))
    return f'''<g class="balloon">
<clipPath id="bc{uid}"><path d="M{x-rx:.1f},{y:.1f} a{rx:.1f},{ry:.1f} 0 1 1 {2*rx:.1f},0 c0,{18*s:.1f} -{14*s:.1f},{30*s:.1f} -{22*s:.1f},{40*s:.1f} h-{24*s:.1f} c-{8*s:.1f},-{10*s:.1f} -{22*s:.1f},-{22*s:.1f} -{22*s:.1f},-{40*s:.1f}z"/></clipPath>
<g clip-path="url(#bc{uid})">{stripes}</g>
<path d="M{x-11*s:.1f},{y+41*s:.1f} L{x-8*s:.1f},{y+60*s:.1f} M{x+11*s:.1f},{y+41*s:.1f} L{x+8*s:.1f},{y+60*s:.1f}" stroke="#7a5a3a" stroke-width="{1.6*s:.1f}"/>
<rect x="{x-10*s:.1f}" y="{y+60*s:.1f}" width="{20*s:.1f}" height="{14*s:.1f}" rx="{3*s:.1f}" fill="#b9773e"/></g>'''


def _skyline(seed, base, hmin, hmax, fill, windows=None, spire=False):
    rnd = random.Random(seed)
    x = -40
    d = [f'M-40,{base+300}']
    wins = []
    while x < 1660:
        w = rnd.randint(46, 110)
        h = rnd.randint(hmin, hmax)
        # occasional tall towers toward the middle
        if 520 < x < 1100 and rnd.random() < 0.28:
            h = int(h * 1.45)
        top = base - h
        if rnd.random() < 0.25:  # stepped top
            d.append(f'L{x},{top+18} L{x+w*0.25:.0f},{top+18} L{x+w*0.25:.0f},{top} L{x+w*0.75:.0f},{top} L{x+w*0.75:.0f},{top+18} L{x+w},{top+18}')
        else:
            d.append(f'L{x},{top} L{x+w},{top}')
        if windows and rnd.random() < 0.7:
            for wy in range(top + 18, base - 10, 26):
                for wx in range(x + 10, x + w - 12, 18):
                    if rnd.random() < 0.55:
                        wins.append(f'<rect x="{wx}" y="{wy}" width="7" height="11" rx="1.5"/>')
        x += w + rnd.randint(0, 8)
    d.append(f'L1660,{base+300} Z')
    sp = ''
    if spire:
        sx = 905
        sp = (f'<path d="M{sx-34},{base} L{sx-28},{base-360} L{sx+28},{base-372} L{sx+34},{base} Z" fill="{fill}"/>'
              f'<rect x="{sx-4}" y="{base-430}" width="8" height="70" fill="{fill}"/>'
              f'<path d="M{sx-430},{base} L{sx-430},{base-250} Q{sx-415},{base-300} {sx-400},{base-250} L{sx-400},{base} Z" fill="{fill}"/>')
    w = f'<g fill="{windows}" opacity=".55">{"".join(wins)}</g>' if windows else ''
    return f'{sp}<path d="{" ".join(d)}" fill="{fill}"/>{w}'


def _gum(x, flip=False, scale=1.0):
    s = scale
    f = -1 if flip else 1
    T = lambda dx: x + f * dx * s
    trunk = (f'<path d="M{T(-30):.0f},905 C{T(-20):.0f},760 {T(-10):.0f},640 {T(30):.0f},520 '
             f'C{T(50):.0f},460 {T(70):.0f},420 {T(110):.0f},380 L{T(122):.0f},392 '
             f'C{T(90):.0f},440 {T(76):.0f},500 {T(70):.0f},560 C{T(64):.0f},640 {T(60):.0f},760 {T(52):.0f},905 Z" '
             f'fill="#efe4d2" stroke="#cbb796" stroke-width="3"/>'
             f'<path d="M{T(20):.0f},600 C{T(-30):.0f},560 {T(-80):.0f},520 {T(-130):.0f},500" stroke="#e3d4bb" stroke-width="{14*s:.0f}" fill="none" stroke-linecap="round"/>')
    blobs = []
    rnd = random.Random(int(x) + (7 if flip else 3))
    for cx, cy, r in [(100, 360, 110), (-120, 470, 95), (20, 300, 90), (190, 300, 80), (-40, 420, 85), (250, 400, 70), (-200, 520, 70)]:
        col = rnd.choice(['#2f7d3a', '#3d9444', '#4fa84a', '#2a6f35'])
        blobs.append(f'<circle cx="{T(cx):.0f}" cy="{cy*s + (1-s)*900:.0f}" r="{r*s:.0f}" fill="{col}"/>')
    hi = ''.join(f'<circle cx="{T(cx):.0f}" cy="{cy*s + (1-s)*900:.0f}" r="{r*s:.0f}" fill="#6cc05a" opacity=".55"/>'
                 for cx, cy, r in [(70, 320, 40), (-110, 440, 34), (200, 280, 30)])
    return trunk + ''.join(blobs) + hi


def _wattle(x, y, n=26, seed=1):
    rnd = random.Random(seed)
    dots = ''.join(f'<circle cx="{x+rnd.uniform(-90,90):.0f}" cy="{y+rnd.uniform(-50,40):.0f}" r="{rnd.uniform(5,10):.1f}" fill="{rnd.choice(["#ffd23f","#ffc21a","#ffe066"])}"/>' for _ in range(n))
    return f'<ellipse cx="{x}" cy="{y+20}" rx="110" ry="60" fill="#3f8f3c"/>{dots}'


def scene(variant='day', kiko_ground=True):
    """Return the stack of parallax layers for a page hero."""
    if variant == 'dusk':
        sky = ('<defs><linearGradient id="skyD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d3f86"/>'
               '<stop offset=".45" stop-color="#7a5fa8"/><stop offset=".72" stop-color="#f08a5d"/><stop offset="1" stop-color="#ffc46b"/></linearGradient>'
               '<radialGradient id="glowD"><stop offset="0" stop-color="#ffe9a8"/><stop offset=".4" stop-color="#ffb35c" stop-opacity=".55"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0"/></radialGradient></defs>'
               '<rect width="1600" height="900" fill="url(#skyD)"/><circle cx="1180" cy="640" r="320" fill="url(#glowD)"/><circle cx="1180" cy="650" r="80" fill="#ffd36b"/>'
               + ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#fff" opacity=".8"/>' for x, y, r in [(180,90,2),(320,160,1.6),(520,70,2.2),(700,130,1.4),(980,60,2),(1300,110,1.8),(1460,60,1.5),(860,190,1.3)]))
        city = _skyline(11, 700, 90, 230, '#2b3b6c', windows='#ffd88a', spire=True)
        hills = ('<path d="M0,760 C260,700 520,740 800,720 C1080,700 1340,740 1600,712 L1600,900 L0,900Z" fill="#23315a"/>'
                 '<path d="M0,820 C300,780 700,800 1000,790 C1280,780 1450,800 1600,790 L1600,900 L0,900Z" fill="#1b2748"/>')
        return f'''<div class="layer l-sky" data-depth="0"><svg {PAR}>{sky}</svg></div>
<div class="layer l-city" data-depth="0.25"><svg {PAR}>{city}</svg></div>
<div class="layer l-hills" data-depth="0.5"><svg {PAR}>{hills}</svg></div>'''

    sky = ('<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5ec0ff"/>'
           '<stop offset=".5" stop-color="#b9e6ff"/><stop offset=".8" stop-color="#ffe9b0"/><stop offset="1" stop-color="#ffd58c"/></linearGradient>'
           '<radialGradient id="glow"><stop offset="0" stop-color="#fff8cf"/><stop offset=".35" stop-color="#ffe680" stop-opacity=".7"/><stop offset="1" stop-color="#ffe680" stop-opacity="0"/></radialGradient></defs>'
           '<rect width="1600" height="900" fill="url(#sky)"/><circle cx="1240" cy="330" r="380" fill="url(#glow)"/><circle cx="1240" cy="330" r="92" fill="#ffd84d"/>')
    clouds = _cloud(170, 170, 1.0) + _cloud(620, 110, .7, .85) + _cloud(1420, 200, .9) + _cloud(1000, 250, .55, .8)
    balloons = _balloon(1010, 160, .85, '#ff5d73', '#ffd23f', 'a') + _balloon(1420, 380, .7, '#3fa9f5', '#ffffff', 'b') + _balloon(760, 210, .55, '#ff8a1e', '#ffe066', 'c')
    city = (_skyline(5, 640, 110, 260, '#a8c4f0', spire=True)
            + _skyline(9, 680, 60, 190, '#86a9e2', windows='#eef5ff'))
    hills = ('<path d="M0,650 C220,610 420,640 640,640 C900,640 1120,600 1380,620 C1480,628 1550,640 1600,640 L1600,900 L0,900Z" fill="#a9dc7c"/>'
             '<path d="M-20,735 C300,700 520,690 760,700 C1040,712 1250,690 1620,700 L1620,760 C1250,752 1040,770 760,760 C520,750 300,760 -20,790Z" fill="#8fd8f2"/>'
             '<path d="M-20,745 C300,712 520,702 760,712 C1040,722 1250,702 1620,712" stroke="#d5f3ff" stroke-width="5" fill="none" opacity=".9"/>'
             '<path d="M520,712 Q700,600 880,712" stroke="#6d85b8" stroke-width="10" fill="none"/><path d="M500,716 L900,716" stroke="#6d85b8" stroke-width="10"/>'
             + ''.join(f'<path d="M{x},716 L{x},{716-int(((x-700)/180)**2*-1*0+0)}" />' for x in [])
             + ''.join(f'<line x1="{x}" y1="716" x2="{x}" y2="{712 - int(108*(1-((x-700)/180)**2))}" stroke="#6d85b8" stroke-width="4"/>' for x in range(560, 860, 40))
             + '<path d="M0,790 C240,760 520,770 800,780 C1100,790 1360,760 1600,770 L1600,900 L0,900Z" fill="#6cbf4a"/>'
             '<path d="M0,850 C380,825 820,840 1180,835 C1380,832 1500,840 1600,838 L1600,900 L0,900Z" fill="#4ea83c"/>')
    trees = (_gum(1560, True, .9) + _wattle(1380, 820, 30, 4) + _wattle(120, 860, 24, 9) + _wattle(520, 880, 18, 12))
    return f'''<div class="layer l-sky" data-depth="0"><svg {PAR}>{sky}</svg></div>
<div class="layer l-clouds" data-depth="0.12"><svg {PAR}>{clouds}</svg></div>
<div class="layer l-balloons" data-depth="0.2"><svg {PAR}>{balloons}</svg></div>
<div class="layer l-city" data-depth="0.3"><svg {PAR}>{city}</svg></div>
<div class="layer l-hills" data-depth="0.5"><svg {PAR}>{hills}</svg></div>
<div class="layer l-trees" data-depth="0.85"><svg {PAR}>{trees}</svg></div>'''
