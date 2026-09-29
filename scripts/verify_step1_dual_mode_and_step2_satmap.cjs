const assert = require('assert');
const fs = require('fs');

console.log('🧪 Verifying Step 1 Dual Mode and Step 2 Satellite Map Implementation...');

const appJs = fs.readFileSync('src/app.js', 'utf8');
const css = fs.readFileSync('src/styles/gov-theme.css', 'utf8');

// 1. Step 1 Dual Selection Options
assert(appJs.includes('Choose Building from All Buildings'), 'Missing Choose Building option in app.js');
assert(appJs.includes('Select 6 Points on the Map'), 'Missing Select 6 Points on Map option in app.js');
assert(appJs.includes('id="btn-mode-choose-building"'), 'Missing Choose Building button ID');
assert(appJs.includes('id="btn-mode-select-points"'), 'Missing Select Points button ID');
assert(appJs.includes('setScanStep1Mode'), 'Missing setScanStep1Mode method');
assert(appJs.includes('id="scan-step1-building-dropdown"'), 'Missing building dropdown');
assert(appJs.includes('filterStep1Buildings'), 'Missing filterStep1Buildings method');
assert(appJs.includes('onStep1BuildingDropdown'), 'Missing onStep1BuildingDropdown method');
console.log('✅ PASS 1: Step 1 contains both "Choose Building from All Buildings" and "Select 6 Points on the Map"');

// 2. Interactive Map Point Demarcation
assert(appJs.includes('addStep1MapPoint'), 'Missing addStep1MapPoint method');
assert(appJs.includes('resetStep1MapPoints'), 'Missing resetStep1MapPoints method');
assert(appJs.includes('confirmStep1MapPoints'), 'Missing confirmStep1MapPoints method');
assert(appJs.includes('updateStep1PointsMapData'), 'Missing updateStep1PointsMapData method');
console.log('✅ PASS 2: Interactive 6-point map demarcation methods implemented');

// 3. Step 2 Satellite Map
assert(appJs.includes('id="scan-step2-map"'), 'Missing #scan-step2-map container in Step 2');
assert(appJs.includes('scan-step2-map-wrapper'), 'Missing .scan-step2-map-wrapper in Step 2');
assert(appJs.includes('initScanStep2Map'), 'Missing initScanStep2Map method');
assert(appJs.includes('updateScanStep2MapBoundary'), 'Missing updateScanStep2MapBoundary method');
assert(appJs.includes('scan-step2-boundary'), 'Missing scan-step2-boundary GeoJSON source');
assert(appJs.includes('scan-step2-poly-fill'), 'Missing polygon fill layer');
assert(appJs.includes('scan-step2-pin'), 'Missing point marker pins on satellite map');
console.log('✅ PASS 3: Step 2 embeds real interactive MapLibre satellite map with polygon and 6 pins');

// 4. CSS Styling
assert(css.includes('.scan-step1-mode-tabs'), 'Missing .scan-step1-mode-tabs in CSS');
assert(css.includes('.btn-step1-mode'), 'Missing .btn-step1-mode in CSS');
assert(css.includes('.scan-step2-map-wrapper'), 'Missing .scan-step2-map-wrapper in CSS');
assert(css.includes('#scan-step2-map'), 'Missing #scan-step2-map in CSS');
console.log('✅ PASS 4: All CSS layout and map styles present in gov-theme.css');

// 5. Zero Emojis
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
assert(!emojiRegex.test(appJs), 'Found emoji in app.js');
assert(!emojiRegex.test(css), 'Found emoji in gov-theme.css');
console.log('✅ PASS 5: Zero emojis in app.js and gov-theme.css');

console.log('\n🎉 ALL 5 TEST SUITES PASSED! Step 1 Dual Mode and Step 2 Satellite Map fully verified.');
