import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function GlobalSearchBar() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const searchApi = (trpc.court as { search?: { global?: { useQuery: (input: { query: string }, opts: { enabled: boolean }) => { data?: Array<{ type: string; id: number; title: string; subtitle?: string; href: string }>; isFetching: boolean } } } }).search?.global;
  const results = searchApi?.useQuery ? searchApi.useQuery({ query: query.trim() }, { enabled: open && query.trim().length >= 2 }) : { data: [], isFetching: false };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="relative">
      <button type="button" aria-label="بحث شامل" onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg text-[#486455] hover:bg-[#e1ebe0]">
        <Search className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute left-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-[#cbd6ca] bg-[#f8f8f3] p-3 shadow-[0_18px_40px_rgba(36,67,51,0.16)]" dir="rtl">
          <input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="ابحث في المهام والبريد والتقارير والموظفين…" className="h-10 w-full rounded-xl border border-[#d5e0d4] bg-white px-3 text-sm" />
          <div className="mt-2 max-h-72 overflow-y-auto">
            {results.isFetching ? <p className="p-3 text-xs text-[#718078]">جارٍ البحث…</p> : results.data?.length ? results.data.map(item => (
              <button type="button" key={`${item.type}-${item.id}`} onClick={() => { setOpen(false); setLocation(item.href); }} className="block w-full rounded-xl px-3 py-2 text-right hover:bg-[#eef5ee]">
                <p className="text-xs font-black text-[#274738]">{item.title}</p>
                <p className="mt-0.5 text-[10px] text-[#718078]">{item.type} · {item.subtitle}</p>
              </button>
            )) : query.trim().length >= 2 ? <p className="p-3 text-xs text-[#718078]">لا توجد نتائج مطابقة.</p> : <p className="p-3 text-xs text-[#718078]">اكتب حرفين على الأقل. اختصار: Ctrl+K</p>}
          </div>
        </div>
      )}
    </div>
  );
}
