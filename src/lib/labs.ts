import { XMLParser } from 'fast-xml-parser';
import { labsFallback, type LabProject } from '../data/sketchbook';

// raxitlabs.com has no labs feed, so the labs list is read at build time the
// way search engines read it: the sitemap names every project page, and each
// page carries og:title, og:description and article:published_time. A new
// project on raxitlabs.com/labs shows up here on the next build (the daily
// "Refresh feeds" workflow rebuilds the site).

const SITEMAP_URL = 'https://raxitlabs.com/sitemap.xml';
const PROJECT_URL = /^https:\/\/raxitlabs\.com\/labs\/(?!theme\/)[^/?#]+\/?$/;
const TIMEOUT_MS = 8_000;
const MAX_PROJECTS = 6;

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decode(s: string): string {
	return s
		.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
		.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
		.replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

function meta(html: string, key: string): string {
	const tag = html.match(new RegExp(`<meta[^>]+(?:property|name)="${key}"[^>]*>`, 'i'))?.[0];
	const content = tag?.match(/content="([^"]*)"/i)?.[1];
	return content ? decode(content).trim() : '';
}

/** Site rule: no em dashes, even in copy pulled from elsewhere. */
function tidy(s: string): string {
	return s.replace(/\s*—\s*/g, ', ').replace(/\s+/g, ' ').trim();
}

function firstSentence(s: string): string {
	const m = s.match(/^.+?[.!?](?=\s|$)/);
	return (m ? m[0] : s).trim();
}

function monthYear(d: Date): string {
	// en-US gives "sep", not en-AU's "sept", so every month is three letters.
	return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).toLowerCase();
}

async function get(url: string): Promise<string> {
	const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
	if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
	return res.text();
}

async function project(url: string, lastmod?: string): Promise<(LabProject & { date: Date }) | null> {
	try {
		const html = await get(url);
		const ogTitle = tidy(meta(html, 'og:title'));
		const note = tidy(firstSentence(meta(html, 'og:description') || meta(html, 'description')));
		const date = new Date(meta(html, 'article:published_time') || lastmod || '');
		if (!ogTitle || !note || Number.isNaN(date.getTime())) return null;
		// "DirePhish: run the incident until you know the odds" → "DirePhish".
		const title = ogTitle.split(/:\s/)[0];
		return { title, note, url: url.replace(/\/$/, ''), when: monthYear(date), date };
	} catch (err) {
		console.warn(`[labs] ${url}: ${err instanceof Error ? err.message : String(err)}`);
		return null;
	}
}

async function load(): Promise<LabProject[]> {
	try {
		const xml = new XMLParser().parse(await get(SITEMAP_URL));
		const raw = xml?.urlset?.url ?? [];
		const entries: { loc?: string; lastmod?: string }[] = Array.isArray(raw) ? raw : [raw];
		const pages = entries.filter((e) => typeof e.loc === 'string' && PROJECT_URL.test(e.loc));
		const found = (await Promise.all(pages.map((e) => project(e.loc as string, e.lastmod)))).filter(
			(p): p is LabProject & { date: Date } => p !== null,
		);
		if (found.length === 0) throw new Error('no project pages found in the sitemap');
		return found
			.sort((a, b) => b.date.getTime() - a.date.getTime())
			.slice(0, MAX_PROJECTS)
			.map(({ date: _date, ...p }) => p);
	} catch (err) {
		console.warn(`[labs] using the fallback list: ${err instanceof Error ? err.message : String(err)}`);
		return labsFallback;
	}
}

// Every route renders every section, so fetch once per build and share it.
let cached: Promise<LabProject[]> | undefined;

export function labProjects(): Promise<LabProject[]> {
	cached ??= load();
	return cached;
}
