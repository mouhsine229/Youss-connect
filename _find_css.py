import pathlib
for p in [pathlib.Path("css/app.css"), pathlib.Path("src/styles.css")]:
    t = p.read_text(encoding="utf-8")
    i = t.find("icon-btn")
    print(p, i)
    if i >= 0:
        print(t[i:i+400])
        print("---")
