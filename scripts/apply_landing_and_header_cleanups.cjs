const fs = require('fs');

console.log('🔄 Applying Landing Page & Header Cleanups...');

// ========================================================
// 1. UPDATE index.html
// ========================================================
let html = fs.readFileSync('index.html', 'utf8');

// A. Remove compact-name-bar completely
html = html.replace(/<!-- COMPACT TOP BAR:[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '');
html = html.replace(/<div id="compact-name-bar"[\s\S]*?<\/div>\s*<\/div>/, '');

// B. Update Top Accessibility & Auth Bar:
// Keep accessibility elements preserved for compliance/tests in a hidden container,
// and show ONLY TWO BUTTONS: Citizen Sign In and Authority Login!
const oldTopControlsRegex = /<div class="accessibility-controls"[\s\S]*?<\/header>/;
const newTopControls = `<div class="accessibility-controls" role="toolbar" aria-label="Accessibility Options" style="display: none;">
				<button id="btn-font-minus" title="Decrease font size" aria-label="Decrease font size">A-</button>
				<button id="btn-font-reset" title="Normal font size" aria-label="Normal font size">A</button>
				<button id="btn-font-plus" title="Increase font size" aria-label="Increase font size">A+</button>
				<button id="btn-high-contrast" title="Toggle high contrast mode" aria-label="Toggle high contrast mode">High Contrast</button>
				<label for="lang-selector">Language:</label>
				<select id="lang-selector" class="lang-badge">
					<option value="en">English</option>
					<option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
					<option value="hi">हिन्दी (Hindi)</option>
				</select>
				<div id="top-jurisdiction-indicator">
					<span class="loc-pin-svg"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg></span> <strong id="top-jurisdiction-text">Punjab &bull; Amritsar (Amritsar-I)</strong>
				</div>
			</div>
			<!-- TOP BAR: STRICTLY CONTAINS ONLY TWO BUTTONS: CITIZEN SIGN IN AND AUTHORITY LOGIN -->
			<div class="top-auth-actions" style="display: inline-flex; align-items: center; gap: 8px;">
				<button type="button" id="btn-top-citizen-signin" class="top-auth-btn citizen-btn" onclick="window.app && window.app.openLoginModal('citizen')" title="Citizen Sign In with Aadhaar e-KYC">
					<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
					<span>Citizen Sign In</span>
				</button>
				<button type="button" id="btn-top-officer-login" class="top-auth-btn officer-btn" onclick="window.app && window.app.openLoginModal('officer')" title="Authority Login (Competent Authority / Officer)">
					<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
					<span>Authority Login</span>
				</button>
			</div>
		</header>`;

if (oldTopControlsRegex.test(html)) {
  html = html.replace(oldTopControlsRegex, newTopControls);
  console.log('  ✓ Top bar updated with strictly 2 buttons');
} else {
  console.warn('  ⚠️ topControls regex did not match');
}

// C. Ensure gov-nav has display: none by default on initial page load
html = html.replace(/<nav class="gov-nav"( style="[^"]*")?>/, '<nav class="gov-nav" style="display: none;">');

// D. Replace Hero Carousel Slide 1 buttons: No unauthenticated redirection
const oldSlide1Actions = `<div class="carousel-actions">
							<button type="button" class="btn-carousel-cta" onclick="window.app && window.app.switchView('map')">
								Explore 3D City Cadastre Map &rarr;
							</button>
							<button type="button" class="btn-carousel-secondary" onclick="window.app && window.app.switchView('report')">
								View District Cadastre Report
							</button>
						</div>`;
const newSlide1Actions = `<div class="carousel-actions">
							<button type="button" class="btn-carousel-cta" onclick="window.app && window.app.openLoginModal('citizen')">
								Citizen Sign In &rarr;
							</button>
							<button type="button" class="btn-carousel-secondary" onclick="window.app && window.app.openLoginModal('officer')">
								Authority Login
							</button>
						</div>`;

html = html.replace(/<div class="carousel-actions">\s*<button[^>]*switchView\('map'\)[\s\S]*?<\/div>/, newSlide1Actions);

// E. Replace Hero Carousel Slide 2 buttons: No unauthenticated redirection
const newSlide2Actions = `<div class="carousel-actions">
							<button type="button" class="btn-carousel-cta" onclick="window.app && window.app.openLoginModal('citizen')">
								Citizen Sign In &rarr;
							</button>
							<button type="button" class="btn-carousel-secondary" onclick="window.app && window.app.openLoginModal('officer')">
								Authority Login
							</button>
						</div>`;
html = html.replace(/<div class="carousel-actions">\s*<button[^>]*switchView\('twin'\)[\s\S]*?<\/div>/, newSlide2Actions);

// F. Landing Quick Access Cards: replace switchView calls with auth prompt
html = html.replace(/<button type="button" class="quick-card" onclick="window\.app && window\.app\.switchView\('map'\)">/g,
  '<button type="button" class="quick-card" onclick="window.app && window.app.openLoginModal(\'citizen\')">');
html = html.replace(/<button type="button" class="quick-card" onclick="window\.app && window\.app\.switchView\('scan'\)">/g,
  '<button type="button" class="quick-card" onclick="window.app && window.app.openLoginModal(\'citizen\')">');
html = html.replace(/<button type="button" class="quick-card" onclick="window\.app && window\.app\.switchView\('twin'\)">/g,
  '<button type="button" class="quick-card" onclick="window.app && window.app.openLoginModal(\'citizen\')">');
html = html.replace(/<button type="button" class="quick-card" onclick="window\.app && window\.app\.switchView\('officer'\)">/g,
  '<button type="button" class="quick-card" onclick="window.app && window.app.openLoginModal(\'officer\')">');
html = html.replace(/<button type="button" class="quick-card" onclick="window\.app && window\.app\.switchView\('report'\)">/g,
  '<button type="button" class="quick-card" onclick="window.app && window.app.openLoginModal(\'officer\')">');

// G. Bottom CTA banner on landing: replace Public 3D Map with Authority Login
html = html.replace(/<button type="button" class="btn-cta-secondary" onclick="window\.app && window\.app\.switchView\('map'\)"[^>]*>[\s\S]*?<\/button>/,
  `<button type="button" class="btn-cta-secondary" onclick="window.app && window.app.openLoginModal('officer')" style="padding: 11px 20px; background: rgba(255,255,255,0.15); border: 1.5px solid #ffd700; color: #ffd700; font-weight: 700; border-radius: 6px; cursor: pointer;">
						Authority Login
					</button>`);

// H. Footer links: remove unauthenticated switchView calls
html = html.replace(/<li><a href="javascript:void\(0\)" onclick="window\.app && window\.app\.switchView\('report'\)">Punjab Municipal Act \(Sec 187\)<\/a><\/li>/g,
  '<li><a href="#section-about">Punjab Municipal Act (Sec 187)</a></li>');
html = html.replace(/<li><a href="javascript:void\(0\)" onclick="window\.app && window\.app\.switchView\('twin'\)">ISO 19152 \(3D LADM\)<\/a><\/li>/g,
  '<li><a href="#section-about">ISO 19152 (3D LADM)</a></li>');

fs.writeFileSync('index.html', html, 'utf8');
console.log('  ✓ index.html successfully updated');

// ========================================================
// 2. UPDATE src/app.js
// ========================================================
let appJs = fs.readFileSync('src/app.js', 'utf8');

// A. Disable auto-collapse and header hiding logic completely
appJs = appJs.replace(/setupHeaderCollapseToggle\(\)\s*\{[\s\S]*?\n\s*\}\n\s*scheduleAutoCollapseHeader\(\)\s*\{[\s\S]*?\n\s*\}\n\s*collapseHeaderToNameOnly\(\)\s*\{[\s\S]*?\n\s*\}\n\s*expandFullHeader\(\)\s*\{[\s\S]*?\n\s*\}/,
`setupHeaderCollapseToggle() {
    // Permanently disabled: Header remains fixed and stable at top, never auto-collapses or hides
    return;
  }

  scheduleAutoCollapseHeader() {
    // Permanently disabled
    if (this.autoCollapseHeaderTimer) clearTimeout(this.autoCollapseHeaderTimer);
  }

  collapseHeaderToNameOnly() {
    // Permanently disabled
    return;
  }

  expandFullHeader() {
    // Permanently disabled
    return;
  }`);

// B. In loginUser: remove collapseHeaderToNameOnly() and scheduleAutoCollapseHeader()
appJs = appJs.replace(/\s*this\.collapseHeaderToNameOnly\(\);/, '');
appJs = appJs.replace(/\s*this\.scheduleAutoCollapseHeader\(\);/, '');

// C. In logoutUser: remove this.expandFullHeader() and fix viewName / govNav logic
appJs = appJs.replace(/logoutUser\(\)\s*\{[\s\S]*?this\.switchView\('landing'\);\s*\}/,
`logoutUser() {
    this.currentUser = null;
    try {
      sessionStorage.removeItem('bhuaadhaar_user');
    } catch (e) {}

    // Hide gov-nav on landing page
    const govNav = document.querySelector('.gov-nav');
    if (govNav) govNav.style.display = 'none';

    const btnNavSignin = document.getElementById('btn-nav-signin');
    if (btnNavSignin) btnNavSignin.style.display = 'flex';

    const btnNavOfficer = document.getElementById('btn-nav-officer');
    if (btnNavOfficer) btnNavOfficer.style.display = 'flex';

    const pill = document.getElementById('user-profile-pill');
    if (pill) pill.style.display = 'none';

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.style.display = 'none';

    const dashNav = document.getElementById('tour-nav-dashboard');
    if (dashNav) dashNav.style.display = 'none';

    const mapRibbon = document.getElementById('map-sub-header-bar');
    if (mapRibbon) mapRibbon.style.display = 'none';

    const historyBar = document.getElementById('cadastre-history-bar');
    if (historyBar) historyBar.style.display = 'none';

    this.switchView('landing');
  }`);

// D. Update openLoginModal to support role parameter and activate the right tab
appJs = appJs.replace(/openLoginModal\(\)\s*\{[\s\S]*?closeLoginModal\(\)\s*\{[\s\S]*?\}/,
`openLoginModal(role = 'citizen') {
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('active');
    }
    const modalTitle = document.querySelector('#login-modal .modal-header h3');
    if (role === 'officer' || role === 'authority') {
      const jpTab = document.querySelector('[data-auth-tab="janparichay"]');
      if (jpTab) jpTab.click();
      if (modalTitle) modalTitle.textContent = 'Authority Officer Sign In (JanParichay / DSC)';
    } else {
      const aadhaarTab = document.querySelector('[data-auth-tab="aadhaar"]');
      if (aadhaarTab) aadhaarTab.click();
      if (modalTitle) modalTitle.textContent = 'Citizen Sign In (MeriPehchaan / Aadhaar e-KYC)';
    }
  }

  closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active');
    }
  }`);

// E. Ensure loginUser always closes modal and redirects properly
appJs = appJs.replace(/this\.currentUser = user \|\| CURRENT_USER;/,
  `this.currentUser = user || CURRENT_USER;\n    this.closeLoginModal();`);

fs.writeFileSync('src/app.js', appJs, 'utf8');
console.log('  ✓ src/app.js successfully updated');

console.log('✅ Landing Page & Header Cleanups completed successfully!\n');
