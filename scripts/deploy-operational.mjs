import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const configPath = new URL("../.project-config.json", import.meta.url);
if (!existsSync(configPath)) {
  console.error("ملف إعداد التشغيل المحلي غير موجود على هذا الجهاز.");
  process.exit(1);
}

const config = JSON.parse(readFileSync(configPath, "utf8"));
const keys = [
  "DATABASE_URL",
  "JWT_SECRET",
  "BREVO_API_KEY",
  "BREVO_SENDER_EMAIL",
  "PLATFORM_OWNER_EMAIL",
  "OWNER_OPEN_ID",
  "VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "VAPID_SUBJECT",
  "VITE_APP_ID",
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_APP_ID",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_VAPID_KEY",
];

const envFlags = [];
for (const key of keys) {
  const value = config[key];
  if (typeof value === "string" && value.trim()) envFlags.push("--env", `${key}=${value}`);
}

const result = spawnSync("npx", ["--yes", "vercel", "deploy", "--yes", "--temporary", "--archive=tgz", ...envFlags], {
  cwd: new URL("..", import.meta.url),
  stdio: ["ignore", "pipe", "pipe"],
  encoding: "utf8",
  shell: true,
});

const output = `${result.stdout || ""}\n${result.stderr || ""}`;
const urls = output.match(/https:\/\/[a-z0-9-]+\.vercel\.app/gi) || [];
if (urls.length) console.log(urls.filter((url, index) => urls.indexOf(url) === index).join("\n"));
if (result.status !== 0) {
  const safe = output.replace(/mysql:\/\/[^\s]+/gi, "mysql://***").replace(/xkeysib-[A-Za-z0-9-]+/gi, "xkeysib-***");
  console.error(safe.slice(-4000));
  process.exit(result.status ?? 1);
}
