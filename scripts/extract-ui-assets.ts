import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const inputDir = path.join(root, 'public', 'data', 'ui');
const outputDir = path.join(root, 'assets', 'focus-court');
const expectedBatches = 8;
const assetsPerBatch = 8;
const padding = 18;

type Rgba = [number, number, number, number];

const outputName = (index: number) => `focus_court_asset_${String(index).padStart(3, '0')}.png`;

async function ensureOutputDir() {
  await fs.mkdir(outputDir, { recursive: true });
}

async function createPlaceholderAssets(reason: string) {
  await ensureOutputDir();
  const transparentPixel = await sharp({
    create: {
      width: 12,
      height: 12,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .png()
    .toBuffer();

  for (let i = 1; i <= expectedBatches * assetsPerBatch; i += 1) {
    await fs.writeFile(path.join(outputDir, outputName(i)), transparentPixel);
  }

  console.warn(`\n[assets:extract] ${reason}`);
  console.warn('[assets:extract] Wrote 64 transparent placeholders so Metro can bundle the app.');
  console.warn('[assets:extract] Add exactly 8 PNG sheets to public/data/ui, then run npm run assets:extract again.\n');
}

function colorDistance(a: Rgba, b: Rgba) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function saturation([r, g, b]: Rgba) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min;
}

function luminance([r, g, b]: Rgba) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function dominantBorderPalette(data: Buffer, width: number, height: number): Rgba[] {
  const counts = new Map<string, { count: number; color: Rgba }>();
  const sample = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    const color: Rgba = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    const key = `${Math.round(color[0] / 8) * 8},${Math.round(color[1] / 8) * 8},${Math.round(color[2] / 8) * 8}`;
    const current = counts.get(key);
    if (current) current.count += 1;
    else counts.set(key, { count: 1, color });
  };

  for (let x = 0; x < width; x += 1) {
    sample(x, 0);
    sample(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    sample(0, y);
    sample(width - 1, y);
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((entry) => entry.color);
}

function removeConnectedBackground(data: Buffer, width: number, height: number) {
  const palette = dominantBorderPalette(data, width, height);
  const total = width * height;
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const pixel = (index: number): Rgba => {
    const i = index * 4;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  };

  const isBackgroundLike = (index: number) => {
    const color = pixel(index);
    if (color[3] < 8) return true;
    const minDistance = Math.min(...palette.map((bg) => colorDistance(color, bg)));
    return minDistance < 42 || (luminance(color) > 222 && saturation(color) < 22 && minDistance < 78);
  };

  const push = (index: number) => {
    if (index < 0 || index >= total || visited[index] || !isBackgroundLike(index)) return;
    visited[index] = 1;
    queue[tail] = index;
    tail += 1;
  };

  for (let x = 0; x < width; x += 1) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    push(y * width);
    push(y * width + width - 1);
  }

  while (head < tail) {
    const index = queue[head];
    head += 1;
    const x = index % width;
    const y = Math.floor(index / width);
    if (x > 0) push(index - 1);
    if (x < width - 1) push(index + 1);
    if (y > 0) push(index - width);
    if (y < height - 1) push(index + width);
  }

  for (let index = 0; index < total; index += 1) {
    if (visited[index]) data[index * 4 + 3] = 0;
  }

  const neighborMarked = (index: number) => {
    const x = index % width;
    const y = Math.floor(index / width);
    return (
      (x > 0 && visited[index - 1]) ||
      (x < width - 1 && visited[index + 1]) ||
      (y > 0 && visited[index - width]) ||
      (y < height - 1 && visited[index + width])
    );
  };

  for (let pass = 0; pass < 2; pass += 1) {
    const fringe = new Uint8Array(total);
    for (let index = 0; index < total; index += 1) {
      if (visited[index] || !neighborMarked(index)) continue;
      const color = pixel(index);
      const minDistance = Math.min(...palette.map((bg) => colorDistance(color, bg)));
      if (minDistance < 50 && luminance(color) > 205 && saturation(color) < 38) {
        fringe[index] = 1;
      }
    }
    for (let index = 0; index < total; index += 1) {
      if (!fringe[index]) continue;
      visited[index] = 1;
      data[index * 4 + 3] = 0;
    }
  }
}

async function cropAndClean(inputPath: string, extract: sharp.Region) {
  const { data, info } = await sharp(inputPath)
    .extract(extract)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  removeConnectedBackground(data, info.width, info.height);

  const cleaned = await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 8 })
    .extend({
      top: padding,
      right: padding,
      bottom: padding,
      left: padding,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return cleaned;
}

async function main() {
  await ensureOutputDir();

  let files: string[];
  try {
    files = (await fs.readdir(inputDir))
      .filter((file) => file.toLowerCase().endsWith('.png'))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    await createPlaceholderAssets('public/data/ui was not found.');
    return;
  }

  if (files.length !== expectedBatches) {
    await createPlaceholderAssets(`Expected exactly 8 PNG sheets in public/data/ui, found ${files.length}.`);
    return;
  }

  const rows: string[] = [];
  let outputIndex = 1;

  for (let batchIndex = 0; batchIndex < files.length; batchIndex += 1) {
    const file = files[batchIndex];
    const inputPath = path.join(inputDir, file);
    const metadata = await sharp(inputPath).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error(`Could not read image dimensions for ${file}`);
    }

    const columns = metadata.width / metadata.height >= 3.2 ? 8 : 4;
    const rowCount = columns === 8 ? 1 : 2;

    for (let row = 0; row < rowCount; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const left = Math.round((column * metadata.width) / columns);
        const top = Math.round((row * metadata.height) / rowCount);
        const right = Math.round(((column + 1) * metadata.width) / columns);
        const bottom = Math.round(((row + 1) * metadata.height) / rowCount);
        const extract = {
          left,
          top,
          width: right - left,
          height: bottom - top,
        };
        const output = outputName(outputIndex);
        const cleaned = await cropAndClean(inputPath, extract);
        await fs.writeFile(path.join(outputDir, output), cleaned);
        rows.push(`${String(outputIndex).padStart(3, '0')}  ${file}  cell ${row * columns + column + 1}  ->  ${output}`);
        outputIndex += 1;
      }
    }
  }

  console.log(`\nExtracted ${outputIndex - 1} assets into assets/focus-court\n`);
  console.log(rows.join('\n'));
}

main().catch((error) => {
  console.error('\n[assets:extract] Failed to extract UI assets.');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
