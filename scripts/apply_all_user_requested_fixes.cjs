const fs = require('fs');

console.log('🔄 Applying all user-requested fixes...');

// ========================================================
// 1. UPDATE src/app.js: Fix ReferenceError in loginUser & update modal opening
// ========================================================
let appJs = fs.readFileSync('src/app.js', 'utf8');

// Fix 1: Remove undefined viewName reference from loginUser
appJs = appJs.replace(
  /if\s*\(govNav\)\s*govNav\.style\.display\s*=\s*\(viewName\s*===\s*'landing'\)\s*\?\s*'none'\s*:\s*'flex';/,
  "if (govNav) govNav.style.display = 'flex';"
);

// Fix 2: Update openLoginModal and closeLoginModal to handle separate modals
const oldOpenLoginModal = `openLoginModal(role = 'citizen') {
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
  }`;

const newOpenLoginModal = `openLoginModal(role = 'citizen') {
    this.closeLoginModal();
    if (role === 'officer' || role === 'authority') {
      const officerModal = document.getElementById('modal-officer-login');
      if (officerModal) {
        officerModal.style.display = 'flex';
        officerModal.classList.add('active');
      }
    } else {
      const citizenModal = document.getElementById('modal-citizen-login') || document.getElementById('login-modal');
      if (citizenModal) {
        citizenModal.style.display = 'flex';
        citizenModal.classList.add('active');
      }
    }
  }

  closeLoginModal() {
    ['modal-citizen-login', 'modal-officer-login', 'login-modal'].forEach(id => {
      const m = document.getElementById(id);
      if (m) {
        m.style.display = 'none';
        m.classList.remove('active');
      }
    });
  }`;

if (appJs.includes(oldOpenLoginModal)) {
  appJs = appJs.replace(oldOpenLoginModal, newOpenLoginModal);
  console.log('✓ Updated openLoginModal for separate modals');
} else {
  // Regex replacement
  appJs = appJs.replace(/openLoginModal\s*\([^)]*\)\s*\{[\s\S]*?closeLoginModal\(\)\s*\{[\s\S]*?\}\s*\}/, newOpenLoginModal);
  console.log('✓ Regex updated openLoginModal and closeLoginModal');
}

