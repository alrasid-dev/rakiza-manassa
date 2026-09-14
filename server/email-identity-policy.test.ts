import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getDb: vi.fn(), rows: [] as Array<Record<string, unknown>> }));
vi.mock("./db", () => ({ getDb: mocks.getDb }));

import { getNotificationEmailRecipients, isAllowedLoginEmail, isOfficialMojEmail } from "./court-service";

function fakeDb() {
  return { select: () => ({ from: () => ({ where: () => ({ limit: async () => mocks.rows }) }) }) };
}

describe("هوية البريد الرسمي وقنوات التنبيه", () => {
  beforeEach(() => { mocks.rows = []; mocks.getDb.mockResolvedValue(fakeDb()); });
  it("لا يقبل إلا نطاق moj.gov.sa كمعرف رسمي", () => {
    expect(isOfficialMojEmail("employee@moj.gov.sa")).toBe(true);
    expect(isOfficialMojEmail("employee@gmail.com")).toBe(false);
    expect(isAllowedLoginEmail("rakizaplatform@gmail.com")).toBe(true);
    expect(isAllowedLoginEmail("employee@gmail.com")).toBe(false);
  });
  it("يستخدم البريد الرسمي كمعرف ولا يرسل التنبيهات للبريد الإضافي قبل توثيقه", async () => {
    mocks.rows = [{ id: 7, officialEmail: "employee@moj.gov.sa", backupEmail: "employee@example.com", backupEmailVerifiedAt: null }];
    await expect(getNotificationEmailRecipients(7)).resolves.toEqual(["employee@moj.gov.sa"]);
    mocks.rows = [{ id: 7, officialEmail: "employee@moj.gov.sa", backupEmail: "employee@example.com", backupEmailVerifiedAt: new Date() }];
    await expect(getNotificationEmailRecipients(7)).resolves.toEqual(["employee@example.com"]);
  });
  it("يسمح لقناة OTP ببريد المالك المهيأ فقط خارج النطاق الرسمي", async () => {
    mocks.rows = [{ id: 1, officialEmail: "rakizaplatform@gmail.com", backupEmail: null, backupEmailVerifiedAt: null }];
    await expect(getNotificationEmailRecipients(1)).resolves.toEqual(["rakizaplatform@gmail.com"]);
    expect(isAllowedLoginEmail("abdulaziz.stocks11@gmail.com")).toBe(false);
  });
  it("يحترم تفضيل قناة التنبيه عند إرسال بريد المنصة", async () => {
    const base = { id: 7, officialEmail: "employee@moj.gov.sa", backupEmail: "employee@gmail.com", backupEmailVerifiedAt: new Date() };
    mocks.rows = [{ ...base, emailNotificationPreference: "work" }];
    await expect(getNotificationEmailRecipients(7)).resolves.toEqual(["employee@moj.gov.sa"]);
    mocks.rows = [{ ...base, emailNotificationPreference: "backup" }];
    await expect(getNotificationEmailRecipients(7)).resolves.toEqual(["employee@gmail.com"]);
    mocks.rows = [{ ...base, emailNotificationPreference: "both" }];
    await expect(getNotificationEmailRecipients(7)).resolves.toEqual(["employee@moj.gov.sa", "employee@gmail.com"]);
  });
  it("يبقي البريد الإضافي خارج قناة التنبيه قبل توثيقه حتى مع اختيار الاثنين", async () => {
    mocks.rows = [{ id: 7, officialEmail: "employee@moj.gov.sa", backupEmail: "employee@gmail.com", backupEmailVerifiedAt: null, emailNotificationPreference: "both" }];
    await expect(getNotificationEmailRecipients(7)).resolves.toEqual(["employee@moj.gov.sa"]);
    mocks.rows = [{ id: 7, officialEmail: "employee@moj.gov.sa", backupEmail: "employee@gmail.com", backupEmailVerifiedAt: null, emailNotificationPreference: "backup" }];
    await expect(getNotificationEmailRecipients(7)).resolves.toEqual(["employee@moj.gov.sa"]);
  });
  it("لا يعيد أي قناة إذا لم يثبت البريد الرسمي أو كان شخصياً غير مصرح", async () => {
    mocks.rows = [{ id: 7, officialEmail: "employee@gmail.com", backupEmail: "employee@example.com", backupEmailVerifiedAt: new Date() }];
    await expect(getNotificationEmailRecipients(7)).resolves.toEqual([]);
  });
});
