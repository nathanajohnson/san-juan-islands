# San Juan Islands — An Interactive Exploration

A feature-rich, New York Times–style interactive website about the San Juan Islands: geography, history (including the Pig War), whale traffic, wildlife, ecology, and island-by-island exploration. Designed for both adults and children via **Kid Mode**.

## Open it (recommended)

```bash
cd san-juan-islands-interactive
python3 server.py
```

Then visit [http://127.0.0.1:8080](http://127.0.0.1:8080).

`server.py` serves the site **and** proxies Orca Network monthly sighting pages at `/api/sightings` (avoids browser CORS blocks). Plain `python3 -m http.server` works for static pages, but the live whale feed is much more reliable with `server.py`.

## What’s inside

| Section | Interaction |
|--------|-------------|
| **Hero** | Animated seascape, animated counters |
| **Map** | **Live Leaflet map** (accurate OSM/Carto) + formline motif overlay · stylized SVG alternate · layers (whale routes, shipping, protected, places) · island field cards with photos |
| **History** | Scroll timeline + Pig War story |
| **Whales** | Canvas seasonal simulation of J/K/L and Bigg’s traffic + shipping · **live/sample sighting pins** from Orca Network–style reports |
| **Lime Kiln** | Photo panels of the lighthouse and west-side lookout |
| **Wildlife** | Filterable field guide with **real photos** and detail modals |
| **Ecology** | Interactive vertical cross-section (canopy → deep channel) |
| **Tidepools** | Rocky-shore explorer — click creatures & tidal zones + etiquette tips |
| **Explore** | Ferry-island deep dives with place photography |
| **Scavenger hunt** | Printable San Juan Island checklist (tidepools, Lime Kiln, Pig War camps; persists in `localStorage`) |
| **Discover** | Six-question quiz |

**Kid Mode** (header toggle) rewrites key copy for younger readers and is remembered in `localStorage`.

## Stack

- Pure HTML / CSS / JS — no build tools
- [Leaflet](https://leafletjs.com/) + CARTO/OSM tiles for accurate cartography
- Optional **Google Maps Embed** satellite basemap when you set a key
- Custom SVG map + Canvas whale simulation
- Cormorant Garamond + DM Sans (Google Fonts)

## Optional Google Maps satellite

In `js/data.js`:

```js
SJI.GOOGLE_MAPS_KEY = "YOUR_MAPS_EMBED_API_KEY";
```

The “Google satellite” basemap button appears when a key is present. Without a key, the accurate Leaflet basemap is the default.

## Whale sighting feed

With `python3 server.py`:

1. Server fetches the latest available monthly report from [Orca Network](https://orcanetwork.org/whale_sightings/…) (walks back up to 18 months)
2. Parses species, groups (e.g. T65Bs, J pod), dates, place names, and embedded lat/lng
3. Client loads `GET /api/sightings` and draws pins on the **live map** and **whale traffic canvas**

Without the proxy, the client tries public CORS proxies, then falls back to a curated sample set. Always open Orca Network for authoritative, up-to-date reports.

```bash
curl -s http://127.0.0.1:8080/api/sightings | head
```

## Formline motif

The map overlay is an **abstract formline-inspired pattern** (ovoids, U-forms, wave lines) — an educational homage to Coast Salish design language. It is **not** a tribal crest, not official Indigenous art, and not affiliated with any Nation.

## Notes

- Whale movement is a **stylized seasonal model** for education, not live AIS or Center for Whale Research tracks.
- Population figures (especially Southern Residents) change; see [whaleresearch.com](https://www.whaleresearch.com/) for current census data.
- Photos are bundled under `assets/photos/` for **internal educational use**.
- Not affiliated with NPS, Washington State Parks, Visit San Juans, or Orca Network.

## Sources (starting points)

- Center for Whale Research  
- Orca Network (public sightings)  
- San Juan Island National Historical Park (NPS)  
- San Juan Islands National Wildlife Refuge (FWS)  
- Lime Kiln Point State Park (WA State Parks)  
- SeaDoc Society  
- Friday Harbor Laboratories (UW)  
- Public geographic / historical summaries of the archipelago  
- Wikimedia Commons (reference photography)
