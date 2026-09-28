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

/* Basic HTML-escaping helper used before writing any user-supplied text into the DOM */
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

/* Package selection -> prefill contact form (sanitized before use) */
function goQuote(pkgName) {
  try { sessionStorage.setItem('bz_package', pkgName); } catch (e) {}
  window.location.href = '/contact/';
}
window.goQuote = goQuote;

/* Contact form posts to a same-origin API endpoint. Credentials belong only
   on the server; the API must repeat validation and apply rate limiting. */
(function setupForm() {
  var form = document.getElementById('contactForm');
  if (!form) return;

  var pkg = null;
  try { pkg = sessionStorage.getItem('bz_package'); } catch (e) {}
  if (pkg) {
    var desc = form.querySelector('[name="description"]');
    if (desc && !desc.value) desc.value = 'Interested in the "' + escapeHTML(pkg).slice(0, 80) + '" package. ';
    try { sessionStorage.removeItem('bz_package'); } catch (e) {}
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;
    function setErr(name, cond) {
      var field = form.querySelector('[data-f="' + name + '"]');
      if (!field) return;
      field.classList.toggle('error', cond);
      var input = field.querySelector('input,select,textarea');
      if (input) input.setAttribute('aria-invalid', cond ? 'true' : 'false');
      if (cond) valid = false;
    }
    var v = function (n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; };
    setErr('fullName', v('fullName').length < 2 || v('fullName').length > 120);
    setErr('email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email')) || v('email').length > 200);
    setErr('phone', v('phone').replace(/\D/g, '').length < 7 || v('phone').length > 40);
    setErr('company', v('company').length > 160);
    setErr('service', v('service') === '');
    setErr('timeline', v('timeline') === '');
    setErr('description', v('description').length < 10 || v('description').length > 4000);
    setErr('budget', v('budget').length > 160);

    if (!valid) {
      var firstError = form.querySelector('.field.error');
      if (firstError) firstError.querySelector('input,select,textarea').focus();
      return;
    }

    var payload = {};
    ['fullName', 'email', 'phone', 'company', 'service', 'timeline', 'description', 'budget'].forEach(function (key) {
      payload[key] = v(key);
    });
    payload.website = v('website');
    var submit = form.querySelector('[type="submit"]');
    var status = document.getElementById('formStatus');
    if (submit) { submit.disabled = true; submit.setAttribute('aria-busy', 'true'); }
    if (status) { status.textContent = 'Sending your request…'; status.className = 'form-status'; }
    fetch(form.action || '/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'same-origin'
    }).then(function (response) {
      if (!response.ok) throw new Error('Request failed');
      if (window.bzTrack) window.bzTrack('contact_form_submit', { service: payload.service });
      form.hidden = true;
      var successBox = document.getElementById('successBox');
      if (successBox) { successBox.classList.add('show'); successBox.setAttribute('tabindex', '-1'); successBox.focus(); }
    }).catch(function () {
      if (status) {
        status.textContent = 'We could not send your request just now. Please try again or email bytenezateam@gmail.com.';
        status.className = 'form-status error-message';
      }
    }).finally(function () {
      if (submit) { submit.disabled = false; submit.removeAttribute('aria-busy'); }
    });
  });
})();
