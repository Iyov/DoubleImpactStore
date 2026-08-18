// Fixtures compartidos para tests E2E del catálogo.

const PRODUCTS = [
  ['1', 'Metal Gear Solid CIB+', 'PS1', '25000', '22500', '', 'DbuYdn8lTVI', '0'],
  ['2', 'Resident Evil 2 MM', 'PS1', '22000', '19800', '', '', '0'],
  ['3', 'Final Fantasy VII CIB+', 'PS1', '40000', '36000', '1', '', '0'],
  ['4', 'Gran Turismo 2', 'PS1', '12000', '10800', '', '', '1'],
  ['5', 'Crash Bandicoot Warped', 'PS1', '15000', '13500', '', '', '0'],
  ['6', 'Silent Hill MM', 'PS1', '30000', '27000', '1', '', '0'],
  ['7', 'Tomb Raider II', 'PS1', '13000', '11700', '', '', '0'],
  ['8', 'Spyro the Dragon', 'PS1', '16000', '14400', '', '', '0'],
  ['9', 'Tony Hawk Pro Skater 2', 'PS1', '14000', '12600', '', '', '0'],
  ['10', 'Castlevania Symphony of the Night', 'PS1', '35000', '31500', '', '', '0'],
  ['11', 'Super Mario World CIB+', 'SNES', '30000', '27000', '', '', '0'],
  ['12', 'Zelda A Link to the Past', 'SNES', '28000', '25200', '', '', '0'],
  ['13', 'Donkey Kong Country', 'SNES', '24000', '21600', '', '', '0'],
  ['14', 'Super Metroid', 'SNES', '32000', '28800', '', '', '0'],
  ['15', 'Street Fighter II Turbo', 'SNES', '18000', '16200', '', '', '0'],
  ['16', 'Chrono Trigger MM', 'SNES', '55000', '49500', '', '', '0'],
  ['17', 'Mega Man X', 'SNES', '20000', '18000', '', '', '0'],
  ['18', 'Final Fantasy VI', 'SNES', '38000', '34200', '', '', '0'],
  ['19', 'Super Mario 64', 'N64', '20000', '18000', '', '', '0'],
  ['20', 'Zelda Ocarina of Time', 'N64', '26000', '23400', '', '', '0'],
  ['21', 'Mario Kart 64', 'N64', '24000', '21600', '', '', '0'],
  ['22', 'GoldenEye 007', 'N64', '22000', '19800', '', '', '0'],
  ['23', 'Banjo-Kazooie', 'N64', '21000', '18900', '', '', '0'],
  ['24', 'Super Mario Bros 3', 'NES', '15000', '13500', '', '', '0'],
  ['25', 'The Legend of Zelda', 'NES', '18000', '16200', '', '', '0'],
  ['26', 'Metroid', 'NES', '14000', '12600', '', '', '0'],
  ['27', 'Mega Man 2', 'NES', '20000', '18000', '', '', '0'],
  ['28', 'Kirby Adventure', 'NES', '13000', '11700', '', '', '0'],
  ['29', 'Duck Tales', 'NES', '12000', '10800', '', '', '0'],
  ['30', 'Castlevania', 'NES', '16000', '14400', '', '', '0']
];

const HEADERS = 'Num,Product,Platform,Price,Neto,Stock,Link,Sold';

export function buildCatalogCSV() {
  return [HEADERS, ...PRODUCTS.map((row) => row.join(','))].join('\n');
}

export const CATALOG_COUNTS = {
  total: 30,
  available: 29,
  ps1: 10,
  snes: 8,
  n64: 5,
  nes: 7,
  sold: 1
};

export async function mockCatalogRoute(page) {
  await page.route(/\/gviz\/tq/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/csv; charset=utf-8',
      body: buildCatalogCSV()
    })
  );
}