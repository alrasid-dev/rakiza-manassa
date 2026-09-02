export const ANDROID_APK_URL = "https://github.com/alrasid-dev/rakiza-manassa/releases/download/android-latest/rakiza-manassa.apk";

type ServiceWorkerContainerLike = {
  register: (scriptURL: string, options?: RegistrationOptions) => Promise<unknown>;
};

export function platformBasePath(base = import.meta.env.BASE_URL || "/") {
  return base.endsWith("/") ? base : `${base}/`;
}

export function platformHref(path: string, base = platformBasePath()) {
  return `${base}${String(path).replace(/^\//, "")}`;
}

export function platformServiceWorkerUrl(base = platformBasePath()) {
  return `${base}sw.js`;
}

export function isStandaloneDisplay(media = typeof window === "undefined" || typeof window.matchMedia !== "function" ? undefined : window.matchMedia.bind(window), navigatorLike: { standalone?: boolean } | undefined = typeof navigator === "undefined" ? undefined : navigator) {
  try {
    return Boolean(media?.("(display-mode: standalone)")?.matches || media?.("(display-mode: window-controls-overlay)")?.matches || navigatorLike?.standalone);
  } catch {
    return Boolean(navigatorLike?.standalone);
  }
}

export function installSurface(userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent, standalone = isStandaloneDisplay()) {
  if (standalone) return "installed";
  if (/iphone|ipad|ipod/i.test(userAgent) || (/macintosh/i.test(userAgent) && typeof navigator !== "undefined" && navigator.maxTouchPoints > 1)) return "ios";
  if (/android/i.test(userAgent)) return "android";
  return "desktop";
}

export async function registerPlatformServiceWorker(serviceWorker: ServiceWorkerContainerLike | undefined = typeof navigator === "undefined" ? undefined : navigator.serviceWorker) {
  if (!serviceWorker) return null;
  try {
    const base = platformBasePath();
    return await serviceWorker.register(platformServiceWorkerUrl(base), { scope: base });
  } catch (error) {
    console.warn("[PWA] تعذر تسجيل عامل الخدمة", error);
    return null;
  }
}
