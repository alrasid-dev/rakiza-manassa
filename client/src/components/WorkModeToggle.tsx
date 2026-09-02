import { Briefcase, UserRound } from "lucide-react";
import React, { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

export default function WorkModeToggle({ hasLeadershipScope }: { hasLeadershipScope: boolean }) {
  const prefsApi = (trpc.court as { workPreferences?: { mine?: { useQuery: () => { data?: { workMode?: "employee" | "manager" } } }; update?: { useMutation: (opts: { onSuccess?: (value: { workMode: "employee" | "manager" }) => void }) => { mutate: (input: { workMode: "employee" | "manager" }) => void; isPending: boolean } } } }).workPreferences;
  const saved = prefsApi?.mine?.useQuery ? prefsApi.mine.useQuery() : { data: undefined };
  const [mode, setMode] = useState<"employee" | "manager">(() => (typeof window !== "undefined" && window.localStorage.getItem("rakiza:work-mode") === "employee" ? "employee" : "manager"));
  const update = prefsApi?.update?.useMutation ? prefsApi.update.useMutation({ onSuccess: value => { setMode(value.workMode); window.localStorage.setItem("rakiza:work-mode", value.workMode); window.dispatchEvent(new Event("rakiza:work-mode")); } }) : { mutate: (input: { workMode: "employee" | "manager" }) => { setMode(input.workMode); window.localStorage.setItem("rakiza:work-mode", input.workMode); window.dispatchEvent(new Event("rakiza:work-mode")); }, isPending: false };
  useEffect(() => { if (saved.data?.workMode) setMode(saved.data.workMode); }, [saved.data?.workMode]);
  if (!hasLeadershipScope) return null;
  const isManager = mode !== "employee";
  return (
    <button type="button" aria-label={isManager ? "التبديل إلى وضع الموظف" : "التبديل إلى وضع المدير"} onClick={() => update.mutate({ workMode: isManager ? "employee" : "manager" })} className="inline-flex h-11 min-w-11 items-center justify-center gap-1 rounded-lg border border-[#cfd7ca] bg-[#f1f3ed] px-2 text-[10px] font-black text-[#2d6b4f] sm:h-auto sm:px-2.5 sm:py-1.5">
      {isManager ? <Briefcase className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
      <span className="sr-only sm:not-sr-only">{update.isPending ? "…" : isManager ? "وضع المدير" : "وضع الموظف"}</span>
    </button>
  );
}

export function useWorkMode(hasLeadershipScope: boolean): "employee" | "manager" {
  const [mode, setMode] = useState<"employee" | "manager">("manager");
  useEffect(() => {
    const read = () => setMode(window.localStorage.getItem("rakiza:work-mode") === "employee" ? "employee" : "manager");
    read();
    window.addEventListener("rakiza:work-mode", read);
    window.addEventListener("storage", read);
    return () => { window.removeEventListener("rakiza:work-mode", read); window.removeEventListener("storage", read); };
  }, []);
  return hasLeadershipScope ? mode : "employee";
}
