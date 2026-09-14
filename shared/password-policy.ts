/**
 * سياسة كلمة المرور المعتمدة في رَكيزة.
 *
 * تُفرض السياسة عند تعيين كلمة المرور أول مرة (أو تغييرها) في الواجهة؛ لأن قيمة كلمة المرور
 * لا تمر على خادم رَكيزة: Firebase Authentication هو من يحتفظ بها ويتحقق منها.
 * ولا تُفرض عند الدخول إلا بشرط الطول، حتى لا يُحجب حساب مسجَّل مسبقاً بكلمة مرور أبسط.
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;

export const PASSWORD_POLICY_HINT = `${PASSWORD_MIN_LENGTH} خانات على الأقل، وتشمل حرفاً ورقماً معاً.`;

export type PasswordPolicyCheck = { ok: true; message: "" } | { ok: false; message: string };

const LETTER_PATTERN = /\p{L}/u;
const NUMBER_PATTERN = /\p{N}/u;

function fail(message: string): PasswordPolicyCheck {
  return { ok: false, message };
}

/** تتحقق من كلمة مرور جديدة: الطول المطلوب + حرف واحد على الأقل + رقم واحد على الأقل. */
export function validateNewPassword(password: string): PasswordPolicyCheck {
  const value = String(password ?? "");
  if (!value) return fail("أدخل كلمة المرور.");
  if (value.length < PASSWORD_MIN_LENGTH) return fail(`كلمة المرور يجب أن تكون ${PASSWORD_MIN_LENGTH} خانات على الأقل.`);
  if (value.length > PASSWORD_MAX_LENGTH) return fail(`كلمة المرور يجب ألا تتجاوز ${PASSWORD_MAX_LENGTH} خانة.`);
  if (!LETTER_PATTERN.test(value)) return fail("أضف حرفاً واحداً على الأقل إلى كلمة المرور.");
  if (!NUMBER_PATTERN.test(value)) return fail("أضف رقماً واحداً على الأقل إلى كلمة المرور.");
  return { ok: true, message: "" };
}

/** تتحقق من كلمة المرور عند الدخول: الطول فقط، احتراماً للحسابات المسجَّلة مسبقاً. */
export function validateLoginPassword(password: string): PasswordPolicyCheck {
  const value = String(password ?? "");
  if (!value) return fail("أدخل كلمة المرور.");
  if (value.length < PASSWORD_MIN_LENGTH) return fail(`كلمة المرور يجب أن تكون ${PASSWORD_MIN_LENGTH} خانات على الأقل.`);
  return { ok: true, message: "" };
}
