import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ listManagerDecisionPatterns: vi.fn() }));
vi.mock("./assistant-learning-service", () => ({ listManagerDecisionPatterns: mocks.listManagerDecisionPatterns }));

import { buildManagerPreferenceProfile } from "./assistant-preferences";

describe("ملف تفضيلات المدير", () => {
  beforeEach(() => mocks.listManagerDecisionPatterns.mockResolvedValue([
    { metadata: '{"decision":"accepted","decisionType":"priority"}' },
    { metadata: '{"decision":"modified","decisionType":"priority"}' },
    { metadata: '{"decision":"rejected","decisionType":"task_route"}' },
  ]));

  it("يستخلص نسباً قابلة للمراجعة مع تحفظ واضح", async () => {
    const profile = await buildManagerPreferenceProfile({ assistant: "leadership" });
    expect(profile.sampleSize).toBe(3);
    expect(profile.acceptanceRate).toBe(0.33);
    expect(profile.modificationRate).toBe(0.33);
    expect(profile.decisionTypeCounts.priority).toBe(2);
    expect(profile.caveat).toContain("لا يمثل قاعدة ملزمة");
  });
});
