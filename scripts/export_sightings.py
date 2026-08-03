#!/usr/bin/env python3
"""Export data/sightings.json as a fallback cache for GitHub Pages.

The live site normally fetches Orca Network's WordPress REST API in the
browser (open CORS). This file is only used when that live path fails.
CI runs this hourly; you can also run it locally:

  python3 scripts/export_sightings.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from server import build_feed  # noqa: E402


def main() -> int:
    feed = build_feed()
    out = ROOT / "data" / "sightings.json"
    out.parent.mkdir(parents=True, exist_ok=True)

    payload = dict(feed)
    payload["static"] = True
    note = (payload.get("note") or "").strip()
    snap_note = "Fallback cache for GitHub Pages when live WP REST is unreachable."
    payload["note"] = f"{note} {snap_note}".strip() if note else snap_note

    out.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(
        f"Wrote {out.relative_to(ROOT)} "
        f"ok={payload.get('ok')} count={payload.get('count', 0)} "
        f"source={payload.get('source')}"
    )
    return 0 if payload.get("ok") and payload.get("count", 0) >= 2 else 1


if __name__ == "__main__":
    raise SystemExit(main())
