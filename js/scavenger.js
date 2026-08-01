/**
 * Printable kid scavenger hunt sheet
 */
(function () {
  const ITEMS = [
    { id: "eagle", icon: "🦅", label: "Bald eagle", hint: "White head in a tall fir" },
    { id: "orca", icon: "🐋", label: "Orca (or tall fin)", hint: "From shore at Lime Kiln — if lucky!" },
    { id: "seal", icon: "🦭", label: "Harbor seal", hint: "Banana-pose on a rock" },
    { id: "madrona", icon: "🌳", label: "Madrona tree", hint: "Cinnamon bark that peels" },
    { id: "ferry", icon: "⛴️", label: "Washington State Ferry", hint: "Big green-and-white boat" },
    { id: "lighthouse", icon: "🗼", label: "A lighthouse", hint: "Lime Kiln or Cattle Point" },
    { id: "kelp", icon: "🌿", label: "Bull kelp", hint: "Long seaweed floats by shore" },
    { id: "heron", icon: "🦩", label: "Great blue heron", hint: "Tall bird standing still in shallows" },
    { id: "deer", icon: "🦌", label: "Black-tailed deer", hint: "Quiet edges of forests & fields" },
    { id: "tidepool", icon: "⭐", label: "Tidepool creature", hint: "Sea star, anemone, or hermit crab" },
    { id: "wave", icon: "👋", label: "Friendly Lopez wave", hint: "On Lopez, wave at every passerby!" },
    { id: "mountain", icon: "⛰️", label: "A mountain view", hint: "Mt. Constitution or distant Olympics" }
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
