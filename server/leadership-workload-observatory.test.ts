import { describe, expect, it } from "vitest";
import { buildLeadershipWorkloadObservatory } from "./leadership-workload-observatory";

describe("مرصد ضغط العمل القيادي", () => {
  it("يعرض عوامل الضغط ويقترح مراجعة تكليف مؤقت من وحدة أقل ضغطاً دون تنفيذ قرار", () => {
    const now = new Date("2030-01-10T08:00:00.000Z");
    const result = buildLeadershipWorkloadObservatory({
      now,
      units: [{ id: 1, name: "قسم الدعاوى", isActive: true }, { id: 2, name: "قسم الوثائق", isActive: true }],
      profiles: [{ id: 11, fullName: "سعد", unitId: 1, status: "active" }, { id: 21, fullName: "محمد", unitId: 2, status: "active" }, { id: 22, fullName: "ناصر", unitId: 2, status: "active" }],
      tasks: [
        { id: 1, unitId: 1, assigneeProfileId: 11, status: "overdue", priority: "critical", dueAt: new Date("2030-01-09T08:00:00.000Z") },
        { id: 2, unitId: 1, assigneeProfileId: 11, status: "overdue", priority: "high", dueAt: new Date("2030-01-09T08:00:00.000Z") },
        { id: 3, unitId: 1, assigneeProfileId: null, status: "new", priority: "high", dueAt: new Date("2030-01-11T08:00:00.000Z") },
        { id: 4, unitId: 1, assigneeProfileId: null, status: "in_progress", priority: "normal", dueAt: new Date("2030-01-11T12:00:00.000Z") },
      ],
    });
    expect(result.units[0]).toMatchObject({ unitId: 1, pressureLevel: "high", overdueTasks: 2, unassignedTasks: 2 });
    expect(result.recommendations[0]).toMatchObject({ targetUnitId: 1, sourceUnitId: 2, requiresHumanApproval: true, action: "review_only" });
    expect(result.recommendations[0]?.reason).toContain("متأخرة");
  });

  it("يستبعد الموظف في الإجازة ولا يقترح شيئاً عندما لا توجد وحدة بضغط مرتفع", () => {
    const result = buildLeadershipWorkloadObservatory({ now: new Date("2030-01-10T08:00:00.000Z"), units: [{ id: 1, name: "قسم هادئ", isActive: true }], profiles: [{ id: 1, fullName: "موظف مجاز", unitId: 1, status: "active", onLeave: true }], tasks: [{ id: 1, unitId: 1, assigneeProfileId: null, status: "new", priority: "normal", dueAt: null }] });
    expect(result.totals.activeStaff).toBe(0);
    expect(result.recommendations).toEqual([]);
  });
});
