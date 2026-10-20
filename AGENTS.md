## Cross-Team API Ownership

### Responsibility Boundaries

- App (Frontend):
  - Owns UI, client-side state, tool execution, and user confirmation.
  - Integrates APIs using agreed request/response contracts.
  - Does not implement backend or proxy infrastructure.

- Proxy (Network):
  - Owns external LLM API communication, authentication forwarding,
    API key management, and provider integration.
  - Supports LLM tool calling and follow-up requests when required.
  - Does not implement business-domain APIs owned by Backend.

- Backend:
  - Owns business logic, database operations, place search,
    reservations, and domain-specific APIs.
  - Does not duplicate existing proxy functionality without
    explicit agreement.

### Required Checks Before Creating Issues

1. Identify the actual functionality being requested.
2. Determine the responsible layer: App, Proxy, or Backend.
3. Check whether an equivalent API or implementation already exists.
  - If existing implementations or ownership cannot be verified,
    explicitly report the uncertainty and ask for clarification.
    Never assume that an API does not exist merely because it
    cannot be found in the current repository.
4. Review previous agreements and existing API contracts.
5. If a feature spans multiple layers, create separate issues
   for each responsible team.
6. Do not assign an issue based solely on the fact that it
   involves an API.

### API Contract Requirements

- Define the endpoint, HTTP method, request schema, response schema,
  and error handling before implementation.
- Explicitly define whether model selection is configured by the
  proxy or supplied in each app request.
- Do not assume that choosing an LLM model means the app must
  include the model ID in every request.
- Keep published OpenAPI specifications consistent with actual
  production behavior.
- Report contract mismatches without assuming which layer is
  responsible until the cause is verified.

### Cross-Team Communication

- When an issue is assigned to the wrong team, clarify ownership
  before implementation.
- When an issue is resolved through direct communication,
  update the original issue or shared channel.
- Notify affected teams when an API contract or implementation
  responsibility changes.
- Do not create duplicate implementations to resolve an ownership
  misunderstanding.

### Required Decision Before Creating Cross-Team Issues

State:

1. Responsible team: App / Proxy / Backend.
2. Existing implementation or API.
3. Required changes.
4. Explicitly excluded responsibilities.
5. Dependencies on other teams.

# V2 Migration Rules

## Ownership

### Ownership Uncertainty

- Before creating a cross-team issue, identify the responsible
  layer and explain the reasoning.
- If ownership is uncertain, do not create or assign the issue.
- Instead, present the ambiguity to the user and request
  confirmation.
- Never infer ownership solely from endpoint names or repository
  location.
- Creating a cross-team issue requires explicit user approval
  after reviewing the proposed scope and responsible team.

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
- Do not duplicate version-agnostic logic solely to avoid a V1 import. Move reusable contracts,
  pure utilities, types, and native interfaces into an approved shared migration boundary.
- `shared` is not a dumping ground. Code may move to a shared boundary only when it is
  version-agnostic and has at least one concrete cross-version or infrastructure-level reason
  to exist there.

## Language
- 사용자에게 제공하는 모든 설명과 응답은 한국어로 작성한다.
- 명령 실행 이유(Reason)도 한국어로 작성한다.
- 코드, 명령어, 식별자 등은 필요한 경우 영어를 유지한다.

