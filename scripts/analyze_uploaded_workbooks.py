from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET
from collections import Counter
import json
import re
import sys

NS = {"main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main", "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships", "pkg": "http://schemas.openxmlformats.org/package/2006/relationships"}

def parse(path):
    with ZipFile(path) as z:
        shared=[]
        if "xl/sharedStrings.xml" in z.namelist():
            root=ET.fromstring(z.read("xl/sharedStrings.xml"))
            for item in root.findall("main:si",NS): shared.append("".join(t.text or "" for t in item.findall(".//main:t",NS)))
        wb=ET.fromstring(z.read("xl/workbook.xml")); rels=ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        relmap={r.attrib["Id"]:r.attrib["Target"] for r in rels.findall("pkg:Relationship",NS)}
        sheets=[]
        for sheet in wb.findall("main:sheets/main:sheet",NS):
            target=relmap[sheet.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]]
            target=target if target.startswith("xl/") else "xl/"+target.lstrip("/")
            root=ET.fromstring(z.read(target)); rows=[]
            for row in root.findall(".//main:sheetData/main:row",NS):
                values={}
                for cell in row.findall("main:c",NS):
                    v=cell.find("main:v",NS); inline=cell.find("main:is/main:t",NS)
                    raw=(v.text if v is not None else (inline.text if inline is not None else "")) or ""
                    if cell.attrib.get("t")=="s" and raw: raw=shared[int(raw)]
                    values[cell.attrib.get("r","")]=raw.strip()
                if values: rows.append(values)
            sheets.append((sheet.attrib.get("name"),rows))
        return sheets

def col_letter(ref): return re.match(r"[A-Z]+",ref).group(0) if ref else ""

def normalize(value): return re.sub(r"\s+"," ",(value or "")).strip()

out=[]
for raw in sys.argv[1:]:
    path=Path(raw); sheets=parse(path); file_out={"file":path.name,"sheets":[]}
    for name,rows in sheets:
        if not rows: continue
        headers={col_letter(k):normalize(v) for k,v in rows[0].items()}
        data=[]
        for row in rows[1:]:
            record={headers.get(col_letter(col),col_letter(col)):normalize(value) for col,value in row.items() if headers.get(col_letter(col),col_letter(col))}
            if any(record.values()): data.append(record)
        summary={"name":name,"headers":list(headers.values()),"rows":len(data)}
        if name=="ورقة1":
            summary["traineesByPath"]={k:v for k,v in Counter(r.get("مسار المحكمة","") for r in data).most_common()}
            summary["traineesByMode"]={k:v for k,v in Counter(r.get("حضوري او عن بعد","") for r in data).most_common()}
            summary["missingEmail"]=sum(not r.get("البريد الالكتروني") for r in data)
            summary["missingNationalId"]=sum(not r.get("رقم الهوية") for r in data)
            summary["duplicateEmails"]=[k for k,v in Counter(r.get("البريد الالكتروني","").lower() for r in data if r.get("البريد الالكتروني")).items() if v>1]
        if name=="الكل":
            summary["employeesByDepartment"]={k:v for k,v in Counter(r.get("القسم/الإدارة","") for r in data).most_common()}
            summary["employeesByStatus"]={k:v for k,v in Counter(r.get("حالة الموظف","") for r in data).most_common()}
            summary["missingEmail"]=sum(not r.get("البريد الرسمي") for r in data)
            summary["missingCivilId"]=sum(not r.get("السجل المدني") for r in data)
            summary["duplicateEmails"]=[k for k,v in Counter(r.get("البريد الرسمي","").lower() for r in data if r.get("البريد الرسمي")).items() if v>1]
        file_out["sheets"].append(summary)
    out.append(file_out)
print(json.dumps(out,ensure_ascii=False,indent=2))
