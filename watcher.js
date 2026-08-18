#!/usr/bin/env node
/* ============================================================
   DoubleImpactStore — watcher.js (minificador automático)
   Detecta cambios en CSS/JS y genera las versiones .min.*
   Uso:
     node watcher.js --once   -> genera una vez y termina
     node watcher.js          -> modo watch (regenera al cambiar)
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify as minifyJs } from 'terser';
import postcss from 'postcss';
import cssnano from 'cssnano';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ONCE = process.argv.includes('--once');

// Directorios/archivos objetivo (excluye node_modules, api, scripts, .git)
const TARGETS = [
  'css',
  'js',
  'service-worker.js'
];

function isMinFile(name) {
  return /\.min\.(js|css)$/.test(name);
}

function listSourceFiles() {
  const files = [];
  for (const target of TARGETS) {
    const full = path.join(ROOT, target);
    if (fs.existsSync(full)) {
      if (fs.statSync(full).isDirectory()) {
        walk(full, files);
      } else {
        files.push(target);
      }
    }
  }
  return files
    .filter((f) => !isMinFile(f))
    .filter((f) => /\.(js|css)$/.test(f));
}

function walk(dir, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, acc);
    } else if (/\.(js|css)$/.test(entry.name)) {
      acc.push(path.relative(ROOT, full).split(path.sep).join('/'));
    }
  }
}

async function processFile(relPath) {
  const ext = path.extname(relPath);
  const sourcePath = path.join(ROOT, relPath);
  const minPath = sourcePath.replace(ext, `.min${ext}`);
  const original = fs.readFileSync(sourcePath, 'utf8');

  let minified;
  if (ext === '.js') {
    const isModule = /^\s*(import|export)\s/m.test(original) || /^\s*import\s/m.test(original);
    const result = await minifyJs(original, {
      compress: { passes: 2 },
      mangle: true,
      module: isModule
    });
    if (result.error) throw result.error;
    minified = result.code;
  } else {
    const result = await postcss([cssnano({ preset: 'default' })]).process(original, {
      from: sourcePath,
      to: minPath
    });
    minified = result.css;
  }

  fs.writeFileSync(minPath, minified);
  const origSize = Buffer.byteLength(original);
  const minSize = Buffer.byteLength(minified);
  const pct = origSize > 0 ? Math.round((minSize / origSize) * 100) : 0;
  console.log(`[minify] ${relPath} (${origSize}B -> ${minSize}B, ${pct}% del original)`);
  return { relPath, origSize, minSize, pct };
}

async function runOnce() {
  const files = listSourceFiles();
  let ok = 0;
  for (const file of files) {
    try {
      await processFile(file);
      ok += 1;
    } catch (err) {
      console.error(`[minify] ERROR en ${file}:`, err.message);
    }
  }
  console.log(`[minify] Listo. ${ok}/${files.length} archivos minificados.`);
}

async function watch() {
  console.log('[minify] Modo watch activo. Esperando cambios en CSS/JS...');
  await runOnce();
  const seen = new Set();
  const schedule = new Map();

  const check = async (file) => {
    if (!/\.(js|css)$/.test(file) || isMinFile(file)) return;
    if (!listSourceFiles().includes(file)) return;
    try {
      const stat = fs.statSync(path.join(ROOT, file));
      const prev = schedule.get(file);
      if (!prev || prev.size !== stat.size || prev.mtimeMs !== stat.mtimeMs) {
        schedule.set(file, { size: stat.size, mtimeMs: stat.mtimeMs });
        if (prev) {
          await processFile(file);
        }
      }
    } catch (err) {
      // archivo eliminado
    }
  };

  const files = listSourceFiles();
  for (const file of files) {
    try {
      const stat = fs.statSync(path.join(ROOT, file));
      schedule.set(file, { size: stat.size, mtimeMs: stat.mtimeMs });
    } catch (err) {
      // noop
    }
  }

  const interval = setInterval(async () => {
    for (const file of files) {
      await check(file);
    }
  }, 1500);

  process.on('SIGINT', () => {
    clearInterval(interval);
    process.exit(0);
  });
}

if (ONCE) {
  runOnce();
} else {
  watch();
}