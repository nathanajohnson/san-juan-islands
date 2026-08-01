/**
 * Whale traffic simulation — canvas animation of pods & shipping
 * Stylized seasonal patterns (not real-time AIS). Educational approximation.
 */
(function () {
  const MONTH_ACTIVITY = {
    // Relative presence 0–1 for residents in inland waters (peak summer)
    residents: [0.15, 0.2, 0.35, 0.5, 0.75, 0.95, 1.0, 0.95, 0.85, 0.55, 0.3, 0.18],
    biggs: [0.7, 0.65, 0.6, 0.55, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.75],
    ships: [0.7, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 0.95, 0.9, 0.85, 0.8, 0.75]
  };

  let canvas, ctx, animId = null;
  let playing = false;
  let month = 0;
  let t = 0;
  let speed = 1;
  let focusPod = null;
  let width = 1200;
  let height = 640;
  let liveSightings = [];
  let pulseId = null;
  let pulseUntil = 0;

  // Island shapes for backdrop (simplified, canvas coords)
  const ISLAND_SHAPES = [
    { name: "san-juan", pts: [[280, 380], [320, 340], [380, 330], [420, 360], [430, 420], [400, 480], [340, 500], [290, 470], [270, 420]] },
    { name: "orcas", pts: [[520, 200], [600, 170], [700, 180], [760, 220], [750, 290], [700, 320], [640, 310], [580, 340], [540, 300], [510, 250]] },
    { name: "lopez", pts: [[660, 400], [740, 385], [800, 420], [810, 480], [760, 530], [690, 535], [650, 490], [645, 440]] },
    { name: "shaw", pts: [[560, 330], [600, 320], [630, 340], [620, 370], [580, 375], [555, 355]] },
    { name: "stuart", pts: [[160, 180], [220, 160], [260, 190], [250, 240], [200, 250], [160, 220]] },
    { name: "sucia", pts: [[620, 100], [680, 90], [720, 110], [710, 145], [660, 150], [610, 130]] },
    { name: "spieden", pts: [[300, 230], [370, 220], [400, 250], [380, 280], [320, 285], [290, 255]] }
  ];

  // Path definitions: parametric routes through Haro / around islands
  function routePoint(route, u) {
    // u in [0,1) along closed or open path of control points
    const pts = route;
    if (!pts || pts.length < 2) return [0, 0];
    // Normalize u into [0, 1) even for negative JS remainder
    let t = Number(u);
    if (!Number.isFinite(t)) t = 0;
    t = ((t % 1) + 1) % 1;
    const n = pts.length;
    const scaled = t * (n - 1);
    const i = Math.min(Math.floor(scaled), n - 2);
    const f = scaled - Math.floor(scaled);
    const a = pts[i];
    const b = pts[i + 1];
    return [
      a[0] + (b[0] - a[0]) * f,
      a[1] + (b[1] - a[1]) * f
    ];
  }

  const ROUTES = {
    j: [
      [120, 160], [180, 220], [240, 300], [280, 380], [320, 420],
      [300, 360], [260, 300], [220, 240], [160, 200], [120, 160]
    ],
    k: [
      [200, 140], [280, 180], [360, 200], [440, 180], [500, 220],
      [460, 280], [380, 300], [300, 260], [240, 200], [200, 140]
    ],
    l: [
      [100, 280], [160, 340], [240, 400], [340, 440], [440, 420],
      [520, 380], [480, 320], [400, 300], [300, 320], [200, 300], [100, 280]
    ],
    biggs: [
      [400, 120], [500, 160], [600, 200], [700, 280], [720, 380],
      [640, 450], [520, 480], [400, 440], [320, 360], [300, 240], [360, 160], [400, 120]
    ],
    shipA: [
      [80, 80], [160, 160], [240, 260], [300, 360], [360, 460], [400, 560]
    ],
    shipB: [
      [900, 40], [840, 140], [800, 240], [760, 360], [740, 480], [720, 600]
    ]
  };

  const pods = [
    { id: "j", color: "#5ba3c4", route: "j", phase: 0, speed: 0.012, size: 7, label: "J" },
    { id: "j2", color: "#5ba3c4", route: "j", phase: 0.08, speed: 0.012, size: 5, label: "", parent: "j" },
    { id: "j3", color: "#5ba3c4", route: "j", phase: 0.14, speed: 0.012, size: 4, label: "", parent: "j" },
    { id: "k", color: "#7eb87a", route: "k", phase: 0.3, speed: 0.01, size: 6, label: "K" },
    { id: "k2", color: "#7eb87a", route: "k", phase: 0.36, speed: 0.01, size: 4, label: "", parent: "k" },
    { id: "l", color: "#c4a35a", route: "l", phase: 0.5, speed: 0.009, size: 7, label: "L" },
    { id: "l2", color: "#c4a35a", route: "l", phase: 0.55, speed: 0.009, size: 5, label: "", parent: "l" },
    { id: "l3", color: "#c4a35a", route: "l", phase: 0.6, speed: 0.009, size: 4, label: "", parent: "l" },
    { id: "biggs", color: "#c45c6a", route: "biggs", phase: 0.2, speed: 0.008, size: 6, label: "B" },
    { id: "biggs2", color: "#c45c6a", route: "biggs", phase: 0.26, speed: 0.008, size: 5, label: "", parent: "biggs" }
  ];

  const ships = [
    { route: "shipA", phase: 0, speed: 0.004, w: 28, h: 8 },
    { route: "shipB", phase: 0.4, speed: 0.0035, w: 32, h: 9 },
    { route: "shipA", phase: 0.6, speed: 0.0045, w: 24, h: 7 }
  ];

  function init() {
    canvas = document.getElementById("whale-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);
    draw(0);

    const play = document.getElementById("sim-play");
    const pause = document.getElementById("sim-pause");
    const scrub = document.getElementById("sim-scrub");
    const speedSel = document.getElementById("sim-speed");
    const monthEl = document.getElementById("sim-month");

    play?.addEventListener("click", () => {
      playing = true;
      play.hidden = true;
      if (pause) pause.hidden = false;
      loop();
    });
    pause?.addEventListener("click", () => {
      playing = false;
      pause.hidden = true;
      if (play) play.hidden = false;
      if (animId) cancelAnimationFrame(animId);
    });
    scrub?.addEventListener("input", () => {
      month = parseInt(scrub.value, 10);
      if (monthEl) monthEl.textContent = SJI.MONTHS[month];
      if (!playing) draw(t);
    });
    speedSel?.addEventListener("change", () => {
      speed = parseFloat(speedSel.value);
    });

    document.querySelectorAll("[data-focus-pod]").forEach((btn) => {
      btn.addEventListener("click", () => {
        focusPod = btn.dataset.focusPod;
        document.querySelectorAll(".pod-card").forEach((c) => {
          c.classList.toggle("focused", c.dataset.pod === focusPod);
        });
        if (!playing) draw(t);
        setTimeout(() => {
          focusPod = null;
          document.querySelectorAll(".pod-card").forEach((c) => c.classList.remove("focused"));
          if (!playing) draw(t);
        }, 4000);
      });
    });
  }

  function resize() {
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = 1200;
    height = 640;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = "100%";
    canvas.style.height = "auto";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function loop() {
    if (!playing) return;
    t += 0.016 * speed;
    // Advance month slowly while playing
    const monthFloat = (t * 0.15) % 12;
    month = Math.floor(monthFloat);
    const scrub = document.getElementById("sim-scrub");
    const monthEl = document.getElementById("sim-month");
    if (scrub) scrub.value = month;
    if (monthEl) monthEl.textContent = SJI.MONTHS[month];
    draw(t);
    animId = requestAnimationFrame(loop);
  }

  function draw(time) {
    if (!ctx) return;
    const w = width;
    const h = height;

    // Background
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#0a2030");
    grd.addColorStop(0.5, "#0d2840");
    grd.addColorStop(1, "#061420");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    // Soft depth rings
    ctx.strokeStyle = "rgba(42, 111, 143, 0.08)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.ellipse(w * 0.45, h * 0.5, i * 90, i * 60, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Islands
    ISLAND_SHAPES.forEach((isle) => {
      ctx.beginPath();
      isle.pts.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p[0], p[1]);
        else ctx.lineTo(p[0], p[1]);
      });
      ctx.closePath();
      ctx.fillStyle = "#2d5a45";
      ctx.fill();
      ctx.strokeStyle = "#3d7a5c";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Labels
    ctx.fillStyle = "rgba(232, 244, 248, 0.45)";
    ctx.font = "600 11px DM Sans, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SAN JUAN", 350, 410);
    ctx.fillText("ORCAS", 630, 250);
    ctx.fillText("LOPEZ", 720, 460);
    ctx.fillText("HARO STRAIT", 180, 300);
    ctx.fillStyle = "rgba(232, 244, 248, 0.3)";
    ctx.font = "10px DM Sans, sans-serif";
    ctx.fillText("ROSARIO STRAIT", 900, 320);

    const resAct = MONTH_ACTIVITY.residents[month];
    const biggsAct = MONTH_ACTIVITY.biggs[month];
    const shipAct = MONTH_ACTIVITY.ships[month];

    // Ship wakes / vessels
    ships.forEach((ship, idx) => {
      const u = (ship.phase + time * ship.speed) % 1;
      const route = ROUTES[ship.route];
      // open path — clamp
      const u2 = Math.min(u, 0.99);
      const [x, y] = routePoint(route, u2);
      const [x2, y2] = routePoint(route, Math.min(u2 + 0.02, 0.99));
      const angle = Math.atan2(y2 - y, x2 - x);

      const alpha = 0.35 + shipAct * 0.5;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha * (focusPod ? 0.25 : 1);
      ctx.fillStyle = "#8a9aaa";
      ctx.fillRect(-ship.w / 2, -ship.h / 2, ship.w, ship.h);
      ctx.beginPath();
      ctx.moveTo(ship.w / 2, 0);
      ctx.lineTo(ship.w / 2 + 8, 0);
      ctx.strokeStyle = "#8a9aaa";
      ctx.stroke();
      // wake
      ctx.globalAlpha = alpha * 0.3;
      ctx.strokeStyle = "#a8d5e5";
      ctx.beginPath();
      ctx.moveTo(-ship.w / 2, 0);
      ctx.lineTo(-ship.w / 2 - 30, -6);
      ctx.moveTo(-ship.w / 2, 0);
      ctx.lineTo(-ship.w / 2 - 30, 6);
      ctx.stroke();
      ctx.restore();
    });

    // Pods
    pods.forEach((pod) => {
      const isBiggs = pod.id.startsWith("biggs");
      const act = isBiggs ? biggsAct : resAct;
      if (act < 0.2 && Math.sin(time + pod.phase * 10) < 0.3) {
        // occasionally hide low-activity pods
      }
      const u = (pod.phase + time * pod.speed) % 1;
      const [x, y] = routePoint(ROUTES[pod.route], u);

      // Slight vertical bob
      const bob = Math.sin(time * 3 + pod.phase * 20) * 3;
      const py = y + bob;

      let alpha = 0.4 + act * 0.6;
      const rootId = pod.parent || pod.id.replace(/\d/g, "") || pod.id;
      const podKey = pod.id.startsWith("biggs") ? "biggs" : pod.id.charAt(0);
      if (focusPod) {
        alpha = podKey === focusPod || (focusPod === "biggs" && isBiggs) ? 1 : 0.12;
      }

      // Glow
      ctx.beginPath();
      ctx.arc(x, py, pod.size * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = pod.color;
      ctx.globalAlpha = alpha * 0.2;
      ctx.fill();

      // Body (orca silhouette simplified)
      ctx.globalAlpha = alpha;
      ctx.fillStyle = pod.color;
      ctx.beginPath();
      ctx.ellipse(x, py, pod.size * 1.6, pod.size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      // Dorsal fin
      ctx.beginPath();
      ctx.moveTo(x - 2, py - pod.size * 0.5);
      ctx.lineTo(x + 2, py - pod.size * 1.8);
      ctx.lineTo(x + 5, py - pod.size * 0.4);
      ctx.closePath();
      ctx.fill();

      if (pod.label) {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#fff";
        ctx.font = "700 10px DM Sans, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(pod.label, x, py - pod.size * 2.4);
      }
      ctx.globalAlpha = 1;
    });

    // Live sighting pins (from Orca Network / sample feed)
    if (liveSightings.length) {
      liveSightings.forEach((s) => {
        if (s.lat == null || s.lng == null || !SJI.geoToCanvas) return;
        const [sx, sy] = SJI.geoToCanvas(s.lat, s.lng, w, h);
        if (sx < 10 || sy < 10 || sx > w - 10 || sy > h - 10) return;

        const colors = {
          resident: "#5ba3c4",
          biggs: "#c45c6a",
          humpback: "#7eb87a",
          gray: "#a8b8c8",
          other: "#c4a35a"
        };
        const col = colors[s.kind] || colors.other;
        const pulsing = pulseId && s.id === pulseId && performance.now() < pulseUntil;
        const r = pulsing ? 10 + Math.sin(performance.now() / 120) * 3 : 6;

        ctx.beginPath();
        ctx.arc(sx, sy, r + 6, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.globalAlpha = pulsing ? 0.35 : 0.15;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.95;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.9;
        ctx.stroke();

        if (pulsing || liveSightings.length <= 10) {
          ctx.globalAlpha = 0.85;
          ctx.fillStyle = "#e8f4f8";
          ctx.font = "600 10px DM Sans, sans-serif";
          ctx.textAlign = "left";
          const label = (s.group || s.species || "Sighting").slice(0, 22);
          ctx.fillText(label, sx + r + 6, sy + 3);
        }
        ctx.globalAlpha = 1;
      });
    }

    // Month activity meter
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "11px JetBrains Mono, monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Inland presence · Residents ${Math.round(resAct * 100)}% · Bigg's ${Math.round(biggsAct * 100)}%`, 24, h - 20);

    // Title
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "10px DM Sans, sans-serif";
    const feedNote = liveSightings.length
      ? ` · ${liveSightings.length} SIGHTING PINS OVERLAID`
      : "";
    ctx.fillText("STYLIZED SEASONAL MODEL · NOT REAL-TIME AIS" + feedNote, 24, 28);
  }

  function setSightings(list) {
    liveSightings = list || [];
    if (!playing) draw(t);
  }

  function pulseSighting(s) {
    if (!s) return;
    pulseId = s.id;
    pulseUntil = performance.now() + 4000;
    if (!playing) {
      const start = performance.now();
      (function pulseLoop() {
        draw(t);
        if (performance.now() < pulseUntil) requestAnimationFrame(pulseLoop);
      })();
    }
  }

  SJI.whales = { init, setSightings, pulseSighting };
})();
