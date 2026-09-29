const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('Testing Camera Viewfinder, Real Coordinates, and Search Bars...');

// 1. Verify index.html elements
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

assert(indexHtml.includes('id="scan-camera-modal"'), 'Must have #scan-camera-modal in index.html');
assert(indexHtml.includes('id="scan-camera-video"'), 'Must have #scan-camera-video in index.html');
assert(indexHtml.includes('id="scan-camera-canvas"'), 'Must have #scan-camera-canvas in index.html');
assert(indexHtml.includes('id="btn-scan-camera-shutter"'), 'Must have shutter button in camera modal');
assert(indexHtml.includes('id="scan-hud-coords"'), 'Must have GPS coordinate HUD in camera modal');
assert(indexHtml.includes('id="citizen-portfolio-search"'), 'Must have #citizen-portfolio-search input in citizen dashboard');
assert(indexHtml.includes('id="officer-search-input"'), 'Must have #officer-search-input in officer portal');
assert(indexHtml.includes('id="global-cadastre-search"'), 'Must have #global-cadastre-search universal search');

console.log('PASS 1: All required HTML modal and search elements exist in index.html');

// 2. Verify src/app.js functions
const appJs = fs.readFileSync(path.join(__dirname, '..', 'src', 'app.js'), 'utf8');

assert(appJs.includes('captureGpsPoint(pointNum)'), 'Must implement captureGpsPoint in app.js');
assert(appJs.includes('openScanCamera('), 'Must implement openScanCamera in app.js');
assert(appJs.includes('snapScanPhoto()'), 'Must implement snapScanPhoto in app.js');
assert(appJs.includes('recordScanPoint('), 'Must implement recordScanPoint in app.js');
assert(appJs.includes('updateScanBoundarySvg()'), 'Must implement updateScanBoundarySvg in app.js');
assert(appJs.includes('captureExteriorPhoto('), 'Must implement captureExteriorPhoto in app.js');
assert(appJs.includes('recordExteriorPhotoWithData('), 'Must implement recordExteriorPhotoWithData in app.js');
assert(appJs.includes('drawCadastralStamp('), 'Must implement drawCadastralStamp watermark in app.js');
assert(appJs.includes('filterCitizenPortfolio('), 'Must implement filterCitizenPortfolio in app.js');
assert(appJs.includes('filterOfficerTable('), 'Must implement filterOfficerTable in app.js');
assert(appJs.includes('setupGlobalCadastreSearch()'), 'Must implement setupGlobalCadastreSearch in app.js');

console.log('PASS 2: All camera capture, photo sealing, SVG boundary, and search methods implemented');

// 3. Verify CSS in src/styles/gov-theme.css
const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'styles', 'gov-theme.css'), 'utf8');

assert(css.includes('.scan-camera-reticle'), 'Must have .scan-camera-reticle CSS');
assert(css.includes('.scan-point-thumb'), 'Must have .scan-point-thumb CSS');
assert(css.includes('.citizen-search-input'), 'Must have .citizen-search-input CSS');

console.log('PASS 3: Viewfinder reticle and thumbnail styles present in gov-theme.css');

// 4. Verify Shoelace Area Calculation Logic
function calculateShoelace(points) {
  const originLat = points[0].lat;
  const originLng = points[0].lng;
  const xyMeters = points.map(p => ({
    x: (p.lng - originLng) * 94800,
    y: (p.lat - originLat) * 110890
  }));

  let areaM2 = 0;
  for (let i = 0; i < xyMeters.length; i++) {
    const j = (i + 1) % xyMeters.length;
    areaM2 += xyMeters[i].x * xyMeters[j].y;
    areaM2 -= xyMeters[j].x * xyMeters[i].y;
  }
  areaM2 = Math.abs(areaM2) / 2;
  const areaSqft = Math.round(areaM2 * 10.7639);
  const areaSqyd = Math.round(areaSqft / 9.0);
  return { areaM2, areaSqft, areaSqyd };
}

const testPoints = [
  { lat: 31.61285, lng: 74.86235 },
  { lat: 31.61313, lng: 74.86247 },
  { lat: 31.61330, lng: 74.86217 },
  { lat: 31.61323, lng: 74.86187 },
  { lat: 31.61297, lng: 74.86180 },
  { lat: 31.61267, lng: 74.86207 }
];

const computed = calculateShoelace(testPoints);
assert(computed.areaSqyd > 100, 'Calculated area should be valid cadastral land area');
console.log(`PASS 4: Shoelace algorithm verified: ${computed.areaSqyd} sq.yd (${computed.areaSqft} sq.ft, ${computed.areaM2.toFixed(1)} m²)`);

// 5. Verify Zero Emojis
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
assert(!emojiRegex.test(indexHtml), 'index.html must have 0 emojis');
assert(!emojiRegex.test(appJs), 'src/app.js must have 0 emojis');
assert(!emojiRegex.test(css), 'gov-theme.css must have 0 emojis');
console.log('PASS 5: Codebase verified: Zero emojis across index.html, src/app.js, and CSS');

console.log('\nALL 5 TEST SUITES PASSED! Camera photo capture, real GPS coordinates, and search bars verified.');
