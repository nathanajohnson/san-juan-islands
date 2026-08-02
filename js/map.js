/**
 * Interactive SVG chart of the San Juan Islands — "Chart & Current"
 * Full NOAA-style treatment: buff land on pale-teal water, graticule tied to
 * real lat/lng, 3-band bathymetric tints, depth soundings, curved hydrographic
 * labels, 16-point compass rose, animated WSF ferry, title cartouche.
 * Chart space 640×460 ≈ lng −123.30…−122.59, lat 48.80…48.375.
 */
(function () {
  const wrap = () => document.getElementById("map-svg-wrap");
  const panel = () => document.getElementById("map-panel");

  // Projection helpers (real WGS84 → chart px)
  const PX = (lng) => (lng + 123.3) * 880 + 16;
  const PY = (lat) => (48.8 - lat) * 1000 + 16;

  // Hand-traced, recognizable island silhouettes (replace blob paths in data.js)
  const CHART_PATHS = {
    // Tilted rectangle tapering SE to Cattle Point; Friday Harbor + False Bay notches
    "san-juan":
      "M155 205 C168 197 182 194 194 200 C206 205 214 214 222 224 C232 236 242 246 249 258 L258 268 C254 272 250 276 252 281 C257 285 263 285 268 291 C275 300 279 312 276 322 C280 333 288 344 298 354 L312 366 C304 369 296 367 288 363 C276 359 264 356 254 352 C246 350 240 348 236 344 C234 340 233 337 229 336 C225 338 223 342 218 343 C207 340 196 334 186 326 C176 318 166 308 158 297 C151 288 147 278 146 268 C148 264 149 260 145 256 C141 252 139 246 139 240 C139 231 142 223 147 216 C149 211 152 207 155 205 Z",
    // Horseshoe: East Sound cuts deep from the south almost to the north shore
    orcas:
      "M266 166 C270 150 278 138 292 128 C310 118 330 110 352 106 C378 100 400 96 422 100 C440 102 452 106 460 118 C464 130 466 140 464 152 C462 168 456 184 444 198 C436 208 432 220 422 228 C414 220 410 210 408 196 C406 182 404 170 400 158 C396 146 390 138 380 137 C374 134 368 135 364 141 C359 150 356 160 355 172 C353 190 350 208 340 226 C332 224 326 222 320 216 C316 208 314 200 314 194 C310 198 306 202 304 210 C298 218 292 222 284 220 C274 214 268 206 266 196 C263 184 263 174 266 166 Z",
    // Long and thin, N–S, Fisherman Bay curl on the west shore
    lopez:
      "M383 243 C391 245 397 252 399 260 C404 272 407 286 409 300 C411 316 414 332 418 348 C421 362 423 376 419 386 C412 392 402 392 395 386 C388 378 383 368 379 358 C375 346 373 336 374 328 C377 324 379 320 377 315 C371 313 367 318 363 322 C358 316 355 306 354 296 C352 282 352 268 356 256 C362 246 372 241 383 243 Z",
    shaw:
      "M305 240 C309 231 319 226 329 226 C333 229 333 233 337 233 C343 231 349 236 350 244 C349 253 341 260 330 262 C318 264 307 259 303 251 C301 247 302 244 305 240 Z",
    // Claw arcs opening east
    sucia:
      "M344 70 C343 60 352 52 364 49 C378 46 392 49 399 56 C401 60 398 63 392 62 C382 60 372 61 365 65 C374 67 386 66 395 70 C397 74 393 78 385 79 C373 81 359 80 350 76 C346 74 344 72 344 70 Z",
    // Arrowhead NW–SE: Turn Point at NW tip, Prevost Harbor notch on the north
    // shore, Reid Harbor as a long SE-opening slit
    stuart:
      "M72 127 C78 121 87 117 97 115 C104 114 110 115 115 117 L116.5 118 L116.8 124 C117 126.5 120 126.5 120.3 124 L120.6 119.5 C124 118.5 128 118.8 132 120.5 C136.5 122.5 140 125.5 142 129 C143.2 131.5 142.5 133.5 139.8 134.6 L135.5 136.5 C127 132.5 118.5 129.8 110.5 128.8 C108 128.5 107.2 130.6 109.6 131.9 C116.5 135.4 123.5 139.5 129.5 144 C131.2 145.4 130.4 147 127.8 147.2 C115.5 148.4 101.5 147.8 89.5 143.8 C81.5 140.8 75 135.2 72 130.8 Z",
    // E–W sliver
    spieden:
      "M144 176 C160 169 186 165 210 168 C219 169 223 172 220 175 C202 180 172 181 150 179 C145 178 142 177 144 176 Z",
    // Triangular: Point Disney bluff W, Sandy Point promontory E, Cowlitz Bay bight SW
    waldron:
      "M252 106 C258 101 268 99 277 101 C283 102.5 287 106 288.5 111 L296 121 C297.5 123 296.5 125 293.5 125.5 L288 126.5 C287 131 283.5 135 277.5 137.5 C270 140.5 263 140.8 257 137.2 C254.8 135.8 254.6 133.4 256.6 132 C254 130.4 250.9 130.6 249.3 128.4 C247.3 125.6 246.8 122 247.5 118.5 C248.3 113.5 249.8 109.5 252 106 Z",
    blakely:
      "M442 236 C450 227 461 224 470 230 C478 237 481 248 478 259 C475 270 469 279 459 281 C451 283 445 276 446 268 C447 261 444 255 440 250 C439 245 440 240 442 236 Z",
    jones:
      "M235 200 C236 192 244 188 252 191 C258 194 258 202 251 206 C243 209 236 206 235 200 Z"
  };

  // Non-interactive supporting land (recognizable neighbours)
  const DECOR_LAND = [
    // Decatur
    "M444 292 C450 286 459 285 465 290 C471 296 472 305 469 313 C466 320 458 325 450 322 C443 320 439 312 440 303 C441 299 442 295 444 292 Z",
    // Matia
    "M410 64 C414 60 422 60 425 64 C426 68 421 71 415 70 C411 69 409 67 410 64 Z",
    // Cypress
    "M540 220 C548 210 560 212 563 224 C565 238 559 252 549 256 C540 258 533 250 534 238 C534 230 536 226 540 220 Z",
    // Wasp islets
    "M268 228 C270 225 274 225 276 228 C277 231 274 233 271 232 C269 231 267 230 268 228 Z",
    "M281 220 C283 217 287 218 288 221 C288 224 285 225 282 224 C280 223 280 221 281 220 Z",
    "M291 232 C293 229 297 230 298 233 C298 236 294 237 292 235 C291 234 290 233 291 232 Z"
  ];

  const MAINLAND = [
    // Vancouver Island edge (west)
    "M18 148 C30 152 40 162 44 176 C50 194 46 214 52 232 C58 252 52 272 56 292 C62 314 56 336 60 358 C64 380 58 404 62 428 L58 442 L18 442 Z",
    // Gulf Islands (Saturna, Pender)
    "M128 52 C138 40 158 34 176 38 C186 41 188 48 180 53 C164 60 142 62 130 58 C126 56 126 54 128 52 Z",
    "M62 76 C68 64 84 58 98 62 C106 65 106 72 98 77 C86 83 70 84 63 80 Z",
    // Mainland / Lummi (NE corner)
    "M560 18 L622 18 L622 120 C608 112 600 100 596 86 C590 72 578 62 566 56 C558 50 556 40 560 30 Z",
    // Fidalgo / Anacortes shore (east)
    "M622 232 C606 240 598 252 600 266 C603 280 596 292 586 300 C578 308 576 320 582 332 C574 342 570 356 574 370 C566 384 564 400 570 414 L566 442 L622 442 Z"
  ];

  const LABEL_POS = {
    shaw: [327, 248],
    sucia: [372, 41],
    stuart: [104, 109],
    spieden: [183, 160],
    waldron: [270, 93],
    blakely: [461, 217],
    jones: [246, 217]
  };
  const MINOR_IDS = ["spieden", "blakely", "waldron", "jones"];

  function r1(n) { return Math.round(n * 10) / 10; }

  function compassRose(cx, cy) {
    let out = `<g class="compass-rose" transform="translate(${cx}, ${cy})">`;
    out += `<circle r="38" class="cr-ring"/><circle r="34" class="cr-ring"/><circle r="20" class="cr-ring cr-ring--dash"/>`;
    // degree ticks between the two outer rings
    for (let d = 0; d < 360; d += 10) {
      const a = (d * Math.PI) / 180;
      out += `<line class="cr-tick" x1="${r1(34 * Math.sin(a))}" y1="${r1(-34 * Math.cos(a))}" x2="${r1(38 * Math.sin(a))}" y2="${r1(-38 * Math.cos(a))}"/>`;
    }
    // 16 points: cardinal long, intercardinal mid, half-points short
    for (let i = 0; i < 16; i++) {
      const a = (i * 22.5 * Math.PI) / 180;
      const len = i % 4 === 0 ? 33 : i % 2 === 0 ? 23 : 14;
      const w = i % 4 === 0 ? 4.4 : i % 2 === 0 ? 3.1 : 2.1;
      const cls = i === 0 ? "cr-n" : i % 4 === 0 ? "cr-card" : i % 2 === 0 ? "cr-inter" : "cr-minor";
      const sx = Math.sin(a), cy2 = Math.cos(a);
      const tipX = r1(len * sx), tipY = r1(-len * cy2);
      const bX = r1(7 * sx), bY = r1(-7 * cy2);
      const pX = r1(w * cy2), pY = r1(w * sx);
      out += `<path class="cr-pt ${cls}" d="M${tipX} ${tipY} L${r1(bX + pX)} ${r1(bY + pY)} L0 0 L${r1(bX - pX)} ${r1(bY - pY)} Z"/>`;
    }
    out += `<circle r="3" class="cr-hub"/>`;
    out += `<text y="-44" text-anchor="middle" class="cr-letter">N</text>`;
    out += `<text y="52" text-anchor="middle" class="cr-letter cr-letter--s">S</text>`;
    out += `<text x="-46" y="3.5" text-anchor="middle" class="cr-letter cr-letter--s">W</text>`;
    out += `<text x="46" y="3.5" text-anchor="middle" class="cr-letter cr-letter--s">E</text>`;
    out += `</g>`;
    return out;
  }

  function cornerOrnament(x, y, rot) {
    // Abstract crescent + trigon corner mark (geometric homage, not a crest)
    return `<g class="corner-orn" transform="translate(${x} ${y}) rotate(${rot})">
      <path d="M2 13 C2 6.9 6.9 2 13 2 L13 4.6 C8.4 4.6 4.6 8.4 4.6 13 Z"/>
      <path d="M7.6 7.6 L13.4 5.6 L11.4 11.4 Z" class="co-trigon"/>
    </g>`;
  }

  // Chart place symbols (shown by the "Places" layer)
  const PLACE_MARKS = [
    { id: "lime-kiln", kind: "light", label: "Lime Kiln Lt", dx: -6, dy: 12, anchor: "end" },
    { id: "turn-point", kind: "light", label: "Turn Pt Lt", dx: 0, dy: -10, anchor: "middle" },
    { id: "friday-harbor", kind: "anchor", label: "Friday Harbor", dx: 8, dy: 3, anchor: "start" },
    { id: "american-camp", kind: "camp", label: "American Camp", dx: 2, dy: 13, anchor: "middle" },
    { id: "english-camp", kind: "camp", label: "English Camp", dx: -7, dy: -6, anchor: "end" },
    { id: "mt-constitution", kind: "peak", label: "Mt Constitution 2409", dx: 9, dy: 3, anchor: "start" },
    { id: "spencer-spit", kind: "camp", label: "Spencer Spit", dx: 9, dy: 3, anchor: "start" },
    { id: "eastsound", kind: "anchor", label: "Eastsound", dx: 0, dy: -9, anchor: "middle" },
    { id: "grannys-cove", kind: "tide", label: "Granny’s Cove", dx: -6, dy: 12, anchor: "end" },
    { id: "cattle-point", kind: "light", label: "Cattle Pt", dx: 8, dy: 4, anchor: "start" },
    { id: "south-beach", kind: "tide", label: "South Beach", dx: 0, dy: 13, anchor: "middle" }
  ];

  function placeSymbol(kind) {
    if (kind === "light")
      return `<circle r="1.7" class="pm-dot"/><path class="pm-flare" d="M0 -2 C-1.6 -5.5 -1 -8.5 0 -9.5 C1 -8.5 1.6 -5.5 0 -2 Z"/>`;
    if (kind === "anchor")
      return `<g class="pm-anchor"><path d="M0 -3.4 V2.6 M-2.6 0.4 C-1.4 2.8 1.4 2.8 2.6 0.4 M-1.8 -1.6 H1.8"/><circle cx="0" cy="-4.4" r="1"/></g>`;
    if (kind === "peak") return `<path class="pm-peak" d="M-3.4 2.4 L0 -3.4 L3.4 2.4 Z"/>`;
    if (kind === "tide")
      return `<g class="pm-tide"><ellipse cx="0" cy="1.2" rx="3.6" ry="1.6" class="pm-pool"/><path d="M-2.8 -0.4 Q-1.4 -2.4 0 -0.6 Q1.4 -2.4 2.8 -0.4" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/><circle cx="-1.1" cy="1" r="0.55"/><circle cx="1.2" cy="1.35" r="0.45"/></g>`;
    return `<path class="pm-camp" d="M-3 2.6 L0 -3 L3 2.6 M-1.2 2.6 L0 0.4 L1.2 2.6"/>`;
  }

  function buildMap() {
    const el = wrap();
    if (!el) return;

    const islands = SJI.ISLANDS;
    let islandPaths = "";
    let band1 = "", band2 = "", band3 = "";
    let labels = "";

    const allLand = [];
    Object.values(islands).forEach((isle) => {
      const d = CHART_PATHS[isle.id] || isle.path;
      allLand.push(d);
      islandPaths += `<path class="island" data-id="${isle.id}" id="island-${isle.id}" d="${d}" tabindex="0" role="button" aria-label="${isle.name}" />`;
      const short = isle.name.replace(" Island", "").toUpperCase();
      if (LABEL_POS[isle.id]) {
        const [lx, ly] = LABEL_POS[isle.id];
        const cls = MINOR_IDS.includes(isle.id) ? "island-label island-label--minor" : "island-label";
        labels += `<text class="${cls}" x="${lx}" y="${ly}" text-anchor="middle">${short}</text>`;
      }
    });
    DECOR_LAND.forEach((d) => allLand.push(d));
    // Dashed ~10-fathom depth contour offset around the major islands
    const CONTOUR_IDS = ["san-juan", "orcas", "lopez", "shaw", "stuart", "waldron", "sucia", "blakely"];
    const contour = CONTOUR_IDS
      .map((cid) => CHART_PATHS[cid])
      .filter(Boolean)
      .map((d) => `<path d="${d}"/>`)
      .join("");
    // 3-band bathymetric tint hugging every shoreline (widest first)
    allLand.forEach((d) => {
      band3 += `<path d="${d}"/>`;
      band2 += `<path d="${d}"/>`;
      band1 += `<path d="${d}"/>`;
    });
    const decor = DECOR_LAND.map((d) => `<path class="islet" d="${d}"/>`).join("");
    const mainland = MAINLAND.map((d) => `<path class="mainland" d="${d}"/>`).join("");

    // Curved labels for the three big islands (textPath)
    labels += `<text class="island-label"><textPath href="#lblIsleSJ" startOffset="50%" text-anchor="middle">SAN JUAN</textPath></text>`;
    labels += `<text class="island-label"><textPath href="#lblIsleOrcas" startOffset="50%" text-anchor="middle">ORCAS</textPath></text>`;
    labels += `<text class="island-label"><textPath href="#lblIsleLopez" startOffset="50%" text-anchor="middle">LOPEZ</textPath></text>`;
    labels += `<text class="island-label island-label--minor" x="456" y="338" text-anchor="middle">DECATUR</text>`;

    // Depth soundings in fathoms — plausible for each channel
    const soundings = [
      [96, 168, 102], [88, 232, 131], [94, 296, 118], [150, 352, 88],
      [118, 88, 89], [184, 62, 72], [252, 42, 64],
      [256, 150, 48], [298, 130, 42], [222, 120, 67],
      [128, 190, 34], [152, 148, 58], [78, 204, 104], [100, 96, 90],
      [302, 254, 52], [308, 304, 46], [318, 352, 38], [240, 212, 44],
      [290, 312, 9], [374, 168, 17], [371, 198, 13],
      [330, 84, 55], [300, 62, 58], [420, 44, 63],
      [508, 124, 71], [516, 192, 88], [514, 258, 95], [510, 326, 81], [516, 396, 66],
      [428, 266, 24], [430, 318, 19],
      [160, 414, 127], [268, 418, 104], [380, 416, 92], [478, 408, 74]
    ];
    const soundingText = soundings
      .map(([x, y, n]) => `<text class="sounding" x="${x}" y="${y}">${n}</text>`)
      .join("");

    // NOAA "+" rock marks
    const plusRocks = [
      [170, 158], [236, 176], [470, 158], [494, 300], [352, 408],
      [210, 392], [126, 116], [432, 86], [546, 148], [72, 300], [318, 176]
    ];
    const rockMarks = plusRocks
      .map(([x, y]) => `<path class="rock-mark" d="M${x - 3} ${y} H${x + 3} M${x} ${y - 3} V${y + 3}" />`)
      .join("");

    // Graticule on true 0.1° lines, with margin coordinate labels
    const gxs = [104, 192, 280, 368, 456, 544];
    const gxl = ["123°12'", "123°06'", "123°00'", "122°54'", "122°48'", "122°42'"];
    const gys = [116, 216, 316, 416];
    const gyl = ["48°42'", "48°36'", "48°30'", "48°24'"];
    let grat = "", coordLabels = "";
    gxs.forEach((gx, i) => {
      grat += `<line x1="${gx}" y1="18" x2="${gx}" y2="442" />`;
      coordLabels += `<text class="cf-coord" x="${gx}" y="15.5" text-anchor="middle">${gxl[i]}</text>`;
      coordLabels += `<text class="cf-coord" x="${gx}" y="449.5" text-anchor="middle">${gxl[i]}</text>`;
    });
    gys.forEach((gy, i) => {
      grat += `<line x1="18" y1="${gy}" x2="622" y2="${gy}" />`;
      coordLabels += `<text class="cf-coord" transform="rotate(-90 14.5 ${gy})" x="14.5" y="${gy + 2}" text-anchor="middle">${gyl[i]}</text>`;
      coordLabels += `<text class="cf-coord" transform="rotate(90 625.5 ${gy})" x="625.5" y="${gy + 2}" text-anchor="middle">${gyl[i]}</text>`;
    });

    // Frame edge division ticks
    let ticks = "";
    for (let gx = 30; gx < 614; gx += 20) {
      ticks += `<rect x="${gx}" y="18" width="10" height="2.5" /><rect x="${gx}" y="439.5" width="10" height="2.5" />`;
    }
    for (let gy = 30; gy < 434; gy += 20) {
      ticks += `<rect x="18" y="${gy}" width="2.5" height="10" /><rect x="619.5" y="${gy}" width="2.5" height="10" />`;
    }

    // Chart place marks (Places layer)
    const placeMarks = PLACE_MARKS.map((p) => {
      const g = SJI.GEO?.places?.[p.id];
      if (!g) return "";
      const x = r1(PX(g.lng)), y = r1(PY(g.lat));
      return `<g class="place-mark" transform="translate(${x} ${y})">${placeSymbol(p.kind)}<text class="pm-label" x="${p.dx}" y="${p.dy}" text-anchor="${p.anchor}">${p.label}</text></g>`;
    }).join("");

    el.innerHTML = `
      <svg viewBox="0 0 640 460" xmlns="http://www.w3.org/2000/svg" aria-label="Nautical chart of the San Juan Islands">
        <defs>
          <linearGradient id="chartWater" x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0" stop-color="#cfe1da"/>
            <stop offset="1" stop-color="#c6dbd4"/>
          </linearGradient>
          <linearGradient id="chartLand" x1="0" y1="0" x2="0.25" y2="1">
            <stop offset="0" stop-color="#e9e5cb"/>
            <stop offset="0.55" stop-color="#efe6c8"/>
            <stop offset="1" stop-color="#e9d8b2"/>
          </linearGradient>
          <pattern id="hatchGold" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#c9a227" stroke-width="1.1" opacity="0.5"/>
          </pattern>
          <filter id="deepBlur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="7"/>
          </filter>
          <path id="lblHaro" d="M98 332 C90 272 92 212 110 152" fill="none"/>
          <path id="lblBoundary" d="M66 132 C140 96 210 72 288 56" fill="none"/>
          <path id="lblRosario" d="M540 118 C534 210 532 300 540 402" fill="none"/>
          <path id="lblSJChannel" d="M321 398 C315 344 321 300 339 262" fill="none"/>
          <path id="lblSpieden" d="M118 204 C158 193 198 189 246 193" fill="none"/>
          <path id="lblFuca" d="M140 434 C300 422 460 424 610 434" fill="none"/>
          <path id="lblPresident" d="M238 170 C266 149 297 133 330 122" fill="none"/>
          <path id="lblIsleSJ" d="M164 244 C198 271 230 298 260 328" fill="none"/>
          <path id="lblIsleOrcas" d="M334 126 C370 113 408 112 446 126" fill="none"/>
          <path id="lblIsleLopez" d="M363 266 C374 298 381 330 383 364" fill="none"/>
        </defs>

        <rect width="640" height="460" fill="url(#chartWater)"/>

        <!-- Deep-channel shading -->
        <g class="deep-channel" filter="url(#deepBlur)">
          <path d="M100 452 C96 380 92 300 100 220 C106 170 118 120 140 60"/>
          <path d="M520 452 C516 380 514 300 518 220 C520 160 526 100 534 30"/>
          <path d="M10 428 C160 414 400 417 630 424"/>
          <path d="M60 120 C120 90 190 70 260 55"/>
        </g>

        <g class="graticule">${grat}</g>

        <!-- 3-band bathymetric tint hugging the shorelines -->
        <g class="bathy bathy-3">${band3}</g>
        <g class="bathy bathy-2">${band2}</g>
        <g class="bathy bathy-1">${band1}</g>

        <!-- ~10-fathom dashed depth contour, offset from the major shorelines -->
        <g class="contour-fathom">${contour}</g>
        <text class="contour-label" x="132" y="246">10</text>
        <text class="contour-label" x="486" y="134">10</text>
        <text class="contour-label" x="342" y="386">10</text>

        ${soundingText}

        <!-- Neighbouring land beyond the archipelago -->
        ${mainland}

        <!-- Protected areas (layer): hatched per chart convention -->
        <g class="protected-layer">
          <ellipse class="protected" cx="372" cy="64" rx="44" ry="23"/>
          <ellipse class="protected" cx="86" cy="130" rx="32" ry="22"/>
          <ellipse class="protected" cx="272" cy="350" rx="46" ry="19" transform="rotate(-14 272 350)"/>
          <ellipse class="protected" cx="151" cy="299" rx="15" ry="26"/>
          <ellipse class="protected" cx="432" cy="150" rx="35" ry="31"/>
          <ellipse class="protected" cx="405" cy="277" rx="13" ry="17"/>
        </g>

        <!-- Shipping lanes -->
        <path class="route-ship" d="M70 442 C62 360 64 280 72 220 C76 170 82 120 92 66"/>
        <path class="route-ship" d="M82 442 C74 360 76 282 84 222 C88 172 94 122 104 68"/>
        <path class="route-ship" d="M496 442 C490 350 494 250 506 150 C510 110 516 70 522 30"/>
        <path class="route-ship" d="M518 442 C512 350 516 252 528 152 C532 112 538 72 544 32"/>

        <!-- Whale corridors -->
        <path class="route-whale" id="route-whale-main" d="M138 420 C124 340 126 260 138 200 C146 166 156 136 172 114"/>
        <path class="route-whale" d="M130 200 C180 148 240 106 300 90 C345 84 390 84 430 76"/>
        <path class="route-whale" d="M310 402 C302 356 306 312 318 276 C324 252 330 240 338 234"/>

        <!-- WSF ferry: Anacortes → Lopez → Shaw → Orcas → Friday Harbor -->
        <path class="route-ferry" id="route-ferry" d="M585 318 C560 308 538 300 518 296 C494 291 472 290 458 285 C446 281 436 273 425 266 C410 256 396 248 385 244 C372 240 358 237 348 235 C344 233 342 230 341 227 C330 235 316 245 304 253 C290 262 274 271 261 279"/>
        <g class="ferry-stops">
          <circle cx="585" cy="318" r="2.2"/><circle cx="385" cy="244" r="2.2"/>
          <circle cx="348" cy="235" r="2.2"/><circle cx="341" cy="227" r="2.2"/>
          <circle cx="258" cy="280" r="2.2"/>
        </g>
        <text class="pm-label ferry-label" x="592" y="330">ANACORTES</text>
        <g class="chart-ferry">
          <path class="cf-hull" d="M-10 1.6 L-6.6 5 L6.6 5 L10 1.6 Z"/>
          <path class="cf-house" d="M-7 1.6 L-7 -2 L7 -2 L7 1.6 Z"/>
          <path class="cf-top" d="M-4 -2 L-4 -4.4 L4 -4.4 L4 -2 Z"/>
          <path class="cf-win" d="M-5.6 0 H5.6"/>
          <animateMotion dur="46s" repeatCount="indefinite" keyPoints="0;1;1;0;0" keyTimes="0;0.46;0.5;0.96;1" calcMode="linear">
            <mpath href="#route-ferry"/>
          </animateMotion>
        </g>

        <!-- The islands -->
        <g class="decor-land">${decor}</g>
        <g id="islands-group">${islandPaths}</g>

        <!-- Relief hints: summit rings + ridge hachures -->
        <g class="relief">
          <ellipse cx="432" cy="144" rx="10" ry="6"/>
          <ellipse cx="432" cy="144" rx="4.5" ry="2.6"/>
          <ellipse cx="300" cy="176" rx="8" ry="4" transform="rotate(-24 300 176)"/>
          <ellipse cx="186" cy="264" rx="7.5" ry="3.5" transform="rotate(-46 186 264)"/>
          <path d="M404 350 C408 356 410 362 411 368"/>
        </g>

        ${rockMarks}
        <g class="places-layer">${placeMarks}</g>
        ${labels}

        <!-- Hydrographic labels curved along the channels -->
        <text class="water-label"><textPath href="#lblHaro" startOffset="12%">HARO STRAIT</textPath></text>
        <text class="water-label"><textPath href="#lblBoundary" startOffset="16%">BOUNDARY PASS</textPath></text>
        <text class="water-label"><textPath href="#lblRosario" startOffset="14%">ROSARIO STRAIT</textPath></text>
        <text class="water-label water-label--minor"><textPath href="#lblSJChannel" startOffset="8%">SAN JUAN CHANNEL</textPath></text>
        <text class="water-label water-label--minor"><textPath href="#lblSpieden" startOffset="6%">SPIEDEN CHANNEL</textPath></text>
        <text class="water-label water-label--minor"><textPath href="#lblPresident" startOffset="8%">PRESIDENT CHANNEL</textPath></text>
        <text class="water-label water-label--bay" transform="rotate(-50 297 334)" x="297" y="334" text-anchor="middle">GRIFFIN BAY</text>
        <text class="water-label"><textPath href="#lblFuca" startOffset="24%">STRAIT OF JUAN DE FUCA</textPath></text>

        ${compassRose(92, 390)}

        <!-- Title cartouche with scale -->
        <g class="cartouche" transform="translate(452, 28)">
          <rect x="0" y="0" width="160" height="94" class="ct-box"/>
          <rect x="3.5" y="3.5" width="153" height="87" class="ct-box ct-box--inner"/>
          <path class="ct-tick" d="M8 12 L8 8 L12 8 M148 8 L152 8 L152 12 M152 82 L152 86 L148 86 M12 86 L8 86 L8 82"/>
          <text x="80" y="22" text-anchor="middle" class="ct-kicker">SALISH SEA · WASHINGTON</text>
          <text x="80" y="42" text-anchor="middle" class="ct-title">The San Juan Islands</text>
          <line x1="24" y1="50" x2="136" y2="50" class="ct-rule"/>
          <text x="80" y="61" text-anchor="middle" class="ct-note">SOUNDINGS IN FATHOMS</text>
          <g class="chart-scale" transform="translate(38, 72)">
            <line x1="0" y1="0" x2="83.3" y2="0"/>
            <line x1="0" y1="-3.5" x2="0" y2="3.5"/><line x1="41.6" y1="-2.5" x2="41.6" y2="2.5"/><line x1="83.3" y1="-3.5" x2="83.3" y2="3.5"/>
            <rect x="0" y="-1.8" width="20.8" height="1.8" class="cs-block"/>
            <rect x="41.6" y="-1.8" width="20.8" height="1.8" class="cs-block"/>
            <text x="41.6" y="11" text-anchor="middle">NAUTICAL MILES · 5</text>
          </g>
        </g>

        <text class="chart-note" x="612" y="436" text-anchor="end">FOR EDUCATION · NOT FOR NAVIGATION</text>

        <!-- Chart frame: double rule, division ticks, coordinates, corner marks -->
        <g class="chart-frame">
          <rect x="8" y="8" width="624" height="444" class="cf-outer"/>
          <rect x="18" y="18" width="604" height="424" class="cf-inner"/>
          <g class="cf-ticks">${ticks}</g>
          ${coordLabels}
          ${cornerOrnament(10, 10, 0)}
          ${cornerOrnament(630, 10, 90)}
          ${cornerOrnament(630, 450, 180)}
          ${cornerOrnament(10, 450, 270)}
        </g>
      </svg>
    `;

    bindMapEvents();
  }

  function bindMapEvents() {
    const el = wrap();
    el.querySelectorAll(".island[data-id]").forEach((node) => {
      node.addEventListener("click", () => selectIsland(node.dataset.id));
      node.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectIsland(node.dataset.id);
        }
      });
    });

    document.querySelectorAll("[data-island]").forEach((btn) => {
      btn.addEventListener("click", () => selectIsland(btn.dataset.island));
    });

    document.querySelectorAll(".layer-btn[data-layer]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".layer-btn[data-layer]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        setLayer(btn.dataset.layer);
      });
    });

    const search = document.getElementById("island-search");
    if (search) {
      search.addEventListener("input", () => {
        const q = search.value.trim().toLowerCase();
        const nodes = el.querySelectorAll(".island[data-id]");
        if (!q) {
          nodes.forEach((n) => n.classList.remove("dimmed", "highlighted"));
          return;
        }
        let first = null;
        nodes.forEach((n) => {
          const isle = SJI.ISLANDS[n.dataset.id];
          const match = isle && isle.name.toLowerCase().includes(q);
          n.classList.toggle("dimmed", !match);
          n.classList.toggle("highlighted", match);
          if (match && !first) first = n.dataset.id;
        });
        if (first && q.length > 2) selectIsland(first);
      });
    }
  }

  function setLayer(layer) {
    const el = wrap();
    if (!el) return;
    el.querySelectorAll(".route-whale").forEach((r) => r.classList.toggle("visible", layer === "whales"));
    el.querySelectorAll(".route-ship").forEach((r) => r.classList.toggle("visible", layer === "shipping"));
    el.querySelectorAll(".protected").forEach((r) => r.classList.toggle("visible", layer === "protected"));
    el.querySelector(".places-layer")?.classList.toggle("visible", layer === "places");
  }

  const MANIFEST_ICONS = { area: "chart", peak: "peak", hub: "anchor", pop: "flag" };

  function selectIsland(id) {
    const isle = SJI.ISLANDS[id];
    if (!isle) return;

    const el = wrap();
    el.querySelectorAll(".island").forEach((n) => n.classList.remove("selected"));
    const node = el.querySelector(`#island-${id}`);
    if (node) node.classList.add("selected");

    const p = panel();
    const empty = p.querySelector(".map-panel-empty");
    const content = p.querySelector(".map-panel-content");
    empty.hidden = true;
    content.hidden = false;

    const kid = document.body.classList.contains("kid-mode");
    const desc = kid ? isle.descKid : isle.desc;

    const photo =
      SJI.PHOTOS?.places?.[id] ||
      (id === "san-juan" ? SJI.PHOTOS?.places?.["friday-harbor"] : null) ||
      SJI.PHOTOS?.places?.aerial;
    const geo = SJI.GEO?.islands?.[id];
    const photoHtml = photo
      ? `<div class="panel-photo"><img src="${photo}" alt="" loading="lazy" /></div>`
      : "";
    const flyBtn =
      geo && SJI.livemap
        ? `<button type="button" class="text-btn manifest-fly" data-fly-island="${id}">${SJI.icon ? SJI.icon("compass") : ""}<span>Show on live map</span></button>`
        : "";
    const ic = (n) => (SJI.icon ? SJI.icon(n) : "");

    content.innerHTML = `
      ${photoHtml}
      <p class="manifest-kicker">SHIP'S MANIFEST · NO. ${String(Math.abs(id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 90 + 10)}</p>
      <h3>${isle.name}</h3>
      <p class="panel-pop">${isle.nick}</p>
      <p class="panel-desc">${desc}</p>
      <ul class="manifest-rows">
        <li>${ic(MANIFEST_ICONS.area)}<span class="mr-label">Area</span><span class="mr-lead"></span><strong>${isle.area}</strong></li>
        <li>${ic(MANIFEST_ICONS.peak)}<span class="mr-label">High point</span><span class="mr-lead"></span><strong>${isle.peak.split("·")[0].trim()}</strong></li>
        <li>${ic(MANIFEST_ICONS.hub)}<span class="mr-label">Hub</span><span class="mr-lead"></span><strong>${isle.town}</strong></li>
        <li>${ic(MANIFEST_ICONS.pop)}<span class="mr-label">People</span><span class="mr-lead"></span><strong>${isle.pop}</strong></li>
      </ul>
      <ul class="panel-highlights">
        ${isle.highlights.map((h) => `<li>${h}</li>`).join("")}
      </ul>
      ${flyBtn}
    `;

    content.querySelector("[data-fly-island]")?.addEventListener("click", () => {
      document.querySelector('[data-map-view="live"]')?.click();
      SJI.livemap?.selectIsland?.(id);
      if (geo) SJI.livemap?.flyTo?.(geo.lat, geo.lng, 11);
    });

    SJI.livemap?.selectIsland?.(id);
  }

  SJI.map = { build: buildMap, select: selectIsland, setLayer };
})();
