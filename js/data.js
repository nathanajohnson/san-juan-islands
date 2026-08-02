/**
 * San Juan Islands — content & geographic data
 * Educational synthesis from public sources (NPS, CWR, Wikipedia, FWS, SeaDoc).
 */
window.SJI = window.SJI || {};

/** Optional Google Maps Embed API key — set to enable satellite basemap toggle */
SJI.GOOGLE_MAPS_KEY = ""; // e.g. "AIza..."

SJI.PHOTOS = {
  wildlife: {
    orca: "assets/photos/wildlife/orca.jpg",
    eagle: "assets/photos/wildlife/eagle.jpg",
    seal: "assets/photos/wildlife/seal.jpg",
    porpoise: "assets/photos/wildlife/porpoise.jpg",
    deer: "assets/photos/wildlife/deer.jpg",
    oystercatcher: "assets/photos/wildlife/oystercatcher.jpg",
    heron: "assets/photos/wildlife/heron.jpg",
    madrona: "assets/photos/wildlife/madrona.jpg",
    kelp: "assets/photos/wildlife/kelp.jpg",
    "garry-oak": "assets/photos/wildlife/garry-oak.jpg",
    fox: "assets/photos/wildlife/fox.jpg",
    rabbit: "assets/photos/wildlife/rabbit.jpg",
    steller: "assets/photos/wildlife/sea-lion.jpg",
    murrelet: "assets/photos/wildlife/murrelet.jpg",
    salmon: "assets/photos/wildlife/salmon.jpg",
    bluebird: "assets/photos/wildlife/bluebird.jpg",
    /* Tidepool animals */
    anemone: "assets/photos/wildlife/anemone.jpg",
    "ochre-star": "assets/photos/wildlife/ochre-star.jpg",
    chiton: "assets/photos/wildlife/chiton.jpg",
    sculpin: "assets/photos/wildlife/sculpin.jpg",
    hermit: "assets/photos/wildlife/hermit.jpg",
    barnacle: "assets/photos/wildlife/barnacle.jpg",
    mussel: "assets/photos/wildlife/mussel.jpg",
    urchin: "assets/photos/wildlife/urchin.jpg",
    /* Intertidal plants / algae */
    rockweed: "assets/photos/wildlife/rockweed.jpg",
    "sea-lettuce": "assets/photos/wildlife/sea-lettuce.jpg"
  },
  places: {
    "san-juan": "assets/photos/places/friday-harbor.jpg",
    orcas: "assets/photos/places/orcas.jpg",
    lopez: "assets/photos/places/lopez.jpg",
    shaw: "assets/photos/places/san-juan-aerial.jpg",
    "friday-harbor": "assets/photos/places/friday-harbor.jpg",
    "mt-constitution": "assets/photos/places/mt-constitution.jpg",
    "english-camp": "assets/photos/places/english-camp.jpg",
    aerial: "assets/photos/places/san-juan-aerial.jpg"
  },
  limeKiln: [
    {
      src: "assets/photos/lime-kiln/lighthouse.jpg",
      caption: "Lime Kiln Light on the west shore of San Juan Island",
      credit: "Wikimedia Commons"
    },
    {
      src: "assets/photos/lime-kiln/lighthouse-sunset.jpg",
      caption: "Sunset over Haro Strait at Lime Kiln Point",
      credit: "Wikimedia Commons"
    },
    {
      src: "assets/photos/lime-kiln/lighthouse-nrhp.jpg",
      caption: "Historic Lime Kiln Lighthouse (NRHP)",
      credit: "Wikimedia Commons"
    },
    {
      src: "assets/photos/lime-kiln/light-detail.jpg",
      caption: "Lime Kiln Light detail — still an active aid to navigation",
      credit: "Wikimedia Commons"
    }
  ]
};

