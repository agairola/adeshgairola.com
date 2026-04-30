# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal site for Adesh Gairola, founder of raxIT Labs, ex-AWS Security, Sydney. Five-page progressive-disclosure architecture (`/`, `/work`, `/writing`, `/now`, `/background`). Built on Astro 6 with the Vercel adapter, package-managed with **pnpm**. Node `>=22.12.0` required. Live at `https://adeshgairola.com`. Repo at `github.com/agairola/adeshgairola.com`.

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Dev server at `localhost:4321` |
| `pnpm build` | Production build to `./dist/` (also writes `.vercel/output/static/`) |
| `pnpm preview` | Serve `./dist/` locally |
| `pnpm exec astro check` | Type-check `.astro` files. **Only verification gate. Run before claiming work is done.** |
| `pnpm run icons` | Regenerate favicons + apple-touch-icon + OG image from `src/assets/profile.png` |
| `pnpm run build-info` | Regenerate `src/build-info.json` with current ISO timestamp (auto-runs on dev/build/install via predev/prebuild/postinstall hooks) |

No test runner, no linter. `astro check` is the only verification gate.

## Content rules (HARD: do not drift)

### No em dashes. Anywhere.

Code, copy, comments, data files, `llms.txt`, JSON-LD descriptions, page metadata. All of it. **Em dashes are a hard no.** They read as a strong AI-slop tell and the owner has a strict rule against them.

Use one of these instead:
- **Period** for sentence breaks (most common replacement)
- **Colon** for label : value or "this : that" structures
- **Semicolon** for joining related clauses
- **Comma** for short asides
- **Parenthesis** for definitional clauses

What is still fine:
- **En dash** (`–`) in date ranges only: `2024–2025`, `Apr 2023 – Dec 2025`. Typographically correct for ranges, NOT the same character as an em dash.
- **Hyphen** (`-`) in compound words: `open-source`, `multi-modal`, `red-team`. Same.

If you find yourself reaching for an em dash, you are doing something else. Stop and use a period.

### Separator conventions (also documented at the top of `global.css`)

- `·` (middot) for inline visual separators in nav, locale, footer. ALWAYS wrap with `aria-hidden="true"` so screen readers skip them.
- `:` (colon) for content-list separators inside data files (e.g. `role : org`, `label : value`). Read aloud as part of content.
- `.` (period) for sentence breaks in prose. Never used as a separator glyph in lists, nav, or metadata strings.

### Public-only content

Do NOT surface:
- **Named AWS Professional Services clients** (Commonwealth Bank, NAB, Westpac, BHP, Woodside, NZ DIA, etc.). Earlier engagements were NDA'd. Use generics: "Tier-1 Australian banks, mining majors, NZ government."
- **Internal AWS metrics** (`$4M ARR`, `9.8/10 CSAT`, engagement cadence). These were in the private resume; they're not on LinkedIn or any public AWS document.
- **Design partner names** (e.g., Slipstream Cyber) unless explicitly cleared.
- **Certifications not on the user's public LinkedIn or no longer active.** Site lists: Cisco CCIE Security (Emeritus), AWS Solutions Architect, AWS Security Specialty, AWS AI Practitioner, IPv6 Forum Certified Security Engineer.
- **Inferred relationships between repos** without public source. If GitHub doesn't say it, don't write it.

### Naming

- Always **raxIT Labs** (with space, capital L). Never bare "raxIT" except as a UI feed-source label tag where space is constrained.
- Two-direction positioning: **"Security for AI" is the primary work; "AI for security" is the weird-mix sideline.** Don't re-frame as 50/50 or as "runtime security on Anthropic Claude" (that makes raxIT Labs sound like a plugin).
- Founder & CTO at raxIT Labs. Founder of raxIT Labs is also fine. Avoid "founder | CTO" pipe form on the site.

### LinkedIn featured posts

Hand-curated. There is no API or RSS for personal LinkedIn posts (verified 2026; see `docs/research/linkedin-sync.md`). When a LinkedIn post lands well and the user wants to feature it: edit `src/data/featured-writing.ts` with the post permalink (strip `?utm_*` tracking params) and a take-line drawn from the post itself.

### No client-side framework hydration

No React, Vue, Svelte. The site is intentionally static. The only client-side JS is the inline visibility-paused `setInterval` for the Sydney clock on `/` and `/now`.

### `robots.txt` allows everything

Do NOT block AI crawlers (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `OAI-SearchBot`). Blocking them tanks AEO. See `docs/research/aeo.md` for the full reasoning.

## Architecture

### Five routes, all in `src/pages/`

- `/` → identity hub. Avatar + tagline + identity sentence + Sydney/live-time + hub nav + NOW snapshot + role-only testimonial pull-quote + 3 dynamic recent-writing items + Talk CTA + connect inline.
- `/work` → 3 grouped sections (At AWS, Open source, Earlier). Entries from `src/data/selected-work.ts`.
- `/writing` → curated Featured (LinkedIn permalinks from `src/data/featured-writing.ts`) + auto-pulled Recent (RSS via `src/lib/feeds.ts`).
- `/now` → Sivers-style current-focus page. Sections from `src/data/now.ts`. Has live Sydney clock (inline JS, visibility-paused setInterval).
- `/background` → bio + timeline `<dl>` + credentials. Data from `src/data/background.ts`.

