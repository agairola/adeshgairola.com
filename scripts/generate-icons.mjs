// Generate favicons, apple-touch-icon, manifest icons and the on-page avatar from
// src/assets/profile.png, and the sketchbook OG card from the site's own drawing and
// copy. Run via `pnpm run icons` whenever any of those change.

import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
// Node strips the TypeScript types, so the OG card uses the site's own drawing paths.
import { DOODLES } from '../src/scripts/doodles.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src', 'assets', 'profile.png');
const PUB = join(ROOT, 'public');

const tasks = [];

// Favicon monogram: a cobalt circle + white "AG" that echoes the circular avatar.
// A photo loses all detail at 16px; a mark stays crisp. Single source of truth for
// the SVG favicon (vector, scales perfectly) and the PNG fallbacks (older browsers).
// Cobalt is --accent in light mode (#2b5bc4). White-on-cobalt holds contrast on any
// browser chrome, so no theme switching needed.
const ACCENT = '#2b5bc4';
const monogramSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Adesh Gairola">
  <circle cx="32" cy="32" r="32" fill="${ACCENT}" />
  <text x="32" y="43" fill="#ffffff" text-anchor="middle"
    font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
    font-size="32" font-weight="600" letter-spacing="-1.5">AG</text>
</svg>
`;

writeFileSync(join(PUB, 'favicon.svg'), monogramSvg);

const monogramBuf = Buffer.from(monogramSvg);
tasks.push(sharp(monogramBuf).resize(16, 16).png().toFile(join(PUB, 'favicon-16.png')));
tasks.push(sharp(monogramBuf).resize(32, 32).png().toFile(join(PUB, 'favicon-32.png')));

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

// OG image (1200x630) in the sketchbook style: paper with a faint grain, the
// "adesh." wordmark and scribbled dot, the desk drawing with its one accent fill,
// and the hello lines in Shantell Sans. Same two colours as the site.
// Type: scripts/fonts/sketchbook-og-{regular,semibold}.ttf are static instances of
// Shantell Sans (SIL OFL, see ShantellSans-OFL.txt) at wght 400/600 with INFM, BNCE
// and SPAC at 0, renamed "Sketchbook OG" as the OFL asks for modified versions, with
// the layout tables removed (no bouncy alternates). resvg renders the text from these
// files alone, with system fonts off, so the card looks the same on any machine.
const W = 1200;
const H = 630;
const PAPER = '#fcfbf8';
const INK = '#26231f';
const SOFT = '#666460'; // ink at 70% on paper, as --soft on the site
const ACC = '#9dbf9e';

// The desk drawing, with a light displacement filter for the pen wobble.
const desk = DOODLES.desk;
const scale = 2.45;
const deskW = Math.round(desk.w * scale);
const deskH = Math.round(desk.h * scale);
const deskSvg = Buffer.from(`<svg width="${deskW}" height="${deskH}" viewBox="0 0 ${desk.w} ${desk.h}" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<filter id="pen" x="-5%" y="-5%" width="110%" height="110%">
			<feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="7" />
			<feDisplacementMap in="SourceGraphic" scale="1.3" xChannelSelector="R" yChannelSelector="G" />
		</filter>
	</defs>
	<g filter="url(#pen)" stroke-linecap="round" stroke-linejoin="round">
		${desk.a.map((d) => `<path d="${d}" fill="${ACC}" fill-opacity="0.8" transform="translate(0.6 0.4)" />`).join('')}
		${desk.s.map((d) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="1.25" />`).join('')}
	</g>
</svg>`);

// The scribbled dot: a lumpy ink disc hatched in the paper colour.
const R = 17;
const lump = Array.from({ length: 64 }, (_, i) => {
	const a = (i / 64) * Math.PI * 2;
	const r = R * (1 + 0.05 * Math.sin(3 * a + 0.7) + 0.03 * Math.cos(5 * a));
	return `${(R + 2 + Math.cos(a) * r).toFixed(2)} ${(R + 2 + Math.sin(a) * r).toFixed(2)}`;
});
const hatch = Array.from({ length: 14 }, (_, j) => {
	const k = -R * 2 + j * ((R * 4) / 13);
	return `<line x1="${2 + k}" y1="2" x2="${2 + 2 * R + k}" y2="${2 + 2 * R}" />`;
}).join('');
const dotSvg = Buffer.from(`<svg width="${2 * R + 4}" height="${2 * R + 4}" xmlns="http://www.w3.org/2000/svg">
	<defs><clipPath id="c"><path d="M ${lump.join(' L ')} Z" /></clipPath></defs>
	<path d="M ${lump.join(' L ')} Z" fill="${INK}" />
	<g clip-path="url(#c)" stroke="${PAPER}" stroke-opacity="0.35" stroke-width="1.2">${hatch}</g>
</svg>`);

// Words on the right. Line breaks are explicit (resvg does not wrap), with a paragraph
// gap between sentences, and the block centred on the drawing.
const SIZE = 40;
const LEAD = 52;
const GAP = 16;
const textLeft = 620;
const paras = [
	["hi, i'm adesh."],
	['i build security for ai, and', 'i use ai to build security.'],
	['founder and ceo of', 'raxIT Labs, in sydney.'],
];
const rows = paras.flat().length;
const blockH = rows * LEAD + GAP * (paras.length - 1);
let baseline = Math.round((H - blockH) / 2) + 38;
const words = paras
	.map((para) => {
		const out = para.map((ln) => {
			const t = `<text x="${textLeft}" y="${baseline}" font-size="${SIZE}" fill="${INK}">${ln}</text>`;
			baseline += LEAD;
			return t;
		});
		baseline += GAP;
		return out.join('');
	})
	.join('');

const typeSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" font-family="Sketchbook OG">
	<text x="64" y="84" font-size="40" font-weight="600" fill="${INK}">adesh.</text>
	${words}
	<text x="${textLeft}" y="${H - 52}" font-size="24" fill="${SOFT}">adeshgairola.com</text>
</svg>`;
const typePng = new Resvg(typeSvg, {
	font: {
		fontFiles: ['sketchbook-og-regular.ttf', 'sketchbook-og-semibold.ttf'].map((f) => join(__dirname, 'fonts', f)),
		loadSystemFonts: false,
		defaultFontFamily: 'Sketchbook OG',
	},
})
	.render()
	.asPng();

const grain = await sharp({
	create: { width: W, height: H, channels: 3, noise: { type: 'gaussian', mean: 128, sigma: 24 } },
})
	.greyscale()
	.blur(0.5)
	.ensureAlpha(0.3)
	.png()
	.toBuffer();

await sharp({ create: { width: W, height: H, channels: 4, background: PAPER } })
	.composite([
		{ input: grain, blend: 'soft-light' },
		{ input: dotSvg, top: 46, left: W - 64 - (2 * R + 4) },
		{ input: deskSvg, top: Math.round((H - deskH) / 2) + 6, left: 80 },
		{ input: typePng, top: 0, left: 0 },
	])
	.png()
	.toFile(join(PUB, 'og-image.png'));

console.log('[icons] og-image.png generated (1200x630, sketchbook)');
console.log('[icons] done');
