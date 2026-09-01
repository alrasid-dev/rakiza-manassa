// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AiRakizaTaskPrompt from "./AiRakizaTaskPrompt";

afterEach(() => { cleanup(); sessionStorage.clear(); vi.useRealTimers(); });

describe("تسلسل AI ركيزة وبوابة الحضور", () => {
  it("يؤخر النافذة التلقائية إلى ما بعد بوابة الحضور مع بقاء الفتح اليدوي متاحاً", () => {
    vi.useFakeTimers();
    render(<AiRakizaTaskPrompt tasks={[{ id: 1, title: "مهمة جارية", status: "in_progress" }]} suppressAutoPrompt onStart={vi.fn()} onOpenAssistant={vi.fn()} onOpenMail={vi.fn()} onOpenNotifications={vi.fn()} />);
    vi.advanceTimersByTime(500);
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "فتح مساعد AI ركيزة" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});
