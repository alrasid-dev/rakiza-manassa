// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mutate = vi.fn();
let emailSettingsData = {
  officialEmail: "worker@moj.gov.sa",
  notificationEmail: null as string | null,
  notificationEmailVerifiedAt: null as Date | null,
  notificationPreference: "work" as "work" | "backup" | "both",
  officialEmailIsValid: true,
};
vi.mock("@/lib/trpc", () => ({ trpc: { court: { emailSettings: { mine: { useQuery: () => ({ data: emailSettingsData, refetch: vi.fn() }) }, update: { useMutation: () => ({ mutate, isPending: false, isSuccess: false, error: null }) } } } } }));
vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/ui/button", () => ({ Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button> }));

beforeEach(() => {
  emailSettingsData = { officialEmail: "worker@moj.gov.sa", notificationEmail: null, notificationEmailVerifiedAt: null, notificationPreference: "work", officialEmailIsValid: true };
});
afterEach(() => { cleanup(); mutate.mockClear(); });

import { EmailSettingsPage } from "./EmailSettingsPage";

const channelRadio = (label: RegExp) => screen.getByRole("radio", { name: label });

describe("إعدادات البريد", () => {
  it("يثبت البريد الرسمي ويحفظ بريد الإشعارات وتفضيل القناة بشكل مستقل", async () => {
    render(<EmailSettingsPage />);
    expect(screen.getByText("worker@moj.gov.sa")).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText("alerts@example.com"), { target: { value: "worker@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "حفظ بريد الإشعارات" }));
    expect(mutate).toHaveBeenCalledWith({ notificationEmail: "worker@example.com", notificationPreference: "work" });
  });

  it("يعرض ثلاث قنوات إرسال ويمنع الإضافي قبل إضافة بريد إضافي", () => {
    render(<EmailSettingsPage />);
    expect(channelRadio(/البريد الرسمي فقط/).getAttribute("aria-checked")).toBe("true");
    expect(channelRadio(/البريد الإضافي فقط/)).toHaveProperty("disabled", true);
    expect(channelRadio(/البريدان معاً/)).toHaveProperty("disabled", true);
    expect(screen.getByText(/أضف بريداً إضافياً واحفظه أولاً/)).toBeTruthy();
  });

  it("يحفظ اختيار البريدين معاً بعد وجود بريد إضافي", () => {
    emailSettingsData = { ...emailSettingsData, notificationEmail: "worker@gmail.com" };
    render(<EmailSettingsPage />);
    const both = channelRadio(/البريدان معاً/);
    expect(both).toHaveProperty("disabled", false);
    fireEvent.click(both);
    expect(both.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "حفظ بريد الإشعارات" }));
    expect(mutate).toHaveBeenCalledWith({ notificationEmail: "worker@gmail.com", notificationPreference: "both" });
  });

  it("يعرض تفضيل القناة المحفوظ القادم من الخادم", () => {
    emailSettingsData = { ...emailSettingsData, notificationEmail: "worker@gmail.com", notificationEmailVerifiedAt: new Date(), notificationPreference: "backup" };
    render(<EmailSettingsPage />);
    expect(channelRadio(/البريد الإضافي فقط/).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByText("بريد الإشعارات موثق ويستقبل التنبيهات.")).toBeTruthy();
  });
});
