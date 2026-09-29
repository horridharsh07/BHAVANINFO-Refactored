const fs = require('fs');

console.log('🔧 Removing Officer Portal, District Report, and Tips & Tour from top bar...');

// 1. UPDATE index.html
let html = fs.readFileSync('index.html', 'utf8');

// Hide or remove #tour-nav-report, #tour-nav-officer, #btn-open-tutorial from index.html
html = html.replace(
  /<li class="nav-item" data-view="report" id="tour-nav-report">[\s\S]*?<\/li>/,
  '<!-- District Report removed from top bar as requested -->'
);

html = html.replace(
  /<li class="nav-item" data-view="officer" id="tour-nav-officer">[\s\S]*?<\/li>/,
  '<!-- Officer Portal removed from top bar as requested -->'
);

html = html.replace(
  /<button type="button" id="btn-open-tutorial" class="btn-tutorial-trigger"[\s\S]*?<\/button>/,
  '<!-- Tips & Tour removed from top bar as requested -->'
);

html = html.replace(
  /<button type="button" id="btn-nav-officer" class="btn-gov-officer-signin"[\s\S]*?<\/button>/,
  '<!-- Redundant Officer signin button removed from top bar -->'
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('✅ Updated index.html');

// 2. UPDATE src/styles/gov-theme.css
let css = fs.readFileSync('src/styles/gov-theme.css', 'utf8');
const hideRule = `
/* ── REMOVED FROM TOP BAR PER USER REQUEST ── */
#tour-nav-report,
#tour-nav-officer,
#btn-open-tutorial,
#btn-nav-officer {
  display: none !important;
}
`;

if (!css.includes('#tour-nav-report,')) {
  css += '\n' + hideRule;
  fs.writeFileSync('src/styles/gov-theme.css', css, 'utf8');
  console.log('✅ Updated src/styles/gov-theme.css');
}

// 3. UPDATE src/app.js
let appJs = fs.readFileSync('src/app.js', 'utf8');

// Replace in loginUser
appJs = appJs.replace(
  /const officerNav = document\.getElementById\('tour-nav-officer'\);\s*if \(officerNav\) officerNav\.style\.display = isOfficer \? 'flex' : 'none';\s*const reportNav = document\.getElementById\('tour-nav-report'\);\s*if \(reportNav\) reportNav\.style\.display = isOfficer \? 'flex' : 'none';/,
  `const officerNav = document.getElementById('tour-nav-officer');
		if (officerNav) officerNav.style.display = 'none';
		const reportNav = document.getElementById('tour-nav-report');
		if (reportNav) reportNav.style.display = 'none';
		const tourBtn = document.getElementById('btn-open-tutorial');
		if (tourBtn) tourBtn.style.display = 'none';`
);

// Replace in switchView
appJs = appJs.replace(
  /const officerNav = document\.getElementById\('tour-nav-officer'\);\s*if \(officerNav\) officerNav\.style\.display = isOfficer \? 'flex' : 'none';\s*const reportNav = document\.getElementById\('tour-nav-report'\);\s*if \(reportNav\) reportNav\.style\.display = isOfficer \? 'flex' : 'none';/,
  `const officerNav = document.getElementById('tour-nav-officer');
			if (officerNav) officerNav.style.display = 'none';
			const reportNav = document.getElementById('tour-nav-report');
			if (reportNav) reportNav.style.display = 'none';
			const tourBtn = document.getElementById('btn-open-tutorial');
			if (tourBtn) tourBtn.style.display = 'none';`
);

fs.writeFileSync('src/app.js', appJs, 'utf8');
console.log('✅ Updated src/app.js');
