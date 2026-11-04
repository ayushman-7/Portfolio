/**
 * Ayushman Tripathi — Personal Portfolio
 * Motion, 3D Physics & Interactivity Engine (Precisely Replicating iritiksingh.in)
 */

document.addEventListener('DOMContentLoaded', () => {

  const isTouchDevice = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  // ─────────── 1. INITIAL CONCENTRIC RIPPLE LOADER ───────────
  const loader = document.getElementById('loader');
  const MIN_LOADER_MS = 1400;
  const EXIT_DURATION_MS = 1100;
  const loadStartTime = performance.now();

  const completeLoader = () => {
    if (!loader) return;
    const elapsed = performance.now() - loadStartTime;
    const remainingWait = Math.max(0, MIN_LOADER_MS - elapsed);

    setTimeout(() => {
      loader.classList.add('exiting');
      setTimeout(() => {
        loader.classList.add('gone');
        document.body.style.overflow = '';
      }, EXIT_DURATION_MS);
    }, remainingWait);
  };

  document.body.style.overflow = 'hidden';

  if (document.readyState === 'complete') {
    completeLoader();
  } else {
    window.addEventListener('load', completeLoader);
    setTimeout(completeLoader, 3500); // safety fallback
  }

  // ─────────── 2. SCROLL PROGRESS BAR & NAV STUCK CONTROLLER ───────────
  const scrollProgressBar = document.getElementById('scrollProgressBar');
  const navWrap = document.querySelector('.nav-wrap');

  const handleGlobalScroll = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPct = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${Math.min(100, Math.max(0, scrollPct))}%`;
    }

    if (navWrap) {
      if (window.scrollY > 28) {
        navWrap.classList.add('stuck');
      } else {
        navWrap.classList.remove('stuck');
      }
    }
  };

  window.addEventListener('scroll', handleGlobalScroll, { passive: true });
  handleGlobalScroll();

  // ─────────── 3. 3D FIERY TUBE CURSOR (THREE.JS / CANVAS FALLBACK) ───────────
  const tubeCanvas = document.getElementById('tube-canvas');
  let tubeApp = null;

  const TUBE_PALETTES = {
    orange: {
      tubes: ['#E03A00', '#FF5C1A', '#FF8A3D', '#FFA672', '#FFCC80'],
      lights: ['#D94E0E', '#FF6A2C', '#FF8533', '#FFB87A', '#FFD89E', '#E8B86F'],
    },
    orangeLight: {
      tubes: ['#E03A00', '#FF5C1A', '#FF7A3C', '#FFA060', '#FFC08A'],
      lights: ['#D94E0E', '#FF6A2C', '#FF8A4A', '#FFB070', '#F59E4B', '#E8B86F'],
    }
  };

  // High-performance canvas fallback if ThreeJS module is offline
  function initCanvasFlameFallback(canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };
    window.addEventListener('mousemove', (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    });

    const NUM_TUBES = 5;
    const TRAIL_LENGTH = 36;
    const tubeColors = ['#E03A00', '#FF5C1A', '#FF8A3D', '#FFA672', '#FFCC80'];
    const tubeLightColors = ['#D94E0E', '#FF6A2C', '#FF8533', '#FFB87A', '#E8B86F'];

    const tubes = Array.from({ length: NUM_TUBES }, (_, i) => ({
      angle: (i * Math.PI * 2) / NUM_TUBES,
      radius: 30 + (i % 3) * 14,
      speed: 0.038 + (i * 0.007),
      thickness: 9 + (i % 3) * 3,
      history: [],
      color: tubeColors[i % tubeColors.length],
      light: tubeLightColors[i % tubeLightColors.length],
      wobbleSpeed: 0.045 + i * 0.015,
      tilt: 0.58 + i * 0.18
    }));

    let time = 0;
    function renderFlame() {
      ctx.clearRect(0, 0, width, height);
      time += 1;

      mouse.x += (mouse.targetX - mouse.x) * 0.22;
      mouse.y += (mouse.targetY - mouse.y) * 0.22;

      tubes.forEach((t) => {
        t.angle += t.speed;
        const wobble = Math.sin(time * t.wobbleSpeed) * 8;
        const r = t.radius + wobble;
        const ox = mouse.x + Math.cos(t.angle) * r;
        const oy = mouse.y + Math.sin(t.angle) * r * t.tilt;

        t.history.unshift({ x: ox, y: oy });
        if (t.history.length > TRAIL_LENGTH) t.history.pop();

        if (t.history.length > 2) {
          ctx.save();
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          // Outer fiery aura
          for (let j = 0; j < t.history.length - 1; j++) {
            const pt1 = t.history[j];
            const pt2 = t.history[j + 1];
            const progress = 1 - (j / t.history.length);

            ctx.beginPath();
            ctx.moveTo(pt1.x, pt1.y);
            ctx.lineTo(pt2.x, pt2.y);
            ctx.strokeStyle = t.color;
            ctx.globalAlpha = progress * 0.45;
            ctx.lineWidth = t.thickness * progress * 2.2;
            ctx.shadowColor = t.light;
            ctx.shadowBlur = 18 * progress;
            ctx.stroke();

            // Dense inner glowing filament
            ctx.beginPath();
            ctx.moveTo(pt1.x, pt1.y);
            ctx.lineTo(pt2.x, pt2.y);
            ctx.strokeStyle = t.light;
            ctx.globalAlpha = progress * 0.85;
            ctx.lineWidth = t.thickness * progress;
            ctx.shadowBlur = 8 * progress;
            ctx.stroke();
          }
          ctx.restore();
        }
      });

      requestAnimationFrame(renderFlame);
    }
    renderFlame();
  }

  async function initTubeCursor() {
    if (!tubeCanvas || isTouchDevice) return;

    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    const palette = currentTheme === 'light' ? TUBE_PALETTES.orangeLight : TUBE_PALETTES.orange;

    try {
      const mod = await import(
        /* webpackIgnore: true */
        'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js'
      );
      const Ctor = mod.default || mod;
      tubeApp = Ctor(tubeCanvas, {
        tubes: {
          colors: palette.tubes,
          lights: { intensity: 120, colors: palette.lights },
        },
      });

      const onResize = () => {
        window.dispatchEvent(new Event('resize'));
      };
      window.addEventListener('resize', onResize);
    } catch (err) {
      console.warn('ThreeJS tube cursor offline, running high-fidelity 2D flame fallback:', err);
      initCanvasFlameFallback(tubeCanvas);
    }
  }

  initTubeCursor();

  // ─────────── 4. CUSTOM GLOW CURSOR & ABSORPTION HOOKS ───────────
  const cursorGlow = document.getElementById('cc-cursor-glow');
  const cursorDot = document.getElementById('cc-cursor-dot');
  let cursorIdleTimer = null;

  if (!isTouchDevice && cursorGlow && cursorDot) {
    window.addEventListener('mousemove', (e) => {
      const { clientX: x, clientY: y } = e;

      cursorGlow.style.left = `${x}px`;
      cursorGlow.style.top = `${y}px`;
      cursorGlow.style.opacity = '1';

      cursorDot.style.left = `${x}px`;
      cursorDot.style.top = `${y}px`;
      cursorDot.style.opacity = '1';

      clearTimeout(cursorIdleTimer);
      cursorIdleTimer = setTimeout(() => {
        cursorGlow.style.opacity = '0';
      }, 200);
    });

    document.addEventListener('mouseleave', () => {
      cursorGlow.style.opacity = '0';
      cursorDot.style.opacity = '0';
    });
  }

  // Vicinity detection: 32px halo around case cards triggers partial dim & blur
  const VICINITY_PX = 32;
  const handleNearCard = (e) => {
    if (document.body.hasAttribute('data-on-card')) return;
    const cards = document.querySelectorAll('.case-card, .about-frame');
    let minDist = Infinity;
    cards.forEach((card) => {
      const r = card.getBoundingClientRect();
      const cx = Math.max(r.left, Math.min(e.clientX, r.right));
      const cy = Math.max(r.top, Math.min(e.clientY, r.bottom));
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (dist < minDist) minDist = dist;
    });

    if (minDist < VICINITY_PX) {
      document.body.setAttribute('data-near-card', 'true');
    } else {
      document.body.removeAttribute('data-near-card');
    }
  };
  window.addEventListener('mousemove', handleNearCard, { passive: true });

  // Method & Bento card hover cursor override
  const methodCards = document.querySelectorAll('.method-card, .bento-card');
  methodCards.forEach((c) => {
    c.addEventListener('mouseenter', () => {
      document.body.setAttribute('data-on-method-card', 'true');
    });
    c.addEventListener('mouseleave', () => {
      document.body.removeAttribute('data-on-method-card');
    });
  });

  // ─────────── 5. 3D CARD PERSPECTIVE TILT & SCROLL-IN REVEAL ───────────
  const cards3D = document.querySelectorAll('.case-card, .about-frame');
  cards3D.forEach((card) => {
    card.__3d = {
      isHovered: false,
      mx: 0,
      my: 0,
      revealStart: null,
    };

    card.addEventListener('mouseenter', () => {
      card.__3d.isHovered = true;
      document.body.setAttribute('data-on-card', 'true');
      card.style.setProperty('--hover', '1');
    });

    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;

      card.__3d.mx = (x - r.width / 2) / (r.width / 2);
      card.__3d.my = (y - r.height / 2) / (r.height / 2);

      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.__3d.isHovered = false;
      card.__3d.mx = 0;
      card.__3d.my = 0;
      document.body.removeAttribute('data-on-card');
      card.style.setProperty('--hover', '0');
    });
  });

  // Global rAF loop: Scroll Reveal (easeOutCubic 40px -> 0) + 3D Tilt / Idle Sway
  const PUSH_DEG = 7;
  const CASE_REVEAL_MS = 700;
  const easeOutCubic = (p) => 1 - Math.pow(1 - p, 3);

  const tick3D = (t) => {
    cards3D.forEach((el) => {
      const s = el.__3d;
      if (!s) return;

      // Scroll-in reveal calculation
      let revealY = 40;
      let revealOpacity = 0;
      if (s.revealStart === null) {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.82 && r.bottom > 0) {
          s.revealStart = t;
        }
      }
      if (s.revealStart !== null) {
        const p = Math.min(1, (t - s.revealStart) / CASE_REVEAL_MS);
        const e = easeOutCubic(p);
        revealOpacity = e;
        revealY = 40 * (1 - e);
      }
      el.style.opacity = String(revealOpacity.toFixed(3));

      // 3D Matrix transform folding reveal translateY with rotation/Z-push
      if (isTouchDevice) {
        el.style.transform = `perspective(3000px) translateY(${revealY.toFixed(2)}px)`;
      } else if (s.isHovered) {
        const rx = s.my * PUSH_DEG;
        const ry = -s.mx * PUSH_DEG;
        el.style.transform = `perspective(3000px) translateY(${revealY.toFixed(2)}px) translateZ(-22px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      } else {
        const rx = Math.sin(t / 2400) * 2.2;
        const ry = Math.sin(t / 2800) * 2.8;
        const rz = Math.sin(t / 3800) * 0.8;
        el.style.transform = `perspective(3000px) translateY(${revealY.toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;
      }
    });

    requestAnimationFrame(tick3D);
  };
  requestAnimationFrame(tick3D);

  // ─────────── 6. EXPERIENCE TIMELINE SCROLL-IN REVEAL ───────────
  const expRows = document.querySelectorAll('[data-exp-reveal]');
  const expTriggers = new Map();
  const EXP_DURATION = 700;

  const expTick = () => {
    const now = performance.now();
    expRows.forEach((row) => {
      if (!expTriggers.has(row)) {
        const rect = row.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.82 && rect.bottom > 0) {
          expTriggers.set(row, now);
        } else if (rect.top >= window.innerHeight * 0.82) {
          row.style.opacity = '0';
          row.style.transform = 'translateY(40px)';
          return;
        }
      }
      const t = now - expTriggers.get(row);
      const p = Math.min(1, t / EXP_DURATION);
      const e = easeOutCubic(p);
      row.style.opacity = String(e.toFixed(3));
      row.style.transform = `translateY(${(40 * (1 - e)).toFixed(2)}px)`;
    });
    requestAnimationFrame(expTick);
  };
  requestAnimationFrame(expTick);

  // ─────────── 7. ABOUT SECTION 5-ITEM STAGGER & SIGNATURE WIPE ───────────
  let aboutTriggerTime = null;
  const checkAboutReveal = () => {
    if (aboutTriggerTime !== null) return;
    const sec = document.querySelector('[data-about-section]');
    if (!sec) return;
    const rect = sec.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.78 && rect.bottom > 0) {
      aboutTriggerTime = performance.now();
    }
  };
  window.addEventListener('scroll', checkAboutReveal, { passive: true });
  requestAnimationFrame(checkAboutReveal);

  const STAGGER_DELAYS = [0, 150, 300, 450, 600];
  const ITEM_DURATION = 750;
  const SIG_DELAY = 450;
  const SIG_DURATION = 1500;

  const aboutTick = () => {
    if (aboutTriggerTime !== null) {
      const elapsed = performance.now() - aboutTriggerTime;

      document.querySelectorAll('[data-about-anim]').forEach((el) => {
        const i = parseInt(el.getAttribute('data-stagger'), 10) || 0;
        const delay = STAGGER_DELAYS[i] || 0;
        const itemElapsed = Math.max(0, elapsed - delay);
        const p = Math.min(1, itemElapsed / ITEM_DURATION);
        const e = easeOutCubic(p);
        el.style.opacity = String(e.toFixed(3));
        el.style.transform = `translateY(${(20 * (1 - e)).toFixed(2)}px)`;
      });

      const sig = document.getElementById('sigClip');
      if (sig) {
        const sigElapsed = Math.max(0, elapsed - SIG_DELAY);
        const sp = Math.min(1, sigElapsed / SIG_DURATION);
        if (sp >= 1) {
          sig.style.clipPath = 'none';
          sig.style.webkitClipPath = 'none';
        } else {
          const se = easeOutCubic(sp);
          const inset = (100 * (1 - se)).toFixed(2);
          const val = `inset(0 ${inset}% 0 0)`;
          sig.style.clipPath = val;
          sig.style.webkitClipPath = val;
        }
      }
    }
    requestAnimationFrame(aboutTick);
  };
  requestAnimationFrame(aboutTick);

  // ─────────── 8. INTERACTIVE APM PRD MODAL ───────────
  const prdDatabase = {
    metamind: {
      badge: '0-TO-1 APM CASE STUDY // AGENTIC AI',
      title: 'MetaMind AI: Autonomous Enterprise Knowledge Discovery via Agentic RAG Workflows',
      role: 'Product Lead / APM Owner',
      timeline: '2026',
      tag: 'Agentic RAG · Enterprise KT',
      problem: `In enterprise engineering teams, institutional knowledge is fractured across siloed Confluence pages, Jira tickets, Git commit histories, and fragmented Slack conversations. Developers report spending an average of 3.5+ hours each week searching for architectural context, leading to prolonged onboarding cycles and duplicated technical implementations.`,
      persona: `Primary: Mid-to-senior software engineers ramping onto unfamiliar microservice codebases.<br>Secondary: Technical Program Managers and Engineering Leads needing immediate auditability into architectural decisions without interrupting on-call developers.`,
      solution: `Designed a 0-to-1 Agentic Retrieval-Augmented Generation (RAG) system. Rather than relying on naive semantic search, the product decomposes complex questions into intent-specific sub-queries, executes parallel searches across hybrid dense-sparse vector databases, and validates citations through an automated hallucination verification guardrail before presenting actionable answers to the developer.`,
      metrics: [
        { val: '99.4%', label: 'FACTUAL RETRIEVAL PRECISION' },
        { val: '<2.8s', label: 'P95 QUERY SYNTHESIS LATENCY' },
        { val: '84%', label: 'REDUCTION IN REPETITIVE KT REQUESTS' }
      ],
      learnings: `Agentic workflows dramatically outperform static embeddings when resolving multi-step technical inquiries. By defining clear non-goals (e.g. strict refusal when confidence drops below 85%), we eliminated developer distrust and drove rapid bottom-up team adoption.`
    },
    mobility: {
      badge: '0-TO-1 PLATFORM LAUNCH // 12-WEEK GTM',
      title: 'Smart Mobility Platform: Enterprise Fleet & Telemetry Ecosystem',
      role: 'Product Development Intern (Yantrovaa)',
      timeline: '12 Weeks (2025)',
      tag: 'IoT Telemetry · Mobility SaaS',
      problem: `Fleet mobility operators faced severe 3–5 second latency lags in processing vehicle telemetry data. This latency led to missed geofence crossing triggers, delayed trip billing calculations, and excessive battery drain on onboard hardware modules.`,
      persona: `Fleet Ops Managers managing vehicle availability in real time, and end-riders seeking seamless mobile booking and transparent, real-time trip pricing.`,
      solution: `Authored comprehensive PRDs coordinating three simultaneous engineering tracks: driver mobile apps, operator admin command centers, and scalable ingestion backends. Re-architected data ingestion using lightweight MQTT protocols and streamlined payment webhooks, completing the full MVP deployment within a strict 12-week release window.`,
      metrics: [
        { val: '40%', label: 'LATENCY IMPROVEMENT (<850ms)' },
        { val: '12 Wks', label: '0-TO-1 GTM AGILE DELIVERY' },
        { val: '99.9%', label: 'PAYMENT PIPELINE SUCCESS RATE' }
      ],
      learnings: `Hardware-software integration requires ruthless prioritization. By establishing strict MVP acceptance criteria and freezing non-critical dashboard filters, we preserved the launch date without compromising telemetry reliability.`
    },
    devex: {
      badge: 'DEVEX STRATEGY // PLATFORM AUTOMATION',
      title: 'Automating Technical Onboarding & Pre-flight Deployments',
      role: 'Software Engineer (Volkswagen Group Digital Solutions India)',
      timeline: 'Nov 2025 — Present',
      tag: 'Cloud Native · Developer Experience',
      problem: `New engineers joining enterprise automotive platform teams spent between 3 to 4 weeks navigating complex internal credential structures, local Kubernetes configuration mismatches, and failed pre-flight CI/CD pipelines before shipping their first production commit.`,
      persona: `Enterprise developers, DevOps engineers, and cloud infrastructure maintainers across globally distributed automotive engineering hubs.`,
      solution: `Conceptualized and engineered an internal developer experience suite featuring an AI-assisted conversational Knowledge Transfer (KT) assistant and an automated pre-flight CLI verification tool. The tool runs automated checks against environment permissions, secrets, and cluster readiness, flagging exact remediation steps instantly.`,
      metrics: [
        { val: '65%', label: 'ACCELERATION IN RAMP-UP TIME' },
        { val: '1–2 Wks', label: 'DOWN FROM 1 MONTH ONBOARDING' },
        { val: '80%', label: 'DROP IN TIER-1 DEVOPS SUPPORT TICKETS' }
      ],
      learnings: `Treating internal developers as customers yields massive compounding ROI. High-friction operational workflows are fundamentally product design challenges that can be eliminated through automated diagnostics.`
    }
  };

  const modal = document.getElementById('prdModal');
  const modalContent = document.getElementById('modalContent');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  const openPrdModal = (key) => {
    const data = prdDatabase[key];
    if (!data || !modal || !modalContent) return;

    modalContent.innerHTML = `
      <div class="prd-header">
        <div class="prd-badge">${data.badge}</div>
        <h2 class="prd-title">${data.title}</h2>
        <div class="prd-meta-row">
          <span><strong>Role:</strong> ${data.role}</span>
          <span>·</span>
          <span><strong>Cadence:</strong> ${data.timeline}</span>
          <span>·</span>
          <span><strong>Focus:</strong> ${data.tag}</span>
        </div>
      </div>

      <div class="prd-section">
        <div class="prd-section-title">01 / The Problem Opportunity</div>
        <p class="prd-text">${data.problem}</p>
      </div>

      <div class="prd-section">
        <div class="prd-section-title">02 / Target Personas</div>
        <p class="prd-text">${data.persona}</p>
      </div>

      <div class="prd-section">
        <div class="prd-section-title">03 / Solution &amp; MVP Scope</div>
        <p class="prd-text">${data.solution}</p>
      </div>

      <div class="prd-section">
        <div class="prd-section-title">04 / Quantified Business Impact</div>
        <div class="prd-metrics-grid">
          ${data.metrics.map(m => `
            <div class="prd-metric-card">
              <div class="prd-metric-val">${m.val}</div>
              <div class="prd-metric-label">${m.label}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="prd-section" style="margin-bottom: 0;">
        <div class="prd-section-title">05 / Key Product Takeaways</div>
        <p class="prd-text">${data.learnings}</p>
      </div>
    `;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closePrdModal = () => {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('[data-open-modal]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetKey = btn.getAttribute('data-open-modal');
      openPrdModal(targetKey);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closePrdModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePrdModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closePrdModal();
    }
  });

  // ─────────── 9. THEME TOGGLE (DARK / LIGHT) ───────────
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');

  const applyTheme = (theme) => {
    document.body.setAttribute('data-theme', theme);
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '☾' : '☀';
    }
    try {
      localStorage.setItem('site-theme', theme);
    } catch (_) {}
  };

  let savedTheme = 'dark';
  try {
    savedTheme = localStorage.getItem('site-theme') || 'dark';
  } catch (_) {}
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  // ─────────── 10. LIVE LOCAL TIME (PUNE, IN) ───────────
  const seenAtText = document.getElementById('seenAtText');
  const updateSeenAt = () => {
    if (!seenAtText) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
      hour12: true
    });
    seenAtText.textContent = `Seen at Pune · ${timeStr} IST`;
  };
  updateSeenAt();
  setInterval(updateSeenAt, 60000);

  // ─────────── 11. CLICK TO COPY EMAIL ───────────
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const copyBadge = document.getElementById('copyBadge');

  if (copyEmailBtn && copyBadge) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = copyEmailBtn.getAttribute('data-email') || 'ayushmantripathi1@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
        copyBadge.textContent = 'Copied to Clipboard! ✓';
        copyBadge.style.background = '#10b981';
        setTimeout(() => {
          copyBadge.textContent = 'Click to Copy ❐';
          copyBadge.style.background = 'var(--accent)';
        }, 2500);
      } catch (_) {
        window.location.href = `mailto:${email}`;
      }
    });
  }

  // ─────────── 12. MOBILE HAMBURGER MENU ───────────
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = hamburgerBtn.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

});
