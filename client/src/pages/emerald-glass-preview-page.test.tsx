// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import EmeraldGlassPreviewPage from "./EmeraldGlassPreviewPage";

afterEach(() => cleanup());

describe("معاينة الزجاج الزمردي", () => {
  it("تعرض لوحة ركيزة الزجاجية وعناصر المقارنة البصرية", () => {
    render(<EmeraldGlassPreviewPage />);

    expect(screen.getByText("لوحة القيادة الزجاجية")).toBeTruthy();
    expect(screen.getByText("معاينة تصميم فقط")).toBeTruthy();
    expect(screen.getByText("عمق هادئ بوضوح رسمي")).toBeTruthy();
    expect(screen.getByText("مسار العمل اليومي")).toBeTruthy();
  });
});
