#!/usr/bin/env node
// Smoke test: js/siglas.json debe tener >= 40 entradas con campos es/en no vacíos.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(ROOT, '..', 'js', 'siglas.json');

function fail(message) {
  console.error(`[check-siglas] ERROR: ${message}`);
  process.exit(1);
}

const raw = fs.readFileSync(file, 'utf8');
let dict;
try {
  dict = JSON.parse(raw);
} catch (err) {
  fail(`siglas.json no es JSON válido: ${err.message}`);
}

const keys = Object.keys(dict);
if (keys.length < 40) {
  fail(`se esperaban al menos 40 entradas y hay ${keys.length}`);
}

for (const key of keys) {
  const entry = dict[key];
  if (!entry || typeof entry !== 'object') {
    fail(`la entrada "${key}" no es un objeto`);
  }
  if (typeof entry.es !== 'string' || entry.es.trim() === '') {
    fail(`la entrada "${key}" no tiene campo "es" no vacío`);
  }
  if (typeof entry.en !== 'string' || entry.en.trim() === '') {
    fail(`la entrada "${key}" no tiene campo "en" no vacío`);
  }
}

console.log(`[check-siglas] OK: ${keys.length} entradas con es/en válidas.`);