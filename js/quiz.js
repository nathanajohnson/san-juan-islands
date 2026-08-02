/**
 * Interactive discovery quiz
 */
(function () {
  let index = 0;
  let score = 0;
  let locked = false;

  function setDial(pct) {
    const bar = document.getElementById("quiz-bar");
    if (bar) bar.style.setProperty("--quiz-pct", pct + "%");
    const needle = document.getElementById("quiz-needle");
    if (needle) needle.style.transform = `rotate(${(pct / 100) * 360}deg)`;
  }

  function start() {
    index = 0;
    score = 0;
    locked = false;
    render();
  }

  function render() {
    const body = document.getElementById("quiz-body");
    const bar = document.getElementById("quiz-bar");
    const count = document.getElementById("quiz-count");
    if (!body) return;

    const total = SJI.QUIZ.length;

    if (index >= total) {
      showResult();
      return;
    }

    const q = SJI.QUIZ[index];
    const kid = document.body.classList.contains("kid-mode");
    const pct = ((index) / total) * 100;
    setDial(pct);
    if (count) count.textContent = `${index + 1} / ${total}`;

    const keys = ["A", "B", "C", "D", "E"];
    body.innerHTML = `
      <h3 class="quiz-q">${kid ? q.qKid : q.q}</h3>
      <div class="quiz-options">
        ${q.options.map((opt, i) => `
          <button type="button" class="quiz-opt" data-i="${i}">
            <span class="qo-key" aria-hidden="true">${keys[i] || "·"}</span>
            <span class="qo-text">${opt}</span>
          </button>
        `).join("")}
      </div>
      <div class="quiz-feedback" id="quiz-feedback" hidden></div>
      <button type="button" class="btn btn-primary quiz-next" id="quiz-next" hidden>
        ${index === total - 1 ? "Open the ship's log" : "Next question"}
      </button>
    `;

    body.querySelectorAll(".quiz-opt").forEach((btn) => {
      btn.addEventListener("click", () => answer(parseInt(btn.dataset.i, 10)));
    });
    document.getElementById("quiz-next")?.addEventListener("click", () => {
      index++;
      locked = false;
      render();
    });
  }

  function answer(choice) {
    if (locked) return;
    locked = true;
    const q = SJI.QUIZ[index];
    const opts = document.querySelectorAll(".quiz-opt");
    opts.forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.answer) btn.classList.add("correct");
      else if (i === choice) btn.classList.add("wrong");
    });

    if (choice === q.answer) score++;

    const fb = document.getElementById("quiz-feedback");
    fb.hidden = false;
    fb.textContent = (choice === q.answer ? "Correct! " : "Not quite. ") + q.explain;

    const next = document.getElementById("quiz-next");
    if (next) next.hidden = false;

    const total = SJI.QUIZ.length;
    setDial(((index + 1) / total) * 100);
  }

  function showResult() {
    const body = document.getElementById("quiz-body");
    const total = SJI.QUIZ.length;
    const count = document.getElementById("quiz-count");
    setDial(100);
    if (count) count.textContent = `${total} / ${total}`;

    const kid = document.body.classList.contains("kid-mode");
    let rank, title, msg;
    if (score === total) {
      rank = "Keeper of the Light";
      title = kid ? "Island expert!" : "Archipelago authority";
      msg = kid
        ? "You know these islands like a harbor seal knows the reefs!"
        : "You navigate these channels with confidence — from Pig War diplomacy to orca ecology.";
    } else if (score >= total * 0.8) {
      rank = "Skipper";
      title = kid ? "Almost perfect!" : "Steady at the helm";
      msg = kid
        ? "So close to keeper of the light! One more pass and the lamp is yours."
        : "You hold a confident course. One more reading of the chart earns the light.";
    } else if (score >= total * 0.5) {
      rank = "Mate";
      title = kid ? "Great explorer!" : "Capable mate";
      msg = kid
        ? "You’re well on your way. Ferry back through the sections and try again!"
        : "A strong reading of the Salish Sea. Revisit a section and sharpen the edges.";
    } else {
      rank = "Deckhand";
      title = kid ? "Curious beginner!" : "New to the tide chart";
      msg = kid
        ? "Every explorer starts somewhere. Scroll up and discover more, then try again!"
        : "The islands reward slow looking. Wander the map and whale sections, then return.";
    }

    const date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    body.innerHTML = `
      <div class="quiz-result quiz-log">
        <p class="ql-head">Ship&rsquo;s Log · San Juan Archipelago</p>
        <p class="ql-date">${date} · Haro Strait, wind light</p>
        <div class="ql-stamp" aria-hidden="true">${SJI.icon(score === total ? "star-stamp" : "check-stamp")}</div>
        <div class="score-num">${score}<span class="ql-of">/ ${total}</span></div>
        <p class="ql-rank"><span>Rating earned</span>${rank}</p>
        <div class="ql-ladder" aria-hidden="true">
          <span class="${score < total * 0.5 ? "on" : ""}">Deckhand</span>
          <span class="${score >= total * 0.5 && score < total * 0.8 ? "on" : ""}">Mate</span>
          <span class="${score >= total * 0.8 && score < total ? "on" : ""}">Skipper</span>
          <span class="${score === total ? "on" : ""}">Keeper of the Light</span>
        </div>
        <h3>${title}</h3>
        <p>${msg}</p>
        <button type="button" class="btn btn-primary" id="quiz-retry">Set out again</button>
      </div>
    `;
    document.getElementById("quiz-retry")?.addEventListener("click", start);
  }

  SJI.quiz = { start };
})();
