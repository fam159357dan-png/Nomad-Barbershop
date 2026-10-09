(() => {
  const root = document.documentElement;

  // Accordion works with or without animation libraries.
  const svcs = document.querySelectorAll('.svc');
  const openSvc = (el) => svcs.forEach((s) => {
    const on = s === el;
    s.classList.toggle('open', on);
    s.querySelector('.svc-head').setAttribute('aria-expanded', on);
  });
  svcs.forEach((s) => {
    s.querySelector('.svc-head').addEventListener('click', () => openSvc(s));
    if (matchMedia('(hover:hover)').matches) s.addEventListener('mouseenter', () => openSvc(s));
  });

  // No motion (reduced-motion users, or libraries failed): page stays fully visible.
  if (!root.classList.contains('js') || !window.gsap || !window.ScrollTrigger) {
    root.classList.remove('js');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Smooth scroll. Lenis drives ScrollTrigger so both share one clock.
  const lenis = new Lenis({ duration: 1.25, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -40 });
    })
  );

  // Intro: wordmark, curtain up, then hero text (hierarchy: headline first, then actions, then image).
  gsap.set('.line-in', { y: '115%' });
  const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro
    .fromTo('.loader-logo', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5 })
    .to('.loader', { yPercent: -100, duration: 0.7, ease: 'expo.inOut' }, '+=0.05')
    .set('.loader', { display: 'none' })
    .to('.line-in', { yPercent: 0, y: 0, duration: 1, stagger: 0.12 }, '-=0.35')
    .fromTo('[data-hero]', { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1, stagger: 0.12 }, '-=0.7')
    .to('.hero-word', { opacity: 1, duration: 1.4 }, '-=0.9');

  // Parallax: depth for the hero photo and outlined wordmark.
  gsap.to('.hero-media-inner', {
    yPercent: 10, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero-word', {
    xPercent: -12, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  // Scroll reveal: content enters in reading order.
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.1, overwrite: true }),
  });

  // Count-up on stats (feedback that the numbers are real, not decoration).
  document.querySelectorAll('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const dec = +(el.dataset.dec || 0);
    const sep = el.dataset.sep;
    const fmt = (v) => {
      const s = v.toFixed(dec).replace('.', ',');
      return sep ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : s;
    };
    const o = { v: 0 };
    el.textContent = fmt(0);
    gsap.to(o, {
      v: end, duration: 2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => (el.textContent = fmt(o.v)),
    });
  });

  // Team: each name lights up as it reaches the middle of the screen.
  gsap.utils.toArray('.tname').forEach((n) => {
    gsap.fromTo(n, { opacity: 0.18, x: 0 }, {
      opacity: 1, x: 16, ease: 'none',
      scrollTrigger: { trigger: n, start: 'top 85%', end: 'top 50%', scrub: true },
    });
    gsap.to(n, {
      opacity: 0.18, x: 0, ease: 'none',
      scrollTrigger: { trigger: n, start: 'top 30%', end: 'top 12%', scrub: true, immediateRender: false },
    });
  });

  // Gallery: slight scale-in as tiles arrive.
  gsap.utils.toArray('.cell img').forEach((img) =>
    gsap.fromTo(img, { scale: 1.2 }, {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'top 30%', scrub: true },
    })
  );

  // Nav: glass when scrolled, hides on scroll down, returns on scroll up.
  const nav = document.getElementById('nav');
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      nav.classList.toggle('scrolled', self.scroll() > 40);
      nav.classList.toggle('hide', self.direction === 1 && self.scroll() > 400);
    },
  });

  // Magnetic buttons (pointer devices only, no React state, GSAP quickTo).
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.querySelectorAll('.magnet').forEach((b) => {
      const x = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' });
      const y = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        x((e.clientX - r.left - r.width / 2) * 0.3);
        y((e.clientY - r.top - r.height / 2) * 0.3);
      });
      b.addEventListener('pointerleave', () => { x(0); y(0); });
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());
})();
