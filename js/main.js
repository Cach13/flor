/* ══════════════════════════════════════════════════════
   Flor Amarilla — main.js
   GSAP + Vanilla JS
   ══════════════════════════════════════════════════════ */

/* ─── UTILS ─── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const rnd = (a, b) => Math.random() * (b - a) + a;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

/* ─── STATE ─── */
// La pista de scroll no debe asomar hasta que el campo esté en pie
let sceneReady = false;

/* ─── FLOWER SVG GENERATOR ─── */
function createFlowerSVG(scale, isCenter) {
  const W  = Math.round(110 * scale);
  const H  = Math.round(185 * scale);
  const cx = Math.round(W / 2);
  const cy = Math.round(H * 0.22);   // centro de la cabeza de la flor

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
    // ── Fila del horizonte (simple, casi puntos de luz) ──
    { left:  2, scale: 0.23, order:  1, sway: -1.1, dur: 5.8, delay: 0.3, simple: true },
    { left:  7, scale: 0.25, order:  2, sway: -1.3, dur: 6.1, delay: 1.1, simple: true },
    { left: 12, scale: 0.22, order:  3, sway: -1.2, dur: 5.5, delay: 0.7, simple: true },
    { left: 18, scale: 0.26, order:  4, sway: -1.4, dur: 6.3, delay: 1.4, simple: true },
    { left: 24, scale: 0.24, order:  5, sway: -1.1, dur: 5.9, delay: 0.5, simple: true },
    { left: 31, scale: 0.25, order:  6, sway: -1.3, dur: 6.0, delay: 1.2, simple: true },
    { left: 38, scale: 0.23, order:  7, sway: -1.2, dur: 5.6, delay: 0.9, simple: true },
    { left: 45, scale: 0.26, order:  8, sway: -1.4, dur: 6.2, delay: 0.2, simple: true },
    { left: 52, scale: 0.24, order:  9, sway: -1.1, dur: 5.7, delay: 1.5, simple: true },
    { left: 59, scale: 0.25, order: 10, sway: -1.3, dur: 6.1, delay: 0.6, simple: true },
    { left: 66, scale: 0.22, order: 11, sway: -1.2, dur: 5.4, delay: 1.3, simple: true },
    { left: 73, scale: 0.26, order: 12, sway: -1.4, dur: 6.0, delay: 0.4, simple: true },
    { left: 80, scale: 0.24, order: 13, sway: -1.1, dur: 5.8, delay: 1.0, simple: true },
    { left: 87, scale: 0.25, order: 14, sway: -1.3, dur: 6.3, delay: 0.8, simple: true },
    { left: 94, scale: 0.23, order: 15, sway: -1.2, dur: 5.5, delay: 1.6, simple: true },
    { left: 98, scale: 0.26, order: 16, sway: -1.4, dur: 5.9, delay: 0.1, simple: true },
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
    { left:  1, scale: 0.72, order: 37, sway: -3.1, dur: 4.4, delay: 0.6 },
    { left: 46, scale: 0.69, order: 37, sway: -3.6, dur: 3.5, delay: 1.4 },
    { left: 95, scale: 0.74, order: 37, sway: -2.9, dur: 4.0, delay: 0.2 },
    // ── Primera fila (animación completa) ──
    { left: 11, scale: 1.02, order: 38, sway: -3.8, dur: 3.5, delay: 0.7 },
    { left: 27, scale: 0.97, order: 39, sway: -3.6, dur: 3.7, delay: 0.4 },
    { left: 60, scale: 1.05, order: 40, sway: -3.9, dur: 3.4, delay: 1.0 },
    { left: 77, scale: 0.98, order: 41, sway: -3.7, dur: 3.6, delay: 0.6 },
    { left: 91, scale: 1.00, order: 42, sway: -3.5, dur: 3.8, delay: 0.9 },
    { left:  3, scale: 0.95, order: 42, sway: -4.0, dur: 3.9, delay: 0.3 },
    { left: 36, scale: 1.01, order: 42, sway: -3.4, dur: 3.5, delay: 1.2 },
    { left: 52, scale: 0.99, order: 42, sway: -3.8, dur: 3.7, delay: 0.5 },
    { left: 69, scale: 1.04, order: 42, sway: -3.6, dur: 4.0, delay: 1.1 },
    // ── Flor central ──
    { left: 44, scale: 1.90, order: 43, sway: -3.0, dur: 4.1, delay: 0.0, center: true },
  ];

  // El orden de aparición y el apilado se derivan del tamaño: de lo más lejano
  // a lo más cercano. Así se pueden añadir flores sin renumerar a mano.
  defs.slice().sort((a, b) => a.scale - b.scale)
      .forEach((d, i) => { d.order = i + 1; });

  // Escala global según ancho de pantalla
  const vw = window.innerWidth;
  const gScale = vw < 380 ? 0.50 : vw < 520 ? 0.62 : vw < 768 ? 0.75 : vw < 1024 ? 0.88 : 1.0;

  defs.forEach(def => {
    const wrap = document.createElement('div');
    wrap.className = 'flower-wrap';
    wrap.dataset.order = def.order;
    wrap.dataset.simple = def.simple ? 'true' : '';
    // Las del fondo miden unos pocos píxeles: mecerlas no se aprecia
    // y son casi la mitad de las animaciones de la escena
    wrap.dataset.wind = def.scale >= 0.42 ? 'true' : '';

    const es = def.scale * gScale;          // escala efectiva
    const h = Math.round(185 * es);
    wrap.dataset.height = h;

    // Perspectiva: cuanto más pequeña es la flor, más arriba se planta en el
    // plano del suelo. Se mide sobre def.scale (el valor de diseño) y no sobre
    // la escala efectiva, para que el reparto no se desarme en pantallas chicas.
    const baseBottom = def.scale < 0.30 ? 42
                     : def.scale < 0.40 ? 32
                     : def.scale < 0.55 ? 22
                     : def.scale < 0.85 ? 11
                     : def.scale < 1.20 ? 2
                     : 0;

    // Un empujoncito aleatorio rompe la fila: el campo no es una cuadrícula
    const bottomOffset = def.center ? 0 : Math.max(0, baseBottom + rnd(-2.6, 2.6));
    const leftOffset   = def.center ? def.left : def.left + rnd(-2.2, 2.2);

    wrap.style.cssText = [
      `left:${leftOffset.toFixed(2)}%`,
      `bottom:${bottomOffset.toFixed(2)}%`,
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
  const count = Math.min(110, Math.floor((VW * VH) / 8000));

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = Math.random() < 0.16 ? 'star twinkle' : 'star';
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

/* ─── TREELINE ─── siluetas de pinos sobre la loma más cercana */
function buildTreeline() {
  const g = $('#treeline');
  if (!g) return;

  // La loma cercana va de y≈248 (bordes) a y≈272 (valles) en el viewBox 1440×300
  const ridgeY = x => 258 - 12 * Math.cos((x / 1440) * Math.PI * 6);

  let markup = '';
  for (let x = -20; x < 1460; x += rnd(16, 46)) {
    const base = ridgeY(x);
    const h = rnd(14, 34);
    const w = h * rnd(0.32, 0.46);
    // pino: triángulo esbelto con un tronquito
    markup +=
      `<path class="tree" d="M${x.toFixed(1)},${(base + 2).toFixed(1)}
        L${(x - w).toFixed(1)},${(base + 2).toFixed(1)}
        L${(x - w * 0.45).toFixed(1)},${(base - h * 0.42).toFixed(1)}
        L${(x - w * 0.72).toFixed(1)},${(base - h * 0.38).toFixed(1)}
        L${x.toFixed(1)},${(base - h).toFixed(1)}
        L${(x + w * 0.72).toFixed(1)},${(base - h * 0.38).toFixed(1)}
        L${(x + w * 0.45).toFixed(1)},${(base - h * 0.42).toFixed(1)}
        L${(x + w).toFixed(1)},${(base + 2).toFixed(1)} Z"/>`;
  }

  g.innerHTML = markup;
}

/* ─── CLOUDS ─── bandas de nube teñidas por el atardecer */
function buildClouds() {
  const box = $('#clouds');
  if (!box) return;

  const VW = window.innerWidth;
  const count = VW < 768 ? 5 : 8;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'cloud';

    const w = rnd(VW * 0.22, VW * 0.62);
    const h = rnd(14, 46);
    const top = rnd(8, 46);          // sólo en la mitad alta del cielo
    const far = top < 24;            // las altas, más tenues y lentas

    // Base oscura arriba, vientre encendido por el sol de abajo
    el.style.cssText = [
      `width:${w}px`,
      `height:${h}px`,
      `top:${top}%`,
      `--blur:${rnd(10, 22).toFixed(0)}px`,
      `--op:${(far ? rnd(0.18, 0.34) : rnd(0.3, 0.55)).toFixed(2)}`,
      `background:linear-gradient(to bottom,` +
        ` rgba(58,32,74,.85) 0%,` +
        ` rgba(118,52,86,.7) 45%,` +
        ` rgba(255,146,54,.65) 78%,` +
        ` rgba(255,206,120,.55) 100%)`
    ].join(';');

    box.appendChild(el);

    // Deriva lenta de izquierda a derecha, en bucle
    const dur = rnd(far ? 150 : 95, far ? 260 : 170);
    const startX = rnd(-w, VW);
    gsap.set(el, { x: startX });
    gsap.to(el, {
      x: VW + w,
      duration: dur * ((VW + w - startX) / (VW + w * 2)),
      ease: 'none',
      onComplete: function loop() {
        gsap.set(el, { x: -w });
        gsap.to(el, { x: VW + w, duration: dur, ease: 'none', onComplete: loop });
      }
    });
  }
}

/* ─── BIRDS ─── bandada lejana cruzando el cielo */
function buildBirds() {
  const box = $('#birds');
  if (!box) return;

  const VW = window.innerWidth;
  const count = VW < 768 ? 3 : 5;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'bird';

    const s = rnd(0.5, 1.15);                 // tamaño = distancia
    const top = rnd(11, 32);
    const flap = rnd(0.34, 0.62);

    el.style.cssText = [
      `top:${top}%`,
      `--flap:${flap.toFixed(2)}s`,
      `--flap-delay:${rnd(0, 0.5).toFixed(2)}s`,
      `opacity:${(0.3 + s * 0.45).toFixed(2)}`
    ].join(';');

    const w = Math.round(22 * s);
    el.innerHTML =
      `<svg width="${w}" height="${Math.round(w * 0.5)}" viewBox="0 0 22 11">
         <path class="wing" d="M1,7 C4,1 8,1 11,6 C14,1 18,1 21,7"
               fill="none" stroke="#1a1030" stroke-width="1.5"
               stroke-linecap="round"/>
       </svg>`;

    box.appendChild(el);

    // La ondulación vertical va en el SVG interior para no chocar con
    // el desplazamiento horizontal que se aplica al contenedor
    gsap.to(el.firstElementChild, {
      y: rnd(-26, 26),
      duration: rnd(3, 6),
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });

    // Vuelo continuo de lado a lado
    const fly = () => {
      const dur = rnd(26, 52) / s;            // las lejanas cruzan más despacio
      gsap.fromTo(el,
        { x: -40 },
        { x: VW + 40, duration: dur, ease: 'none', delay: rnd(0, 6), onComplete: fly }
      );
    };
    fly();
  }
}

/* ─── FIREFLIES ─── motas de luz cálida sobre el campo */
function buildFireflies() {
  const box = $('#fireflies');
  if (!box) return;

  const VW = window.innerWidth;
  const count = VW < 768 ? 6 : 9;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'firefly';

    el.style.cssText = [
      `left:${rnd(-2, 102).toFixed(1)}%`,
      `top:${rnd(38, 94).toFixed(1)}%`,
      `--s:${rnd(2.5, 5.5).toFixed(1)}px`,
      `--dx:${rnd(-90, 90).toFixed(0)}px`,
      `--dy:${rnd(-110, -30).toFixed(0)}px`,
      `--dur:${rnd(11, 26).toFixed(1)}s`,
      `--blink:${rnd(2.2, 5.5).toFixed(1)}s`,
      `--delay:-${rnd(0, 14).toFixed(1)}s`
    ].join(';');

    box.appendChild(el);
  }
}

