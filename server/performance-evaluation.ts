export type PerformanceTier = "outstanding" | "steady" | "needs_follow_up" | "at_risk" | "awaiting_data";

export type PerformanceEvaluationInput = {
  positive: number;
  negative: number;
  balance: number;
  positiveEventCount: number;
  negativeEventCount: number;
};

export type PerformanceEvaluation = {
  tier: PerformanceTier;
  label: string;
  description: string;
};

export const DEFAULT_PERFORMANCE_WEIGHTS = {
  attendance: 0.2,
  achievement: 0.4,
  timeliness: 0.15,
  quality: 0.15,
  initiatives: 0.1,
} as const;

export type WeightedPerformanceMetrics = {
  attendance?: number | null;
  achievement?: number | null;
  timeliness?: number | null;
  quality?: number | null;
  initiatives?: number | null;
};

export type WeightedPerformanceResult = {
  score: number | null;
  completedMetricCount: number;
  missingMetrics: Array<keyof typeof DEFAULT_PERFORMANCE_WEIGHTS>;
  weights: typeof DEFAULT_PERFORMANCE_WEIGHTS;
};

export function calculateWeightedPerformance(metrics: WeightedPerformanceMetrics): WeightedPerformanceResult {
  const entries = Object.entries(DEFAULT_PERFORMANCE_WEIGHTS) as Array<[keyof typeof DEFAULT_PERFORMANCE_WEIGHTS, number]>;
  const missingMetrics = entries.filter(([key]) => metrics[key] == null).map(([key]) => key);
  const completedMetricCount = entries.length - missingMetrics.length;
  if (!completedMetricCount) return { score: null, completedMetricCount, missingMetrics, weights: DEFAULT_PERFORMANCE_WEIGHTS };
  const score = entries.reduce((total, [key, weight]) => total + Math.max(0, Math.min(100, metrics[key] ?? 0)) * weight, 0);
  return { score: Math.round(score * 100) / 100, completedMetricCount, missingMetrics, weights: DEFAULT_PERFORMANCE_WEIGHTS };
}

export function evaluatePerformance(input: PerformanceEvaluationInput): PerformanceEvaluation {
  const eventCount = input.positiveEventCount + input.negativeEventCount;
  if (!eventCount) return { tier: "awaiting_data", label: "بانتظار بيانات", description: "يظهر المؤشر بعد تسجيل حركة نقاط تشغيلية مرتبطة بإنجاز أو متابعة." };
  if (input.balance <= -5 || (input.negativeEventCount >= 3 && input.balance <= 0)) return { tier: "at_risk", label: "يتطلب تدخلاً", description: "توجد مؤشرات تأخر أو مساءلات سلبية تستدعي المتابعة مع المسؤول المباشر." };
  if (input.balance < 4 || input.negativeEventCount > input.positiveEventCount) return { tier: "needs_follow_up", label: "يحتاج متابعة", description: "المؤشر مبني على رصيد النقاط الحالي ويحتاج إلى تعزيز الإنجاز أو معالجة عناصر التأخر." };
  if (input.balance >= 12 && input.positiveEventCount >= 3 && input.negative <= 3) return { tier: "outstanding", label: "أداء متميز", description: "يعكس المؤشر رصيداً إيجابياً مستقراً من الإنجازات المعتمدة ضمن السجل." };
  return { tier: "steady", label: "أداء مستقر", description: "يعكس المؤشر توازناً إيجابياً في الحركات المسجلة خلال الفترة الحالية." };
}
