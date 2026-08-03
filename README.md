# San Juan Islands — An Interactive Exploration

A feature-rich, New York Times–style interactive website about the San Juan Islands: geography, history (including the Pig War), whale traffic, wildlife, ecology, and island-by-island exploration. Designed for both adults and children via **Kid Mode**.

## Live site

**https://nathanajohnson.github.io/san-juan-islands/**

Hosted on GitHub Pages (static). Whale pins load **live** in the browser from [Orca Network’s WordPress REST API](https://orcanetwork.org/wp-json/wp/v2/whale_sightings) (open CORS — no backend required). A GitHub Actions cache at `data/sightings.json` is only a fallback.

## Open it locally (recommended for whale feed)

```bash
cd san-juan-islands
python3 server.py
```

Then visit [http://127.0.0.1:8080](http://127.0.0.1:8080).

`server.py` serves the site **and** proxies Orca Network monthly sighting pages at `/api/sightings` (avoids browser CORS blocks). On GitHub Pages the feed falls back to sample data or public CORS proxies.
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
| **Tidepools** | Rocky-shore explorer — click creatures & zones · **live NOAA tide forecast** (Roche Harbor 9449834) · best shores incl. Granny’s Cove · etiquette tips |
| **Explore** | Ferry-island deep dives with place photography |
| **Scavenger hunt** | Printable San Juan Island checklist (tidepools, Lime Kiln, Pig War camps; persists in `localStorage`) |
| **Discover** | Sixteen-question quiz |
| **Wildlife sounds** | Play real field-recording clips on each species card |
| **Whale reports** | Full report text + linked photos / video / hydrophone audio |

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

### How live data works on GitHub Pages

GitHub Pages is static, so it cannot run `server.py`. Instead the browser calls Orca Network’s public WordPress REST endpoint directly:

```
GET https://orcanetwork.org/wp-json/wp/v2/whale_sightings?slug=october-2025-whale-sightings
```

That API returns the full monthly report HTML and **allows CORS from any origin**, so a Pages site can load the latest published month without a proxy. The client walks newest → older months (up to 18), parses species / places / coordinates, and re-polls about every 10 minutes while the tab is open.

### Load order

1. **`GET /api/sightings`** if you run `python3 server.py` (optional; same data, richer media parse)
2. **Orca Network WP REST** (primary live path on GitHub Pages)
3. **Public CORS proxies** to monthly HTML pages (secondary)
4. **`data/sightings.json`** Actions cache (fallback if live fetch fails)
5. **In-file samples** only if everything else fails

Refresh the cache snapshot (CI / offline fallback):

```bash
python3 scripts/export_sightings.py
```

An hourly GitHub Action (`.github/workflows/refresh-sightings.yml`) re-exports `data/sightings.json` so the site still has recent pins if Orca Network is briefly unreachable. Always open Orca Network for authoritative, up-to-date reports.

```bash
# Live API the browser uses (no key)
curl -s 'https://orcanetwork.org/wp-json/wp/v2/whale_sightings?slug=october-2025-whale-sightings&_fields=slug,modified' | head

# Local server (optional)
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
