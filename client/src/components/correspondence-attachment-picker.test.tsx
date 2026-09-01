import { describe, expect, it } from "vitest";
import { canAddCorrespondenceAttachments } from "@/lib/correspondenceAttachments";

describe("مرفقات الطلب الإداري", () => {
  it("يسمح بإجمالي خمسة مرفقات فقط", () => {
    expect(canAddCorrespondenceAttachments(0, 5)).toBe(true);
    expect(canAddCorrespondenceAttachments(4, 1)).toBe(true);
    expect(canAddCorrespondenceAttachments(4, 2)).toBe(false);
    expect(canAddCorrespondenceAttachments(5, 1)).toBe(false);
  });
});
