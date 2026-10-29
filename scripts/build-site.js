#!/usr/bin/env node
// Arma _site/ con solo los archivos públicos del sitio (lo que se publica en
// GitHub Pages) y verifica que toda referencia local exista dentro de _site/:
// src/href/srcset del HTML, url() del CSS, íconos del manifest, precache del
// Service Worker, imágenes de Instagram y URLs del sitemap.
//
// Uso: node scripts/build-site.js   (sale con código 1 si falta algo)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(PROJECT, '_site');
const DOMAIN = 'https://doubleimpactstore.cl';

// Lista explícita de lo público: cualquier otro archivo del repo queda fuera.
const PUBLIC = [
  { dir: '.', match: /\.html$/ },
  { files: ['manifest.json', 'service-worker.js', 'robots.txt', 'sitemap.xml', 'CNAME'] },
  { dir: 'css', match: /\.min\.css$/ },
  { dir: 'js', match: /^(index\.min\.js|instagram_posts\.min\.js|[\w-]+\.json)$/ },
  { dir: 'img', match: /./ },
  { dir: 'webfonts', match: /./ },
  { dir: '.well-known', match: /./ }
];

function publicFiles() {
  const files = [];
  for (const entry of PUBLIC) {
    if (entry.files) files.push(...entry.files);
    else {
      for (const name of fs.readdirSync(path.join(PROJECT, entry.dir))) {
        const rel = path.posix.join(entry.dir, name);
        if (entry.match.test(name) && fs.statSync(path.join(PROJECT, rel)).isFile()) files.push(rel.replace(/^\.\//, ''));
      }
    }
  }
  return files;
}

function copy(files) {
  fs.rmSync(SITE, { recursive: true, force: true });
  for (const rel of files) {
    const target = path.join(SITE, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(PROJECT, rel), target);
  }
}

const isLocal = (ref) => ref && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(ref);

// Resuelve una referencia relativa a un archivo de _site/ y comprueba que exista.
// Las URLs limpias (/productos) existen si existe el .html correspondiente.
function exists(fromRel, ref) {
  const clean = decodeURIComponent(ref.split(/[?#]/)[0]);
  if (!clean) return true;
  const base = clean.startsWith('/') ? '' : path.posix.dirname(fromRel);
  const resolved = path.posix.normalize(path.posix.join(base, clean)).replace(/^\/+/, '');
  const candidates = resolved === '' || resolved.endsWith('/') ? [`${resolved}index.html`] : [resolved, `${resolved}.html`];
  return candidates.some((c) => fs.existsSync(path.join(SITE, c)));
}

function referencesIn(rel, content) {
  const refs = [];
  if (rel.endsWith('.html')) {
    const withoutScripts = content.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');
    for (const [, , value] of withoutScripts.matchAll(/\s(src|href)\s*=\s*["']([^"']+)["']/gi)) refs.push(value);
    for (const [, value] of withoutScripts.matchAll(/\ssrcset\s*=\s*["']([^"']+)["']/gi)) {
      refs.push(...value.split(',').map((c) => c.trim().split(/\s+/)[0]));
    }
  } else if (rel.endsWith('.css')) {
    for (const [, value] of content.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) refs.push(value);
  } else if (rel === 'manifest.json') {
    for (const icon of JSON.parse(content).icons || []) refs.push(icon.src);
  } else if (rel === 'service-worker.js') {
    const list = /const CORE_ASSETS = \[([\s\S]*?)\];/.exec(content);
    for (const [, value] of (list ? list[1] : '').matchAll(/'([^']+)'/g)) refs.push(value);
  } else if (rel === 'js/instagram_posts.min.js') {
    // Rutas relativas a la página (raíz del sitio), no a js/
    for (const [, image] of content.matchAll(/"?image"?\s*:\s*"([^"]+)"/g)) {
      const base = `/${image.replace(/\.[^.]+$/, '')}`;
      refs.push(`/${image}`, ...[400, 800, 1200].map((w) => `${base}_${w}.webp`));
    }
  } else if (rel === 'sitemap.xml') {
    for (const [, loc] of content.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      if (loc.startsWith(DOMAIN)) refs.push(loc.slice(DOMAIN.length) || '/');
    }
  }
  return refs.filter(isLocal);
}

const files = publicFiles();
copy(files);

const missing = [];
for (const rel of files) {
  if (!/\.(html|css|json|js|xml)$/.test(rel)) continue;
  const content = fs.readFileSync(path.join(SITE, rel), 'utf8');
  for (const ref of referencesIn(rel, content)) {
    if (!exists(rel, ref)) missing.push(`${rel} -> ${ref}`);
  }
}

if (missing.length > 0) {
  console.error(`[build-site] ERROR: ${missing.length} referencias a archivos que no existen en _site/:`);
  [...new Set(missing)].forEach((m) => console.error(`  - ${m}`));
  process.exit(1);
}
console.log(`[build-site] OK: ${files.length} archivos públicos en _site/, todas las referencias locales existen.`);
