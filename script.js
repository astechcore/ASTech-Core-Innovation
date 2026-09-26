'use strict';

/* ══════════════════════════════════════════
   PRELOADER with progress simulation
   ══════════════════════════════════════════ */
const preLabels = [
  'Initializing SAP Core…',
  'Loading SD Configuration…',
  'Connecting to S/4 HANA…',
  'Building Order Pipeline…',
  'Ready.'
];
let preProgress = 0;
const preFill    = document.getElementById('preFill');
const preLabel   = document.getElementById('preLabel');
let labelIdx = 0;

const preInterval = setInterval(() => {
  preProgress += Math.random() * 18 + 6;
  if (preProgress >= 100) { preProgress = 100; clearInterval(preInterval) }
  if (preFill) preFill.style.width = preProgress + '%';
  const ni = Math.floor((preProgress / 100) * (preLabels.length - 1));
  if (ni !== labelIdx && preLabel) {
    labelIdx = ni;
    preLabel.textContent = preLabels[labelIdx];
  }
}, 150);

window.addEventListener('load', () => {
  setTimeout(() => {
    const p = document.getElementById('preloader');
    if (p) p.classList.add('hide');
    document.querySelectorAll('.line-reveal').forEach(el => el.classList.add('visible'));
  }, 1200);
});

/* ══════════════════════════════════════════
   THREE.JS HERO BACKGROUND
   Animated floating SAP node graph — layered
   over the technical circuit-board SVG backdrop
   ══════════════════════════════════════════ */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 18);

  // Cooler, dimmer lighting tuned for the dark circuit-board backdrop
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const dLight = new THREE.DirectionalLight(0x00a8e1, 1.4);
  dLight.position.set(5, 5, 5);
  scene.add(dLight);
  const dLight2 = new THREE.DirectionalLight(0x0070f2, 1.0);
  dLight2.position.set(-5, -3, 3);
  scene.add(dLight2);

  // ── Floating nodes (spheres) ──
  const nodeCount = 22;
  const nodes     = [];
  const nodeGeo   = new THREE.SphereGeometry(0.18, 14, 14);

  for (let i = 0; i < nodeCount; i++) {
    const mat = new THREE.MeshStandardMaterial({
      color      : Math.random() > .6 ? 0x0070f2 : 0x00d4ff,
      emissive   : Math.random() > .6 ? 0x0070f2 : 0x00a8e1,
      emissiveIntensity: 0.9,
      roughness  : 0.25,
      metalness  : 0.6,
    });
    const mesh = new THREE.Mesh(nodeGeo, mat);
    mesh.position.set(
      (Math.random() - .5) * 30,
      (Math.random() - .5) * 18,
      (Math.random() - .5) * 10 - 8
    );
    mesh.userData = {
      vx: (Math.random() - .5) * .012,
      vy: (Math.random() - .5) * .009,
      vz: (Math.random() - .5) * .006,
      phase: Math.random() * Math.PI * 2,
    };
    scene.add(mesh);
    nodes.push(mesh);
  }

  // ── Edges between nearby nodes ──
  const edgeMat = new THREE.LineBasicMaterial({ color:0x00a8e1, transparent:true, opacity:.32 });
  const maxDist = 9;
  nodes.forEach((a, i) => {
    nodes.forEach((b, j) => {
      if (j <= i) return;
      const d = a.position.distanceTo(b.position);
      if (d < maxDist) {
        const geo = new THREE.BufferGeometry().setFromPoints([a.position, b.position]);
        scene.add(new THREE.Line(geo, edgeMat));
      }
    });
  });

  // ── Large wireframe sphere ──
  const sphereGeo = new THREE.SphereGeometry(9, 22, 18);
  const wireMat   = new THREE.MeshBasicMaterial({ color:0x0070f2, wireframe:true, transparent:true, opacity:.12 });
  const wireSphere = new THREE.Mesh(sphereGeo, wireMat);
  wireSphere.position.set(6, 0, -12);
  scene.add(wireSphere);

  // ── Torus (representing data ring) ──
  const torusGeo = new THREE.TorusGeometry(5, .04, 8, 80);
  const torusMat = new THREE.MeshBasicMaterial({ color:0x00d4ff, transparent:true, opacity:.35 });
  const torus    = new THREE.Mesh(torusGeo, torusMat);
  torus.position.set(-6, 0, -10);
  torus.rotation.x = Math.PI / 3;
  scene.add(torus);

  // ── Icosahedron (featured 3D shape) ──
  const icoGeo = new THREE.IcosahedronGeometry(2.5, 1);
  const icoMat = new THREE.MeshStandardMaterial({
    color:0x0070f2, emissive:0x0070f2, emissiveIntensity:.4,
    roughness:.2, metalness:.8, wireframe:false, transparent:true, opacity:.25,
  });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  ico.position.set(8, 2, -6);
  scene.add(ico);

  const icoWire = new THREE.Mesh(icoGeo, new THREE.MeshBasicMaterial({ color:0x00d4ff, wireframe:true, transparent:true, opacity:.35 }));
  icoWire.position.copy(ico.position);
  scene.add(icoWire);

  // Mouse parallax
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - .5) * 2;
    mouseY = (e.clientY / window.innerHeight - .5) * 2;
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    camera.position.x += (mouseX * 1.5 - camera.position.x) * .04;
    camera.position.y += (-mouseY * 1.0 - camera.position.y) * .04;
    camera.lookAt(scene.position);

    nodes.forEach(n => {
      n.position.x += n.userData.vx;
      n.position.y += n.userData.vy;
      n.position.z += n.userData.vz;
      if (Math.abs(n.position.x) > 16) n.userData.vx *= -1;
      if (Math.abs(n.position.y) > 10) n.userData.vy *= -1;
      if (n.position.z > -3 || n.position.z < -18) n.userData.vz *= -1;
      n.material.emissiveIntensity = .4 + .35 * Math.sin(t * 1.5 + n.userData.phase);
    });

    wireSphere.rotation.y = t * .08;
    wireSphere.rotation.x = t * .04;
    torus.rotation.z      = t * .12;
    ico.rotation.x        = t * .15;
    ico.rotation.y        = t * .22;
    icoWire.rotation.x    = ico.rotation.x;
    icoWire.rotation.y    = ico.rotation.y;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* ══════════════════════════════════════════
   TECHNICAL BACKGROUND — mouse parallax drift
   Makes the circuit-board SVG feel alive
   ══════════════════════════════════════════ */
