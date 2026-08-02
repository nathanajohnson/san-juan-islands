/**
 * Whale traffic simulation — "Chart & Current" painted strait.
 * Stylized seasonal patterns (not real-time AIS). Educational approximation.
 * The canvas paints a full bathymetric scene on load; play animates a year.
 */
(function () {
  const MONTH_ACTIVITY = {
    // Relative presence 0–1 for residents in inland waters (peak summer)
    residents: [0.15, 0.2, 0.35, 0.5, 0.75, 0.95, 1.0, 0.95, 0.85, 0.55, 0.3, 0.18],
    biggs: [0.7, 0.65, 0.6, 0.55, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.75],
    ships: [0.7, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 0.95, 0.9, 0.85, 0.8, 0.75]
  };

  // Logical chart space — matches SJI.geoToCanvas (48.40–48.80 N, 123.30–122.70 W)
  const W = 1200, H = 640;

  let canvas, ctx, wrap;
  let animId = null, ambientId = null;
  let playing = false;
  let month = 0;
  let t = 0;        // simulation clock (advances only while playing)
  let wob = 0;      // ambient clock (currents, bob, spouts)
  let speed = 1;
  let focusPod = null;
  let liveSightings = [];
  let pulseId = null, pulseUntil = 0;
  let dpr = 1, scale = 1, cssW = W;
  let base = null, bctx = null, baseKey = "";
  let inView = true;
  const reduceMotion = !!(window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  // ---------- Geography (projected from real lat/lng via geoToCanvas bounds) ----------
  const ISLANDS = [
    { name: "vancouver", pts: [[-90, 110], [-8, 118], [34, 192], [48, 300], [32, 420], [54, 540], [22, 650], [-90, 662]] },
    { name: "gulf-edge", pts: [[-60, 28], [42, 8], [142, 26], [172, 64], [92, 88], [-18, 84]] },
    { name: "lummi", pts: [[1082, 22], [1180, -12], [1290, 8], [1290, 140], [1198, 150], [1098, 96]] },
    { name: "fidalgo", pts: [[1142, 430], [1232, 404], [1290, 450], [1290, 700], [1150, 700], [1108, 560], [1122, 486]] },
    { name: "san-juan", pts: [[280, 304], [332, 292], [404, 300], [478, 322], [560, 368], [620, 424], [672, 556], [560, 540], [452, 512], [352, 482], [294, 450], [262, 382], [268, 330]] },
    { name: "orcas", pts: [[640, 170], [760, 150], [860, 140], [960, 160], [1000, 220], [980, 300], [900, 330], [850, 330], [840, 230], [800, 200], [780, 230], [790, 330], [720, 340], [640, 300], [610, 240]] },
    { name: "lopez", pts: [[760, 400], [850, 394], [910, 412], [935, 470], [1000, 556], [958, 600], [856, 590], [798, 540], [758, 470], [730, 428]] },
    { name: "shaw", pts: [[630, 322], [700, 312], [756, 330], [746, 362], [688, 372], [634, 354]] },
    { name: "stuart", pts: [[130, 168], [196, 152], [248, 168], [236, 200], [170, 208], [124, 190]] },
    { name: "waldron", pts: [[508, 140], [560, 124], [600, 144], [588, 182], [534, 190], [500, 166]] },
    { name: "spieden", pts: [[252, 286], [340, 272], [440, 276], [444, 292], [344, 300], [254, 298]] },
    { name: "sucia", pts: [[760, 60], [830, 44], [870, 58], [856, 80], [790, 86], [752, 76]] },
    { name: "blakely", pts: [[900, 352], [960, 342], [1012, 368], [1030, 428], [998, 450], [948, 440], [908, 400]] },
    { name: "decatur", pts: [[958, 480], [1018, 470], [1040, 512], [1016, 550], [962, 540], [938, 506]] },
    { name: "cypress", pts: [[1100, 300], [1160, 286], [1200, 320], [1190, 380], [1130, 396], [1092, 350]] }
  ];

  const SOUNDINGS = [
    [122, 178, "152"], [188, 468, "178"], [232, 82, "96"], [552, 244, "73"],
    [1064, 178, "45"], [1058, 600, "38"], [500, 602, "57"], [906, 82, "22"],
    [700, 480, "48"], [364, 220, "88"]
  ];

  const FERRY_PTS = [
    [1268, 428], [1150, 436], [1034, 462], [986, 452], [920, 424],
    [886, 398], [800, 382], [700, 380], [642, 410], [622, 428]
  ];

  const FLOW_LINES = [
    [96, -20, 148, 300, 90, 660], [188, -20, 232, 320, 176, 660],
    [252, 60, 226, 340, 262, 620], [1044, -20, 1012, 300, 1046, 660],
    [1090, 40, 1064, 340, 1096, 660], [340, 620, 520, 580, 700, 610],
    [560, 250, 610, 340, 660, 440]
  ];

  // ---------- Routes (through open water, matched to geography above) ----------
  function routePoint(route, u) {
    const pts = route;
    if (!pts || pts.length < 2) return [0, 0];
    let f = Number(u);
    if (!Number.isFinite(f)) f = 0;
    f = ((f % 1) + 1) % 1;
    const n = pts.length;
    const scaled = f * (n - 1);
    const i = Math.min(Math.floor(scaled), n - 2);
    const g = scaled - Math.floor(scaled);
    const a = pts[i], b = pts[i + 1];
    return [a[0] + (b[0] - a[0]) * g, a[1] + (b[1] - a[1]) * g];
  }

  const ROUTES = {
    j: [
      [220, 120], [200, 230], [210, 350], [240, 460], [290, 545], [380, 595],
      [300, 560], [250, 470], [222, 360], [206, 240], [226, 150], [220, 120]
    ],
    k: [
      [140, 80], [260, 110], [380, 150], [470, 210], [520, 268], [560, 330],
      [608, 390], [656, 458], [688, 538], [600, 600], [480, 590], [360, 600],
      [240, 560], [200, 450], [180, 330], [160, 200], [140, 80]
    ],
    l: [
      [110, 380], [150, 500], [240, 580], [380, 615], [520, 622], [640, 615],
      [560, 585], [420, 592], [280, 556], [190, 480], [140, 400], [110, 380]
    ],
    biggs: [
      [90, 50], [240, 80], [420, 100], [600, 90], [700, 60], [880, 96],
      [990, 140], [1036, 260], [1048, 400], [1070, 530], [960, 612], [840, 630],
      [940, 588], [1010, 480], [1018, 340], [1000, 200], [900, 130], [700, 108],
      [480, 78], [240, 58], [90, 50]
    ],
    biggsB: [
      [1062, 60], [1078, 180], [1060, 320], [1072, 440], [1080, 560], [1048, 646],
      [1062, 540], [1058, 430], [1052, 320], [1058, 180], [1062, 60]
    ],
    shipA: [[155, -30], [165, 140], [150, 320], [142, 500], [158, 690]],
    shipB: [[1076, -30], [1064, 150], [1072, 330], [1066, 510], [1076, 690]],
    ferry: FERRY_PTS
  };

  const pods = [
    { id: "j", color: "#5ba3c4", route: "j", phase: 0, speed: 0.012, size: 8, label: "J" },
    { id: "j2", color: "#5ba3c4", route: "j", phase: 0.05, speed: 0.012, size: 6 },
    { id: "j3", color: "#5ba3c4", route: "j", phase: 0.09, speed: 0.012, size: 5 },
    { id: "k", color: "#7eb87a", route: "k", phase: 0.3, speed: 0.01, size: 7, label: "K" },
    { id: "k2", color: "#7eb87a", route: "k", phase: 0.34, speed: 0.01, size: 5 },
    { id: "l", color: "#c4a35a", route: "l", phase: 0.5, speed: 0.009, size: 8, label: "L" },
    { id: "l2", color: "#c4a35a", route: "l", phase: 0.545, speed: 0.009, size: 6 },
    { id: "l3", color: "#c4a35a", route: "l", phase: 0.585, speed: 0.009, size: 5 },
    { id: "biggs", color: "#c45c6a", route: "biggs", phase: 0.2, speed: 0.008, size: 7, label: "T" },
    { id: "biggs2", color: "#c45c6a", route: "biggs", phase: 0.235, speed: 0.008, size: 5 },
    { id: "biggs3", color: "#c45c6a", route: "biggsB", phase: 0.62, speed: 0.009, size: 6 },
    { id: "biggs4", color: "#c45c6a", route: "biggsB", phase: 0.655, speed: 0.009, size: 5 }
  ];

  const ships = [
    { route: "shipA", kind: "cargo", phase: 0, speed: 0.004, w: 36, h: 9 },
    { route: "shipB", kind: "cargo", phase: 0.4, speed: 0.0035, w: 40, h: 10 },
    { route: "shipA", kind: "cargo", phase: 0.62, speed: 0.0045, w: 30, h: 8 },
    { route: "ferry", kind: "ferry", phase: 0.15, speed: 0.0035, w: 30, h: 9, pingpong: true }
  ];

  // ---------- Color helpers ----------
  function hexRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function lerpHex(a, b, f) {
    const A = hexRgb(a), B = hexRgb(b);
    const r = Math.round(A[0] + (B[0] - A[0]) * f);
    const g = Math.round(A[1] + (B[1] - A[1]) * f);
    const bl = Math.round(A[2] + (B[2] - A[2]) * f);
    return "rgb(" + r + "," + g + "," + bl + ")";
  }
  function shade(hex, f) {
    const c = hexRgb(hex);
    return "rgb(" + Math.round(c[0] * f) + "," + Math.round(c[1] * f) + "," + Math.round(c[2] * f) + ")";
  }
  // Seasonal light: 0 = deep winter steel, 1 = high-summer gold-teal
  function season(m) {
    return Math.pow(Math.max(0, Math.sin(Math.PI * (m + 0.5) / 12)), 1.35);
  }

  // ---------- Path helpers ----------
  function centroidOf(pts) {
    let cx = 0, cy = 0;
    pts.forEach(function (p) { cx += p[0]; cy += p[1]; });
    return [cx / pts.length, cy / pts.length];
  }
  function smoothPath(pts, sc, cx, cy) {
    sc = sc || 1; cx = cx || 0; cy = cy || 0;
    const P = pts.map(function (p) { return [cx + (p[0] - cx) * sc, cy + (p[1] - cy) * sc]; });
    const n = P.length;
    const mid = function (a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; };
    const path = new Path2D();
    let m = mid(P[n - 1], P[0]);
    path.moveTo(m[0], m[1]);
    for (let i = 0; i < n; i++) {
      const cur = P[i];
      const m2 = mid(cur, P[(i + 1) % n]);
      path.quadraticCurveTo(cur[0], cur[1], m2[0], m2[1]);
    }
    path.closePath();
    return path;
  }
  const spaced = function (s) { return s.split("").join(" "); };

  // ---------- Base scene (static per month+size, cached offscreen) ----------
  function ensureBase() {
    const key = canvas.width + "x" + canvas.height + ":" + month;
    if (base && baseKey === key) return;
    if (!base) {
      base = document.createElement("canvas");
      bctx = base.getContext("2d");
    }
    base.width = canvas.width;
    base.height = canvas.height;
    bctx.setTransform(scale, 0, 0, scale, 0, 0);
    paintBase(bctx, month);
    baseKey = key;
  }

  function paintBase(g, m) {
    const s = season(m);

    // Water: seasonal gradient — winter steel to summer gold-teal
    const grd = g.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, lerpHex("#2c3d49", "#11505a", s));
    grd.addColorStop(0.45, lerpHex("#192b39", "#0d3849", s));
    grd.addColorStop(1, lerpHex("#0a1521", "#071823", s));
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);

    // Summer light sheen on the surface
    if (s > 0.05) {
      const sheen = g.createLinearGradient(0, 0, 0, H * 0.4);
      sheen.addColorStop(0, "rgba(233,190,105," + (0.11 * s).toFixed(3) + ")");
      sheen.addColorStop(1, "rgba(233,190,105,0)");
      g.fillStyle = sheen;
      g.fillRect(0, 0, W, H * 0.4);
    }

    // Deep channels — Haro (west) markedly deeper, Rosario (east), San Juan Channel
    [[40, 280, 0.55], [1014, 1124, 0.45], [582, 736, 0.25]].forEach(function (band) {
      const ch = g.createLinearGradient(band[0], 0, band[1], 0);
      ch.addColorStop(0, "rgba(2,8,15,0)");
      ch.addColorStop(0.5, "rgba(2,8,15," + band[2] + ")");
      ch.addColorStop(1, "rgba(2,8,15,0)");
      g.fillStyle = ch;
      g.fillRect(band[0], 0, band[1] - band[0], H);
    });

    // Depth contour lines through the channels (dashed chart isobaths)
    g.save();
    g.setLineDash([7, 9]);
    g.lineWidth = 1;
    g.strokeStyle = "rgba(127, 181, 170, 0.13)";
    [[100, -20, 148, 300, 94, 660], [196, -20, 236, 320, 184, 660],
     [1040, -20, 1008, 300, 1042, 660]].forEach(function (c) {
      g.beginPath();
      g.moveTo(c[0], c[1]);
      g.quadraticCurveTo(c[2], c[3], c[4], c[5]);
      g.stroke();
    });
    g.restore();

    // Shipping-lane rules (NOAA magenta, very faint) in Haro & Rosario
    g.save();
    g.setLineDash([14, 10]);
    g.lineWidth = 1;
    g.strokeStyle = "rgba(196, 92, 106, 0.14)";
    [[142, 166], [1056, 1084]].forEach(function (lane) {
      lane.forEach(function (x) {
        g.beginPath();
        g.moveTo(x, -10);
        g.quadraticCurveTo(x + 18, H / 2, x - 6, H + 10);
        g.stroke();
      });
    });
    g.restore();

    // Ferry route (WSF dashed line, Anacortes -> Friday Harbor)
    g.save();
    g.setLineDash([2, 8]);
    g.lineCap = "round";
    g.lineWidth = 1.6;
    g.strokeStyle = "rgba(126, 196, 156, 0.3)";
    g.beginPath();
    FERRY_PTS.forEach(function (p, i) {
      if (i === 0) g.moveTo(p[0], p[1]); else g.lineTo(p[0], p[1]);
    });
    g.stroke();
    g.restore();

    // Depth soundings (fathoms) scattered in the channels
    g.fillStyle = "rgba(158, 196, 212, 0.34)";
    g.font = "italic 500 10px 'JetBrains Mono', monospace";
    g.textAlign = "center";
    SOUNDINGS.forEach(function (sd) { g.fillText(sd[2], sd[0], sd[1]); });

    // Islands: shelf tint, contour rings, seasonal forest tones, shoreline glow
    const landTop = lerpHex("#31513f", "#3e6e54", s);
    const landMid = lerpHex("#243c30", "#2c503f", s);
    const landBot = lerpHex("#1a2c23", "#20392e", s);
    ISLANDS.forEach(function (isle) {
      const c = centroidOf(isle.pts);
      [[1.42, 0.06], [1.2, 0.1]].forEach(function (ring) {
        g.strokeStyle = "rgba(127, 181, 154, " + ring[1] + ")";
        g.lineWidth = 1;
        g.stroke(smoothPath(isle.pts, ring[0], c[0], c[1]));
      });
      g.fillStyle = "rgba(94, 150, 165, 0.1)";
      g.fill(smoothPath(isle.pts, 1.2, c[0], c[1]));

      const ys = isle.pts.map(function (p) { return p[1]; });
      const top = Math.min.apply(null, ys), bot = Math.max.apply(null, ys);
      const lg = g.createLinearGradient(0, top, 0, bot);
      lg.addColorStop(0, landTop);
      lg.addColorStop(0.6, landMid);
      lg.addColorStop(1, landBot);
      const body = smoothPath(isle.pts, 1, c[0], c[1]);
      g.fillStyle = lg;
      g.fill(body);
      g.fillStyle = "rgba(150, 190, 150, 0.09)";
      g.fill(smoothPath(isle.pts, 0.55, c[0], c[1] - 5));
      g.save();
      g.shadowColor = "rgba(140, 205, 175, 0.5)";
      g.shadowBlur = 5;
      g.strokeStyle = "rgba(140, 190, 160, 0.7)";
      g.lineWidth = 1.3;
      g.stroke(body);
      g.restore();
    });

    // Chart labels — land names in buff, water names in pale italic
    g.textAlign = "center";
    g.fillStyle = "rgba(242, 233, 216, 0.55)";
    g.font = "500 12px 'JetBrains Mono', monospace";
    g.fillText(spaced("SAN JUAN I."), 442, 432);
    g.fillText(spaced("ORCAS I."), 742, 250);
    g.fillText(spaced("LOPEZ"), 866, 496);
    g.font = "500 8px 'JetBrains Mono', monospace";
    g.fillStyle = "rgba(242, 233, 216, 0.4)";
    g.fillText(spaced("SHAW"), 692, 346);
    g.fillText(spaced("STUART"), 184, 184);
    g.fillText(spaced("WALDRON"), 552, 158);
    g.fillText(spaced("SUCIA"), 810, 68);
    g.fillText(spaced("CYPRESS"), 1146, 344);

    // Strait names run along their channels, chart-style
    g.fillStyle = "rgba(158, 196, 212, 0.42)";
    g.font = "italic 500 11px 'JetBrains Mono', monospace";
    g.save(); g.translate(150, 420); g.rotate(-Math.PI / 2);
    g.fillText(spaced("HARO STRAIT"), 0, 0); g.restore();
    g.save(); g.translate(1062, 400); g.rotate(-Math.PI / 2);
    g.fillText(spaced("ROSARIO STRAIT"), 0, 0); g.restore();
    g.save(); g.translate(300, 74); g.rotate(-0.22);
    g.fillText(spaced("BOUNDARY PASS"), 0, 0); g.restore();
    g.save(); g.translate(20, 470); g.rotate(-Math.PI / 2);
    g.fillStyle = "rgba(242, 233, 216, 0.42)";
    g.font = "500 10px 'JetBrains Mono', monospace";
    g.fillText(spaced("VANCOUVER I."), 0, 0); g.restore();

    g.fillStyle = "rgba(220, 235, 231, 0.26)";
    g.font = "500 8px 'JetBrains Mono', monospace";
    g.textAlign = "left";
    g.fillText("SOUNDINGS IN FATHOMS", 28, 46);

    // Painted vignette
    const vg = g.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05);
    vg.addColorStop(0, "rgba(2,8,14,0)");
    vg.addColorStop(1, "rgba(2,8,14,0.32)");
    g.fillStyle = vg;
    g.fillRect(0, 0, W, H);
  }

  // ---------- Init / sizing ----------
  function init() {
    canvas = document.getElementById("whale-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    wrap = canvas.parentElement;
    resize();
    window.addEventListener("resize", resize);
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(function () { resize(); });
      ro.observe(wrap);
    }
    if (window.IntersectionObserver) {
      const io = new IntersectionObserver(function (entries) {
        inView = entries[0] ? entries[0].isIntersecting : true;
        if (inView) {
          // The global reveal observer needs 12% of the tall .whale-sim block
          // visible before it unhides — on small screens that can leave the
          // chart invisible. Reveal it as soon as the canvas itself appears.
          const sim = document.getElementById("whale-sim");
          if (sim) sim.classList.add("visible");
          kickAmbient();
        }
      }, { rootMargin: "80px" });
      io.observe(wrap);
    }
    draw(0);
    kickAmbient();

    const play = document.getElementById("sim-play");
    const pause = document.getElementById("sim-pause");
    const scrub = document.getElementById("sim-scrub");
    const speedBtns = document.querySelectorAll(".speed-btn[data-speed]");
    const monthEl = document.getElementById("sim-month");

    play && play.addEventListener("click", function () {
      playing = true;
      play.hidden = true;
      if (pause) pause.hidden = false;
      loop();
    });
    pause && pause.addEventListener("click", function () {
      playing = false;
      pause.hidden = true;
      if (play) play.hidden = false;
      if (animId) cancelAnimationFrame(animId);
      kickAmbient();
    });
    scrub && scrub.addEventListener("input", function () {
      month = parseInt(scrub.value, 10);
      if (monthEl) monthEl.textContent = SJI.MONTHS[month];
      if (!playing) draw(t);
    });
    speedBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        speed = parseFloat(b.dataset.speed) || 1;
        speedBtns.forEach(function (x) {
          x.classList.toggle("active", x === b);
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
        });
      });
    });

    document.querySelectorAll("[data-focus-pod]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        focusPod = btn.dataset.focusPod;
        document.querySelectorAll(".pod-card").forEach(function (c) {
          c.classList.toggle("focused", c.dataset.pod === focusPod);
        });
        if (!playing) draw(t);
        setTimeout(function () {
          focusPod = null;
          document.querySelectorAll(".pod-card").forEach(function (c) { c.classList.remove("focused"); });
          if (!playing) draw(t);
        }, 4000);
      });
    });
  }

  function resize() {
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    cssW = Math.max(300, Math.round(rect.width));
    const cssH = Math.round(cssW * H / W);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = "100%";
    canvas.style.height = "auto";
    scale = canvas.width / W;
    baseKey = "";
    if (ctx) draw(t);
  }

  // ---------- Loops ----------
  function loop() {
    if (!playing) return;
    t += 0.016 * speed;
    wob += 0.016;
    const monthFloat = (t * 0.15) % 12;
    month = Math.floor(monthFloat);
    const scrub = document.getElementById("sim-scrub");
    const monthEl = document.getElementById("sim-month");
    if (scrub) scrub.value = month;
    if (monthEl) monthEl.textContent = SJI.MONTHS[month];
    draw(t);
    animId = requestAnimationFrame(loop);
  }

  // Ambient: currents drift + fins bob even before play (skipped for reduced motion)
  function kickAmbient() {
    if (playing || reduceMotion || !inView || ambientId) return;
    ambientId = requestAnimationFrame(ambient);
  }
  function ambient() {
    ambientId = null;
    if (playing || reduceMotion || !inView) return;
    wob += 0.016;
    draw(t);
    ambientId = requestAnimationFrame(ambient);
  }

  // ---------- Dynamic layers ----------
  function drawFlow() {
    ctx.save();
    ctx.lineWidth = 1.3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(140, 185, 205, 0.1)";
    ctx.setLineDash([3, 26]);
    FLOW_LINES.forEach(function (f, i) {
      ctx.lineDashOffset = -(wob * 5 + i * 9);
      ctx.beginPath();
      ctx.moveTo(f[0], f[1]);
      ctx.quadraticCurveTo(f[2], f[3], f[4], f[5]);
      ctx.stroke();
    });
    ctx.restore();
  }

  // Salmon-run glow along the west side of San Juan Island (summer, Residents)
  const SALMON_PTS = [[262, 340], [272, 410], [296, 472], [332, 518]];
  function drawSalmonGlow(resAct) {
    const a = 0.3 * resAct * season(month);
    if (a < 0.015) return;
    SALMON_PTS.forEach(function (p, i) {
      const pulse = 0.8 + 0.2 * Math.sin(wob * 0.5 + i * 1.7);
      const r = 66 + i * 6;
      const gl = ctx.createRadialGradient(p[0], p[1], 4, p[0], p[1], r);
      gl.addColorStop(0, "rgba(233, 180, 90, " + (a * pulse).toFixed(3) + ")");
      gl.addColorStop(0.55, "rgba(196, 163, 90, " + (a * 0.45 * pulse).toFixed(3) + ")");
      gl.addColorStop(1, "rgba(196, 163, 90, 0)");
      ctx.fillStyle = gl;
      ctx.beginPath();
      ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function tri(x) {
    const f = ((x % 1) + 1) % 1;
    return 1 - Math.abs(1 - 2 * f);
  }

  function drawShip(ship, time, shipAct) {
    const raw = ship.phase + time * ship.speed;
    const u = ship.pingpong ? tri(raw) : ((raw % 1) + 1) % 1;
    const u1 = Math.min(u, 0.995);
    const u2raw = ship.pingpong ? tri(raw + 0.004) : u1 + 0.008;
    const p1 = routePoint(ROUTES[ship.route], u1);
    const p2 = routePoint(ROUTES[ship.route], Math.min(u2raw, 0.999));
    const angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
    const alpha = (0.4 + shipAct * 0.5) * (focusPod ? 0.2 : 1);
    const w = ship.w, h = ship.h;

    ctx.save();
    ctx.translate(p1[0], p1[1]);
    ctx.rotate(angle);

    // Wake: diverging vees + foam line astern
    ctx.globalAlpha = alpha * 0.35;
    ctx.strokeStyle = "rgba(168, 213, 229, 0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-w / 2, 0); ctx.quadraticCurveTo(-w / 2 - 20, -3, -w / 2 - 44, -8);
    ctx.moveTo(-w / 2, 0); ctx.quadraticCurveTo(-w / 2 - 20, 3, -w / 2 - 44, 8);
    ctx.stroke();
    ctx.globalAlpha = alpha * 0.2;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(-w / 2 - 2, 0); ctx.lineTo(-w / 2 - 34, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.globalAlpha = alpha;
    if (ship.kind === "ferry") {
      // WSF ferry: white double-ended hull, green stripe, cabin
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.lineTo(-w * 0.3, -h / 2); ctx.lineTo(w * 0.3, -h / 2);
      ctx.lineTo(w / 2, 0);
      ctx.lineTo(w * 0.3, h / 2); ctx.lineTo(-w * 0.3, h / 2);
      ctx.closePath();
      ctx.fillStyle = "#e6ebe7";
      ctx.fill();
      ctx.strokeStyle = "rgba(15, 81, 50, 0.9)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "#0f5132";
      ctx.fillRect(-w * 0.24, -1.2, w * 0.48, 2.4);
    } else {
      // Cargo: dark hull, pointed bow, pale aft superstructure, deck hatches
      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 2);
      ctx.lineTo(w * 0.28, -h / 2);
      ctx.lineTo(w / 2, 0);
      ctx.lineTo(w * 0.28, h / 2);
      ctx.lineTo(-w / 2, h / 2);
      ctx.closePath();
      ctx.fillStyle = "#46545e";
      ctx.fill();
      ctx.strokeStyle = "rgba(20, 28, 34, 0.8)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "#93a6b0";
      ctx.fillRect(-w / 2 + 2, -h * 0.3, w * 0.16, h * 0.6);
      ctx.strokeStyle = "rgba(220, 235, 231, 0.25)";
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 4; i++) {
        const hx = -w * 0.16 + i * w * 0.14;
        ctx.strokeRect(hx, -h * 0.26, w * 0.1, h * 0.52);
      }
    }
    ctx.restore();
  }

  // Orca glyph: surfacing back + saddle-patch hint + dorsal fin (Bigg's tall/triangular)
  function drawOrca(x, y, s, color, alpha, isBiggs) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;

    // surfacing back — dark body breaking the water
    ctx.fillStyle = shade(color, 0.3);
    ctx.beginPath();
    ctx.ellipse(0, s * 0.5, s * 2.05, s * 0.62, 0, Math.PI, 0);
    ctx.fill();

    // saddle-patch hint behind the fin
    ctx.fillStyle = "rgba(214, 227, 225, " + (0.5 * alpha).toFixed(3) + ")";
    ctx.beginPath();
    ctx.ellipse(s * 0.62, s * 0.22, s * 0.52, s * 0.2, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // dorsal fin
    ctx.fillStyle = isBiggs ? shade(color, 0.78) : color;
    ctx.beginPath();
    if (isBiggs) {
      // tall, straight, triangular
      ctx.moveTo(-s * 0.7, s * 0.28);
      ctx.quadraticCurveTo(-s * 0.3, -s * 1.4, -s * 0.05, -s * 2.5);
      ctx.quadraticCurveTo(s * 0.5, -s * 1.05, s * 0.85, s * 0.28);
    } else {
      // falcate, swept back
      ctx.moveTo(-s * 0.8, s * 0.28);
      ctx.quadraticCurveTo(-s * 0.75, -s * 1.35, -s * 1.3, -s * 2.0);
      ctx.quadraticCurveTo(-s * 0.1, -s * 1.55, s * 0.75, s * 0.28);
    }
    ctx.closePath();
    ctx.fill();
    // fin edge highlight
    ctx.strokeStyle = "rgba(232, 244, 248, " + (0.28 * alpha).toFixed(3) + ")";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();
  }

  function drawPod(pod, idx, time, resAct, biggsAct) {
    const isBiggs = pod.id.indexOf("biggs") === 0;
    const act = isBiggs ? biggsAct : resAct;
    const u = ((pod.phase + time * pod.speed) % 1 + 1) % 1;
    const pt = routePoint(ROUTES[pod.route], u);
    const x = pt[0];
    const bob = Math.sin(wob * 1.6 + pod.phase * 20) * 2.4;
    const y = pt[1] + bob;

    let alpha = 0.38 + act * 0.62;
    const podKey = isBiggs ? "biggs" : pod.id.charAt(0);
    if (focusPod) {
      alpha = (podKey === focusPod) ? 1 : 0.1;
    }

    // Fading motion trail — tapered ribbon along the route
    ctx.save();
    ctx.lineCap = "round";
    let prev = routePoint(ROUTES[pod.route], u - 13 * 0.009);
    for (let k = 12; k >= 1; k--) {
      const p = routePoint(ROUTES[pod.route], u - k * 0.009);
      const f = 1 - k / 13;
      ctx.strokeStyle = pod.color;
      ctx.globalAlpha = alpha * 0.3 * f;
      ctx.lineWidth = Math.max(0.6, pod.size * 0.7 * f);
      ctx.beginPath();
      ctx.moveTo(prev[0], prev[1]);
      ctx.lineTo(p[0], p[1]);
      ctx.stroke();
      prev = p;
    }
    ctx.restore();

    // soft presence glow
    ctx.beginPath();
    ctx.arc(x, y, pod.size * 2.3, 0, Math.PI * 2);
    ctx.fillStyle = pod.color;
    ctx.globalAlpha = alpha * 0.14;
    ctx.fill();
    ctx.globalAlpha = 1;

    drawOrca(x, y, pod.size, pod.color, alpha, isBiggs);

    // occasional spout puff
    const hash = idx * 0.617 + pod.phase;
    const sp = ((wob * 0.045 + hash) % 1 + 1) % 1;
    if (sp < 0.12 && alpha > 0.3) {
      const q = sp / 0.12;
      ctx.globalAlpha = alpha * 0.5 * (1 - q);
      ctx.fillStyle = "rgba(224, 240, 244, 0.9)";
      const py = y - pod.size * (1.4 + q * 2.2);
      ctx.beginPath();
      ctx.arc(x + pod.size * 0.4, py, pod.size * (0.32 + q * 0.75), 0, Math.PI * 2);
      ctx.arc(x + pod.size * 0.05, py + pod.size * 0.42, pod.size * (0.2 + q * 0.5), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // rare breach sparkle
    const br = ((time * 0.021 + hash * 2.13) % 1 + 1) % 1;
    if (br < 0.03 && alpha > 0.3) {
      const q = br / 0.03;
      const rr = pod.size * (1.2 + q * 2.6);
      ctx.save();
      ctx.globalAlpha = alpha * (1 - q) * 0.8;
      ctx.strokeStyle = "rgba(233, 196, 106, 0.9)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(x, y, rr, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 6; i++) {
        const a2 = (i / 6) * Math.PI * 2 + q * 0.6;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a2) * rr, y + Math.sin(a2) * rr);
        ctx.lineTo(x + Math.cos(a2) * (rr + pod.size * 0.9), y + Math.sin(a2) * (rr + pod.size * 0.9));
        ctx.stroke();
      }
      ctx.restore();
    }

    if (pod.label) {
      ctx.globalAlpha = Math.min(1, alpha + 0.15);
      ctx.fillStyle = "rgba(242, 233, 216, 0.95)";
      ctx.font = "700 10px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(pod.label, x, y - pod.size * 2.9);
    }
    ctx.globalAlpha = 1;
  }

  // Glowing chart-pin flags for live sightings
  function drawSightingPin(s) {
    if (s.lat == null || s.lng == null || !SJI.geoToCanvas) return;
    const p = SJI.geoToCanvas(s.lat, s.lng, W, H);
    const sx = p[0], sy = p[1];
    if (sx < 10 || sy < 10 || sx > W - 10 || sy > H - 10) return;

    const colors = {
      resident: "#5ba3c4", biggs: "#c45c6a", humpback: "#7eb87a",
      gray: "#a8b8c8", other: "#c4a35a"
    };
    const col = colors[s.kind] || colors.other;
    const pulsing = pulseId && s.id === pulseId && performance.now() < pulseUntil;
    const glowR = pulsing ? 22 + Math.sin(performance.now() / 130) * 5 : 15;

    // glow
    const gl = ctx.createRadialGradient(sx, sy, 1, sx, sy, glowR);
    gl.addColorStop(0, col);
    gl.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = pulsing ? 0.4 : 0.2;
    ctx.fillStyle = gl;
    ctx.beginPath();
    ctx.arc(sx, sy, glowR, 0, Math.PI * 2);
    ctx.fill();

    // mast + pennant (chart pin)
    ctx.globalAlpha = 0.92;
    ctx.strokeStyle = "rgba(242, 233, 216, 0.85)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 3); ctx.lineTo(sx, sy - 15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sx, sy - 15);
    ctx.lineTo(sx + 9.5, sy - 11.5);
    ctx.lineTo(sx, sy - 8);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
    ctx.strokeStyle = "rgba(242, 233, 216, 0.7)";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // anchor diamond
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = col;
    ctx.fillRect(-3.2, -3.2, 6.4, 6.4);
    ctx.strokeStyle = "rgba(242, 233, 216, 0.9)";
    ctx.lineWidth = 1;
    ctx.strokeRect(-3.2, -3.2, 6.4, 6.4);
    ctx.restore();

    if (pulsing || liveSightings.length <= 10) {
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = "#e8f4f8";
      ctx.font = "600 10px 'DM Sans', sans-serif";
      ctx.textAlign = "left";
      const label = (s.group || s.species || "Sighting").slice(0, 22);
      ctx.fillText(label, sx + 12, sy + 3);
    }
    ctx.globalAlpha = 1;
  }

  let lastPresenceMonth = -1;
  function updatePresenceHud(resAct, biggsAct) {
    if (month === lastPresenceMonth) return;
    lastPresenceMonth = month;
    const el = document.getElementById("sim-presence-vals");
    if (el) {
      el.textContent = "Residents " + Math.round(resAct * 100) + "% · Bigg’s " + Math.round(biggsAct * 100) + "%";
    }
  }

  // ---------- Frame ----------
  function draw(time) {
    if (!ctx) return;
    ensureBase();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(base, 0, 0);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    const resAct = MONTH_ACTIVITY.residents[month];
    const biggsAct = MONTH_ACTIVITY.biggs[month];
    const shipAct = MONTH_ACTIVITY.ships[month];

    drawFlow();
    drawSalmonGlow(resAct);
    ships.forEach(function (ship) { drawShip(ship, time, shipAct); });
    pods.forEach(function (pod, idx) { drawPod(pod, idx, time, resAct, biggsAct); });
    if (liveSightings.length) liveSightings.forEach(drawSightingPin);

    updatePresenceHud(resAct, biggsAct);

    ctx.fillStyle = "rgba(220, 235, 231, 0.38)";
    ctx.font = "500 10px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    const feedNote = liveSightings.length ? " · " + liveSightings.length + " SIGHTING PINS" : "";
    ctx.fillText("STYLIZED SEASONAL MODEL · NOT REAL-TIME AIS" + feedNote, 28, 32);
  }

  function setSightings(list) {
    liveSightings = list || [];
    if (!playing) draw(t);
  }

  function pulseSighting(s) {
    if (!s) return;
    pulseId = s.id;
    pulseUntil = performance.now() + 4000;
    if (!playing && (reduceMotion || !inView)) {
      (function pulseLoop() {
        draw(t);
        if (performance.now() < pulseUntil) requestAnimationFrame(pulseLoop);
      })();
    }
  }

  SJI.whales = { init: init, setSightings: setSightings, pulseSighting: pulseSighting };
})();
