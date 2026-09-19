import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { inspect, applyExceptions } from '../v2-boundaries/rules.mjs';

function fixture(t, files, paths = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'v2-boundaries-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const [file, content] of Object.entries({
    'tsconfig.json': JSON.stringify({ compilerOptions: { moduleResolution: 'bundler', module: 'esnext', baseUrl: '.', paths } }),
    ...files,
  })) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), content);
  }
  return inspect(root);
}
const allowed = [
  ['app to public module', 'src/v2/app/main.ts', '../modules/place', 'src/v2/modules/place/index.ts'],
  ['module to shared', 'src/v2/modules/place/core.ts', '../../shared/value', 'src/v2/shared/value.ts'],
  ['same module relative', 'src/v2/modules/place/map/a.ts', '../detail/screens/Detail', 'src/v2/modules/place/detail/screens/Detail.ts'],
  ['shared to shared', 'src/v2/shared/a.ts', './b', 'src/v2/shared/b.ts'],
  ['other module public type', 'src/v2/modules/user/a.ts', '../place', 'src/v2/modules/place/index.ts', 'import type { Value }'],
  ['subfeature public index', 'src/v2/app/a.ts', '../modules/place/search', 'src/v2/modules/place/search/index.ts'],
  ['test to app test provider', 'src/v2/shared/__tests__/a.test.ts', '../../app/testing/provider', 'src/v2/app/testing/provider.ts'],
  ['V2 assets', 'src/v2/shared/a.ts', '../../assets/v2/icon.svg', 'src/assets/v2/icon.svg'],
];
for (const [name, source, specifier, target, prefix = 'import { Value }'] of allowed) {
  test(`GREEN: ${name}`, (t) => {
    assert.deepEqual(fixture(t, { [source]: `${prefix} from '${specifier}';`, [target]: 'export interface Value {}' }).violations, []);
  });
}
const blocked = [
  ['shared to module', 'src/v2/shared/a.ts', '../modules/place', 'src/v2/modules/place/index.ts', 'shared-no-domain'],
  ['shared to feature', 'src/v2/shared/a.ts', '../features/map', 'src/v2/features/map/index.ts', 'shared-no-domain'],
  ['other module screen', 'src/v2/modules/user/a.ts', '../place/screens/Detail', 'src/v2/modules/place/screens/Detail.ts', 'domain-public-api'],
  ['app to module hook', 'src/v2/app/a.ts', '../modules/place/hooks/usePlace', 'src/v2/modules/place/hooks/usePlace.ts', 'domain-public-api'],
  ['internal index is not public', 'src/v2/app/a.ts', '../modules/place/hooks', 'src/v2/modules/place/hooks/index.ts', 'domain-public-api'],
  ['feature deep import', 'src/v2/features/map/a.ts', '../account/model/types', 'src/v2/features/account/model/types.ts', 'domain-public-api'],
  ['screen to API directory', 'src/v2/modules/place/screens/Detail.ts', '../api', 'src/v2/modules/place/api/index.ts', 'screen-no-api'],
  ['hook to shared client', 'src/v2/modules/place/hooks/usePlace.ts', '../../../shared/api/apiClient', 'src/v2/shared/api/apiClient.ts', 'hook-no-shared-api'],
  ['hook to shared API barrel', 'src/v2/features/map/hooks/useMap.ts', '../../../shared/api', 'src/v2/shared/api/index.ts', 'hook-no-shared-api'],
  ['relative escape', 'src/v2/shared/a.ts', '../../outside', 'src/outside.ts', 'v2-no-escape'],
  ['domain to app', 'src/v2/modules/place/a.ts', '../../app/types', 'src/v2/app/types.ts', 'no-upward-composition'],
  ['shared test still cannot import domain', 'src/v2/shared/__tests__/a.test.ts', '../../modules/place', 'src/v2/modules/place/index.ts', 'shared-no-domain'],
  ['production imports test', 'src/v2/app/a.ts', './testing/provider', 'src/v2/app/testing/provider.ts', 'production-no-test'],
  ['new application bridge', 'src/application/a.ts', '../features/auth', 'src/features/auth/index.ts', 'application-bridge'],
];
for (const category of ['hooks', 'store', 'api', 'screens', 'styles']) blocked.push([
  `V1 ${category}`, 'src/v2/modules/place/a.ts', `../../../features/auth/${category}/value`, `src/features/auth/${category}/value.ts`, 'v2-no-legacy',
]);
for (const [name, source, specifier, target, rule] of blocked) {
  test(`RED: ${name}`, (t) => {
    const violations = fixture(t, { [source]: `import { Value } from '${specifier}';`, [target]: 'export const Value = 1;' }).violations;
    assert.ok(violations.some((v) => v.source === source && v.specifier === specifier && v.rule === rule && v.suggestion));
  });
}
const forms = [
  "import { Value } from '../modules/place/screens/Detail';",
  "export { Value } from '../modules/place/screens/Detail';",
  "export * from '../modules/place/screens/Detail';",
  "import '../modules/place/screens/Detail';",
  "const load = () => import('../modules/place/screens/Detail');",
  "const load = require('../modules/place/screens/Detail');",
  "import {\n Value\n} from\n '../modules/place/screens/Detail';",
  "import type { Value } from '../modules/place/screens/Detail';",
  "import { type Value } from '../modules/place/screens/Detail';",
  "export type { Value } from '../modules/place/screens/Detail';",
  "type Value = import('../modules/place/screens/Detail').Value;",
  "import Detail = require('../modules/place/screens/Detail');",
  'const Detail = import(`../modules/place/screens/Detail`);',
];
forms.forEach((source, i) => test(`RED: AST import syntax ${i + 1}`, (t) => {
  assert.ok(fixture(t, { 'src/v2/app/a.ts': source, 'src/v2/modules/place/screens/Detail.ts': 'export interface Value {}' })
    .violations.some((v) => v.rule === 'domain-public-api'));
}));
test('GREEN: comments, template text and strings are not dependencies', (t) => {
  assert.deepEqual(fixture(t, { 'src/v2/app/a.ts': `
    // import '../modules/place/screens/Detail';
    /* export * from '../../features/auth'; */
    const text = "require('../../features/auth') StyleSheet process.env";
    const template = \`import('../modules/place/screens/Detail')\`;
  ` }).violations, []);
});
test('RED: computed imports fail closed', (t) => {
  const report = fixture(t, { 'src/v2/app/a.ts': 'const a = import(prefix + name); const b = require(name);' });
  assert.equal(report.violations.filter((v) => v.rule === 'nonliteral-import').length, 2);
});
test('RED: configured alias resolves to the real boundary', (t) => {
  assert.ok(fixture(t, { 'src/v2/shared/a.ts': "import '@domain/place';", 'src/v2/modules/place/index.ts': 'export {};' },
    { '@domain/*': ['src/v2/modules/*'] }).violations.some((v) => v.rule === 'shared-no-domain'));
});
for (const alias of ['@/features/auth', '~/features/auth', '@features/auth', 'src/features/auth', 'features/auth']) {
  test(`RED: legacy alias ${alias}`, (t) => {
    assert.ok(fixture(t, { 'src/v2/shared/a.ts': `import '${alias}';`, 'src/features/auth/index.ts': 'export {};' })
      .violations.some((v) => v.rule === 'v2-no-legacy'));
  });
}
for (const typeOnly of [false, true]) test(`RED: production cycle (type-only=${typeOnly})`, (t) => {
  const r = fixture(t, {
    'src/v2/shared/a.ts': `import ${typeOnly ? 'type' : ''} { B } from './b'; export interface A {}`,
    'src/v2/shared/b.ts': "import type { A } from './a'; export interface B {}",
  });
  assert.equal(r.cycles.length, 1);
  assert.equal(r.violations.filter((v) => v.rule === 'production-cycle').length, 2);
});
test('GREEN: test graph cycles do not become production cycles', (t) => {
  assert.equal(fixture(t, {
    'src/v2/shared/__tests__/a.test.ts': "import './b.test';",
    'src/v2/shared/__tests__/b.test.ts': "import './a.test';",
  }).cycles.length, 0);
});
function exception(violation) { return { ...violation, maxCount: 1, reason: 'Existing migration edge.', issue: '#361' }; }
test('GREEN/RED: exact exception, extra occurrence, new source and target', (t) => {
  const r = fixture(t, { 'src/v2/app/a.ts': "import '../modules/place/hooks/usePlace';", 'src/v2/modules/place/hooks/usePlace.ts': 'export {};' });
  const v = r.violations[0], e = exception(v);
  assert.equal(applyExceptions([v], [e]).remaining.length, 0);
  assert.equal(applyExceptions([v, v], [e]).remaining.length, 1);
  for (const patch of [{ source: 'src/v2/app/new.ts' }, { target: 'src/v2/modules/place/hooks/new.ts' }, { typeOnly: true }, { test: true }]) {
    assert.equal(applyExceptions([{ ...v, ...patch }], [e]).remaining.length, 1);
  }
  assert.equal(applyExceptions([], [e]).stale.length, 1);
  assert.throws(() => applyExceptions([v], [{ ...e, source: 'src/v2/**' }]), /Invalid/);
  assert.throws(() => applyExceptions([v], [e, e]), /duplicate/);
});
test('RED: parse failure is visible', (t) => {
  assert.ok(fixture(t, { 'src/v2/app/a.ts': 'import { broken' }).violations.some((v) => v.rule === 'parse-error'));
});
test('RED: missing public index does not silently pass', (t) => {
  assert.ok(fixture(t, { 'src/v2/app/a.ts': "import '../modules/place';" }).violations.some((v) => v.rule === 'unresolved-import'));
});
test('RED: existing syntax restrictions are retained', (t) => {
  const r = fixture(t, { 'src/v2/shared/a.ts': "import axios from 'axios'; const a = process.env.KEY; const b = StyleSheet.create({});" });
  for (const rule of ['axios-shared-only', 'central-env', 'no-stylesheet']) assert.ok(r.violations.some((v) => v.rule === rule));
});
test('RED: public wildcard export is not a curated API', (t) => {
  assert.ok(fixture(t, { 'src/v2/modules/place/index.ts': "export * from './internal';", 'src/v2/modules/place/internal.ts': 'export {};' })
    .violations.some((v) => v.rule === 'public-no-export-star'));
});
test('RED: screen/hook filenames outside role directories still obey data flow', (t) => {
  const r = fixture(t, {
    'src/v2/modules/place/PlaceScreen.tsx': "import './api';",
    'src/v2/modules/place/api/index.ts': 'export {};',
    'src/v2/modules/place/usePlace.ts': "import '../../shared/api';",
    'src/v2/shared/api/index.ts': 'export {};',
  });
  assert.ok(r.violations.some((v) => v.rule === 'screen-no-api'));
  assert.ok(r.violations.some((v) => v.rule === 'hook-no-shared-api'));
});
test('RED: two real import declarations exceed a one-occurrence exception', (t) => {
  const r = fixture(t, {
    'src/v2/app/a.ts': "import '../features/map/hooks/useMap';\nimport '../features/map/hooks/useMap';",
    'src/v2/features/map/hooks/useMap.ts': 'export {};',
  });
  assert.equal(r.violations.length, 2);
  assert.equal(applyExceptions(r.violations, [exception(r.violations[0])]).remaining.length, 1);
});
test('RED: expanding an existing cycle cannot inherit its edge exceptions', (t) => {
  const old = fixture(t, {
    'src/v2/shared/a.ts': "import './b';",
    'src/v2/shared/b.ts': "import './a';",
  });
  const expanded = fixture(t, {
    'src/v2/shared/a.ts': "import './b';",
    'src/v2/shared/b.ts': "import './a'; import './c';",
    'src/v2/shared/c.ts': "import './a';",
  });
  assert.equal(applyExceptions(expanded.violations, old.violations.map(exception)).remaining.length, 2);
});
test('RED: a test file cannot use a production exception for a V1 import', (t) => {
  const r = fixture(t, {
    'src/v2/modules/user/__tests__/a.test.ts': "import '../../../../features/auth/hooks/useAuth';",
    'src/features/auth/hooks/useAuth.ts': 'export {};',
  });
  assert.ok(r.violations.some((v) => v.rule === 'v2-no-legacy' && v.test));
});

