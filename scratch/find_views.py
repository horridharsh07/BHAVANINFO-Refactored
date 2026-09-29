import re

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if any(k in line.lower() for k in ['modal-content', 'modal-header', 'view-container', '<nav', '<footer', 'drawer-header', 'bhavaninfo-logo']):
        print(f"L{idx+1}: {line.strip()[:100]}")
