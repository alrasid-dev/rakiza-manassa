import fs from "node:fs/promises";
import mysql from "mysql2/promise";

const sourcePath = "/home/ubuntu/court_operational_import.json";
const systemUserId = 0;

function asText(value) {
  return String(value ?? "").trim();
}

function statusForDelay(value) {
  const normalized = asText(value);
  if (normalized.includes("متأخر")) return "overdue";
  if (normalized.includes("مغلق") || normalized.includes("منجز")) return "resolved";
  return "under_follow_up";
}

function frequency(value) {
  const normalized = asText(value);
  if (normalized.includes("يومي")) return "daily";
  if (normalized.includes("أسبوع")) return "weekly";
  if (normalized.includes("شهري")) return "monthly";
  if (normalized.includes("ربع")) return "quarterly";
  return "custom";
}

function hourFromArabicTime(value) {
  const normalized = asText(value).replace(/[٠-٩]/g, char => "٠١٢٣٤٥٦٧٨٩".indexOf(char).toString());
  const match = normalized.match(/(\d{1,2})/);
  if (!match) return 15;
  let hour = Number(match[1]);
  if (normalized.includes("ظهر") && hour < 12) hour += 12;
  if (normalized.includes("مساء") && hour < 12) hour += 12;
  return Math.min(Math.max(hour, 0), 23);
}

function isoDate(value) {
  const normalized = asText(value);
  return /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(normalized) ? new Date(normalized) : null;
}

function reference(delay) {
  const pairs = [
    ["قضية", delay.caseNumber], ["حكم", delay.judgementNumber], ["طلب", delay.requestNumber], ["تذكرة", delay.ticketNumber],
  ].filter(([, value]) => value && value !== "—" && value !== "-");
  return pairs.map(([label, value]) => `${label}: ${value}`).join(" | ").slice(0, 120) || null;
}

function profileByName(profiles, name) {
  const normalized = asText(name).replace(/[.،]/g, "");
  if (!normalized || normalized.includes("اسم الملازم")) return null;
  const first = normalized.split(/\s+/)[0];
  return profiles.find(profile => profile.fullName.includes(normalized) || profile.fullName.startsWith(first)) ?? null;
}

