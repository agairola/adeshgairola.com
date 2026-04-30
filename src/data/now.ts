// Edit this file to update what's on the /now page (and the home page snapshot).
// Sivers convention: https://nownownow.com. Keep it current, monthly-ish.

export type NowEntry = { label: string; body: string };

export const now = {
	updated: 'April 2026',
	// Snapshot used on the home page and as the opening paragraph on /now.
	// Definitions inline so a first-time visitor doesn't need to click through to understand the context.
	snapshot:
		'Building raxIT Labs. Mostly security for AI: protecting what teams are shipping in production. The weird-mix sideline is AI for security: using AI to automate threat modeling, detection, and the work security teams used to do by hand. Speaking at AI Engineer Melbourne in June (talk: Kill the God Agent). Open-source releases out of the labs: DirePhish, model-scanner, GrayZoneBench, mcp-oauth-sample.',
	// Detailed sections used on the /now page.
	sections: [
		{
			label: 'Building',
			body: 'raxIT Labs. We work two directions, with one as primary. Security for AI (the primary work): governance, threat modeling, runtime guardrails, model-file safety, agent boundaries. Protecting what teams are shipping. AI for security (the side bet): using AI to automate threat modeling, red-team simulation, detection authoring, and compliance workflows that security teams used to do by hand. Founder and CTO. Building the technical evaluation arc that converts strategic pilots into paid engagements.',
		},
		{
			label: 'Shipping in the open',
			body: 'Open-source releases out of raxIT Labs. DirePhish: an AI-agent red-team simulator that clones your team and runs the breach 100 times under regulatory time-bounds. model-scanner: scans ML model files and scores risk against OWASP LLM Top 10 + Australian ISM-2072. GrayZoneBench: AI safety benchmark for frontier-model gray-zone refusals. mcp-oauth-sample: OAuth 2.1 + MCP reference implementation.',
		},
		{
			label: 'Speaking',
			body: 'AI Engineer Melbourne 2026, June 3–4. Talk: Kill the God Agent. Autonomous-agent threat modeling. Quick Sydney roadshow alongside.',
		},
		{
			label: 'Convening',
			body: 'AI Security Circle Sydney on Meetup. Practitioners only. Monthly.',
		},
		{
			label: 'Reading',
			body: 'Anthropic’s Opus 4.7 system card (again). Three-zone trust boundary, differential capability reduction, and what it means when the model is the gateway.',
		},
		{
			label: 'Thinking about',
			body: 'Trust boundaries when the boundary is the model. Supply chain for model weights. Why most AI security advice still maps to one of two failure modes from the binder.',
		},
		{
			label: 'Where',
			body: 'Sydney, Australia.',
		},
	] satisfies NowEntry[],
};
