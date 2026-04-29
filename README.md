# adeshgairola.com

Personal site for [Adesh Gairola](https://adeshgairola.com) — founder of [raxIT](https://raxitlabs.com).

Built with [Astro](https://astro.build). Editorial Riso Cobalt palette. Fraunces serif + Inter sans + JetBrains Mono.

## Run locally

```sh
pnpm install
pnpm dev      # http://localhost:4321
pnpm build    # production → ./dist/
```

`pnpm dev` and `pnpm build` regenerate `src/build-info.json` (powers the "Last built" footer date).

## Stack

- Astro 6 — static site generator
- `@astrojs/sitemap` + `astro-robots-txt` — search-engine discovery
- `astro-seo` — SEO meta tags
- JSON-LD `@graph` (Person + Organization + ProfilePage) — answer-engine entity graph
- `/llms.txt` — LLM-readable summary (Jeremy Howard's spec)
- RSS aggregation from raxIT Labs (`fast-xml-parser`) — auto-pulled at build time

## License

[MIT](LICENSE).
