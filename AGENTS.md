# V2 Migration Rules

## Ownership

- `src/v2/**` is the default home for every new feature, UI change, and refactor.
- `src/features/**` is V1 legacy code. Do not add new behavior there unless the issue explicitly
  requests a V1 compatibility fix or the V2 path cannot own the change yet.
- A V2 screen, feature, hook, model, API module, or style must never import V1 screens, hooks,
  stores, API clients, or styles. The only permitted cross-version boundary is application
  composition that injects shared runtime infrastructure into V2.
- Do not create a new V1 dependency while fixing an existing V1 dependency. Prefer moving the
  shared contract or native bridge into a V2/shared boundary, then migrate callers incrementally.

## Required Decision Before Editing

1. State the implementation location as `V2`, `shared migration boundary`, or `V1 exception`.
2. Inspect the V2 feature path before opening a V1 implementation as the primary solution.
3. If a V1 exception is necessary, report the reason, the affected V1 paths, and the issue that
   will remove the dependency. Keep that change to the smallest compatible surface.

## Completion Checks

- Run `npm run check:v2` for all V2 changes.
- V1 source additions or modifications require the `legacy-exception` PR label. Deleting V1 code
  does not require the label.
- Include the V1 dependency delta (`none`, `removed`, or `exception`) in the handoff.
