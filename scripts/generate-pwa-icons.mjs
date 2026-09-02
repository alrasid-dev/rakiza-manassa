import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "client", "public", "icons");
mkdirSync(outDir, { recursive: true });

function crc32(buffer) {
  let crc = ~0;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return ~crc >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function png(size, colorAt) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x += 1) {
      const [r, g, b, a] = colorAt(x, y, size);
      const offset = y * (size * 4 + 1) + 1 + x * 4;
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
      raw[offset + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function roundedRect(x, y, size, inset, radius) {
  const left = inset;
  const right = size - 1 - inset;
  const top = inset;
  const bottom = size - 1 - inset;
  if (x < left || x > right || y < top || y > bottom) return false;
  const dx = x < left + radius ? left + radius - x : x > right - radius ? x - (right - radius) : 0;
  const dy = y < top + radius ? top + radius - y : y > bottom - radius ? y - (bottom - radius) : 0;
  return dx * dx + dy * dy <= radius * radius || dx === 0 || dy === 0;
}

function emblem(x, y, size, pad) {
  const left = pad;
  const width = size - pad * 2;
  const nx = (x - left) / width;
  const ny = (y - pad) / width;
  if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return false;
  const cx = Math.abs(nx - 0.5);
  const roof = ny > 0.16 && ny < 0.28 && cx < 0.28 - (ny - 0.16);
  const pillar = ny >= 0.28 && ny <= 0.68 && ((cx > 0.16 && cx < 0.22) || cx < 0.05);
  const beam = ny >= 0.3 && ny <= 0.36 && cx < 0.24;
  const base = ny >= 0.7 && ny <= 0.78 && cx < 0.3;
  const step = ny >= 0.8 && ny <= 0.86 && cx < 0.36;
  return roof || pillar || beam || base || step;
}

function paint(size, { maskable = false } = {}) {
  const inset = maskable ? Math.round(size * 0.12) : Math.round(size * 0.04);
  const radius = Math.round(size * 0.18);
  const pad = maskable ? Math.round(size * 0.26) : Math.round(size * 0.2);
  return png(size, (x, y) => {
    if (!roundedRect(x, y, size, inset, radius)) return [0, 0, 0, 0];
    if (emblem(x, y, size, pad)) return [247, 245, 239, 255];
    return [18, 53, 47, 255];
  });
}

writeFileSync(join(outDir, "pwa-192.png"), paint(192));
writeFileSync(join(outDir, "pwa-512.png"), paint(512));
writeFileSync(join(outDir, "pwa-512-maskable.png"), paint(512, { maskable: true }));
writeFileSync(join(outDir, "apple-touch-180.png"), paint(180));
console.log("PWA icons written to", outDir);
