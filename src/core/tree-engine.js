import { incompatibleOptionPairs, incompatiblePairs, labelFor, selectionLimits, sourceTrees } from "../data/trees.js";

const pairKey = (left, right) => [left, right].sort().join("::");

const blockedPairs = Object.fromEntries(
  Object.entries(incompatiblePairs).map(([subjectId, pairs]) => [
    subjectId,
    new Set(pairs.map(([left, right]) => pairKey(left, right)))
  ])
);

const blockedOptionPairs = Object.fromEntries(
  Object.entries(incompatibleOptionPairs).map(([routeId, pairs]) => [
    routeId,
    new Set(pairs.map(([left, right]) => [left, right].sort((a, b) => a - b).join("::")))
  ])
);

export function makeSubjectState(subject) {
  return {
    subjectId: subject.id,
    initialized: false,
    pending: [],
    current: null,
    selectedPositions: [],
    selectedChoices: [],
    trail: [],
    history: [],
    complete: false
  };
}

export function getNode(route) {
  return sourceTrees[route.tree]?.find((node) => node.id === route.node) || null;
}

export function getRootNode(root) {
  return getNode({ tree: root.tree, node: root.node });
}

export function isQuestion(route) {
  return Boolean(getNode(route)?.options?.length);
}

export function selectionLimitFor(route) {
  if (!route) return 1;
  return selectionLimits[`${route.tree}:${route.node}`] || 1;
}

export function optionConflictFor(route, indexes) {
  const pairs = blockedOptionPairs[`${route.tree}:${route.node}`] || new Set();
  for (let left = 0; left < indexes.length; left += 1) {
    for (let right = left + 1; right < indexes.length; right += 1) {
      const key = [indexes[left], indexes[right]].sort((a, b) => a - b).join("::");
      if (pairs.has(key)) return [indexes[left], indexes[right]];
    }
  }
  return null;
}

export function destinationFor(route, option) {
  const node = getNode(route);
  if (!node || !option?.next) return null;
  const nextRoute = { tree: route.tree, node: option.next };
  return isQuestion(nextRoute)
    ? { kind: "question", route: nextRoute }
    : { kind: "result", id: option.next };
}

export function terminalCandidates(route, seen = new Set()) {
  const identity = `${route.tree}:${route.node}`;
  if (seen.has(identity)) return [];
  seen.add(identity);

  const node = getNode(route);
  if (!node) return [];
  if (!node.options?.length) return [node.id];

  return node.options.flatMap((option) => {
    const destination = destinationFor(route, option);
    if (!destination) return [];
    return destination.kind === "result"
      ? [destination.id]
      : terminalCandidates(destination.route, new Set(seen));
  });
}

export function conflictFor(subjectId, candidate, positions) {
  const pairs = blockedPairs[subjectId] || new Set();
  return positions.find((position) => pairs.has(pairKey(candidate, position))) || null;
}

export function canAddResult(subjectId, candidate, positions) {
  return !conflictFor(subjectId, candidate, positions);
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

/**
 * Checks whether every selected branch still has at least one compatible
 * terminal leaf. This lets the guardrail work from the first substantive
 * question, before a route has reached its final ideology.
 */
export function compatibleRouteGroups(subjectId, groups, positions = []) {
  return Boolean(combinations(groups.filter((group) => group.length), 0, positions, subjectId));
}

export function routeLabel(route) {
  return getNode(route)?.text || route.node;
}

export function positionName(id) {
  return labelFor(id);
}

export function cloneState(state) {
  return structuredClone(state);
}

export function pushHistory(state) {
  const snapshot = cloneState(state);
  snapshot.history = [];
  state.history.push(snapshot);
}

export function restorePrevious(state) {
  const previous = state.history.pop();
  if (!previous) return false;
  const history = state.history;
  Object.assign(state, previous, { history });
  return true;
}
