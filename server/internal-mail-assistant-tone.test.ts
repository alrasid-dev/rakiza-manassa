import { describe, expect, it } from "vitest";
import { buildInternalMailAssistantMessages } from "./internal-mail-service";

describe("نبرة اقتراحات بريد ركيزة", () => {
  it("يوجه الرد الرسمي إلى لغة محكمة مهذبة", () => {
    const messages = buildInternalMailAssistantMessages({ subject: "متابعة", body: "يرجى التحديث.", mode: "reply", tone: "formal" });
    expect(messages[0].content).toContain("رسمية مهذبة");
    expect(messages[0].content).toContain("لا تنفذ أي إجراء");
  });

  it("يوجه الرد المختصر إلى إجابة مباشرة من دون التزامات جديدة", () => {
    const messages = buildInternalMailAssistantMessages({ subject: "متابعة", body: "يرجى التحديث.", mode: "reply", tone: "concise" });
    expect(messages[0].content).toContain("مختصراً جداً");
    expect(messages[0].content).toContain("لا تضف وقائع أو التزامات");
  });
});
