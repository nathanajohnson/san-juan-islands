/**
 * Printable kid scavenger hunt sheet
 */
(function () {
  /** San Juan Island only — things you can find on-island or from its shores */
  const ITEMS = [
    { id: "eagle", icon: "🦅", label: "Bald eagle", hint: "White head in a tall fir" },
    { id: "orca", icon: "🐋", label: "Orca (or tall fin)", hint: "From shore at Lime Kiln — if lucky!" },
    { id: "seal", icon: "🦭", label: "Harbor seal", hint: "Banana-pose on a rock or reef" },
    { id: "madrona", icon: "🌳", label: "Madrona tree", hint: "Cinnamon bark that peels" },
    { id: "ferry", icon: "⛴️", label: "Washington State Ferry", hint: "At Friday Harbor terminal" },
    { id: "lighthouse", icon: "🗼", label: "A lighthouse", hint: "Lime Kiln or Cattle Point" },
    { id: "ochre-star", icon: "⭐", label: "Ochre sea star", hint: "Purple or orange on low-tide rocks" },
    { id: "anemone", icon: "🪸", label: "Sea anemone", hint: "Soft “flower” in a tidepool" },
    { id: "hermit", icon: "🦀", label: "Hermit crab", hint: "Shell with legs — check a pool" },
    { id: "barnacle", icon: "⚪", label: "Barnacle bed", hint: "White volcano crusts high on rock" },
    { id: "rockweed", icon: "🥬", label: "Rockweed", hint: "Rubbery olive seaweed on mid-shore rocks" },
    { id: "deer", icon: "🦌", label: "Black-tailed deer", hint: "Forest edges, fields, quiet roads" },
    { id: "camp", icon: "🏕️", label: "Pig War camp", hint: "American Camp or English Camp" },
    { id: "fox", icon: "🦊", label: "Red fox", hint: "Fields and roadsides at dusk" },
    { id: "olympics", icon: "⛰️", label: "Olympic Mountains view", hint: "From the west side on a clear day" }
  ];

  function build() {
    const grid = document.getElementById("scavenger-grid");
    if (!grid) return;

    grid.innerHTML = ITEMS.map(
      (item) => `
      <label class="scav-item">
        <input type="checkbox" data-scav="${item.id}" />
        <span class="scav-box" aria-hidden="true"></span>
        <span class="scav-icon" aria-hidden="true">${item.icon}</span>
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
