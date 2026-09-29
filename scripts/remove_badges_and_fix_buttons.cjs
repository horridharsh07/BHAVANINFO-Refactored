const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove the badges from gov-header and replace with the 2 buttons
const oldBadgesBlock = `<div class="gov-badges">
				<div class="digital-india-badge">
					<strong>Digital India</strong>
					<span>Land Modernization</span>
				</div>
				<div class="digital-india-badge" style="border-color: #ffd992;">
					<strong style="color: #b45309;">Bhu-Aadhaar</strong>
					<span>14-Digit ULPIN</span>
				</div>
			</div>`;

const newHeaderAuthBlock = `<div class="top-auth-actions" style="display: flex; align-items: center; gap: 10px;">
				<button type="button" id="btn-top-citizen-signin" class="top-auth-btn citizen-btn" onclick="window.openLoginModal ? window.openLoginModal('citizen') : (window.app && window.app.openLoginModal('citizen'))" title="Citizen Sign In with Aadhaar e-KYC" style="padding: 7px 18px; font-size: 0.85rem; font-weight: 700; border-radius: 6px; cursor: pointer;">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
					<span>Citizen Sign In</span>
				</button>
				<button type="button" id="btn-top-officer-login" class="top-auth-btn officer-btn" onclick="window.openLoginModal ? window.openLoginModal('officer') : (window.app && window.app.openLoginModal('officer'))" title="Authority Login (Competent Authority / Officer)" style="padding: 7px 18px; font-size: 0.85rem; font-weight: 700; border-radius: 6px; cursor: pointer;">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
					<span>Authority Login</span>
				</button>
			</div>`;

// Replace badges in gov-header
if (html.includes(oldBadgesBlock)) {
  html = html.replace(oldBadgesBlock, newHeaderAuthBlock);
  console.log('✓ Replaced gov-badges with top-auth-actions in gov-header');
} else {
  // Regex replacement in case of whitespace differences
  html = html.replace(/<div class="gov-badges">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/,
    newHeaderAuthBlock + '\n\t\t</div>\n\t</div>');
  console.log('✓ Regex replaced gov-badges with top-auth-actions');
}

// Clean up duplicate buttons from gov-top-bar so they only appear in gov-header
html = html.replace(/<!-- TOP BAR: STRICTLY CONTAINS ONLY TWO BUTTONS[\s\S]*?<\/header>/, '</header>');

// Update script tag cache-buster
html = html.replace(/src="src\/app\.js\?v=[^"]*"/, 'src="src/app.js?v=v20260926_auth_fix_v3"');

// Add inline global openLoginModal fallback helper before the app.js script
const inlineFallback = `<!-- Global Login Modal Fallback Helper -->
	<script>
	window.openLoginModal = function(role) {
		if (window.app && typeof window.app.openLoginModal === 'function') {
			window.app.openLoginModal(role);
			return;
		}
		const modal = document.getElementById('login-modal');
		if (modal) {
			modal.style.display = 'flex';
			modal.classList.add('active');
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
	};
	</script>
	<script type="module" src="src/app.js?v=v20260926_auth_fix_v3"></script>`;

html = html.replace(/<script type="module" src="src\/app\.js[^"]*"><\/script>/, inlineFallback);

fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ Successfully updated index.html without badges');
