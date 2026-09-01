import { describe, expect, it } from "vitest";
import { governanceParticipantNames } from "./governance-archive-policy";

describe("أطراف أرشيف الحوكمة", () => {
  it("يعيد مقدم الطلب ومتخذ القرار من معرفين مستقلين", () => {
    const names = new Map([[10, "مقدم الطلب"], [22, "متخذ القرار"]]);
    expect(governanceParticipantNames({ requestedByUserId: 10, decidedByUserId: 22 }, names)).toEqual({ requesterName: "مقدم الطلب", deciderName: "متخذ القرار" });
  });
  it("لا يخمن متخذ القرار عندما لا يسجل بعد", () => {
    expect(governanceParticipantNames({ requestedByUserId: 10, decidedByUserId: null }, new Map([[10, "مقدم الطلب"]]))).toEqual({ requesterName: "مقدم الطلب", deciderName: null });
  });
});
