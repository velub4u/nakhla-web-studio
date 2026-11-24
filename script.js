/**
 * Nakhla Web Studio - Vanilla JavaScript
 * Zero external dependencies. Fast, accessible, production-ready.
 */

// Configuration: Single source of truth for the studio's WhatsApp number and contact info
const NAKHLA_CONFIG = {
  whatsappNumber: "918754493414", // WhatsApp number with country code
  email: "veludev@gmail.com"
};

document.addEventListener('DOMContentLoaded', () => {
  initWhatsAppLinks();
  initHeader();
  initMobileMenu();
  initFaqAccordion();
  initContactForm();
  initScrollAnimations();
  initCardTilt();
  initHeroCardTilt();
  initSampleLightbox();
  initYear();
});

/**
 * Synchronize every WhatsApp link across the page with NAKHLA_CONFIG.whatsappNumber
 * Automatically updates header, hero, sample work, contact, footer, and floating buttons.
 */
function initWhatsAppLinks() {
  const waLinks = document.querySelectorAll('a[href*="wa.me"]');
  waLinks.forEach(link => {
    try {
      const url = new URL(link.href);
      const text = url.searchParams.get('text');
      link.href = `https://wa.me/${NAKHLA_CONFIG.whatsappNumber}${text ? '?text=' + encodeURIComponent(decodeURIComponent(text)) : ''}`;
    } catch (e) {
      link.href = link.href.replace(/wa\.me\/[0-9a-zA-Z]+/, `wa.me/${NAKHLA_CONFIG.whatsappNumber}`);
    }
  });
}

