/**
 * Geographic anchors — real WGS84 coordinates for San Juan Islands
 * Used by Leaflet map, whale sim projection, and sightings placement.
 */
window.SJI = window.SJI || {};

SJI.GEO = {
  // Archipelago center & default view
  center: [48.55, -122.95],
  defaultZoom: 10,
  bounds: [
    [48.35, -123.25], // SW
    [48.82, -122.65]  // NE
  ],
  // Tighter frame on the archipelago itself (live "chart" view)
  boundsTight: [
    [48.41, -123.2], // SW
    [48.72, -122.74] // NE
  ],

  islands: {
    "san-juan": { lat: 48.53, lng: -123.08, name: "San Juan Island" },
    orcas: { lat: 48.65, lng: -122.92, name: "Orcas Island" },
    lopez: { lat: 48.48, lng: -122.89, name: "Lopez Island" },
    shaw: { lat: 48.57, lng: -122.95, name: "Shaw Island" },
    sucia: { lat: 48.75, lng: -122.91, name: "Sucia Island" },
    stuart: { lat: 48.68, lng: -123.20, name: "Stuart Island" },
    spieden: { lat: 48.64, lng: -123.12, name: "Spieden Island" },
    blakely: { lat: 48.56, lng: -122.80, name: "Blakely Island" },
    waldron: { lat: 48.69, lng: -123.03, name: "Waldron Island" },
    jones: { lat: 48.62, lng: -123.05, name: "Jones Island" }
  },

  places: {
    "lime-kiln": {
      lat: 48.5158,
      lng: -123.1525,
      name: "Lime Kiln Point",
      note: "Shore-based orca watching · Haro Strait"
    },
    "friday-harbor": {
      lat: 48.5342,
      lng: -123.0170,
      name: "Friday Harbor",
      note: "County seat · ferry hub"
    },
    "american-camp": {
      lat: 48.4625,
      lng: -122.9870,
      name: "American Camp",
      note: "Pig War · prairie & Cattle Point"
    },
    "english-camp": {
      lat: 48.5870,
      lng: -123.1480,
      name: "English Camp",
      note: "Pig War · Garrison Bay"
    },
    "mt-constitution": {
      lat: 48.6775,
      lng: -122.8310,
      name: "Mount Constitution",
      note: "2,407 ft · Moran State Park"
    },
    "turn-point": {
      lat: 48.6889,
      lng: -123.2375,
      name: "Turn Point Light",
      note: "Boundary Pass / Haro corner"
    },
    "spencer-spit": {
      lat: 48.5340,
      lng: -122.8600,
      name: "Spencer Spit",
      note: "Lopez Island state park"
    },
    eastsound: {
      lat: 48.6960,
      lng: -122.9060,
      name: "Eastsound",
      note: "Orcas Island village"
    }
  },

  // Approximate locations used when Orca Network text names a place
  placeAliases: {
    "lime kiln": [48.5158, -123.1525],
    "lime kiln point": [48.5158, -123.1525],
    "whale watch park": [48.5158, -123.1525],
    "haro strait": [48.55, -123.18],
    "haro": [48.55, -123.18],
    "friday harbor": [48.5342, -123.017],
    "san juan island": [48.53, -123.08],
    "san juan": [48.53, -123.08],
    "orcas": [48.65, -122.92],
    "orcas island": [48.65, -122.92],
    eastsound: [48.696, -122.906],
    lopez: [48.48, -122.89],
    "lopez island": [48.48, -122.89],
    shaw: [48.57, -122.95],
    stuart: [48.68, -123.2],
    "turn point": [48.6889, -123.2375],
    "boundary pass": [48.72, -123.15],
    "rosario strait": [48.55, -122.75],
    rosario: [48.55, -122.75],
    "cattle point": [48.45, -122.96],
    "american camp": [48.4625, -122.987],
    "english camp": [48.587, -123.148],
    "spieden island": [48.64, -123.12],
    spieden: [48.64, -123.12],
    "sucia island": [48.75, -122.91],
    sucia: [48.75, -122.91],
    "puget sound": [47.9, -122.4],
    "strait of juan de fuca": [48.3, -123.3],
    "juan de fuca": [48.3, -123.3],
    "active pass": [48.87, -123.3],
    "galiano": [48.92, -123.45],
    "saturna": [48.78, -123.15],
    "gulf islands": [48.85, -123.35],
    "victoria": [48.43, -123.37],
    "anacortes": [48.51, -122.61],
    "whidbey": [48.2, -122.65],
    "admiralty inlet": [48.1, -122.7],
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
    "race rocks": [48.3, -123.53],
    "birch bay": [48.92, -122.75],
    "point roberts": [48.98, -123.05],
    "mukilteo": [47.95, -122.3]
  }
};

/** Project lat/lng into whale-canvas pixel space (approx. for traffic map) */
SJI.geoToCanvas = function (lat, lng, w, h) {
  // Rough bounds matching canvas island layout
  const latMin = 48.40, latMax = 48.80;
  const lngMin = -123.30, lngMax = -122.70;
  const x = ((lng - lngMin) / (lngMax - lngMin)) * w;
  const y = ((latMax - lat) / (latMax - latMin)) * h;
  return [x, y];
};
