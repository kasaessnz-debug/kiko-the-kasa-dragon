/* Kiko — The KASA Dragon · interactions (v2 design, Nov 2026)
   Motion: GSAP + ScrollTrigger. Everything degrades to a static page
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
  const bar = $('.book-bar'); const hero = $('.home-hero, .page-hero');
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

  /* ---------- menu (phones + small laptops) ---------- */
  const menu = $('#mobile-menu'); const openBtn = $('.nav .menu-btn');
  const setMenu = open => {
    if (!menu) return;
    menu.classList.toggle('open', open); document.body.classList.toggle('menu-open', open);
    openBtn.setAttribute('aria-expanded', String(open)); openBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (head) head.classList.remove('is-hidden');
    if (open) { const f = $('a', menu); f && setTimeout(() => f.focus({ preventScroll: true }), 300); }
  };
  openBtn && openBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu && $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu && menu.classList.contains('open')) { setMenu(false); openBtn.focus(); } });

  /* ---------- pre-fill from links ---------- */
  const qs = new URLSearchParams(location.search);
  const t = qs.get('type');
  if (t) { const r = $$('input[name=event_type]').find(i => i.value === t); if (r) r.checked = true; }
  const sty = qs.get('style');
  if (sty) { const r = $$('input[name=appearance_style]').find(i => i.value === sty); if (r) r.checked = true; }
  const reason = qs.get('reason');
  if (reason) { const s = $('#c-reason'); if (s) { [...s.options].forEach(o => { if (o.text === reason) s.value = o.text; }); } }
  $$('#f-date,#d-date,#k-date').forEach(d => { d.min = new Date().toISOString().slice(0, 10); });
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
    track(form.getAttribute('name') === 'check-date' ? 'booking_enquiry_submit' : 'form_submit', { form: form.getAttribute('name') });
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
    else if (f === 'check') { h.textContent = 'Date check sent!'; $('.lede').textContent = 'We’ll check Kiko’s diary and reply by email with availability and a quote.'; track('booking_enquiry_thanks'); }
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

  /* ---------- smooth anchor scroll ---------- */
  function scrollToEl(el, offset = -110) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (Math.abs(r.top) < 140 && offset < 0 && r.top > 60) return;
    scrollTo({ top: r.top + scrollY + offset, behavior: RM ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href*="#"]'); if (!a) return;
    const u = new URL(a.href, location.href);
    if (u.pathname !== location.pathname || !u.hash) return;
    const el = document.getElementById(decodeURIComponent(u.hash.slice(1))); if (!el) return;
    e.preventDefault(); history.pushState(null, '', u.hash); scrollToEl(el, -100);
    if (el.id === 'check') { const d = $('#k-date'); d && setTimeout(() => d.focus({ preventScroll: true }), 500); }
  });

  /* ---------- reel wall: two rows drift opposite ways, speed up + lean when you scroll ---------- */
  const rows = $$('[data-reel-row]');
  if (rows.length === 2) {
    const [A, B] = rows; let xa = 0, xb = 0, boost = 0, skew = 0, on = false, wA = 0, wB = 0;
    const measure = () => { wA = A.scrollWidth / 3; wB = B.scrollWidth / 3; }; measure(); addEventListener('resize', measure); addEventListener('load', measure);
    const loop = () => {
      if (on) {
        const sp = RM ? 0 : .55 + boost;
        xa -= sp; xb += sp; if (-xa > wA) xa += wA; if (xb > 0) xb -= wB;
        A.style.transform = `translate3d(${xa.toFixed(1)}px,0,0) skewX(${skew.toFixed(2)}deg)`; B.style.transform = `translate3d(${(xb - wB).toFixed(1)}px,0,0) skewX(${(-skew).toFixed(2)}deg)`;
        boost *= .92; skew *= .9;
      }
      requestAnimationFrame(loop);
    };
    new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(A.parentElement);
    requestAnimationFrame(loop);
    let ly = scrollY;
    const SKEW = !matchMedia('(max-width:760px)').matches;
    addEventListener('scroll', () => { if (!on) return; const d = scrollY - ly; ly = scrollY; if (RM) return; boost = Math.min(14, Math.abs(d) * .25); if (SKEW) skew = Math.max(-8, Math.min(8, d * .12)); }, { passive: true });
    const rv = $$('.reel video');
    // Phones: only the top row plays (the bottom row shows posters) so older phones stay smooth.
    const SMALL = matchMedia('(max-width:760px)').matches || (navigator.hardwareConcurrency || 8) <= 4;
    const io = new IntersectionObserver(es => es.forEach(e => { const v = e.target;
      if (e.isIntersecting && !RM) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else if (!v.paused) v.pause(); }), { rootMargin: SMALL ? '0px' : '0px 200px', threshold: SMALL ? .5 : 0 });
    rv.forEach(v => { if (!(SMALL && v.closest('[data-reel-row="B"]'))) io.observe(v); });
    $$('.reel .snd').forEach(b => b.addEventListener('click', () => {
      const v = b.parentNode.querySelector('video'); const turnOn = v.muted;
      rv.forEach(o => { o.muted = true; const ob = o.parentNode.querySelector('.snd'); ob.setAttribute('aria-pressed', 'false'); ob.setAttribute('aria-label', 'Turn sound on'); });
      $$('[data-vid] video').forEach(o => { o.muted = true; });
      v.muted = !turnOn; b.setAttribute('aria-pressed', String(turnOn)); b.setAttribute('aria-label', turnOn ? 'Turn sound off' : 'Turn sound on');
      if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); if (turnOn) track('video_sound_on');
    }));
  }

  /* ---------- Watch Kiko: a curved, endless ring of videos. The front one plays. ---------- */
  const vs = $('[data-vs]');
  if (vs) {
    const ring = $('[data-vs-track]', vs), slides = $$('[data-vs-slide]', vs), dots = $$('[data-vs-dots] button', vs), n = slides.length;
    let pos = 0, target = 0, cur = -1, seen = false, running = false, drag = null;
    const STEP = 32 * Math.PI / 180;                       // angle between neighbours
    const wrap = d => ((d % n) + n + n / 2) % n - n / 2;  // -n/2 .. n/2
    const vidOf = s => $('video', s);
    const playCur = () => slides.forEach((s, k) => { const v = vidOf(s);
      if (k === cur && seen && !RM) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else if (!v.paused) v.pause(); });
    const layout = () => {
      const sw = slides[0].offsetWidth, R = sw * 1.75;
      slides.forEach((s, k) => {
        const d = wrap(k - pos), a = d * STEP, ad = Math.abs(d);
        const x = Math.sin(a) * R, z = (Math.cos(a) - 1) * R;
        s.style.transform = `translate3d(${x.toFixed(1)}px,${(ad * 10).toFixed(1)}px,${z.toFixed(1)}px) rotateY(${(-a * 180 / Math.PI).toFixed(2)}deg)`;
        s.style.opacity = ad > 2.4 ? 0 : 1; s.style.zIndex = 100 - Math.round(ad * 10);
        s.style.setProperty('--dim', Math.min(.6, ad * .38).toFixed(2));
      });
      const c = ((Math.round(pos) % n) + n) % n;
      if (c !== cur) { cur = c; slides.forEach((s, k) => s.classList.toggle('on', k === c)); dots.forEach((d, k) => d.setAttribute('aria-current', String(k === c))); playCur(); }
    };
    const tick = () => {
      if (!drag) pos += (target - pos) * (RM ? 1 : .14);
      layout();
      if (drag || Math.abs(target - pos) > .001) requestAnimationFrame(tick); else { pos = target; layout(); running = false; }
    };
    const kick = () => { if (!running) { running = true; requestAnimationFrame(tick); } };
    const go = step => { target = Math.round(target) + step; kick(); track('watch_slide'); };
    $('[data-vs-prev]') && $('[data-vs-prev]').addEventListener('click', () => go(-1));
    $('[data-vs-next]') && $('[data-vs-next]').addEventListener('click', () => go(1));
    dots.forEach((d, k) => d.addEventListener('click', () => go(wrap(k - target))));
    ring.addEventListener('pointerdown', e => {
      if (e.target.closest('.snd')) return;
      drag = { x: e.clientX, y: e.clientY, p: pos, moved: false, id: e.pointerId };
    });
    addEventListener('pointermove', e => { if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - drag.y)) { drag.moved = true; try { ring.setPointerCapture(drag.id); } catch (er) {} }
      if (drag.moved) { pos = drag.p - dx / (slides[0].offsetWidth * 1.1); target = pos; kick(); } }, { passive: true });
    const end = e => { if (!drag) return; const d = drag; drag = null;
      if (d.moved) { const v = (pos - d.p); target = Math.round(pos + Math.sign(v) * .25); kick(); return; }
      const s = e.target.closest && e.target.closest('[data-vs-slide]'); if (!s) return;
      const k = slides.indexOf(s);
      if (k === cur) { const v = vidOf(s); v.paused ? v.play().catch(() => {}) : v.pause(); } else go(wrap(k - target)); };
    addEventListener('pointerup', end); addEventListener('pointercancel', () => { drag = null; target = Math.round(pos); kick(); });
    ring.tabIndex = 0; ring.setAttribute('aria-label', 'Kiko videos. Use the left and right arrow keys.');
    ring.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } });
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; playCur(); }, { threshold: .35 }).observe(ring);
    addEventListener('resize', layout);
    $$('.snd', vs).forEach(b => b.addEventListener('click', () => {
      const v = b.closest('.vs-frame').querySelector('video'); const turnOn = v.muted;
      $$('video').forEach(o => { o.muted = true; }); $$('.snd').forEach(o => { o.setAttribute('aria-pressed', 'false'); o.setAttribute('aria-label', 'Turn sound on'); });
      v.muted = !turnOn; b.setAttribute('aria-pressed', String(turnOn)); b.setAttribute('aria-label', turnOn ? 'Turn sound off' : 'Turn sound on');
      if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); if (turnOn) track('video_sound_on'); }));
    layout();
  }

  /* ---------- Dress up Kiko: tap or drag stickers onto the real Kiko, then save a photo ---------- */
  const dress = $('[data-dress]');
  if (dress) {
    const fig = $('[data-dress-fig]', dress), layer = $('[data-dress-layer]', dress), hint = $('[data-dress-hint]', dress);
    const cta = $('[data-dress-cta]'), tray = $$('[data-sticker]', dress), kikoImg = $('img', fig);
    const SLOT = { hat: 'head', crown: 'head', grad: 'head', sunnies: 'eyes', bow: 'neck', scarf: 'neck', balloon: 'hand' };
    const bounce = () => { if (!RM && window.gsap) gsap.timeline().to(kikoImg, { scaleY: .94, scaleX: 1.04, transformOrigin: '50% 100%', duration: .1 }).to(kikoImg, { scaleY: 1, scaleX: 1, duration: .6, ease: 'elastic.out(1.2,.4)' }); };
    const setCta = btn => { if (!cta) return; if (!btn) { cta.hidden = true; return; }
      cta.innerHTML = btn.dataset.cta + ' <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
      cta.href = btn.dataset.href; cta.hidden = false; };
    const placedFor = name => $(`.placed[data-name="${name}"]`, layer);
    const sync = () => { tray.forEach(b => b.setAttribute('aria-pressed', String(!!placedFor(b.dataset.sticker))));
      const last = $$('.placed', layer).pop(); setCta(last ? tray.find(b => b.dataset.sticker === last.dataset.name) : null); };
    const removeSlot = name => $$('.placed', layer).forEach(p => { if (p.dataset.name !== name && SLOT[p.dataset.name] === SLOT[name]) p.remove(); });
    const place = (btn, x, y, fly) => {
      const name = btn.dataset.sticker; let el = placedFor(name);
      removeSlot(name);
      if (!el) { el = document.createElement('div'); el.className = 'placed'; el.dataset.name = name; el.innerHTML = btn.innerHTML; el.setAttribute('aria-label', btn.getAttribute('aria-label')); layer.appendChild(el); makeDraggable(el); }
      el.style.width = (+btn.dataset.w * 100) + '%'; el.style.setProperty('--rot', (btn.dataset.rot || 0) + 'deg');
      el.style.left = (x * 100) + '%'; el.style.top = (y * 100) + '%';
      layer.appendChild(el);
      if (fly && !RM && window.gsap) { const br = btn.getBoundingClientRect(), er = el.getBoundingClientRect();
        gsap.from(el, { x: br.left + br.width / 2 - (er.left + er.width / 2), y: br.top + br.height / 2 - (er.top + er.height / 2), scale: .35, duration: .55, ease: 'back.out(1.6)', onComplete: bounce }); }
      else bounce();
      if (hint) hint.style.opacity = 0; sync(); track('dress_up', { sticker: name });
    };
    const toFig = (cx, cy) => { const r = fig.getBoundingClientRect(); return [(cx - r.left) / r.width, (cy - r.top) / r.height]; };
    const inStage = (cx, cy) => { const r = dress.getBoundingClientRect(); return cx > r.left && cx < r.right && cy > r.top && cy < r.bottom - 70; };
    function makeDraggable(el) {
      el.addEventListener('pointerdown', e => {
        e.preventDefault(); el.setPointerCapture(e.pointerId); const r = el.getBoundingClientRect();
        const ox = e.clientX - (r.left + r.width / 2), oy = e.clientY - (r.top + r.height / 2);
        const move = ev => { const [x, y] = toFig(ev.clientX - ox, ev.clientY - oy); el.style.left = x * 100 + '%'; el.style.top = y * 100 + '%'; };
        const up = ev => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up);
          if (!inStage(ev.clientX, ev.clientY)) { el.remove(); sync(); } else bounce(); };
        el.addEventListener('pointermove', move); el.addEventListener('pointerup', up);
      });
    }
    tray.forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        if (e.button) return; const sx = e.clientX, sy = e.clientY; let ghost = null;
        const move = ev => {
          if (!ghost && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 8) return;
          if (!ghost) { ghost = document.createElement('div'); ghost.className = 'drag-ghost'; ghost.innerHTML = btn.innerHTML;
            ghost.style.width = fig.getBoundingClientRect().width * btn.dataset.w + 'px'; document.body.appendChild(ghost); }
          ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px';
        };
        const up = ev => { removeEventListener('pointermove', move); removeEventListener('pointerup', up);
          if (ghost) { ghost.remove(); if (inStage(ev.clientX, ev.clientY)) { const [x, y] = toFig(ev.clientX, ev.clientY); place(btn, x, y, false); } btn._dragged = true; } };
        addEventListener('pointermove', move); addEventListener('pointerup', up);
      });
      btn.addEventListener('click', () => {
        if (btn._dragged) { btn._dragged = false; return; }
        const p = placedFor(btn.dataset.sticker); if (p) { p.remove(); sync(); return; }
        place(btn, +btn.dataset.x, +btn.dataset.y, true);
      });
    });
    const clear = () => { $$('.placed', layer).forEach(p => p.remove()); sync(); };
    $('[data-dress-clear]') && $('[data-dress-clear]').addEventListener('click', clear);
    $('[data-dress-random]') && $('[data-dress-random]').addEventListener('click', () => {
      clear(); const bySlot = {}; tray.forEach(b => (bySlot[SLOT[b.dataset.sticker]] = bySlot[SLOT[b.dataset.sticker]] || []).push(b));
      Object.values(bySlot).forEach((list, i) => { if (Math.random() < .75 || i === 0) { const b = list[Math.floor(Math.random() * list.length)]; setTimeout(() => place(b, +b.dataset.x, +b.dataset.y, true), i * 160); } });
    });
    const saveBtn = $('[data-dress-save]');
    saveBtn && saveBtn.addEventListener('click', async () => {
      const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
      const load = src => new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = src; });
      try {
        await (document.fonts && document.fonts.load('80px "Titan One"'));
        g.fillStyle = '#FFC21A'; g.fillRect(0, 0, W, H);
        g.fillStyle = '#FFD95E'; g.beginPath(); g.arc(W / 2, H * .5, W * .4, 0, 7); g.fill();
        const fr = fig.getBoundingClientRect(), fh = H * .82, fw = fh * fr.width / fr.height, fx = (W - fw) / 2, fy = H - fh - 40, s = fh / fr.height;
        const k = await load(kikoImg.currentSrc || kikoImg.src);
        const kr = k.naturalWidth / k.naturalHeight, kw = Math.min(fw, fh * kr), kh = kw / kr;
        g.drawImage(k, fx + (fw - kw) / 2, fy + fh - kh, kw, kh);
        for (const p of $$('.placed', layer)) {
          const svg = $('svg', p).cloneNode(true); svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          const vb = svg.viewBox.baseVal, pr = p.getBoundingClientRect(), w = p.offsetWidth * s, h = w * vb.height / vb.width;
          const im = await load('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.outerHTML));
          const cx = fx + (pr.left + pr.width / 2 - fr.left) * s, cy = fy + (pr.top + pr.height / 2 - fr.top) * s;
          g.save(); g.translate(cx, cy); g.rotate((parseFloat(p.style.getPropertyValue('--rot')) || 0) * Math.PI / 180); g.drawImage(im, -w / 2, -h / 2, w, h); g.restore();
        }
        g.font = '64px "Titan One", sans-serif'; g.textAlign = 'center'; g.lineJoin = 'round';
        g.lineWidth = 12; g.strokeStyle = '#141414'; g.fillStyle = '#fff';
        g.strokeText('I dressed up Kiko!', W / 2, 110); g.fillText('I dressed up Kiko!', W / 2, 110);
        g.font = '800 30px Figtree, sans-serif'; g.fillStyle = '#141414'; g.fillText('kikothekasadragon.com', W / 2, H - 22);
        const blob = await new Promise(r => c.toBlob(r, 'image/png'));
        const file = new File([blob], 'kiko-dressed-up.png', { type: 'image/png' });
        track('dress_save');
        if (navigator.canShare && navigator.canShare({ files: [file] }) && matchMedia('(pointer:coarse)').matches) { await navigator.share({ files: [file], title: 'I dressed up Kiko!' }).catch(() => {}); return; }
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'kiko-dressed-up.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      } catch (err) { saveBtn.lastChild.textContent = ' Try again'; }
    });
  }

  if (RM || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- hero boxes: entrance + Kiko turns toward your pointer ---------- */
  $$('[data-hero-box]').forEach(box => {
    const kiko = $('[data-hero-kiko]', box), word = $('[data-word]', box), floats = $$('.float', box);
    if (kiko) gsap.from(kiko, { yPercent: 30, opacity: 0, duration: 1.1, ease: 'back.out(1.4)', delay: .15 });
    if (word) gsap.from(word, { yPercent: -40, opacity: 0, duration: 1, ease: 'expo.out' });
    gsap.from($$('.hero-copy > *, .hero-side > *, .ph-copy > *', box), { y: 30, opacity: 0, stagger: .08, duration: .7, ease: 'back.out(2)', delay: .45 });
    gsap.from(floats, { scale: 0, rotate: -60, stagger: .1, duration: .8, ease: 'back.out(2.5)', delay: .7 });
    gsap.to($$('.float svg', box), { y: -10, rotate: 8, yoyo: true, repeat: -1, duration: 2.2, ease: 'sine.inOut', stagger: .4 });
    if (!kiko) return;
    gsap.set(kiko, { transformPerspective: 1200 });
    const kx = gsap.quickTo(kiko, 'rotationY', { duration: .6, ease: 'power3' }), ky = gsap.quickTo(kiko, 'rotationX', { duration: .6, ease: 'power3' });
    const wx = word ? gsap.quickTo(word, 'x', { duration: .9, ease: 'power3' }) : () => {};
    const fl = floats.map(f => ({ d: +f.dataset.depth || 20, x: gsap.quickTo(f, 'x', { duration: .8 }), y: gsap.quickTo(f, 'y', { duration: .8 }) }));
    if (FINE) {
      box.addEventListener('pointermove', e => { const r = box.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
        kx(nx * 18); ky(-ny * 8); wx(-nx * 60); fl.forEach(f => { f.x(nx * f.d); f.y(ny * f.d); }); });
      box.addEventListener('pointerleave', () => { kx(0); ky(0); wx(0); fl.forEach(f => { f.x(0); f.y(0); }); });
    } else if (window.DeviceOrientationEvent && !DeviceOrientationEvent.requestPermission) {
      addEventListener('deviceorientation', e => { if (e.gamma == null) return; const nx = Math.max(-1, Math.min(1, e.gamma / 30)) / 2; kx(nx * 18); wx(-nx * 50); fl.forEach(f => f.x(nx * f.d)); }, { passive: true });
    }
    gsap.to(kiko, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: box, start: 'top top', end: 'bottom top', scrub: true } });
  });

  /* headings and tiles pop in */
  $$('.sec-h h2, .dress h2, .faqs h2, .panel h3, .kasa h2, main h2:not(.sec-h h2)').forEach(h => {
    if (h.closest('[data-hero-box]')) return;
    gsap.from(h, { y: 44, rotate: -2, opacity: 0, duration: .8, ease: 'back.out(1.8)', scrollTrigger: { trigger: h, start: 'top 90%' } });
  });
  $$('.tile, .cards .card').forEach((t, i) => gsap.from(t, { y: 60, rotate: i % 2 ? 2.5 : -2.5, opacity: 0, duration: .8, ease: 'back.out(1.6)', scrollTrigger: { trigger: t, start: 'top 94%' } }));
  $$('.kiko-side img, .panel .sticker').forEach(k => gsap.from(k, { yPercent: 40, rotate: 8, duration: 1, ease: 'back.out(1.6)', scrollTrigger: { trigger: k.parentElement, start: 'top 80%' } }));

  /* photoshoot: the stack fans out as you scroll */
  const fan = $('[data-fan]');
  if (fan) {
    const cards = $$('.shot', fan), n = cards.length, mob = matchMedia('(max-width:700px)').matches, spread = mob ? 46 : 170;
    gsap.set(cards, { rotate: i => (i - 2) * 2, y: i => i * -4 });
    gsap.timeline({ scrollTrigger: { trigger: fan, start: 'top 75%', end: 'center 45%', scrub: 1 } })
      .to(cards, { x: i => (i - (n - 1) / 2) * spread, rotate: i => (i - (n - 1) / 2) * (mob ? 5 : 7), y: i => Math.abs(i - (n - 1) / 2) * (mob ? 14 : 26), ease: 'none' });
    cards.forEach(c => { c.addEventListener('pointerenter', () => gsap.to(c, { scale: 1.06, zIndex: 5, duration: .3 })); c.addEventListener('pointerleave', () => gsap.to(c, { scale: 1, zIndex: 0, duration: .3 })); });
  }
})();
