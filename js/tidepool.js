/**
 * Tidepool / rocky shore explorer
 */
(function () {
  let selectedId = null;
  let selectedZone = null;

  // Sprite icon per creature (zero emoji — brief §4)
  const CREATURE_ICONS = {
    anemone: "anemone",
    "ochre-star": "seastar",
    chiton: "chiton",
    sculpin: "sculpin",
    hermit: "crab",
    barnacle: "barnacle",
    mussel: "mussel",
    urchin: "urchin",
    rockweed: "seaweed",
    "sea-lettuce": "seaweed",
    kelp: "kelp"
  };
  const ZONE_ICONS = { splash: "droplet", high: "rock", mid: "wave", low: "tide" };
  const iconFor = (id) => SJI.icon(CREATURE_ICONS[id] || "wave");

  function init() {
    const root = document.getElementById("tidepool");
    if (!root || !SJI.TIDEPOOL) return;

    buildCreatureChips();
    bindVisual();
    bindZones();
    bindPools();
    showDefault();
  }

  function kidMode() {
    return document.body.classList.contains("kid-mode");
  }

  function buildCreatureChips() {
    const list = document.getElementById("tp-creature-list");
    if (!list) return;

    list.innerHTML = SJI.TIDEPOOL.creatures
      .map(
        (c) => `
      <button type="button" class="tp-chip" data-creature="${c.id}" aria-pressed="false">
        <span class="tp-chip-emoji" aria-hidden="true">${iconFor(c.id)}</span>
        <span class="tp-chip-name">${c.name}</span>
      </button>`
      )
      .join("");

    list.querySelectorAll(".tp-chip").forEach((btn) => {
      btn.addEventListener("click", () => selectCreature(btn.dataset.creature));
    });
  }

  function bindVisual() {
    const visual = document.getElementById("tp-visual");
    if (!visual) return;

    visual.querySelectorAll("[data-creature]").forEach((el) => {
      const id = el.dataset.creature;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        selectCreature(id);
      });
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectCreature(id);
        }
      });
    });

    visual.querySelectorAll("[data-zone-hit]").forEach((el) => {
      el.addEventListener("click", () => selectZone(el.dataset.zoneHit));
      // engraved zone tags are focusable buttons
      if (el.classList.contains("tp-zone-tag")) {
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            selectZone(el.dataset.zoneHit);
          }
        });
      }
    });
  }

  /* ---- pool click → expanding ripple rings (+ the sculpin darts) ---- */
  const POOLS = [
    { cx: 408, cy: 406, rx: 200, ry: 76, main: true },
    { cx: 704, cy: 407, rx: 72, ry: 37, main: false }
  ];

  function bindPools() {
    const svg = document.querySelector("#tp-visual svg.tp-svg");
    if (!svg) return;
    svg.addEventListener("click", (e) => {
      const m = svg.getScreenCTM();
      if (!m) return;
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      const pool = POOLS.find(
        (o) => Math.pow((p.x - o.cx) / o.rx, 2) + Math.pow((p.y - o.cy) / o.ry, 2) <= 1
      );
      if (!pool) return;
      spawnRipple(svg, p.x, p.y);
      if (pool.main) dartSculpin();
    });
  }

  function spawnRipple(svg, x, y) {
    const layer = svg.querySelector("#tp-ripples");
    if (!layer) return;
    const NS = "http://www.w3.org/2000/svg";
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "tp-ripple");
    g.setAttribute("transform", "translate(" + x + " " + y + ")");
    for (let i = 0; i < 3; i++) {
      const ring = document.createElementNS(NS, "ellipse");
      ring.setAttribute("rx", "7");
      ring.setAttribute("ry", "2.8");
      ring.setAttribute("class", "tp-ripple-ring tp-r" + i);
      g.appendChild(ring);
    }
    layer.appendChild(g);
    setTimeout(() => g.remove(), 2100);
  }

  let dartTimer = null;
  function dartSculpin() {
    const s = document.querySelector("#tp-visual .tp-sculpin");
    if (!s) return;
    s.classList.remove("darting");
    void s.getBoundingClientRect(); // restart animation
    s.classList.add("darting");
    clearTimeout(dartTimer);
    dartTimer = setTimeout(() => s.classList.remove("darting"), 1400);
  }

  function bindZones() {
    document.querySelectorAll(".tp-zone-btn").forEach((btn) => {
      btn.addEventListener("click", () => selectZone(btn.dataset.zone));
    });
  }

  function clearSelectionUI() {
    document.querySelectorAll(".tp-chip").forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", "false");
    });
    document.querySelectorAll(".tp-zone-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll("#tp-visual .tp-hot").forEach((el) => el.classList.remove("active"));
    document.querySelectorAll("#tp-visual .tp-zone-band").forEach((el) => el.classList.remove("active"));
    document.querySelectorAll("#tp-visual .tp-zone-tag").forEach((el) => el.classList.remove("active"));
  }

  function selectCreature(id) {
    const c = SJI.TIDEPOOL.creatures.find((x) => x.id === id);
    if (!c) return;

    selectedId = id;
    selectedZone = c.zone;
    clearSelectionUI();

    document.querySelectorAll(`.tp-chip[data-creature="${id}"]`).forEach((b) => {
      b.classList.add("active");
      b.setAttribute("aria-pressed", "true");
    });
    document.querySelectorAll(`#tp-visual [data-creature="${id}"]`).forEach((el) => {
      el.classList.add("active");
    });
    document.querySelectorAll(`.tp-zone-btn[data-zone="${c.zone}"]`).forEach((b) => b.classList.add("active"));
    document.querySelectorAll(`#tp-visual .tp-zone-band[data-zone="${c.zone}"]`).forEach((el) => {
      el.classList.add("active");
    });
    document.querySelectorAll(`#tp-visual .tp-zone-tag[data-zone-hit="${c.zone}"]`).forEach((el) => {
      el.classList.add("active");
    });

    renderPanel({
      eyebrow: c.kind === "plant" ? `${zoneLabel(c.zone)} · plant` : zoneLabel(c.zone),
      title: c.name,
      latin: c.latin,
      iconHtml: iconFor(c.id),
      body: kidMode() ? c.bodyKid : c.body,
      fun: c.fun,
      photoId: c.id
    });
  }

  function selectZone(zone) {
    const z = SJI.TIDEPOOL.zones[zone];
    if (!z) return;

    selectedZone = zone;
    selectedId = null;
    clearSelectionUI();

    document.querySelectorAll(`.tp-zone-btn[data-zone="${zone}"]`).forEach((b) => b.classList.add("active"));
    document.querySelectorAll(`#tp-visual .tp-zone-band[data-zone="${zone}"]`).forEach((el) => {
      el.classList.add("active");
    });
    document.querySelectorAll(`#tp-visual .tp-zone-tag[data-zone-hit="${zone}"]`).forEach((el) => {
      el.classList.add("active");
    });
    // Highlight creatures in this zone on the SVG
    SJI.TIDEPOOL.creatures
      .filter((c) => c.zone === zone)
      .forEach((c) => {
        document.querySelectorAll(`#tp-visual [data-creature="${c.id}"]`).forEach((el) => {
          el.classList.add("active");
        });
        document.querySelectorAll(`.tp-chip[data-creature="${c.id}"]`).forEach((b) => {
          b.classList.add("active");
          b.setAttribute("aria-pressed", "true");
        });
      });

    renderPanel({
      eyebrow: "Tidal zone",
      title: z.title,
      latin: "",
      iconHtml: SJI.icon(ZONE_ICONS[zone] || "wave"),
      body: kidMode() ? z.bodyKid : z.body,
      fun: "",
      photoId: null,
      residents: SJI.TIDEPOOL.creatures.filter((c) => c.zone === zone)
    });
  }

  function zoneLabel(zone) {
    return SJI.TIDEPOOL.zones[zone]?.title || zone;
  }

  function renderPanel({ eyebrow, title, latin, iconHtml, body, fun, photoId, residents }) {
    const set = (id, text, asHtml = false) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (asHtml) el.innerHTML = text;
      else el.textContent = text;
    };

    set("tp-eyebrow", eyebrow);
    set("tp-title", title);
    set("tp-latin", latin || "");
    const latinEl = document.getElementById("tp-latin");
    if (latinEl) latinEl.hidden = !latin;

    const emojiEl = document.getElementById("tp-emoji");
    if (emojiEl) emojiEl.innerHTML = iconHtml || SJI.icon("wave");

    const photo = photoId ? SJI.PHOTOS?.wildlife?.[photoId] : null;
    const wrap = document.getElementById("tp-photo-wrap");
    const img = document.getElementById("tp-photo");
    if (wrap && img) {
      if (photo) {
        wrap.hidden = false;
        img.src = photo;
        img.alt = title || "";
      } else {
        wrap.hidden = true;
        img.removeAttribute("src");
        img.alt = "";
      }
    }

    set("tp-body", body);

    // Residents mini-list for zone views — each row selects its creature
    const resWrap = document.getElementById("tp-zone-residents");
    const resList = document.getElementById("tp-residents-list");
    if (resWrap && resList) {
      if (residents && residents.length) {
        resWrap.hidden = false;
        resList.innerHTML = residents
          .map(
            (c) => `
          <li><button type="button" class="tp-resident" data-creature="${c.id}">
            <span class="tp-resident-icon" aria-hidden="true">${iconFor(c.id)}</span>
            <span>${c.name}</span>
          </button></li>`
          )
          .join("");
        resList.querySelectorAll(".tp-resident").forEach((btn) => {
          btn.addEventListener("click", () => selectCreature(btn.dataset.creature));
        });
      } else {
        resWrap.hidden = true;
        resList.innerHTML = "";
      }
    }

    const funEl = document.getElementById("tp-fun");
    if (funEl) {
      if (fun) {
        funEl.hidden = false;
        funEl.textContent = fun;
      } else {
        funEl.hidden = true;
        funEl.textContent = "";
      }
    }
  }

  function showDefault() {
    // Rich default: lead with a featured creature rather than an empty card
    const featured = SJI.TIDEPOOL.creatures.find((c) => c.id === "ochre-star");
    if (featured) {
      const hint = kidMode()
        ? " Tap any creature or zone in the painting to meet more of its neighbors!"
        : " Tap any creature, chip, or zonation band to page through the rest of the pool’s residents.";
      renderPanel({
        eyebrow: kidMode() ? "Meet a tidepool star" : "Featured resident · start exploring",
        title: featured.name,
        latin: featured.latin,
        iconHtml: iconFor(featured.id),
        body: (kidMode() ? featured.bodyKid : featured.body) + hint,
        fun: featured.fun,
        photoId: featured.id
      });
      return;
    }
    renderPanel({
      eyebrow: "How to explore",
      title: "A living shoreline",
      latin: "",
      iconHtml: SJI.icon("wave"),
      body: kidMode()
        ? "Tap a sea star, anemone, or zone label to meet the creatures and seaweeds that live between high and low tide!"
        : "Click a creature or seaweed in the pool — or a zonation band — to see who thrives where on San Juan Island’s rocky shores.",
      fun: "",
      photoId: null
    });
  }

  function refreshText() {
    if (selectedId) selectCreature(selectedId);
    else if (selectedZone) selectZone(selectedZone);
    else showDefault();
  }

  SJI.tidepool = { init, selectCreature, selectZone, refreshText };
})();
