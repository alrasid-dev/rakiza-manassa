#!/usr/bin/env node
/**
 * Idempotent Phase 1 leadership seed/upsert.
 * Matches person_profiles by email (preferred) or full name when DB available.
 * Does NOT invent «مدير المكتب السري» — السميح stays in مكتب فضيلة رئيس المحكمة.
 *
 * Usage: node scripts/seed-phase1-leadership.mjs
 * Requires DATABASE_URL.
 */
import mysql from "mysql2/promise";

const OWNER_EMAIL = (process.env.PLATFORM_OWNER_EMAIL || "rakizaplatform@gmail.com").toLowerCase();
const SYSTEM_GRANTER_EMAIL = OWNER_EMAIL;

const LEADERSHIP = [
  {
    fullName: "مالك المنصة",
    email: OWNER_EMAIL,
    role: null,
    permission: "full_control",
    personType: "administrative",
    unitName: null,
    userRole: "admin",
    note: "Owner exclusive Admin/Developer",
  },
  {
    fullName: "سعد ناصر عبدالعزيز الصويغ",
    email: "snaswig@moj.gov.sa",
    role: "court_president",
    permission: "general_view",
    personType: "judge",
    unitName: null,
    note: "Court president confirmed by user",
  },
  {
    fullName: "حاتم محمد عبدالله الفالح",
    email: "hfaleh@moj.gov.sa",
    role: "assistant_president",
    permission: "general_view",
    personType: "judge",
    unitName: null,
    note: "Assistant president",
  },
  {
    fullName: "عبدالله شباب سليمان العتيبي",
    email: "abssotaibi@moj.gov.sa",
    role: "court_secretary",
    permission: "general_view",
    personType: "administrative",
    unitName: "أمانة المحكمة",
    note: "Court secretary",
  },
  {
    fullName: "بندر حمد عبدالعزيز الصالح",
    email: "bhabdaziz@moj.gov.sa",
    role: "department_manager",
    permission: "employee",
    personType: "administrative",
    unitName: "مكتب فضيلة رئيس المحكمة",
    note: "President office manager",
  },
  {
    fullName: "سعد حسن عبدالرحمن السميح",
    email: "shsamaih@moj.gov.sa",
    role: "administrative_staff",
    permission: "employee",
    personType: "administrative",
    unitName: "مكتب فضيلة رئيس المحكمة",
    note: "Stays in president office per workbook — no secret-office manager role",
  },
  {
    fullName: "عبدالعزيز محمد بن عبدالعزيز الحميدي",
    email: "amhumaidi@moj.gov.sa",
    role: "department_manager",
    permission: "employee",
    personType: "administrative",
    unitName: "تسليم الاحكام",
    note: "Judgment delivery section manager",
  },
];

const UNIT_ALIASES = new Map([
  ["مكتب فضيلة رئيس المحكمة", 90002],
  ["أمانة المحكمة", 90010],
  ["تسليم الاحكام", 90015],
  ["مكتب المساعد الرئيس", 90004],
]);

