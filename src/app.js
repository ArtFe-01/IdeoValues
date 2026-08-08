import {
  getNode,
  isMultipleChoice,
  isQuestion,
  makeSubjectState,
  positionName,
  policyFor,
  pushHistory,
  restorePrevious,
  selectionLimitFor,
  validateDraft
} from "./core/tree-engine.js";
import { subjectDefinitions } from "./data/trees.js";

const STORAGE_KEY = "ideovalues-state-v4-audited";
const SCHEMA_VERSION = 4;
const STORAGE_PREFIX = "ideovalues-state-";
const app = document.querySelector("#app");
const profileAction = document.querySelector("#profile-action");

const freshState = () => ({
  schemaVersion: SCHEMA_VERSION,
  screen: "home",
  subjectIndex: 0,
  subjects: Object.fromEntries(subjectDefinitions.map((subject) => [subject.id, makeSubjectState(subject)])),
  error: ""
});

let storageAvailable = true;
let state = loadState();

function isValidState(candidate) {
  return Boolean(
    candidate &&
    candidate.schemaVersion === SCHEMA_VERSION &&
    ["home", "subject", "results"].includes(candidate.screen) &&
    Number.isInteger(candidate.subjectIndex) &&
    candidate.subjectIndex >= 0 &&
    candidate.subjectIndex < subjectDefinitions.length &&
    candidate.subjects &&
    subjectDefinitions.every((subject) => {
      const subjectState = candidate.subjects[subject.id];
      return subjectState &&
        Array.isArray(subjectState.pending) &&
        Array.isArray(subjectState.history) &&
        Array.isArray(subjectState.selectedPositions) &&
        Array.isArray(subjectState.trail);
    }) &&
    (candidate.screen !== "results" || subjectDefinitions.every((subject) => candidate.subjects[subject.id].complete)) &&
    (candidate.screen !== "subject" || isQuestion(candidate.subjects[subjectDefinitions[candidate.subjectIndex].id].current))
  );
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const candidate = JSON.parse(raw);
    if (isValidState(candidate)) return candidate;
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    storageAvailable = false;
  }
  return freshState();
}

function saveState() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    storageAvailable = false;
  }
}

