/**
 * Wildlife field guide grid + modal
 */
(function () {
  let activeFilter = "all";

  function build() {
    const grid = document.getElementById("wildlife-grid");
    if (!grid || !SJI.WILDLIFE) return;

    grid.innerHTML = SJI.WILDLIFE.map((w, i) => {
      const photo = SJI.PHOTOS?.wildlife?.[w.id];
      const media = photo
        ? `<div class="wild-photo"><img src="${photo}" alt="" loading="lazy" /><span class="wild-emoji-badge" aria-hidden="true">${w.emoji}</span></div>`
        : `<div class="wild-emoji" aria-hidden="true">${w.emoji}</div>`;
      return `
      <article class="wild-card ${photo ? "has-photo" : ""}" data-id="${w.id}" data-type="${w.type}" data-tags="${w.tags.join(" ")}"
        tabindex="0" role="button" aria-label="Learn about ${w.name}"
        style="animation-delay: ${i * 0.04}s">
        ${media}
        <h3>${w.name}</h3>
        <p class="wild-type">${w.tags?.includes("tidepool") ? "tidepool" : w.type === "marine" ? "marine life" : w.type}</p>
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
      btn.addEventListener("click", () => {
        document.querySelectorAll("#wildlife-filters .filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeFilter = btn.dataset.filter;
        applyFilter();
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
          emojiEl.textContent = w.emoji;
        }
      }
    } else if (emojiEl) {
      emojiEl.hidden = false;
      emojiEl.textContent = w.emoji;
    }
    const typeLabel = w.tags?.includes("tidepool")
      ? "Tidepool"
      : w.type === "marine"
        ? "Marine life"
        : w.type;
    document.getElementById("wm-type").textContent = typeLabel;
    document.getElementById("wm-title").textContent = w.name;
    document.getElementById("wm-latin").textContent = w.latin;
    document.getElementById("wm-body").textContent = kid ? w.bodyKid : w.body;
    document.getElementById("wm-fun").textContent = w.fun;
    document.getElementById("wm-tags").innerHTML = w.tags
      .map((t) => `<span>${t}</span>`)
      .join("");

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".wm-close")?.focus();
  }

  function closeModal() {
    const modal = document.getElementById("wildlife-modal");
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  SJI.wildlife = { build, openModal, closeModal };
})();
