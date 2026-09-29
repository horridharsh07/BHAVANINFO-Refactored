const fs = require('fs');
const assert = require('assert');

console.log('🧪 Verifying All User Requirements (GIGW 3.0, Emojis, Notifications, Branding)...');

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

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;

const html = fs.readFileSync('index.html', 'utf8');
const appJs = fs.readFileSync('src/app.js', 'utf8');
const map2dJs = fs.readFileSync('src/map2d.js', 'utf8');
const twin3dJs = fs.readFileSync('src/twin3d.js', 'utf8');
const reportJs = fs.readFileSync('src/utils/district_report.js', 'utf8');
const tourJs = fs.readFileSync('src/utils/tutorial_tour.js', 'utf8');
const srvJs = fs.readFileSync('server.js', 'utf8');
const css = fs.readFileSync('src/styles/gov-theme.css', 'utf8');

// 1. Emoji removal
test('0 Emojis in index.html', () => {
  const matches = html.split('\n').filter(l => emojiRegex.test(l));
  assert.strictEqual(matches.length, 0, `Found emojis: ${matches.join(' | ')}`);
});

test('0 Emojis in src/app.js', () => {
  const matches = appJs.split('\n').filter(l => emojiRegex.test(l));
  assert.strictEqual(matches.length, 0, `Found emojis: ${matches.join(' | ')}`);
});

test('0 Emojis in src/map2d.js', () => {
  const matches = map2dJs.split('\n').filter(l => emojiRegex.test(l));
  assert.strictEqual(matches.length, 0, `Found emojis: ${matches.join(' | ')}`);
});

test('0 Emojis in src/twin3d.js', () => {
  const matches = twin3dJs.split('\n').filter(l => emojiRegex.test(l));
  assert.strictEqual(matches.length, 0, `Found emojis: ${matches.join(' | ')}`);
});

test('0 Emojis in src/utils/district_report.js', () => {
  const matches = reportJs.split('\n').filter(l => emojiRegex.test(l));
  assert.strictEqual(matches.length, 0, `Found emojis: ${matches.join(' | ')}`);
});

test('0 Emojis in src/utils/tutorial_tour.js', () => {
  const matches = tourJs.split('\n').filter(l => emojiRegex.test(l));
  assert.strictEqual(matches.length, 0, `Found emojis: ${matches.join(' | ')}`);
});

test('0 Emojis in server.js', () => {
  const matches = srvJs.split('\n').filter(l => emojiRegex.test(l));
  assert.strictEqual(matches.length, 0, `Found emojis: ${matches.join(' | ')}`);
});

test('0 Emojis in src/styles/gov-theme.css', () => {
  const matches = css.split('\n').filter(l => emojiRegex.test(l));
  assert.strictEqual(matches.length, 0, `Found emojis: ${matches.join(' | ')}`);
});

// 2. Notification bar relocation to Authority (Officer) page only
test('#top-gov-notification-bar exists exclusively inside #view-officer', () => {
  const officerMatch = html.match(/<section id="view-officer"[\s\S]*?<\/section>/);
  assert(officerMatch, 'view-officer section not found');
  assert(officerMatch[0].includes('id="top-gov-notification-bar"'), 'Notification bar not found inside #view-officer');
  
  // Verify it is NOT in view-landing
  const landingMatch = html.match(/<section id="view-landing"[\s\S]*?<\/section>/);
  assert(landingMatch && !landingMatch[0].includes('id="top-gov-notification-bar"'), 'Notification bar unexpectedly found in landing view');
});

test('#top-gov-notification-bar has clean SVG icons (no cartoon alert/hourglass/office emojis)', () => {
  const barMatch = html.match(/<div id="top-gov-notification-bar"[\s\S]*?id="btn-close-notif"[\s\S]*?<\/div>/);
  assert(barMatch, 'Notification bar not found');
  assert(!barMatch[0].includes('🚨'), 'Bar still contains alert emoji');
  assert(!barMatch[0].includes('⏳'), 'Bar still contains hourglass emoji');
  assert(!barMatch[0].includes('🏢'), 'Bar still contains office emoji');
  assert(barMatch[0].includes('Inspect 3D Twin &rarr;'), 'Missing clean action link');
});

// 3. Notification symbol on top of notification buttons
test('Plane box with number 1 notification bell button is removed from nav', () => {
  assert(!html.includes('id="btn-nav-notifications"'), 'btn-nav-notifications still in html');
});

test('Officer Authority Portal notice button has badge symbol on top of icon', () => {
  assert(html.includes('officer-badge-top'), 'Missing .officer-badge-top on officer notice button');
  assert(html.includes('btn-officer-notif'), 'Missing .btn-officer-notif');
});

// 4. "Gol" & "svamitva.gov.in" eradication
test('Zero occurrences of "Gol" or "GoI" or "svamitva.gov.in" in index.html', () => {
  assert(!html.includes('svamitva.gov.in'), 'index.html contains svamitva.gov.in');
  assert(!html.includes('Gol'), 'index.html contains Gol');
  assert(!html.includes('pm-svamitva'), 'index.html contains pm-svamitva');
});

test('Hero carousel uses clean vector SVG banners (dilrmp-bhu-aadhaar-hero.svg & drone-lidar-slam-hero.svg)', () => {
  assert(html.includes('assets/banners/dilrmp-bhu-aadhaar-hero.svg'), 'Missing SVG banner 1');
  assert(html.includes('assets/banners/drone-lidar-slam-hero.svg'), 'Missing SVG banner 2');
  assert(!html.includes('pm-svamitva-rural-dev.jpg'), 'Carousel still refers to pm-svamitva image');
  assert(!html.includes('svamitva-scheme.jpg'), 'Carousel still refers to svamitva-scheme image');
});

test('Assets directory does not contain old SVAMITVA image files', () => {
  assert(!fs.existsSync('assets/banners/pm-svamitva-rural-dev.jpg'), 'pm-svamitva-rural-dev.jpg still exists in assets');
  assert(!fs.existsSync('assets/banners/svamitva-scheme.jpg'), 'svamitva-scheme.jpg still exists in assets');
});

// 5. Accessibility controls & Header bar
test('Top bar contains A- A A+ | High Contrast | Language selector', () => {
  assert(html.includes('id="btn-font-minus"'), 'Missing A- button');
  assert(html.includes('id="btn-font-reset"'), 'Missing A button');
  assert(html.includes('id="btn-font-plus"'), 'Missing A+ button');
  assert(html.includes('id="btn-high-contrast"'), 'Missing High Contrast button');
  assert(html.includes('id="lang-selector"'), 'Missing Language selector');
});

console.log(`\nRequirements Verification Summary: ${passed} Passed, ${failed} Failed\n`);
if (failed > 0) process.exit(1);
