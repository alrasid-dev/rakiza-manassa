import { describe, expect, it } from "vitest";
import { traineeCorrespondenceTemplates } from "./TraineeCorrespondenceTemplatesPage";

describe("قوالب مراسلات شؤون الملازمين", () => {
  it("يوفر النماذج الأربعة عشر دون تكرار في المصدر", () => {
    expect(traineeCorrespondenceTemplates).toHaveLength(14);
    expect(new Set(traineeCorrespondenceTemplates.map(template => template.source)).size).toBe(14);
  });

  it("يضمن أن كل قالب مصنف وله مستلم ومسار وحقول تعبئة", () => {
    for (const template of traineeCorrespondenceTemplates) {
      expect(template.category).toBeTruthy();
      expect(template.recipient).toBeTruthy();
      expect(template.route).toContain("←");
      expect(template.fields.length).toBeGreaterThan(0);
      expect(template.body).toContain("{{اسم الملازم}}");
    }
  });

  it("يغطي الفئات التشغيلية الأربع", () => {
    expect(new Set(traineeCorrespondenceTemplates.map(template => template.category))).toEqual(new Set(["متابعة الأداء", "العمل عن بعد", "التشكيلات", "الإجازات والحضور"]));
  });
});
