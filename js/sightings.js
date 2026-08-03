/**
 * Live whale-report feed for the traffic map + live cartography.
 *
 * Load order:
 *   1. GET /api/sightings from local server.py (optional; richer media parse)
 *   2. Orca Network WordPress REST API (live, CORS-enabled — works on GitHub Pages)
 *   3. Bundled data/sightings.json (Actions-refreshed cache if live fetch fails)
 *   4. Curated in-file sample set
 *
 * Educational use — not an official Orca Network product.
 */
(function () {
  const STATUS_EL = () => document.getElementById("sightings-status");
  const LIST_EL = () => document.getElementById("sightings-list");

  /** Orca Network exposes monthly reports as a CPT with open CORS on wp-json. */
  const WP_SIGHTINGS_API =
    "https://orcanetwork.org/wp-json/wp/v2/whale_sightings";

  /** Re-poll live feed while the tab is open (real-time use on static hosts). */
  const LIVE_POLL_MS = 10 * 60 * 1000;

  let pollTimer = null;

  /** Resolve a path relative to this site (supports GitHub Pages project subpaths). */
  function siteUrl(rel) {
    try {
      return new URL(rel, document.baseURI || location.href).href;
    } catch {
      return rel;
    }
  }

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

  function speciesLabelFor(species) {
    const sl = String(species || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    if (sl.includes("southern resident")) return "Southern Resident killer whales";
    if (sl.includes("bigg")) return "Bigg's killer whales";
    if (sl === "orca" || sl === "killer whale" || sl === "killer whales") {
      return "Killer whale (orca)";
    }
    if (sl.includes("humpback")) return "Humpback whale";
    if (sl.includes("gray")) return "Gray whale";
    if (sl.includes("minke")) return "Minke whale";
    return String(species || "Cetacean").replace(/\s+/g, " ").trim();
  }

  function preferLocal(sightings) {
    const local = sightings.filter(
      (s) => s.lat >= 48.3 && s.lat <= 48.9 && s.lng >= -123.45 && s.lng <= -122.55
    );
    if (local.length >= 4) {
      const rest = sightings.filter((s) => !local.includes(s));
      return local.slice(0, 24).concat(rest.slice(0, 8));
    }
    return sightings.slice(0, 32);
  }

  function extractMediaFromHtml(html) {
    const media = [];
    const seen = new Set();
    const re = /<a[^>]+href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    while ((m = re.exec(html || ""))) {
      const url = m[1];
      if (seen.has(url)) continue;
      const label = decodeEntities(m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()) || "Link";
      const u = url.toLowerCase();
      const lab = label.toLowerCase();
      if (/youtube\.com\/@|orcanetwork\.org\/(?:about|home|author|shop|donate)/i.test(u)) continue;
      let type = null;
      if (/youtube\.com\/watch|youtu\.be\/|youtube\.com\/embed\//i.test(u)) type = "youtube";
      else if (u.includes("vimeo.com")) type = "vimeo";
      else if (u.includes("orcasound")) type = "audio";
      else if (/facebook\.com\/reel|fb\.watch/i.test(u)) type = "video";
      else if (u.includes("facebook.com") || u.includes("fb.com")) type = "photos";
      else if (/\.(jpe?g|png|gif|webp)(\?|$)/i.test(u)) type = "image";
      else if (/\.(mp4|mov|webm)(\?|$)/i.test(u)) type = "video";
      else if (/link to/i.test(lab) && /photo|video|reel|audio|youtube/i.test(lab)) {
        type = /photo/i.test(lab) ? "photos" : /audio/i.test(lab) ? "audio" : "video";
      }
      if (!type) continue;
      seen.add(url);
      const item = { type, url, label: label.slice(0, 80) };
      const yid = (url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/) || [])[1];
      if (yid) item.youtubeId = yid;
      media.push(item);
      if (media.length >= 24) break;
    }
    return media;
  }

  function parseOrcaNetworkHtml(html, sourceLabel, sourceUrl) {
    const sightings = [];
    if (!html || html.length < 400) return sightings;
    if (!/KILLER|HUMPBACK|GRAY WHALE|MINKE|PORPOISE|ORCA/i.test(html)) return sightings;

    const pageMedia = extractMediaFromHtml(html);

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
      .filter((l) => l.length > 8 && l.length < 1200);

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
      if (!hasSpecies && !resolveCoords(line) && !/\bT\d{2}/.test(line) && !/\b[JKL]\s*[Pp]od\b/.test(line)) {
        continue;
      }

      const coords = resolveCoords(line);
      if (!coords) continue;
      if (coords.lat < 46.5 || coords.lat > 50.5 || coords.lng > -121.5 || coords.lng < -126.5) continue;

      const speciesMatch = line.match(speciesRe);
      const species = speciesMatch ? speciesMatch[0] : currentSpecies || "Cetacean";
      const group =
        (line.match(/\bT\d{2,3}[A-Z0-9]*s?\b/) || line.match(/\b[JKL]\s*[Pp]od\b/) || [""])[0];
      const note = line.slice(0, 280);
      const key = `${coords.lat.toFixed(3)}|${coords.lng.toFixed(3)}|${group}|${currentDate}|${note.slice(0, 40)}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const jitter = ((sightings.length * 17) % 10) * 0.001;
      // Attach a few page-level media items to early cards (best-effort)
      const media =
        sightings.length < 6 && pageMedia.length
          ? pageMedia.slice(sightings.length, sightings.length + 2)
          : [];
      sightings.push({
        id: "live-" + sightings.length,
        species: speciesLabelFor(species),
        kind: classify(species, line),
        group,
        location: coords.matched,
        when: currentDate || "Report",
        note,
        report: line.slice(0, 1200),
        media,
        lat: coords.lat + jitter - 0.005,
        lng: coords.lng + (((sightings.length * 13) % 10) * 0.001 - 0.005),
        source: sourceLabel || "Orca Network (parsed)",
        sourceUrl: sourceUrl || ""
      });
      if (sightings.length >= 40) break;
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

  /**
   * Live path for GitHub Pages / any static host:
   * Orca Network's WP REST API reflects Access-Control-Allow-Origin, so the
   * browser can fetch the latest monthly report without a backend proxy.
   */
  async function fetchMonthViaWpApi(c) {
    const slug = `${c.month}-${c.year}-whale-sightings`;
    const apiUrl =
      `${WP_SIGHTINGS_API}?slug=${encodeURIComponent(slug)}` +
      `&_fields=id,slug,link,title,content,modified`;
    try {
      const res = await fetch(apiUrl, {
        signal: abortableTimeout(20000),
        headers: { Accept: "application/json" },
        cache: "no-store"
      });
      if (!res.ok) return null;
      const items = await res.json();
      if (!Array.isArray(items) || !items.length) return null;
      const item = items[0];
      const html = item.content?.rendered || "";
      if (html.length < 400) return null;
      const label = `Orca Network · ${c.month} ${c.year}`;
      const sourceUrl =
        item.link ||
        `https://orcanetwork.org/whale_sightings/${slug}/`;
      const parsed = parseOrcaNetworkHtml(html, label, sourceUrl);
      if (parsed.length < 2) return null;
      const chosen = preferLocal(parsed);
      return {
        ok: true,
        live: true,
        sightings: chosen,
        source: `${c.month} ${c.year}`,
        sourceUrl,
        count: chosen.length,
        refreshed: item.modified || new Date().toISOString(),
        via: "wp-rest"
      };
    } catch (_) {
      return null;
    }
  }

  async function loadFromWpApi(onProgress) {
    const candidates = monthCandidates(18);
    // Parallel batches (newest first), stop at first successful month in order
    const batchSize = 4;
    for (let i = 0; i < candidates.length; i += batchSize) {
      const batch = candidates.slice(i, i + batchSize);
      if (onProgress) {
        const newest = batch[0];
        onProgress(newest);
      }
      const results = await Promise.all(batch.map((c) => fetchMonthViaWpApi(c)));
      for (let j = 0; j < results.length; j++) {
        if (results[j]) return results[j];
      }
    }
    return null;
  }

  /** Browser-side HTML scrape via public CORS proxies (secondary). */
  async function loadFromProxies() {
    const candidates = monthCandidates(12);
    for (const c of candidates) {
      setStatus(`Trying Orca Network · ${c.month} ${c.year}…`, "loading");
      const html = await fetchViaProxy(c.url);
      if (!html) continue;
      const parsed = parseOrcaNetworkHtml(
        html,
        `Orca Network · ${c.month} ${c.year}`,
        c.url
      );
      if (parsed.length >= 2) {
        const chosen = preferLocal(parsed);
        return {
          ok: true,
          live: true,
          sightings: chosen,
          source: `${c.month} ${c.year}`,
          sourceUrl: c.url,
          count: chosen.length,
          via: "cors-proxy"
        };
      }
    }
    return null;
  }

  function applyData(data, mode) {
    current = data.sightings.map((s, i) => ({
      ...s,
      id: s.id || `live-${i}`,
      report: s.report || s.note || "",
      media: Array.isArray(s.media) ? s.media : [],
      sourceUrl: s.sourceUrl || data.sourceUrl || ""
    }));
    const fromSnapshot = mode === "snapshot" || !!data.static;
    live = !!data.live && !fromSnapshot;
    lastSource = data.source || data.sourceUrl || "";
    lastSourceUrl = data.sourceUrl || "";
    const when = data.refreshed
      ? new Date(data.refreshed).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit"
        })
      : new Date().toLocaleTimeString();
    const withMedia = current.filter((s) => s.media?.length).length;
    const mediaBit = withMedia ? ` · ${withMedia} with media links` : "";
    if (fromSnapshot) {
      setStatus(
        `Cached Orca Network reports · ${current.length} pins (${lastSource || "cache"})` +
          mediaBit +
          ` · updated ${when}`,
        "live"
      );
    } else {
      setStatus(
        `Live feed · ${current.length} reports from Orca Network (${lastSource})` +
          mediaBit +
          ` · ${when}`,
        "live"
      );
    }
    apply();
  }

  function loadFallback(reason) {
    current = FALLBACK.map((s) => ({ ...s }));
    live = false;
    lastSource = "";
    lastSourceUrl = "https://orcanetwork.org/";
    setStatus(
      reason ||
        "Sample sightings only — could not reach Orca Network. Try Refresh, or open orcanetwork.org.",
      "fallback"
    );
    apply();
  }

  /** Actions-refreshed cache for when the live API is unreachable. */
  async function loadFromStaticSnapshot() {
    try {
      const bust = `t=${Date.now()}`;
      const res = await fetch(siteUrl(`data/sightings.json?${bust}`), {
        signal: abortableTimeout(12000),
        cache: "no-store"
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || !Array.isArray(data.sightings) || data.sightings.length < 2) {
        return null;
      }
      return {
        ...data,
        ok: true,
        live: false,
        static: true,
        source: data.source || "cached snapshot",
        sourceUrl: data.sourceUrl || "https://orcanetwork.org/"
      };
    } catch (_) {
      return null;
    }
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

  function startLivePolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(() => {
      if (document.hidden) return;
      refresh(true).catch((e) => console.warn("Sightings poll failed", e));
    }, LIVE_POLL_MS);
  }

  async function refresh(force) {
    setStatus("Fetching latest Orca Network sightings…", "loading");

    // 1) Optional local server.py (richer parse when developing)
    const local = await loadFromLocalApi(!!force);
    if (local) {
      applyData(local, "live");
      return true;
    }

    // 2) Live: Orca Network WordPress REST (CORS-open — works on GitHub Pages)
    try {
      const wp = await loadFromWpApi((c) => {
        setStatus(`Loading Orca Network · ${c.month} ${c.year}…`, "loading");
      });
      if (wp) {
        applyData(wp, "live");
        return true;
      }
    } catch (e) {
      console.warn("WP REST feed failed", e);
    }

    // 3) CORS HTML proxies (secondary live path)
    try {
      const proxied = await loadFromProxies();
      if (proxied) {
        applyData(proxied, "live");
        return true;
      }
    } catch (e) {
      console.warn("Proxy feed failed", e);
    }

    // 4) GitHub Actions cache (stale but real data if live paths failed)
    const snap = await loadFromStaticSnapshot();
    if (snap) {
      applyData(snap, "snapshot");
      return true;
    }

    loadFallback(
      "Could not reach Orca Network right now. Sample pins shown — try Refresh, or visit orcanetwork.org."
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
    refresh(false).then(() => startLivePolling());
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
