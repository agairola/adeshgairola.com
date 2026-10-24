// Copy for the one-screen sections. Each section shows a drawing, a few lines in
// the bottom 30% of the screen, and a "more" panel with the detail.
// Lowercase on purpose (the sketchbook voice). Acronyms (AI, AWS, CEO, APRA) and
// brand and product names keep their casing.

import { homeTestimonial } from './testimonials';

export type SectionId = 'hello' | 'raxit' | 'labs' | 'work' | 'writing' | 'now' | 'side' | 'about';

export type Drawing = 'desk' | 'hex' | 'flask' | 'layers' | 'book' | 'clock' | 'phone' | 'ribbon';

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
	/** A pull-quote shown on the main screen under the lines. */
	quote?: { text: string; role: string };
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
			'i build security for AI, and i use AI to build security.',
			"i built AWS's ANZ AI security practice and co-wrote its threat model for AI apps.",
			'founder and CEO of raxIT Labs, in sydney.',
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
			'raxIT Labs builds security for AI.',
			'raxIT AI finds the ways an agent can be tricked.',
			'on the side, raxIT Studio uses AI for security work.',
		],
	},
	{
		id: 'labs',
		path: '/labs',
		label: 'labs',
		title: 'Labs',
		description:
			'Open research from raxIT Labs: a decision-model guardrail benchmark, AI security threat intelligence, NLA Audit, DirePhish and GrayZoneBench.',
		drawing: 'flask',
		lines: [
			'we do our research in the open.',
			'benchmarks, attack simulations and the threat intel our products run on.',
		],
	},
	{
		id: 'work',
		path: '/work',
		label: 'work',
		title: 'Work',
		description:
			'Eight years at AWS, the last two building its ANZ AI security practice. Before that, Cisco and HCLTech.',
		drawing: 'layers',
		lines: [
			'eight years at AWS. the last two building its ANZ AI security practice.',
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
		lines: ['i write about agent identity, models in production and AI policy.'],
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
		],
	},
	{
		id: 'side',
		path: '/side',
		label: 'cocoon',
		title: 'Side projects',
		description:
			'myCocoon, a privacy-first AI pregnancy companion for iPhone: health data is worked out on the phone and cloud AI is off by default. Built by Adesh Gairola on the side, with a core user base.',
		drawing: 'phone',
		lines: [
			'on the side, i build myCocoon, a private pregnancy companion.',
			'health data stays on the phone. cloud AI is off by default.',
			"it has a core user base, and it's how i learn outside security.",
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
		lines: ['15 years in security. networks first, then cloud, now AI.'],
		quote: { text: homeTestimonial.quote, role: homeTestimonial.role },
	},
];

export const raxitMore = [
	'raxIT AI checks agents before they ship and watches them after.',
	'raxIT Studio runs agents that do the security work nobody has headcount for.',
	'the labs release open-source tools as we go.',
];

/** myCocoon detail, from https://trymycocoon.com. Keep to what the site says. */
export const sideMore = [
	'it reads what your iPhone already records, like sleep, resting heart rate, kicks and mood.',
	'with cloud AI off, journal entries and photos stay on the phone or in your own iCloud. turned on, journal text and photos still never reach it.',
	'live on the App Store, built for iOS 26.',
];

export type WorkItem = { text: string; year: string };

export const workMore: WorkItem[] = [
	{ text: 'co-wrote the reference threat model for AI and agentic apps, now in AWS Threat Composer', year: '2024' },
	{ text: 'built the ANZ AI security consulting practice at AWS, from zero', year: '2023' },
	{ text: 'led the rollout of proactive controls in AWS Control Tower', year: '2023' },
	{ text: 'the guardrail layer that cleared the first bank GenAI deployments under APRA CPS 234', year: '2023' },
	{ text: "led cisco's APAC VPN security team", year: '2012' },
	{ text: 'network security at hcltech and infosys', year: '2009' },
];

export type LabProject = { title: string; when: string; note: string; url: string };

/**
 * The labs list is pulled from raxitlabs.com at build time (src/lib/labs.ts).
 * This copy is only used if that fails, so the section is never empty.
 */
export const labsFallback: LabProject[] = [
	{
		title: 'can a decision model be your guardrail?',
		when: 'oct 2026',
		note: '97 real prompt-injection emails through 18 decision models and bedrock. 19 systems, 9,975 checks.',
		url: 'https://raxitlabs.com/labs/decision-models-as-guardrails',
	},
	{
		title: 'AI security threat intelligence',
		when: 'sep 2026',
		note: 'eight public feeds, hundreds of evidence-backed threat patterns and a 58-rule open-source scanner.',
		url: 'https://raxitlabs.com/labs/threat-intel-pipeline',
	},
	{
		title: 'NLA audit',
		when: 'may 2026',
		note: 'reads what an open-weight model is computing at each token, so you can stop when output and thought disagree.',
		url: 'https://raxitlabs.com/labs/nla-audit',
	},
	{
		title: 'direphish',
		when: 'apr 2026',
		note: 'clones your organisation as agents, drops in a threat actor and runs the attack dozens of times.',
		url: 'https://raxitlabs.com/labs/direphish',
	},
	{
		title: 'grayzonebench',
		when: 'aug 2025',
		note: 'a safety benchmark for prompts where the right answer is neither refuse nor comply.',
		url: 'https://raxitlabs.com/labs/grayzonebench',
	},
];

export type Repo = { name: string; url: string };

/** Smaller open-source tools that are not on the labs page. */
export const openSource: Repo[] = [
	{ name: 'model-scanner', url: 'https://github.com/raxITlabs/skills' },
	{ name: 'mcp-oauth-sample', url: 'https://github.com/raxITlabs/mcp-oauth-sample' },
	{ name: 'securing-ralph-loop', url: 'https://github.com/agairola/securing-ralph-loop' },
];

/** The career line on the about drawing: [year, short label]. */
export const careerLine: [string, string][] = [
	['2009', 'hcltech'],
	['2012', 'cisco'],
	['2017', 'AWS'],
	['2023', 'AWS AI'],
	['2025', 'raxIT'],
];
