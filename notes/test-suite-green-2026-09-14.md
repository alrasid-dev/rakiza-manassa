# تصفير فشل الاختبارات ومطابقتها لنظام التوثيق الجديد (2026-09-14)

المجموعة الكاملة كانت تحتوي 10 اختبارات فاشلة في 8 ملفات قبل هذا العمل. هذه ملاحظة ما جرى بالضبط.

## التشخيص والعلاج

| الملف | السبب الحقيقي | العلاج |
|---|---|---|
| `server/roles-owner-router.test.ts` | الاختبار ينادي إجراءات المالك بحساب `owner@court.example` فترفضه السياسة الجديدة | استخدام `ENV.platformOwnerEmail` (بريد المالك المعتمد) + اختبار سلبي جديد يثبت رفض بريد رسمي غير مالك حتى بدور إداري |
| `server/role-scope-policy.test.ts` | نفس السبب في اختبار وحدات المنصة وإضافة البرمجيات | `ENV.platformOwnerEmail` |
| `server/announcements-router.test.ts` | نفس السبب في نشر الإعلان، ومعه استهزاء `getAccessPermission` مفتاحه البريد القديم | ربط المفتاح بـ `ENV.platformOwnerEmail` |
| `server/decisions-router.test.ts` | نفس السبب في الإنشاء والنشر | `ENV.platformOwnerEmail` + اختبار سلبي جديد لبريد رسمي غير مالك |
| `server/judges-router.test.ts` | نفس السبب في إنشاء وتعديل ملف القاضي | `ENV.platformOwnerEmail` |
| `client/src/pages/home-dashboard.integration.test.tsx` | استهزاء `DashboardLayout` بتصدير واحد فقط، بينما لوحة الأيقونات تستورد `oliveIconMotionClass` | استهزاء جزئي يحفظ التصديرات الحقيقية عبر `importOriginal` |
| `client/src/pages/dashboard-operational-pages.integration.test.tsx` | `React is not defined` في `DashboardQuickIcons.tsx` | ضبط `esbuild: { jsx: "automatic" }` في `vitest.config.ts` ليطابق تحويل الإنتاج (React 19) |
| `client/src/components/mail-schedule-button.test.tsx` | توقّع نص UTC ثابت لحقل `datetime-local` ففشل على منطقة زمنية غير UTC | مقارنة الوقت المحلي الذي أدخله المستخدم (مستقل عن منطقة الجهاز) |

## ضوابط التزام

- **لم يُخفَّف أي تحقق أمني**: `requirePlatformOwner` و`isPlatformOwnerEmail` وحدود الصلاحيات كما هي؛ التعديل على الاختبارات فقط، مع إضافة اختبارين سلبيين جديدين يرسّخان السياسة.
- **لم تُغيَّر أي سياسة تشغيل**: العزل، سجل التدقيق، تسليم الإشعارات، وحدود المالك بلا مساس.
- اختبارات جديدة لضبط العزل بين الاختبارات (`beforeEach` لتصفير الموكات) تمنع نتائج متسربة بين الحالات.

## النتيجة المقيسة

- `pnpm test`: **159 ملفاً ناجحاً · 421 اختباراً ناجحاً · 0 فشل** (10 متخطاة بالتصميم).
- `pnpm check`: 0.
- `vercel-build` محلياً: 0.

## قاعدة للمستقبل

أي اختبار ينادي إجراءً محصوراً بالمالك يجب أن يستخدم `ENV.platformOwnerEmail`، لا بريداً ثابتاً في الاختبار، حتى يبقى الاختبار مطابقاً للطريقة التي يعرّف بها الخادم المالك.
