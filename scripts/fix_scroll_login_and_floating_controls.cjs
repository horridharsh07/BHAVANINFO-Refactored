const fs = require('fs');

console.log('🚀 Fixing Scrolling, Top Bar Login Options, and Removing Floating Box...');

// ─────────────────────────────────────────────────────────────
// 1. UPDATE src/styles/gov-theme.css (SCROLLING & CONTROLS FIX)
// ─────────────────────────────────────────────────────────────
let css = fs.readFileSync('src/styles/gov-theme.css', 'utf8');

// A. Fix body overflow & height
css = css.replace(/body\s*\{\s*font-family:\s*var\(--font-main\);\s*background-color:\s*var\(--gov-bg\);\s*color:\s*var\(--gov-text\);\s*line-height:\s*1\.5;\s*overflow:\s*hidden;\s*height:\s*100vh;\s*display:\s*flex;\s*flex-direction:\s*column;\s*\}/, 
`html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-main);
  background-color: var(--gov-bg);
  color: var(--gov-text);
  line-height: 1.5;
  min-height: 100vh;
  height: auto;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
}`);

// B. Fix .app-viewport overflow
css = css.replace(/\.app-viewport\s*\{\s*flex:\s*1;\s*min-height:\s*0;\s*position:\s*relative;\s*display:\s*flex;\s*flex-direction:\s*column;\s*overflow:\s*hidden;\s*\}/,
`.app-viewport {
  flex: 1;
  min-height: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: visible;
}`);

// C. Fix .view-panel overflow & heights
const oldViewPanel = `/* View Containers */
.view-panel {
  display: none;
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.view-panel.active {
  display: flex;
  flex-direction: column;
}

#view-dashboard.active,
#view-report.active,
#view-report {
  display: block;
  overflow-y: auto !important;
  height: 100%;
  max-height: 100%;
  -webkit-overflow-scrolling: touch;
}`;

const newViewPanel = `/* View Containers - Multi-page Vertical Scrolling Support */
.view-panel {
  display: none;
  flex: 1;
  min-height: 0;
  width: 100%;
}

.view-panel.active {
  display: block;
  min-height: calc(100vh - 120px);
  overflow-y: visible;
  height: auto;
}

#view-map.active,
#view-twin.active {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 110px);
  overflow: hidden;
}

#view-landing.active,
#view-officer.active,
#view-dashboard.active,
#view-report.active,
#view-scan.active,
#view-register.active {
  display: block;
  overflow-y: visible;
  height: auto;
  min-height: 100%;
  -webkit-overflow-scrolling: touch;
}`;

css = css.replace(oldViewPanel, newViewPanel);

// D. Completely hide .floating-controls-cluster so it never shows
css = css.replace(/\.floating-controls-cluster\s*\{[\s\S]*?box-shadow:\s*0\s*4px\s*16px\s*rgba\(0,\s*0,\s*0,\s*0\.12\);\s*\}/,
`.floating-controls-cluster {
  display: none !important;
}`);

// E. Add styling for top bar login buttons
if (!css.includes('.top-auth-btn')) {
  css += `
/* Top Bar Authentication Buttons */
.top-auth-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 10px;
  font-size: 0.72rem;
  font-weight: 700;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.4;
}

.top-auth-btn.citizen-btn {
  background: #0284c7;
  color: #ffffff;
  border: 1px solid #0369a1;
}

.top-auth-btn.citizen-btn:hover {
  background: #0369a1;
  color: #ffffff;
}

.top-auth-btn.officer-btn {
  background: #1e1b4b;
  color: #ffd700;
  border: 1px solid #ffd700;
}

.top-auth-btn.officer-btn:hover {
  background: #312e81;
  color: #ffffff;
}

.btn-gov-officer-signin {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
  color: #ffd700;
  border: 1px solid #ffd700;
  padding: 6px 14px;
  font-size: 0.8rem;
  font-weight: 700;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-gov-officer-signin:hover {
  background: #1e1b4b;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
}
`;
}

fs.writeFileSync('src/styles/gov-theme.css', css, 'utf8');
console.log('✅ Updated src/styles/gov-theme.css for full scrolling & top auth styles');


// ─────────────────────────────────────────────────────────────
// 2. UPDATE index.html (ADD TOP LOGIN OPTIONS, REMOVE FLOATING CONTROLS)
// ─────────────────────────────────────────────────────────────
let html = fs.readFileSync('index.html', 'utf8');

// A. Add Sign In & Officer Login options to top accessibility bar (Image 2)
const topJurisdictionRegex = /<div id="top-jurisdiction-indicator"[\s\S]*?<\/div>\s*<\/div>/;
const topAuthButtonsHtml = `<div id="top-jurisdiction-indicator" style="font-size: 0.72rem; background: #ffffff; color: #0f172a; padding: 2px 8px; border-radius: 4px; border: 1px solid #cbd5e1; display: flex; align-items: center; gap: 4px; font-weight: 600;">
\t\t\t\t\t<span class="loc-pin-svg" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg></span> <strong id="top-jurisdiction-text">Punjab &bull; Amritsar (Amritsar-I)</strong>
\t\t\t\t</div>
\t\t\t\t<span style="opacity: 0.3;" aria-hidden="true">|</span>
\t\t\t\t<!-- TOP BAR QUICK SIGN IN & OFFICER LOGIN OPTIONS -->
\t\t\t\t<div class="top-auth-actions" style="display: inline-flex; align-items: center; gap: 6px;">
\t\t\t\t\t<button type="button" id="btn-top-citizen-signin" class="top-auth-btn citizen-btn" onclick="window.app && window.app.openLoginModal('citizen')" title="Citizen Sign In with Aadhaar e-KYC">
\t\t\t\t\t\t<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
\t\t\t\t\t\t<span>Sign In</span>
\t\t\t\t\t</button>
\t\t\t\t\t<button type="button" id="btn-top-officer-login" class="top-auth-btn officer-btn" onclick="window.app && (window.app.loginDemoOfficer ? window.app.loginDemoOfficer() : window.app.switchView('officer'))" title="Officer Authority Portal Login">
\t\t\t\t\t\t<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
\t\t\t\t\t\t<span>Officer Login</span>
\t\t\t\t\t</button>
\t\t\t\t</div>
\t\t\t</div>`;

