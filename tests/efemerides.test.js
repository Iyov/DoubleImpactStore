// Feature: double-impact-store, Property 9: Efemérides
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getTodayEfemeride, renderEfemeride, formatEfemerideDate } from '../js/modules/efemerides.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const fixture = {
  efemerides: [
    { date: '18/08', ES: { title: 'Aniversario A', text: 'Texto A', det: 'Detalle A' }, EN: { title: 'Anniversary A', text: 'Text A', det: 'Detail A' } },
    { date: '25/12', ES: { title: 'Aniversario B', text: 'Texto B', det: 'Detalle B' }, EN: { title: 'Anniversary B', text: 'Text B', det: 'Detail B' } }
  ]
};

describe('efemerides.js', () => {
  it('Property 9: para cualquier fecha retorna una entrada o null sin lanzar', () => {
    // Feature: double-impact-store, Property 9: Efemérides
    fc.assert(
      fc.property(fc.date(), (date) => {
        const result = getTodayEfemeride(fixture, date);
        return result === null || fixture.efemerides.includes(result);
      }),
      { numRuns: 100 }
    );
  });

  it('retorna la entrada correcta para una fecha con efeméride', () => {
    expect(getTodayEfemeride(fixture, new Date(2026, 7, 18))).toEqual(fixture.efemerides[0]);
    expect(getTodayEfemeride(fixture, new Date(2025, 11, 25))).toEqual(fixture.efemerides[1]);
  });

  it('retorna null para fechas sin efeméride y para datos inválidos', () => {
    expect(getTodayEfemeride(fixture, new Date(2026, 0, 1))).toBeNull();
    expect(getTodayEfemeride(null, new Date())).toBeNull();
    expect(getTodayEfemeride({}, new Date())).toBeNull();
  });

  it('el archivo real tiene 366 entradas con fecha DD/MM', () => {
    const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'js', 'efemerides.json'), 'utf8'));
    expect(Array.isArray(data.efemerides)).toBe(true);
    expect(data.efemerides.length).toBe(366);
    data.efemerides.forEach((entry) => {
      expect(entry.date).toMatch(/^\d{2}\/\d{2}$/);
      expect(entry.ES && entry.ES.title).toBeTruthy();
      expect(entry.EN && entry.EN.title).toBeTruthy();
    });
  });

  it('el archivo real no tiene secuencias \\uXXXX literales (acentos doblemente escapados)', () => {
    const raw = fs.readFileSync(path.join(ROOT, 'js', 'efemerides.json'), 'utf8');
    const data = JSON.parse(raw);
    const texts = data.efemerides.flatMap((entry) =>
      ['ES', 'EN'].flatMap((lang) => ['title', 'text', 'det'].map((key) => (entry[lang] || {})[key] || ''))
    );
    const broken = texts.filter((text) => /\\u[0-9a-fA-F]{4}/.test(text));
    expect(broken).toEqual([]);
  });

  it('formatea la fecha DD/MM en el idioma activo', () => {
    expect(formatEfemerideDate('18/08', 'es')).toBe('18 de agosto');
    expect(formatEfemerideDate('18/08', 'en')).toBe('August 18');
    expect(formatEfemerideDate('29/02', 'es')).toBe('29 de febrero');
    expect(formatEfemerideDate('', 'es')).toBe('');
  });

  it('renderEfemeride usa el idioma pedido (claves ES/EN del JSON con lang en minúscula)', () => {
    document.body.innerHTML = '<section><div id="efemerides-content"></div></section>';
    const container = document.getElementById('efemerides-content');
    const entry = {
      date: '18/08',
      ES: { title: 'Título en español', text: 'Texto', det: 'Detalle' },
      EN: { title: 'English title', text: 'Text', det: 'Detail' }
    };
    renderEfemeride(entry, container, 'en');
    expect(container.querySelector('.efemeride-title').textContent).toBe('English title');
    renderEfemeride(entry, container, 'es');
    expect(container.querySelector('.efemeride-title').textContent).toBe('Título en español');
  });
});
