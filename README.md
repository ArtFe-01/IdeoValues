# IdeoValues

IdeoValues is a flowchart-based political values assessment. It treats a result as a combination of positions reached through independent decision trees rather than as a score on a small number of axes.

## Structure

- `src/data/trees.js` contains the normalized NeoValues question trees, subject definitions, display labels, plural-selection policies, and subject-local incompatibility rules.
- `src/data/ideosorter-tree.js` contains the exact Ideosorter question/answer route with explicit question-versus-result targets.
- `src/core/tree-engine.js` contains the indexed DFS traversal, terminal memoization, draft validation, and compatibility functions.
- `src/app.js` is the UI/state layer. It opens directly on substantive questions, uses radio/checkbox controls according to each policy, persists only valid state, and reveals the read-only combined profile after the linear assessment completes.
- `styles.css` contains the visual system for the flowchart-style interface.

The four subjects are independent:

1. Socioeconomics — economics and resource management
2. Geopolitics — foreign policy and nation/identity
3. Statecraft — authority and government structure
4. Culture — cultural direction and social change

Traversal is depth-first: when several routes are selected, the last queued sibling waits while the active branch is followed to a terminal position. Each subject opens directly on its first substantive root question, then traverses its remaining root trees automatically. Questions are single-answer by default; explicit `selectionPolicies` control the nodes that allow plural answers and document direct contradictions. Compatibility is evaluated immediately while drafting an answer, from all reachable terminal positions, and again when the answer is committed.

After a subject is complete, the app automatically advances to the next unfinished subject. The final profile is assembled only after all four subjects have been traversed.

## Run locally

Because the app uses ES modules, serve the project from a local static server. For example:

```sh
npx serve .
```

Then open the local URL in a browser.

Run the syntax check with:

```sh
npm run check
```

## Source attribution

The question and answer wording in `src/data/trees.js` is adapted from the supplied NeoValues `questions_tree.json` source. The flowchart interaction pattern is informed by the supplied Ideosorter project. The source projects should remain credited under their respective licenses when their material is redistributed.
