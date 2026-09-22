/* ==========================================================
   LÊ HUY HOÀNG — Portfolio Scripts
   ========================================================== */

/* ---------- 1. Chuyển đổi ngôn ngữ (Language Toggle) ---------- */
(function () {
  var html = document.documentElement;
  var btn = document.getElementById('lang');
  var saved = 'vi';
  try {
    var stored = localStorage.getItem('lhh-lang-v1');
    if (stored === 'vi' || stored === 'en') saved = stored;
  } catch (e) {}
  html.lang = saved;
  function sync() {
    if (btn) btn.textContent = html.lang === 'vi' ? 'EN' : 'VI';
  }
  sync();
  if (btn) {
    btn.addEventListener('click', function () {
      html.lang = html.lang === 'vi' ? 'en' : 'vi';
      try { localStorage.setItem('lhh-lang-v1', html.lang); } catch (e) {}
      sync();
    });
  }
})();

/* ---------- 2. Menu di động (Mobile Burger Menu) ---------- */
(function () {
  var b = document.getElementById('burger');
  var n = document.getElementById('nav');
  if (!b || !n) return;
  function close() { n.hidden = true; b.setAttribute('aria-expanded', 'false'); }
  function apply() { if (window.innerWidth <= 960) close(); else { n.hidden = false; } }
  apply();
  window.addEventListener('resize', apply);
  b.addEventListener('click', function () {
    var open = n.hidden;
    n.hidden = !open;
    b.setAttribute('aria-expanded', String(open));
  });
  n.addEventListener('click', function (e) {
    if (e.target.closest('a') && window.innerWidth <= 960) close();
  });
})();

/* ---------- 3. Hiệu ứng hiển thị khi cuộn (Scroll Reveal) ---------- */
(function () {
  var els = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
  els.forEach(function (el) { io.observe(el); });
  // Dự phòng an toàn nếu observer chưa kích hoạt kịp
  window.addEventListener('load', function () {
    setTimeout(function () {
      els.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
      });
    }, 800);
  });
})();

/* ---------- 4. Đánh dấu menu mục đang xem (Active Nav Link) ---------- */
(function () {
  var links = [].slice.call(document.querySelectorAll('.mainnav a[href^="#"]'));
  if (!links.length || !('IntersectionObserver' in window)) return;
  var map = {};
  links.forEach(function (a) {
    var s = document.querySelector(a.getAttribute('href'));
    if (s) map[s.id] = a;
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        links.forEach(function (a) { a.classList.remove('on'); });
        if (map[en.target.id]) map[en.target.id].classList.add('on');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  Object.keys(map).forEach(function (id) {
    var target = document.getElementById(id);
    if (target) io.observe(target);
  });
  window.addEventListener('scroll', function () {
    if (window.scrollY < 120) links.forEach(function (a) { a.classList.remove('on'); });
  }, { passive: true });
})();

/* ---------- 5. Thư viện xem ảnh phóng to (Lightbox Modal) ---------- */
(function () {
  var lb = document.getElementById('lb');
  var img = document.getElementById('lb-img');
  var btnX = document.getElementById('lb-x');
  var btnP = document.getElementById('lb-p');
  var btnN = document.getElementById('lb-n');
  if (!lb || !img) return;

  var shots = [].slice.call(document.querySelectorAll('[data-lb]'));
  var currentIndex = 0;

  function srcOf(el) {
    return el.tagName === 'IMG' ? (el.currentSrc || el.src) : el.getAttribute('href');
  }

  function show(k) {
    if (!shots.length) return;
    currentIndex = (k + shots.length) % shots.length;
    img.src = srcOf(shots[currentIndex]);
  }

  function open(k) {
    show(k);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.hidden = true;
    img.src = '';
    document.body.style.overflow = '';
  }

  shots.forEach(function (a, k) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      open(k);
    });
  });

  if (btnX) btnX.addEventListener('click', close);
  if (btnP) btnP.addEventListener('click', function (e) { e.stopPropagation(); show(currentIndex - 1); });
  if (btnN) btnN.addEventListener('click', function (e) { e.stopPropagation(); show(currentIndex + 1); });

  lb.addEventListener('click', function (e) {
    if (e.target === lb) close();
  });

  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(currentIndex - 1);
    else if (e.key === 'ArrowRight') show(currentIndex + 1);
  });
})();
