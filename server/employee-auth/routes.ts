import type { Express, NextFunction, Request, Response } from "express";
import {
  EMPLOYEE_SESSION_COOKIE,
  approvedDirectory,
  confirmOneTimeCode,
  currentEmployee,
  loginWithBiometric,
  loginWithPin,
  logout,
  registerBiometric,
  registerStaff,
  setNotificationPreference,
  startPasswordRecovery,
  completePasswordRecovery,
} from "./service";

function readToken(req: Request) {
  const cookie = req.headers.cookie ?? "";
  const match = cookie.split(";").map(part => part.trim()).find(part => part.startsWith(`${EMPLOYEE_SESSION_COOKIE}=`));
  return match?.slice(EMPLOYEE_SESSION_COOKIE.length + 1);
}

function setSessionCookie(res: Response, token: string) {
  res.cookie(EMPLOYEE_SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 12 * 60 * 60 * 1000 });
}

function handle(handler: (req: Request, res: Response) => unknown) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "تعذر تنفيذ الطلب." });
    }
  };
}

export function registerEmployeeAuthRoutes(app: Express) {
  app.get("/api/employee-auth/directory", (_req, res) => {
    res.json({ approvedEmployees: approvedDirectory() });
  });

  app.post("/api/employee-auth/register", handle((req, res) => {
    const result = registerStaff(req.body ?? {});
    res.status(201).json(result);
  }));

  app.post("/api/employee-auth/verify-once", handle((req, res) => {
    const result = confirmOneTimeCode({ challengeId: String(req.body?.challengeId ?? ""), code: String(req.body?.code ?? "") });
    setSessionCookie(res, result.token);
    res.json({ verified: true, purpose: result.purpose });
  }));

  app.post("/api/employee-auth/recover/start", handle((req, res) => {
    res.json(startPasswordRecovery(String(req.body?.email ?? "")));
  }));

  app.post("/api/employee-auth/recover/complete", handle((req, res) => {
    const result = completePasswordRecovery({
      challengeId: String(req.body?.challengeId ?? ""),
      code: String(req.body?.code ?? ""),
      password: String(req.body?.password ?? ""),
      pin: String(req.body?.pin ?? ""),
    });
    setSessionCookie(res, result.token);
    res.json({ success: true });
  }));

  // الدخول اليومي: PIN فقط — بلا بريد وبلا OTP.
  app.post("/api/employee-auth/login/pin", handle((req, res) => {
    const result = loginWithPin(String(req.body?.pin ?? ""));
    setSessionCookie(res, result.token);
    res.json({ employee: result.employee });
  }));

  // الدخول اليومي: البصمة فقط.
  app.post("/api/employee-auth/login/biometric", handle((req, res) => {
    const result = loginWithBiometric(String(req.body?.credentialId ?? ""));
    setSessionCookie(res, result.token);
    res.json({ employee: result.employee });
  }));

  app.post("/api/employee-auth/devices/biometric", handle((req, res) => {
    res.json(registerBiometric(readToken(req) ?? "", String(req.body?.credentialId ?? "")));
  }));

  app.get("/api/employee-auth/me", (req, res) => {
    res.json({ employee: currentEmployee(readToken(req)) });
  });

  app.post("/api/employee-auth/logout", handle((req, res) => {
    logout(readToken(req));
    res.clearCookie(EMPLOYEE_SESSION_COOKIE, { path: "/" });
    res.json({ success: true });
  }));

  // الإشعارات: صفحة الإعدادات فقط، ليست جزءاً من الدخول.
  app.post("/api/employee-auth/settings/notifications", handle((req, res) => {
    res.json(setNotificationPreference(readToken(req) ?? "", Boolean(req.body?.enabled)));
  }));
}
