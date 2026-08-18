// Sistema de caché con localStorage + TTL
// Feature: double-impact-store, Requirements 4.2, 19.1

export const CACHE_KEY = 'dis_catalog_cache';
export const CATALOG_TTL_MS = 300000;

function storageAvailable() {
  try {
    const probe = '__dis_cache_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch (err) {
    return false;
  }
}

export function setCache(key, data, ttlMs) {
  if (!storageAvailable()) return;
  try {
    const entry = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    };
    window.localStorage.setItem(key, JSON.stringify(entry));
  } catch (err) {
    // Sin almacenamiento disponible: no-op (degradación graceful)
  }
}

export function getCache(key) {
  if (!storageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry || typeof entry.timestamp !== 'number' || typeof entry.ttl !== 'number') {
      window.localStorage.removeItem(key);
      return null;
    }
    if (Date.now() - entry.timestamp > entry.ttl) {
      window.localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch (err) {
    return null;
  }
}

export function clearCache(key) {
  if (!storageAvailable()) return;
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    // no-op
  }
}