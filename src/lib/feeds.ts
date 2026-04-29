import { XMLParser } from 'fast-xml-parser';

export type FeedItem = {
	title: string;
	url: string;
	pubDate: Date;
	source: string;
	sourceUrl: string;
};

const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });

const FETCH_TIMEOUT_MS = 8_000;

function asString(v: unknown): string {
	if (typeof v === 'string') return v;
	if (v && typeof v === 'object' && '#text' in (v as Record<string, unknown>)) {
		const t = (v as Record<string, unknown>)['#text'];
		return typeof t === 'string' ? t : '';
	}
	return '';
}

function normalizeTitle(t: string): string {
	return t
		.toLowerCase()
		.replace(/[\[\]()]/g, ' ')
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();
}

export async function fetchFeed(
	url: string,
	source: string,
	sourceUrl: string,
): Promise<FeedItem[]> {
	try {
		const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
		if (!res.ok) {
			console.warn(`[feeds] ${source}: HTTP ${res.status}`);
			return [];
		}
		const xml = await res.text();
		const data = parser.parse(xml);
		const rawItems = data?.rss?.channel?.item ?? [];
		const arr = Array.isArray(rawItems) ? rawItems : [rawItems];
		return arr
			.map((it: Record<string, unknown>) => {
				const title = asString(it.title).trim();
				const link = asString(it.link).trim();
				const pubDate = new Date(asString(it.pubDate));
				return { title, url: link, pubDate, source, sourceUrl };
			})
			.filter((i) => i.title && i.url && !Number.isNaN(i.pubDate.getTime()));
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		console.warn(`[feeds] ${source} failed: ${msg}`);
		return [];
	}
}

/**
 * Merge feeds and dedupe by normalized title. First-seen wins, so callers should
 * pass canonical sources (e.g. raxIT) before cross-posts (e.g. Substack).
 */
export function mergeAndDedupe(...feedLists: FeedItem[][]): FeedItem[] {
	const seen = new Map<string, FeedItem>();
	for (const list of feedLists) {
		for (const item of list) {
			const key = normalizeTitle(item.title);
			if (!seen.has(key)) seen.set(key, item);
		}
	}
	return Array.from(seen.values()).sort(
		(a, b) => b.pubDate.getTime() - a.pubDate.getTime(),
	);
}

export function formatRelativeDate(d: Date, now: Date = new Date()): string {
	const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
	if (diffDays < 1) return 'today';
	if (diffDays < 2) return 'yesterday';
	if (diffDays < 7) return `${diffDays}d ago`;
	if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
	if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
	return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
