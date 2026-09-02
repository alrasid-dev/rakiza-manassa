export const STATIC_HOST_LOGIN_MESSAGE = "خادم الدخول غير متصل على رابط العرض. افتح رابط التشغيل الكامل لتسجيل الدخول.";

export function operationalOrigin(env = import.meta.env as { VITE_OPERATIONAL_ORIGIN?: string }) {
  return String(env.VITE_OPERATIONAL_ORIGIN || "").replace(/\/$/, "");
}

export function isPublicStaticHost(hostname = typeof window === "undefined" ? "" : window.location.hostname) {
  return /\.github\.io$/i.test(hostname);
}

export function operationalLoginHref(search = typeof window === "undefined" ? "" : window.location.search, env = import.meta.env as { VITE_OPERATIONAL_ORIGIN?: string }) {
  const origin = operationalOrigin(env);
  return origin ? `${origin}/login${search}` : "";
}

export function trpcHttpUrl() {
  return "/api/trpc";
}

export function messageIfHtmlApiBody(body: string, contentType = "") {
  const preview = String(body || "").trimStart();
  if (preview.startsWith("<") || (contentType && !/json|text\/plain/i.test(contentType) && /html/i.test(contentType))) {
    return STATIC_HOST_LOGIN_MESSAGE;
  }
  return null;
}
