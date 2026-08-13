import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const focusCourtAssets = Array.from(
  { length: 64 },
  (_, index) => `focus_court_asset_${String(index + 1).padStart(3, '0')}.png`,
);
const onboardingAssets = Array.from(
  { length: 5 },
  (_, index) => `onboarding_${String(index + 1).padStart(3, '0')}.png`,
);

async function findMissing(directory: string, files: string[]) {
  const results = await Promise.all(
    files.map(async (file) => {
      try {
        await fs.access(path.join(directory, file));
        return undefined;
      } catch {
        return path.join(directory, file);
      }
    }),
  );

  return results.filter((file): file is string => file !== undefined);
}

async function main() {
  const missing = [
    ...(await findMissing(path.join(root, 'assets', 'focus-court'), focusCourtAssets)),
    ...(await findMissing(path.join(root, 'assets', 'onboarding'), onboardingAssets)),
  ];

  if (missing.length > 0) {
    console.error('[assets:verify] Missing Metro static assets:');
    missing.forEach((file) => console.error(`  - ${path.relative(root, file)}`));
    console.error('Commit the required assets/ PNGs before building iOS.');
    process.exitCode = 1;
    return;
  }

  console.log('[assets:verify] All 69 Metro static assets are present.');
}

void main();
