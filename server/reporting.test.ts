import { describe, expect, it } from "vitest";
import { reportStart } from "./reporting";

describe("نطاق التقارير الدورية", () => {
  const now = new Date("2026-08-14T13:00:00Z");
  it("يبدأ التقرير اليومي من بداية اليوم بالتوقيت الموحد", () => {
    expect(reportStart("daily", now).toISOString()).toBe("2026-08-14T00:00:00.000Z");
  });
  it("يبدأ التقرير الأسبوعي من يوم الاثنين", () => {
    expect(reportStart("weekly", now).toISOString()).toBe("2026-08-10T00:00:00.000Z");
  });
  it("يبدأ التقرير الشهري من أول الشهر والتاريخي من البداية", () => {
    expect(reportStart("monthly", now).toISOString()).toBe("2026-08-01T00:00:00.000Z");
    expect(reportStart("historical", now).toISOString()).toBe("1970-01-01T00:00:00.000Z");
  });
});
