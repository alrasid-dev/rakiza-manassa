import fs from "node:fs/promises";
import mysql from "mysql2/promise";

const sourcePath = process.argv[2] ?? "/tmp/rakiza_personnel_records.json";
const payload = JSON.parse(await fs.readFile(sourcePath, "utf8"));
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const SYSTEM_USER_ID = 0;

const normalize = value => String(value ?? "").trim().replace(/\s+/g, " ");
const codeFor = name => `source-dept-${Buffer.from(normalize(name)).toString("base64url").slice(0, 48)}`;
const employeeStatus = value => {
  const text = normalize(value);
  if (text.includes("إجازة") || text.includes("بدون راتب")) return "on_leave";
  if (text.includes("انقطاع") || text.includes("منقول خارج")) return "inactive";
  return "active";
};
const traineeStatus = value => normalize(value).includes("مجاز") || normalize(value).includes("إجازة") ? "on_leave" : "active";
const attendance = value => normalize(value).includes("عن بعد") ? "remote" : "in_person";
const durationDays = value => normalize(value).includes("سنة") ? 365 : 60;

const aliases = new Map([
  ["شؤون الملازمين", 90008], ["شؤون القضاة", 90006], ["إدارة الاسناد القضائي", 90027],
  ["إدارة مراقبة الأداء والعمليات", 90024], ["قسم الباحثين", 90017], ["الباحثين", 90018],
  ["مكتب فضيلة رئيس المحكمة", 90002], ["مكتب المساعد الرئيس", 90004], ["أمانة المحكمة", 90010],
  ["إدارة الدعاوى والاحكام", 90014], ["تسليم الاحكام", 90015], ["تنسيق الاحكام", 90021],
  ["أمانة السر", 90019], ["إدارة الجلسات", 90028],
]);

async function unitIdFor(name, report) {
  const normalized = normalize(name) || "غير مسكن";
  if (aliases.has(normalized)) return aliases.get(normalized);
  const [existing] = await connection.execute("SELECT id FROM organization_units WHERE name = ? LIMIT 1", [normalized]);
  if (existing[0]) return existing[0].id;
  const code = codeFor(normalized);
  await connection.execute("INSERT INTO organization_units (name, code, isActive) VALUES (?, ?, true) ON DUPLICATE KEY UPDATE name = VALUES(name), isActive = true", [normalized, code]);
  const [created] = await connection.execute("SELECT id FROM organization_units WHERE code = ? LIMIT 1", [code]);
  report.createdDepartments.push({ name: normalized, unitId: created[0].id });
  return created[0].id;
}

async function findProfile(personType, record) {
  const [exactName] = await connection.execute("SELECT id FROM person_profiles WHERE personType = ? AND fullName = ? LIMIT 1", [personType, record.fullName]);
  if (exactName[0]) return exactName[0].id;
  if (record.nationalId) {
    const [sameId] = await connection.execute("SELECT id, fullName FROM person_profiles WHERE personType = ? AND nationalId = ? LIMIT 2", [personType, record.nationalId]);
    if (sameId.length === 1 && sameId[0].fullName === record.fullName) return sameId[0].id;
    // A repeated identity number with a different name is a source conflict, not a match.
    if (sameId.length) return null;
  }
  if (record.email) {
    const [sameEmail] = await connection.execute("SELECT id, fullName FROM person_profiles WHERE personType = ? AND LOWER(email) = LOWER(?)", [personType, record.email]);
    if (sameEmail.length === 1 && sameEmail[0].fullName === record.fullName) return sameEmail[0].id;
  }
  return null;
}

