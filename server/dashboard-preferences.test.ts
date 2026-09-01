import { describe, expect, it } from "vitest";
import { DASHBOARD_NAVIGATION_LABELS, DASHBOARD_WIDGET_IDS, normalizeDashboardPreferences } from "./court-service";

describe("تفضيلات لوحة القيادة", () => {
  it("يعيد ترتيباً افتراضياً آمناً عند عدم وجود تفضيلات محفوظة", () => {
    expect(normalizeDashboardPreferences(null)).toEqual({ widgetOrder: [...DASHBOARD_WIDGET_IDS], hiddenWidgetIds: [], navigationOrder: [...DASHBOARD_NAVIGATION_LABELS], hiddenNavigationLabels: [] });
  });

  it("يحذف القيم غير المعتمدة والتكرارات ويستعيد الاختصارات المعتمدة المفقودة", () => {
    const preferences = normalizeDashboardPreferences({ widgetOrder: ["tasks", "tasks", "invalid"], hiddenWidgetIds: ["chat", "invalid"], navigationOrder: ["مهامي", "مهامي", "اختصار غير معروف"], hiddenNavigationLabels: ["الدردشات", "اختصار غير معروف"] });
    expect(preferences.widgetOrder).toEqual(["tasks"]);
    expect(preferences.hiddenWidgetIds).toEqual(["chat"]);
    expect(preferences.navigationOrder).toEqual(["مهامي", ...DASHBOARD_NAVIGATION_LABELS.filter(label => label !== "مهامي")]);
    expect(preferences.hiddenNavigationLabels).toEqual(["الدردشات"]);
  });
});