### Shared layout

`src/layouts/Page.astro` wraps every page with `BaseHead` + `Nav` + `<main id="main">` + `SiteFooter`. Home uses the `hideHeader` prop because the avatar lives in the hero, not in the top nav.

### Data, not content collections

All structured content lives in `src/data/*.ts`:
- `selected-work.ts` — Selected Work entries (typed `WorkEntry[]`, with `group: 'aws' | 'oss' | 'pre-aws'`)
- `featured-writing.ts` — curated LinkedIn permalinks with take lines
- `principles.ts` — How I Think principles (currently unused on any page; available)
- `background.ts` — timeline rows, education, certifications, recognition, bioIntro
- `now.ts` — `snapshot` (used on `/` and `/now`) + `sections[]` (only `/now`) + `updated` date
- `testimonials.ts` — full testimonials with names + a role-only `homeTestimonial` for the home pull-quote

There are no `src/content/` collections. To update content: edit the relevant `.ts` file, commit. The dev server hot-reloads automatically.

### Dynamic content

`src/lib/feeds.ts` exports `fetchFeed`, `mergeAndDedupe`, `formatRelativeDate`. RSS is fetched at build time from raxIT Labs (`https://raxitlabs.com/feed.xml`) and Substack (`https://agairola.substack.com/feed`). raxIT first so canonical URLs win on cross-posts. Used by `/` (3 items) and `/writing` (15 items, deduped).

### Site metadata in `src/consts.ts`

`SITE_TITLE`, `SITE_DESCRIPTION`, plus all URL constants (Substack, raxIT, LinkedIn, GitHub, YouTube, calendar, email, AI Security Circle Meetup, AI Engineer Melbourne). Change once, propagates everywhere.

### Site URL is locked

`site` in `astro.config.mjs` is `https://adeshgairola.com`. Do not revert to a placeholder. It drives canonical URLs, sitemap, OG, and JSON-LD.

### Design tokens

In `src/styles/global.css` as CSS custom properties:
- Achromatic scale: `--bg`, `--bg-subtle`, `--fg`, `--fg-muted`, `--fg-subtle`, `--fg-faint`, `--rule`, `--rule-strong`
- Single semantic accent: `--accent` (cobalt `#2b5bc4` light, `#6a92e8` dark). Does ALL semantic work (links, brackets, code-block rules, focus rings, dropcap, eyebrow numbers, divider diamonds, footer stamp). Never decorative.
- Shadow-as-border (Vercel signature, replaces traditional CSS `border`): `--shadow-border`, `--shadow-card`, `--shadow-elevated`
- Layout: `--max-w: 680px`
- Typography: `--font-sans` (Geist Variable) + `--font-mono` (Geist Mono Variable) via `@fontsource-variable/geist`

### Vercel-aligned typography (do not drift)

- Three weights only: 400 (body), 500 (UI), 600 (headings). NO 700 bold.
- Aggressive negative letter-spacing at display sizes: `-0.06em` at 48px scaling to `0` at 14px.
- OpenType `liga`, `calt`, `kern` enabled globally; `tnum` on date columns.
- `text-wrap: balance` on headings, `text-wrap: pretty` on body paragraphs.

### Integrations

`@astrojs/sitemap`, `astro-robots-txt`, `astro-seo`, `@astrojs/vercel` (adapter). RSS is hand-rolled in `src/lib/feeds.ts` (no `@astrojs/rss`). Sharp is used by `scripts/generate-icons.mjs` to build favicons + OG image.

### SEO/AEO

Already wired. Sitemap auto-discovers routes. JSON-LD `@graph` (Person + Organization + ProfilePage with cross-references) in `BaseHead.astro`. `/llms.txt` in `public/`. `robots.txt` allows everything.

## Project intent (do not drift)

- **"Working notebook in public", not a brochure.** Lived-in beats polished. Concrete beats abstract: numbers, dollar figures, dates, named tools.
- **Vercel-aware editorial aesthetic.** Geist + cobalt + shadow-as-border + numbered eyebrows + `◇` chapter dividers + bracket-titled writing entries + issue-stamp footer.
- **Mobile-no-scroll target on home.** Identity + tagline + bio + Sydney/time + nav + start of NOW visible above the fold on a 390×844 viewport.
- Use the **`impeccable:*`** skills for design work. The owner explicitly chose this design system.
- Keep the dependency tree small. Reach for `astro add` only when a feature genuinely needs it.

## Research and context docs

- `.impeccable.md` — design context for impeccable skills (philosophy, tokens, principles, anti-patterns specific to this site). Read this first when designing.
- `docs/research/minimal-personal-sites.md` — survey of 16 minimal personal sites, signature moves, anti-patterns
- `docs/research/aeo.md` — Answer Engine Optimization research (entity disambiguation, schema patterns)
- `docs/research/linkedin-sync.md` — why LinkedIn-personal-post sync isn't possible cleanly in 2026

## When in doubt

1. Read `.impeccable.md` for design philosophy and anti-pattern list.
2. Read the relevant `src/data/*.ts` file before editing markup. Content lives there.
3. Run `pnpm exec astro check` before claiming anything is done.
4. If reaching for an em dash: stop, use a period.
