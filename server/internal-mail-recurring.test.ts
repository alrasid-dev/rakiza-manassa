import { describe, expect, it } from "vitest";
import { nextInternalMailRecurringRun, normalizeInternalMailRecurringRule } from "./internal-mail-service";

describe("قواعد جدولة بريد ركيزة المرنة", () => {
  it("تكرر الرسالة كل عدد محدد من الأيام مع الحفاظ على وقت البداية", () => {
    const startsAt = new Date("2030-01-10T09:30:00.000Z");
    const next = nextInternalMailRecurringRun({ frequency: "daily", intervalCount: 3, startsAt, after: new Date("2030-01-10T09:30:00.000Z") });
    expect(next?.toISOString()).toBe("2030-01-13T09:30:00.000Z");
  });

  it("يقبل أياماً أسبوعية مختارة ويطبق فاصل الأسابيع", () => {
    const startsAt = new Date("2030-01-06T08:00:00.000Z"); // Sunday
    const next = nextInternalMailRecurringRun({ frequency: "weekly", intervalCount: 2, weekdays: [2, 4], startsAt, after: new Date("2030-01-06T08:00:00.000Z") });
    expect(next?.toISOString()).toBe("2030-01-08T08:00:00.000Z"); // Tuesday in the next eligible week
    const later = nextInternalMailRecurringRun({ frequency: "weekly", intervalCount: 2, weekdays: [2, 4], startsAt, after: new Date("2030-01-10T08:00:00.000Z") });
    expect(later?.toISOString()).toBe("2030-01-22T08:00:00.000Z");
  });

  it("يستخدم آخر يوم متاح عند اختيار اليوم 31 في شهر أقصر", () => {
    const startsAt = new Date("2030-01-31T10:15:00.000Z");
    const next = nextInternalMailRecurringRun({ frequency: "monthly", intervalCount: 1, monthDay: 31, startsAt, after: startsAt });
    expect(next?.toISOString()).toBe("2030-02-28T10:15:00.000Z");
  });

  it("يرفض التكرار الأسبوعي بلا أيام ويوقف ما يقع بعد تاريخ الانتهاء", () => {
    expect(() => normalizeInternalMailRecurringRule({ frequency: "weekly", intervalCount: 1, weekdays: [], startsAt: new Date("2030-01-10T09:00:00.000Z") })).toThrow("اختر يوماً واحداً");
    expect(nextInternalMailRecurringRun({ frequency: "daily", intervalCount: 1, startsAt: new Date("2030-01-10T09:00:00.000Z"), endsAt: new Date("2030-01-10T09:30:00.000Z"), after: new Date("2030-01-10T09:00:00.000Z") })).toBeNull();
  });
});
