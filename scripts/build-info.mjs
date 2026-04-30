// Writes src/build-info.json with the current build timestamp.
// Run via `pnpm run build-info` (also hooked into prebuild + predev).
// Swap to a git-commit-date later if/when this project becomes a git repo.

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '..', 'src', 'build-info.json');

const now = new Date();
const info = {
	builtAtISO: now.toISOString(),
};

writeFileSync(outPath, JSON.stringify(info, null, 2) + '\n');
console.log(`[build-info] ${info.builtAtISO}`);
