/* ============================================================
   CARDCLIP — Script
   Scroll animations, counters, FAQ accordion, mobile menu, navbar
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- NAVBAR SCROLL EFFECT ----
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  const handleScroll = () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // init

  // ---- MOBILE MENU ----
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ---- SCROLL REVEAL (IntersectionObserver) ----
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: show everything
    revealElements.forEach(el => el.classList.add('visible'));
  }

  // ---- ANIMATED COUNTERS ----
  const counterElements = document.querySelectorAll('[data-count]');

  if ('IntersectionObserver' in window && counterElements.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10);
          animateCounter(el, target);
          counterObserver.unobserve(el);
        }
      });
    }, {
      threshold: 0.5
    });

    counterElements.forEach(el => counterObserver.observe(el));
  }

  function animateCounter(element, target) {
    const duration = 2000;
    const startTime = performance.now();
    const startVal = 0;

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (target - startVal) * eased);

      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  // ---- FAQ ACCORDION ----
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all
      faqItems.forEach(i => {
        i.classList.remove('active');
        const btn = i.querySelector('.faq-question');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });

      // Open clicked (if it was closed)
      if (!isOpen) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ---- SMOOTH SCROLL (for anchor links) ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = navbar.offsetHeight;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });

  // ---- PARALLAX HERO ORBS ----
  const heroOrbs = document.querySelectorAll('.hero-orb');

  if (heroOrbs.length > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;

    window.addEventListener('mousemove', (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const x = (e.clientX / window.innerWidth - 0.5) * 2;
          const y = (e.clientY / window.innerHeight - 0.5) * 2;

          heroOrbs.forEach((orb, i) => {
            const speed = (i + 1) * 12;
            orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
          });

          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ---- MARQUEE PAUSE ON HOVER ----
  const marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack) {
    marqueeTrack.addEventListener('mouseenter', () => {
      marqueeTrack.style.animationPlayState = 'paused';
    });
    marqueeTrack.addEventListener('mouseleave', () => {
      marqueeTrack.style.animationPlayState = 'running';
    });
  }

  // ---- PORTFOLIO VIDEOUX (MOBILE SCROLL AUTOPLAY / DESKTOP HOVER) ----
  const showcaseCards = document.querySelectorAll('.showcase-card');
  const isTouchDevice = window.matchMedia('(hover: none)').matches || window.matchMedia('(max-width: 768px)').matches;

  if (isTouchDevice && 'IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target.querySelector('video');
        if (!video) return;

        if (entry.isIntersecting) {
          video.play().catch(e => console.warn('Autoplay prevented:', e));
        } else {
          video.pause();
          video.currentTime = 0; // Rewind to first frame (photo) to avoid rendering flicker
        }
      });
    }, {
      threshold: 0.6 // Card must be 60% visible to trigger play
    });

    showcaseCards.forEach(card => videoObserver.observe(card));
  } else {
    // Desktop Hover logic
    showcaseCards.forEach(card => {
      const video = card.querySelector('video');
      if (video) {
        card.addEventListener('mouseenter', () => {
          video.play().catch(e => console.warn('Autoplay prevented:', e));
        });
        card.addEventListener('mouseleave', () => {
          video.pause();
          video.currentTime = 0;
        });
      }
    });
  }

  // ---- MODAL (Lead Capture) ----
  const modal       = document.getElementById('orderModal');
  const modalForm   = document.getElementById('orderForm');
  const formResult  = document.getElementById('formResult');
  const selectedPlan = document.getElementById('selectedPlan');
  const closeBtn    = modal ? modal.querySelector('.modal-close') : null;

  function openModal(planName) {
    if (!modal) return;
    if (planName && selectedPlan) selectedPlan.value = planName;
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Focus first input
    const firstInput = modal.querySelector('input[type="text"]');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (formResult) formResult.textContent = '';
  }

  // Open on all .js-open-modal buttons
  document.querySelectorAll('.js-open-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const plan = btn.dataset.plan || 'С сайта (Основная кнопка)';
      openModal(plan);
    });
  });

  // Close on × button
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Close on backdrop click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-active')) {
      closeModal();
    }
  });

  // Form submit via fetch (no page reload)
  if (modalForm) {
    modalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = modalForm.querySelector('.form-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправляем...';
      formResult.style.color = 'var(--text-secondary)';
      formResult.textContent = '';

      try {
        const data = new FormData(modalForm);
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: data
        });
        const json = await res.json();

        if (json.success) {
          formResult.style.color = '#4caf83';
          formResult.textContent = '✓ Заявка принята! Мы свяжемся с вами в ближайшее время.';
          modalForm.reset();
          submitBtn.textContent = 'Отправить заявку';
          submitBtn.disabled = false;
          setTimeout(closeModal, 3000);
        } else {
          throw new Error(json.message || 'Ошибка отправки');
        }
      } catch (err) {
        formResult.style.color = 'var(--accent-glow)';
        formResult.textContent = '⚠ Что-то пошло не так. Напишите нам напрямую в Telegram.';
        submitBtn.textContent = 'Отправить заявку';
        submitBtn.disabled = false;
      }
    });
  }

});