/* ─── FOREGROUND ─── hierba y flores fuera de foco (profundidad de campo) */
function buildForeground() {
  const grass = $('#fg-grass');
  const fgBox = $('#fg-flowers');

  // Briznas de hierba en silueta, recortadas por el borde inferior
  if (grass) {
    let blades = '';
    for (let x = -30; x < 1470; x += rnd(8, 20)) {
      const h = rnd(60, 200);
      const lean = rnd(-34, 34);
      const w = rnd(3, 8);
      blades +=
        `<path class="blade" d="M${x.toFixed(1)},220
          C${(x + lean * 0.2).toFixed(1)},${(220 - h * 0.45).toFixed(1)}
           ${(x + lean * 0.7).toFixed(1)},${(220 - h * 0.78).toFixed(1)}
           ${(x + lean).toFixed(1)},${(220 - h).toFixed(1)}
          C${(x + lean * 0.7 + w).toFixed(1)},${(220 - h * 0.76).toFixed(1)}
           ${(x + lean * 0.2 + w).toFixed(1)},${(220 - h * 0.42).toFixed(1)}
           ${(x + w).toFixed(1)},220 Z"/>`;
    }
    grass.innerHTML = blades;
  }

  // Flores gigantes fuera de foco asomando por las esquinas
  if (fgBox) {
    const vw = window.innerWidth;
    const gScale = vw < 520 ? 1.5 : vw < 900 ? 2.1 : 2.8;
    // En pantallas estrechas la flor es más chica: hay que subirla para que
    // siga asomando por el borde inferior
    const lift = vw < 520 ? 24 : vw < 900 ? 12 : 0;

    const fg = [
      { left: -6,  bottom: -34, scale: 1.00, dur: 7.0, delay: 0.0, sway: -2.2 },
      { left: 16,  bottom: -46, scale: 0.86, dur: 8.2, delay: 1.4, sway: -1.8 },
      { left: 58,  bottom: -50, scale: 0.78, dur: 6.4, delay: 0.7, sway: -2.6 },
      { left: 83,  bottom: -38, scale: 0.95, dur: 7.6, delay: 2.0, sway: -2.0 },
      { left: 97,  bottom: -44, scale: 0.88, dur: 6.9, delay: 1.1, sway: -2.4 }
    ];

    fg.forEach(f => {
      const el = document.createElement('div');
      el.className = 'fg-flower';
      el.style.cssText = [
        `left:${f.left}%`,
        `bottom:${f.bottom + lift}%`,
        `--sway-a:${f.sway}deg`,
        `--sway-dur:${f.dur}s`,
        `--sway-delay:${f.delay}s`
      ].join(';');
      el.innerHTML = createFlowerSVG(f.scale * gScale, false);
      fgBox.appendChild(el);
    });
  }
}

