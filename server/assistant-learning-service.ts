import { and, desc, eq } from "drizzle-orm";
import { auditLogs } from "../drizzle/schema";
import { getDb } from "./db";

export type ManagerDecisionInput = {
  managerUserId: number;
  assistant: string;
  decisionType: "task_route" | "priority" | "summary_ack" | "recommendation_accept" | "recommendation_reject";
  decision: "accepted" | "rejected" | "modified";
  contextLabel: string;
  outcomeLabel?: string;
  rationale?: string;
  automationMode?: "full" | "partial" | "disabled";
};

export async function recordManagerDecision(input: ManagerDecisionInput) {
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  await db.insert(auditLogs).values({
    actorUserId: input.managerUserId,
    action: "assistant.manager_decision",
    entityType: "assistant_learning",
    metadata: JSON.stringify({
      assistant: input.assistant,
      decisionType: input.decisionType,
      decision: input.decision,
      contextLabel: input.contextLabel.slice(0, 240),
      outcomeLabel: input.outcomeLabel?.slice(0, 240) ?? null,
      rationale: input.rationale?.slice(0, 1000) ?? null,
      automationMode: input.automationMode ?? null,
    }),
  });
}

export async function listManagerDecisionPatterns(input: { assistant?: string; limit?: number } = {}) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ id: auditLogs.id, actorUserId: auditLogs.actorUserId, metadata: auditLogs.metadata, createdAt: auditLogs.createdAt })
    .from(auditLogs)
    .where(and(eq(auditLogs.action, "assistant.manager_decision"), eq(auditLogs.entityType, "assistant_learning")))
    .orderBy(desc(auditLogs.createdAt))
    .limit(Math.min(input.limit ?? 50, 100));
  return rows.filter(row => {
    if (!input.assistant) return true;
    try { return JSON.parse(row.metadata ?? "{}").assistant === input.assistant; } catch { return false; }
  });
}

export async function revokeAutomationDecision(input: { managerUserId: number; assistant: string; decisionType: ManagerDecisionInput["decisionType"]; contextLabel: string; rationale?: string }) {
  await recordManagerDecision({ ...input, decision: "modified", automationMode: "disabled", outcomeLabel: "إلغاء فوري للموافقة الآلية" });
  const db = await getDb();
  if (!db) throw new Error("قاعدة البيانات غير متاحة");
  await db.insert(auditLogs).values({
    actorUserId: input.managerUserId,
    action: "assistant.automation_revoked",
    entityType: "assistant_automation",
    metadata: JSON.stringify({ assistant: input.assistant, decisionType: input.decisionType, contextLabel: input.contextLabel.slice(0, 240), rationale: input.rationale?.slice(0, 1000) ?? null, automationMode: "disabled" }),
  });
  return { success: true, mode: "disabled" as const };
}
