document.documentElement.classList.add('js');
document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

/* Mobile nav */
var menuBtn = document.getElementById('menuBtn');
var navLinks = document.getElementById('navLinks');
if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.addEventListener('click', function (event) {
    if (event.target.closest('a')) {
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.focus();
    }
  });
}

/* Scroll reveal — progressive enhancement only, respects prefers-reduced-motion */
var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && 'IntersectionObserver' in window) {
  var revealEls = document.querySelectorAll('.reveal');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(function (el) { io.observe(el); });
} else {
  document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
}

/* Package quote actions lead to direct contact details. */
function goQuote() {
  window.location.href = '/contact/#reach-out';
}
window.goQuote = goQuote;
