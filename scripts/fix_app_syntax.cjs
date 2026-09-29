const fs = require('fs');

let code = fs.readFileSync('src/app.js', 'utf8');

// Fix 1: expandFullHeader orphaned code
const oldExpandBlock = `\texpandFullHeader() {
\t\t// Permanently disabled
\t\treturn;
\t}
\tif (compactBar) {
\t\tcompactBar.style.display = 'none';
\t}
\tsetTimeout(() => {
\t\tif (this.map2d) this.map2d.invalidateSize();
\t\tif (this.twin3d) this.twin3d.onResize();
\t}, 360);
\t}`;

const newExpandBlock = `\texpandFullHeader() {
\t\t// Permanently disabled
\t\treturn;
\t}`;

if (code.includes(oldExpandBlock)) {
  code = code.replace(oldExpandBlock, newExpandBlock);
  console.log('✓ Fixed expandFullHeader orphaned block');
} else {
  // Try with spaces or regex
  code = code.replace(/expandFullHeader\(\)\s*\{[\s\S]*?\}\s*if\s*\(compactBar\)[\s\S]*?\}, 360\);\s*\}/,
    `expandFullHeader() {\n    // Permanently disabled\n    return;\n  }`);
  console.log('✓ Applied regex fix for expandFullHeader');
}

// Fix 2: closeLoginModal double closing brace
code = code.replace(/closeLoginModal\(\)\s*\{[\s\S]*?\}\s*\}\s*\}\s*initHeroCarousel\(\)/,
`closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active');
    }
  }

  initHeroCarousel()`);

fs.writeFileSync('src/app.js', code, 'utf8');
console.log('✓ Saved src/app.js');
