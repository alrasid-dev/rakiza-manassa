import { describe, expect, it } from "vitest";
import { isAllowedTrpcMutationOrigin } from "./originGuard";

describe("ضابط منشأ طفرات tRPC", () => {
  it("يقبل طلب POST من أصل المنصة المطابق", () => {
    expect(isAllowedTrpcMutationOrigin({ method: "POST", origin: "https://court.example", forwardedHost: "court.example", forwardedProto: "https" })).toBe(true);
  });

  it("يرفض طلب POST بلا منشأ أو من موقع مختلف", () => {
    expect(isAllowedTrpcMutationOrigin({ method: "POST", forwardedHost: "court.example", forwardedProto: "https" })).toBe(false);
    expect(isAllowedTrpcMutationOrigin({ method: "POST", origin: "https://attacker.example", forwardedHost: "court.example", forwardedProto: "https" })).toBe(false);
  });

  it("لا يعرقل استعلامات tRPC غير المتغيرة", () => {
    expect(isAllowedTrpcMutationOrigin({ method: "GET" })).toBe(true);
  });
});
