const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// Map of specific emoji string replacements to maintain good readability and UX
const textReplacements = [
  { from: '🖱️', to: '' },
  { from: '📜', to: '' },
  { from: '📷', to: '' },
  { from: '📸', to: '' },
  { from: '🏷️', to: '' },
  { from: '💳', to: '' },
  { from: '🗓️', to: '' },
  { from: '🖨️', to: '' },
  { from: '📦', to: '' },
  { from: '⚠️', to: 'Notice:' },
  { from: '📱', to: 'SMS Gateway:' },
  { from: '📨', to: 'UIDAI Gateway:' },
  { from: '🟢', to: 'Active:' },
  { from: '⚡', to: '' },
  { from: '✅', to: 'Verified' },
  { from: '❌', to: 'Cancel' },
  { from: '🚨', to: 'Alert:' },
  { from: '⏳', to: 'Pending' },
  { from: '🏢', to: 'Building' },
  { from: '🏠', to: 'Single-Storey' },
  { from: '💰', to: 'Tax Compliant' },
  { from: '🔍', to: '' },
  { from: '📍', to: '' },
  { from: '🎯', to: '' },
  { from: '🌆', to: '' },
  { from: '🏛️', to: '' },
  { from: '📋', to: '' },
  { from: '🌐', to: '' },
  { from: '🗺️', to: '2D' },
  { from: '🧭', to: '3D' },
  { from: '✏️', to: 'Draw' },
  { from: '🚩', to: 'Monument' },
  { from: '🚀', to: '' },
  { from: '💧', to: 'Water' },
  { from: '📶', to: 'Telecom' },
  { from: '🕳️', to: 'Manhole' },
  { from: '🚽', to: 'Sewer' },
  { from: '⛽', to: 'Gas' },
  { from: '🏗️', to: 'Foundation' },
  { from: '🔑', to: '' },
  { from: '🤖', to: '' },
  { from: '📐', to: '' },
  { from: '📊', to: '' },
  { from: '⚖️', to: '' },
  { from: '🛸', to: '' },
  { from: '🔒', to: '' },
  { from: '🏘️', to: '' },
  { from: '👁️', to: '' },
  { from: '📁', to: '' },
  { from: '📄', to: '' },
  { from: '🆔', to: '' },
  { from: '🔄', to: '' },
  { from: '✨', to: '' },
  { from: '💡', to: '' }
];

const filesToClean = [
  'index.html',
  'src/app.js',
  'src/map2d.js',
  'src/twin3d.js'
];

filesToClean.forEach(rel => {
  const filePath = path.join(root, rel);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const beforeLen = content.length;

  textReplacements.forEach(({ from, to }) => {
    content = content.split(from).join(to);
  });

  // Regex to catch any lingering Unicode emojis
  const anyEmojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu;
  content = content.replace(anyEmojiRegex, '');

  // Clean up double spaces created by emoji stripping
  content = content.replace(/  +/g, ' ');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Processed ${rel}: ${beforeLen} -> ${content.length} bytes`);
});
