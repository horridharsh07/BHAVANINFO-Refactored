const fs = require('fs');

console.log('Restoring renderScanStep3 and quickCaptureAll4Photos in src/app.js...');
let appJs = fs.readFileSync('src/app.js', 'utf8');

const target = 'captureExteriorPhoto(side) {';
if (!appJs.includes(target)) {
  console.error('Target captureExteriorPhoto not found');
  process.exit(1);
}

const addition = `quickCaptureAll4Photos() {
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

		container.innerHTML = \`
			<div class="scan-phase-card">
				<div class="scan-phase-header">
					<div class="scan-phase-badge phase2">STEP 3 OF 3</div>
					<h2 class="scan-phase-title">Front, Back, Left, Right Photos Scan</h2>
					<p class="scan-phase-desc">Open camera and capture the 4 elevation reference photos for <strong>\${this.scanState.chosenPlot.khasra}</strong>. Each photo will be stamped and sealed with the 6-point cadastral survey:</p>
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
					\${sides.map(s => \`
						<div class="scan-side-card" id="scan-side-\${s.key}">
							<h4>\${s.label}</h4>
							<div class="scan-side-preview" id="scan-side-preview-\${s.key}" style="height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #e2e8f0; border-radius: 6px; overflow: hidden; margin-bottom: 8px;">
								<div style="font-size: 0.74rem; color: #64748b; padding: 10px;">\${s.desc}</div>
							</div>
							<div class="scan-side-status" id="scan-side-status-\${s.key}" style="margin-bottom: 8px;">
								<span style="font-size: 0.72rem; color: #94a3b8;">Pending Photo</span>
							</div>
							<button type="button" class="btn-scan-capture" id="btn-scan-photo-\${s.key}" onclick="window.app.captureExteriorPhoto('\${s.key}')">
								Open Camera &amp; Capture \${s.label.split(' ')[0]}
							</button>
						</div>
					\`).join('')}
				</div>

				<div class="scan-height-card" id="scan-height-card" style="display: none; margin-top: 14px; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 10px; padding: 14px;">
					<h4 style="color: #166534; margin: 0 0 10px 0; font-size: 0.92rem;">Cadastral Digital Twin Verification Package Sealed</h4>
					<div class="scan-height-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; font-size: 0.8rem;">
						<div><span>Plot / Khasra</span><strong style="display: block; color: #0284c7;">\${this.scanState.chosenPlot.khasra}</strong></div>
						<div><span>Boundary Coordinates</span><strong style="display: block; color: #166534;">6 Points Sealed</strong></div>
						<div><span>Elevation Photos</span><strong style="display: block; color: #166534;">4 Sides Captured (Front, Back, Left, Right)</strong></div>
						<div><span>Cadastral Area</span><strong style="display: block; color: #0f172a;">\${(this.scanState.calculatedArea?.sqyd || this.scanState.chosenPlot.area_sqyd)} sq.yd</strong></div>
					</div>
				</div>

				<div class="scan-actions" style="margin-top: 20px;">
					<button type="button" class="btn-scan-secondary" onclick="window.app.renderScanStep2()">&larr; Back to Step 2</button>
					<button type="button" class="btn-scan-primary" id="btn-complete-scan" onclick="window.app.completeBuildingScan()" disabled>
						Complete Scan &amp; Apply to Land Registration &rarr;
					</button>
				</div>
			</div>
		\`;

		// Restore any existing exterior photos
		if (this.scanState.exteriorPhotos) {
			Object.entries(this.scanState.exteriorPhotos).forEach(([side, photo]) => {
				if (photo) this.recordExteriorPhotoWithData(side, photo);
			});
		}
	}

	`;

appJs = appJs.replace(target, addition + target);
fs.writeFileSync('src/app.js', appJs, 'utf8');
console.log('✅ Added Step 3 methods to src/app.js');
