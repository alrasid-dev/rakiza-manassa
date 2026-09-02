// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PwaInstallHint } from "./PwaInstallHint";

describe("إرشاد تثبيت التطبيق", () => {
  it("يعرض إجراء التثبيت عند توفير المتصفح لحدث التثبيت", async () => {
    const prompt = vi.fn(async () => undefined);
    render(<PwaInstallHint />);
    const installEvent = Object.assign(new Event("beforeinstallprompt", { cancelable: true }), { prompt, userChoice: Promise.resolve({ outcome: "accepted" }) });
    window.dispatchEvent(installEvent);
    const button = await screen.findByRole("button", { name: "تثبيت" });
    fireEvent.click(button);
    expect(prompt).toHaveBeenCalledOnce();
  });

  it("يعرض تعليمات التثبيت حتى لو لم يطلق المتصفح حدث التثبيت", () => {
    render(<PwaInstallHint alwaysVisible />);
    expect(screen.getByRole("link", { name: "كل الأجهزة" })).toHaveAttribute("href", expect.stringMatching(/apps$/));
  });
});
