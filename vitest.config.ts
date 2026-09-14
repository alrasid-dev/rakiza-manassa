import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "server/**/*.spec.ts", "client/**/*.test.tsx", "shared/**/*.test.ts"],
    // اختبارات الواجهة الشاملة تركّب عشرات الصفحات ومكوّنات Radix بالتوازي، فترتفع مهل الانتظار
    // لتفادي فشل هشّ لا علاقة له بصحة الشيفرة.
    testTimeout: 20000,
    hookTimeout: 30000,
    server: {
      deps: {
        // حزم تستورد ملفات CSS (katex عبر streamdown) فيتعذر تحميلها كوحدة خارجية.
        inline: ["streamdown", "katex", "rehype-katex", "react-markdown", "remark-gfm"],
      },
    },
  },
});
