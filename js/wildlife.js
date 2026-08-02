/**
 * Wildlife field guide grid + modal — "Chart & Current" field-guide styling.
 * Emoji in data.js are replaced at render time with sprite icons (SJI.icon).
 * Playable sound clips live under assets/sounds/ (illustrative field-guide audio).
 */
(function () {
  let activeFilter = "all";
  let audioEl = null;
  let playingId = null;

  /* Sprite icon per species id (falls back by type) */
  const ICON_BY_ID = {
    orca: "orca", eagle: "eagle", seal: "sea-lion", porpoise: "orca-fin",
    deer: "deer", oystercatcher: "oystercatcher", heron: "heron",
    madrona: "madrona-leaf", kelp: "kelp", "garry-oak": "oak-leaf",
    fox: "fox", rabbit: "rabbit", steller: "sea-lion", murrelet: "murrelet",
    salmon: "salmon", bluebird: "bluebird", anemone: "anemone",
    "ochre-star": "seastar", chiton: "chiton", sculpin: "sculpin",
    hermit: "crab", barnacle: "barnacle", mussel: "mussel", urchin: "urchin",
    rockweed: "seaweed", "sea-lettuce": "seaweed"
  };
  const ICON_BY_TYPE = { mammal: "deer", bird: "heron", marine: "wave", plant: "fern" };
  const FILTER_ICONS = {
    all: "compass", mammal: "fox", bird: "eagle",
    marine: "orca-fin", tidepool: "seastar", plant: "madrona-leaf"
  };

  /* Species with animal vocalizations vs. habitat field recordings */
  const VOCAL = new Set([
    "orca", "eagle", "seal", "porpoise", "deer", "oystercatcher", "heron",
    "fox", "rabbit", "steller", "murrelet", "bluebird", "salmon", "hermit"
  ]);

  function iconFor(w) {
    return ICON_BY_ID[w.id] || ICON_BY_TYPE[w.type] || "marker";
  }

  function typeLabelFor(w) {
    return w.tags?.includes("tidepool")
      ? "tidepool"
      : w.type === "marine" ? "marine life" : w.type;
  }

  function build() {
    const grid = document.getElementById("wildlife-grid");
    if (!grid || !SJI.WILDLIFE) return;

    grid.innerHTML = SJI.WILDLIFE.map((w, i) => {
      const photo = SJI.PHOTOS?.wildlife?.[w.id];
      const badge = `<span class="wild-badge" aria-hidden="true">${SJI.icon(iconFor(w))}</span>`;
      /* Eager for first row-ish cards so mobile shows photos without a filter
         click; lazy for the rest once the grid is in view. */
      const loading = i < 6 ? "eager" : "lazy";
      const media = photo
        ? `<div class="wild-photo"><img src="${photo}" alt="" loading="${loading}" decoding="async" />${badge}</div>`
        : `<div class="wild-photo wild-photo--icon" aria-hidden="true">${SJI.icon(iconFor(w), "icon-xl")}${badge}</div>`;
      return `
      <article class="wild-card has-photo" data-id="${w.id}" data-type="${w.type}" data-tags="${w.tags.join(" ")}"
        tabindex="0" role="button" aria-label="Learn about ${w.name}"
        style="animation-delay: ${Math.min(i, 12) * 0.04}s">
        ${media}
        <div class="wild-meta">
          <h3>${w.name}</h3>
          <p class="wild-latin">${w.latin}</p>
          <p class="wild-type">${typeLabelFor(w)}</p>
        </div>
      </article>`;
    }).join("");

    grid.querySelectorAll(".wild-card").forEach((card) => {
      card.addEventListener("click", () => openModal(card.dataset.id));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(card.dataset.id);
        }
      });
    });

    document.querySelectorAll("#wildlife-filters .filter-btn").forEach((btn) => {
      /* Sprite icon chip prefix (once) */
      if (!btn.querySelector(".icon")) {
        const name = FILTER_ICONS[btn.dataset.filter] || "compass";
        btn.insertAdjacentHTML("afterbegin", SJI.icon(name));
      }
      btn.addEventListener("click", () => {
        document.querySelectorAll("#wildlife-filters .filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeFilter = btn.dataset.filter;
        applyFilter();
        /* Ensure grid is visible if user interacts before scroll-reveal fires */
        grid.classList.add("visible");
        document.getElementById("wildlife-filters")?.classList.add("visible");
      });
    });

    const modal = document.getElementById("wildlife-modal");
    modal?.querySelectorAll("[data-close-modal]").forEach((el) => {
      el.addEventListener("click", closeModal);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  function applyFilter() {
    document.querySelectorAll(".wild-card").forEach((card) => {
      const type = card.dataset.type;
      const tags = card.dataset.tags;
      let show = activeFilter === "all";
      if (activeFilter === "mammal") show = type === "mammal";
      if (activeFilter === "bird") show = type === "bird";
      if (activeFilter === "marine") show = tags.includes("marine") || type === "marine";
      if (activeFilter === "tidepool") show = tags.includes("tidepool");
      if (activeFilter === "plant") show = type === "plant";
      card.classList.toggle("hidden", !show);
    });
  }

  function openModal(id) {
    const w = SJI.WILDLIFE.find((x) => x.id === id);
    if (!w) return;
    const kid = document.body.classList.contains("kid-mode");
    const modal = document.getElementById("wildlife-modal");

    const photo = SJI.PHOTOS?.wildlife?.[w.id];
    const emojiEl = document.getElementById("wm-emoji");
    const photoEl = document.getElementById("wm-photo");
    if (photoEl) {
      if (photo) {
        photoEl.hidden = false;
        photoEl.src = photo;
        photoEl.alt = w.name;
        if (emojiEl) emojiEl.hidden = true;
      } else {
        photoEl.hidden = true;
        photoEl.removeAttribute("src");
        if (emojiEl) {
          emojiEl.hidden = false;
          emojiEl.innerHTML = SJI.icon(iconFor(w), "icon-xl");
        }
      }
    } else if (emojiEl) {
      emojiEl.hidden = false;
      emojiEl.innerHTML = SJI.icon(iconFor(w), "icon-xl");
    }
    const badgeEl = document.getElementById("wm-badge");
    if (badgeEl) badgeEl.innerHTML = SJI.icon(iconFor(w));

    const typeLabel = typeLabelFor(w);
    document.getElementById("wm-type").textContent = typeLabel;
    document.getElementById("wm-title").textContent = w.name;
    document.getElementById("wm-latin").textContent = w.latin;
    document.getElementById("wm-body").textContent = kid ? w.bodyKid : w.body;
    document.getElementById("wm-fun").textContent = w.fun;
    document.getElementById("wm-tags").innerHTML = w.tags
      .map((t) => `<span>${t}</span>`)
      .join("");

    setupSound(w);

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".wm-close")?.focus();
  }

  function stopSound() {
    if (audioEl) {
      audioEl.pause();
      audioEl.currentTime = 0;
      audioEl = null;
    }
    playingId = null;
    const btn = document.getElementById("wm-sound");
    if (btn) {
      btn.classList.remove("is-playing");
      btn.setAttribute("aria-pressed", "false");
      const label = btn.querySelector(".wm-sound-label");
      if (label && btn.dataset.idleLabel) label.textContent = btn.dataset.idleLabel;
    }
  }

  function setupSound(w) {
    const wrap = document.getElementById("wm-sound-wrap");
    const btn = document.getElementById("wm-sound");
    const hint = document.getElementById("wm-sound-hint");
    stopSound();
    if (!wrap || !btn) return;

    if (!w.sound) {
      wrap.hidden = true;
      return;
    }
    wrap.hidden = false;
    const vocal = VOCAL.has(w.id);
    const idle = vocal ? "Play sound" : "Play habitat sound";
    btn.dataset.idleLabel = idle;
    btn.dataset.sound = w.sound;
    btn.dataset.id = w.id;
    btn.classList.remove("is-playing");
    btn.setAttribute("aria-pressed", "false");
    const label = btn.querySelector(".wm-sound-label");
    if (label) label.textContent = idle;
    if (hint) {
      hint.textContent = vocal
        ? "Real field recording (short clip for local learning)."
        : "Real habitat recording — these species are mostly silent to our ears.";
    }
  }

  function toggleSound() {
    const btn = document.getElementById("wm-sound");
    if (!btn || !btn.dataset.sound) return;
    const id = btn.dataset.id;
    if (playingId === id && audioEl && !audioEl.paused) {
      stopSound();
      return;
    }
    stopSound();
    audioEl = new Audio(btn.dataset.sound);
    audioEl.preload = "auto";
    playingId = id;
    btn.classList.add("is-playing");
    btn.setAttribute("aria-pressed", "true");
    const label = btn.querySelector(".wm-sound-label");
    if (label) label.textContent = "Stop";
    audioEl.addEventListener("ended", stopSound);
    audioEl.addEventListener("error", () => {
      stopSound();
      const hint = document.getElementById("wm-sound-hint");
      if (hint) hint.textContent = "Sound could not be loaded.";
    });
    audioEl.play().catch(() => stopSound());
  }

  function closeModal() {
    const modal = document.getElementById("wildlife-modal");
    if (!modal || modal.hidden) return;
    stopSound();
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  // Wire sound button once
  document.getElementById("wm-sound")?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleSound();
  });

  SJI.wildlife = { build, openModal, closeModal, stopSound };
})();
