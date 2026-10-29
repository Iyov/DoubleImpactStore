#!/usr/bin/env node
// Smoke test: los archivos .min.* deben ser <= 64% del tamaño del original.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PAIRS = [
  ['css/style.css', 'css/style.min.css'],
  ['css/productos.css', 'css/productos.min.css']
];

let failed = false;

for (const [source, minified] of PAIRS) {
  const srcPath = path.join(ROOT, '..', source);
  const minPath = path.join(ROOT, '..', minified);
  if (!fs.existsSync(srcPath)) {
    console.error(`[check-minification] ERROR: no existe ${source}`);
    failed = true;
    continue;
  }
  if (!fs.existsSync(minPath)) {
    console.error(`[check-minification] ERROR: no existe ${minified} (ejecuta 'npm run minify')`);
    failed = true;
    continue;
  }
  const origSize = fs.statSync(srcPath).size;
  const minSize = fs.statSync(minPath).size;
  const pct = origSize > 0 ? (minSize / origSize) * 100 : 100;
  if (pct > 64) {
    console.error(`[check-minification] ERROR: ${minified} es el ${pct.toFixed(1)}% del original (límite 64%).`);
    failed = true;
  } else {
    console.log(`[check-minification] OK: ${minified} = ${pct.toFixed(1)}% del original.`);
  }
}

// El bundle de JS debe ser autocontenido: un import relativo significaría que
// el navegador vuelve a pedir los módulos sin minificar.
const BUNDLE = path.join(ROOT, '..', 'js', 'index.min.js');
if (!fs.existsSync(BUNDLE)) {
  console.error("[check-minification] ERROR: no existe js/index.min.js (ejecuta 'npm run build')");
  failed = true;
} else if (/\b(import|from)\s*["']\.{1,2}\//.test(fs.readFileSync(BUNDLE, 'utf8'))) {
  console.error('[check-minification] ERROR: js/index.min.js importa módulos relativos; debe ser un bundle (npm run build).');
  failed = true;
} else {
  console.log('[check-minification] OK: js/index.min.js es un bundle autocontenido.');
}

if (failed) process.exit(1);
console.log('[check-minification] OK: todos los pares cumplen la reducción >= 36%.');