test('User migration: no owned exceptions or reverse/deep production dependencies', () => {
  const root = process.cwd();
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'scripts/v2-boundaries/exceptions.json'), 'utf8'));
  assert.equal(manifest.filter((entry) => entry.issue === '#358').length, 0);
  const r = inspect(root);
  const user = 'src/v2/modules/user/';
  assert.ok(r.nodes.has(`${user}index.ts`));
  const forbidden = r.violations.filter((v) =>
    (v.target?.startsWith(user) || v.source.startsWith(user))
    && ['domain-public-api', 'user-submodule-public-api', 'shared-no-domain', 'production-cycle', 'no-upward-composition', 'production-no-test', 'v2-no-legacy'].includes(v.rule));
  assert.deepEqual(forbidden, []);
  assert.equal(r.cycles.some((cycle) => JSON.stringify(cycle).includes(user)), false);
});


test('RED: User sibling submodules cannot reach into each other', (t) => {
  // Use a resolved User sibling edge, including type-only imports.
  const siblings = fixture(t, {
    'src/v2/modules/user/settings/example.ts': "import type { Profile } from '../profile/model/types';",
    'src/v2/modules/user/profile/model/types.ts': 'export type Profile = {};',
  });
  assert.ok(siblings.violations.some((v) => v.rule === 'user-submodule-public-api'));
});

