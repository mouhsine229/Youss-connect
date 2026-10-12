# -*- coding: utf-8 -*-
import pathlib, re
ui = pathlib.Path("_miss_ui.txt").read_text(encoding="utf-8").splitlines()
data = pathlib.Path("_miss_data.txt").read_text(encoding="utf-8").split("\n---\n")
raw = [s.strip() for s in ui + data if s.strip()]
bad = re.compile(r"const |return |function |classList|UI\.toast|Math\.|</|window\.|this\.|=>|\{|\}|onclick|I18N\.|document\.")
out = []
seen = set()
for s in raw:
    if s in seen:
        continue
    if bad.search(s):
        continue
    if len(s) < 3:
        continue
    if s.count(" ") == 0 and len(s) < 4:
        continue
    seen.add(s)
    out.append(s)
pathlib.Path("_to_translate.txt").write_text("\n".join(out), encoding="utf-8")
print(len(out))
