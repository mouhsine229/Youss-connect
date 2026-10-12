# -*- coding: utf-8 -*-
import pathlib, re
text = pathlib.Path("js/data.js").read_text(encoding="utf-8")
print("chars", len(text), "lines", text.count("\n")+1)
# keys that look like content
keys = re.findall(r"\b(body|history|importance|visit|blurb|desc|description|about|tagline|subtitle|note|tips|info)\s*:", text)
from collections import Counter
print(Counter(keys))
# sample object keys
print("top keys", Counter(re.findall(r"^\s{2,6}(\w+)\s*:", text, re.M)).most_common(40))
