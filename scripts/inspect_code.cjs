const fs = require('fs');
const term = process.argv[2] || 'login-modal';
const file = process.argv[3] || 'index.html';
const content = fs.readFileSync(file, 'utf8');
const idx = content.indexOf(term);
if (idx !== -1) {
  console.log(`Found "${term}" at index ${idx}:`);
  console.log(content.substring(Math.max(0, idx - 100), Math.min(content.length, idx + 1000)));
} else {
  console.log(`Term "${term}" not found in ${file}`);
}
