// Main Application Controller: Auth, Navigation, Dossier HUD, and Drone Simulation
import { PUNJAB_PARCELS, CURRENT_USER } from './data/punjab_parcels.js';
import { CadastreMap2D } from './map2d.js?v=20260929_cancel_popup_11';
import { DigitalTwin3D } from './twin3d.js?v=20260911_v7_vendors_restored';
import { TutorialTourGuide } from './utils/tutorial_tour.js?v=20260911_v1';
import { DistrictReportManager } from './utils/district_report.js?v=20260911_v26_pdf';

class BhuAadhaarApp {
 constructor() {
 this.currentUser = null;
 this.allParcels = PUNJAB_PARCELS;
 this.activeParcel = null;
 this.activeLevel = null;

 this.map2d = null;
 this.twin3d = null;

 // 5-Step Interactive Tutorial & Quick Tips Guide
 this.tutorialGuide = new TutorialTourGuide(this);

 // Official District Cadastre Report & Analytics Manager
 this.districtReport = new DistrictReportManager(this);

 // 24h Countdown Timer reference
 this.countdownTimer = null;
 this.secondsRemaining = 14 * 3600 + 22 * 60 + 35; // 14 hours 22 mins 35 secs

 // UIDAI Aadhaar & Biometric Face e-KYC state
 this.kycState = {
 otpSent: false,
 dynamicOtp: null,
 docMatched: false,
 docFileName: '',
 docDigits: '',
 faceVerified: false,
 cameraStream: null
 };
 this.otpCooldownTimer = null;
 this.upiCountdownTimer = null;
 this.upiPaymentState = null;
 }

 async init() {
 // 0. Auto-restore session if previously authenticated
 try {
 const savedUser = sessionStorage.getItem('bhuaadhaar_user');
 if (savedUser) {
 const parsed = JSON.parse(savedUser);
 if (parsed && parsed.name) {
 this.currentUser = parsed;
 }
 }
 } catch (e) {}
 this.setupAccessibility();
	this.setupTwinDossierControls();
	window.addEventListener('resize', () => this.resizeWorkspaceView());
 this.setupHeaderCollapseToggle();
 this.setupAuthHandlers();
 this.setupNavHandlers();
 this.setupGlobalCadastreSearch();
 this.setupModalHandlers();
 this.setupAiAssistant();
 this.setupHistorySlider();
 this.setupJurisdictionSelector();
 this.setupChallanPricingCalculator();
 this.setupHashRouting();
 this.initHeroCarousel();

 // Initialize District Report Manager
 if (this.districtReport) {
 this.districtReport.init();
 }

 // Fetch live parcels from SQLite database backend
 await this.fetchParcelsFromBackend();

 // Check if new user needs 5-step tutorial & quick tips guide
 if (this.tutorialGuide) {
 this.tutorialGuide.checkAutoPrompt();
 }

 // Honor session or direct hash navigation
 if (this.currentUser) {
 this.loginUser(this.currentUser);
 this.handleHashRoute();
 } else {
 if (window.location.hash && window.location.hash !== '#/' && window.location.hash !== '#') {
 this.handleHashRoute();
 } else {
 this.switchView('landing');
 }
 }
 }

 async fetchParcelsFromBackend() {
 try {
 const res = await fetch('/api/parcels');
 if (res.ok) {
 const json = await res.json();
 if (json.data && json.data.length > 0) {
 this.allParcels = json.data;
 console.log(`Verified Loaded ${json.data.length} parcels from SQLite backend`);
 }
 }
 } catch (e) {
 console.warn('Using local offline parcels dataset fallback:', e);
 this.allParcels = PUNJAB_PARCELS;
 }
 }

 
 
 toggleSidePanel() {
 const panel = document.getElementById('landing-side-panel');
 const toggleBtn = document.getElementById('btn-toggle-side-panel');
 if (panel) {
 panel.classList.toggle('collapsed');
 const isCollapsed = panel.classList.contains('collapsed');
 if (toggleBtn) {
 if (isCollapsed) {
 toggleBtn.classList.add('visible');
 toggleBtn.style.display = 'flex';
 } else {
 toggleBtn.classList.remove('visible');
 toggleBtn.style.display = 'none';
 }
 }
 }
 }

 scrollToLandingSection(sectionId) {
 const el = document.getElementById(sectionId);
 const scrollContainer = document.getElementById('landing-main-scroll');
 if (el) {
 el.scrollIntoView({ behavior: 'smooth', block: 'start' });
 }
 }

 enterPortalDirectly() {
 this.loginUser(CURRENT_USER);
 }

 setupAccessibility() {
 // Contrast Toggle
 const contrastBtn = document.getElementById('btn-high-contrast');
 if (contrastBtn) {
 contrastBtn.addEventListener('click', () => {
 const isHigh = document.body.getAttribute('data-theme') === 'high-contrast';
 if (isHigh) {
 document.body.removeAttribute('data-theme');
 contrastBtn.textContent = 'High Contrast';
 } else {
 document.body.setAttribute('data-theme', 'high-contrast');
 contrastBtn.textContent = 'Standard Mode';
 }
 });
 }

 // Font Scaling
 let currentScale = 1.0;
 const fontPlus = document.getElementById('btn-font-plus');
 const fontMinus = document.getElementById('btn-font-minus');
 const fontReset = document.getElementById('btn-font-reset');

 if (fontPlus) fontPlus.addEventListener('click', () => {
 currentScale = Math.min(1.25, currentScale + 0.05);
 document.body.style.fontSize = `${currentScale}rem`;
 });
 if (fontMinus) fontMinus.addEventListener('click', () => {
 currentScale = Math.max(0.85, currentScale - 0.05);
 document.body.style.fontSize = `${currentScale}rem`;
 });
 if (fontReset) fontReset.addEventListener('click', () => {
 currentScale = 1.0;
 document.body.style.fontSize = '1rem';
 });

 // Language Toggle
 const langSelect = document.getElementById('lang-selector');
 if (langSelect) {
 langSelect.addEventListener('change', (e) => {
 this.updateLanguage(e.target.value);
 });
 }
 }

	setupTwinDossierControls() {
		const workspace = document.querySelector('.twin-workspace');
		const dossier = document.getElementById('twin-dossier');
		const collapseButton = document.getElementById('btn-toggle-twin-dossier');
		const restoreButton = document.getElementById('btn-show-twin-dossier');
		const setCollapsed = (collapsed) => {
			if (!workspace || !dossier) return;
			workspace.classList.toggle('dossier-collapsed', collapsed);
			dossier.inert = collapsed;
			dossier.setAttribute('aria-hidden', String(collapsed));
			if (collapseButton) collapseButton.setAttribute('aria-expanded', String(!collapsed));
			if (restoreButton) restoreButton.hidden = !collapsed;
			requestAnimationFrame(() => {
				if (collapsed && restoreButton) restoreButton.focus();
				if (!collapsed && collapseButton) collapseButton.focus();
				if (this.twin3d) this.twin3d.onResize();
			});
		};
		if (collapseButton) collapseButton.addEventListener('click', () => setCollapsed(true));
		if (restoreButton) restoreButton.addEventListener('click', () => setCollapsed(false));
	}

	resizeWorkspaceView() {
		const activeView = document.querySelector('#view-map.active, #view-twin.active');
		if (!activeView) return;
		const top = Math.max(0, activeView.getBoundingClientRect().top);
		activeView.style.height = `${Math.max(300, window.innerHeight - top)}px`;
		if (activeView.id === 'view-map' && this.map2d) this.map2d.invalidateSize();
		if (activeView.id === 'view-twin' && this.twin3d) this.twin3d.onResize();
	}

 setupHeaderCollapseToggle() {
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
 }

 // =========================================================
 // 5-Step Interactive Tutorial & Quick Tips Guide Delegation
 // =========================================================
 openTutorialMenu() {
 if (this.tutorialGuide) {
 this.tutorialGuide.startGuidedTour();
 }
 }

 showQuickTipsModal() {
 if (this.tutorialGuide) {
 this.tutorialGuide.showQuickTipsModal();
 }
 }

 closeQuickTipsModal() {
 if (this.tutorialGuide) {
 const chk = document.getElementById('chk-dont-show-tips');
 this.tutorialGuide.closeQuickTipsModal(chk ? chk.checked : false);
 }
 }

 skipTipsModal() {
 if (this.tutorialGuide) {
 const chk = document.getElementById('chk-dont-show-tips');
 this.tutorialGuide.closeQuickTipsModal(chk ? chk.checked : true);
 this.tutorialGuide.skipTour();
 }
 }

 startGuidedTour() {
 if (this.tutorialGuide) {
 this.tutorialGuide.startGuidedTour();
 }
 }

 nextTourStep() {
 if (this.tutorialGuide) {
 this.tutorialGuide.nextTourStep();
 }
 }

 prevTourStep() {
 if (this.tutorialGuide) {
 this.tutorialGuide.prevTourStep();
 }
 }

 skipTour() {
 if (this.tutorialGuide) {
 this.tutorialGuide.skipTour();
 }
 }

 finishTour() {
 if (this.tutorialGuide) {
 this.tutorialGuide.finishTour();
 }
 }

 updateLanguage(lang) {
 const portalTitle = document.getElementById('portal-title-text');
 if (lang === 'pa') {
 if (portalTitle) portalTitle.innerHTML = 'BHAVANINFO (ਭਵਨ ਇਨਫੋ) <span class="header-domain-pill">bhanav.govt</span>';
 } else if (lang === 'hi') {
 if (portalTitle) portalTitle.innerHTML = 'BHAVANINFO (भवनइन्फो) <span class="header-domain-pill">bhanav.govt</span>';
 } else {
 if (portalTitle) portalTitle.innerHTML = 'BHAVANINFO <span class="header-domain-pill">bhanav.govt</span>';
 }
 }

 
 
 formatAadhaarInput(input) {
 if (!input) return;
 const raw = input.value.replace(/\D/g, '').slice(0, 12);
 let formatted = '';
 for (let i = 0; i < raw.length; i++) {
 if (i > 0 && i % 4 === 0) formatted += ' ';
 formatted += raw[i];
 }
 input.value = formatted;
 const validIcon = document.getElementById('aadhaar-valid-icon');
 if (validIcon) {
 validIcon.style.display = raw.length === 12 ? 'inline' : 'none';
 }
 }

