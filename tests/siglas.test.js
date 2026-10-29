// Feature: double-impact-store, Property 5: Detección de siglas
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectSiglas, renderSiglasTooltips } from '../js/modules/siglas.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const testDict = {
  'CIB+': { es: 'Con caja, juego y manual más extras', en: 'Box, game and manual plus extras' },
  'GotY': { es: 'Game of the Year Edition', en: 'Game of the Year Edition' },
  'MM': { es: 'Sin manual', en: 'Missing manual' },
  'L': { es: 'Juego suelto', en: 'Loose' },
  'S': { es: 'Sellado', en: 'Sealed' },
  'C/M': { es: 'Carátula de menta', en: 'Mint cover' }
};

describe('siglas.js', () => {
  it('el diccionario real tiene al menos 40 entradas con es/en no vacíos', () => {
    const dict = JSON.parse(fs.readFileSync(path.join(ROOT, 'js', 'siglas.json'), 'utf8'));
    const keys = Object.keys(dict);
    expect(keys.length).toBeGreaterThanOrEqual(40);
    keys.forEach((key) => {
      expect(dict[key].es && dict[key].es.trim().length).toBeGreaterThan(0);
      expect(dict[key].en && dict[key].en.trim().length).toBeGreaterThan(0);
    });
  });

  it('Property 5: si una sigla aparece literalmente, detectSiglas la incluye', () => {
    // Feature: double-impact-store, Property 5: Detección de siglas
    fc.assert(
      fc.property(
        fc.string({ maxLength: 30 }),
        fc.constantFrom(...Object.keys(testDict)),
        (base, sigla) => {
          const name = `${base} ${sigla}`;
          const result = detectSiglas(name, testDict);
          return result.includes(sigla);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('detecta siglas específicas de ejemplo', () => {
    expect(detectSiglas('Metal Gear Solid CIB+ PS1', testDict)).toContain('CIB+');
    expect(detectSiglas('Zelda GotY L', testDict)).toEqual(expect.arrayContaining(['GotY', 'L']));
    expect(detectSiglas('Nintendo GameCube', testDict)).toEqual([]);
    expect(detectSiglas(null, testDict)).toEqual([]);
    expect(detectSiglas('MM C/M', null)).toEqual([]);
  });

  it('no detecta una sigla corta que solo aparece dentro de una más larga', () => {
    const dict = { CIB: { es: 'Caja, Juego, Manual', en: 'Box, Game, Manual' }, 'CIB+': testDict['CIB+'] };
    expect(detectSiglas('Metal Gear Solid CIB+', dict)).toEqual(['CIB+']);
    expect(detectSiglas('Pack CIB+ y Zelda CIB', dict)).toEqual(['CIB+', 'CIB']);
  });

  it('no detecta siglas dentro de palabras (casos reales del catálogo)', () => {
    const dict = JSON.parse(fs.readFileSync(path.join(ROOT, 'js', 'siglas.json'), 'utf8'));
    expect(detectSiglas('Gran Turismo 2', dict)).toEqual([]);
    expect(detectSiglas('Romance IV', dict)).not.toContain('CE');
    expect(detectSiglas('Rebel Raiders Operation Nighthawk', dict)).not.toContain('GH');
    expect(detectSiglas('Heroes V (MM-Falta disco 1)', dict)).toEqual(['MM']);
    expect(detectSiglas('Romance IV (BL-CIB)', dict)).toEqual(expect.arrayContaining(['BL', 'CIB']));
    expect(detectSiglas('Álbum PAL', dict)).toEqual(['PAL']);
  });

  it('renderSiglasTooltips sanitiza todo el texto, no solo las siglas', () => {
    const el = document.createElement('td');
    el.textContent = '<img src=x onerror="alert(1)"> Zelda CIB+';
    renderSiglasTooltips(el, ['CIB+'], testDict, 'es');
    expect(el.querySelector('img')).toBeNull();
    expect(el.textContent).toContain('<img src=x onerror="alert(1)"> Zelda CIB+');
    expect(el.querySelectorAll('.sigla-tooltip')).toHaveLength(1);
  });

  it('detecta coincidencias sin importar mayúsculas', () => {
    expect(detectSiglas('cib metal gear', { 'CIB': { es: 'x', en: 'y' } })).toEqual(['CIB']);
    expect(detectSiglas('mega drive goty', testDict)).toContain('GotY');
  });
});