function clearPersistedAttempts() {
  try {
    const keysToRemove = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(STORAGE_PREFIX)) keysToRemove.push(key);
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    storageAvailable = false;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

function persistenceNotice() {
  return storageAvailable ? "" : `<div class="storage-note" role="status">Progress will remain in this tab because browser storage is unavailable.</div>`;
}

function selectedIndexes(subjectState) {
  return subjectState.draft || [];
}

function initializeSubject(subject) {
  if (!subject) return;
  const subjectState = state.subjects[subject.id] || makeSubjectState(subject);
  state.subjects[subject.id] = subjectState;
  if (subjectState.initialized || subjectState.complete) return;

  subjectState.initialized = true;
  subjectState.pending = subject.roots.map((root) => ({
    tree: root.tree,
    node: root.node
  })).reverse();
  advanceSubject(subjectState);
}

function reset() {
  if (!window.confirm("Start over and clear this profile?")) return;
  clearPersistedAttempts();
  state = freshState();
  saveState();
  render({ focus: "h1" });
}

function startAssessment() {
  const nextIndex = subjectDefinitions.findIndex((subject) => !state.subjects[subject.id]?.complete);
  if (nextIndex < 0) {
    state.screen = "results";
  } else {
    state.subjectIndex = nextIndex;
    state.screen = "subject";
    initializeSubject(currentSubject());
  }
  state.error = "";
  saveState();
  render({ focus: "h1" });
}

function goHome() {
  state.screen = "home";
  state.error = "";
  saveState();
  render({ focus: "h1" });
}

function showResults() {
  if (progressCount() !== subjectDefinitions.length) return;
  state.screen = "results";
  state.error = "";
  saveState();
  render({ focus: "h1" });
}

function errorForValidation(validation, node) {
  if (validation.code === "empty") return "Choose at least one answer to continue.";
  if (validation.code === "selection-limit") return `Choose up to ${validation.limit} answer${validation.limit === 1 ? "" : "s"}.`;
  if (validation.code === "option-conflict") {
    const [left, right] = validation.optionConflict;
    return `“${node.options[left].text}” and “${node.options[right].text}” are mutually exclusive.`;
  }
  if (validation.code === "position-conflict") {
    return `${positionName(validation.destination.id)} cannot be combined with ${positionName(validation.conflict)} in this subject.`;
  }
  if (validation.code === "route-conflict") {
    return "Those routes cannot be combined with the positions already selected in this subject.";
  }
  return "This route is unavailable. Please choose another answer.";
}

function validateCurrentDraft(subjectState, indexes) {
  return validateDraft(
    subjectState.subjectId,
    subjectState.current,
    indexes,
    subjectState.selectedPositions
  );
}

function toggleDraft(index) {
  const subjectState = currentSubjectState();
  const node = getNode(subjectState.current);
  if (!node) return;

  const multiple = isMultipleChoice(subjectState.current);
  const current = selectedIndexes(subjectState);
  const exists = current.includes(index);
  let next;

  if (!multiple) {
    if (exists) return;
    next = [index];
  } else if (exists) {
    next = current.filter((candidate) => candidate !== index);
  } else {
    next = [...current, index];
  }

  if (next.length) {
    const validation = validateCurrentDraft(subjectState, next);
    if (!validation.ok) {
      state.error = errorForValidation(validation, node);
      render({ focus: `[data-option-index="${index}"]` });
      return;
    }
  }

  subjectState.draft = next;
  state.error = "";
  saveState();
  render({ focus: `[data-option-index="${index}"]` });
}

function advanceSubject(subjectState) {
  while (subjectState.pending.length) {
    // LIFO traversal: complete the active branch before its siblings.
    const next = subjectState.pending.pop();
    if (isQuestion(next)) {
      subjectState.current = next;
      subjectState.draft = [];
      return;
    }
  }

  subjectState.current = null;
  subjectState.draft = [];
  subjectState.complete = true;

  const nextIndex = subjectDefinitions.findIndex(
    (subject, index) => index > state.subjectIndex && !state.subjects[subject.id]?.complete
  );
  const fallbackIndex = subjectDefinitions.findIndex((subject) => !state.subjects[subject.id]?.complete);

  if (nextIndex >= 0) {
    state.subjectIndex = nextIndex;
    state.screen = "subject";
    initializeSubject(currentSubject());
  } else if (fallbackIndex >= 0) {
    state.subjectIndex = fallbackIndex;
    state.screen = "subject";
    initializeSubject(currentSubject());
  } else {
    state.screen = "results";
  }
}

function continueQuestion() {
  const subjectState = currentSubjectState();
  const node = getNode(subjectState.current);
  const draft = selectedIndexes(subjectState);
  const validation = validateCurrentDraft(subjectState, draft);

  if (!validation.ok) {
    state.error = errorForValidation(validation, node || { options: [] });
    saveState();
    render({ focus: "#assessment-status" });
    return;
  }

  pushHistory(subjectState);
  const positions = [...subjectState.selectedPositions];
  subjectState.selectedPositions = positions;
  subjectState.trail.push(...draft.map((index) => ({
    question: node.text,
    answer: node.options[index].text,
    result: node.options[index].target.id,
    resultKind: node.options[index].target.kind
  })));

  for (const destination of validation.destinations) {
    if (destination.kind === "result") positions.push(destination.id);
  }

  subjectState.selectedPositions = positions;
  subjectState.pending.push(
    ...validation.destinations
      .filter((destination) => destination.kind === "question")
      .map((destination) => destination.route)
      .reverse()
  );
  subjectState.draft = [];
  state.error = "";
  advanceSubject(subjectState);
  saveState();
  render({ focus: "h1" });
}

function goBack() {
  const subjectState = currentSubjectState();
  if (restorePrevious(subjectState)) {
    state.screen = "subject";
    subjectState.complete = false;
  } else {
    state.screen = "home";
  }
  state.error = "";
  saveState();
  render({ focus: "h1" });
}

function renderHeader(eyebrow, title, copy = "") {
  return `<div class="eyebrow">${escapeHtml(eyebrow)}</div><h1 tabindex="-1">${escapeHtml(title)}</h1>${copy ? `<p class="lede">${escapeHtml(copy)}</p>` : ""}`;
}

function renderHome() {
  const completed = progressCount();
  return `<section class="page-shell home-page">
    ${persistenceNotice()}
    <div class="hero-grid">
      <div class="hero-copy">
        <div class="eyebrow">A political values map</div>
        <h1 tabindex="-1">Politics is a <em>combination</em>, not a coordinate.</h1>
        <p class="lede">IdeoValues follows your choices through a living decision tree. Choose the routes that genuinely fit, explore their consequences, and leave with a profile made from your own combination of values.</p>
        <div class="hero-actions"><button class="primary-button" data-action="start">${completed ? "Continue assessment" : "Start assessment"}<span>→</span></button><span class="microcopy">4 independent subjects · up to 3 compatible routes at a branch</span></div>
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
  return `<article class="subject-card ${subject.color} ${complete ? "is-complete" : ""}">
    <span class="card-number">0${subjectDefinitions.indexOf(subject) + 1}</span><span class="card-status">${complete ? "Complete" : "In sequence"}</span>
    <span class="card-kicker">${escapeHtml(subject.kicker)}</span><strong>${escapeHtml(subject.title)}</strong><span class="card-copy">${escapeHtml(subject.description)}</span>
    ${positions.length ? `<span class="card-result">${positions.slice(0, 2).map((id) => escapeHtml(positionName(id))).join(" · ")}${positions.length > 2 ? ` +${positions.length - 2}` : ""}</span>` : ""}
  </article>`;
}

function renderSubjectProgress() {
  return `<div class="subject-progress">${subjectDefinitions.map((item, index) => `<span class="progress-step ${index === state.subjectIndex ? "active" : ""} ${state.subjects[item.id]?.complete ? "done" : ""}"><i>${String(index + 1).padStart(2, "0")}</i>${escapeHtml(item.title)}</span>`).join("")}</div>`;
}

function renderQuestion(subjectState) {
  const node = getNode(subjectState.current);
  if (!node) return `<div class="question-card"><h2 tabindex="-1">This route is unavailable.</h2><p class="question-help">Your saved session was reset safely. Start the assessment again.</p></div>`;

  const draft = selectedIndexes(subjectState);
  const policy = policyFor(subjectState.current);
  const multiple = policy.mode === "multiple" && policy.maxSelections > 1;
  const limit = selectionLimitFor(subjectState.current);
  const inputType = multiple ? "checkbox" : "radio";
  const questionHelp = multiple
    ? "Select any answers that genuinely belong together. Incompatible combinations are stopped immediately."
    : "Choose the answer that best fits you. This route will continue into its next question.";
  const inputName = `answer-${subjectState.current.tree}-${subjectState.current.node}`;

  return `<div class="question-card">
    <div class="question-meta"><span>Branches open: ${subjectState.pending.length + 1}</span><span>${multiple ? `Choose up to ${limit}` : "Choose one answer"}</span></div>
    <h2 tabindex="-1">${escapeHtml(node.text)}</h2><p class="question-help">${questionHelp}</p>
    <div class="option-list" role="${multiple ? "group" : "radiogroup"}" aria-label="Answer choices">${node.options.map((option, index) => {
      const selected = draft.includes(index);
      return `<label class="option ${multiple ? "is-multiple" : "is-single"} ${selected ? "selected" : ""}" for="${inputName}-${index}"><input id="${inputName}-${index}" name="${inputName}" type="${inputType}" data-option-index="${index}" ${selected ? "checked" : ""} aria-checked="${selected}"/><span class="option-check" aria-hidden="true">${selected ? "✓" : ""}</span><span>${escapeHtml(option.text)}</span></label>`;
    }).join("")}</div>
  </div>`;
}

function renderStatus() {
  const message = state.error || "";
  return `<div id="assessment-status" class="${message ? "error-message" : "sr-only"}" role="${message ? "alert" : "status"}" aria-live="polite" tabindex="-1">${escapeHtml(message)}</div>`;
}

function renderQuiz() {
  const subject = currentSubject();
  const subjectState = currentSubjectState();
  return `<section class="page-shell quiz-page ${subject.color}">
    ${persistenceNotice()}
    ${renderSubjectProgress()}
    <div class="quiz-heading"><div><div class="eyebrow">${escapeHtml(subject.kicker)}</div><h1 tabindex="-1">${escapeHtml(subject.title)}</h1><p class="lede">${escapeHtml(subject.description)}</p></div><div class="route-counter"><strong>${subjectState.pending.length + (subjectState.current ? 1 : 0)}</strong><span>branches open</span></div></div>
    ${renderQuestion(subjectState)}
    ${renderStatus()}
    <div class="quiz-actions"><button class="text-button" data-action="back">← Back</button><button class="primary-button" data-action="continue">Continue<span>→</span></button></div>
  </section>`;
}

function renderResults() {
  const positions = subjectDefinitions.flatMap((subject) => (state.subjects[subject.id].selectedPositions || []).map((id) => ({ id, subject })));
  const headline = positions.length ? positions.slice(0, 3).map(({ id }) => positionName(id)).join(" · ") : "A profile waiting to be explored";
  return `<section class="page-shell results-page">
    <div class="results-hero"><div class="eyebrow">Your IdeoValues profile</div><h1 tabindex="-1">${escapeHtml(headline)}</h1><p class="lede">This is a composition of routes, not a score on a political axis. The most meaningful part of the result is the way your answers combine across independent subjects.</p><button class="primary-button" data-action="reset">Retake assessment<span>↻</span></button></div>
    <div class="results-grid">${subjectDefinitions.map((subject) => {
      const subjectState = state.subjects[subject.id];
      const subjectPositions = subjectState.selectedPositions || [];
      return `<article class="result-subject ${subject.color}"><div class="result-subject-head"><span class="card-kicker">${escapeHtml(subject.kicker)}</span><strong>${escapeHtml(subject.title)}</strong><span class="result-complete">Complete</span></div><div class="result-positions">${subjectPositions.map((id) => `<span>${escapeHtml(positionName(id))}</span>`).join("")}</div><div class="result-flow">${(subjectState.trail || []).slice(-3).map((step) => `<span>${escapeHtml(step.resultKind === "result" ? positionName(step.result) : step.answer)}</span>`).join("<b>→</b>")}</div></article>`;
    }).join("")}</div>
    <div class="disclaimer"><span class="disclaimer-mark">i</span><p>IdeoValues is a reflective tool, not a scientific diagnosis. Political traditions overlap, evolve, and contain internal disagreements. Your result is intentionally plural.</p></div>
  </section>`;
}

function updateProfileAction() {
  if (!profileAction) return;
  profileAction.hidden = progressCount() !== subjectDefinitions.length;
}

function render({ focus = "" } = {}) {
  if (state.screen === "subject") {
    const subjectState = currentSubjectState();
    if (!isQuestion(subjectState.current)) {
      state = freshState();
      saveState();
    }
  }

  if (state.screen === "home") app.innerHTML = renderHome();
  else if (state.screen === "subject") app.innerHTML = renderQuiz();
  else app.innerHTML = renderResults();
  updateProfileAction();

  if (focus) window.requestAnimationFrame(() => document.querySelector(focus)?.focus());
}

function handleAction(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (action === "home") goHome();
  if (action === "start") startAssessment();
  if (action === "reset") reset();
  if (action === "results") showResults();
  if (action === "continue") continueQuestion();
  if (action === "back") goBack();
}

document.addEventListener("click", handleAction);
app.addEventListener("change", (event) => {
  if (event.target.matches("[data-option-index]")) toggleDraft(Number(event.target.dataset.optionIndex));
});

render();
