// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const state = { submitted: [] as Array<{ fullName: string; officialEmail: string; notificationEmail: string; privacyNoticeVersion: string; privacyAcknowledged: boolean }>, data: null as null | { created: boolean; status: string } };

vi.mock("@/lib/trpc", () => ({
  trpc: {
    court: {
      registration: {
        submit: {
          useMutation: () => {
            const [data, setData] = React.useState(state.data);
            return {
              isPending: false,
              error: null,
              data,
              mutate: (input: { fullName: string; officialEmail: string; notificationEmail: string; privacyNoticeVersion: string; privacyAcknowledged: boolean }) => {
                state.submitted.push(input);
                state.data = { created: true, status: "pending" };
                setData(state.data);
              },
            };
          },
        },
      },
    },
  },
}));

vi.mock("wouter", () => ({ useLocation: () => ["/register", vi.fn()] }));

import { RegistrationPage } from "./RegistrationPages";

afterEach(() => {
  cleanup();
  state.submitted = [];
  state.data = null;
});

describe("صفحة طلب التسجيل", () => {
  it("ترسل الاسم الرباعي والبريد الرسمي وتعرض إحالة الطلب للمراجعة", () => {
    render(<RegistrationPage />);
    fireEvent.change(screen.getByPlaceholderText("الاسم الرباعي كما هو في السجل الوظيفي"), { target: { value: "موظف المحكمة الرباعي" } });
    const email = screen.getAllByPlaceholderText("name@moj.gov.sa")[0];
    fireEvent.change(email, { target: { value: "employee" } });
    fireEvent.blur(email);
    expect(screen.getByRole("button", { name: "إرسال طلب التسجيل" }).hasAttribute("disabled")).toBe(true);
    fireEvent.change(screen.getByPlaceholderText("تنبيهاتك@example.com"), { target: { value: "alerts@example.com" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "إرسال طلب التسجيل" }));
    expect(state.submitted).toEqual([{ fullName: "موظف المحكمة الرباعي", officialEmail: "employee@moj.gov.sa", notificationEmail: "alerts@example.com", privacyNoticeVersion: "2026-08-v1", privacyAcknowledged: true }]);
    expect(screen.getByText("تم استلام طلبك وإحالته إلى مالك المنصة للمراجعة.")).toBeTruthy();
  });

  it("يعرض رسالة توضح إضافة النطاق تلقائياً", () => {
    render(<RegistrationPage />);
    expect(document.getElementById("official-email-hint")?.textContent).toContain("سيُضاف النطاق @moj.gov.sa تلقائياً.");
  });

  it("ينظف @ والنطاق اليدوي ويعرض تنبيهاً لطيفاً", () => {
    render(<RegistrationPage />);
    const email = screen.getAllByPlaceholderText("name@moj.gov.sa")[0];
    fireEvent.change(email, { target: { value: "employee@moj.gov.sa" } });
    expect((email as HTMLInputElement).value).toBe("employee");
    expect(screen.getByRole("status").textContent).toContain("سنضيف النطاق تلقائياً");
  });

  it("يكمل نطاق moj.gov.sa عند إدخال اسم المستخدم ومغادرة الحقل", () => {
    render(<RegistrationPage />);
    const email = screen.getAllByPlaceholderText("name@moj.gov.sa")[0];
    fireEvent.change(email, { target: { value: "employee" } });
    expect((email as HTMLInputElement).value).toBe("employee");
    fireEvent.blur(email);
    expect((email as HTMLInputElement).value).toBe("employee@moj.gov.sa");
  });
});
