/**
 * San Juan Islands interactive — main orchestrator
 */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function init() {
    // Modules — isolate failures so one broken feature cannot block the rest
    const boot = (label, fn) => {
      try {
        fn?.();
      } catch (err) {
        console.error(`[SJI] ${label} failed:`, err);
      }
    };
    boot("map", () => SJI.map?.build());
    boot("timeline", () => SJI.timeline?.build());
    boot("wildlife", () => SJI.wildlife?.build());
    boot("ecology", () => SJI.ecology?.init());
    boot("tidepool", () => SJI.tidepool?.init());
    boot("explore", () => SJI.explore?.build());
    boot("whales", () => SJI.whales?.init());
    boot("quiz", () => SJI.quiz?.start());
    boot("scavenger", () => SJI.scavenger?.build());
    boot("sightings", () => SJI.sightings?.init());
    boot("lime-kiln", buildLimeKiln);

    setupHeader();
    setupKidMode();
    setupReveal();
    setupCounters();
    setupNavHighlight();
    setupProgress();
    setupScrollHint();
    setupMobileMenu();
    applyDualText(false);

    // Hero reveals immediately
    requestAnimationFrame(() => {
      $$(".hero .reveal").forEach((el, i) => {
        setTimeout(() => el.classList.add("visible"), 120 + i * 100);
      });
    });
  }

  /* ---------- Header / nav ---------- */
  function setupHeader() {
    const header = $("#site-header");
    const hero = $("#hero");

    function update() {
      const y = window.scrollY;
      header.classList.toggle("scrolled", y > 40);
      if (hero) {
        const heroBottom = hero.offsetTop + hero.offsetHeight - 80;
        header.classList.toggle("on-dark", y < heroBottom - header.offsetHeight);
      }
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function setupNavHighlight() {
    const sections = $$("main section[id]");
    const links = $$(".main-nav a[data-nav]");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          links.forEach((a) => {
            a.classList.toggle("active", a.dataset.nav === id);
          });
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));

    links.forEach((a) => {
      a.addEventListener("click", () => {
        $("#main-nav")?.classList.remove("open");
        $("#menu-toggle")?.setAttribute("aria-expanded", "false");
      });
    });
  }

  function setupMobileMenu() {
    const toggle = $("#menu-toggle");
    const nav = $("#main-nav");
    toggle?.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupProgress() {
    const bar = $("#progress-bar");
    window.addEventListener("scroll", () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = pct + "%";
      bar.setAttribute("aria-valuenow", Math.round(pct));
    }, { passive: true });
  }

  function setupScrollHint() {
    $(".scroll-hint")?.addEventListener("click", () => {
      $("#map")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ---------- Kid mode ---------- */
  function setupKidMode() {
    const btn = $("#kid-toggle");
    const stored = localStorage.getItem("sji-kid-mode") === "1";
    if (stored) setKidMode(true);

    btn?.addEventListener("click", () => {
      const on = !document.body.classList.contains("kid-mode");
      setKidMode(on);
      localStorage.setItem("sji-kid-mode", on ? "1" : "0");
    });
  }

  function setKidMode(on) {
    document.body.classList.toggle("kid-mode", on);
    const btn = $("#kid-toggle");
    btn?.setAttribute("aria-pressed", on ? "true" : "false");
    if (btn) {
      const label = btn.querySelector(".kid-label");
      if (label) label.textContent = on ? "Kid Mode ON" : "Kid Mode";
    }
    applyDualText(on);
    SJI.timeline?.applyKidMode(on);
    SJI.explore?.applyKidMode(on);
    SJI.ecology?.refreshText();
    SJI.tidepool?.refreshText();

    // Refresh map panel if open
    const content = $(".map-panel-content");
    if (content && !content.hidden) {
      const selected = $(".island.selected");
      if (selected) SJI.map.select(selected.dataset.id);
    }

    // Re-render current quiz question text if mid-quiz
    // (simplest: don't force restart — dual text handled on next render)
  }

  function applyDualText(kidOn) {
    $$("[data-adult][data-kid]").forEach((el) => {
      // Prefer child text nodes / direct content swap
      const adult = el.getAttribute("data-adult");
      const kid = el.getAttribute("data-kid");
      // Support HTML in tips
      if (adult.includes("<") || kid.includes("<")) {
        el.innerHTML = kidOn ? kid : adult;
      } else {
        el.textContent = kidOn ? kid : adult;
      }
    });

    // Pressure cards and extras that only have data on parent p
    $$(".pressure-card p[data-adult], .extra-card p[data-adult]").forEach((el) => {
      const adult = el.getAttribute("data-adult");
      const kid = el.getAttribute("data-kid");
      if (adult && kid) el.textContent = kidOn ? kid : adult;
    });
  }

  /* ---------- Scroll reveals ---------- */
  function setupReveal() {
    const els = $$(".section-header, .map-workspace, .pig-war, .whale-sim, .wildlife-filters, .wildlife-grid, .ecology-cross, .ecology-extras, .tidepool-workspace, .tidepool-tips, .explore-tabs, .quiz, .sources, .context-card, .pod-card, .pressure-card, .extra-card, .sightings-panel, .lime-kiln-layout, .scavenger-sheet");
    els.forEach((el) => {
      if (!el.classList.contains("reveal")) el.classList.add("reveal");
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );
    $$(".reveal").forEach((el) => io.observe(el));
  }

  /* ---------- Hero counters ---------- */
  function setupCounters() {
    const nums = $$(".stat-num[data-count]");
    let done = false;

    function animate() {
      if (done) return;
      done = true;
      nums.forEach((el) => {
        const target = parseInt(el.dataset.count, 10);
        const duration = 1600;
        const start = performance.now();
        function frame(now) {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased).toLocaleString();
          if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
    }

    const hero = $("#hero");
    if (!hero) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) animate();
    }, { threshold: 0.3 });
    io.observe(hero);
    // Also fire after short delay if already visible
    setTimeout(animate, 800);
  }

  /* ---------- Lime Kiln photo panels ---------- */
  function buildLimeKiln() {
    const gallery = $("#lime-kiln-gallery");
    if (!gallery || !SJI.PHOTOS?.limeKiln) return;
    gallery.innerHTML = SJI.PHOTOS.limeKiln
      .map(
        (p, i) => `
      <figure class="lk-panel" style="animation-delay:${i * 0.06}s">
        <div class="lk-img-wrap">
          <img src="${p.src}" alt="${p.caption}" loading="lazy" />
        </div>
        <figcaption>
          <span class="lk-cap">${p.caption}</span>
          <span class="lk-credit">${p.credit || ""}</span>
        </figcaption>
      </figure>`
      )
      .join("");

    // Lightbox
    gallery.querySelectorAll(".lk-panel").forEach((fig) => {
      fig.addEventListener("click", () => {
        const img = fig.querySelector("img");
        const cap = fig.querySelector(".lk-cap")?.textContent || "";
        openLightbox(img?.src, cap);
      });
    });
  }

  function openLightbox(src, caption) {
    let lb = $("#photo-lightbox");
    if (!lb) {
      lb = document.createElement("div");
      lb.id = "photo-lightbox";
      lb.className = "photo-lightbox";
      lb.hidden = true;
      lb.innerHTML = `
        <div class="lb-backdrop" data-lb-close></div>
        <figure class="lb-figure">
          <button type="button" class="lb-close" data-lb-close aria-label="Close">×</button>
          <img id="lb-img" alt="" />
          <figcaption id="lb-cap"></figcaption>
        </figure>`;
      document.body.appendChild(lb);
      lb.querySelectorAll("[data-lb-close]").forEach((el) =>
        el.addEventListener("click", () => {
          lb.hidden = true;
          document.body.style.overflow = "";
        })
      );
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !lb.hidden) {
          lb.hidden = true;
          document.body.style.overflow = "";
        }
      });
    }
    $("#lb-img").src = src;
    $("#lb-img").alt = caption;
    $("#lb-cap").textContent = caption;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  }

  /* ---------- Boot ---------- */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
