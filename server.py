#!/usr/bin/env python3
"""
Local server for San Juan Islands interactive.

Serves static files and proxies Orca Network monthly sighting pages
so the browser can load a real feed without CORS failures.

  python3 server.py
  → http://127.0.0.1:8080

API:
  GET /api/sightings          → parsed JSON feed
  GET /api/sightings/raw?url= → raw HTML proxy (debug)
"""

from __future__ import annotations

import json
import re
import threading
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from html import unescape
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent
PORT = 8080
CACHE_TTL = 15 * 60  # seconds
UA = "SanJuanIslandsInteractive/1.0 (educational; local proxy; +http://127.0.0.1)"

_cache: dict = {"ts": 0.0, "payload": None}
_lock = threading.Lock()

MONTHS = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
]

# Place → [lat, lng] for geocoding report text
PLACES = {
    "lime kiln": [48.5158, -123.1525],
    "lime kiln point": [48.5158, -123.1525],
    "whale watch park": [48.5158, -123.1525],
    "haro strait": [48.55, -123.18],
    "haro": [48.55, -123.18],
    "friday harbor": [48.5342, -123.017],
    "san juans": [48.55, -122.98],
    "san juan island": [48.53, -123.08],
    "san juan": [48.53, -123.08],
    "orcas island": [48.65, -122.92],
    "orcas": [48.65, -122.92],
    "eastsound": [48.696, -122.906],
    "lopez island": [48.48, -122.89],
    "lopez": [48.48, -122.89],
    "shaw island": [48.57, -122.95],
    "shaw": [48.57, -122.95],
    "stuart island": [48.68, -123.2],
    "stuart": [48.68, -123.2],
    "turn point": [48.6889, -123.2375],
    "boundary pass": [48.72, -123.15],
    "rosario strait": [48.55, -122.75],
    "rosario": [48.55, -122.75],
    "cattle point": [48.45, -122.96],
    "spieden": [48.64, -123.12],
    "sucia": [48.75, -122.91],
    "waldron": [48.69, -123.03],
    "active pass": [48.87, -123.3],
    "galiano": [48.92, -123.45],
    "saturna": [48.78, -123.15],
    "gulf islands": [48.85, -123.35],
    "victoria": [48.43, -123.37],
    "anacortes": [48.51, -122.61],
    "whidbey": [48.2, -122.65],
    "admiralty inlet": [48.1, -122.7],
    "puget sound": [47.7, -122.45],
    "south puget sound": [47.25, -122.55],
    "north puget sound": [48.0, -122.45],
    "possession sound": [47.98, -122.25],
    "hood canal": [47.6, -122.9],
    "strait of juan de fuca": [48.3, -123.3],
    "juan de fuca": [48.3, -123.3],
    "bellingham": [48.75, -122.48],
    "birch bay": [48.92, -122.75],
    "semiahmoo": [48.99, -122.78],
    "point roberts": [48.98, -123.05],
    "swinomish": [48.4, -122.5],
    "deception pass": [48.41, -122.64],
    "edmonds": [47.81, -122.38],
    "seattle": [47.61, -122.35],
    "tacoma": [47.25, -122.45],
    "olympia": [47.05, -122.9],
    "port townsend": [48.12, -122.76],
    "port angeles": [48.12, -123.43],
    "sequim": [48.08, -123.1],
    "vashon": [47.42, -122.46],
    "bainbridge": [47.65, -122.53],
    "kingston": [47.8, -122.5],
    "mukilteo": [47.95, -122.3],
    "everett": [47.98, -122.2],
    "saratoga passage": [48.1, -122.5],
    "penn cove": [48.23, -122.7],
    "race rocks": [48.3, -123.53],
    "becher bay": [48.33, -123.63],
    "swiftsure": [48.55, -125.0],
}

SPECIES_RE = re.compile(
    r"(BIGG.?S|SOUTHERN RESIDENT|KILLER WHALE|ORCA|HUMPBACK|GRAY WHALE|"
    r"MINKE|PORPOISE|PACIFIC WHITE.?SIDED|FALSE KILLER|FIN WHALE)",
    re.I,
)
DATE_RE = re.compile(
    r"\b((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\.?,?\s+)?"
    r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}"
    r"(?:,?\s+\d{4})?)",
    re.I,
)
COORD_RE = re.compile(r"(\d{2}\.\d{3,7})\s*,\s*(-1\d{2}\.\d{3,7})")
GROUP_RE = re.compile(r"\b(T\d{2,3}[A-Z0-9]*s?|[JKL]\s*[Pp]od)\b")


