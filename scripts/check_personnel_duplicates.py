import json
from collections import defaultdict
import sys
p=json.load(open(sys.argv[1]))
for kind,key in [("employees","email"),("employees","nationalId"),("trainees","email"),("trainees","nationalId")]:
    groups=defaultdict(list)
    for row in p[kind]:
        if row.get(key): groups[row[key].lower() if key=="email" else row[key]].append(row["fullName"])
    dup={k:v for k,v in groups.items() if len(v)>1}
    print(json.dumps({"kind":kind,"key":key,"duplicates":dup},ensure_ascii=False,indent=2))
