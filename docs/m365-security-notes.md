# ملاحظات مبدئية للتكامل المؤسسي والأمن

## المصادقة المؤسسية

سيُسجَّل تطبيق المنصة في مستأجر المحكمة داخل Microsoft Entra ID كتطبيق ويب، مع مسار إعادة توجيه إنتاجي محدد. تدعم منصة Microsoft الهوية المعيارية OpenID Connect من خلال نقطة إعدادات عامة لكل تسجيل تطبيق، وتُضبط مسارات إعادة التوجيه من قسم **Authentication** في تسجيل التطبيق.[1]

## الوصول إلى ملف المتعثرات

سيقتصر اتصال Microsoft Graph على موقع Teams أو مورد SharePoint والملف اللذين تعتمدهم الجهة. توفر Microsoft صلاحيات محددة تتطلب ثلاثة ضوابط مستقلة: موافقة المسؤول على الصلاحية، ومنحاً صريحاً للمورد المحدد، ورمز وصول يحمل الصلاحية. لا يمنح مجرد إقرار الصلاحية وصولاً تلقائياً إلى موارد الفريق.[2]

## البريد المؤسسي

سترسل المنصة من صندوق بريد إشعارات مخصص، لا من حساب موظف شخصي. ويُقيد وصول التطبيق إلى هذا الصندوق تحديداً عبر **RBAC للتطبيقات في Exchange Online** مع نطاق مورد مخصص؛ توضح Microsoft أن هذا النهج يمنح وصولاً دقيقاً قابلاً للتوسع إلى صناديق بريد محددة ويحل محل نهج سياسات وصول التطبيقات الأقدم.[3]

## قرار تصميمي مبدئي

ستكون حسابات المنصة منفصلة عن أسرار التكامل، ولن يوضع أي مفتاح وصول في واجهة المستخدم أو المستودع. وسيتطلب التشغيل الفعلي موافقة مسؤول Microsoft 365 على تسجيل التطبيق والصلاحيات المقيدة ومورد Teams المستهدف.

## المراجع

[1]: https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc "OpenID Connect on the Microsoft identity platform"
[2]: https://learn.microsoft.com/en-us/graph/permissions-selected-overview "Overview of Selected Permissions in OneDrive and SharePoint"
[3]: https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac "Role Based Access Control for Applications in Exchange Online"
