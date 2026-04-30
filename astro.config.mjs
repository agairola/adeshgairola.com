// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';

import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://adeshgairola.com',

  integrations: [
      sitemap(),
      robotsTxt({
          policy: [{ userAgent: '*', allow: '/' }],
      }),
	],

  adapter: vercel(),
});