(function initTechBgParallax() {
  const bg = document.querySelector('.circuit-svg');
  if (!bg) return;
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - .5);
    my = (e.clientY / window.innerHeight - .5);
    bg.style.transform = `scale(1.03) translate(${mx * -14}px, ${my * -10}px)`;
  });
})();

/* ══════════════════════════════════════════
   MODULE SECTION — Canvas orbiting rings
   ══════════════════════════════════════════ */
(function initModuleCanvas() {
  const canvas = document.getElementById('moduleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;

  const rings = [
    { r:110, speed:.35, nodes:6, color:'rgba(0,112,242,' },
    { r: 75, speed:-.55, nodes:4, color:'rgba(0,168,225,' },
    { r: 40, speed:.9,  nodes:3, color:'rgba(27,186,121,' },
  ];

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    rings.forEach(ring => {
      ctx.beginPath();
      ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
      ctx.strokeStyle = ring.color + '.12)';
      ctx.lineWidth   = 1;
      ctx.stroke();

      for (let i = 0; i < ring.nodes; i++) {
        const a = (i / ring.nodes) * Math.PI * 2 + t * ring.speed;
        const x = cx + Math.cos(a) * ring.r;
        const y = cy + Math.sin(a) * ring.r;

        const grd = ctx.createRadialGradient(x, y, 0, x, y, 12);
        grd.addColorStop(0, ring.color + '.8)');
        grd.addColorStop(1, ring.color + '0)');
        ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();

        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = ring.color + '1)'; ctx.fill();

        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y);
        ctx.strokeStyle = ring.color + '.06)';
        ctx.lineWidth = 1; ctx.stroke();
      }
    });

    const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
    cg.addColorStop(0, 'rgba(0,168,225,.9)');
    cg.addColorStop(.6,'rgba(0,112,242,.4)');
    cg.addColorStop(1, 'rgba(0,112,242,0)');
    ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fillStyle = cg; ctx.fill();

    ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,168,225,1)'; ctx.fill();
  }

  let start = null;
  function frame(ts) {
    if (!start) start = ts;
    draw((ts - start) / 1000);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* ══════════════════════════════════════════
   THEME TOGGLE
   ══════════════════════════════════════════ */
const html     = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
html.setAttribute('data-theme', localStorage.getItem('astech-theme') || 'light');
themeBtn && themeBtn.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('astech-theme', next);
});

