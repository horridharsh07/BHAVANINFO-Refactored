const fs = require('fs');
const assert = require('assert');

console.log('🧪 Verifying Landing Page Auth-Only & Redirection Architecture...');

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

// 1. Auto-collapse / hiding header is eradicated
test('Header auto-collapse / hiding timers and compact bar are eradicated', () => {
  assert(!html.includes('id="compact-name-bar"'), 'index.html still has compact-name-bar');
  assert(!appJs.includes('this.collapseHeaderToNameOnly()'), 'app.js still calls collapseHeaderToNameOnly()');
  assert(css.includes('.collapsible-header-wrapper.collapsed {\n  max-height: none !important;'), 'CSS still collapses header');
});

// 2. Landing page top bar contains strictly only two buttons: Citizen and Authority
test('Landing page top bar contains strictly only Citizen Sign In and Authority Login buttons', () => {
  assert(html.includes('id="btn-top-citizen-signin"'), 'Missing #btn-top-citizen-signin');
  assert(html.includes('id="btn-top-officer-login"'), 'Missing #btn-top-officer-login');
  assert(html.includes('Citizen Sign In</span>'), 'Missing Citizen Sign In text');
  assert(html.includes('Authority Login</span>'), 'Missing Authority Login text');
  // Accessibility controls are hidden from visible view
  assert(html.includes('class="accessibility-controls" role="toolbar" aria-label="Accessibility Options" style="display: none;"'), 'Accessibility controls not hidden on landing');
});

// 3. gov-nav is hidden on landing page
test('gov-nav is hidden on landing page and only shown after login / redirection', () => {
  assert(html.includes('<nav class="gov-nav" style="display: none;">'), 'gov-nav not hidden by default in index.html');
  assert(appJs.includes("govNav.style.display = (viewName === 'landing') ? 'none' : 'flex';"), 'gov-nav not controlled in switchView');
});

// 4. Landing page carousel contains NO unauthenticated redirection
test('Hero carousel contains only Citizen Sign In and Authority Login CTA buttons', () => {
  const carouselHtml = html.substring(html.indexOf('id="hero-carousel"'), html.indexOf('id="section-quick-access"'));
  assert(!carouselHtml.includes("switchView('map')"), 'Carousel still redirects to map');
  assert(!carouselHtml.includes("switchView('report')"), 'Carousel still redirects to report');
  assert(!carouselHtml.includes("switchView('twin')"), 'Carousel still redirects to twin');
  assert(!carouselHtml.includes("switchView('scan')"), 'Carousel still redirects to scan');
  assert(carouselHtml.includes("openLoginModal('citizen')"), 'Carousel missing citizen auth trigger');
  assert(carouselHtml.includes("openLoginModal('officer')"), 'Carousel missing officer auth trigger');
});

// 5. Landing quick access services cards prompt authentication
test('Quick access cards on landing page require login rather than direct redirection', () => {
  assert(!html.includes('<button type="button" class="quick-card" onclick="window.app && window.app.switchView('), 'Quick card still redirects without auth');
});

// 6. loginUser redirects Citizen to dashboard and Authority to officer
test('loginUser redirects based on role and reveals gov-nav on authenticated pages', () => {
  assert(appJs.includes("this.switchView('officer');"), 'loginUser missing officer redirection');
  assert(appJs.includes("this.switchView('dashboard');"), 'loginUser missing dashboard redirection');
  assert(appJs.includes("this.closeLoginModal();"), 'loginUser does not close login modal');
});

// 7. logoutUser clears session, redirects to landing, and hides gov-nav
test('logoutUser redirects to landing and hides gov-nav', () => {
  assert(appJs.includes("this.currentUser = null;"), 'logoutUser does not clear user');
  assert(appJs.includes("govNav.style.display = 'none';"), 'logoutUser does not hide govNav');
  assert(appJs.includes("this.switchView('landing');"), 'logoutUser does not return to landing');
});

// 8. openLoginModal supports role targeting separate dedicated modals
test('openLoginModal activates respective citizen or authority dedicated modal', () => {
  assert(appJs.includes("openLoginModal(role = 'citizen')"), 'openLoginModal does not support role parameter');
  assert(appJs.includes("modal-officer-login"), 'openLoginModal does not open modal-officer-login');
  assert(appJs.includes("modal-citizen-login"), 'openLoginModal does not open modal-citizen-login');
});

console.log(`\nResults: ${passed} Passed, ${failed} Failed\n`);
if (failed > 0) process.exit(1);
