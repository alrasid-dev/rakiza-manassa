# مراجع Brevo للتكامل

## توثيق الإرسال
- https://developers.brevo.com/docs/send-a-transactional-email
- https://developers.brevo.com/reference/send-transac-email

توضح الوثائق الرسمية أن إرسال البريد المعاملاتي يتم عبر `POST https://api.brevo.com/v3/smtp/email`، باستخدام ترويسة `api-key`، وحقول `sender` و`to` و`subject` وأحد `htmlContent` أو `textContent` أو `templateId`. كما تشترط إعداد مفتاح API وتسجيل مرسل بريد قبل الإرسال.

## لوحة المفاتيح
- https://app.brevo.com/settings/keys/api

## التسعير
- https://www.brevo.com/pricing/

تظهر صفحة التسعير الرسمية أن Brevo يوفر خطة مجانية، بينما يجب التحقق من حدود الإرسال المعاملاتي الحالية داخل الحساب قبل الاستخدام التشغيلي.
