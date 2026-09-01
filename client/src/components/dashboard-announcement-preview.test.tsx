import { describe, expect, it } from "vitest";
import { announcementPreviewCopy } from "./DashboardLayout";

describe("ملخص لوحة التعاميم", () => {
  it("يعرض عنوان الإعلان وملخصه ضمن الرأس", () => {
    expect(announcementPreviewCopy({ id: 12, title: "تحديث ساعات العمل", body: "تطبق الساعات الجديدة اعتباراً من الأحد." })).toEqual({
      title: "تحديث ساعات العمل",
      summary: "تطبق الساعات الجديدة اعتباراً من الأحد.",
      isNew: true,
    });
  });

  it("يعرض حالة هادئة عند عدم وجود إعلان ضمن نطاق المستخدم", () => {
    expect(announcementPreviewCopy()).toEqual({
      title: "لا توجد تعاميم جديدة ضمن نطاقك",
      summary: "افتح اللوحة للاطلاع على كل الإعلانات الرسمية.",
      isNew: false,
    });
  });
});
