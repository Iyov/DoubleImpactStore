#!/usr/bin/env node
/* ============================================================
   DoubleImpactStore — watcher.js (build)
   - Minifica css/style.css y css/productos.css -> *.min.css (cssnano)
   - Empaqueta js/index.js y sus módulos en un solo js/index.min.js (esbuild)
   - Cache busting: escribe ?v=<hash de contenido> de esos assets en cada *.html
   - Escribe ASSETS_HASH en service-worker.js: si cambia algún asset, el
     Service Worker se reinstala con una caché nueva
   js/instagram_posts*.js y CACHE_VERSION los gestiona api/update_instagram.py.
   Uso:
     node watcher.js --once   -> build único
     node watcher.js          -> modo watch (rebuild al cambiar una fuente)
   ============================================================ */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import postcss from 'postcss';
import cssnano from 'cssnano';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ONCE = process.argv.includes('--once');

const CSS_SOURCES = ['css/style.css', 'css/productos.css'];
const JS_ENTRY = 'js/index.js';
const JS_BUNDLE = 'js/index.min.js';
// Assets cuyo ?v= gestiona el build (font-awesome ya viene minificado)
const VERSIONED_ASSETS = ['css/font-awesome_6.5.1_all.min.css', 'css/style.min.css', 'css/productos.min.css', JS_BUNDLE];
const SW_FILE = 'service-worker.js';

const abs = (rel) => path.join(ROOT, rel);
const read = (rel) => fs.readFileSync(abs(rel), 'utf8');

function writeIfChanged(rel, content) {
  if (fs.existsSync(abs(rel)) && read(rel) === content) return false;
  fs.writeFileSync(abs(rel), content);
  return true;
}

function report(source, output) {
  const before = fs.statSync(abs(source)).size;
  const after = fs.statSync(abs(output)).size;
  console.log(`[build] ${output} (${before}B -> ${after}B, ${Math.round((after / before) * 100)}% de ${source})`);
}

async function buildCss() {
  for (const source of CSS_SOURCES) {
    const output = source.replace(/\.css$/, '.min.css');
    const result = await postcss([cssnano({ preset: 'default' })]).process(read(source), { from: abs(source), to: abs(output) });
    writeIfChanged(output, result.css);
    report(source, output);
  }
}

async function buildJs() {
  const result = await esbuild.build({
    entryPoints: [abs(JS_ENTRY)],
    bundle: true,
    format: 'esm',
    target: 'es2020',
    minify: true,
    legalComments: 'none',
    write: false
  });
  writeIfChanged(JS_BUNDLE, result.outputFiles[0].text);
  console.log(`[build] ${JS_BUNDLE} (bundle de ${JS_ENTRY} y sus módulos, ${fs.statSync(abs(JS_BUNDLE)).size}B)`);
}

// CRLF -> LF: con core.autocrlf, Windows tiene CRLF y git/CI tienen LF; el hash
// debe ser el mismo en ambos para que el build sea reproducible.
function contentHash(rel) {
  const text = read(rel).replace(/\r\n/g, '\n');
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 10);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function updateVersions() {
  const hashes = Object.fromEntries(VERSIONED_ASSETS.map((rel) => [rel, contentHash(rel)]));
  const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
  for (const page of pages) {
    let html = read(page);
    for (const [rel, hash] of Object.entries(hashes)) {
      html = html.replace(new RegExp(`(${escapeRegex(rel)})\\?v=[^"'\\s>]+`, 'g'), `$1?v=${hash}`);
    }
    if (writeIfChanged(page, html)) console.log(`[build] ${page}: ?v= actualizado`);
  }

  const assetsHash = crypto.createHash('sha256').update(Object.values(hashes).join('')).digest('hex').slice(0, 10);
  const sw = read(SW_FILE).replace(/const ASSETS_HASH = '[^']*';/, `const ASSETS_HASH = '${assetsHash}';`);
  if (writeIfChanged(SW_FILE, sw)) console.log(`[build] ${SW_FILE}: ASSETS_HASH = ${assetsHash}`);
}

async function build() {
  await buildCss();
  await buildJs();
  updateVersions();
}

// Fuentes cuyo cambio dispara un rebuild en modo watch
function watchedSources() {
  const js = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(abs(dir), { withFileTypes: true })) {
      const rel = `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(rel);
      else if (/\.js$/.test(entry.name) && !/\.min\.js$/.test(entry.name) && entry.name !== 'instagram_posts.js') js.push(rel);
    }
  };
  walk('js');
  return [...CSS_SOURCES, ...js];
}

function snapshot() {
  return watchedSources()
    .map((rel) => {
      const stat = fs.statSync(abs(rel));
      return `${rel}:${stat.size}:${stat.mtimeMs}`;
    })
    .join('|');
}

async function watch() {
  console.log('[build] Modo watch activo. Esperando cambios en css/ y js/...');
  await build();
  let last = snapshot();
  let running = false;
  const interval = setInterval(async () => {
    if (running) return;
    const current = snapshot();
    if (current === last) return;
    last = current;
    running = true;
    try {
      await build();
    } catch (err) {
      console.error('[build] ERROR:', err.message);
    } finally {
      running = false;
    }
  }, 1500);
  process.on('SIGINT', () => {
    clearInterval(interval);
    process.exit(0);
  });
}

if (ONCE) {
  build().catch((err) => {
    console.error('[build] ERROR:', err.message);
    process.exit(1);
  });
} else {
  watch();
}
