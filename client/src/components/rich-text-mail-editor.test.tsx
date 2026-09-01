// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import RichTextMailEditor from "./RichTextMailEditor";

describe("محرر بريد ركيزة الغني", () => {
  it("يعرض أدوات التنسيق ويمرر النص والملفات المسحوبة إلى المستدعي", () => {
    const onChange = vi.fn();
    const onFilesDropped = vi.fn();
    render(<RichTextMailEditor value="" onChange={onChange} onFilesDropped={onFilesDropped} />);
    const editor = screen.getByRole("textbox", { name: "محتوى الرسالة المنسق" });
    expect(screen.getByRole("button", { name: "عريض" })).toBeTruthy();
    fireEvent.input(editor, { target: { innerHTML: "<p>نص منسق</p>", innerText: "نص منسق" } });
    expect(onChange).toHaveBeenCalled();
    const file = new File(["مرفق"], "memo.txt", { type: "text/plain" });
    fireEvent.drop(editor, { dataTransfer: { files: [file] } });
    expect(onFilesDropped).toHaveBeenCalled();
  });
});
