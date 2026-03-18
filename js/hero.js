/* hero.js — Three.js physics beat waveform (r128)
   Two sinusoidal waves interfere to form a classic acoustic beat:
     y(x,t) = ½[sin(k₁x − ω₁t) + sin(k₂x − ω₂t)]
            = cos(½Δk·x − ½Δω·t) · sin(k̄x − ω̄t)
   The cosine envelope pulses slowly (~6 s); the sine carrier oscillates faster.
   Lines are stacked in depth with a small z-phase shift so the beat-front
   appears to propagate into the scene.
*/
(function () {
  function init() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    /* ── Renderer ─────────────────────────────────────────────── */
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    var W = canvas.clientWidth  || 600;
    var H = canvas.clientHeight || 700;
    renderer.setSize(W, H);

    /* ── Scene & Camera ───────────────────────────────────────── */
    var scene  = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.set(0, 2.2, 7.0);
    camera.lookAt(0, 0, 0);

    /* ── Beat parameters ──────────────────────────────────────── */
    var N_LINES = 38;    // lines stacked in depth
    var N_PTS   = 320;   // sample points per line
    var W_SPAN  = 9.0;   // horizontal extent (world units)
    var D_SPAN  = 5.5;   // depth of the z-stack

    // Wave 1 + Wave 2 → beat interference
    // y = ½ sin(K1·x − W1·t) + ½ sin(K2·x − W2·t)
    //   = cos(Δk/2 · x − Δω/2 · t) · sin(k̄ · x − ω̄ · t)
    //
    // K1=2, K2=4  →  envelope λ = 2π / |K1−K2|·½ = 2π/1 ≈ 6.28 units
    //               → ~1.43 beat envelopes visible across W_SPAN = 9  ✓
    // W1=2, W2=4.5 →  envelope period = 2π / |W1−W2|·½ ≈ 5.03 clock-units
    //               → at 0.013/frame · 60 fps ≈ 6.4 s per beat cycle      ✓
    //  carrier:  k̄=3  → ~4.3 spatial oscillations across width            ✓
    //            ω̄=3.25 → ~2.5 s per carrier oscillation                  ✓
    var K1 = 2.0,  W1 = 2.00;
    var K2 = 4.0,  W2 = 4.50;

    // Small z-phase offset so the beat-front tilts through the depth stack
    var Z_PHASE = 0.25;  // radians per world-unit of z

    /* ── Theme helpers ────────────────────────────────────────── */
    function isDark() {
      return document.documentElement.getAttribute('data-theme') === 'dark';
    }
    var COL_DARK  = new THREE.Color(0xD4A843);
    var COL_LIGHT = new THREE.Color(0xC22828);
    function accentCol() { return isDark() ? COL_DARK : COL_LIGHT; }

    /* ── Build wave lines ─────────────────────────────────────── */
    var waveLines = [];

    for (var l = 0; l < N_LINES; l++) {
      var t        = l / (N_LINES - 1);                     // 0 → 1
      var z        = (t - 0.5) * D_SPAN;                    // −2.75 → +2.75
      // Gaussian brightness: central lines brightest, edges fade out
      var envelope = Math.exp(-Math.pow((t - 0.5) * 3.2, 2));

      var positions = new Float32Array(N_PTS * 3);
      var geom      = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      var mat = new THREE.LineBasicMaterial({
        color:       accentCol(),
        transparent: true,
        opacity:     0.04 + envelope * (isDark() ? 0.60 : 0.55),
      });

      var line = new THREE.Line(geom, mat);
      scene.add(line);

      waveLines.push({ line: line, geom: geom, positions: positions,
                       z: z, t: t, envelope: envelope, mat: mat });
    }

    /* ── Mouse tracking ───────────────────────────────────────── */
    var mouseX = 0, mouseY = 0;
    var targetX = 0, targetY = 0;

    window.addEventListener('mousemove', function (e) {
      targetX = (e.clientX / window.innerWidth  - 0.5) * 2.0;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2.0;
    });

    /* ── Wave update ──────────────────────────────────────────── */
    function updateWave(time) {
      waveLines.forEach(function (wl) {
        var pos    = wl.positions;
        var zOff   = wl.z;
        var env    = wl.envelope;
        // Each depth layer is slightly ahead/behind in phase
        var zPhase = zOff * Z_PHASE;

        for (var i = 0; i < N_PTS; i++) {
          var x = (i / (N_PTS - 1) - 0.5) * W_SPAN;

          // Smooth quartic edge fade — clean line termination
          var edgeFade = Math.pow(
            Math.max(0, 1.0 - Math.pow(Math.abs(x) / (W_SPAN * 0.48), 4)), 0.5
          );

          // Physics beat: two sinusoids of equal amplitude
          var y = 0.5 * Math.sin(K1 * x - W1 * time + zPhase)
                + 0.5 * Math.sin(K2 * x - W2 * time + zPhase);

          // Scale: Gaussian depth-brightness × edge fade × overall amplitude
          y *= env * 1.5 * edgeFade;

          pos[i * 3 + 0] = x;
          pos[i * 3 + 1] = y;
          pos[i * 3 + 2] = zOff;
        }
        wl.geom.attributes.position.needsUpdate = true;
      });
    }

    /* ── Animation loop ───────────────────────────────────────── */
    var clock = 0;

    function animate() {
      requestAnimationFrame(animate);
      clock += 0.013;

      // Smooth mouse lerp for parallax
      mouseX += (targetX - mouseX) * 0.045;
      mouseY += (targetY - mouseY) * 0.045;

      scene.rotation.y =  mouseX * 0.18;
      scene.rotation.x = -0.28 + mouseY * 0.07;

      updateWave(clock);
      renderer.render(scene, camera);
    }

    animate();

    /* ── Theme change ─────────────────────────────────────────── */
    document.addEventListener('themechange', function (e) {
      var dark = e.detail.theme === 'dark';
      var col  = dark ? COL_DARK : COL_LIGHT;
      waveLines.forEach(function (wl) {
        wl.mat.color.copy(col);
        wl.mat.opacity = 0.04 + wl.envelope * (dark ? 0.60 : 0.55);
        wl.mat.needsUpdate = true;
      });
    });

    /* ── Resize ───────────────────────────────────────────────── */
    window.addEventListener('resize', function () {
      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  if (typeof THREE !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  } else {
    window.addEventListener('load', init);
  }
})();
