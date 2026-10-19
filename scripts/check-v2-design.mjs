import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const nativeControls = new Set(['Alert', 'AlertIOS', 'ActionSheetIOS', 'ToastAndroid', 'DatePickerAndroid', 'TimePickerAndroid']);
// These are window hosts for reviewed custom UI, never platform alert content.
const modalHosts = new Set([
  'src/v2/shared/components/AppModal.tsx',
  'src/v2/modules/community/components/AnchoredMenu.tsx',
  'src/v2/modules/place/detail/components/PlacePhotoViewer.tsx',
  'src/v2/modules/place/map/routes/components/CarRoutePreview.tsx',
]);
const sheetOwner = 'src/v2/modules/place/map/sheet/components/MapSheetSurface.tsx';
const sheetPrimitives = new Set(['SheetInner', 'SheetChrome', 'SheetChromeShadow', 'SheetGlass', 'SheetContentViewport']);

export function inspectDesignSource(source, text) {
  const ast = ts.createSourceFile(source, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const violations = [];
  const aliases = new Map();
  const sheetNamespaces = new Set();
  const nativeNamespaces = new Set();
  const add = (node, rule) => violations.push({ source, line: ast.getLineAndCharacterOfPosition(node.getStart()).line + 1, rule });
  const visit = node => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && !node.importClause?.isTypeOnly) {
      const specifier = node.moduleSpecifier.text;
      const bindings = node.importClause?.namedBindings;
      const sheetImport = /(?:BottomSheetGlass\.styles|\/sheet)$/.test(specifier);
      if (sheetImport && bindings && ts.isNamespaceImport(bindings)) sheetNamespaces.add(bindings.name.text);
      if (specifier === 'react-native' && node.importClause?.name) nativeNamespaces.add(node.importClause.name.text);
      if (bindings && ts.isNamespaceImport(bindings) && specifier === 'react-native') nativeNamespaces.add(bindings.name.text);
      if (bindings && ts.isNamedImports(bindings)) for (const item of bindings.elements) {
        if (item.isTypeOnly) continue;
        const imported = (item.propertyName ?? item.name).text;
        if (sheetImport) aliases.set(item.name.text, imported);
        if (specifier === 'react-native' && nativeControls.has(imported)) add(item, 'use-app-dialog-or-toast');
        if (specifier === 'react-native' && imported === 'Modal' && !modalHosts.has(source)) add(item, 'use-app-modal');
      }
    }
    if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && nativeNamespaces.has(node.expression.text)) {
      if (nativeControls.has(node.name.text)) add(node, 'use-app-dialog-or-toast');
      if (node.name.text === 'Modal' && !modalHosts.has(source)) add(node, 'use-app-modal');
    }
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && source !== sheetOwner) {
      const tag = node.tagName;
      const name = ts.isPropertyAccessExpression(tag) && ts.isIdentifier(tag.expression) && sheetNamespaces.has(tag.expression.text)
        ? tag.name.text : ts.isIdentifier(tag) ? aliases.get(tag.text) ?? '' : '';
      if (sheetPrimitives.has(name)) add(node, 'use-map-sheet-surface');
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  return violations;
}

export function inspectDesign(root) {
  const violations = [];
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['__tests__', 'testing'].includes(entry.name)) continue;
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (/\.(tsx?|jsx?)$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name)) {
        violations.push(...inspectDesignSource(path.relative(root, absolute).split(path.sep).join('/'), fs.readFileSync(absolute, 'utf8')));
      }
    }
  };
  walk(path.join(root, 'src/v2'));
  // The actual application entry owns window providers and Android back feedback.
  walk(path.join(root, 'src/application'));
  return violations;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const violations = inspectDesign(process.cwd());
  for (const item of violations) console.error(`${item.source}:${item.line} [${item.rule}]`);
  if (violations.length) process.exitCode = 1;
  else console.log('V2 design check passed: app dialogs, reviewed modal hosts, and shared sheet clipping.');
}
