import { describe, expect, it } from "vitest";
import { reportStorageFilename } from "./court-service";

describe("مفتاح تخزين تقارير الإنجاز", () => {
  it("يحوّل اسم الملف العربي إلى ASCII صالح للتخزين", () => {
    const key = reportStorageFilename("المصنف 1.xlsx");
    expect(key).toMatch(/^[0-9a-f]+$/);
    expect(key).not.toContain("المصنف");
  });

  it("ينتج مفتاحاً ثابتاً لنفس الاسم", () => {
    expect(reportStorageFilename("report.xlsx")).toBe(reportStorageFilename("report.xlsx"));
  });
});
