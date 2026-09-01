import { describe, expect, it } from "vitest";
import { expandCustomGroupMemberIds, filterCustomGroupPeople } from "./MessagesPage";

describe("اختيار أعضاء المجموعة المخصصة", () => {
  it("يجمع أعضاء قسمين مع أفراد محددين ويحذف التكرار", () => {
    const result = expandCustomGroupMemberIds(
      ["12", "21"],
      ["10", "20"],
      [
        { id: 11, unitId: 10 },
        { id: 12, unitId: 10 },
        { id: 21, unitId: 20 },
        { id: 22, unitId: 20 },
        { id: 31, unitId: 30 },
      ],
    );

    expect(result).toEqual(["12", "21", "11", "22"]);
  });

  it("لا يضيف موظفين من قسم غير مختار", () => {
    expect(expandCustomGroupMemberIds([], ["10"], [{ id: 11, unitId: 20 }])).toEqual([]);
  });

  it("يبحث بالاسم أو البريد داخل الأقسام المختارة فقط", () => {
    const people = [
      { id: 11, unitId: 10, fullName: "أحمد العتيبي", email: "ahmad@moj.gov.sa" },
      { id: 12, unitId: 20, fullName: "سارة القحطاني", email: "sara@moj.gov.sa" },
      { id: 13, unitId: 30, fullName: "أحمد آخر", email: "other@example.com" },
    ];

    expect(filterCustomGroupPeople(people, ["10", "20"], "ahmad").map(person => person.id)).toEqual([11]);
    expect(filterCustomGroupPeople(people, ["10", "20"], "@moj.gov.sa").map(person => person.id)).toEqual([11, 12]);
    expect(filterCustomGroupPeople(people, ["10", "20"], "أحمد").map(person => person.id)).toEqual([11]);
    expect(filterCustomGroupPeople(people, ["10", "20"], "a")).toEqual([]);
  });
});
