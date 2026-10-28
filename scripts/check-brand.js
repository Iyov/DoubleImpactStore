#!/usr/bin/env node
// Smoke test: ningún archivo del proyecto debe contener la marca antigua.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.join(ROOT, '..');
const EXCLUDE_DIRS = new Set(['node_modules', '.git', 'coverage', 'test-results', 'playwright-report', '.kiro']);
const EXCLUDE_FILES = new Set(['package-lock.json', 'check-brand.js']);
// Captions reales de Instagram (generados por api/update_instagram.py): pueden
// contener hashtags históricos de la tienda de origen, así que se ignoran.
const CAPTION_FILES = new Set(['instagram_posts.js', 'instagram_posts.min.js']);
const CAPTION_FIELD = /"?description"?\s*:\s*"(?:[^"\\]|\\.)*"/g;
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
  let content = fs.readFileSync(file, 'utf8');
  if (CAPTION_FILES.has(path.basename(file))) content = content.replace(CAPTION_FIELD, '');
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