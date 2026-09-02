# رَكيزة — منصة المحكمة الداخلية

نظام تشغيل داخلي للمحكمة العمالية بالرياض: المهام، الحضور، البريد الداخلي، الاعتمادات، التفويض، المداورة، ومؤشرات القيادة.

## التشغيل المحلي

```bash
pnpm install
pnpm dev
```

افتح `http://localhost:3000` بعد ضبط ملف البيئة على جهاز التشغيل فقط. لا ترفع أسرار الدخول إلى غيث هاب.

## الاستضافة
رَكيزة مشروع مستقل عن AZ Alpha Vision. نفس فكرة الربط (غيث هاب + Vercel) لكن حساباً ومستودعاً ورابطاً خاصاً بها.

- مستودع رَكيزة: https://github.com/alrasid-dev/rakiza-manassa
- رابط رَكيزة الحي: https://alrasid-dev.github.io/rakiza-manassa/
- مستودع المشروع الأول: https://github.com/alrasid-dev/AZ_Alpha-Vision
- رابط المشروع الأول: https://azalphavision.vercel.app

عند الاستيراد في Vercel اختاري «Create New Project» باسم `rakiza-manassa`، ولا تضيفيه داخل مشروع AZ Alpha Vision.

البناء المحلي: `pnpm build` ثم `pnpm start`. مسار الصحة: `/health`.

## الاستخدام

راجع [دليل-الاستخدام.md](./دليل-الاستخدام.md).
