/**
 * Turns the source photos in ../assets/images (project root /assets/images) into
 * responsive WebP variants + a JPG fallback in public/images, and writes
 * src/assets/image-manifest.json that <Picture/> reads.
 *
 *   npm run images
 *
 * Re-run whenever you add or swap a photo. Drop new sources (named to match
 * site.ts: hero-desktop, service-inspection, project-01, financing, …) into
 * /assets/images in any of: .jpg .jpeg .png .webp .avif
 */
import { readdir, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(__dirname, "..");
// sources live at <project>/assets/images (one level above the app folder)
const SRC_DIRS = [path.resolve(APP, "../assets/images"), path.resolve(APP, "assets/images")];
const OUT = path.resolve(APP, "public/images");
const MANIFEST = path.resolve(APP, "src/assets/image-manifest.json");

const WIDTHS = [480, 768, 1024, 1600, 2048];
const JPG_WIDTH = 1280;
const EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

async function run() {
  const srcDir = SRC_DIRS.find((d) => existsSync(d));
  if (!srcDir) {
    console.error("No source image folder found at", SRC_DIRS.join(" or "));
    process.exit(1);
  }
  await mkdir(OUT, { recursive: true });
  await mkdir(path.dirname(MANIFEST), { recursive: true });

  const files = (await readdir(srcDir)).filter((f) => EXT.has(path.extname(f).toLowerCase()));
  const manifest = {};

  for (const file of files) {
    const name = path.basename(file, path.extname(file));
    const input = path.join(srcDir, file);
    const meta = await sharp(input).metadata();
    const maxW = meta.width ?? 2048;

    const widths = WIDTHS.filter((w) => w <= maxW);
    if (widths.length === 0 || Math.max(...widths) < maxW) widths.push(Math.min(maxW, 2560));
    const uniqueWidths = [...new Set(widths)].sort((a, b) => a - b);

    for (const w of uniqueWidths) {
      await sharp(input)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 72, effort: 5 })
        .toFile(path.join(OUT, `${name}-${w}.webp`));
    }

    const jpgW = Math.min(JPG_WIDTH, maxW);
    await sharp(input)
      .resize({ width: jpgW, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(path.join(OUT, `${name}-${jpgW}.jpg`));

    manifest[name] = { widths: uniqueWidths, jpg: jpgW };
    console.log(`✓ ${name}  → ${uniqueWidths.join("/")} webp + ${jpgW} jpg`);
  }

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\nWrote ${Object.keys(manifest).length} images to public/images and ${path.relative(APP, MANIFEST)}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
