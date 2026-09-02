import type { Express } from "express";
import fs from "node:fs";
import { type Server } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";

function moduleDirname() {
  return path.dirname(fileURLToPath(import.meta.url));
}

/** تطوير محلي فقط. لا يُستورد هذا الملف أثناء بناء Vercel حتى لا يُحمَّل Vite مع الدالة. */
export async function setupVite(app: Express, server: Server) {
  const [{ createServer: createViteServer }, viteConfigModule] = await Promise.all([
    import("vite"),
    import("../../vite.config"),
  ]);
  const viteConfig = viteConfigModule.default;
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: { server },
      allowedHosts: true as const,
    },
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use(async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(moduleDirname(), "../..", "client", "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      next(error);
    }
  });
}
