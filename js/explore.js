/**
 * Island explore tabs — "Chart & Current".
 * Panels render a hand-drawn topo chart in a chart frame with a brass pushpin;
 * tabs get island-silhouette chips; spot emoji are swapped for sprite icons
 * at render time; the tip renders as a mailed postcard.
 */
(function () {
  /* Emoji (from data.js) → sprite icon, matched with variation selectors stripped */
  const EMOJI_ICON = {
    "🐋": "orca", "🏛": "cannon", "🔬": "microscope", "🌅": "lighthouse",
    "⛰": "peak", "🏞": "camp", "🛍": "marker", "🌲": "fir",
    "🚲": "compass", "🏖": "wave", "🪨": "rock", "🦅": "eagle",
    "⛴": "ferry", "⛺": "camp", "🌌": "sparkle",
    "☕": "droplet", "⚓": "anchor", "🌊": "wave"
  };
  function spotIcon(raw) {
    const key = String(raw || "").replace(/[︎️]/g, "");
    return SJI.icon(EMOJI_ICON[key] || "marker");
  }

  function spotsList(spots) {
    return `<ul class="explore-spots">
      ${(spots || []).map((s) => `
        <li>
          <span class="spot-icon">${spotIcon(s.icon)}</span>
          <div>
            <strong>${s.title}</strong>
            <span class="spot-note">${s.note}</span>
            ${s.tip ? `<p class="spot-tip"><span class="spot-tip-label">Plan</span> ${s.tip}</p>` : ""}
          </div>
        </li>
      `).join("")}
    </ul>`;
  }

  function eatsBlock(eats) {
    if (!eats || !eats.length) return "";
    return `
    <div class="explore-eats">
      <h4 class="explore-subhead">${SJI.icon("anchor", "icon-sm")} Where to eat</h4>
      <ul class="explore-eats-list">
        ${eats.map((e) => `
          <li>
            <span class="spot-icon">${spotIcon(e.icon || "🛍")}</span>
            <div>
              <strong>${e.title}</strong>
              <span class="eat-meta">${[e.where, e.kind].filter(Boolean).join(" · ")}</span>
              <span class="spot-note">${e.note}</span>
            </div>
          </li>
        `).join("")}
      </ul>
    </div>`;
  }

  function halfDaysBlock(trips) {
    if (!trips || !trips.length) return "";
    return `
    <div class="explore-halfdays">
      <h4 class="explore-subhead">${SJI.icon("compass", "icon-sm")} Half-day trips</h4>
      <div class="halfday-grid">
        ${trips.map((t) => `
          <article class="halfday-card">
            <header class="halfday-head">
              <h5>${t.title}</h5>
              <div class="halfday-meta">
                ${t.duration ? `<span class="halfday-chip">${t.duration}</span>` : ""}
                ${t.bestFor ? `<span class="halfday-chip halfday-chip--soft">${t.bestFor}</span>` : ""}
              </div>
            </header>
            <ol class="halfday-steps">
              ${(t.steps || []).map((step) => `<li>${step}</li>`).join("")}
            </ol>
          </article>
        `).join("")}
      </div>
    </div>`;
  }

  /* Island path bounding boxes in the shared 640×460 chart space */
  const BBOX = {
    "san-juan": { x: 155, y: 236, w: 143, h: 170 },
    orcas: { x: 312, y: 122, w: 206, h: 188 },
    lopez: { x: 388, y: 278, w: 154, h: 158 },
    shaw: { x: 340, y: 238, w: 78, h: 70 }
  };
  /* Pushpin anchor (chart coords) + main-town label per island */
  const PIN = {
    "san-juan": { x: 276, y: 296 },
    orcas: { x: 424, y: 178 },
    lopez: { x: 434, y: 318 },
    shaw: { x: 378, y: 272 }
  };

  function isleSilhouette(id, cls) {
    const isle = SJI.ISLANDS?.[id];
    const b = BBOX[id];
    if (!isle || !b) return "";
    const pad = 10;
    return `<svg class="${cls}" viewBox="${b.x - pad} ${b.y - pad} ${b.w + pad * 2} ${b.h + pad * 2}"
      aria-hidden="true"><path d="${isle.path}" /></svg>`;
  }

  /* Depth soundings scattered in the water margin (viewBox 0 0 340 250) */
  const SOUNDINGS = [
    [38, 52, "48"], [64, 210, "63"], [296, 44, "37"], [304, 196, "71"],
    [166, 26, "24"], [40, 130, "55"], [300, 122, "42"], [178, 232, "58"]
  ];

  function topoChart(id) {
    const isle = SJI.ISLANDS?.[id];
    const b = BBOX[id];
    if (!isle || !b) return "";
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    const s = Math.min(200 / b.w, 152 / b.h, 1.9);
    const tx = 170 - s * cx;
    const ty = 118 - s * cy;
    const pin = PIN[id] || { x: cx, y: cy };
    const px = 170 + s * (pin.x - cx);
    const py = 118 + s * (pin.y - cy);

    /* Concentric topo contours: scaled copies of the coastline about its center */
    const contours = [0.8, 0.6, 0.4, 0.22].map((k, i) => `
      <path class="topo-contour" d="${isle.path}"
        transform="translate(${(cx * (1 - k)).toFixed(1)} ${(cy * (1 - k)).toFixed(1)}) scale(${k})"
        style="stroke-width:${(0.9 + i * 0.1) / s}px" />`).join("");

    const grid = [];
    for (let gx = 54; gx < 340; gx += 56) grid.push(`<line x1="${gx}" y1="16" x2="${gx}" y2="234"/>`);
    for (let gy = 58; gy < 250; gy += 56) grid.push(`<line x1="16" y1="${gy}" x2="324" y2="${gy}"/>`);

    const ticks = [];
    for (let gx = 54; gx < 340; gx += 56) {
      ticks.push(`<line x1="${gx}" y1="10" x2="${gx}" y2="16"/>`, `<line x1="${gx}" y1="234" x2="${gx}" y2="240"/>`);
    }
    for (let gy = 58; gy < 250; gy += 56) {
      ticks.push(`<line x1="10" y1="${gy}" x2="16" y2="${gy}"/>`, `<line x1="324" y1="${gy}" x2="330" y2="${gy}"/>`);
    }

    const soundings = SOUNDINGS.map(([x, y, d]) => `<text x="${x}" y="${y}">${d}</text>`).join("");

    return `
    <svg class="topo-svg" viewBox="0 0 340 250" role="img"
      aria-label="Stylized topographic chart of ${isle.name}">
      <rect class="topo-water" x="10" y="10" width="320" height="230"/>
      <g class="topo-grid">${grid.join("")}</g>
      <g class="topo-soundings" aria-hidden="true">${soundings}</g>
      <g transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${s.toFixed(3)})">
        <path class="topo-shadow" d="${isle.path}" transform="translate(${(3 / s).toFixed(1)} ${(4 / s).toFixed(1)})"/>
        <path class="topo-land" d="${isle.path}" style="stroke-width:${(1.4 / s).toFixed(2)}px"/>
        ${contours}
      </g>
      <g class="topo-frame">
        <rect x="4.5" y="4.5" width="331" height="241"/>
        <rect x="10" y="10" width="320" height="230"/>
        <g class="topo-ticks">${ticks.join("")}</g>
      </g>
      <g class="topo-compass" transform="translate(306 218)">
        <circle r="11"/>
        <path d="M0 -9 L2.6 3 L0 1 L-2.6 3 Z"/>
        <text y="-14">N</text>
      </g>
      <g class="topo-cartouche" transform="translate(22 22)">
        <text class="tc-name" y="12">${isle.name.toUpperCase()}</text>
        <text class="tc-sub" y="24">SOUNDINGS IN FATHOMS · ${isle.area.toUpperCase()}</text>
        <line x1="0" y1="30" x2="112" y2="30"/>
      </g>
      <g class="topo-scale" transform="translate(22 228)">
        <line x1="0" y1="0" x2="60" y2="0"/>
        <line x1="0" y1="-3" x2="0" y2="3"/><line x1="30" y1="-2.5" x2="30" y2="2.5"/><line x1="60" y1="-3" x2="60" y2="3"/>
        <text x="68" y="3">2 NM</text>
      </g>
      <g class="topo-pin" transform="translate(${px.toFixed(1)} ${py.toFixed(1)})">
        <ellipse class="pin-shadow" cx="2.6" cy="3.4" rx="4.6" ry="1.9"/>
        <line class="pin-needle" x1="0" y1="0" x2="3.6" y2="-7"/>
        <circle class="pin-head" cx="4.6" cy="-9.2" r="4.4"/>
        <circle class="pin-glint" cx="3.2" cy="-10.6" r="1.2"/>
        <text class="pin-label" x="11" y="-6.5">${isle.town.toUpperCase()}</text>
      </g>
    </svg>`;
  }

  function postcard(id, data) {
    const photo = SJI.PHOTOS?.places?.[id];
    return `
    <aside class="explore-postcard" aria-label="Traveler's tip">
      ${photo ? `<div class="pc-photo"><img src="${photo}" alt="" loading="lazy" /></div>` : ""}
      <div class="pc-note">
        <span class="pc-label">Traveler&rsquo;s tip</span>
        <p class="pc-tip">${data.tip}</p>
      </div>
      <div class="pc-post" aria-hidden="true">
        <span class="pc-stamp">${isleSilhouette(id, "pc-stamp-art")}</span>
        <svg class="pc-postmark" viewBox="0 0 64 40">
          <circle cx="18" cy="20" r="13" fill="none"/>
          <text x="18" y="18">SALISH</text>
          <text x="18" y="25">SEA WA</text>
          <path d="M34 12 Q44 8 60 11 M34 20 Q44 16 60 19 M34 28 Q44 24 60 27" fill="none"/>
        </svg>
      </div>
    </aside>`;
  }

  function build() {
    const panels = document.getElementById("explore-panels");
    if (!panels || !SJI.EXPLORE) return;

    panels.innerHTML = Object.entries(SJI.EXPLORE).map(([id, data], i) => {
      const rich = !!(data.eats?.length || data.halfDays?.length || data.spots?.some((s) => s.tip));
      return `
      <div class="explore-panel ${i === 0 ? "active" : ""} ${rich ? "explore-panel--rich" : ""}" role="tabpanel" id="panel-${id}" data-panel="${id}" ${i === 0 ? "" : "hidden"}>
        <div class="explore-visual">
          ${topoChart(id)}
        </div>
        <div class="explore-info">
          <h3>${data.name}</h3>
          <p class="explore-nick">${data.nick}</p>
          <p class="explore-body">
            <span class="adult-text">${data.body}</span>
            <span class="kid-text" hidden>${data.bodyKid}</span>
          </p>
          <h4 class="explore-subhead">${SJI.icon("binoculars", "icon-sm")} Places to explore</h4>
          ${spotsList(data.spots)}
          ${eatsBlock(data.eats)}
          ${postcard(id, data)}
        </div>
        ${data.halfDays?.length ? `<div class="explore-plan">${halfDaysBlock(data.halfDays)}</div>` : ""}
      </div>`;
    }).join("");

    document.querySelectorAll(".explore-tab").forEach((tab) => {
      /* Island-silhouette chip art (once) */
      if (!tab.querySelector(".tab-isle")) {
        tab.insertAdjacentHTML("afterbegin", isleSilhouette(tab.dataset.tab, "tab-isle"));
      }
      tab.addEventListener("click", () => {
        const id = tab.dataset.tab;
        document.querySelectorAll(".explore-tab").forEach((t) => {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        document.querySelectorAll(".explore-panel").forEach((p) => {
          const on = p.dataset.panel === id;
          p.classList.toggle("active", on);
          p.hidden = !on;
        });
      });
    });
  }

  function applyKidMode(on) {
    document.querySelectorAll("#explore-panels .adult-text").forEach((el) => {
      el.hidden = on;
    });
    document.querySelectorAll("#explore-panels .kid-text").forEach((el) => {
      el.hidden = !on;
    });
  }

  SJI.explore = { build, applyKidMode };
})();