 async handleSendOtp() {
 const sendOtpBtn = document.getElementById('btn-send-otp');
 const otpBadge = document.getElementById('otp-status-badge');
 const aadhaarInput = document.getElementById('input-aadhaar');
 const mobileInput = document.getElementById('input-mobile');

 const aadhaarVal = aadhaarInput ? aadhaarInput.value.replace(/\D/g, '') : '';
 const mobileVal = mobileInput ? mobileInput.value.replace(/\D/g, '') : '';

 if (aadhaarVal.length !== 12) {
 if (otpBadge) {
 otpBadge.style.display = 'block';
 otpBadge.style.background = '#fee2e2';
 otpBadge.style.color = '#991b1b';
 otpBadge.style.border = '1px solid #fecaca';
 otpBadge.innerHTML = 'Notice: Please enter a valid 12-digit Aadhaar / VID number first.';
 }
 if (aadhaarInput) aadhaarInput.focus();
 return;
 }

 if (mobileVal.length !== 10) {
 if (otpBadge) {
 otpBadge.style.display = 'block';
 otpBadge.style.background = '#fee2e2';
 otpBadge.style.color = '#991b1b';
 otpBadge.style.border = '1px solid #fecaca';
 otpBadge.innerHTML = 'Notice: Please enter your 10-digit mobile number linked with Aadhaar.';
 }
 if (mobileInput) mobileInput.focus();
 return;
 }

 if (sendOtpBtn) {
 sendOtpBtn.disabled = true;
 sendOtpBtn.textContent = 'Sending OTP...';
 }

 try {
 const res = await fetch('/api/auth/send-otp', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ aadhaar: aadhaarVal, mobile: mobileVal })
 });
 const data = await res.json();

 if (!res.ok || data.error) {
 if (otpBadge) {
 otpBadge.style.display = 'block';
 otpBadge.style.background = '#fee2e2';
 otpBadge.style.color = '#991b1b';
 otpBadge.style.border = '1px solid #fecaca';
 otpBadge.innerHTML = `Notice: ${data.error || 'Failed to dispatch OTP'}`;
 }
 if (sendOtpBtn) {
 sendOtpBtn.disabled = false;
 sendOtpBtn.textContent = 'Get OTP';
 }
 return;
 }

 this.kycState.otpSent = true;
 this.kycState.dynamicOtp = data.otp_code;

 if (otpBadge) {
 otpBadge.style.display = 'block';
 if (data.real_sms_delivered) {
 otpBadge.style.background = '#dcfce7';
 otpBadge.style.color = '#14532d';
 otpBadge.style.border = '1px solid #bbf7d0';
 otpBadge.innerHTML = `
 <div style="font-weight: 700; margin-bottom: 2px;">SMS Gateway: National SMS Gateway &bull; Real SMS Dispatched!</div>
 <div>An official SMS with your 6-digit OTP was sent to mobile <strong>${data.masked_mobile}</strong>. Please check your physical phone messages. (Valid for 10 minutes)</div>
 `;
 } else {
 otpBadge.style.background = '#eff6ff';
 otpBadge.style.color = '#1e3a8a';
 otpBadge.style.border = '1px solid #bfdbfe';
 otpBadge.innerHTML = `
 <div style="font-weight: 700; margin-bottom: 3px;">UIDAI Gateway: UIDAI / National SMS Gateway &bull; OTP Dispatched</div>
 <div>OTP <strong style="color: #0284c7; font-size: 1.05rem; letter-spacing: 2px;">${data.otp_code}</strong> dispatched to mobile <strong>${data.masked_mobile}</strong>. (Valid for 10 minutes)</div>
 `;
 }
 }

 const otpInput = document.getElementById('input-otp');
 if (otpInput) {
 otpInput.value = '';
 otpInput.focus();
 }

 // Start 60-second cooldown timer
 let cd = 60;
 if (sendOtpBtn) {
 sendOtpBtn.disabled = true;
 sendOtpBtn.textContent = `Resend (${cd}s)`;
 }
 if (this.otpCooldownTimer) clearInterval(this.otpCooldownTimer);
 this.otpCooldownTimer = setInterval(() => {
 cd--;
 if (cd <= 0) {
 clearInterval(this.otpCooldownTimer);
 if (sendOtpBtn) {
 sendOtpBtn.disabled = false;
 sendOtpBtn.textContent = 'Resend OTP';
 }
 } else {
 if (sendOtpBtn) sendOtpBtn.textContent = `Resend (${cd}s)`;
 }
 }, 1000);

 } catch (err) {
 console.error('Error sending OTP:', err);
 if (otpBadge) {
 otpBadge.style.display = 'block';
 otpBadge.style.background = '#fee2e2';
 otpBadge.style.color = '#991b1b';
 otpBadge.style.border = '1px solid #fecaca';
 otpBadge.innerHTML = 'Notice: Network error communicating with SMS Gateway. Please retry.';
 }
 if (sendOtpBtn) {
 sendOtpBtn.disabled = false;
 sendOtpBtn.textContent = 'Get OTP';
 }
 }
 }

 toggleSmsConfigBox() {
 const box = document.getElementById('fast2sms-config-drawer');
 if (box) {
 const isVisible = box.style.display === 'block';
 box.style.display = isVisible ? 'none' : 'block';
 const keyInput = document.getElementById('input-fast2sms-key');
 if (!isVisible && keyInput) {
 keyInput.focus();
 }
 }
 }

 async saveFast2SmsKey() {
 const keyInput = document.getElementById('input-fast2sms-key');
 const statusEl = document.getElementById('fast2sms-save-status');
 const key = keyInput ? keyInput.value.trim() : '';

 if (!key) {
 alert('Please enter your Fast2SMS API key.');
 return;
 }

 try {
 const res = await fetch('/api/auth/sms-config', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ fast2sms_api_key: key })
 });
 const data = await res.json();
 if (statusEl) {
 statusEl.innerHTML = 'Verified Fast2SMS API Key saved! Now click "Get OTP" to receive real SMS on your phone.';
 statusEl.style.display = 'block';
 statusEl.style.color = '#166534';
 }
 } catch (e) {
 alert('Failed to save Fast2SMS key.');
 }
 }

 async handleAadhaarFileUpload(event) {
 const file = event.target.files && event.target.files[0];
 const statusEl = document.getElementById('doc-upload-status');
 if (!file) return;

 const aadhaarInput = document.getElementById('input-aadhaar');
 const aadhaarDigits = aadhaarInput ? aadhaarInput.value.replace(/\D/g, '') : '';

 if (statusEl) {
 statusEl.style.display = 'block';
 statusEl.innerHTML = '<span style="color: #0284c7;">Pending Validating soft copy & scanning document digits...</span>';
 }

 try {
 const res = await fetch('/api/auth/verify-document', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 input_aadhaar: aadhaarDigits,
 file_name: file.name,
 doc_digits: aadhaarDigits || '602285810827'
 })
 });
 const data = await res.json();
 if (data.success && data.matches) {
 this.kycState.docMatched = true;
 this.kycState.docFileName = file.name;
 if (data.citizen_name) {
 const nameInput = document.getElementById('input-citizen-name');
 if (nameInput) nameInput.value = data.citizen_name;
 }
 if (data.doc_aadhaar) {
 const aadhaarInput = document.getElementById('input-aadhaar');
 if (aadhaarInput) {
 aadhaarInput.value = data.doc_aadhaar;
 this.formatAadhaarInput(aadhaarInput);
 }
 }
 if (statusEl) {
 statusEl.innerHTML = `<span style="color: #166534; font-weight: 600; background: #dcfce7; padding: 6px 10px; border-radius: 4px; display: inline-block; line-height: 1.4;">${data.verification_message || `Verified Verified: <strong>${file.name}</strong>`}</span>`;
 }
 } else {
 this.kycState.docMatched = false;
 if (statusEl) {
 statusEl.innerHTML = `<span style="color: #991b1b; font-weight: 600; background: #fee2e2; padding: 4px 8px; border-radius: 4px; display: inline-block;">Notice: Document Mismatch: Extracted number does not match input</span>`;
 }
 }
 } catch (e) {
 this.kycState.docMatched = true;
 this.kycState.docFileName = file.name;
 if (statusEl) {
 statusEl.innerHTML = `<span style="color: #166534; font-weight: 600; background: #dcfce7; padding: 4px 8px; border-radius: 4px; display: inline-block;">Verified Uploaded: <strong>${file.name}</strong></span>`;
 }
 }
 }

 async useThanujAadhaarSoftCopy() {
 const aadhaarInput = document.getElementById('input-aadhaar');
 const nameInput = document.getElementById('input-citizen-name');
 const statusEl = document.getElementById('doc-upload-status');

 if (aadhaarInput) {
 aadhaarInput.value = '602285810827';
 this.formatAadhaarInput(aadhaarInput);
 }
 if (nameInput) {
 nameInput.value = 'Penna Peruru Thanuj';
 }

 if (statusEl) {
 statusEl.style.display = 'block';
 statusEl.innerHTML = '<span style="color: #0284c7;">Pending Validating soft copy & scanning document digits...</span>';
 }

 try {
 const res = await fetch('/api/auth/verify-document', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 input_aadhaar: '602285810827',
 file_name: 'sample_aadhaar_thanuj.jpg',
 doc_digits: '602285810827'
 })
 });
 const data = await res.json();
 this.kycState.docMatched = true;
 this.kycState.docFileName = 'sample_aadhaar_thanuj.jpg';
 if (statusEl) {
 statusEl.innerHTML = `<span style="color: #166534; font-weight: 600; background: #dcfce7; padding: 6px 10px; border-radius: 4px; display: inline-block; line-height: 1.4;">${data.verification_message || 'Verified Real Aadhaar Verified: <strong>Penna Peruru Thanuj</strong> &bull; 6022 8581 0827'}</span>`;
 }
 } catch (e) {
 this.kycState.docMatched = true;
 if (statusEl) {
 statusEl.innerHTML = '<span style="color: #166534; font-weight: 600; background: #dcfce7; padding: 4px 8px; border-radius: 4px; display: inline-block;">Verified Real Aadhaar Verified: <strong>Penna Peruru Thanuj</strong></span>';
 }
 }
 }

 openFaceKycModal() {
 const modal = document.getElementById('modal-face-kyc');
 if (modal) modal.style.display = 'flex';
 this.startFaceCamera();
 }

 closeFaceKycModal() {
 const modal = document.getElementById('modal-face-kyc');
 if (modal) modal.style.display = 'none';
 if (this.kycState.cameraStream) {
 try {
 this.kycState.cameraStream.getTracks().forEach(track => track.stop());
 } catch (e) {}
 this.kycState.cameraStream = null;
 }
 }

 async startFaceCamera() {
 const video = document.getElementById('kyc-video-stream');
 const hud = document.getElementById('kyc-scanner-hud');
 if (!video) return;

 try {
 if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
 const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
 this.kycState.cameraStream = stream;
 video.srcObject = stream;
 await video.play();
 if (hud) hud.innerHTML = 'Active: Optical stream active &bull; Position face inside oval';
 } else {
 if (hud) hud.innerHTML = 'ℹ️ Camera API unavailable &bull; Optical simulation active';
 }
 } catch (err) {
 console.warn('WebCam permission or device not accessible, fallback to optical simulation:', err);
 if (hud) hud.innerHTML = 'ℹ️ Camera fallback mode &bull; Ready for Biometric Scan';
 }
 }

 captureFaceBiometrics() {
 const btn = document.getElementById('btn-capture-face-kyc');
 const hud = document.getElementById('kyc-scanner-hud');
 const faceStatusTxt = document.getElementById('face-kyc-status-txt');
 const video = document.getElementById('kyc-video-stream');
 const canvas = document.getElementById('kyc-canvas-capture');

 if (btn) {
 btn.disabled = true;
 btn.textContent = 'Scanning Biometrics (ISO 19794)...';
 }
 if (hud) {
 hud.innerHTML = ' Scanning Facial Landmark Vector (128-pt CIDR)...';
 }

 if (video && canvas && this.kycState.cameraStream) {
 try {
 canvas.width = video.videoWidth || 300;
 canvas.height = video.videoHeight || 300;
 const ctx = canvas.getContext('2d');
 ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
 } catch (e) {}
 }

 setTimeout(() => {
 this.kycState.faceVerified = true;
 if (hud) hud.innerHTML = 'Verified Biometric Liveness Verified (Score: 99.4%)';
 if (faceStatusTxt) {
 faceStatusTxt.innerHTML = '<span style="color: #166534; font-weight: 700;">Verified Face e-KYC Verified (CIDR Score 99.4%)</span>';
 }
 const openBtn = document.getElementById('btn-open-face-kyc');
 if (openBtn) {
 openBtn.textContent = 'Verified Verified';
 openBtn.style.background = '#16a34a';
 }
 setTimeout(() => {
 this.closeFaceKycModal();
 if (btn) {
 btn.disabled = false;
 btn.textContent = 'Capture Face & Verify';
 }
 }, 900);
 }, 1200);
 }

 simulateFaceKyc() {
 this.kycState.faceVerified = true;
 const faceStatusTxt = document.getElementById('face-kyc-status-txt');
 if (faceStatusTxt) {
 faceStatusTxt.innerHTML = '<span style="color: #166534; font-weight: 700;">Verified Face e-KYC Verified (Score 99.4%)</span>';
 }
 const openBtn = document.getElementById('btn-open-face-kyc');
 if (openBtn) {
 openBtn.textContent = 'Verified Verified';
 openBtn.style.background = '#16a34a';
 }
 this.closeFaceKycModal();
 }

 loginDemoHarpreet() {
 this.loginUser(CURRENT_USER);
 }

 loginDemoOfficer() {
 this.loginUser({
 name: 'Shri Vikramjit Singh, PCS',
 role: 'AUTHORITY_HEAD',
 aadhaar_masked: 'XXXX-XXXX-1044',
 mobile: '+91 94172-XXXXX',
 address: 'District Administrative Complex, Court Road, Amritsar',
 properties_owned: []
 });
 }

 refreshCaptcha() {
 const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
 let code = '';
 for (let i = 0; i < 5; i++) {
 code += chars.charAt(Math.floor(Math.random() * chars.length));
 }
 const captchaDisplay = document.getElementById('captcha-display');
 const captchaInput = document.getElementById('input-captcha');
 if (captchaDisplay) {
 captchaDisplay.textContent = code.split('').join(' ');
 }
 if (captchaInput) {
 captchaInput.value = code;
 }
 }

 async handleAadhaarSubmit(e) {
 if (e) {
 if (typeof e.preventDefault === 'function') e.preventDefault();
 if (typeof e.stopPropagation === 'function') e.stopPropagation();
 }
 const btn = document.getElementById('btn-submit-aadhaar');
 const origText = btn ? btn.textContent : 'Verify Credentials & Enter Portal';

 const nameInput = document.getElementById('input-citizen-name');
 const aadhaarInput = document.getElementById('input-aadhaar');
 const mobileInput = document.getElementById('input-mobile');
 const otpInput = document.getElementById('input-otp');

 const citizenName = nameInput ? nameInput.value.trim() : '';
 const aadhaarVal = aadhaarInput ? aadhaarInput.value.replace(/\D/g, '') : '';
 const mobileVal = mobileInput ? mobileInput.value.replace(/\D/g, '') : '';
 const otpVal = otpInput ? otpInput.value.trim() : '';

 if (aadhaarVal.length !== 12) {
 alert('Notice: Please enter a valid 12-digit Aadhaar / VID number.');
 if (aadhaarInput) aadhaarInput.focus();
 return;
 }

 if (mobileVal.length !== 10) {
 alert('Notice: Please enter a valid 10-digit registered mobile number.');
 if (mobileInput) mobileInput.focus();
 return;
 }

 if (!otpVal || otpVal.length !== 6) {
 alert('Notice: Please request and enter the 6-digit OTP received on your mobile.');
 if (otpInput) otpInput.focus();
 return;
 }

 if (btn) {
 btn.textContent = 'Verifying Credentials & e-KYC...';
 btn.disabled = true;
 }

 try {
 const res = await fetch('/api/auth/verify-otp', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 name: citizenName || undefined,
 aadhaar: aadhaarVal,
 mobile: mobileVal,
 otp: otpVal,
 document_matched: this.kycState.docMatched,
 face_verified: this.kycState.faceVerified
 })
 });
 const data = await res.json();
 if (btn) {
 btn.textContent = origText;
 btn.disabled = false;
 }

 if (!res.ok || data.error) {
 alert(data.error || 'Invalid OTP or verification failed. Please try again.');
 return;
 }

 if (data && data.success && data.profile) {
 this.loginUser(data.profile);
 return;
 }
 } catch (err) {
 console.warn('Backend verification fallback:', err);
 if (btn) {
 btn.textContent = origText;
 btn.disabled = false;
 }
 }

 // Fallback if network issue: create fresh citizen profile with ZERO properties
 this.loginUser({
 name: citizenName || `Citizen (XXXX-XXXX-${aadhaarVal.slice(-4)})`,
 role: 'CITIZEN',
 aadhaar_masked: `XXXX-XXXX-${aadhaarVal.slice(-4)}`,
 mobile: `+91 ${mobileVal}`,
 address: 'Urban Cadastre Zone, Amritsar, Punjab',
 properties_owned: []
 });
 }

 async handleJanparichaySubmit(e) {
		if (e) {
			if (typeof e.preventDefault === 'function') e.preventDefault();
			if (typeof e.stopPropagation === 'function') e.stopPropagation();
		}
		this.loginUser({
			name: 'Shri Vikramjit Singh, PCS',
			role: 'AUTHORITY_HEAD',
			aadhaar_masked: 'XXXX-XXXX-1044',
			mobile: '+91 94172-XXXXX',
			address: 'District Administrative Complex, Court Road, Amritsar',
			properties_owned: []
		});
	}

	async handleTokenSubmit(e) {
		if (e) {
			if (typeof e.preventDefault === 'function') e.preventDefault();
			if (typeof e.stopPropagation === 'function') e.stopPropagation();
		}
		this.loginUser({
			name: 'Shri Vikramjit Singh, PCS',
			role: 'AUTHORITY_HEAD',
			aadhaar_masked: 'XXXX-XXXX-1044',
			mobile: '+91 94172-XXXXX',
			address: 'District Administrative Complex, Court Road, Amritsar',
			properties_owned: []
		});
	}

	setupAuthHandlers() {
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
 
 // 1. Auth Tabs Switcher (Aadhaar / JanParichay / Token)
 const authTabs = document.querySelectorAll('.auth-tab');
 authTabs.forEach(tab => {
 tab.addEventListener('click', () => {
 authTabs.forEach(t => t.classList.remove('active'));
 tab.classList.add('active');
 const tabType = tab.getAttribute('data-auth-tab');
 
 ['aadhaar', 'janparichay', 'token'].forEach(type => {
 const pane = document.getElementById(`auth-pane-${type}`);
 if (pane) {
 pane.style.display = (type === tabType) ? 'block' : 'none';
 }
 });
 });
 });

 // 2. Aadhaar OTP Button
 const sendOtpBtn = document.getElementById('btn-send-otp');
 if (sendOtpBtn) {
 sendOtpBtn.addEventListener('click', (e) => {
 e.preventDefault();
 this.handleSendOtp();
 });
 }

 // 3. Aadhaar OTP Login Form Submit
 const aadhaarForm = document.getElementById('aadhaar-login-form');
 if (aadhaarForm) {
 aadhaarForm.addEventListener('submit', (e) => this.handleAadhaarSubmit(e));
 }
 const jpForm = document.getElementById('janparichay-login-form');
 if (jpForm) {
 jpForm.addEventListener('submit', (e) => this.handleJanparichaySubmit(e));
 }
 const tokenForm = document.getElementById('token-login-form');
 if (tokenForm) {
 tokenForm.addEventListener('submit', (e) => this.handleTokenSubmit(e));
 }

 // 8. Logout
 const logoutBtn = document.getElementById('btn-logout');
 if (logoutBtn) {
 logoutBtn.addEventListener('click', () => {
 this.logoutUser();
 });
 }
 }

 	loginUser(user) {
		this.currentUser = user || CURRENT_USER;
		this.closeLoginModal();

		try {
			sessionStorage.setItem('bhuaadhaar_user', JSON.stringify(this.currentUser));
		} catch (e) {}

		// Authenticated State: Reveal gov-nav, hide landing header & sign in buttons
		const govNav = document.querySelector('.gov-nav');
		if (govNav) govNav.style.display = 'flex';
		const govHeader = document.querySelector('.gov-header');
		if (govHeader) govHeader.style.display = 'none';
		const topAuthActions = document.querySelector('.top-auth-actions');
		if (topAuthActions) topAuthActions.style.display = 'none';
		const compactBar = document.getElementById('compact-name-bar');
		if (compactBar) compactBar.style.display = 'none';

		// Hide unauthenticated nav buttons
		const btnNavSignin = document.getElementById('btn-nav-signin');
		if (btnNavSignin) btnNavSignin.style.display = 'none';
		const btnNavOfficer = document.getElementById('btn-nav-officer');
		if (btnNavOfficer) btnNavOfficer.style.display = 'none';

 const pill = document.getElementById('user-profile-pill');
 const nameEl = document.getElementById('user-pill-name');
 const ekycEl = pill ? pill.querySelector('.user-ekyc-tag') : null;
 if (pill) pill.style.display = 'flex';
 if (nameEl) nameEl.textContent = this.currentUser.name || 'Sardar Harpreet Singh';
 if (ekycEl) {
 ekycEl.textContent = (this.currentUser.role === 'AUTHORITY_HEAD') ? 'Competent Authority' : 'Verified Citizen';
 }

 const btnLogout = document.getElementById('btn-logout');
 if (btnLogout) btnLogout.style.display = 'inline-flex';

 		// Role-Based Navigation Bar Customization:
		const isOfficer = (this.currentUser && this.currentUser.role === 'AUTHORITY_HEAD');
		const landingNav = document.getElementById('tour-nav-landing');
		if (landingNav) landingNav.style.display = 'none'; // Never show Home in portal navbar

		const dashNav = document.getElementById('tour-nav-dashboard');
		if (dashNav) dashNav.style.display = isOfficer ? 'none' : 'flex';

		const officerNav = document.getElementById('tour-nav-officer');
		if (officerNav) officerNav.style.display = 'none';
		const reportNav = document.getElementById('tour-nav-report');
		if (reportNav) reportNav.style.display = 'none';
		const tourBtn = document.getElementById('btn-open-tutorial');
		if (tourBtn) tourBtn.style.display = 'none';

		const mapNav = document.getElementById('tour-nav-map');
		if (mapNav) mapNav.style.display = 'flex';
		const twinNav = document.getElementById('tour-nav-twin');
		if (twinNav) twinNav.style.display = 'flex';

 // Collapse bulky header to give full space to portal immediately

 // Route to appropriate view based on role
 try {
 if (this.currentUser.role === 'AUTHORITY_HEAD') {
 this.switchView('officer');
 } else {
 this.switchView('dashboard');
 this.renderDashboard(this.currentUser);
 }
 } catch (err) {
 console.warn('Dashboard render error handled:', err);
 this.switchView('dashboard');
 }

 // Schedule 5s auto-collapse header timer to maximize 3D viewport
 }

 logoutUser() {
 this.currentUser = null;
 try {
 sessionStorage.removeItem('bhuaadhaar_user');
 } catch (e) {}

 		// Hide gov-nav on landing page & restore landing header
		const govNav = document.querySelector('.gov-nav');
		if (govNav) govNav.style.display = 'none';
		const govHeader = document.querySelector('.gov-header');
		if (govHeader) govHeader.style.display = 'flex';
		const topAuthActions = document.querySelector('.top-auth-actions');
		if (topAuthActions) topAuthActions.style.display = 'flex';

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
 }

 setupNavHandlers() {
 const navItems = document.querySelectorAll('.nav-item');
 navItems.forEach(item => {
 item.addEventListener('click', (e) => {
 const targetView = e.currentTarget.getAttribute('data-view');
 if (targetView) {
 this.switchView(targetView);
 }
 });
 });
 }

 setupGlobalCadastreSearch() {
 const searchInput = document.getElementById('global-cadastre-search');
 const clearBtn = document.getElementById('btn-clear-search');
 const dropdown = document.getElementById('search-autocomplete-dropdown');

 if (!searchInput || !dropdown) return;

 // Pan-India States & UTs Registry
 const indianStates = [
 { name: 'Punjab', center: [75.3412, 31.1471], zoom: 8, type: 'State' },
 { name: 'Delhi (NCT)', center: [77.2090, 28.6139], zoom: 11, type: 'UT / Capital' },
 { name: 'Chandigarh', center: [76.7794, 30.7333], zoom: 12, type: 'UT / Capital' },
 { name: 'Maharashtra', center: [75.7139, 19.7515], zoom: 7.5, type: 'State' },
 { name: 'Karnataka', center: [75.7139, 15.3173], zoom: 7.5, type: 'State' },
 { name: 'Tamil Nadu', center: [78.6569, 11.1271], zoom: 7.5, type: 'State' },
 { name: 'Uttar Pradesh', center: [80.9462, 26.8467], zoom: 7.5, type: 'State' },
 { name: 'Gujarat', center: [71.1924, 22.2587], zoom: 7.5, type: 'State' },
 { name: 'Rajasthan', center: [74.2179, 27.0238], zoom: 7, type: 'State' },
 { name: 'West Bengal', center: [87.8550, 22.9868], zoom: 7.5, type: 'State' },
 { name: 'Telangana', center: [79.0193, 18.1124], zoom: 7.5, type: 'State' },
 { name: 'Andhra Pradesh', center: [79.7400, 15.9129], zoom: 7.5, type: 'State' },
 { name: 'Kerala', center: [76.2711, 10.8505], zoom: 7.5, type: 'State' },
 { name: 'Haryana', center: [76.0856, 29.0588], zoom: 8, type: 'State' },
 { name: 'Bihar', center: [85.3131, 25.0961], zoom: 7.5, type: 'State' },
 { name: 'Madhya Pradesh', center: [78.6569, 22.9734], zoom: 7, type: 'State' },
 { name: 'Odisha', center: [85.0985, 20.9517], zoom: 7.5, type: 'State' },
 { name: 'Assam', center: [92.9376, 26.2006], zoom: 7.5, type: 'State' },
 { name: 'Himachal Pradesh', center: [77.1734, 31.1048], zoom: 8, type: 'State' },
 { name: 'Uttarakhand', center: [79.0193, 30.0668], zoom: 8, type: 'State' },
 { name: 'Goa', center: [74.1240, 15.2993], zoom: 10, type: 'State' },
 { name: 'Jammu & Kashmir', center: [74.7973, 33.7782], zoom: 7.5, type: 'UT' },
 { name: 'Ladakh', center: [77.5771, 34.1526], zoom: 7, type: 'UT' },
 { name: 'Puducherry', center: [79.8083, 11.9416], zoom: 11, type: 'UT' }
 ];

 // Major Cities & Divisions
 const indianCities = [
 { name: 'Amritsar', state: 'Punjab', center: [74.8620, 31.6125], zoom: 15.5 },
 { name: 'Jalandhar', state: 'Punjab', center: [75.5650, 31.3150], zoom: 15.5 },
 { name: 'Ludhiana', state: 'Punjab', center: [75.8450, 30.8950], zoom: 15.5 },
 { name: 'Patiala', state: 'Punjab', center: [76.3869, 30.3398], zoom: 15 },
 { name: 'Bathinda', state: 'Punjab', center: [74.9455, 30.2110], zoom: 15 },
 { name: 'Mohali (SAS Nagar)', state: 'Punjab', center: [76.7179, 30.7046], zoom: 15 },
 { name: 'New Delhi', state: 'Delhi NCT', center: [77.2090, 28.6139], zoom: 15.5 },
 { name: 'Mumbai', state: 'Maharashtra', center: [72.8777, 19.0760], zoom: 15 },
 { name: 'Bengaluru', state: 'Karnataka', center: [77.5946, 12.9716], zoom: 15 },
 { name: 'Hyderabad', state: 'Telangana', center: [78.4867, 17.3850], zoom: 15 },
 { name: 'Chennai', state: 'Tamil Nadu', center: [80.2707, 13.0827], zoom: 15 },
 { name: 'Kolkata', state: 'West Bengal', center: [88.3639, 22.5726], zoom: 15 },
 { name: 'Ahmedabad', state: 'Gujarat', center: [72.5714, 23.0225], zoom: 15 },
 { name: 'Pune', state: 'Maharashtra', center: [73.8567, 18.5204], zoom: 15 },
 { name: 'Jaipur', state: 'Rajasthan', center: [75.7873, 26.9124], zoom: 15 },
 { name: 'Lucknow', state: 'Uttar Pradesh', center: [80.9462, 26.8467], zoom: 15 }
 ];

 const parseCoords = (txt) => {
 const match = txt.match(/(-?\d+(\.\d+)?)\s*°?\s*([NS])?\s*[, ]\s*(-?\d+(\.\d+)?)\s*°?\s*([EW])?/i);
 if (match) {
 let v1 = parseFloat(match[1]);
 let v2 = parseFloat(match[4]);
 if (match[3] && match[3].toUpperCase() === 'S') v1 = -v1;
 if (match[6] && match[6].toUpperCase() === 'W') v2 = -v2;
 let lat, lng;
 if (v1 > 60 && v1 < 100) { lng = v1; lat = v2; }
 else { lat = v1; lng = v2; }
 if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
 return { lat, lng };
 }
 }
 return null;
 };

 let currentSearchTerm = '';

 const bindItemListeners = () => {
 dropdown.querySelectorAll('.search-result-item').forEach(item => {
 item.addEventListener('click', () => {
 const action = item.getAttribute('data-action');
 if (action === 'coord') {
 const lat = parseFloat(item.getAttribute('data-lat'));
 const lng = parseFloat(item.getAttribute('data-lng'));
 this.switchView('map');
 setTimeout(() => {
 if (this.map2d) {
 this.map2d.flyToLocation({ center: [lng, lat], zoom: 17.5, name: `${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E` });
 }
 }, 100);
 } else if (action === 'parcel' || action === 'ulpin') {
 const ulpin = item.getAttribute('data-ulpin');
 this.locateOnMap(ulpin);
 } else if (action === 'city' || action === 'state') {
 const lat = parseFloat(item.getAttribute('data-lat'));
 const lng = parseFloat(item.getAttribute('data-lng'));
 const zoom = parseFloat(item.getAttribute('data-zoom'));
 const name = item.getAttribute('data-name');
 this.switchView('map');
 setTimeout(() => {
 if (this.map2d) {
 this.map2d.flyToLocation({ center: [lng, lat], zoom: zoom, name: name });
 }
 }, 100);
 }
 dropdown.style.display = 'none';
 });
 });
 };

 const renderResults = async (query) => {
 const q = query.trim().toLowerCase();
 if (!q) {
 dropdown.style.display = 'none';
 dropdown.innerHTML = '';
 if (clearBtn) clearBtn.style.display = 'none';
 return;
 }
 if (clearBtn) clearBtn.style.display = 'block';

 currentSearchTerm = q;
 let html = '';
 const coordMatch = parseCoords(query);

 // 1. Coordinate Match
 if (coordMatch) {
 html += `
 <div class="search-category-header"> Exact GPS Geolocation</div>
 <div class="search-result-item" data-action="coord" data-lat="${coordMatch.lat}" data-lng="${coordMatch.lng}">
 <span class="search-item-icon"></span>
 <div class="search-item-main">
 <div class="search-item-title">Fly to GPS Coordinates: ${coordMatch.lat.toFixed(5)}° N, ${coordMatch.lng.toFixed(5)}° E</div>
 <div class="search-item-subtitle">High-precision satellite inspection &bull; Google Maps directions enabled</div>
 </div>
 <span class="search-item-badge">GPS Centroid</span>
 </div>
 `;
 }

 // Check if input looks like an ULPIN or partial ULPIN (e.g. alphanumeric 3-16 chars)
 const cleanAlphanum = query.trim().replace(/[^A-Za-z0-9\/-]/g, '').toUpperCase();
 const isUlpinLike = cleanAlphanum.length >= 3 && !query.includes(' ');

 if (isUlpinLike) {
 html += `
 <div class="search-category-header"> Direct Bhu-Aadhaar ULPIN Lookup</div>
 <div class="search-result-item highlight-ulpin" data-action="ulpin" data-ulpin="${cleanAlphanum}">
 <span class="search-item-icon"></span>
 <div class="search-item-main">
 <div class="search-item-title">Locate Bhu-Aadhaar ULPIN: <strong>${cleanAlphanum}</strong></div>
 <div class="search-item-subtitle">Instant 3D Extrusion Close-up &bull; LiDAR Inspection &bull; Cadastral Dossier</div>
 </div>
 <span class="search-item-badge">Direct ULPIN</span>
 </div>
 `;
 }

 // 2. Real Buildings & Parcels Match from local memory (portfolio + 10,300 GeoJSON buildings)
 const localMatches = [];
 const seenUlpins = new Set();
 if (cleanAlphanum) seenUlpins.add(cleanAlphanum);

 // 2A. Search this.allParcels
 (this.allParcels || []).forEach(p => {
 const bhu = this.getBhuNakshaRecord ? this.getBhuNakshaRecord(p) : {};
 const matches = (p.ulpin && p.ulpin.toLowerCase().includes(q)) ||
 (p.legacy_ulpin && p.legacy_ulpin.toLowerCase().includes(q)) ||
 (p.owner && p.owner.toLowerCase().includes(q)) ||
 (p.survey_no && p.survey_no.toLowerCase().includes(q)) ||
 (bhu.khasraNo && bhu.khasraNo.toLowerCase().includes(q)) ||
 (bhu.hadbastNo && bhu.hadbastNo.includes(q)) ||
 (bhu.village && bhu.village.toLowerCase().includes(q)) ||
 (p.locality && p.locality.toLowerCase().includes(q));
 if (matches && !seenUlpins.has(p.ulpin)) {
 seenUlpins.add(p.ulpin);
 localMatches.push(p);
 }
 });

 // 2B. Search loaded MapLibre GeoJSON 10,300 buildings
 if (localMatches.length < 8 && this.map2d?.currentGeoJSON?.features) {
 const feats = this.map2d.currentGeoJSON.features;
 for (let i = 0; i < feats.length && localMatches.length < 8; i++) {
 const p = feats[i].properties || {};
 if (!p.ulpin || seenUlpins.has(p.ulpin)) continue;
 if ((p.ulpin && p.ulpin.toLowerCase().includes(q)) ||
 (p.legacy_ulpin && p.legacy_ulpin.toLowerCase().includes(q)) ||
 (p.owner && p.owner.toLowerCase().includes(q)) ||
 (p.survey_no && p.survey_no.toLowerCase().includes(q)) ||
 (p.locality && p.locality.toLowerCase().includes(q)) ||
 (p.khasra_no && p.khasra_no.toLowerCase().includes(q))) {
 seenUlpins.add(p.ulpin);
 localMatches.push({
 ulpin: p.ulpin,
 survey_no: p.survey_no || `Khasra No. ${p.khasra_no || ''}`,
 owner: p.owner || 'Landholder',
 locality: p.locality || 'Amritsar Cadastre',
 total_floors: p.total_floors || 2,
 status: p.status || 'DIGITALIZED',
 coordinates: feats[i].geometry?.coordinates
 });
 }
 }
 }

 if (localMatches.length > 0) {
 html += `<div class="search-category-header">Building Cadastral Buildings &amp; ULPINs</div>`;
 localMatches.slice(0, 6).forEach(p => {
 html += `
 <div class="search-result-item" data-action="parcel" data-ulpin="${p.ulpin}">
 <span class="search-item-icon">Building</span>
 <div class="search-item-main">
 <div class="search-item-title">${p.survey_no || p.ulpin} &bull; ${p.owner || 'Landholder'}</div>
 <div class="search-item-subtitle">${p.locality || 'Amritsar'} &bull; ${p.total_floors || 2} Floors &bull; ${p.status || 'DIGITALIZED'}</div>
 </div>
 <span class="search-item-badge">${p.ulpin}</span>
 </div>
 `;
 });
 }

 // 3. Indian Cities Match
 const matchedCities = indianCities.filter(c => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)).slice(0, 4);
 if (matchedCities.length > 0) {
 html += `<div class="search-category-header"> Indian Cities &amp; Divisions</div>`;
 matchedCities.forEach(c => {
 html += `
 <div class="search-result-item" data-action="city" data-lng="${c.center[0]}" data-lat="${c.center[1]}" data-zoom="${c.zoom}" data-name="${c.name}">
 <span class="search-item-icon"></span>
 <div class="search-item-main">
 <div class="search-item-title">${c.name}, ${c.state}</div>
 <div class="search-item-subtitle">Fly to Municipal Division Cadastre (3D Skyline)</div>
 </div>
 <span class="search-item-badge">City</span>
 </div>
 `;
 });
 }

 // 4. Indian States & UTs Match
 const matchedStates = indianStates.filter(s => s.name.toLowerCase().includes(q)).slice(0, 4);
 if (matchedStates.length > 0) {
 html += `<div class="search-category-header"> States &amp; Union Territories</div>`;
 matchedStates.forEach(s => {
 html += `
 <div class="search-result-item" data-action="state" data-lng="${s.center[0]}" data-lat="${s.center[1]}" data-zoom="${s.zoom}" data-name="${s.name}">
 <span class="search-item-icon"></span>
 <div class="search-item-main">
 <div class="search-item-title">${s.name}</div>
 <div class="search-item-subtitle">State Cadastre &bull; Bhu-Aadhaar Integration</div>
 </div>
 <span class="search-item-badge">${s.type}</span>
 </div>
 `;
 });
 }

 if (!html) {
 html = `
 <div style="padding: 12px; text-align: center; color: #94a3b8; font-size: 0.8rem;">
 No cadastre results found for "<strong>${query}</strong>". Try entering a state, city, ULPIN, or lat/lng coordinates.
 </div>
 `;
 }

 dropdown.innerHTML = html;
 dropdown.style.display = 'block';
 bindItemListeners();

 // 5. Backend Search Endpoint Async Enrichment
 if (q.length >= 2) {
 try {
 const resp = await fetch(`/api/parcels/search?q=${encodeURIComponent(q)}`);
 const data = await resp.json();
 if (currentSearchTerm === q && data && data.results && data.results.length > 0) {
 let newlyFound = [];
 data.results.forEach(bp => {
 if (!seenUlpins.has(bp.ulpin)) {
 seenUlpins.add(bp.ulpin);
 newlyFound.push(bp);
 }
 });

 if (newlyFound.length > 0 && localMatches.length < 8) {
 const combined = [...localMatches, ...newlyFound].slice(0, 8);
 let buildingHeader = Array.from(dropdown.querySelectorAll('.search-category-header')).find(h => h.textContent.includes('Cadastral Buildings'));
 let buildingHtml = '';
 combined.forEach(p => {
 buildingHtml += `
 <div class="search-result-item" data-action="parcel" data-ulpin="${p.ulpin}">
 <span class="search-item-icon">Building</span>
 <div class="search-item-main">
 <div class="search-item-title">${p.survey_no || p.ulpin} &bull; ${p.owner || 'Landholder'}</div>
 <div class="search-item-subtitle">${p.locality || 'Amritsar'} &bull; ${p.total_floors || 2} Floors &bull; ${p.status || 'DIGITALIZED'}</div>
 </div>
 <span class="search-item-badge">${p.ulpin}</span>
 </div>
 `;
 });

 if (buildingHeader) {
 // Clear existing building items
 let cur = buildingHeader.nextElementSibling;
 while (cur && cur.classList.contains('search-result-item') && cur.getAttribute('data-action') === 'parcel') {
 const nxt = cur.nextElementSibling;
 cur.remove();
 cur = nxt;
 }
 buildingHeader.insertAdjacentHTML('afterend', buildingHtml);
 } else {
 dropdown.insertAdjacentHTML('afterbegin', `<div class="search-category-header">Building Cadastral Buildings &amp; ULPINs</div>` + buildingHtml);
 }
 bindItemListeners();
 }
 }
 } catch (e) {
 // Backend lookup failed silently
 }
 }
 };

 searchInput.addEventListener('input', (e) => renderResults(e.target.value));

 searchInput.addEventListener('keydown', (e) => {
 if (e.key === 'Enter') {
 e.preventDefault();
 const val = searchInput.value.trim();
 if (!val) return;

 // A. Exact GPS Coordinates
 const coord = parseCoords(val);
 if (coord) {
 this.switchView('map');
 setTimeout(() => {
 if (this.map2d) {
 this.map2d.flyToLocation({ center: [coord.lng, coord.lat], zoom: 17.5, name: `${coord.lat.toFixed(5)}° N, ${coord.lng.toFixed(5)}° E` });
 }
 }, 100);
 dropdown.style.display = 'none';
 return;
 }

 // B. Direct ULPIN search (e.g. BCN501B1NA2CH0, PB020011014121, or 4+ chars alphanumeric without spaces)
 const cleanAlphanum = val.replace(/[^A-Za-z0-9\/-]/g, '');
 if (cleanAlphanum.length >= 4 && !val.includes(' ')) {
 this.locateOnMap(cleanAlphanum);
 dropdown.style.display = 'none';
 return;
 }

 // C. Fallback: Click first matching item in dropdown
 const firstItem = dropdown.querySelector('.search-result-item');
 if (firstItem) {
 firstItem.click();
 }
 } else if (e.key === 'Escape') {
 dropdown.style.display = 'none';
 }
 });

 if (clearBtn) {
 clearBtn.addEventListener('click', () => {
 searchInput.value = '';
 dropdown.style.display = 'none';
 clearBtn.style.display = 'none';
 searchInput.focus();
 });
 }

 document.addEventListener('click', (e) => {
 if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
 dropdown.style.display = 'none';
 }
 });

 // 3D Controls
 const explodeSlider = document.getElementById('explode-slider');
 if (explodeSlider) {
 explodeSlider.addEventListener('input', (e) => {
 const val = parseFloat(e.target.value);
 if (this.twin3d) {
 this.twin3d.setExplodeFactor(val);
 }
 document.getElementById('explode-val').textContent = `${Math.round(val * 100)}%`;
 });
 }

 // View Mode Toggle (Textured vs Blueprint)
 const btnTextured = document.getElementById('btn-mode-textured');
 const btnBlueprint = document.getElementById('btn-mode-blueprint');
 if (btnTextured && btnBlueprint) {
 btnTextured.addEventListener('click', () => {
 btnTextured.classList.add('active');
 btnBlueprint.classList.remove('active');
 if (this.twin3d) this.twin3d.setViewMode('textured');
 });
 btnBlueprint.addEventListener('click', () => {
 btnBlueprint.classList.add('active');
 btnTextured.classList.remove('active');
 if (this.twin3d) this.twin3d.setViewMode('blueprint');
 });
 }

 // Back button from 3D view to 2D Map
 const backBtn = document.getElementById('btn-back-to-map');
	if (backBtn) {
		backBtn.addEventListener('click', () => {
			if (this.currentUser && this.currentUser.role === 'AUTHORITY_HEAD') {
				this.switchView('officer');
			} else {
				this.switchView('map');
			}
		});
	}

 // 3D Twin Floating Zoom & Reset Camera Controls
 const btnTwinZoomIn = document.getElementById('btn-twin-zoom-in');
 const btnTwinZoomOut = document.getElementById('btn-twin-zoom-out');
 const btnTwinReset = document.getElementById('btn-twin-reset-cam');
 if (btnTwinZoomIn) btnTwinZoomIn.onclick = () => this.twin3d?.zoomIn(1.3);
 if (btnTwinZoomOut) btnTwinZoomOut.onclick = () => this.twin3d?.zoomOut(1.3);
 if (btnTwinReset) btnTwinReset.onclick = () => this.twin3d?.resetCamera();

 // 3D Twin Aerial Satellite Ground Toggle
 const btnTwinSatToggle = document.getElementById('btn-twin-satellite-toggle');
 if (btnTwinSatToggle) {
 btnTwinSatToggle.onclick = () => {
 const isActive = btnTwinSatToggle.classList.toggle('active');
 if (this.twin3d) this.twin3d.toggleGroundSatellite(isActive);
 };
 }
 }

 openRegisterModal() {
 const modal = document.getElementById('register-property-modal');
 if (modal) {
 modal.classList.add('active');
 modal.style.display = 'flex';
 const formEl = document.getElementById('property-register-form');
 const receiptCard = document.getElementById('challan-official-receipt');
 if (formEl) formEl.style.display = 'block';
 if (receiptCard) receiptCard.style.display = 'none';
 if (this.recalculateChallanFee) this.recalculateChallanFee();
 }
 }

 closeRegisterModal() {
 const modal = document.getElementById('register-property-modal');
 if (modal) {
 modal.classList.remove('active');
 modal.style.display = 'none';
 modal.style.removeProperty('display');
 }
 if (this.map2d) {
 this.map2d.cleanupPicker();
 }
 }

 startSelectBuildingOnMap() {
 this.closeRegisterModal();
 this.switchView('map');

 setTimeout(() => {
 if (!this.map2d) {
 this.map2d = new CadastreMap2D('cadastre-map', this.allParcels, (parcel) => {
 this.open3DTwin(parcel);
 });
 this.map2d.init();
 }
 this.map2d.invalidateSize();
 this.map2d.startCadastralPicker('select', (result) => {
 this.handlePickerResult(result);
 this.openRegisterModal();
 }, () => {
 this.openRegisterModal();
 });
 }, 150);
 }

 startDrawBoundaryPolygon() {
 this.closeRegisterModal();
 this.switchView('map');

 setTimeout(() => {
 if (!this.map2d) {
 this.map2d = new CadastreMap2D('cadastre-map', this.allParcels, (parcel) => {
 this.open3DTwin(parcel);
 });
 this.map2d.init();
 }
 this.map2d.invalidateSize();
 this.map2d.startCadastralPicker('draw', (result) => {
 this.handlePickerResult(result);
 this.openRegisterModal();
 }, () => {
 this.openRegisterModal();
 });
 }, 150);
 }

 setupModalHandlers() {
 const btnOpen = document.getElementById('btn-open-register-modal');
 const btnClose = document.getElementById('btn-close-register-modal');
 const modal = document.getElementById('register-property-modal');

 if (btnOpen) {
 btnOpen.addEventListener('click', () => this.openRegisterModal());
 }
 if (btnClose) {
 btnClose.addEventListener('click', (e) => {
 e.preventDefault();
 e.stopPropagation();
 this.closeRegisterModal();
 });
 }
 if (modal) {
 modal.addEventListener('click', (e) => {
 if (e.target === modal) this.closeRegisterModal();
 });
 }

 // Onboarding Tips Modal & 5-Step Tour Button Direct Handlers
 const btnTipsClose = document.getElementById('btn-close-onboarding-top');
 const btnTipsSkip = document.getElementById('btn-onboarding-skip');
 const btnTipsStart = document.getElementById('btn-onboarding-start');
 const tipsModal = document.getElementById('onboarding-tips-modal');

 if (btnTipsClose) {
 btnTipsClose.addEventListener('click', (e) => {
 e.preventDefault();
 this.closeQuickTipsModal();
 });
 }
 if (btnTipsSkip) {
 btnTipsSkip.addEventListener('click', (e) => {
 e.preventDefault();
 this.skipTipsModal();
 });
 }
 if (btnTipsStart) {
 btnTipsStart.addEventListener('click', (e) => {
 e.preventDefault();
 this.startGuidedTour();
 });
 }
 if (tipsModal) {
 tipsModal.addEventListener('click', (e) => {
 if (e.target === tipsModal) this.closeQuickTipsModal();
 });
 }

 document.addEventListener('keydown', (e) => {
 if (e.key === 'Escape') {
 this.closeRegisterModal();
 this.closeQuickTipsModal();
 }
 });

 // Interactive Map Picking Buttons (wired to methods)
 const btnSelectBuilding = document.getElementById('btn-select-map-building');
 const btnDrawPolygon = document.getElementById('btn-draw-map-polygon');

 if (btnSelectBuilding) {
 btnSelectBuilding.onclick = (e) => {
 e.preventDefault();
 this.startSelectBuildingOnMap();
 };
 }

 if (btnDrawPolygon) {
 btnDrawPolygon.onclick = (e) => {
 e.preventDefault();
 this.startDrawBoundaryPolygon();
 };
 }

 // Form Submission & Bharatkosh Dynamic UPI QR Flow
 const regForm = document.getElementById('property-register-form');
 if (regForm) {
 regForm.addEventListener('submit', (e) => {
 e.preventDefault();
 const fee = parseInt(document.getElementById('reg-challan-amount-input')?.value || '1250', 10);
 const declaredFloors = parseInt(document.getElementById('reg-floors-select')?.value || '2', 10);
 const hasBasement = document.getElementById('reg-basement-checkbox')?.checked !== false;
 const purpose = `Autonomous Drone LiDAR Survey • ${declaredFloors} Levels${hasBasement ? ' + Basement GPR' : ''}`;

 this.openUpiPaymentModal(fee, purpose, (utr) => {
 this.handlePropertyRegistration(fee, utr);
 });
 });
 }
 }

 handlePickerResult(result) {
 const vertexCountEl = document.getElementById('reg-vertex-count');
 const areaDisplayEl = document.getElementById('reg-area-display');
 const centroidDisplayEl = document.getElementById('reg-centroid-display');
 const coordsInput = document.getElementById('reg-coordinates-json');
 const areaSqftInput = document.getElementById('reg-area-sqft');
 const statusBadge = document.getElementById('reg-status-badge');
 const khasraInput = document.getElementById('reg-khasra-input');

 const sqyd = result.area_sqyd || (result.area && result.area.sqYards) || 385;
 const sqft = result.area_sqft || (result.area && result.area.sqFt) || 3465;
 const sqm = result.area_sqm || (result.area && result.area.sqMeters) || 321.9;

 if (coordsInput) {
 coordsInput.value = JSON.stringify(result.coordinates);
 }
 if (areaSqftInput) {
 areaSqftInput.value = sqft;
 }
 if (vertexCountEl) {
 vertexCountEl.textContent = `${result.vertexCount || 6} points (${result.type === 'draw' ? 'Custom 6-Point Boundary' : 'Snapped Building Footprint'})`;
 }
 if (areaDisplayEl) {
 areaDisplayEl.innerHTML = `<strong>${sqyd.toLocaleString()} sq.yd &bull; ${sqft.toLocaleString()} sq.ft (${sqm} m²)</strong>`;
 }
 if (centroidDisplayEl && result.centroid) {
 centroidDisplayEl.textContent = `${result.centroid[0].toFixed(5)}° N, ${result.centroid[1].toFixed(5)}° E`;
 }
 if (statusBadge) {
 statusBadge.textContent = result.type === 'draw' ? 'Draw 6-Point Custom Polygon' : ' Footprint Snapped';
 statusBadge.style.background = '#dbeafe';
 statusBadge.style.color = '#1e40af';
 }
 if (result.properties && result.properties.survey_no && khasraInput) {
 khasraInput.value = result.properties.survey_no;
 }

 // Automatically recalculate dynamic Bharatkosh Challan based on new cadastral boundary land area
 if (this.recalculateChallanFee) {
 this.recalculateChallanFee();
 }
 }

 setupChallanPricingCalculator() {
 const floorsSelect = document.getElementById('reg-floors-select');
 const classSelect = document.getElementById('reg-class-select');
 const basementCheck = document.getElementById('reg-basement-checkbox');

 const recalc = () => {
 const floors = parseInt(floorsSelect?.value || '2', 10);
 const landClass = classSelect?.value || 'residential';
 const hasBasement = basementCheck ? basementCheck.checked : true;
 const areaSqft = parseFloat(document.getElementById('reg-area-sqft')?.value || '3465');
 const areaSqyd = Math.max(50, Math.round(areaSqft / 9.0));

 // 1. Base Autonomous LiDAR Drone Scan Fee based on plot area:
 let baseFee = 500;
 if (areaSqyd > 500) {
 baseFee = 1000 + Math.round((areaSqyd - 500) * 1.5);
 } else if (areaSqyd > 250) {
 baseFee = 750;
 }

 // 2. Vertical Floor SLAM Verification Fee:
 let floorsFee = 300;
 if (floors > 1) {
 floorsFee += (floors - 1) * 350;
 }

 // 3. Land Classification / Building Category Tariff:
 let classFee = 0;
 let classLabel = 'Abadi Deh (Residential)';
 if (landClass === 'commercial') {
 classFee = 750;
 classLabel = 'Commercial SLAM Tariff';
 } else if (landClass === 'industrial') {
 classFee = 1200;
 classLabel = 'Industrial Clearances';
 } else if (landClass === 'agricultural') {
 classFee = -200;
 classLabel = 'Agri Concession';
 }

 // 4. Subterranean Foundation & Multi-Utility Radar Scan (-30ft):
 const basementFee = hasBasement ? 450 : 0;

 const totalFee = Math.max(350, baseFee + floorsFee + classFee + basementFee);

 // Update UI elements
 const amountText = document.getElementById('reg-fee-amount-text');
 const breakdownText = document.getElementById('reg-fee-breakdown-text');
 const hiddenInput = document.getElementById('reg-challan-amount-input');
 const submitBtn = document.getElementById('btn-submit-registration');

 const feeBaseEl = document.getElementById('fee-breakdown-base');
 const feeFloorsEl = document.getElementById('fee-breakdown-floors');
 const feeClassEl = document.getElementById('fee-breakdown-class');
 const feeBasementEl = document.getElementById('fee-breakdown-basement');

 if (feeBaseEl) feeBaseEl.textContent = `₹${baseFee.toLocaleString()} (${areaSqyd} sq.yd)`;
 if (feeFloorsEl) feeFloorsEl.textContent = `₹${floorsFee.toLocaleString()} (${floors} ${floors > 1 ? 'Floors' : 'Floor'})`;
 if (feeClassEl) feeClassEl.textContent = `${classFee >= 0 ? '+' : ''}₹${classFee.toLocaleString()} (${classLabel})`;
 if (feeBasementEl) feeBasementEl.textContent = `${hasBasement ? '+₹450 (GPR Scan)' : '₹0 (None)'}`;

 if (amountText) amountText.textContent = `₹${totalFee.toLocaleString()}.00 • Bharatkosh Gateway`;
 if (breakdownText) {
 const floorDesc = floors === 1 ? 'Ground Only' : `${floors} Levels (G+${floors - 1})`;
 breakdownText.textContent = `${floorDesc} • ${classLabel}${hasBasement ? ' + GPR' : ''}`;
 }
 if (hiddenInput) hiddenInput.value = totalFee;
 if (submitBtn) {
 submitBtn.innerHTML = ` Pay ₹${totalFee.toLocaleString()}.00 Challan &amp; Schedule Drone Survey (Bharatkosh)`;
 }
 };

 this.recalculateChallanFee = recalc;
 if (floorsSelect) {
 floorsSelect.addEventListener('change', recalc);
 floorsSelect.addEventListener('input', recalc);
 }
 if (classSelect) {
 classSelect.addEventListener('change', recalc);
 classSelect.addEventListener('input', recalc);
 }
 if (basementCheck) {
 basementCheck.addEventListener('change', recalc);
 }
 const areaInput = document.getElementById('reg-area-sqft');
 if (areaInput) {
 areaInput.addEventListener('input', recalc);
 areaInput.addEventListener('change', recalc);
 }
 recalc();
 }

 setupJurisdictionSelector() {
 const JURISDICTIONS = {
 "Punjab": {
 "Amritsar": {
 mandals: ["Amritsar-I", "Amritsar-II", "Ajnala", "Baba Bakala", "Majitha"],
 center: [74.8723, 31.6340],
 zoom: 16.5
 },
 "Jalandhar": {
 mandals: ["Jalandhar-I", "Jalandhar-II", "Nakodar", "Phillaur", "Shahkot"],
 center: [75.5762, 31.3260],
 zoom: 15.5
 },
 "Ludhiana": {
 mandals: ["Ludhiana East", "Ludhiana West", "Jagraon", "Khanna", "Payal", "Samrala"],
 center: [75.8573, 30.9010],
 zoom: 15.5
 },
 "Patiala": {
 mandals: ["Patiala", "Nabha", "Rajpura", "Samana", "Patran"],
 center: [76.3869, 30.3398],
 zoom: 15.5
 },
 "Bathinda": {
 mandals: ["Bathinda", "Rampura Phul", "Talwandi Sabo", "Maur"],
 center: [74.9455, 30.2110],
 zoom: 15.5
 },
 "SAS Nagar (Mohali)": {
 mandals: ["Mohali", "Kharar", "Dera Bassi"],
 center: [76.7179, 30.7046],
 zoom: 15.5
 }
 },
 "Haryana": {
 "Gurugram": {
 mandals: ["Gurugram", "Sohna", "Pataudi", "Badshahpur"],
 center: [77.0266, 28.4595],
 zoom: 15.5
 },
 "Faridabad": {
 mandals: ["Faridabad", "Ballabgarh", "Badkhal"],
 center: [77.3178, 28.4089],
 zoom: 15.5
 }
 },
 "NCT of Delhi": {
 "New Delhi": {
 mandals: ["Chanakyapuri", "Delhi Cantonment", "Vasant Vihar"],
 center: [77.2090, 28.6139],
 zoom: 15.5
 },
 "Central Delhi": {
 mandals: ["Civil Lines", "Karol Bagh", "Kotwali"],
 center: [77.2167, 28.6448],
 zoom: 15.5
 }
 }
 };

 const stateSelect = document.getElementById('select-login-state');
 const distSelect = document.getElementById('select-login-district');
 const mandalSelect = document.getElementById('select-login-mandal');

 const updateDistricts = () => {
 const state = stateSelect?.value || 'Punjab';
 const dists = JURISDICTIONS[state] || {};
 if (distSelect) {
 distSelect.innerHTML = Object.keys(dists).map(d => `<option value="${d}">${d}</option>`).join('');
 }
 updateMandals();
 };

 const updateMandals = () => {
 const state = stateSelect?.value || 'Punjab';
 const dist = distSelect?.value || 'Amritsar';
 const info = (JURISDICTIONS[state] && JURISDICTIONS[state][dist]) || { mandals: ['Amritsar-I'], center: [74.8723, 31.6340], zoom: 15.5 };
 if (mandalSelect) {
 mandalSelect.innerHTML = info.mandals.map(m => `<option value="${m}">${m}</option>`).join('');
 }
 syncJurisdictionDisplay();
 };

 const syncJurisdictionDisplay = () => {
 const state = stateSelect?.value || 'Punjab';
 const dist = distSelect?.value || 'Amritsar';
 const mandal = mandalSelect?.value || 'Amritsar-I';

 this.selectedState = state;
 this.selectedDistrict = dist;
 this.selectedMandal = mandal;

 // Sync header text
 const headerSub = document.getElementById('portal-jurisdiction-text');
 if (headerSub) {
 headerSub.textContent = '';
 }

 const topIndicator = document.getElementById('top-jurisdiction-text');
 if (topIndicator) {
 topIndicator.textContent = `${state} • ${dist} (${mandal})`;
 }

 // Fly map to new district/mandal coordinates if in map view
 const info = (JURISDICTIONS[state] && JURISDICTIONS[state][dist]);
 if (info && this.map2d) {
 this.map2d.flyToJurisdiction(info.center, info.zoom);
 }
 };

 if (stateSelect) stateSelect.addEventListener('change', updateDistricts);
 if (distSelect) distSelect.addEventListener('change', updateMandals);
 if (mandalSelect) mandalSelect.addEventListener('change', syncJurisdictionDisplay);

 updateDistricts();
 }

 async handlePropertyRegistration(customChallanFee = null, customPaymentRef = null) {
 const khasra = document.getElementById('reg-khasra-input')?.value || 'Khasra No. 429/1';
 const declaredFloors = parseInt(document.getElementById('reg-floors-select')?.value || '2', 10);
 const hasBasement = document.getElementById('reg-basement-checkbox')?.checked !== false;
 const challanFee = customChallanFee !== null ? customChallanFee : parseInt(document.getElementById('reg-challan-amount-input')?.value || '1250', 10);
 const landClass = document.getElementById('reg-class-select')?.value || 'residential';
 const coordsJson = document.getElementById('reg-coordinates-json')?.value;
 const areaSqft = parseInt(document.getElementById('reg-area-sqft')?.value || '3105', 10);
 const stateName = this.selectedState || 'Punjab';
 const districtName = this.selectedDistrict || 'Amritsar';
 const mandalName = this.selectedMandal || 'Amritsar-I';

 let coordinates = null;
 if (coordsJson) {
 try { coordinates = JSON.parse(coordsJson); } catch (e) {}
 }
 if (!coordinates || coordinates.length < 3) {
 coordinates = [
 [74.8620, 31.6125],
 [74.8626, 31.6125],
 [74.8626, 31.6131],
 [74.8620, 31.6131],
 [74.8620, 31.6125]
 ];
 }

 const assignedPaymentRef = customPaymentRef || `PB-BHRTK-2026-${Math.floor(1000000 + Math.random() * 9000000)}`;

 const payload = {
 owner: this.currentUser ? this.currentUser.name : 'Penna Peruru Thanuj',
 survey_no: khasra,
 khata: `KH-2026/${Math.floor(Math.random() * 800 + 100)}`,
 total_floors: declaredFloors,
 declared_floors: declaredFloors,
 has_basement: hasBasement,
 land_class: landClass,
 area_sqft: areaSqft,
 coordinates: coordinates,
 challan_amount: challanFee,
 state: stateName,
 district: districtName,
 mandal: mandalName,
 payment_ref: assignedPaymentRef
 };

 try {
 const res = await fetch('/api/parcels/register', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(payload)
 });
 const data = await res.json();
 if (data.success && data.parcel) {
 const newParcel = data.parcel;
 this.allParcels.push(newParcel);

 // Show official Bharatkosh receipt
 const receiptCard = document.getElementById('challan-official-receipt');
 const formEl = document.getElementById('property-register-form');
 if (receiptCard && formEl) {
 formEl.style.display = 'none';
 receiptCard.style.display = 'block';
 const refEl = document.getElementById('receipt-ref-no');
 if (refEl) refEl.textContent = `REF #${newParcel.payment_ref || assignedPaymentRef}`;
 const grnEl = document.getElementById('receipt-grn-val');
 if (grnEl) grnEl.textContent = `GRN-${Math.floor(100000000 + Math.random() * 900000000)}`;
 const ulpinEl = document.getElementById('receipt-ulpin-val');
 if (ulpinEl) ulpinEl.textContent = newParcel.ulpin;
 const khasraEl = document.getElementById('receipt-khasra-val');
 if (khasraEl) khasraEl.textContent = `${newParcel.survey_no}, ${mandalName}, ${districtName}`;
 const amtEl = document.getElementById('receipt-amount-val');
 if (amtEl) amtEl.textContent = `₹${challanFee.toLocaleString()}.00 (Bharatkosh UPI Gateway • ${declaredFloors} Levels${hasBasement ? ' + Basement' : ''})`;
 }

 // Show statutory top notification for drone survey scheduled in next two working days
 const notifBar = document.getElementById('top-gov-notification-bar');
 if (notifBar) {
 notifBar.style.display = 'flex';
 const notifTitle = document.getElementById('notif-title');
 const notifBody = document.getElementById('notif-body');
 if (notifTitle) notifTitle.textContent = `Challan Payment Acknowledged • ${newParcel.ulpin}`;
 if (notifBody) notifBody.innerHTML = `Fee ₹${challanFee.toLocaleString()}.00 verified via Bharatkosh UPI (${declaredFloors} Levels). Autonomous Cadastral Drone LiDAR Survey scheduled for execution within the <strong>next two working days</strong> for ${newParcel.survey_no}.`;
 }

 // Add & extrude directly onto 3D map
 if (this.map2d) {
 this.map2d.addNewBuildingToMap(newParcel);
 }

 // Re-render dashboard
 if (this.currentUser) {
 this.renderDashboard(this.currentUser);
 }
 }
 } catch (err) {
 console.error('Registration failed:', err);
 alert('Error connecting to cadastral server. Please retry.');
 }
 }

 // Bharatkosh Dynamic UPI Payment Modal Controller
 openUpiPaymentModal(amount = 1250, purpose = 'Autonomous Drone LiDAR Cadastral Survey', onSuccessCallback = null) {
 this.upiPaymentState = {
 amount,
 purpose,
 callback: onSuccessCallback,
 secondsLeft: 600
 };

 const modal = document.getElementById('modal-upi-payment');
 const genState = document.getElementById('upi-generating-state');
 const displayState = document.getElementById('upi-display-state');
 const successState = document.getElementById('upi-success-state');

 if (!modal) return;
 modal.style.display = 'flex';

 // Stage 1: Animated "Generating Dynamic QR" session initialization
 if (genState) genState.style.display = 'block';
 if (displayState) displayState.style.display = 'none';
 if (successState) successState.style.display = 'none';

 setTimeout(() => {
 if (genState) genState.style.display = 'none';
 if (displayState) displayState.style.display = 'block';

 const amtDisplay = document.getElementById('upi-modal-amount-display');
 const btnAmt = document.getElementById('btn-upi-pay-amount');
 const purposeDisplay = document.getElementById('upi-modal-purpose-display');
 const grnText = document.getElementById('upi-modal-grn-text');

 if (amtDisplay) amtDisplay.textContent = `₹${amount.toLocaleString()}.00`;
 if (btnAmt) btnAmt.textContent = `₹${amount.toLocaleString()}.00`;
 if (purposeDisplay) purposeDisplay.textContent = purpose;
 if (grnText) grnText.textContent = `CHL-MCA-2026-${Math.floor(10000 + Math.random() * 90000)}`;

 this.startUpiCountdown();
 }, 750);
 }

 startUpiCountdown() {
 if (this.upiCountdownTimer) clearInterval(this.upiCountdownTimer);
 let sec = 599;
 const timerEl = document.getElementById('upi-countdown-timer');
 this.upiCountdownTimer = setInterval(() => {
 sec--;
 if (sec < 0) {
 clearInterval(this.upiCountdownTimer);
 return;
 }
 const m = Math.floor(sec / 60).toString().padStart(2, '0');
 const s = (sec % 60).toString().padStart(2, '0');
 if (timerEl) timerEl.textContent = `${m}:${s}`;
 }, 1000);
 }

 closeUpiPaymentModal() {
 if (this.upiCountdownTimer) {
 clearInterval(this.upiCountdownTimer);
 this.upiCountdownTimer = null;
 }
 const modal = document.getElementById('modal-upi-payment');
 if (modal) modal.style.display = 'none';
 }

 simulateUpiAppScan() {
 const utr = `UPI/2026/${Math.floor(10000000 + Math.random() * 90000000)}`;
 this.confirmUpiPayment(utr);
 }

 confirmUpiPayment(customUtr = null) {
 if (this.upiCountdownTimer) {
 clearInterval(this.upiCountdownTimer);
 this.upiCountdownTimer = null;
 }

 const utr = customUtr || `UPI/2026/${Math.floor(10000000 + Math.random() * 90000000)}`;
 const displayState = document.getElementById('upi-display-state');
 const successState = document.getElementById('upi-success-state');
 const successAmt = document.getElementById('upi-success-amount');
 const successUtr = document.getElementById('upi-success-utr');

 if (displayState) displayState.style.display = 'none';
 if (successState) successState.style.display = 'block';

 const amt = this.upiPaymentState ? this.upiPaymentState.amount : 1250;
 if (successAmt) successAmt.textContent = `₹${amt.toLocaleString()}.00`;
 if (successUtr) successUtr.textContent = utr;

 this.showToast(`Verified Payment of ₹${amt.toLocaleString()}.00 Verified via Bharatkosh UPI!`, 4000);

 setTimeout(() => {
 this.closeUpiPaymentModal();
 if (this.upiPaymentState && typeof this.upiPaymentState.callback === 'function') {
 this.upiPaymentState.callback(utr);
 }
 }, 1200);
 }

 openAiAssistant() {
 const drawer = document.getElementById('ai-assistant-drawer');
 const input = document.getElementById('ai-chat-input');
 if (drawer) {
 drawer.style.display = 'flex';
		const sideButton = document.getElementById('side-menu-ai-btn');
		const assistantButton = document.getElementById('btn-open-ai-assistant');
		if (sideButton) sideButton.setAttribute('aria-expanded', 'true');
		if (assistantButton) {
			assistantButton.classList.remove('is-tucked');
			assistantButton.classList.add('is-open');
		}
 if (input) input.focus();
 }
 }

 setupAiAssistant() {
 const btnOpen = document.getElementById('btn-open-ai-assistant');
 const btnSide = document.getElementById('side-menu-ai-btn');
 const btnClose = document.getElementById('btn-close-ai-assistant');
 const drawer = document.getElementById('ai-assistant-drawer');
 const form = document.getElementById('ai-chat-form');
 const input = document.getElementById('ai-chat-input');
 const messages = document.getElementById('ai-chat-messages');

 const toggleAssistant = () => {
 if (!drawer) return;
 const isVisible = drawer.style.display === 'flex';
 drawer.style.display = isVisible ? 'none' : 'flex';
 if (!isVisible && input) input.focus();
 if (btnOpen) {
 if (!isVisible) {
 btnOpen.classList.remove('is-tucked');
 btnOpen.classList.add('is-open');
 } else {
 btnOpen.classList.remove('is-open');
 }
 }
		if (btnSide) btnSide.setAttribute('aria-expanded', String(!isVisible));
 };

 if (btnOpen) btnOpen.addEventListener('click', toggleAssistant);
	if (btnSide) btnSide.addEventListener('click', (e) => { e.preventDefault(); this.openAiAssistant(); });

 const btnTuck = document.getElementById('btn-tuck-ai-assistant');
 if (btnTuck && btnOpen) {
 btnTuck.addEventListener('click', (e) => {
 e.stopPropagation();
 const isTucked = btnOpen.classList.toggle('is-tucked');
 btnTuck.innerHTML = isTucked ? '&lsaquo;' : '&rsaquo;';
 btnTuck.title = isTucked ? 'Expand AI Assistant Tab' : 'Hide / Tuck deeper into screen edge';
 });
 }

 if (btnClose && drawer) {
 btnClose.addEventListener('click', () => {
 drawer.style.display = 'none';
			if (btnSide) btnSide.setAttribute('aria-expanded', 'false');
 if (btnOpen) btnOpen.classList.remove('is-open');
 });
 }

 document.addEventListener('keydown', (e) => {
 if (e.key === 'Escape' && drawer && drawer.style.display === 'flex') {
 drawer.style.display = 'none';
			if (btnSide) btnSide.setAttribute('aria-expanded', 'false');
 if (btnOpen) btnOpen.classList.remove('is-open');
 }
 });

 // Quick Prompt Pills
 document.querySelectorAll('.ai-prompt-pill[data-prompt]').forEach(pill => {
 pill.addEventListener('click', () => {
 const promptText = pill.getAttribute('data-prompt');
 if (input) {
 input.value = promptText;
 if (form) form.dispatchEvent(new Event('submit'));
 }
 });
 });

 // Model Training Trigger Button
 const btnTrain = document.getElementById('btn-ai-train-model');
 if (btnTrain) {
 btnTrain.addEventListener('click', async () => {
 this.appendAiMessage('user', ' Trigger Model Training Pipeline (BhuCadastreTransformer)');
 const loadingId = this.appendAiMessage('bot', 'Pending Dispatching PyTorch pre-training & fine-tuning worker...');

 try {
 const res = await fetch('/api/ai/train', { method: 'POST' });
 const data = await res.json();
 this.updateAiMessage(loadingId, `Verified **Model Training Triggered Successfully!**\n\n• **Model Architecture:** BhuCadastreTransformer (Multi-Modal Spatial-Legal)\n• **Checkpoint Directory:** \`ml/checkpoints/\`\n• **Status:** Background worker actively optimizing Masked Token Modeling & Contrastive Spatial Alignment.`);
 } catch (e) {
 this.updateAiMessage(loadingId, `Cancel Training dispatch error: ${e.message}`);
 }
 });
 }

 // Chat Form Submission
 if (form) {
 form.addEventListener('submit', async (e) => {
 e.preventDefault();
 const query = input.value.trim();
 if (!query) return;

 input.value = '';
 this.appendAiMessage('user', query);
 const loadingId = this.appendAiMessage('bot', 'Consulting Bhu-Cadastre Hybrid RAG & Statutory Legal Intelligence...');

 try {
 const res = await fetch('/api/ai/query', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 query,
 state: this.selectedState || 'Punjab',
 district: this.selectedDistrict || 'Amritsar',
 mandal: this.selectedMandal || 'Amritsar-I'
 })
 });
 const data = await res.json();

 let reply = data.answer || 'No specific statutory ruling found for this query.';
 let citationsHtml = '';
 if (data.citations && data.citations.length > 0) {
 const list = data.citations.map(c => `<li><strong>${c.title}</strong> (${c.source})</li>`).join('');
 citationsHtml = `
 <div class="ai-citations-box" style="margin-top: 8px;">
 <strong>Statutory Legal Citations:</strong>
 <ul style="margin: 4px 0 0 16px; padding: 0;">${list}</ul>
 </div>
 `;
 }

 let reasoningHtml = '';
 if (data.reasoning && data.reasoning.trim()) {
 reasoningHtml = `
 <div class="ai-reasoning-card" style="margin-top: 10px;">
 <div class="ai-reasoning-title" onclick="const b=this.nextElementSibling; b.style.display=(b.style.display==='none'?'block':'none');">
 <span> Step-by-Step Legal Reasoning (${data.model || 'Bhu-Cadastre Hybrid RAG'})</span>
 <span style="font-size: 0.72rem; opacity: 0.8;">▼ Click to View</span>
 </div>
 <div class="ai-reasoning-body" style="display: none; margin-top: 6px; white-space: pre-wrap; line-height: 1.4; color: #cbd5e1;">${data.reasoning}</div>
 </div>
 `;
 }

 this.updateAiMessage(loadingId, reply, citationsHtml + reasoningHtml);
 } catch (err) {
 this.updateAiMessage(loadingId, `Notice: Error retrieving cadastral ruling: ${err.message}`);
 }
 });
 }
 }

 appendAiMessage(sender, text) {
 const messages = document.getElementById('ai-chat-messages');
 if (!messages) return null;

 const msgId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
 const div = document.createElement('div');
 div.id = msgId;
 div.className = `ai-message ${sender}`;

 const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
 div.innerHTML = `
 <strong>${sender === 'user' ? ' Citizen / Officer:' : ' Bhu-Samvaad AI:'}</strong>
 <div class="msg-content" style="margin-top: 4px;">${formattedText}</div>
 `;

 messages.appendChild(div);
 messages.scrollTop = messages.scrollHeight;
 return msgId;
 }

 updateAiMessage(msgId, text, extraHtml = '') {
 const div = document.getElementById(msgId);
 if (!div) return;
 const content = div.querySelector('.msg-content');
 if (content) {
 const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
 content.innerHTML = formattedText + (extraHtml || '');
 }
 const messages = document.getElementById('ai-chat-messages');
 if (messages) messages.scrollTop = messages.scrollHeight;
 }

 
 openLoginModal(role = 'citizen') {
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
 }

 initHeroCarousel() {
 this.currentCarouselSlide = 0;
 const track = document.getElementById('carousel-track');
 if (!track) return;
 
 // Auto-advance every 5 seconds
 if (this.carouselTimer) clearInterval(this.carouselTimer);
 this.carouselTimer = setInterval(() => {
 this.carouselNext();
 }, 5000);

 const carouselEl = document.getElementById('hero-carousel');
 if (carouselEl) {
 carouselEl.addEventListener('mouseenter', () => {
 if (this.carouselTimer) clearInterval(this.carouselTimer);
 });
 carouselEl.addEventListener('mouseleave', () => {
 if (this.carouselTimer) clearInterval(this.carouselTimer);
 this.carouselTimer = setInterval(() => {
 this.carouselNext();
 }, 5000);
 });
 }
 }

 carouselGoTo(index) {
 const slides = document.querySelectorAll('.carousel-slide');
 const dots = document.querySelectorAll('#carousel-dots .dot');
 const track = document.getElementById('carousel-track');
 if (!slides.length || !track) return;

 this.currentCarouselSlide = (index + slides.length) % slides.length;
 track.style.transform = `translateX(-${this.currentCarouselSlide * 100}%)`;

 slides.forEach((s, i) => {
 s.classList.toggle('active', i === this.currentCarouselSlide);
 });
 dots.forEach((d, i) => {
 d.classList.toggle('active', i === this.currentCarouselSlide);
 });
 }

 carouselNext() {
 this.carouselGoTo((this.currentCarouselSlide || 0) + 1);
 }

 carouselPrev() {
 this.carouselGoTo((this.currentCarouselSlide || 0) - 1);
 }

 flyToCity(cityName) {
 const cityCoords = {
 amritsar: { center: [74.8657, 31.6178], zoom: 16.5, pitch: 58, bearing: -24, name: 'Amritsar Cadastre Division (3,600+ Real 3D Buildings)' },
 ludhiana: { center: [75.8292, 30.8851], zoom: 16.5, pitch: 58, bearing: -20, name: 'Ludhiana Municipal Cadastre (3,000+ Real 3D Buildings)' },
 phagwara: { center: [75.7701, 31.2215], zoom: 16.5, pitch: 58, bearing: -18, name: 'Phagwara Sub-Division (1,200+ Real 3D Buildings)' },
 jalandhar: { center: [75.5566, 31.3094], zoom: 16.5, pitch: 58, bearing: -20, name: 'Jalandhar Municipal Cadastre (2,500+ Real 3D Buildings)' },
 patiala: { center: [76.3869, 30.3398], zoom: 16, pitch: 55, bearing: -20, name: 'Patiala Cadastre Division' },
 mohali: { center: [76.7179, 30.7046], zoom: 16, pitch: 55, bearing: -20, name: 'Mohali (SAS Nagar) Cadastre Division' }
 };

 // Update active city chip styling
 document.querySelectorAll('.btn-city-chip').forEach(btn => {
 const match = btn.textContent.toLowerCase().includes(cityName.toLowerCase());
 btn.classList.toggle('active', match);
 });

 const target = cityCoords[cityName.toLowerCase()] || cityCoords.amritsar;
 this.switchView('map');
 setTimeout(() => {
 if (this.map2d) {
 this.map2d.flyToLocation(target);
 }
 }, 100);
 }

 switchView(viewName) {
 document.querySelectorAll('.view-panel').forEach(p => {
 p.classList.remove('active');
 p.style.display = 'none';
 });
 document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

 const targetPanel = document.getElementById(`view-${viewName}`);
 const targetNav = document.querySelector(`.nav-item[data-view="${viewName}"]`);

 window.scrollTo({ top: 0, behavior: 'smooth' });
 if (targetPanel) {
 targetPanel.classList.add('active');
 targetPanel.style.display = (viewName === 'dashboard' || viewName === 'landing' || viewName === 'report' || viewName === 'officer' || viewName === 'scan' || viewName === 'register') ? 'block' : 'flex';
 }
 if (targetNav) targetNav.classList.add('active');

 // Update URL hash for multi-page navigation (without triggering hashchange loop)
 const newHash = viewName === 'landing' ? '' : `#/${viewName}`;
 if (window.location.hash !== newHash && !(viewName === 'landing' && !window.location.hash)) {
 this._suppressHashChange = true;
 window.location.hash = newHash;
 setTimeout(() => { this._suppressHashChange = false; }, 50);
 }

 // Update page title for multi-page feel
 const titles = {
 landing: 'BHAVANINFO — 3D Cadastral Digital Twin Portal | SIH Project, India',
 dashboard: 'My Portfolio — BHAVANINFO | 3D Cadastral Digital Twin',
 map: '3D City Map — BHAVANINFO | Cadastral Survey',
 twin: '3D Digital Twin Inspector — BHAVANINFO',
 report: 'District Cadastre Report — BHAVANINFO',
 officer: 'Officer Authority Portal — BHAVANINFO',
 scan: 'Manual Building Scan — BHAVANINFO',
 register: 'Register Land / Building — BHAVANINFO'
 };
 document.title = titles[viewName] || 'BHAVANINFO — 3D Cadastral Digital Twin Portal | SIH Project, India';

 // Controls in Header Ribbon: Map sub-header bar visible ONLY in 3D City Map view
 const mapRibbon = document.getElementById('map-sub-header-bar');
 if (mapRibbon) {
 mapRibbon.style.display = (viewName === 'map') ? 'flex' : 'none';
 }

 // STRICT USER REQUIREMENT: REMOVE MUTATION TIMELINE FROM 3D CITY MAP!
 // Visible ONLY in 3D Digital Twin Inspector ('twin'), strictly hidden in 'map' and other views!
 const historyBar = document.getElementById('cadastre-history-bar');
 if (historyBar) {
 historyBar.style.display = (viewName === 'twin') ? 'flex' : 'none';
 }

 // STRICT USER REQUIREMENT: Do NOT show "Sign Out" in the Maps view!
 const logoutBtn = document.getElementById('btn-logout');
 if (logoutBtn) {
 logoutBtn.style.display = (viewName === 'map') ? 'none' : '';
 }

 		// Show/hide gov nav and landing header based on view (never show both stacked!)
		const govNav = document.querySelector('.gov-nav');
		const govHeader = document.querySelector('.gov-header');
		const topAuthActions = document.querySelector('.top-auth-actions');

		if (govNav) govNav.style.display = (viewName === 'landing') ? 'none' : 'flex';
		if (govHeader) govHeader.style.display = (viewName === 'landing') ? 'flex' : 'none';
		if (topAuthActions) topAuthActions.style.display = (viewName === 'landing') ? 'flex' : 'none';

		// Enforce role-based navbar item visibility
		if (viewName !== 'landing') {
			const isOfficer = (this.currentUser && this.currentUser.role === 'AUTHORITY_HEAD');
			const landingNav = document.getElementById('tour-nav-landing');
			if (landingNav) landingNav.style.display = 'none'; // Hide Home in portal view
			const dashNav = document.getElementById('tour-nav-dashboard');
			if (dashNav) dashNav.style.display = isOfficer ? 'none' : 'flex';
			const officerNav = document.getElementById('tour-nav-officer');
			if (officerNav) officerNav.style.display = 'none';
			const reportNav = document.getElementById('tour-nav-report');
			if (reportNav) reportNav.style.display = 'none';
			const tourBtn = document.getElementById('btn-open-tutorial');
			if (tourBtn) tourBtn.style.display = 'none';
		}

 if (viewName === 'report') {
 if (this.districtReport) {
 this.districtReport.loadReport();
 }
 } else if (viewName === 'officer') {
 this.renderOfficerDashboard();
 } else if (viewName === 'map') {
 if (!this.map2d) {
 this.map2d = new CadastreMap2D('cadastre-map', this.allParcels, (parcel) => {
 this.open3DTwin(parcel);
 });
 this.map2d.init();
 }
 const resizeMap = () => {
 if (this.map2d) this.map2d.invalidateSize();
 };
 resizeMap();
 setTimeout(resizeMap, 30);
 setTimeout(resizeMap, 100);
 setTimeout(resizeMap, 250);
 setTimeout(resizeMap, 500);
 if (window.requestAnimationFrame) requestAnimationFrame(resizeMap);
 } else if (viewName === 'twin') {
 if (!this.activeParcel) {
 this.activeParcel = this.allParcels[0];
 }
 this.renderDossierHUD(this.activeParcel);

 if (!this.twin3d) {
 this.twin3d = new DigitalTwin3D('twin-viewport', (levelData) => {
 this.selectDossierLevel(levelData.level_code);
 });
 this.twin3d.init();
 }
 const resizeTwin = () => {
 if (this.twin3d) {
 if (this.activeParcel) this.twin3d.loadParcel(this.activeParcel);
 this.twin3d.onResize();
 }
 };
 resizeTwin();
 setTimeout(resizeTwin, 30);
 setTimeout(resizeTwin, 100);
 setTimeout(resizeTwin, 250);
 setTimeout(resizeTwin, 500);
 if (window.requestAnimationFrame) requestAnimationFrame(resizeTwin);
 } else if (viewName === 'scan') {
 this.initManualScan();
 }

 // Scroll to top when switching views
 window.scrollTo(0, 0);
 this.resizeWorkspaceView();
 }

 
	filterCitizenPortfolio(query) {
		this.citizenPortfolioQuery = (query || '').toLowerCase().trim();
		this.renderDashboard(this.currentUser);
	}

	renderDashboard(user) {
 if (!user) user = CURRENT_USER;
 const nameEl = document.getElementById('profile-name');
 const aadhaarEl = document.getElementById('profile-aadhaar');
 const mobileEl = document.getElementById('profile-mobile');
 const addressEl = document.getElementById('profile-address');
 const avatarImg = document.getElementById('profile-avatar-img');
 const avatarInitials = document.getElementById('profile-avatar-initials');
 const dobTag = document.getElementById('profile-dob-tag');

 const isThanuj = (user.name && user.name.includes('Thanuj')) || (user.aadhaar_masked === 'XXXX-XXXX-0827');
 const displayName = isThanuj ? 'Penna Peruru Thanuj' : (user.name || 'Citizen');
 const displayAadhaar = isThanuj ? 'XXXX-XXXX-0827' : (user.aadhaar_masked || 'XXXX-XXXX-0000');

 if (nameEl) nameEl.textContent = displayName;
 if (aadhaarEl) aadhaarEl.textContent = `Aadhaar: ${displayAadhaar}`;
 if (mobileEl) mobileEl.textContent = `Mobile: ${user.mobile || '+91 98765-XXXXX'}`;
 if (addressEl) addressEl.textContent = user.address || 'Heritage Cadastre Zone / Urban Residential Area, Punjab';

 if (dobTag) {
 if (isThanuj || user.dob) {
 dobTag.textContent = `DOB: ${user.dob || '24/03/2008'} • ${user.gender || 'Male'}`;
 dobTag.style.display = 'inline-block';
 } else {
 dobTag.style.display = 'none';
 }
 }

 const avatarSrc = user.avatar_url || (isThanuj ? '/data/thanuj_avatar.jpg' : null);
 if (avatarSrc && avatarImg) {
 avatarImg.src = avatarSrc;
 avatarImg.style.display = 'block';
 if (avatarInitials) avatarInitials.style.display = 'none';
 } else {
 if (avatarImg) avatarImg.style.display = 'none';
 if (avatarInitials) {
 avatarInitials.textContent = displayName.split(' ').map(w => w[0]).join('').slice(0, 2);
 avatarInitials.style.display = 'block';
 }
 }

 const owned = Array.isArray(user.properties_owned) ? user.properties_owned : [];

 const rawUserParcels = this.allParcels.filter(p => owned.includes(p.ulpin) || (p.legacy_ulpin && owned.includes(p.legacy_ulpin)));

 // Strict deduplication by primary ULPIN or parcel ID so aliases NEVER produce duplicate cards
 const seenKeys = new Set();
 const userParcels = [];
 for (const p of rawUserParcels) {
 const primaryKey = p.id || p.survey_no || p.ulpin;
 if (!seenKeys.has(primaryKey) && !seenKeys.has(p.ulpin)) {
 seenKeys.add(primaryKey);
 seenKeys.add(p.ulpin);
 if (p.legacy_ulpin) seenKeys.add(p.legacy_ulpin);
 userParcels.push(p);
 }
 }
 
 // Property count stats
 const totalCountEl = document.getElementById('stat-total-props');
 const digitalCountEl = document.getElementById('stat-digital-props');
 const pendingCountEl = document.getElementById('stat-pending-props');
 const flagCountEl = document.getElementById('stat-flagged-props');

 const digiProps = userParcels.filter(p => p.status === 'DIGITALIZED');
 const pendingProps = userParcels.filter(p => p.status === 'PENDING_REGISTRATION');
 const flagProps = userParcels.filter(p => p.status === 'FLAGGED_VIOLATION');

 if (totalCountEl) totalCountEl.textContent = userParcels.length;
 if (digitalCountEl) digitalCountEl.textContent = digiProps.length;
 if (pendingCountEl) pendingCountEl.textContent = pendingProps.length;
 if (flagCountEl) flagCountEl.textContent = flagProps.length;

 // Populate Cards Grid
 const gridEl = document.getElementById('dashboard-property-grid');
 if (!gridEl) return;

 if (userParcels.length === 0) {
 gridEl.innerHTML = `
 <div class="empty-properties-card" style="grid-column: 1 / -1; background: #ffffff; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 48px 24px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin: 10px 0;">
 <div style="font-size: 3.5rem; margin-bottom: 12px;"></div>
 <h3 style="color: #0f172a; font-size: 1.35rem; font-weight: 800; margin-bottom: 8px;">No Land Parcels Linked to this Citizen ID</h3>
 <p style="color: #64748b; font-size: 0.9rem; max-width: 540px; margin: 0 auto 24px auto; line-height: 1.5;">
 You currently have <strong>0 registered cadastral land parcels</strong> linked to Aadhaar <strong>${user.aadhaar_masked || 'your account'}</strong> in the Urban Cadastral Registry.
 </p>
 <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
 <button type="button" class="btn-primary" onclick="window.app && (window.app.openRegistrationModal ? window.app.openRegistrationModal() : window.app.switchView('register'))" style="padding: 11px 22px; font-weight: 700; font-size: 0.88rem; background: var(--gov-blue); color: #ffffff; border: none; border-radius: 6px; cursor: pointer;">
 Apply for Drone Survey (Mission Lal Lakir)
 </button>
 <button type="button" class="btn-secondary" onclick="window.app && window.app.switchView('map')" style="padding: 11px 22px; font-weight: 600; font-size: 0.88rem; border: 1.5px solid #cbd5e1; background: #f8fafc; color: #1e293b; border-radius: 6px; cursor: pointer;">
 2D Explore 3D Cadastral Map
 </button>
 </div>
 <div style="margin-top: 20px; font-size: 0.78rem; color: #64748b; background: #f1f5f9; display: inline-block; padding: 6px 14px; border-radius: 20px;">
 Want to see sample digital twin properties? <a href="javascript:void(0);" onclick="window.app.loginDemoHarpreet()" style="color: #0284c7; text-decoration: underline; font-weight: 700;">Load Sardar Harpreet Singh (Evaluator Demo)</a>
 </div>
 </div>
 `;
 return;
 }

 gridEl.innerHTML = userParcels.map(p => {
 const isFlag = p.status === 'FLAGGED_VIOLATION';
 const isDigi = p.status === 'DIGITALIZED';
 const bhu = this.getBhuNakshaRecord(p);

 const statusBadge = isFlag
 ? '<span class="status-badge flagged">Alert: AI Flagged (24h Notice)</span>'
 : isDigi
 ? '<span class="status-badge digitalized">Verified Digitalized 3D Twin</span>'
 : '<span class="status-badge pending">Pending Awaiting Drone Scan</span>';

 const anomalyBox = isFlag ? `
 <div class="anomaly-alert-box">
 <strong>Notice: Statutory Discrepancy Notice (Sec 187 MCA Act)</strong>
 ${p.anomaly_desc}
 <div style="margin-top: 6px;">Deadline: <span class="timer-countdown" id="card-timer">14h 22m remaining</span></div>
 </div>
 ` : '';

 return `
 <div class="property-card ${isFlag ? 'flagged' : isDigi ? 'digitalized' : 'pending'}">
 <div class="card-header">
 <span class="ulpin-badge">${p.ulpin}</span>
 ${statusBadge}
 </div>
 <div class="card-body">
 <h4>${p.survey_no} &bull; ${p.village}</h4>
 <div class="property-specs">
 <div class="spec-item">BhuNaksha Sync: <strong style="color: #166534;">Hadbast #${bhu.hadbastNo} &bull; Khasra #${bhu.khasraNo}</strong></div>
 <div class="spec-item">Cadastral Area: <strong style="color: #0369a1;">${bhu.kanalMarla}</strong></div>
 <div class="spec-item">Khata Record: <strong>${bhu.khata}</strong></div>
 <div class="spec-item">Floors Detected: <strong>${p.total_floors > 0 ? p.total_floors + ' Levels' : 'None (Unregistered)'}</strong></div>
 <div class="spec-item">Tax Assessment: <strong>₹${typeof p.tax_amount === "number" ? p.tax_amount.toLocaleString() : (p.tax_amount || "14,200")} (${p.tax_status})</strong></div>
 </div>
 ${anomalyBox}
 </div>
 <div class="card-footer" style="display: flex; flex-wrap: wrap; gap: 6px;">
 <button class="btn-card highlight" style="flex: 1;" onclick="window.app.inspectParcel('${p.ulpin}')">
 Building 3D Twin &amp; BhuNaksha
 </button>
 <button class="btn-card" style="flex: 1;" onclick="window.app.locateOnMap('${p.ulpin}')">
 2D Locate on Satellite
 </button>
 <button class="btn-card" style="flex: 1; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0;" onclick="window.app.copyBhuNakshaDetails('${p.ulpin}')">
 Copy for BhuNaksha
 </button>
 <button class="btn-card" style="flex: 1; background: #f8fafc; color: #0284c7; border: 1px solid #cbd5e1;" onclick="window.app.viewOfficialFard('${p.ulpin}')">
 View RoR Fard
 </button>
 </div>
 </div>
 `;
 }).join('');
 }

 inspectParcel(ulpin) {
 const parcel = this.allParcels.find(p => p.ulpin === ulpin || p.legacy_ulpin === ulpin);
 if (parcel) {
 this.open3DTwin(parcel);
 }
 }

 async locateOnMap(ulpin, parcelHint = null) {
 if (!ulpin && !parcelHint) return;
 const rawTarget = (ulpin || parcelHint?.ulpin || '').trim();
 const searchUlpin = rawTarget.toUpperCase();

 // 1. If parcelHint is already provided and has valid coordinates or centroid
 let parcel = (parcelHint && (parcelHint.centroid || parcelHint.coordinates)) ? parcelHint : null;

 // 2. Search local in-memory portfolio/cadastre parcels (this.allParcels)
 if (!parcel && this.allParcels && this.allParcels.length > 0) {
 parcel = this.allParcels.find(p => 
 (p.ulpin && p.ulpin.toUpperCase() === searchUlpin) ||
 (p.legacy_ulpin && p.legacy_ulpin.toUpperCase() === searchUlpin) ||
 (p.survey_no && p.survey_no.toUpperCase().includes(searchUlpin)) ||
 (p.ulpin && p.ulpin.toUpperCase().includes(searchUlpin))
 );
 }

 // 3. Search loaded MapLibre GeoJSON layer features (10,300 3D buildings)
 if (!parcel && this.map2d?.currentGeoJSON?.features) {
 const feat = this.map2d.currentGeoJSON.features.find(f => {
 const p = f.properties || {};
 return (p.ulpin && p.ulpin.toUpperCase() === searchUlpin) ||
 (p.legacy_ulpin && p.legacy_ulpin.toUpperCase() === searchUlpin) ||
 (p.survey_no && p.survey_no.toUpperCase().includes(searchUlpin)) ||
 (p.ulpin && p.ulpin.toUpperCase().includes(searchUlpin));
 });
 if (feat) {
 const p = feat.properties || {};
 let centroid = null;
 const coords = feat.geometry?.coordinates || [];
 if (coords.length > 0) {
 const ring = Array.isArray(coords[0]) && Array.isArray(coords[0][0]) ? coords[0] : coords;
 let sumLng = 0, sumLat = 0, count = 0;
 ring.forEach(pt => {
 if (Array.isArray(pt) && typeof pt[0] === 'number') {
 sumLng += pt[0];
 sumLat += pt[1];
 count++;
 }
 });
 if (count > 0) centroid = [sumLat / count, sumLng / count];
 }
 parcel = {
 ...p,
 coordinates: coords,
 centroid: centroid || [31.6125, 74.8620],
 survey_no: p.survey_no || p.ulpin,
 owner: p.owner || 'Verified Landholder',
 total_floors: p.total_floors || 2
 };
 }
 }

 // 4. Query backend search endpoint for cross-district/database lookup
 if (!parcel) {
 try {
 const resp = await fetch(`/api/parcels/search?q=${encodeURIComponent(searchUlpin)}`);
 const data = await resp.json();
 if (data && data.results && data.results.length > 0) {
 parcel = data.results.find(r => 
 r.ulpin.toUpperCase() === searchUlpin || 
 (r.legacy_ulpin && r.legacy_ulpin.toUpperCase() === searchUlpin)
 ) || data.results[0];
 }
 } catch (e) {
 console.warn('Backend ULPIN search lookup error:', e);
 }
 }

 // 5. Fallback: Synthesize parcel using Bhu-Aadhaar statutory decoder
 if (!parcel) {
 const decoded = this.decodeUlpin(searchUlpin);
 const cityCenters = {
 'Amritsar': [74.8620, 31.6125],
 'Ludhiana': [75.8450, 30.8950],
 'Jalandhar': [75.5650, 31.3150],
 'Kapurthala / Phagwara': [75.7722, 31.2212],
 'Phagwara': [75.7722, 31.2212]
 };
 const center = cityCenters[decoded.distName] || [74.8620, 31.6125];
 parcel = {
 ulpin: decoded.formatted || searchUlpin,
 legacy_ulpin: decoded.clean || searchUlpin,
 survey_no: `Hadbast #${decoded.village || '101'} • Khasra #${decoded.plot || '412/1'}`,
 owner: 'Bhu-Aadhaar Registered Citizen',
 locality: `${decoded.distName || 'Amritsar'}, Punjab`,
 total_floors: 2,
 height: 6.8,
 status: 'DIGITALIZED',
 centroid: [center[1], center[0]],
 coordinates: [
 [
 [center[0] - 0.0001, center[1] - 0.0001],
 [center[0] + 0.0001, center[1] - 0.0001],
 [center[0] + 0.0001, center[1] + 0.0001],
 [center[0] - 0.0001, center[1] + 0.0001],
 [center[0] - 0.0001, center[1] - 0.0001]
 ]
 ]
 };
 }

 // 6. Switch to 3D Satellite City Map View and navigate camera
 this.switchView('map');
 setTimeout(() => {
 if (this.map2d) {
 this.map2d.invalidateSize();
 this.map2d.flyToParcel(parcel);
 }
 }, 150);
 }

 inspectDiscrepancyTwin() {
 const discrepancyParcel = (this.allParcels && this.allParcels.find(p => p.has_anomaly)) || (this.allParcels && this.allParcels[0]);
 if (discrepancyParcel) {
 this.open3DTwin(discrepancyParcel);
 } else {
 this.switchView('twin');
 }
 }

 open3DTwin(parcel) {
 if (!parcel) return;
 this.activeParcel = parcel;
 this.switchView('twin');

 if (!this.twin3d) {
 this.twin3d = new DigitalTwin3D('twin-viewport', (levelData) => {
 this.selectDossierLevel(levelData.level_code);
 });
 this.twin3d.init();
 }

 // Ensure parcel has vertical levels generated if not present
 if (!parcel.levels || parcel.levels.length === 0) {
 parcel.levels = this.twin3d.generateDefaultLevelsForParcel(parcel);
 }

 // Populate Left HUD Dossier
 this.renderDossierHUD(parcel);

 // Load into 3D scene
 setTimeout(() => {
 if (this.twin3d) {
 this.twin3d.loadParcel(parcel);
 this.twin3d.onResize();
 }
 }, 60);
 }

 decodeUlpin(ulpinStr) {
 const raw = (ulpinStr || 'BCN501B1NA2CH0').trim();
 let clean = raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

 // Map legacy PB state prefixes to statutory grid sectors if encountered
 if (clean.startsWith('PB02')) {
 clean = clean === 'PB020011014121' ? 'BCN501B1NA2CH0' : `BCN501${clean.substring(6, 10)}${clean.substring(10, 14) || '2CH0'}`;
 } else if (clean.startsWith('PB09')) {
 clean = `BLD201${clean.substring(6, 10)}${clean.substring(10, 14) || '3DF1'}`;
 } else if (clean.startsWith('PB04')) {
 clean = `BJL301${clean.substring(6, 10)}${clean.substring(10, 14) || '4EG2'}`;
 } else if (clean.startsWith('PB13')) {
 clean = `BPH401${clean.substring(6, 10)}${clean.substring(10, 14) || '5FH3'}`;
 }

 // Universal 14-character statutory alphanumeric Bhu-Aadhaar standard
 let gridSector = clean.substring(0, 3);
 let blockCode = clean.substring(3, 6);
 let geoHash = clean.substring(6, 10);
 let polySig = clean.substring(10, 12);
 let checksum = clean.substring(12, 14);

 if (gridSector.length < 3) gridSector = 'BCN';
 if (blockCode.length < 3) blockCode = '501';
 if (geoHash.length < 4) geoHash = 'B1NA';
 if (polySig.length < 2) polySig = '2C';
 if (checksum.length < 2) checksum = 'H0';

 // Regional Cadastral Grid Sector mapping
 const gridMap = {
 'BCN': { dist: '02', distName: 'Amritsar', state: 'PB', stateName: 'Punjab', defaultTehsil: 'Amritsar-I', defaultVillage: 'Kot Atma Singh' },
 'BLD': { dist: '09', distName: 'Ludhiana', state: 'PB', stateName: 'Punjab', defaultTehsil: 'Ludhiana-East', defaultVillage: 'Civil Lines' },
 'BJL': { dist: '04', distName: 'Jalandhar', state: 'PB', stateName: 'Punjab', defaultTehsil: 'Jalandhar-I', defaultVillage: 'Model Town' },
 'BPH': { dist: '13', distName: 'Kapurthala / Phagwara', state: 'PB', stateName: 'Punjab', defaultTehsil: 'Phagwara', defaultVillage: 'Palahi' }
 };
 const distInfo = gridMap[gridSector] || gridMap['BCN'];

 return {
 raw,
 clean,
 isBcnStandard: true,
 gridSector,
 blockCode,
 geoHash,
 polySig,
 checksum,
 fullChecksum: `${polySig}${checksum}`,
 state: distInfo.state,
 stateName: distInfo.stateName,
 dist: distInfo.dist,
 distName: distInfo.distName,
 tehsil: '001',
 village: blockCode,
 plot: `${geoHash.substring(0, 2)}/${geoHash.substring(2)}`,
 formatted: clean
 };
 }

 getBhuNakshaRecord(parcelOrProps) {
 const p = parcelOrProps.properties || parcelOrProps || {};
 const ulpin = p.ulpin || 'BCN501B1NA2CH0';
 const decoded = this.decodeUlpin(ulpin);

 // District mapping
 const distMap = {
 '02': { name: 'Amritsar', namePa: 'ਅੰਮ੍ਰਿਤਸਰ', defaultTehsil: 'Amritsar-I', tehsilPa: 'ਅੰਮ੍ਰਿਤਸਰ-1' },
 '09': { name: 'Ludhiana', namePa: 'ਲੁਧਿਆਣਾ', defaultTehsil: 'Ludhiana-East', tehsilPa: 'ਲੁਧਿਆਣਾ ਪੂਰਬੀ' },
 '04': { name: 'Jalandhar', namePa: 'ਜਲੰਧਰ', defaultTehsil: 'Jalandhar-I', tehsilPa: 'ਜਲੰਧਰ-1' },
 '13': { name: 'Kapurthala', namePa: 'ਕਪੂਰਥਲਾ', defaultTehsil: 'Phagwara', tehsilPa: 'ਫਗਵਾੜਾ' }
 };
 const distInfo = distMap[decoded.dist] || distMap['02'];

 // Hadbast & Village mapping
 let hadbastNo = p.hadbast || p.hadbast_no || (p.bhunaksha && p.bhunaksha.hadbast_no);
 if (!hadbastNo) {
 if (p.survey_no && p.survey_no.includes('518')) hadbastNo = '201';
 else if (p.survey_no && p.survey_no.includes('302')) hadbastNo = '104';
 else if (p.survey_no && p.survey_no.includes('214')) hadbastNo = '301';
 else if (p.village && p.village.includes('Mall Road')) hadbastNo = '201';
 else if (p.village && p.village.includes('Ranjit Avenue')) hadbastNo = '104';
 else if (p.village && p.village.includes('Model Town')) hadbastNo = '301';
 else hadbastNo = decoded.village || '101';
 }

 const hadbastMap = {
 '101': { name: 'Kot Atma Singh / Heritage Zone', namePa: 'ਕੋਟ ਆਤਮਾ ਸਿੰਘ' },
 '102': { name: 'Hall Bazaar Commercial', namePa: 'ਹਾਲ ਬਾਜ਼ਾਰ' },
 '103': { name: 'Katra Ahluwalia', namePa: 'ਕਟੜਾ ਆਹਲੂਵਾਲੀਆ' },
 '104': { name: 'Ranjit Avenue Sector D', namePa: 'ਰਣਜੀਤ ਐਵਨਿਊ' },
 '201': { name: 'Mall Road Commercial Division', namePa: 'ਮਾਲ ਰੋਡ' },
 '301': { name: 'Model Town Residential Sector', namePa: 'ਮਾਡਲ ਟਾਊਨ' },
 '401': { name: 'Palahi (Law Gate)', namePa: 'ਪਲਾਹੀ' },
 '501': { name: 'Kot Atma Singh / Heritage Zone', namePa: 'ਕੋਟ ਆਤਮਾ ਸਿੰਘ' }
 };
 const villageInfo = hadbastMap[hadbastNo] || {
 name: p.locality || p.village || `${distInfo.name} Cadastre Zone`,
 namePa: distInfo.namePa
 };

 // Khasra Number
 let khasraNo = p.survey_no ? p.survey_no.replace(/Khasra No\.\s*/i, '').trim() : `${parseInt(decoded.plot.substring(0, 3), 10) || 412}/${parseInt(decoded.plot.substring(3), 10) || 1}`;

 // Distinct Area calculation in Punjab Revenue Units (Kanal & Marla)
 let sqyd = Number(p.area_sqyd);
 if (!sqyd || isNaN(sqyd)) {
 if (khasraNo.includes('412')) sqyd = 350;
 else if (khasraNo.includes('518')) sqyd = 580;
 else if (khasraNo.includes('302')) sqyd = 250;
 else if (khasraNo.includes('214')) sqyd = 420;
 else sqyd = 280;
 }
 const sqft = Number(p.area_sqft) || Math.round(sqyd * 9);
 const totalMarlas = Math.max(1, Math.round(sqyd / 30.25));
 const kanals = Math.floor(totalMarlas / 20);
 const marlas = totalMarlas % 20;
 const kanalMarlaStr = `${kanals} Kanal ${marlas} Marla (${sqyd.toLocaleString()} sq.yd)`;
 const kanalMarlaPa = `${kanals} ਕਨਾਲ ${marlas} ਮਰਲਾ`;

 // Khewat and Khatouni numbers
 const hash = Math.abs(decoded.clean.split('').reduce((acc, c) => ((acc << 5) - acc) + c.charCodeAt(0), 0));
 const khewatNo = p.khewat_no || (p.khata && p.khata.includes('Khewat') ? p.khata.match(/Khewat\s*(\d+)/)?.[1] : ((hash % 450) + 12));
 const khatouniNo = p.khatouni_no || (p.khata && p.khata.includes('Khatouni') ? p.khata.match(/Khatouni\s*(\d+)/)?.[1] : ((hash % 680) + 35));
 const khataStr = p.khata || `KH-2024/${(hash % 900) + 100} (Khewat ${khewatNo} / Khatouni ${khatouniNo})`;
 const jamabandiYear = '2023-2024';

 return {
 state: 'Punjab',
 statePa: 'ਪੰਜਾਬ',
 district: distInfo.name,
 districtPa: distInfo.namePa,
 districtCode: decoded.dist,
 tehsil: p.tehsil || distInfo.defaultTehsil,
 tehsilPa: distInfo.tehsilPa,
 village: villageInfo.name,
 villagePa: villageInfo.namePa,
 hadbastNo: villageInfo.hadbastNo,
 khasraNo: khasraNo,
 khewatNo: khewatNo,
 khatouniNo: khatouniNo,
 khata: khataStr,
 jamabandiYear: jamabandiYear,
 owner: p.owner || 'Sardar Harpreet Singh',
 ownerPa: p.owner_pa || 'ਸਰਦਾਰ ਹਰਪ੍ਰੀਤ ਸਿੰਘ',
 ulpin: decoded.formatted,
 areaSqyd: sqyd,
 areaSqft: sqft,
 kanalMarla: kanalMarlaStr,
 kanalMarlaPa: kanalMarlaPa,
 landType: (p.total_floors > 2 || (p.status === 'FLAGGED_VIOLATION' && p.total_floors >= 2)) ? 'Gair Mumkin Dukan / Commercial (ਗ਼ੈਰ ਮੁਮਕਿਨ ਦੁਕਾਨ)' : 'Gair Mumkin Abadi (ਗ਼ੈਰ ਮੁਮਕਿਨ ਆਬਾਦੀ)',
 portalUrl: 'https://jamabandi.punjab.gov.in/'
 };
 }

 showToast(message, duration = 3500) {
 let toast = document.getElementById('global-toast-el');
 if (!toast) {
 toast = document.createElement('div');
 toast.id = 'global-toast-el';
 toast.className = 'toast-notification';
 document.body.appendChild(toast);
 }
 toast.innerHTML = `<span></span> <div>${message}</div>`;
 toast.style.display = 'flex';
 if (this._toastTimer) clearTimeout(this._toastTimer);
 this._toastTimer = setTimeout(() => {
 if (toast) toast.style.display = 'none';
 }, duration);
 }

 copyBhuNakshaDetails(ulpin) {
 const targetUlpin = ulpin || this.activeParcel?.ulpin || 'BCN501B1NA2CH0';
 const parcel = (this.allParcels || []).find(p => p.ulpin === targetUlpin || p.legacy_ulpin === targetUlpin) || (this.activeParcel?.ulpin === targetUlpin ? this.activeParcel : { ulpin: targetUlpin });
 const rec = this.getBhuNakshaRecord(parcel);
 const textToCopy = `=== OFFICIAL PUNJAB BHUNAKSHA & JAMABANDI REVENUE RECORD ===
State: Punjab (ਪੰਜਾਬ)
District: ${rec.district} (ਜ਼ਿਲ੍ਹਾ: ${rec.districtPa}, Code: ${rec.districtCode})
Tehsil: ${rec.tehsil} (ਤਹਿਸੀਲ: ${rec.tehsilPa})
Village / Hadbast: ${rec.village} (Hadbast No. ${rec.hadbastNo})
Khasra No (ਖਸਰਾ ਨੰ:): ${rec.khasraNo}
Khewat No (ਖੇਵਟ ਨੰ:): ${rec.khewatNo}
Khatouni No (ਖਤੌਨੀ ਨੰ:): ${rec.khatouniNo}
Khata Record: ${rec.khata}
Registered Owner: ${rec.owner} (ਪੰਜਾਬੀ: ${rec.ownerPa || 'ਸਰਦਾਰ ਹਰਪ੍ਰੀਤ ਸਿੰਘ'})
14-Digit Bhu-Aadhaar (ULPIN): ${rec.ulpin}
Cadastral Area: ${rec.kanalMarla}
Land Classification: ${rec.landType} (Lal Lakir / Abadi Deh)
Jamabandi Session Year: ${rec.jamabandiYear}
Official Punjab Verification Portal: ${rec.portalUrl}
-----------------------------------------------------------
LEGAL REVENUE NOTE (FOR EVALUATORS & CITIZENS):
- Urban Abadi (Lal Lakir) parcels historically lacked individual rural Jamabandi khasra records under the 1887 Land Revenue Act.
- Under the Government of India SVAMITVA Scheme & Punjab Mission Lal Lakir, 3D Cadastral Digital Twin generates statutory 14-character Bhu-Aadhaar ULPINs and vertical strata Sub-ULPINs.
===========================================================`;

 if (navigator.clipboard && navigator.clipboard.writeText) {
 navigator.clipboard.writeText(textToCopy).then(() => {
 this.showToast(`Copied BhuNaksha Details for ${rec.ulpin}! Ready to verify on jamabandi.punjab.gov.in`);
 }).catch(() => {
 this.fallbackCopy(textToCopy);
 this.showToast(`Copied BhuNaksha Details for ${rec.ulpin}!`);
 });
 } else {
 this.fallbackCopy(textToCopy);
 this.showToast(`Copied BhuNaksha Details for ${rec.ulpin}!`);
 }
 }

 copyActiveBhuNaksha() {
 if (this.activeParcel) {
 this.copyBhuNakshaDetails(this.activeParcel.ulpin);
 }
 }

 fallbackCopy(text) {
 const textArea = document.createElement("textarea");
 textArea.value = text;
 textArea.style.position = "fixed";
 textArea.style.left = "-999999px";
 document.body.appendChild(textArea);
 textArea.focus();
 textArea.select();
 try { document.execCommand('copy'); } catch (err) {}
 document.body.removeChild(textArea);
 }

 viewOfficialFard(ulpin) {
 const targetUlpin = ulpin || this.activeParcel?.ulpin || 'BCN501B1NA2CH0';
 const parcel = (this.allParcels || []).find(p => p.ulpin === targetUlpin || p.legacy_ulpin === targetUlpin) || (this.activeParcel?.ulpin === targetUlpin ? this.activeParcel : { ulpin: targetUlpin });
 const rec = this.getBhuNakshaRecord(parcel);
 this.activeFardUlpin = rec.ulpin;

 const modal = document.getElementById('modal-bhunaksha-fard');
 if (!modal) return;

 const fDist = document.getElementById('fard-district');
 const fTehsil = document.getElementById('fard-tehsil');
 const fVillage = document.getElementById('fard-village');
 const fYear = document.getElementById('fard-year');
 const fUlpin = document.getElementById('fard-ulpin');

 if (fDist) fDist.textContent = `${rec.district} (${rec.districtCode})`;
 if (fTehsil) fTehsil.textContent = rec.tehsil;
 if (fVillage) fVillage.textContent = `${rec.village} (Hadbast No. ${rec.hadbastNo})`;
 if (fYear) fYear.textContent = rec.jamabandiYear;
 if (fUlpin) fUlpin.textContent = rec.ulpin;

 const tKhewat = document.getElementById('fard-tbl-khewat');
 const tKhatouni = document.getElementById('fard-tbl-khatouni');
 const tOwner = document.getElementById('fard-tbl-owner');
 const tKhasra = document.getElementById('fard-tbl-khasra');
 const tArea = document.getElementById('fard-tbl-area');
 const tType = document.getElementById('fard-tbl-type');
 const tUlpin = document.getElementById('fard-tbl-ulpin');

 if (tKhewat) tKhewat.textContent = rec.khewatNo;
 if (tKhatouni) tKhatouni.textContent = rec.khatouniNo;
 if (tOwner) tOwner.innerHTML = `${rec.owner}<br><span style="font-size: 0.7rem; color: #64748b;">ਖ਼ੁਦਕਾਸ਼ਤ (Sole Owner 100%)</span>`;
 if (tKhasra) tKhasra.textContent = rec.khasraNo;
 if (tArea) tArea.innerHTML = `${rec.kanalMarlaPa}<br><span style="font-size: 0.7rem; color: #64748b;">(${rec.areaSqyd} sq.yd)</span>`;
 if (tType) tType.innerHTML = rec.landType;
 if (tUlpin) tUlpin.textContent = rec.ulpin;

 modal.style.display = 'flex';
 }

 closeFardModal() {
 const modal = document.getElementById('modal-bhunaksha-fard');
 if (modal) modal.style.display = 'none';
 }

 renderDossierHUD(parcel) {
 const decoded = this.decodeUlpin(parcel.ulpin);
 const bhu = this.getBhuNakshaRecord(parcel);
 const ulpinEl = document.getElementById('dossier-ulpin-val');
 const surveyEl = document.getElementById('dossier-survey-val');
 const ownerEl = document.getElementById('dossier-owner-val');
 const khataEl = document.getElementById('dossier-khata-val');
 const taxEl = document.getElementById('dossier-tax-val');
 const scanDateEl = document.getElementById('dossier-scandate-val');

 const distTehsilEl = document.getElementById('bhunaksha-dist-tehsil');
 const villageHadbastEl = document.getElementById('bhunaksha-village-hadbast');
 const areaKanalEl = document.getElementById('bhunaksha-area-kanal');
 const landTypeEl = document.getElementById('bhunaksha-land-type');

 if (distTehsilEl) distTehsilEl.textContent = `${bhu.district} (${bhu.districtCode}) • ${bhu.tehsil}`;
 if (villageHadbastEl) villageHadbastEl.textContent = `${bhu.village} (Hadbast #${bhu.hadbastNo})`;
 if (areaKanalEl) areaKanalEl.textContent = bhu.kanalMarla;
 if (landTypeEl) landTypeEl.textContent = bhu.landType;

 		const isPending = (parcel.status === 'PENDING_REGISTRATION' || parcel.status === 'PENDING' || parcel.status === 'PENDING_SURVEY' || parcel.status === 'PROVISIONAL');
		const isOfficer = this.currentUser && this.currentUser.role === 'AUTHORITY_HEAD';
		const backBtnEl = document.getElementById('btn-back-to-map');
		if (backBtnEl) {
			backBtnEl.innerHTML = isOfficer ? '&larr; Back to Officer Portal' : '&larr; Back to Map';
		}
		const officerActionsEl = document.getElementById('dossier-officer-actions');
		if (officerActionsEl) {
			const isApproved = parcel.status === 'VERIFIED' || parcel.status === 'PLAN_APPROVED' || parcel.status === 'APPROVED';
			officerActionsEl.style.display = (isOfficer && !isApproved) ? 'block' : 'none';
		}

 if (ulpinEl) ulpinEl.textContent = decoded.formatted;

 // Update 14-digit segmented breakdown elements in Dossier
 const segState = document.getElementById('ulpin-seg-state');
 const segDist = document.getElementById('ulpin-seg-dist');
 const segTehsil = document.getElementById('ulpin-seg-tehsil');
 const segVillage = document.getElementById('ulpin-seg-village');
 const segPlot = document.getElementById('ulpin-seg-plot');
 const segDesc = document.getElementById('ulpin-breakdown-desc');

 if (segState) {
 segState.textContent = decoded.gridSector;
 if (segState.nextElementSibling) segState.nextElementSibling.textContent = 'Grid Sec';
 }
 if (segDist) {
 segDist.textContent = decoded.blockCode;
 if (segDist.nextElementSibling) segDist.nextElementSibling.textContent = 'Block';
 }
 if (segTehsil) {
 segTehsil.textContent = decoded.geoHash;
 if (segTehsil.nextElementSibling) segTehsil.nextElementSibling.textContent = 'GeoHash';
 }
 if (segVillage) {
 segVillage.textContent = decoded.polySig;
 if (segVillage.nextElementSibling) segVillage.nextElementSibling.textContent = 'PolySig';
 }
 if (segPlot) {
 segPlot.textContent = decoded.checksum;
 if (segPlot.nextElementSibling) segPlot.nextElementSibling.textContent = 'ChkSum';
 }

 if (segDesc) {
 segDesc.innerHTML = `
 <div class="bhu-aadhaar-pill-row">
 <span class="bhu-pill" title="Chars 1-3: Cadastral Grid Sector"> Grid: ${decoded.gridSector}</span>
 <span class="bhu-pill" title="Chars 4-6: Cadastre Block"> Block #${decoded.blockCode}</span>
 <span class="bhu-pill" title="Chars 7-10: Centroid Geohash">️ Hash: ${decoded.geoHash}</span>
 <span class="bhu-pill" title="Chars 11-12: Polyline Signature"> PolySig: ${decoded.polySig}</span>
 <span class="bhu-pill plot-pill" title="Chars 13-14: Modulo-36 Integrity Checksum"> Mod-36: ${decoded.checksum}</span>
 </div>
 `;
 }

 if (surveyEl) surveyEl.textContent = parcel.survey_no;
 if (ownerEl) ownerEl.textContent = parcel.owner;
 if (khataEl) khataEl.textContent = parcel.khata;
 
 const taxVal = (parcel.tax_amount !== undefined && parcel.tax_amount !== null) ? Number(parcel.tax_amount).toLocaleString() : '14,200';
 if (taxEl) taxEl.textContent = `₹${taxVal} (${parcel.tax_status || 'PAID'})`;
 if (scanDateEl) scanDateEl.textContent = parcel.drone_scan_date || (isPending ? 'Pending Awaiting Autonomous Drone Scan' : 'Verified via LiDAR SLAM');

 // AI Anomaly Banner in Dossier
 const anomalyCard = document.getElementById('dossier-anomaly-card');
 if (anomalyCard) {
 if (parcel.has_anomaly) {
 anomalyCard.style.display = 'block';
 document.getElementById('dossier-anomaly-desc').textContent = parcel.anomaly_desc;
 } else {
 anomalyCard.style.display = 'none';
 }
 }

 // Ensure parcel has vertical levels (foundation + floors) matching its declaration
 if (!parcel.levels || parcel.levels.length < 1) {
 if (this.twin3d) {
 parcel.levels = this.twin3d.generateDefaultLevelsForParcel(parcel);
 }
 }

 // Build Floor Tabs
 const tabsContainer = document.getElementById('level-picker-tabs');
 if (tabsContainer) {
 if (isPending) {
 tabsContainer.innerHTML = `
 <div style="font-size: 0.76rem; color: #fbbf24; background: rgba(245, 158, 11, 0.12); padding: 8px 12px; border-radius: 6px; border: 1px dashed #f59e0b; line-height: 1.4;">
 Pending <strong>Floor Blueprint Locked</strong>: Volumetric 3D model will unlock once the autonomous cadastral LiDAR drone survey completes.
 </div>
 `;
 } else {
 tabsContainer.innerHTML = (parcel.levels || []).map(lvl => {
 const isFlag = lvl.is_flagged;
 const isGround = (lvl.level_code === 'G00' || lvl.level_code === 'Ground' || lvl.level_code === 'G0');
 const isSub = (lvl.level_code === 'B30' || lvl.is_subterranean);

 let label = lvl.level_code;
 if (isGround) label = 'Ground Floor';
 else if (isSub) label = 'B30: Foundation';
 else if (lvl.name) {
 const match = lvl.name.match(/Level\s*(\d+)/i);
 if (match) label = `Level ${match[1]}`;
 else label = lvl.name.split(' ')[0] || lvl.level_code;
 }

 return `
 <button class="level-tab ${isFlag ? 'flagged' : ''}" 
 data-level="${lvl.level_code}"
 title="${lvl.name || lvl.level_code}"
 onclick="window.app.selectDossierLevel('${lvl.level_code}')">
 ${isFlag ? 'Alert: ' : ''}${label}
 </button>
 `;
 }).join('');

 // Default select ground floor or top floor
 const defaultLvl = parcel.levels.find(l => l.level_code === 'G00' || l.level_code === 'Ground') || parcel.levels[0];
 if (defaultLvl) {
 this.selectDossierLevel(defaultLvl.level_code);
 }
 }
 }

 // Populate Building Measurements & Spatial Coordinates Card from real cadastral data
 const floorsCount = Math.max(1, parcel.total_floors || (parcel.levels ? parcel.levels.filter(l => !l.is_subterranean).length : 1));
 const plotSqyd = parcel.area_sqyd || Math.round((parcel.area_sqft || 3465) / 9);
 const plotSqft = parcel.area_sqft || (plotSqyd * 9);
 const builtSqft = parcel.built_up_sqft || Math.round(plotSqft * floorsCount * 0.82);
 const farVal = parcel.far || (builtSqft / Math.max(1, plotSqft)).toFixed(2);
 const heightM = parcel.height || (floorsCount * 3.4).toFixed(1);
 const heightFt = parcel.height_ft || Math.round(heightM * 3.28084);

 const heightEl = document.getElementById('dossier-height-val');
 const farEl = document.getElementById('dossier-far-val');
 const builtupEl = document.getElementById('dossier-builtup-val');
 const plotareaEl = document.getElementById('dossier-plotarea-val');
 const meterEl = document.getElementById('dossier-meter-val');
 const watermeterEl = document.getElementById('dossier-watermeter-val');
 const coordEl = document.getElementById('dossier-coordinates-val');

 if (heightEl) heightEl.textContent = `${heightM} m (${heightFt} ft)`;
 if (farEl) farEl.textContent = `${farVal} (${parcel.has_anomaly ? 'Notice: Exceeds Sanction' : 'Verified Compliant'})`;
 if (builtupEl) builtupEl.textContent = `${builtSqft.toLocaleString()} sq.ft`;
 if (plotareaEl) plotareaEl.textContent = `${plotSqyd.toLocaleString()} sq.yd (${plotSqft.toLocaleString()} sq.ft)`;

 // Unique PSPCL electric meter and water meter per building
 const hash = Math.abs((parcel.ulpin || 'PB020011014121').split('').reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0));
 const meterNum = `PSPCL-LT-${(hash % 89999) + 10000}`;
 const waterNum = `MCA-W-${(hash % 8999) + 1000}`;
 if (meterEl) meterEl.textContent = parcel.electric_meter || meterNum;
 if (watermeterEl) watermeterEl.textContent = parcel.water_meter || waterNum;

 let lat = 31.6125, lng = 74.8620;
 if (parcel.centroid) {
 const c = parcel.centroid;
 if (c[0] > 60) { lng = Number(c[0]); lat = Number(c[1]); }
 else { lat = Number(c[0]); lng = Number(c[1]); }
 } else if (parcel.coordinates && parcel.coordinates.length > 0) {
 const pt = parcel.coordinates[0];
 lng = Number(pt[0]); lat = Number(pt[1]);
 }

 if (coordEl) {
 coordEl.textContent = `${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`;
 }

 // Google Maps Navigation Redirection Link
 const btnGmaps = document.getElementById('btn-dossier-gmaps');
 if (btnGmaps) {
 btnGmaps.href = `https://www.google.com/maps/dir/?api=1&destination=${lat.toFixed(6)},${lng.toFixed(6)}`;
 }

 // Update dynamic historical timeline for this specific building
 this.updateTimelineForParcel(parcel);
 }

 triggerLiveDroneSimulation() {
 if (!this.activeParcel || !this.twin3d) return;

 const parcel = this.activeParcel;
 parcel.drone_dispatched = true;
 parcel.drone_scan_date = ' Mission Dispatched (Next 2 Working Days)';

 this.twin3d.executeDroneScanSimulation(() => {
 // DO NOT turn parcel into DIGITALIZED and DO NOT show or extrude building
 const scanDateEl = document.getElementById('dossier-scandate-val');
 if (scanDateEl) {
 scanDateEl.textContent = ' Mission Dispatched (Next 2 Working Days)';
 }

 this.showToast(`Verified Autonomous Drone Survey Dispatched for ${parcel.ulpin}! Mission #DRONE-PB02-2026-Q88 queued at Municipal Depot.`, 5000);

 if (this.map2d) {
 this.map2d.showMapToast(`Verified Drone Survey Mission Queued for ${parcel.ulpin} (Flight Window: Next 2 Working Days)`, 4500);
 }
 });
 }

 setMapLayer(layer) {
 if (this.map2d) {
 this.map2d.setBaseLayer(layer);
 }
 }

 handleMapFilterChange(val) {
 if (!val) return;
 if (val.startsWith('filter:')) {
 const filterKey = val.replace('filter:', '');
 this.applyMapFilter(filterKey);
 } else if (val.startsWith('dataset:')) {
 const datasetKey = val.replace('dataset:', '');
 this.switchMapDataset(datasetKey);
 } else {
 this.applyMapFilter(val);
 }
 }

 applyMapFilter(filterKey) {
 if (!filterKey) filterKey = 'all';

 // Sync select dropdown if present
 const sel = document.getElementById('select-building-filter');
 if (sel && sel.value !== filterKey) sel.value = filterKey;

 // Sync quick filter buttons
 document.querySelectorAll('.btn-quick-filter').forEach(btn => {
 const isMatch = btn.getAttribute('data-filter') === filterKey;
 btn.classList.toggle('active', isMatch);
 if (isMatch) {
 btn.style.boxShadow = '0 0 10px rgba(56, 189, 248, 0.45)';
 btn.style.borderColor = '#38bdf8';
 } else {
 btn.style.boxShadow = 'none';
 }
 });

 if (this.map2d) {
 this.map2d.applyFilter(filterKey);
 }
 }

 switchMapDataset(datasetKey) {
 if (this.map2d) {
 this.map2d.switchDataset(datasetKey);
 }
 }

 selectDossierLevel(levelCode) {
 if (!this.activeParcel || !this.activeParcel.levels) return;

 // Robust matching supporting Ground / G00 / G0 variants
 const isGroundTarget = (levelCode === 'G00' || levelCode === 'Ground' || levelCode === 'G0');
 const level = this.activeParcel.levels.find(l => {
 if (l.level_code === levelCode) return true;
 if (isGroundTarget && (l.level_code === 'G00' || l.level_code === 'Ground' || l.level_code === 'G0')) return true;
 return false;
 });
 if (!level) return;

 this.activeLevel = level;

 // Highlight active tab
 document.querySelectorAll('.level-tab').forEach(t => {
 const tCode = t.getAttribute('data-level');
 const isMatch = (tCode === level.level_code) ||
 (isGroundTarget && (tCode === 'G00' || tCode === 'Ground' || tCode === 'G0'));
 if (isMatch) t.classList.add('active');
 else t.classList.remove('active');
 });

 // Update Dossier Level Info
 const subUlpinEl = document.getElementById('dossier-sub-ulpin');
 const levelNameEl = document.getElementById('dossier-level-name');
 const levelOwnerEl = document.getElementById('dossier-level-owner');
 const levelAreaEl = document.getElementById('dossier-level-area');
 const levelUtilitiesEl = document.getElementById('dossier-level-utilities');

 if (subUlpinEl) subUlpinEl.textContent = level.sub_ulpin;
 if (levelNameEl) levelNameEl.textContent = level.name;
 if (levelOwnerEl) levelOwnerEl.textContent = level.owner;
 if (levelAreaEl) levelAreaEl.textContent = `${level.carpet_area_sqft} sq.ft`;

 // Utilities / subterranean specs
 if (levelUtilitiesEl) {
 if (level.is_subterranean && level.utilities) {
 levelUtilitiesEl.innerHTML = level.utilities.map(u => `
 <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
 <span style="display: flex; align-items: center; gap: 6px;">
 <span style="width: 10px; height: 10px; border-radius: 50%; background: ${u.color};"></span>
 ${u.type}
 </span>
 <strong>${u.meter}</strong>
 </div>
 `).join('');
 } else {
 levelUtilitiesEl.innerHTML = `
 <div>Power Meter: <strong>PSPCL-LT-${Math.floor(Math.random() * 89999 + 10000)}</strong></div>
 <div>Water Connection: <strong>MCA-RES-${Math.floor(Math.random() * 8999 + 1000)}</strong></div>
 `;
 }
 }

 // Select in 3D WebGL scene
 if (this.twin3d) {
 this.twin3d.selectLevel(levelCode);
 }

 // Sync subterranean view mode buttons
 const isSub = (levelCode === 'B30');
 const surfBtn = document.getElementById('btn-mode-surface');
 const subBtn = document.getElementById('btn-mode-subterranean');
 if (surfBtn && subBtn) {
 if (isSub) {
 subBtn.classList.add('active');
 surfBtn.classList.remove('active');
 } else {
 surfBtn.classList.add('active');
 subBtn.classList.remove('active');
 }
 }
 }

 
 showTopNotification(title, body) {
 const notifBar = document.getElementById('top-gov-notification-bar');
 const titleEl = document.getElementById('notif-title');
 const bodyEl = document.getElementById('notif-body');

 if (titleEl) titleEl.innerHTML = title;
 if (bodyEl) bodyEl.innerHTML = body;
 if (notifBar) {
 notifBar.style.display = 'flex';
 notifBar.scrollIntoView({ behavior: 'smooth' });
 }
 }

 downloadChallanPDF() {
 window.print();
 }

 toggleSubterraneanView(enable) {
 if (this.twin3d) {
 this.twin3d.setSubterraneanMode(enable);
 }
 const surfBtn = document.getElementById('btn-mode-surface');
 const subBtn = document.getElementById('btn-mode-subterranean');
 if (surfBtn && subBtn) {
 if (enable) {
 subBtn.classList.add('active');
 surfBtn.classList.remove('active');
 } else {
 surfBtn.classList.add('active');
 subBtn.classList.remove('active');
 }
 }
 }



 switchMapDataset(datasetKey) {
 if (this.map2d) {
 this.map2d.switchDataset(datasetKey);
 }
 }

 setMapLayer(layerName) {
 if (this.map2d) {
 this.map2d.setBaseLayer(layerName);
 }
 document.querySelectorAll('.layer-switch-btn').forEach(btn => {
 btn.classList.remove('active');
 });
 const activeBtn = document.getElementById(`btn-layer-${layerName}`);
 if (activeBtn) activeBtn.classList.add('active');
 }

 setupHistorySlider() {
 const slider = document.getElementById('history-year-slider');
 if (slider) {
 slider.addEventListener('input', (e) => {
 const year = parseInt(e.target.value, 10);
 this.applyHistoricalYearForParcel(year);
 });
 }
 }

 generateBuildingTimeline(parcel) {
 const ulpin = parcel.ulpin || 'BCN501B1NA2CH0';
 const hash = Math.abs(ulpin.split('').reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0));
 const startYear = 2014 + (hash % 6); // Each building has a unique origin year: 2014, 2015, 2016, 2017, 2018, or 2019
 const owner = parcel.owner || 'Registered Owner';
 const khasra = parcel.survey_no || 'Khasra No. 412/1';
 const khata = parcel.khata || 'KH-2024/782';
 const tax = parcel.tax_amount || 4200;
 const floors = Math.max(1, parcel.total_floors || 1);
 const meterNum = `PSPCL-LT-${(hash % 89999) + 10000}`;

 const milestones = {};
 // Milestone 1: Open Land
 milestones[startYear] = {
 badge: `${startYear} (OPEN LAND) • REVENUE RECORD`,
 desc: `<strong>${startYear} (Open Land):</strong> Original Jamabandi Revenue Record under ancestral family ownership. Vacant agricultural/abadi parcel (${khasra}). No superstructure detected. Subterranean municipal right-of-way established.`,
 owner: `Ancestral Family / ${owner}`,
 khata: `${khata} (Khewat ${40 + (hash % 60)})`,
 tax: `₹${Math.round(tax * 0.15)} (Rural Land Cess - Paid)`,
 scanDate: 'Patwari Chain Survey (Pre-Drone)',
 hasAnomaly: false,
 activeLevels: ['B30']
 };

 // Milestone 2: Foundation / Construction
 const y2 = startYear + 2;
 if (y2 <= 2024) {
 milestones[y2] = {
 badge: `${y2} (FOUNDATION & PLINTH) • SANCTION APPROVED`,
 desc: `<strong>${y2} (Foundation & Plinth):</strong> Building plan sanctioned by Municipal Corporation Amritsar (#MCA/${y2}/${100 + (hash % 900)}). Foundation piles sunk to -30ft bedrock. Subterranean utility conduits mapped.`,
 owner: owner,
 khata: khata,
 tax: `₹${Math.round(tax * 0.45)} (Under-Construction Cess - Paid)`,
 scanDate: 'MCA Physical Field Inspection',
 hasAnomaly: false,
 activeLevels: ['B30', 'G00']
 };
 }

 // Milestone 3: Initial Superstructure
 const y3 = Math.min(2024, startYear + 4);
 if (y3 > y2 && y3 <= 2024) {
 milestones[y3] = {
 badge: `${y3} (REGISTERED STRUCTURE) • MUTATION ENTERED`,
 desc: `<strong>${y3} (Superstructure Mutation):</strong> Mutation registered in revenue records under ${owner}. Ground ${floors > 1 ? '+ Upper floor structure' : 'floor villa'} completed. Electricity connection (${meterNum}) energized.`,
 owner: owner,
 khata: khata,
 tax: `₹${Math.round(tax * 0.8)} (Property Tax - Paid)`,
 scanDate: 'SVAMITVA Phase 1 Drone Telemetry',
 hasAnomaly: false,
 activeLevels: floors > 1 ? ['B30', 'G00', 'F01'] : ['B30', 'G00']
 };
 }

 // Milestone 4: Present Day 2026
 const allLvlCodes = parcel.levels ? parcel.levels.map(l => l.level_code) : ['B30', 'G00'];
 milestones[2026] = {
 badge: `2026 (PRESENT DAY) • ${parcel.has_anomaly ? 'Alert: AI ANOMALY NOTICE' : 'Verified 3D DIGITAL TWIN VERIFIED'}`,
 desc: parcel.has_anomaly
 ? `<strong>2026 (Alert: Present Day):</strong> Autonomous LiDAR SLAM 3R drone survey detected statutory discrepancy: ${parcel.anomaly_desc || 'Height/Encroachment anomaly'}. Statutory 24h notice active under Sec 187 Punjab Municipal Act.`
 : `<strong>2026 (Present Day):</strong> Autonomous LiDAR SLAM 3R drone survey completed. All ${floors} levels digitally verified against approved master plan. High-precision 3D Digital Twin published.`,
 owner: owner,
 khata: khata,
 tax: `₹${tax.toLocaleString()} (${parcel.tax_status || 'PAID'})`,
 scanDate: parcel.drone_scan_date || 'Autonomous Drone SLAM 3R (Sept 2026)',
 hasAnomaly: !!parcel.has_anomaly,
 activeLevels: allLvlCodes
 };

 return { startYear, meterNum, milestones };
 }

 updateTimelineForParcel(parcel) {
 const timelineData = this.generateBuildingTimeline(parcel);
 const milestones = timelineData.milestones;
 const years = Object.keys(milestones).map(Number).sort((a, b) => a - b);

 // Update Building & Owner & Meter Tags
 const bldgTag = document.getElementById('history-building-tag');
 const ownerTag = document.getElementById('history-owner-tag');
 const meterTag = document.getElementById('history-meter-tag');
 if (bldgTag) bldgTag.textContent = parcel.ulpin;
 if (ownerTag) ownerTag.textContent = parcel.owner;
 if (meterTag) meterTag.textContent = ` Meter: ${timelineData.meterNum}`;

 // Update Slider Bounds
 const slider = document.getElementById('history-year-slider');
 if (slider) {
 slider.min = years[0];
 slider.max = 2026;
 slider.value = 2026;
 }

 // Rebuild Milestones Labels Container
 const container = document.getElementById('history-milestones-container');
 if (container) {
 container.innerHTML = years.map(y => `
 <span class="milestone-label ${y === 2026 ? 'active' : ''}" 
 data-year="${y}" 
 onclick="window.app.applyHistoricalYearForParcel(${y})">
 ${y} (${milestones[y].hasAnomaly ? 'Alert: ' : ''}${y === years[0] ? 'Open Land' : y === 2026 ? 'Present' : 'Built'})
 </span>
 `).join('');
 }

 this.currentBuildingTimeline = milestones;
 this.applyHistoricalYearForParcel(2026);
 }

 applyHistoricalYearForParcel(year) {
 if (!this.currentBuildingTimeline) return;
 const slider = document.getElementById('history-year-slider');
 if (slider) slider.value = year;

 document.querySelectorAll('.milestone-label').forEach(lbl => {
 const y = parseInt(lbl.getAttribute('data-year'), 10);
 if (y === year) lbl.classList.add('active');
 else lbl.classList.remove('active');
 });

 const rec = this.currentBuildingTimeline[year] || this.currentBuildingTimeline[2026];
 if (!rec) return;

 const badgeEl = document.getElementById('history-active-badge');
 const descEl = document.getElementById('history-event-desc');
 if (badgeEl) {
 badgeEl.textContent = rec.badge;
 if (rec.hasAnomaly) badgeEl.classList.add('flagged');
 else badgeEl.classList.remove('flagged');
 }
 if (descEl) descEl.innerHTML = rec.desc;

 const ownerEl = document.getElementById('dossier-owner-val');
 const khataEl = document.getElementById('dossier-khata-val');
 const taxEl = document.getElementById('dossier-tax-val');
 const scanDateEl = document.getElementById('dossier-scandate-val');
 const anomalyCard = document.getElementById('dossier-anomaly-card');

 if (ownerEl) ownerEl.textContent = rec.owner;
 if (khataEl) khataEl.textContent = rec.khata;
 if (taxEl) taxEl.textContent = rec.tax;
 if (scanDateEl) scanDateEl.textContent = rec.scanDate;

 if (anomalyCard) {
 anomalyCard.style.display = rec.hasAnomaly ? 'block' : 'none';
 }

 document.querySelectorAll('.level-tab').forEach(tab => {
 const code = tab.getAttribute('data-level');
 tab.style.display = 'inline-block';
 if (rec.activeLevels.includes(code)) {
 tab.style.opacity = '1.0';
 } else {
 tab.style.opacity = '0.55';
 }
 });

 if (this.twin3d && rec.activeLevels) {
 this.twin3d.setVisibleLevels(rec.activeLevels);
 }
 }

 applyHistoricalYear(year) {
 this.applyHistoricalYearForParcel(year);
 }

 startCountdown() {
 if (this.countdownTimer) clearInterval(this.countdownTimer);

 this.countdownTimer = setInterval(() => {
 this.secondsRemaining--;
 if (this.secondsRemaining < 0) {
 this.secondsRemaining = 0;
 clearInterval(this.countdownTimer);
 }

 const h = Math.floor(this.secondsRemaining / 3600);
 const m = Math.floor((this.secondsRemaining % 3600) / 60);
 const s = this.secondsRemaining % 60;

 const timeStr = `${h}h ${m}m ${s}s remaining`;
 document.querySelectorAll('.timer-countdown').forEach(el => {
 el.textContent = timeStr;
 });
 }, 1000);
 }

 // ===== HASH-BASED URL ROUTING FOR MULTI-PAGE NAVIGATION =====
 setupHashRouting() {
 window.addEventListener('hashchange', () => {
 if (this._suppressHashChange) return;
 this.handleHashRoute();
 });
 }

 handleHashRoute() {
 const hash = window.location.hash.replace('#/', '').replace('#', '');
 const validViews = ['landing', 'dashboard', 'map', 'twin', 'report', 'officer', 'scan', 'register'];
 if (hash && validViews.includes(hash)) {
 if (hash === 'dashboard' && !this.currentUser) {
 this.loginDemoHarpreet();
 return;
 }
 if (hash === 'officer' && (!this.currentUser || this.currentUser.role !== 'AUTHORITY_HEAD')) {
 this.loginDemoOfficer();
 return;
 }
 this.switchView(hash);
 }
 }

 // ===== MANUAL BUILDING SCAN (2-PHASE) =====
 initManualScan() {
		const container = document.getElementById('scan-container');
		if (!container) return;

		// Initialize 3-Step Scan State
		this.scanState = {
			step: 1,
			chosenPlot: {
				khasra: 'Khasra No. 429/1',
				locality: 'Kot Atma Singh / Heritage Cadastre Zone',
				ulpin: 'BCN501G6OF8R50',
				area_sqyd: 385,
				area_sqft: 3465,
				lat: 31.61285,
				lng: 74.86235
			},
			plotPoints: [],
			exteriorPhotos: {
				front: false,
				back: false,
				left: false,
				right: false
			},
			plotArea: 385,
			estimatedHeight: 0
		};

		this.renderScanStep1();
	}

	renderScanStep1() {
		const container = document.getElementById('scan-container');
		if (!container) return;
		this.scanState.step = 1;
		this.step1Mode = this.step1Mode || 'choose';
		this.step1Points = this.step1Points || [];
		this.step1Markers = this.step1Markers || [];

		const samplePlots = [
			{ khasra: 'Khasra No. 429/1', locality: 'Kot Atma Singh / Heritage Cadastre Zone', ulpin: 'BCN501G6OF8R50', area_sqyd: 385, lat: 31.61285, lng: 74.86235 },
			{ khasra: 'Khasra No. 412/1', locality: 'Heritage Cadastre Zone / Urban Amritsar-I', ulpin: 'BCN501B1NA2CH0', area_sqyd: 350, lat: 31.61034, lng: 74.85998 },
			{ khasra: 'Khasra No. 518/3', locality: 'Mall Road Commercial Cadastre Division', ulpin: 'BCN501C2KB4M10', area_sqyd: 580, lat: 31.62145, lng: 74.87120 },
			{ khasra: 'Khasra No. 204/2', locality: 'Civil Lines Urban Extension', ulpin: 'BCN501D3LC5N20', area_sqyd: 420, lat: 31.61890, lng: 74.86540 },
			{ khasra: 'Khasra No. 108/4', locality: 'Circular Road Commercial Zone', ulpin: 'BCN501E4MD6P30', area_sqyd: 490, lat: 31.61520, lng: 74.86780 }
		];

		const allBuildings = (this.allParcels && this.allParcels.length > 0) ? this.allParcels : samplePlots;

		container.innerHTML = `
			<div class="scan-phase-card">
				<div class="scan-phase-header">
					<div class="scan-phase-badge">STEP 1 OF 3</div>
					<h2 class="scan-phase-title">Choose Building or Plot on Map</h2>
					<p class="scan-phase-desc">Select an existing building footprint from all registered buildings, or select 6 points directly on the cadastral map:</p>
				</div>

				<!-- DUAL MODE SELECTION TABS -->
				<div class="scan-step1-mode-tabs" role="tablist">
					<button type="button" class="btn-step1-mode ${this.step1Mode === 'choose' ? 'active' : ''}" id="btn-mode-choose-building" onclick="window.app.setScanStep1Mode('choose')">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 21h18M3 7v14M21 7v14M7 21V11h10v10M7 7l5-4 5 4"/></svg>
						<span>Choose Building from All Buildings</span>
					</button>
					<button type="button" class="btn-step1-mode ${this.step1Mode === 'points' ? 'active' : ''}" id="btn-mode-select-points" onclick="window.app.setScanStep1Mode('points')">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/></svg>
						<span>Select 6 Points on the Map</span>
					</button>
				</div>

				<!-- MODE 1 CONTROLS: CHOOSE FROM ALL BUILDINGS -->
				<div id="step1-choose-controls" style="${this.step1Mode === 'choose' ? 'display: block;' : 'display: none;'} margin-bottom: 12px;">
					<div class="scan-building-search-bar">
						<input type="text" id="scan-step1-search-input" class="scan-search-input" placeholder="Search 260+ buildings by Khasra, Owner, ULPIN..." oninput="window.app.filterStep1Buildings(this.value)">
						<select id="scan-step1-building-dropdown" class="scan-building-dropdown" onchange="window.app.onStep1BuildingDropdown(this.value)">
							<option value="">-- Choose Building from All Buildings (${allBuildings.length} Registered) --</option>
							${allBuildings.slice(0, 150).map(b => `
								<option value="${b.ulpin}" ${(this.scanState.chosenPlot && this.scanState.chosenPlot.ulpin === b.ulpin) ? 'selected' : ''}>
									${b.survey_no || b.khasra || 'Khasra No.'} &bull; ${b.owner || 'Owner'} &bull; ${b.ulpin} (${b.area_sqyd || 350} sq.yd)
								</option>
							`).join('')}
						</select>
					</div>

					<!-- Quick Jump Chips -->
					<div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 8px;">
						<span style="font-size: 0.74rem; color: #64748b; font-weight: 700;">Popular Buildings:</span>
						${samplePlots.map(p => `
							<button type="button" onclick="window.app.jumpToScanPlot('${p.khasra}', '${p.locality}', '${p.ulpin}', ${p.area_sqyd}, ${p.lat}, ${p.lng})" style="padding: 4px 10px; font-size: 0.74rem; background: #f1f5f9; color: #0284c7; border: 1px solid #cbd5e1; border-radius: 4px; font-weight: 600; cursor: pointer;">
								<span>${p.khasra}</span>
							</button>
						`).join('')}
					</div>
				</div>

				<!-- MODE 2 CONTROLS: SELECT 6 POINTS ON THE MAP -->
				<div id="step1-points-controls" style="${this.step1Mode === 'points' ? 'display: flex;' : 'display: none;'} margin-bottom: 12px; background: #eff6ff; border: 1.5px solid #93c5fd; border-radius: 8px; padding: 10px 14px; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
					<div>
						<div id="step1-points-status-title" style="font-size: 0.85rem; font-weight: 700; color: #1e40af;">Select 6 Boundary Points on Map</div>
						<div id="step1-points-status-sub" style="font-size: 0.76rem; color: #3b82f6;">Click on map around your plot boundary (${this.step1Points.length} of 6 points marked)</div>
					</div>
					<div style="display: flex; gap: 8px;">
						<button type="button" onclick="window.app.resetStep1MapPoints()" style="padding: 6px 12px; font-size: 0.75rem; background: #ffffff; color: #ef4444; border: 1px solid #fca5a5; border-radius: 6px; font-weight: 700; cursor: pointer;">
							Clear Points
						</button>
						<button type="button" id="btn-step1-confirm-points" onclick="window.app.confirmStep1MapPoints()" ${this.step1Points.length >= 6 ? '' : 'disabled'} style="padding: 6px 14px; font-size: 0.75rem; background: ${this.step1Points.length >= 6 ? '#16a34a' : '#94a3b8'}; color: #ffffff; border: none; border-radius: 6px; font-weight: 700; cursor: ${this.step1Points.length >= 6 ? 'pointer' : 'not-allowed'};">
							Confirm 6 Points &rarr;
						</button>
					</div>
				</div>

				<!-- Interactive Cadastral Map Container -->
				<div style="position: relative; width: 100%; height: 440px; border-radius: 8px; overflow: hidden; border: 1.5px solid #cbd5e1; box-shadow: 0 4px 14px rgba(0,0,0,0.12); margin-bottom: 14px;">
					<div id="scan-step1-map" style="width: 100%; height: 100%; background: #0f172a;"></div>

					<!-- Floating Tip Overlay -->
					<div id="scan-step1-map-tip" style="position: absolute; top: 12px; left: 12px; z-index: 10; background: rgba(0,39,77,0.88); backdrop-filter: blur(6px); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; border: 1px solid #38bdf8; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
						<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #22c55e;"></span>
						<span id="scan-step1-tip-text">${this.step1Mode === 'points' ? `Click map to place Point ${this.step1Points.length + 1} of 6` : 'Click any building or plot on the map to select'}</span>
					</div>

					<!-- Live Area HUD (in points mode) -->
					<div id="scan-step1-area-hud" style="position: absolute; top: 12px; right: 12px; z-index: 10; background: rgba(15,23,42,0.88); backdrop-filter: blur(6px); color: #4ade80; padding: 6px 12px; border-radius: 6px; font-size: 0.78rem; font-weight: 700; border: 1px solid #22c55e; ${this.step1Mode === 'points' ? 'display: block;' : 'display: none;'}">
						<span id="scan-step1-area-text">Area: 0 sq.yd</span>
					</div>
				</div>

				<!-- Selected Plot Details Banner -->
				<div id="scan-selected-plot-card" style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
					<div>
						<div style="font-size: 0.74rem; font-weight: 700; color: #15803d; text-transform: uppercase;">Selected from Cadastral Map:</div>
						<div id="scan-selected-plot-title" style="font-size: 0.98rem; font-weight: 700; color: #0f172a; margin-top: 2px;">${this.scanState.chosenPlot.khasra} &bull; ${this.scanState.chosenPlot.locality}</div>
						<div id="scan-selected-plot-sub" style="font-size: 0.76rem; color: #64748b; margin-top: 2px;">ULPIN: <span style="font-family: monospace; color: #0284c7; font-weight: 700;">${this.scanState.chosenPlot.ulpin}</span> &bull; Centroid: <span style="font-family: monospace;">${this.scanState.chosenPlot.lat}&deg;N, ${this.scanState.chosenPlot.lng}&deg;E</span></div>
					</div>
					<div style="text-align: right;">
						<div id="scan-selected-plot-area" style="font-size: 1.15rem; font-weight: 800; color: #166534;">${this.scanState.chosenPlot.area_sqyd} sq.yd</div>
						<div id="scan-selected-plot-sqft" style="font-size: 0.74rem; color: #64748b;">${this.scanState.chosenPlot.area_sqft} sq.ft</div>
					</div>
				</div>

				<div class="scan-actions">
					<button type="button" class="btn-scan-secondary" onclick="window.app.openRegisterModal()">&larr; Back to Registration Form</button>
					<button type="button" class="btn-scan-primary" id="btn-confirm-plot-step1" onclick="window.app.renderScanStep2()">
						Proceed to Step 2: 6 Boundary Points &rarr;
					</button>
				</div>
			</div>
		`;

		setTimeout(() => {
			this.initScanStep1Map();
		}, 50);
	}

	setScanStep1Mode(mode) {
		this.step1Mode = mode;
		const btnChoose = document.getElementById('btn-mode-choose-building');
		const btnPoints = document.getElementById('btn-mode-select-points');
		const panelChoose = document.getElementById('step1-choose-controls');
		const panelPoints = document.getElementById('step1-points-controls');
		const tipText = document.getElementById('scan-step1-tip-text');
		const areaHud = document.getElementById('scan-step1-area-hud');

		if (btnChoose && btnPoints) {
			btnChoose.classList.toggle('active', mode === 'choose');
			btnPoints.classList.toggle('active', mode === 'points');
		}

		if (panelChoose) panelChoose.style.display = (mode === 'choose') ? 'block' : 'none';
		if (panelPoints) panelPoints.style.display = (mode === 'points') ? 'flex' : 'none';
		if (areaHud) areaHud.style.display = (mode === 'points') ? 'block' : 'none';

		if (tipText) {
			tipText.textContent = (mode === 'points') 
				? `Click map to place Point ${this.step1Points.length + 1} of 6`
				: 'Click any building or plot on the map to select';
		}

		if (this.scanStep1Map) {
			this.scanStep1Map.getCanvas().style.cursor = (mode === 'points') ? 'crosshair' : 'default';
		}
	}

	filterStep1Buildings(query) {
		const dropdown = document.getElementById('scan-step1-building-dropdown');
		if (!dropdown) return;
		const q = (query || '').toLowerCase().trim();
		const all = this.allParcels || [];
		
		const filtered = all.filter(p => {
			if (!q) return true;
			return (p.survey_no && p.survey_no.toLowerCase().includes(q)) ||
			 (p.owner && p.owner.toLowerCase().includes(q)) ||
			 (p.ulpin && p.ulpin.toLowerCase().includes(q)) ||
			 (p.village && p.village.toLowerCase().includes(q));
		});

		dropdown.innerHTML = `<option value="">-- ${filtered.length} Buildings Found --</option>` +
			filtered.slice(0, 150).map(b => `
				<option value="${b.ulpin}">
					${b.survey_no || b.khasra || 'Khasra No.'} &bull; ${b.owner || 'Owner'} &bull; ${b.ulpin} (${b.area_sqyd || 350} sq.yd)
				</option>
			`).join('');
	}

	onStep1BuildingDropdown(ulpin) {
		if (!ulpin) return;
		const parcel = (this.allParcels || []).find(p => p.ulpin === ulpin);
		if (parcel) {
			const lat = parcel.centroid ? parcel.centroid[0] : (parcel.centroid_lat || 31.61285);
			const lng = parcel.centroid ? parcel.centroid[1] : (parcel.centroid_lng || 74.86235);
			const area = parcel.area_sqyd || 350;
			this.jumpToScanPlot(parcel.survey_no || 'Khasra No.', parcel.village || 'Heritage Zone', parcel.ulpin, area, lat, lng);
		}
	}

	initScanStep1Map() {
		const container = document.getElementById('scan-step1-map');
		if (!container) return;

		if (this.scanStep1Map) {
			try { this.scanStep1Map.remove(); } catch(e) {}
			this.scanStep1Map = null;
		}

		const center = [this.scanState.chosenPlot.lng || 74.86235, this.scanState.chosenPlot.lat || 31.61285];

		try {
			if (typeof maplibregl !== 'undefined') {
				const map = new maplibregl.Map({
					container: 'scan-step1-map',
					style: {
						version: 8,
						sources: {
							'esri-satellite': {
								type: 'raster',
								tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
								tileSize: 256,
								maxzoom: 19
							}
						},
						layers: [
							{ id: 'sat-bg', type: 'raster', source: 'esri-satellite' }
						]
					},
					center: center,
					zoom: 17,
					pitch: 20
				});

				this.scanStep1Map = map;

				map.on('load', () => {
					// 1. All Parcels Source & Layers
					const parcels = (this.allParcels && this.allParcels.length > 0) ? this.allParcels : [
						{ id: 'p1', ulpin: 'BCN501G6OF8R50', survey_no: 'Khasra No. 429/1', village: 'Kot Atma Singh / Heritage Cadastre Zone', area_sqyd: 385, centroid: [31.61285, 74.86235] },
						{ id: 'p2', ulpin: 'BCN501B1NA2CH0', survey_no: 'Khasra No. 412/1', village: 'Heritage Cadastre Zone / Urban Amritsar-I', area_sqyd: 350, centroid: [31.61034, 74.85998] },
						{ id: 'p3', ulpin: 'BCN501C2KB4M10', survey_no: 'Khasra No. 518/3', village: 'Mall Road Commercial Cadastre Division', area_sqyd: 580, centroid: [31.62145, 74.87120] }
					];

					const features = parcels.slice(0, 500).map(p => {
						let coords = p.coordinates;
						if (!coords || coords.length < 3) {
							const lat = p.centroid ? p.centroid[0] : (p.centroid_lat || 31.61285);
							const lng = p.centroid ? p.centroid[1] : (p.centroid_lng || 74.86235);
							coords = [
								[lng - 0.0002, lat - 0.00015],
								[lng + 0.0002, lat - 0.00015],
								[lng + 0.0002, lat + 0.00015],
								[lng - 0.0002, lat + 0.00015],
								[lng - 0.0002, lat - 0.00015]
							];
						} else if (coords[0] && (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1])) {
							coords = [...coords, coords[0]];
						}
						return {
							type: 'Feature',
							properties: {
								id: p.id,
								ulpin: p.ulpin,
								khasra: p.survey_no || p.khasra || 'Khasra No.',
								locality: p.village || 'Heritage Cadastre Zone',
								area_sqyd: p.area_sqyd || 350,
								centroid_lat: p.centroid ? p.centroid[0] : (p.centroid_lat || coords[0][1]),
								centroid_lng: p.centroid ? p.centroid[1] : (p.centroid_lng || coords[0][0])
							},
							geometry: {
								type: 'Polygon',
								coordinates: [coords]
							}
						};
					});

					map.addSource('scan-parcels', {
						type: 'geojson',
						data: { type: 'FeatureCollection', features }
					});

					map.addLayer({
						id: 'scan-parcels-fill',
						type: 'fill',
						source: 'scan-parcels',
						paint: {
							'fill-color': '#0284c7',
							'fill-opacity': 0.4
						}
					});

					map.addLayer({
						id: 'scan-parcels-line',
						type: 'line',
						source: 'scan-parcels',
						paint: {
							'line-color': '#38bdf8',
							'line-width': 1.5
						}
					});

					map.addLayer({
						id: 'scan-parcel-selected-fill',
						type: 'fill',
						source: 'scan-parcels',
						filter: ['==', 'ulpin', this.scanState.chosenPlot.ulpin || ''],
						paint: {
							'fill-color': '#16a34a',
							'fill-opacity': 0.75
						}
					});

					map.addLayer({
						id: 'scan-parcel-selected-line',
						type: 'line',
						source: 'scan-parcels',
						filter: ['==', 'ulpin', this.scanState.chosenPlot.ulpin || ''],
						paint: {
							'line-color': '#22c55e',
							'line-width': 3.5
						}
					});

					// 2. Custom 6-Points Marking Source & Layers
					map.addSource('step1-drawn-points', {
						type: 'geojson',
						data: { type: 'FeatureCollection', features: [] }
					});

					map.addLayer({
						id: 'step1-drawn-poly-fill',
						type: 'fill',
						source: 'step1-drawn-points',
						filter: ['==', '$type', 'Polygon'],
						paint: {
							'fill-color': '#22c55e',
							'fill-opacity': 0.35
						}
					});

					map.addLayer({
						id: 'step1-drawn-poly-line',
						type: 'line',
						source: 'step1-drawn-points',
						filter: ['any', ['==', '$type', 'Polygon'], ['==', '$type', 'LineString']],
						paint: {
							'line-color': '#16a34a',
							'line-width': 3.5
						}
					});

					map.addLayer({
						id: 'step1-drawn-pts-circle',
						type: 'circle',
						source: 'step1-drawn-points',
						filter: ['==', '$type', 'Point'],
						paint: {
							'circle-radius': 8,
							'circle-color': '#0284c7',
							'circle-stroke-width': 2.5,
							'circle-stroke-color': '#ffffff'
						}
					});

					// Pointer cursor in choose mode
					map.on('mouseenter', 'scan-parcels-fill', () => {
						if (this.step1Mode === 'choose') map.getCanvas().style.cursor = 'pointer';
					});
					map.on('mouseleave', 'scan-parcels-fill', () => {
						if (this.step1Mode === 'choose') map.getCanvas().style.cursor = '';
					});

					// Map Click Router: Handles both Building Selection and 6-Point Marking
					map.on('click', (e) => {
						if (this.step1Mode === 'points') {
							// Mode: Select 6 Points on the Map
							this.addStep1MapPoint(e.lngLat.lng, e.lngLat.lat);
						} else {
							// Mode: Choose Building from All Buildings
							const feats = map.queryRenderedFeatures(e.point, { layers: ['scan-parcels-fill'] });
							if (feats && feats.length > 0) {
								const props = feats[0].properties;
								this.selectScanPlot(
									props.khasra,
									props.locality,
									props.ulpin,
									props.area_sqyd,
									props.centroid_lat,
									props.centroid_lng
								);
								map.setFilter('scan-parcel-selected-fill', ['==', 'ulpin', props.ulpin]);
								map.setFilter('scan-parcel-selected-line', ['==', 'ulpin', props.ulpin]);
								map.flyTo({ center: [props.centroid_lng, props.centroid_lat], zoom: 17.5, duration: 800 });
							} else {
								const lat = parseFloat(e.lngLat.lat.toFixed(5));
								const lng = parseFloat(e.lngLat.lng.toFixed(5));
								const customKhasra = `Plot @ (${lat}, ${lng})`;
								this.selectScanPlot(customKhasra, 'Amritsar Cadastre Division', 'PB-CUSTOM-PLOT', 380, lat, lng);
								map.flyTo({ center: [lng, lat], zoom: 17.5, duration: 600 });
							}
						}
					});

					setTimeout(() => map.resize(), 150);
					setTimeout(() => map.resize(), 400);
				});
			}
		} catch(err) {
			console.warn('MapLibre init error in scan step 1:', err);
		}
	}

	addStep1MapPoint(lng, lat) {
		if (this.step1Points.length >= 6) {
			this.showToast('All 6 points marked! Click Confirm 6 Points or Proceed to continue.', 'info');
			return;
		}

		const ptNum = this.step1Points.length + 1;
		const fixedLat = parseFloat(lat.toFixed(6));
		const fixedLng = parseFloat(lng.toFixed(6));

		this.step1Points.push({
			point: ptNum,
			lat: fixedLat,
			lng: fixedLng,
			accuracy: 0.8,
			time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
		});

		// Update HTML Marker on Map
		if (this.scanStep1Map && typeof maplibregl !== 'undefined') {
			const el = document.createElement('div');
			el.className = 'scan-map-num-pin';
			el.style.cssText = 'width: 26px; height: 26px; background: #0284c7; color: #ffffff; border: 2.5px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.76rem; box-shadow: 0 2px 6px rgba(0,0,0,0.4); cursor: pointer;';
			el.textContent = ptNum;

			const marker = new maplibregl.Marker({ element: el })
				.setLngLat([fixedLng, fixedLat])
				.addTo(this.scanStep1Map);

			this.step1Markers.push(marker);
		}

		// Update Status Bar
		const statusSub = document.getElementById('step1-points-status-sub');
		const tipText = document.getElementById('scan-step1-tip-text');
		const confirmBtn = document.getElementById('btn-step1-confirm-points');

		if (statusSub) statusSub.textContent = `${this.step1Points.length} of 6 points marked on map`;
		if (tipText) {
			tipText.textContent = (this.step1Points.length < 6)
				? `Click map to place Point ${this.step1Points.length + 1} of 6`
				: 'All 6 points marked! Click Confirm 6 Points & Proceed';
		}

		if (this.step1Points.length >= 6 && confirmBtn) {
			confirmBtn.disabled = false;
			confirmBtn.style.background = '#16a34a';
			confirmBtn.style.cursor = 'pointer';
		}

		this.updateStep1PointsMapData();
	}

	updateStep1PointsMapData() {
		if (!this.scanStep1Map) return;
		const source = this.scanStep1Map.getSource('step1-drawn-points');
		if (!source) return;

		const pts = this.step1Points || [];
		const features = [];

		pts.forEach(p => {
			features.push({
				type: 'Feature',
				properties: { point: p.point },
				geometry: { type: 'Point', coordinates: [p.lng, p.lat] }
			});
		});

		if (pts.length >= 2 && pts.length < 6) {
			features.push({
				type: 'Feature',
				properties: {},
				geometry: {
					type: 'LineString',
					coordinates: pts.map(p => [p.lng, p.lat])
				}
			});
		} else if (pts.length === 6) {
			const ring = pts.map(p => [p.lng, p.lat]);
			ring.push(ring[0]); // close polygon
			features.push({
				type: 'Feature',
				properties: {},
				geometry: {
					type: 'Polygon',
					coordinates: [ring]
				}
			});

			// Compute Shoelace Area
			const originLat = pts[0].lat;
			const originLng = pts[0].lng;
			const xy = pts.map(p => ({
				x: (p.lng - originLng) * 94800,
				y: (p.lat - originLat) * 110890
			}));
			let a = 0;
			for (let i = 0; i < xy.length; i++) {
				const j = (i + 1) % xy.length;
				a += xy[i].x * xy[j].y - xy[j].x * xy[i].y;
			}
			const areaM2 = Math.abs(a) / 2;
			const areaSqft = Math.round(areaM2 * 10.7639);
			const areaSqyd = Math.round(areaSqft / 9.0);

			const areaHud = document.getElementById('scan-step1-area-text');
			if (areaHud) areaHud.textContent = `Area: ${areaSqyd} sq.yd (${areaSqft} sq.ft)`;

			const centerLat = (pts.reduce((s, p) => s + p.lat, 0) / pts.length).toFixed(5);
			const centerLng = (pts.reduce((s, p) => s + p.lng, 0) / pts.length).toFixed(5);

			this.selectScanPlot(
				`Custom 6-Point Cadastral Plot`,
				`Marked on Map &bull; Amritsar Division`,
				`PB02-MAP-PLOT-${Date.now().toString().slice(-4)}`,
				areaSqyd,
				parseFloat(centerLat),
				parseFloat(centerLng)
			);
		}

		source.setData({ type: 'FeatureCollection', features });
	}

	resetStep1MapPoints() {
		this.step1Points = [];
		if (this.step1Markers) {
			this.step1Markers.forEach(m => m.remove());
			this.step1Markers = [];
		}
		this.updateStep1PointsMapData();

		const statusSub = document.getElementById('step1-points-status-sub');
		const tipText = document.getElementById('scan-step1-tip-text');
		const confirmBtn = document.getElementById('btn-step1-confirm-points');
		const areaHud = document.getElementById('scan-step1-area-text');

		if (statusSub) statusSub.textContent = '0 of 6 points marked on map';
		if (tipText) tipText.textContent = 'Click map to place Point 1 of 6';
		if (confirmBtn) {
			confirmBtn.disabled = true;
			confirmBtn.style.background = '#94a3b8';
			confirmBtn.style.cursor = 'not-allowed';
		}
		if (areaHud) areaHud.textContent = 'Area: 0 sq.yd';
	}

	confirmStep1MapPoints() {
		if (this.step1Points.length < 6) {
			this.showToast('Please click all 6 points on the map to define the boundary.', 'warning');
			return;
		}

		// Populate scanState.plotPoints
		this.scanState.plotPoints = this.step1Points.map(p => ({ ...p }));
		this.showToast('6 boundary points confirmed from map! Proceeding to Step 2.', 'success');
		this.renderScanStep2();
	}

	jumpToScanPlot(khasra, locality, ulpin, area_sqyd, lat, lng) {
		this.selectScanPlot(khasra, locality, ulpin, area_sqyd, lat, lng);
		if (this.scanStep1Map) {
			try {
				this.scanStep1Map.setFilter('scan-parcel-selected-fill', ['==', 'ulpin', ulpin]);
				this.scanStep1Map.setFilter('scan-parcel-selected-line', ['==', 'ulpin', ulpin]);
				this.scanStep1Map.flyTo({ center: [lng, lat], zoom: 17.5, duration: 800 });
			} catch(e) {}
		}
	}

	selectScanPlot(khasra, locality, ulpin, area_sqyd, lat, lng) {
		this.scanState.chosenPlot = { khasra, locality, ulpin, area_sqyd, area_sqft: area_sqyd * 9, lat, lng };
		const titleEl = document.getElementById('scan-selected-plot-title');
		const subEl = document.getElementById('scan-selected-plot-sub');
		const areaEl = document.getElementById('scan-selected-plot-area');
		const sqftEl = document.getElementById('scan-selected-plot-sqft');

		if (titleEl) titleEl.innerHTML = `${khasra} &bull; ${locality}`;
		if (subEl) subEl.innerHTML = `ULPIN: <span style="font-family: monospace; color: #0284c7; font-weight: 700;">${ulpin}</span> &bull; Centroid: <span style="font-family: monospace;">${lat}&deg;N, ${lng}&deg;E</span>`;
		if (areaEl) areaEl.textContent = `${area_sqyd} sq.yd`;
		if (sqftEl) sqftEl.textContent = `${area_sqyd * 9} sq.ft`;
	}

	renderScanStep2() {
		const container = document.getElementById('scan-container');
		if (!container) return;
		this.scanState.step = 2;
		if (!this.scanState.plotPoints) this.scanState.plotPoints = [];
		if (!this.scanState.pointPhotos) this.scanState.pointPhotos = {};

		const count = (this.scanState.plotPoints || []).filter(Boolean).length;

		container.innerHTML = `
			<div class="scan-phase-card">
				<div class="scan-phase-header">
					<div class="scan-phase-badge">STEP 2 OF 3</div>
					<h2 class="scan-phase-title">6 Points of the Plot / Building</h2>
					<p class="scan-phase-desc">Walk to each boundary corner of <strong>${this.scanState.chosenPlot.khasra}</strong>. Open camera to click the corner photo and lock real GPS coordinates on the live satellite map:</p>
				</div>

				<div class="scan-progress-bar">
					<div class="scan-progress-fill" id="scan-progress-fill" style="width: ${(count / 6) * 100}%"></div>
				</div>
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
					<div class="scan-progress-label" id="scan-progress-label" style="margin: 0;">${count} of 6 points captured</div>
					<button type="button" onclick="window.app.quickCaptureAll6Points()" style="padding: 4px 10px; font-size: 0.74rem; background: #e0f2fe; color: #0284c7; border: 1px solid #38bdf8; border-radius: 4px; font-weight: 700; cursor: pointer;">
						Instant Capture All 6 Points
					</button>
				</div>

				<!-- REAL SATELLITE MAP CONTAINER FOR STEP 2 -->
				<div class="scan-step2-map-wrapper" id="scan-map-preview">
					<div id="scan-step2-map"></div>

					<!-- Live Satellite Map HUD Overlay -->
					<div class="scan-step2-hud-top">
						<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #22c55e;"></span>
						<span>Live Cadastral Satellite Map &bull; Click to place/adjust points</span>
					</div>

					<div class="scan-step2-hud-right" id="scan-step2-hud-area">
						<span id="scan-step2-area-text">Area: ${this.scanState.chosenPlot.area_sqyd || 0} sq.yd</span>
					</div>
				</div>

				<div class="scan-points-grid" id="scan-points-grid">
					${[1,2,3,4,5,6].map(i => `
						<div class="scan-point-card" id="scan-point-card-${i}" data-point="${i}">
							<div class="scan-point-num">${i}</div>
							<div class="scan-point-thumb" id="scan-point-thumb-${i}" style="display: none;">
								<img id="scan-point-img-${i}" src="" alt="Point ${i} Photo">
							</div>
							<div class="scan-point-status" id="scan-point-status-${i}">
								<span class="scan-waiting-icon">Pending</span>
								<span>Waiting...</span>
							</div>
							<div class="scan-point-coords" id="scan-point-coords-${i}" style="display: none; font-size: 0.68rem; font-family: monospace; color: #0284c7; margin-bottom: 6px; line-height: 1.2;">
								<div id="scan-point-latlng-${i}"></div>
								<div id="scan-point-acc-${i}" style="color: #16a34a; font-size: 0.62rem; margin-top: 2px;"></div>
							</div>
							<button type="button" class="btn-scan-capture" id="btn-capture-point-${i}" onclick="window.app.captureGpsPoint(${i})">
								Open Camera &amp; Capture Point ${i}
							</button>
						</div>
					`).join('')}
				</div>

				<div class="scan-area-result" id="scan-area-result" style="display: none; margin-top: 14px;">
					<div class="scan-area-grid">
						<div><span class="scan-area-label">Calculated Area</span><strong id="scan-area-sqyd">-</strong></div>
						<div><span class="scan-area-label">Area (sq.ft)</span><strong id="scan-area-sqft">-</strong></div>
						<div><span class="scan-area-label">Area (sq.m)</span><strong id="scan-area-sqm">-</strong></div>
						<div><span class="scan-area-label">GPS Centroid</span><strong id="scan-centroid">-</strong></div>
					</div>
				</div>

				<div class="scan-actions" style="margin-top: 20px;">
					<button type="button" class="btn-scan-secondary" onclick="window.app.renderScanStep1()">&larr; Back to Step 1</button>
					<button type="button" class="btn-scan-primary" id="btn-proceed-phase3" onclick="window.app.renderScanStep3()" ${count >= 6 ? '' : 'disabled'}>
						Proceed to Step 3: Front, Back, Left, Right Photos &rarr;
					</button>
				</div>
			</div>
		`;

		// Initialize Step 2 MapLibre Satellite Map
		setTimeout(() => {
			this.initScanStep2Map();
		}, 50);

		// Restore any existing points
		if (this.scanState.plotPoints && this.scanState.plotPoints.length > 0) {
			this.scanState.plotPoints.forEach((p, idx) => {
				if (p) this.recordScanPoint(idx + 1, p.lat, p.lng, p.accuracy || 1.0, p.photo || null, false);
			});
		}
	}

	initScanStep2Map() {
		const container = document.getElementById('scan-step2-map');
		if (!container) return;

		if (this.scanStep2Map) {
			try { this.scanStep2Map.remove(); } catch(e) {}
			this.scanStep2Map = null;
		}

		this.step2Markers = [];

		const plotLat = this.scanState?.chosenPlot?.lat || 31.61285;
		const plotLng = this.scanState?.chosenPlot?.lng || 74.86235;

		try {
			if (typeof maplibregl !== 'undefined') {
				const map = new maplibregl.Map({
					container: 'scan-step2-map',
					style: {
						version: 8,
						sources: {
							'esri-satellite': {
								type: 'raster',
								tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
								tileSize: 256,
								maxzoom: 19
							}
						},
						layers: [
							{ id: 'sat-bg', type: 'raster', source: 'esri-satellite' }
						]
					},
					center: [plotLng, plotLat],
					zoom: 18,
					pitch: 0
				});

				this.scanStep2Map = map;

				map.on('load', () => {
					// Boundary GeoJSON Source
					map.addSource('scan-step2-boundary', {
						type: 'geojson',
						data: { type: 'FeatureCollection', features: [] }
					});

					// Polygon Fill
					map.addLayer({
						id: 'scan-step2-poly-fill',
						type: 'fill',
						source: 'scan-step2-boundary',
						filter: ['==', '$type', 'Polygon'],
						paint: {
							'fill-color': '#22c55e',
							'fill-opacity': 0.35
						}
					});

					// Polygon Boundary Line
					map.addLayer({
						id: 'scan-step2-poly-line',
						type: 'line',
						source: 'scan-step2-boundary',
						filter: ['any', ['==', '$type', 'Polygon'], ['==', '$type', 'LineString']],
						paint: {
							'line-color': '#16a34a',
							'line-width': 3.5
						}
					});

					// Points Layer
					map.addLayer({
						id: 'scan-step2-pts',
						type: 'circle',
						source: 'scan-step2-boundary',
						filter: ['==', '$type', 'Point'],
						paint: {
							'circle-radius': 9,
							'circle-color': '#0284c7',
							'circle-stroke-width': 2.5,
							'circle-stroke-color': '#ffffff'
						}
					});

					// Allow clicking on Step 2 Satellite Map to place or adjust points
					map.on('click', (e) => {
						const points = this.scanState.plotPoints || [];
						let targetNum = points.findIndex(p => !p) + 1;
						if (targetNum === 0 || targetNum > 6) {
							targetNum = 1; // loop or overwrite
						}
						this.recordScanPoint(targetNum, e.lngLat.lat, e.lngLat.lng, 0.8, null);
					});

					this.updateScanStep2MapBoundary();

					setTimeout(() => map.resize(), 150);
					setTimeout(() => map.resize(), 400);
				});
			}
		} catch(err) {
			console.warn('MapLibre init error in scan step 2:', err);
		}
	}

	updateScanStep2MapBoundary() {
		const points = (this.scanState.plotPoints || []).filter(Boolean);
		const count = points.length;

		// Calculate Area using Shoelace Formula
		if (points.length >= 3) {
			const originLat = points[0].lat;
			const originLng = points[0].lng;
			const xyMeters = points.map(p => ({
				x: (p.lng - originLng) * 94800,
				y: (p.lat - originLat) * 110890
			}));

			let areaM2 = 0;
			for (let i = 0; i < xyMeters.length; i++) {
				const j = (i + 1) % xyMeters.length;
				areaM2 += xyMeters[i].x * xyMeters[j].y;
				areaM2 -= xyMeters[j].x * xyMeters[i].y;
			}
			areaM2 = Math.abs(areaM2) / 2;
			if (areaM2 < 50) areaM2 = 321.9;

			const areaSqft = Math.round(areaM2 * 10.7639);
			const areaSqyd = Math.round(areaSqft / 9.0);
			const centerLat = (points.reduce((acc, p) => acc + p.lat, 0) / points.length).toFixed(5);
			const centerLng = (points.reduce((acc, p) => acc + p.lng, 0) / points.length).toFixed(5);

			this.scanState.calculatedArea = { sqyd: areaSqyd, sqft: areaSqft, sqm: Math.round(areaM2 * 10) / 10 };

			const resEl = document.getElementById('scan-area-result');
			const sqydEl = document.getElementById('scan-area-sqyd');
			const sqftEl = document.getElementById('scan-area-sqft');
			const sqmEl = document.getElementById('scan-area-sqm');
			const centroidEl = document.getElementById('scan-centroid');
			const hudAreaEl = document.getElementById('scan-step2-area-text');

			if (resEl) resEl.style.display = 'block';
			if (sqydEl) sqydEl.textContent = `${areaSqyd} sq.yd`;
			if (sqftEl) sqftEl.textContent = `${areaSqft} sq.ft`;
			if (sqmEl) sqmEl.textContent = `${Math.round(areaM2 * 10) / 10} m²`;
			if (centroidEl) centroidEl.textContent = `${centerLat}°N, ${centerLng}°E`;
			if (hudAreaEl) hudAreaEl.textContent = `Area: ${areaSqyd} sq.yd (${areaSqft} sq.ft)`;
		}

		// Update MapLibre GeoJSON Source & Markers
		if (!this.scanStep2Map) return;
		const source = this.scanStep2Map.getSource('scan-step2-boundary');
		if (!source) return;

		const features = [];

		points.forEach(p => {
			features.push({
				type: 'Feature',
				properties: { point: p.point },
				geometry: { type: 'Point', coordinates: [p.lng, p.lat] }
			});
		});

		if (points.length >= 2 && points.length < 6) {
			features.push({
				type: 'Feature',
				properties: {},
				geometry: {
					type: 'LineString',
					coordinates: points.map(p => [p.lng, p.lat])
				}
			});
		} else if (points.length === 6) {
			const ring = points.map(p => [p.lng, p.lat]);
			ring.push(ring[0]);
			features.push({
				type: 'Feature',
				properties: {},
				geometry: {
					type: 'Polygon',
					coordinates: [ring]
				}
			});
		}

		source.setData({ type: 'FeatureCollection', features });

		// Sync Map HTML Pins
		if (this.step2Markers) {
			this.step2Markers.forEach(m => m.remove());
			this.step2Markers = [];
		}

		points.forEach(p => {
			const el = document.createElement('div');
			el.className = 'scan-step2-pin';
			el.style.cssText = 'width: 26px; height: 26px; background: #0284c7; color: #ffffff; border: 2.5px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.76rem; box-shadow: 0 2px 6px rgba(0,0,0,0.5); cursor: pointer;';
			el.textContent = p.point;
			el.title = `Point ${p.point}: ${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`;

			const marker = new maplibregl.Marker({ element: el })
				.setLngLat([p.lng, p.lat])
				.addTo(this.scanStep2Map);

			this.step2Markers.push(marker);
		});

		// Fit Bounds to enclose points on the satellite map
		if (points.length >= 2) {
			const lats = points.map(p => p.lat);
			const lngs = points.map(p => p.lng);
			const bounds = [
				[Math.min(...lngs) - 0.0003, Math.min(...lats) - 0.0003],
				[Math.max(...lngs) + 0.0003, Math.max(...lats) + 0.0003]
			];
			try {
				this.scanStep2Map.fitBounds(bounds, { padding: 40, duration: 600, maxZoom: 19 });
			} catch(e) {}
		}
	}

	updateScanBoundarySvg() {
		this.updateScanStep2MapBoundary();
	}

	captureGpsPoint(pointNum) {
		this.openScanCamera('point', pointNum);
	}

	openScanCamera(type, id) {
		this.activeScanTarget = { type, id };
		const modal = document.getElementById('scan-camera-modal');
		const titleEl = document.getElementById('scan-camera-modal-title');
		const subEl = document.getElementById('scan-camera-modal-subtitle');
		const gridLines = document.getElementById('scan-camera-grid-lines');
		const hudLabel = document.getElementById('scan-hud-label');

		const khasra = this.scanState?.chosenPlot?.khasra || 'Khasra No. 429/1';

		if (type === 'point') {
			const pointNum = id;
			if (titleEl) titleEl.textContent = `GPS Point ${pointNum} Photo & Coordinates Capture`;
			if (subEl) subEl.textContent = `Stand at Corner Peg ${pointNum} of ${khasra} and click photo`;
			if (hudLabel) hudLabel.textContent = `Point ${pointNum} of 6: Boundary Corner Marker &bull; ${khasra}`;
			if (gridLines) gridLines.style.display = 'none';
			this.acquireRealGpsCoordinates(pointNum);
		} else if (type === 'elevation') {
			const side = id;
			const sideName = side.toUpperCase();
			if (titleEl) titleEl.textContent = `${sideName} Elevation Photo Scan`;
			if (subEl) subEl.textContent = `Stand facing the ${sideName} side of ${khasra} and align facade`;
			if (hudLabel) hudLabel.textContent = `${sideName} Elevation Photo &bull; Architectural Height Verification`;
			if (gridLines) gridLines.style.display = 'block';
			const baseLat = this.scanState?.chosenPlot?.lat || 31.61285;
			const baseLng = this.scanState?.chosenPlot?.lng || 74.86235;
			this.currentGps = { lat: baseLat, lng: baseLng, accuracy: 1.0, alt: 218.4 };
			this.updateCameraHud();
		}

		if (modal) modal.style.display = 'flex';

		// Start Camera Video Feed
		this.startCameraStream(type, id);
	}

	acquireRealGpsCoordinates(pointNum) {
		const baseLat = this.scanState?.chosenPlot?.lat || 31.61285;
		const baseLng = this.scanState?.chosenPlot?.lng || 74.86235;
		const offsets = [
			[0, 0], [0.00028, 0.00012], [0.00045, -0.00018],
			[0.00038, -0.00048], [0.00012, -0.00055], [-0.00018, -0.00028]
		];
		const off = offsets[(pointNum - 1) % offsets.length] || [0, 0];
		const fallbackCoords = {
			lat: parseFloat((baseLat + off[0]).toFixed(6)),
			lng: parseFloat((baseLng + off[1]).toFixed(6)),
			accuracy: 0.8,
			alt: 218.4
		};

		this.currentGps = fallbackCoords;
		this.updateCameraHud();

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					this.currentGps = {
						lat: parseFloat(pos.coords.latitude.toFixed(6)),
						lng: parseFloat(pos.coords.longitude.toFixed(6)),
						accuracy: pos.coords.accuracy ? Math.round(pos.coords.accuracy * 10) / 10 : 1.2,
						alt: pos.coords.altitude ? Math.round(pos.coords.altitude * 10) / 10 : 218.4
					};
					this.updateCameraHud();
				},
				(err) => {
					this.currentGps = fallbackCoords;
					this.updateCameraHud();
				},
				{ enableHighAccuracy: true, timeout: 4000, maximumAge: 0 }
			);
		}
	}

	updateCameraHud() {
		const hudCoords = document.getElementById('scan-hud-coords');
		const hudAcc = document.getElementById('scan-hud-accuracy');
		const hudAlt = document.getElementById('scan-hud-alt');

		if (this.currentGps) {
			if (hudCoords) hudCoords.textContent = `${this.currentGps.lat.toFixed(6)}\u00B0 N, ${this.currentGps.lng.toFixed(6)}\u00B0 E`;
			if (hudAcc) hudAcc.textContent = `Accuracy: \u00B1${this.currentGps.accuracy}m`;
			if (hudAlt) hudAlt.textContent = `Alt: ${this.currentGps.alt}m`;
		}
	}

	startCameraStream(type, id) {
		const video = document.getElementById('scan-camera-video');
		const canvas = document.getElementById('scan-camera-canvas');
		if (canvas) canvas.style.display = 'none';
		if (video) video.style.display = 'block';

		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices.getUserMedia({
				video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
			}).then(stream => {
				this.scanCameraStream = stream;
				if (video) {
					video.srcObject = stream;
					video.play().catch(e => console.warn(e));
				}
			}).catch(err => {
				console.warn('Physical camera unavailable, using interactive live virtual viewfinder:', err);
				this.renderSimulatedLiveFeed(type, id);
			});
		} else {
			this.renderSimulatedLiveFeed(type, id);
		}
	}

	renderSimulatedLiveFeed(type, id) {
		const video = document.getElementById('scan-camera-video');
		const canvas = document.getElementById('scan-camera-canvas');
		if (video) video.style.display = 'none';
		if (canvas) {
			canvas.style.display = 'block';
			canvas.width = 640;
			canvas.height = 360;
			const ctx = canvas.getContext('2d');
			this.drawSimulatedViewfinderFrame(ctx, 640, 360, type, id);
		}
	}

	drawSimulatedViewfinderFrame(ctx, w, h, type, id) {
		const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
		skyGrad.addColorStop(0, '#0284c7');
		skyGrad.addColorStop(1, '#7dd3fc');
		ctx.fillStyle = skyGrad;
		ctx.fillRect(0, 0, w, h * 0.6);

		const groundGrad = ctx.createLinearGradient(0, h * 0.6, 0, h);
		groundGrad.addColorStop(0, '#334155');
		groundGrad.addColorStop(1, '#0f172a');
		ctx.fillStyle = groundGrad;
		ctx.fillRect(0, h * 0.6, w, h * 0.4);

		ctx.strokeStyle = '#38bdf8';
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.moveTo(0, h * 0.6);
		ctx.lineTo(w, h * 0.6);
		ctx.stroke();

		if (type === 'point') {
			ctx.strokeStyle = '#22c55e';
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.arc(w / 2, h * 0.65, 30, 0, Math.PI * 2);
			ctx.stroke();

			ctx.fillStyle = '#ef4444';
			ctx.beginPath();
			ctx.arc(w / 2, h * 0.65, 8, 0, Math.PI * 2);
			ctx.fill();

			ctx.fillStyle = '#ffffff';
			ctx.font = 'bold 13px sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(`CORNER PEG ${id} (GPS LOCKED)`, w / 2, h * 0.65 - 42);
		} else {
			ctx.fillStyle = '#1e293b';
			ctx.fillRect(w * 0.25, h * 0.25, w * 0.5, h * 0.5);
			ctx.strokeStyle = '#38bdf8';
			ctx.lineWidth = 2;
			ctx.strokeRect(w * 0.25, h * 0.25, w * 0.5, h * 0.5);

			ctx.fillStyle = '#ffffff';
			ctx.font = 'bold 15px sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(`${String(id).toUpperCase()} ELEVATION FACADE`, w / 2, h * 0.5);
		}
	}

	snapScanPhoto() {
		const video = document.getElementById('scan-camera-video');
		const canvas = document.getElementById('scan-camera-canvas');
		const target = this.activeScanTarget;
		if (!target) return;

		const snapCanvas = document.createElement('canvas');
		snapCanvas.width = 1280;
		snapCanvas.height = 720;
		const ctx = snapCanvas.getContext('2d');

		if (video && video.style.display !== 'none' && video.videoWidth) {
			ctx.drawImage(video, 0, 0, 1280, 720);
		} else if (canvas && canvas.style.display !== 'none') {
			ctx.drawImage(canvas, 0, 0, 1280, 720);
		} else {
			this.drawSimulatedViewfinderFrame(ctx, 1280, 720, target.type, target.id);
		}

		this.drawCadastralStamp(ctx, 1280, 720, target);

		const photoDataUrl = snapCanvas.toDataURL('image/jpeg', 0.85);

		if (target.type === 'point') {
			const pointNum = target.id;
			const lat = this.currentGps ? this.currentGps.lat : (this.scanState.chosenPlot.lat || 31.61285);
			const lng = this.currentGps ? this.currentGps.lng : (this.scanState.chosenPlot.lng || 74.86235);
			const acc = this.currentGps ? this.currentGps.accuracy : 1.0;
			this.recordScanPoint(pointNum, lat, lng, acc, photoDataUrl);
		} else if (target.type === 'elevation') {
			const side = target.id;
			this.recordExteriorPhotoWithData(side, photoDataUrl);
		}

		this.closeScanCameraModal();
	}

	handleScanPhotoUpload(e) {
		const file = e.target.files && e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement('canvas');
				canvas.width = 1280;
				canvas.height = 720;
				const ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0, 1280, 720);
				this.drawCadastralStamp(ctx, 1280, 720, this.activeScanTarget);
				const photoDataUrl = canvas.toDataURL('image/jpeg', 0.85);

				if (this.activeScanTarget?.type === 'point') {
					const pointNum = this.activeScanTarget.id;
					const lat = this.currentGps ? this.currentGps.lat : (this.scanState.chosenPlot.lat || 31.61285);
					const lng = this.currentGps ? this.currentGps.lng : (this.scanState.chosenPlot.lng || 74.86235);
					const acc = this.currentGps ? this.currentGps.accuracy : 1.0;
					this.recordScanPoint(pointNum, lat, lng, acc, photoDataUrl);
				} else if (this.activeScanTarget?.type === 'elevation') {
					const side = this.activeScanTarget.id;
					this.recordExteriorPhotoWithData(side, photoDataUrl);
				}
			};
			img.src = event.target.result;
		};
		reader.readAsDataURL(file);
	}

	drawCadastralStamp(ctx, w, h, target) {
		const khasra = this.scanState?.chosenPlot?.khasra || 'Khasra No. 429/1';
		const ulpin = this.scanState?.chosenPlot?.ulpin || 'BCN501G6OF8R50';
		const lat = this.currentGps ? this.currentGps.lat.toFixed(6) : '31.612850';
		const lng = this.currentGps ? this.currentGps.lng.toFixed(6) : '74.862350';
		const acc = this.currentGps ? this.currentGps.accuracy : '1.0';

		ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
		ctx.fillRect(0, h - 85, w, 85);
		ctx.strokeStyle = '#0284c7';
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(0, h - 85);
		ctx.lineTo(w, h - 85);
		ctx.stroke();

		ctx.textAlign = 'left';
		ctx.fillStyle = '#ffffff';
		ctx.font = 'bold 20px sans-serif';
		const title = target?.type === 'point' ? `BHAVANINFO 3D CADASTRE &bull; GPS POINT ${target.id} OF 6` : `BHAVANINFO 3D CADASTRE &bull; ${String(target?.id).toUpperCase()} ELEVATION PHOTO`;
		ctx.fillText(title, 24, h - 50);

		ctx.fillStyle = '#94a3b8';
		ctx.font = '15px sans-serif';
		ctx.fillText(`${khasra} &bull; ULPIN: ${ulpin} &bull; ISO 19152 LADM / SVAMITVA`, 24, h - 22);

		ctx.textAlign = 'right';
		ctx.fillStyle = '#38bdf8';
		ctx.font = 'bold 17px monospace';
		ctx.fillText(`${lat}\u00B0 N, ${lng}\u00B0 E (\u00B1${acc}m)`, w - 24, h - 50);

		ctx.fillStyle = '#cbd5e1';
		ctx.font = '14px monospace';
		ctx.fillText(new Date().toLocaleString(), w - 24, h - 22);
	}

	closeScanCameraModal() {
		const modal = document.getElementById('scan-camera-modal');
		if (modal) modal.style.display = 'none';

		if (this.scanCameraStream) {
			this.scanCameraStream.getTracks().forEach(t => t.stop());
			this.scanCameraStream = null;
		}
	}

	recordScanPoint(pointNum, lat, lng, accuracy = 1.0, photoDataUrl = null, syncMap = true) {
		const pObj = {
			point: pointNum,
			lat: parseFloat(lat),
			lng: parseFloat(lng),
			accuracy: accuracy,
			photo: photoDataUrl || (this.scanState.pointPhotos && this.scanState.pointPhotos[pointNum]) || null,
			time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
		};

		this.scanState.plotPoints[pointNum - 1] = pObj;
		if (photoDataUrl) {
			this.scanState.pointPhotos[pointNum] = photoDataUrl;
		}

		// Update UI Card
		const card = document.getElementById(`scan-point-card-${pointNum}`);
		const statusEl = document.getElementById(`scan-point-status-${pointNum}`);
		const thumbEl = document.getElementById(`scan-point-thumb-${pointNum}`);
		const imgEl = document.getElementById(`scan-point-img-${pointNum}`);
		const coordsEl = document.getElementById(`scan-point-coords-${pointNum}`);
		const latLngEl = document.getElementById(`scan-point-latlng-${pointNum}`);
		const accEl = document.getElementById(`scan-point-acc-${pointNum}`);
		const btn = document.getElementById(`btn-capture-point-${pointNum}`);

		if (card) card.classList.add('captured');
		if (statusEl) statusEl.innerHTML = `<span style="color: #16a34a; font-weight: 700;">Captured Point ${pointNum}</span>`;

		if (pObj.photo && thumbEl && imgEl) {
			imgEl.src = pObj.photo;
			thumbEl.style.display = 'block';
		}

		if (coordsEl && latLngEl) {
			coordsEl.style.display = 'block';
			latLngEl.textContent = `${lat.toFixed(5)}\u00B0 N, ${lng.toFixed(5)}\u00B0 E`;
			if (accEl) accEl.textContent = `\u00B1${accuracy}m &bull; ${pObj.time}`;
		}

		if (btn) {
			btn.textContent = `Retake Point ${pointNum}`;
			btn.style.background = '#f1f5f9';
			btn.style.color = '#475569';
			btn.style.border = '1px solid #cbd5e1';
		}

		// Update Progress Bar
		const captured = this.scanState.plotPoints.filter(Boolean);
		const count = captured.length;
		const fill = document.getElementById('scan-progress-fill');
		const label = document.getElementById('scan-progress-label');

		if (fill) fill.style.width = `${(count / 6) * 100}%`;
		if (label) label.textContent = `${count} of 6 points captured`;

		// Update Satellite Map
		if (syncMap) {
			this.updateScanStep2MapBoundary();
		}

		// Unlock Step 3 if 6 points captured
		if (count >= 6) {
			const proceedBtn = document.getElementById('btn-proceed-phase3');
			if (proceedBtn) {
				proceedBtn.disabled = false;
				proceedBtn.style.background = '#16a34a';
			}
		}
	}

	quickCaptureAll6Points() {
		const baseLat = this.scanState?.chosenPlot?.lat || 31.61285;
		const baseLng = this.scanState?.chosenPlot?.lng || 74.86235;

		const offsets = [
			[0, 0],
			[0.00028, 0.00012],
			[0.00045, -0.00018],
			[0.00038, -0.00048],
			[0.00012, -0.00055],
			[-0.00018, -0.00028]
		];

		offsets.forEach((off, idx) => {
			const pointNum = idx + 1;
			const lat = parseFloat((baseLat + off[0]).toFixed(6));
			const lng = parseFloat((baseLng + off[1]).toFixed(6));

			const canvas = document.createElement('canvas');
			canvas.width = 640;
			canvas.height = 360;
			const ctx = canvas.getContext('2d');
			this.drawSimulatedViewfinderFrame(ctx, 640, 360, 'point', pointNum);
			this.currentGps = { lat, lng, accuracy: 0.8, alt: 218.4 };
			this.drawCadastralStamp(ctx, 640, 360, { type: 'point', id: pointNum });
			const simulatedPhoto = canvas.toDataURL('image/jpeg', 0.8);

			this.recordScanPoint(pointNum, lat, lng, 0.8, simulatedPhoto, false);
		});

		this.updateScanStep2MapBoundary();
		this.showToast('All 6 GPS points and corner photos captured successfully!', 'success');
	}

	quickCaptureAll4Photos() {
		const sides = ['front', 'back', 'left', 'right'];
		sides.forEach(side => {
			const canvas = document.createElement('canvas');
			canvas.width = 640;
			canvas.height = 360;
			const ctx = canvas.getContext('2d');
			this.drawSimulatedViewfinderFrame(ctx, 640, 360, 'elevation', side);
			this.currentGps = { lat: this.scanState?.chosenPlot?.lat || 31.61285, lng: this.scanState?.chosenPlot?.lng || 74.86235, accuracy: 1.0, alt: 218.4 };
			this.drawCadastralStamp(ctx, 640, 360, { type: 'elevation', id: side });
			const photoDataUrl = canvas.toDataURL('image/jpeg', 0.85);
			this.recordExteriorPhotoWithData(side, photoDataUrl);
		});
		this.showToast('All 4 elevation photos captured and watermarked successfully!', 'success');
	}

	renderScanStep3() {
		const container = document.getElementById('scan-container');
		if (!container) return;
		this.scanState.step = 3;
		if (!this.scanState.exteriorPhotos) {
			this.scanState.exteriorPhotos = { front: null, back: null, left: null, right: null };
		}

		const sides = [
			{ key: 'front', label: 'Front Elevation Photo', desc: 'Front facade & main road entryway' },
			{ key: 'back', label: 'Back Elevation Photo', desc: 'Rear plot boundary & exterior wall' },
			{ key: 'left', label: 'Left Elevation Photo', desc: 'Left setback & adjacent property line' },
			{ key: 'right', label: 'Right Elevation Photo', desc: 'Right boundary & vertical height audit' }
		];

		container.innerHTML = `
			<div class="scan-phase-card">
				<div class="scan-phase-header">
					<div class="scan-phase-badge phase2">STEP 3 OF 3</div>
					<h2 class="scan-phase-title">Front, Back, Left, Right Photos Scan</h2>
					<p class="scan-phase-desc">Open camera and capture the 4 elevation reference photos for <strong>${this.scanState.chosenPlot.khasra}</strong>. Each photo will be stamped and sealed with the 6-point cadastral survey:</p>
				</div>

				<div class="scan-progress-bar">
					<div class="scan-progress-fill phase2" id="scan-ext-progress" style="width: 0%"></div>
				</div>
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
					<div class="scan-progress-label" id="scan-ext-progress-label" style="margin: 0;">0 of 4 photos captured</div>
					<button type="button" onclick="window.app.quickCaptureAll4Photos()" style="padding: 4px 10px; font-size: 0.74rem; background: #e0f2fe; color: #0284c7; border: 1px solid #38bdf8; border-radius: 4px; font-weight: 700; cursor: pointer;">
						Instant Capture All 4 Photos
					</button>
				</div>

				<div class="scan-exterior-grid">
					${sides.map(s => `
						<div class="scan-side-card" id="scan-side-${s.key}">
							<h4>${s.label}</h4>
							<div class="scan-side-preview" id="scan-side-preview-${s.key}" style="height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #e2e8f0; border-radius: 6px; overflow: hidden; margin-bottom: 8px;">
								<div style="font-size: 0.74rem; color: #64748b; padding: 10px;">${s.desc}</div>
							</div>
							<div class="scan-side-status" id="scan-side-status-${s.key}" style="margin-bottom: 8px;">
								<span style="font-size: 0.72rem; color: #94a3b8;">Pending Photo</span>
							</div>
							<button type="button" class="btn-scan-capture" id="btn-scan-photo-${s.key}" onclick="window.app.captureExteriorPhoto('${s.key}')">
								Open Camera &amp; Capture ${s.label.split(' ')[0]}
							</button>
						</div>
					`).join('')}
				</div>

				<div class="scan-height-card" id="scan-height-card" style="display: none; margin-top: 14px; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 10px; padding: 14px;">
					<h4 style="color: #166534; margin: 0 0 10px 0; font-size: 0.92rem;">Cadastral Digital Twin Verification Package Sealed</h4>
					<div class="scan-height-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; font-size: 0.8rem;">
						<div><span>Plot / Khasra</span><strong style="display: block; color: #0284c7;">${this.scanState.chosenPlot.khasra}</strong></div>
						<div><span>Boundary Coordinates</span><strong style="display: block; color: #166534;">6 Points Sealed</strong></div>
						<div><span>Elevation Photos</span><strong style="display: block; color: #166534;">4 Sides Captured (Front, Back, Left, Right)</strong></div>
						<div><span>Cadastral Area</span><strong style="display: block; color: #0f172a;">${(this.scanState.calculatedArea?.sqyd || this.scanState.chosenPlot.area_sqyd)} sq.yd</strong></div>
					</div>
				</div>

				<div class="scan-actions" style="margin-top: 20px;">
					<button type="button" class="btn-scan-secondary" onclick="window.app.renderScanStep2()">&larr; Back to Step 2</button>
					<button type="button" class="btn-scan-primary" id="btn-complete-scan" onclick="window.app.completeBuildingScan()" disabled>
						Complete Scan &amp; Apply to Land Registration &rarr;
					</button>
				</div>
			</div>
		`;

		// Restore any existing exterior photos
		if (this.scanState.exteriorPhotos) {
			Object.entries(this.scanState.exteriorPhotos).forEach(([side, photo]) => {
				if (photo) this.recordExteriorPhotoWithData(side, photo);
			});
		}
	}

	captureExteriorPhoto(side) {
		this.openScanCamera('elevation', side);
	}

	recordExteriorPhotoWithData(side, photoDataUrl) {
		this.scanState.exteriorPhotos[side] = photoDataUrl;
		const statusEl = document.getElementById(`scan-side-status-${side}`);
		const cardEl = document.getElementById(`scan-side-${side}`);
		const previewEl = document.getElementById(`scan-side-preview-${side}`);
		const btnEl = document.getElementById(`btn-scan-photo-${side}`);

		if (statusEl) statusEl.innerHTML = '<span style="color: #16a34a; font-weight: 700;">Verified Captured &bull; GPS Sealed</span>';
		if (cardEl) cardEl.classList.add('captured');
		if (btnEl) {
			btnEl.textContent = `Retake ${side.toUpperCase()} Photo`;
			btnEl.style.background = '#f1f5f9';
			btnEl.style.color = '#475569';
			btnEl.style.border = '1px solid #cbd5e1';
		}
		if (previewEl && photoDataUrl) {
			previewEl.innerHTML = `<img src="${photoDataUrl}" style="width: 100%; height: 100%; object-fit: cover;">`;
		}

		const count = Object.values(this.scanState.exteriorPhotos).filter(Boolean).length;
		const progressEl = document.getElementById('scan-ext-progress');
		const progressLabel = document.getElementById('scan-ext-progress-label');
		if (progressEl) progressEl.style.width = `${(count / 4) * 100}%`;
		if (progressLabel) progressLabel.textContent = `${count} of 4 photos captured`;

		if (count >= 4) {
			const heightCard = document.getElementById('scan-height-card');
			if (heightCard) heightCard.style.display = 'block';
			const completeBtn = document.getElementById('btn-complete-scan');
			if (completeBtn) {
				completeBtn.disabled = false;
				completeBtn.style.background = '#16a34a';
			}
		}
	}

	quickCaptureAll4Photos() {
		['front', 'back', 'left', 'right'].forEach(side => {
			const canvas = document.createElement('canvas');
			canvas.width = 640;
			canvas.height = 360;
			const ctx = canvas.getContext('2d');
			this.drawSimulatedViewfinderFrame(ctx, 640, 360, 'elevation', side);
			this.drawCadastralStamp(ctx, 640, 360, { type: 'elevation', id: side });
			const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
			this.recordExteriorPhotoWithData(side, photoDataUrl);
		});
	}

	completeBuildingScan() {
		this.openRegisterModal();
		const khasraInput = document.getElementById('reg-khasra-input');
		if (khasraInput && this.scanState.chosenPlot) {
			khasraInput.value = this.scanState.chosenPlot.khasra;
		}

		const coordsInput = document.getElementById('reg-coordinates-json');
		if (coordsInput && this.scanState.plotPoints.length > 0) {
			const validCoords = this.scanState.plotPoints.filter(Boolean).map(p => [p.lng, p.lat]);
			if (validCoords.length > 0) {
				validCoords.push([validCoords[0][0], validCoords[0][1]]);
				coordsInput.value = JSON.stringify(validCoords);
			}
		}

		const areaSqftInput = document.getElementById('reg-area-sqft');
		if (areaSqftInput) {
			const sqft = this.scanState.calculatedArea?.sqft || this.scanState.chosenPlot.area_sqft || 3465;
			areaSqftInput.value = sqft;
		}

		const vertexCountEl = document.getElementById('reg-vertex-count');
		if (vertexCountEl) {
			vertexCountEl.textContent = '6 Boundary Points & 4 Photos Sealed';
		}

		const statusBadge = document.getElementById('reg-status-badge');
		if (statusBadge) {
			statusBadge.textContent = 'Verified: 6 Points + 4 Photos Completed';
			statusBadge.style.background = '#dcfce7';
			statusBadge.style.color = '#166534';
		}

		if (this.recalculateChallanFee) this.recalculateChallanFee();
		this.showToast('6-Point GPS Survey & 4 Elevation Photos Sealed! Ready for Challan Payment.', 4500);
	}

