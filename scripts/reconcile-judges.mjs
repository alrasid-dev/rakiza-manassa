import fs from "node:fs/promises";
import mysql from "mysql2/promise";

const source = JSON.parse(await fs.readFile(new URL("../judges_source.json", import.meta.url), "utf8"));
const normalize = value => String(value ?? "").replace(/^مكلف\s+/, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/\s+/g, " ").trim().toLowerCase();
const connection = await mysql.createConnection(process.env.DATABASE_URL);
try {
  const [units] = await connection.execute("SELECT id, name, code FROM organization_units WHERE code IN ('judges-affairs','trainee-affairs') OR name LIKE '%قضا%' OR name LIKE '%أصحاب الفضيلة%'");
  const [profiles] = await connection.execute("SELECT id, unitId, personType, fullName, email, judicialFormation, status FROM person_profiles WHERE personType IN ('judge','judicial_judge') OR jobTitle LIKE '%قاض%' OR fullName LIKE '%قاضي%'");
  const unitIds = new Set(units.map(unit => unit.id));
  const current = profiles.filter(profile => unitIds.has(profile.unitId) || profile.judicialFormation);
  const byName = new Map(current.map(profile => [normalize(profile.fullName), profile]));
  const matches = source.rows.map(row => {
    const normalized = normalize(row.name);
    const match = byName.get(normalized) || (row.email && current.find(profile => String(profile.email || '').toLowerCase() === row.email.toLowerCase()));
    return { source: row, match: match ? { id: match.id, fullName: match.fullName, email: match.email, unitId: match.unitId, formation: match.judicialFormation, status: match.status } : null, action: match ? 'update_or_verify' : 'insert_candidate' };
  });
  const result = { sourceCount: source.rows.length, units, currentProfileCount: current.length, counts: { matched: matches.filter(item => item.match).length, candidates: matches.filter(item => !item.match).length, missingEmail: source.rows.filter(row => !row.email).length }, matches };
  await fs.writeFile(new URL("../judges_reconciliation.json", import.meta.url), JSON.stringify(result, null, 2), "utf8");
  console.log(JSON.stringify({ sourceCount: result.sourceCount, currentProfileCount: result.currentProfileCount, counts: result.counts, units: result.units }, null, 2));
} finally { await connection.end(); }
