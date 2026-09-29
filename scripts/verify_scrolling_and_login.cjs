const fs = require('fs');
const assert = require('assert');

console.log('🧪 Verifying Scrolling, Top Bar Login Options, and Removal of Floating Box...');

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
const css = fs.readFileSync('src/styles/gov-theme.css', 'utf8');
const appJs = fs.readFileSync('src/app.js', 'utf8');

// 1. Scrolling Verification
test('body allows natural vertical scrolling (no overflow:hidden height:100vh)', () => {
  assert(!css.includes('overflow: hidden;\n  height: 100vh;'), 'body still contains overflow: hidden; height: 100vh;');
  assert(css.includes('overflow-y: auto;'), 'body missing overflow-y: auto;');
});

test('.app-viewport allows vertical scrolling (overflow-y: visible)', () => {
  assert(!css.includes('.app-viewport {\n  flex: 1;\n  min-height: 0;\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;'), '.app-viewport still has overflow: hidden;');
  assert(css.includes('overflow-y: visible;'), '.app-viewport missing overflow-y: visible;');
});

test('#view-landing allows smooth vertical page scrolling', () => {
  assert(css.includes('#view-landing.active'), 'CSS missing #view-landing.active scrolling rule');
});

// 2. Top Bar & Nav Login Options
test('Top accessibility bar contains #btn-top-citizen-signin and #btn-top-officer-login (Image 2)', () => {
  assert(html.includes('id="btn-top-citizen-signin"'), 'Missing #btn-top-citizen-signin');
  assert(html.includes('id="btn-top-officer-login"'), 'Missing #btn-top-officer-login');
});

test('Top navigation bar contains #btn-nav-signin and #btn-nav-officer', () => {
  assert(html.includes('id="btn-nav-signin"'), 'Missing #btn-nav-signin');
  assert(html.includes('id="btn-nav-officer"'), 'Missing #btn-nav-officer');
});

test('govNav is hidden on landing page and flex on all other views', () => {
  assert(appJs.includes("govNav.style.display = (viewName === 'landing') ? 'none' : 'flex';"), 'govNav display logic incorrect');
});

// 3. Removal of Floating Controls Box (Image 1)
test('#map-floating-controls is eradicated from index.html (Image 1)', () => {
  assert(!html.includes('id="map-floating-controls"'), '#map-floating-controls still present in index.html');
});

test('#twin-floating-controls is eradicated from index.html (Image 1)', () => {
  assert(!html.includes('id="twin-floating-controls"'), '#twin-floating-controls still present in index.html');
});

test('.floating-controls-cluster is hidden in CSS', () => {
  assert(css.includes('.floating-controls-cluster {\n  display: none !important;\n}'), '.floating-controls-cluster not hidden in CSS');
});

// 4. Emoji check
test('Zero emojis in index.html, including line 885 undo button', () => {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;
  const matches = html.split('\n').filter(l => emojiRegex.test(l));
  assert.strictEqual(matches.length, 0, `Found emojis: ${matches.join(' | ')}`);
});

console.log(`\nVerification Summary: ${passed} Passed, ${failed} Failed\n`);
if (failed > 0) process.exit(1);
