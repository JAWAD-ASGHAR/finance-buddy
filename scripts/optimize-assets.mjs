import { execFileSync } from "node:child_process";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");
const heroVideosDir = path.join(publicDir, "marketing", "hero");
const marketingDir = path.join(publicDir, "marketing");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm"]);
const SKIP_IMAGE_BASENAMES = new Set([
  "favicon.png",
  "favicon-48.png",
  "apple-touch-icon.png",
]);

const WEBP_QUALITY = 78;
const WEBP_RECOMPRESS_MIN_BYTES = 250 * 1024;
const IMAGE_MAX_WIDTH = 1920;
const POSTER_WIDTH = 1280;
const POSTER_QUALITY = 70;
const VIDEO_MAX_WIDTH = 1280;
const VIDEO_CRF_MP4 = 28;
const VIDEO_CRF_WEBM = 34;

async function walk(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }
    files.push(fullPath);
  }

  return files;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function buildSharpPipeline(inputBuffer, maxWidth) {
  return sharp(inputBuffer)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true });
}

async function convertImageToWebp(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(ext)) return null;
  if (SKIP_IMAGE_BASENAMES.has(path.basename(filePath))) return null;

  const baseName = filePath.slice(0, -ext.length);
  const outputPath = `${baseName}.webp`;
  const inputStat = await fsp.stat(filePath);
  const inputBuffer = await fsp.readFile(filePath);

  await buildSharpPipeline(inputBuffer, IMAGE_MAX_WIDTH)
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toFile(outputPath);

  const outputStat = await fsp.stat(outputPath);
  console.log(
    `  image ${path.relative(publicDir, filePath)} -> ${path.basename(outputPath)} (${formatBytes(inputStat.size)} -> ${formatBytes(outputStat.size)})`,
  );

  return outputPath;
}

async function recompressWebp(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== ".webp") return null;
  if (filePath.includes(".poster-temp.")) return null;

  const inputStat = await fsp.stat(filePath);
  if (inputStat.size < WEBP_RECOMPRESS_MIN_BYTES) return null;

  const inputBuffer = await fsp.readFile(filePath);
  const tempPath = `${filePath}.tmp.webp`;

  await buildSharpPipeline(inputBuffer, IMAGE_MAX_WIDTH)
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toFile(tempPath);

  const outputStat = await fsp.stat(tempPath);
  if (outputStat.size >= inputStat.size) {
    await fsp.unlink(tempPath);
    console.log(
      `  skip webp ${path.relative(publicDir, filePath)} (already optimal at ${formatBytes(inputStat.size)})`,
    );
    return null;
  }

  await fsp.rename(tempPath, filePath);
  console.log(
    `  webp ${path.relative(publicDir, filePath)} (${formatBytes(inputStat.size)} -> ${formatBytes(outputStat.size)})`,
  );

  return filePath;
}

function optimizeVideo(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  if (!VIDEO_EXTENSIONS.has(ext)) return;

  const maxWidth = VIDEO_MAX_WIDTH;
  const tempPath = `${inputPath.slice(0, -ext.length)}.optimized${ext}`;
  const inputStat = fs.statSync(inputPath);

  const args = ["-y", "-i", inputPath, "-an"];

  if (ext === ".webm") {
    args.push(
      "-vf",
      `scale='min(${maxWidth},iw)':-2`,
      "-c:v",
      "libvpx-vp9",
      "-crf",
      String(VIDEO_CRF_WEBM),
      "-b:v",
      "0",
      "-row-mt",
      "1",
      "-deadline",
      "good",
      "-cpu-used",
      "2",
    );
  } else {
    args.push(
      "-vf",
      `scale='min(${maxWidth},iw)':-2`,
      "-c:v",
      "libx264",
      "-crf",
      String(VIDEO_CRF_MP4),
      "-preset",
      "slow",
      "-movflags",
      "+faststart",
    );
  }

  args.push(tempPath);

  execFileSync(ffmpegPath.path, args, { stdio: "inherit" });

  fs.renameSync(tempPath, inputPath);
  const outputStat = fs.statSync(inputPath);
  console.log(
    `  video ${path.relative(publicDir, inputPath)} (${formatBytes(inputStat.size)} -> ${formatBytes(outputStat.size)})`,
  );
}

async function createVideoPoster(videoPath) {
  const ext = path.extname(videoPath);
  const posterPath = `${videoPath.slice(0, -ext.length)}-poster.webp`;
  const tempJpg = `${videoPath.slice(0, -ext.length)}.poster-temp.jpg`;

  execFileSync(
    ffmpegPath.path,
    [
      "-y",
      "-i",
      videoPath,
      "-vf",
      `select=eq(n\\,0),scale='min(${POSTER_WIDTH},iw)':-2`,
      "-frames:v",
      "1",
      tempJpg,
    ],
    { stdio: "inherit" },
  );

  await sharp(tempJpg)
    .webp({ quality: POSTER_QUALITY, effort: 6 })
    .toFile(posterPath);

  fs.unlinkSync(tempJpg);

  const posterStat = fs.statSync(posterPath);
  console.log(
    `  poster ${path.relative(publicDir, posterPath)} (${formatBytes(posterStat.size)})`,
  );
}

async function main() {
  console.log("Optimizing assets in public/...\n");

  const files = await walk(publicDir);
  const images = files.filter((file) => {
    if (!IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase())) return false;
    return file.startsWith(marketingDir) || file.startsWith(path.join(publicDir, "brand"));
  });
  const webps = files.filter(
    (file) =>
      path.extname(file).toLowerCase() === ".webp" &&
      !file.includes(".poster-temp.") &&
      (file.startsWith(marketingDir) || file.startsWith(path.join(publicDir, "brand"))),
  );
  const videos = files.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    if (!VIDEO_EXTENSIONS.has(ext)) return false;
    return path.dirname(file) === heroVideosDir;
  });

  console.log(`Images (${images.length})`);
  for (const imagePath of images) {
    await convertImageToWebp(imagePath);
  }

  console.log(`\nWebP recompression (${webps.length} candidates)`);
  for (const webpPath of webps) {
    await recompressWebp(webpPath);
  }

  console.log(`\nVideos (${videos.length})`);
  for (const videoPath of videos) {
    optimizeVideo(videoPath);
    await createVideoPoster(videoPath);
  }

  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