test('RED: public User test support cannot enter the production graph', (t) => {
  const r = fixture(t, {
    'src/v2/app/example.ts': "import '../modules/user/profile/__tests__';",
    'src/v2/modules/user/profile/__tests__/index.ts': 'export {};',
  });
  assert.ok(r.violations.some((v) => v.rule === 'production-no-test'));
});

test('GREEN: Booking siblings consume named public indexes', (t) => {
  const result = fixture(t, {
    'src/v2/modules/booking/reservations/screens/Detail.ts': "import { Value } from '../../payments';",
    'src/v2/modules/booking/payments/index.ts': "export { Value } from './model/value';",
    'src/v2/modules/booking/payments/model/value.ts': 'export const Value = 1;',
  });
  assert.deepEqual(result.violations, []);
});

test('RED: Booking sibling deep imports cannot bypass the public boundary', (t) => {
  const result = fixture(t, {
    'src/v2/modules/booking/reservations/screens/Detail.ts': "import { Value } from '../../payments/model/value';",
    'src/v2/modules/booking/payments/model/value.ts': 'export const Value = 1;',
  });
  assert.ok(result.violations.some(v => v.rule === 'booking-submodule-public-api'));
});

test('GREEN: public Coupon test support is available to V1 tests', (t) => {
  const result = fixture(t, {
    'src/app/navigation/__tests__/coupon.test.ts': "import { Value } from '../../../v2/modules/booking/offers-coupons/__tests__';",
    'src/v2/modules/booking/offers-coupons/__tests__/index.ts': 'export const Value = 1;',
  });
  assert.deepEqual(result.violations, []);
});

