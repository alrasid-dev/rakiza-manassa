// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import DashboardOptionsPage from "./DashboardOptionsPage";

afterEach(() => cleanup());

describe("نماذج لوحة التحكم البديلة", () => {
  it("يعرض ثلاثة نماذج متمايزة ويؤكد اختيار النموذج المطلوب", () => {
    render(<DashboardOptionsPage />);

    expect(screen.getByText("المطابق لتكوين الصورة")).toBeTruthy();
    expect(screen.getByText("دفتر المتابعة القضائي")).toBeTruthy();
    expect(screen.getByText("التركيز اليومي المتجاوب")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "اختيار النموذج 2" }));
    expect(screen.getByText(/تم تحديد: النموذج 2/)).toBeTruthy();
  });
});
