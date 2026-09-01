import { taskIdFromNotificationDedupeKey } from "@/lib/taskNotificationRoute";
import React from "react";
import { useState } from "react";

type PlatformNotification = {
  id: number;
  title: string;
  body: string;
  category: string;
  dedupeKey: string | null;
  isRead: boolean;
  sentAt: Date;
};

function conversationIdFromNotificationDedupeKey(value: string | null) {
  const match = value?.match(/^chat-message-(\d+)-\d+-\d+$/);
  return match ? Number(match[1]) : null;
}

export function NotificationCenter({ notifications, isLoading, unreadCount, onClose, onMarkRead, onOpenTask, onOpenConversation }: { notifications?: PlatformNotification[]; isLoading: boolean; unreadCount: number; onClose: () => void; onMarkRead: (notificationId: number) => void; onOpenTask: (taskId: number, notificationId: number, isRead: boolean) => void; onOpenConversation: (conversationId: number, notificationId: number, isRead: boolean) => void }) {
  const [view, setView] = useState<"unread" | "all">("unread");
  const [visibleCount, setVisibleCount] = useState(10);
  const allNotifications = notifications ?? [];
  const filteredNotifications = view === "all" ? allNotifications : allNotifications.filter(notification => !notification.isRead);
  const visibleNotifications = filteredNotifications.slice(0, visibleCount);
  return <section role="dialog" aria-label="مركز الإشعارات" className="absolute left-0 top-12 z-40 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#cbd6ca] bg-[#f8f8f3] shadow-[0_20px_50px_rgba(36,67,51,0.16)]"><div className="flex items-center justify-between border-b border-[#dbe1d7] px-4 py-3"><div><p className="text-sm font-bold text-[#244637]">مركز الإشعارات</p><p className="mt-0.5 text-[11px] text-[#718078]">{unreadCount ? `${unreadCount} غير مقروء` : "لا توجد إشعارات جديدة"}</p></div><button type="button" onClick={onClose} className="text-xs font-bold text-[#66766d] hover:text-[#245f43]">إغلاق</button></div><div className="flex border-b border-[#dbe1d7] p-2"><button type="button" onClick={() => { setView("unread"); setVisibleCount(10); }} className={`flex-1 rounded-lg px-2 py-2 text-xs font-bold ${view === "unread" ? "bg-[#dce9da] text-[#245f43]" : "text-[#718078]"}`}>الجديدة ({unreadCount})</button><button type="button" onClick={() => { setView("all"); setVisibleCount(10); }} className={`flex-1 rounded-lg px-2 py-2 text-xs font-bold ${view === "all" ? "bg-[#eceee6] text-[#486455]" : "text-[#718078]"}`}>السجل الكامل</button></div><div className="max-h-96 overflow-y-auto">{isLoading ? <p className="p-5 text-sm text-[#718078]">جارٍ تحميل الإشعارات…</p> : visibleNotifications.length ? visibleNotifications.map(notification => { const taskId = notification.category === "task_due" ? taskIdFromNotificationDedupeKey(notification.dedupeKey) : null; const conversationId = notification.category === "chat_message" ? conversationIdFromNotificationDedupeKey(notification.dedupeKey) : null; return <article key={notification.id} className={`border-b border-[#e1e5dd] p-4 last:border-0 ${notification.isRead ? "bg-[#f8f8f3]" : "bg-[#e9f1e8]"}`}><div className="flex items-start justify-between gap-3"><button type="button" onClick={() => { if (taskId) onOpenTask(taskId, notification.id, notification.isRead); else if (conversationId) onOpenConversation(conversationId, notification.id, notification.isRead); else if (!notification.isRead) onMarkRead(notification.id); }} className="min-w-0 cursor-pointer text-right focus:outline-none focus-visible:ring-2 focus-visible:ring-[#78a886]"><p className="text-sm font-bold text-[#28473a]">{notification.title}</p><p className="mt-1 text-xs leading-5 text-[#687970]">{notification.body}</p><p className="mt-2 text-[10px] text-[#8a8172]">{new Date(notification.sentAt).toLocaleString("ar-SA")}</p>{taskId && <p className="mt-2 text-[11px] font-bold text-[#245f43]">فتح تفاصيل المهمة وإجراءاتها</p>}{conversationId && <p className="mt-2 text-[11px] font-bold text-[#245f43]">فتح الدردشة</p>}</button>{!notification.isRead && <button type="button" onClick={() => onMarkRead(notification.id)} className="shrink-0 text-[11px] font-bold text-[#245f43] hover:text-[#486455]">تمت القراءة</button>}</div></article>; }) : <p className="p-6 text-center text-sm leading-7 text-[#718078]">لا توجد إشعارات في هذا العرض. ستظهر هنا التوصيات والتنبيهات السابقة للمراجعة.</p>}{view === "all" && visibleNotifications.length < filteredNotifications.length && <button type="button" onClick={() => setVisibleCount(count => count + 10)} className="m-3 w-[calc(100%-1.5rem)] rounded-xl border border-[#c6d4c7] px-3 py-2.5 text-xs font-bold text-[#31594d] hover:bg-[#e8f0e7]">عرض المزيد من الإشعارات القديمة</button>}</div></section>;
}
