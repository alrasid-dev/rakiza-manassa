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
  it("يسمح لقناة OTP ببريدي المالكين المحددين فقط", async () => {
    mocks.rows = [{ id: 1, officialEmail: "rakizaplatform@gmail.com", backupEmail: null, backupEmailVerifiedAt: null }];
    await expect(getNotificationEmailRecipients(1)).resolves.toEqual(["rakizaplatform@gmail.com"]);
    mocks.rows = [{ id: 2, officialEmail: "abdulaziz.stocks11@gmail.com", backupEmail: null, backupEmailVerifiedAt: null }];
    await expect(getNotificationEmailRecipients(2)).resolves.toEqual(["abdulaziz.stocks11@gmail.com"]);
  });
  it("لا يعيد أي قناة إذا لم يثبت البريد الرسمي أو كان شخصياً غير مصرح", async () => {
    mocks.rows = [{ id: 7, officialEmail: "employee@gmail.com", backupEmail: "employee@example.com", backupEmailVerifiedAt: new Date() }];
    await expect(getNotificationEmailRecipients(7)).resolves.toEqual([]);
  });
});
