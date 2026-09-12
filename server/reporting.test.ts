import { describe, expect, it } from "vitest";
import { previousReportRange, reportStart, startOfUtcDay } from "./reporting";

describe("نطاق التقارير الدورية", () => {
  const now = new Date("2026-08-14T13:00:00Z");
  it("يبدأ التقرير اليومي من بداية اليوم بالتوقيت الموحد", () => {
    expect(reportStart("daily", now).toISOString()).toBe("2026-08-14T00:00:00.000Z");
  });
  it("يبدأ التقرير الأسبوعي من يوم الاثنين", () => {
    expect(reportStart("weekly", now).toISOString()).toBe("2026-08-10T00:00:00.000Z");
  });
  it("يعيد الأسبوع إلى الاثنين السابق عندما يكون اليوم أحداً", () => {
    // 2026-08-16 هو يوم الأحد؛ يجب أن يرجع إلى الاثنين 2026-08-10 وليس اليوم التالي.
    expect(reportStart("weekly", new Date("2026-08-16T23:59:59Z")).toISOString()).toBe("2026-08-10T00:00:00.000Z");
  });
  it("يبدأ الأسبوع من نفس اليوم عندما يكون اليوم اثنين", () => {
    expect(reportStart("weekly", new Date("2026-08-10T09:00:00Z")).toISOString()).toBe("2026-08-10T00:00:00.000Z");
  });
  it("يبدأ التقرير الشهري من أول الشهر والتاريخي من البداية", () => {
    expect(reportStart("monthly", now).toISOString()).toBe("2026-08-01T00:00:00.000Z");
    expect(reportStart("historical", now).toISOString()).toBe("1970-01-01T00:00:00.000Z");
  });
});

describe("startOfUtcDay", () => {
  it("يجرّد وقت اليوم ويثبّت بداية اليوم بالتوقيت الموحد", () => {
    expect(startOfUtcDay(new Date("2026-08-14T13:45:12.500Z")).toISOString()).toBe("2026-08-14T00:00:00.000Z");
  });
});

describe("نطاق الفترة السابقة للمقارنة", () => {
  it("يحسب اليوم السابق كاملاً للتقرير اليومي", () => {
    const range = previousReportRange("daily", new Date("2026-08-14T13:00:00Z"));
    expect(range.startAt.toISOString()).toBe("2026-08-13T00:00:00.000Z");
    expect(range.endAt.toISOString()).toBe("2026-08-14T00:00:00.000Z");
  });
  it("يحسب الأسبوع السابق (٧ أيام) المنتهي ببداية الأسبوع الحالي", () => {
    const range = previousReportRange("weekly", new Date("2026-08-14T13:00:00Z"));
    expect(range.startAt.toISOString()).toBe("2026-08-03T00:00:00.000Z");
    expect(range.endAt.toISOString()).toBe("2026-08-10T00:00:00.000Z");
  });
  it("يحسب الشهر السابق مع مراعاة تغيّر السنة", () => {
    const range = previousReportRange("monthly", new Date("2026-01-15T13:00:00Z"));
    expect(range.startAt.toISOString()).toBe("2025-12-01T00:00:00.000Z");
    expect(range.endAt.toISOString()).toBe("2026-01-01T00:00:00.000Z");
  });
  it("لا يتقاطع نطاق الفترة السابقة مع بداية الفترة الحالية", () => {
    const now = new Date("2026-08-14T13:00:00Z");
    const previous = previousReportRange("monthly", now);
    expect(previous.endAt.toISOString()).toBe(reportStart("monthly", now).toISOString());
  });
});
