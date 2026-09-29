const fs = require('fs');

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;

['index.html', 'src/app.js', 'src/map2d.js', 'src/twin3d.js'].forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  const found = [];
  lines.forEach((l, i) => {
    if (emojiRegex.test(l)) {
      found.push(`${i + 1}: ${l.trim()}`);
    }
  });
  console.log(`=== ${file} (Found ${found.length} lines with emojis) ===`);
  found.slice(0, 30).forEach(line => console.log(line));
  if (found.length > 30) console.log(`... and ${found.length - 30} more`);
});