const report = { sourceFiles: payload.sourceFiles, employees: { source: payload.employees.length, created: 0, updated: 0, departments: {} }, trainees: { source: payload.trainees.length, created: 0, updated: 0 }, createdDepartments: [], conflicts: [], matched: [] };
await connection.beginTransaction();
try {
  for (const employee of payload.employees) {
    const unitId = await unitIdFor(employee.department, report);
    report.employees.departments[normalize(employee.department) || "غير مسكن"] = (report.employees.departments[normalize(employee.department) || "غير مسكن"] ?? 0) + 1;
    const existingId = await findProfile("administrative", employee);
    const values = [unitId, employee.fullName, employee.email || null, employee.nationalId || null, employee.phone || null, employee.employeeNumber || null, `${employee.jobTitle || ""}${employee.rank ? ` · ${employee.rank}` : ""}`.trim() || null, employeeStatus(employee.status), employee.status || null, [employee.assignmentNote, employee.discipline, employee.notes].filter(Boolean).join(" · ") || null, `نموذجعرضبياناتالموظفينللمواردالبشرية-تفاعليداخلي.xlsx: الموظفون`];
    if (existingId) {
      await connection.execute("UPDATE person_profiles SET unitId=?, fullName=?, email=?, nationalId=?, phone=?, employeeNumber=?, jobTitle=?, status=?, employmentStatus=?, assignmentNote=?, sourceReference=? WHERE id=?", [...values, existingId]);
      report.employees.updated += 1;
      report.matched.push({ type: "administrative", profileId: existingId, name: employee.fullName, unitId });
    } else {
      const [result] = await connection.execute("INSERT INTO person_profiles (unitId, personType, fullName, email, nationalId, phone, employeeNumber, jobTitle, status, employmentStatus, assignmentNote, sourceReference) VALUES (?, 'administrative', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", values);
      report.employees.created += 1;
      report.matched.push({ type: "administrative", profileId: result.insertId, name: employee.fullName, unitId });
    }
  }

  for (const trainee of payload.trainees) {
    const existingId = await findProfile("trainee", trainee);
    const unitId = 90007;
    const values = [unitId, trainee.fullName, trainee.email || null, trainee.nationalId || null, trainee.phone || null, trainee.nationalId || null, trainee.formation || null, trainee.attendanceMode ? attendance(trainee.attendanceMode) : null, traineeStatus(trainee.notes), trainee.notes || null, `تشكيلدوائرمخصصة16-02-1448.xlsx: الملازمون`];
    let profileId = existingId;
    if (existingId) {
      await connection.execute("UPDATE person_profiles SET unitId=?, fullName=?, email=?, nationalId=?, phone=?, employeeNumber=?, judicialFormation=?, attendanceMode=?, status=?, assignmentNote=?, sourceReference=? WHERE id=?", [...values, existingId]);
      report.trainees.updated += 1;
    } else {
      const [result] = await connection.execute("INSERT INTO person_profiles (unitId, personType, fullName, email, nationalId, phone, employeeNumber, judicialFormation, attendanceMode, status, assignmentNote, sourceReference) VALUES (?, 'trainee', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", values);
      profileId = result.insertId;
      report.trainees.created += 1;
    }
    const status = traineeStatus(trainee.notes);
    await connection.execute("INSERT INTO trainee_assignments (profileId, trainingJudge, courtTrack, sourceStartDate, durationDays, status, sourceNote) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE trainingJudge=VALUES(trainingJudge), courtTrack=VALUES(courtTrack), sourceStartDate=VALUES(sourceStartDate), durationDays=VALUES(durationDays), status=VALUES(status), sourceNote=VALUES(sourceNote)", [profileId, trainee.trainingJudge || null, trainee.courtTrack || null, trainee.formationDate || trainee.courtStartDate || null, durationDays(trainee.duration), status, [trainee.appointmentDate && `التعيين: ${trainee.appointmentDate}`, trainee.courtStartDate && `المباشرة: ${trainee.courtStartDate}`, trainee.notes].filter(Boolean).join(" · ") || null]);
    report.matched.push({ type: "trainee", profileId, name: trainee.fullName, unitId });
  }

  await connection.execute("INSERT INTO import_batches (source, filename, storageKey, storageUrl, status, summary, createdByUserId) VALUES (?, ?, ?, ?, 'validated', ?, ?)", ["manual_upload", "تشكيلدوائرمخصصة16-02-1448.xlsx + نموذجعرضبياناتالموظفينللمواردالبشرية-تفاعليداخلي.xlsx", "source-personnel-workbooks-2026-08-19", "/manus-storage/source-personnel-workbooks-2026-08-19", JSON.stringify(report), SYSTEM_USER_ID]);
  await connection.commit();
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
