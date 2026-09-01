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
  Sparkles,
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

const metrics = [
  { label: "مهام اليوم", hint: "إجمالي الأعمال المسندة", icon: ClipboardCheck, accent: "text-[#dfffdc]" },
  { label: "قرب موعدها", hint: "تحتاج متابعة اليوم", icon: CalendarClock, accent: "text-[#ffe6a3]" },
  { label: "بانتظار الاعتماد", hint: "تحت المراجعة الإدارية", icon: FileText, accent: "text-[#dfd5ff]" },
];

const samples = [
  { title: "عنوان مهمة أو معاملة", context: "قسم الجهة المختصة · قيد المراجعة", tone: "bg-[#eafadf] text-[#1f7a49]" },
  { title: "متابعة قرار أو خطاب داخلي", context: "سجل الأعمال اليومي · ضمن المسار", tone: "bg-[#fff2bf] text-[#8d661b]" },
  { title: "مراجعة مستند مرفق", context: "عرض المرفق متاح ضمن نطاق الصلاحية", tone: "bg-[#eee7ff] text-[#6d57a3]" },
];

export default function EmeraldGlassPreviewPage() {
  return (
    <div dir="rtl" className="relative min-h-screen overflow-hidden bg-[#092d27] p-3 text-white sm:p-5" style={{ fontFamily: "Tajawal, sans-serif" }}>
      <div className="pointer-events-none absolute -right-28 top-12 h-96 w-96 rounded-full bg-[#00a85a]/35 blur-[120px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[#bb8a2d]/25 blur-[140px]" aria-hidden="true" />
      <div className="pointer-events-none absolute left-[30%] top-[38%] h-72 w-72 rounded-full bg-[#1d8e7a]/22 blur-[110px]" aria-hidden="true" />

      <div className="relative mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1600px] overflow-hidden rounded-[2rem] border border-white/20 bg-white/[0.045] shadow-[0_28px_90px_rgba(0,0,0,0.32)] backdrop-blur-[28px] lg:grid-cols-[17.5rem_minmax(0,1fr)] sm:min-h-[calc(100vh-2.5rem)]">
        <aside className="border-b border-white/15 bg-[#07362d]/55 px-4 py-5 backdrop-blur-xl lg:border-b-0 lg:border-l lg:px-5 lg:py-7">
          <div className="flex items-center gap-3 border-b border-white/12 pb-5">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[#f7d782]/40 bg-white/10 text-[#ffe29c] shadow-[0_0_28px_rgba(246,201,99,0.25)]"><Scale className="h-5 w-5" strokeWidth={1.8} /></div>
            <div><p className="text-lg font-black tracking-tight">رَكيزة</p><p className="mt-0.5 text-[10px] font-bold text-[#ccecdf]">معاينة تصميم فقط</p></div>
          </div>

          <nav className="mt-5 grid grid-cols-2 gap-2 lg:block lg:space-y-1.5" aria-label="معاينة التنقل الزجاجية">
            {navigation.map(item => {
              const Icon = item.icon;
              return <button key={item.label} type="button" className={`group flex items-center gap-3 rounded-2xl border px-3 py-3 text-right text-xs font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5d982] lg:w-full ${item.active ? "border-[#e0d28a]/40 bg-[#e7f7e9]/18 text-white shadow-[0_8px_25px_rgba(0,0,0,0.14)]" : "border-transparent text-[#d5eee2] hover:border-white/12 hover:bg-white/8 hover:text-white"}`}>
                <span className={`grid h-7 w-7 place-items-center rounded-xl border ${item.active ? "border-white/20 bg-[#e8fce8]/14 text-[#f5dc98]" : "border-white/8 bg-white/5 text-[#a6ddc3] group-hover:bg-white/10"}`}><Icon className="h-4 w-4" strokeWidth={1.9} /></span>
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.badge && <span className={`grid h-5 min-w-5 place-items-center rounded-full border px-1 text-[10px] font-black ${item.active ? "border-[#f5d982]/40 bg-[#f5d982]/20 text-[#ffecb3]" : "border-white/10 bg-white/8 text-[#e9f6ee]"}`}>{item.badge}</span>}
              </button>;
            })}
          </nav>

          <div className="mt-5 hidden rounded-2xl border border-white/14 bg-white/[0.07] p-4 shadow-inner shadow-white/5 lg:block"><div className="flex items-center gap-2 text-[#ffe29b]"><Sparkles className="h-4 w-4" /><span className="text-xs font-black">طبقات زجاجية</span></div><p className="mt-2 text-[11px] leading-6 text-[#d7eee1]">شفافية هادئة وعمق بصري، مع حدود واضحة تضمن سهولة القراءة.</p></div>
        </aside>

        <main className="min-w-0 p-4 sm:p-7 lg:p-8">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/15 pb-5"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/25 bg-white/10 text-[#e9ffec] shadow-inner shadow-white/10"><Landmark className="h-5 w-5" /></span><div><p className="text-[11px] font-bold tracking-[0.12em] text-[#f1d587]">EMERALD GLASSMORPHISM</p><h1 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">لوحة القيادة الزجاجية</h1></div></div><div className="flex flex-wrap gap-2"><a href="/design-preview" className="inline-flex items-center gap-2 rounded-xl border border-white/22 bg-white/8 px-3 py-2 text-xs font-black text-[#e8f8ed] transition-colors hover:bg-white/14"><ChevronLeft className="h-4 w-4" />المعاينة المعيارية</a><a href="/" className="inline-flex items-center gap-2 rounded-xl border border-[#f0d27d]/40 bg-[#f4d980]/15 px-3 py-2 text-xs font-black text-[#ffebb0] transition-colors hover:bg-[#f4d980]/25">العودة للمنصة</a></div></header>

          <section className="mt-6 rounded-2xl border border-white/20 bg-white/[0.075] p-4 shadow-[0_10px_28px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:p-5"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black text-[#d8f6df]">معاينة مرئية</p><h2 className="mt-1 text-lg font-black">عمق هادئ بوضوح رسمي</h2><p className="mt-1 max-w-2xl text-xs leading-6 text-[#d0e6da]">هذه صفحة مراجعة للتصميم المقترح، ولا تعرض أرقام تشغيلية أو تغيّر بيانات المنصة.</p></div><div className="flex items-center gap-2 rounded-xl border border-[#f2d789]/25 bg-[#f2d789]/10 px-3 py-2 text-xs font-bold text-[#ffe9a9]"><ShieldCheck className="h-4 w-4" />هوية ركيزة الزمردية</div></div></section>

          <section className="mt-5 grid gap-3 sm:grid-cols-3">{metrics.map(item => { const Icon = item.icon; return <article key={item.label} className="rounded-2xl border border-white/20 bg-white/[0.09] p-4 shadow-[0_10px_26px_rgba(0,0,0,0.1)] backdrop-blur-xl"><div className="flex items-center justify-between"><span className={`grid h-10 w-10 place-items-center rounded-2xl border border-white/18 bg-white/10 ${item.accent}`}><Icon className="h-[18px] w-[18px]" /></span><span className="text-2xl font-black text-white/90">—</span></div><p className="mt-5 text-sm font-black">{item.label}</p><p className="mt-1 text-[11px] font-semibold text-[#d1e8dc]">{item.hint}</p></article>; })}</section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <article className="rounded-2xl border border-white/20 bg-white/[0.09] p-4 shadow-[0_14px_34px_rgba(0,0,0,0.11)] backdrop-blur-xl sm:p-5"><div className="flex items-center justify-between gap-3 border-b border-white/12 pb-4"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl border border-white/16 bg-white/10 text-[#dfffe7]"><ListTodo className="h-4 w-4" /></span><div><h2 className="text-sm font-black">مسار العمل اليومي</h2><p className="mt-0.5 text-[10px] font-semibold text-[#c8ded2]">شكل مقترح لقائمة الأعمال</p></div></div><button type="button" className="rounded-xl border border-white/20 bg-white/7 px-2.5 py-1.5 text-[10px] font-black text-[#e5f5ea]">عرض الكل</button></div><div className="divide-y divide-white/10">{samples.map(item => <div key={item.title} className="flex items-center gap-3 py-4"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${item.tone}`}><ClipboardCheck className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-white">{item.title}</p><p className="mt-1 truncate text-[11px] text-[#cbdfd3]">{item.context}</p></div><ChevronLeft className="h-4 w-4 text-[#c8dfd2]" /></div>)}</div></article>
            <aside className="rounded-2xl border border-white/22 bg-[#0b4c3d]/42 p-5 shadow-[0_14px_38px_rgba(0,0,0,0.15)] backdrop-blur-2xl"><div className="flex items-center gap-2 text-[#ffe39b]"><Sparkles className="h-4 w-4" /><span className="text-xs font-black">الطبقة التنظيمية</span></div><h2 className="mt-3 text-base font-black">الرؤية من دون ازدحام</h2><p className="mt-2 text-xs leading-6 text-[#d3eadd]">النوافذ الزجاجية تفصل المساحات من دون حدود ثقيلة وتبقي سياق العمل مرئياً.</p><div className="mt-5 space-y-2 border-t border-white/12 pt-4"><div className="flex items-center gap-3 text-xs font-bold"><UsersRound className="h-4 w-4 text-[#a5e2bc]" />أمانة المحكمة</div><div className="mr-3 flex items-center gap-3 text-xs font-bold text-[#d9eee2]"><BookOpenCheck className="h-4 w-4 text-[#f0d589]" />المكتب التنسيقي</div><div className="mr-6 flex items-center gap-3 text-xs font-bold text-[#d9eee2]"><ChartNoAxesCombined className="h-4 w-4 text-[#f0d589]" />الإدارات والأقسام</div></div><div className="mt-6 rounded-xl border border-white/13 bg-white/6 p-3 text-[11px] leading-6 text-[#d9eee2]"><span className="font-black text-[#ffe19b]">التفاعل المقترح:</span> انتقالات قصيرة وشفافة، بلا حركات مشتتة أثناء قراءة الأعمال.</div></aside>
          </section>
        </main>
      </div>
    </div>
  );
}
