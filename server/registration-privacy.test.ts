import { describe, expect, it } from "vitest";
import { PRIVACY_NOTICE_VERSION } from "../shared/privacy";
import { assertRegistrationPrivacy } from "./registration-privacy";

describe("إقرار التسجيل الأول", () => {
  it("يرفض الطلب إذا لم تتم الموافقة", () => {
    expect(() => assertRegistrationPrivacy({ privacyNoticeVersion: PRIVACY_NOTICE_VERSION, privacyAcknowledged: false })).toThrow("يلزم الإقرار");
  });

  it("يرفض الإصدار القديم ويقبل الإصدار الحالي", () => {
    expect(() => assertRegistrationPrivacy({ privacyNoticeVersion: "old-version", privacyAcknowledged: true })).toThrow("يلزم الإقرار");
    expect(assertRegistrationPrivacy({ privacyNoticeVersion: PRIVACY_NOTICE_VERSION, privacyAcknowledged: true })).toEqual({ privacyNoticeVersion: PRIVACY_NOTICE_VERSION, privacyAcknowledged: true });
  });
});