test('RED: public Coupon test support is forbidden in production', (t) => {
  const result = fixture(t, {
    'src/v2/app/main.ts': "import { Value } from '../modules/booking/offers-coupons/__tests__';",
    'src/v2/modules/booking/offers-coupons/__tests__/index.ts': 'export const Value = 1;',
  });
  assert.ok(result.violations.some(v => v.rule === 'production-no-test'));
});

test('Booking migration has no #359 exceptions', () => {
  const exceptions = JSON.parse(fs.readFileSync(new URL('../v2-boundaries/exceptions.json', import.meta.url), 'utf8'));
  assert.equal(exceptions.filter(e => e.issue === '#359').length, 0);
});

for (const adapter of ['place/check-ins/__tests__/index.ts', 'place/map/navigation/__tests__/index.ts', 'onboarding/entry/__tests__/index.ts']) {
  test(`GREEN: public test support ${adapter} stays available to V1 tests`, t => {
    const result = fixture(t, {
      'src/app/navigation/__tests__/example.test.ts': `import '../../../v2/modules/${adapter}';`,
      [`src/v2/modules/${adapter}`]: 'export {};',
    });
    assert.deepEqual(result.violations, []);
  });
  test(`RED: public test support ${adapter} cannot enter production`, t => {
    const result = fixture(t, {
      'src/v2/app/example.ts': `import '../modules/${adapter}';`,
      [`src/v2/modules/${adapter}`]: 'export {};',
    });
    assert.ok(result.violations.some(v => v.rule === 'production-no-test'));
  });
}

