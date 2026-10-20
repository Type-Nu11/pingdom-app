import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildGraph, findCycles, isTest } from './v2-boundaries/graph.mjs';

export const productionRoots = [
  'index.ts', 'App.tsx', 'src/application/ProductionApp.tsx',
  'src/application/ProductionProviders.tsx', 'src/application/navigation/RootNavigator.tsx',
  'src/application/runtime/configureProductionRuntime.ts',
];
export const removalCandidates = [
  'App.v1.tsx', 'src/app/navigation/RootNavigator.tsx', 'src/app/providers/AppProvider.tsx',
  'src/app/providers/queryClient.ts', 'src/app/navigation/RoutePlaceholderScreen.tsx',
];

function classify(file) {
  if (isTest(file)) return { category: 'D', owner: 'test support', reason: 'Must not be reachable from production.' };
  if (file === 'src/app/navigation/RoutePlaceholderScreen.tsx') return {
    category: 'C', owner: 'application navigation', removalIssues: ['#139'],
    reason: 'Merchant route and pingdom://merchants/:id remain registered; support-version/deep-link removal gate and device QA required.',
  };
  if (file.startsWith('src/') && !file.startsWith('src/v2/') && !file.startsWith('src/application/') && !file.startsWith('src/assets/v2/')) {
    const auth = file.startsWith('src/features/auth/') || file.startsWith('src/features/onboarding/') || file.endsWith('/AuthNavigator.tsx');
    const checkIn = file.startsWith('src/features/place/');
    const runtime = file.includes('/store/') || file.startsWith('src/shared/api/');
    return {
      category: 'B', owner: auth ? 'auth/onboarding bridge' : checkIn ? 'CheckIn bridge' : runtime ? 'session/transport runtime' : 'legacy bridge support',
      removalIssues: ['#124', '#139'],
      reason: auth ? 'No standalone V2 login/signup/first-run UI parity; retain existing authentication flow.'
        : checkIn ? 'Registered CheckIn route and places/:id/check-in deep link use the existing location check-in UI; no equivalent-route removal decision.'
          : runtime ? 'Preserve hydration, Keychain cache, refresh/replay and logout order until session parity and device QA.'
            : 'Transitive dependency of the explicitly retained auth, CheckIn or Merchant bridge; migrate/delete with that owner after parity and device QA.',
    };
  }
  return { category: 'A', owner: file.match(/^src\/v2\/modules\/([^/]+)/)?.[1] ?? 'composition/shared infrastructure',
    reason: 'V2 implementation or infrastructure supporting its public composition; import reachability does not imply device validation.' };
}

export function auditProductionGraph(root = process.cwd()) {
  const graph = buildGraph(root);
  const adjacent = new Map();
  for (const edge of graph.edges) {
    if (edge.target && !edge.test) {
      if (!adjacent.has(edge.source)) adjacent.set(edge.source, []);
      adjacent.get(edge.source).push(edge);
    }
  }
  function walk(roots, runtimeOnly = false) {
    const found = new Set(roots), pending = [...roots];
    while (pending.length) for (const edge of adjacent.get(pending.pop()) ?? []) {
      if (runtimeOnly && edge.typeOnly) continue;
      if (!found.has(edge.target)) { found.add(edge.target); pending.push(edge.target); }
    }
    return found;
  }
  const reachable = walk(['index.ts']);
  const runtimeReachable = walk(['index.ts'], true);
  const edges = graph.edges.filter(e => reachable.has(e.source) && e.target && !e.test);
  const dependencies = [...reachable].sort().map(file => ({
    path: file, ...classify(file), runtimeImportReachable: runtimeReachable.has(file),
  }));
  return {
    roots: productionRoots.map(file => ({ path: file, exists: graph.nodes.has(file), reachable: reachable.has(file) })),
    scope: 'Conservative static local import graph including type-only and lazy edges. Conditional/dev-only imports are retained; external packages are excluded. UI/deep-link reachability is documented separately.',
    dependencies,
    removalCandidates: removalCandidates.map(file => ({ path: file, category: 'C', exists: fs.existsSync(path.join(root, file)), reachable: reachable.has(file), removalIssue: '#139' })),
    productionScc: findCycles(new Set([...reachable].filter(file => graph.nodes.has(file))), edges),
    edges: edges.map(({ source, target, typeOnly }) => ({ source, target, typeOnly })),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = auditProductionGraph();
  if (process.argv.includes('--write')) {
    const output = 'docs/architecture/adr/0001-production-dependency-graph.json';
    const sections = Object.entries(result).map(([key, value]) => `  ${JSON.stringify(key)}: ${Array.isArray(value)
      ? '[\n' + value.map(item => '    ' + JSON.stringify(item)).join(',\n') + '\n  ]'
      : JSON.stringify(value)}`);
    fs.writeFileSync(output, '{\n' + sections.join(',\n') + '\n}\n');
    console.log(`${output}: ${result.dependencies.length} dependencies, ${result.edges.length} local edges, ${result.productionScc.length} production SCCs`);
  } else console.log(JSON.stringify(result, null, 2));
}
