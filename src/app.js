import {
  compatibleRouteGroups,
  conflictFor,
  destinationFor,
  getNode,
  isQuestion,
  makeSubjectState,
  optionConflictFor,
  positionName,
  pushHistory,
  restorePrevious,
  selectionLimitFor,
  terminalCandidates
} from "./core/tree-engine.js";
import { labelFor, subjectDefinitions } from "./data/trees.js";

const STORAGE_KEY = "ideovalues-state-v3-dfs-no-entry";
const app = document.querySelector("#app");

const freshState = () => ({
  screen: "home",
  subjectIndex: 0,
  summarySubjectId: null,
  subjects: Object.fromEntries(subjectDefinitions.map((subject) => [subject.id, makeSubjectState(subject)])),
  error: ""
});

let state = loadState();
let transitionTimer = null;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.subjects && saved?.screen) return saved;
  } catch {
    // A damaged or unavailable local session should simply start fresh.
  }
  return freshState();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function cancelTransition() {
  if (transitionTimer) window.clearTimeout(transitionTimer);
  transitionTimer = null;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function subjectById(id) {
  return subjectDefinitions.find((subject) => subject.id === id);
}

function currentSubject() {
  return subjectDefinitions[state.subjectIndex] || subjectDefinitions[0];
}

function currentSubjectState() {
  const subject = currentSubject();
  if (!state.subjects[subject.id]) state.subjects[subject.id] = makeSubjectState(subject);
  return state.subjects[subject.id];
}

function progressCount() {
  return Object.values(state.subjects).filter((subject) => subject.complete).length;
}

function initializeSubject(subject) {
  const subjectState = state.subjects[subject.id] || makeSubjectState(subject);
  state.subjects[subject.id] = subjectState;
  if (subjectState.initialized || subjectState.complete) return subjectState;

  subjectState.initialized = true;
  subjectState.pending = subject.roots.map((root) => ({
    tree: root.tree,
    node: root.node
  })).reverse();
  advanceSubject(subjectState);
  return subjectState;
}

function reset() {
  if (!window.confirm("Start over and clear this profile?")) return;
  cancelTransition();
  state = freshState();
  saveState();
  render();
}

function setScreen(screen) {
  if (screen !== "subject-transition") cancelTransition();
  state.screen = screen;
  state.error = "";
  saveState();
  render();
}

function startAssessment() {
  cancelTransition();
  const nextIndex = subjectDefinitions.findIndex((subject) => !state.subjects[subject.id]?.complete);
  if (nextIndex < 0) {
    state.subjectIndex = 0;
    state.summarySubjectId = subjectDefinitions[0].id;
    state.screen = "subject-summary";
  } else {
    state.subjectIndex = nextIndex;
    state.screen = "subject";
    initializeSubject(currentSubject());
  }
  state.error = "";
  saveState();
  render();
}

function startSubject(subjectId) {
  cancelTransition();
  const index = subjectDefinitions.findIndex((subject) => subject.id === subjectId);
  if (index < 0) return;
  state.subjectIndex = index;
  state.screen = state.subjects[subjectId]?.complete ? "subject-summary" : "subject";
  state.summarySubjectId = subjectId;
  if (!state.subjects[subjectId]?.complete) initializeSubject(subjectById(subjectId));
  state.error = "";
  saveState();
  render();
}

function selectedIndexes(subjectState) {
  return subjectState.draft || [];
}

function toggleDraft(index) {
  const subjectState = currentSubjectState();
  const node = getNode(subjectState.current);
  const limit = Math.min(selectionLimitFor(subjectState.current), node?.options?.length || 1);
  const draft = selectedIndexes(subjectState);
  const existing = draft.indexOf(index);
  if (existing >= 0) {
    draft.splice(existing, 1);
  } else if (draft.length < limit) {
    draft.push(index);
  } else {
    state.error = `Choose up to ${limit} route${limit === 1 ? "" : "s"} at this branch.`;
  }
  subjectState.draft = draft;
  saveState();
  render();
}

function advanceSubject(subjectState) {
  while (subjectState.pending.length) {
    // LIFO traversal gives us depth-first exploration: finish the active
    // branch before returning to the next sibling route.
    const next = subjectState.pending.pop();
    if (isQuestion(next)) {
      subjectState.current = next;
      subjectState.draft = [];
      return;
    }
  }

  subjectState.current = null;
  subjectState.complete = true;
  state.summarySubjectId = subjectState.subjectId;
  state.screen = "subject-transition";
}

function continueFromQuestion(subjectState) {
  const node = getNode(subjectState.current);
  const draft = selectedIndexes(subjectState);
  if (!node || !draft.length) {
    state.error = "Choose at least one answer to continue.";
    render();
    return;
  }

  const positions = [...subjectState.selectedPositions];
  const optionConflict = optionConflictFor(subjectState.current, draft);
  if (optionConflict) {
    state.error = "Those answers are mutually exclusive and cannot be selected together.";
    render();
    return;
  }
  const destinations = draft.map((index) => destinationFor(subjectState.current, node.options[index]));
  const candidateGroups = destinations.map((destination) => destination.kind === "result"
    ? [destination.id]
    : terminalCandidates(destination.route));
  if (!compatibleRouteGroups(subjectState.subjectId, candidateGroups, positions)) {
    state.error = "Those answers open routes that cannot be combined with your existing positions in this subject.";
    render();
    return;
  }
  for (const destination of destinations) {
    if (destination.kind === "result") {
      const conflict = conflictFor(subjectState.subjectId, destination.id, positions);
      if (conflict) {
        state.error = `${positionName(destination.id)} cannot be combined with ${positionName(conflict)} in this subject.`;
        render();
        return;
      }
      positions.push(destination.id);
    } else {
      const possible = terminalCandidates(destination.route);
      if (possible.length && possible.every((candidate) => conflictFor(subjectState.subjectId, candidate, positions))) {
        state.error = "Every route from that answer conflicts with a position already selected in this subject.";
        render();
        return;
      }
    }
  }

  pushHistory(subjectState);
  subjectState.selectedPositions = positions;
  subjectState.selectedChoices.push(
    ...draft.map((index) => ({
      kind: "answer",
      question: node.text,
      answer: node.options[index].text,
      route: subjectState.current
    }))
  );
  subjectState.trail.push(
    ...draft.map((index) => ({
      question: node.text,
      answer: node.options[index].text,
      result: node.options[index].next
    }))
  );
  subjectState.pending.push(
    ...destinations.filter((destination) => destination.kind === "question").map((destination) => destination.route).reverse()
  );
  subjectState.draft = [];
  state.error = "";
  advanceSubject(subjectState);
  saveState();
  render();
}

function continueQuestion() {
  continueFromQuestion(currentSubjectState());
}

function goBack() {
  const subjectState = currentSubjectState();
  if (state.screen === "subject-summary") {
    if (restorePrevious(subjectState)) {
      state.screen = "subject";
      subjectState.complete = false;
    } else {
      state.screen = "home";
    }
  } else if (!restorePrevious(subjectState)) {
    state.screen = "home";
  }
  state.error = "";
  saveState();
  render();
}

function nextSubject() {
  cancelTransition();
  const nextIndex = subjectDefinitions.findIndex((subject, index) => index > state.subjectIndex && !state.subjects[subject.id]?.complete);
  if (nextIndex >= 0) {
    state.subjectIndex = nextIndex;
    state.screen = "subject";
    initializeSubject(currentSubject());
  } else if (progressCount() < subjectDefinitions.length) {
    state.subjectIndex = subjectDefinitions.findIndex((subject) => !state.subjects[subject.id]?.complete);
    state.screen = "subject";
    initializeSubject(currentSubject());
  } else {
    state.screen = "results";
  }
  state.error = "";
  saveState();
  render();
}

function scheduleAutoTransition() {
  if (transitionTimer) return;
  transitionTimer = window.setTimeout(() => {
    transitionTimer = null;
    nextSubject();
  }, 1100);
}

function renderHeader(eyebrow, title, copy = "") {
  return `<div class="eyebrow">${escapeHtml(eyebrow)}</div><h1>${escapeHtml(title)}</h1>${copy ? `<p class="lede">${escapeHtml(copy)}</p>` : ""}`;
}

function renderHome() {
  const completed = progressCount();
  return `<section class="page-shell home-page">
    <div class="hero-grid">
      <div class="hero-copy">
        <div class="eyebrow">A political values map</div>
        <h1>Politics is a <em>combination</em>, not a coordinate.</h1>
        <p class="lede">IdeoValues follows your choices through a living decision tree. Choose the routes that genuinely fit, explore their consequences, and leave with a profile made from your own combination of values.</p>
        <div class="hero-actions"><button class="primary-button" data-action="start">${completed ? "Continue assessment" : "Start assessment"}<span>→</span></button><span class="microcopy">4 independent subjects · up to 3 routes at each branch</span></div>
      </div>
      <div class="hero-diagram" aria-label="Illustration of a branching decision tree">
        <div class="diagram-label">YOUR PATH</div><div class="diagram-root"></div>
        <div class="diagram-branch branch-a"><span>material life</span></div><div class="diagram-branch branch-b"><span>power</span></div><div class="diagram-branch branch-c"><span>culture</span></div>
        <div class="diagram-node node-a">01</div><div class="diagram-node node-b">02</div><div class="diagram-node node-c">03</div>
        <div class="diagram-caption">no single axis<br><strong>more than one answer can be true</strong></div>
      </div>
    </div>
    <div class="section-heading"><div><div class="eyebrow">The four lenses</div><h2>Build your profile one subject at a time.</h2></div><span class="progress-pill">${completed}/4 complete</span></div>
    <div class="subject-grid">${subjectDefinitions.map(renderSubjectCard).join("")}</div>
  </section>`;
}

function renderSubjectCard(subject) {
  const subjectState = state.subjects[subject.id];
  const complete = subjectState?.complete;
  const positions = subjectState?.selectedPositions || [];
  return `<button class="subject-card ${subject.color} ${complete ? "is-complete" : ""}" data-action="subject" data-subject-id="${subject.id}">
    <span class="card-number">0${subjectDefinitions.indexOf(subject) + 1}</span><span class="card-status">${complete ? "Complete" : "Explore →"}</span>
    <span class="card-kicker">${escapeHtml(subject.kicker)}</span><strong>${escapeHtml(subject.title)}</strong><span class="card-copy">${escapeHtml(subject.description)}</span>
    ${positions.length ? `<span class="card-result">${positions.slice(0, 2).map((id) => escapeHtml(positionName(id))).join(" · ")}${positions.length > 2 ? ` +${positions.length - 2}` : ""}</span>` : ""}
  </button>`;
}

function renderSubjectProgress(subject) {
  return `<div class="subject-progress">${subjectDefinitions.map((item, index) => `<span class="progress-step ${index === state.subjectIndex ? "active" : ""} ${state.subjects[item.id]?.complete ? "done" : ""}"><i>0${index + 1}</i>${escapeHtml(item.title)}</span>`).join("")}</div>`;
}

function renderQuestion(subjectState) {
  const node = getNode(subjectState.current);
  const draft = selectedIndexes(subjectState);
  const limit = Math.min(selectionLimitFor(subjectState.current), node.options.length);
  const branchCount = subjectState.pending.length + 1;
  const questionHelp = limit === 1
    ? "Choose the answer that best fits you. This route will continue into its next question."
    : "You can select multiple answers when they genuinely belong together. The tree will follow each selected route independently.";
  return `<div class="question-card">
    <div class="question-meta"><span>Route ${branchCount}</span><span>${limit === 1 ? "Choose one answer" : `Choose up to ${limit}`}</span></div>
    <h2>${escapeHtml(node.text)}</h2><p class="question-help">${questionHelp}</p>
    <div class="option-list">${node.options.map((option, index) => `<label class="option ${draft.includes(index) ? "selected" : ""}"><input type="checkbox" data-option-index="${index}" ${draft.includes(index) ? "checked" : ""}/><span class="option-check">${draft.includes(index) ? "✓" : ""}</span><span>${escapeHtml(option.text)}</span></label>`).join("")}</div>
  </div>`;
}

function renderQuiz() {
  const subject = currentSubject();
  const subjectState = currentSubjectState();
  return `<section class="page-shell quiz-page ${subject.color}">
    ${renderSubjectProgress()}
    <div class="quiz-heading"><div><div class="eyebrow">${escapeHtml(subject.kicker)}</div><h1>${escapeHtml(subject.title)}</h1><p class="lede">${escapeHtml(subject.description)}</p></div><div class="route-counter"><strong>${subjectState.pending.length + (subjectState.current ? 1 : 0)}</strong><span>routes open</span></div></div>
    ${renderQuestion(subjectState)}
    ${state.error ? `<div class="error-message" role="alert">${escapeHtml(state.error)}</div>` : ""}
    <div class="quiz-actions"><button class="text-button" data-action="back">← Back</button><button class="primary-button" data-action="continue">Continue<span>→</span></button></div>
  </section>`;
}

function renderSummary() {
  const subject = subjectById(state.summarySubjectId) || currentSubject();
  const subjectState = state.subjects[subject.id];
  const positions = subjectState.selectedPositions || [];
  const allDone = progressCount() === subjectDefinitions.length;
  return `<section class="page-shell summary-page ${subject.color}">
    <div class="summary-top"><div>${renderHeader("Subject profile", `${subject.title} is a combination`, subject.description)}</div><span class="complete-stamp">Complete ✓</span></div>
    <div class="summary-layout"><div class="profile-panel"><div class="panel-label">Selected positions</div><div class="position-list">${positions.length ? positions.map((id) => `<div class="position-chip"><span class="chip-dot"></span>${escapeHtml(positionName(id))}</div>`).join("") : `<p class="muted">No terminal position was reached.</p>`}</div><p class="panel-note">These positions are the leaves reached by your selected routes. Other subjects remain independent and may pull your overall profile in a different direction.</p></div>
      <div class="flow-panel"><div class="panel-label">Your route through the tree</div><div class="flow-track">${(subjectState.trail || []).length ? subjectState.trail.map((step, index) => `<div class="flow-item"><span class="flow-index">${String(index + 1).padStart(2, "0")}</span><span>${escapeHtml(step.answer)}</span></div>`).join("") : `<p class="muted">Your route will appear here.</p>`}</div></div></div>
    <div class="quiz-actions"><button class="text-button" data-action="back">← Review</button><button class="primary-button" data-action="next-subject">${allDone ? "See full profile" : "Next subject"}<span>→</span></button></div>
  </section>`;
}

function renderTransition() {
  const subject = subjectById(state.summarySubjectId) || currentSubject();
  const subjectState = state.subjects[subject.id];
  const positions = subjectState?.selectedPositions || [];
  return `<section class="page-shell transition-page ${subject.color}">
    <div class="transition-mark">✓</div>
    <div class="eyebrow">${escapeHtml(subject.title)} complete</div>
    <h1>Keep following the tree.</h1>
    <p class="lede">We’ve recorded ${positions.length ? positions.map((id) => positionName(id)).join(", ") : "your route"}. The next independent subject starts automatically.</p>
    <div class="transition-actions"><button class="primary-button" data-action="next-subject">Continue now <span>→</span></button><button class="text-button" data-action="home">Pause and return home</button></div>
  </section>`;
}

function renderResults() {
  const completedSubjects = subjectDefinitions.filter((subject) => state.subjects[subject.id]?.complete);
  const positions = completedSubjects.flatMap((subject) => (state.subjects[subject.id].selectedPositions || []).map((id) => ({ id, subject })));
  const headline = positions.length ? positions.slice(0, 3).map(({ id }) => positionName(id)).join(" · ") : "A profile waiting to be explored";
  return `<section class="page-shell results-page">
    <div class="results-hero"><div class="eyebrow">Your IdeoValues profile</div><h1>${escapeHtml(headline)}</h1><p class="lede">This is a composition of routes, not a score on a political axis. The most meaningful part of the result is the way your answers combine across independent subjects.</p><button class="primary-button" data-action="start">${completedSubjects.length === 4 ? "Revisit assessment" : "Continue assessment"}<span>→</span></button></div>
    <div class="results-grid">${subjectDefinitions.map((subject) => { const subjectState = state.subjects[subject.id]; const subjectPositions = subjectState?.selectedPositions || []; return `<article class="result-subject ${subject.color}"><div class="result-subject-head"><span class="card-kicker">${escapeHtml(subject.kicker)}</span><strong>${escapeHtml(subject.title)}</strong><button class="small-button" data-action="subject" data-subject-id="${subject.id}">${subjectState?.complete ? "Edit" : "Start"}</button></div><div class="result-positions">${subjectPositions.length ? subjectPositions.map((id) => `<span>${escapeHtml(positionName(id))}</span>`).join("") : `<span class="muted">Not explored yet</span>`}</div><div class="result-flow">${subjectState?.trail?.slice(-3).map((step) => `<span>${escapeHtml(step.result ? labelFor(step.result) : step.answer)}</span>`).join("<b>→</b>") || ""}</div></article>`; }).join("")}</div>
    <div class="disclaimer"><span class="disclaimer-mark">i</span><p>IdeoValues is a reflective tool, not a scientific diagnosis. Political traditions overlap, evolve, and contain internal disagreements. Your result is intentionally plural.</p></div>
  </section>`;
}

function render() {
  if (state.screen === "home") app.innerHTML = renderHome();
  else if (state.screen === "subject") app.innerHTML = renderQuiz();
  else if (state.screen === "subject-summary") app.innerHTML = renderSummary();
  else if (state.screen === "subject-transition") {
    app.innerHTML = renderTransition();
    scheduleAutoTransition();
  }
  else app.innerHTML = renderResults();
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (action === "home") setScreen("home");
  if (action === "start") startAssessment();
  if (action === "reset") reset();
  if (action === "results") setScreen("results");
  if (action === "continue") continueQuestion();
  if (action === "back") goBack();
  if (action === "next-subject") nextSubject();
  if (action === "subject") startSubject(target.dataset.subjectId);
});

app.addEventListener("change", (event) => {
  if (event.target.matches("[data-option-index]")) toggleDraft(Number(event.target.dataset.optionIndex));
});

render();
