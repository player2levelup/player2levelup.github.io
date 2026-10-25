// Mobile nav toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// Smooth scroll for same-page anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* Rory's age from his date of birth */
(function(){var e=document.getElementById('roryAge');if(!e)return;var d=new Date(2007,11,4),n=new Date(),a=n.getFullYear()-d.getFullYear();if(n.getMonth()<11||(n.getMonth()===11&&n.getDate()<4))a--;e.textContent=a;})();

/* ---------- hero animation: TV comes on, room warms to red, controller glows (smooth, no flicker) ---------- */
(function () {
  var root = document.getElementById('heroAnim');
  if (!root) return;
  var $ = function (id) { return document.getElementById(id); };
  var mascot = $('haMascot'), tintR = $('haTintR'), tintB = $('haTintB'), pad = $('haPad'), ch = $('haChar');
  var glow = $('haGlow'), glowB = $('haGlowB'), glare = $('haGlare');

  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (reduce) { root.classList.add('is-static'); return; }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function seg(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
  function ease(p) { return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function smooth(t, a, b) { return ease(seg(t, a, b)); }

  // Timeline (seconds): room fades in, TV light rises, room warms to red, controller glow switches on
  var ROOM = [0, 0.6], TV = [0.5, 1.7], WARM = [1.5, 2.9], PAD = [2.6, 3.2];

  function render(t) {
    var room = smooth(t, ROOM[0], ROOM[1]);
    var tv = smooth(t, TV[0], TV[1]);
    var warm = smooth(t, WARM[0], WARM[1]);
    var settled = seg(t, WARM[1], WARM[1] + 1);
    // very gentle, slow ambient movement once settled (no flicker)
    var amb = settled * (0.012 * Math.sin(t * 1.1) + 0.008 * Math.sin(t * 0.47 + 1.3));
    var light = clamp(tv + amb, 0, 1.02);

    mascot.style.filter = 'brightness(' + ((.22 + .78 * light) * (.4 + .6 * room)).toFixed(3) + ') saturate(' + (.7 + .3 * tv).toFixed(3) + ')';
    glare.style.opacity = String((tv * .35 * (1 - .6 * warm)).toFixed(3));
    tintB.style.opacity = String((tv * (.35 * (1 - warm) + .1 * warm)).toFixed(3));
    glowB.style.opacity = String((tv * (.6 * (1 - warm) + .2 * warm)).toFixed(3));
    tintR.style.opacity = String((light * (.1 + .42 * warm)).toFixed(3));
    glow.style.opacity = String((light * (.2 + .8 * warm)).toFixed(3));

    var p = smooth(t, PAD[0], PAD[1]);
    var pulse = .8 + .2 * Math.sin(Math.max(0, t - PAD[1]) * 2.2);
    pad.style.opacity = String((p * pulse * .85).toFixed(3));

    var breathe = settled * Math.sin((t - WARM[1]) * 2.0);
    ch.style.transform = 'scaleY(' + (1 + .004 * breathe).toFixed(4) + ')';
    ch.style.opacity = String(room.toFixed(3));
  }

  render(0);
  var start = null;
  function loop(now) {
    if (start === null) start = now;
    render((now - start) / 1000);
    requestAnimationFrame(loop);
  }
  if (!('IntersectionObserver' in window)) { requestAnimationFrame(loop); return; }
  var io = new IntersectionObserver(function (es) {
    if (es[0].isIntersecting) { io.disconnect(); requestAnimationFrame(loop); }
  });
  io.observe(root);
})();

/* Line up the tier intro lines so titles, intros and perk lists start at the same height */
(function () {
  function alignTierTags() {
    var tags = [].slice.call(document.querySelectorAll('.tier-tag'));
    if (!tags.length) return;
    tags.forEach(function (t) { t.style.minHeight = ''; });
    var tops = tags.map(function (t) { return t.getBoundingClientRect().top; });
    if (Math.max.apply(null, tops) - Math.min.apply(null, tops) > 4) return;
    var h = Math.max.apply(null, tags.map(function (t) { return t.offsetHeight; }));
    tags.forEach(function (t) { t.style.minHeight = h + 'px'; });
  }
  alignTierTags();
  window.addEventListener('load', alignTierTags);
  window.addEventListener('resize', alignTierTags);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignTierTags);
})();
