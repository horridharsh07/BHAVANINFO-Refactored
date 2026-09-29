const fs = require('fs');
const assert = require('assert');

console.log('🧪 Verifying Floating AI Bot Docked on Right Edge Hiding...');

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('src/styles/gov-theme.css', 'utf8');
const appJs = fs.readFileSync('src/app.js', 'utf8');

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;

let passed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    process.exit(1);
  }
}

// 1. HTML structure
test('index.html contains #btn-open-ai-assistant with SVG bot icon and tuck button', () => {
  assert.ok(html.includes('id="btn-open-ai-assistant"'), 'Missing #btn-open-ai-assistant');
  assert.ok(html.includes('class="ai-assistant-fab"'), 'Missing .ai-assistant-fab');
  assert.ok(html.includes('id="btn-tuck-ai-assistant"'), 'Missing #btn-tuck-ai-assistant');
  assert.ok(html.includes('<svg width="20" height="20"'), 'Missing SVG bot icon');
  assert.ok(html.includes('Bhu-Samvaad AI'), 'Missing Bhu-Samvaad AI text');
});

// 2. CSS right side screen docking & hiding
test('CSS docks .ai-assistant-fab to right side screen with translateX hiding', () => {
  assert.ok(css.includes('.ai-assistant-fab {'), 'Missing .ai-assistant-fab in CSS');
  assert.ok(css.includes('right: 0;'), 'Not docked to right: 0');
  assert.ok(css.includes('top: 50%;'), 'Not positioned top: 50%');
  assert.ok(css.includes('translateX(calc(100% - 46px))'), 'Missing resting hiding translateX');
  assert.ok(css.includes('z-index: 99998;'), 'Missing z-index: 99998');
});

test('CSS expands .ai-assistant-fab on hover/peek', () => {
  assert.ok(css.includes('.ai-assistant-fab:hover'), 'Missing hover style');
  assert.ok(css.includes('translateX(0)'), 'Missing hover expansion translateX(0)');
});

test('CSS supports deeper .is-tucked state', () => {
  assert.ok(css.includes('.ai-assistant-fab.is-tucked'), 'Missing .is-tucked style');
  assert.ok(css.includes('translateX(calc(100% - 14px))'), 'Missing deeper tuck translateX');
});

test('CSS anchors .ai-assistant-panel to the right side of the screen', () => {
  assert.ok(css.includes('.ai-assistant-panel {'), 'Missing .ai-assistant-panel in CSS');
  assert.ok(css.includes('z-index: 99999;'), 'Missing z-index: 99999');
  assert.ok(css.includes('right: 20px;'), 'Panel not anchored to right side');
});

// 3. app.js functionality
test('app.js handles tucking, toggling, and Escape closing', () => {
  assert.ok(appJs.includes('btn-tuck-ai-assistant'), 'Missing tuck button handler in app.js');
  assert.ok(appJs.includes('is-tucked'), 'Missing is-tucked class toggling in app.js');
  assert.ok(appJs.includes('is-open'), 'Missing is-open class handling in app.js');
});

// 4. Zero emojis
test('Zero emojis in index.html, src/app.js, and gov-theme.css', () => {
  [html, css, appJs].forEach((f, idx) => {
    const matches = f.split('\n').filter(l => emojiRegex.test(l));
    assert.strictEqual(matches.length, 0, `Found emojis in file ${idx}: ${matches.join(' | ')}`);
  });
});

console.log(`\n🎉 ALL ${passed} TESTS PASSED! Floating bot is elegantly docked and hiding on the right side screen.`);