SJI.ISLANDS = {
  "san-juan": {
    id: "san-juan",
    name: "San Juan Island",
    nick: "The hub",
    pop: "~7,800",
    area: "55 sq mi",
    peak: "Mount Dallas · 1,080 ft",
    town: "Friday Harbor",
    desc: "Largest town in the archipelago and county seat. Whale-watching capital, home to Lime Kiln Point, American Camp, English Camp, and a lively waterfront.",
    descKid: "The busiest island! Ferries arrive here, orcas swim past Lime Kiln Point, and you can visit two old army camps from the Pig War.",
    highlights: [
      "Lime Kiln Point State Park — shore-based orca watching",
      "San Juan Island National Historical Park",
      "Friday Harbor Laboratories (UW)",
      "Cattle Point Lighthouse & prairie"
    ],
    path: "M168 268 C175 248 195 238 218 236 C245 234 268 248 282 268 C295 290 298 318 292 345 C285 372 265 390 240 398 C212 406 185 395 172 372 C158 348 155 310 160 288 C162 278 165 272 168 268 Z"
  },
  "orcas": {
    id: "orcas",
    name: "Orcas Island",
    nick: "The gem",
    pop: "~5,400",
    area: "57 sq mi",
    peak: "Mount Constitution · 2,407 ft",
    town: "Eastsound",
    desc: "Horseshoe-shaped and mountainous. Moran State Park crowns Mount Constitution with views across the entire archipelago to the Cascades and Olympics.",
    descKid: "Shaped like a horseshoe! Climb Mount Constitution — the highest peak — for views of mountains, ocean, and islands forever.",
    highlights: [
      "Moran State Park & Mt. Constitution tower",
      "Obstruction Pass & Cascade Lake",
      "Eastsound village & farmers market",
      "Turtleback Mountain preserve"
    ],
    path: "M325 155 C350 128 395 122 440 132 C475 140 505 165 512 198 C518 230 505 255 478 268 C455 278 435 268 420 275 C405 288 395 305 370 308 C348 310 332 292 325 268 C318 242 312 210 318 185 C320 170 322 160 325 155 Z"
  },
  "lopez": {
    id: "lopez",
    name: "Lopez Island",
    nick: "The friendly isle",
    pop: "~2,500",
    area: "30 sq mi",
    peak: "Lopez Hill · 540 ft",
    town: "Lopez Village",
    desc: "Gentler terrain, bicycle culture, and a famously wave-to-everyone ethos. Iceberg Point and Spencer Spit frame some of the archipelago’s finest shoreline walks.",
    descKid: "People wave at you here! Great for bikes, beaches, and quiet farms. Flat enough that kids love riding around.",
    highlights: [
      "Spencer Spit State Park",
      "Iceberg Point (BLM)",
      "Lopez Village & bike loops",
      "Shark Reef Sanctuary"
    ],
    path: "M415 295 C445 278 485 282 515 302 C535 318 542 348 535 378 C528 408 500 428 468 432 C438 436 412 418 400 390 C388 360 392 325 402 308 C406 300 410 297 415 295 Z"
  },
  "shaw": {
    id: "shaw",
    name: "Shaw Island",
    nick: "The quiet one",
    pop: "~240",
    area: "8 sq mi",
    peak: "about 300 ft",
    town: "Shaw Landing",
    desc: "Smallest of the ferry-served islands. Franciscan nuns once ran the ferry dock store. Quiet roads, forest, and a deep sense of privacy.",
    descKid: "The smallest ferry island. Super quiet — mostly forests and a few neighbors. Nuns used to work at the ferry dock!",
    highlights: [
      "Shaw Island County Park",
      "Historic ferry landing",
      "Forest walks & coves",
      "Dark night skies"
    ],
    path: "M355 248 C372 238 395 242 408 258 C418 272 415 288 400 298 C382 308 362 305 350 290 C340 275 345 258 355 248 Z"
  },
  "sucia": {
    id: "sucia",
    name: "Sucia Island",
    nick: "The jewel of the marine parks",
    pop: "Seasonal only",
    area: "564 acres",
    peak: "Fossil Bay bluffs",
    town: "—",
    desc: "Washington’s most beloved marine state park. Finger-like coves, fossil beds, kayak camps, and sandstone sculptures carved by ancient seas.",
    descKid: "A park island shaped like fingers! Camp by the water, find fossils, and explore secret coves by kayak.",
    highlights: [
      "Fossil Bay & Echo Bay",
      "Sandstone formations",
      "Marine camping & kayaking",
      "Sucia State Park trails"
    ],
    path: "M395 88 C415 78 445 82 462 98 C472 108 468 122 452 128 C438 134 422 125 408 122 C395 118 385 108 388 98 C390 92 392 89 395 88 Z"
  },
  "stuart": {
    id: "stuart",
    name: "Stuart Island",
    nick: "Turn Point",
    pop: "~11",
    area: "7.5 sq mi",
    peak: "~600 ft",
    town: "—",
    desc: "Northwestern sentinel of the U.S. San Juans. Turn Point Light overlooks the turn where Haro Strait meets Boundary Pass — a critical shipping corner and whale corridor.",
    descKid: "Home to a lighthouse at a sharp turn in the shipping lanes. Whales and big boats both pass right by!",
    highlights: [
      "Turn Point Lighthouse",
      "Reid Harbor & Prevost Harbor",
      "Schoolhouse & trails",
      "Boundary Pass views"
    ],
    path: "M115 135 C135 120 165 125 182 148 C192 165 185 185 165 195 C145 205 122 195 112 175 C105 158 108 142 115 135 Z"
  },
  "spieden": {
    id: "spieden",
    name: "Spieden Island",
    nick: "Safari island (historic)",
    pop: "Private",
    area: "520 acres",
    peak: "ridge spine",
    town: "—",
    desc: "Privately owned. In the 1970s it hosted exotic game animals for a short-lived safari park. Mouflon sheep and other introduced species still silhouette the ridgeline.",
    descKid: "A private island that once had safari animals! You can still spot unusual sheep on the hills from a boat.",
    highlights: [
      "Dramatic treeless ridgeline",
      "Historic exotic game era",
      "Views from Haro Strait",
      "Private — no public landing"
    ],
    path: "M195 178 C220 168 255 175 268 195 C275 208 265 222 240 228 C215 234 192 220 188 200 C186 188 190 180 195 178 Z"
  },
  "blakely": {
    id: "blakely",
    name: "Blakely Island",
    nick: "Private ferry stop",
    pop: "~42",
    area: "6.5 sq mi",
    peak: "~1,000 ft",
    town: "—",
    desc: "Mostly private, with a marina and airstrip. Dense forest and limited public access keep it one of the quieter large islands.",
    descKid: "Mostly private forest. Planes can land here, but visitors usually just wave from the ferry.",
    highlights: [
      "Blakely Island Marina",
      "Private airstrip",
      "Deep forest cover",
      "Named by Wilkes expedition"
    ],
    path: "M498 198 C520 188 548 198 558 222 C565 240 552 258 528 262 C508 266 492 250 490 228 C488 212 492 202 498 198 Z"
  },
  "waldron": {
    id: "waldron",
    name: "Waldron Island",
    nick: "Off-grid community",
    pop: "~110",
    area: "4.6 sq mi",
    peak: "~500 ft",
    town: "—",
    desc: "No ferry, no public utilities grid in the usual sense — a fiercely independent community reached by private boat or air. Open meadows and maritime forest.",
    descKid: "No big ferry! People who live here like it quiet and self-sufficient.",
    highlights: [
      "Off-grid living culture",
      "Open prairie patches",
      "Canoe Island neighbor",
      "No public ferry service"
    ],
    path: "M295 98 C318 88 348 95 360 118 C368 135 358 155 335 160 C312 165 290 150 288 128 C286 112 290 102 295 98 Z"
  },
  "jones": {
    id: "jones",
    name: "Jones Island",
    nick: "Marine state park",
    pop: "Day / camp",
    area: "188 acres",
    peak: "low hills",
    town: "—",
    desc: "A classic Cascadia kayak destination. Deer wander the campground; madronas lean over coves on the west side.",
    descKid: "A little park island perfect for kayaks and camping. Friendly deer often visit!",
    highlights: [
      "Kayak camping",
      "Deer & madrona shores",
      "North & South bays",
      "Day-use trails"
    ],
    path: "M298 218 C312 210 330 215 338 230 C344 242 335 255 318 258 C302 261 292 248 292 232 C292 224 294 220 298 218 Z"
  }
};

