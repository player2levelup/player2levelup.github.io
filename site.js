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

/* ---------- hero animation: remote click, TV glare, controller glow ---------- */
(function () {
  var root = document.getElementById('heroAnim');
  if (!root) return;
  var $ = function (id) { return document.getElementById(id); };
  var mascot = $('haMascot'), tintR = $('haTintR'), tintB = $('haTintB'), pad = $('haPad'), ch = $('haChar');
  var glow = $('haGlow'), glowB = $('haGlowB'), glare = $('haGlare');
  var arm = $('haArm'), armPath = $('haArmPath'), armPath2 = $('haArmPath2'), hand = $('haHand'), btn = $('haBtn');

  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (reduce) { root.classList.add('is-static'); return; }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, p) { return a + (b - a) * p; }
  function seg(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
  function ease(p) { return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function keys(t, k) {
    if (t <= k[0][0]) return k[0][1];
    for (var i = 1; i < k.length; i++) if (t <= k[i][0]) return lerp(k[i-1][1], k[i][1], (t - k[i-1][0]) / (k[i][0] - k[i-1][0]));
    return k[k.length - 1][1];
  }
  var SETTLE = 0.5, REACH0 = 0.9, REACH1 = 1.6, CLICK = 1.85, GLARE = 2.0, TUCK0 = 3.1, TUCK1 = 3.7, PAD_ON = 4.0;
  var FLICK = [[2.0,0],[2.06,.9],[2.12,.15],[2.2,.6],[2.27,.25],[2.38,1],[2.5,.7],[2.65,1]];
  var SH = { x: 505, y: 430 }, REST = { x: 560, y: 560 }, OUT = { x: 700, y: 520 };

  function render(t) {
    var room = seg(t, 0, SETTLE);
    var a = t < REACH1 ? ease(seg(t, REACH0, REACH1)) : (t < TUCK0 ? 1 : 1 - ease(seg(t, TUCK0, TUCK1)));
    var press = Math.sin(Math.PI * seg(t, CLICK - .08, CLICK + .12));
    var hx = lerp(REST.x, OUT.x, a), hy = lerp(REST.y, OUT.y, a) + 6 * press;
    var ex = lerp(540, 610, a), ey = lerp(560, 600, a);
    var d = 'M' + SH.x + ',' + SH.y + ' L' + ex + ',' + ey + ' L' + hx + ',' + hy;
    armPath.setAttribute('d', d); armPath2.setAttribute('d', d);
    hand.setAttribute('transform', 'translate(' + hx + ',' + hy + ') rotate(' + lerp(60, 118, a) + ')');
    arm.setAttribute('opacity', a < .02 ? '0' : '1');
    btn.setAttribute('fill', press > .3 ? '#ff5a5a' : '#cc0000');

    var L = keys(t, FLICK);
    if (t > 2.65) L = 1 + .035 * Math.sin(t * 7.3) + .025 * Math.sin(t * 3.1 + 1) - .02 * Math.max(0, Math.sin(t * 0.9 + 2));
    var Lc = clamp(L, 0, 1.08), L1 = clamp(L, 0, 1);
    mascot.style.filter = 'brightness(' + ((.22 + .8 * Lc) * room).toFixed(3) + ') saturate(' + (.7 + .3 * L1).toFixed(3) + ')';
    var warm = seg(t, 2.4, 3.0), shimmer = t > 3.0 ? .5 + .5 * Math.sin(t * 1.25) : 0;
    var flash = Math.sin(Math.PI * seg(t, GLARE, GLARE + .5)) * .9 + (t > GLARE + .5 ? .12 + .06 * Math.sin(t * 5) : 0);
    glare.style.opacity = String(clamp(flash * L1, 0, 1) * (1 - .5 * warm));
    tintR.style.opacity = String(Lc * (.12 + .4 * warm));
    tintB.style.opacity = String(L1 * (.4 * (1 - warm) + .12 * shimmer));
    glow.style.opacity = String(Lc * (.25 + .75 * warm));
    glowB.style.opacity = String(L1 * (.7 * (1 - warm) + .25 * shimmer));
    var breathe = t > 3.0 ? Math.sin((t - 3.0) * 2.1) : 0;
    ch.style.transform = 'scaleY(' + (1 + .005 * breathe) + ')';
    ch.style.opacity = String(room);
    var padOn = t < PAD_ON ? 0 : (t < PAD_ON + .12 ? seg(t, PAD_ON, PAD_ON + .12) : .65 + .35 * (.5 + .5 * Math.sin((t - PAD_ON) * 3.4)));
    pad.style.opacity = String(padOn * .85);
  }

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
