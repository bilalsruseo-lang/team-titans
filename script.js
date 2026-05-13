/* ============================================================
   TECHATON — Creative Digital Agency
   script.js
   ============================================================ */

'use strict';

/* ===================== UTILITY ===================== */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const lerp  = (a, b, t)     => a + (b - a) * t;

/* ===================== STATE ===================== */
const state = {
  mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  cursor: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  follower: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  scrollY: 0,
  orbBaseX: 50,
  orbBaseY: 50,
  orbTargetX: 50,
  orbTargetY: 50,
  orbCurrentX: 50,
  orbCurrentY: 50,
  plusTriggered: false,
};

/* ===================== CUSTOM CURSOR ===================== */
const cursor   = qs('#cursor');
const follower = qs('#cursorFollower');

document.addEventListener('mousemove', (e) => {
  state.mouse.x = e.clientX;
  state.mouse.y = e.clientY;
});

function animateCursor() {
  // Cursor snaps
  state.cursor.x = lerp(state.cursor.x, state.mouse.x, 0.85);
  state.cursor.y = lerp(state.cursor.y, state.mouse.y, 0.85);
  if (cursor) {
    cursor.style.left = state.cursor.x + 'px';
    cursor.style.top  = state.cursor.y + 'px';
  }

  // Follower lags
  state.follower.x = lerp(state.follower.x, state.mouse.x, 0.12);
  state.follower.y = lerp(state.follower.y, state.mouse.y, 0.12);
  if (follower) {
    follower.style.left = state.follower.x + 'px';
    follower.style.top  = state.follower.y + 'px';
  }

  requestAnimationFrame(animateCursor);
}
animateCursor();

/* ===================== NAVBAR SCROLL ===================== */
const navbar = qs('#navbar');

