import { Download } from "lucide-react";
import React, { useEffect, useState } from "react";

type DeferredInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<unknown>;
};

export function PwaInstallHint() {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredInstallPrompt | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as DeferredInstallPrompt);
    };
    window.addEventListener("beforeinstallprompt", capturePrompt);
    return () => window.removeEventListener("beforeinstallprompt", capturePrompt);
  }, []);

  if (!deferredPrompt) return null;

  const install = async () => {
    setIsRequesting(true);
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsRequesting(false);
  };

  return (
    <aside className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-[#dce8dc] bg-[#f1f7f0] px-4 py-3 text-right shadow-[0_8px_20px_rgba(0,86,53,0.05)]" aria-label="تثبيت التطبيق">
      <div className="min-w-0">
        <p className="text-sm font-bold text-[#17483a]">استخدم المنصة كتطبيق على هذا الجهاز</p>
        <p className="mt-0.5 text-xs leading-5 text-[#60766b]">يُفتح التطبيق في نافذة مستقلة بالحساب والصلاحيات نفسها.</p>
      </div>
      <button type="button" onClick={() => void install()} disabled={isRequesting} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#006c35] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#00582c] disabled:opacity-60">
        <Download className="h-4 w-4" aria-hidden="true" />
        {isRequesting ? "جارٍ الفتح" : "تثبيت"}
      </button>
    </aside>
  );
}