const payload = JSON.parse(await fs.readFile(sourcePath, "utf8"));
const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  await connection.beginTransaction();
  await connection.execute(
    "INSERT INTO organization_units (name, code, isActive) VALUES (?, ?, true) ON DUPLICATE KEY UPDATE name = VALUES(name), isActive = true",
    ["شؤون الملازمين", "trainee-affairs"],
  );
  const [[unit]] = await connection.execute("SELECT id FROM organization_units WHERE code = ? LIMIT 1", ["trainee-affairs"]);
  const unitId = unit.id;
  const profiles = [];

  for (const employee of payload.employees) {
    const [result] = await connection.execute(
      "INSERT INTO person_profiles (unitId, personType, fullName, email, employeeNumber, jobTitle, status, sourceReference) VALUES (?, 'administrative', ?, ?, ?, ?, 'active', ?)",
      [unitId, employee.fullName, employee.email, employee.employeeNumber, `${employee.jobTitle} · ${employee.rank}`, "قاعدةالبيانات.xlsx: بيانات الموظفين"],
    );
    profiles.push({ id: result.insertId, fullName: employee.fullName, email: employee.email });
  }

  for (const trainee of payload.trainees) {
    const onLeave = trainee.statusNote.includes("مجاز") || trainee.statusNote.includes("إجازة");
    const [result] = await connection.execute(
      "INSERT INTO person_profiles (unitId, personType, fullName, email, employeeNumber, judicialFormation, attendanceMode, status, sourceReference) VALUES (?, 'trainee', ?, ?, ?, ?, ?, ?, ?)",
      [unitId, trainee.fullName, trainee.email, trainee.identifier, trainee.formation, trainee.attendanceMode.includes("عن بعد") ? "remote" : "in_person", onLeave ? "on_leave" : "active", "قاعدةالبيانات.xlsx: بيانات الملازمين"],
    );
    const profile = { id: result.insertId, fullName: trainee.fullName, email: trainee.email };
    profiles.push(profile);
    await connection.execute(
      "INSERT INTO trainee_assignments (profileId, trainingJudge, courtTrack, sourceStartDate, durationDays, status, sourceNote) VALUES (?, ?, ?, ?, 60, ?, ?)",
      [profile.id, trainee.trainingJudge, trainee.courtTrack, trainee.startDate || trainee.formationDate, onLeave ? "on_leave" : "needs_date_confirmation", `الحالة المصدرية: ${trainee.trainingStatus || "غير محددة"}${trainee.statusNote ? ` · ${trainee.statusNote}` : ""}`],
    );
  }

  for (const template of payload.taskTemplates) {
    await connection.execute(
      "INSERT INTO task_templates (unitId, title, frequency, workdayOnly, dueHourLocal, requiredApprovals, formReference, isActive, createdByUserId) VALUES (?, ?, ?, true, ?, 1, ?, true, ?)",
      [unitId, template.title, frequency(template.frequency), hourFromArabicTime(template.endTime), template.formReference || null, systemUserId],
    );
  }

  for (const delay of payload.delayRecords) {
    const owner = profileByName(profiles, delay.ownerName);
    const related = profileByName(profiles, delay.subject);
    const action = [delay.reason && `العائق: ${delay.reason}`, delay.actionTaken && `الإجراء: ${delay.actionTaken}`, delay.counterparty && `الجهة: ${delay.counterparty}`, delay.notes && `ملاحظات: ${delay.notes}`].filter(Boolean).join("\n");
    await connection.execute(
      "INSERT INTO delay_records (unitId, relatedProfileId, title, category, referenceNumber, startedAt, status, ownerProfileId, actionTaken, sourceReference, createdByUserId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [unitId, related?.id ?? null, delay.subject, delay.category || "غير مصنف", reference(delay), isoDate(delay.startedAt), statusForDelay(delay.status), owner?.id ?? null, action || null, `اعمالوحدةشؤونالملازمينالنهائي.xlsx: سجل المتعثرات #${delay.sequence}`, systemUserId],
    );
  }

  await connection.execute(
    "INSERT INTO document_records (documentType, title, storageKey, storageUrl, sourceReference, summary, createdByUserId) VALUES (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?)",
    [
      "other", "قاعدة بيانات الموظفين والملازمين", "source-personnel-data_4ccca1b5.xlsx", "/manus-storage/source-personnel-data_4ccca1b5.xlsx", "قاعدةالبيانات.xlsx", "تم استخراج الموظفين والملازمين وتسجيل بيانات المصدر.", systemUserId,
      "task_schedule", "مهام وحدة شؤون الملازمين وسجل المتعثرات", "source-trainee-operations_67c326b7.xlsx", "/manus-storage/source-trainee-operations_67c326b7.xlsx", "اعمالوحدةشؤونالملازمينالنهائي.xlsx", "تم استخراج قوالب المهام وسجل المتعثرات.", systemUserId,
      "daily_attendance", "تقرير متابعة الجلسات اليومي", "daily-attendance-report_cfad27c1.pdf", "/manus-storage/daily-attendance-report_cfad27c1.pdf", "تح.pdf", "تقرير حضور ومتابعة للملازمين محفوظ كوثيقة مصدر.", systemUserId,
    ],
  );
  await connection.execute(
    "INSERT INTO import_batches (source, filename, storageKey, storageUrl, status, summary, createdByUserId) VALUES (?, ?, ?, ?, 'validated', ?, ?), (?, ?, ?, ?, 'validated', ?, ?)",
    [
      "manual_upload", "قاعدةالبيانات.xlsx", "source-personnel-data_4ccca1b5.xlsx", "/manus-storage/source-personnel-data_4ccca1b5.xlsx", JSON.stringify({ employees: payload.employees.length, trainees: payload.trainees.length, skipped: "vacant rows" }), systemUserId,
      "manual_upload", "اعمالوحدةشؤونالملازمينالنهائي.xlsx", "source-trainee-operations_67c326b7.xlsx", "/manus-storage/source-trainee-operations_67c326b7.xlsx", JSON.stringify({ templates: payload.taskTemplates.length, delays: payload.delayRecords.length }), systemUserId,
    ],
  );
  await connection.commit();
  const [[counts]] = await connection.execute("SELECT (SELECT COUNT(*) FROM person_profiles) AS people, (SELECT COUNT(*) FROM trainee_assignments) AS assignments, (SELECT COUNT(*) FROM task_templates) AS templates, (SELECT COUNT(*) FROM delay_records) AS delays, (SELECT COUNT(*) FROM document_records) AS documents");
  console.log(JSON.stringify({ imported: { employees: payload.employees.length, trainees: payload.trainees.length, templates: payload.taskTemplates.length, delays: payload.delayRecords.length }, totals: counts }));
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
