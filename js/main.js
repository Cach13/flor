/* ══════════════════════════════════════════════════════
   Flor Amarilla — main.js
   GSAP + tsParticles + Vanilla JS
   ══════════════════════════════════════════════════════ */

/* ─── UTILS ─── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const rnd = (a, b) => Math.random() * (b - a) + a;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

/* ─── STATE ─── */
let windTimeline = null;
let particlesLoaded = false;

/* ─── FLOWER SVG GENERATOR ─── */
function createFlowerSVG(scale, isCenter) {
  const W  = Math.round(110 * scale);
  const H  = Math.round(185 * scale);
  const cx = Math.round(W / 2);
  const cy = Math.round(H * 0.28);   // centro de la cabeza de la flor

  // Dimensiones de pétalos
  const prx  = Math.round(11 * scale);
  const pry  = Math.round(22 * scale);
  const dist = Math.round(24 * scale);  // distancia centro→base pétalo
  const cr   = Math.round(13 * scale);  // radio centro

  // Grosor del tallo
  const stemW = Math.max(3, Math.round(5 * scale));

  // Colores alternos de pétalos (sunflower realista)
  const petalCols = [
    '#ffd700','#ffcc00','#ffb800','#ffe066',
    '#ffd000','#ffca28','#ffb300','#ffe57a'
  ];

  // 8 pétalos distribuidos en 360°
  const petals = [0, 45, 90, 135, 180, 225, 270, 315].map((a, i) =>
    `<ellipse class="petal"
      cx="${cx}" cy="${cy - dist}"
      rx="${prx}" ry="${pry}"
      fill="${petalCols[i]}"
      style="--rot:${a}deg"
      transform="rotate(${a},${cx},${cy})"/>`
  ).join('');

  // Hojas
  const leafRx = Math.round(16 * scale);
  const leafRy = Math.round(6  * scale);
  const loff   = Math.round(13 * scale);
  const ly1    = cy + Math.round(H * 0.22);
  const ly2    = cy + Math.round(H * 0.40);

  // Filtro glow para la flor central
  const defs = isCenter
    ? `<defs>
        <filter id="glow-center" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
       </defs>`
    : '';
  const glowAttr = isCenter ? 'filter="url(#glow-center)"' : '';

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" overflow="visible">
  ${defs}
  <!-- tallo -->
  <line x1="${cx}" y1="${cy + 2}" x2="${cx}" y2="${H}"
    stroke="#2d6a1a" stroke-width="${stemW}" stroke-linecap="round"/>
  <!-- hoja izquierda -->
  <ellipse cx="${cx - loff}" cy="${ly1}"
    rx="${leafRx}" ry="${leafRy}" fill="#3a8020"
    transform="rotate(-35,${cx - loff},${ly1})"/>
  <!-- hoja derecha -->
  <ellipse cx="${cx + loff}" cy="${ly2}"
    rx="${leafRx}" ry="${leafRy}" fill="#3a8020"
    transform="rotate(35,${cx + loff},${ly2})"/>
  <!-- pétalos -->
  <g class="petals" ${glowAttr}>${petals}</g>
  <!-- centro oscuro -->
  <circle class="flower-center" cx="${cx}" cy="${cy}" r="${cr}" fill="#3d1a00" ${glowAttr}/>
  <!-- anillo interior -->
  <circle cx="${cx}" cy="${cy}" r="${Math.round(cr * 0.65)}" fill="#5a2800"/>
  <!-- punto central -->
  <circle cx="${cx}" cy="${cy}" r="${Math.round(cr * 0.35)}" fill="#7a3d00" opacity="0.8"/>
</svg>`;
}

/* ─── BUILD FLOWERS ─── */
function buildFlowers() {
  const field = $('#field');

  // Definición de cada flor: posición, escala, orden de aparición, movimiento de viento
  // simple:true → fade-in rápido (fondo), sin animación de brote
  const defs = [
    // ── Fila muy trasera (simple) ──
    { left:  1, scale: 0.33, order:  1, sway: -1.6, dur: 5.1, delay: 0.4, simple: true },
    { left:  8, scale: 0.36, order:  2, sway: -1.9, dur: 4.8, delay: 1.2, simple: true },
    { left: 15, scale: 0.34, order:  3, sway: -1.7, dur: 5.3, delay: 0.6, simple: true },
    { left: 22, scale: 0.35, order:  4, sway: -2.0, dur: 4.6, delay: 1.5, simple: true },
    { left: 29, scale: 0.33, order:  5, sway: -1.8, dur: 5.0, delay: 0.2, simple: true },
    { left: 36, scale: 0.37, order:  6, sway: -1.6, dur: 5.2, delay: 1.1, simple: true },
    { left: 43, scale: 0.34, order:  7, sway: -2.1, dur: 4.7, delay: 0.8, simple: true },
    { left: 50, scale: 0.36, order:  8, sway: -1.9, dur: 4.9, delay: 0.3, simple: true },
    { left: 57, scale: 0.33, order:  9, sway: -1.7, dur: 5.4, delay: 1.6, simple: true },
    { left: 64, scale: 0.35, order: 10, sway: -2.0, dur: 4.5, delay: 0.7, simple: true },
    { left: 71, scale: 0.34, order: 11, sway: -1.8, dur: 5.1, delay: 1.3, simple: true },
    { left: 78, scale: 0.37, order: 12, sway: -1.6, dur: 4.7, delay: 0.5, simple: true },
    { left: 85, scale: 0.33, order: 13, sway: -2.1, dur: 5.3, delay: 1.0, simple: true },
    { left: 92, scale: 0.35, order: 14, sway: -1.9, dur: 4.6, delay: 0.9, simple: true },
    { left: 99, scale: 0.34, order: 15, sway: -1.7, dur: 5.0, delay: 0.3, simple: true },
    // ── Fila trasera (simple) ──
    { left:  4, scale: 0.46, order: 16, sway: -2.3, dur: 4.5, delay: 0.6, simple: true },
    { left: 11, scale: 0.49, order: 17, sway: -2.7, dur: 4.0, delay: 1.2, simple: true },
    { left: 18, scale: 0.44, order: 18, sway: -2.4, dur: 4.7, delay: 0.4, simple: true },
    { left: 26, scale: 0.51, order: 19, sway: -2.1, dur: 4.3, delay: 1.7, simple: true },
    { left: 33, scale: 0.46, order: 20, sway: -2.8, dur: 3.9, delay: 0.8, simple: true },
    { left: 40, scale: 0.44, order: 21, sway: -2.5, dur: 4.6, delay: 1.0, simple: true },
    { left: 47, scale: 0.50, order: 22, sway: -2.2, dur: 4.1, delay: 0.2, simple: true },
    { left: 54, scale: 0.45, order: 23, sway: -2.6, dur: 4.4, delay: 1.5, simple: true },
    { left: 61, scale: 0.47, order: 24, sway: -2.3, dur: 4.8, delay: 0.7, simple: true },
    { left: 68, scale: 0.44, order: 25, sway: -2.0, dur: 4.2, delay: 1.3, simple: true },
    { left: 75, scale: 0.48, order: 26, sway: -2.7, dur: 4.6, delay: 0.5, simple: true },
    { left: 82, scale: 0.46, order: 27, sway: -2.4, dur: 4.0, delay: 1.1, simple: true },
    { left: 89, scale: 0.49, order: 28, sway: -2.2, dur: 4.5, delay: 0.6, simple: true },
    { left: 96, scale: 0.45, order: 29, sway: -2.6, dur: 4.3, delay: 1.4, simple: true },
    // ── Fila media (animación completa) ──
    { left:  6, scale: 0.71, order: 30, sway: -3.2, dur: 4.0, delay: 0.9 },
    { left: 17, scale: 0.74, order: 31, sway: -2.7, dur: 3.6, delay: 1.3 },
    { left: 28, scale: 0.70, order: 32, sway: -3.5, dur: 4.2, delay: 0.5 },
    { left: 39, scale: 0.75, order: 33, sway: -2.9, dur: 3.8, delay: 1.1 },
    { left: 53, scale: 0.72, order: 34, sway: -3.3, dur: 4.1, delay: 0.3 },
    { left: 63, scale: 0.76, order: 35, sway: -3.0, dur: 3.7, delay: 1.5 },
    { left: 74, scale: 0.73, order: 36, sway: -2.8, dur: 4.3, delay: 0.7 },
    { left: 86, scale: 0.70, order: 37, sway: -3.4, dur: 3.9, delay: 1.0 },
    // ── Primera fila (animación completa) ──
    { left: 11, scale: 1.02, order: 38, sway: -3.8, dur: 3.5, delay: 0.7 },
    { left: 27, scale: 0.97, order: 39, sway: -3.6, dur: 3.7, delay: 0.4 },
    { left: 60, scale: 1.05, order: 40, sway: -3.9, dur: 3.4, delay: 1.0 },
    { left: 77, scale: 0.98, order: 41, sway: -3.7, dur: 3.6, delay: 0.6 },
    { left: 91, scale: 1.00, order: 42, sway: -3.5, dur: 3.8, delay: 0.9 },
    // ── Flor central ──
    { left: 44, scale: 1.90, order: 43, sway: -3.0, dur: 4.1, delay: 0.0, center: true },
  ];

  // Escala global según ancho de pantalla
  const vw = window.innerWidth;
  const gScale = vw < 380 ? 0.50 : vw < 520 ? 0.62 : vw < 768 ? 0.75 : vw < 1024 ? 0.88 : 1.0;

  defs.forEach(def => {
    const wrap = document.createElement('div');
    wrap.className = 'flower-wrap';
    wrap.dataset.order = def.order;
    wrap.dataset.simple = def.simple ? 'true' : '';

    const es = def.scale * gScale;          // escala efectiva
    const h = Math.round(185 * es);
    wrap.dataset.height = h;

    // Flores traseras levemente elevadas para reforzar la perspectiva
    const bottomOffset = es < 0.60 ? '5%'
                       : es < 0.85 ? '2%'
                       : '0%';

    wrap.style.cssText = [
      `left:${def.left}%`,
      `bottom:${bottomOffset}`,
      `--sway-a:${def.sway}deg`,
      `--sway-dur:${def.dur}s`,
      `--sway-delay:${def.delay}s`,
      `z-index:${def.order}`
    ].join(';');

    wrap.innerHTML = createFlowerSVG(es, def.center || false);
    field.appendChild(wrap);
  });
}

/* ─── STARS ─── */
function buildStars() {
  const sky = $('#stars');
  const VW = window.innerWidth;
  const VH = window.innerHeight;
  const count = Math.min(180, Math.floor((VW * VH) / 5000));

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'star';
    const size = rnd(1, 3.5);
    const top = rnd(0, 65); // stars only in sky portion
    const left = rnd(0, 100);
    const dur = rnd(2, 5);
    const delay = rnd(0, 4);
    const minOp = rnd(0.15, 0.5);
    el.style.cssText = `
      width:${size}px; height:${size}px;
      top:${top}%; left:${left}%;
      --dur:${dur}s; --delay:${delay}s; --min-op:${minOp};
    `;
    sky.appendChild(el);
  }
}

/* ─── TSPARTICLES (petals in wind) ─── */
async function initParticles() {
  if (typeof tsParticles === 'undefined') return;

  await tsParticles.load({
    id: 'tsparticles',
    options: {
      fullScreen: false,
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      particles: {
        number: { value: 0 },
        color: { value: ['#ffd700', '#ffb300', '#fff176', '#ffcc02', '#ffe57a'] },
        shape: {
          type: 'char',
          options: {
            char: [
              { value: '🌸', font: 'Verdana', style: '', weight: '400' },
              { value: '✿', font: 'Verdana', style: '', weight: '400' },
              { value: '❋', font: 'Verdana', style: '', weight: '400' },
            ]
          }
        },
        opacity: {
          value: { min: 0.4, max: 0.9 },
          animation: { enable: true, speed: 0.5, minimumValue: 0.1, sync: false }
        },
        size: {
          value: { min: 8, max: 18 },
          animation: { enable: true, speed: 2, minimumValue: 4, sync: false }
        },
        move: {
          enable: true,
          speed: { min: 1.5, max: 4 },
          direction: 'right',
          random: true,
          straight: false,
          outModes: { default: 'out', left: 'destroy', right: 'destroy', top: 'out', bottom: 'out' },
          attract: { enable: false },
          warp: false,
          gravity: { enable: true, acceleration: 0.3 },
          path: {
            enable: true,
            delay: { value: 0 },
            options: { size: 12, draw: false, increment: 0.004 }
          }
        },
        rotate: {
          value: { min: 0, max: 360 },
          animation: { enable: true, speed: { min: 5, max: 25 }, sync: false }
        },
        wobble: { enable: true, distance: 10, speed: { min: -5, max: 5 } },
        life: {
          duration: { sync: false, value: { min: 3, max: 8 } },
          count: 1
        }
      },
      emitters: {
        direction: 'right',
        rate: { delay: window.innerWidth < 768 ? 1.2 : 0.6, quantity: 1 },
        position: { x: -5, y: { min: 20, max: 90 } },
        size: { width: 0, height: 60 }
      },
      interactivity: { events: { resize: true } }
    }
  });

  particlesLoaded = true;
}

/* ─── WIND ANIMATION ─── */
function startWind() {
  const flowers = $$('.flower-wrap');

  windTimeline = gsap.timeline({ repeat: -1 });

  flowers.forEach((f, i) => {
    const swayA = parseFloat(f.style.getPropertyValue('--sway-a')) || rnd(-4, -2);
    const dur = rnd(3.5, 6);
    const delay = rnd(0, 3);

    gsap.to(f, {
      rotation: swayA * -1.2,
      x: rnd(1, 3),
      duration: dur,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: delay
    });
  });
}


/* ─── PARALLAX ─── */
function initParallax() {
  const field = $('#field');
  const moon = $('#moon');

  const handleMove = (x, y) => {
    const cx = (x / window.innerWidth - 0.5) * 2;
    const cy = (y / window.innerHeight - 0.5) * 2;

    gsap.to(field, {
      x: cx * -10,
      duration: 1.2,
      ease: 'power1.out'
    });

    gsap.to(moon, {
      x: cx * 8,
      y: cy * 5,
      duration: 1.8,
      ease: 'power1.out'
    });
  };

  window.addEventListener('mousemove', e => handleMove(e.clientX, e.clientY));

  window.addEventListener('touchmove', e => {
    if (e.touches.length) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });
}

/* ─── CONFETTI BURST ─── */
function burstConfetti() {
  const canvas = $('#confetti');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    size: rnd(6, 16),
    speedY: rnd(2, 6),
    speedX: rnd(-2, 2),
    rot: rnd(0, 360),
    rotSpeed: rnd(-5, 5),
    color: pick(['#ffd700', '#ffb300', '#fff176', '#ff9800', '#ffe57a', '#ffffff'])
  }));

  let frame;
  let alpha = 1;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = alpha;

    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();

      p.y += p.speedY;
      p.x += p.speedX;
      p.rot += p.rotSpeed;
    });

    if (pieces.some(p => p.y < canvas.height + 20)) {
      // fade out after 2.5s
      if (alpha > 0) alpha -= 0.003;
      frame = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  draw();

  // reset pieces position after they fall
  setTimeout(() => {
    pieces.forEach(p => {
      p.y = -20;
      p.x = Math.random() * canvas.width;
    });
  }, 100);
}

/* ─── MAIN SEQUENCE ─── */
async function runSequence() {
  const tl = gsap.timeline();
  const flowers = $$('.flower-wrap');
  const sky = $('#sky');
  const moon = $('#moon');
  const btnWrap = $('#btn-wrap');

  // Sort by data-order attribute
  flowers.sort((a, b) =>
    parseInt(a.dataset.order || 0) - parseInt(b.dataset.order || 0)
  );

  const simpleFlowers = flowers.filter(f => f.dataset.simple === 'true');
  const mainFlowers   = flowers.filter(f => f.dataset.simple !== 'true');

  /* 1 ─ Stars already visible via CSS animation */

  /* 2 ─ Sol aparece */
  tl.to(moon, { opacity: 1, duration: 2.5, ease: 'power1.inOut' }, 0.8);

  /* 3 ─ Sky shifts to dawn */
  tl.add(() => sky.classList.add('dawn'), 2.5);

  /* 4a ─ Flores de fondo: fade-in rápido en grupo */
  tl.fromTo(simpleFlowers,
    { opacity: 0 },
    { opacity: 1, duration: 1.8, stagger: 0.04, ease: 'power1.out' },
    2.2
  );

  /* 4b ─ Flores principales: brotan del suelo en cascada */
  mainFlowers.forEach((flower, i) => {
    const h = parseFloat(flower.dataset.height || 120);

    tl.fromTo(flower,
      { opacity: 0, scaleY: 0, scaleX: 0.2, y: h * 0.3 },
      {
        opacity: 1, scaleY: 1, scaleX: 1, y: 0,
        duration: 1.2, ease: 'back.out(1.4)',
        transformOrigin: 'bottom center'
      },
      3.5 + i * 0.28
    );

    const petals = $$('.petal', flower);
    tl.fromTo(petals,
      { scale: 0, opacity: 0, transformOrigin: 'center 80%' },
      {
        scale: 1, opacity: 1, duration: 0.7,
        stagger: 0.04, ease: 'back.out(2)',
        transformOrigin: 'center 80%'
      },
      3.5 + i * 0.28 + 0.5
    );
  });

  /* 5 ─ Sol desciende al horizonte y se queda ahí */
  gsap.to(moon, { bottom: '61%', duration: 14, ease: 'power2.out', delay: 2 });

  /* ─ Start wind & particles after flowers are up */
  const afterFlowers = 3.5 + mainFlowers.length * 0.28 + 1.2;

  tl.add(() => {
    startWind();
    initParticles();
  }, afterFlowers);

  /* 6 ─ Frase aparece con delay tras las flores */
  /* 6 ─ Frase aparece con delay tras las flores */
  tl.add(() => {
    const phrase = $('#phrase');
    if (phrase) phrase.style.animationPlayState = 'running';
  }, afterFlowers + 0.6);

  /* 6 ─ Button appears */
  tl.fromTo(btnWrap,
    { opacity: 0, y: 15 },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'back.out(1.6)',
      onComplete: () => {
        btnWrap.style.pointerEvents = 'all';
        $('#btn-final').addEventListener('click', () => {
          burstConfetti();
          gsap.to('#btn-final', {
            scale: 0.92,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut'
          });
        });
      }
    },
    afterFlowers + 1.0
  );
}

/* ─── BOOT ─── */
document.addEventListener('DOMContentLoaded', () => {
  buildStars();
  buildFlowers();
  initParallax();
  runSequence();
});
