/**
 * Printable kid scavenger hunt sheet
 */
(function () {
  /** San Juan Island only — things you can find on-island or from its shores */
  const ITEMS = [
    { id: "eagle", icon: "eagle", label: "Bald eagle", hint: "White head in a tall fir" },
    { id: "orca", icon: "orca-fin", label: "Orca (or tall fin)", hint: "From shore at Lime Kiln — if lucky!" },
    { id: "seal", icon: "sea-lion", label: "Harbor seal", hint: "Banana-pose on a rock or reef" },
    { id: "madrona", icon: "madrona-leaf", label: "Madrona tree", hint: "Cinnamon bark that peels" },
    { id: "ferry", icon: "ferry", label: "Washington State Ferry", hint: "At Friday Harbor terminal" },
    { id: "lighthouse", icon: "lighthouse", label: "A lighthouse", hint: "Lime Kiln or Cattle Point" },
    { id: "ochre-star", icon: "seastar", label: "Ochre sea star", hint: "Purple or orange on low-tide rocks" },
    { id: "anemone", icon: "anemone", label: "Sea anemone", hint: "Soft “flower” in a pool — try Granny’s Cove" },
    { id: "hermit", icon: "crab", label: "Hermit crab", hint: "Shell with legs — check a pool" },
    { id: "barnacle", icon: "barnacle", label: "Barnacle bed", hint: "White volcano crusts high on rock" },
    { id: "rockweed", icon: "seaweed", label: "Rockweed", hint: "Rubbery olive seaweed on mid-shore rocks" },
    { id: "deer", icon: "deer", label: "Black-tailed deer", hint: "Forest edges, fields, quiet roads" },
    { id: "camp", icon: "camp", label: "Pig War camp", hint: "American Camp or English Camp" },
    { id: "fox", icon: "fox", label: "Red fox", hint: "Fields and roadsides at dusk" },
    { id: "olympics", icon: "peak", label: "Olympic Mountains view", hint: "From the west side on a clear day" }
  ];

  function build() {
    const grid = document.getElementById("scavenger-grid");
    if (!grid) return;

    grid.innerHTML = ITEMS.map(
      (item) => `
      <label class="scav-item">
        <input type="checkbox" data-scav="${item.id}" />
        <span class="scav-box" aria-hidden="true">${SJI.icon("check-stamp", "scav-stamp")}</span>
        <span class="scav-icon" aria-hidden="true">${SJI.icon(item.icon)}</span>
        <span class="scav-text">
          <strong>${item.label}</strong>
          <em>${item.hint}</em>
        </span>
      </label>`
    ).join("");

    // Restore checks
    try {
      const saved = JSON.parse(localStorage.getItem("sji-scavenger") || "{}");
      grid.querySelectorAll("input[data-scav]").forEach((inp) => {
        if (saved[inp.dataset.scav]) inp.checked = true;
        inp.addEventListener("change", persist);
      });
    } catch (_) {
      /* ignore */
    }

    document.getElementById("scavenger-print")?.addEventListener("click", () => {
      window.print();
    });

    document.getElementById("scavenger-reset")?.addEventListener("click", () => {
      grid.querySelectorAll("input[type=checkbox]").forEach((i) => {
        i.checked = false;
      });
      persist();
    });

    updateCount();
  }

  function persist() {
    const data = {};
    document.querySelectorAll("#scavenger-grid input[data-scav]").forEach((inp) => {
      data[inp.dataset.scav] = inp.checked;
    });
    localStorage.setItem("sji-scavenger", JSON.stringify(data));
    updateCount();
  }

  function updateCount() {
    const all = document.querySelectorAll("#scavenger-grid input[data-scav]");
    const n = [...all].filter((i) => i.checked).length;
    const el = document.getElementById("scavenger-count");
    if (el) el.textContent = `${n} / ${all.length} found`;
  }

  SJI.scavenger = { build };
})();