function onScroll() {
  state.scrollY = window.scrollY;
  if (state.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Drive orb position based on scroll section
  updateOrbPosition();
}

window.addEventListener('scroll', onScroll, { passive: true });

/* ===================== HAMBURGER MENU ===================== */
const hamburger  = qs('#navHamburger');
const mobileMenu = qs('#mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  qsa('.mobile-link', mobileMenu).forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ===================== SCROLL INDICATOR ===================== */
const scrollIndicator = qs('#scrollIndicator');
if (scrollIndicator) {
  scrollIndicator.addEventListener('click', () => {
    const aboutSection = qs('#about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

/* ===================== ORB MOVEMENT ===================== */
const orb = qs('#orb');

function getOrbTarget() {
  const hero       = qs('#hero');
  const about      = qs('#about');
  const trusted    = qs('#trusted');
  const work       = qs('#work');
  const recognition = qs('#recognition');

  const scroll = state.scrollY;
  const wh     = window.innerHeight;

  // Hero: center with slight mouse tracking
  if (hero && scroll < hero.offsetTop + hero.offsetHeight * 0.5) {
    const mx = (state.mouse.x / window.innerWidth - 0.5) * 8;
    const my = (state.mouse.y / window.innerHeight - 0.5) * 8;
    return { x: 50 + mx, y: 50 + my, size: 520 };
  }

  // About: shift right, partial off-screen
  if (about && scroll >= about.offsetTop - wh * 0.5
            && scroll <  about.offsetTop + about.offsetHeight * 0.5) {
    return { x: 88, y: 50, size: 520 };
  }

  // Trusted: right edge
  if (trusted && scroll >= trusted.offsetTop - wh * 0.5
              && scroll <  trusted.offsetTop + trusted.offsetHeight * 0.5) {
    return { x: 90, y: 55, size: 480 };
  }

  // Work: shift left
  if (work && scroll >= work.offsetTop - wh * 0.5
           && scroll <  work.offsetTop + work.offsetHeight * 0.5) {
    return { x: 10, y: 55, size: 460 };
  }

  // Recognition: center smaller
  if (recognition && scroll >= recognition.offsetTop - wh * 0.5) {
    return { x: 50, y: 50, size: 300 };
  }

  return { x: 50, y: 50, size: 520 };
}

let orbAnimFrame;
function animateOrb() {
  const target = getOrbTarget();

  state.orbCurrentX = lerp(state.orbCurrentX, target.x, 0.04);
  state.orbCurrentY = lerp(state.orbCurrentY, target.y, 0.04);

  if (orb) {
    orb.style.left   = state.orbCurrentX + '%';
    orb.style.top    = state.orbCurrentY + '%';
    orb.style.width  = target.size + 'px';
    orb.style.height = target.size + 'px';
  }

  orbAnimFrame = requestAnimationFrame(animateOrb);
}
animateOrb();

/* ===================== HERO MOUSE PARALLAX ===================== */
const heroTL = qs('#heroTL');
const heroBL = qs('#heroBL');
const heroBR = qs('#heroBR');

document.addEventListener('mousemove', (e) => {
  const hero = qs('#hero');
  if (!hero) return;
  const rect = hero.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > window.innerHeight) return;

  const relX = (e.clientX / window.innerWidth - 0.5);
  const relY = (e.clientY / window.innerHeight - 0.5);

  const shift = (el, fx, fy) => {
    if (el) el.style.transform = `translate(${relX * fx}px, ${relY * fy}px)`;
  };

  shift(heroTL, -20, -14);
  shift(heroBL, -16, 18);
  shift(heroBR, 18, 16);

  // Plus section reactive blob
  const plusReactive = qs('#plusCursorReactive');
  if (plusReactive) {
    plusReactive.style.left = e.clientX + 'px';
    plusReactive.style.top  = e.clientY + 'px';
  }
});

/* ===================== INTERSECTION OBSERVER (REVEAL) ===================== */
function setupRevealObserver() {
  const revealEls = qsa('.reveal-fade, .reveal-left, .reveal-right, .reveal-card');

  const options = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.index
          ? parseInt(entry.target.dataset.index) * 80
          : 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, options);

  revealEls.forEach(el => observer.observe(el));
}

setupRevealObserver();

/* ===================== BURST CARDS (RECOGNITION) ===================== */
function createBurstCards() {
  const container = qs('#burstCards');
  if (!container) return;

  const count = 18;
  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'burst-card';
    card.dataset.index = i;

    // Distribute evenly around 360°
    const angle = (i / count) * 360;
    const dist  = 180 + Math.random() * 80;

    card.style.setProperty('--angle', angle + 'deg');
    card.style.setProperty('--dist',  dist + 'px');

    container.appendChild(card);
  }
}
createBurstCards();

function animateBurstCards() {
  const cards = qsa('.burst-card');

  cards.forEach((card, i) => {
    const angle  = parseFloat(card.style.getPropertyValue('--angle'));
    const dist   = parseFloat(card.style.getPropertyValue('--dist'));
    const rad    = (angle - 90) * Math.PI / 180;
    const tx     = Math.cos(rad) * dist;
    const ty     = Math.sin(rad) * dist;
    const delay  = i * 40;

    // Animate out
    setTimeout(() => {
      card.style.transition = `opacity 0.5s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)`;
      card.style.opacity    = '1';
      card.style.transform  = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1)`;
    }, delay);

    // Animate away
    setTimeout(() => {
      card.style.opacity   = '0';
      card.style.transform = `translate(calc(-50% + ${tx * 1.8}px), calc(-50% + ${ty * 1.8}px)) scale(0.5)`;
    }, delay + 800);
  });
}

// Observer for recognition section
const recSection = qs('#recognition');
if (recSection) {
  const recObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateBurstCards();
        recObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  recObserver.observe(recSection);
}

/* ===================== PLUS SECTION ANIMATION ===================== */
const plusSection = qs('#plusSection');

if (plusSection) {
  const plusObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !state.plusTriggered) {
        state.plusTriggered = true;
        triggerPlusAnimation();
      }
    });
  }, { threshold: 0.4 });
  plusObserver.observe(plusSection);
}

function triggerPlusAnimation() {
  const section = qs('#plusSection');
  if (!section) return;

  // Phase 1: expand plus
  setTimeout(() => {
    section.classList.add('animating');
  }, 300);

  // Phase 2: activate background
  setTimeout(() => {
    section.classList.add('bg-active');
  }, 700);

  // Phase 3: reveal text
  setTimeout(() => {
    section.classList.add('text-visible');
  }, 1400);
}

/* ===================== LOGO GRID HOVER GLOW ===================== */
qsa('.logo-cell').forEach(cell => {
  cell.addEventListener('mouseenter', () => {
    cell.style.boxShadow = '0 0 20px rgba(255,255,255,0.06) inset';
  });
  cell.addEventListener('mouseleave', () => {
    cell.style.boxShadow = '';
  });
});

/* ===================== WORK CARD HOVER ===================== */
qsa('.work-card').forEach(card => {
  const plus = card.querySelector('.card-plus');
  if (!plus) return;

  card.addEventListener('mouseenter', () => {
    plus.textContent = '→';
  });
  card.addEventListener('mouseleave', () => {
    plus.textContent = '+';
  });
});

/* ===================== FOOTER — TYPING EFFECT ON AI LOGOS ===================== */
qsa('.ai-logo').forEach(logo => {
  logo.addEventListener('mouseenter', () => {
    logo.querySelector('span') && (logo.querySelector('span').style.display = 'block');
  });
  logo.addEventListener('mouseleave', () => {
    logo.querySelector('span') && (logo.querySelector('span').style.display = 'none');
  });
});

/* ===================== SMOOTH ANCHOR SCROLLING ===================== */
qsa('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = qs(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ===================== RECOGNITION ORB HIDE ON CONTENT VISIBLE ===================== */
const recContent = qs('#recognitionContent');
const recOrbWrap = qs('.recognition-orb-wrap');

if (recContent && recOrbWrap) {
  const hideOrbObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          if (recOrbWrap) recOrbWrap.style.opacity = '0.3';
        }, 1000);
      }
    });
  }, { threshold: 0.6 });
  hideOrbObserver.observe(recContent);
}

/* ===================== STAGGERED NAV LINK REVEAL ===================== */
qsa('.nav-link').forEach((link, i) => {
  link.style.animationDelay = (0.35 + i * 0.07) + 's';
});

/* ===================== ORB GLOW INTENSITY ON SCROLL ===================== */
function updateOrbGlow() {
  if (!orb) return;
  const scrollProgress = Math.min(state.scrollY / (document.body.scrollHeight - window.innerHeight), 1);
  const hue = scrollProgress * 120; // shift hue with scroll
  orb.style.filter = `hue-rotate(${hue}deg)`;
}

window.addEventListener('scroll', updateOrbGlow, { passive: true });

/* ===================== PARALLAX ON SECTION HEADINGS ===================== */
function setupParallax() {
  const parallaxEls = qsa('.about-heading, .recognition-heading, .footer-heading');

  function onScrollParallax() {
    parallaxEls.forEach(el => {
      const rect   = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      const offset = center * 0.04;
      el.style.transform = `translateY(${offset}px)`;
    });
  }

  window.addEventListener('scroll', onScrollParallax, { passive: true });
}
setupParallax();

/* ===================== CARD TILT EFFECT ===================== */
qsa('.work-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect   = card.getBoundingClientRect();
    const relX   = (e.clientX - rect.left) / rect.width  - 0.5;
    const relY   = (e.clientY - rect.top)  / rect.height - 0.5;
    const rotX   = relY * -8;
    const rotY   = relX * 8;
    card.style.transform = `translateY(-4px) perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ===================== INIT ===================== */
function init() {
  // Reset scroll to top on page load
  window.scrollTo(0, 0);
  onScroll();
}
init();

/* ===================== RESIZE HANDLER ===================== */
window.addEventListener('resize', () => {
  // Re-check orb on resize
  updateOrbGlow();
}, { passive: true });

/* ===================== CURSOR GROW ON INTERACTIVE ELEMENTS ===================== */
const interactiveEls = qsa('a, button, .work-card, .logo-cell, .ai-logo, .scroll-indicator');
interactiveEls.forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (cursor) {
      cursor.style.width  = '20px';
      cursor.style.height = '20px';
    }
    if (follower) {
      follower.style.width  = '60px';
      follower.style.height = '60px';
      follower.style.borderColor = 'rgba(255,255,255,0.6)';
    }
  });
  el.addEventListener('mouseleave', () => {
    if (cursor) {
      cursor.style.width  = '10px';
      cursor.style.height = '10px';
    }
    if (follower) {
      follower.style.width  = '36px';
      follower.style.height = '36px';
      follower.style.borderColor = 'rgba(255,255,255,0.5)';
    }
  });
});

/* ===================== LOGO GRID ENTRANCE STAGGER ===================== */
const logoObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const cells = qsa('.logo-cell', entry.target);
      cells.forEach((cell, i) => {
        cell.style.opacity   = '0';
        cell.style.transform = 'scale(0.85)';
        setTimeout(() => {
          cell.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)';
          cell.style.opacity    = '1';
          cell.style.transform  = 'scale(1)';
        }, i * 60);
      });
      logoObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

const logoGrid = qs('#logoGrid');
if (logoGrid) logoObserver.observe(logoGrid);

/* ===================== RECOGNITION ROWS ENTRANCE ===================== */
const recRowObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const rows = qsa('.rec-row', entry.target);
      rows.forEach((row, i) => {
        row.style.opacity   = '0';
        row.style.transform = 'translateX(-20px)';
        setTimeout(() => {
          row.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)';
          row.style.opacity    = '1';
          row.style.transform  = 'translateX(0)';
        }, 200 + i * 100);
      });
      recRowObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const recRows = qs('.recognition-rows');
if (recRows) recRowObserver.observe(recRows);

/* ===================== PLUS SECTION CURSOR REACTIVE BG ===================== */
document.addEventListener('mousemove', (e) => {
  const plus = qs('#plusSection');
  if (!plus) return;
  const rect = plus.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > window.innerHeight) return;

  const bg = qs('#plusBg');
  if (bg && plus.classList.contains('bg-active')) {
    const relX = (e.clientX / window.innerWidth  - 0.5) * 30;
    const relY = (e.clientY / window.innerHeight - 0.5) * 30;
    bg.style.transform = `rotate(${relX * 0.5}deg) scale(1.5) translateX(${relX * 0.2}%) translateY(${relY * 0.2}%)`;
  }
});

