#!/usr/bin/env node
// Smoke test: manifest.json debe tener name y short_name === "DoubleImpactStore".
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(ROOT, '..', 'manifest.json');

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (err) {
  console.error(`[check-manifest] ERROR: manifest.json no es JSON válido: ${err.message}`);
  process.exit(1);
}

if (manifest.name !== 'DoubleImpactStore') {
  console.error(`[check-manifest] ERROR: name debe ser "DoubleImpactStore" y es "${manifest.name}"`);
  process.exit(1);
}
if (manifest.short_name !== 'DoubleImpactStore') {
  console.error(`[check-manifest] ERROR: short_name debe ser "DoubleImpactStore" y es "${manifest.short_name}"`);
  process.exit(1);
}

console.log('[check-manifest] OK: name y short_name correctos.');