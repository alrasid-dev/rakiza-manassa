import { describe, expect, it } from "vitest";
import { distributeAcrossAvailableStaff, extractPerformanceTasksFromWordText } from "./performance-report-task-extractor";

describe("استخراج وتوزيع مهام تقرير مراقبة الأداء", () => {
  it("يستخرج البنود العملية المتفردة من نص التقرير", () => {
    const tasks = extractPerformanceTasksFromWordText("تقرير متابعة\n- مراجعة محضر الجلسة\n- معالجة تأخر التبليغ\n- مراجعة محضر الجلسة");
    expect(tasks.map(task => task.title)).toEqual(["مراجعة محضر الجلسة", "معالجة تأخر التبليغ"]);
  });

  it("يوزع البنود على المتاحين بحسب أقل حمل عمل", () => {
    const assignments = distributeAcrossAvailableStaff([{ title: "مهمة أ", source: "word" }, { title: "مهمة ب", source: "word" }, { title: "مهمة ج", source: "word" }], [{ id: 2, openWorkload: 0 }, { id: 3, openWorkload: 1 }]);
    expect(assignments.map(item => item.assigneeId)).toEqual([2, 2, 3]);
  });
});
