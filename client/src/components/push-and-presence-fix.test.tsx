import { describe, expect, it } from "vitest";
import { activityStateLabel } from "./DashboardLayout";
import { pushActivationMessage } from "./PushNotificationPrompt";

describe("إصلاح Web Push وحالة النشاط", () => {
  it("يعرض إرشاد HTTPS واضحاً عند رفض الرابط غير الآمن", () => {
    expect(pushActivationMessage(null, false)).toContain("HTTPS");
  });

  it("يفسر الاشتراك القديم برسالة قابلة للتنفيذ", () => {
    expect(pushActivationMessage(new DOMException("old subscription", "InvalidStateError"), true)).toContain("اشتراك قديم");
  });

  it("يعرض حالة العمل فوراً باللغة العربية", () => {
    expect(activityStateLabel("active")).toBe("يعمل على المنصة");
    expect(activityStateLabel("chatting")).toBe("مشغول بمحادثة");
    expect(activityStateLabel("inactive")).toBe("غير نشط");
  });
});
