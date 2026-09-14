# سياسة كلمة المرور وقناة البريد الإضافي (2026-09-14)

ملاحظة تغييرات لتنفيذ البنود المطلوبة، بلا مساس بأي سياسة تشغيل أخرى معتمدة.

## القرارات

- **كلمة المرور:** تُفرض قاعدة «8 خانات على الأقل + حرف + رقم» عند **تعيين** كلمة المرور أول مرة (أو تغييرها)، ولا تُفرض عند الدخول إلا بشرط الطول، حتى لا يُحجب أي حساب مسجَّل سابقاً بكلمة مرور أبسط.
  - سبب عدم الفرض عند الدخول: قاعدة التعقيد على حساب قديم تُنتج قفلاً خارج الحساب بلا مسار استعادة فوري.
  - سبب الفرض في الواجهة فقط على قيمة كلمة المرور: الخادم لا يستلم قيمة كلمة المرور أبداً؛ Firebase Authentication هو من يحتفظ بها ويتحقق منها.
- **الدخول عند تعيين كلمة المرور:** يبقى كما هو: كلمة أول مرة ثم الاستمرار عليها دون تحقق إضافي في كل دخول، مع بقاء OTP والبصمة مسارين مستقلين.
- **البصمة:** لم يُغيَّر منطق WebAuthn. النطاق (RP ID) والأصل المتوقع يُشتقّان من نطاق الطلب، فتعمل البصمة على أي نطاق HTTPS دون تهيئة إضافية، و`WEBAUTHN_RP_ID`/`WEBAUTHN_ORIGIN` للتحكم الصريح فقط.
- **قناة البريد الإضافي:** `work` = البريد الرسمي فقط، `backup` = الإضافي بعد توثيقه وإلا الرسمي، `both` = نسخة للبريدين بعد التوثيق. الصف القديم بلا تفضيل محدد يُبقي السلوك السابق (الإضافي الموثّق يتقدّم).
- **حفظ التفضيل:** صار `updateUserEmailSettings` يحافظ على التفضيل القائم عند عدم تحديده، بدل إجباره على `backup`، ويُسجَّل في سجل التدقيق.
- **سياسة تسليم الإشعارات** في `docs/notification-delivery-policy.md` لم تُعدَّل: الإشعار الداخلي يبقى القناة التشغيلية، والبريد قناة إضافية.

## الملفات

| الملف | التغيير |
|---|---|
| `shared/password-policy.ts` | جديد: `validateNewPassword`، `validateLoginPassword`، `PASSWORD_POLICY_HINT`، `PASSWORD_MIN_LENGTH`، `PASSWORD_MAX_LENGTH` |
| `shared/password-policy.test.ts` | جديد: 6 اختبارات |
| `client/src/components/FirebaseAuthPanel.tsx` | فرض السياسة في مساري الدخول والتعيين + إظهار التلميح |
| `client/src/components/firebase-auth-panel.test.tsx` | جديد: 7 اختبارات |
| `client/src/pages/EmailSettingsPage.tsx` | قسم «قناة إرسال التنبيهات» + حفظ التفضيل مع البريد |
| `client/src/pages/email-settings-page.test.tsx` | 4 اختبارات (كان اختباراً واحداً) |
| `server/court-service.ts` | `getNotificationEmailRecipients` يحترم التفضيل، و`updateUserEmailSettings` يحفظه ويسجّله |
| `server/routers/court.ts` | `emailSettings.mine/update` يدعمان `notificationPreference` |
| `server/email-identity-policy.test.ts` | 6 اختبارات (زيادة اختبارين) |
| `vitest.config.ts` | إضافة `shared/**/*.test.ts` إلى الاكتشاف |
| `README.md` و`.env.example` | الرابط الحي وسياسة الدخول وأسماء متغيرات البيئة |

## كيف تتحقق

1. `pnpm check` ثم `pnpm test`.
2. `/login`: كلمة مرور من أرقام فقط أو أحرف فقط تُرفض برسالة عربية واضحة، و`rakiza2026` تُقبل.
3. `/email-settings`: تظهر القنوات الثلاث، ويُعطَّل «الإضافي فقط» و«البريدان معاً» قبل إضافة بريد إضافي.
4. `GET /health` على رابط التشغيل يعيد `ok: true`.

## ملاحظات صريحة

- الفشل المسبق في المجموعة الكاملة (8 ملفات / 10 اختبارات: `mail-schedule-button`، `home-dashboard.integration`، `dashboard-operational-pages.integration`، `announcements-router`، `decisions-router`، `judges-router`، `role-scope-policy`، `roles-owner-router`) **قائم قبل هذه التغييرات بذات العدد**، وقد تم التحقق من ذلك بمقارنة حالة `HEAD` عبر `git stash`، ولم يُلمس في هذا العمل.
- نشر Vercel يحتاج استيراد المستودع من حساب مالك المنصة وإضافة متغيرات البيئة؛ لا يمكن إنشاء مشروع Vercel أو ربطه من داخل الشيفرة.
- النطاق المخصص ليس مجانياً؛ المجاني هو النطاق الفرعي للمنصة مع HTTPS تلقائي.