function normalize(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

async function unitIdFor(connection, name) {
  if (!name) return null;
  const normalized = normalize(name);
  if (UNIT_ALIASES.has(normalized)) {
    const preferred = UNIT_ALIASES.get(normalized);
    const [byId] = await connection.execute("SELECT id FROM organization_units WHERE id = ? LIMIT 1", [preferred]);
    if (byId[0]) return byId[0].id;
  }
  const [byName] = await connection.execute("SELECT id FROM organization_units WHERE name = ? LIMIT 1", [normalized]);
  if (byName[0]) return byName[0].id;
  const code = `phase1-${Buffer.from(normalized).toString("base64url").slice(0, 40)}`;
  await connection.execute(
    "INSERT INTO organization_units (name, code, isActive) VALUES (?, ?, true) ON DUPLICATE KEY UPDATE name = VALUES(name), isActive = true",
    [normalized, code],
  );
  const [created] = await connection.execute("SELECT id FROM organization_units WHERE code = ? OR name = ? LIMIT 1", [code, normalized]);
  return created[0]?.id ?? null;
}

async function findProfile(connection, { email, fullName }) {
  const [byEmail] = await connection.execute(
    "SELECT id, userId, unitId, fullName, email FROM person_profiles WHERE LOWER(email) = LOWER(?) LIMIT 1",
    [email],
  );
  if (byEmail[0]) return byEmail[0];
  const [byName] = await connection.execute(
    "SELECT id, userId, unitId, fullName, email FROM person_profiles WHERE fullName = ? LIMIT 1",
    [fullName],
  );
  return byName[0] ?? null;
}

async function ensureUser(connection, { email, fullName, userRole }) {
  const [existing] = await connection.execute("SELECT id, role FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1", [email]);
  if (existing[0]) {
    if (userRole === "admin") {
      await connection.execute("UPDATE users SET role = 'admin', mustChangePassword = true, updatedAt = NOW() WHERE id = ?", [existing[0].id]);
    } else {
      await connection.execute("UPDATE users SET mustChangePassword = true, updatedAt = NOW() WHERE id = ?", [existing[0].id]);
    }
    return existing[0].id;
  }
  const openId = `seed:${email}`;
  const role = userRole === "admin" ? "admin" : "user";
  const [result] = await connection.execute(
    "INSERT INTO users (openId, name, email, role, mustChangePassword, loginMethod) VALUES (?, ?, ?, ?, true, 'phase1_seed')",
    [openId, fullName, email, role],
  );
  return result.insertId;
}

async function ensureAccessGrant(connection, { fullName, email, permission, notificationEmail, grantedByUserId }) {
  await connection.execute(
    `INSERT INTO access_grants (fullName, officialEmail, notificationEmail, permission, isActive, grantedByUserId)
     VALUES (?, ?, ?, ?, true, ?)
     ON DUPLICATE KEY UPDATE fullName = VALUES(fullName), permission = VALUES(permission), notificationEmail = VALUES(notificationEmail), isActive = true, grantedByUserId = VALUES(grantedByUserId), updatedAt = NOW()`,
    [fullName, email, notificationEmail, permission, grantedByUserId],
  );
}

async function ensureCourtRole(connection, { userId, role, unitId, delegatedByUserId }) {
  if (!role || !userId) return;
  const [existing] = await connection.execute(
    "SELECT id FROM court_role_assignments WHERE userId = ? AND role = ? AND isActive = true LIMIT 1",
    [userId, role],
  );
  if (existing[0]) {
    await connection.execute(
      "UPDATE court_role_assignments SET unitId = ?, delegatedByUserId = ? WHERE id = ?",
      [unitId, delegatedByUserId, existing[0].id],
    );
    return;
  }
  await connection.execute(
    "INSERT INTO court_role_assignments (userId, role, unitId, delegatedByUserId, isActive) VALUES (?, ?, ?, ?, true)",
    [userId, role, unitId, delegatedByUserId],
  );
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log(JSON.stringify({ skipped: true, reason: "DATABASE_URL missing", leadershipCount: LEADERSHIP.length }, null, 2));
    process.exit(0);
  }
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const report = { upserted: [], warnings: [] };
  try {
    const ownerUserId = await ensureUser(connection, { email: OWNER_EMAIL, fullName: "مالك المنصة", userRole: "admin" });
    for (const person of LEADERSHIP) {
      const unitId = await unitIdFor(connection, person.unitName);
      const userId = person.email === OWNER_EMAIL
        ? ownerUserId
        : await ensureUser(connection, { email: person.email, fullName: person.fullName, userRole: person.userRole });
      await ensureAccessGrant(connection, {
        fullName: person.fullName,
        email: person.email,
        permission: person.permission,
        notificationEmail: person.email,
        grantedByUserId: ownerUserId || 1,
      });
      let profile = await findProfile(connection, person);
      if (!profile) {
        const [inserted] = await connection.execute(
          `INSERT INTO person_profiles (userId, unitId, personType, fullName, email, jobTitle, status, sourceReference)
           VALUES (?, ?, ?, ?, ?, ?, 'active', 'phase1-leadership-seed-2026-09-11')`,
          [userId, unitId, person.personType, person.fullName, person.email, person.note ?? null],
        );
        profile = { id: inserted.insertId, userId, unitId, fullName: person.fullName, email: person.email };
        report.warnings.push({ email: person.email, createdProfile: true });
      } else {
        await connection.execute(
          `UPDATE person_profiles SET userId = COALESCE(userId, ?), unitId = COALESCE(?, unitId), email = COALESCE(email, ?), status = 'active', updatedAt = NOW() WHERE id = ?`,
          [userId, unitId, person.email, profile.id],
        );
      }
      await connection.execute("UPDATE access_grants SET userId = ? WHERE LOWER(officialEmail) = LOWER(?)", [userId, person.email]);
      await ensureCourtRole(connection, {
        userId,
        role: person.role,
        unitId: person.role === "department_manager" || person.role === "administrative_staff" ? unitId : null,
        delegatedByUserId: ownerUserId || 1,
      });
      report.upserted.push({
        email: person.email,
        role: person.role,
        permission: person.permission,
        unitId,
        profileId: profile.id,
        userId,
        note: person.note,
      });
    }
    const [pwd] = await connection.execute("UPDATE users SET mustChangePassword = true");
    report.passwordResetFlagged = pwd.affectedRows ?? null;
    console.log(JSON.stringify({ ok: true, ...report }, null, 2));
  } finally {
    await connection.end();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