SJI.TIMELINE = [
  {
    year: "Since time immemorial",
    yearKid: "Long, long ago",
    title: "Coast Salish homelands",
    titleKid: "First peoples of the islands",
    body: "Lummi, Samish, Saanich, Songhees, Klallam and other Northern Straits Salish peoples fish, harvest, and travel these waters. Village sites, reef-net locations, and oral histories bind the islands to a living culture that continues today.",
    bodyKid: "Coast Salish families have always lived here — fishing salmon, traveling by canoe, and teaching their children the names of every bay and reef."
  },
  {
    year: "1790–1792",
    yearKid: "1790s",
    title: "Spanish & British charts",
    titleKid: "Explorers draw maps",
    body: "Manuel Quimper, Francisco de Eliza, and George Vancouver map the archipelago. Eliza names the San Juans for the Viceroy of Mexico; Orcas Island shortens “Horcasitas.” Spanish and British names still lace the charts.",
    bodyKid: "Spanish and British sailors sailed through and named islands. “Orcas” comes from a Spanish viceroy’s long name — not from orca whales!"
  },
  {
    year: "1841",
    yearKid: "1841",
    title: "Wilkes expedition",
    titleKid: "Americans rename things",
    body: "Charles Wilkes of the U.S. Exploring Expedition renames features for War of 1812 heroes. Many names are later replaced, but Shaw, Blakely, Decatur, and others stick.",
    bodyKid: "An American explorer tried to rename almost everything after Navy heroes. Some names stuck; some didn’t."
  },
  {
    year: "1846",
    yearKid: "1846",
    title: "Oregon Treaty’s fuzzy line",
    titleKid: "A confusing border",
    body: "The U.S.–Britain border follows the 49th parallel to the sea, then “the middle of the channel” to the Pacific. Which channel — Haro or Rosario? The treaty doesn’t say. The San Juans hang in legal limbo.",
    bodyKid: "America and Britain drew a border but didn’t say which water path it should follow. Both claimed the islands!"
  },
  {
    year: "1859",
    yearKid: "1859",
    title: "The Pig War begins",
    titleKid: "Someone shoots a pig!",
    body: "Lyman Cutlar shoots a Hudson’s Bay Company pig. Soldiers arrive. American Camp and English Camp face off. Cooler heads keep muskets quiet for over a decade.",
    bodyKid: "A pig ate potatoes. A farmer shot it. Soldiers from two countries moved in — but nobody else got hurt."
  },
  {
    year: "1872",
    yearKid: "1872",
    title: "Kaiser’s verdict",
    titleKid: "A German emperor decides",
    body: "Emperor Wilhelm I of Germany arbitrates: the boundary runs through Haro Strait. The San Juan Islands become American. Joint occupation ends.",
    bodyKid: "A German emperor was asked to pick. He chose America. The islands have been part of Washington ever since."
  },
  {
    year: "1900s–1960s",
    yearKid: "1900s",
    title: "Logging, farming, ferries",
    titleKid: "Farms, trees, and boats",
    body: "Second-growth forests replace old-growth cuts. Sheep and orchards shape open land. Washington State Ferries stitch the islands to Anacortes. Tourism begins to rival fishing and farming.",
    bodyKid: "People cut trees, raised sheep, grew apples, and built ferry routes. Visitors started coming for the beauty."
  },
  {
    year: "1976–today",
    yearKid: "1976 to now",
    title: "Orca survey & conservation",
    titleKid: "Scientists watch the whales",
    body: "The Center for Whale Research begins photo-ID of Southern Residents. The population later lists under the Endangered Species Act. National Monument (2013), wildlife refuges, and land trusts protect habitat while vessel rules evolve.",
    bodyKid: "Scientists photograph every orca’s fin to keep track of families. People work hard to protect whales, birds, and wild places."
  }
];

