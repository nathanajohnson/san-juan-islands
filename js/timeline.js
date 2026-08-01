/**
 * Scroll-linked history timeline
 */
(function () {
  function build() {
    const root = document.getElementById("timeline-events");
    if (!root || !SJI.TIMELINE) return;

    root.innerHTML = SJI.TIMELINE.map((ev, i) => `
      <article class="timeline-event" data-index="${i}">
        <p class="timeline-year">
          <span class="adult-text">${ev.year}</span>
          <span class="kid-text" hidden>${ev.yearKid}</span>
        </p>
        <h3>
          <span class="adult-text">${ev.title}</span>
          <span class="kid-text" hidden>${ev.titleKid}</span>
        </h3>
        <p>
          <span class="adult-text">${ev.body}</span>
          <span class="kid-text" hidden>${ev.bodyKid}</span>
        </p>
      </article>
    `).join("");

    const events = root.querySelectorAll(".timeline-event");
    const progress = document.getElementById("timeline-progress");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
        updateProgress();
      },
      { threshold: 0.35, rootMargin: "0px 0px -10% 0px" }
    );

    events.forEach((e) => io.observe(e));

    function updateProgress() {
      if (!progress) return;
      const vis = [...events].filter((e) => e.classList.contains("visible")).length;
      const pct = Math.min(100, (vis / events.length) * 100);
      progress.style.height = pct + "%";
    }

    window.addEventListener("scroll", () => {
      const section = document.getElementById("history");
      if (!section || !progress) return;
      const rect = section.getBoundingClientRect();
      const view = window.innerHeight;
      if (rect.bottom < 0 || rect.top > view) return;
      const total = section.offsetHeight - view;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      // Blend scroll progress with visibility
      const vis = [...events].filter((e) => e.classList.contains("visible")).length;
      const visPct = (vis / events.length) * 100;
      progress.style.height = Math.max(pct * 0.5 + visPct * 0.5, visPct) + "%";
    }, { passive: true });
  }

  function applyKidMode(on) {
    document.querySelectorAll("#timeline-events .adult-text").forEach((el) => {
      el.hidden = on;
    });
    document.querySelectorAll("#timeline-events .kid-text").forEach((el) => {
      el.hidden = !on;
    });
  }

  SJI.timeline = { build, applyKidMode };
})();