/* ─── WIND ANIMATION ─── */
function startWind() {
  $$('.flower-wrap[data-wind="true"]').forEach(f => {
    // La entrada dejó un transform en línea; hay que soltarlo para que la
    // animación CSS del viento tome el control sin pelearse con él
    gsap.set(f, { clearProps: 'transform' });
    f.classList.add('windy');
  });
}


/* ─── PARALLAX ─── */
function initParallax() {
  // Cada capa se mueve según su distancia: el fondo apenas, el frente mucho
  const layers = [
    { el: $('#hills'),      ax: -3,  ay: -1, dur: 2.0 },
    { el: $('#mist'),       ax: -5,  ay: 0,  dur: 2.2 },
    { el: $('#field'),      ax: -10, ay: 0,  dur: 1.2 },
    { el: $('#fireflies'),  ax: 14,  ay: 4,  dur: 1.4 },
    { el: $('#foreground'), ax: 30,  ay: 10, dur: 1.0 }
  ].filter(l => l.el);

  const moon = $('#moon');

  const handleMove = (x, y) => {
    const cx = (x / window.innerWidth - 0.5) * 2;
    const cy = (y / window.innerHeight - 0.5) * 2;

    layers.forEach(l => {
      gsap.to(l.el, {
        x: cx * l.ax,
        y: cy * l.ay,
        duration: l.dur,
        ease: 'power1.out',
        overwrite: 'auto'
      });
    });

    gsap.to(moon, {
      x: cx * 8,
      y: cy * 5,
      duration: 1.8,
      ease: 'power1.out',
      overwrite: 'auto'
    });
  };

  window.addEventListener('mousemove', e => handleMove(e.clientX, e.clientY));

  window.addEventListener('touchmove', e => {
    if (e.touches.length) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });
}

