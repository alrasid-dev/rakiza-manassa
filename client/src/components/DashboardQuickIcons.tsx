import CourtStructureMenu from "@/components/CourtStructureMenu";
import { oliveIconMotionClass } from "@/components/DashboardLayout";
import { Award, BadgeHelp, BellRing, FileBarChart2, FileUp, LayoutDashboard, ListChecks, Mail, Megaphone, MessageSquare, Settings2, UserCog } from "lucide-react";
import { useLocation } from "wouter";

const icons = [
  { label: "الرئيسية", path: "/", Icon: LayoutDashboard, tone: "bg-[#1f7a4d] text-white ring-[#1f7a4d]/25", tile: "border-[#9fcbb0] from-[#e5f6ea] to-[#cfe9d7]" },
  { label: "مهامي", path: "/tasks", Icon: ListChecks, tone: "bg-[#2d6b4f] text-white ring-[#2d6b4f]/25", tile: "border-[#a8c9b0] from-[#e8f3ea] to-[#d4e8d8]" },
  { label: "الإشعارات", path: "/notifications", Icon: BellRing, tone: "bg-[#c83b3b] text-white ring-[#c83b3b]/30", tile: "border-[#e3b0a8] from-[#fdecea] to-[#f6d4cf]", alert: true },
  { label: "الدردشات", path: "/messages", Icon: MessageSquare, tone: "bg-[#1f6f8c] text-white ring-[#1f6f8c]/25", tile: "border-[#9fc5d4] from-[#e6f4f8] to-[#d0e7ef]" },
  { label: "بريد ركيزة", path: "/rakiza-mail", Icon: Mail, tone: "bg-[#245f43] text-white ring-[#245f43]/25", tile: "border-[#9fbfab] from-[#e4f0e7] to-[#d0e4d6]" },
  { label: "رفع التقارير", path: "/report-upload", Icon: FileUp, tone: "bg-[#0b6b3a] text-white ring-[#0b6b3a]/25", tile: "border-[#95c4a5] from-[#e3f5e8] to-[#c9e6d2]" },
  { label: "التقارير", path: "/reports", Icon: FileBarChart2, tone: "bg-[#80642b] text-white ring-[#80642b]/25", tile: "border-[#dbc48a] from-[#f8f0d8] to-[#efe0b4]" },
  { label: "دليل المستخدم", path: "/guide", Icon: BadgeHelp, tone: "bg-[#355d8a] text-white ring-[#355d8a]/25", tile: "border-[#a7bed8] from-[#eaf1f8] to-[#d5e2f0]" },
  { label: "الإعلانات", path: "/announcements", Icon: Megaphone, tone: "bg-[#8a5a1f] text-white ring-[#8a5a1f]/25", tile: "border-[#dfc08a] from-[#f8efd8] to-[#f0dfb5]" },
  { label: "الإنجازات", path: "/achievements", Icon: Award, tone: "bg-[#5b3f8c] text-white ring-[#5b3f8c]/25", tile: "border-[#c3b0df] from-[#f3edf9] to-[#e4d7f2]" },
  { label: "إعدادات الموظف", path: "/personal-settings", Icon: UserCog, tone: "bg-[#3f7354] text-white ring-[#3f7354]/25", tile: "border-[#a8c5b1] from-[#e9f3eb] to-[#d5e7da]" },
  { label: "إعدادات المنصة", path: "/platform-settings", Icon: Settings2, tone: "bg-[#355d4b] text-white ring-[#355d4b]/25", tile: "border-[#a3b9ac] from-[#e8efe9] to-[#d5e1d8]" },
] as const;

export default function DashboardQuickIcons() {
  const [, setLocation] = useLocation();
  return (
    <section aria-label="اختصارات لوحة القيادة" className="mt-5 rounded-2xl border border-[#cfd7ca] bg-[#f7f8f3] p-4 shadow-[0_8px_22px_rgba(36,67,51,0.05)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-black text-[#4a785a]">اختصارات تفاعلية</p>
          <h2 className="text-sm font-black text-[#25463a]">أيقونات العمل السريع</h2>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
        {icons.map(item => (
          <button
            key={item.label}
            type="button"
            onClick={() => setLocation(item.path)}
            className={`flex flex-col items-center gap-2 rounded-2xl border bg-gradient-to-b px-2 py-3 text-center shadow-[0_8px_16px_rgba(36,67,51,0.08)] transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#78a886] ${item.tile}`}
          >
            <span className={`grid h-11 w-11 place-items-center rounded-xl shadow-md ring-4 ${item.tone}`}>
              <item.Icon className={`h-5 w-5 ${oliveIconMotionClass}`} aria-hidden="true" strokeWidth={2.2} />
            </span>
            <span className={`text-[11px] font-black ${"alert" in item && item.alert ? "text-[#a8493b]" : "text-[#1f4d38]"}`}>{item.label}</span>
          </button>
        ))}
        <CourtStructureMenu variant="tile" />
      </div>
    </section>
  );
}