test('Remaining migration: no #360 exceptions, SCCs, implementations or V2 compatibility consumers', async () => {
  const { default: ts } = await import('typescript');
  const manifest = JSON.parse(fs.readFileSync('scripts/v2-boundaries/exceptions.json', 'utf8'));
  assert.equal(manifest.filter(e => e.issue === '#360').length, 0);
  assert.equal(manifest.filter(e => e.issue === '#362').length, 6);
  assert.equal(manifest.reduce((sum, e) => sum + e.maxCount, 0), 6);
  const result = inspect(process.cwd());
  assert.deepEqual(result.cycles, []);
  assert.deepEqual(result.violations.filter(v => v.rule !== 'application-bridge'), []);
  assert.deepEqual([...result.nodes.keys()].filter(file => file.startsWith('src/v2/features/')), []);
  assert.equal(manifest.some(e => e.test), false);
  for (const file of result.nodes.keys()) {
    if (!file.startsWith('src/v2/features/')) continue;
    const source = fs.readFileSync(file, 'utf8');
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    assert.ok(source.includes('#362'), `${file}: missing removal owner`);
    assert.ok(ast.statements.length > 0, `${file}: empty compatibility file`);
    assert.ok(ast.statements.every(n => ts.isExportDeclaration(n) && n.moduleSpecifier
      && n.exportClause && ts.isNamedExports(n.exportClause)), `${file}: only named re-exports are permitted`);
    assert.deepEqual(result.edges.filter(e => e.target === file
      && (e.source.startsWith('src/v2/') || e.source.startsWith('src/application/'))), [], `${file}: migrate V2 consumers`);
  }
  for (const module of ['onboarding', 'travel', 'merchant', 'voice-assistant']) {
    assert.ok(result.nodes.has(`src/v2/modules/${module}/index.ts`));
  }
  assert.equal(result.nodes.has('src/v2/modules/home/index.ts'), false);
  assert.equal(result.nodes.has('src/v2/modules/community/index.ts'), false);
});

test('#362 production graph has no old roots, compatibility adapters, tests, deep imports or SCCs', async () => {
  const { auditProductionGraph, productionRoots } = await import('../production-dependencies.mjs');
  const actual = auditProductionGraph();
  const snapshot = JSON.parse(fs.readFileSync('docs/architecture/adr/0001-production-dependency-graph.json', 'utf8'));
  assert.deepEqual(actual, snapshot, 'Regenerate the reviewed production graph with node scripts/production-dependencies.mjs --write');
  assert.equal(actual.roots.length, 6);
  assert.ok(actual.roots.every(root => root.exists && root.reachable));
  assert.deepEqual(actual.productionScc, []);
  assert.deepEqual(actual.dependencies.filter(d => d.category === 'D' || d.path.startsWith('src/v2/features/')), []);
  for (const candidate of actual.removalCandidates) {
    assert.equal(candidate.reachable, candidate.path.endsWith('/RoutePlaceholderScreen.tsx'));
  }
  for (const dependency of actual.dependencies.filter(d => ['B', 'C'].includes(d.category))) {
    assert.ok(dependency.owner && dependency.reason && dependency.removalIssues.includes('#139'));
  }
  const inspected = inspect(process.cwd());
  assert.deepEqual(inspected.violations.filter(v => v.test || v.rule !== 'application-bridge'), []);
  const exceptions = JSON.parse(fs.readFileSync('scripts/v2-boundaries/exceptions.json', 'utf8'));
  assert.deepEqual(exceptions.map(e => [e.source, e.target, e.maxCount]), [
    ['src/application/navigation/RootNavigator.tsx', 'src/app/navigation/AuthNavigator.tsx', 1],
    ['src/application/navigation/RootNavigator.tsx', 'src/app/navigation/MainNavigator.tsx', 1],
    ['src/application/navigation/RootNavigator.tsx', 'src/app/store/authStore.ts', 1],
    ['src/application/runtime/configureProductionRuntime.ts', 'src/app/store/authStore.ts', 1],
    ['src/application/runtime/configureProductionRuntime.ts', 'src/shared/api/apiClient.ts', 1],
    ['src/application/runtime/configureProductionRuntime.ts', 'src/shared/api/authTokens.ts', 1],
  ]);
  const index = fs.readFileSync(productionRoots[0], 'utf8');
  assert.match(index, /modules\/user\/notifications\/background/);
  assert.ok(index.indexOf('registerBackgroundNotificationHandler();') < index.indexOf('registerRootComponent(App);'));
  const composition = fs.readFileSync('src/application/navigation/MainNavigator.tsx', 'utf8');
  assert.doesNotMatch(composition, /(?:from|import)\s*['"].*(?:\/features\/|\/app\/store\/)/);
  assert.match(composition, /useProfile.*from.*modules\/user\/profile/);
  // All existing route names remain registered, including the unsupported Merchant and legacy CheckIn.
  const contract = fs.readFileSync('src/application/navigation/types.ts', 'utf8').split('export const MAIN_ROUTES = {')[1].split('} as const;')[0];
  const routes = [...contract.matchAll(/(\w+): '/g)].map(match => match[1]);
  assert.equal(routes.length, 19);
  for (const route of routes) assert.match(composition, new RegExp(`name=\\{MAIN_ROUTES\\.${route}\\}`));
});
