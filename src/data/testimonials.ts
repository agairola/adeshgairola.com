// Curated testimonials. Pull-quotes used on the home page hero area
// and stacked on /background. Both are public LinkedIn recommendations.

export type Testimonial = {
	quote: string;
	name: string;
	role: string;
	url?: string;
};

export const testimonials: Testimonial[] = [
	{
		quote:
			'Adesh is exceptionally curious and deep across infosec. They have been a trusted advisor to me on all aspects of security of AI from the early days of LLM chatbots, to the current agentic-based systems. Know that when you are hearing things from them: it’s the real deal, from a real practitioner.',
		name: 'Darran Boyd',
		role: 'Principal, Office of the CISO at AWS Security',
	},
	{
		quote:
			'Adesh is a true thought leader in the AI security and governance space and my go-to person for the hard questions. He developed one of the first comprehensive security and governance papers I came across that shaped my view on the subject. We need more Adeshs if we want to keep AI under control.',
		name: 'Volker Rath',
		role: 'Field CISO, AWS',
	},
];

// Home-page pull-quote. Shown role-only to let the position carry the signal
// without naming the individual. Sourced from a public LinkedIn recommendation.
export const homeTestimonial = {
	quote: 'The real deal, from a real practitioner.',
	role: 'Principal, Office of the CISO at AWS Security',
};