/* ─── Altura de reposo del sol: justo encima de la línea del horizonte ─── */
function sunRestBottom() {
  const ground = $('#ground');
  if (!ground) return '56%';
  // El borde visible del suelo está al ~80% de su altura (ver --horizon en CSS)
  const horizon = (ground.offsetHeight * 0.80) / window.innerHeight;
  return (horizon * 100 + 2).toFixed(1) + '%';
}

/* ─── MAIN SEQUENCE ─── */
async function runSequence() {
  const tl = gsap.timeline();
  const flowers = $$('.flower-wrap');
  const sky = $('#sky');
  const moon = $('#moon');

  // Sort by data-order attribute
  flowers.sort((a, b) =>
    parseInt(a.dataset.order || 0) - parseInt(b.dataset.order || 0)
  );

  const simpleFlowers = flowers.filter(f => f.dataset.simple === 'true');
  const mainFlowers   = flowers.filter(f => f.dataset.simple !== 'true');

  /* 1 ─ Stars already visible via CSS animation */

  /* 2 ─ Sol aparece */
  tl.to(moon, { opacity: 1, duration: 1.1, ease: 'power1.inOut' }, 0.15);
  tl.to('#sunglow', { opacity: 1, duration: 1.8, ease: 'power1.inOut' }, 0.25);

  /* 2b ─ El horizonte se dibuja: montañas, nubes, niebla y rayos */
  tl.to('#hills',  { opacity: 1, duration: 1.4, ease: 'power1.out' }, 0.35);
  tl.to('#clouds', { opacity: 1, duration: 1.6, ease: 'power1.out' }, 0.6);
  tl.to('#mist',   { opacity: 1, duration: 1.8, ease: 'power1.out' }, 0.8);
  tl.to('#godrays',{ opacity: 1, duration: 2.2, ease: 'power1.out' }, 1.0);

  /* 3 ─ Sky shifts to dawn */
  tl.add(() => sky.classList.add('dawn'), 0.9);

  /* 4a ─ Flores de fondo: fade-in rápido en grupo */
  tl.fromTo(simpleFlowers,
    { opacity: 0 },
    { opacity: 1, duration: 0.9, stagger: 0.012, ease: 'power1.out' },
    0.7
  );

  /* 4b ─ Flores principales: brotan del suelo en cascada */
  const STEP  = 0.055;  // separación entre brotes
  const START = 0.9;    // cuándo brota la primera

  mainFlowers.forEach((flower, i) => {
    const h = parseFloat(flower.dataset.height || 120);

    tl.fromTo(flower,
      { opacity: 0, scaleY: 0, scaleX: 0.2, y: h * 0.3 },
      {
        opacity: 1, scaleY: 1, scaleX: 1, y: 0,
        duration: 0.85, ease: 'back.out(1.4)',
        transformOrigin: 'bottom center'
      },
      START + i * STEP
    );

    const petals = $$('.petal', flower);
    tl.fromTo(petals,
      { scale: 0, opacity: 0, transformOrigin: 'center 80%' },
      {
        scale: 1, opacity: 1, duration: 0.5,
        stagger: 0.03, ease: 'back.out(2)',
        transformOrigin: 'center 80%'
      },
      START + i * STEP + 0.35
    );
  });

  /* 5 ─ Sol desciende hasta besar el horizonte y se queda ahí */
  gsap.to(moon, { bottom: sunRestBottom(), duration: 8, ease: 'power2.out', delay: 0.6 });

  /* ─ El viento arranca cuando el campo ya está en pie */
  const afterFlowers = START + mainFlowers.length * STEP + 0.85;

  tl.add(startWind, afterFlowers);

  /* 5b ─ Primer plano desenfocado, pájaros y luciérnagas */
  tl.to('#foreground', { opacity: 1, duration: 1.4, ease: 'power1.out' }, afterFlowers - 1.1);
  tl.to('#birds',      { opacity: 1, duration: 1.6, ease: 'power1.out' }, afterFlowers - 0.8);
  tl.to('#fireflies',  { opacity: 1, duration: 2.0, ease: 'power1.out' }, afterFlowers - 0.3);

  /* 6 ─ La escena queda limpia; solo asoma la pista de que hay más abajo */
  tl.add(() => {
    sceneReady = true;
    const hint = $('#scroll-hint');
    if (hint && window.scrollY < 10) hint.classList.add('on');
  }, afterFlowers - 0.2);
}

