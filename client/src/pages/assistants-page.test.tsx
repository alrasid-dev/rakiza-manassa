import { describe, expect, it } from "vitest";
import { fallbackAssistants } from "./assistant-catalog";

describe("واجهة مساعدي رَكيزة", () => {
  it("تعرض مساعد القسم الآمن فقط عند تعذر تحميل الكتالوج", () => {
    expect(fallbackAssistants.map(item => item.key)).toEqual(["department"]);
    expect(fallbackAssistants.every(item => item.label.startsWith("مساعد"))).toBe(true);
  });

  it("تقدم وصفاً عملياً لكل مساعد", () => {
    expect(fallbackAssistants.every(item => item.description.length > 20)).toBe(true);
  });
});
