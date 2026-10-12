# -*- coding: utf-8 -*-
"""Extract user-facing French strings missing from en.js EXACT."""
import pathlib, re, json

en = pathlib.Path("js/en.js").read_text(encoding="utf-8")
# keys of EXACT: "french": "english"
exact = set(re.findall(r'"((?:[^"\\]|\\.)*)"\s*:', en))

pat = re.compile(r'"((?:[^"\\]|\\.)*)"')
skip_files = {"en.js", "i18n.js"}
found = {}
for f in pathlib.Path("js").rglob("*.js"):
    if f.name in skip_files:
        continue
    text = f.read_text(encoding="utf-8")
    for m in pat.finditer(text):
        s = m.group(1)
        if s in exact:
            continue
        if len(s) < 3:
            continue
        # skip obvious code
        if re.search(r"[{}$]|function |=>|onclick|App\.|Screens\.|class=|text-\[|#[0-9a-fA-F]{3}|^\./|^\.\./|^https?://|^[a-z0-9_./-]+\.(jpg|png|js|css)$", s):
            continue
        if re.match(r"^[a-z0-9_./:-]+$", s):
            continue
        # keep if accent OR space with a letter
        if not re.search(r"[A-Za-zÀ-ÿ]", s):
            continue
        french = bool(re.search(r"[àâäéèêëïîôùûüçÀÂÉÈÊËÎÏÔÙÛÜÇœŒ]", s)) or bool(re.search(
            r"\b(le|la|les|des|un|une|du|de|pour|avec|votre|vous|est|sont|dans|sur|pas|cette|cet|qui|que|au|aux|en|et|ou|à)\b",
            s, re.I))
        if not french:
            continue
        found.setdefault(s, []).append(f.name)

# prefer data and screens
items = sorted(found.items(), key=lambda kv: (-max(len(x) for x in [kv[0]]), kv[0]))
out = []
for s, files in sorted(found.items(), key=lambda kv: kv[0].lower()):
    out.append({"s": s, "files": sorted(set(files))[:4]})
pathlib.Path("_missing.json").write_text(json.dumps(out, ensure_ascii=False, indent=0), encoding="utf-8")
from collections import Counter
c = Counter()
for o in out:
    for f in o["files"]:
        c[f] += 1
print("missing", len(out))
print(c.most_common(30))
lens = [len(o["s"]) for o in out]
print("short<40", sum(1 for n in lens if n < 40), "mid", sum(1 for n in lens if 40 <= n < 120), "long", sum(1 for n in lens if n >= 120))
