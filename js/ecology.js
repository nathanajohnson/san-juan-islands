/**
 * Ecology cross-section layer explorer — painterly transect ("Chart & Current")
 */
(function () {
  // Sprite icon per species row (zero emoji — brief §4)
  const ICON_BY_NAME = {
    "Bald eagle": "eagle",
    "Douglas fir": "fir",
    "Pacific madrona": "madrona-leaf",
    "Barred owl": "owl",
    "Black-tailed deer": "deer",
    "Forest fungi": "fungi",
    "Sword fern & salal": "fern",
    "Red fox": "fox",
    "Ochre sea star": "seastar",
    "Black oystercatcher": "oystercatcher",
    "Harbor seal": "sea-lion",
    "Mussels & barnacles": "mussel",
    "Bull kelp": "kelp",
    "Juvenile salmon": "salmon",
    "Rockfish": "sculpin",
    "Sea urchins": "urchin",
    "Orcas": "orca",
    "Dall’s porpoise": "orca-fin",
    "Shipping lanes": "ship",
    "Minke whale": "orca-fin"
  };

  const LAYER_META = {
    canopy: { photo: "eagle", tag: "Stratum I · above the tide" },
    forest: { photo: "deer", tag: "Stratum II · understory" },
    intertidal: { photo: "ochre-star", tag: "Stratum III · between tides" },
    kelp: { photo: "kelp", tag: "Stratum IV · the kelp forest" },
    deep: { photo: "orca", tag: "Stratum V · the channels" }
  };

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

    // Panel legend rows double as layer selectors
    document.querySelectorAll("#cross-default .legend-row").forEach((btn) => {
      btn.addEventListener("click", () => selectLayer(btn.dataset.layer));
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
    const meta = LAYER_META[layer] || {};

    const eyebrow = document.getElementById("cross-eyebrow");
    if (eyebrow) eyebrow.textContent = meta.tag || "Layer";

    document.getElementById("cross-title").textContent = data.title;
    document.getElementById("cross-body").textContent = kid ? data.bodyKid : data.body;

    // Layer photo
    const wrap = document.getElementById("cross-photo-wrap");
    const img = document.getElementById("cross-photo");
    const photo = meta.photo ? SJI.PHOTOS?.wildlife?.[meta.photo] : null;
    if (wrap && img) {
      if (photo) {
        wrap.hidden = false;
        img.src = photo;
        img.alt = data.title;
      } else {
        wrap.hidden = true;
        img.removeAttribute("src");
        img.alt = "";
      }
    }

    // Species rows with sprite icons
    document.getElementById("cross-species").innerHTML = data.species
      .map(
        (s) =>
          `<li><span class="sp-icon" aria-hidden="true">${SJI.icon(ICON_BY_NAME[s.name] || "wave")}</span><span>${s.name}</span></li>`
      )
      .join("");

    // Rich default block yields to the layer detail
    const def = document.getElementById("cross-default");
    if (def) def.hidden = true;
  }

  function refreshText() {
    const visual = document.getElementById("cross-visual");
    if (visual?.dataset.locked) selectLayer(visual.dataset.locked);
  }

  SJI.ecology = { init, selectLayer, refreshText };
})();
