// Feature: double-impact-store, Property 8: Debounce de búsqueda
import { describe, it, expect, vi, afterEach } from 'vitest';
import fc from 'fast-check';
import { sanitizeHTML, validateSearch, debounce, sortProducts, handleError } from '../js/modules/utils.js';

describe('utils.js', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('sanitiza caracteres HTML peligrosos', () => {
    expect(sanitizeHTML('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(sanitizeHTML('" & \' < >')).toBe('&quot; &amp; &#39; &lt; &gt;');
    expect(sanitizeHTML(null)).toBe('');
    expect(sanitizeHTML(undefined)).toBe('');
  });

  it('valida búsquedas: trim y longitud máxima', () => {
    expect(validateSearch('  hello  ')).toBe('hello');
    const long = 'x'.repeat(150);
    expect(validateSearch(long).length).toBe(100);
    expect(validateSearch(null)).toBe('');
  });

  it('Property 8: debounce invoca como máximo una vez por ráfaga', () => {
    // Feature: double-impact-store, Property 8: Debounce de búsqueda
    vi.useFakeTimers();
    fc.assert(
      fc.property(fc.array(fc.string(), { minLength: 2, maxLength: 10 }), (inputs) => {
        let callCount = 0;
        const fn = debounce(() => {
          callCount += 1;
        }, 300);
        inputs.forEach((input) => fn(input));
        vi.advanceTimersByTime(350);
        const result = callCount === 1;
        vi.advanceTimersByTime(350);
        return result;
      }),
      { numRuns: 100 }
    );
  });

  it('debounce ejecuta una vez por ráfaga separada', () => {
    vi.useFakeTimers();
    let calls = 0;
    const fn = debounce(() => {
      calls += 1;
    }, 100);
    fn();
    vi.advanceTimersByTime(150);
    fn();
    vi.advanceTimersByTime(150);
    expect(calls).toBe(2);
  });

  it('sortProducts ordena por campo respetando dirección', () => {
    const products = [
      { num: '3', name: 'Charlie' },
      { num: '1', name: 'Alpha' },
      { num: '2', name: 'Bravo' }
    ];
    const asc = sortProducts(products, 'num', true);
    expect(asc.map((p) => p.num)).toEqual(['1', '2', '3']);
    const desc = sortProducts(products, 'name', false);
    expect(desc.map((p) => p.name)).toEqual(['Charlie', 'Bravo', 'Alpha']);
    expect(sortProducts(null, 'num', true)).toEqual([]);
  });

  it('handleError no lanza errores', () => {
    expect(() => handleError('test', new Error('boom'))).not.toThrow();
  });
});