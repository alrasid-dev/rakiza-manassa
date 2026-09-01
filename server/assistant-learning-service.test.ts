import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getDb: vi.fn(), inserted: [] as Array<Record<string, unknown>> }));
vi.mock("./db", () => ({ getDb: mocks.getDb }));

import { listManagerDecisionPatterns, recordManagerDecision, revokeAutomationDecision } from "./assistant-learning-service";

function fakeDb() {
  const rows = [{ id: 1, actorUserId: 7, metadata: JSON.stringify({ assistant: "trainee_affairs", decision: "accepted" }), createdAt: new Date() }];
  const selectChain = { from: () => selectChain, where: () => selectChain, orderBy: () => selectChain, limit: async () => rows };
  return {
    insert: () => ({ values: async (values: Record<string, unknown>) => { mocks.inserted.push(values); } }),
    select: () => selectChain,
  };
}

describe("تعلم قرارات المديرين للمساعدين", () => {
  beforeEach(() => { mocks.inserted.length = 0; mocks.getDb.mockResolvedValue(fakeDb()); });

  it("يسجل القرار دون تخزين سجل العمل الكامل أو بيانات إضافية غير لازمة", async () => {
    await recordManagerDecision({ managerUserId: 7, assistant: "trainee_affairs", decisionType: "priority", decision: "accepted", contextLabel: "مهمة متعثرة", rationale: "أولوية زمنية" });
    expect(mocks.inserted[0]).toMatchObject({ actorUserId: 7, action: "assistant.manager_decision", entityType: "assistant_learning" });
    expect(String(mocks.inserted[0]?.metadata)).toContain("trainee_affairs");
    expect(String(mocks.inserted[0]?.metadata)).not.toContain("password");
  });

  it("يسجل الإلغاء الفوري ويثبت وضع التعطيل", async () => {
    const result = await revokeAutomationDecision({ managerUserId: 7, assistant: "trainee_affairs", decisionType: "priority", contextLabel: "مهمة متعثرة", rationale: "إيقاف فوري للمراجعة" });
    expect(result).toMatchObject({ success: true, mode: "disabled" });
    expect(mocks.inserted).toHaveLength(2);
    expect(String(mocks.inserted[0]?.metadata)).toContain('"automationMode":"disabled"');
    expect(mocks.inserted[1]).toMatchObject({ action: "assistant.automation_revoked", entityType: "assistant_automation" });
  });

  it("يسترجع نمط المساعد المطلوب فقط", async () => {
    const patterns = await listManagerDecisionPatterns({ assistant: "trainee_affairs" });
    expect(patterns).toHaveLength(1);
  });
});
