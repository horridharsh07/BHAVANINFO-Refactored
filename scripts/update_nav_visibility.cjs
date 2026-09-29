const fs = require('fs');
let appJs = fs.readFileSync('src/app.js', 'utf8');
const lines = appJs.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("govNav.style.display = 'flex';")) {
    lines[i] = "\t\tgovNav.style.display = (viewName === 'landing') ? 'none' : 'flex';";
    console.log(`Updated line ${i + 1}`);
  }
}

fs.writeFileSync('src/app.js', lines.join('\n'), 'utf8');
