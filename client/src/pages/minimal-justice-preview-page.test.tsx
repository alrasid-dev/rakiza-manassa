// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import MinimalJusticePreviewPage from "./MinimalJusticePreviewPage";

afterEach(() => cleanup());

describe("معاينة اللوحة المعيارية", () => {
  it("تعرض لوحة ركيزة المعيارية وعناصر المراجعة البصرية الأساسية", () => {
    render(<MinimalJusticePreviewPage />);

    expect(screen.getByText("لوحة القيادة المعيارية")).toBeTruthy();
    expect(screen.getByText("معاينة تصميم فقط")).toBeTruthy();
    expect(screen.getByText("وضوح إداري بلا ازدحام")).toBeTruthy();
    expect(screen.getByText("مسار العمل اليومي")).toBeTruthy();
  });
});
