// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import ExecutivePaperPreviewPage from "./ExecutivePaperPreviewPage";

afterEach(() => cleanup());

describe("معاينة الورق التنفيذي", () => {
  it("تعرض لوحة ركيزة التنفيذية وعناصر المقارنة البصرية", () => {
    render(<ExecutivePaperPreviewPage />);

    expect(screen.getByText("لوحة القيادة التنفيذية")).toBeTruthy();
    expect(screen.getByText("معاينة تصميم فقط")).toBeTruthy();
    expect(screen.getByText("سجل يومي بوضوح تنفيذي")).toBeTruthy();
    expect(screen.getByText("مسار العمل اليومي")).toBeTruthy();
  });
});
