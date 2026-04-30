export type BackgroundRow = { period: string; role: string; org: string };

export const background: BackgroundRow[] = [
	{ period: 'Dec 2025 – present', role: 'Founder & CTO', org: 'raxIT Labs' },
	{ period: 'Apr 2023 – Dec 2025', role: 'Senior Security Consultant', org: 'AWS' },
	{
		period: 'Sep 2017 – Apr 2023',
		role: 'Security Consultant · Cloud Architect · Cloud Security Engineer',
		org: 'AWS',
	},
	{
		period: 'Jun 2012 – Aug 2017',
		role: 'SME / Security Customer Support Engineer',
		org: 'Cisco',
	},
	{
		period: '2009 – 2012',
		role: 'Early career · network security',
		org: 'HCLTech, Infosys',
	},
];

export const credentials = {
	education:
		'B.Tech, Computer Science, College of Engineering Roorkee (2005–2009)',
	certifications: [
		'Cisco CCIE Security (Emeritus)',
		'AWS Solutions Architect',
		'AWS Security Specialty',
		'AWS AI Practitioner',
		'IPv6 Forum Certified Security Engineer',
	],
	recognition: ['OWASP LLM Top 10 contributor'],
};

export const bioIntro =
	'Founder of raxIT Labs. Built and led AWS\'s ANZ AI Security Consulting practice across 150+ enterprise engagements spanning financial services, government, resources, telecom, and professional services. Co-authored the reference threat model now in AWS Threat Composer; project-led Proactive Controls in AWS Control Tower. Third time building a technical organisation at scale: APAC team at Cisco, the AWS APJ AI Security specialist team, raxIT Labs today. 15+ years across network, cloud, and security. Sydney.';
