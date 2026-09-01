import { describe, expect, it } from "vitest";
import { getUnauthenticatedRedirectPath } from "./useAuth";

describe("مسار الدخول المستقل", () => {
  it("يحوّل المستخدم غير المصادق إلى بوابة OTP بدلاً من OAuth", () => {
    expect(getUnauthenticatedRedirectPath()).toBe("/login");
    expect(getUnauthenticatedRedirectPath("/access-management")).toBe("/access-management");
  });
});
