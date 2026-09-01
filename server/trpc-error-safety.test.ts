import { describe, expect, it } from "vitest";
import { safeTrpcErrorMessage, stripTrpcStack } from "./trpc-error-safety";

describe("حماية أخطاء tRPC", () => {
  it("تحذف المكدس من بيانات الخطأ قبل إعادتها للعميل", () => {
    expect(stripTrpcStack({ code: "INTERNAL_SERVER_ERROR", stack: "server/path.ts:18", httpStatus: 500 })).toEqual({ code: "INTERNAL_SERVER_ERROR", httpStatus: 500 });
  });
  it("تحافظ على رسائل الرفض المقصود وتعمم رسالة الخطأ الداخلي", () => {
    expect(safeTrpcErrorMessage("FORBIDDEN", "لا تملك الصلاحية المطلوبة.")).toBe("لا تملك الصلاحية المطلوبة.");
    expect(safeTrpcErrorMessage("INTERNAL_SERVER_ERROR", "database password leaked")).toContain("تعذر تنفيذ الطلب");
  });
});