SJI.WILDLIFE = [
  {
    id: "orca",
    name: "Orca (Killer whale)",
    latin: "Orcinus orca",
    type: "mammal",
    tags: ["marine", "mammal"],
    emoji: "🐋",
    body: "Two cultures meet here: salmon-specialist Southern Residents (J, K, L pods) and mammal-eating Bigg’s orcas. Residents are critically endangered; Bigg’s are increasing.",
    bodyKid: "The biggest dolphins! Some eat only fish; others hunt seals. Look for tall black fins slicing the water.",
    fun: "Each orca’s dorsal fin and saddle patch is unique — like a fingerprint. Researchers know individuals by sight."
  },
  {
    id: "eagle",
    name: "Bald eagle",
    latin: "Haliaeetus leucocephalus",
    type: "bird",
    tags: ["bird"],
    emoji: "🦅",
    body: "San Juan Island and its neighbors host one of the greatest concentrations of bald eagles in the contiguous United States. Nesting pairs claim tall firs with bay views.",
    bodyKid: "So many eagles live here that San Juan Island is famous for them! Watch for white heads in tall trees.",
    fun: "Young eagles are brown all over for several years — they don’t get the white head until adulthood."
  },
  {
    id: "seal",
    name: "Harbor seal",
    latin: "Phoca vitulina",
    type: "mammal",
    tags: ["marine", "mammal"],
    emoji: "🦭",
    body: "Year-round residents that haul out on reefs and pocket beaches. Primary prey for Bigg’s orcas; a key link in the nearshore food web.",
    bodyKid: "Spotted seals that nap on rocks with their banana-pose bodies. They eat fish and can dive for many minutes.",
    fun: "Pups can swim within hours of birth. “Banana pose” (head and tail up) helps them stay dry and warm on rocks."
  },
  {
    id: "porpoise",
    name: "Dall’s porpoise",
    latin: "Phocoenoides dalli",
    type: "mammal",
    tags: ["marine", "mammal"],
    emoji: "🐬",
    body: "Stocky, black-and-white speedsters that create a distinctive “rooster tail” spray when racing. Often mistaken for baby orcas at a distance.",
    bodyKid: "Fast little cousins of dolphins with black-and-white coloring. They make a splashy spray when they zoom!",
    fun: "They can swim over 30 mph and sometimes “bow ride” invisible pressure waves in front of boats."
  },
  {
    id: "deer",
    name: "Columbian black-tailed deer",
    latin: "Odocoileus hemionus columbianus",
    type: "mammal",
    tags: ["mammal"],
    emoji: "🦌",
    body: "The largest land mammal on San Juan Island. With wolves long gone, deer shape forest understories and gardens alike.",
    bodyKid: "The biggest land animal on the island. Quiet and common — you might see one at dusk near the trees.",
    fun: "Island deer sometimes swim between islands. They’ve been seen in open channels on calm days."
  },
  {
    id: "oystercatcher",
    name: "Black oystercatcher",
    latin: "Haematopus bachmani",
    type: "bird",
    tags: ["bird"],
    emoji: "🐦",
    body: "A loud, red-billed shorebird of rocky coasts. Indicator of healthy intertidal habitat; pairs defend nesting territories on bare rock.",
    bodyKid: "A black bird with a bright orange-red beak that pokes under rocks for mussels and limpets.",
    fun: "Their peeping calls carry far over the water. If you hear a loud “wheep!”, scan the shoreline rocks."
  },
  {
    id: "heron",
    name: "Great blue heron",
    latin: "Ardea herodias",
    type: "bird",
    tags: ["bird"],
    emoji: "🦩",
    body: "Patient hunters of eelgrass meadows and quiet bays. Rookeries (heronries) occupy tall trees on several islands.",
    bodyKid: "Tall gray birds that stand super still in shallow water, then spear a fish with lightning speed.",
    fun: "They nest in noisy colonies. Chicks clack their bills for food — a prehistoric-sounding racket."
  },
  {
    id: "madrona",
    name: "Pacific madrona",
    latin: "Arbutus menziesii",
    type: "plant",
    tags: ["plant"],
    emoji: "🌳",
    body: "Iconic peeling red-orange bark and evergreen leaves. Loves dry, rocky shores in the rain shadow — the visual signature of San Juan Island’s west and south coasts.",
    bodyKid: "Trees with cinnamon-colored bark that peels like paper. They love sunny rocky places by the water.",
    fun: "Also called arbutus or madrone. Their berries feed birds in fall; the wood is dense and burns hot."
  },
  {
    id: "kelp",
    name: "Bull kelp",
    latin: "Nereocystis luetkeana",
    type: "plant",
    tags: ["plant", "marine"],
    emoji: "🌿",
    body: "An annual kelp that grows tens of feet in a single season, forming underwater forests that shelter juvenile fish and buffer shorelines.",
    bodyKid: "Seaweed that grows as tall as trees in one summer! Fish babies hide in the kelp forest.",
    fun: "Each plant has a gas-filled float (pneumatocyst) like a balloon holding the fronds near sunlight."
  },
  {
    id: "garry-oak",
    name: "Garry oak",
    latin: "Quercus garryana",
    type: "plant",
    tags: ["plant"],
    emoji: "🍂",
    body: "Meadow oaks of the rain shadow. Garry oak ecosystems are among the most endangered habitats in the region — remnants host rare wildflowers.",
    bodyKid: "Special oak trees that like sunny meadows. Their homes are rare and precious.",
    fun: "Coast Salish peoples tended oak prairies with fire for camas and other foods for millennia."
  },
  {
    id: "fox",
    name: "Red fox",
    latin: "Vulpes vulpes",
    type: "mammal",
    tags: ["mammal"],
    emoji: "🦊",
    body: "Introduced to the islands in the 20th century. Now a familiar roadside and field predator of rabbits and small mammals.",
    bodyKid: "Clever orange foxes that were brought here by people. They hunt rabbits and mice.",
    fun: "San Juan foxes are often bold around people — keep food sealed when camping."
  },
  {
    id: "rabbit",
    name: "European rabbit",
    latin: "Oryctolagus cuniculus",
    type: "mammal",
    tags: ["mammal"],
    emoji: "🐰",
    body: "An invasive species established from releases in the 1890s. Populations boom and bust; they alter vegetation and feed foxes and eagles.",
    bodyKid: "Not native! People let pet rabbits go long ago. Now wild rabbits live in fields and dig burrows.",
    fun: "Rabbits from the San Juans were later used to start wild populations in other U.S. states."
  },
  {
    id: "steller",
    name: "Steller sea lion",
    latin: "Eumetopias jubatus",
    type: "mammal",
    tags: ["marine", "mammal"],
    emoji: "🦭",
    body: "Larger and louder than harbor seals. Haul-outs on outer rocks; males can exceed a ton. Seasonal visitors swell local numbers.",
    bodyKid: "Huge sea lions that roar like lions! Much bigger than harbor seals.",
    fun: "Named for Georg Wilhelm Steller, naturalist on Vitus Bering’s 1741 expedition."
  },
  {
    id: "murrelet",
    name: "Marbled murrelet",
    latin: "Brachyramphus marmoratus",
    type: "bird",
    tags: ["bird", "marine"],
    emoji: "🐧",
    body: "A small seabird that nests high in old-growth trees — sometimes far inland — and feeds at sea. Federally threatened; needs both forest and forage fish.",
    bodyKid: "A little seabird that nests in tall old trees and fishes in the ocean. They’re rare and protected.",
    fun: "For decades scientists couldn’t find their nests — they were hidden on mossy high branches."
  },
  {
    id: "salmon",
    name: "Chinook salmon",
    latin: "Oncorhynchus tshawytscha",
    type: "marine",
    tags: ["marine"],
    emoji: "🐟",
    body: "The preferred prey of Southern Resident orcas. Chinook runs through the Salish Sea are a linchpin: when they falter, resident orcas starve.",
    bodyKid: "The biggest Pacific salmon — and the orcas’ favorite food. Helping salmon helps whales.",
    fun: "Also called king salmon. They can weigh over 50 pounds on legendary runs."
  },
  {
    id: "bluebird",
    name: "Western bluebird",
    latin: "Sialia mexicana",
    type: "bird",
    tags: ["bird"],
    emoji: "💙",
    body: "Extirpated for decades by starling competition for nest cavities; volunteer nest-box programs have restored them to San Juan Island prairies and pastures.",
    bodyKid: "Sky-blue birds that almost disappeared, then came back thanks to people building nest boxes!",
    fun: "A conservation success story you can support by protecting open meadows and nest sites."
  },
  /* —— Tidepool / rocky shore (San Juan Island) —— */
  {
    id: "anemone",
    name: "Aggregating anemone",
    latin: "Anthopleura elegantissima",
    type: "marine",
    tags: ["marine", "tidepool"],
    emoji: "🪸",
    body: "Common in San Juan Island tidepools and crevices (Cattle Point, South Beach, west-side rocks). Clonal colonies carpet shaded pools; symbiotic algae can tint them green.",
    bodyKid: "A soft flower-looking animal stuck to rock in tidepools. Its tentacles gently sting tiny food!",
    fun: "Neighboring clone armies sting each other at the border — white war-scar bands mark the front lines."
  },
  {
    id: "ochre-star",
    name: "Ochre sea star",
    latin: "Pisaster ochraceus",
    type: "marine",
    tags: ["marine", "tidepool"],
    emoji: "⭐",
    body: "The classic purple-or-orange keystone star of San Juan rocky shores. By eating mussels it keeps mid-intertidal space open for many other species. Populations are recovering after sea-star wasting disease.",
    bodyKid: "A big colorful sea star on the rocks at low tide. It eats mussels so other animals get room to live!",
    fun: "Keystone-species science was partly built on studying Pisaster on Pacific Northwest shores."
  },
  {
    id: "chiton",
    name: "Gumboot chiton",
    latin: "Cryptochiton stelleri",
    type: "marine",
    tags: ["marine", "tidepool"],
    emoji: "🦠",
    body: "The world’s largest chiton — found on low-tide boulders around San Juan Island. Eight shell plates hide under a tough brick-red girdle; it rasps algae, often at night.",
    bodyKid: "A giant rock-hugging animal with a tough red back. Underneath are eight shell plates like a shield!",
    fun: "Gumboots can exceed a foot long. Their blood is blue-green from hemocyanin."
  },
  {
    id: "sculpin",
    name: "Tidepool sculpin",
    latin: "Oligocottus maculosus",
    type: "marine",
    tags: ["marine", "tidepool"],
    emoji: "🐟",
    body: "Camouflaged sit-and-wait fish of residual pools on San Juan’s rocky beaches. They tolerate wild swings in temperature and salinity as pools warm between tides.",
    bodyKid: "A tiny camouflaged fish hiding in leftover tidepools. Stay still and you might see one zip!",
    fun: "They can breathe air briefly and hop between nearby pools when stranded."
  },
  {
    id: "hermit",
    name: "Hermit crab",
    latin: "Pagurus spp.",
    type: "marine",
    tags: ["marine", "tidepool"],
    emoji: "🦀",
    body: "Soft-tailed crabs that recycle empty snail shells — easy to spot scuttling in San Juan tidepools and under rockweed at low tide.",
    bodyKid: "A crab that wears a snail shell like a backpack. When it grows, it needs a bigger shell!",
    fun: "Watch for “shell fights” — crabs may try to steal a better home from a neighbor."
  },
  {
    id: "barnacle",
    name: "Acorn barnacle",
    latin: "Balanus / Chthamalus spp.",
    type: "marine",
    tags: ["marine", "tidepool"],
    emoji: "⚪",
    body: "White volcano-shaped crustaceans cementing the high intertidal on San Juan basalt and sandstone. Legs filter-feed when submerged; plates clamp shut at low tide.",
    bodyKid: "Tiny animals glued to rock that look like little volcanoes. When water covers them, legs pop out to grab food!",
    fun: "Barnacles are related to crabs and shrimp — not mollusks. Their glue is one of nature’s strongest."
  },
  {
    id: "mussel",
    name: "California mussel",
    latin: "Mytilus californianus",
    type: "marine",
    tags: ["marine", "tidepool"],
    emoji: "🐚",
    body: "Dense blue-black beds on wave-washed mid-shore rock around San Juan Island. Byssal threads hold fast; the beds shelter worms, crabs, and snails.",
    bodyKid: "Blue-black shells stuck to rock with super-strong threads. Whole neighborhoods of animals hide among them!",
    fun: "Without sea stars, mussels can take over the mid-intertidal and squeeze out other species."
  },
  {
    id: "urchin",
    name: "Purple sea urchin",
    latin: "Strongylocentrotus purpuratus",
    type: "marine",
    tags: ["marine", "tidepool"],
    emoji: "🟣",
    body: "Spiny grazers of the low intertidal and shallow subtidal on San Juan’s rocky coasts. They rasp algae with five teeth (Aristotle’s lantern).",
    bodyKid: "A spiky purple ball that scrapes algae off rocks. Look only — those spines are sharp!",
    fun: "Their five teeth work like a living drill on rock and kelp holdfasts."
  },
  {
    id: "rockweed",
    name: "Pacific rockweed",
    latin: "Fucus distichus (gardneri)",
    type: "plant",
    tags: ["plant", "marine", "tidepool"],
    emoji: "🥬",
    body: "The olive-brown “rockweed” that carpets mid-intertidal boulders on San Juan Island. Branching fronds with midribs and air bladders cushion wave shock and hide crabs, snails, and sculpins at low tide.",
    bodyKid: "Brownish-green seaweed stuck to rocks. It feels rubbery and is a favorite hideout for tiny crabs!",
    fun: "When the tide is out, rockweed drapes like a wet blanket — step carefully so you don’t crush the homes underneath."
  },
  {
    id: "sea-lettuce",
    name: "Sea lettuce",
    latin: "Ulva spp.",
    type: "plant",
    tags: ["plant", "marine", "tidepool"],
    emoji: "🥗",
    body: "Bright green sheet-like algae common in quiet San Juan embayments, seeps, and pool margins. Fast-growing; blooms can signal nutrient-rich water. Edible in principle, but harvest only where clean and permitted.",
    bodyKid: "Bright green seaweed that looks like wet lettuce leaves floating in pools and on wet sand.",
    fun: "Sea lettuce can double its size in a few days when sunlight and nutrients line up."
  }
];

