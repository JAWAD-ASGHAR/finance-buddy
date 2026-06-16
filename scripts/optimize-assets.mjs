import { execFileSync } from "node:child_process";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");
const videosDir = path.join(publicDir, "videos");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);
const WEBP_QUALITY = 82;
const POSTER_WIDTH = 1920;
const VIDEO_CRF = 28;
const VIDEO_MAX_WIDTH = 1920;

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

async function convertImageToWebp(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!IMAGE_EXTENSIONS.has(ext)) return null;
  if (path.basename(filePath) === "favicon.png") return null;

  const baseName = filePath.slice(0, -ext.length);
  const outputPath = `${baseName}.webp`;
  const inputStat = await fsp.stat(filePath);
  const inputBuffer = await fsp.readFile(filePath);

  await sharp(inputBuffer)
    .rotate()
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toFile(outputPath);

  const outputStat = await fsp.stat(outputPath);
  console.log(
    `  image ${path.relative(publicDir, filePath)} -> ${path.basename(outputPath)} (${formatBytes(inputStat.size)} -> ${formatBytes(outputStat.size)})`,
  );

  return outputPath;
}

function optimizeVideo(inputPath) {
  const ext = path.extname(inputPath);
  const baseName = inputPath.slice(0, -ext.length);
  const tempPath = `${baseName}.optimized.mp4`;
  const inputStat = fs.statSync(inputPath);

  execFileSync(
    ffmpegPath.path,
    [
      "-y",
      "-i",
      inputPath,
      "-an",
      "-vf",
      `scale='min(${VIDEO_MAX_WIDTH},iw)':-2`,
      "-c:v",
      "libx264",
      "-crf",
      String(VIDEO_CRF),
      "-preset",
      "slow",
      "-movflags",
      "+faststart",
      tempPath,
    ],
    { stdio: "inherit" },
  );

  fs.renameSync(tempPath, inputPath);
  const outputStat = fs.statSync(inputPath);
  console.log(
    `  video ${path.relative(publicDir, inputPath)} (${formatBytes(inputStat.size)} -> ${formatBytes(outputStat.size)})`,
  );
}

async function createVideoPoster(videoPath) {
  const ext = path.extname(videoPath);
  const posterPath = `${videoPath.slice(0, -ext.length)}.webp`;
  const videoStat = fs.statSync(videoPath);

  if (fs.existsSync(posterPath)) {
    const posterStat = fs.statSync(posterPath);
    if (posterStat.mtimeMs >= videoStat.mtimeMs) {
      console.log(
        `  skip poster ${path.relative(publicDir, posterPath)} (up to date)`,
      );
      return;
    }
  }

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
    .webp({ quality: WEBP_QUALITY, effort: 6 })
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
  const images = files.filter((file) =>
    IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()),
  );
  const videos = files.filter(
    (file) =>
      path.dirname(file) === videosDir &&
      path.extname(file).toLowerCase() === ".mp4",
  );

  console.log(`Images (${images.length})`);
  for (const imagePath of images) {
    await convertImageToWebp(imagePath);
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
