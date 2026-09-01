// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DashboardCustomizationDialog, defaultDashboardPreferences } from "./DashboardCustomizationDialog";

afterEach(() => cleanup());

describe("تخصيص لوحة القيادة", () => {
  it("ينقل الاختصار ويخفيه ثم يعيد التفضيلات الافتراضية عند الطلب", () => {
    const onChange = vi.fn();
    render(<DashboardCustomizationDialog open onOpenChange={vi.fn()} preferences={defaultDashboardPreferences()} onChange={onChange} onSave={vi.fn()} isSaving={false} />);

    fireEvent.click(screen.getByLabelText("نقل الإشعارات للأعلى"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ navigationOrder: expect.arrayContaining(["الإشعارات"]) }));

    fireEvent.click(screen.getByLabelText("إخفاء الإشعارات"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ hiddenNavigationLabels: ["الإشعارات"] }));

    fireEvent.click(screen.getByText("استعادة كل الإعدادات"));
    expect(onChange).toHaveBeenLastCalledWith(defaultDashboardPreferences());
  });

  it("يعيد ترتيب اختصارات القائمة بالسحب والإفلات", () => {
    const onChange = vi.fn();
    render(<DashboardCustomizationDialog open onOpenChange={vi.fn()} preferences={defaultDashboardPreferences()} onChange={onChange} onSave={vi.fn()} isSaving={false} />);
    const dataTransfer = { effectAllowed: "", dropEffect: "", setData: vi.fn() };
    fireEvent.dragStart(screen.getByTestId("sortable-اختصارات القائمة اليمنى-الإشعارات"), { dataTransfer });
    fireEvent.drop(screen.getByTestId("sortable-اختصارات القائمة اليمنى-مهامي"), { dataTransfer });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ navigationOrder: ["الإشعارات", "مهامي", ...defaultDashboardPreferences().navigationOrder.slice(2)] }));
  });

  it("يستعيد اختصارات القائمة فقط عبر الإجراء المستقل", () => {
    const onResetNavigation = vi.fn();
    render(<DashboardCustomizationDialog open onOpenChange={vi.fn()} preferences={{ ...defaultDashboardPreferences(), widgetOrder: ["chat", "tasks", "overview", "performance"], navigationOrder: ["الدردشات", "مهامي", "الإشعارات", "بريد ركيزة", "AI ركيزة", "الإعلانات الداخلية", "المتعثرات", "إعدادات المنصة"] }} onChange={vi.fn()} onSave={vi.fn()} onResetNavigation={onResetNavigation} isSaving={false} />);
    fireEvent.click(screen.getByText("استعادة اختصارات القائمة"));
    expect(onResetNavigation).toHaveBeenCalledTimes(1);
  });
});
