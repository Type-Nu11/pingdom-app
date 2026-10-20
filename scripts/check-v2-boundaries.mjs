import fs from 'node:fs';
import path from 'node:path';
import { inspect, applyExceptions } from './v2-boundaries/rules.mjs';

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'scripts/v2-boundaries/exceptions.json'), 'utf8'));
const report = inspect(root);
const result = applyExceptions(report.violations, manifest);
if (result.remaining.length || result.stale.length) {
  console.error('V2 boundary check failed:');
  for (const violation of result.remaining) console.error(`- ${violation.source}:${violation.line} [${violation.rule}] ${violation.specifier} -> ${violation.target ?? '(unresolved)'}\n  ${violation.suggestion}`);
  for (const exception of result.stale) console.error(`- ${exception.source} [stale-exception] ${exception.rule}: ${exception.specifier}; remove/reduce the exception (${exception.issue}).`);
  process.exitCode = 1;
} else {
  console.log(`V2 boundary check passed: ${report.nodes.size} source files; ${result.allowed} explicit exception occurrences; ${report.cycles.length} documented production SCCs (including type-only imports).`);
}