SJI.ECOLOGY = {
  canopy: {
    title: "Canopy & sky",
    body: "Douglas fir, grand fir, and madrona crowns catch fog and host eagles. Peregrines and ravens use thermals over south-facing bluffs. Light filters differently here than in the wet Cascades — more sun, less moss-drip.",
    bodyKid: "The tops of the trees! Eagles build huge nests here and look out over the whole sea.",
    species: [
      { emoji: "🦅", name: "Bald eagle" },
      { emoji: "🌲", name: "Douglas fir" },
      { emoji: "🌳", name: "Pacific madrona" },
      { emoji: "🦉", name: "Barred owl" }
    ]
  },
  forest: {
    title: "Forest floor",
    body: "Salal, sword fern, and Oregon grape carpet second-growth stands. Black-tailed deer browse; fungi network nutrients. Small old-growth pockets hold western redcedar and deep shade.",
    bodyKid: "Under the trees you’ll find ferns, berries, deer trails, and mushrooms after rain.",
    species: [
      { emoji: "🦌", name: "Black-tailed deer" },
      { emoji: "🍄", name: "Forest fungi" },
      { emoji: "🌿", name: "Sword fern & salal" },
      { emoji: "🦊", name: "Red fox" }
    ]
  },
  intertidal: {
    title: "Intertidal zone",
    body: "Twice a day the sea peels back to reveal tidepools: anemones, chitons, sculpins, and ochre stars. Oystercatchers work the mussels; seals haul out on higher reefs. Timing a minus tide is a local art.",
    bodyKid: "When the ocean goes out, magic pools appear full of stars, snails, and tiny fish. Don’t poke — just look!",
    species: [
      { emoji: "⭐", name: "Ochre sea star" },
      { emoji: "🐦", name: "Black oystercatcher" },
      { emoji: "🦭", name: "Harbor seal" },
      { emoji: "🐚", name: "Mussels & barnacles" }
    ]
  },
  kelp: {
    title: "Kelp forest",
    body: "Bull kelp canopies sway in the current, creating three-dimensional nurseries. Rockfish, juvenile salmon, and invertebrates use the forest. Urchins graze holdfasts; without otters, barrens can spread.",
    bodyKid: "An underwater jungle of seaweed towers. Baby fish hide here from bigger hunters.",
    species: [
      { emoji: "🌿", name: "Bull kelp" },
      { emoji: "🐟", name: "Juvenile salmon" },
      { emoji: "🐠", name: "Rockfish" },
      { emoji: "🟣", name: "Sea urchins" }
    ]
  },
  deep: {
    title: "Deep channels",
    body: "Haro and Rosario plunge to hundreds of feet. Strong tidal currents mix nutrients — the engine of Salish Sea productivity. Orcas, porpoises, and minke whales use these corridors; freighters share the same liquid highways.",
    bodyKid: "The deep water roads between islands. Whales travel here, and so do giant cargo ships.",
    species: [
      { emoji: "🐋", name: "Orcas" },
      { emoji: "🐬", name: "Dall’s porpoise" },
      { emoji: "🚢", name: "Shipping lanes" },
      { emoji: "🐋", name: "Minke whale" }
    ]
  }
};

