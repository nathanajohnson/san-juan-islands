/**
 * Interactive discovery quiz
 */
(function () {
  let index = 0;
  let score = 0;
  let locked = false;

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
    if (bar) bar.style.setProperty("--quiz-pct", pct + "%");
    if (count) count.textContent = `${index + 1} / ${total}`;

    body.innerHTML = `
      <h3 class="quiz-q">${kid ? q.qKid : q.q}</h3>
      <div class="quiz-options">
        ${q.options.map((opt, i) => `
          <button type="button" class="quiz-opt" data-i="${i}">${opt}</button>
        `).join("")}
      </div>
      <div class="quiz-feedback" id="quiz-feedback" hidden></div>
      <button type="button" class="btn btn-primary quiz-next" id="quiz-next" hidden>
        ${index === total - 1 ? "See results" : "Next question"}
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
    const bar = document.getElementById("quiz-bar");
    if (bar) bar.style.setProperty("--quiz-pct", ((index + 1) / total) * 100 + "%");
  }

  function showResult() {
    const body = document.getElementById("quiz-body");
    const total = SJI.QUIZ.length;
    const bar = document.getElementById("quiz-bar");
    const count = document.getElementById("quiz-count");
    if (bar) bar.style.setProperty("--quiz-pct", "100%");
    if (count) count.textContent = `${total} / ${total}`;

    const kid = document.body.classList.contains("kid-mode");
    let title, msg;
    if (score === total) {
      title = kid ? "Island expert!" : "Archipelago authority";
      msg = kid
        ? "You know these islands like a harbor seal knows the reefs!"
        : "You navigate these channels with confidence — from Pig War diplomacy to orca ecology.";
    } else if (score >= total * 0.6) {
      title = kid ? "Great explorer!" : "Solid first mate";
      msg = kid
        ? "You’re well on your way. Ferry back through the sections and try again!"
        : "A strong reading of the Salish Sea. Revisit a section and sharpen the edges.";
    } else {
      title = kid ? "Curious beginner!" : "New to the tide chart";
      msg = kid
        ? "Every explorer starts somewhere. Scroll up and discover more, then try again!"
        : "The islands reward slow looking. Wander the map and whale sections, then return.";
    }

    body.innerHTML = `
      <div class="quiz-result">
        <div class="score-num">${score}/${total}</div>
        <h3>${title}</h3>
        <p>${msg}</p>
        <button type="button" class="btn btn-primary" id="quiz-retry">Try again</button>
      </div>
    `;
    document.getElementById("quiz-retry")?.addEventListener("click", start);
  }

  SJI.quiz = { start };
})();
