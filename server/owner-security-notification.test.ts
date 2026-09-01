import { describe, expect, it } from "vitest";
import { buildOwnerSecurityNotification } from "./court-service";

describe("تنبيه أمان مالك المنصة", () => {
  it("يستخدم ملف المالك كمستلم وحيد ويخفي التفاصيل الزائدة", () => {
    const notification = buildOwnerSecurityNotification({ ownerProfileId: 42, actorUserId: 7, action: "attendance.record_attempt_failed", entityType: "attendance", entityId: 99 });
    expect(notification.profileId).toBe(42);
    expect(notification.category).toBe("security_alert");
    expect(notification.title).toContain("مالك");
    expect(notification.body).toContain("attendance.record_attempt_failed");
    expect(notification).not.toHaveProperty("recipientProfileIds");
    expect(notification).not.toHaveProperty("details");
  });
});
