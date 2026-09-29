const fs = require('fs');
const html = fs.readFileSync('d:/BHAVANINFO/index.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('id="view-') || l.includes('class="view-panel')) {
    console.log(`${i + 1}: ${l.trim()}`);
  }
});