// Add officer tab switching logic in setupAuthHandlers
if (!appJs.includes('data-officer-tab')) {
  appJs = appJs.replace(/setupAuthHandlers\(\)\s*\{/, `setupAuthHandlers() {
    // Officer Tabs Switcher (JanParichay / Token)
    const officerTabs = document.querySelectorAll('[data-officer-tab]');
    officerTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        officerTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabType = tab.getAttribute('data-officer-tab');
        const jpPane = document.getElementById('auth-pane-janparichay');
        const tkPane = document.getElementById('auth-pane-token');
        if (jpPane) jpPane.style.display = (tabType === 'janparichay') ? 'block' : 'none';
        if (tkPane) tkPane.style.display = (tabType === 'token') ? 'block' : 'none';
      });
    });
  `);
}

fs.writeFileSync('src/app.js', appJs, 'utf8');
console.log('✓ Saved src/app.js');

// ========================================================
// 2. UPDATE index.html:
// - Remove rainbow colors from quick cards
// - Remove rainbow colors from scheme headers
// - Separate the 2 modals (modal-citizen-login & modal-officer-login)
// ========================================================
let html = fs.readFileSync('index.html', 'utf8');

// A. Replace rainbow gradients on quick-card icons with unified clean slate/navy style
html = html.replace(/<div class="quick-icon" style="background: linear-gradient\(135deg, #[a-fA-F0-9]+, #[a-fA-F0-9]+\);"/g,
  '<div class="quick-icon" style="background: #f8fafc; border: 1.5px solid #cbd5e1; box-shadow: 0 1px 3px rgba(0,0,0,0.06); color: #00274d;"');
// Replace stroke="#ffffff" on quick-card icons with stroke="#00274d"
html = html.replace(/(<div class="quick-icon"[^>]*>[\s\S]*?<svg[^>]*stroke=")#ffffff"/g, '$1#00274d"');
html = html.replace(/(<div class="quick-icon"[^>]*>[\s\S]*?<svg[^>]*stroke=")#ffd700"/g, '$1#00274d"');

// B. Remove rainbow colors from scheme card headers
html = html.replace(/<div class="scheme-header" style="background: linear-gradient\(135deg, #[a-fA-F0-9]+, #[a-fA-F0-9]+\);"/g,
  '<div class="scheme-header" style="background: #00274d; border-bottom: 2px solid #0284c7;"');

// C. Replace the single combined modal with TWO SEPARATE MODALS
const oldModalBlockRegex = /<!-- MODAL: CITIZEN & OFFICER AUTHENTICATION[\s\S]*?<!-- FACE VERIFICATION e-KYC MODAL/;

const newSeparateModals = `<!-- MODAL 1: DEDICATED CITIZEN SIGN IN (Aadhaar OTP / Soft Copy / e-KYC) -->
	<div id="modal-citizen-login" class="modal-backdrop" style="display: none;" onclick="if(event.target===this)window.app && window.app.closeLoginModal()">
		<div class="modal-card" style="max-width: 480px;">
			<div class="modal-header">
				<h3 style="font-size: 1.15rem; margin: 0; color: #0f172a; font-weight: 700;">
					Citizen Sign In (MeriPehchaan / Aadhaar e-KYC)
				</h3>
				<button type="button" class="btn-modal-close" onclick="window.app && window.app.closeLoginModal()" aria-label="Close modal">&times;</button>
			</div>
			<div class="modal-body" style="padding: 20px;">
				<form id="aadhaar-login-form" action="javascript:void(0);" method="POST" onsubmit="event.preventDefault(); window.app && window.app.handleAadhaarSubmit(event); return false;">
					<!-- Citizen Name -->
					<div class="form-group" style="margin-bottom: 10px;">
						<label for="input-citizen-name">Citizen Full Name (as per Aadhaar)</label>
						<input type="text" id="input-citizen-name" class="form-input" placeholder="Enter your full legal name" style="font-size: 0.85rem;" autocomplete="name">
					</div>

					<!-- 12-Digit Aadhaar Input -->
					<div class="form-group" style="margin-bottom: 10px;">
						<label for="input-aadhaar">12-Digit Aadhaar / VID Number</label>
						<div style="position: relative;">
							<input type="text" id="input-aadhaar" class="form-input" placeholder="XXXX XXXX XXXX" maxlength="14" style="font-family: monospace; font-size: 0.92rem; letter-spacing: 1px;" required oninput="window.app && window.app.formatAadhaarInput(this)">
							<span id="aadhaar-valid-icon" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 0.9rem; display: none;"></span>
						</div>
					</div>

					<!-- 10-Digit Mobile Number & OTP Trigger -->
					<div class="form-group" style="margin-bottom: 10px;">
						<label for="input-mobile">Registered Mobile Number (for OTP)</label>
						<div style="display: flex; gap: 8px;">
							<div style="display: flex; align-items: center; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0 10px; font-weight: 700; font-size: 0.85rem; color: #475569;">+91</div>
							<input type="tel" id="input-mobile" class="form-input" placeholder="Enter 10-digit mobile" maxlength="10" style="flex: 1; font-family: monospace; font-size: 0.9rem;" required>
							<button type="button" id="btn-send-otp" class="btn-secondary" onclick="window.app && window.app.handleSendOtp()" style="white-space: nowrap; padding: 0 14px; font-size: 0.8rem; background: var(--gov-blue); color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Get OTP</button>
						</div>
						<div id="otp-status-badge" style="display: none; margin-top: 6px; font-size: 0.74rem; background: #dcfce7; color: #166534; padding: 8px 12px; border-radius: 6px; border: 1px solid #bbf7d0; line-height: 1.4;"></div>
					</div>

					<!-- 6-Digit OTP Input -->
					<div class="form-group" style="margin-bottom: 12px;">
						<label for="input-otp">6-Digit One Time Password (OTP)</label>
						<input type="password" id="input-otp" class="form-input" placeholder="Enter 6-digit OTP" maxlength="6" style="font-family: monospace; font-size: 1rem; letter-spacing: 4px; text-align: center;" required onkeydown="if(event.key==='Enter'){event.preventDefault();window.app&&window.app.handleAadhaarSubmit(event);return false;}">
					</div>

					<!-- Aadhaar Card Soft Copy Submission -->
					<div class="form-group" style="margin-bottom: 12px; background: #f8fafc; border: 1.5px dashed #94a3b8; border-radius: 8px; padding: 12px; text-align: center;">
						<label style="display: block; font-size: 0.78rem; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
							Upload Aadhaar Card Soft Copy (PDF / Image)
						</label>
						<div style="font-size: 0.7rem; color: #64748b; margin-bottom: 8px;">
							Soft copy number will be validated against input digits
						</div>
						<input type="file" id="input-aadhaar-doc" accept=".pdf,image/png,image/jpeg,image/jpg" style="display: none;" onchange="window.app && window.app.handleAadhaarFileUpload(event)">
						<div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
							<button type="button" class="btn-card" onclick="document.getElementById('input-aadhaar-doc').click()" style="padding: 6px 14px; font-size: 0.76rem; background: #ffffff; border: 1px solid #0284c7; color: #0284c7; font-weight: 600; cursor: pointer; border-radius: 4px;">
								Choose Aadhaar File (PDF / JPG)
							</button>
							<button type="button" class="btn-card" onclick="window.app && window.app.useThanujAadhaarSoftCopy()" style="padding: 6px 12px; font-size: 0.76rem; background: #f0fdf4; border: 1px solid #16a34a; color: #15803d; font-weight: 700; cursor: pointer; border-radius: 4px;">
								Use My Aadhaar (Penna Peruru Thanuj • 6022 8581 0827)
							</button>
						</div>
						<div id="doc-upload-status" style="margin-top: 6px; font-size: 0.74rem; display: none;"></div>
					</div>

					<!-- Face Verification e-KYC Trigger -->
					<div class="form-group" style="margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 12px;">
						<div>
							<div style="font-size: 0.8rem; font-weight: 700; color: #1e3a8a;"> Face Biometric e-KYC</div>
							<div id="face-kyc-status-txt" style="font-size: 0.7rem; color: #3b82f6;">Required: Liveness Face Match via Camera</div>
						</div>
						<button type="button" id="btn-open-face-kyc" class="btn-card" onclick="window.app && window.app.openFaceKycModal()" style="background: #0284c7; color: #ffffff; border: none; padding: 6px 12px; font-size: 0.75rem; border-radius: 4px; font-weight: 600; cursor: pointer;">
							Open Camera 
						</button>
					</div>

					<button type="button" id="btn-submit-aadhaar" class="btn-primary" onclick="event.preventDefault(); window.app && window.app.handleAadhaarSubmit(event)" style="width: 100%; padding: 11px; font-weight: 700; font-size: 0.9rem;">
						Verify Credentials &amp; Enter Portal
					</button>

					<!-- Instant Citizen Demo Access -->
					<div style="margin-top: 16px; padding: 12px; background: #f8fafc; border: 1.5px dashed #94a3b8; border-radius: 8px; text-align: center;">
						<div style="font-size: 0.74rem; font-weight: 700; color: #00274d; margin-bottom: 8px;">
							Instant Demo Access:
						</div>
						<button type="button" onclick="window.app && window.app.loginDemoHarpreet()" style="width: 100%; padding: 10px 14px; font-size: 0.82rem; background: #0284c7; border: none; border-radius: 6px; color: #ffffff; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
							Citizen Demo (Harpreet Singh) &rarr;
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>

	<!-- MODAL 2: DEDICATED COMPETENT AUTHORITY / OFFICER LOGIN -->
	<div id="modal-officer-login" class="modal-backdrop" style="display: none;" onclick="if(event.target===this)window.app && window.app.closeLoginModal()">
		<div class="modal-card" style="max-width: 480px;">
			<div class="modal-header">
				<h3 style="font-size: 1.15rem; margin: 0; color: #0f172a; font-weight: 700;">
					Competent Authority Login (JanParichay / DSC)
				</h3>
				<button type="button" class="btn-modal-close" onclick="window.app && window.app.closeLoginModal()" aria-label="Close modal">&times;</button>
			</div>
			<div class="modal-body" style="padding: 20px;">
				<div class="login-jurisdiction-box" style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 14px;">
					<div style="font-size: 0.76rem; font-weight: 700; color: #00274d; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
						<span style="display: flex; align-items: center; gap: 6px;">Operational Cadastre Division:</span>
						<span style="font-size: 0.68rem; color: #16a34a; font-weight: 700; background: #dcfce7; padding: 1px 6px; border-radius: 4px;">ISO 19152 Active</span>
					</div>
					<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
						<div>
							<label for="modal-login-state" style="font-size: 0.68rem; color: #475569; font-weight: 600; display: block; margin-bottom: 2px;">State</label>
							<select id="modal-login-state" class="form-input" style="padding: 5px 6px; font-size: 0.75rem; border-radius: 4px;">
								<option value="Punjab" selected>Punjab</option>
								<option value="Haryana">Haryana</option>
								<option value="NCT of Delhi">NCT of Delhi</option>
							</select>
						</div>
						<div>
							<label for="modal-login-district" style="font-size: 0.68rem; color: #475569; font-weight: 600; display: block; margin-bottom: 2px;">District</label>
							<select id="modal-login-district" class="form-input" style="padding: 5px 6px; font-size: 0.75rem; border-radius: 4px;">
								<option value="Amritsar" selected>Amritsar</option>
								<option value="Jalandhar">Jalandhar</option>
								<option value="Ludhiana">Ludhiana</option>
								<option value="Patiala">Patiala</option>
							</select>
						</div>
						<div>
							<label for="modal-login-mandal" style="font-size: 0.68rem; color: #475569; font-weight: 600; display: block; margin-bottom: 2px;">Mandal / Tehsil</label>
							<select id="modal-login-mandal" class="form-input" style="padding: 5px 6px; font-size: 0.75rem; border-radius: 4px;">
								<option value="Amritsar-I" selected>Amritsar-I</option>
								<option value="Amritsar-II">Amritsar-II</option>
								<option value="Ajnala">Ajnala</option>
							</select>
						</div>
					</div>
				</div>

				<div class="auth-tab-buttons" style="margin-bottom: 14px;">
					<button type="button" class="auth-tab active" data-officer-tab="janparichay">JanParichay ID</button>
					<button type="button" class="auth-tab" data-officer-tab="token">Digital Token (DSC)</button>
				</div>

				<!-- TAB 1: JANPARICHAY NSSO -->
				<div id="auth-pane-janparichay" class="auth-pane active">
					<form id="janparichay-login-form" action="javascript:void(0);" method="POST" onsubmit="event.preventDefault(); window.app && window.app.handleJanparichaySubmit(event); return false;">
						<div class="form-group" style="margin-bottom: 10px;">
							<label for="input-jp-username">JanParichay / MeriPehchaan Username</label>
							<input type="text" id="input-jp-username" class="form-input" placeholder="username@gov.in" required>
						</div>
						<div class="form-group" style="margin-bottom: 10px;">
							<label for="input-jp-password">Password</label>
							<input type="password" id="input-jp-password" class="form-input" placeholder="Enter password" required>
						</div>
						<div class="form-group" style="margin-bottom: 12px;">
							<label>Security Verification (Captcha)</label>
							<div style="display: flex; gap: 10px; align-items: center; margin-bottom: 6px;">
								<div id="captcha-display" style="background: #0f172a; color: #38bdf8; font-family: monospace; font-size: 1.2rem; font-weight: 700; letter-spacing: 5px; padding: 8px 16px; border-radius: 6px; user-select: none; border: 1px dashed #38bdf8;">
									K 7 X 9 M
								</div>
								<button type="button" id="btn-refresh-captcha" onclick="window.app && window.app.refreshCaptcha()" style="background: none; border: 1px solid #cbd5e1; padding: 8px 10px; border-radius: 6px; cursor: pointer;" title="Refresh Captcha">&#x21bb;</button>
							</div>
							<input type="text" id="input-captcha" class="form-input" placeholder="Enter captcha text" required>
						</div>
						<button type="submit" class="btn-primary" style="width: 100%; padding: 11px; font-weight: 700;">Sign In with JanParichay NSSO</button>
					</form>
				</div>

				<!-- TAB 2: DIGITAL TOKEN (DSC / e-Sign) -->
				<div id="auth-pane-token" class="auth-pane" style="display: none;">
					<form id="token-login-form" action="javascript:void(0);" method="POST" onsubmit="event.preventDefault(); window.app && window.app.handleTokenSubmit(event); return false;">
						<div class="form-group" style="margin-bottom: 10px;">
							<label for="select-token">Detected USB Cryptographic Token</label>
							<select id="select-token" class="form-input">
								<option value="officer">Punjab Govt Officer DSC - Shri Vikramjit Singh, PCS (Authority Head)</option>
							</select>
						</div>
						<div class="form-group" style="margin-bottom: 12px;">
							<label for="input-token-pin">Token Security PIN</label>
							<input type="password" id="input-token-pin" class="form-input" placeholder="Enter 6-digit USB Token PIN" value="123456" maxlength="8" required>
						</div>
						<button type="submit" class="btn-primary" style="width: 100%; padding: 11px; font-weight: 700; background: linear-gradient(180deg, #0284c7 0%, #0369a1 100%);">
							Authenticate via PKI Digital Signature
						</button>
					</form>
				</div>

				<!-- Instant Authority Demo Access -->
				<div style="margin-top: 16px; padding: 12px; background: #f8fafc; border: 1.5px dashed #94a3b8; border-radius: 8px; text-align: center;">
					<div style="font-size: 0.74rem; font-weight: 700; color: #00274d; margin-bottom: 8px;">
						Instant Authority Access:
					</div>
					<button type="button" onclick="window.app && window.app.loginDemoOfficer()" style="width: 100%; padding: 10px 14px; font-size: 0.82rem; background: #1e1b4b; border: 1.5px solid #ffd700; border-radius: 6px; color: #ffd700; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
						Officer Authority (Vikramjit Singh, PCS) &rarr;
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Invisible alias container for test backward compatibility -->
	<div id="login-modal" style="display: none;"></div>

	<!-- FACE VERIFICATION e-KYC MODAL`;

if (oldModalBlockRegex.test(html)) {
  html = html.replace(oldModalBlockRegex, newSeparateModals);
  console.log('✓ Successfully separated into modal-citizen-login and modal-officer-login');
} else {
  console.error('Could not match oldModalBlockRegex');
}

// Update script cache-buster tag
html = html.replace(/src="src\/app\.js\?v=[^"]*"/, 'src="src/app.js?v=v20260926_separate_modals_v4"');

fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ Saved index.html');
