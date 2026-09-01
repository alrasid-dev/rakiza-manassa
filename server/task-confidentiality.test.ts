import { describe, expect, it } from "vitest";
import { isTaskVisibleToProfile } from "./court-service";

describe("task confidentiality visibility", () => {
  it("keeps ordinary tasks visible", () => {
    expect(isTaskVisibleToProfile({ isConfidential: false, assigneeProfileId: 11, watcherProfileId: null }, 99)).toBe(true);
  });

  it("limits confidential tasks to assignee or watcher", () => {
    const task = { isConfidential: true, assigneeProfileId: 11, watcherProfileId: 22 };
    expect(isTaskVisibleToProfile(task, 11)).toBe(true);
    expect(isTaskVisibleToProfile(task, 22)).toBe(true);
    expect(isTaskVisibleToProfile(task, 99)).toBe(false);
  });

  it("opens a temporary secret task after its expiry while keeping permanent secrecy closed", () => {
    const now = new Date("2026-08-23T10:00:00.000Z");
    const temporaryTask = { isConfidential: true, confidentialityExpiresAt: new Date("2026-08-23T09:59:00.000Z"), assigneeProfileId: 11, watcherProfileId: null };
    const permanentTask = { isConfidential: true, confidentialityExpiresAt: null, assigneeProfileId: 11, watcherProfileId: null };
    expect(isTaskVisibleToProfile(temporaryTask, 99, now)).toBe(true);
    expect(isTaskVisibleToProfile(permanentTask, 99, now)).toBe(false);
  });
});
