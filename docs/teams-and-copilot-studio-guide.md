# إدخال المنصة في Microsoft Teams وCopilot Studio

## المسار الأول: تطبيق Teams داخلي

تعمل المنصة أولاً كتطبيق ويب مستقل. بعد نشرها برابط إنتاج ثابت، تُحوَّل إلى تطبيق Teams شخصي يعرض نفس الصفحة داخل Teams على الحاسوب والويب. الحزمة الجاهزة توجد خارج مجلد المشروع باسم `teams-court-internal-platform.zip`، لكن يلزم استبدال النص `__PUBLISHED_DOMAIN__` باسم النطاق الفعلي للنشر قبل رفعها.

| الخطوة | المسؤول | الإجراء |
|---|---|---|
| 1 | مالك المنصة | إنشاء نقطة تفتيش ثم اختيار **Publish** من واجهة المشروع للحصول على نطاق إنتاج ثابت. |
| 2 | مالك المنصة أو قسم التقنية | استبدال `__PUBLISHED_DOMAIN__` في `manifest.json` بالنطاق فقط، من دون `https://` أو مسار. |
| 3 | مسؤول Teams أو مستخدم مخول | في Teams: **Apps** ثم **Manage your apps** ثم **Upload an app** ثم **Upload a custom app**، واختيار ملف ZIP. |
| 4 | مسؤول Teams | عند حظر الرفع المخصص، يرفع الحزمة إلى مركز إدارة Teams ويعين سياسة التطبيق للمستخدمين أو المجموعة المقصودة. |
| 5 | المستخدم | يثبت التطبيق في النطاق الشخصي داخل Teams؛ تظل البيانات والصلاحيات نفسها التي يراها على الويب. |

لا تضف بيانات حساسة إلى وصف الحزمة أو اسمها. لا تتضمن الحزمة الحالية تسجيل الدخول الموحد؛ لذلك سيستمر الدخول المؤقت إلى أن تسجل الجهة التطبيق في Microsoft Entra ID وتعتمد SSO.

## المسار الثاني: Copilot Studio

لا يستورد Copilot Studio تطبيق الويب تلقائياً. بل ينشأ **وكيل** منفصل يمكن نشره داخل Teams وMicrosoft 365 Copilot ليستقبل أسئلة العمل المسموح بها. يوصى أن يبدأ الوكيل بدليل الاستخدام والسياسات العامة فقط، ثم تتوسع مصادره بعد اعتماد الجهة.

| الخطوة | الإجراء |
|---|---|
| 1 | افتح Copilot Studio في مستأجر Microsoft 365 التابع للجهة وأنشئ وكيلاً جديداً. |
| 2 | أضف مصادر معرفة مصرحاً بها، مثل دليل المستخدم وإجراءات الدعم، ولا تضف ملفات القضايا أو سجلات الأشخاص دون موافقة أمن المعلومات. |
| 3 | في **Channels** فعّل Teams وMicrosoft 365 Copilot ثم انشر الوكيل. |
| 4 | يراجع مسؤول Teams سياسات التطبيقات والأذونات، ثم يوزع الوكيل على المجموعة المقصودة. |
| 5 | عند الحاجة إلى تنفيذ إجراءات من الوكيل، يربط قسم التقنية واجهة API محمية بتسجيل Entra ID ومبدأ أقل صلاحية؛ لا يستخدم الوكيل قاعدة بيانات المنصة مباشرة. |

## متى نحتاج فريق التقنية؟

يلزم دعم فريق التقنية عند حظر رفع التطبيقات المخصصة، أو عند الحاجة إلى توزيع مركزي، أو تفعيل تسجيل Entra ID وMFA، أو إرسال البريد عبر Microsoft Graph، أو منح Copilot Studio أي وصول تشغيلي. تبقى إشعارات التطبيق الداخلية متاحة حتى قبل هذه الخطوات.

## مراجع رسمية

[1]: https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/deploy-and-publish/apps-upload "Upload your custom app - Microsoft Learn"
[2]: https://learn.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/authentication/tab-sso-overview "Enable SSO for tab app - Microsoft Learn"
[3]: https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-add-bot-to-microsoft-teams "Connect and configure an agent for Teams and Microsoft 365 Copilot - Microsoft Learn"
