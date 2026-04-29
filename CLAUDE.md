# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal portfolio + journal-style site for Adesh Gairola. Built on Astro 6 (official `blog` starter template), package-managed with **pnpm**. Node `>=22.12.0` required.

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Dev server at `localhost:4321` |
| `pnpm build` | Production build → `./dist/` |
| `pnpm preview` | Serve `./dist/` locally |
| `pnpm exec astro check` | Type-check `.astro` files (run before claiming work is done) |
| `pnpm exec astro add <integration>` | Add an integration (e.g. `tailwind`, `react`, `vercel`) — preferred over editing `astro.config.mjs` by hand |
| `pnpm exec astro sync` | Regenerate `astro:content` types after schema changes |

There's no test runner and no linter configured. `astro check` is the only verification gate.

## Architecture worth knowing

**Content collections drive the site.** Posts live in `src/content/blog/` as `.md` / `.mdx`. The schema (`title`, `description`, `pubDate`, `updatedDate?`, `heroImage?`) is enforced by zod in `src/content.config.ts`. Pages query via `getCollection('blog')` — see `src/pages/blog/index.astro` and `src/pages/blog/[...slug].astro`. After editing the schema, run `pnpm exec astro sync` to refresh types.

**Site metadata is centralized in `src/consts.ts`** (`SITE_TITLE`, `SITE_DESCRIPTION`). Both are imported by `BaseHead.astro`, `Header.astro`, `Footer.astro`, and `rss.xml.js`. Change them once, propagates everywhere.

**`site:` in `astro.config.mjs` is still the placeholder `https://example.com`.** It controls canonical URLs, sitemap, and RSS — must be set to the real domain before any production deploy.

**Design tokens live in `src/styles/global.css` as CSS custom properties** (`--accent`, `--accent-dark`, `--black`, `--gray*`, `--box-shadow`). The base palette is inherited from the Bear Blog template the starter is based on. When applying the user's color theme, edit these vars rather than scattering colors through component styles.

**Typography uses local Atkinson Hyperlegible** (woff files in `src/assets/fonts/`), wired through Astro's `fontProviders.local()` in `astro.config.mjs` and exposed as `--font-atkinson`. To swap fonts, replace the woff files and update the provider config — don't add a separate `<link>` tag.

**Integrations already wired:** `@astrojs/mdx`, `@astrojs/sitemap`. RSS is hand-rolled in `src/pages/rss.xml.js` (not an integration). Sharp is installed for image processing via `astro:assets`.

**Layout convention:** `BaseHead.astro` is the `<head>` block (SEO, OG, canonical). `BlogPost.astro` is the only layout — wraps individual posts. Page-level layouts (home, about, blog index) inline their own structure in `src/pages/*.astro`.

## Project intent (don't drift from this)

- "Super sleek simple notepad" aesthetic — minimal, content-first, no flashy effects.
- Personal portfolio + journal of work-in-progress posts — not a marketing site, not a SaaS landing page.
- The user has a custom color theme they will provide later; until then, leave the default `--accent` palette alone unless asked.
- Use the **`impeccable:*`** skills for design work (the user explicitly chose this design system).
- Keep the dependency tree small. Reach for `astro add` only when a feature genuinely needs it.
