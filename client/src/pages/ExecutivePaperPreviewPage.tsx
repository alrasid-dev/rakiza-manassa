import {
  BellDot,
  BookOpenCheck,
  CalendarClock,
  ChartNoAxesCombined,
  ChevronLeft,
  ClipboardCheck,
  FileText,
  Landmark,
  ListTodo,
  MailOpen,
  MessagesSquare,
  PanelsTopLeft,
  Scale,
  ShieldCheck,
  Stamp,
  UsersRound,
} from "lucide-react";
import React from "react";

const navigation = [
  { label: "لوحة القيادة", icon: PanelsTopLeft, active: true },
  { label: "التنبيهات", icon: BellDot, badge: "—" },
  { label: "الدردشات", icon: MessagesSquare, badge: "—" },
  { label: "بريد ركيزة", icon: MailOpen, badge: "—" },
  { label: "مهامي", icon: ListTodo },
  { label: "التقارير", icon: ChartNoAxesCombined },
];

const workflow = [
  { title: "عنوان مهمة أو معاملة", note: "قسم الجهة المختصة · قيد المراجعة", state: "إجراء مطلوب", tone: "gold" },
  { title: "متابعة قرار أو خطاب داخلي", note: "سجل الأعمال اليومي · ضمن المسار", state: "ضمن المسار", tone: "green" },
  { title: "مراجعة مستند مرفق", note: "عرض التفاصيل من دون مغادرة اللوحة", state: "للمراجعة", tone: "slate" },
];

export default function ExecutivePaperPreviewPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#e9e3d7] p-3 text-[#263d32] sm:p-5" style={{ fontFamily: "Tajawal, sans-serif" }}>
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1600px] overflow-hidden border border-[#cfc3ae] bg-[#f7f3ea] shadow-[0_25px_70px_rgba(68,59,39,0.16)] lg:grid-cols-[18rem_minmax(0,1fr)] sm:min-h-[calc(100vh-2.5rem)]">
        <aside className="border-b border-[#d8cebd] bg-[#fbf8f0] px-4 py-5 lg:border-b-0 lg:border-l lg:px-5 lg:py-7">
          <div className="flex items-center gap-3 border-b-2 border-[#1e513d] pb-5">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-[#0e5339] text-[#f3dfa4]"><Scale className="h-5 w-5" strokeWidth={1.8} /></span>
            <div><p className="text-lg font-black tracking-tight text-[#183f30]">رَكيزة</p><p className="mt-0.5 text-[10px] font-bold text-[#68756c]">معاينة تصميم فقط</p></div>
          </div>

          <nav className="mt-5 grid grid-cols-2 gap-2 lg:block lg:space-y-1" aria-label="معاينة التنقل الورقية">
            {navigation.map(item => {
              const Icon = item.icon;
              return <button key={item.label} type="button" className={`group flex items-center gap-3 border-r-[3px] px-3 py-3 text-right text-xs font-bold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c09a48] lg:w-full ${item.active ? "border-[#177347] bg-[#e7f0e7] text-[#154c35]" : "border-transparent text-[#476053] hover:border-[#c7a65b] hover:bg-[#f1ecdf] hover:text-[#244e3a]"}`}><span className={`grid h-7 w-7 place-items-center rounded-md ${item.active ? "bg-[#0e5339] text-[#f5dfa4]" : "bg-[#edf0e9] text-[#597264] group-hover:bg-[#e7deca]"}`}><Icon className="h-4 w-4" strokeWidth={1.9} /></span><span className="min-w-0 flex-1 truncate">{item.label}</span>{item.badge && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#e4d4a2] px-1 text-[10px] font-black text-[#70531d]">{item.badge}</span>}</button>;
            })}
          </nav>

          <div className="mt-6 hidden border-t border-[#d8cebd] pt-5 lg:block"><div className="flex items-center gap-2 text-[#96742d]"><Stamp className="h-4 w-4" /><span className="text-xs font-black">أسلوب الورق التنفيذي</span></div><p className="mt-2 text-[11px] leading-6 text-[#66746b]">مساحات منظمة، حواف بسيطة، وتسلسل واضح يدعم قراءة الأعمال المطولة.</p></div>
        </aside>

        <main className="min-w-0 bg-[#f7f3ea] p-4 sm:p-7 lg:p-8" style={{ backgroundImage: "linear-gradient(rgba(90,75,40,0.035) 1px, transparent 1px)", backgroundSize: "100% 36px" }}>
          <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#254f3d] pb-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center border border-[#cad7cb] bg-[#eff5ed] text-[#19603d]"><Landmark className="h-5 w-5" strokeWidth={1.8} /></span><div><p className="text-[11px] font-bold tracking-[0.12em] text-[#a57c28]">EXECUTIVE PAPER</p><h1 className="mt-1 text-xl font-black tracking-tight text-[#173d2e] sm:text-2xl">لوحة القيادة التنفيذية</h1></div></div><div className="flex flex-wrap gap-2"><a href="/emerald-glass-preview" className="inline-flex items-center gap-2 border border-[#cdbfa9] bg-[#fcfaf5] px-3 py-2 text-xs font-black text-[#53675b] transition-colors hover:bg-[#efe9dc]"><ChevronLeft className="h-4 w-4" />المعاينة الزجاجية</a><a href="/" className="inline-flex items-center gap-2 bg-[#135f40] px-3 py-2 text-xs font-black text-white transition-colors hover:bg-[#0c4b31]">العودة للمنصة</a></div></header>

          <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]"><article className="border border-[#d4c9b8] bg-[#fffdf8] p-5 shadow-[0_8px_20px_rgba(67,57,34,0.05)]"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black text-[#237147]">معاينة مرئية</p><h2 className="mt-1 text-xl font-black text-[#254638]">سجل يومي بوضوح تنفيذي</h2><p className="mt-2 max-w-2xl text-xs leading-6 text-[#738076]">هذه صفحة مراجعة لتصميم رسمي فاتح، لا تعرض أرقام تشغيلية ولا تغيّر بيانات المنصة.</p></div><span className="flex items-center gap-2 border border-[#cad8c9] bg-[#eff6ee] px-3 py-2 text-xs font-bold text-[#37664a]"><ShieldCheck className="h-4 w-4" />هوية ركيزة</span></div></article><aside className="border-r-4 border-[#c59c41] bg-[#183f30] p-4 text-[#f3eee0] shadow-[0_8px_20px_rgba(42,47,34,0.14)]"><p className="text-[10px] font-black tracking-[0.12em] text-[#ead18a]">مبدأ التصميم</p><p className="mt-2 text-sm font-black">الأولوية للسياق</p><p className="mt-1 text-[11px] leading-6 text-[#d9e7dc]">تظهر المعلومات المهمة أولاً، مع حواجز قليلة ونص قابل للقراءة.</p></aside></section>

          <section className="mt-5 grid gap-px overflow-hidden border border-[#d4c9b8] bg-[#d4c9b8] sm:grid-cols-3"><article className="bg-[#fbfaf5] p-4"><div className="flex items-center justify-between text-[#217046]"><ClipboardCheck className="h-5 w-5" /><span className="text-2xl font-black">—</span></div><p className="mt-5 text-sm font-black text-[#254638]">مهام اليوم</p><p className="mt-1 text-[11px] font-semibold text-[#748077]">إجمالي الأعمال المسندة</p></article><article className="bg-[#fffaf0] p-4"><div className="flex items-center justify-between text-[#9a7624]"><CalendarClock className="h-5 w-5" /><span className="text-2xl font-black">—</span></div><p className="mt-5 text-sm font-black text-[#55461e]">قرب موعدها</p><p className="mt-1 text-[11px] font-semibold text-[#877a5a]">تحتاج متابعة اليوم</p></article><article className="bg-[#f7f2fb] p-4"><div className="flex items-center justify-between text-[#775a95]"><FileText className="h-5 w-5" /><span className="text-2xl font-black">—</span></div><p className="mt-5 text-sm font-black text-[#4c3d60]">بانتظار الاعتماد</p><p className="mt-1 text-[11px] font-semibold text-[#766a84]">تحت المراجعة الإدارية</p></article></section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]"><article className="border border-[#d4c9b8] bg-[#fffdf8] p-4 shadow-[0_8px_20px_rgba(67,57,34,0.05)] sm:p-5"><div className="flex items-center justify-between gap-3 border-b border-[#e2d9ca] pb-4"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center bg-[#eaf3e8] text-[#1d683f]"><ListTodo className="h-4 w-4" /></span><div><h2 className="text-sm font-black text-[#244737]">مسار العمل اليومي</h2><p className="mt-0.5 text-[10px] font-semibold text-[#8d988e]">شكل مقترح لقائمة الأعمال</p></div></div><button type="button" className="border border-[#cfc4b1] bg-[#faf8f1] px-2.5 py-1.5 text-[10px] font-black text-[#4d6557]">عرض الكل</button></div><div className="divide-y divide-[#e9e2d6]">{workflow.map(item => <div key={item.title} className="flex items-center gap-3 py-4"><span className={`grid h-9 w-9 shrink-0 place-items-center ${item.tone === "gold" ? "bg-[#fff0c8] text-[#8f6a20]" : item.tone === "green" ? "bg-[#e8f4ea] text-[#28734a]" : "bg-[#eeeaf2] text-[#6e6280]"}`}><ClipboardCheck className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-[#284839]">{item.title}</p><p className="mt-1 truncate text-[11px] text-[#7b877e]">{item.note}</p></div><span className="hidden border border-[#ded7c8] bg-[#fbfaf5] px-2.5 py-1 text-[10px] font-black text-[#6b776e] sm:block">{item.state}</span><ChevronLeft className="h-4 w-4 text-[#8a978e]" /></div>)}</div></article><aside className="border border-[#d2c7b6] bg-[#f0ebde] p-5"><div className="flex items-center gap-2 text-[#906f2a]"><UsersRound className="h-4 w-4" /><span className="text-xs font-black">التسلسل الرسمي</span></div><h2 className="mt-3 text-base font-black text-[#254637]">الوصول المنظم</h2><p className="mt-2 text-xs leading-6 text-[#6f7e73]">علاقات الوحدات واضحة في موضع ثابت يساعد على فهم سياق المهمة.</p><div className="mt-5 space-y-3 border-t border-[#d6ccbb] pt-4"><div className="flex items-center gap-3 text-xs font-bold text-[#2e5840]"><UsersRound className="h-4 w-4" />أمانة المحكمة</div><div className="mr-3 flex items-center gap-3 text-xs font-bold text-[#506c59]"><BookOpenCheck className="h-4 w-4 text-[#9c7c32]" />المكتب التنسيقي</div><div className="mr-6 flex items-center gap-3 text-xs font-bold text-[#506c59]"><ChartNoAxesCombined className="h-4 w-4 text-[#9c7c32]" />الإدارات والأقسام</div></div></aside></section>
        </main>
      </div>
    </div>
  );
}
