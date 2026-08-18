// Feature: double-impact-store, Property 9: Efemérides
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getTodayEfemeride } from '../js/modules/efemerides.js';

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
});