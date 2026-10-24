// Copy for the one-screen sections. Each section shows a drawing, a few lines in
// the bottom 30% of the screen, and a "more" panel with the detail.
// Lowercase on purpose (the sketchbook voice). Brand names keep their casing.

export type SectionId = 'hello' | 'raxit' | 'work' | 'writing' | 'now' | 'about';

export type Drawing = 'desk' | 'hex' | 'layers' | 'book' | 'clock' | 'ribbon';

export type Section = {
	id: SectionId;
	path: string;
	/** Label in the bottom bar. Hello has none: the wordmark goes home. */
	label?: string;
	/** Page title (the site name is appended by BaseHead). */
	title: string;
	description: string;
	drawing: Drawing;
	lines: string[];
};

export const sections: Section[] = [
	{
		id: 'hello',
		path: '/',
		title: 'Adesh Gairola',
		description:
			'Adesh Gairola builds security for AI, and uses AI to build security. Founder and CEO of raxIT Labs, Sydney.',
		drawing: 'desk',
		lines: [
			"hi, i'm adesh.",
			'i build security for ai, and i use ai to build security.',
			'founder and ceo of raxIT Labs, in sydney.',
		],
	},
	{
		id: 'raxit',
		path: '/raxit',
		label: 'raxIT',
		title: 'raxIT Labs',
		description:
			'raxIT Labs builds security for AI. raxIT AI finds the ways an agent can be tricked; raxIT Studio uses AI for security work.',
		drawing: 'hex',
		lines: [
			'raxIT Labs builds security for ai.',
			'raxIT AI finds the ways an agent can be tricked.',
			'on the side, raxIT Studio uses ai for security work.',
		],
	},
	{
		id: 'work',
		path: '/work',
		label: 'work',
		title: 'Work',
		description:
			'Eight years at AWS, the last two building its ANZ AI security practice. Before that, Cisco and HCLTech. Open-source tools from raxIT Labs.',
		drawing: 'layers',
		lines: [
			'eight years at aws. the last two building its anz ai security practice.',
			'before that, cisco and hcltech.',
		],
	},
	{
		id: 'writing',
		path: '/writing',
		label: 'writing',
		title: 'Writing',
		description:
			'Writing on agent identity, models in production and AI policy, pulled from raxIT Labs and Substack.',
		drawing: 'book',
		lines: ['i write about agent identity, models in production and ai policy.'],
	},
	{
		id: 'now',
		path: '/now',
		label: 'now',
		title: 'Now',
		description: 'What Adesh Gairola is working on this season.',
		drawing: 'clock',
		lines: [
			'building raxIT AI and raxIT Studio.',
			'testing decision models against bedrock guardrails.',
			'running ai security circle in sydney, once a month.',
		],
	},
	{
		id: 'about',
		path: '/background',
		label: 'about',
		title: 'About',
		description:
			'15 years in security: networks first, then cloud, now AI. Career, credentials and how to get in touch.',
		drawing: 'ribbon',
		lines: ['15 years in security. networks first, then cloud, now ai.'],
	},
];

export const raxitMore = [
	'raxIT AI checks agents before they ship and watches them after.',
	'raxIT Studio runs agents that do the security work nobody has headcount for.',
	'the labs release open-source tools as we go.',
];

export type WorkItem = { text: string; year: string };

export const workMore: WorkItem[] = [
	{ text: 'co-wrote the reference threat model for ai and agentic apps, now in aws threat composer', year: '2024' },
	{ text: 'built the anz ai security consulting practice at aws, from zero', year: '2023' },
	{ text: 'led the rollout of proactive controls in aws control tower', year: '2023' },
	{ text: 'content moderation that cleared the first bank genai platforms', year: '2023' },
	{ text: "led cisco's apac vpn security team", year: '2012' },
	{ text: 'network security at hcltech and infosys', year: '2009' },
];

export type Repo = { name: string; url: string };

export const openSource: Repo[] = [
	{ name: 'direphish', url: 'https://github.com/raxITlabs/DirePhish' },
	{ name: 'model-scanner', url: 'https://github.com/raxITlabs/skills' },
	{ name: 'grayzonebench', url: 'https://github.com/raxITlabs/GrayZoneBench' },
	{ name: 'mcp-oauth-sample', url: 'https://github.com/raxITlabs/mcp-oauth-sample' },
	{ name: 'securing-ralph-loop', url: 'https://github.com/agairola/securing-ralph-loop' },
];

/** The career line on the about drawing: [year, short label]. */
export const careerLine: [string, string][] = [
	['2009', 'hcltech'],
	['2012', 'cisco'],
	['2017', 'aws'],
	['2023', 'aws ai'],
	['2025', 'raxIT'],
];
