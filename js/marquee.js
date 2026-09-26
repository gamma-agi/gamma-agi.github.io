// Latest Papers marquee: continuous auto-pan with one-card prev/next controls.
// Content is triplicated in the markup so the loop is seamless; we live in the
// middle copy and wrap by ±one set width.
(function () {
  var wrap = document.getElementById('paper-marquee');
  var track = wrap && wrap.querySelector('.paper-marquee-track');
  if (!wrap || !track) return;

  var card = track.querySelector('.paper-marquee-card');
  var gap = 20;
  var step = 320;
  var setW = 0;

  function measure() {
    if (card) step = card.getBoundingClientRect().width + gap;
    setW = track.scrollWidth / 3;
  }
  measure();
  wrap.scrollLeft = setW; // start in the middle copy

  window.addEventListener('resize', function () {
    var off = setW ? wrap.scrollLeft - setW : 0;
    measure();
    wrap.scrollLeft = setW + off;
  });

  var auto = true;
  var resumeT;
  var pos = wrap.scrollLeft;   // float accumulator (scrollLeft alone rounds sub-pixel steps away)
  var SPEED = 0.6;             // px per frame

  function tick() {
    if (auto && setW) {
      pos += SPEED;
      if (pos >= setW * 2) pos -= setW;
      else if (pos < 0) pos += setW;
      wrap.scrollLeft = pos;
    } else {
      pos = wrap.scrollLeft;   // stay in sync while paused / during manual + button scrolls
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  wrap.addEventListener('mouseenter', function () { auto = false; });
  wrap.addEventListener('mouseleave', function () { auto = true; });

  function nudge(dir) {
    auto = false;
    // keep inside the middle copy so a single step never runs off either end
    if (wrap.scrollLeft < setW * 0.5) wrap.scrollLeft += setW;
    else if (wrap.scrollLeft > setW * 1.5) wrap.scrollLeft -= setW;
    wrap.scrollBy({ left: dir * step, behavior: 'smooth' });
    clearTimeout(resumeT);
    resumeT = setTimeout(function () { auto = true; }, 3000);
  }

  var prev = document.getElementById('marquee-prev');
  var next = document.getElementById('marquee-next');
  if (prev) prev.addEventListener('click', function () { nudge(-1); });
  if (next) next.addEventListener('click', function () { nudge(1); });
})();
