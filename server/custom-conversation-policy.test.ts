import { describe, expect, it } from "vitest";
import { canCreateCustomConversation, canSearchInternalPeopleWithoutProfile, ensureDepartmentConversation, ensureGeneralConversation } from "./internal-communications-service";
import { internalConversations } from "../drizzle/schema";

describe("custom conversation policy", () => {
  it("يسمح للمالك والقيادة بالبحث دون ملف موظف مرتبط", () => {
    expect(canSearchInternalPeopleWithoutProfile("full_control", [])).toBe(true);
    expect(canSearchInternalPeopleWithoutProfile(null, [{ role: "court_president" }])).toBe(true);
    expect(canSearchInternalPeopleWithoutProfile("employee", [{ role: "employee" }])).toBe(false);
  });

  it("allows only the three leadership roles", () => {
    expect(canCreateCustomConversation([{ role: "court_president" }])).toBe(true);
    expect(canCreateCustomConversation([{ role: "assistant_president" }])).toBe(true);
    expect(canCreateCustomConversation([{ role: "court_secretary" }])).toBe(true);
  });

  it("يسمح لمالك المنصة ورئيس القسم بإنشاء مجموعة ضمن نطاقهما دون توسيع صلاحيات الموظف", () => {
    expect(canCreateCustomConversation([], "full_control")).toBe(true);
    expect(canCreateCustomConversation([{ role: "department_manager" }], "employee")).toBe(true);
    expect(canCreateCustomConversation([{ role: "employee" }], "general_view")).toBe(false);
  });

  it("يرفض الموظفين العاديين ومن لا يملكون دوراً إدارياً", () => {
    expect(canCreateCustomConversation([{ role: "employee" }])).toBe(false);
    expect(canCreateCustomConversation([])).toBe(false);
  });

  it("keeps department chat membership inside the active unit", async () => {
    const inserted: Array<Array<{ conversationId: number; profileId: number }>> = [];
    const db = {
      select: () => ({
        from: (table: unknown) => ({ where: () => { const rows = table === internalConversations ? [] : [{ id: 10 }, { id: 12 }]; return Object.assign(rows, { limit: async () => rows }); } }),
      }),
      insert: () => ({ values: async (values: any) => { if (Array.isArray(values)) inserted.push(values); return [{ insertId: 77 }]; } }),
    };
    const id = await ensureDepartmentConversation(db, { id: 10, unitId: 4 });
    expect(id).toBe(77);
    expect(inserted[0].map((member) => member.profileId)).toEqual([10, 12]);
  });

  it("adds only active general-chat members and the current profile", async () => {
    const inserted: Array<Array<{ conversationId: number; profileId: number }>> = [];
    const db = {
      select: () => ({
        from: (table: unknown) => ({ where: () => { const rows = table === internalConversations ? [] : [{ id: 20 }, { id: 21 }]; return Object.assign(rows, { limit: async () => rows }); } }),
      }),
      insert: () => ({ values: async (values: any) => { if (Array.isArray(values)) inserted.push(values); return [{ insertId: 88 }]; } }),
    };
    const id = await ensureGeneralConversation(db, { id: 20 });
    expect(id).toBe(88);
    expect(inserted[0].map((member) => member.profileId)).toEqual([20, 21]);
  });
});
