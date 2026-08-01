/**
 * Interactive SVG map of the San Juan Islands
 */
(function () {
  const wrap = () => document.getElementById("map-svg-wrap");
  const panel = () => document.getElementById("map-panel");

  function buildMap() {
    const el = wrap();
    if (!el) return;

    const islands = SJI.ISLANDS;
    let islandPaths = "";
    let labels = "";

    const labelPos = {
      "san-juan": [225, 320],
      orcas: [415, 210],
      lopez: [465, 360],
      shaw: [378, 272],
      sucia: [425, 105],
      stuart: [145, 160],
      spieden: [228, 200],
      blakely: [525, 228],
      waldron: [325, 125],
      jones: [315, 236]
    };

    Object.values(islands).forEach((isle) => {
      islandPaths += `<path class="island" data-id="${isle.id}" id="island-${isle.id}" d="${isle.path}" tabindex="0" role="button" aria-label="${isle.name}" />`;
      const [lx, ly] = labelPos[isle.id] || [0, 0];
      if (["san-juan", "orcas", "lopez", "shaw", "sucia", "stuart"].includes(isle.id)) {
        labels += `<text class="island-label" x="${lx}" y="${ly}" text-anchor="middle">${isle.name.replace(" Island", "")}</text>`;
      }
    });

    // Smaller decorative islets
    const rocks = [
      [150, 220, 6], [280, 150, 5], [480, 160, 7], [540, 300, 5],
      [380, 320, 4], [250, 200, 5], [500, 120, 4], [180, 160, 4],
      [320, 300, 5], [440, 220, 4], [360, 120, 5], [200, 380, 4]
    ];
    let rockPaths = rocks.map(([x, y, r], i) =>
      `<circle class="island rock" data-id="rock-${i}" cx="${x}" cy="${y}" r="${r}" style="pointer-events:none;opacity:0.7" />`
    ).join("");

    el.innerHTML = `
      <svg viewBox="0 0 640 460" xmlns="http://www.w3.org/2000/svg" aria-label="Map of the San Juan Islands">
        <defs>
          <radialGradient id="waterGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stop-color="#1a4a5f"/>
            <stop offset="100%" stop-color="#0d2840"/>
          </radialGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <rect width="640" height="460" fill="url(#waterGlow)"/>

        <!-- Mainland hints -->
        <path d="M580 0 L640 0 L640 200 L600 180 L580 100 Z" fill="#2a4a3a" opacity="0.35"/>
        <path d="M0 0 L80 0 L60 80 L0 120 Z" fill="#2a4a3a" opacity="0.25"/>
        <path d="M0 350 L40 380 L0 460 Z" fill="#2a4a3a" opacity="0.2"/>

        <!-- Water labels -->
        <text class="water-label" x="100" y="100">Haro Strait</text>
        <text class="water-label" x="520" y="280">Rosario</text>
        <text class="water-label" x="520" y="295">Strait</text>
        <text class="water-label" x="300" y="420">Strait of Juan de Fuca →</text>
        <text class="water-label" x="350" y="40">Boundary Pass</text>

        <!-- Protected areas (layer) -->
        <ellipse class="protected" cx="420" cy="100" rx="40" ry="25"/>
        <ellipse class="protected" cx="310" cy="235" rx="25" ry="18"/>
        <ellipse class="protected" cx="150" cy="155" rx="35" ry="28"/>
        <ellipse class="protected" cx="480" cy="380" rx="30" ry="20"/>

        <!-- Shipping routes -->
        <path class="route-ship" d="M80 80 Q150 200 200 280 Q250 360 300 430"/>
        <path class="route-ship" d="M560 50 Q520 150 500 250 Q480 350 460 440"/>
        <path class="route-ship" d="M100 400 Q250 380 400 390 Q520 400 600 380"/>

        <!-- Whale routes -->
        <path class="route-whale" id="route-whale-main" d="M90 120 Q140 180 180 250 Q200 300 190 360 Q220 320 250 280 Q300 240 350 220 Q400 200 450 180"/>
        <path class="route-whale" d="M120 200 Q200 220 280 200 Q360 180 420 150 Q480 130 520 160"/>
        <path class="route-whale" d="M200 350 Q280 320 360 340 Q420 360 480 340"/>

        <!-- Islands -->
        <g id="islands-group">
          ${islandPaths}
          ${rockPaths}
        </g>

        ${labels}

        <!-- Compass -->
        <g transform="translate(580, 400)" opacity="0.7">
          <circle cx="0" cy="0" r="22" fill="none" stroke="rgba(168,213,229,0.4)" stroke-width="1"/>
          <path d="M0 -14 L4 2 L0 0 L-4 2 Z" fill="#a8d5e5"/>
          <text x="0" y="-28" text-anchor="middle" fill="#a8d5e5" font-size="9" font-family="DM Sans,sans-serif">N</text>
        </g>

        <!-- Scale -->
        <g transform="translate(30, 430)" opacity="0.6">
          <line x1="0" y1="0" x2="60" y2="0" stroke="#a8d5e5" stroke-width="1.5"/>
          <line x1="0" y1="-4" x2="0" y2="4" stroke="#a8d5e5" stroke-width="1.5"/>
          <line x1="60" y1="-4" x2="60" y2="4" stroke="#a8d5e5" stroke-width="1.5"/>
          <text x="30" y="14" text-anchor="middle" fill="#a8d5e5" font-size="9" font-family="DM Sans,sans-serif">~10 mi</text>
        </g>
      </svg>
    `;

    bindMapEvents();
  }

  function bindMapEvents() {
    const el = wrap();
    el.querySelectorAll(".island[data-id]").forEach((node) => {
      if (node.classList.contains("rock")) return;
      node.addEventListener("click", () => selectIsland(node.dataset.id));
      node.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectIsland(node.dataset.id);
        }
      });
    });

    document.querySelectorAll("[data-island]").forEach((btn) => {
      btn.addEventListener("click", () => selectIsland(btn.dataset.island));
    });

    document.querySelectorAll(".layer-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".layer-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        setLayer(btn.dataset.layer);
      });
    });

    const search = document.getElementById("island-search");
    if (search) {
      search.addEventListener("input", () => {
        const q = search.value.trim().toLowerCase();
        const nodes = el.querySelectorAll(".island[data-id]:not(.rock)");
        if (!q) {
          nodes.forEach((n) => n.classList.remove("dimmed", "highlighted"));
          return;
        }
        let first = null;
        nodes.forEach((n) => {
          const isle = SJI.ISLANDS[n.dataset.id];
          const match = isle && isle.name.toLowerCase().includes(q);
          n.classList.toggle("dimmed", !match);
          n.classList.toggle("highlighted", match);
          if (match && !first) first = n.dataset.id;
        });
        if (first && q.length > 2) selectIsland(first);
      });
    }
  }

  function setLayer(layer) {
    const el = wrap();
    if (!el) return;
    el.querySelectorAll(".route-whale").forEach((r) => r.classList.toggle("visible", layer === "whales"));
    el.querySelectorAll(".route-ship").forEach((r) => r.classList.toggle("visible", layer === "shipping"));
    el.querySelectorAll(".protected").forEach((r) => r.classList.toggle("visible", layer === "protected"));
  }

  function selectIsland(id) {
    const isle = SJI.ISLANDS[id];
    if (!isle) return;

    const el = wrap();
    el.querySelectorAll(".island").forEach((n) => n.classList.remove("selected"));
    const node = el.querySelector(`#island-${id}`);
    if (node) node.classList.add("selected");

    const p = panel();
    const empty = p.querySelector(".map-panel-empty");
    const content = p.querySelector(".map-panel-content");
    empty.hidden = true;
    content.hidden = false;

    const kid = document.body.classList.contains("kid-mode");
    const desc = kid ? isle.descKid : isle.desc;

    const photo =
      SJI.PHOTOS?.places?.[id] ||
      (id === "san-juan" ? SJI.PHOTOS?.places?.["friday-harbor"] : null) ||
      SJI.PHOTOS?.places?.aerial;
    const geo = SJI.GEO?.islands?.[id];
    const photoHtml = photo
      ? `<div class="panel-photo"><img src="${photo}" alt="" loading="lazy" /></div>`
      : "";
    const flyBtn =
      geo && SJI.livemap
        ? `<button type="button" class="text-btn" data-fly-island="${id}">Show on live map →</button>`
        : "";

    content.innerHTML = `
      ${photoHtml}
      <h3>${isle.name}</h3>
      <p class="panel-pop">${isle.nick} · pop. ${isle.pop}</p>
      <p class="panel-desc">${desc}</p>
      <div class="panel-facts">
        <div class="panel-fact"><strong>${isle.area}</strong><span>Area</span></div>
        <div class="panel-fact"><strong>${isle.peak.split("·")[0].trim()}</strong><span>High point</span></div>
        <div class="panel-fact"><strong>${isle.town}</strong><span>Hub</span></div>
        <div class="panel-fact"><strong>${isle.pop}</strong><span>People</span></div>
      </div>
      <ul class="panel-highlights">
        ${isle.highlights.map((h) => `<li>${h}</li>`).join("")}
      </ul>
      ${flyBtn}
    `;

    content.querySelector("[data-fly-island]")?.addEventListener("click", () => {
      document.querySelector('[data-map-view="live"]')?.click();
      SJI.livemap?.selectIsland?.(id);
      if (geo) SJI.livemap?.flyTo?.(geo.lat, geo.lng, 11);
    });

    SJI.livemap?.selectIsland?.(id);
  }

  SJI.map = { build: buildMap, select: selectIsland, setLayer };
})();
