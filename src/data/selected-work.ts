export type WorkEntry = {
	title: string;
	body: string;
	install?: string;
	repo?: string;
	date?: string;
	group: 'aws' | 'oss' | 'pre-aws';
};

export const selectedWork: WorkEntry[] = [
	{
		title: 'AWS ANZ AI Security Consulting Practice',
		body: `Built and led the regional AI Security consulting practice inside AWS Professional Services. 150+ enterprise pre-sales engagements across financial services, government, resources, telecom, and professional services (Tier-1 Australian banks, mining majors, and the NZ government). Co-built the APJ AI Security specialist team (11 specialists across AU, NZ, Singapore, India, Korea, Japan) and defined the regional AI/ML security review methodology and GTM packaging that ANZ sales used to land enterprise engagements.`,
		date: 'Apr 2023 – Dec 2025',
		group: 'aws',
	},
	{
		title: 'AWS Threat Composer · AI threat-modeling framework',
		body: `Co-authored the AI / agentic-application reference threat model (STRIDE + MAESTRO methodology). The go-to artifact for AWS and Amazon security teams. Productised as part of AWS Threat Composer, AWS Labs' open-source threat-modeling ecosystem.`,
		date: '2024 – 2025',
		group: 'aws',
	},
	{
		title: 'AWS Control Tower · Proactive Controls',
		body: `Project-led the engineering rollout of native Proactive Controls in AWS Control Tower (policy-as-code preventive guardrails via CloudFormation Hooks). GA across regions since 2024; blocks non-compliant resources at deployment time across the AWS customer fleet.`,
		date: 'Apr 2023 – Dec 2025',
		group: 'aws',
	},
	{
		title: 'Multi-modal content moderation for ANZ enterprise GenAI platforms',
		body: `Built and shipped the AWS multi-modal content-moderation offering adopted by Tier-1 Australian banks and other regulated customers as the guardrail layer that cleared their first internal GenAI deployments under APRA CPS 234. Modular toxicity guardrails with first-class exception handling, fine-tuned across media, telecom, and FSI deployments.`,
		date: 'Apr 2023 – Dec 2025',
		group: 'aws',
	},
	{
		title: 'model-scanner · open source',
		body: `Apache 2.0 Claude Code skill. Runs four independent scanners on ML model files, scores risk 0–100, maps findings to OWASP LLM Top 10 and Australian ISM-2072 (the first government framework to mandate non-executable model formats).`,
		install: 'npx skills add raxITlabs/skills@model-scanner',
		repo: 'https://github.com/raxITlabs/skills',
		date: 'Released 2025',
		group: 'oss',
	},
	{
		title: 'GrayZoneBench · open source',
		body: `Apache 2.0 AI safety benchmark. Tests how frontier models handle tricky gray-zone requests, the kind that sit between "obviously safe" and "obviously refuse." CLI for running benchmarks, web dashboard for exploring results.`,
		repo: 'https://github.com/raxITlabs/GrayZoneBench',
		date: 'Released 2025',
		group: 'oss',
	},
	{
		title: 'mcp-oauth-sample · open source',
		body: `OAuth 2.1 authorization plus an MCP server on Vercel with real-time analytics and threat detection. Reference implementation for securing the Model Context Protocol ecosystem.`,
		repo: 'https://github.com/raxITlabs/mcp-oauth-sample',
		date: 'Released 2025',
		group: 'oss',
	},
	{
		title: 'DirePhish · open source',
		body: `AGPL AI-agent red-team simulator and incident-response tabletop engine. Multi-agent swarm intelligence: clones your team into agents, drops a threat actor into Slack and email, and runs the breach 100 times under regulatory time-bounds (GDPR 72h, insurance 48h). You get a distribution of how your org actually behaves under pressure. Not what the binder says.`,
		repo: 'https://github.com/raxITlabs/DirePhish',
		date: 'Released April 2026',
		group: 'oss',
	},
	{
		title: 'crucible · open source',
		body: `Configurable enterprise simulation engine. Multi-agent simulation primitive in Python.`,
		repo: 'https://github.com/raxITlabs/crucible',
		date: 'Released 2026',
		group: 'oss',
	},
	{
		title: 'securing-ralph-loop · open source',
		body: `Security checks for the Ralph coding-agent loop. Scan before commit, fix iteratively, escalate when stuck. A practical example of the AI-for-security direction: using AI to do the security work that used to be manual.`,
		repo: 'https://github.com/agairola/securing-ralph-loop',
		date: 'Released 2026',
		group: 'oss',
	},
	{
		title: 'Cisco APAC VPN Security Team',
		body: `Led the APAC VPN Security team (30 engineers) supporting Tier-1 telecom and enterprise customers. Built Python and Shell automation that cut MTTR on customer escalations and was adopted across the global TAC.`,
		date: 'Jun 2012 – Aug 2017',
		group: 'pre-aws',
	},
];
