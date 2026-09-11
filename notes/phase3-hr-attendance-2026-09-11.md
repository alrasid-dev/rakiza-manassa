# المرحلة 3 — موارد بشرية وحضور (بنود 15–19) — 2026-09-11

الفرع: `feat/phase3-hr-attendance`

## ما نُفّذ
15. **أيقونات نقل / تكليف / تفويض**: شريط إجراءات في `/people` + عناصر قائمة الموارد البشرية. النقل يحدّث القسم عبر `people.update`، التكليف عبر `ProfileAssignmentPanel` → `people.createDelegation`، التفويض يفتح `/delegation` (تفويض صلاحية مؤقت).
16. **وردية 07:30–14:30 Asia/Riyadh** (`flex-3`): إظهار الحضور من 07:00، والسماح بالانصراف من 14:15 دون رصيد سالب لـ 15 دقيقة (`earlyCheckoutDeficitMinutes` + `attendance-balance.ts`). ترحيل `0078_phase3_hr_attendance.sql`.
17. **تأكيد الحضور الآلي قابل للفتح/الإيقاف** للكل أو لأقسام محددة عبر `attendanceTargetUnitIds` في السياسة وواجهة «سياسة تأكيد الحضور».
18. **احترام مجاز/مستأذن**: `isProfileExcusedOrOnLeave` يتخطى طلب التأكيد لمن بحالة إجازة/استئذان معتمد أو سجل حضور excused/on_leave.
19. **سياسة الاستئذان**: مرة/يوم، 240 دقيقة/طلب، 1000 دقيقة/شهر؛ بعد تجاوز 3 استئذانات → إشعار «لفت نظر» + إحالة لأمين المحكمة (`requiresSecretaryReview`).

## تحقق
1. `pnpm check`
2. `pnpm exec vitest run server/attendance-balance.test.ts server/excuse-policy.test.ts server/attendance-window.test.ts client/src/pages/personnel-workspace.integration.test.tsx client/src/pages/status-workspace-content.integration.test.tsx`
3. واجهة `/people`: أيقونات نقل/تكليف/تفويض تعمل.
4. `/status`: اختيار أقسام لتأكيد الحضور؛ نموذج الاستئذان بـ datetime.

## ملاحظات
- لا تُضمَّن ملفات `notes/personnel-extract-*` أو `.env` في الالتزام.
- الاستضافة تبقى ضمن المسار المجاني فقط.
