import {
  incompatiblePairs,
  labelFor,
  selectionPolicies,
  sourceTrees
} from "../data/trees.js";

const treeIndex = Object.fromEntries(
  Object.entries(sourceTrees).map(([treeId, nodes]) => [treeId, new Map(nodes.map((node) => [node.id, node]))])
);

const terminalMemo = new Map();
const pairKey = (left, right) => [left, right].sort().join("::");
const optionPairKey = (left, right) => [left, right].sort((a, b) => a - b).join("::");

const blockedPositionPairs = Object.fromEntries(
  Object.entries(incompatiblePairs).map(([subjectId, pairs]) => [
    subjectId,
    new Set(pairs.map(([left, right]) => pairKey(left, right)))
  ])
);

export function makeSubjectState(subject) {
  return {
    subjectId: subject.id,
    initialized: false,
    pending: [],
    current: null,
    draft: [],
    selectedPositions: [],
    trail: [],
    history: [],
    complete: false
  };
}

export function getNode(route) {
  if (!route?.tree || !route?.node) return null;
  return treeIndex[route.tree]?.get(route.node) || null;
}

export function isQuestion(route) {
  return Boolean(getNode(route)?.options?.length);
}

export function policyFor(route) {
  const key = route ? `${route.tree}:${route.node}` : "";
  const node = getNode(route);
  const configured = selectionPolicies[key] || { mode: "single", maxSelections: 1, incompatibleOptions: [] };
  const maxSelections = Math.max(1, Math.min(configured.maxSelections, node?.options?.length || 1));
  return { ...configured, maxSelections };
}

export function selectionLimitFor(route) {
  return policyFor(route).maxSelections;
}

export function isMultipleChoice(route) {
  return policyFor(route).mode === "multiple" && selectionLimitFor(route) > 1;
}

export function optionConflictFor(route, indexes) {
  const pairs = policyFor(route).incompatibleOptions || [];
  const blocked = new Set(pairs.map(([left, right]) => optionPairKey(left, right)));
  for (let left = 0; left < indexes.length; left += 1) {
    for (let right = left + 1; right < indexes.length; right += 1) {
      if (blocked.has(optionPairKey(indexes[left], indexes[right]))) {
        return [indexes[left], indexes[right]];
      }
    }
  }
  return null;
}

export function destinationFor(route, option) {
  if (!route || !option?.target?.id) return null;
  return option.target.kind === "question"
    ? { kind: "question", route: { tree: route.tree, node: option.target.id } }
    : { kind: "result", id: option.target.id };
}

export function terminalCandidates(route, ancestry = new Set()) {
  const key = `${route?.tree}:${route?.node}`;
  if (!route || ancestry.has(key)) return [];
  if (terminalMemo.has(key)) return terminalMemo.get(key);

  const node = getNode(route);
  if (!node) return [];
  if (!node.options?.length) {
    const terminal = [node.id];
    terminalMemo.set(key, terminal);
    return terminal;
  }

  const nextAncestry = new Set(ancestry).add(key);
  const candidates = node.options.flatMap((option) => {
    const destination = destinationFor(route, option);
    if (!destination) return [];
    return destination.kind === "result"
      ? [destination.id]
      : terminalCandidates(destination.route, nextAncestry);
  });
  const unique = [...new Set(candidates)];
  if (!ancestry.size) terminalMemo.set(key, unique);
  return unique;
}

export function conflictFor(subjectId, candidate, positions) {
  const pairs = blockedPositionPairs[subjectId] || new Set();
  return positions.find((position) => pairs.has(pairKey(candidate, position))) || null;
}

function combinations(groups, index, positions, subjectId) {
  if (index >= groups.length) return positions;
  for (const candidate of groups[index]) {
    if (!conflictFor(subjectId, candidate, positions)) {
      const result = combinations(groups, index + 1, [...positions, candidate], subjectId);
      if (result) return result;
    }
  }
  return null;
}

export function compatibleRouteGroups(subjectId, groups, positions = []) {
  if (groups.some((group) => !group.length)) return false;
  return Boolean(combinations(groups, 0, positions, subjectId));
}

export function validateDraft(subjectId, route, indexes, positions = []) {
  const node = getNode(route);
  const policy = policyFor(route);
  if (!node?.options?.length) return { ok: false, code: "missing-question" };
  if (!indexes.length) return { ok: false, code: "empty" };
  if (indexes.some((index) => !Number.isInteger(index) || !node.options[index])) {
    return { ok: false, code: "invalid-option" };
  }
  if (indexes.length > policy.maxSelections) return { ok: false, code: "selection-limit", limit: policy.maxSelections };

  const optionConflict = optionConflictFor(route, indexes);
  if (optionConflict) return { ok: false, code: "option-conflict", optionConflict };

  const destinations = indexes.map((index) => destinationFor(route, node.options[index]));
  if (destinations.some((destination) => !destination)) return { ok: false, code: "invalid-target" };
  const groups = destinations.map((destination) => destination.kind === "result"
    ? [destination.id]
    : terminalCandidates(destination.route));
  if (!compatibleRouteGroups(subjectId, groups, positions)) {
    return { ok: false, code: "route-conflict", groups };
  }

  for (const destination of destinations) {
    if (destination.kind === "result") {
      const conflict = conflictFor(subjectId, destination.id, positions);
      if (conflict) return { ok: false, code: "position-conflict", conflict, destination };
    }
  }
  return { ok: true, destinations };
}

export function positionName(id) {
  return labelFor(id);
}

export function routeLabel(route) {
  return getNode(route)?.text || route?.node || "Unknown route";
}

export function snapshotState(state) {
  const clone = typeof structuredClone === "function"
    ? structuredClone(state)
    : JSON.parse(JSON.stringify(state));
  delete clone.history;
  return clone;
}

export function pushHistory(state) {
  state.history.push(snapshotState(state));
}

export function restorePrevious(state) {
  const previous = state.history.pop();
  if (!previous) return false;
  const history = state.history;
  Object.assign(state, previous, { history });
  return true;
}
