/**
 * Accurate interactive map — Leaflet + OSM/Carto basemap
 * with Coast Salish–inspired formline overlay (educational homage).
 * Optional Google Maps basemap when SJI.GOOGLE_MAPS_KEY is set.
 */
(function () {
  let map = null;
  let layers = {
    islands: null,
    places: null,
    sightings: null,
    whales: null,
    shipping: null,
    protected: null
  };
  let basemapTiles = null;
  let googleTiles = null;

  function init() {
    const el = document.getElementById("leaflet-map");
    if (!el || typeof L === "undefined") {
      console.warn("Leaflet not available — live map skipped");
      return;
    }

    map = L.map(el, {
      center: SJI.GEO.center,
      zoom: SJI.GEO.defaultZoom,
      minZoom: 9,
      maxZoom: 15,
      scrollWheelZoom: false,
      attributionControl: true
    });
    map.fitBounds(SJI.GEO.boundsTight || SJI.GEO.bounds, { padding: [8, 8] });
    map.attributionControl.setPrefix(false);

    // Light basemap (Carto light_all) — warmed to chart paper via CSS filter
    basemapTiles = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19
      }
    ).addTo(map);

    // Optional Google hybrid tiles when key is configured
    if (SJI.GOOGLE_MAPS_KEY) {
      // Note: Google tiles via Leaflet require Maps JS API; we also offer iframe mode
      tryEnableGoogle();
    }

    addFormlineOverlay();
    addIslandMarkers();
    addPlaceMarkers();
    addRouteLayers();
    addSightingLayer();
    bindUI();

    // Enable wheel zoom after click (common pattern)
    map.on("click", () => map.scrollWheelZoom.enable());
    map.on("mouseout", () => map.scrollWheelZoom.disable());

    SJI.livemap = {
      map,
      refreshSightings,
      selectIsland,
      setLayer: toggleLiveLayer,
      flyTo: (lat, lng, z = 12) => map.flyTo([lat, lng], z, { duration: 1.2 }),
      focus: (lat, lng, z = 13) => {
        toggleLiveLayer("places");
        map.flyTo([lat, lng], z, { duration: 1.2 });
      },
      setBasemap
    };
  }

  function tryEnableGoogle() {
    // Placeholder: full Google Maps basemap needs Maps JavaScript API loaded with key.
    // We expose a toggle that swaps to Google Maps Embed panel when key present.
    const toggle = document.getElementById("basemap-google");
    if (toggle) toggle.hidden = false;
  }

  function setBasemap(mode) {
    const el = document.getElementById("leaflet-map");
    const googleWrap = document.getElementById("google-map-embed");
    if (mode === "google" && SJI.GOOGLE_MAPS_KEY) {
      if (el) el.hidden = true;
      if (googleWrap) {
        googleWrap.hidden = false;
        if (!googleWrap.dataset.loaded) {
          const center = `${SJI.GEO.center[0]},${SJI.GEO.center[1]}`;
          googleWrap.innerHTML = `<iframe
            title="Google Map of San Juan Islands"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed/v1/view?key=${encodeURIComponent(SJI.GOOGLE_MAPS_KEY)}&center=${center}&zoom=10&maptype=satellite"
            allowfullscreen></iframe>`;
          googleWrap.dataset.loaded = "1";
        }
      }
    } else {
      if (el) el.hidden = false;
      if (googleWrap) googleWrap.hidden = true;
      map?.invalidateSize();
    }
  }

  function addFormlineOverlay() {
    // The formline motif now themes the chart FRAME ornament (subtle), never the water.
    const stack = document.querySelector(".map-canvas-stack");
    const cb = document.getElementById("toggle-formline");
    if (stack) stack.classList.toggle("formline-frame", !cb || cb.checked);

    // Disclaimer chip stays visible whenever the motif is available
    const FormlineControl = L.Control.extend({
      options: { position: "bottomleft" },
      onAdd() {
        const d = L.DomUtil.create("div", "formline-credit");
        d.innerHTML =
          '<span title="Abstract formline-inspired pattern — educational homage to Coast Salish design language, not a tribal crest or official art.">Formline motif overlay · homage</span>';
        return d;
      }
    });
    map.addControl(new FormlineControl());
  }

  function islandIcon(id, selected) {
    const name = (SJI.GEO.islands[id]?.name || id).replace(" Island", "");
    return L.divIcon({
      className: "isle-marker" + (selected ? " selected" : ""),
      html: `<span class="isle-glyph"><svg viewBox="0 0 24 24" aria-hidden="true">
          <path class="ip-land" d="M4 14.5 C5.5 10 9 7.8 13 8.6 C17 9.4 19.6 11.6 20 14.5 Z"/>
          <path class="ip-wave" d="M3 17.5 H21"/>
        </svg></span><span class="isle-name">${name}</span>`,
      iconSize: [90, 52],
      iconAnchor: [45, 16]
    });
  }

  // Chart-glyph markers for named places
  const PLACE_GLYPHS = {
    "lime-kiln": "lighthouse",
    "turn-point": "lighthouse",
    "american-camp": "camp",
    "english-camp": "camp",
    "mt-constitution": "peak",
    "friday-harbor": "ferry",
    eastsound: "anchor",
    "spencer-spit": "camp",
    "grannys-cove": "seastar",
    "cattle-point": "lighthouse",
    "south-beach": "tide"
  };

  function placeIcon(id) {
    const glyph = PLACE_GLYPHS[id] || "marker";
    return L.divIcon({
      className: "place-marker",
      html: `<span class="place-pin place-pin--${glyph}"><svg class="icon" aria-hidden="true"><use href="#i-${glyph}"/></svg></span>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }

  function addIslandMarkers() {
    layers.islands = L.layerGroup().addTo(map);
    Object.entries(SJI.GEO.islands).forEach(([id, g]) => {
      const m = L.marker([g.lat, g.lng], {
        icon: islandIcon(id, false),
        title: g.name
      });
      // Paper-stock popup so the island's name always shows at the click site
      const isle = SJI.ISLANDS?.[id];
      m.bindPopup(
        `<div class="isle-popup">
          <p class="ipp-kicker">Ship&rsquo;s manifest</p>
          <span class="ipp-name">${g.name}</span>
          ${isle?.nick ? `<span class="ipp-nick">${isle.nick}</span>` : ""}
          ${isle ? `<span class="ipp-meta">${isle.area}${isle.town ? " · " + isle.town : ""}</span>` : ""}
        </div>`,
        { offset: [0, -6] }
      );
      m.on("click", () => {
        selectIsland(id);
        if (SJI.map?.select) SJI.map.select(id);
      });
      m._sjiId = id;
      layers.islands.addLayer(m);
    });
  }

  function selectIsland(id) {
    layers.islands?.eachLayer((m) => {
      m.setIcon(islandIcon(m._sjiId, m._sjiId === id));
    });
    const g = SJI.GEO.islands[id];
    if (g) map.panTo([g.lat, g.lng], { animate: true });
  }

  function addPlaceMarkers() {
    layers.places = L.layerGroup();
    Object.entries(SJI.GEO.places).forEach(([id, p]) => {
      const m = L.marker([p.lat, p.lng], { icon: placeIcon(id), title: p.name });
      const spot = SJI.TIDE_SPOTS?.find((s) => s.id === id || (id === "lime-kiln" && s.id === "lime-kiln-pools"));
      const extra = spot
        ? `<br><a class="place-tide-link" href="#tidepool" style="color:var(--sea-deep);font-weight:600">Tidepools · open forecast →</a>`
        : "";
      m.bindPopup(
        `<strong>${p.name}</strong><br><span style="opacity:.85">${p.note}</span>${extra}`
      );
      layers.places.addLayer(m);
    });
  }

  function addRouteLayers() {
    // Whale corridor (Haro Strait spine) — approximate educational path
    const whaleLatLngs = [
      [48.72, -123.22],
      [48.65, -123.18],
      [48.58, -123.16],
      [48.52, -123.15],
      [48.46, -123.10],
      [48.42, -123.05]
    ];
    layers.whales = L.polyline(whaleLatLngs, {
      color: "#5ba3c4",
      weight: 3,
      dashArray: "8 6",
      opacity: 0.75
    });

    const shipA = [
      [48.8, -123.25],
      [48.7, -123.2],
      [48.55, -123.14],
      [48.4, -123.0],
      [48.3, -122.9]
    ];
    const shipB = [
      [48.78, -122.7],
      [48.65, -122.78],
      [48.5, -122.82],
      [48.35, -122.88]
    ];
    layers.shipping = L.layerGroup([
      L.polyline(shipA, { color: "#8a9aaa", weight: 2, dashArray: "2 8", opacity: 0.7 }),
      L.polyline(shipB, { color: "#8a9aaa", weight: 2, dashArray: "2 8", opacity: 0.7 })
    ]);

    // Protected / refuge ellipses (approx.)
    layers.protected = L.layerGroup([
      L.circle([48.75, -122.91], { radius: 2200, color: "#d4a84b", fillColor: "#d4a84b", fillOpacity: 0.12, weight: 1 }),
      L.circle([48.62, -123.05], { radius: 1200, color: "#d4a84b", fillColor: "#d4a84b", fillOpacity: 0.12, weight: 1 }),
      L.circle([48.68, -123.2], { radius: 1800, color: "#d4a84b", fillColor: "#d4a84b", fillOpacity: 0.12, weight: 1 }),
      L.circle([48.45, -122.96], { radius: 1500, color: "#d4a84b", fillColor: "#d4a84b", fillOpacity: 0.12, weight: 1 })
    ]);
  }

  function addSightingLayer() {
    layers.sightings = L.layerGroup().addTo(map);
  }

  function refreshSightings(list) {
    if (!layers.sightings) return;
    layers.sightings.clearLayers();
    (list || []).forEach((s) => {
      if (s.lat == null || s.lng == null) return;
      const kind = ["resident", "biggs", "gray", "humpback", "minke"].includes(s.kind)
        ? s.kind
        : "other";
      const m = L.marker([s.lat, s.lng], {
        icon: L.divIcon({
          className: `sight-marker sight-${kind}`,
          html: `<span class="sight-pulse"></span><svg class="icon" aria-hidden="true"><use href="#i-orca-fin"/></svg>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        })
      });
      const when = s.when || s.date || "Recent";
      m.bindPopup(
        `<div class="sighting-popup">
          <strong>${s.species || "Cetacean"}</strong>
          ${s.group ? `<br>${s.group}` : ""}
          <br><span class="sp-when">${when}</span>
          <br><span class="sp-loc">${s.location || ""}</span>
          ${s.note ? `<p class="sp-note">${s.note}</p>` : ""}
          <p class="sp-src">Source: ${s.source || "Orca Network style report"}</p>
        </div>`
      );
      layers.sightings.addLayer(m);
    });
  }

  function bindUI() {
    document.querySelectorAll("[data-map-view]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-map-view]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const view = btn.dataset.mapView;
        const leafletWrap = document.getElementById("live-map-pane");
        const svgWrap = document.getElementById("svg-map-pane");
        if (view === "live") {
          if (leafletWrap) leafletWrap.hidden = false;
          if (svgWrap) svgWrap.hidden = true;
          setTimeout(() => {
            map?.invalidateSize();
            // First reveal: Leaflet booted while hidden, so re-fit the bounds
            if (map && !map._sjiFitted) {
              map.fitBounds(SJI.GEO.boundsTight || SJI.GEO.bounds, { padding: [8, 8] });
              map._sjiFitted = true;
            }
          }, 120);
        } else {
          if (leafletWrap) leafletWrap.hidden = true;
          if (svgWrap) svgWrap.hidden = false;
        }
      });
    });

    document.querySelectorAll(".layer-btn[data-layer]").forEach((btn) => {
      btn.addEventListener("click", () => {
        // Existing SVG layer handler still runs; also toggle Leaflet layers
        const layer = btn.dataset.layer;
        toggleLiveLayer(layer);
      });
    });

    document.getElementById("basemap-osm")?.addEventListener("click", () => {
      setBasemap("osm");
      document.getElementById("basemap-osm")?.classList.add("active");
      document.getElementById("basemap-google")?.classList.remove("active");
    });
    document.getElementById("basemap-google")?.addEventListener("click", () => {
      setBasemap("google");
      document.getElementById("basemap-google")?.classList.add("active");
      document.getElementById("basemap-osm")?.classList.remove("active");
    });

    document.getElementById("toggle-formline")?.addEventListener("change", (e) => {
      document
        .querySelector(".map-canvas-stack")
        ?.classList.toggle("formline-frame", e.target.checked);
    });

    document.getElementById("toggle-sightings")?.addEventListener("change", (e) => {
      if (!layers.sightings) return;
      if (e.target.checked) layers.sightings.addTo(map);
      else map.removeLayer(layers.sightings);
    });
  }

  function toggleLiveLayer(layer) {
    // Hide route layers first
    ["whales", "shipping", "protected", "places"].forEach((k) => {
      if (layers[k] && map.hasLayer(layers[k])) map.removeLayer(layers[k]);
    });
    if (layer === "whales" && layers.whales) layers.whales.addTo(map);
    if (layer === "shipping" && layers.shipping) layers.shipping.addTo(map);
    if (layer === "protected" && layers.protected) layers.protected.addTo(map);
    if (layer === "places" && layers.places) layers.places.addTo(map);
    // islands always on
  }

  // Boot after DOM + Leaflet
  function boot() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }
  boot();
})();
