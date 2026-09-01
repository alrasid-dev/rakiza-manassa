import { PRIVACY_NOTICE_VERSION } from "../shared/privacy";

export function assertRegistrationPrivacy(input: { privacyNoticeVersion: string; privacyAcknowledged: boolean }) {
  if (!input.privacyAcknowledged || input.privacyNoticeVersion !== PRIVACY_NOTICE_VERSION) {
    throw new Error("يلزم الإقرار بسياسة السرية والطبيعة غير الرسمية للمنصة قبل التسجيل.");
  }
  return { privacyNoticeVersion: PRIVACY_NOTICE_VERSION, privacyAcknowledged: true as const };
}
