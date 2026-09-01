// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ user: { role: "admin" } }) }));
vi.mock("@/lib/trpc", () => ({ trpc: { useUtils: () => ({ court: { decisions: { list: { invalidate: vi.fn() } } } }), court: { decisions: { list: { useQuery: () => ({ data: [{ id: 1, kind: "circular", title: "تعميم اختباري", body: "محتوى منشور", status: "published", publishedAt: new Date("2026-08-18T07:00:00Z") }], isLoading: false }) }, create: { useMutation: () => ({ mutate: vi.fn(), isPending: false, error: null }) }, publish: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) }, markRead: { useMutation: () => ({ mutate: vi.fn() }) } } } } }));

import { DecisionsPage } from "./DecisionsPage";

afterEach(() => cleanup());

describe("صفحة القرارات والتعاميم", () => {
  it("تعرض المنشور وتظهر أدوات المالك", () => {
    render(<DecisionsPage />);
    expect(screen.getByText("القرارات والتعاميم")).toBeTruthy();
    expect(screen.getByText("تعميم اختباري")).toBeTruthy();
    expect(screen.getByRole("button", { name: "تسجيل القراءة" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "حفظ كمسودة" })).toBeTruthy();
  });
});
