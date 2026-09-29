const fs = require('fs');

console.log('🔧 Applying fixes for Duplicate Header, Auth Buttons Hiding, and Navigation...');

// 1. UPDATE src/app.js
let appJs = fs.readFileSync('src/app.js', 'utf8');

// A. Update handleJanparichaySubmit to always log in as Authority Officer
const oldJp = `\tasync handleJanparichaySubmit(e) {`;
const newJp = `\tasync handleJanparichaySubmit(e) {
\t\tif (e) {
\t\t\tif (typeof e.preventDefault === 'function') e.preventDefault();
\t\t\tif (typeof e.stopPropagation === 'function') e.stopPropagation();
\t\t}
\t\tthis.loginUser({
\t\t\tname: 'Shri Vikramjit Singh, PCS',
\t\t\trole: 'AUTHORITY_HEAD',
\t\t\taadhaar_masked: 'XXXX-XXXX-1044',
\t\t\tmobile: '+91 94172-XXXXX',
\t\t\taddress: 'District Administrative Complex, Court Road, Amritsar',
\t\t\tproperties_owned: []
\t\t});
\t}

\tasync handleTokenSubmit(e) {
\t\tif (e) {
\t\t\tif (typeof e.preventDefault === 'function') e.preventDefault();
\t\t\tif (typeof e.stopPropagation === 'function') e.stopPropagation();
\t\t}
\t\tthis.loginUser({
\t\t\tname: 'Shri Vikramjit Singh, PCS',
\t\t\trole: 'AUTHORITY_HEAD',
\t\t\taadhaar_masked: 'XXXX-XXXX-1044',
\t\t\tmobile: '+91 94172-XXXXX',
\t\t\taddress: 'District Administrative Complex, Court Road, Amritsar',
\t\t\tproperties_owned: []
\t\t});
\t}

\t_oldSetupAuth() {`;

// Replace handleJanparichaySubmit and handleTokenSubmit
const jpRegex = /async handleJanparichaySubmit\(e\)[\s\S]*?setupAuthHandlers\(\)/;
const replacementJp = `async handleJanparichaySubmit(e) {
\t\tif (e) {
\t\t\tif (typeof e.preventDefault === 'function') e.preventDefault();
\t\t\tif (typeof e.stopPropagation === 'function') e.stopPropagation();
\t\t}
\t\tthis.loginUser({
\t\t\tname: 'Shri Vikramjit Singh, PCS',
\t\t\trole: 'AUTHORITY_HEAD',
\t\t\taadhaar_masked: 'XXXX-XXXX-1044',
\t\t\tmobile: '+91 94172-XXXXX',
\t\t\taddress: 'District Administrative Complex, Court Road, Amritsar',
\t\t\tproperties_owned: []
\t\t});
\t}

\tasync handleTokenSubmit(e) {
\t\tif (e) {
\t\t\tif (typeof e.preventDefault === 'function') e.preventDefault();
\t\t\tif (typeof e.stopPropagation === 'function') e.stopPropagation();
\t\t}
\t\tthis.loginUser({
\t\t\tname: 'Shri Vikramjit Singh, PCS',
\t\t\trole: 'AUTHORITY_HEAD',
\t\t\taadhaar_masked: 'XXXX-XXXX-1044',
\t\t\tmobile: '+91 94172-XXXXX',
\t\t\taddress: 'District Administrative Complex, Court Road, Amritsar',
\t\t\tproperties_owned: []
\t\t});
\t}

\tsetupAuthHandlers()`;

appJs = appJs.replace(jpRegex, replacementJp);

// B. Update loginUser to hide gov-header, top-auth-actions, and btn-nav-officer
const oldLoginUserHeader = `\tloginUser(user) {
\t\tthis.currentUser = user || CURRENT_USER;
\t\tthis.closeLoginModal();
\t\tthis.closeLoginModal();

\t\ttry {
\t\t\tsessionStorage.setItem('bhuaadhaar_user', JSON.stringify(this.currentUser));
\t\t} catch (e) {}

\t\t// Ensure Gov Nav is visible
\t\tconst govNav = document.querySelector('.gov-nav');
\t\tif (govNav) govNav.style.display = 'flex';
\t\tconst compactBar = document.getElementById('compact-name-bar');
\t\tif (compactBar) compactBar.style.display = 'none';

\t\t// Hide Public Sign In button and reveal Profile Pill & Logout button
\t\tconst btnNavSignin = document.getElementById('btn-nav-signin');
\t\tif (btnNavSignin) btnNavSignin.style.display = 'none';`;

