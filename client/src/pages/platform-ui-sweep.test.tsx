// @vitest-environment jsdom
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cleanup } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { accessibleName, createTrpcMock, installBrowserStubs, mountPage, sweepInteractiveControls, type SweepReport } from "@/test/ui-harness";
import { PLATFORM_PAGES } from "@/test/platform-pages";

vi.mock("@/lib/trpc", () => createTrpcMock());

vi.mock("@/components/DashboardLayout", async importOriginal => {
  const actual = await importOriginal<typeof import("@/components/DashboardLayout")>();
  return {
    ...actual,
    default: ({ children }: { children: React.ReactNode }) => <main data-testid="rakiza-shell">{children}</main>,
  };
});

beforeEach(() => { installBrowserStubs(); });
afterEach(() => { cleanup(); });

type PageAudit = {
  label: string;
  path: string;
  controls: number;
  clicked: number;
  disabled: number;
  unlabeled: string[];
  icons: number;
  interactiveIconsWithoutName: string[];
  decorativeIcons: number;
  brokenGeometry: string[];
  errors: string[];
};

const audits: PageAudit[] = [];

/** يفحص كل أيقونة: تمييز أيقونات الأزرار (خلل) عن الأيقونات الزخرفية (ملاحظة)، والتحقق من رسمها. */
function auditIcons(container: HTMLElement) {
  const svgs = Array.from(container.querySelectorAll("svg"));
  const interactiveIconsWithoutName: string[] = [];
  const decorativeUnmarked: string[] = [];
  const brokenGeometry: string[] = [];

  for (const svg of svgs) {
    const label = svg.getAttribute("class")?.split(" ").filter(name => name.startsWith("lucide"))[0] || svg.getAttribute("class") || "svg";
    const interactive = svg.closest("button, a[href], [role]") as HTMLElement | null;
    if (svg.querySelectorAll("path, line, circle, rect, polyline, polygon, ellipse").length === 0) brokenGeometry.push(label);
    if (svg.getAttribute("aria-hidden") === "true") continue;
    const named = interactive ? accessibleName(interactive) : "";

    if (interactive) {
      if (!named) interactiveIconsWithoutName.push(label);
      continue;
    }
    if (svg.getAttribute("role") === "img" && (svg.getAttribute("aria-label") || svg.querySelector("title")?.textContent)) continue;
    decorativeUnmarked.push(label);
  }

  return { total: svgs.length, interactiveIconsWithoutName, decorativeUnmarked, brokenGeometry };
}

function auditPage(page: { path: string; label: string; component: React.ComponentType }) {
  const Page = page.component;
  const { container } = mountPage(<Page />);
  const report: SweepReport = sweepInteractiveControls(container);
  const icons = auditIcons(container);
  const audit: PageAudit = {
    label: page.label,
    path: page.path,
    controls: report.controls.length,
    clicked: report.clicked,
    disabled: report.skipped,
    unlabeled: report.unlabeled.map(control => `${control.tag}:${control.name || control.element.outerHTML.slice(0, 180)}`),
    icons: icons.total,
    interactiveIconsWithoutName: icons.interactiveIconsWithoutName,
    decorativeIcons: icons.decorativeUnmarked.length,
    brokenGeometry: icons.brokenGeometry,
    errors: report.errors,
  };
  audits.push(audit);
  return audit;
}

describe("فحص كل زر وأيقونة ومدخل في صفحات المنصة", () => {
  for (const page of PLATFORM_PAGES) {
    it(`تُركَّب وتستجيب كل عناصرها: ${page.label}`, () => {
      const audit = auditPage(page);
      expect(audit.errors, `أخطاء تشغيل في ${page.label}: ${audit.errors.join(" | ")}`).toEqual([]);
    });
  }

  it("تُغطي الاختبارات كل مسارات المنصة المسجلة", () => {
    expect(PLATFORM_PAGES.length).toBeGreaterThanOrEqual(50);
    expect(new Set(PLATFORM_PAGES.map(page => page.path)).size).toBe(PLATFORM_PAGES.length);
  });

  it("لا يوجد زر أو أيقونة تفاعلية بلا اسم مقروء", () => {
    const offenders = audits.filter(audit => audit.unlabeled.length > 0).map(audit => `${audit.label} (${audit.path}): ${audit.unlabeled.slice(0, 6).join(", ")}`);
    expect(offenders, `عناصر بلا اسم مقروء:\n${offenders.join("\n")}`).toEqual([]);
  });

  it("لا توجد أيقونة داخل عنصر تفاعلي بلا اسم مقروء", () => {
    const offenders = audits.filter(audit => audit.interactiveIconsWithoutName.length > 0).map(audit => `${audit.label} (${audit.path}): ${audit.interactiveIconsWithoutName.slice(0, 6).join(", ")}`);
    expect(offenders, `أيقونات في عناصر تفاعلية بلا اسم:\n${offenders.join("\n")}`).toEqual([]);
  });

  it("كل أيقونة ترسم شكلاً فعلياً داخل SVG (لا أيقونة مكسورة)", () => {
    const offenders = audits.filter(audit => audit.brokenGeometry.length > 0).map(audit => `${audit.label} (${audit.path}): ${audit.brokenGeometry.slice(0, 6).join(", ")}`);
    expect(offenders, `أيقونات بلا مسارات:\n${offenders.join("\n")}`).toEqual([]);
  });

  it("يطبع تقرير التغطية النهائي ويكتب نسخة JSON", () => {
    const totals = audits.reduce((sum, audit) => ({
      controls: sum.controls + audit.controls,
      clicked: sum.clicked + audit.clicked,
      disabled: sum.disabled + audit.disabled,
      icons: sum.icons + audit.icons,
      pages: sum.pages + 1,
    }), { controls: 0, clicked: 0, disabled: 0, icons: 0, pages: 0 });
    const lines = audits.map(audit => `${audit.path.padEnd(34)} عناصر=${String(audit.controls).padStart(3)} مضغوط=${String(audit.clicked).padStart(3)} معطّل=${String(audit.disabled).padStart(2)} أيقونات=${String(audit.icons).padStart(3)} زخرفية=${String(audit.decorativeIcons).padStart(3)}`);
    const decorativeTotal = audits.reduce((sum, audit) => sum + audit.decorativeIcons, 0);
    console.log([`\n=== تقرير تغطية الواجهة ===`, ...lines, `الإجمالي: صفحات=${totals.pages} عناصر=${totals.controls} مضغوط=${totals.clicked} معطّل=${totals.disabled} أيقونات=${totals.icons}`, `ملاحظة تحسين (غير مُفشِلة): أيقونات زخرفية بلا aria-hidden = ${decorativeTotal}`].join("\n"));
    const reportPath = join(tmpdir(), "rakiza-ui-sweep.json");
    writeFileSync(reportPath, JSON.stringify({ totals, decorativeTotal, audits }, null, 2), "utf8");
    console.log(`تقرير JSON: ${reportPath}`);
    expect(totals.pages).toBe(PLATFORM_PAGES.length);
    expect(totals.clicked).toBeGreaterThan(0);
  });
});
