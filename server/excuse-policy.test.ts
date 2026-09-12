import { describe, expect, it } from "vitest";
import { evaluateExcusePolicy, riyadhParts } from "./excuse-policy";

describe("سياسة الاستئذان", () => {
  it("تفرض مرة واحدة يومياً وحد 240 دقيقة وسقفاً شهرياً 1000", () => {
    const start = new Date("2026-09-11T06:00:00.000Z"); // 09:00 Riyadh
    const end = new Date("2026-09-11T08:00:00.000Z"); // 120 minutes
    expect(evaluateExcusePolicy({ requestType: "permission", startAt: start, endAt: end, existing: [] })).toMatchObject({ ok: true, durationMinutes: 120, escalateToSecretary: false });

    const tooLong = evaluateExcusePolicy({ requestType: "permission", startAt: start, endAt: new Date("2026-09-11T11:00:00.000Z"), existing: [] });
    expect(tooLong.ok).toBe(false);

    const sameDay = evaluateExcusePolicy({
      requestType: "permission",
      startAt: start,
      endAt: end,
      existing: [{ requestType: "permission", status: "approved", startAt: start, endAt: end, durationMinutes: 120 }],
    });
    expect(sameDay.ok).toBe(false);

    const monthCap = evaluateExcusePolicy({
      requestType: "permission",
      startAt: new Date("2026-09-20T06:00:00.000Z"),
      endAt: new Date("2026-09-20T08:00:00.000Z"),
      existing: [{ requestType: "permission", status: "approved", startAt: new Date("2026-09-01T06:00:00.000Z"), endAt: new Date("2026-09-01T22:40:00.000Z"), durationMinutes: 1000 }],
    });
    expect(monthCap.ok).toBe(false);
  });

  it("تصعّد الطلب إلى الأمين بعد تجاوز ثلاثة استئذانات في الشهر وترسل منطق لفت النظر", () => {
    const existing = [1, 2, 3].map(day => ({
      requestType: "permission" as const,
      status: "approved" as const,
      startAt: new Date(`2026-09-0${day}T06:00:00.000Z`),
      endAt: new Date(`2026-09-0${day}T07:00:00.000Z`),
      durationMinutes: 60,
    }));
    const fourth = evaluateExcusePolicy({
      requestType: "permission",
      startAt: new Date("2026-09-10T06:00:00.000Z"),
      endAt: new Date("2026-09-10T07:00:00.000Z"),
      existing,
    });
    expect(fourth).toMatchObject({ ok: true, escalateToSecretary: true, monthlyCount: 4 });
    expect(riyadhParts(new Date("2026-09-11T04:30:00.000Z")).dateKey).toBe("2026-09-11");
  });

  it("لا تطبّق قيود الاستئذان على الإجازة الكاملة", () => {
    expect(evaluateExcusePolicy({
      requestType: "leave",
      startAt: new Date("2026-09-11T00:00:00.000Z"),
      endAt: new Date("2026-09-15T23:59:00.000Z"),
      existing: [],
    }).ok).toBe(true);
  });
});
