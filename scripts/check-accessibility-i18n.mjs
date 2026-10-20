import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const sourceExtensions = ['.ts', '.tsx'];
const ignoredSegments = ['/__tests__/', '/testing/', '/generated/', '/mock/'];
const userFacingProps = new Set([
  'accessibilityHint', 'accessibilityLabel', 'alt', 'description', 'helperText',
  'label', 'message', 'placeholder', 'title',
]);
const allowedDecorativeGlyphs = new Map([
  ['src/v2/features/reservations/components/ReservationBottomSheet.tsx:R', 'decorative reservation monogram'],
]);

function resolveImport(fromFile, specifier) {
  if (!specifier.startsWith('.')) return null;
  const candidate = resolve(dirname(fromFile), specifier);
  const candidates = extname(candidate)
    ? [candidate]
    : sourceExtensions.flatMap((extension) => [candidate + extension, resolve(candidate, `index${extension}`)]);
  return candidates.find((file) => existsSync(file)) ?? null;
}

function collectProductionGraph(entryFile) {
  const pending = [resolve(root, entryFile)];
  const visited = new Set();
  while (pending.length) {
    const file = pending.pop();
    if (!file || visited.has(file) || ignoredSegments.some((segment) => file.includes(segment))) continue;
    visited.add(file);
    const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true,
      file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    source.forEachChild((node) => {
      if ((!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node))
        || !node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) return;
      const imported = resolveImport(file, node.moduleSpecifier.text);
      if (imported) pending.push(imported);
    });
  }
  return [...visited];
}

function location(source, node) {
  const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
  return `${source.fileName.slice(root.length + 1)}:${line + 1}`;
}

const hasVisibleWords = (value) => /[A-Za-z\u3131-\uD79D]/u.test(value) && !/^https?:\/\//i.test(value);
const violations = [];
const productionFiles = collectProductionGraph('index.ts');

for (const file of productionFiles) {
  if (!file.endsWith('.tsx')) continue;
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = (node) => {
    if (ts.isJsxText(node) && hasVisibleWords(node.text.trim())) {
      const relativeFile = source.fileName.slice(root.length + 1);
      if (!allowedDecorativeGlyphs.has(`${relativeFile}:${node.text.trim()}`)) {
        violations.push(`${location(source, node)} JSX text: ${JSON.stringify(node.text.trim())}`);
      }
    }
    if (ts.isJsxAttribute(node) && userFacingProps.has(node.name.text)
      && node.initializer && ts.isStringLiteral(node.initializer) && hasVisibleWords(node.initializer.text)) {
      violations.push(`${location(source, node)} ${node.name.text}: ${JSON.stringify(node.initializer.text)}`);
    }
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const owner = node.expression.expression.getText(source);
      const method = node.expression.name.text;
      if ((owner === 'Alert' && method === 'alert') || (owner === 'ToastAndroid' && method === 'show')) {
        for (const argument of node.arguments) {
          if ((ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument)) && hasVisibleWords(argument.text)) {
            violations.push(`${location(source, argument)} ${owner}.${method}: ${JSON.stringify(argument.text)}`);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

const button = read('src/shared/components/Button.tsx');
const badge = read('src/shared/components/StatusBadge.tsx');
assert.match(button, /accessibilityRole="button"/);
assert.match(button, /busy: loading/);
assert.match(button, /minHeight: 52/);
assert.doesNotMatch(button, /numberOfLines=/);
assert.match(badge, /accessibilityLabel=\{label\}/);
assert.deepEqual(violations, [], `Production user-facing literals found:\n${violations.join('\n')}`);

console.log(`Production render graph accessibility and i18n checks passed (${productionFiles.length} files).`);
