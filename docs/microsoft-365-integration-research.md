# بحث التكامل مع Microsoft 365 وTeams وCopilot

## Teams وتسجيل الدخول الموحد

توثق Microsoft أن تطبيق تبويب Teams يمكنه استخدام تسجيل دخول موحد عبر Microsoft Entra ID، بحيث يستفيد المستخدم من جلسة Microsoft 365 داخل Teams دون تسجيل دخول مستقل مرة أخرى. يتطلب ذلك تسجيل التطبيق في Entra ID ثم ضبط بيان تطبيق Teams وبيانات SSO. [1]

## نشر التطبيق داخل Teams

يمكن رفع حزمة تطبيق Teams مخصصة لاختبارها أو توزيعها ضمن نطاق محدود، بشرط أن تسمح سياسات المؤسسة برفع التطبيقات المخصصة. يرفع المستخدم الحزمة من **Apps > Manage your apps > Upload an app > Upload a custom app**، بينما يتطلب التوزيع المؤسسي الواسع موافقة مسؤول Teams وسياسات التطبيقات المناسبة. لا يتاح الرفع المخصص في GCC High أو DoD وفق الوثائق الحالية. [2]

## البريد الإلكتروني التشغيلي

توفر Microsoft Graph واجهة `sendMail` لإرسال رسائل البريد؛ إذن الحد الأدنى الموثق لكل من السياق المفوض أو سياق التطبيق هو `Mail.Send`. ينبغي في بيئة المحكمة اعتماد مبدأ أقل صلاحية، واستخدام صندوق بريد خدمة مخصص بدلاً من منح الإذن الواسع لحسابات الأفراد. [3]

## Copilot

تشير وثائق Microsoft Copilot Studio إلى إمكان ربط وكيل مع Teams وMicrosoft 365 Copilot بعد نشره في قنوات المؤسسة. هذا مسار اختياري منفصل عن تطبيق الويب: يمكن استخدامه كواجهة استعلام معرفي منضبطة بعد تحديد مصادر المعرفة والصلاحيات، ولا يمنح التطبيق صلاحيات وصول تلقائية إلى بيانات المحكمة. [4]

## الاستنتاج التنفيذي

التطبيق الحالي قابل للنشر كتطبيق ويب داخلي أولاً. بعد موافقة الجهة، يوصى بربطه بتسجيل Entra ID، ثم تغليفه كتطبيق Teams Tab، ثم إضافة Graph للبريد التشغيلي. إذا لم تتوفر صلاحيات المسؤول، تبقى المنصة على مصادقتها الحالية مع طلب دعم فريق Microsoft 365 لإتمام التسجيل والموافقات.

## المراجع

[1]: https://learn.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/authentication/tab-sso-overview "Enable SSO for tab app - Microsoft Learn"
[2]: https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/deploy-and-publish/apps-upload "Upload your custom app - Microsoft Learn"
[3]: https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0 "user: sendMail - Microsoft Graph v1.0"
[4]: https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-add-bot-to-microsoft-teams "Connect and configure an agent for Teams and Microsoft 365 Copilot - Microsoft Learn"
