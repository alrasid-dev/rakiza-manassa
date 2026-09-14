import { describe, expect, it } from "vitest";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, PASSWORD_POLICY_HINT, validateLoginPassword, validateNewPassword } from "./password-policy";

describe("سياسة كلمة المرور في رَكيزة", () => {
  it("تقبل كلمة مرور من أحرف وأرقام بالعربية أو الإنجليزية", () => {
    for (const password of ["rakiza2026", "Rakiza-2026!", "كلمةمرور1", "محكمة2026", "ركيزة٢٠٢٦"]) {
      expect(validateNewPassword(password)).toEqual({ ok: true, message: "" });
    }
  });

  it("ترفض كلمة المرور الأقصر من الحد الأدنى أو الأطول من الحد الأعلى", () => {
    expect(validateNewPassword("rk2026")).toEqual({ ok: false, message: `كلمة المرور يجب أن تكون ${PASSWORD_MIN_LENGTH} خانات على الأقل.` });
    expect(validateNewPassword("ر1")).toMatchObject({ ok: false });
    expect(validateNewPassword(`${"a1".repeat(PASSWORD_MAX_LENGTH / 2)}a1`)).toEqual({ ok: false, message: `كلمة المرور يجب ألا تتجاوز ${PASSWORD_MAX_LENGTH} خانة.` });
  });

  it("ترفض كلمة مرور من أرقام فقط أو من أحرف فقط", () => {
    expect(validateNewPassword("12345678")).toMatchObject({ ok: false, message: "أضف حرفاً واحداً على الأقل إلى كلمة المرور." });
    expect(validateNewPassword("abcdefgh")).toMatchObject({ ok: false, message: "أضف رقماً واحداً على الأقل إلى كلمة المرور." });
    expect(validateNewPassword("كلمةالمرور")).toMatchObject({ ok: false, message: "أضف رقماً واحداً على الأقل إلى كلمة المرور." });
    expect(validateNewPassword("٩٨٧٦٥٤٣٢")).toMatchObject({ ok: false, message: "أضف حرفاً واحداً على الأقل إلى كلمة المرور." });
  });

  it("ترفض القيمة الفارغة والمسافات فقط", () => {
    expect(validateNewPassword("")).toEqual({ ok: false, message: "أدخل كلمة المرور." });
    expect(validateNewPassword("        ")).toMatchObject({ ok: false });
  });

  it("تقبل دخول كلمة المرور القديمة بالطول فقط دون فرض تعقيد جديد", () => {
    expect(validateLoginPassword("abcdefgh")).toEqual({ ok: true, message: "" });
    expect(validateLoginPassword("12345678")).toEqual({ ok: true, message: "" });
    expect(validateLoginPassword("rk2026")).toMatchObject({ ok: false });
    expect(validateLoginPassword("")).toEqual({ ok: false, message: "أدخل كلمة المرور." });
  });

  it("يعرض تلميحاً موحّداً يوضح القاعدة للمستخدم", () => {
    expect(PASSWORD_POLICY_HINT).toContain(String(PASSWORD_MIN_LENGTH));
    expect(PASSWORD_POLICY_HINT).toContain("حرفاً ورقماً");
  });
});
