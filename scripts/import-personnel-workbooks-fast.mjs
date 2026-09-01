import fs from "node:fs/promises";
import mysql from "mysql2/promise";
const payload = JSON.parse(await fs.readFile(process.argv[2] ?? "/tmp/rakiza_personnel_records.json", "utf8"));
const db = await mysql.createConnection(process.env.DATABASE_URL);
const report = { employees: { source: payload.employees.length, created: 0, updated: 0 }, trainees: { source: payload.trainees.length, created: 0, updated: 0 }, conflicts: [], createdDepartments: [] };
const clean = v => String(v ?? "").trim().replace(/\s+/g, " ");
const statusEmployee = v => clean(v).includes("إجازة") || clean(v).includes("بدون راتب") ? "on_leave" : clean(v).includes("انقطاع") || clean(v).includes("منقول خارج") ? "inactive" : "active";
const statusTrainee = v => clean(v).includes("مجاز") || clean(v).includes("إجازة") ? "on_leave" : "active";
const mode = v => clean(v).includes("عن بعد") ? "remote" : "in_person";
const days = v => clean(v).includes("سنة") ? 365 : 60;
const aliases = new Map([["شؤون الملازمين",90008],["شؤون القضاة",90006],["إدارة الاسناد القضائي",90027],["إدارة مراقبة الأداء والعمليات",90024],["قسم الباحثين",90017],["الباحثين",90018],["مكتب فضيلة رئيس المحكمة",90002],["مكتب المساعد الرئيس",90004],["أمانة المحكمة",90010],["إدارة الدعاوى والاحكام",90014],["تسليم الاحكام",90015],["تنسيق الاحكام",90021],["أمانة السر",90019],["إدارة الجلسات",90028]]);
const [profiles] = await db.execute("SELECT id, personType, fullName FROM person_profiles");
const profileMap = new Map(profiles.map(p => [`${p.personType}|${p.fullName}`, p.id]));
const [units] = await db.execute("SELECT id, name FROM organization_units");
const unitMap = new Map(units.map(u => [u.name, u.id]));
const unitFor = async (name) => {
  const n = clean(name) || "غير مسكن";
  if (aliases.has(n)) return aliases.get(n);
  if (unitMap.has(n)) return unitMap.get(n);
  const code = `source-dept-${Buffer.from(n).toString("base64url").slice(0, 48)}`;
  await db.execute("INSERT INTO organization_units (name, code, isActive) VALUES (?, ?, true) ON DUPLICATE KEY UPDATE name=VALUES(name), isActive=true", [n, code]);
  const [rows] = await db.execute("SELECT id FROM organization_units WHERE code=? LIMIT 1", [code]);
  unitMap.set(n, rows[0].id); report.createdDepartments.push({ name: n, unitId: rows[0].id }); return rows[0].id;
};
await db.beginTransaction();
try {
  for (const e of payload.employees) {
    const unitId = await unitFor(e.department); const key = `administrative|${e.fullName}`; const id = profileMap.get(key);
    const values = [unitId,e.fullName,e.email||null,e.nationalId||null,e.phone||null,e.employeeNumber||null,[e.jobTitle,e.rank].filter(Boolean).join(" · ")||null,statusEmployee(e.status),e.status||null,[e.assignmentNote,e.discipline,e.notes].filter(Boolean).join(" · ")||null,"نموذجعرضبياناتالموظفينللمواردالبشرية-تفاعليداخلي.xlsx: الموظفون"];
    if (id) { await db.execute("UPDATE person_profiles SET unitId=?,fullName=?,email=?,nationalId=?,phone=?,employeeNumber=?,jobTitle=?,status=?,employmentStatus=?,assignmentNote=?,sourceReference=? WHERE id=?", [...values,id]); report.employees.updated++; }
    else { const [r] = await db.execute("INSERT INTO person_profiles (unitId,personType,fullName,email,nationalId,phone,employeeNumber,jobTitle,status,employmentStatus,assignmentNote,sourceReference) VALUES (?, 'administrative', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", values); profileMap.set(key,r.insertId); report.employees.created++; }
  }
  for (const t of payload.trainees) {
    const key = `trainee|${t.fullName}`; const id = profileMap.get(key); const values=[90007,t.fullName,t.email||null,t.nationalId||null,t.phone||null,t.nationalId||null,t.formation||null,t.attendanceMode?mode(t.attendanceMode):null,statusTrainee(t.notes),t.notes||null,"تشكيلدوائرمخصصة16-02-1448.xlsx: الملازمون"];
    let profileId=id;
    if (id) { await db.execute("UPDATE person_profiles SET unitId=?,fullName=?,email=?,nationalId=?,phone=?,employeeNumber=?,judicialFormation=?,attendanceMode=?,status=?,assignmentNote=?,sourceReference=? WHERE id=?", [...values,id]); report.trainees.updated++; }
    else { const [r]=await db.execute("INSERT INTO person_profiles (unitId,personType,fullName,email,nationalId,phone,employeeNumber,judicialFormation,attendanceMode,status,assignmentNote,sourceReference) VALUES (?, 'trainee', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", values); profileId=r.insertId; profileMap.set(key,profileId); report.trainees.created++; }
    await db.execute("INSERT INTO trainee_assignments (profileId,trainingJudge,courtTrack,sourceStartDate,durationDays,status,sourceNote) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE trainingJudge=VALUES(trainingJudge),courtTrack=VALUES(courtTrack),sourceStartDate=VALUES(sourceStartDate),durationDays=VALUES(durationDays),status=VALUES(status),sourceNote=VALUES(sourceNote)",[profileId,t.trainingJudge||null,t.courtTrack||null,t.formationDate||t.courtStartDate||null,days(t.duration),statusTrainee(t.notes),[t.appointmentDate&&`التعيين: ${t.appointmentDate}`,t.courtStartDate&&`المباشرة: ${t.courtStartDate}`,t.notes].filter(Boolean).join(" · ")||null]);
  }
  await db.execute("INSERT INTO import_batches (source,filename,storageKey,storageUrl,status,summary,createdByUserId) VALUES (?,?,?,?, 'validated',?,?)",["manual_upload","تشكيلدوائرمخصصة16-02-1448.xlsx + نموذجعرضبياناتالموظفينللمواردالبشرية-تفاعليداخلي.xlsx","source-personnel-workbooks-2026-08-19","/manus-storage/source-personnel-workbooks-2026-08-19","تمت مطابقة وتحديث ملفات الموظفين والملازمين idempotently.",0]);
  await db.commit(); console.log(JSON.stringify(report,null,2));
} catch(e) { await db.rollback(); console.error(e); process.exitCode=1; }
await db.end();
setTimeout(() => process.exit(process.exitCode ?? 0), 1000);
