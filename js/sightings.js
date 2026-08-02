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
      report:
        "Typical summer mammal-hunter track along the west side of San Juan Island near Lime Kiln Point. Bigg’s groups often work seal haul-outs on the reefs while freighters pass offshore in Haro Strait.",
      media: [
        {
          type: "youtube",
          url: "https://www.youtube.com/watch?v=0jmC_rrbWFA",
          label: "Sample: orca video",
          youtubeId: "0jmC_rrbWFA"
        }
      ],
      lat: 48.52,
      lng: -123.16,
      source: "Sample (offline fallback)",
      sourceUrl: "https://orcanetwork.org/"
    },
    {
      id: "fb2",
      species: "Southern Resident killer whales",
      kind: "resident",
      group: "J pod",
      location: "Haro Strait",
      when: "Sample",
      note: "Residents pulse through inland waters with Chinook runs — highly variable year to year.",
      report:
        "Southern Residents (J pod) pulse through inland waters with Chinook runs — highly variable year to year. Hydrophone networks sometimes catch calls when the whales pass Orcasound stations in Haro Strait.",
      media: [
        {
          type: "audio",
          url: "https://live.orcasound.net/",
          label: "Orcasound hydrophones"
        }
      ],
      lat: 48.56,
      lng: -123.17,
      source: "Sample (offline fallback)",
      sourceUrl: "https://orcanetwork.org/"
    },
    {
      id: "fb3",
      species: "Bigg's killer whales",
      kind: "biggs",
      group: "T37s",
      location: "Rosario Strait",
      when: "Sample",
      note: "Transients often work seal haul-outs along Rosario.",
      report:
        "Transients often work seal haul-outs along Rosario Strait between the ferry islands and the mainland. Sightings here are common in shoulder seasons when harbor seals pup on outer rocks.",
      media: [],
      lat: 48.55,
      lng: -122.78,
      source: "Sample (offline fallback)",
      sourceUrl: "https://orcanetwork.org/"
    },
    {
      id: "fb4",
      species: "Humpback whale",
      kind: "humpback",
      group: "",
      location: "Boundary Pass",
      when: "Sample",
      note: "Humpbacks have returned to the Salish Sea in growing numbers since the 2000s.",
      report:
        "Humpbacks have returned to the Salish Sea in growing numbers since the 2000s. Boundary Pass is a frequent corridor; flukes and blows are the usual cues for shore and vessel observers.",
      media: [],
      lat: 48.72,
      lng: -123.12,
      source: "Sample (offline fallback)",
      sourceUrl: "https://orcanetwork.org/"
    },
    {
      id: "fb5",
      species: "Harbor porpoise",
      kind: "other",
      group: "",
      location: "San Juan Channel",
      when: "Sample",
      note: "Small groups frequent quieter channels between the ferry islands.",
      report:
        "Small groups of harbor porpoise frequent quieter channels between the ferry islands. They surface briefly and are easy to miss without binoculars.",
      media: [],
      lat: 48.58,
      lng: -122.98,
      source: "Sample (offline fallback)",
      sourceUrl: "https://orcanetwork.org/"
    },
    {
      id: "fb6",
      species: "Bigg's killer whales",
      kind: "biggs",
      group: "T124s",
      location: "Turn Point · Stuart Island",
      when: "Sample",
      note: "Sharp turn at Boundary Pass / Haro — busy for ships and whales alike.",
      report:
        "Sharp turn at Boundary Pass / Haro near Turn Point Light — busy for ships and whales alike. A classic lookout when Bigg’s groups track around Stuart Island.",
      media: [],
      lat: 48.69,
      lng: -123.22,
      source: "Sample (offline fallback)",
      sourceUrl: "https://orcanetwork.org/"
    },
    {
      id: "fb7",
      species: "Minke whale",
      kind: "other",
      group: "",
      location: "Off Cattle Point",
      when: "Sample",
      note: "Minkes are solitary and often overlooked near the south end of San Juan Island.",
      report:
        "Minkes are solitary and often overlooked near the south end of San Juan Island off Cattle Point. A single arched back and small dorsal fin is the typical sighting.",
      media: [],
      lat: 48.45,
      lng: -122.97,
      source: "Sample (offline fallback)",
      sourceUrl: "https://orcanetwork.org/"
    },
    {
      id: "fb8",
      species: "Southern Resident killer whales",
      kind: "resident",
      group: "L pod",
      location: "South of Lopez · Strait of Juan de Fuca",
      when: "Sample",
      note: "L pod ranges widely; inland visits cluster when salmon move.",
      report:
        "L pod ranges widely; inland visits cluster when salmon move. South of Lopez toward the Strait of Juan de Fuca is a common corridor for residents on longer loops.",
      media: [],
      lat: 48.42,
      lng: -122.88,
      source: "Sample (offline fallback)",
      sourceUrl: "https://orcanetwork.org/"
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
  let lastSourceUrl = "";

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
      id: s.id || `live-${i}`,
      report: s.report || s.note || "",
      media: Array.isArray(s.media) ? s.media : [],
      sourceUrl: s.sourceUrl || data.sourceUrl || ""
    }));
    live = !!data.live;
    lastSource = data.source || data.sourceUrl || "";
    lastSourceUrl = data.sourceUrl || "";
    const when = data.refreshed
      ? new Date(data.refreshed).toLocaleTimeString()
      : new Date().toLocaleTimeString();
    const withMedia = current.filter((s) => s.media?.length).length;
    setStatus(
      `Live feed · ${current.length} reports from Orca Network (${lastSource})` +
        (withMedia ? ` · ${withMedia} with media links` : "") +
        ` · ${when}`,
      "live"
    );
    apply();
  }

  function loadFallback(reason) {
    current = FALLBACK.map((s) => ({ ...s }));
    live = false;
    lastSource = "";
    lastSourceUrl = "https://orcanetwork.org/";
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

  function iconForKind(kind) {
    if (kind === "resident" || kind === "biggs") return "orca-fin";
    if (kind === "humpback" || kind === "gray" || kind === "minke") return "orca";
    return "binoculars";
  }

  function mediaBadge(s) {
    const media = s.media || [];
    if (!media.length) return "";
    const types = new Set(media.map((m) => m.type));
    const bits = [];
    if (types.has("youtube") || types.has("video") || types.has("vimeo")) bits.push("Video");
    if (types.has("photos") || types.has("image")) bits.push("Photos");
    if (types.has("audio")) bits.push("Audio");
    if (!bits.length) bits.push("Media");
    return `<span class="sc-media-badge">${bits.join(" · ")}</span>`;
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
      <article class="sighting-card kind-${s.kind || "other"}" data-id="${s.id}" tabindex="0" role="button"
        aria-label="Open report: ${escapeHtml(s.species)}">
        <div class="sc-ico" aria-hidden="true"><svg class="icon"><use href="#i-${iconForKind(s.kind)}"/></svg></div>
        <div class="sc-body">
          <h4>${escapeHtml(s.species)}${s.group ? ` · ${escapeHtml(s.group)}` : ""}</h4>
          <p class="sc-meta">${escapeHtml(s.when || "")} · ${escapeHtml(s.location || "Salish Sea")}</p>
          <p class="sc-note">${escapeHtml(s.note || "")}</p>
          <div class="sc-card-foot">
            ${mediaBadge(s)}
            <span class="sc-open-hint">View full report</span>
          </div>
        </div>
      </article>`
      )
      .join("");

    el.querySelectorAll(".sighting-card").forEach((card) => {
      const go = () => {
        const s = current.find((x) => x.id === card.dataset.id);
        if (!s) return;
        openReport(s);
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

  function mediaLabel(m) {
    if (m.label && !/^https?:/i.test(m.label)) return m.label;
    const map = {
      youtube: "YouTube video",
      vimeo: "Vimeo video",
      video: "Video",
      photos: "Photos",
      image: "Photo",
      audio: "Hydrophone / audio",
      link: "Related link"
    };
    return map[m.type] || "Media";
  }

  function renderMedia(media) {
    if (!media?.length) return "";
    const blocks = media.map((m) => {
      if (m.type === "youtube" && (m.youtubeId || /youtu/.test(m.url))) {
        const id =
          m.youtubeId ||
          (m.url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/) || [])[1];
        if (id) {
          return `
            <div class="sm-embed">
              <iframe
                src="https://www.youtube-nocookie.com/embed/${escapeHtml(id)}"
                title="${escapeHtml(mediaLabel(m))}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen loading="lazy"></iframe>
            </div>
            <a class="sm-media-link" href="${escapeHtml(m.url)}" target="_blank" rel="noopener">
              Open on YouTube ↗
            </a>`;
        }
      }
      if (m.type === "image") {
        return `
          <figure class="sm-figure">
            <img src="${escapeHtml(m.url)}" alt="" loading="lazy" />
            <figcaption>${escapeHtml(mediaLabel(m))}</figcaption>
          </figure>`;
      }
      const icon =
        m.type === "audio" ? "♪" :
        m.type === "photos" || m.type === "image" ? "▣" :
        m.type === "video" || m.type === "youtube" || m.type === "vimeo" ? "▶" : "↗";
      return `
        <a class="sm-media-card type-${escapeHtml(m.type || "link")}"
           href="${escapeHtml(m.url)}" target="_blank" rel="noopener">
          <span class="sm-media-ico" aria-hidden="true">${icon}</span>
          <span>
            <strong>${escapeHtml(mediaLabel(m))}</strong>
            <span class="sm-media-host">${escapeHtml(hostOf(m.url))}</span>
          </span>
        </a>`;
    });
    return `<h4 class="sm-media-head">Linked media</h4>${blocks.join("")}`;
  }

  function hostOf(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "external link";
    }
  }

  function openReport(s) {
    const modal = document.getElementById("sighting-modal");
    if (!modal) return;

    document.getElementById("sm-eyebrow").textContent = s.source || "Whale report";
    document.getElementById("sm-title").textContent =
      s.species + (s.group ? ` · ${s.group}` : "");
    document.getElementById("sm-meta").textContent = [
      s.when,
      s.location || "Salish Sea",
      s.lat != null ? `${Number(s.lat).toFixed(3)}°, ${Number(s.lng).toFixed(3)}°` : ""
    ]
      .filter(Boolean)
      .join(" · ");

    const body = document.getElementById("sm-body");
    const report = (s.report || s.note || "").trim();
    body.innerHTML = report
      ? `<p>${escapeHtml(report)}</p>`
      : `<p class="sm-empty">No full text was available for this pin.</p>`;

    const mediaEl = document.getElementById("sm-media");
    const mediaHtml = renderMedia(s.media || []);
    if (mediaHtml) {
      mediaEl.hidden = false;
      mediaEl.innerHTML = mediaHtml;
    } else {
      mediaEl.hidden = true;
      mediaEl.innerHTML = "";
    }

    const actions = document.getElementById("sm-actions");
    const src = s.sourceUrl || lastSourceUrl;
    actions.innerHTML = `
      ${
        s.lat != null
          ? `<button type="button" class="btn btn-primary btn-sm" id="sm-fly">Show on map</button>`
          : ""
      }
      ${
        src
          ? `<a class="btn btn-ghost btn-sm" href="${escapeHtml(src)}" target="_blank" rel="noopener">Orca Network page ↗</a>`
          : ""
      }
      <button type="button" class="btn btn-ghost btn-sm" data-close-sighting>Close</button>
    `;

    actions.querySelector("#sm-fly")?.addEventListener("click", () => {
      closeReport();
      SJI.livemap?.flyTo?.(s.lat, s.lng, 11);
      document.querySelector('[data-map-view="live"]')?.click();
      document.getElementById("map")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      SJI.whales?.pulseSighting?.(s);
    });
    actions.querySelectorAll("[data-close-sighting]").forEach((el) => {
      el.addEventListener("click", closeReport);
    });

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".sm-close")?.focus();
  }

  function closeReport() {
    const modal = document.getElementById("sighting-modal");
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = "";
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
      window.open(lastSourceUrl || "https://orcanetwork.org/", "_blank", "noopener");
    });

    const modal = document.getElementById("sighting-modal");
    modal?.querySelectorAll("[data-close-sighting]").forEach((el) => {
      el.addEventListener("click", closeReport);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeReport();
    });

    // Show samples immediately, then upgrade to live
    loadFallback("Loading live Orca Network feed…");
    setStatus("Loading live Orca Network feed…", "loading");
    refresh(false);
  }

  SJI.sightings = {
    init,
    refresh,
    openReport,
    closeReport,
    getAll: () => current,
    isLive: () => live,
    source: () => lastSource
  };
})();
