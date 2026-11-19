document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const navDropdowns = [...document.querySelectorAll('.nav-dropdown')];
const closeDropdowns = () => navDropdowns.forEach(dropdown => {
  dropdown.classList.remove('open');
  dropdown.querySelector('button')?.setAttribute('aria-expanded', 'false');
});
navDropdowns.forEach(dropdown => dropdown.querySelector('button')?.addEventListener('click', () => {
  const wasOpen = dropdown.classList.contains('open');
  closeDropdowns();
  dropdown.classList.toggle('open', !wasOpen);
  dropdown.querySelector('button').setAttribute('aria-expanded', String(!wasOpen));
}));
document.addEventListener('click', event => {
  if (!event.target.closest('.nav-dropdown')) closeDropdowns();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeDropdowns();
});
if (menuButton && mainNav) {
  menuButton.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
  }));
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion) {
  document.documentElement.classList.add('motion-ready');
  document.querySelectorAll('.service-grid, .soon-list, .overview-facts, .route-cards').forEach(group => {
    group.querySelectorAll('.reveal, .service-card, .soon-row').forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 85}ms`);
    });
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' });
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('in-view'));
}

const video = document.querySelector('.city-video');
if (video && reducedMotion) {
  video.pause();
  video.removeAttribute('autoplay');
}

const servicesScroll = document.querySelector('.services-scroll');
if (servicesScroll) {
  const serviceRows = [...servicesScroll.querySelectorAll('.service-row')];
  const serviceCount = servicesScroll.querySelector('.services-count');
  const showcaseMotion = window.matchMedia('(min-width: 901px) and (prefers-reduced-motion: no-preference)');
  let serviceFrame = 0;
  const updateServices = () => {
    serviceFrame = 0;
    const enabled = showcaseMotion.matches;
    servicesScroll.classList.toggle('service-scroll-ready', enabled);
    const travel = Math.max(1, servicesScroll.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -servicesScroll.getBoundingClientRect().top / travel));
    const smooth = (start, end) => {
      const t = Math.min(1, Math.max(0, (progress - start) / (end - start)));
      return t * t * (3 - 2 * t);
    };
    const fadeOut = smooth(0.26, 0.60);
    const fadeIn = smooth(0.38, 0.72);
    servicesScroll.style.setProperty('--first-opacity', String(1 - fadeOut));
    servicesScroll.style.setProperty('--second-opacity', String(fadeIn));
    servicesScroll.style.setProperty('--first-rise', `${Math.round(fadeOut * -18)}px`);
    servicesScroll.style.setProperty('--second-rise', `${Math.round((1 - fadeIn) * 18)}px`);
    servicesScroll.style.setProperty('--first-blur', `${(fadeOut * 3).toFixed(1)}px`);
    servicesScroll.style.setProperty('--second-blur', `${((1 - fadeIn) * 3).toFixed(1)}px`);
    const activeIndex = progress >= 0.5 ? 1 : 0;
    serviceRows.forEach((row, index) => {
      row.classList.toggle('active', enabled && index === activeIndex);
      row.inert = enabled && index !== activeIndex;
      if (enabled && index !== activeIndex) row.setAttribute('aria-hidden', 'true');
      else row.removeAttribute('aria-hidden');
    });
    if (serviceCount) serviceCount.textContent = enabled ? `0${activeIndex + 1} / 02` : '01 / 06';
  };
  const queueServices = () => {
    if (!serviceFrame) serviceFrame = requestAnimationFrame(updateServices);
  };
  window.addEventListener('scroll', queueServices, { passive: true });
  window.addEventListener('resize', queueServices);
  showcaseMotion.addEventListener('change', queueServices);
  updateServices();
  const scrollToService = () => {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!target?.classList.contains('service-card')) return;
    const row = target.closest('.service-row');
    if (!showcaseMotion.matches) { target.scrollIntoView({ block: 'center' }); return; }
    const travel = Math.max(1, servicesScroll.offsetHeight - window.innerHeight);
    const position = servicesScroll.getBoundingClientRect().top + window.scrollY + travel * (row === serviceRows[0] ? .12 : .88);
    window.scrollTo({ top: position, behavior: reducedMotion ? 'instant' : 'smooth' });
  };
  if (location.hash) setTimeout(scrollToService, 100);
  window.addEventListener('hashchange', scrollToService);
}

const form = document.querySelector('#contact-form');
if (form) {
  const queryInterest = new URLSearchParams(location.search).get('interest');
  const select = form.querySelector('#interest');
  if (queryInterest && [...select.options].some(option => option.value === queryInterest)) select.value = queryInterest;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const company = String(data.get('company') || '').trim();
    const interest = select.options[select.selectedIndex]?.textContent || '';
    const message = String(data.get('message') || '').trim();
    const subject = encodeURIComponent('Chathra website inquiry' + (interest && interest !== 'Choose an area' ? ': ' + interest : ''));
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nCompany: ${company || 'Not provided'}\nInterested in: ${interest || 'Not selected'}\n\nMessage:\n${message}`);
    window.location.href = `mailto:info.chathraadvertising@gmail.com?subject=${subject}&body=${body}`;
  });
}

