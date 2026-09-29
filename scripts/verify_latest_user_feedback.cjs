const fs = require('fs');
const assert = require('assert');

console.log('🧪 Verifying Latest User Feedback Fixes...');

let passed = 0;
let failed = 0;

function test(desc, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

const html = fs.readFileSync('index.html', 'utf8');
const appJs = fs.readFileSync('src/app.js', 'utf8');
const css = fs.readFileSync('src/styles/gov-theme.css', 'utf8');

// 1. Plane box with number 1 (#btn-nav-notifications) completely removed
test('#btn-nav-notifications (plane box with number 1) completely removed from index.html', () => {
  assert(!html.includes('id="btn-nav-notifications"'), 'index.html still contains #btn-nav-notifications');
  assert(!html.includes('id="top-nav-notif-badge"'), 'index.html still contains #top-nav-notif-badge');
});

// 2. Building Scan removed from top navbar
test('"Building Scan" removed as a separate feature on top in navbar', () => {
  assert(!html.includes('id="tour-nav-scan"'), 'index.html still contains #tour-nav-scan');
  assert(!html.includes('>Building Scan<'), 'index.html nav-links still contains >Building Scan<');
});

// 3. 2-Phase GPS & Exterior scan integrated into "+ Add / Survey Building" modal
test('2-Phase GPS & Exterior Scan button integrated in #register-property-modal', () => {
  assert(html.includes('id="btn-manual-gps-scan"'), 'Missing #btn-manual-gps-scan');
  assert(html.includes('startManualScanFromModal()'), 'Missing startManualScanFromModal() trigger');
  assert(appJs.includes('startManualScanFromModal()'), 'app.js missing startManualScanFromModal method');
});

// 4. Landing page hides navigation bar ("landing is just a landing page")
test('govNav is hidden on landing page and shown on other pages', () => {
  assert(appJs.includes("govNav.style.display = (viewName === 'landing') ? 'none' : 'flex';"), 'govNav display logic incorrect');
});

// 5. Landing page top bar shows Sign In and Officer Login
test('Landing page top bar contains Sign In and Officer Login buttons', () => {
  assert(html.includes('id="btn-top-citizen-signin"'), 'Missing #btn-top-citizen-signin');
  assert(html.includes('id="btn-top-officer-login"'), 'Missing #btn-top-officer-login');
});

// 6. Officer Portal filter is fully functional
test('Officer Portal contains switchOfficerTab and live search filter', () => {
  assert(html.includes('id="officer-search-input"'), 'Missing #officer-search-input');
  assert(appJs.includes('switchOfficerTab(tabName)'), 'Missing switchOfficerTab method in app.js');
  assert(appJs.includes('filterOfficerTable(query)'), 'Missing filterOfficerTable method in app.js');
  assert(appJs.includes('applyOfficerFilter()'), 'Missing applyOfficerFilter method in app.js');
  assert(appJs.includes('renderOfficerTableRows('), 'Missing renderOfficerTableRows method in app.js');
});

// 7. Officer table tabs have live counter badges
test('Officer portal tabs contain live counter elements', () => {
  assert(html.includes('id="officer-tab-count-all"'), 'Missing #officer-tab-count-all');
  assert(html.includes('id="officer-tab-count-approvals"'), 'Missing #officer-tab-count-approvals');
  assert(html.includes('id="officer-tab-count-violations"'), 'Missing #officer-tab-count-violations');
  assert(html.includes('id="officer-tab-count-verified"'), 'Missing #officer-tab-count-verified');
});

// 8. Zero emojis in codebase
test('Zero emojis in index.html, app.js, and server.js', () => {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;
  const srv = fs.readFileSync('server.js', 'utf8');
  assert.strictEqual(html.split('\n').filter(l => emojiRegex.test(l)).length, 0, 'Emojis in index.html');
  assert.strictEqual(appJs.split('\n').filter(l => emojiRegex.test(l)).length, 0, 'Emojis in app.js');
  assert.strictEqual(srv.split('\n').filter(l => emojiRegex.test(l)).length, 0, 'Emojis in server.js');
});

// 9. Natural page scrolling enabled
test('Natural scrolling enabled on body and viewport', () => {
  assert(css.includes('overflow-y: auto;'), 'body missing overflow-y: auto;');
  assert(!css.includes('overflow: hidden;\n  height: 100vh;'), 'body still contains overflow: hidden; height: 100vh;');
});

console.log(`\nResults: ${passed} Passed, ${failed} Failed\n`);
if (failed > 0) process.exit(1);
