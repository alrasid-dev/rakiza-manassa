// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { NotificationCenter } from "./NotificationCenter";

describe("إشعارات الدردشات", () => {
  it("يفتح الدردشة المرتبطة بإشعار رسالة جديد بدلاً من تحويله إلى مهمة", () => {
    const onOpenConversation = vi.fn();
    render(<NotificationCenter notifications={[{ id: 9, title: "رسالة جديدة من زميل", body: "يرجى المراجعة", category: "chat_message", dedupeKey: "chat-message-42-190-7", isRead: false, sentAt: new Date("2026-08-27T09:30:00Z") }]} isLoading={false} unreadCount={1} onClose={vi.fn()} onMarkRead={vi.fn()} onOpenTask={vi.fn()} onOpenConversation={onOpenConversation} />);
    fireEvent.click(screen.getByText("رسالة جديدة من زميل"));
    expect(onOpenConversation).toHaveBeenCalledWith(42, 9, false);
    expect(screen.getByText("فتح الدردشة")).toBeTruthy();
  });
});
