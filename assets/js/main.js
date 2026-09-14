// AOS init
AOS.init({
  duration: 800,
  once: true,
  offset: 60
});

// ================= BACK TO TOP =================
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  function toggleVisibility() {
    btn.classList.toggle('show', window.scrollY > 500);
  }

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ================= NAVBAR: section links =================
(function initNavLinks() {
  const navLinks = Array.from(document.querySelectorAll('.hero-nav-links .nav-link'));
  if (!navLinks.length) return;

  // close the mobile collapsed menu after tapping a link
  const collapseEl = document.getElementById('heroNavMenu');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (collapseEl && collapseEl.classList.contains('show') && window.bootstrap) {
        const collapse = window.bootstrap.Collapse.getOrCreateInstance(collapseEl);
        collapse.hide();
      }
    });
  });

  // highlight the nav link matching the section currently in view
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = '#' + entry.target.id;
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === id);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach((section) => observer.observe(section));
})();

// Duplicate a slider's slide set enough times so Swiper always has more
// than enough slides to loop seamlessly, regardless of screen width.
function cloneSlides(wrapperSelector, repeats) {
  const wrapper = document.querySelector(wrapperSelector);
  if (!wrapper) return;
  const originalSlides = Array.from(wrapper.children);
  for (let i = 1; i < repeats; i++) {
    originalSlides.forEach((slide) => {
      wrapper.appendChild(slide.cloneNode(true));
    });
  }
}

cloneSlides('.hero-swiper .swiper-wrapper', 6);
cloneSlides('.results-swiper .swiper-wrapper', 4);

// Hero image slider (Swiper) - continuous seamless auto-scroll marquee
const heroSwiper = new Swiper('.hero-swiper', {
  slidesPerView: 'auto',
  spaceBetween: 14,
  loop: true,
  loopAdditionalSlides: 4,
  speed: 5000,
  autoplay: {
    delay: 1,
    disableOnInteraction: false,
    pauseOnMouseEnter: false,
  },
  allowTouchMove: false,
  simulateTouch: false,
  breakpoints: {
    0: { spaceBetween: 8 },
    576: { spaceBetween: 10 },
    992: { spaceBetween: 14 }
  }
});

// keep slide sizing/loop correct on viewport changes
window.addEventListener('resize', () => {
  heroSwiper.update();
});

// Client Results slider - continuous seamless auto-scroll marquee
const resultsSwiper = new Swiper('.results-swiper', {
  slidesPerView: 1.25,
  spaceBetween: 0,
  loop: true,
  loopAdditionalSlides: 4,
  speed: 6000,
  autoplay: {
    delay: 1,
    disableOnInteraction: false,
    pauseOnMouseEnter: false,
  },
  allowTouchMove: false,
  simulateTouch: false,
  breakpoints: {
    576: { slidesPerView: 1.8 },
    768: { slidesPerView: 2.5 },
    992: { slidesPerView: 4 },
    1200: { slidesPerView: 5 }
  }
});

// Testimonials slider - auto-advances every 4s, loops infinitely,
// and avatar click jumps straight to that person's slide
const testimonialsSwiper = new Swiper('.testimonials-swiper', {
  slidesPerView: 1,
  spaceBetween: 0,
  effect: 'fade',
  fadeEffect: { crossFade: true },
  allowTouchMove: false,
  speed: 600,
  loop: true,
  autoplay: {
    delay: 4000,
    disableOnInteraction: false,
    pauseOnMouseEnter: false,
  },
});

(function initTestimonialAvatars() {
  const buttons = document.querySelectorAll('.testimonial-avatar-btn');
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.slide, 10);
      testimonialsSwiper.slideToLoop(index);
    });
  });

  testimonialsSwiper.on('slideChangeTransitionEnd', () => {
    const activeIndex = testimonialsSwiper.realIndex;
    buttons.forEach((btn) => {
      btn.classList.toggle('active', parseInt(btn.dataset.slide, 10) === activeIndex);
    });
  });
})();

// ================= PROBLEM SECTION ANIMATIONS =================
(function initProblemSection() {
  const cards = document.querySelectorAll('.problem-cards .problem-card');
  if (!cards.length) return;

  // set precise stroke-dasharray from real path/circle length so the
  // line-draw animation always matches the actual shape
  document.querySelectorAll('.chart-line').forEach((path) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
  });

  function animateCount(el) {
    const target = parseFloat(el.dataset.countTo);
    const suffix = el.dataset.suffix || '';
    const pad = parseInt(el.dataset.pad || '0', 10);
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = String(value).padStart(pad, '0') + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function animateCard(card) {
    if (card.classList.contains('in-view')) return;
    card.classList.add('in-view');

    card.querySelectorAll('[data-count-to]').forEach(animateCount);

    card.querySelectorAll('[data-width-to]').forEach((bar) => {
      const width = bar.dataset.widthTo;
      requestAnimationFrame(() => {
        bar.style.width = width + '%';
      });
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCard(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });

  cards.forEach((card) => observer.observe(card));
})();

// ================= SOLUTION SECTION: STAT COUNT-UP =================
(function initSolutionStats() {
  const cards = document.querySelectorAll('.solution-stats .stat-card');
  if (!cards.length) return;

  function animateCount(el) {
    const target = parseFloat(el.dataset.countTo);
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-count-to]').forEach(animateCount);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  cards.forEach((card) => observer.observe(card));
})();
