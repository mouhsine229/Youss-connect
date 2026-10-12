# -*- coding: utf-8 -*-
import pathlib, re
root = pathlib.Path("js")
pat = re.compile(r'"((?:[^"\\]|\\.){2,})"')
fr = {}
for f in root.rglob("*.js"):
    if f.name in ("en.js", "i18n.js"):
        continue
    text = f.read_text(encoding="utf-8")
    for m in pat.finditer(text):
        s = m.group(1)
        if re.search(r"[àâäéèêëïîôùûüçÀÂÉÈÊËÎÏÔÙÛÜÇœŒ]", s) or re.search(
            r"\b(le|la|les|des|un|une|pour|avec|votre|vous|est|sont|dans|sur|pas|plus|cette|cet)\b",
            s, re.I):
            fr.setdefault(s, set()).add(str(f).replace("\\", "/"))
out = ["COUNT " + str(len(fr))]
longs = 0
for s in sorted(fr, key=len):
    if len(s) > 220:
        longs += 1
        continue
    out.append("---")
    out.append(s)
out.append("LONGS " + str(longs))
pathlib.Path("_fr_out.txt").write_text("\n".join(out), encoding="utf-8")
print("wrote", len(out), "longs", longs)
