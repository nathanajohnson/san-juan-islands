/* hero.js — scroll parallax for the WPA dusk seascape hero
   (owned by the hero/scenes agent). Transform-only, rAF-throttled. */
(function () {
  function init() {
    var scene = document.querySelector(".hero-scene");
    if (!scene) return;
    var far = scene.querySelector(".hs-l-far");
    var mid = scene.querySelector(".hs-l-mid");
    var fg = scene.querySelector(".hs-l-fg");
    if (!far && !mid && !fg) return;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    var ticking = false;

    function clear() {
      [far, mid, fg].forEach(function (el) {
        if (el) el.style.transform = "";
      });
    }

    function apply() {
      ticking = false;
      if (reduce.matches || window.innerWidth < 768) {
        clear();
        return;
      }
      // Only while the hero is in view.
      var y = Math.min(Math.max(window.scrollY || 0, 0), window.innerHeight);
      if (far) far.style.transform = "translate3d(0," + (y * 0.06).toFixed(1) + "px,0)";
      if (mid) mid.style.transform = "translate3d(0," + (y * 0.03).toFixed(1) + "px,0)";
      if (fg) fg.style.transform = "translate3d(0," + (y * -0.05).toFixed(1) + "px,0)";
    }

    function request() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(apply);
      }
    }

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request, { passive: true });
    if (reduce.addEventListener) reduce.addEventListener("change", request);
    apply();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
