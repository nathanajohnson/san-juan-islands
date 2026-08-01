/**
 * Island explore tabs
 */
(function () {
  const COLORS = {
    "san-juan": ["#1a4a5f", "#2d6b4a"],
    orcas: ["#1a3a4f", "#3d5a80"],
    lopez: ["#2a5a4a", "#c45c26"],
    shaw: ["#1f4e3a", "#4a6741"]
  };

  function islandVisual(id, name) {
    const photo = SJI.PHOTOS?.places?.[id];
    if (photo) {
      return `
        <div class="island-photo-wrap">
          <img class="island-photo" src="${photo}" alt="View related to ${name}" loading="lazy" />
          <span class="island-tag">${name}</span>
        </div>`;
    }
    // Simplified decorative island silhouettes fallback
    const paths = {
      "san-juan": "M40 120 Q80 60 140 70 T220 90 Q240 130 200 160 Q140 180 80 160 Q40 140 40 120 Z",
      orcas: "M30 100 Q60 40 120 50 Q180 30 240 70 Q250 120 200 150 Q140 170 80 140 Q40 130 30 100 Z",
      lopez: "M50 90 Q100 50 160 60 T250 100 Q240 150 180 170 Q100 180 60 140 Q40 120 50 90 Z",
      shaw: "M70 100 Q120 60 180 80 Q200 120 170 150 Q120 165 80 140 Q60 120 70 100 Z"
    };
    const [c1, c2] = COLORS[id] || COLORS["san-juan"];
    return `
      <svg class="island-art" viewBox="0 0 280 200" aria-hidden="true">
        <defs>
          <linearGradient id="ig-${id}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${c1}"/>
            <stop offset="100%" stop-color="${c2}"/>
          </linearGradient>
        </defs>
        <rect width="280" height="200" fill="url(#ig-${id})"/>
        <ellipse cx="140" cy="170" rx="100" ry="12" fill="rgba(0,0,0,0.15)"/>
        <path d="${paths[id]}" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
        <circle cx="200" cy="50" r="16" fill="rgba(244,213,141,0.5)"/>
        <path d="M40 160 Q90 150 140 158 T240 155" fill="none" stroke="rgba(168,213,229,0.4)" stroke-width="2"/>
      </svg>
      <span class="island-tag">${name}</span>
    `;
  }

  function build() {
    const panels = document.getElementById("explore-panels");
    if (!panels || !SJI.EXPLORE) return;

    panels.innerHTML = Object.entries(SJI.EXPLORE).map(([id, data], i) => `
      <div class="explore-panel ${i === 0 ? "active" : ""}" role="tabpanel" id="panel-${id}" data-panel="${id}" ${i === 0 ? "" : "hidden"}>
        <div class="explore-visual">
          ${islandVisual(id, data.name)}
        </div>
        <div class="explore-info">
          <h3>${data.name}</h3>
          <p class="explore-nick">${data.nick}</p>
          <p class="explore-body">
            <span class="adult-text">${data.body}</span>
            <span class="kid-text" hidden>${data.bodyKid}</span>
          </p>
          <ul class="explore-spots">
            ${data.spots.map((s) => `
              <li>
                <span class="spot-icon">${s.icon}</span>
                <div>
                  <strong>${s.title}</strong>
                  <span>${s.note}</span>
                </div>
              </li>
            `).join("")}
          </ul>
          <p class="explore-tip">💡 ${data.tip}</p>
        </div>
      </div>
    `).join("");

    document.querySelectorAll(".explore-tab").forEach((tab) => {
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