const newLoginUserHeader = `\tloginUser(user) {
\t\tthis.currentUser = user || CURRENT_USER;
\t\tthis.closeLoginModal();

\t\ttry {
\t\t\tsessionStorage.setItem('bhuaadhaar_user', JSON.stringify(this.currentUser));
\t\t} catch (e) {}

\t\t// Authenticated State: Reveal gov-nav, hide landing header & sign in buttons
\t\tconst govNav = document.querySelector('.gov-nav');
\t\tif (govNav) govNav.style.display = 'flex';
\t\tconst govHeader = document.querySelector('.gov-header');
\t\tif (govHeader) govHeader.style.display = 'none';
\t\tconst topAuthActions = document.querySelector('.top-auth-actions');
\t\tif (topAuthActions) topAuthActions.style.display = 'none';
\t\tconst compactBar = document.getElementById('compact-name-bar');
\t\tif (compactBar) compactBar.style.display = 'none';

\t\t// Hide unauthenticated nav buttons
\t\tconst btnNavSignin = document.getElementById('btn-nav-signin');
\t\tif (btnNavSignin) btnNavSignin.style.display = 'none';
\t\tconst btnNavOfficer = document.getElementById('btn-nav-officer');
\t\tif (btnNavOfficer) btnNavOfficer.style.display = 'none';`;

if (appJs.includes(oldLoginUserHeader)) {
  appJs = appJs.replace(oldLoginUserHeader, newLoginUserHeader);
} else {
  // Regex fallback
  appJs = appJs.replace(/loginUser\(user\) \{[\s\S]*?const btnNavSignin = document\.getElementById\('btn-nav-signin'\);[\s\S]*?if \(btnNavSignin\) btnNavSignin\.style\.display = 'none';/, newLoginUserHeader);
}

// C. Update logoutUser to restore gov-header, top-auth-actions, and unauthenticated buttons
const oldLogout = `\t\t// Hide gov-nav on landing page
\t\tconst govNav = document.querySelector('.gov-nav');
\t\tif (govNav) govNav.style.display = 'none';

\t\tconst btnNavSignin = document.getElementById('btn-nav-signin');
\t\tif (btnNavSignin) btnNavSignin.style.display = 'flex';

\t\tconst btnNavOfficer = document.getElementById('btn-nav-officer');
\t\tif (btnNavOfficer) btnNavOfficer.style.display = 'flex';`;

const newLogout = `\t\t// Hide gov-nav on landing page & restore landing header
\t\tconst govNav = document.querySelector('.gov-nav');
\t\tif (govNav) govNav.style.display = 'none';
\t\tconst govHeader = document.querySelector('.gov-header');
\t\tif (govHeader) govHeader.style.display = 'flex';
\t\tconst topAuthActions = document.querySelector('.top-auth-actions');
\t\tif (topAuthActions) topAuthActions.style.display = 'flex';

\t\tconst btnNavSignin = document.getElementById('btn-nav-signin');
\t\tif (btnNavSignin) btnNavSignin.style.display = 'flex';

\t\tconst btnNavOfficer = document.getElementById('btn-nav-officer');
\t\tif (btnNavOfficer) btnNavOfficer.style.display = 'flex';`;

if (appJs.includes(oldLogout)) {
  appJs = appJs.replace(oldLogout, newLogout);
} else {
  appJs = appJs.replace(/\/\/ Hide gov-nav on landing page[\s\S]*?if \(btnNavOfficer\) btnNavOfficer\.style\.display = 'flex';/, newLogout);
}

// D. Update switchView to manage govNav AND govHeader visibility
const oldSwitchNav = `\t\t// Show/hide gov nav based on whether user is logged in and not on landing
\t\tconst govNav = document.querySelector('.gov-nav');
\t\tif (govNav) {
\t\t\tgovNav.style.display = (viewName === 'landing') ? 'none' : 'flex';
\t\t}`;

const newSwitchNav = `\t\t// Show/hide gov nav and landing header based on view (never show both stacked!)
\t\tconst govNav = document.querySelector('.gov-nav');
\t\tconst govHeader = document.querySelector('.gov-header');
\t\tconst topAuthActions = document.querySelector('.top-auth-actions');

\t\tif (viewName === 'landing') {
\t\t\tif (govNav) govNav.style.display = 'none';
\t\t\tif (govHeader) govHeader.style.display = 'flex';
\t\t\tif (topAuthActions) topAuthActions.style.display = 'flex';
\t\t} else {
\t\t\tif (govNav) govNav.style.display = 'flex';
\t\t\tif (govHeader) govHeader.style.display = 'none';
\t\t\tif (topAuthActions) topAuthActions.style.display = 'none';
\t\t}`;

if (appJs.includes(oldSwitchNav)) {
  appJs = appJs.replace(oldSwitchNav, newSwitchNav);
} else {
  appJs = appJs.replace(/\/\/ Show\/hide gov nav based on whether user is logged in and not on landing[\s\S]*?govNav\.style\.display = \(viewName === 'landing'\) \? 'none' : 'flex';[\s\S]*?\}/, newSwitchNav);
}

