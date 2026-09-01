import DashboardLayout from "@/components/DashboardLayout";
import { BellRing, CheckCheck, MessageSquare, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

function notificationTaskId(value: string | null) { const match = value?.match(/task-(\d+)/); return match ? Number(match[1]) : null; }
function notificationConversationId(value: string | null) { const match = value?.match(/^chat-message-(\d+)-/); return match ? Number(match[1]) : null; }

export default function NotificationsPage() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const notifications = trpc.court.notifications.listMine.useQuery();
  const markRead = trpc.court.notifications.markRead.useMutation({ onSuccess: () => utils.court.notifications.listMine.invalidate() });
  const unread = notifications.data?.filter(item => !item.isRead).length ?? 0;
  const openNotification = (item: any) => {
    if (!item.isRead) markRead.mutate({ notificationId: item.id });
    const taskId = notificationTaskId(item.dedupeKey);
    const conversationId = notificationConversationId(item.dedupeKey);
    if (taskId) setLocation(`/tasks?taskId=${taskId}`);
    else if (conversationId) setLocation(`/messages?conversationId=${conversationId}`);
  };
  return <DashboardLayout><section dir="rtl" className="mx-auto max-w-4xl"><header className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black tracking-[.12em] text-[#4a785a]">المتابعة اليومية</p><h1 className="mt-2 text-3xl font-black text-[#12352f]">الإشعارات</h1><p className="mt-2 text-base text-[#53695e]">{unread ? `${unread} إشعارات جديدة تحتاج مراجعتك.` : "لا توجد إشعارات جديدة."}</p></div>{unread ? <button type="button" onClick={() => notifications.data?.filter(item => !item.isRead).forEach(item => markRead.mutate({ notificationId: item.id }))} className="inline-flex items-center gap-2 rounded-xl border border-[#c7d6c7] bg-[#f8f8f3] px-3 py-2 text-sm font-black text-[#315e49]"><CheckCheck className="h-4 w-4" />تحديد الكل كمقروء</button> : null}</header><div className="overflow-hidden rounded-[1.5rem] border border-[#cad7ca] bg-[#f8f8f3] shadow-[0_10px_28px_rgba(30,61,48,.06)]">{notifications.isLoading ? <p className="p-8 text-center text-base text-[#6d7e74]">جارٍ تحميل الإشعارات…</p> : notifications.data?.length ? notifications.data.map(item => <article key={item.id} className={`flex items-start gap-3 border-b border-[#dfe7dd] p-5 last:border-0 ${item.isRead ? "bg-[#f8f8f3]" : "bg-[#e8f1e7]"}`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#dce9da] text-[#2d6b4f]">{item.category === "chat_message" ? <MessageSquare className="h-5 w-5" /> : <BellRing className="h-5 w-5" />}</span><button type="button" onClick={() => openNotification(item)} className="min-w-0 flex-1 text-right"><p className="text-base font-black text-[#274738]">{item.title}</p><p className="mt-1 text-sm leading-7 text-[#596d61]">{item.body}</p><p className="mt-2 text-xs text-[#788a7f]">{new Date(item.sentAt).toLocaleString("ar-SA")}</p></button>{!item.isRead ? <button type="button" aria-label="تحديد كمقروء" onClick={() => markRead.mutate({ notificationId: item.id })} className="rounded-lg border border-[#bcd0bd] px-2 py-1.5 text-xs font-bold text-[#2d6b4f]">مقروء</button> : <ArrowLeft className="mt-3 h-4 w-4 text-[#829188]" />}</article>) : <div className="p-10 text-center"><BellRing className="mx-auto h-10 w-10 text-[#aebeb0]" /><p className="mt-3 text-base font-bold text-[#53695e]">ستظهر هنا التوصيات والتنبيهات السابقة.</p></div>}</div></section></DashboardLayout>;
}
