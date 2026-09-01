from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET
import json
import re
import sys

NS={"main":"http://schemas.openxmlformats.org/spreadsheetml/2006/main","pkg":"http://schemas.openxmlformats.org/package/2006/relationships"}

def norm(v): return re.sub(r"\s+"," ",str(v or "")).strip()
def col(ref): return re.match(r"[A-Z]+",ref).group(0)

def parse(path):
    with ZipFile(path) as z:
        shared=[]
        if "xl/sharedStrings.xml" in z.namelist():
            root=ET.fromstring(z.read("xl/sharedStrings.xml"))
            for item in root.findall("main:si",NS): shared.append("".join(t.text or "" for t in item.findall(".//main:t",NS)))
        wb=ET.fromstring(z.read("xl/workbook.xml")); rels=ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        relmap={r.attrib["Id"]:r.attrib["Target"] for r in rels.findall("pkg:Relationship",NS)}
        for sheet in wb.findall("main:sheets/main:sheet",NS):
            target=relmap[sheet.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]]
            target=target if target.startswith("xl/") else "xl/"+target.lstrip("/")
            if sheet.attrib.get("name") not in ("ورقة1","الكل"): continue
            root=ET.fromstring(z.read(target)); rows=[]
            for row in root.findall(".//main:sheetData/main:row",NS):
                values={}
                for cell in row.findall("main:c",NS):
                    v=cell.find("main:v",NS); inline=cell.find("main:is/main:t",NS)
                    raw=(v.text if v is not None else (inline.text if inline is not None else "")) or ""
                    if cell.attrib.get("t")=="s" and raw: raw=shared[int(raw)]
                    values[col(cell.attrib.get("r",""))]=norm(raw)
                if values: rows.append(values)
            headers=rows[0]
            records=[]
            for row in rows[1:]: records.append({headers.get(k,k):v for k,v in row.items() if headers.get(k,k)})
            yield sheet.attrib.get("name"), records

trainee_file, employee_file=sys.argv[1:]
out={"sourceFiles":{"trainees":Path(trainee_file).name,"employees":Path(employee_file).name},"trainees":[],"employees":[]}
for name, records in parse(trainee_file):
    if name=="ورقة1":
        for r in records:
            if r.get("اسم الملازم"):
                out["trainees"].append({"fullName":r.get("اسم الملازم"),"nationalId":r.get("رقم الهوية"),"email":r.get("البريد الالكتروني"),"phone":r.get("رقم جوال الملازم"),"formation":r.get("التشكيل"),"trainingJudge":r.get("القاضي المدرب"),"formationDate":r.get("تاريخ التشكيل في الدائرة"),"appointmentDate":r.get("تاريخ التعيين"),"courtStartDate":r.get("تاريخ المباشرة في المحكمة"),"courtTrack":r.get("مسار المحكمة"),"attendanceMode":r.get("حضوري او عن بعد"),"duration":r.get("مدة الملازمة"),"notes":r.get("ملاحظات")})
for name, records in parse(employee_file):
    if name=="الكل":
        for r in records:
            if r.get("الاسم"):
                out["employees"].append({"fullName":r.get("الاسم"),"nationalId":r.get("السجل المدني"),"email":r.get("البريد الرسمي"),"rank":r.get("المرتبة"),"jobTitle":r.get("المسمى الوظيفي بالنظام"),"employeeNumber":r.get("رقم الوظيفة"),"department":r.get("القسم/الإدارة"),"phone":r.get("رقم التواصل"),"status":r.get("حالة الموظف"),"assignmentNote":r.get("في حالة معار-منقول-مكلف"),"discipline":r.get("الإنذارات/العقوبات"),"notes":r.get("ملاحظات")})
print(json.dumps(out,ensure_ascii=False,indent=2))
