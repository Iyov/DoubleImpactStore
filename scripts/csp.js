#!/usr/bin/env node
// Content-Security-Policy: única fuente de la política del sitio.
//
// GitHub Pages no permite cabeceras HTTP propias, así que la CSP se entrega con
// <meta http-equiv> en cada página (sin frame-ancestors, que en <meta> se ignora).
// La misma política, más frame-ancestors, se escribe en .htaccess para hostings
// que sí aplican cabeceras.
//
// Los scripts inline ejecutables (hoy solo el snippet de GTM) se autorizan por
// hash SHA-256, sin 'unsafe-inline'. Si cambias un script inline, vuelve a
// ejecutar `npm run csp`.
//
// Uso:
//   node scripts/csp.js           -> escribe el <meta> en cada *.html y la cabecera en .htaccess
//   node scripts/csp.js --check   -> falla si algo está desactualizado o es inseguro
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const HTACCESS = path.join(PROJECT, '.htaccess');
const CHECK = process.argv.includes('--check');

// Orígenes de Google Tag Manager / GA4 según la guía de CSP de Google Tag Manager.
const DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", 'https://*.googletagmanager.com', 'https://tagmanager.google.com', 'https://static.cloudflareinsights.com'],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:', 'https://*.google-analytics.com', 'https://*.googletagmanager.com'],
  'font-src': ["'self'", 'data:'],
  'connect-src': [
    "'self'",
    'https://docs.google.com',
    'https://*.google-analytics.com',
    'https://*.analytics.google.com',
    'https://*.googletagmanager.com',
    'https://cloudflareinsights.com'
  ],
  'frame-src': ['https://www.googletagmanager.com', 'https://tagmanager.google.com'],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'object-src': ["'none'"],
  'upgrade-insecure-requests': []
};

const INLINE_SCRIPT = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi;
const META_CSP = /^[ \t]*<meta http-equiv="Content-Security-Policy"[^>]*>\r?\n/m;
const META_REFERRER = /^[ \t]*<meta name="referrer"[^>]*>\r?\n/m;
const HTACCESS_CSP = /^Header always set Content-Security-Policy ".*"$/m;

function htmlFiles() {
  return fs.readdirSync(PROJECT).filter((f) => f.endsWith('.html')).sort();
}

function isExecutable(attrs) {
  if (/\ssrc\s*=/i.test(attrs)) return false;
  const type = /\stype\s*=\s*["']?([^"'\s>]+)/i.exec(attrs);
  return !type || /^(text|application)\/javascript$|^module$/i.test(type[1]);
}

// El parser HTML normaliza CRLF a LF antes de calcular el hash.
export function scriptHashes(html) {
  const hashes = new Set();
  for (const [, attrs = '', body] of html.matchAll(INLINE_SCRIPT)) {
    if (!isExecutable(attrs)) continue;
    const digest = crypto.createHash('sha256').update(body.replace(/\r\n?/g, '\n'), 'utf8').digest('base64');
    hashes.add(`'sha256-${digest}'`);
  }
  return [...hashes].sort();
}

export function buildPolicy(hashes, { frameAncestors = false } = {}) {
  const directives = { ...DIRECTIVES, 'script-src': [DIRECTIVES['script-src'][0], ...hashes, ...DIRECTIVES['script-src'].slice(1)] };
  if (frameAncestors) directives['frame-ancestors'] = ["'none'"];
  return Object.entries(directives)
    .map(([name, values]) => [name, ...values].join(' '))
    .join('; ');
}

function metaTags(policy) {
  return (
    `  <meta http-equiv="Content-Security-Policy" content="${policy}" />\n` +
    '  <meta name="referrer" content="strict-origin-when-cross-origin" />\n'
  );
}

function withMeta(html, policy) {
  const clean = html.replace(META_CSP, '').replace(META_REFERRER, '');
  // Debe ir antes de cualquier <script> para que la política lo cubra.
  return clean.replace(/<head>\r?\n/i, (head) => head + metaTags(policy));
}

function problems(file, html) {
  const issues = [];
  const policy = buildPolicy(scriptHashes(html));
  const meta = META_CSP.exec(html);
  if (!meta) issues.push('falta <meta http-equiv="Content-Security-Policy">');
  else if (!meta[0].includes(`content="${policy}"`)) issues.push('la CSP no coincide con scripts/csp.js (¿cambió un script inline?)');
  if (!META_REFERRER.test(html)) issues.push('falta <meta name="referrer">');
  const firstScript = html.search(/<script[\s>]/i);
  if (meta && firstScript >= 0 && meta.index > firstScript) issues.push('el <meta> de la CSP debe ir antes del primer <script>');
  if (/\son[a-z]+\s*=\s*["']/i.test(html)) issues.push('hay manejadores de eventos inline (on*=), bloqueados por la CSP');
  return issues.map((issue) => `${file}: ${issue}`);
}

const files = htmlFiles();
const allHashes = [...new Set(files.flatMap((f) => scriptHashes(fs.readFileSync(path.join(PROJECT, f), 'utf8'))))].sort();
const htaccessLine = `Header always set Content-Security-Policy "${buildPolicy(allHashes, { frameAncestors: true })}"`;

if (CHECK) {
  const issues = files.flatMap((f) => problems(f, fs.readFileSync(path.join(PROJECT, f), 'utf8')));
  if (fs.existsSync(HTACCESS) && !fs.readFileSync(HTACCESS, 'utf8').includes(htaccessLine)) {
    issues.push('.htaccess: la CSP no coincide con scripts/csp.js');
  }
  if (issues.length > 0) {
    console.error('[check-csp] ERROR (ejecuta `npm run csp` para regenerar):');
    issues.forEach((issue) => console.error(`  - ${issue}`));
    process.exit(1);
  }
  console.log(`[check-csp] OK: ${files.length} páginas con CSP actualizada, sin 'unsafe-inline' en script-src.`);
} else {
  for (const file of files) {
    const full = path.join(PROJECT, file);
    const html = fs.readFileSync(full, 'utf8');
    const updated = withMeta(html, buildPolicy(scriptHashes(html)));
    if (updated !== html) fs.writeFileSync(full, updated);
  }
  if (fs.existsSync(HTACCESS)) {
    const content = fs.readFileSync(HTACCESS, 'utf8');
    fs.writeFileSync(HTACCESS, content.replace(HTACCESS_CSP, htaccessLine));
  }
  console.log(`[csp] CSP escrita en ${files.length} páginas y .htaccess (hashes: ${allHashes.join(' ') || 'ninguno'}).`);
}
