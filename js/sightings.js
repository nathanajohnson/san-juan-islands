/**
 * Live whale-report feed for the traffic map + live cartography.
 *
 * Primary path: GET /api/sightings from local server.py (no CORS issues).
 * Fallbacks: public CORS proxies → sample San Juan set.
 *
 * Educational use — not an official Orca Network product.
 */
(function () {
  const STATUS_EL = () => document.getElementById("sightings-status");
  const LIST_EL = () => document.getElementById("sightings-list");

  const FALLBACK = [
    {
      id: "fb1",
      species: "Bigg's killer whales",
      kind: "biggs",
      group: "T65As",
      location: "Haro Strait · west of Lime Kiln",
      when: "Sample",
      note: "Typical summer mammal-hunter track along the west side of San Juan Island.",
      lat: 48.52,
      lng: -123.16,
      source: "Sample (offline fallback)"
    },
    {
      id: "fb2",
      species: "Southern Resident killer whales",
      kind: "resident",
      group: "J pod",
      location: "Haro Strait",
      when: "Sample",
      note: "Residents pulse through inland waters with Chinook runs — highly variable year to year.",
      lat: 48.56,
      lng: -123.17,
      source: "Sample (offline fallback)"
    },
    {
      id: "fb3",
      species: "Bigg's killer whales",
      kind: "biggs",
      group: "T37s",
      location: "Rosario Strait",
      when: "Sample",
      note: "Transients often work seal haul-outs along Rosario.",
      lat: 48.55,
      lng: -122.78,
      source: "Sample (offline fallback)"
    },
    {
      id: "fb4",
      species: "Humpback whale",
      kind: "humpback",
      group: "",
      location: "Boundary Pass",
      when: "Sample",
      note: "Humpbacks have returned to the Salish Sea in growing numbers since the 2000s.",
      lat: 48.72,
      lng: -123.12,
      source: "Sample (offline fallback)"
    },
    {
      id: "fb5",
      species: "Harbor porpoise",
      kind: "other",
      group: "",
      location: "San Juan Channel",
      when: "Sample",
      note: "Small groups frequent quieter channels between the ferry islands.",
      lat: 48.58,
      lng: -122.98,
      source: "Sample (offline fallback)"
    },
    {
      id: "fb6",
      species: "Bigg's killer whales",
      kind: "biggs",
      group: "T124s",
      location: "Turn Point · Stuart Island",
      when: "Sample",
      note: "Sharp turn at Boundary Pass / Haro — busy for ships and whales alike.",
      lat: 48.69,
      lng: -123.22,
      source: "Sample (offline fallback)"
    },
    {
      id: "fb7",
      species: "Minke whale",
      kind: "other",
      group: "",
      location: "Off Cattle Point",
      when: "Sample",
      note: "Minkes are solitary and often overlooked near the south end of San Juan Island.",
      lat: 48.45,
      lng: -122.97,
      source: "Sample (offline fallback)"
    },
    {
      id: "fb8",
      species: "Southern Resident killer whales",
      kind: "resident",
      group: "L pod",
      location: "South of Lopez · Strait of Juan de Fuca",
      when: "Sample",
      note: "L pod ranges widely; inland visits cluster when salmon move.",
      lat: 48.42,
      lng: -122.88,
      source: "Sample (offline fallback)"
    }
  ];

  // Expanded aliases (client-side parse path)
  const EXTRA_PLACES = {
    "san juans": [48.55, -122.98],
    "puget sound": [47.7, -122.45],
    "south puget sound": [47.25, -122.55],
    "north puget sound": [48.0, -122.45],
    "possession sound": [47.98, -122.25],
    "hood canal": [47.6, -122.9],
    "bellingham": [48.75, -122.48],
    "penn cove": [48.23, -122.7],
    "saratoga passage": [48.1, -122.5],
    "deception pass": [48.41, -122.64],
    "port townsend": [48.12, -122.76],
    "edmonds": [47.81, -122.38],
    "everett": [47.98, -122.2],
    "seattle": [47.61, -122.35],
    "tacoma": [47.25, -122.45],
    "vashon": [47.42, -122.46],
    "race rocks": [48.3, -123.53]
  };

  let current = [];
  let live = false;
  let lastSource = "";

  function setStatus(msg, kind) {
    const el = STATUS_EL();
    if (!el) return;
    el.textContent = msg;
    el.dataset.kind = kind || "info";
  }

  function decodeEntities(str) {
    const t = document.createElement("textarea");
    t.innerHTML = str;
    return t.value;
  }

  function resolveCoords(text) {
    if (!text) return null;
    // Explicit coordinates in report text
    const cm = text.match(/(\d{2}\.\d{3,7})\s*,\s*(-1\d{2}\.\d{3,7})/);
    if (cm) {
      return { lat: parseFloat(cm[1]), lng: parseFloat(cm[2]), matched: `${cm[1]}, ${cm[2]}` };
    }
    const lower = text.toLowerCase();
    const aliases = { ...(SJI.GEO?.placeAliases || {}), ...EXTRA_PLACES };
    const keys = Object.keys(aliases).sort((a, b) => b.length - a.length);
    for (const key of keys) {
      if (lower.includes(key)) {
        const [lat, lng] = aliases[key];
        return { lat, lng, matched: key };
      }
    }
    return null;
  }

  function classify(species, text) {
    const s = `${species || ""} ${text || ""}`.toLowerCase();
    if (/southern resident|j pod|k pod|l pod|resident killer/.test(s)) return "resident";
    if (/bigg|transient|\bt\d{2}/.test(s)) return "biggs";
    if (/gray whale/.test(s)) return "gray";
    if (/humpback/.test(s)) return "humpback";
    if (/minke|porpoise|dolphin|fin whale/.test(s)) return "other";
    if (/orca|killer whale/.test(s)) return "biggs";
    return "other";
  }

  function parseOrcaNetworkHtml(html, sourceLabel) {
    const sightings = [];
    if (!html || html.length < 800) return sightings;
    if (!/KILLER|HUMPBACK|GRAY WHALE|MINKE|PORPOISE/i.test(html)) return sightings;

    let text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|h\d|li|tr)>/gi, "\n")
      .replace(/<[^>]+>/g, " ");
    text = decodeEntities(text);
    text = text.replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ");

    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 8 && l.length < 500);

    const speciesRe =
      /(BIGG.?S|SOUTHERN RESIDENT|KILLER WHALE|ORCA|HUMPBACK|GRAY WHALE|MINKE|PORPOISE|PACIFIC WHITE.?SIDED|FALSE KILLER|FIN WHALE)/i;
    const dateRe =
      /\b((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\.?,?\s+)?((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(?:,?\s+\d{4})?)/i;

    let currentDate = "";
    let currentSpecies = "";
    const seen = new Set();

    for (const line of lines) {
      const dm = line.match(dateRe);
      if (dm) currentDate = dm[0];

      if (speciesRe.test(line) && line.length < 80) {
        currentSpecies = line.match(speciesRe)[0];
        continue;
      }

      const hasSpecies = speciesRe.test(line);
      if (!hasSpecies && !currentSpecies) continue;
      if (!hasSpecies && !resolveCoords(line) && !/\bT\d{2}/.test(line)) continue;

      const coords = resolveCoords(line);
      if (!coords) continue;
      if (coords.lat < 46.5 || coords.lat > 50.5 || coords.lng > -121.5 || coords.lng < -126.5) continue;

      const speciesMatch = line.match(speciesRe);
      const species = speciesMatch ? speciesMatch[0] : currentSpecies || "Cetacean";
      const group =
        (line.match(/\bT\d{2,3}[A-Z0-9]*s?\b/) || line.match(/\b[JKL]\s*[Pp]od\b/) || [""])[0];
      const key = `${coords.lat.toFixed(3)}|${coords.lng.toFixed(3)}|${group}|${currentDate}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const jitter = ((sightings.length * 17) % 10) * 0.001;
      sightings.push({
        id: "live-" + sightings.length,
        species: species.replace(/\s+/g, " "),
        kind: classify(species, line),
        group,
        location: coords.matched,
        when: currentDate || "Report",
        note: line.slice(0, 220),
        lat: coords.lat + jitter - 0.005,
        lng: coords.lng + (((sightings.length * 13) % 10) * 0.001 - 0.005),
        source: sourceLabel || "Orca Network (parsed)"
      });
      if (sightings.length >= 36) break;
    }
    return sightings;
  }

  function abortableTimeout(ms) {
    if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
      return AbortSignal.timeout(ms);
    }
    const c = new AbortController();
    setTimeout(() => c.abort(), ms);
    return c.signal;
  }

  function monthCandidates(n = 18) {
    const months = [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december"
    ];
    const list = [];
    const d = new Date();
    let y = d.getFullYear();
    let m = d.getMonth(); // 0-based
    for (let i = 0; i < n; i++) {
      list.push({
        month: months[m],
        year: y,
        url: `https://orcanetwork.org/whale_sightings/${months[m]}-${y}-whale-sightings/`
      });
      m -= 1;
      if (m < 0) {
        m = 11;
        y -= 1;
      }
    }
    return list;
  }

  async function fetchText(url, timeoutMs = 10000) {
    const res = await fetch(url, { signal: abortableTimeout(timeoutMs) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  }

  async function fetchViaProxy(url) {
    const proxies = [
      (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
      (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
      (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`
    ];
    for (const make of proxies) {
      try {
        const raw = await fetchText(make(url), 12000);
        // allorigins /get returns JSON wrapper
        if (raw.trim().startsWith("{")) {
          try {
            const j = JSON.parse(raw);
            if (j.contents && j.contents.length > 500) return j.contents;
          } catch (_) {
            /* not json wrapper */
          }
        }
        if (raw && raw.length > 500 && !/too many requests/i.test(raw)) return raw;
      } catch (_) {
        /* try next */
      }
    }
    return null;
  }

  /** Preferred: local server.py proxy */
  async function loadFromLocalApi(forceRefresh) {
    const path = forceRefresh ? "/api/sightings?refresh=1" : "/api/sightings";
    try {
      const res = await fetch(path, { signal: abortableTimeout(45000), cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || !data.ok || !Array.isArray(data.sightings) || data.sightings.length < 2) {
        return null;
      }
      return data;
    } catch (_) {
      return null;
    }
  }

  /** Browser-side: walk months via CORS proxies */
  async function loadFromProxies() {
    const candidates = monthCandidates(18);
    for (const c of candidates) {
      setStatus(`Trying Orca Network · ${c.month} ${c.year}…`, "loading");
      const html = await fetchViaProxy(c.url);
      if (!html) continue;
      const parsed = parseOrcaNetworkHtml(
        html,
        `Orca Network · ${c.month} ${c.year}`
      );
      if (parsed.length >= 2) {
        return {
          ok: true,
          live: true,
          sightings: parsed,
          source: `${c.month} ${c.year}`,
          sourceUrl: c.url,
          count: parsed.length
        };
      }
    }
    return null;
  }

  function applyData(data) {
    current = data.sightings.map((s, i) => ({
      ...s,
      id: s.id || `live-${i}`
    }));
    live = !!data.live;
    lastSource = data.source || data.sourceUrl || "";
    const when = data.refreshed
      ? new Date(data.refreshed).toLocaleTimeString()
      : new Date().toLocaleTimeString();
    setStatus(
      `Live feed · ${current.length} reports from Orca Network (${lastSource}) · ${when}`,
      "live"
    );
    apply();
  }

  function loadFallback(reason) {
    current = FALLBACK.map((s) => ({ ...s }));
    live = false;
    lastSource = "";
    setStatus(
      reason ||
        "Sample sightings only — start with `python3 server.py` for a live Orca Network feed (CORS blocks browser-only fetch).",
      "fallback"
    );
    apply();
  }

  function apply() {
    renderList();
    SJI.livemap?.refreshSightings?.(current);
    SJI.whales?.setSightings?.(current);
  }

  function renderList() {
    const el = LIST_EL();
    if (!el) return;
    if (!current.length) {
      el.innerHTML = "<p class='sightings-empty'>No sightings to show.</p>";
      return;
    }
    el.innerHTML = current
      .map(
        (s) => `
      <article class="sighting-card kind-${s.kind || "other"}" data-id="${s.id}" tabindex="0" role="button">
        <div class="sc-dot" aria-hidden="true"></div>
        <div class="sc-body">
          <h4>${escapeHtml(s.species)}${s.group ? ` · ${escapeHtml(s.group)}` : ""}</h4>
          <p class="sc-meta">${escapeHtml(s.when || "")} · ${escapeHtml(s.location || "Salish Sea")}</p>
          <p class="sc-note">${escapeHtml(s.note || "")}</p>
        </div>
      </article>`
      )
      .join("");

    el.querySelectorAll(".sighting-card").forEach((card) => {
      const go = () => {
        const s = current.find((x) => x.id === card.dataset.id);
        if (!s || s.lat == null) return;
        SJI.livemap?.flyTo?.(s.lat, s.lng, 11);
        document.querySelector('[data-map-view="live"]')?.click();
        document.getElementById("map")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        SJI.whales?.pulseSighting?.(s);
      };
      card.addEventListener("click", go);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          go();
        }
      });
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function refresh(force) {
    setStatus("Fetching Orca Network sightings…", "loading");

    // 1) Local proxy (recommended)
    const local = await loadFromLocalApi(!!force);
    if (local) {
      applyData(local);
      return true;
    }

    // 2) CORS proxies (best-effort)
    try {
      const proxied = await loadFromProxies();
      if (proxied) {
        applyData(proxied);
        return true;
      }
    } catch (e) {
      console.warn("Proxy feed failed", e);
    }

    loadFallback(
      "Could not reach a live Orca Network monthly report. Run `python3 server.py` then open http://127.0.0.1:8080 — or check orcanetwork.org."
    );
    return false;
  }

  function init() {
    document.getElementById("sightings-refresh")?.addEventListener("click", () => refresh(true));
    document.getElementById("sightings-open-on")?.addEventListener("click", () => {
      window.open("https://orcanetwork.org/", "_blank", "noopener");
    });

    // Show samples immediately, then upgrade to live
    loadFallback("Loading live Orca Network feed…");
    setStatus("Loading live Orca Network feed…", "loading");
    refresh(false);
  }

  SJI.sightings = {
    init,
    refresh,
    getAll: () => current,
    isLive: () => live,
    source: () => lastSource
  };
})();
