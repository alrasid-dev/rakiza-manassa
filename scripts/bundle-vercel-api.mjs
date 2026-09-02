import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";

const outfile = "api/handler.js";

await esbuild.build({
  entryPoints: ["api/handler.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  outfile,
  alias: { "@shared": path.resolve("shared") },
  logLevel: "info",
});

const bundled = fs.readFileSync(outfile, "utf8");
if (/from\s+["']\.\.\/server["']/.test(bundled) || /from\s+["']\.\/server["']/.test(bundled)) {
  console.error("Vercel bundle still contains a directory import of server/");
  process.exit(1);
}

console.log("Vercel API bundle ready:", outfile);