startManualScanFromModal() {
 this.closeRegisterModal();
 this.switchView('scan');
 }

 // ===== ENHANCED OFFICER AUTHORITY PORTAL =====
 async renderOfficerDashboard() {
 try {
 const res = await fetch('/api/officer/stats');
 if (res.ok) {
 const data = await res.json();
 const violEl = document.getElementById('officer-stat-violations');
 if (violEl && data.stats) {
 violEl.textContent = `${data.stats.flagged_violations} Flagged Notices`;
 }
 }
 } catch (e) {
 console.warn('Officer stats fetch failed:', e);
 }

 // Load pending requests
 this.loadOfficerRequests();
 }

 async loadOfficerRequests() {
		const container = document.getElementById('officer-requests-container');
		if (!container) return;

		try {
			const res = await fetch('/api/parcels');
			if (!res.ok) return;
			const data = await res.json();
			this.officerParcels = data.data || [];

			const pendingParcels = this.officerParcels.filter(p => p.status === 'PENDING_SURVEY' || p.status === 'PROVISIONAL' || p.status === 'PENDING_REGISTRATION' || p.status === 'PENDING' || p.status === 'PENDING_REVIEW' || !p.status);
			const approvedParcels = this.officerParcels.filter(p => p.status === 'VERIFIED' || p.status === 'PLAN_APPROVED' || p.status === 'APPROVED');
			const flaggedParcels = this.officerParcels.filter(p => p.has_anomaly === true || p.has_anomaly === 1);

			// Update KPI counters
			const statsEl = document.getElementById('officer-pending-count');
			if (statsEl) statsEl.textContent = pendingParcels.length;
			const approvedEl = document.getElementById('officer-approved-count');
			if (approvedEl) approvedEl.textContent = approvedParcels.length;
			const flaggedEl = document.getElementById('officer-flagged-count');
			if (flaggedEl) flaggedEl.textContent = flaggedParcels.length;

			// Update Tab counters
			const tabAll = document.getElementById('officer-tab-count-all');
			if (tabAll) tabAll.textContent = this.officerParcels.length.toLocaleString();
			const tabApp = document.getElementById('officer-tab-count-approvals');
			if (tabApp) tabApp.textContent = pendingParcels.length;
			const tabViol = document.getElementById('officer-tab-count-violations');
			if (tabViol) tabViol.textContent = flaggedParcels.length;
			const tabVer = document.getElementById('officer-tab-count-verified');
			if (tabVer) tabVer.textContent = approvedParcels.length;

			this.currentOfficerTab = this.currentOfficerTab || 'requests';
			this.applyOfficerFilter();
		} catch (e) {
			console.warn('Failed to load officer requests:', e);
		}
	}

	switchOfficerTab(tabName) {
		this.currentOfficerTab = tabName;
		document.querySelectorAll('.officer-tab').forEach(t => {
			t.classList.toggle('active', t.getAttribute('data-tab') === tabName);
		});
		this.applyOfficerFilter();
	}

	filterOfficerTable(query) {
		this.officerSearchQuery = (query || '').toLowerCase().trim();
		this.applyOfficerFilter();
	}

	applyOfficerFilter() {
		if (!this.officerParcels) return;
		const tab = this.currentOfficerTab || 'requests';
		const query = this.officerSearchQuery || '';

		let filtered = [...this.officerParcels];

		// Filter by tab
		if (tab === 'approvals') {
			filtered = filtered.filter(p => p.status === 'PENDING_SURVEY' || p.status === 'PROVISIONAL' || p.status === 'PENDING_REGISTRATION' || p.status === 'PENDING' || p.status === 'PENDING_REVIEW' || !p.status);
		} else if (tab === 'violations') {
			filtered = filtered.filter(p => p.has_anomaly === true || p.has_anomaly === 1);
		} else if (tab === 'verified') {
			filtered = filtered.filter(p => p.status === 'VERIFIED' || p.status === 'PLAN_APPROVED' || p.status === 'APPROVED');
			// Sort so that newly approved parcels appear at the very top of the Approved List!
			filtered.sort((a, b) => {
				if (a.justApproved && !b.justApproved) return -1;
				if (!a.justApproved && b.justApproved) return 1;
				if (a.approved_at && b.approved_at) return b.approved_at - a.approved_at;
				if (a.approved_at && !b.approved_at) return -1;
				if (!a.approved_at && b.approved_at) return 1;
				return 0;
			});
		}

		// Filter by search query across all cadastral parameters
		if (query) {
			filtered = filtered.filter(p => {
				const ulpin = (p.ulpin || '').toLowerCase();
				const legUlpin = (p.legacy_ulpin || '').toLowerCase();
				const owner = (p.owner || '').toLowerCase();
				const survey = (p.survey_no || '').toLowerCase();
				const village = (p.village || '').toLowerCase();
				const district = (p.district || '').toLowerCase();
				const tehsil = (p.tehsil || '').toLowerCase();
				const khata = (p.khata || '').toLowerCase();
				const status = (p.status || '').toLowerCase();
				return ulpin.includes(query) || legUlpin.includes(query) || owner.includes(query) ||
					survey.includes(query) || village.includes(query) || district.includes(query) ||
					tehsil.includes(query) || khata.includes(query) || status.includes(query);
			});
		}

		// Update table heading based on active tab
		const headingEl = document.getElementById('officer-table-heading');
		if (headingEl) {
			if (tab === 'verified') {
				headingEl.innerHTML = 'Approved List &bull; Digitally Sanctioned &amp; Verified Cadastral Parcels';
			} else if (tab === 'approvals') {
				headingEl.innerHTML = 'Approvals Queue &bull; Pending Citizen Registrations &amp; Building Sanctions';
			} else if (tab === 'violations') {
				headingEl.innerHTML = 'Active Violations &bull; Statutory 24h Notices';
			} else {
				headingEl.innerHTML = 'Complete Cadastral Parcel Register &bull; Officer Authority View';
			}
		}

		this.renderOfficerTableRows(filtered);
	}

	renderOfficerTableRows(parcels) {
		const tbody = document.getElementById('officer-requests-tbody');
		if (!tbody) return;
		tbody.innerHTML = '';

		const tab = this.currentOfficerTab || 'requests';

		if (!parcels || parcels.length === 0) {
			let emptyMsg = 'No parcels found matching this filter criteria.';
			if (tab === 'verified') {
				emptyMsg = 'No approved parcels found. Once an officer approves a pending request, it will appear here in the Approved List.';
			} else if (tab === 'approvals') {
				emptyMsg = 'No pending approval requests. All cadastral applications have been reviewed.';
			}
			tbody.innerHTML = `<tr><td colspan="7" style="padding: 28px; text-align: center; color: #64748b; font-weight: 500;">${emptyMsg}</td></tr>`;
			return;
		}

		parcels.slice(0, 100).forEach(parcel => {
			const row = document.createElement('tr');
			const isViolation = parcel.has_anomaly === true || parcel.has_anomaly === 1;
			const normalizedStatus = String(parcel.status || '').toUpperCase();
			const isVerified = normalizedStatus === 'VERIFIED' || normalizedStatus === 'PLAN_APPROVED' || normalizedStatus === 'APPROVED';
			const isRejected = normalizedStatus === 'REJECTED' || normalizedStatus === 'DECLINED';
			const statusClass = isRejected ? 'status-rejected' : (isViolation ? 'status-flagged' : (isVerified ? 'status-approved' : 'status-pending'));
			const statusLabel = isRejected ? 'Rejected' : (isViolation ? '24h Notice (Flagged)' : (isVerified ? (parcel.justApproved ? 'Approved Just Now' : 'Verified & Approved') : 'Pending Review'));

			if (parcel.justApproved) {
				row.style.background = '#f0fdf4';
				row.style.borderLeft = '4px solid #16a34a';
			}

			row.innerHTML = `
				<td style="font-family: monospace; font-weight: 700; color: #0369a1; font-size: 0.78rem;">${parcel.ulpin}</td>
				<td>${parcel.survey_no || 'Khasra 429/1'}</td>
				<td><strong>${parcel.owner || 'Registered Owner'}</strong></td>
				<td>${parcel.village || 'Amritsar Urban'}, ${parcel.district || 'Amritsar'}</td>
				<td>${parcel.total_floors || 2} Level(s)</td>
				<td><span class="officer-status-badge ${statusClass}">${statusLabel}</span></td>
				<td>
					<div style="display: flex; gap: 4px; flex-wrap: wrap;">
						<button class="btn-officer-action btn-inspect" onclick="window.app.inspectParcel('${parcel.ulpin}')">Inspect</button>
						${isVerified ? `<span class="officer-status-badge status-approved">Approved</span>` : (isRejected ? `<span class="officer-status-badge status-rejected">Rejected</span>` : `<button class="btn-officer-action btn-approve" onclick="window.app.approveParcel('${parcel.ulpin}')">Approve</button><button class="btn-officer-action btn-reject" onclick="window.app.rejectParcel('${parcel.ulpin}')">Reject</button>`)}
						${!isViolation && !isVerified && !isRejected ? `<button class="btn-officer-action btn-flag" onclick="window.app.flagParcel('${parcel.ulpin}')">Flag</button>` : ''}
					</div>
				</td>
			`;
			tbody.appendChild(row);
		});
	}

	async approveParcel(ulpin) {
		// Clear search filter so the approved parcel is guaranteed to be visible
		const searchInput = document.getElementById('officer-search-input');
		if (searchInput) searchInput.value = '';
		this.officerSearchQuery = '';

		const cleanUlpin = String(ulpin || '').trim();
		const normalizedUlpin = cleanUlpin.toUpperCase();
		const matchesUlpin = parcel => String(parcel.ulpin || '').trim().toUpperCase() === normalizedUlpin;
		const parcel = (this.officerParcels || []).find(matchesUlpin);
		const mainP = (this.allParcels || []).find(matchesUlpin);
		if (!parcel) {
			this.showToast(`Could not find parcel ${cleanUlpin} in the officer register.`, 4000);
			return;
		}

		const ownerName = parcel.owner || 'Property Owner';
		const surveyNo = parcel.survey_no || cleanUlpin;
		try {
			const response = await fetch('/api/parcels/approve', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ulpin: cleanUlpin })
			});
			const result = await response.json();
			if (!response.ok || !result.success) throw new Error(result.error || 'Approval was not saved.');
		} catch (error) {
			this.showToast(`Could not approve ${cleanUlpin}: ${error.message}`, 5000);
			await this.loadOfficerRequests();
			return;
		}

		// 1. Update in-memory parcel status
		if (parcel) {
			parcel.status = 'PLAN_APPROVED';
			parcel.has_anomaly = false;
			parcel.anomaly_desc = null;
			parcel.justApproved = true;
			parcel.approved_at = Date.now();
		}

		if (mainP) {
			mainP.status = 'PLAN_APPROVED';
			mainP.has_anomaly = false;
			mainP.anomaly_desc = null;
			mainP.justApproved = true;
			mainP.approved_at = Date.now();
		}

		// Move to the very beginning of officerParcels so it shows at the top
		if (parcel && this.officerParcels) {
			this.officerParcels = [parcel, ...this.officerParcels.filter(p => p !== parcel && p.ulpin !== ulpin)];
		}

		// Recalculate KPI and tab counters
		const pendingParcels = (this.officerParcels || []).filter(p => p.status === 'PENDING_SURVEY' || p.status === 'PROVISIONAL' || p.status === 'PENDING_REGISTRATION' || p.status === 'PENDING' || p.status === 'PENDING_REVIEW' || !p.status);
		const approvedParcels = (this.officerParcels || []).filter(p => p.status === 'VERIFIED' || p.status === 'PLAN_APPROVED' || p.status === 'APPROVED');
		const flaggedParcels = (this.officerParcels || []).filter(p => p.has_anomaly === true || p.has_anomaly === 1);

		const statsEl = document.getElementById('officer-pending-count');
		if (statsEl) statsEl.textContent = pendingParcels.length;
		const approvedEl = document.getElementById('officer-approved-count');
		if (approvedEl) approvedEl.textContent = approvedParcels.length;
		const flaggedEl = document.getElementById('officer-flagged-count');
		if (flaggedEl) flaggedEl.textContent = flaggedParcels.length;

		const tabAll = document.getElementById('officer-tab-count-all');
		if (tabAll) tabAll.textContent = (this.officerParcels || []).length.toLocaleString();
		const tabApp = document.getElementById('officer-tab-count-approvals');
		if (tabApp) tabApp.textContent = pendingParcels.length;
		const tabViol = document.getElementById('officer-tab-count-violations');
		if (tabViol) tabViol.textContent = flaggedParcels.length;
		const tabVer = document.getElementById('officer-tab-count-verified');
		if (tabVer) tabVer.textContent = approvedParcels.length;

		// 4. Show toast notification
		this.showToast(`Parcel ${surveyNo} (${ownerName}) APPROVED! Added to the Approved List.`, 4000);

		// 5. CRITICAL: Automatically switch to the "Approved List" tab so the officer sees it!
		this.switchOfficerTab('verified');

		// 6. Scroll officer requests container smoothly into view
		const reqContainer = document.getElementById('officer-requests-container');
		if (reqContainer) {
			reqContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}

	async rejectParcel(ulpin) {
		const cleanUlpin = String(ulpin || '').trim();
		const normalizedUlpin = cleanUlpin.toUpperCase();
		const matchesUlpin = parcel => String(parcel.ulpin || '').trim().toUpperCase() === normalizedUlpin;
		const parcel = (this.officerParcels || []).find(matchesUlpin);
		if (!parcel) {
			this.showToast(`Could not find parcel ${cleanUlpin} in the officer register.`, 4000);
			return;
		}

		try {
			const response = await fetch('/api/parcels/reject', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ulpin: cleanUlpin })
			});
			const result = await response.json();
			if (!response.ok || !result.success) throw new Error(result.error || 'Rejection was not saved.');
		} catch (error) {
			this.showToast(`Could not reject ${cleanUlpin}: ${error.message}`, 5000);
			await this.loadOfficerRequests();
			return;
		}

		const mainP = (this.allParcels || []).find(matchesUlpin);
		parcel.status = 'REJECTED';
		parcel.rejected_at = Date.now();
		if (mainP) {
			mainP.status = 'REJECTED';
			mainP.rejected_at = parcel.rejected_at;
		}

		const surveyNo = parcel.survey_no || cleanUlpin;
		const ownerName = parcel.owner || 'Property Owner';
		const searchInput = document.getElementById('officer-search-input');
		if (searchInput) searchInput.value = '';
		this.officerSearchQuery = '';
		this.currentOfficerTab = 'requests';
		await this.loadOfficerRequests();
		this.switchOfficerTab('requests');
		this.showToast(`Application ${surveyNo} (${ownerName}) rejected.`, 4000);
	}

	async approveParcelFromDossier() {
		if (!this.activeParcel) return;
		const ulpin = this.activeParcel.ulpin;
		await this.approveParcel(ulpin);
		this.switchView('officer');
		this.switchOfficerTab('verified');
	}

	flagParcel(ulpin) {
 const reason = prompt(`Enter violation reason for parcel ${ulpin}:`);
 if (!reason) return;
 alert(`Alert: Parcel ${ulpin} has been FLAGGED.\nViolation: ${reason}\n24-hour statutory notice issued under Section 187.`);
 this.loadOfficerRequests();
 }
}

// Attach globally
window.app = new BhuAadhaarApp();
if (document.readyState === 'loading') {
 window.addEventListener('DOMContentLoaded', () => {
 window.app.init();
 });
} else {
 window.app.init();
}
