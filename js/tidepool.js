/**
 * Tidepool / rocky shore explorer
 * + live NOAA high/low forecast (station 9449834 Roche Harbor)
 * + best San Juan Island tide-pool shores
 */
(function () {
  let selectedId = null;
  let selectedZone = null;
  let tideCache = null;

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
  const SPOT_ICONS = {
    "grannys-cove": "seastar",
    "cattle-point": "lighthouse",
    "south-beach": "wave",
    "lime-kiln-pools": "lighthouse"
  };
  const iconFor = (id) => SJI.icon(CREATURE_ICONS[id] || "wave");

  function init() {
    const root = document.getElementById("tidepool");
    if (!root || !SJI.TIDEPOOL) return;

    buildCreatureChips();
    bindVisual();
    bindZones();
    bindPools();
    buildTideSpots();
    loadTideForecast();
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
    // Re-render dynamic tide copy for kid/adult mode
    if (tideCache?.ok) renderTideForecast(tideCache);
    buildTideSpots();
  }

  /* ========== Live NOAA tide forecast ========== */

  function ymdLocal(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}${m}${day}`;
  }

  function parseNoaaLocal(t) {
    // "2026-08-02 13:42" in station local time (lst_ldt)
    const [datePart, timePart] = String(t).split(" ");
    if (!datePart || !timePart) return null;
    const [Y, M, D] = datePart.split("-").map(Number);
    const [h, mi] = timePart.split(":").map(Number);
    return new Date(Y, M - 1, D, h, mi || 0, 0, 0);
  }

  function formatTime(d) {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }

  function formatDay(d) {
    const today = new Date();
    const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const d0 = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diff = Math.round((d0 - t0) / 86400000);
    if (diff === 0) return kidMode() ? "Today" : "Today";
    if (diff === 1) return kidMode() ? "Tomorrow" : "Tomorrow";
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }

  function poolTip(pred) {
    if (pred.type !== "L") {
      return kidMode() ? "High water" : "High — stay high & dry";
    }
    const ft = pred.v;
    if (ft <= 0) {
      return kidMode() ? "⭐ Super low — best pools!" : "⭐ Minus tide — prime pooling";
    }
    if (ft <= 1.5) {
      return kidMode() ? "Great low tide" : "Strong low — good window";
    }
    if (ft <= 3) {
      return kidMode() ? "OK for some pools" : "Modest low — partial access";
    }
    return kidMode() ? "Still pretty high" : "High low — limited exposure";
  }

  function tipClass(pred) {
    if (pred.type !== "L") return "tide-tip--high";
    if (pred.v <= 0) return "tide-tip--prime";
    if (pred.v <= 1.5) return "tide-tip--good";
    if (pred.v <= 3) return "tide-tip--ok";
    return "tide-tip--meh";
  }

  async function loadTideForecast() {
    const station = SJI.TIDE_STATION || { id: "9449834", days: 3 };
    const body = document.getElementById("tide-table-body");
    const nowEl = document.getElementById("tide-now");
    const idEl = document.getElementById("tide-station-id");
    if (idEl) idEl.textContent = station.id;

    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + (station.days || 3) - 1);

    const url =
      "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?" +
      new URLSearchParams({
        begin_date: ymdLocal(start),
        end_date: ymdLocal(end),
        station: station.id,
        product: "predictions",
        datum: station.datum || "MLLW",
        time_zone: "lst_ldt",
        interval: "hilo",
        units: station.units || "english",
        application: "SanJuanIslandsInteractive",
        format: "json"
      }).toString();

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`NOAA HTTP ${res.status}`);
      const data = await res.json();
      if (data.error?.message) throw new Error(data.error.message);
      const predictions = (data.predictions || [])
        .map((p) => {
          const dt = parseNoaaLocal(p.t);
          const v = parseFloat(p.v);
          return {
            t: p.t,
            type: p.type, // H | L
            v,
            dt
          };
        })
        .filter((p) => p.dt && !Number.isNaN(p.v));

      if (!predictions.length) throw new Error("No predictions returned");

      tideCache = {
        ok: true,
        station,
        predictions,
        fetchedAt: new Date()
      };
      renderTideForecast(tideCache);
    } catch (err) {
      console.warn("[SJI] tide forecast failed:", err);
      tideCache = { ok: false, error: String(err?.message || err) };
      if (body) {
        body.innerHTML = `<tr><td colspan="5" class="tide-error">Could not load live tides. <a href="${
          station.noaaUrl || "https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=9449834"
        }" target="_blank" rel="noopener noreferrer">Open NOAA chart</a> for station ${station.id}.</td></tr>`;
      }
      if (nowEl) {
        nowEl.innerHTML = `<span class="tide-now-label">Forecast unavailable</span>
          <a class="tide-now-link" href="${
            station.noaaUrl || "https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=9449834"
          }" target="_blank" rel="noopener noreferrer">NOAA →</a>`;
      }
    }
  }

  function renderTideForecast(cache) {
    const body = document.getElementById("tide-table-body");
    const nowEl = document.getElementById("tide-now");
    if (!cache?.ok || !body) return;

    const now = new Date();
    const preds = cache.predictions;

    body.innerHTML = preds
      .map((p) => {
        const isPast = p.dt < now;
        const kind = p.type === "L" ? (kidMode() ? "Low" : "Low") : kidMode() ? "High" : "High";
        const height = `${p.v.toFixed(1)} ft`;
        const rowClass = [
          p.type === "L" ? "tide-row--low" : "tide-row--high",
          tipClass(p),
          isPast ? "tide-row--past" : "",
          p.type === "L" && p.v <= 0 ? "tide-row--prime" : ""
        ]
          .filter(Boolean)
          .join(" ");
        return `<tr class="${rowClass}">
          <td>${formatDay(p.dt)}</td>
          <td><span class="tide-kind tide-kind--${p.type === "L" ? "low" : "high"}">${kind}</span></td>
          <td>${formatTime(p.dt)}</td>
          <td class="tide-height">${height}</td>
          <td class="tide-tip">${poolTip(p)}</td>
        </tr>`;
      })
      .join("");

    // “Now” summary: next low, and whether we’re falling/rising
    if (nowEl) {
      const upcoming = preds.filter((p) => p.dt >= now);
      const nextLow = upcoming.find((p) => p.type === "L");
      const nextAny = upcoming[0];
      const prev = [...preds].reverse().find((p) => p.dt < now);

      let phase = "";
      if (prev && nextAny) {
        if (prev.type === "H" && nextAny.type === "L") {
          phase = kidMode() ? "Tide is going out" : "Falling toward low";
        } else if (prev.type === "L" && nextAny.type === "H") {
          phase = kidMode() ? "Tide is coming in" : "Rising toward high";
        }
      }

      let summary = "";
      if (nextLow) {
        const when = formatTime(nextLow.dt);
        const day = formatDay(nextLow.dt);
        const prime = nextLow.v <= 0;
        summary = kidMode()
          ? `Next low: <strong>${when}</strong> (${day}) · ${nextLow.v.toFixed(1)} ft${
              prime ? " · great for pools!" : ""
            }`
          : `Next low <strong>${when}</strong> ${day === "Today" ? "" : "· " + day} · <strong>${nextLow.v.toFixed(
              1
            )} ft</strong> MLLW${prime ? " · minus tide" : ""}`;
      } else {
        summary = kidMode()
          ? "Check the table for the next low tide."
          : "See the table for upcoming lows in this window.";
      }

      nowEl.innerHTML = `
        ${phase ? `<span class="tide-phase">${phase}</span>` : ""}
        <span class="tide-now-label">${summary}</span>
        <a class="tide-now-link" href="${
          cache.station.noaaUrl || "https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=9449834"
        }" target="_blank" rel="noopener noreferrer">Full NOAA chart →</a>`;
    }
  }

  /* ========== Best tide-pool spots ========== */

  function buildTideSpots() {
    const grid = document.getElementById("tide-spots-grid");
    if (!grid || !SJI.TIDE_SPOTS) return;

    grid.innerHTML = SJI.TIDE_SPOTS.map((s) => {
      const icon = SJI.icon(SPOT_ICONS[s.id] || "seastar");
      const body = kidMode() ? s.bodyKid : s.body;
      const badge = s.best
        ? `<span class="tide-spot-badge">${kidMode() ? "Best on the island" : "NPS · best on island"}</span>`
        : "";
      const mapId =
        s.id === "lime-kiln-pools"
          ? "lime-kiln"
          : s.id === "grannys-cove" || s.id === "cattle-point" || s.id === "south-beach"
            ? s.id
            : "";
      const mapHint = mapId
        ? `<button type="button" class="tide-spot-map" data-map-place="${mapId}">${
            kidMode() ? "Show on map" : "Show on map"
          }</button>`
        : "";
      const link = s.link
        ? `<a class="tide-spot-ext" href="${s.link}" target="_blank" rel="noopener noreferrer">${
            kidMode() ? "Park tips" : "NPS tide-pooling guide"
          } ↗</a>`
        : "";

      return `
        <article class="tide-spot-card${s.best ? " tide-spot-card--best" : ""}" role="listitem" data-spot="${s.id}">
          <div class="tide-spot-top">
            <span class="tide-spot-icon" aria-hidden="true">${icon}</span>
            <div>
              ${badge}
              <h4 class="tide-spot-name">${s.name}</h4>
              <p class="tide-spot-area">${s.area}</p>
            </div>
          </div>
          <p class="tide-spot-body">${body}</p>
          ${s.tips ? `<p class="tide-spot-tips">${s.tips}</p>` : ""}
          <div class="tide-spot-actions">${mapHint}${link}</div>
        </article>`;
    }).join("");

    grid.querySelectorAll("[data-map-place]").forEach((btn) => {
      btn.addEventListener("click", () => showSpotOnMap(btn.dataset.mapPlace));
    });
  }

  function showSpotOnMap(placeId) {
    // Activate Places layer on both chart + live map
    document.querySelectorAll(".layer-btn[data-layer]").forEach((b) => {
      const on = b.dataset.layer === "places";
      b.classList.toggle("active", on);
    });
    SJI.map?.setLayer?.("places");
    SJI.livemap?.setLayer?.("places");

    // Prefer live map view so the pin is obvious
    const liveBtn = document.querySelector('.layer-btn[data-map-view="live"]');
    if (liveBtn && !liveBtn.classList.contains("active")) liveBtn.click();

    const g = SJI.GEO?.places?.[placeId];
    if (g) {
      // Brief delay so live map is visible before fly
      setTimeout(() => {
        if (SJI.livemap?.focus) SJI.livemap.focus(g.lat, g.lng, 13);
        else SJI.livemap?.flyTo?.(g.lat, g.lng, 13);
      }, 180);
    }

    document.getElementById("map")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  SJI.tidepool = { init, selectCreature, selectZone, refreshText, loadTideForecast };
})();