/**
 * Header scroll shadow & backdrop effect
 */
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/**
 * Accessible Mobile Navigation Drawer
 */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close nav on menu item click
  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Close nav on click outside
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target) && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Accessible FAQ Accordion
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Optional: Close other open accordion items for a cleaner reading experience
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          const btn = otherItem.querySelector('.faq-question');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle clicked item
      if (isActive) {
        item.classList.remove('active');
        questionBtn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/**
 * Contact Form -> Formats fields & launches WhatsApp directly
 * No server backend needed, zero spam, instant customer connection!
 */
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const isArabic = document.documentElement.lang === 'ar';
    const name = (document.getElementById('formName')?.value || '').trim();
    const businessName = (document.getElementById('formBusiness')?.value || '').trim();
    const businessType = (document.getElementById('formType')?.value || '').trim();
    const phone = (document.getElementById('formPhone')?.value || '').trim();
    const message = (document.getElementById('formMessage')?.value || '').trim();

    if (!name || !businessName || !phone) {
      alert(isArabic ? 'يرجى تعبئة الحقول الأساسية (الاسم، اسم المشروع، ورقم الهاتف).' : 'Please fill in the required fields (Name, Business Name, and Phone).');
      return;
    }

    let text = '';
    if (isArabic) {
      text = `*طلب نموذج موقع إلكتروني مجاني - نخلة ويب ستوديو*\n\n` +
             `*الاسم:* ${name}\n` +
             `*اسم المشروع:* ${businessName}\n` +
             `*نوع النشاط:* ${businessType || 'غير محدد'}\n` +
             `*رقم الهاتف:* ${phone}\n` +
             (message ? `*تفاصيل إضافية:* ${message}\n` : '') +
             `\n_أرسلت من الموقع الإلكتروني: Nakhla Web Studio_`;
    } else {
      text = `*Free Sample Website Request - Nakhla Web Studio*\n\n` +
             `*Name:* ${name}\n` +
             `*Business Name:* ${businessName}\n` +
             `*Business Type:* ${businessType || 'Not specified'}\n` +
             `*Phone:* ${phone}\n` +
             (message ? `*Notes:* ${message}\n` : '') +
             `\n_Sent from nakhlawebstudio.com_`;
    }

    const whatsappUrl = `https://wa.me/${NAKHLA_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  });
}

/**
 * Intersection Observer for smooth fade-in animations on scroll
 */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.fade-in');
  if (!animatedElements.length) return;

  // Hero content is above the fold: reveal it straight away (no waiting on the observer),
  // so phone visitors see the preview card immediately under the promise line.
  document.querySelectorAll('#hero .fade-in').forEach(el => {
    requestAnimationFrame(() => el.classList.add('is-visible'));
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    });

    animatedElements.forEach(el => observer.observe(el));
  } else {
    // Fallback for older browsers
    animatedElements.forEach(el => el.classList.add('is-visible'));
  }
}

/**
 * Dynamic copyright year
 */
function initYear() {
  const yearSpans = document.querySelectorAll('.current-year');
  const currentYear = new Date().getFullYear();
  yearSpans.forEach(span => {
    span.textContent = currentYear;
  });
}

/**
 * 3D tilt for the sample-site cards (mouse hover and touch drag).
 * Hands the card over from the scroll fade-in once it has risen in, so the two
 * transforms never fight. Disabled for prefers-reduced-motion.
 */
function initCardTilt() {
  const cards = document.querySelectorAll('.work-card');
  if (!cards.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const MAX = 9; // degrees

  const ready = (card) => {
    card.classList.remove('fade-in', 'is-visible', 'delay-1', 'delay-2', 'delay-3', 'delay-4');
    card.classList.add('tilt-ready');
  };

  cards.forEach(card => {
    if (!card.classList.contains('fade-in')) {
      ready(card);
    } else {
      const onEnd = (e) => {
        if (e.target !== card || e.propertyName !== 'opacity' || !card.classList.contains('is-visible')) return;
        card.removeEventListener('transitionend', onEnd);
        ready(card);
      };
      card.addEventListener('transitionend', onEnd);
      // Safety net if the transition event never fires
      const mo = new MutationObserver(() => {
        if (card.classList.contains('is-visible')) {
          mo.disconnect();
          setTimeout(() => { if (!card.classList.contains('tilt-ready')) ready(card); }, 1400);
        }
      });
      mo.observe(card, { attributes: true, attributeFilter: ['class'] });
    }

    let frame = 0;
    const move = (e) => {
      if (!card.classList.contains('tilt-ready')) return;
      const r = card.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        card.classList.add('is-tilting');
        card.style.setProperty('--ry', ((px - 0.5) * 2 * MAX).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((0.5 - py) * 2 * MAX).toFixed(2) + 'deg');
        card.style.setProperty('--lift', '-8px');
        card.style.setProperty('--sx', ((0.5 - px) * 30).toFixed(1));
        card.style.setProperty('--sy', ((0.5 - py) * 20).toFixed(1));
        card.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      });
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      card.classList.remove('is-tilting');
      ['--rx', '--ry', '--lift', '--sx', '--sy'].forEach(p => card.style.removeProperty(p));
    };

    card.addEventListener('pointermove', move, { passive: true });
    card.addEventListener('pointerdown', move, { passive: true });
    card.addEventListener('pointerleave', reset);
    card.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') reset(); });
    card.addEventListener('pointercancel', reset);
  });
}


/**
 * Hero preview card: cursor (desktop) and phone-tilt (deviceorientation) parallax.
 * Inner layers sit at different depths (CSS translateZ), so they shift against each other.
 * Disabled for prefers-reduced-motion; idle when the hero is off-screen.
 */
function initHeroCardTilt() {
  const hero = document.getElementById('hero');
  const card = hero && hero.querySelector('.hero-visual-card');
  if (!card) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const MAX_X = 7, MAX_Y = 9; // degrees
  let inView = true, frame = 0, idle = 0;

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => { inView = entries[0].isIntersecting; }, { threshold: 0 }).observe(hero);
  }

  const apply = (nx, ny) => { // nx, ny in [-1, 1]
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      card.classList.add('is-tilting');
      card.style.setProperty('--hry', (nx * MAX_Y).toFixed(2) + 'deg');
      card.style.setProperty('--hrx', (-ny * MAX_X).toFixed(2) + 'deg');
      card.style.setProperty('--hgx', (50 + nx * 40).toFixed(1) + '%');
      card.style.setProperty('--hgy', (40 + ny * 40).toFixed(1) + '%');
    });
    clearTimeout(idle);
    idle = setTimeout(reset, 2600);
  };
  const reset = () => {
    cancelAnimationFrame(frame);
    card.classList.remove('is-tilting');
    ['--hrx', '--hry', '--hgx', '--hgy'].forEach(p => card.style.removeProperty(p));
  };
  const clamp = (v) => Math.max(-1, Math.min(1, v));

  // Mouse: follow the cursor anywhere over the hero, strongest near the card
  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || !inView) return;
    const r = card.getBoundingClientRect();
    const nx = clamp((e.clientX - (r.left + r.width / 2)) / (r.width * 0.9));
    const ny = clamp((e.clientY - (r.top + r.height / 2)) / (r.height * 0.9));
    apply(nx, ny);
  }, { passive: true });
  hero.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') reset(); });

  // Touch: drag across the card
  card.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') return;
    const r = card.getBoundingClientRect();
    apply(clamp(((e.clientX - r.left) / r.width - 0.5) * 2), clamp(((e.clientY - r.top) / r.height - 0.5) * 2));
  }, { passive: true });
  card.addEventListener('pointerup', reset);
  card.addEventListener('pointercancel', reset);

  // Phones: tilt the device (no permission prompt is forced; iOS simply stays static)
  let base = null;
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null || e.beta == null || !inView) return;
    if (!base) base = { b: e.beta, g: e.gamma };
    base.b += (e.beta - base.b) * 0.02;   // slowly re-centre on how the phone is held
    base.g += (e.gamma - base.g) * 0.02;
    apply(clamp((e.gamma - base.g) / 20), clamp((e.beta - base.b) / 20));
  }, { passive: true });
}

/**
 * Sample-site lightbox: click / tap a sample card (or its "View larger" button)
 * to open a large, scrollable preview. Esc, close button and backdrop close it;
 * focus is trapped inside and returned to the trigger. Text follows the page language.
 */
function initSampleLightbox() {
  const cards = document.querySelectorAll('.work-card');
  if (!cards.length) return;
  const ar = document.documentElement.lang === 'ar';
  const T = ar ? {
    view: 'عرض أكبر', viewFor: 'عرض أكبر لتصميم', close: 'إغلاق المعاينة', zoomIn: 'تكبير', fit: 'ملاءمة الشاشة',
    kicker: 'نموذج تصميم', hint: 'نموذج توضيحي. يمكنك التمرير والتكبير للاستكشاف. اضغط Esc للإغلاق.'
  } : {
    view: 'View larger', viewFor: 'View larger preview of the', close: 'Close preview', zoomIn: 'Zoom in', fit: 'Fit to screen',
    kicker: 'Sample design', hint: 'Illustrative sample concept. Scroll or pinch to explore. Press Esc to close.'
  };
  const zoomSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></svg>';

  // Build the dialog once
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.id = 'sampleLightbox';
  box.hidden = true;
  box.innerHTML =
    '<div class="lightbox-backdrop" data-close></div>' +
    '<div class="lightbox-dialog" role="dialog" aria-modal="true" aria-labelledby="lightboxTitle" aria-describedby="lightboxHint">' +
      '<div class="lightbox-head">' +
        '<div class="lightbox-titles"><span class="lightbox-kicker">' + T.kicker + '</span><h2 class="lightbox-title" id="lightboxTitle"></h2></div>' +
        '<button type="button" class="lightbox-btn lightbox-zoom" aria-pressed="false">' + zoomSvg + '<span></span></button>' +
        '<button type="button" class="lightbox-btn lightbox-close" data-close aria-label="' + T.close + '">&times;</button>' +
      '</div>' +
      '<div class="lightbox-body" tabindex="0"><img alt="" decoding="async"></div>' +
      '<p class="lightbox-foot" id="lightboxHint">' + T.hint + '</p>' +
    '</div>';
  document.body.appendChild(box);
  const dialog = box.querySelector('.lightbox-dialog');
  const titleEl = box.querySelector('.lightbox-title');
  const img = box.querySelector('.lightbox-body img');
  const body = box.querySelector('.lightbox-body');
  const zoomBtn = box.querySelector('.lightbox-zoom');
  const zoomLabel = zoomBtn.querySelector('span');
  const closeBtn = box.querySelector('.lightbox-close');
  const phoneMQ = window.matchMedia('(max-width: 768px)');
  let lastFocus = null, closeTimer = 0;

  const syncZoomLabel = () => {
    const zoomed = box.classList.contains('is-zoomed');
    const enlarged = phoneMQ.matches ? !zoomed : zoomed; // phones open enlarged by default
    zoomLabel.textContent = enlarged ? T.fit : T.zoomIn;
    zoomBtn.setAttribute('aria-pressed', enlarged ? 'true' : 'false');
  };
  if (phoneMQ.addEventListener) phoneMQ.addEventListener('change', syncZoomLabel);

  const focusables = () => [...dialog.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')]
    .filter(el => !el.disabled && el.offsetParent !== null);

  const open = (card, trigger) => {
    const src = card.querySelector('.work-image');
    if (!src) return;
    clearTimeout(closeTimer);
    lastFocus = trigger || document.activeElement;
    const title = (card.querySelector('.work-card-title') || {}).textContent || '';
    titleEl.textContent = title.trim();
    img.src = src.getAttribute('src');
    img.alt = src.getAttribute('alt') || title;
    box.classList.remove('is-zoomed');
    syncZoomLabel();
    box.hidden = false;
    document.documentElement.classList.add('lightbox-open');
    requestAnimationFrame(() => {
      box.classList.add('is-open');
      body.scrollTop = 0;
      body.scrollLeft = 0; // pan area is direction:ltr (mockups are LTR), so start at the left edge
      closeBtn.focus({ preventScroll: true });
    });
    document.addEventListener('keydown', onKey);
  };

  const close = () => {
    if (box.hidden) return;
    box.classList.remove('is-open');
    document.documentElement.classList.remove('lightbox-open');
    document.removeEventListener('keydown', onKey);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    closeTimer = setTimeout(() => { box.hidden = true; }, reduce ? 0 : 260);
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  };

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    const f = focusables();
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
      e.preventDefault(); first.focus();
    }
  }

  box.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
  zoomBtn.addEventListener('click', () => { box.classList.toggle('is-zoomed'); syncZoomLabel(); });

  cards.forEach(card => {
    const wrap = card.querySelector('.work-meta-row') || card.querySelector('.work-image-wrapper');
    const title = ((card.querySelector('.work-card-title') || {}).textContent || '').trim();
    if (wrap) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'work-zoom-btn';
      btn.setAttribute('aria-haspopup', 'dialog');
      btn.setAttribute('aria-controls', 'sampleLightbox');
      btn.setAttribute('aria-label', ar ? (T.viewFor + ' ' + title) : (T.viewFor + ' ' + title + ' sample'));
      btn.innerHTML = zoomSvg + '<span>' + T.view + '</span>';
      btn.addEventListener('click', (e) => { e.stopPropagation(); open(card, btn); });
      wrap.appendChild(btn);
    }
    // Whole card is a pointer target too (keyboard users get the button above)
    card.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      open(card, card.querySelector('.work-zoom-btn'));
    });
  });
}
