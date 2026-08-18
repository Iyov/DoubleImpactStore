// Feature: double-impact-store, Property 4: Filtros del catálogo
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  GOOGLE_SHEETS_CSV_URL,
  DEFAULT_PER_PAGE,
  parseCSV,
  parseCatalogCSV,
  filterProducts,
  paginateProducts
} from '../js/modules/products.js';

describe('products.js', () => {
  it('la URL del catálogo apunta a la hoja de cálculo correcta', () => {
    expect(GOOGLE_SHEETS_CSV_URL).toContain('1ekyKZHhUIwQDFtqEblnJN_5SNeYEqOlKOja1wnCutLY');
    expect(DEFAULT_PER_PAGE).toBe(25);
  });

  it('Property 4: filtros por plataforma son correctos y completos', () => {
    // Feature: double-impact-store, Property 4: Filtros del catálogo
    const productArb = fc.record({
      name: fc.string(),
      platform: fc.string(),
      sold: fc.boolean(),
      num: fc.string()
    });
    fc.assert(
      fc.property(fc.array(productArb), fc.array(fc.string(), { minLength: 1 }), (products, platforms) => {
        const result = filterProducts(products, '', platforms, true);
        const included = products.filter((p) => platforms.includes(p.platform));
        const subsetOk = result.every((p) => platforms.includes(p.platform));
        const completeOk = included.every((p) => result.includes(p));
        return subsetOk && completeOk;
      }),
      { numRuns: 100 }
    );
  });

  it('filtra productos vendidos cuando showSold es false', () => {
    const products = [
      { name: 'A', platform: 'PS1', sold: true },
      { name: 'B', platform: 'PS1', sold: false }
    ];
    expect(filterProducts(products, '', [], false).length).toBe(1);
    expect(filterProducts(products, '', [], true).length).toBe(2);
  });

  it('filtra por texto de búsqueda en nombre, plataforma y número', () => {
    const products = [
      { name: 'Resident Evil', platform: 'PS1', num: '10' },
      { name: 'Metal Gear', platform: 'PS2', num: '20' }
    ];
    expect(filterProducts(products, 'resident', [], true).length).toBe(1);
    expect(filterProducts(products, 'ps2', [], true).length).toBe(1);
    expect(filterProducts(products, '10', [], true).length).toBe(1);
  });

  it('parseCSV maneja comillas y saltos de línea incrustados', () => {
    const csv = 'Num,Product,Platform\n1,"Super Mario, World (SNES)",SNES\n2,"Multi\nLine",NES\n';
    const rows = parseCSV(csv);
    expect(rows).toEqual([
      ['Num', 'Product', 'Platform'],
      ['1', 'Super Mario, World (SNES)', 'SNES'],
      ['2', 'Multi\nLine', 'NES']
    ]);
  });

  it('parseCatalogCSV mapea columnas y construye enlaces de Instagram', () => {
    const csv = 'Num,Product,Platform,Price,Neto,Stock,Link,Sold\n1,Metal Gear Solid CI,BPS1,20000,18000,1,DbuYdn8lTVI,0\n2,Super Mario 64,SNES,50000,45000,0,,1\n';
    const products = parseCatalogCSV(csv);
    expect(products.length).toBe(2);
    expect(products[0]).toMatchObject({
      num: '1',
      name: 'Metal Gear Solid CI',
      platform: 'BPS1',
      price: '20000',
      neto: '18000',
      instagramLink: 'https://www.instagram.com/p/DbuYdn8lTVI/',
      sold: false
    });
    expect(products[1].sold).toBe(true);
    expect(products[1].instagramLink).toBe('');
  });

  it('parseCatalogCSV retorna vacío si no hay encabezados', () => {
    expect(parseCatalogCSV('')).toEqual([]);
    expect(parseCatalogCSV('Solo\nUna\nColumna')).toEqual([]);
  });

  it('paginateProducts pagina, recorta páginas y calcula totales', () => {
    const products = Array.from({ length: 60 }, (_, i) => ({ name: `Juego ${i}`, platform: 'PS1' }));
    const page1 = paginateProducts(products, 1, 25);
    expect(page1.total).toBe(60);
    expect(page1.totalPages).toBe(3);
    expect(page1.items.length).toBe(25);
    const page3 = paginateProducts(products, 3, 25);
    expect(page3.items.length).toBe(10);
    expect(paginateProducts(products, 99, 25).page).toBe(3);
    expect(paginateProducts(products, 0, 25).page).toBe(1);
    expect(paginateProducts([], 1, 25).totalPages).toBe(1);
    expect(paginateProducts(products, 1, 0).perPage).toBe(DEFAULT_PER_PAGE);
  });
});