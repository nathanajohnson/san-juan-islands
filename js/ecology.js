/**
 * Ecology cross-section layer explorer
 */
(function () {
  function init() {
    const visual = document.getElementById("cross-visual");
    if (!visual) return;

    const hits = visual.querySelectorAll(".hit, .layer-label");
    hits.forEach((el) => {
      const layer = el.dataset.layer;
      el.addEventListener("click", () => selectLayer(layer));
      el.addEventListener("mouseenter", () => previewLayer(layer));
      el.addEventListener("mouseleave", () => {
        if (!visual.dataset.locked) clearPreview();
      });
    });

    // Keyboard labels
    visual.querySelectorAll(".layer-label").forEach((btn) => {
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectLayer(btn.dataset.layer);
        }
      });
    });
  }

  function previewLayer(layer) {
    const visual = document.getElementById("cross-visual");
    visual.classList.add("layer-active");
    visual.querySelectorAll(".eco-layer").forEach((el) => {
      el.classList.toggle("active-layer", el.dataset.layer === layer);
    });
  }

  function clearPreview() {
    const visual = document.getElementById("cross-visual");
    if (visual.dataset.locked) {
      const locked = visual.dataset.locked;
      visual.querySelectorAll(".eco-layer").forEach((el) => {
        el.classList.toggle("active-layer", el.dataset.layer === locked);
      });
      return;
    }
    visual.classList.remove("layer-active");
    visual.querySelectorAll(".eco-layer").forEach((el) => el.classList.remove("active-layer"));
  }

  function selectLayer(layer) {
    const data = SJI.ECOLOGY[layer];
    if (!data) return;

    const visual = document.getElementById("cross-visual");
    visual.dataset.locked = layer;
    visual.classList.add("layer-active");
    visual.querySelectorAll(".eco-layer").forEach((el) => {
      el.classList.toggle("active-layer", el.dataset.layer === layer);
    });
    visual.querySelectorAll(".layer-label").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.layer === layer);
    });

    const kid = document.body.classList.contains("kid-mode");
    document.getElementById("cross-title").textContent = data.title;
    document.getElementById("cross-body").textContent = kid ? data.bodyKid : data.body;
    document.getElementById("cross-species").innerHTML = data.species
      .map((s) => `<li><span class="sp-emoji">${s.emoji}</span><span>${s.name}</span></li>`)
      .join("");
  }

  function refreshText() {
    const visual = document.getElementById("cross-visual");
    if (visual?.dataset.locked) selectLayer(visual.dataset.locked);
  }

  SJI.ecology = { init, selectLayer, refreshText };
})();