fs.writeFileSync('src/app.js', appJs, 'utf8');
console.log('✓ src/app.js updated successfully');

// 2. UPDATE index.html
let html = fs.readFileSync('index.html', 'utf8');

// A. Update fallback window.openLoginModal
const oldFallback = `\twindow.openLoginModal = function(role) {
\t\tif (window.app && typeof window.app.openLoginModal === 'function') {
\t\t\twindow.app.openLoginModal(role);
\t\t\treturn;
\t\t}
\t\tconst modal = document.getElementById('login-modal');
\t\tif (modal) {
\t\t\tmodal.style.display = 'flex';
\t\t\tmodal.classList.add('active');
\t\t\tconst modalTitle = document.querySelector('#login-modal .modal-header h3');
\t\t\tif (role === 'officer' || role === 'authority') {
\t\t\t\tconst jpTab = document.querySelector('[data-auth-tab="janparichay"]');
\t\t\t\tif (jpTab) jpTab.click();
\t\t\t\tif (modalTitle) modalTitle.textContent = 'Authority Officer Sign In (JanParichay / DSC)';
\t\t\t} else {
\t\t\t\tconst aadhaarTab = document.querySelector('[data-auth-tab="aadhaar"]');
\t\t\t\tif (aadhaarTab) aadhaarTab.click();
\t\t\t\tif (modalTitle) modalTitle.textContent = 'Citizen Sign In (MeriPehchaan / Aadhaar e-KYC)';
\t\t\t}
\t\t}
\t};`;

const newFallback = `\twindow.openLoginModal = function(role) {
\t\tif (window.app && typeof window.app.openLoginModal === 'function') {
\t\t\twindow.app.openLoginModal(role);
\t\t\treturn;
\t\t}
\t\t['modal-citizen-login', 'modal-officer-login', 'login-modal'].forEach(id => {
\t\t\tconst m = document.getElementById(id);
\t\t\tif (m) { m.style.display = 'none'; m.classList.remove('active'); }
\t\t});
\t\tif (role === 'officer' || role === 'authority') {
\t\t\tconst m = document.getElementById('modal-officer-login');
\t\t\tif (m) { m.style.display = 'flex'; m.classList.add('active'); }
\t\t} else {
\t\t\tconst m = document.getElementById('modal-citizen-login');
\t\t\tif (m) { m.style.display = 'flex'; m.classList.add('active'); }
\t\t}
\t};`;

html = html.replace(oldFallback, newFallback);

// B. Update top-gov-notification-bar to display: none by default with clean toggle button
const oldNotifBar = `<div id="top-gov-notification-bar" class="gov-top-notification" style="display: flex; margin-bottom: 16px; border-radius: 8px;">`;
const newNotifBar = `<div id="top-gov-notification-bar" class="gov-top-notification" style="display: none; margin-bottom: 16px; border-radius: 8px;">`;
html = html.replace(oldNotifBar, newNotifBar);

// C. Update the statutory notice button onclick to toggle cleanly
const oldNotifBtn = `onclick="const n=document.getElementById('top-gov-notification-bar'); if(n){n.style.display='flex'; n.scrollIntoView({behavior:'smooth'});}"`;
const newNotifBtn = `onclick="const n=document.getElementById('top-gov-notification-bar'); if(n){n.style.display=(n.style.display==='none'||!n.style.display?'flex':'none'); if(n.style.display==='flex')n.scrollIntoView({behavior:'smooth'});}"`;
html = html.replace(oldNotifBtn, newNotifBtn);

// D. Bump cache buster
html = html.replace(/src="src\/app\.js\?v=[^"]+"/, `src="src/app.js?v=v20260926_no_double_header_${Date.now()}"`);

fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ index.html updated successfully');
