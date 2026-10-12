# -*- coding: utf-8 -*-
import pathlib, re, json
text = pathlib.Path("js/data.js").read_text(encoding="utf-8")
keys = {"tagline","intro","body","desc","history","importance","visit","tips","text","label","cat","group","subtitle","note","blurb","about"}
# also practical values are not those keys as simple. capture "key": "value"
pat = re.compile(r'(?:tagline|intro|body|desc|history|importance|visit|tips|text|label|cat|group|subtitle|note|blurb|about|langue|monnaie|periode|transport|name|title|place|area|kind|type)\s*:\s*"((?:[^"\\]|\\.)*)"')
vals = []
seen = set()
for m in pat.finditer(text):
    s = m.group(1)
    if s in seen:
        continue
    seen.add(s)
    vals.append(s)
pathlib.Path("_fields.json").write_text(json.dumps(vals, ensure_ascii=False, indent=1), encoding="utf-8")
print(len(vals))
