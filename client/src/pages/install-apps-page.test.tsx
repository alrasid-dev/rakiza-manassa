// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ANDROID_APK_URL } from "@/lib/pwa";
import { InstallAppsPage } from "./InstallAppsPage";

describe("صفحة تثبيت التطبيقات", () => {
  it("تشرح التثبيت على كل الأنظمة وتعطي تحميل أندرويد مجاني", () => {
    render(<InstallAppsPage />);
    expect(screen.getByRole("heading", { name: "ثبّت المنصة كتطبيق" })).toBeTruthy();
    expect(screen.getByText("ويندوز وماك ولينكس")).toBeTruthy();
    expect(screen.getByText("أندرويد")).toBeTruthy();
    expect(screen.getByText("آيفون وآيباد")).toBeTruthy();
    expect(screen.getByRole("link", { name: "تنزيل تطبيق أندرويد" })).toHaveAttribute("href", ANDROID_APK_URL);
  });
});