/** Rocky shore / tidepool explorer */
SJI.TIDEPOOL = {
  zones: {
    splash: {
      title: "Splash zone",
      body: "Above the high-tide line, only spray and storm surges wet the rock. Lichens paint the basalt; a few hardy barnacles and limpets cling where wave energy is highest. Life here is a drought specialist’s game.",
      bodyKid: "This rock only gets splashed. Tough little barnacles and colorful lichens live up high where it’s mostly dry."
    },
    high: {
      title: "High intertidal",
      body: "Covered only at high tide. Acorn barnacles and limpets dominate bare rock; black turban snails graze films of algae. Emersion heat and desiccation set the upper limits of many species.",
      bodyKid: "Underwater only when the tide is high. Barnacles and snails hang on tight so they don’t dry out."
    },
    mid: {
      title: "Mid intertidal",
      body: "Twice-daily immersion. Dense mussel beds, goose barnacles, and carpeting algae form living armor. Competition for space is fierce — sea stars pry open mussels and reset the race.",
      bodyKid: "Covered and uncovered twice a day. Mussels, barnacles, and seaweed cover the rocks like a living rug."
    },
    low: {
      title: "Low intertidal & pools",
      body: "Exposed only on the lowest tides — the classic tidepool realm. Anemones, chitons, sculpins, urchins, and ochre stars pack crevices and residual pools. A minus tide is the best window into this underwater garden.",
      bodyKid: "Only the lowest tides open this secret world. Look for sea stars, anemones, and tiny fish in the leftover pools!"
    }
  },
  creatures: [
    {
      id: "anemone",
      name: "Aggregating anemone",
      latin: "Anthopleura elegantissima",
      emoji: "🪸",
      zone: "low",
      body: "Colonies of identical clones carpet shaded pools and crevices. Tentacles sting microscopic prey; symbiotic algae tint many green. Neighboring clones fight territorial wars with specialized tentacles — a quiet civil war in every pool.",
      bodyKid: "A soft flower-looking animal that stays stuck to rock. Its tentacles gently sting tiny food. Families of clones live side by side!",
      fun: "When two different clone armies meet, they sting each other at the border — white war-scar bands are common."
    },
    {
      id: "ochre-star",
      name: "Ochre sea star",
      latin: "Pisaster ochraceus",
      emoji: "⭐",
      zone: "mid",
      body: "A keystone predator of the rocky shore. By eating mussels, ochre stars prevent a single competitor from monopolizing space — creating room for dozens of other species. Purple and orange morphs are both common in the San Juans.",
      bodyKid: "A big colorful sea star that eats mussels. Without it, mussels would take over the whole rock!",
      fun: "Keystone species concept was partly developed by studying Pisaster on Pacific Northwest shores."
    },
    {
      id: "chiton",
      name: "Gumboot chiton",
      latin: "Cryptochiton stelleri",
      emoji: "🦠",
      zone: "low",
      body: "The world’s largest chiton — a living armored slug of eight hidden plates under a leathery girdle. It rasps algae at night and can live decades. Look for brick-red backs on low-tide boulders.",
      bodyKid: "A giant rock-hugging animal with a tough red back. Underneath are eight shell plates — like a built-in shield!",
      fun: "Gumboots can exceed a foot long. Their blood is blue-green from hemocyanin."
    },
    {
      id: "sculpin",
      name: "Tidepool sculpin",
      latin: "Oligocottus maculosus",
      emoji: "🐟",
      zone: "low",
      body: "A master of residual pools. Camouflaged mottling and a sit-and-wait habit make sculpins easy to miss until they dart. They tolerate wide swings in temperature, salinity, and oxygen as pools warm between tides.",
      bodyKid: "A tiny camouflaged fish that hides in leftover tidepools. Stay still and you might see one zip between rocks!",
      fun: "They can breathe air briefly and hop between nearby pools when stranded."
    },
    {
      id: "hermit",
      name: "Hermit crab",
      latin: "Pagurus spp.",
      emoji: "🦀",
      zone: "mid",
      body: "Soft-tailed crabs that house-hunt empty snail shells. As they grow they must upgrade — competition for the right shell is a tidepool soap opera. Antennae constantly sample scent and flow.",
      bodyKid: "A crab that wears a snail shell like a backpack home. When it gets bigger, it has to find a roomier shell!",
      fun: "Watch for “shell fights” — crabs may try to steal a better shell from a neighbor."
    },
    {
      id: "barnacle",
      name: "Acorn barnacle",
      latin: "Balanus / Chthamalus spp.",
      emoji: "⚪",
      zone: "high",
      body: "Cemented crustaceans that filter-feed with feathery legs when submerged. At low tide they clamp opercular plates shut against desiccation. Dense white crusts mark the high intertidal like a waterline of life.",
      bodyKid: "Tiny animals glued to rock that look like little volcanoes. When water covers them, legs pop out to grab food!",
      fun: "Barnacles are related to crabs and shrimp — not mollusks. Their glue is one of nature’s strongest."
    },
    {
      id: "mussel",
      name: "California mussel",
      latin: "Mytilus californianus",
      emoji: "🐚",
      zone: "mid",
      body: "Byssal threads lash mussels into dense beds that buffer wave shock and create microhabitats for dozens of species. Without sea star predation, mussels can dominate mid-shore rock.",
      bodyKid: "Blue-black shells stuck to rock with super-strong threads. Whole neighborhoods of animals hide among them!",
      fun: "A mussel bed is a mini city — worms, crabs, and snails live in the cracks between shells."
    },
    {
      id: "urchin",
      name: "Purple sea urchin",
      latin: "Strongylocentrotus purpuratus",
      emoji: "🟣",
      zone: "low",
      body: "Grazers that rasp algae with a five-toothed Aristotle’s lantern. In balance they keep rock surfaces diverse; in outbreaks (and without sea otters or large stars) they can help create urchin barrens below the tide.",
      bodyKid: "A spiky purple ball that scrapes algae off rocks. Handle with your eyes only — those spines are sharp!",
      fun: "Their mouth has five teeth that work like a living drill."
    },
    {
      id: "rockweed",
      name: "Pacific rockweed",
      latin: "Fucus distichus (gardneri)",
      emoji: "🥬",
      zone: "mid",
      kind: "plant",
      body: "Olive-brown branching algae with air bladders — the classic seaweed blanket of San Juan mid-shore rocks. Crabs, snails, and sculpins shelter under its fronds when the tide drops.",
      bodyKid: "Rubbery brown-green seaweed that covers rocks. Lots of tiny animals hide underneath!",
      fun: "Those little bubbles in the fronds are air sacs that help the plant float upright when the tide is in."
    },
    {
      id: "sea-lettuce",
      name: "Sea lettuce",
      latin: "Ulva spp.",
      emoji: "🥗",
      zone: "high",
      kind: "plant",
      body: "Bright green sheets in quiet pools, seeps, and soft shores around San Juan Island. Fast-growing and easy to spot as a splash of emerald on wet rock or mud.",
      bodyKid: "Bright green seaweed that looks like wet lettuce leaves!",
      fun: "Sea lettuce can grow so fast it almost doubles in a few sunny days."
    },
    {
      id: "kelp",
      name: "Bull kelp",
      latin: "Nereocystis luetkeana",
      emoji: "🌿",
      zone: "low",
      kind: "plant",
      body: "Often washed onto San Juan beaches or visible just offshore as long brown ropes with bulb floats. Juvenile fish use the living forest; beach wrack feeds shore scavengers.",
      bodyKid: "The tall seaweed with a balloon-like float. You might see long ropes of it washed up on the beach!",
      fun: "A single bull kelp can grow tens of feet in one summer — one of the fastest-growing seaweeds on Earth."
    }
  ],
  tips: [
    {
      title: "Look, don’t poke",
      body: "Hands and tools crush fragile animals and can tear anemones from rock. Observe with eyes and cameras.",
      bodyKid: "Use your eyes, not your fingers. Animals can get hurt even by a gentle poke."
    },
    {
      title: "Watch your step",
      body: "Walk on bare rock when possible. Stepping on seaweed and mussel beds smashes homes you cannot see.",
      bodyKid: "Step on plain rock, not on the green slippery seaweed or the mussel patches."
    },
    {
      title: "Turn, then return",
      body: "If you lift a rock, put it back exactly as you found it — dark underside down — so residents keep their shelter.",
      bodyKid: "If a grown-up carefully lifts a rock, put it back the same way so animals keep their shady home."
    },
    {
      title: "Mind the tide",
      body: "Minus tides are best and brief. Know the schedule, keep an eye on the water, and never get cut off by a rising flood.",
      bodyKid: "The ocean comes back! Always know when the tide turns and leave extra time to walk back."
    }
  ]
};

