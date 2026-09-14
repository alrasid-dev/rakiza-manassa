// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const passkeyMutate = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    court: {
      passkey: {
        beginRegistration: { useMutation: () => ({ mutateAsync: passkeyMutate, isPending: false }) },
        finishRegistration: { useMutation: () => ({ mutateAsync: passkeyMutate, isPending: false }) },
        beginAuthentication: { useMutation: () => ({ mutateAsync: passkeyMutate, isPending: false }) },
        finishAuthentication: { useMutation: () => ({ mutateAsync: passkeyMutate, isPending: false }) },
      },
    },
  },
}));

vi.mock("@/components/FirebaseAuthPanel", () => ({
  FirebaseAuthPanel: ({ officialEmail, validOfficialEmail }: { officialEmail: string; validOfficialEmail: boolean }) => (
    <div data-testid="password-panel">
      <span data-testid="panel-email">{officialEmail}</span>
      <span data-testid="panel-valid">{validOfficialEmail ? "valid" : "invalid"}</span>
      <label>كلمة المرور<input aria-label="كلمة المرور" type="password" /></label>
      <button type="button">دخول</button>
    </div>
  ),
}));

vi.mock("@/components/OwnerGoogleLogin", () => ({
  PLATFORM_OWNER_EMAIL: "rakizaplatform@gmail.com",
  OwnerGoogleLogin: () => <div data-testid="owner-google"><button type="button" aria-label="الدخول عبر Google بحساب مالك المنصة">الدخول عبر Google</button></div>,
}));

vi.mock("@/components/PwaInstallHint", () => ({ PwaInstallHint: () => null }));

import { AuthExperimentPage } from "./AuthExperimentPage";

beforeEach(() => { window.localStorage.clear(); });
afterEach(() => { cleanup(); passkeyMutate.mockReset(); });

describe("شاشة تسجيل الدخول المبسطة", () => {
  it("تعرض الحقلين المطلوبين فقط: البريد الرسمي وكلمة المرور", () => {
    render(<AuthExperimentPage />);
    expect(screen.getByLabelText("البريد الإلكتروني الرسمي")).toBeTruthy();
    expect(screen.getByLabelText("كلمة المرور")).toBeTruthy();
    expect(screen.getByTestId("password-panel")).toBeTruthy();
  });

  it("لا تعرض أي خيار لرمز OTP أو مفتاح المرور داخل نموذج الدخول", () => {
    render(<AuthExperimentPage />);
    expect(screen.queryByRole("button", { name: /رمز OTP/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /^مفتاح مرور/ })).toBeNull();
    expect(screen.queryByPlaceholderText("000000")).toBeNull();
    expect(screen.queryByText(/إرسال رمز تحقق/)).toBeNull();
  });

  it("ترفض أي بريد خارج نطاق moj.gov.sa ولا تمرره للوحة كلمة المرور", () => {
    render(<AuthExperimentPage />);
    fireEvent.change(screen.getByLabelText("البريد الإلكتروني الرسمي"), { target: { value: "user@example.com" } });
    expect(screen.getByRole("alert").textContent).toContain("moj.gov.sa");
    expect(screen.getByTestId("panel-valid").textContent).toBe("invalid");
  });

  it("تقبل البريد الرسمي وتمرره للوحة كلمة المرور", () => {
    render(<AuthExperimentPage />);
    fireEvent.change(screen.getByLabelText("البريد الإلكتروني الرسمي"), { target: { value: "employee@moj.gov.sa" } });
    expect(screen.getByTestId("panel-valid").textContent).toBe("valid");
    expect(screen.getByTestId("panel-email").textContent).toBe("employee@moj.gov.sa");
  });

  it("تعرض زراً مستقلاً لتفعيل البصمة والدخول بها", () => {
    render(<AuthExperimentPage />);
    expect(screen.getByRole("button", { name: "تفعيل الدخول بالبصمة على هذا الجهاز" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "الدخول بالبصمة المسجلة على هذا الجهاز" })).toBeTruthy();
  });

  it("تنبّه المستخدم عند طلب تفعيل البصمة بلا بريد رسمي", () => {
    render(<AuthExperimentPage />);
    fireEvent.click(screen.getByRole("button", { name: "تفعيل الدخول بالبصمة على هذا الجهاز" }));
    expect(screen.getByText(/أدخل بريدك الرسمي المنتهي بـ @moj.gov.sa/)).toBeTruthy();
    expect(passkeyMutate).not.toHaveBeenCalled();
  });

  it("تعرض اختصارات أسفل الشاشة ومنها دخول المالك", () => {
    render(<AuthExperimentPage />);
    expect(screen.getByRole("button", { name: "دخول المالك" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /تسجيل موظف جديد/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /الحصول على المساعدة/ })).toBeTruthy();
  });

  it("تفتح مسار المالك عبر Google فقط وتحجب حقول كلمة المرور", () => {
    render(<AuthExperimentPage />);
    fireEvent.click(screen.getByRole("button", { name: "دخول المالك" }));
    expect(screen.getByTestId("owner-google")).toBeTruthy();
    expect(screen.getByRole("button", { name: "الدخول عبر Google بحساب مالك المنصة" })).toBeTruthy();
    expect(screen.queryByTestId("password-panel")).toBeNull();
    expect(screen.queryByLabelText("البريد الإلكتروني الرسمي")).toBeNull();
  });

  it("تعود من مسار المالك إلى دخول الموظفين", () => {
    render(<AuthExperimentPage />);
    fireEvent.click(screen.getByRole("button", { name: "دخول المالك" }));
    fireEvent.click(screen.getByRole("button", { name: "رجوع إلى دخول الموظفين" }));
    expect(screen.getByLabelText("البريد الإلكتروني الرسمي")).toBeTruthy();
    expect(screen.queryByTestId("owner-google")).toBeNull();
  });
});