if (!html.includes('id="btn-top-citizen-signin"')) {
  html = html.replace(topJurisdictionRegex, topAuthButtonsHtml);
  console.log('✅ Added Citizen Sign In & Officer Login to top accessibility bar (Image 2)');
}

// B. In .gov-nav-right, add Officer Portal button beside Sign In
const oldNavSignin = `<button type="button" id="btn-nav-signin" class="btn-gov-signin" onclick="window.app && window.app.openLoginModal()" title="Citizen &amp; Officer Sign In" style="display: flex; align-items: center; gap: 6px; padding: 6px 14px; font-size: 0.8rem;">
\t\t\t\t<span>Sign In</span>
\t\t\t</button>`;

const newNavSignin = `<button type="button" id="btn-nav-signin" class="btn-gov-signin" onclick="window.app && window.app.openLoginModal('citizen')" title="Citizen Sign In with Aadhaar e-KYC" style="display: flex; align-items: center; gap: 6px; padding: 6px 14px; font-size: 0.8rem;">
\t\t\t\t<span>Sign In</span>
\t\t\t</button>
\t\t\t<button type="button" id="btn-nav-officer" class="btn-gov-officer-signin" onclick="window.app && (window.app.loginDemoOfficer ? window.app.loginDemoOfficer() : window.app.switchView('officer'))" title="Officer Authority Portal" style="display: flex; align-items: center; gap: 6px; padding: 6px 14px; font-size: 0.8rem;">
\t\t\t\t<span>Officer Portal</span>
\t\t\t</button>`;

if (html.includes(oldNavSignin)) {
  html = html.replace(oldNavSignin, newNavSignin);
  console.log('✅ Added Officer Portal button beside Sign In in top navigation');
}

// C. Fix remaining emoji on line 885 (↩️ Undo Point)
html = html.replace(/↩️\s*Undo Point/g, '&larr; Undo Point');
console.log('✅ Cleaned remaining undo emoji');

// D. Remove the empty floating map controls box (Image 1)
const mapFloatingRegex = /<!-- Floating 2D\/3D Map Controls[\s\S]*?<div id="map-floating-controls"[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/;
const cleanMapClosing = `\t\t\t</div>\n\t\t</section>`;
if (mapFloatingRegex.test(html)) {
  html = html.replace(mapFloatingRegex, cleanMapClosing);
  console.log('✅ Eradicated #map-floating-controls from index.html');
}

// E. Remove the empty floating twin controls box
const twinFloatingRegex = /<!-- Floating 3D Twin Controls[\s\S]*?<div id="twin-floating-controls"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/;
const cleanTwinClosing = `\t\t\t</div>\n\t\t</div>\n\t\t</section>`;
if (twinFloatingRegex.test(html)) {
  html = html.replace(twinFloatingRegex, cleanTwinClosing);
  console.log('✅ Eradicated #twin-floating-controls from index.html');
}

fs.writeFileSync('index.html', html, 'utf8');


// ─────────────────────────────────────────────────────────────
// 3. UPDATE src/app.js (KEEP NAV VISIBLE, ADD loginDemoOfficer)
// ─────────────────────────────────────────────────────────────
let appJs = fs.readFileSync('src/app.js', 'utf8');

// A. Make sure govNav is always visible across all views including landing
appJs = appJs.replace(/govNav\.style\.display\s*=\s*\(viewName\s*!==\s*'landing'\s*&&\s*this\.currentUser\)\s*\?\s*'flex'\s*:\s*'none';/,
`govNav.style.display = 'flex';`);

// B. In switchView, ensure page scrolls to top smoothly
if (!appJs.includes('window.scrollTo({ top: 0, behavior:')) {
  appJs = appJs.replace(/if\s*\(targetPanel\)\s*\{\s*targetPanel\.classList\.add\('active'\);/,
`window.scrollTo({ top: 0, behavior: 'smooth' });\n    if (targetPanel) {\n      targetPanel.classList.add('active');`);
}

// C. Add loginDemoOfficer() method if not present
if (!appJs.includes('loginDemoOfficer()')) {
  const officerMethod = `
  loginDemoOfficer() {
    this.currentUser = {
      id: 'OFFICER-001',
      name: 'Vikramjit Singh, PCS',
      role: 'officer',
      designation: 'Additional Deputy Commissioner (Revenue)',
      jurisdiction: 'Punjab • Amritsar-I'
    };
    this.renderAuthUI();
    this.switchView('officer');
    this.showToast('Logged in as Officer: Vikramjit Singh, PCS (Competent Authority)', 4000);
  }
`;
  appJs = appJs.replace(/openLoginModal\(role\)\s*\{|openLoginModal\(\)\s*\{/, `${officerMethod}\n  openLoginModal(role) {`);
}

fs.writeFileSync('src/app.js', appJs, 'utf8');
console.log('✅ Updated src/app.js: govNav always visible, smooth scroll on switch, loginDemoOfficer added');

console.log('🚀 All fixes applied successfully!');
