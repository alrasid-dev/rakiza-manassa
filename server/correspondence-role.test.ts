import { describe, expect, it } from "vitest";
import { correspondenceRoleCapabilities } from "../client/src/lib/correspondenceRole";

describe("تخصيص واجهة المراسلات حسب الدور", () => {
  it("يحصر الملازم في طلبه الذاتي دون اختيار مسار أو توجيه", () => {
    expect(correspondenceRoleCapabilities("trainee", [])).toMatchObject({ isTrainee: true, canCreate: true, canChooseRouting: false, canRoute: false });
  });
  it("يمنح الموظف خيارات التشغيل دون توجيه القرارات الإدارية", () => {
    expect(correspondenceRoleCapabilities("employee", [])).toMatchObject({ isEmployee: true, canCreate: true, canChooseRouting: false, canRoute: false });
  });
  it("يمنح مدير شؤون الملازمين توجيه المسار دون فتح إنشاء عام لصلاحية الاطلاع", () => {
    expect(correspondenceRoleCapabilities("general_view", ["trainee_affairs_manager"])).toMatchObject({ canCreate: false, canRoute: true });
  });
});
