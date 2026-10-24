# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal site for Adesh Gairola, founder of raxIT Labs, ex-AWS Security, Sydney. A one-screen "sketchbook" after the grug and Arin apps: six sections (`/`, `/raxit`, `/work`, `/writing`, `/now`, `/background`), each a line drawing with a few words in the bottom 30% and a "… more" panel. Built on Astro 6 with the Vercel adapter, package-managed with **pnpm**. Node `>=22.12.0` required. Live at `https://adeshgairola.com`. Repo at `github.com/agairola/adeshgairola.com`.

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
- Founder and CEO at raxIT Labs (confirmed Oct 2026). Founder of raxIT Labs is also fine. Avoid the "founder | CEO" pipe form on the site.
- Product names keep their casing inside the lowercase voice: raxIT AI (security for AI), raxIT Studio (AI for security).

### LinkedIn featured posts

Hand-curated. There is no API or RSS for personal LinkedIn posts (verified 2026; see `docs/research/linkedin-sync.md`). When a LinkedIn post lands well and the user wants to feature it: edit `src/data/featured-writing.ts` with the post permalink (strip `?utm_*` tracking params) and a take-line drawn from the post itself.

### No client-side framework hydration

No React, Vue, Svelte. Pages are static HTML. Client-side JS is one bundled module, `src/scripts/sketchbook.ts`, plus a one-line inline script in `BaseHead` that swaps `no-js` for `js` on `<html>` before paint. Without JS every route still renders its section with the detail open.

### `robots.txt` allows everything

Do NOT block AI crawlers (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `OAI-SearchBot`). Blocking them tanks AEO. See `docs/research/aeo.md` for the full reasoning.

## Architecture

### Six routes, one component

Every page in `src/pages/` is a one-liner: `<Page section="..." />`. `src/layouts/Page.astro` renders `BaseHead` and `src/components/Sketchbook.astro`, which outputs all six sections with only the active one visible.

- `/` hello (desk drawing), `/raxit` raxIT Labs (hexagon with keyhole), `/work` (stack of layers), `/writing` (open book), `/now` (clock), `/background` labelled "about" (career line).
- Layout: header (wordmark, shuffle dot), a drawing in the middle, words in the bottom 30% with the section bar at the very bottom. "… more" grows the bottom panel to 64% and shows the detail.
- `src/scripts/sketchbook.ts` intercepts section links, swaps sections in place, `pushState`s the real URL and handles back/forward. It also runs:
  - the WebGL paper (grain that boils on three frames every 140 ms),
  - the drawings (`src/scripts/doodles.ts`, SVG path strings sampled to points and drawn on a 2D canvas with a slight pen wobble; they draw themselves on when a section opens),
  - the typed-on glance lines (a transparent copy holds the space so nothing shifts),
  - the shuffle dot (swaps paper and ink for another light pair at 7:1 contrast or better; there is no dark mode).
- Reduced motion: no boil, no draw-on, no typing.

### Data, not content collections

All structured content lives in `src/data/*.ts`:
- `selected-work.ts`: long-form Selected Work entries (currently unused by the sketchbook; source for `llms.txt`)
- `featured-writing.ts`: curated LinkedIn permalinks with take lines
- `principles.ts`: How I Think principles (currently unused on any page; available)
- `background.ts`: timeline rows, education, certifications, recognition, bioIntro
- `sketchbook.ts`: the six sections (path, title, description, drawing, glance lines) plus the short "more" copy for raxIT and work, the open-source list and the career line
- `now.ts`: `updated` date and the "more" lines for the now section
- `testimonials.ts`: full testimonials with names + a role-only `homeTestimonial` for the home pull-quote

There are no `src/content/` collections. To update content: edit the relevant `.ts` file, commit. The dev server hot-reloads automatically.

### Dynamic content

`src/lib/feeds.ts` exports `fetchFeed`, `mergeAndDedupe`, `formatRelativeDate`. RSS is fetched at build time from raxIT Labs (`https://raxitlabs.com/feed.xml`) and Substack (`https://agairola.substack.com/feed`). raxIT first so canonical URLs win on cross-posts. `src/lib/recent.ts` fetches both once per build and shares the result; the writing section shows the 5 newest, falling back to `featured-writing.ts` if the feeds are down.

### Site metadata in `src/consts.ts`

`SITE_TITLE`, `SITE_DESCRIPTION`, plus all URL constants (Substack, raxIT, LinkedIn, GitHub, YouTube, calendar, email, AI Security Circle Meetup, AI Engineer Melbourne). Change once, propagates everywhere.

### Site URL is locked

`site` in `astro.config.mjs` is `https://adeshgairola.com`. Do not revert to a placeholder. It drives canonical URLs, sitemap, OG, and JSON-LD.

### Design tokens

In `src/styles/global.css`. Two colours only: `--bg` (paper, `#fcfbf8`) and `--ink` (`#26231f`); `--soft` and `--hair` are mixes of ink. `--acc` is the day's accent and fills one small part of a drawing, nothing else. The shuffle dot rewrites these at runtime.

### Typography (do not drift)

- Shantell Sans Variable (`@fontsource-variable/shantell-sans/full.css`), the face Arin uses, with `INFM` and `BNCE` at 0 so it reads calm, not cartoony.
- Lowercase voice everywhere except brand and product names.
- Glance lines 21 to 28px; detail 17 to 18px; no boxes or shadows, dashed rules (3 on, 4 off) between list rows.

### Integrations

`@astrojs/sitemap`, `astro-robots-txt`, `astro-seo`, `@astrojs/vercel` (adapter). RSS is hand-rolled in `src/lib/feeds.ts` (no `@astrojs/rss`). Sharp is used by `scripts/generate-icons.mjs` to build favicons + OG image.

### SEO/AEO

Already wired. Sitemap auto-discovers routes. JSON-LD `@graph` (Person + Organization + ProfilePage with cross-references) in `BaseHead.astro`. `/llms.txt` in `public/`. `robots.txt` allows everything.

## Project intent (do not drift)

- **"Working notebook in public", not a brochure.** Lived-in beats polished. Concrete beats abstract: numbers, dollar figures, dates, named tools.
- **Sketchbook aesthetic, after grug and Arin.** One screen at a time, thin shaky line drawings with lots of air, two colours, words typed on in the bottom 30%. Professional, not childish: objects, not characters.
- **Every section fits a 390×844 viewport with no page scroll.** Only the open "more" panel scrolls.
- Use the **`impeccable:*`** skills for design work. The owner explicitly chose this design system.
- Keep the dependency tree small. Reach for `astro add` only when a feature genuinely needs it.

## Research and context docs

- `.impeccable.md`: design context for impeccable skills (philosophy, tokens, principles, anti-patterns specific to this site). Read this first when designing.
- `docs/research/minimal-personal-sites.md`: survey of 16 minimal personal sites, signature moves, anti-patterns
- `docs/research/aeo.md`: Answer Engine Optimization research (entity disambiguation, schema patterns)
- `docs/research/linkedin-sync.md`: why LinkedIn-personal-post sync isn't possible cleanly in 2026

## When in doubt

1. Read `.impeccable.md` for design philosophy and anti-pattern list.
2. Read the relevant `src/data/*.ts` file before editing markup. Content lives there.
3. Run `pnpm exec astro check` before claiming anything is done.
4. If reaching for an em dash: stop, use a period.
