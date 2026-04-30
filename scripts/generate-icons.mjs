// Generate favicons, apple-touch-icon, manifest icons, on-page avatar, and OG card
// from src/assets/profile.png. Run via `pnpm run icons` whenever the source changes.

import sharp from 'sharp';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src', 'assets', 'profile.png');
const PUB = join(ROOT, 'public');

const tasks = [];

// Favicons (modern: PNG-based, no .ico)
tasks.push(sharp(SRC).resize(16, 16).png().toFile(join(PUB, 'favicon-16.png')));
tasks.push(sharp(SRC).resize(32, 32).png().toFile(join(PUB, 'favicon-32.png')));

// Apple touch icon
tasks.push(sharp(SRC).resize(180, 180).png().toFile(join(PUB, 'apple-touch-icon.png')));

// PWA manifest icons
tasks.push(sharp(SRC).resize(192, 192).png().toFile(join(PUB, 'icon-192.png')));
tasks.push(sharp(SRC).resize(512, 512).png().toFile(join(PUB, 'icon-512.png')));

// On-page avatar (retina-ready 256, source for srcset)
tasks.push(sharp(SRC).resize(256, 256).png().toFile(join(PUB, 'avatar.png')));
tasks.push(sharp(SRC).resize(128, 128).png().toFile(join(PUB, 'avatar-128.png')));

await Promise.all(tasks);
console.log('[icons] favicons + apple-touch-icon + avatar generated');

// OG image (1200x630): composite photo + name text
// Vercel-aligned: white bg, photo on left, name + tagline on right.
const photoSize = 360;
const photoBuf = await sharp(SRC).resize(photoSize, photoSize).png().toBuffer();
const photoLeft = 130;
const photoTop = (630 - photoSize) / 2;

const textSvg = Buffer.from(
	`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
		<style>
			.name { font: 600 88px ui-sans-serif, system-ui, -apple-system, sans-serif;
			        fill: #171717; letter-spacing: -4px; }
			.tagline { font: 400 38px ui-sans-serif, system-ui, -apple-system, sans-serif;
			           fill: #4d4d4d; letter-spacing: -1px; }
			.meta { font: 500 22px ui-monospace, SFMono-Regular, Menlo, monospace;
			        fill: #666666; letter-spacing: 0.5px; text-transform: uppercase; }
		</style>
		<text x="560" y="290" class="name">Adesh Gairola</text>
		<text x="560" y="350" class="tagline">Builder. At enterprise scale.</text>
		<text x="560" y="410" class="meta">FOUNDER, RAXIT · SYDNEY</text>
	</svg>`,
);

await sharp({
	create: {
		width: 1200,
		height: 630,
		channels: 4,
		background: { r: 255, g: 255, b: 255, alpha: 1 },
	},
})
	.composite([
		{ input: photoBuf, top: photoTop, left: photoLeft },
		{ input: textSvg, top: 0, left: 0 },
	])
	.png()
	.toFile(join(PUB, 'og-image.png'));

console.log('[icons] og-image.png generated (1200x630)');
console.log('[icons] done');
