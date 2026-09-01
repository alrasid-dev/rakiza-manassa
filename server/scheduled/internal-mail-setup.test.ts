import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDbMock, createHeartbeatJobMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  createHeartbeatJobMock: vi.fn(),
}));

vi.mock("../db", () => ({ getDb: getDbMock }));
vi.mock("../_core/heartbeat", () => ({ createHeartbeatJob: createHeartbeatJobMock }));

import { ensureInternalMailDispatchHeartbeatJob } from "./internal-mail-setup";

function createDb(existing: { id: number; scheduleCronTaskUid: string | null } | null) {
  const limit = vi.fn().mockResolvedValue(existing ? [existing] : []);
  const insertValues = vi.fn().mockResolvedValue(undefined);
  return {
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit })) })) })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })) })),
    insert: vi.fn(() => ({ values: insertValues })),
    insertValues,
  };
}

describe("مشغل بريد ركيزة الدوري المشترك", () => {
  beforeEach(() => {
    getDbMock.mockReset();
    createHeartbeatJobMock.mockReset();
  });

  it("يعيد استخدام معرف المشغل المحفوظ ولا ينشئ مشغلاً جديداً لكل رسالة", async () => {
    const db = createDb({ id: 4, scheduleCronTaskUid: "cron-internal-mail" });
    getDbMock.mockResolvedValue(db);

    await expect(ensureInternalMailDispatchHeartbeatJob({ userSession: "session-token" })).resolves.toEqual({ taskUid: "cron-internal-mail", created: false });
    expect(createHeartbeatJobMock).not.toHaveBeenCalled();
  });

  it("يحفظ معرف المشغل الدوري المشترك عند إنشائه أول مرة", async () => {
    const db = createDb(null);
    getDbMock.mockResolvedValue(db);
    createHeartbeatJobMock.mockResolvedValue({ taskUid: "cron-created" });

    await expect(ensureInternalMailDispatchHeartbeatJob({ userSession: "session-token" })).resolves.toEqual({ taskUid: "cron-created", created: true });
    expect(createHeartbeatJobMock).toHaveBeenCalledWith(expect.objectContaining({ path: "/api/scheduled/internal-mail-dispatch" }), "session-token");
    expect(db.insertValues).toHaveBeenCalledWith(expect.objectContaining({ jobKey: "internal-mail-dispatch", scheduleCronTaskUid: "cron-created" }));
  });
});
