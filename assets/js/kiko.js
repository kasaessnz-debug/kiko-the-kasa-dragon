/* Kiko — The KASA Dragon · interactions
   Motion: GSAP + ScrollTrigger + Lenis. Everything degrades to a static page
   when JS is off or the visitor prefers reduced motion. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const DESKTOP = () => innerWidth > 900;
  const CFG = window.KIKO || {};
  let track = (name, data) => { try { (window.dataLayer = window.dataLayer || []).push({ event: name, ...data }); } catch (e) {} };

  /* ---------- lead source capture (fills hidden form fields) ---------- */
  try {
    const q = new URLSearchParams(location.search);
    let src = JSON.parse(sessionStorage.getItem('kiko_src') || 'null');
    if (!src) src = { referrer: document.referrer || 'direct', landing_page: location.pathname + location.search };
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(k => { if (q.get(k)) src[k] = q.get(k); });
    sessionStorage.setItem('kiko_src', JSON.stringify(src));
    $$('form input[type=hidden]').forEach(i => { if (src[i.name] != null) i.value = src[i.name]; });
  } catch (e) {}

  /* ---------- socials + email from config.js ---------- */
  const SOC = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube', linkedin: 'LinkedIn' };
  const socials = Object.entries(CFG.socials || {}).filter(([, v]) => v);
  if (socials.length) $$('[data-socials]').forEach(box => {
    box.innerHTML = socials.map(([k, v]) => `<a href="${v}" target="_blank" rel="noopener" aria-label="Kiko on ${SOC[k] || k}"><svg aria-hidden="true"><use href="/assets/icons.svg#s-${k}"/></svg></a>`).join('');
  });
  if (CFG.email) $$('[data-email-line]').forEach(el => { el.innerHTML = `Prefer email? <a href="mailto:${CFG.email}">${CFG.email}</a>`; });

  /* ---------- header: hide on scroll down, show on scroll up ---------- */
  const head = $('.site-head'); let lastY = scrollY;
  const bar = $('.book-bar'); const hero = $('.hero');
  addEventListener('scroll', () => {
    const y = scrollY;
    if (head) {
      if (y > 260 && y > lastY && !document.body.classList.contains('menu-open')) head.classList.add('is-hidden');
      else if (y < lastY - 1 || y < 260) head.classList.remove('is-hidden');
    }
    lastY = y;
  }, { passive: true });
  if (bar && hero && 'IntersectionObserver' in window && document.body.dataset.page !== 'book') {
    new IntersectionObserver(([e]) => {
      const show = !e.isIntersecting;
      bar.classList.toggle('show', show); bar.setAttribute('aria-hidden', String(!show));
      bar.querySelector('a').tabIndex = show ? 0 : -1;
    }, { rootMargin: '0px 0px -40% 0px' }).observe(hero);
  }

  /* ---------- buddy Kiko in the corner: appears after the hero, hides at the footer ---------- */
  const buddy = $('[data-buddy]');
  if (buddy && hero && 'IntersectionObserver' in window && document.body.dataset.page !== 'book') {
    let pastHero = false, atFoot = false, talked = false;
    const upd = () => {
      const show = pastHero && !atFoot; buddy.classList.toggle('show', show);
      if (show && !talked) { talked = true; setTimeout(() => { buddy.classList.add('talk'); setTimeout(() => buddy.classList.remove('talk'), 3800); }, 1200); }
    };
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; upd(); }).observe(hero);
    const foot = $('.site-foot'); if (foot) new IntersectionObserver(([e]) => { atFoot = e.isIntersecting; upd(); }).observe(foot);
  } else if (buddy) buddy.remove();

  /* ---------- analytics + ad pixels (only when IDs are set in config.js) ---------- */
  const loadScript = src => { const s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); };
  if (CFG.ga4) {
    window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date()); gtag('config', CFG.ga4); loadScript('https://www.googletagmanager.com/gtag/js?id=' + CFG.ga4);
  }
  if (CFG.metaPixel) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', CFG.metaPixel); fbq('track', 'PageView');
  }
  const CONVERT = { booking_enquiry_thanks: ['generate_lead', 'Lead'], deposit_paid: ['purchase', 'Purchase'], form_submit: ['sign_up', 'Contact'] };
  /* anonymous visit counter for Kiko HQ — no cookies, nothing personal stored */
  const HIT = '/.netlify/functions/kiko-hit', KEEP = ['booking_step', 'booking_enquiry_submit', 'form_submit', 'deposit_checkout', 'video_sound_on', 'photo_open'];
  const beacon = body => { try { if (navigator.doNotTrack === '1') return; const d = JSON.stringify(body);
    if (!(navigator.sendBeacon && navigator.sendBeacon(HIT, new Blob([d], { type: 'text/plain' })))) fetch(HIT, { method: 'POST', body: d, keepalive: true }).catch(() => {}); } catch (e) {} };
  try {
    const first = !sessionStorage.getItem('kiko_seen'); sessionStorage.setItem('kiko_seen', '1');
    const q = new URLSearchParams(location.search);
    beacon({ p: location.pathname, r: document.referrer || 'direct', u: q.get('utm_source') || '', first });
  } catch (e) { beacon({ p: location.pathname }); }
  const _track = track;
  track = (name, data) => { _track(name, data); const c = CONVERT[name];
    if (c && window.gtag) gtag('event', c[0], data || {}); if (c && window.fbq) fbq('track', c[1]);
    if (KEEP.includes(name) && !(name === 'booking_step' && data && data.step !== 2)) beacon({ p: location.pathname, e: name }); };
  document.addEventListener('click', e => { const a = e.target.closest('[data-track]'); if (!a) return;
    const n = a.dataset.track; track(n); if (/book/.test(n)) beacon({ p: location.pathname, e: 'book_click' }); });

  if (CFG.phone) {
    $$('[data-email-line]').forEach(el => el.insertAdjacentHTML('afterend', `<br>Call or text: <a href="tel:${CFG.phone.replace(/\s/g, '')}">${CFG.phone}</a>`));
  }

  /* ---------- mobile menu ---------- */
  const menu = $('#mobile-menu'); const openBtn = $('.nav .menu-btn'); const closeBtn = menu && $('.close', menu);
  const setMenu = open => {
    if (!menu) return;
    menu.classList.toggle('open', open); document.body.classList.toggle('menu-open', open);
    openBtn.setAttribute('aria-expanded', String(open));
    if (open) { closeBtn.focus(); lenis && lenis.stop(); } else { openBtn.focus(); lenis && lenis.start(); }
  };
  openBtn && openBtn.addEventListener('click', () => setMenu(true));
  closeBtn && closeBtn.addEventListener('click', () => setMenu(false));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu && menu.classList.contains('open')) setMenu(false); });

  /* ---------- Kiko says hi ---------- */
  const LINES = ['G’day! I’m Kiko!', 'High five!', 'Want me at your event?', 'Kindness is my superpower!', 'Let’s go on an adventure!', 'Rawr! That means hello.', 'Big smiles only!'];
  let li = 0;
  const sayHi = (pop, text) => {
    const b = $('[data-bubble]', pop); if (!b) return;
    b.textContent = text || LINES[li++ % LINES.length];
    b.classList.add('show'); clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('show'), 2600);
    const hint = $('.tap-hint', pop); if (hint) hint.style.display = 'none';
  };
  const hop = el => {
    if (RM || !window.gsap) return;
    gsap.timeline()
      .to(el, { scaleY: .86, scaleX: 1.08, duration: .12, ease: 'power2.in' })
      .to(el, { scaleY: 1.06, scaleX: .96, y: -46, duration: .26, ease: 'power2.out' })
      .to(el, { scaleY: 1, scaleX: 1, y: 0, duration: .5, ease: 'bounce.out' });
  };
  const waveHand = el => {
    if (RM || !window.gsap || !el || el._waving) return; el._waving = true;
    gsap.timeline({ onComplete: () => { el._waving = false; } })
      .to(el, { rotation: -20, duration: .22, ease: 'sine.out' })
      .to(el, { rotation: 14, duration: .26, ease: 'sine.inOut', repeat: 4, yoyo: true })
      .to(el, { rotation: 0, duration: .35, ease: 'sine.inOut' });
  };
  $$('[data-kiko]').forEach(pop => {
    const body = $('[data-kiko-body]', pop); const tilt = $('[data-tilt]', pop);
    const go = () => { sayHi(pop); hop(tilt); waveHand($('[data-wave]', pop)); track('kiko_hi'); };
    body.addEventListener('click', go);
    body.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });

  /* ---------- pre-fill from links ---------- */
  const qs = new URLSearchParams(location.search);
  const t = qs.get('type');
  if (t) { const r = $$('input[name=event_type]').find(i => i.value === t); if (r) r.checked = true; }
  const reason = qs.get('reason');
  if (reason) { const s = $('#c-reason'); if (s) { [...s.options].forEach(o => { if (o.text === reason) s.value = o.text; }); } }
  $$('#f-date,#d-date').forEach(d => { d.min = new Date().toISOString().slice(0, 10); });
  if (qs.get('ref')) { const r = $('#d-ref'); if (r) r.value = qs.get('ref'); }
  if (qs.get('email')) { const r = $('#d-email'); if (r) r.value = qs.get('email'); }

  /* ---------- form validation helpers ---------- */
  const fieldOk = f => {
    const inputs = $$('input,select,textarea', f).filter(i => i.required);
    if (!inputs.length) return true;
    let ok;
    if (inputs[0].type === 'radio') ok = inputs.some(i => i.checked);
    else if (inputs[0].type === 'checkbox') ok = inputs.every(i => i.checked);
    else ok = inputs.every(i => i.value.trim() && i.checkValidity());
    f.classList.toggle('bad', !ok);
    return ok;
  };
  const validate = scope => {
    const fields = $$('.field', scope); let first = null;
    fields.forEach(f => { if (!fieldOk(f) && !first) first = f; });
    if (first) { const i = $('input,select,textarea', first); i && i.focus({ preventScroll: true }); scrollToEl(first, -140); }
    return !first;
  };
  document.addEventListener('change', e => { const f = e.target.closest('.field.bad'); if (f) fieldOk(f); });
  document.addEventListener('input', e => { const f = e.target.closest('.field.bad'); if (f) fieldOk(f); });

  /* multi-step booking form */
  $$('form[data-steps]').forEach(form => {
    const steps = $$('.step', form); const dots = $$('.steps li', form.parentElement);
    const prev = $('[data-prev]', form), next = $('[data-next]', form), submit = $('[data-submit]', form);
    let i = 0;
    const show = n => {
      i = n; steps.forEach((s, k) => s.classList.toggle('on', k === i));
      dots.forEach((d, k) => { d.classList.toggle('on', k === i); d.classList.toggle('done', k < i); });
      prev.hidden = i === 0; next.hidden = i === steps.length - 1; submit.hidden = i !== steps.length - 1;
      scrollToEl(form.parentElement, -120);
      const first = $('input:not([type=hidden]),select,textarea', steps[i]); first && setTimeout(() => first.focus({ preventScroll: true }), 350);
      track('booking_step', { step: i + 1 });
    };
    next.addEventListener('click', () => { if (validate(steps[i])) show(i + 1); });
    prev.addEventListener('click', () => show(i - 1));
    form.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && i < steps.length - 1) { e.preventDefault(); next.click(); } });
    form.addEventListener('submit', e => {
      if (!validate(steps[i])) { e.preventDefault(); return; }
      submit.disabled = true; submit.lastChild.textContent = ' Sending…';
      track('booking_enquiry_submit', { event_type: (form.event_type && form.event_type.value) || '' });
    });
  });
  $$('form[data-simple]').forEach(form => form.addEventListener('submit', e => {
    if (!validate(form)) { e.preventDefault(); return; }
    track('form_submit', { form: form.getAttribute('name') });
  }));

  /* deposit → Stripe Checkout (Netlify function, same Stripe account as KASA) */
  const dep = $('form[data-deposit]');
  if (dep) {
    const amt = $('[data-deposit-amount]', dep); let last = '';
    const preview = async () => {
      const ref = dep.ref.value.trim().toUpperCase(); if (!amt || ref.length < 6 || ref === last) return; last = ref;
      try {
        const d = await (await fetch('/.netlify/functions/create-deposit?ref=' + encodeURIComponent(ref))).json();
        if (d.paid) { amt.textContent = 'This booking’s deposit is already paid — thank you!'; amt.hidden = false; }
        else if (d.amount > 0) { amt.innerHTML = 'Deposit to pay: <b>A$' + Number(d.amount).toLocaleString('en-AU', { minimumFractionDigits: d.amount % 1 ? 2 : 0 }) + '</b>'; amt.hidden = false; }
        else amt.hidden = true;
      } catch (err) { amt.hidden = true; }
    };
    dep.ref.addEventListener('change', preview); dep.ref.addEventListener('blur', preview);
    if (dep.ref.value) preview(); else setTimeout(() => dep.ref.value && preview(), 300);
  }
  if (dep) dep.addEventListener('submit', async e => {
    e.preventDefault(); if (!validate(dep)) return;
    const msg = $('[data-deposit-msg]', dep); const btn = $('button[type=submit]', dep);
    btn.disabled = true; msg.textContent = 'Opening secure payment…';
    try {
      const r = await fetch('/.netlify/functions/create-deposit', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: dep.ref.value.trim(), email: dep.email.value.trim(), event_date: dep.event_date.value }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.url) { track('deposit_checkout'); location.href = d.url; return; }
      msg.textContent = d.error || 'Online deposits aren’t switched on yet. Reply to your quote email and we’ll send you a payment link.';
    } catch (err) {
      msg.textContent = 'We couldn’t reach the payment page. Check your connection and try again.';
    }
    btn.disabled = false;
  });

  window.addEventListener('pageshow', e => { if (!e.persisted) return;
    $$('form [data-submit], form[data-simple] button[type=submit], form[data-deposit] button[type=submit]').forEach(b => { b.disabled = false; if (b.matches('[data-submit]') && /Sending/.test(b.lastChild.textContent)) b.lastChild.textContent = ' Send booking enquiry'; }); });

  /* thank-you page wording */
  const th = $('[data-thanks]');
  if (th) {
    const f = qs.get('f'); const h = $('h1');
    if (f === 'deposit') { h.textContent = 'Deposit received!'; $('.lede').textContent = 'Your date with Kiko is locked in. A receipt is on its way to your inbox.'; track('deposit_paid'); }
    else if (f === 'updates') { h.textContent = 'You’re on the list!'; $('.lede').textContent = 'You’ll be first to hear when Kiko products arrive.'; }
    else if (f === 'booking') track('booking_enquiry_thanks');
  }

  /* gallery filter */
  const filt = $$('[data-filter]');
  filt.forEach(b => b.addEventListener('click', () => {
    filt.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    const c = b.dataset.filter; let n = 0;
    $$('.g-item').forEach(it => { const show = c === 'all' || it.dataset.cat === c; it.hidden = !show; n += show; });
    const empty = $('[data-gallery-empty]'); if (empty) empty.hidden = n > 0;
  }));

  /* real Kiko videos: play only while on screen, one with sound at a time */
  const vids = $$('[data-vid] video');
  if (vids.length) {
    const io = 'IntersectionObserver' in window && new IntersectionObserver(es => es.forEach(e => {
      const v = e.target;
      if (e.isIntersecting && !RM) { v.preload = 'auto'; const p = v.play(); if (p) p.catch(() => {}); }
      else if (!e.isIntersecting) v.pause();
    }), { threshold: 0.35 });
    const near = 'IntersectionObserver' in window && new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.poster = e.target.dataset.poster; near.unobserve(e.target); } }), { rootMargin: '900px 0px' });
    vids.forEach(v => { if (near) near.observe(v); else v.poster = v.dataset.poster; if (io) io.observe(v); v.addEventListener('click', () => v.paused ? v.play() : v.pause()); });
    $$('[data-sound]').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      const v = b.closest('[data-vid]').querySelector('video'); const on = v.muted;
      vids.forEach(o => { o.muted = true; const ob = o.closest('[data-vid]').querySelector('[data-sound]'); ob.setAttribute('aria-pressed', 'false'); ob.setAttribute('aria-label', 'Turn sound on'); });
      v.muted = !on; b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
      if (on) { v.currentTime = 0; v.play().catch(() => {}); track('video_sound_on'); }
    }));
  }

  /* gentle 3D tilt on the real photos and videos */
  if (!RM && matchMedia('(hover:hover)').matches) $$('.snap, .vid-frame').forEach(el => {
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 14 + 'deg'); el.style.setProperty('--rx', ((e.clientY - r.top) / r.height - .5) * -14 + 'deg'); });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg'); });
  });

  /* photo lightbox */
  const shots = $$('[data-lightbox]');
  if (shots.length) {
    const lb = document.createElement('dialog'); lb.className = 'lb'; lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML = '<img alt=""><p></p><button class="lb-prev" type="button" aria-label="Previous photo">‹</button><button class="lb-next" type="button" aria-label="Next photo">›</button><button class="lb-x" type="button" aria-label="Close">×</button>';
    document.body.appendChild(lb);
    let k = 0; const im = $('img', lb), cap = $('p', lb);
    const showShot = i => { k = (i + shots.length) % shots.length; const s = shots[k]; im.src = s.dataset.lightbox; im.alt = $('img', s).alt; cap.textContent = ($('figcaption', s) || {}).textContent || ''; };
    shots.forEach((s, i) => { s.tabIndex = 0; s.setAttribute('role', 'button');
      const open = () => { showShot(i); lb.showModal(); track('photo_open'); };
      s.addEventListener('click', open); s.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }); });
    $('.lb-prev', lb).onclick = () => showShot(k - 1); $('.lb-next', lb).onclick = () => showShot(k + 1); $('.lb-x', lb).onclick = () => lb.close();
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') showShot(k - 1); if (e.key === 'ArrowRight') showShot(k + 1); });
    let sx = null; lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) showShot(k + (dx < 0 ? 1 : -1)); sx = null; });
  }

  /* ---------- smooth scroll + motion ---------- */
  let lenis = null;
  function scrollToEl(el, offset = -110) {
    if (!el) return;
    const top = el.getBoundingClientRect().top + scrollY + offset;
    if (Math.abs(el.getBoundingClientRect().top) < 140 && offset < 0 && el.getBoundingClientRect().top > 60) return;
    if (lenis) lenis.scrollTo(top, { duration: 0.9 }); else scrollTo({ top, behavior: RM ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href*="#"]'); if (!a) return;
    const u = new URL(a.href, location.href);
    if (u.pathname !== location.pathname || !u.hash) return;
    const el = document.getElementById(decodeURIComponent(u.hash.slice(1))); if (!el) return;
    e.preventDefault(); history.pushState(null, '', u.hash); scrollToEl(el, -100);
    if (menu && menu.classList.contains('open')) setMenu(false);
  });

  if (RM || !window.gsap || !window.ScrollTrigger) { $$('.stage .layer').forEach(l => { l.style.transform = 'none'; }); return; }
  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    if (location.hash) { const el = document.getElementById(location.hash.slice(1)); if (el) setTimeout(() => lenis.scrollTo(el, { offset: -100, immediate: true }), 60); }
  }

  /* hero stage: entrance, scroll pop-out, pointer depth */
  $$('[data-stage]').forEach(stage => {
    const frame = $('[data-frame]', stage);
    const layers = $$('.layer', frame);
    const pop = $('[data-kiko]', stage);
    const body = pop && $('[data-kiko-body]', pop);
    const tilt = pop && $('[data-tilt]', pop);
    const shadow = pop && $('[data-shadow]', pop);
    const copy = $('[data-hero-copy]', stage);
    const isHome = stage.hasAttribute('data-hero-home');

    // one orchestrated entrance: the scene settles, Kiko bounds up out of it
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
    intro.fromTo(layers, { scale: 1.08 }, { scale: 1, duration: 1.4, stagger: 0.04 }, 0)
      .from(copy ? copy.children : [], { y: 30, opacity: 0, duration: .8, stagger: .08 }, .15);
    if (tilt) intro.from(tilt, { yPercent: 38, scale: .78, rotation: 7, opacity: 0, duration: 1.1, ease: 'back.out(1.6)' }, .25);
    if (isHome && pop) intro.add(() => sayHi(pop, 'G’day! I’m Kiko!'), 1.3);
    if (pop) intro.add(() => waveHand($('[data-wave]', pop)), 1.1);

    // scroll: frame tips back, layers drift at their depth, Kiko comes forward out of the screen
    const mm = gsap.matchMedia();
    mm.add({ big: '(min-width: 901px)', small: '(max-width: 900px)' }, ctx => {
      const big = ctx.conditions.big;
      const tl = gsap.timeline({ scrollTrigger: { trigger: stage, start: 'top top', end: 'bottom top', scrub: 0.6 } });
      if (big) tl.to(frame, { rotationX: 9, scale: .95, y: 30, ease: 'none' }, 0);
      layers.forEach(l => tl.to(l, { yPercent: (parseFloat(l.dataset.depth) || 0) * (big ? 16 : 10), ease: 'none' }, 0));
      if (body) tl.to(body, { scale: big ? 1.2 : 1.1, yPercent: big ? -10 : -4, xPercent: big ? -6 : 0, rotation: -3, ease: 'none' }, 0);
      if (copy && big) tl.to(copy, { yPercent: -18, ease: 'none' }, 0);
    });

    // pointer anywhere on the page: Kiko turns toward you, the world shifts behind him
    if (FINE && tilt) {
      const rx = gsap.quickTo(tilt, 'rotationX', { duration: .7, ease: 'power3' });
      const ry = gsap.quickTo(tilt, 'rotationY', { duration: .7, ease: 'power3' });
      const sx = shadow ? gsap.quickTo(shadow, 'x', { duration: .7 }) : null;
      gsap.set(tilt, { transformPerspective: 900 });
      const lx = layers.map(l => gsap.quickTo(l, 'x', { duration: 1.1, ease: 'power3' }));
      let onScreen = true;
      new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }).observe(stage);
      addEventListener('pointermove', e => {
        if (!onScreen) return;
        const r = tilt.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height * .35;
        const px = gsap.utils.clamp(-1, 1, (e.clientX - cx) / (innerWidth * .5));
        const py = gsap.utils.clamp(-1, 1, (e.clientY - cy) / (innerHeight * .6));
        ry(px * 16); rx(-py * 9); sx && sx(-px * 26);
        const sp = e.clientX / innerWidth - .5;
        layers.forEach((l, k) => lx[k](-sp * (parseFloat(l.dataset.depth) || 0) * 60));
      }, { passive: true });
      document.documentElement.addEventListener('pointerleave', () => { rx(0); ry(0); sx && sx(0); lx.forEach(f => f(0)); });
    }
  });

  /* ---------- alive: breathing, blinking, petting, scroll squash ---------- */
  $$('[data-breath]').forEach((b, i) => {
    gsap.to(b, { scaleY: 1.035, scaleX: .985, y: -7, duration: 1.6 + i * .15, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  });
  const blink = scope => {
    const l = $$('[data-lid]', scope); if (!l.length) return;
    const tl = gsap.timeline();
    tl.to(l, { scaleY: 1, duration: .075, ease: 'power2.in' }).to(l, { scaleY: 0, duration: .11, ease: 'power2.out', delay: .05 });
    if (Math.random() < .25) tl.to(l, { scaleY: 1, duration: .07, delay: .12 }).to(l, { scaleY: 0, duration: .1 });
  };
  const blinkLoop = () => {
    $$('[data-kiko], [data-react]').forEach(k => { const r = k.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) blink(k); });
    setTimeout(blinkLoop, 2600 + Math.random() * 3200);
  };
  setTimeout(blinkLoop, 2200);

  /* eyes follow the pointer; without a mouse they glance around on their own */
  const eyes = $$('[data-eye]').map(e => {
    const iris = $('[data-iris]', e);
    return { e, x: gsap.quickTo(iris, 'x', { duration: .35, ease: 'power3' }), y: gsap.quickTo(iris, 'y', { duration: .35, ease: 'power3' }) };
  });
  let lastPointer = 0;
  const look = (tx, ty) => eyes.forEach(o => {
    const r = o.e.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = tx - cx, dy = ty - cy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
    // which way is the art flipped? (a mirrored wrapper inverts x)
    const flip = o.flip ?? (o.flip = !!o.e.closest('[style*="scaleX(-1)"]'));
    o.x((flip ? -1 : 1) * dx / d * k * r.width * .17); o.y(dy / d * k * r.height * .14);
  });
  addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { lastPointer = Date.now(); look(e.clientX, e.clientY); } }, { passive: true });
  const glance = () => {
    if (Date.now() - lastPointer > 2500) look(innerWidth * Math.random(), innerHeight * (.2 + Math.random() * .6));
    setTimeout(glance, 1400 + Math.random() * 2200);
  };
  setTimeout(glance, 1800);

  /* idle life: every few seconds Kiko does a little something */
  const idle = () => {
    $$('[data-kiko], [data-react]').forEach(pop => {
      const r = pop.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || r.height < 20) return;
      const t = pop.matches('[data-react]') ? pop : $('[data-tilt]', pop), n = Math.random(), hand = $('[data-wave]', pop);
      if (hand && n < .5) waveHand(hand);
      else if (n < .35) gsap.timeline().to(t, { rotation: -4, duration: .35, ease: 'sine.inOut' }).to(t, { rotation: 3, duration: .45, ease: 'sine.inOut' }).to(t, { rotation: 0, duration: .5, ease: 'sine.out' });
      else if (n < .6) hop(t);
      else if (n < .8) blink(pop);
    });
    setTimeout(idle, 4500 + Math.random() * 4000);
  };
  setTimeout(idle, 5000);

  /* Kiko gets excited when you go near a booking button */
  let lastCheer = 0;
  document.addEventListener('pointerover', e => {
    const a = e.target.closest('a[href*="/book"]'); if (!a || Date.now() - lastCheer < 6000) return;
    const pop = $$('[data-kiko], [data-react]').find(p => { const r = p.getBoundingClientRect(); return r.bottom > 40 && r.top < innerHeight - 40 && r.height > 20; });
    if (!pop) return; lastCheer = Date.now();
    sayHi(pop, ['Yes! Book me!', 'Ooh, pick me!', 'I’m ready when you are!'][Math.random() * 3 | 0]); hop(pop.matches('[data-react]') ? pop : $('[data-tilt]', pop));
  });

  const HEART = '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3.4 5 7 5c2 0 3.3 1 5 3 1.7-2 3-3 5-3 3.6 0 5.8 3.6 4.5 6.8C19.5 16.4 12 21 12 21z"/></svg>';
  const heart = (x, y) => {
    const h = document.createElement('span'); h.className = 'heart-pop'; h.innerHTML = HEART;
    h.style.left = x + 'px'; h.style.top = y + 'px';
    h.style.color = ['#d92e6c', '#ff8a1e', '#ffcf3a', '#5fa420'][Math.random() * 4 | 0];
    document.body.appendChild(h);
    gsap.fromTo(h, { scale: .3, opacity: 1, rotation: gsap.utils.random(-30, 30) },
      { y: gsap.utils.random(-90, -50), x: gsap.utils.random(-30, 30), scale: gsap.utils.random(.8, 1.3), opacity: 0, duration: 1.1, ease: 'power2.out', onComplete: () => h.remove() });
  };
  const pettable = (scope, hoverEl, bounceEl, isHero) => {
    let dist = 0, last = null, lastHeart = 0, tickled = 0, greeted = false;
    hoverEl.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse') return;
      gsap.to(bounceEl, { scale: 1.045, duration: .35, ease: 'back.out(3)' }); waveHand($('[data-wave]', scope));
      if (!greeted) { greeted = true; sayHi(scope, ['Ooh, hello there!', 'Hi hi!', 'You found me!'][Math.random() * 3 | 0]); }
    });
    hoverEl.addEventListener('pointerleave', () => { gsap.to(bounceEl, { scale: 1, duration: .5 }); last = null; dist = 0; });
    hoverEl.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      if (last) dist += Math.hypot(e.clientX - last[0], e.clientY - last[1]);
      last = [e.clientX, e.clientY];
      if (dist - lastHeart > 70) { lastHeart = dist; heart(e.clientX, e.clientY); }
      if (dist > 900 && Date.now() - tickled > 4000) {
        tickled = Date.now(); dist = 0; lastHeart = 0;
        sayHi(scope, ['Hehe, that tickles!', 'Soft, right? Pure dragon fluff.', 'Okay okay, one more pat!'][Math.random() * 3 | 0]);
        gsap.fromTo(bounceEl, { rotation: -6 }, { rotation: 0, duration: .9, ease: 'elastic.out(1.2, .25)' });
        blink(scope);
      }
    });
    hoverEl.addEventListener('click', e => {
      blink(scope);
      if (!isHero) { sayHi(scope); hop(bounceEl); waveHand($('[data-wave]', scope)); track('kiko_hi'); for (let i = 0; i < 5; i++) setTimeout(() => heart(e.clientX + (Math.random() - .5) * 40, e.clientY), i * 60); }
    });
  };
  $$('[data-kiko]').forEach(pop => pettable(pop, $('[data-kiko-body]', pop), $('[data-tilt]', pop), true));
  $$('[data-react]').forEach(el => pettable(el, el, el, false));

  if (lenis) {
    const squash = $$('[data-kiko-body]').map(b => gsap.quickTo(b, 'skewY', { duration: .5, ease: 'power3' }));
    lenis.on('scroll', ({ velocity }) => { const v = gsap.utils.clamp(-5, 5, velocity * .18); squash.forEach(f => f(v)); });
  }

  /* Kiko peeks over the form and rests a hand on its edge */
  $$('[data-peekwrap]').forEach(w => {
    const parts = $$('.po', w);
    gsap.fromTo(parts, { yPercent: 38, rotation: 4 }, { yPercent: 0, rotation: 0, ease: 'none', scrollTrigger: { trigger: w, start: 'top 95%', end: 'top 45%', scrub: 0.6 } });
  });

  /* he waves along as you scroll */
  const hands = $$('[data-wave]').map(h => ({ h, r: gsap.quickTo(h, 'rotation', { duration: .25, ease: 'sine.out' }) }));
  let waveRest;
  addEventListener('scroll', () => {
    const y = scrollY;
    hands.forEach(o => { const b = o.h.getBoundingClientRect(); if (b.bottom > 0 && b.top < innerHeight && !o.h._waving) o.r(Math.sin(y / 70) * 17); });
    clearTimeout(waveRest); waveRest = setTimeout(() => hands.forEach(o => { if (!o.h._waving) o.r(0); }), 260);
  }, { passive: true });

  /* Meet Kiko: he climbs up out of the portal as you scroll */
  $$('[data-portal]').forEach(p => {
    const img = $('[data-riser]', p);
    gsap.set(img, { xPercent: -50, x: 0 });
    gsap.fromTo(img, { yPercent: 62 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: p, start: 'top 92%', end: 'top 32%', scrub: 0.6 } });
    const live = $('[data-react]', p);
    if (live) ScrollTrigger.create({ trigger: p, start: 'top 40%', once: true, onEnter: () => { sayHi(live, 'Hi, I’m Kiko!'); waveHand($('[data-wave]', live)); } });
  });

  /* adventure postcard drifts inside its frame */
  $$('[data-parallax-img] img').forEach(img => {
    gsap.fromTo(img, { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* signposts swing into place */
  $$('[data-signs]').forEach(s => {
    gsap.from($$('.sign', s), { rotation: i => (i % 2 ? 24 : -24), x: i => (i % 2 ? 40 : -40), opacity: 0, duration: .9, ease: 'back.out(2)', stagger: .08,
      scrollTrigger: { trigger: s, start: 'top 82%', once: true }, clearProps: 'transform,opacity' });
  });

  /* sunset: Kiko rises over the horizon */
  $$('[data-rise]').forEach(img => {
    gsap.set(img, { xPercent: -50, x: 0 });
    gsap.fromTo(img, { yPercent: 55 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.closest('section'), start: 'top 75%', end: 'bottom bottom', scrub: 0.6 } });
  });
  /* call-to-action Kiko pops up over the panel edge */
  $$('.cta-panel .kiko-side').forEach(img => {
    gsap.fromTo(img, { yPercent: 30, rotation: 6 }, { yPercent: 0, rotation: 0, ease: 'none', scrollTrigger: { trigger: img.closest('.cta-panel'), start: 'top 90%', end: 'center 55%', scrub: 0.6 } });
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
