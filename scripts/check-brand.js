#!/usr/bin/env node
// Smoke test: ningún archivo del proyecto debe contener la marca antigua.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.join(ROOT, '..');
const EXCLUDE_DIRS = new Set(['node_modules', '.git', 'coverage', 'test-results', 'playwright-report', '.kiro']);
const EXCLUDE_FILES = new Set(['package-lock.json', 'check-brand.js']);
const PATTERNS = [
  /RopavejeroRetro/i,
  /Ropavejero\s+Retro/i,
  /ropavejeroretro/i
];

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, acc);
    } else if (EXCLUDE_FILES.has(entry.name)) {
      continue;
    } else {
      acc.push(full);
    }
  }
  return acc;
}

const files = walk(PROJECT).filter((f) => /\.(html|js|css|json|xml|txt|py|yml|yaml|htaccess)$/.test(f));
const hits = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  for (const pattern of PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      hits.push(`${path.relative(PROJECT, file)}: ${match[0]}`);
    }
  }
}

if (hits.length > 0) {
  console.error('[check-brand] ERROR: se encontraron referencias a la marca antigua:');
  hits.forEach((h) => console.error(`  - ${h}`));
  process.exit(1);
}

console.log('[check-brand] OK: no se encontraron referencias a la marca anterior.');