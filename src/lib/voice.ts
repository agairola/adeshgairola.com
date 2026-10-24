// The site's voice: lowercase prose, with acronyms and names kept as written.
// Used for text pulled in from elsewhere (feed titles, labs pages, credentials),
// so it reads like the copy written for the site.

const KEEP = [
	'raxIT Labs',
	'raxIT',
	'myCocoon',
	'GenAI',
	'AI',
	'AWS',
	'ANZ',
	'APAC',
	'APRA',
	'CPS',
	'CEO',
	'CISO',
	'LLMs',
	'LLM',
	'MCP',
	'GPT',
	'OWASP',
	'CCIE',
	'IPv6',
	'iOS',
	'iPhone',
	'iCloud',
	'NLA',
	'ISM',
	'TAC',
	'VPN',
	'ML',
	'OAuth',
	'B.Tech',
];

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RULES = KEEP.map((k) => [new RegExp(`(?<![\\w.])${escape(k.toLowerCase())}(?!\\w)`, 'g'), k] as const);

export function voice(text: string): string {
	let out = text.toLowerCase();
	for (const [re, keep] of RULES) out = out.replace(re, keep);
	return out;
}
