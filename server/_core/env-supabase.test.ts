import { describe, expect, it } from "vitest";
import { isSupabaseProjectUrl } from "./env";

describe("ربط Supabase", () => {
  it("يقبل رابط مشروع حقيقي ويرفض النطاق العام", () => {
    expect(isSupabaseProjectUrl("https://abcdxyzproject.supabase.co")).toBe(true);
    expect(isSupabaseProjectUrl("https://supabase.co")).toBe(false);
    expect(isSupabaseProjectUrl("https://example.com")).toBe(false);
  });
});