/* ══════════════════════════════════════════
   TOAST
   ══════════════════════════════════════════ */
function showToast(type, icon, msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  document.getElementById('toastIcon').textContent = icon;
  document.getElementById('toastMsg').textContent  = msg;
  t.style.borderColor =
    type === 'success' ? 'rgba(27,186,121,.4)' :
    type === 'error'   ? 'rgba(229,80,94,.4)' :
                         'rgba(0,112,242,.3)';
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 5000);
}

/* ══════════════════════════════════════════
   SCROLL: Nav, Sticky Tabs, GoTop
   ══════════════════════════════════════════ */
const leftTab  = document.getElementById('leftTab');
const rightTab = document.getElementById('rightTab');
const nav      = document.getElementById('nav');
const goTop    = document.getElementById('goTop');

window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  const show = sy > 300;
  leftTab  && leftTab.classList.toggle('show', show);
  rightTab && rightTab.classList.toggle('show', show);
  nav      && nav.classList.toggle('scrolled', sy > 50);
  goTop    && goTop.classList.toggle('show', sy > 400);
}, { passive:true });

/* ══════════════════════════════════════════
   BURGER MENU
   ══════════════════════════════════════════ */
const burger   = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger && burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks && navLinks.querySelectorAll('.nl').forEach(a =>
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    navLinks.classList.remove('open');
  })
);

/* ══════════════════════════════════════════
   ACTIVE NAV ON SCROLL
   ══════════════════════════════════════════ */
document.querySelectorAll('section[id]').forEach(sec => {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        document.querySelectorAll('.nl').forEach(a =>
          a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)
        );
      }
    });
  }, { threshold:.35 }).observe(sec);
});

/* ══════════════════════════════════════════
   SMOOTH SCROLL
   ══════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior:'smooth' });
  });
});
goTop && goTop.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

/* ══════════════════════════════════════════
   SCROLL REVEAL (.rv elements)
   ══════════════════════════════════════════ */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); }
  });
}, { threshold:.1 });
document.querySelectorAll('.rv').forEach(el => revObs.observe(el));

/* ══════════════════════════════════════════
   COUNTER ANIMATION
   ══════════════════════════════════════════ */
document.querySelectorAll('[data-count]').forEach(el => {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const max  = parseInt(e.target.dataset.count, 10);
      const suf  = max === 100 ? '%' : '+';
      let   cur  = 0;
      const step = Math.ceil(max / 55);
      const t = setInterval(() => {
        cur = Math.min(cur + step, max);
        e.target.textContent = cur + suf;
        if (cur >= max) clearInterval(t);
      }, 26);
    });
  }, { threshold:.5 }).observe(el);
});

/* ══════════════════════════════════════════
   SLA BARS
   ══════════════════════════════════════════ */
document.querySelectorAll('.sla-panel').forEach(b => {
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting)
        e.target.querySelectorAll('.sla-fill').forEach(f => f.classList.add('go'));
    });
  }, { threshold:.4 }).observe(b);
});

/* ══════════════════════════════════════════
   3D TILT on cards
   ══════════════════════════════════════════ */
document.querySelectorAll('[data-tilt], .proj-card, .why-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - .5) * 14;
    const y = ((e.clientY - r.top)  / r.height - .5) * 14;
    card.style.transform   = `perspective(900px) rotateX(${(-y).toFixed(1)}deg) rotateY(${x.toFixed(1)}deg) translateY(-6px)`;
    card.style.transition  = 'transform .08s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform  = '';
    card.style.transition = 'transform .5s ease, box-shadow .3s ease, border-color .3s ease';
  });
});

/* ══════════════════════════════════════════
   GLASS CARD mouse parallax
   ══════════════════════════════════════════ */
const gcCards = document.querySelectorAll('.glass-card');
document.addEventListener('mousemove', e => {
  const mx = (e.clientX / window.innerWidth  - .5);
  const my = (e.clientY / window.innerHeight - .5);
  gcCards.forEach((gc, i) => {
    const depth = .5 + i * .25;
    gc.style.transform = `perspective(600px) rotateX(${my * 6 * depth}deg) rotateY(${-mx * 8 * depth}deg) translateY(${-my * 12 * depth}px)`;
    gc.style.transition = 'transform .1s ease';
  });
});

