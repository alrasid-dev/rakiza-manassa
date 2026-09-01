type ServiceWorkerContainerLike = {
  register: (scriptURL: string, options?: RegistrationOptions) => Promise<unknown>;
};

export async function registerPlatformServiceWorker(serviceWorker: ServiceWorkerContainerLike | undefined = typeof navigator === "undefined" ? undefined : navigator.serviceWorker) {
  if (!serviceWorker) return null;
  try {
    return await serviceWorker.register("/sw.js", { scope: "/" });
  } catch (error) {
    console.warn("[PWA] تعذر تسجيل عامل الخدمة", error);
    return null;
  }
}
