/** احتساب رصيد الانصراف المبكر بتوقيت الوردية (دقائق من منتصف الليل بتوقيت الرياض). */

export function saudiLocalMinutes(date: Date) {
  const saudi = new Date(date.getTime() + 3 * 60 * 60 * 1000);
  return saudi.getUTCHours() * 60 + saudi.getUTCMinutes();
}

/**
 * السماح بالانصراف من actualEnd (مثلاً 14:15) دون احتساب الدقائق حتى endMinutes (14:30) كرصيد سلبي.
 * قبل actualEnd تُحتسب الدقائق من نهاية الدوام الرسمي.
 */
export function earlyCheckoutDeficitMinutes(input: {
  checkOutAt: Date;
  actualEndMinutes: number;
  endMinutes: number;
}) {
  const checkoutMinutes = saudiLocalMinutes(input.checkOutAt);
  if (checkoutMinutes >= input.actualEndMinutes) return 0;
  return Math.max(0, input.endMinutes - checkoutMinutes);
}

export const BASE_FLEX3_SHIFT = {
  name: "الوردية الأساسية",
  code: "flex-3",
  startMinutes: 450, // 07:30
  endMinutes: 870, // 14:30
  fingerprintOpenMinutes: 420, // 07:00 — إظهار «سجّل حضورك»
  lateStartMinutes: 480, // 08:00
  morningCompensationDeadlineMinutes: 495, // 08:15
  actualEndMinutes: 855, // 14:15 — انصراف مبكر مسموح بلا رصيد سالب
  eveningCompensationDeadlineMinutes: 885, // 14:45
  fingerprintCloseMinutes: 900, // 15:00
  workingDays: "0,1,2,3,4",
} as const;

export default { earlyCheckoutDeficitMinutes, saudiLocalMinutes, BASE_FLEX3_SHIFT };
