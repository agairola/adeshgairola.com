// Curated featured posts: hand-picked LinkedIn permalinks with a take line
// that captures the strongest argument from each post.
// LinkedIn has no API/RSS for personal posts (verified 2026), so this list
// is manually maintained. Add posts here when something lands particularly well.

export type FeaturedPost = {
	title: string;
	take: string;
	url: string;
	date?: string;
};

export const featuredWriting: FeaturedPost[] = [
	{
		title: 'TRUST ME BRO is not a security control',
		take: 'Find the trust boundary, put a control in the middle. That rule just broke. The gateway IS the model now.',
		url: 'https://www.linkedin.com/posts/adeshgairola_aisecurity-threatmodeling-anthropic-share-7452547854868459520-volP',
		date: 'Apr 2026',
	},
	{
		title: 'Model access via KYC. Wonder what can go wrong',
		take: 'KYC didn’t fail because the checks were bad. It failed because everyone assumed the check WAS the security. Now we’re doing it with AI models.',
		url: 'https://www.linkedin.com/posts/adeshgairola_aisecurity-cybersecurity-aigovernance-share-7450320096658464769-NwO7',
		date: 'Apr 2026',
	},
	{
		title: 'Mythos. Spud. Glasswing. Now what?',
		take: 'Cloned your team into AI agents. Ran the breach 100 times under regulatory time-bounds. A distribution of how your org actually behaves. Not what the binder says.',
		url: 'https://www.linkedin.com/posts/adeshgairola_direphish-ai-clones-of-your-team-under-ugcPost-7449639942915506176-Cqe0',
		date: 'Apr 2026',
	},
	{
		title: 'A personal one',
		take: 'Why do we keep trying to buy our way out of problems we can only architect our way out of?',
		url: 'https://www.linkedin.com/posts/adeshgairola_a-personal-one-i-believe-the-people-building-share-7449279627036098560-HykB',
		date: 'Apr 2026',
	},
];