/* ─── SCROLL REVEAL ─── la frase se descubre al deslizar hacia abajo */
function initScrollReveal() {
  const phrase = $('#phrase');
  const dim    = $('#dim');
  const hint   = $('#scroll-hint');
  if (!phrase || !dim) return;

  let pending = false;

  const apply = () => {
    pending = false;
    // El recorrido: media pantalla de deslizamiento la revela del todo
    const travel = window.innerHeight * 0.5;
    const p = Math.min(1, Math.max(0, window.scrollY / travel));
    // Arranca más tarde de lo que sube el velo, así el texto nunca pelea
    // con el paisaje a plena luz
    const t = Math.min(1, Math.max(0, (p - 0.12) / 0.88));

    phrase.style.opacity = t.toFixed(3);
    phrase.style.transform =
      `translateX(var(--tx)) translateY(${((1 - t) * 28).toFixed(1)}px)`;
    dim.style.opacity = p.toFixed(3);

    if (hint) hint.classList.toggle('on', sceneReady && window.scrollY < 10);
  };

  window.addEventListener('scroll', () => {
    if (!pending) { pending = true; requestAnimationFrame(apply); }
  }, { passive: true });

  window.addEventListener('resize', apply);
  apply();
}

/* ─── BOOT ─── */
document.addEventListener('DOMContentLoaded', () => {
  // Al recargar, el navegador restaura el scroll y la frase aparecería de golpe
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  // Centrado de los elementos que GSAP va a transformar después
  gsap.set('#moon', { xPercent: -50 });

  // Paisaje, de atrás hacia delante
  buildStars();
  buildClouds();
  buildBirds();
  buildTreeline();
  buildFlowers();
  buildFireflies();
  buildForeground();

  initParallax();
  initScrollReveal();
  runSequence();
});