SJI.EXPLORE = {
  "san-juan": {
    name: "San Juan Island",
    nick: "Where whales meet history",
    body: "Circle the island and you pass from prairie at American Camp to the deep-water amphitheater of Lime Kiln, then the formal gardens of English Camp. Friday Harbor is the social and scientific hub — ferries, labs, galleries, and ice cream in equal measure.",
    bodyKid: "See orcas from shore, visit two old army camps from the Pig War, and eat ice cream in Friday Harbor!",
    spots: [
      { icon: "🐋", title: "Lime Kiln Point", note: "Best land-based whale watching on the West Coast" },
      { icon: "🏛️", title: "American & English Camps", note: "Pig War history in a national historical park" },
      { icon: "🔬", title: "Friday Harbor Labs", note: "University of Washington marine science" },
      { icon: "🌅", title: "Cattle Point", note: "Lighthouse, prairie, and Strait views" }
    ],
    tip: "Summer weekends book out — reserve ferries early, or sail midweek for quieter roads."
  },
  "orcas": {
    name: "Orcas Island",
    nick: "Mountains in the sea",
    body: "The island folds around East Sound like a fjord. Moran State Park alone could fill a week: Cascade Lake swims, Twin Lakes hikes, and the stone tower on Mount Constitution for a 360° Salish Sea panorama.",
    bodyKid: "Climb the tallest mountain, swim in lakes, and look for seals in the long bay called East Sound.",
    spots: [
      { icon: "⛰️", title: "Mount Constitution", note: "2,407 ft — tallest point in the San Juans" },
      { icon: "🏞️", title: "Moran State Park", note: "Lakes, trails, camping, and old-growth pockets" },
      { icon: "🛍️", title: "Eastsound", note: "Village heart with market and bookshops" },
      { icon: "🌲", title: "Turtleback Mountain", note: "Preserve with sweeping western views" }
    ],
    tip: "The ferry lands at Orcas Landing — Eastsound is a scenic 10-minute drive north."
  },
  "lopez": {
    name: "Lopez Island",
    nick: "Waves, wheels, and kindness",
    body: "Lopez invites bicycles: rolling farmland, quiet lanes, and the tradition of waving to every passerby. Spencer Spit and Iceberg Point bookend very different moods of shoreline.",
    bodyKid: "Bring a bike! Wave at everyone you pass, visit sandy spits, and watch for eagles over the fields.",
    spots: [
      { icon: "🚲", title: "Island-wide bike loops", note: "Gentle hills and famous friendliness" },
      { icon: "🏖️", title: "Spencer Spit", note: "State park with lagoon and campground" },
      { icon: "🪨", title: "Iceberg Point", note: "Dramatic BLM bluffs at the south end" },
      { icon: "🦅", title: "Shark Reef", note: "Short trail to seal & bird overlooks" }
    ],
    tip: "Lopez Village has groceries, cafes, and bike rentals — stock up before remote ends of the island."
  },
  "shaw": {
    name: "Shaw Island",
    nick: "Smallest ferry stop",
    body: "Shaw is for those who want the ferry ride without the bustle. County park beaches, forest roads, and a pace that makes even Orcas feel metropolitan.",
    bodyKid: "The quietest ferry island. Perfect for a slow picnic and looking for crabs under rocks.",
    spots: [
      { icon: "⛴️", title: "Shaw Landing", note: "Historic dock once staffed by Franciscan nuns" },
      { icon: "⛺", title: "County Park", note: "Beach, camping, and simple pleasures" },
      { icon: "🌲", title: "Forest roads", note: "Walk or bike in deep quiet" },
      { icon: "🌌", title: "Night skies", note: "Low light pollution for stargazing" }
    ],
    tip: "Services are minimal — bring food and expect peace rather than restaurants."
  }
};