const comingSoon = document.querySelector('#coming-soon');
if (comingSoon && !reducedMotion && 'IntersectionObserver' in window) {
  const rows = [...comingSoon.querySelectorAll('.soon-row')];
  const bar = comingSoon.querySelector('.soon-progress span');
  const progressObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = rows.indexOf(entry.target);
        if (index >= 0) bar.style.width = ((index + 1) / rows.length * 100) + '%';
      }
    });
  }, { threshold: 0.5 });
  rows.forEach(row => progressObserver.observe(row));
}

document.querySelectorAll('.coming-wave-canvas, .contact-wave-canvas').forEach(waveCanvas => {
  const ctx = waveCanvas.getContext('2d', { alpha: false });
  const page = waveCanvas.parentElement;
  const theme = Number(page.dataset.waveTheme || 1);
  const palettes = [
    ['#e72578', '#5747c5', '#08a9df'],
    ['#ce266f', '#624bc9', '#23b6d7'],
    ['#d72d62', '#7948b8', '#0daed4'],
  ];
  let width = 0, height = 0, frame = 0;
  const resizeWave = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
    width = page.clientWidth;
    height = page.clientHeight;
    waveCanvas.width = Math.round(width * ratio);
    waveCanvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  const drawWave = (time = 0) => {
    ctx.fillStyle = page.classList.contains('contact-hero') ? '#08182b' : '#08090e';
    ctx.fillRect(0, 0, width, height);
    const colors = palettes[theme - 1] || palettes[0];
    const groups = [
      { base: .18, amp: .105, slope: .10, phase: 0, color: colors[0] },
      { base: .30, amp: .16, slope: -.12, phase: 1.8, color: colors[1] },
      { base: .35, amp: .13, slope: .07, phase: 3.5, color: colors[2] },
      { base: .67, amp: .11, slope: -.04, phase: 4.1, color: colors[0] },
      { base: .76, amp: .12, slope: .06, phase: 5.2, color: colors[2] },
    ];
    const threads = width < 700 ? 26 : 48;
    const step = width < 700 ? 12 : 9;
    groups.forEach((group, groupIndex) => {
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, group.color + '00');
      gradient.addColorStop(.18, group.color + '7a');
      gradient.addColorStop(.5, group.color + 'b5');
      gradient.addColorStop(.82, group.color + '74');
      gradient.addColorStop(1, group.color + '00');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = page.classList.contains('contact-hero') ? 1.15 : .7;
      for (let line = 0; line < threads; line++) {
        const spread = (line - threads / 2) / threads;
        ctx.globalAlpha = Math.min(1, (.18 + .34 * (1 - Math.abs(spread) * 1.6)) * (groupIndex > 2 ? .65 : 1) * (page.classList.contains('contact-hero') ? 1.65 : 1));
        ctx.beginPath();
        for (let x = -step; x <= width + step; x += step) {
          const u = x / Math.max(1, width);
          const envelope = Math.sin(Math.PI * Math.max(0, Math.min(1, u)));
          const sweep = Math.sin(u * Math.PI * 3.1 + group.phase + time * (groupIndex % 2 ? -.35 : .28));
          const ripple = Math.sin(u * Math.PI * 5.5 - time * .22 + line * .045);
          const y = height * (group.base + group.slope * (u - .5) + group.amp * sweep * envelope + spread * .24 + ripple * .018 * envelope);
          if (x === -step) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;
  };
  resizeWave();
  if (reducedMotion) drawWave(0);
  else {
    const animateWave = timestamp => {
      if (!document.hidden) drawWave(timestamp / 1000);
      frame = requestAnimationFrame(animateWave);
    };
    frame = requestAnimationFrame(animateWave);
  }
  window.addEventListener('resize', () => { resizeWave(); if (reducedMotion) drawWave(0); }, { passive: true });
});

const sectionTransitions = [
  ['.home-hero', '.human-section', '--hero-exit', '--second-enter'],
  ['.human-section', '.featured-section', '--section-exit', '--section-enter'],
  ['.contact-hero', '.contact-main', '--hero-exit', '--section-enter'],
].map(([from, to, exitVar, enterVar]) => ({ from: document.querySelector(from), to: document.querySelector(to), exitVar, enterVar }))
  .filter(pair => pair.from && pair.to);
if (sectionTransitions.length && !reducedMotion) {
  let transitionFrame = 0;
  const updateSectionTransitions = () => {
    transitionFrame = 0;
    sectionTransitions.forEach(({ from, to, exitVar, enterVar }) => {
      const start = from.offsetTop + from.offsetHeight * .08;
      const travel = Math.max(1, from.offsetHeight * .75);
      const progress = Math.min(1, Math.max(0, (window.scrollY - start) / travel));
      const eased = progress * progress * (3 - 2 * progress);
      from.style.setProperty(exitVar, eased.toFixed(3));
      to.style.setProperty(enterVar, eased.toFixed(3));
    });
  };
  const queueSectionTransitions = () => {
    if (!transitionFrame) transitionFrame = requestAnimationFrame(updateSectionTransitions);
  };
  window.addEventListener('scroll', queueSectionTransitions, { passive: true });
  window.addEventListener('resize', queueSectionTransitions);
  updateSectionTransitions();
}
