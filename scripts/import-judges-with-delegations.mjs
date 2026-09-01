import fs from "node:fs/promises";
import mysql from "mysql2/promise";

const source = JSON.parse(await fs.readFile(new URL("../judges_source.json", import.meta.url), "utf8"));
const normalize = value => String(value ?? "").replace(/^مكلف\s+/, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/\s+/g, " ").trim().toLowerCase();
const rawName = value => String(value ?? "").replace(/^مكلف\s+/, "").replace(/\s+/g, " ").trim();
const isActing = value => /^مكلف\s+/.test(String(value ?? "").trim());
const sourceRef = row => `قضاةالمحكمة.xlsx:row-${row.row}`;
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const systemUserId = 0;

try {
  await connection.beginTransaction();
  const [units] = await connection.execute("SELECT id, name, code FROM organization_units WHERE code = 'court-judges' OR name = 'أصحاب الفضيلة قضاة المحكمة' ORDER BY CASE WHEN code = 'court-judges' THEN 0 ELSE 1 END LIMIT 1");
  if (!units.length) throw new Error("تعذر العثور على وحدة أصحاب الفضيلة/شؤون القضاة");
  const judgesUnitId = units[0].id;
  const [profiles] = await connection.execute("SELECT id, unitId, personType, fullName, email, judicialFormation, status FROM person_profiles WHERE personType = 'judge' OR jobTitle LIKE '%قاض%' OR fullName LIKE '%قاضي%'");
  const byName = new Map(profiles.map(profile => [normalize(profile.fullName), profile]));
  const byEmail = new Map(profiles.filter(profile => profile.email).map(profile => [String(profile.email).toLowerCase(), profile]));
  const results = { sourceCount: source.rows.length, baseVerified: 0, emailFilled: 0, actingDelegationsCreated: 0, actingDelegationsExisting: 0, conflictsPreserved: 0, skipped: [] };

  for (const row of source.rows) {
    const baseName = rawName(row.name);
    const profile = byName.get(normalize(baseName)) || (row.email ? byEmail.get(String(row.email).toLowerCase()) : null);
    if (!profile) {
      results.skipped.push({ row: row.row, name: row.name, reason: "لم يتم العثور على ملف مطابق" });
      continue;
    }
    results.baseVerified += 1;
    if (row.email && !profile.email) {
      await connection.execute("UPDATE person_profiles SET email = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?", [row.email, profile.id]);
      profile.email = row.email;
      results.emailFilled += 1;
    }
    if (!isActing(row.name)) {
      if (profile.judicialFormation && profile.judicialFormation !== row.formation) results.conflictsPreserved += 1;
      continue;
    }
    const title = `تكليف بتشكيل ${row.formation}`;
    const reference = sourceRef(row);
    const [existing] = await connection.execute("SELECT id FROM profile_delegations WHERE delegateProfileId = ? AND title = ? AND sourceReference = ? LIMIT 1", [profile.id, title, reference]);
    if (existing.length) {
      results.actingDelegationsExisting += 1;
      continue;
    }
    await connection.execute(
      "INSERT INTO profile_delegations (delegateProfileId, coveredProfileId, unitId, assignmentType, title, sourceReference, startsAt, status, notes, createdByUserId) VALUES (?, NULL, ?, 'formation_assignment', ?, ?, CURRENT_TIMESTAMP, 'active', ?, ?)",
      [profile.id, judgesUnitId, title, reference, `وارد في صف التكليف من ملف قضاة المحكمة؛ التشكيل الأساسي محفوظ كما هو.`, systemUserId],
    );
    results.actingDelegationsCreated += 1;
  }
  await connection.commit();
  console.log(JSON.stringify({ judgesUnitId, ...results }, null, 2));
} catch (error) {
  await connection.rollback();
  console.error(error);
  process.exitCode = 1;
} finally {
  await connection.end();
}
