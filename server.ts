import { app } from "./server/_core/app";
import { serveStatic } from "./server/_core/static";

serveStatic(app);

export default app;
