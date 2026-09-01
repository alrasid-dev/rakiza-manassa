import { CircleHelp, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { FIRST_USE_HELP } from "@/lib/icon-guide";

const STORAGE_KEY = "rakiza:seen-help-keys";

function readSeen(): string[] {
  try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export default function FirstUseHelp() {
  const [location] = useLocation();
  const path = location.split("?")[0] || "/";
  const help = FIRST_USE_HELP[path];
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!help) { setOpen(false); return; }
    setOpen(!readSeen().includes(path));
  }, [help, path]);
  if (!help || !open) return null;
  const dismiss = () => {
    const next = Array.from(new Set([...readSeen(), path]));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setOpen(false);
  };
  return (
    <aside role="dialog" aria-label="مساعدة أول استخدام" className="mb-4 rounded-2xl border border-[#d7e6d8] bg-[#f4faf4] p-4 shadow-[0_8px_20px_rgba(30,61,48,0.06)]">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#dceee0] text-[#2d6b4f]"><CircleHelp className="h-4 w-4" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black text-[#4a785a]">مساعدة سريعة · أول استخدام</p>
          <h2 className="mt-1 text-sm font-black text-[#1f4a38]">{help.title}</h2>
          <p className="mt-1 text-xs leading-6 text-[#5d7266]">{help.text}</p>
        </div>
        <button type="button" onClick={dismiss} aria-label="إخفاء المساعدة" className="grid h-8 w-8 place-items-center rounded-lg text-[#6a7d72] hover:bg-white"><X className="h-4 w-4" /></button>
      </div>
    </aside>
  );
}
