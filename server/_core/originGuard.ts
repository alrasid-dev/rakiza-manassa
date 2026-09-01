import type { NextFunction, Request, Response } from "express";

export function isAllowedTrpcMutationOrigin(input: { method: string; origin?: string; host?: string; forwardedHost?: string; protocol?: string; forwardedProto?: string }) {
  if (input.method.toUpperCase() !== "POST") return true;
  if (!input.origin) return false;
  const host = input.forwardedHost?.split(",")[0]?.trim() || input.host;
  const protocol = input.forwardedProto?.split(",")[0]?.trim() || input.protocol || "https";
  if (!host) return false;
  try {
    return new URL(input.origin).origin === `${protocol}://${host}`;
  } catch {
    return false;
  }
}

export function trpcMutationOriginGuard(req: Request, res: Response, next: NextFunction) {
  const allowed = isAllowedTrpcMutationOrigin({
    method: req.method,
    origin: req.get("origin") || undefined,
    host: req.get("host") || undefined,
    forwardedHost: req.get("x-forwarded-host") || undefined,
    protocol: req.protocol,
    forwardedProto: req.get("x-forwarded-proto") || undefined,
  });
  if (!allowed) return res.status(403).json({ error: "invalid-request-origin" });
  return next();
}
