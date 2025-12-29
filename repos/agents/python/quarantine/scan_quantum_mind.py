import os
import json
import re

ROOT = "."
patterns = [
    r"quantum mind",
    r"QuantumMind",
    r"quantum",
    r"mind",
    r"QMind"
]

report = []

for subdir, _, files in os.walk(ROOT):
    for fname in files:
        path = os.path.join(subdir, fname)
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                lines = f.readlines()
        except:
            continue

        for pattern in patterns:
            regex = re.compile(pattern, re.IGNORECASE)
            for i, line in enumerate(lines):
                if regex.search(line):
                    context_start = max(0, i-5)
                    context_end   = min(len(lines), i+5)
                    snippet = "".join(lines[context_start:context_end])

                    report.append({
                        "file": path,
                        "pattern": pattern,
                        "line_number": i+1,
                        "snippet": snippet
                    })

with open("quantum_mind_full_report.json", "w", encoding="utf-8") as out:
    json.dump(report, out, indent=2)

print("Scan complete — output: quantum_mind_full_report.json")
