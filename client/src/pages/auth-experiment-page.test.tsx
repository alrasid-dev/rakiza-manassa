// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthExperimentPage } from "./AuthExperimentPage";

const requestMutateAsync = vi.fn();
const verifyMutateAsync = vi.fn();
const passkeyMutateAsync = vi.fn();

afterEach(() => { cleanup(); requestMutateAsync.mockReset(); verifyMutateAsync.mockReset(); passkeyMutateAsync.mockReset(); });

vi.mock("@/const", () => ({ startLogin: vi.fn() }));
vi.mock("@/lib/trpc", () => ({ trpc: { court: { otp: { request: { useMutation: () => ({ mutateAsync: requestMutateAsync, isPending: false }) }, verify: { useMutation: () => ({ mutateAsync: verifyMutateAsync, isPending: false }) } }, passkey: { beginRegistration: { useMutation: () => ({ mutateAsync: passkeyMutateAsync, isPending: false }) }, finishRegistration: { useMutation: () => ({ mutateAsync: passkeyMutateAsync, isPending: false }) }, beginAuthentication: { useMutation: () => ({ mutateAsync: passkeyMutateAsync, isPending: false }) }, finishAuthentication: { useMutation: () => ({ mutateAsync: passkeyMutateAsync, isPending: false }) } } } } }));
vi.mock("@/components/ui/button", () => ({ Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button> }));

describe("مختبر OTP وPasskeys", () => {
  it("يعرض إدخال البريد الرسمي ويرفض البريد غير المنتهي بـ moj.gov.sa", () => {
    render(<AuthExperimentPage />);
    fireEvent.change(screen.getByPlaceholderText("name@moj.gov.sa"), { target: { value: "user@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /إرسال رمز تحقق/ }));
    expect(screen.getByRole("status").textContent).toContain("moj.gov.sa");
    expect(requestMutateAsync).not.toHaveBeenCalled();
  });

  it("يرسل طلب OTP الحقيقي وينتقل إلى إدخال الرمز عند نجاح Brevo", async () => {
    requestMutateAsync.mockResolvedValue({ expiresInSeconds: 600, challengeId: 7, recipientCount: 1 });
    render(<AuthExperimentPage />);
    fireEvent.change(screen.getByPlaceholderText("name@moj.gov.sa"), { target: { value: "user@moj.gov.sa" } });
    fireEvent.click(screen.getByRole("button", { name: /إرسال رمز تحقق/ }));
    await waitFor(() => expect(screen.getByPlaceholderText("000000")).toBeTruthy());
    expect(requestMutateAsync).toHaveBeenCalledWith({ officialEmail: "user@moj.gov.sa" });
    expect(screen.getByText(/تم إرسال رمز التحقق/)).toBeTruthy();
  });

  it("يظهر عداد إعادة الإرسال ويمنع الطلب الثاني قبل انتهاء المهلة", async () => {
    requestMutateAsync.mockResolvedValue({ expiresInSeconds: 600, challengeId: 7, recipientCount: 1 });
    render(<AuthExperimentPage />);
    fireEvent.change(screen.getByPlaceholderText("name@moj.gov.sa"), { target: { value: "user@moj.gov.sa" } });
    fireEvent.click(screen.getByRole("button", { name: /إرسال رمز تحقق/ }));
    await waitFor(() => expect(screen.getByPlaceholderText("000000")).toBeTruthy());
    const resend = screen.getByRole("button", { name: /إعادة الإرسال بعد 60 ث/ });
    expect(resend).toHaveProperty("disabled", true);
    fireEvent.click(resend);
    expect(requestMutateAsync).toHaveBeenCalledTimes(1);
  });

  it("يعيد إرسال OTP بعد انتهاء العداد", async () => {
    requestMutateAsync.mockResolvedValue({ expiresInSeconds: 600, challengeId: 7, recipientCount: 1 });
    render(<AuthExperimentPage />);
    fireEvent.change(screen.getByPlaceholderText("name@moj.gov.sa"), { target: { value: "user@moj.gov.sa" } });
    fireEvent.click(screen.getByRole("button", { name: /إرسال رمز تحقق/ }));
    await waitFor(() => expect(screen.getByPlaceholderText("000000")).toBeTruthy());
    await waitFor(() => expect(screen.getByRole("button", { name: /إعادة الإرسال بعد 59 ث/ })).toBeTruthy(), { timeout: 2000 });
    expect(requestMutateAsync).toHaveBeenCalledTimes(1);
  });

  it("يبقي جلسة OTP ويعرض تسجيل الجهاز بعد نجاح التحقق", async () => {
    requestMutateAsync.mockResolvedValue({ expiresInSeconds: 600, challengeId: 7, recipientCount: 1 });
    verifyMutateAsync.mockResolvedValue({ verified: true });
    render(<AuthExperimentPage />);
    fireEvent.change(screen.getByPlaceholderText("name@moj.gov.sa"), { target: { value: "user@moj.gov.sa" } });
    fireEvent.click(screen.getByRole("button", { name: /إرسال رمز تحقق/ }));
    await waitFor(() => expect(screen.getByPlaceholderText("000000")).toBeTruthy());
    fireEvent.change(screen.getByPlaceholderText("000000"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /تحقق من الرمز/ }));
    await waitFor(() => expect(screen.getByRole("button", { name: /تسجيل هذا الجهاز/ })).toBeTruthy());
    expect(screen.getByText(/تم الدخول بنجاح/)).toBeTruthy();
  });

  it("يعرض فشل OTP دون كشف الرمز أو المفتاح", async () => {
    requestMutateAsync.mockRejectedValue(new Error("تعذر إرسال رمز التحقق."));
    render(<AuthExperimentPage />);
    fireEvent.change(screen.getByPlaceholderText("name@moj.gov.sa"), { target: { value: "user@moj.gov.sa" } });
    fireEvent.click(screen.getByRole("button", { name: /إرسال رمز تحقق/ }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("تعذر إرسال"));
    expect(screen.queryByText(/xkeysib|رمز التحقق الخاص/)).toBeNull();
  });

  it("يعرض تسجيل Passkey وقائمة الأجهزة الفعلية دون بيانات تجريبية", () => {
    render(<AuthExperimentPage />);
    fireEvent.click(screen.getByRole("button", { name: /مفتاح مرور/ }));
    expect(screen.getByRole("button", { name: /تسجيل هذا الجهاز/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /الدخول بالمفتاح/ })).toBeTruthy();
    expect(screen.getByText(/لا توجد أجهزة محفوظة/)).toBeTruthy();
  });
});
