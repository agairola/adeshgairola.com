// Curated highlights: hand-picked links to canonical sources (blog posts, product
// pages, repos) with a take line in Adesh's voice. Mixed content types.
// Update when something lands particularly well or you want to direct visitors
// to a specific artifact.

export type FeaturedPost = {
	title: string;
	take: string;
	url: string;
	date?: string;
};

export const featuredWriting: FeaturedPost[] = [
	{
		title: `Agent identity isn't solved`,
		take: `Every enterprise conversation lands on the same line: agent identity isn't solved. True, but not nothing to hold onto. Four stacked layers: tamper-proof token, proof of which workload is running, a delegation chain that keeps the human as the subject, onboarding to a service it's never met. Climb all four and you've proven who the agent is. Not that what it did was okay.`,
		url: 'https://raxitlabs.com/blogs/agent-identity-four-layers',
		date: 'May 2026',
	},
	{
		title: 'DirePhish',
		take: 'AI clones of your team running 100 simulated breaches under regulatory time-bounds. A distribution of how you actually behave when the binder goes out the window.',
		url: 'https://raxitlabs.com/labs/direphish',
		date: 'Apr 2026',
	},
	{
		title: 'securing-ralph-loop',
		take: 'Security checks bolted into the Ralph coding-agent loop. Scan before commit, fix iteratively, escalate when stuck. The AI-for-security thesis, as code.',
		url: 'https://github.com/agairola/securing-ralph-loop',
		date: 'Feb 2026',
	},
];
