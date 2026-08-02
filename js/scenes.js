/* scenes.js — illustrated section scenes (owned by the scenes agent).
   History: sticky era vignette that crossfades as the timeline scrolls. */
(function () {
  // One vignette per era; timeline events map onto these scenes.
  const SCENES = [
    {
      id: "canoe",
      caption: "Reef-net fishing · since time immemorial",
      svg: `
      <svg viewBox="0 0 340 260" aria-hidden="true">
        <defs>
          <linearGradient id="ev1sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#e9c98f"/><stop offset="1" stop-color="#e07a5f"/>
          </linearGradient>
          <linearGradient id="ev1sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#9c5a50"/><stop offset=".25" stop-color="#3e5570"/><stop offset="1" stop-color="#16283c"/>
          </linearGradient>
        </defs>
        <rect width="340" height="130" fill="url(#ev1sky)"/>
        <circle cx="258" cy="96" r="26" fill="#f4d58d" opacity=".9"/>
        <path d="M0 130 L54 112 L110 126 L180 106 L250 124 L300 112 L340 122 L340 130 Z" fill="#7a4b47"/>
        <rect y="130" width="340" height="130" fill="url(#ev1sea)"/>
        <g stroke="#c9a58a" stroke-width="1.2" opacity=".4" stroke-linecap="round">
          <path d="M30 156 h44"/><path d="M240 150 h52"/><path d="M120 176 h40"/><path d="M270 190 h36"/>
        </g>
        <!-- two canoes tending a reef net (silhouette, abstract) -->
        <g fill="#12181d">
          <path d="M46 166 C62 160 92 160 108 166 L100 174 C86 178 68 178 54 174 Z"/>
          <path d="M228 166 C244 160 274 160 290 166 L282 174 C268 178 250 178 236 174 Z"/>
          <path d="M70 152 l4 10 M84 148 l2 14 M252 152 l4 10 M266 148 l2 14" stroke="#12181d" stroke-width="3" stroke-linecap="round"/>
        </g>
        <path d="M104 170 C140 186 196 186 232 170" fill="none" stroke="#d9b45b" stroke-width="1.6" stroke-dasharray="3 4"/>
        <path d="M104 170 C140 200 196 200 232 170" fill="none" stroke="#d9b45b" stroke-width="1.2" stroke-dasharray="2 5" opacity=".7"/>
        <g fill="#e07a5f" opacity=".8">
          <path d="M150 196 C154 193 158 193 161 196 C158 198 154 198 150 196 Z"/>
          <path d="M176 202 C180 199 184 199 187 202 C184 204 180 204 176 202 Z"/>
        </g>
      </svg>`
    },
    {
      id: "survey",
      caption: "Survey ships chart the channels · 1790–1841",
      svg: `
      <svg viewBox="0 0 340 260" aria-hidden="true">
        <defs>
          <linearGradient id="ev2sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#c9d6d4"/><stop offset="1" stop-color="#e8ddc0"/>
          </linearGradient>
          <linearGradient id="ev2sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#6f9aa8"/><stop offset="1" stop-color="#274a5c"/>
          </linearGradient>
        </defs>
        <rect width="340" height="140" fill="url(#ev2sky)"/>
        <path d="M0 140 L70 118 L150 134 L230 114 L300 130 L340 120 L340 140 Z" fill="#8a9490" opacity=".8"/>
        <rect y="140" width="340" height="120" fill="url(#ev2sea)"/>
        <!-- tall ship -->
        <g fill="#1d2b33">
          <path d="M126 182 L214 182 L200 196 L140 196 Z"/>
          <rect x="150" y="120" width="3.4" height="62"/>
          <rect x="180" y="128" width="3" height="54"/>
          <path d="M153 124 C168 130 176 140 178 154 L153 154 Z" opacity=".92"/>
          <path d="M183 132 C196 137 202 146 204 158 L183 158 Z" opacity=".92"/>
          <path d="M126 182 L108 174 L126 176 Z"/>
        </g>
        <!-- survey lines & compass ticks over the water -->
        <g stroke="#f2e9d8" stroke-width="1" opacity=".65">
          <path d="M40 216 L300 204" stroke-dasharray="6 5"/>
          <path d="M60 236 L296 226" stroke-dasharray="2 6"/>
          <circle cx="262" cy="216" r="14" fill="none"/>
          <path d="M262 202 V206 M262 226 V230 M248 216 H252 M272 216 H276"/>
          <path d="M262 208 L265 216 L262 214 L259 216 Z" fill="#f2e9d8" stroke="none"/>
        </g>
        <g fill="#f2e9d8" opacity=".55" font-family="JetBrains Mono, monospace" font-size="8">
          <text x="52" y="212">41</text><text x="140" y="230">36</text><text x="216" y="212">52</text>
        </g>
      </svg>`
    },
    {
      id: "pigwar",
      caption: "Crossed flags &amp; the pig · 1846–1872",
      svg: `
      <svg viewBox="0 0 340 260" aria-hidden="true">
        <defs>
          <linearGradient id="ev3sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#c5d8e0"/><stop offset="1" stop-color="#e8e2c8"/>
          </linearGradient>
        </defs>
        <rect width="340" height="190" fill="url(#ev3sky)"/>
        <path d="M0 190 C60 172 130 168 200 178 C260 186 310 184 340 176 L340 260 L0 260 Z" fill="#8b9a6b"/>
        <path d="M0 224 C80 212 200 214 340 224 L340 260 L0 260 Z" fill="#6d7d4e"/>
        <!-- crossed flag poles, colors apart -->
        <g stroke="#5c4033" stroke-width="4" stroke-linecap="round">
          <path d="M132 200 L198 62"/><path d="M208 200 L142 62"/>
        </g>
        <g>
          <g transform="translate(198,60) rotate(4)">
            <rect x="0" y="0" width="44" height="27" fill="#e8e4d9"/>
            <g fill="#c45c4a">
              <rect y="0" width="44" height="3"/><rect y="6" width="44" height="3"/>
              <rect y="12" width="44" height="3"/><rect y="18" width="44" height="3"/>
              <rect y="24" width="44" height="3"/>
            </g>
            <rect x="0" y="0" width="18" height="15" fill="#2b4166"/>
            <g fill="#e8e4d9">
              <circle cx="4" cy="4" r="1.1"/><circle cx="9" cy="4" r="1.1"/><circle cx="14" cy="4" r="1.1"/>
              <circle cx="6.5" cy="7.5" r="1.1"/><circle cx="11.5" cy="7.5" r="1.1"/>
              <circle cx="4" cy="11" r="1.1"/><circle cx="9" cy="11" r="1.1"/><circle cx="14" cy="11" r="1.1"/>
            </g>
          </g>
          <g transform="translate(142,60) rotate(-4)">
            <rect x="-44" y="0" width="44" height="27" fill="#1a3a6b"/>
            <path d="M-44 0 L0 27 M0 0 L-44 27" stroke="#e8e4d9" stroke-width="4.6"/>
            <path d="M-44 0 L0 27 M0 0 L-44 27" stroke="#c45c4a" stroke-width="1.8"/>
            <path d="M-22 0 V27 M-44 13.5 H0" stroke="#e8e4d9" stroke-width="6.4"/>
            <path d="M-22 0 V27 M-44 13.5 H0" stroke="#c45c4a" stroke-width="3"/>
          </g>
        </g>
        <!-- encampment tents left & right -->
        <g stroke="#5c5044" stroke-width="1.2">
          <path d="M40 210 L64 178 L88 210 Z" fill="#e8e0d0"/>
          <path d="M64 178 L64 210" stroke="#b9ad94" stroke-width="1.4"/>
          <path d="M58 210 L64 194 L70 210 Z" fill="#8a7d68"/>
          <path d="M254 210 L278 178 L302 210 Z" fill="#e8e0d0"/>
          <path d="M278 178 L278 210" stroke="#b9ad94" stroke-width="1.4"/>
          <path d="M272 210 L278 194 L284 210 Z" fill="#8a7d68"/>
        </g>
        <!-- the pig: cedar-and-salmon, matching the card scene -->
        <g>
          <ellipse cx="168" cy="234" rx="36" ry="4" fill="#3f4a2c" opacity=".3"/>
          <ellipse cx="170" cy="212" rx="30" ry="18" fill="#d1704f"/>
          <path d="M144 205 C152 196 168 192 182 195 C172 189 154 191 144 199 Z" fill="#8f4a2e" opacity=".55"/>
          <path d="M144 217 C150 226 165 230 179 230 C163 232 148 228 141 219 Z" fill="#8f4a2e" opacity=".5"/>
          <ellipse cx="143" cy="209" rx="12" ry="10" fill="#d1704f"/>
          <ellipse cx="136" cy="212" rx="5" ry="3.6" fill="#8f4a2e"/>
          <circle cx="140" cy="204" r="1.8" fill="#12181d"/>
          <path d="M148 200 L153 193 L157 201 Z" fill="#a2543c"/>
          <path d="M160 226 v8 M180 226 v8" stroke="#d1704f" stroke-width="5" stroke-linecap="round"/>
          <path d="M180 226 v8" stroke="#a2543c" stroke-width="5" stroke-linecap="round" opacity=".5"/>
          <path d="M199 206 Q208 198 204 190" fill="none" stroke="#d1704f" stroke-width="4" stroke-linecap="round"/>
        </g>
      </svg>`
    },
    {
      id: "verdict",
      caption: "The Kaiser&rsquo;s line through Haro Strait · 1872",
      svg: `
      <svg viewBox="0 0 340 260" aria-hidden="true">
        <defs>
          <linearGradient id="ev6paper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#f6efdd"/><stop offset="1" stop-color="#e7d9ba"/>
          </linearGradient>
        </defs>
        <rect width="340" height="260" fill="url(#ev6paper)"/>
        <!-- faint chart graticule -->
        <g stroke="#2b3a42" stroke-width=".6" opacity=".14">
          <path d="M85 0 V260 M170 0 V260 M255 0 V260 M0 65 H340 M0 130 H340 M0 195 H340"/>
        </g>
        <!-- chart fragment: Vancouver Is. shore west, San Juan group east -->
        <g stroke="#2b3a42" stroke-width="1.1">
          <path d="M0 96 C24 104 40 126 44 152 C48 180 40 214 22 240 L0 252 Z" fill="#e8d9b0"/>
          <path d="M120 128 C142 120 162 128 168 146 C174 166 162 186 140 190 C118 194 102 180 102 160 C102 144 108 132 120 128 Z" fill="#e8d9b0"/>
          <path d="M196 108 C216 100 240 106 248 122 C256 138 248 156 228 162 C206 168 188 156 186 138 C185 124 188 112 196 108 Z" fill="#e8d9b0"/>
          <path d="M226 178 C240 174 254 180 256 192 C258 204 248 214 234 214 C220 214 212 204 214 192 C215 185 219 180 226 178 Z" fill="#e8d9b0"/>
        </g>
        <!-- soundings -->
        <g fill="#2b3a42" opacity=".5" font-family="JetBrains Mono, monospace" font-size="8">
          <text x="70" y="150">64</text><text x="86" y="200">71</text><text x="164" y="222">38</text>
        </g>
        <!-- the chosen boundary: Haro Strait -->
        <path d="M62 6 C74 60 66 118 74 168 C80 208 92 236 108 254" fill="none" stroke="#8f4a2e" stroke-width="2.4" stroke-dasharray="9 6"/>
        <path d="M108 254 L98 246 M108 254 L110 242" stroke="#8f4a2e" stroke-width="2" fill="none"/>
        <text x="52" y="84" font-family="JetBrains Mono, monospace" font-size="9" letter-spacing="3" fill="#8f4a2e" transform="rotate(80 56 84)">HARO</text>
        <!-- the rejected channel: Rosario -->
        <path d="M282 10 C270 70 276 140 270 200 C267 226 262 244 256 256" fill="none" stroke="#2b3a42" stroke-width="1.2" stroke-dasharray="2 6" opacity=".55"/>
        <path d="M262 120 L282 140 M282 120 L262 140" stroke="#8f4a2e" stroke-width="1.6" opacity=".7"/>
        <text x="292" y="60" font-family="JetBrains Mono, monospace" font-size="9" letter-spacing="3" fill="#2b3a42" opacity=".55" transform="rotate(96 296 60)">ROSARIO</text>
        <!-- arbitration scales, brass -->
        <g stroke="#7a6114" stroke-width="1.2">
          <path d="M170 40 V96" stroke-width="2.4"/>
          <path d="M128 48 H212" stroke-width="2.4"/>
          <circle cx="170" cy="38" r="3.4" fill="#c9a227"/>
          <path d="M128 48 L118 72 M128 48 L138 72 M212 48 L202 72 M212 48 L222 72" stroke-width="1"/>
          <path d="M114 72 C114 80 122 84 128 84 C134 84 142 80 142 72 Z" fill="#c9a227"/>
          <path d="M198 72 C198 80 206 84 212 84 C218 84 226 80 226 72 Z" fill="#c9a227"/>
          <path d="M156 96 H184 L188 104 H152 Z" fill="#c9a227"/>
        </g>
        <!-- wax seal -->
        <g>
          <circle cx="300" cy="222" r="17" fill="#a04830"/>
          <circle cx="300" cy="222" r="12.5" fill="none" stroke="#7c3222" stroke-width="1.4"/>
          <text x="300" y="226" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#f2e2cc">1872</text>
        </g>
      </svg>`
    },
    {
      id: "ferry",
      caption: "Ferries, farms &amp; orchards · 1900s",
      svg: `
      <svg viewBox="0 0 340 260" aria-hidden="true">
        <defs>
          <linearGradient id="ev4sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#bcd4da"/><stop offset="1" stop-color="#ecdfb8"/>
          </linearGradient>
          <linearGradient id="ev4sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#5b93a5"/><stop offset="1" stop-color="#2b5568"/>
          </linearGradient>
        </defs>
        <rect width="340" height="150" fill="url(#ev4sky)"/>
        <!-- orchard hill -->
        <path d="M0 118 C60 92 140 88 200 104 C260 118 310 118 340 108 L340 150 L0 150 Z" fill="#9aa96e"/>
        <g fill="#4a6741">
          <circle cx="46" cy="106" r="7"/><circle cx="74" cy="100" r="7"/><circle cx="102" cy="96" r="7"/>
          <circle cx="58" cy="120" r="7"/><circle cx="86" cy="114" r="7"/><circle cx="114" cy="110" r="7"/>
          <circle cx="70" cy="134" r="7"/><circle cx="98" cy="128" r="7"/><circle cx="126" cy="124" r="7"/>
        </g>
        <g stroke="#5c4033" stroke-width="1.6">
          <path d="M46 113 v6 M74 107 v6 M102 103 v6 M58 127 v6 M86 121 v6 M114 117 v6 M70 141 v4 M98 135 v5 M126 131 v5"/>
        </g>
        <!-- barn -->
        <g>
          <path d="M252 96 L272 82 L292 96 L292 118 L252 118 Z" fill="#a04830"/>
          <path d="M248 98 L272 80 L296 98" fill="none" stroke="#6e2f1e" stroke-width="3"/>
          <rect x="266" y="104" width="12" height="14" fill="#5c2a1a"/>
        </g>
        <rect y="150" width="340" height="110" fill="url(#ev4sea)"/>
        <!-- WSF ferry -->
        <g>
          <path d="M96 192 L244 192 L228 208 L112 208 Z" fill="#eef0ea"/>
          <path d="M96 192 L244 192 L240 196 L100 196 Z" fill="#0f5132"/>
          <path d="M116 178 L224 178 L232 192 L108 192 Z" fill="#e2e6df"/>
          <path d="M136 166 L204 166 L210 178 L130 178 Z" fill="#d5dbd2"/>
          <rect x="166" y="156" width="7" height="10" fill="#c6ccc2"/>
          <g fill="#33506b">
            <circle cx="130" cy="185" r="2"/><circle cx="146" cy="185" r="2"/><circle cx="162" cy="185" r="2"/>
            <circle cx="178" cy="185" r="2"/><circle cx="194" cy="185" r="2"/><circle cx="210" cy="185" r="2"/>
          </g>
          <path d="M92 202 Q70 198 52 202" stroke="#cfe2dc" stroke-width="2" fill="none" opacity=".6"/>
        </g>
        <g stroke="#9cc4ce" stroke-width="1.2" opacity=".5" stroke-linecap="round">
          <path d="M40 226 h48"/><path d="M150 234 h56"/><path d="M262 224 h44"/>
        </g>
      </svg>`
    },
    {
      id: "orca",
      caption: "Orca science &amp; sanctuary · 1976–today",
      svg: `
      <svg viewBox="0 0 340 260" aria-hidden="true">
        <defs>
          <linearGradient id="ev5sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#27334f"/><stop offset="1" stop-color="#7d5570"/>
          </linearGradient>
          <linearGradient id="ev5sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#3e5570"/><stop offset="1" stop-color="#081824"/>
          </linearGradient>
        </defs>
        <rect width="340" height="120" fill="url(#ev5sky)"/>
        <circle cx="86" cy="58" r="17" fill="#f2e9d8" opacity=".85"/>
        <path d="M0 120 L70 104 L150 116 L240 100 L340 114 L340 120 Z" fill="#1d2b3e"/>
        <rect y="120" width="340" height="140" fill="url(#ev5sea)"/>
        <!-- surfacing orca -->
        <g fill="#0a0f14">
          <path d="M120 168 C142 164 158 156 168 142 C172 122 180 106 194 96 C192 114 196 130 208 142 C224 150 240 158 250 168 Q182 180 120 168 Z"/>
        </g>
        <path d="M194 96 C192 114 196 130 208 142" fill="none" stroke="#4a6076" stroke-width="1.4" opacity=".7"/>
        <ellipse cx="236" cy="156" rx="7" ry="4" fill="#e8f4f8" opacity=".85"/>
        <!-- hydrophone dropping from a small skiff -->
        <g>
          <path d="M282 140 C290 137 302 137 310 140 L305 146 C298 148 292 148 287 146 Z" fill="#12181d"/>
          <path d="M296 148 V196" stroke="#c9a227" stroke-width="1.4" stroke-dasharray="3 3"/>
          <circle cx="296" cy="202" r="5" fill="#c9a227"/>
          <g stroke="#5ba3c4" fill="none" stroke-width="1.4" opacity=".8">
            <path d="M284 202 C281 198 281 206 284 202 Z M286 194 C280 198 280 206 286 210"/>
            <path d="M276 188 C267 194 267 210 276 216"/>
            <path d="M266 182 C254 190 254 214 266 222"/>
          </g>
        </g>
        <g stroke="#7ba6bc" stroke-width="1.2" opacity=".45" stroke-linecap="round">
          <path d="M36 190 h52"/><path d="M60 214 h44"/><path d="M130 206 h56"/>
        </g>
        <text x="30" y="242" font-family="JetBrains Mono, monospace" font-size="9" letter-spacing="3" fill="#7ba6bc" opacity=".75">SRKW · PHOTO-ID · EST. 1976</text>
      </svg>`
    }
  ];

  // timeline event index → scene index (8 events)
  const ERA_OF_EVENT = [0, 1, 1, 2, 2, 3, 4, 5];

  function buildHistoryVignette() {
    const timeline = document.getElementById("timeline");
    const eventsRoot = document.getElementById("timeline-events");
    if (!timeline || !eventsRoot) return;
    if (timeline.querySelector(".era-vignette")) return;

    const aside = document.createElement("div");
    aside.className = "era-vignette";
    aside.setAttribute("aria-hidden", "true");
    aside.innerHTML = `
      <div class="era-frame">
        ${SCENES.map(
          (s, i) => `
          <figure class="era-scene${i === 0 ? " on" : ""}" data-era="${i}">
            ${s.svg}
            <figcaption class="era-caption"><span class="chart-label">Era</span>${s.caption}</figcaption>
          </figure>`
        ).join("")}
        <div class="era-corner era-corner--tl"></div>
        <div class="era-corner era-corner--br"></div>
      </div>
    `;
    timeline.classList.add("has-vignette");
    timeline.appendChild(aside);

    const scenes = aside.querySelectorAll(".era-scene");
    const setEra = (i) => {
      scenes.forEach((s) => s.classList.toggle("on", Number(s.dataset.era) === i));
    };

    const events = eventsRoot.querySelectorAll(".timeline-event");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = Number(entry.target.dataset.index || 0);
          setEra(ERA_OF_EVENT[Math.min(idx, ERA_OF_EVENT.length - 1)] || 0);
        });
      },
      { rootMargin: "-30% 0px -45% 0px", threshold: 0 }
    );
    events.forEach((e) => io.observe(e));
  }

  function boot() {
    // timeline.js injects events during main.js init; build after that pass
    const tryBuild = () => {
      if (document.querySelector("#timeline-events .timeline-event")) {
        buildHistoryVignette();
      } else {
        setTimeout(tryBuild, 300);
      }
    };
    tryBuild();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 0));
  } else {
    setTimeout(boot, 0);
  }

  SJI.scenes = { buildHistoryVignette };
})();
