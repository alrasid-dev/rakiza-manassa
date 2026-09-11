# Phase 1 — Auth & Roles (2026-09-11)

Branch: `feat/phase1-auth-roles`

## Decisions
- Login allowlist: `@moj.gov.sa` **plus** `rakizaplatform@gmail.com` (PLATFORM_OWNER_EMAIL) only.
- Removed ad-hoc exception `abdulaziz.stocks11@gmail.com` from login/registration allowlist.
- Primary login UX: email + password (Firebase), with OTP/passkeys remaining as secondary methods under the same allowlist.
- First login: `users.mustChangePassword` (default true). OTP success issues activation token and forces password set; exchange with activation/completePasswordSetup clears the flag. Seed flags all users to mustChangePassword=true.
- Owner-only programmatic delegation: `requirePlatformOwner` now checks **true owner email**, not merely `full_control` grant. Granting `full_control` on registration review is owner-only. Software modules / leadership role assign remain owner-gated.
- السميح: stays in `مكتب فضيلة رئيس المحكمة` as `administrative_staff` — **no** invented «مدير المكتب السري» role.
- الصويغ: confirmed court president `snaswig@moj.gov.sa` → `court_president`.
- Notification email UI path remains at `/email-settings`; linked from `/personal-settings`.

## Leadership table

| Role (AR) | roleKey | Name | Email | Dept |
|---|---|---|---|---|
| المالك | — / full_control | مالك المنصة | rakizaplatform@gmail.com | — |
| رئيس المحكمة | court_president | سعد ناصر عبدالعزيز الصويغ | snaswig@moj.gov.sa | — |
| الرئيس المساعد | assistant_president | حاتم محمد عبدالله الفالح | hfaleh@moj.gov.sa | أصحاب الفضيلة |
| أمين المحكمة | court_secretary | عبدالله شباب سليمان العتيبي | abssotaibi@moj.gov.sa | أمانة المحكمة |
| مدير مكتب الرئيس | department_manager | بندر حمد عبدالعزيز الصالح | bhabdaziz@moj.gov.sa | مكتب فضيلة رئيس المحكمة |
| موظف مكتب الرئيس | administrative_staff | سعد حسن عبدالرحمن السميح | shsamaih@moj.gov.sa | مكتب فضيلة رئيس المحكمة |
| مدير قسم تسليم الأحكام | department_manager | عبدالعزيز محمد بن عبدالعزيز الحميدي | amhumaidi@moj.gov.sa | تسليم الاحكام |

## How to verify
1. `pnpm check`
2. `pnpm test` (esp. email-allowlist, firebase-auth-router, auth-experiment-page)
3. Login page shows bottom-left: دخول المالك / تسجيل موظف جديد / الحصول على المساعدة
4. Non-`@moj.gov.sa` (except owner) rejected client + server
5. With DB: `node scripts/seed-phase1-leadership.mjs` then confirm roles/grants
6. Owner-only: non-owner with full_control grant cannot call `court.roles.assign` / grant full_control
