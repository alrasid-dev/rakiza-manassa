import { and, desc, eq, isNull } from "drizzle-orm";
import { assetCustodies, assetCustodyAudit, courtAssets, personProfiles } from "../drizzle/schema";
import { getDb } from "./db";

export function canClearProfile(openCustodyCount: number) {
  return Number.isFinite(openCustodyCount) && openCustodyCount === 0;
}

export async function listCourtAssets(scope?: { unitId?: number; profileId?: number }) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ asset: courtAssets, custody: assetCustodies, profile: personProfiles })
    .from(courtAssets)
    .leftJoin(assetCustodies, and(eq(assetCustodies.assetId, courtAssets.id), eq(assetCustodies.status, "assigned")))
    .leftJoin(personProfiles, eq(personProfiles.id, assetCustodies.profileId))
    .where(scope?.unitId ? eq(courtAssets.unitId, scope.unitId) : scope?.profileId ? eq(assetCustodies.profileId, scope.profileId) : undefined)
    .orderBy(desc(courtAssets.updatedAt));
  return rows;
}

export async function createCourtAsset(input: { assetNumber: string; assetType: "computer" | "phone" | "screen" | "printer" | "seal" | "other"; name: string; serialNumber?: string; unitId?: number | null; notes?: string; createdByUserId: number }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة.");
  const result = await db.insert(courtAssets).values({ ...input, serialNumber: input.serialNumber || null, unitId: input.unitId ?? null, notes: input.notes || null });
  const assetId = Number(result[0].insertId);
  await db.insert(assetCustodyAudit).values({ assetId, action: "created", actorUserId: input.createdByUserId, details: "إنشاء أصل جديد" });
  return assetId;
}

export async function assignCourtAsset(input: { assetId: number; profileId: number; actorUserId: number; notes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة.");
  const asset = (await db.select().from(courtAssets).where(eq(courtAssets.id, input.assetId)).limit(1))[0];
  if (!asset) throw new Error("الأصل غير موجود.");
  if (asset.status === "assigned") throw new Error("لا يمكن إسناد أصل مسند حالياً.");
  const profile = (await db.select().from(personProfiles).where(eq(personProfiles.id, input.profileId)).limit(1))[0];
  if (!profile || profile.status === "inactive") throw new Error("لا يمكن إسناد الأصل لملف غير نشط.");
  const active = (await db.select().from(assetCustodies).where(and(eq(assetCustodies.assetId, input.assetId), eq(assetCustodies.status, "assigned"))).limit(1))[0];
  if (active) throw new Error("الأصل لديه عهدة مفتوحة.");
  const result = await db.insert(assetCustodies).values({ assetId: input.assetId, profileId: input.profileId, assignedByUserId: input.actorUserId, notes: input.notes || null, status: "assigned" });
  const custodyId = Number(result[0].insertId);
  await db.update(courtAssets).set({ status: "assigned" }).where(eq(courtAssets.id, input.assetId));
  await db.insert(assetCustodyAudit).values({ assetId: input.assetId, custodyId, action: "assigned", actorUserId: input.actorUserId, details: `إسناد الأصل إلى الملف ${input.profileId}` });
  return custodyId;
}

export async function returnCourtAsset(input: { custodyId: number; actorUserId: number; returnCondition?: string; notes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة.");
  const custody = (await db.select().from(assetCustodies).where(and(eq(assetCustodies.id, input.custodyId), eq(assetCustodies.status, "assigned"))).limit(1))[0];
  if (!custody) throw new Error("العهدة المفتوحة غير موجودة.");
  await db.update(assetCustodies).set({ status: "returned", returnedAt: new Date(), returnedByUserId: input.actorUserId, returnCondition: input.returnCondition || null, notes: input.notes || custody.notes }).where(eq(assetCustodies.id, input.custodyId));
  await db.update(courtAssets).set({ status: "returned" }).where(eq(courtAssets.id, custody.assetId));
  await db.insert(assetCustodyAudit).values({ assetId: custody.assetId, custodyId: custody.id, action: "returned", actorUserId: input.actorUserId, details: input.returnCondition || "استرداد العهدة" });
  return { success: true };
}

export async function countOpenCustodies(profileId: number) {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select({ id: assetCustodies.id }).from(assetCustodies).where(and(eq(assetCustodies.profileId, profileId), eq(assetCustodies.status, "assigned")));
  return rows.length;
}