def fetch_url(url: str, timeout: int = 12) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html,*/*"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read()
            charset = resp.headers.get_content_charset() or "utf-8"
            return resp.status, raw.decode(charset, errors="replace")
    except urllib.error.HTTPError as e:
        # Don't pull huge soft-404 bodies
        try:
            body = e.read(8000).decode("utf-8", errors="replace") if e.fp else ""
        except Exception:
            body = ""
        return e.code, body
    except Exception as e:
        return 0, str(e)


def month_candidates(n: int = 18) -> list[dict]:
    now = datetime.now()
    out = []
    y, m = now.year, now.month
    for _ in range(n):
        name = MONTHS[m - 1]
        out.append(
            {
                "month": name,
                "year": y,
                "url": f"https://orcanetwork.org/whale_sightings/{name}-{y}-whale-sightings/",
            }
        )
        m -= 1
        if m == 0:
            m = 12
            y -= 1
    return out


def html_to_lines(html: str) -> list[str]:
    text = re.sub(r"<script[\s\S]*?</script>", " ", html, flags=re.I)
    text = re.sub(r"<style[\s\S]*?</style>", " ", text, flags=re.I)
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = re.sub(r"</(p|div|h\d|li|tr)>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = unescape(text)
    text = text.replace("\xa0", " ")
    text = re.sub(r"[ \t]+", " ", text)
    lines = [ln.strip() for ln in text.split("\n")]
    return [ln for ln in lines if 8 < len(ln) < 500]


def resolve_place(text: str):
    lower = text.lower()
    for key in sorted(PLACES.keys(), key=len, reverse=True):
        if key in lower:
            lat, lng = PLACES[key]
            return lat, lng, key
    return None


def classify(species: str, text: str) -> str:
    s = f"{species} {text}".lower()
    if re.search(r"southern resident|j pod|k pod|l pod|resident killer", s):
        return "resident"
    if re.search(r"bigg|transient|\bt\d{2}", s):
        return "biggs"
    if "gray whale" in s:
        return "gray"
    if "humpback" in s:
        return "humpback"
    if re.search(r"minke|porpoise|dolphin|fin whale", s):
        return "other"
    if re.search(r"orca|killer whale", s):
        return "biggs"
    return "other"


def parse_sightings(html: str, source_label: str) -> list[dict]:
    if not html or len(html) < 800:
        return []
    # Real monthly pages are large; 404 Divi pages are ~160k of chrome without report body
    if "whale_sightings" not in html and "KILLER WHALE" not in html.upper() and "HUMPBACK" not in html.upper():
        return []

    lines = html_to_lines(html)
    sightings: list[dict] = []
    current_date = ""
    current_species = ""
    seen = set()

    for line in lines:
        dm = DATE_RE.search(line)
        if dm:
            current_date = dm.group(0).strip()

        sm = SPECIES_RE.search(line)
        if sm and len(line) < 80:
            current_species = sm.group(0)
            continue

        if not SPECIES_RE.search(line) and not current_species:
            continue
        if not SPECIES_RE.search(line) and current_species and not (
            COORD_RE.search(line) or resolve_place(line) or GROUP_RE.search(line)
        ):
            continue

        species_match = SPECIES_RE.search(line)
        species = species_match.group(0) if species_match else (current_species or "Cetacean")

        lat = lng = None
        loc = None
        cm = COORD_RE.search(line)
        if cm:
            lat, lng = float(cm.group(1)), float(cm.group(2))
            loc = f"{lat:.3f}, {lng:.3f}"
        else:
            place = resolve_place(line)
            if place:
                lat, lng, loc = place

        if lat is None:
            continue

        # Salish Sea-ish bounds
        if not (46.5 <= lat <= 50.5 and -126.5 <= lng <= -121.5):
            continue

        gm = GROUP_RE.search(line)
        group = gm.group(0) if gm else ""
        note = re.sub(r"\s+", " ", line)[:240]
        key = (round(lat, 3), round(lng, 3), group or species, current_date)
        if key in seen:
            continue
        seen.add(key)

        kind = classify(species, line)
        species_label = re.sub(r"\s+", " ", species).strip()
        sl = species_label.lower()
        if "southern resident" in sl or sl in ("southern resident",):
            species_label = "Southern Resident killer whales"
        elif "bigg" in sl:
            species_label = "Bigg's killer whales"
        elif sl in ("orca", "killer whale", "killer whales"):
            species_label = "Killer whale (orca)"
        elif "humpback" in sl:
            species_label = "Humpback whale"
        elif "gray" in sl:
            species_label = "Gray whale"
        elif "minke" in sl:
            species_label = "Minke whale"
        # Slight jitter so stacked pins separate
        jitter = (hash(note) % 1000) / 100000.0
        sightings.append(
            {
                "id": f"live-{len(sightings)}",
                "species": species_label,
                "kind": kind,
                "group": group,
                "location": loc or "Salish Sea",
                "when": current_date or "Report",
                "note": note,
                "lat": round(lat + (jitter - 0.005), 5),
                "lng": round(lng + ((hash(note[::-1]) % 1000) / 100000.0 - 0.005), 5),
                "source": source_label,
            }
        )
        if len(sightings) >= 40:
            break

    return sightings


def prefer_local(sightings: list[dict]) -> list[dict]:
    """Prefer San Juan archipelago, but keep a mix of Salish Sea."""
    local = [
        s
        for s in sightings
        if 48.3 <= s["lat"] <= 48.9 and -123.45 <= s["lng"] <= -122.55
    ]
    if len(local) >= 4:
        rest = [s for s in sightings if s not in local]
        return local[:24] + rest[:8]
    return sightings[:32]


def _try_month(c: dict) -> tuple[dict, list[dict] | None, str]:
    """Return (candidate, parsed_or_None, error_note)."""
    status, body = fetch_url(c["url"], timeout=8)
    if status != 200:
        return c, None, f"{c['month']} {c['year']}: HTTP {status}"
    upper = body.upper()
    if ("PAGE NOT FOUND" in upper or "ERROR 404" in upper) and "KILLER WHALE" not in upper:
        return c, None, f"{c['month']} {c['year']}: soft 404"
    if "KILLER" not in upper and "HUMPBACK" not in upper and "GRAY WHALE" not in upper:
        return c, None, f"{c['month']} {c['year']}: no cetacean content"
    parsed = parse_sightings(body, f"Orca Network · {c['month'].title()} {c['year']}")
    if len(parsed) < 2:
        return c, None, f"{c['month']} {c['year']}: parsed {len(parsed)}"
    return c, parsed, ""


def build_feed() -> dict:
    with _lock:
        if _cache["payload"] and (time.time() - _cache["ts"]) < CACHE_TTL:
            return _cache["payload"]

    errors: list[str] = []
    used = None
    all_sightings: list[dict] = []
    candidates = month_candidates(18)

    # Fetch newest months first, in small parallel batches, stop at first hit
    batch_size = 4
    for i in range(0, len(candidates), batch_size):
        batch = candidates[i : i + batch_size]
        results: list[tuple[dict, list[dict] | None, str]] = []
        with ThreadPoolExecutor(max_workers=batch_size) as pool:
            futs = {pool.submit(_try_month, c): c for c in batch}
            for fut in as_completed(futs):
                results.append(fut.result())
        # Prefer earliest in batch order (more recent month)
        by_url = {r[0]["url"]: r for r in results}
        for c in batch:
            c2, parsed, err = by_url[c["url"]]
            if err:
                errors.append(err)
            if parsed and not all_sightings:
                used = c2
                all_sightings = parsed
        if all_sightings:
            break

    if not all_sightings:
        payload = {
            "ok": False,
            "live": False,
            "sightings": [],
            "error": "No monthly Orca Network pages could be parsed",
            "tried": errors[:12],
            "refreshed": datetime.now().isoformat(timespec="seconds"),
        }
    else:
        chosen = prefer_local(all_sightings)
        payload = {
            "ok": True,
            "live": True,
            "sightings": chosen,
            "source": f"{used['month']} {used['year']}",
            "sourceUrl": used["url"],
            "count": len(chosen),
            "refreshed": datetime.now().isoformat(timespec="seconds"),
            "note": "Parsed from Orca Network monthly report. Positions approximate.",
        }

    with _lock:
        _cache["ts"] = time.time()
        _cache["payload"] = payload
    return payload


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        print(f"[{self.log_date_time_string()}] {args[0]}")

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/sightings":
            # ?refresh=1 bypasses cache
            qs = parse_qs(parsed.query)
            if qs.get("refresh", [""])[0] in ("1", "true", "yes"):
                with _lock:
                    _cache["ts"] = 0
            try:
                payload = build_feed()
                body = json.dumps(payload, indent=2).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Cache-Control", "no-store")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            except Exception as e:
                err = json.dumps({"ok": False, "error": str(e)}).encode()
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(err)))
                self.end_headers()
                self.wfile.write(err)
            return

        if parsed.path == "/api/sightings/raw":
            qs = parse_qs(parsed.query)
            url = (qs.get("url") or [""])[0]
            if not url.startswith("https://orcanetwork.org/"):
                self.send_error(400, "Only orcanetwork.org URLs allowed")
                return
            status, body = fetch_url(url)
            data = body.encode("utf-8", errors="replace")
            self.send_response(200 if status == 200 else 502)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        if parsed.path == "/api/health":
            body = b'{"ok":true,"service":"sji-local"}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        return super().do_GET()


def main():
    # Warm cache in background so first browser hit is fast
    def warm():
        try:
            feed = build_feed()
            print(f"Sightings warm: live={feed.get('live')} count={feed.get('count', 0)} source={feed.get('source')}")
        except Exception as e:
            print("Warm failed:", e)

    threading.Thread(target=warm, daemon=True).start()

    httpd = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"San Juan Islands → http://127.0.0.1:{PORT}")
    print(f"Sightings API   → http://127.0.0.1:{PORT}/api/sightings")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nBye.")
        httpd.server_close()


if __name__ == "__main__":
    main()
