import { app } from "../server/_core/app";
import { serveStatic } from "../server/_core/static";

try {
  serveStatic(app);
} catch (error) {
  console.error("[vercel] static files unavailable at startup", error);
}

export default app;