SJI.QUIZ = [
  {
    q: "What almost caused a war between the U.S. and Britain on San Juan Island?",
    qKid: "What animal almost started a war?",
    options: ["A stolen horse", "A pig in a potato patch", "A sunken ship", "A gold claim"],
    answer: 1,
    explain: "In 1859, American settler Lyman Cutlar shot a British Hudson’s Bay Company pig. The border dispute escalated — but the pig was the only casualty."
  },
  {
    q: "What do Southern Resident orcas primarily eat?",
    qKid: "What do the fish-eating orcas like best?",
    options: ["Harbor seals", "Chinook salmon", "Squid", "Kelp"],
    answer: 1,
    explain: "Southern Residents specialize on fish, especially Chinook (king) salmon. Bigg’s orcas, by contrast, hunt marine mammals."
  },
  {
    q: "Why are the San Juan Islands drier than Seattle?",
    qKid: "Why do the islands get less rain than Seattle?",
    options: ["They’re farther north", "Rain shadow of the Olympics", "Ocean currents cool the air", "Less forest means less rain"],
    answer: 1,
    explain: "The Olympic Mountains block and wring moisture from Pacific storms, casting a rain shadow over the northeastern Olympic Peninsula and the San Juans."
  },
  {
    q: "How many islands and rocks are in the San Juans at high tide (approximately)?",
    qKid: "About how many islands and rocks are there?",
    options: ["About 40", "About 100", "Over 400", "Over 2,000"],
    answer: 2,
    explain: "At mean high tide there are over 400 islands and rocks, with 128 named — and more than 478 miles of shoreline."
  },
  {
    q: "What is the highest point in the San Juan Islands?",
    qKid: "What’s the tallest mountain in the islands?",
    options: ["Mount Dallas", "Mount Constitution", "Turtleback Mountain", "Mount Finlayson"],
    answer: 1,
    explain: "Mount Constitution on Orcas Island rises to 2,407 feet, with a historic stone tower and panoramic views."
  },
  {
    q: "Who decided the final U.S.–Canada border through the islands?",
    qKid: "Who picked which country got the islands?",
    options: ["Queen Victoria", "Abraham Lincoln", "Kaiser Wilhelm I of Germany", "The United Nations"],
    answer: 2,
    explain: "Both sides agreed to arbitration by German Emperor Wilhelm I, who in 1872 chose the Haro Strait boundary — awarding the San Juans to the United States."
  }
];

SJI.MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
