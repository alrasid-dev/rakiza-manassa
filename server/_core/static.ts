import express, { type Express } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function moduleDirname() {
  return typeof import.meta.dirname === "string" ? import.meta.dirname : path.dirname(fileURLToPath(import.meta.url));
}

export function resolvePublicDir() {
  const here = moduleDirname();
  const candidates = [
    path.resolve(process.cwd(), "public"),
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(here, "../..", "dist", "public"),
    path.resolve(here, "..", "..", "public"),
    path.resolve(here, "public"),
  ];
  return candidates.find(candidate => fs.existsSync(path.join(candidate, "index.html"))) ?? candidates[0];
}

export function serveStatic(app: Express) {
  const distPath = resolvePublicDir();
  if (!fs.existsSync(path.join(distPath, "index.html"))) {
    console.error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
  }

  app.use(express.static(distPath));
  app.use((_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
