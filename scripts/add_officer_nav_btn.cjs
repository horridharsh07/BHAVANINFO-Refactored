const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace nav sign in button with both Sign In and Officer Portal
const navBtnRegex = /<button type="button" id="btn-nav-signin"[\s\S]*?<\/button>/;

const replacement = `<button type="button" id="btn-nav-signin" class="btn-gov-signin" onclick="window.app && window.app.openLoginModal('citizen')" title="Citizen Sign In with Aadhaar e-KYC" style="display: flex; align-items: center; gap: 6px; padding: 6px 14px; font-size: 0.8rem;">
\t\t\t\t<span>Sign In</span>
\t\t\t</button>
\t\t\t<button type="button" id="btn-nav-officer" class="btn-gov-officer-signin" onclick="window.app && (window.app.loginDemoOfficer ? window.app.loginDemoOfficer() : window.app.switchView('officer'))" title="Officer Authority Portal" style="display: flex; align-items: center; gap: 6px; padding: 6px 14px; font-size: 0.8rem;">
\t\t\t\t<span>Officer Portal</span>
\t\t\t</button>`;

if (navBtnRegex.test(html) && !html.includes('id="btn-nav-officer"')) {
  html = html.replace(navBtnRegex, replacement);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('✅ Added Officer Portal button beside Sign In in navbar');
} else {
  console.log('Already updated or pattern not matched');
}
