import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  visible: true,
  addAttachment: vi.fn(async () => ({ id: 91, originalName: "طلب.pdf", mimeType: "application/pdf", sizeBytes: 12, storageUrl: "https://storage.example/91" })),
  listAttachments: vi.fn(async () => [{ id: 91, originalName: "طلب.pdf", mimeType: "application/pdf", sizeBytes: 12, storageUrl: "https://storage.example/91" }]),
}));

vi.mock("../db", () => ({ getDb: vi.fn(async () => null) }));
vi.mock("./court-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./court-service")>();
  return {
    ...actual,
    getAccessPermission: vi.fn(async () => "employee"),
    getEffectiveRoles: vi.fn(async () => []),
    getProfileForUser: vi.fn(async () => ({ id: 22, personType: "administrative" })),
    getCorrespondenceById: vi.fn(async () => ({ id: 60, senderProfileId: 22, status: "in_review" })),
    listCorrespondencesForProfile: vi.fn(async () => mocks.visible ? [{ correspondence: { id: 60 } }] : []),
    listCorrespondenceAttachments: mocks.listAttachments,
    addCorrespondenceAttachment: mocks.addAttachment,
  };
});

import { courtRouter } from "./routers/court";

const caller = () => courtRouter.createCaller({ user: { id: 7, role: "user", email: "employee@court.example", name: "موظف", openId: "employee" } } as never);

describe("مرفقات الطلبات والمراسلات", () => {
  it("يعيد مرفقات الطلب المرئي فقط للملف الشخصي المعني", async () => {
    mocks.visible = true;
    await expect(caller().correspondence.attachments.list({ correspondenceId: 60 })).resolves.toHaveLength(1);
    expect(mocks.listAttachments).toHaveBeenCalledWith(60);
  });

  it("يرفض عرض مرفقات طلب خارج نطاق الملف الشخصي", async () => {
    mocks.visible = false;
    await expect(caller().correspondence.attachments.list({ correspondenceId: 60 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("يسمح للمرسل بإضافة مرجع مرفق بعد إنشاء الطلب", async () => {
    await expect(caller().correspondence.attachments.upload({ correspondenceId: 60, attachment: { originalName: "طلب.pdf", mimeType: "application/pdf", contentBase64: "JVBERi0=" } })).resolves.toMatchObject({ id: 91 });
    expect(mocks.addAttachment).toHaveBeenCalledWith(expect.objectContaining({ correspondenceId: 60, actorUserId: 7, uploaderProfileId: 22 }));
  });
});
