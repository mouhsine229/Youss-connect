# -*- coding: utf-8 -*-
import pathlib, re
src = pathlib.Path("_tr_2.txt").read_text(encoding="utf-8").splitlines()
js = pathlib.Path("js/en-extra-2.js").read_text(encoding="utf-8")
keys = set(re.findall(r'^\s+"((?:[^"\\]|\\.)*)"\s*:', js, re.M))
missing = [s for s in src if s not in keys]
extra = []
print("src", len(src), "keys", len(keys), "missing", len(missing))
pathlib.Path("_missing_pack2.txt").write_text("\n".join(missing), encoding="utf-8")
for s in missing:
    print("MISS", s[:140])
