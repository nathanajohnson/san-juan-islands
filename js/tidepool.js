/**
 * Tidepool / rocky shore explorer
 */
(function () {
  let selectedId = null;
  let selectedZone = null;

  function init() {
    const root = document.getElementById("tidepool");
    if (!root || !SJI.TIDEPOOL) return;

    buildCreatureChips();
    bindVisual();
    bindZones();
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
        <span class="tp-chip-emoji" aria-hidden="true">${c.emoji}</span>
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
    });
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

    renderPanel({
      eyebrow: c.kind === "plant" ? `${zoneLabel(c.zone)} · plant` : zoneLabel(c.zone),
      title: c.name,
      latin: c.latin,
      emoji: c.emoji,
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
      emoji: zoneEmoji(zone),
      body: kidMode() ? z.bodyKid : z.body,
      fun: "",
      photoId: null
    });
  }

  function zoneLabel(zone) {
    return SJI.TIDEPOOL.zones[zone]?.title || zone;
  }

  function zoneEmoji(zone) {
    return { splash: "💨", high: "🪨", mid: "🌊", low: "🫧" }[zone] || "🌊";
  }

  function renderPanel({ eyebrow, title, latin, emoji, body, fun, photoId }) {
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
    if (emojiEl) emojiEl.textContent = emoji || "";

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
    renderPanel({
      eyebrow: "How to explore",
      title: "A living shoreline",
      latin: "",
      emoji: "🌊",
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
