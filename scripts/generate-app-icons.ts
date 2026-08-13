import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const iconDirectory = join(
  root,
  'ios',
  'JailTime',
  'Images.xcassets',
  'AppIcon.appiconset',
);
const iconMaster = join(root, 'assets', 'icon.png');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#121A31"/>
  <circle cx="512" cy="512" r="392" fill="#F7C948"/>
  <path d="M512 202 790 314v198c0 177-120 314-278 358C354 826 234 689 234 512V314z" fill="#25365F"/>
  <path d="M512 272 720 356v150c0 126-82 231-208 274-126-43-208-148-208-274V356z" fill="#F9FAFC"/>
  <path d="M430 430h164M512 372v245M394 617h236M434 696h156" fill="none" stroke="#25365F" stroke-linecap="round" stroke-width="38"/>
  <circle cx="512" cy="333" r="26" fill="#F7C948"/>
  <path d="m373 481 70 108 70-108zm138 0 70 108 70-108z" fill="#F7C948"/>
</svg>`;

const iconSizes = [
  ['AppIcon-20x20@2x.png', 40], ['AppIcon-20x20@3x.png', 60],
  ['AppIcon-29x29@2x.png', 58], ['AppIcon-29x29@3x.png', 87],
  ['AppIcon-40x40@2x.png', 80], ['AppIcon-40x40@3x.png', 120],
  ['AppIcon-60x60@2x.png', 120], ['AppIcon-60x60@3x.png', 180],
  ['AppIcon-20x20@1x.png', 20], ['AppIcon-29x29@1x.png', 29],
  ['AppIcon-40x40@1x.png', 40], ['AppIcon-76x76@1x.png', 76],
  ['AppIcon-76x76@2x.png', 152], ['AppIcon-83.5x83.5@2x.png', 167],
  ['AppIcon-1024.png', 1024],
] as const;

async function writeIcon(outputPath: string, size: number) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .flatten({ background: '#121A31' })
    .removeAlpha()
    .png({ palette: false })
    .toFile(outputPath);
}

async function main() {
  await mkdir(iconDirectory, { recursive: true });
  await mkdir(dirname(iconMaster), { recursive: true });
  await Promise.all([
    writeIcon(iconMaster, 1024),
    ...iconSizes.map(([fileName, size]) => writeIcon(join(iconDirectory, fileName), size)),
  ]);
}

void main();
