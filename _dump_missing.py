# -*- coding: utf-8 -*-
import json, pathlib
items = json.loads(pathlib.Path("_missing.json").read_text(encoding="utf-8"))
ui, data = [], []
for o in items:
    if o["files"] == ["data.js"] or (len(o["files"]) == 1 and o["files"][0] == "data.js"):
        data.append(o["s"])
    elif "data.js" in o["files"] and len(o["files"]) == 1:
        data.append(o["s"])
    else:
        # if only data, data; else ui (even if also in data)
        if set(o["files"]) <= {"data.js"}:
            data.append(o["s"])
        else:
            ui.append(o["s"])
pathlib.Path("_miss_ui.txt").write_text("\n".join(ui), encoding="utf-8")
pathlib.Path("_miss_data.txt").write_text("\n---\n".join(data), encoding="utf-8")
print("ui", len(ui), "data", len(data))