/* ══════════════════════════════════════════
   CONTACT FORM — MAILTO
   ══════════════════════════════════════════ */
const form = document.getElementById('contactForm');
if (form) {
  const G = id => document.getElementById(id);

  const rules = [
    { id:'senderName',    errId:'nameErr',  check: v => v.trim().length >= 2   || 'Please enter your full name (min 2 chars).' },
    { id:'senderEmail',   errId:'emailErr', check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Please enter a valid email.' },
    { id:'senderTopic',   errId:'topicErr', check: v => v !== ''               || 'Please select a consulting topic.' },
    { id:'senderMessage', errId:'msgErr',   check: v => v.trim().length >= 10  || 'Please add more detail (min 10 chars).' },
  ];

  rules.forEach(({ id, errId }) => {
    const el = G(id);
    if (el) {
      ['input','change'].forEach(ev =>
        el.addEventListener(ev, () => { const e = G(errId); if (e) e.textContent = ''; })
      );
    }
  });

  form.addEventListener('submit', function(ev) {
    ev.preventDefault();
    let ok = true;
    rules.forEach(({ id, errId, check }) => {
      const el = G(id), errEl = G(errId);
      if (!el) return;
      const result = check(el.value);
      if (result !== true) { if (errEl) errEl.textContent = result; ok = false; }
      else { if (errEl) errEl.textContent = ''; }
    });
    if (!ok) { showToast('error', '⚠️', 'Please fill in all required fields.'); return; }

    const name    = G('senderName').value.trim();
    const email   = G('senderEmail').value.trim();
    const topic   = G('senderTopic').value;
    const message = G('senderMessage').value.trim();
    const phone   = G('senderPhone')?.value.trim()   || '';
    const company = G('senderCompany')?.value.trim() || '';

    const TO      = 'astechcore1986@gmail.com';
    const CC      = encodeURIComponent(email);
    const SUBJECT = encodeURIComponent(`SAP Consulting Enquiry — ${name}`);
    const BODY    = encodeURIComponent(
      `Hello Anil,\n\nNew SAP consulting enquiry from your ASTech website:\n\n` +
      `─────────────────────────────\n` +
      `Name    : ${name}\nEmail   : ${email}\n` +
      (phone   ? `Phone   : ${phone}\n`   : '') +
      (company ? `Company : ${company}\n` : '') +
      `Topic   : ${topic}\n─────────────────────────────\n\n` +
      `Message :\n${message}\n\n─────────────────────────────\n` +
      `Sent via ASTech Core Innovation website`
    );

    const btn = document.getElementById('submitBtn');
    const origHTML = btn.innerHTML;
    btn.innerHTML = `<span class="btn-text" style="opacity:.7">Opening mail app…</span><span style="animation:btnSpin .8s linear infinite;display:inline-block">↻</span>`;
    btn.disabled  = true;

    if (!document.getElementById('btnSpinKF')) {
      const s = document.createElement('style');
      s.id = 'btnSpinKF';
      s.textContent = '@keyframes btnSpin{to{transform:rotate(360deg)}}';
      document.head.appendChild(s);
    }

    setTimeout(() => {
      window.location.href = `mailto:${TO}?cc=${CC}&subject=${SUBJECT}&body=${BODY}`;
      btn.innerHTML = origHTML;
      btn.disabled  = false;
      form.reset();
      showToast('success', '✅', 'Mail app opened! Just hit Send to reach Anil.');
    }, 900);
  });
}

/* ══════════════════════════════════════════
   CURSOR TRAIL (subtle glow dot)
   ══════════════════════════════════════════ */
(function cursorGlow() {
  if (window.innerWidth < 768) return;
  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position:fixed; width:10px; height:10px;
    border-radius:50%; background:rgba(0,168,225,.55);
    pointer-events:none; z-index:9998;
    transform:translate(-50%,-50%);
    transition:transform .12s ease, opacity .3s;
    box-shadow:0 0 14px rgba(0,168,225,.4);
  `;
  document.body.appendChild(cursor);
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });
})();
