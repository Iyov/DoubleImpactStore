// Feature: double-impact-store, Property 6: Fechas relativas de Instagram
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  detectConsole,
  filterPostsByConsole,
  formatRelativeDate
} from '../js/modules/instagram.js';

const aliases = {
  ps4: { aliases: ['PS4', 'PlayStation 4'], label: 'PlayStation 4' },
  snes: { aliases: ['SNES', 'Super Nintendo'], label: 'Super Nintendo' }
};

describe('instagram.js', () => {
  it('Property 6: formatRelativeDate siempre devuelve texto no vacío', () => {
    // Feature: double-impact-store, Property 6: Fechas relativas de Instagram
    fc.assert(
      fc.property(fc.date({ max: new Date() }), fc.constantFrom('es', 'en'), (date, lang) => {
        const output = formatRelativeDate(date, lang);
        return typeof output === 'string' && output.length > 0;
      }),
      { numRuns: 100 }
    );
  });

  it('formatea fechas relativas correctamente en es y en', () => {
    const now = Date.now();
    const minuteAgo = new Date(now - 60 * 1000);
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(minuteAgo, 'es')).toMatch(/^Hace 1 minuto$/);
    expect(formatRelativeDate(minuteAgo, 'en')).toMatch(/^1 minute ago$/);
    expect(formatRelativeDate(dayAgo, 'es')).toMatch(/^Hace 1 día$/);
    expect(formatRelativeDate(dayAgo, 'en')).toMatch(/^1 day ago$/);
    expect(formatRelativeDate('texto inválido', 'es')).toBe('');
  });

  it('detectConsole identifica la consola por aliases', () => {
    expect(detectConsole({ title: 'PlayStation 4 | 06/Ago/26' }, aliases)).toBe('ps4');
    expect(detectConsole({ title: 'SNES CIB + extras' }, aliases)).toBe('snes');
    expect(detectConsole({ title: 'N64 Mario 64' }, aliases)).toBeNull();
    expect(detectConsole({ title: 'PS4' }, null)).toBeNull();
  });

  it('filterPostsByConsole filtra y clona en "all"', () => {
    const posts = [
      { id: '1', title: 'PS4 God of War' },
      { id: '2', title: 'SNES Zelda' },
      { id: '3', title: 'N64 Mario' }
    ];
    expect(filterPostsByConsole(posts, 'ps4', aliases).map((p) => p.id)).toEqual(['1']);
    expect(filterPostsByConsole(posts, 'all', aliases).length).toBe(3);
    expect(filterPostsByConsole(posts, 'all', aliases)).not.toBe(posts);
    expect(filterPostsByConsole(posts, null, aliases).length).toBe(3);
  });
});