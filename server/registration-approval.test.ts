import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
  inserts: [] as Array<{ table: unknown; values: Record<string, unknown> }>,
  updates: [] as Array<Record<string, unknown>>,
}));

vi.mock("./db", () => ({ getDb: mocks.getDb }));

import { reviewRegistrationRequest } from "./court-service";

const pendingRequest = {
  id: 81,
  fullName: "فهد عبدالله محمد القحطاني",
  officialEmail: "fahad@court.example",
  status: "pending",
};

function createFakeDb() {
  const selectChain = {
    from: () => selectChain,
    where: () => selectChain,
    limit: async () => [pendingRequest],
  };
  return {
    select: () => selectChain,
    update: () => ({
      set: (values: Record<string, unknown>) => ({
        where: async () => {
          mocks.updates.push(values);
        },
      }),
    }),
    insert: (table: unknown) => ({
      values: (values: Record<string, unknown>) => {
        mocks.inserts.push({ table, values });
        return {
          onDuplicateKeyUpdate: async () => undefined,
        };
      },
    }),
  };
}

describe("دورة اعتماد طلب التسجيل", () => {
  beforeEach(() => {
    mocks.inserts.length = 0;
    mocks.updates.length = 0;
    mocks.getDb.mockResolvedValue(createFakeDb());
  });

  it("تنشئ منح وصول بالصلاحية المحددة وتسجل المالك كمانح", async () => {
    await expect(reviewRegistrationRequest({
      requestId: 81,
      decision: "approved",
      permission: "employee",
      note: "تمت المراجعة من المالك",
      reviewedByUserId: 7,
    })).resolves.toBeUndefined();

    expect(mocks.updates).toHaveLength(1);
    expect(mocks.updates[0]).toMatchObject({
      status: "approved",
      reviewNote: "تمت المراجعة من المالك",
      reviewedByUserId: 7,
    });

    const accessGrant = mocks.inserts.find(entry => entry.values.registrationRequestId === 81);
    expect(accessGrant?.values).toMatchObject({
      registrationRequestId: 81,
      fullName: pendingRequest.fullName,
      officialEmail: pendingRequest.officialEmail,
      permission: "employee",
      grantedByUserId: 7,
    });

    const audit = mocks.inserts.find(entry => entry.values.action === "registration.approved");
    expect(audit?.values).toMatchObject({ actorUserId: 7, entityType: "registration_request", entityId: 81 });
  });

  it("ترفض قبول الطلب دون تحديد الصلاحية", async () => {
    await expect(reviewRegistrationRequest({
      requestId: 81,
      decision: "approved",
      reviewedByUserId: 7,
    })).rejects.toThrow("تحديد الصلاحية مطلوب عند قبول الطلب.");
    expect(mocks.updates).toHaveLength(0);
    expect(mocks.inserts).toHaveLength(0);
  });
});
