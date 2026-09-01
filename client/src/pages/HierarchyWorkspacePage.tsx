import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { ChevronDown, CircleDashed, Network, UsersRound } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

type Unit = { id: number; name: string; code: string; parentId: number | null; isActive: boolean };
type Person = { id: number; fullName: string; unitId: number | null; personType: "administrative" | "trainee" | "judge"; jobTitle: string | null; status: string };

export default function HierarchyWorkspacePage() {
  const unitsQuery = trpc.court.units.list.useQuery();
  const peopleQuery = trpc.court.people.list.useQuery();
  const [openUnits, setOpenUnits] = useState<number[]>([]);
  const units = (unitsQuery.data as Unit[] | undefined)?.filter(unit => unit.isActive) ?? [];
  const people = (peopleQuery.data as Person[] | undefined) ?? [];
  const children = useMemo(() => new Map(units.map(unit => [unit.id, units.filter(child => child.parentId === unit.id)])), [units]);
  const roots = units.filter(unit => !unit.parentId).sort((first, second) => first.code === "court-presidency" ? -1 : second.code === "court-presidency" ? 1 : first.name.localeCompare(second.name, "ar"));
  const peopleByUnit = (unitId: number) => people.filter(person => person.unitId === unitId && person.status !== "inactive");
  const toggle = (unitId: number) => setOpenUnits(current => current.includes(unitId) ? current.filter(id => id !== unitId) : [...current, unitId]);
  const labelFor = (person: Person) => person.personType === "judge" ? "قاضٍ" : person.personType === "trainee" ? "ملازم قضائي" : "موظف إداري";
  const renderUnit = (unit: Unit, depth = 0): ReactNode => {
    const isOpen = openUnits.includes(unit.id);
    const members = peopleByUnit(unit.id);
    const unitChildren = children.get(unit.id) ?? [];
    return <section key={unit.id} className="overflow-hidden rounded-2xl border border-[#e3e0d6] bg-white" style={{ marginRight: `${depth * 1.25}rem` }}><button type="button" onClick={() => toggle(unit.id)} className="flex w-full items-center justify-between gap-3 bg-[#fbfaf6] px-4 py-4 text-right hover:bg-[#f1f6f1]"><span className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8f1e8] text-[#246b4b]"><Network className="h-4 w-4" /></span><span><span className="block font-bold text-[#29463b]">{unit.name}</span><span className="mt-1 block text-xs text-[#758179]">{members.length} موظف · {unitChildren.length} وحدات فرعية</span></span></span><ChevronDown className={`h-5 w-5 text-[#386048] transition-transform ${isOpen ? "rotate-180" : ""}`} /></button>{isOpen && <div className="space-y-3 border-t border-[#e8e2d8] p-3">{members.length > 0 && <div className="divide-y divide-[#eee8de] rounded-xl border border-[#edf0e9] bg-white">{members.map(person => <div key={person.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-3"><div><p className="font-bold text-[#29463b]">{person.fullName}</p><p className="mt-1 text-xs text-[#758179]">{labelFor(person)} · {person.jobTitle || "دون مسمى"}</p></div><span className="rounded-full bg-[#eef3ed] px-2.5 py-1 text-xs font-bold text-[#386048]">{person.status === "on_leave" ? "في إجازة" : "نشط"}</span></div>)}</div>}{unitChildren.map(child => renderUnit(child, depth + 1))}{members.length === 0 && unitChildren.length === 0 && <p className="rounded-xl bg-[#fbfaf6] p-4 text-center text-sm text-[#758179]">لا توجد ملفات مسكنة في هذه الوحدة بعد.</p>}</div>}</section>;
  };
  return <DashboardLayout><main dir="rtl" className="mx-auto max-w-6xl"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold tracking-[0.14em] text-[#b18448]">الهيكل الإداري الرسمي</p><h1 className="mt-2 text-3xl font-bold text-[#12352f]">تسلسل الأقسام والموظفين</h1><p className="mt-2 max-w-2xl text-sm leading-7 text-[#65766d]">يبدأ الهيكل برئيس المحكمة ثم أمانة المحكمة والمكتب التنسيقي، وتتفرع منه الإدارات والأقسام المعتمدة. تظهر الوحدات القائمة الأخرى بعد الهيكل الرسمي للمراجعة من دون فقد ملفات موظفيها.</p></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e9f0ea] text-[#1f5a47]"><UsersRound className="h-6 w-6" /></div></div><div className="mt-7 rounded-[1.5rem] border border-[#e7e0d4] bg-white p-5 shadow-[0_10px_30px_rgba(30,51,42,0.05)]"><div className="flex items-center gap-2 text-[#12352f]"><Network className="h-5 w-5 text-[#b18448]" /><h2 className="font-bold">القائمة التنظيمية</h2></div>{unitsQuery.isLoading || peopleQuery.isLoading ? <div className="mt-6 flex items-center gap-2 text-sm text-[#6e7e75]"><CircleDashed className="h-4 w-4 animate-spin" /> جارٍ تحميل الهيكل والموظفين…</div> : roots.length ? <div className="mt-5 space-y-3">{roots.map(unit => renderUnit(unit))}</div> : <p className="mt-6 rounded-2xl border border-dashed border-[#d8d1c5] bg-[#fbfaf6] p-8 text-center text-sm text-[#738179]">لم تتم تهيئة الوحدات التنظيمية بعد. أضف الأقسام ثم أسكن الموظفين داخل وحداتهم.</p>}</div></main></DashboardLayout>;
}
