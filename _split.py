# -*- coding: utf-8 -*-
import pathlib
lines = pathlib.Path("_to_translate.txt").read_text(encoding="utf-8").splitlines()
n = 3
size = (len(lines) + n - 1) // n
for i in range(n):
    chunk = lines[i * size:(i + 1) * size]
    pathlib.Path("_tr_%d.txt" % i).write_text("\n".join(chunk), encoding="utf-8")
    print(i, len(chunk))
