// ===== BuyBooks.com interactions =====

// Mobile menu
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

menuToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuToggle.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', open);
});

mainNav.querySelectorAll('a').forEach(link =>
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  })
);

// Theme preview tabs
const themePreview = document.getElementById('themePreview');
document.querySelectorAll('.theme-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.theme-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    themePreview.dataset.theme = tab.dataset.theme;
  });
});

// Billing toggle (yearly / monthly)
const billingSwitch = document.getElementById('billingSwitch');
billingSwitch.addEventListener('click', () => {
  const monthly = billingSwitch.classList.toggle('on');
  document.querySelectorAll('.bt-label').forEach(l =>
    l.classList.toggle('active', (l.dataset.bill === 'month') === monthly)
  );
  document.querySelectorAll('.plan .amt').forEach(el => {
    el.textContent = '$' + (monthly ? el.dataset.month : el.dataset.year);
    el.nextElementSibling.textContent = monthly ? '/month' : '/year';
  });
});

// Only one FAQ open at a time
const faqItems = document.querySelectorAll('.faq details');
faqItems.forEach(item =>
  item.addEventListener('toggle', () => {
    if (item.open) faqItems.forEach(other => other !== item && (other.open = false));
  })
);

// CTA form
document.getElementById('ctaForm').addEventListener('submit', e => {
  e.preventDefault();
  e.target.reset();
  document.getElementById('ctaMsg').hidden = false;
});

// Animated stat counters
const counters = document.querySelectorAll('[data-count]');
const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.count;
    const start = performance.now();
    const step = now => {
      const p = Math.min((now - start) / 1200, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    countObserver.unobserve(el);
  });
}, { threshold: 0.5 });
counters.forEach(c => countObserver.observe(c));

// Reveal on scroll
const revealTargets = document.querySelectorAll('.section-head, .feature, .review, .plan, .theme-preview, .table-wrap, .faq details');
revealTargets.forEach(el => el.classList.add('reveal'));
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealTargets.forEach(el => revealObserver.observe(el));

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
