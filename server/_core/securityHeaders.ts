import type { NextFunction, Request, Response } from "express";

export function buildSecurityHeaders(isProduction: boolean) {
  const headers: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  };

  if (isProduction) {
    headers["Content-Security-Policy"] = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "form-action 'self'",
      "frame-ancestors 'self' https://teams.microsoft.com https://*.teams.microsoft.com https://*.cloud.microsoft",
      "script-src 'self' https://*.manus.im https://*.manus.com https://apis.google.com https://www.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.manus.im https://*.manus.com https://www.gstatic.com",
      "connect-src 'self' https://*.manus.im https://*.manus.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://securetoken.google.com https://firestore.googleapis.com https://firebaseinstallations.googleapis.com https://*.googleapis.com",
      "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://apis.google.com",
      "worker-src 'self'",
      "upgrade-insecure-requests",
    ].join("; ");
  }
  return headers;
}

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  const headers = buildSecurityHeaders(process.env.NODE_ENV === "production");
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
  next();
}
