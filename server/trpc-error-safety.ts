const SAFE_CLIENT_CODES = new Set([
  "BAD_REQUEST",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "PRECONDITION_FAILED",
  "TOO_MANY_REQUESTS",
]);

export function safeTrpcErrorMessage(code: string, message: string) {
  return SAFE_CLIENT_CODES.has(code) ? message : "تعذر تنفيذ الطلب الآن. يرجى المحاولة لاحقاً أو التواصل مع الدعم التقني.";
}

export function stripTrpcStack<T extends Record<string, unknown>>(data: T) {
  const { stack: _stack, ...safeData } = data;
  return safeData;
}
