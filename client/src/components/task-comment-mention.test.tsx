import { describe, expect, it } from "vitest";
import { findActiveMention, insertMentionToken } from "./TaskCommentTimelinePanel";

describe("اقتراحات الإشارة في تعليق المهمة", () => {
  it("يستخرج علامة الإشارة وكلمة البحث قبل موضع المؤشر", () => {
    const text = "يرجى مراجعة @عبد";
    expect(findActiveMention(text, text.length)).toEqual({ start: text.indexOf("@"), query: "عبد" });
    expect(findActiveMention("تعليق بلا إشارة", 15)).toBeNull();
  });

  it("يدرِج المستخدم المختار في موضع علامة الإشارة ويعيد موضع المؤشر", () => {
    const text = "يرجى مراجعة @عب اليوم";
    const cursor = text.indexOf(" اليوم");
    const active = findActiveMention(text, cursor)!;
    expect(insertMentionToken(text, cursor, active.start, "عبدالعزيز")).toEqual({ value: "يرجى مراجعة @عبدالعزيز اليوم", cursor: active.start + "@عبدالعزيز".length });
  });
});
