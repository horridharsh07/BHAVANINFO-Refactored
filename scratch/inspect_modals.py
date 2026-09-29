with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx in [1648, 1741, 1851, 1904, 1966, 2164, 2397]:
    start = max(0, idx - 10)
    end = min(len(lines), idx + 10)
    print(f"=== Around line {idx} ===")
    for i in range(start, end):
        if 'id=' in lines[i] or 'class=' in lines[i] or '<h' in lines[i]:
            print(f"  {i+1}: {lines[i].strip()[:90]}")
