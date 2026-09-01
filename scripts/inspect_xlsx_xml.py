from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET
import json
import sys

NS = {"main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main", "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships", "pkg": "http://schemas.openxmlformats.org/package/2006/relationships"}

def text_value(cell, shared):
    value = cell.find("main:v", NS)
    if value is None:
        inline = cell.find("main:is/main:t", NS)
        return inline.text if inline is not None else ""
    raw = value.text or ""
    if cell.attrib.get("t") == "s":
        index = int(raw)
        return shared[index] if index < len(shared) else raw
    return raw

def inspect(path):
    with ZipFile(path) as z:
        shared = []
        if "xl/sharedStrings.xml" in z.namelist():
            root = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for item in root.findall("main:si", NS):
                shared.append("".join(t.text or "" for t in item.findall(".//main:t", NS)))
        wb = ET.fromstring(z.read("xl/workbook.xml"))
        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        rel_map = {r.attrib["Id"]: r.attrib["Target"] for r in rels.findall("pkg:Relationship", NS)}
        sheets = []
        for sheet in wb.findall("main:sheets/main:sheet", NS):
            target = rel_map[sheet.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]]
            target = target if target.startswith("xl/") else "xl/" + target.lstrip("/")
            root = ET.fromstring(z.read(target))
            rows = []
            for row in root.findall(".//main:sheetData/main:row", NS):
                values = []
                for cell in row.findall("main:c", NS):
                    values.append({"ref": cell.attrib.get("r"), "value": text_value(cell, shared)})
                if any(item["value"] for item in values):
                    rows.append(values)
                if len(rows) >= 12:
                    break
            sheets.append({"name": sheet.attrib.get("name"), "target": target, "sample_rows": rows})
        return {"file": path.name, "sheets": sheets}

print(json.dumps([inspect(Path(p)) for p in sys.argv[1:]], ensure_ascii=False, indent=2))
