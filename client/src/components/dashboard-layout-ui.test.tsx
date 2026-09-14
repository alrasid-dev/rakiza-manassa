// @vitest-environment jsdom
import { cleanup } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTrpcMock, installBrowserStubs, mountPage, sweepInteractiveControls } from "@/test/ui-harness";
import DashboardLayout from "./DashboardLayout";

vi.mock("@/lib/trpc", () => createTrpcMock());

beforeEach(() => { installBrowserStubs(); });
afterEach(() => { cleanup(); });

describe("فحص هيكل التطبيق (الشريط والتنقل والأيقونات)", () => {
  it("يُركَّب الهيكل كاملاً وتستجيب كل أزراره وأيقوناته", () => {
    const { container } = mountPage(
      <DashboardLayout>
        <div data-testid="page-content">محتوى تجريبي</div>
      </DashboardLayout>,
    );
    const report = sweepInteractiveControls(container);
    console.log(`هيكل التطبيق: عناصر=${report.controls.length} مضغوط=${report.clicked} معطّل=${report.skipped} بلا اسم=${report.unlabeled.length}`);
    expect(report.errors, `أخطاء تشغيل في الهيكل: ${report.errors.join(" | ")}`).toEqual([]);
    expect(report.controls.length).toBeGreaterThan(10);
    expect(report.unlabeled.map(control => control.tag + ":" + control.element.outerHTML.slice(0, 160))).toEqual([]);
  });
});
