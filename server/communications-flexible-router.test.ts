import { beforeEach, describe, expect, it, vi } from "vitest";

const { mocks } = vi.hoisted(() => ({ mocks: {
  createFlexibleCorrespondence: vi.fn(async (input: { userId: number; correspondenceType: string; participantProfileIds: number[]; subject: string; body: string }) => ({ id: 81, taskId: 92, ...input })),
  listCommunicationUnits: vi.fn(async () => [{ id: 90015, name: "قسم تسليم الأحكام", code: "JUDGMENT_DELIVERY" }]),
} }));

vi.mock("./internal-communications-service", async importOriginal => {
  const actual = await importOriginal<typeof import("./internal-communications-service")>();
  return { ...actual, createFlexibleCorrespondence: mocks.createFlexibleCorrespondence, listCommunicationUnits: mocks.listCommunicationUnits };
});

import { courtRouter } from "./routers/court";

describe("communications flexible correspondence", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a direct task/request without hierarchy enforcement", async () => {
    const caller = courtRouter.createCaller({ user: { id: 7, role: "user", email: "employee@moj.gov.sa", name: "موظف", openId: "employee" } } as never);
    await expect(caller.communications.createFlexible({ correspondenceType: "request", participantProfileIds: [14, 15], subject: "طلب مباشر", body: "تفاصيل الطلب" })).resolves.toMatchObject({ id: 81, taskId: 92 });
    expect(mocks.createFlexibleCorrespondence).toHaveBeenCalledWith({ userId: 7, correspondenceType: "request", participantProfileIds: [14, 15], subject: "طلب مباشر", body: "تفاصيل الطلب" });
  });

  it("exposes active communication units for department-first search", async () => {
    const caller = courtRouter.createCaller({ user: { id: 7, role: "user", email: "employee@moj.gov.sa", name: "موظف", openId: "employee" } } as never);
    await expect(caller.communications.units()).resolves.toEqual([{ id: 90015, name: "قسم تسليم الأحكام", code: "JUDGMENT_DELIVERY" }]);
    expect(mocks.listCommunicationUnits).toHaveBeenCalledOnce();
  });
});
