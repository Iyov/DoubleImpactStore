// Feature: double-impact-store, Property 3: Round-trip de caché con TTL
import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { setCache, getCache, clearCache, CACHE_KEY, CATALOG_TTL_MS } from '../js/modules/cache.js';

describe('cache.js', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('guarda y recupera datos dentro del TTL (Property 3)', () => {
    // Feature: double-impact-store, Property 3: Round-trip de caché con TTL
    fc.assert(
      fc.property(fc.anything(), fc.integer({ min: 1000 }), (data, ttl) => {
        setCache('test_key', data, ttl);
        const result = getCache('test_key');
        return JSON.stringify(result) === JSON.stringify(data);
      }),
      { numRuns: 100 }
    );
  });

  it('retorna null tras expirar el TTL', () => {
    vi.useFakeTimers();
    setCache('short', { value: 1 }, 30);
    expect(getCache('short')).toEqual({ value: 1 });
    vi.advanceTimersByTime(100);
    expect(getCache('short')).toBeNull();
    vi.useRealTimers();
  });

  it('retorna null si no hay clave almacenada', () => {
    expect(getCache('missing_key')).toBeNull();
  });

  it('limpia la clave con clearCache', () => {
    setCache('key', { a: 1 }, 60000);
    expect(getCache('key')).toEqual({ a: 1 });
    clearCache('key');
    expect(getCache('key')).toBeNull();
  });

  it('la clave y TTL del catálogo son los definidos por la especificación', () => {
    expect(CACHE_KEY).toBe('dis_catalog_cache');
    expect(CATALOG_TTL_MS).toBe(300000);
  });

  it('degrada graceful cuando localStorage no está disponible', () => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => setCache('k', 'v', 1000)).not.toThrow();
    Storage.prototype.setItem = setItem;
  });
});