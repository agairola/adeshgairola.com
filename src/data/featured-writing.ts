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
		title: 'TRUST ME BRO is not a security control',
		take: 'The trust boundary moved inside the model. Three zones, five layers of controls Anthropic ships before your prompt hits the API. You inherit the whole stack.',
		url: 'https://raxitlabs.com/blogs/claude-47-five-layers-cyber-blocking',
		date: 'Apr 2026',
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
