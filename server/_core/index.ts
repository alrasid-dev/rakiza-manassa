import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleTraineeDueSoonSchedule } from "../scheduled/trainee-due-soon";
import { handleDailyTaskReminderSchedule, handleLeaveStatusRefreshSchedule, handleSupportTicketEscalationSchedule, handleTaskEscalationSchedule, handleTraineeExcelSyncSchedule } from "../scheduled/task-automation";
import { handleAttendanceConfirmationSchedule } from "../scheduled/attendance-confirmation";
import { handleInternalMailSchedule } from "../scheduled/internal-mail";
import { trpcMutationOriginGuard } from "./originGuard";
import { securityHeaders } from "./securityHeaders";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(securityHeaders);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.post("/api/scheduled/trainee-due-soon", handleTraineeDueSoonSchedule);
  app.post("/api/scheduled/daily-task-reminder", handleDailyTaskReminderSchedule);
  app.post("/api/scheduled/task-escalation", handleTaskEscalationSchedule);
  app.post("/api/scheduled/leave-status-refresh", handleLeaveStatusRefreshSchedule);
  app.post("/api/scheduled/trainee-excel-sync", handleTraineeExcelSyncSchedule);
  app.post("/api/scheduled/support-ticket-escalation", handleSupportTicketEscalationSchedule);
  app.post("/api/scheduled/attendance-confirmation", handleAttendanceConfirmationSchedule);
  app.post("/api/scheduled/internal-mail-dispatch", handleInternalMailSchedule);
  // tRPC API
  app.use(
    "/api/trpc",
    trpcMutationOriginGuard,
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
