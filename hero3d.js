/**
 * Nakhla Web Studio - 3D golden date palm for the hero.
 * Loads Three.js (pinned, ES module) from jsDelivr only when WebGL is available.
 * Falls back to the static palm-logo.svg (already in the page) on any failure.
 * Performance: canvas only in hero, pixel ratio <= 1.5, pauses off-screen / hidden tab,
 * prefers-reduced-motion renders a single static frame.
 */
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';

const root = document.documentElement;
const hero = document.getElementById('hero');
const canvas = document.getElementById('heroCanvas');
const card = hero && hero.querySelector('.hero-visual-card');

function fallback(reason) {
  root.classList.remove('hero3d-ready');
  root.classList.add('hero3d-fallback');
  if (reason && window.console) console.info('[nakhla] 3D hero disabled:', reason);
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

async function boot() {
  if (!hero || !canvas || !card) return;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (saveData) return fallback('save-data');
  if (!hasWebGL()) return fallback('no WebGL');

  let THREE;
  try {
    THREE = await Promise.race([
      import(THREE_URL),
      new Promise((_, rej) => setTimeout(() => rej(new Error('CDN timeout')), 10000))
    ]);
  } catch (e) { return fallback(e.message || 'CDN failed'); }

  try { start(THREE); } catch (e) { fallback(e.message || 'init failed'); }
}

function start(THREE) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  // Depth separation: fronds/dust on the far side of the palm fade toward the cream page colour,
  // the near side stays crisp (camera at z=14, palm centred at z=0).
  scene.fog = new THREE.Fog(0xfaf7f0, 14.2, 21);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const CAM_Z = 14;
  camera.position.set(0, 0, CAM_Z);

  // Warm desert-gold lighting
  scene.add(new THREE.HemisphereLight(0xfff1cf, 0x3a2a0e, 1.1));
  const key = new THREE.DirectionalLight(0xffd889, 2.6);
  key.position.set(5, 7, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xfff0c2, 1.4);
  rim.position.set(-6, 3, -5);
  scene.add(rim);

  // ---------- Procedural date palm ----------
  const palm = new THREE.Group();
  const H = 4.4; // trunk height (crown at y = H)
  const col = (hex) => new THREE.Color(hex);

  // Trunk: stacked, tapered "leaf-base" segments along a gentle S-curve
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.18, 1.1, 0.06),
    new THREE.Vector3(0.08, 2.3, 0), new THREE.Vector3(-0.1, 3.5, 0.05),
    new THREE.Vector3(0, H, 0)
  ]);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0xa47b28, emissive: 0x3a2808, metalness: 0.25, roughness: 0.55, flatShading: true });
  const SEG = 16, segLen = trunkCurve.getLength() / SEG;
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < SEG; i++) {
    const t0 = i / SEG, t1 = (i + 1) / SEG;
    const r0 = THREE.MathUtils.lerp(0.3, 0.17, t0), r1 = THREE.MathUtils.lerp(0.3, 0.17, t1);
    const g = new THREE.CylinderGeometry(r1 * 1.18, r0 * 0.86, segLen * 1.08, 9, 1);
    const m = new THREE.Mesh(g, trunkMat);
    const tm = (t0 + t1) / 2;
    m.position.copy(trunkCurve.getPointAt(tm));
    m.quaternion.setFromUnitVectors(up, trunkCurve.getTangentAt(tm).normalize());
    m.rotation.y += i * 0.6;
    palm.add(m);
  }

  // Fronds: one merged, vertex-coloured geometry (rachis ribbon + V-shaped leaflets)
  const pos = [], colors = [], phases = [];
  let curPhase = 0; // per-frond breeze phase, written for every vertex of that frond
  const cBase = col(0x8a6a1c), cMid = col(0xc9a227), cTip = col(0xf0d27a), tmpC = new THREE.Color();
  const pushTri = (a, b, c, ca, cb, cc) => {
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    colors.push(ca.r, ca.g, ca.b, cb.r, cb.g, cb.b, cc.r, cc.g, cc.b);
    phases.push(curPhase, curPhase, curPhase);
  };
  const FRONDS = 15, crown = new THREE.Vector3(0, H, 0);
  const V = () => new THREE.Vector3();
  for (let k = 0; k < FRONDS; k++) {
    const a = k * 2.39996 + 0.3;                    // golden-angle spread
    curPhase = k * 1.713 + Math.sin(k * 3.1) * 0.9;  // de-synchronised sway per frond
    const tier = k / FRONDS;
    const elev = THREE.MathUtils.lerp(1.15, 0.12, tier) + (Math.sin(k * 7.1) * 0.08);
    const L = THREE.MathUtils.lerp(2.0, 2.9, Math.min(1, tier * 1.4));
    const droop = THREE.MathUtils.lerp(0.35, 1.05, tier);
    const d0 = new THREE.Vector3(Math.cos(elev) * Math.cos(a), Math.sin(elev), Math.cos(elev) * Math.sin(a));
    const P = (s, out) => out.copy(d0).multiplyScalar(L * s).add(crown).add(V().set(0, -droop * L * s * s, 0));
    const N = 30;
    const p = V(), pn = V(), tan = V(), side = V(), lift = V(), tmp = V();
    for (let i = 0; i < N; i++) {
      const s0 = i / N, s1 = (i + 1) / N;
      P(s0, p); P(s1, pn);
      tan.subVectors(pn, p).normalize();
      side.crossVectors(tan, up).normalize();
      if (side.lengthSq() < 0.01) side.set(1, 0, 0);
      lift.crossVectors(side, tan).normalize();
      tmpC.copy(cBase).lerp(cMid, Math.min(1, s0 * 1.6)).lerp(cTip, Math.max(0, s0 - 0.55) * 1.6);
      // rachis ribbon
      const w0 = 0.045 * (1 - s0 * 0.8), w1 = 0.045 * (1 - s1 * 0.8);
      const a0 = p.clone().addScaledVector(side, w0), b0 = p.clone().addScaledVector(side, -w0);
      const a1 = pn.clone().addScaledVector(side, w1), b1 = pn.clone().addScaledVector(side, -w1);
      pushTri(a0, b0, a1, tmpC, tmpC, tmpC);
      pushTri(b0, b1, a1, tmpC, tmpC, tmpC);
      if (s0 < 0.1) continue;
      // leaflets on both sides, V-shaped, tapering to the ends
      const len = 0.62 * Math.pow(Math.sin(Math.PI * Math.min(1, s0 * 1.05)), 0.7) + 0.06;
      const w = 0.05;
      for (const sgn of [1, -1]) {
        const dir = tmp.copy(side).multiplyScalar(sgn).addScaledVector(tan, 0.55).addScaledVector(lift, 0.38).normalize();
        const tip = p.clone().addScaledVector(dir, len).addScaledVector(up, -0.08 * len);
        const bA = p.clone().addScaledVector(tan, -w), bB = p.clone().addScaledVector(tan, w);
        const cT = tmpC.clone().lerp(cTip, 0.35);
        pushTri(bA, bB, tip, tmpC, tmpC, cT);
      }
    }
  }
  const frondGeo = new THREE.BufferGeometry();
  frondGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  frondGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  frondGeo.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1));
  frondGeo.computeVertexNormals();
  const frondMat = new THREE.MeshStandardMaterial({ vertexColors: true, emissive: 0x6b4d10, emissiveIntensity: 0.55, metalness: 0.22, roughness: 0.48, side: THREE.DoubleSide, flatShading: true });
  // Breeze: bend each frond in the vertex shader. Displacement grows with distance from the
  // crown (squared), so the rachis base stays attached and the tips sway most; leaflets get a
  // faster, smaller flutter. One uniform per frame, no CPU geometry work.
  const breeze = { value: 0 };
  frondMat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = breeze;
    shader.uniforms.uCrown = { value: crown };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aPhase;\nuniform float uTime;\nuniform vec3 uCrown;')
      .replace('#include <begin_vertex>', [
        '#include <begin_vertex>',
        'vec3 fromCrown = transformed - uCrown;',
        'float reach = clamp(length(fromCrown) / 2.9, 0.0, 1.0);',
        'float w = reach * reach;',
        'float t = uTime;',
        'float gust = 0.75 + 0.25 * sin(t * 0.31 + aPhase * 0.2);',
        'vec3 sway = vec3(sin(t * 0.9 + aPhase) * 0.16, sin(t * 1.3 + aPhase * 1.7) * 0.07, cos(t * 0.75 + aPhase * 1.3) * 0.12) * gust;',
        'float flutter = sin(t * 4.2 + aPhase * 3.0 + (transformed.x + transformed.z) * 6.0) * 0.022 * reach;',
        'transformed += sway * w + vec3(0.0, flutter, 0.0);'
      ].join('\n'));
  };
  palm.add(new THREE.Mesh(frondGeo, frondMat));

  // Crown heart
  const heart = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), trunkMat);
  heart.position.copy(crown);
  palm.add(heart);

  // Date clusters (instanced)
  const dateGeo = new THREE.IcosahedronGeometry(0.075, 1);
  const dateMat = new THREE.MeshStandardMaterial({ color: 0xb8691c, metalness: 0.3, roughness: 0.4 });
  const PER = 26, CLUSTERS = 3;
  const dates = new THREE.InstancedMesh(dateGeo, dateMat, PER * CLUSTERS);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
  let n = 0;
  for (let c = 0; c < CLUSTERS; c++) {
    const ang = c * (Math.PI * 2 / CLUSTERS) + 0.5;
    const cx = Math.cos(ang) * 0.38, cz = Math.sin(ang) * 0.38;
    for (let i = 0; i < PER; i++) {
      const t = i / PER;
      const rr = 0.05 + t * 0.2;
      const th = i * 2.4;
      const p = new THREE.Vector3(cx * (1 + t * 0.6) + Math.cos(th) * rr, H - 0.25 - t * 0.6, cz * (1 + t * 0.6) + Math.sin(th) * rr);
      sc.setScalar(0.85 + ((i * 37) % 10) / 30);
      m4.compose(p, q, sc);
      dates.setMatrixAt(n++, m4);
    }
  }
  palm.add(dates);
  const holder = new THREE.Group(); // outer: placement, lean, scroll tilt; inner palm: spin
  holder.add(palm);

  // Soft contact shadow / halo disc behind the crown (does not spin with the palm)
  const halo = document.createElement('canvas');
  halo.width = halo.height = 128;
  const hctx = halo.getContext('2d');
  const hg = hctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  hg.addColorStop(0, 'rgba(15,61,46,0.24)'); hg.addColorStop(0.45, 'rgba(15,61,46,0.11)'); hg.addColorStop(1, 'rgba(15,61,46,0)');
  hctx.fillStyle = hg; hctx.fillRect(0, 0, 128, 128);
  const haloMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 5.2),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(halo), transparent: true, depthWrite: false, fog: false })
  );
  haloMesh.position.set(0, H - 0.3, -3.2);
  haloMesh.renderOrder = -1;
  holder.add(haloMesh);
  scene.add(holder);

  // ---------- Gold / sand dust particles ----------
  const isSmall = window.innerWidth < 768;
  const PCOUNT = isSmall ? 110 : 240;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(PCOUNT * 3), pSeed = new Float32Array(PCOUNT);
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const dot = document.createElement('canvas');
  dot.width = dot.height = 32;
  const dctx = dot.getContext('2d');
  const grad = dctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255,236,170,1)'); grad.addColorStop(0.4, 'rgba(232,196,90,0.55)'); grad.addColorStop(1, 'rgba(201,162,39,0)');
  dctx.fillStyle = grad; dctx.fillRect(0, 0, 32, 32);
  const pMat = new THREE.PointsMaterial({
    size: 0.11, map: new THREE.CanvasTexture(dot), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, color: 0xe9c766, opacity: 0.85, sizeAttenuation: true, fog: false
  });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);
  let boxW = 10, boxH = 10;
  function seedParticles() {
    for (let i = 0; i < PCOUNT; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * boxW;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * boxH;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      pSeed[i] = Math.random() * 100;
    }
    pGeo.attributes.position.needsUpdate = true;
  }

  // ---------- Layout: anchor the palm crown just above the hero visual card ----------
  let W = 1, Hh = 1, visH = 1, visW = 1, baseCamY = 0, baseLean = 0;
  function layout() {
    W = hero.clientWidth; Hh = hero.clientHeight;
    const maxPR = 1.5;
    let pr = Math.min(window.devicePixelRatio || 1, maxPR);
    if (W * Hh * pr * pr > 2.2e6) pr = Math.max(1, Math.sqrt(2.2e6 / (W * Hh)));
    renderer.setPixelRatio(pr);
    renderer.setSize(W, Hh, false);
    camera.aspect = W / Hh;
    camera.updateProjectionMatrix();
    visH = 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    visW = visH * camera.aspect;
    const pxToWorld = visH / Hh;

    // card position from layout offsets (ignores the fade-in transform still running on it)
    let ox = 0, oy = 0, el = card;
    while (el && el !== hero) { ox += el.offsetLeft; oy += el.offsetTop; el = el.offsetParent; }
    const hr = { left: 0, top: 0 };
    const cr = { left: ox, top: oy, width: card.offsetWidth, bottom: oy + card.offsetHeight };
    const mobile = W < 861;
    const rtl = root.dir === 'rtl';
    let cx, crownPxY, s, lean;
    if (mobile) {
      // phones: crown peeks into the empty top corner, trunk leans off the edge
      cx = rtl ? W * 0.12 : W * 0.88;
      crownPxY = 34;
      s = (Math.min(W * 0.7, 300) * pxToWorld) / 5.4; // crown is ~5.4 world units wide at scale 1
      lean = rtl ? -0.42 : 0.42;
    } else {
      // desktop: crown grows from behind the visual card, in the stage reserved above it;
      // trunk is sized so its base stays hidden behind the card
      cx = cr.left - hr.left + cr.width / 2;
      crownPxY = cr.top - hr.top - 52;
      const sW = (Math.min(cr.width * 1.2, 560) * pxToWorld) / 5.4;
      const sH = ((cr.bottom - hr.top - 40 - crownPxY) * pxToWorld) / H;
      s = Math.min(sW, sH);
      lean = 0;
    }
    baseLean = lean;
    holder.scale.setScalar(s);
    holder.rotation.z = lean;
    const crownX = (cx / W - 0.5) * visW, crownY = (0.5 - crownPxY / Hh) * visH;
    holder.position.set(crownX + Math.sin(lean) * H * s, crownY - Math.cos(lean) * H * s, 0);
    boxW = visW * 1.1; boxH = visH * 1.1;
    seedParticles();
    render();
  }

  // ---------- Interaction: pointer / device tilt parallax + scroll depth ----------
  const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  let scrollP = 0;
  if (!reduced) {
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma == null) return;
      target.x = Math.max(-1, Math.min(1, e.gamma / 30));
      target.y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    }, { passive: true });
  }
  const readScroll = () => {
    const r = hero.getBoundingClientRect();
    scrollP = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height)));
  };
  window.addEventListener('scroll', readScroll, { passive: true });

  function render() { renderer.render(scene, camera); }

  let running = false, heroVisible = true, last = performance.now(), elapsed = 0, raf = 0;
  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; elapsed += dt;
    palm.rotation.y += dt * 0.16;
    breeze.value = elapsed;
    cur.x += (target.x - cur.x) * 0.05;
    cur.y += (target.y - cur.y) * 0.05;
    camera.position.x = cur.x * 0.9;
    camera.position.y = baseCamY - cur.y * 0.5 - scrollP * 1.6;
    camera.lookAt(0, -scrollP * 2.2, 0);
    holder.rotation.x = scrollP * 0.18;
    for (let i = 0; i < PCOUNT; i++) {
      const j = i * 3;
      pPos[j + 1] += dt * (0.12 + (pSeed[i] % 1) * 0.12);
      pPos[j] += Math.sin(elapsed * 0.5 + pSeed[i]) * dt * 0.08;
      if (pPos[j + 1] > boxH / 2) pPos[j + 1] = -boxH / 2;
    }
    pGeo.attributes.position.needsUpdate = true;
    render();
    raf = requestAnimationFrame(frame);
  }
  function updateRunning() {
    const should = !reduced && heroVisible && !document.hidden;
    if (should && !running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    else if (!should && running) { running = false; cancelAnimationFrame(raf); }
  }
  new IntersectionObserver((entries) => {
    heroVisible = entries[0].isIntersecting;
    updateRunning();
  }, { threshold: 0 }).observe(hero);
  document.addEventListener('visibilitychange', updateRunning);

  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); running = false; fallback('context lost'); });

  let rTimer = 0;
  const ro = new ResizeObserver(() => { clearTimeout(rTimer); rTimer = setTimeout(layout, 80); });
  ro.observe(hero);
  window.addEventListener('load', layout);

  palm.rotation.y = 0.6;
  readScroll();
  layout();
  root.classList.add('hero3d-ready');
  updateRunning();
}

boot();
