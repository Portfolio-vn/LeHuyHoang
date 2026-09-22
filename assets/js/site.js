/* ==========================================================
   LE HUY HOANG — Portfolio Scripts | Hardware Workbench Bento
   ========================================================== */

/* ---------- 1. Mobile Workbench Navigation Toggle ---------- */
(function () {
  var b = document.getElementById('burger-btn');
  var n = document.getElementById('bench-nav');
  if (!b || !n) return;
  function close() { n.hidden = true; b.setAttribute('aria-expanded', 'false'); }
  function apply() { if (window.innerWidth <= 980) close(); else { n.hidden = false; } }
  apply();
  window.addEventListener('resize', apply);
  b.addEventListener('click', function () {
    var open = n.hidden;
    n.hidden = !open;
    b.setAttribute('aria-expanded', String(open));
  });
  n.addEventListener('click', function (e) {
    if (e.target.closest('a') && window.innerWidth <= 980) close();
  });
})();

/* ---------- 2. Scroll Reveal Animations ---------- */
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
  }, { rootMargin: '0px 0px -5% 0px', threshold: 0.05 });
  els.forEach(function (el) { io.observe(el); });
  window.addEventListener('load', function () {
    setTimeout(function () {
      els.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
      });
    }, 600);
  });
})();

/* ---------- 3. Active Nav Highlighting ---------- */
(function () {
  var links = [].slice.call(document.querySelectorAll('.bench-nav a[href^="#"]'));
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
  }, { rootMargin: '-35% 0px -60% 0px' });
  Object.keys(map).forEach(function (id) {
    var target = document.getElementById(id);
    if (target) io.observe(target);
  });
  window.addEventListener('scroll', function () {
    if (window.scrollY < 100) links.forEach(function (a) { a.classList.remove('on'); });
  }, { passive: true });
})();

/* ---------- 4. Lightbox Modal ---------- */
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

/* ---------- 5. Live Telemetry Realistic Simulator ---------- */
(function () {
  var elCO = document.getElementById('val-co');
  var elSmoke = document.getElementById('val-smoke');
  var elVOC = document.getElementById('val-voc');
  var elTemp = document.getElementById('val-temp');
  var elSync = document.getElementById('val-sync');
  if (!elCO || !elSmoke) return;

  var baseCO = 18.2;
  var baseSmoke = 42;
  var baseVOC = 0.08;
  var baseTemp = 26.4;
  var secondsSinceSync = 3;

  setInterval(function () {
    // Subtle realistic physical fluctuation
    var jitterCO = (Math.random() * 0.8 - 0.4);
    var jitterSmoke = Math.round(Math.random() * 2 - 1);
    var jitterVOC = (Math.random() * 0.02 - 0.01);
    var jitterTemp = (Math.random() * 0.2 - 0.1);

    elCO.textContent = (baseCO + jitterCO).toFixed(1) + ' ppm';
    elSmoke.textContent = (baseSmoke + jitterSmoke) + ' ppm';
    elVOC.textContent = (baseVOC + jitterVOC).toFixed(2) + ' mg/L';
    elTemp.textContent = (baseTemp + jitterTemp).toFixed(1) + ' °C';

    secondsSinceSync += 3;
    if (secondsSinceSync >= 15) {
      secondsSinceSync = 0;
      if (elSync) {
        elSync.textContent = 'Uploaded to ThingSpeak just now';
        elSync.style.color = '#10b981';
      }
    } else if (elSync) {
      elSync.textContent = 'Next ThingSpeak push in ' + (15 - secondsSinceSync) + 's';
      elSync.style.color = '#64748b';
    }
  }, 3000);
})();
