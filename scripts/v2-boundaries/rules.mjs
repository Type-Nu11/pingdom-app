import { buildGraph, findCycles, isTest } from './graph.mjs';

const v2 = (file) => file?.startsWith('src/v2/');
const application = (file) => file?.startsWith('src/application/');
const owner = (file) => file?.match(/^src\/v2\/(features|modules)\/([^/]+)/)?.[0];
const internal = /\/(?:screens|hooks|api|model|services|store|styles|components)\//;
const publicIndex = (file) => file?.endsWith('/index.ts') && !internal.test(file);
const api = (file) => /\/api(?:\/|\.[^.]+$)/.test(file ?? '');
export const violationKey = ({ source, target, specifier, rule, typeOnly = false, test = false }) =>
  JSON.stringify([source, target, specifier, rule, typeOnly, test]);
export function inspect(root) {
  const graph = buildGraph(root);
  const violations = [];
  const add = (edge, rule, suggestion) => violations.push({ ...edge, rule, suggestion });
  for (const edge of graph.edges) {
    const { source, target, specifier, test } = edge;
    if (!v2(source) && !application(source)) continue;
    if (specifier === null) { add(edge, 'nonliteral-import', 'Use a literal module path so the dependency can be checked.'); continue; }
    if (target && !graph.nodes.has(target) && /\.[cm]?[jt]sx?$/.test(target)) add(edge, 'unresolved-import', 'Use an existing source file.');
    if (target && !graph.nodes.has(target) && !/\.[a-z0-9]+$/i.test(target)) add(edge, 'unresolved-import', 'Use an existing source file or public index.ts.');
    if (v2(source) && target?.startsWith('src/') && !v2(target) && !target.startsWith('src/assets/v2/')) {
      add(edge, 'v2-no-legacy', 'Inject shared runtime infrastructure at src/application.');
    }
    if (v2(source) && specifier.startsWith('.') && target && !v2(target) && !target.startsWith('src/assets/v2/')) {
      add(edge, 'v2-no-escape', 'Keep dependencies inside V2; inject runtime dependencies.');
    }
    if (source.startsWith('src/v2/shared/') && owner(target)) add(edge, 'shared-no-domain', 'Compose domain resources in src/v2/app.');
    if (!(test && target?.startsWith('src/v2/app/testing/'))
      && (source.startsWith('src/v2/shared/') || owner(source)) && (target?.startsWith('src/v2/app/') || application(target))) {
      add(edge, 'no-upward-composition', 'Move the shared contract below app and inject it.');
    }
    if (owner(target) && owner(source) !== owner(target) && !publicIndex(target)) {
      add(edge, 'domain-public-api', `Import ${owner(target)}/index.ts or a subfeature public index.ts.`);
    }
    if (edge.exportAll && owner(source) && publicIndex(source)) add(edge, 'public-no-export-star', 'Explicitly export only the supported public API.');
    if ((/\/screens\//.test(source) || /Screen\.[jt]sx?$/.test(source)) && api(target)) add(edge, 'screen-no-api', 'Access APIs through domain hooks.');
    // Shared API exports include transport and contracts. Ban the whole surface in hooks,
    // including type-only imports: domain API/model owns transport-facing contracts.
    if (owner(source) && (/\/hooks\//.test(source) || /\/use[A-Z][^/]*\.[jt]sx?$/.test(source)) && target?.startsWith('src/v2/shared/api/')) {
      add(edge, 'hook-no-shared-api', 'Access shared API through domain API/model modules.');
    }
    if (v2(source) && specifier === 'axios' && !source.startsWith('src/v2/shared/api/')) add(edge, 'axios-shared-only', 'Import transport only in shared/api.');
    if (!test && target && isTest(target)) add(edge, 'production-no-test', 'Production must not import test or test-support code.');
    if (application(source) && target?.startsWith('src/') && !v2(target) && !application(target)) {
      add(edge, 'application-bridge', 'Existing runtime/route bridges must be listed exactly with removal issue #362.');
    }
  }
  for (const [source, parsed] of graph.nodes) {
    if (!v2(source) && !application(source)) continue;
    for (const diagnostic of parsed.diagnostics) add({ source, target: null, specifier: '<syntax>', test: isTest(source), line: 1 }, 'parse-error', String(diagnostic.messageText));
    if (!v2(source)) continue;
    for (const item of parsed.syntax) {
      if (item.rule === 'central-env' && source === 'src/v2/shared/config/env.ts') continue;
      add({ source, target: null, specifier: '<syntax>', typeOnly: false, test: isTest(source), line: item.line }, item.rule,
        item.rule === 'central-env' ? 'Read shared/config/env.ts.' : 'Use styled-components in V2.');
    }
  }
  // Audit every production source, not only today's route-reachable subset. Expand
  // through composition bridges so a cycle through legacy infrastructure is visible.
  const production = new Set([...graph.nodes.keys()].filter((file) => !isTest(file) && (v2(file) || application(file))));
  const adjacency = new Map();
  for (const edge of graph.edges) {
    if (!edge.test && edge.target && !isTest(edge.target) && graph.nodes.has(edge.target)) {
      if (!adjacency.has(edge.source)) adjacency.set(edge.source, []);
      adjacency.get(edge.source).push(edge.target);
    }
  }
  const pending = [...production];
  while (pending.length) for (const target of adjacency.get(pending.pop()) ?? []) if (!production.has(target)) { production.add(target); pending.push(target); }
  const cycles = findCycles(production, graph.edges.filter((edge) => !edge.test));
  for (const members of cycles) {
    const set = new Set(members);
    const cycleEdges = graph.edges.filter((edge) => !edge.test && set.has(edge.source) && set.has(edge.target));
    // One exception per exact edge of the SCC. Adding any edge or member fails.
    for (const edge of cycleEdges) add(edge, 'production-cycle', `Break the cycle; SCC members: ${members.join(', ')}. All directed SCC edges are reported.`);
  }
  return { ...graph, production, cycles, violations };
}
export function applyExceptions(violations, exceptions) {
  const remaining = [], used = new Map(), definitions = new Map();
  for (const exception of exceptions) {
    const key = violationKey(exception);
    if (definitions.has(key) || !exception.reason || !/^#(?:358|359|360|361|362)$/.test(exception.issue)
      || !Number.isInteger(exception.maxCount) || exception.maxCount < 1
      || !exception.source || !exception.target || /[*?]/.test(exception.source + exception.target)) {
      throw new Error(`Invalid/duplicate boundary exception: ${key}`);
    }
    definitions.set(key, exception);
  }
  for (const violation of violations) {
    const key = violationKey(violation), definition = definitions.get(key);
    const count = (used.get(key) ?? 0) + 1;
    used.set(key, count);
    if (!definition || count > definition.maxCount) remaining.push(violation);
  }
  // Deletions are safe, but require removing stale exceptions in the same change.
  const stale = exceptions.filter((exception) => (used.get(violationKey(exception)) ?? 0) < exception.maxCount);
  return { remaining, stale, allowed: violations.length - remaining.length };
}
