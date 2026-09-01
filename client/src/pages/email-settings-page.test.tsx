// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mutate = vi.fn();
const emailSettingsData = { officialEmail: "worker@moj.gov.sa", notificationEmail: null, notificationEmailVerifiedAt: null, officialEmailIsValid: true };
vi.mock("@/lib/trpc", () => ({ trpc: { court: { emailSettings: { mine: { useQuery: () => ({ data: emailSettingsData, refetch: vi.fn() }) }, update: { useMutation: () => ({ mutate, isPending: false, isSuccess: false, error: null }) } } } } }));
vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/ui/button", () => ({ Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button> }));

afterEach(() => { cleanup(); mutate.mockClear(); });

import { EmailSettingsPage } from "./EmailSettingsPage";

describe("إعدادات البريد", () => {
  it("يثبت البريد الرسمي ويحفظ بريد الإشعارات بشكل مستقل", async () => {
    render(<EmailSettingsPage />);
    expect(screen.getByText("worker@moj.gov.sa")).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText("alerts@example.com"), { target: { value: "worker@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "حفظ بريد الإشعارات" }));
    expect(mutate).toHaveBeenCalledWith({ notificationEmail: "worker@example.com" });
  });
});
