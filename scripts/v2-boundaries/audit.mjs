import { inspect } from './rules.mjs';
import { filesUnder, isTest, findCycles } from './graph.mjs';

const root = process.cwd();
const r = inspect(root);
const features = [...new Set(filesUnder(root, 'src/v2/features').map((file) => file.split('/')[3]))].sort();
const counts = features.map((feature) => {
  const files = filesUnder(root, `src/v2/features/${feature}`);
  return { feature, files: files.length, productionSource: files.filter((file) => r.nodes.has(file) && !isTest(file)).length,
    testSource: files.filter((file) => r.nodes.has(file) && isTest(file)).length };
});
const scope = (file) => file?.startsWith('src/v2/') || file?.startsWith('src/application/');
const productionEdges = r.edges.filter((edge) => !edge.test && scope(edge.source));
const countRules = (test) => r.violations.filter((v) => v.test === test).reduce((result, v) => {
  result[v.rule] = (result[v.rule] ?? 0) + 1; return result;
}, {});
const reachable = new Set(['index.ts']);
const pending = ['index.ts'];
while (pending.length) {
  const source = pending.pop();
  for (const edge of r.edges.filter((item) => item.source === source && !item.test && item.target)) {
    if (!reachable.has(edge.target)) { reachable.add(edge.target); pending.push(edge.target); }
  }
}
console.log(JSON.stringify({ reachableFromProductionEntry: [...reachable].sort(), featureCount: features.length, features: counts,
  scopeProductionFiles: [...r.nodes.keys()].filter((file) => scope(file) && !isTest(file)).length,
  productionImportOccurrences: productionEdges.length,
  resolvedLocalImportOccurrences: productionEdges.filter((edge) => edge.target).length,
  productionRules: countRules(false), testRules: countRules(true),
  cyclesIncludingTypes: r.cycles,
  cyclesExcludingTypes: findCycles(r.production, r.edges.filter((edge) => !edge.test && !edge.typeOnly)),
  // Full directed graph is available for reproducible inspection, never used to update exceptions.
  edges: productionEdges,
}, null, 2));
