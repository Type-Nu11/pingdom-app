import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.mts', '.cts']);
export const isTest = (file) => /(?:^|\/)(?:__tests__|__mocks__)\//.test(file)
  || /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(file)
  // Frozen V1 navigation tests use these compatibility adapters (#362).
  || ['src/v2/features/my-page/api/profileApi.ts', 'src/v2/features/notifications/api/notificationApi.ts', 'src/v2/features/offers-coupons/api/offerCouponApi.ts'].includes(file)
  || file.startsWith('src/v2/shared/testing/') || file.startsWith('src/v2/app/testing/');
export function filesUnder(root, directory) {
  const absolute = path.join(root, directory);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => entry.isDirectory() ? filesUnder(root, `${directory}/${entry.name}`)
      : [`${directory}/${entry.name}`]);
}
export function parseSource(file, source) {
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const imports = [];
  const syntax = [];
  function add(node, argument, typeOnly = false) {
    const line = ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1;
    imports.push({ specifier: argument && (ts.isStringLiteralLike(argument)) ? argument.text : null,
      line, typeOnly, exportAll: ts.isExportDeclaration(node) && !node.exportClause });
  }
  function walk(node) {
    if (ts.isImportDeclaration(node)) {
      const clause = node.importClause;
      const bindings = clause?.namedBindings;
      add(node, node.moduleSpecifier, Boolean(clause?.isTypeOnly || (!clause?.name && bindings
        && ts.isNamedImports(bindings) && bindings.elements.length && bindings.elements.every((e) => e.isTypeOnly))));
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      add(node, node.moduleSpecifier, Boolean(node.isTypeOnly || (node.exportClause
        && ts.isNamedExports(node.exportClause) && node.exportClause.elements.length
        && node.exportClause.elements.every((e) => e.isTypeOnly))));
    } else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) {
      add(node, node.moduleReference.expression, node.isTypeOnly);
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
      add(node, node.argument.literal, true);
    } else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword
      || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
      add(node, node.arguments[0]);
    }
    if (ts.isIdentifier(node) && node.text === 'StyleSheet') syntax.push({ rule: 'no-stylesheet', line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1 });
    if ((ts.isPropertyAccessExpression(node) && node.expression.getText(ast) === 'process' && node.name.text === 'env')
      || (ts.isElementAccessExpression(node) && node.expression.getText(ast) === 'process' && node.argumentExpression?.text === 'env')) {
      syntax.push({ rule: 'central-env', line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1 });
    }
    ts.forEachChild(node, walk);
  }
  walk(ast);
  return { imports, syntax, diagnostics: ast.parseDiagnostics };
}
export function buildGraph(root) {
  const configFile = ts.findConfigFile(root, ts.sys.fileExists, 'tsconfig.json');
  const config = configFile ? ts.readConfigFile(configFile, ts.sys.readFile).config : {};
  const options = ts.parseJsonConfigFileContent(config, ts.sys, root).options;
  const files = filesUnder(root, 'src').filter((file) => extensions.has(path.extname(file)));
  for (const entry of ['index.ts', 'App.tsx', 'App.v2.tsx']) if (fs.existsSync(path.join(root, entry))) files.push(entry);
  const fileSet = new Set(files);
  function resolve(source, specifier) {
    const resolved = ts.resolveModuleName(specifier, path.join(root, source), options, ts.sys).resolvedModule;
    if (resolved && !resolved.isExternalLibraryImport) return path.relative(root, resolved.resolvedFileName).split(path.sep).join('/');
    let candidate;
    if (specifier.startsWith('.')) candidate = path.posix.normalize(path.posix.join(path.posix.dirname(source), specifier));
    else if (/^(?:@\/|~\/)(?:src\/)?/.test(specifier)) candidate = specifier.replace(/^(?:@\/|~\/)(?:src\/)?/, 'src/');
    else if (/^(?:@|~)features\//.test(specifier)) candidate = specifier.replace(/^(?:@|~)features\//, 'src/features/');
    else if (specifier.startsWith('features/')) candidate = 'src/' + specifier;
    else if (specifier.startsWith('src/')) candidate = path.posix.normalize(specifier);
    else return null;
    candidate = path.posix.normalize(candidate);
    for (const name of [candidate, ...[...extensions].map((ext) => candidate + ext), `${candidate}/index.ts`, `${candidate}/index.tsx`]) {
      if (fileSet.has(name) || fs.existsSync(path.join(root, name)) && fs.statSync(path.join(root, name)).isFile()) return name;
    }
    return candidate;
  }
  const nodes = new Map();
  const edges = [];
  for (const file of files) {
    const parsed = parseSource(file, fs.readFileSync(path.join(root, file), 'utf8'));
    nodes.set(file, parsed);
    for (const item of parsed.imports) edges.push({ source: file, target: item.specifier === null ? null : resolve(file, item.specifier), ...item, test: isTest(file) });
  }
  return { nodes, edges };
}
// Tarjan SCCs: include type-only and lazy edges; order/fingerprint is deterministic.
export function findCycles(nodes, edges) {
  const adjacent = new Map([...nodes].map((node) => [node, []]));
  for (const edge of edges) if (adjacent.has(edge.source) && adjacent.has(edge.target)) adjacent.get(edge.source).push(edge.target);
  const indices = new Map(), low = new Map(), stack = [], active = new Set(), components = [];
  let next = 0;
  function visit(node) {
    indices.set(node, next); low.set(node, next++); stack.push(node); active.add(node);
    for (const target of adjacent.get(node)) {
      if (!indices.has(target)) { visit(target); low.set(node, Math.min(low.get(node), low.get(target))); }
      else if (active.has(target)) low.set(node, Math.min(low.get(node), indices.get(target)));
    }
    if (low.get(node) === indices.get(node)) {
      const component = []; let member;
      do { member = stack.pop(); active.delete(member); component.push(member); } while (member !== node);
      if (component.length > 1 || adjacent.get(node).includes(node)) components.push(component.sort());
    }
  }
  for (const node of adjacent.keys()) if (!indices.has(node)) visit(node);
  return components.sort((a, b) => a[0].localeCompare(b[0]));
}