/* ===================== SECTION COUNTER / LABELS ===================== */
// Add subtle index numbers to sections
(function addSectionIndexes() {
  const sections = qsa('section');
  sections.forEach((sec, i) => {
    const label = document.createElement('span');
    label.className = 'section-index-label';
    label.textContent = String(i + 1).padStart(2, '0');
    label.style.cssText = `
      position: absolute;
      top: 40px; right: 48px;
      font-size: 0.6rem;
      letter-spacing: 0.2em;
      color: rgba(255,255,255,0.12);
      font-family: 'DM Mono', monospace;
      pointer-events: none;
      z-index: 1;
    `;
    if (getComputedStyle(sec).position === 'static') {
      sec.style.position = 'relative';
    }
    sec.appendChild(label);
  });
})();

/* ===================== ABOUT STATS COUNTER ===================== */
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const duration = 1800;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    current = Math.round(target * ease);
    el.textContent = String(current).padStart(String(target).length, '0') + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      qsa('.stat-num', entry.target).forEach(num => {
        const raw = num.textContent;
        const digits = parseInt(raw.replace(/\D/g, ''));
        const suffix = raw.replace(/\d/g, '');
        animateCounter(num, digits, suffix);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const aboutSection = qs('#about');
if (aboutSection) statsObserver.observe(aboutSection);

console.log('%c TECHATON ', 'background:#8b5cf6;color:#fff;padding:4px 12px;border-radius:4px;font-weight:700;letter-spacing:0.1em;', '— Digital Agency');
