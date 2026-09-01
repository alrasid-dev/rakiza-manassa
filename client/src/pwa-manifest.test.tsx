import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("بيان PWA لرَكيزة", () => {
  it("يثبت الهوية العربية ونمط التطبيق المستقل والأيقونات المطلوبة", () => {
    const manifest = JSON.parse(readFileSync(join(process.cwd(), "client/public/manifest.webmanifest"), "utf8")) as {
      name: string;
      short_name: string;
      lang: string;
      dir: string;
      display: string;
      icons: Array<{ sizes: string }>;
    };

    expect(manifest.name).toBe("رَكيزة");
    expect(manifest.short_name).toBe("رَكيزة");
    expect(manifest.lang).toBe("ar");
    expect(manifest.dir).toBe("rtl");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons.map(icon => icon.sizes)).toEqual(expect.arrayContaining(["192x192", "512x512"]));
  });
});
