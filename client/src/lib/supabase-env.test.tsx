import { describe, expect, it } from "vitest";
import { supabaseAnonKey, supabaseUrl } from "./supabase-env";

describe("متغيرات Supabase في Vite", () => {
  it("يقرأ المفاتيح بالصيغة الرسمية لـ Vite", () => {
    expect(supabaseUrl).toBe(import.meta.env.VITE_SUPABASE_URL);
    expect(supabaseAnonKey).toBe(import.meta.env.VITE_SUPABASE_ANON_KEY);
  });
});
