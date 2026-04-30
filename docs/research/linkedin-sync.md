# LinkedIn personal-profile -> personal site sync

Research date: 2026-04-30
Question: Can you cleanly auto-pull a personal LinkedIn profile's feed posts onto a static site (Astro) in 2026?

---

## Verdict (TL;DR)

**No clean programmatic path exists.** LinkedIn's `r_member_social` scope (the only way to read your own feed posts via official API) is a closed permission and they are not accepting access requests. RSS.app, Make.com, and Zapier all explicitly support only company pages, not personal profiles. Every scraper-based GitHub repo either gets accounts banned within days or breaks every few weeks when LinkedIn ships detection updates. The only stable, ToS-safe pattern smart people actually use is **reverse**: write on your own site, cross-post to LinkedIn, never the other way around.

---

## What actually works (ranked by reliability)

### 1. Reverse direction: blog -> LinkedIn (most reliable, ToS-safe)

This is what 95% of indie hackers and dev bloggers actually do. Author on your own site, push to LinkedIn via the *write* API.

- `w_member_social` scope is granted automatically when you create a LinkedIn developer app and add the "Share on LinkedIn" product. No partner application needed. No "are you a marketing org" gatekeeping.
- Post limits: ~100 calls/day/member. Tokens last 60 days (refresh tokens 365 days). Plenty for a 3-posts/week creator.
- GitHub Action `p4p1/linkedin-marketing-workflow` (12 stars, archived but the pattern is trivial to copy) posts to LinkedIn every time your RSS feed updates.
- `Arisamiga/Linkedin-RSS` (14 stars, last update Jan 2026): RSS-feed -> LinkedIn poster.
- Reference posting walkthrough: https://drmowinckels.io/blog/2025/linkedin-api/ (R, but the OAuth flow is identical in any language). Confirms posting works; reading your own posts returns 403.
- Cloud Native Engineer write-up: https://cloudnativeengineer.substack.com/p/how-to-publish-a-post-with-the-linkedin

**This is the recommendation for adeshgairola.com.** See "Specific recommendation" below.

### 2. LinkedIn Newsletters / Articles (the one read-side that works)

LinkedIn Newsletters and Pulse Articles do have something close to RSS, via a third-party scraper that has stayed up.

- `chrisns/linkedin-newsletter-rss` https://github.com/chrisns/linkedin-newsletter-rss
  - 36 stars, **MIT license, 0 open issues, last commit April 2026** (actively maintained, 369 commits).
  - Hosted at https://linkedinrss.cns.me — paste any newsletter URL or pulse article URL, get an RSS feed.
  - URL patterns:
    - Newsletter by ID: `https://linkedinrss.cns.me/7025619738558926848`
    - Newsletter by slug: `https://linkedinrss.cns.me/the-ai-beat-7140498537498816512`
    - Article (pulse): `https://linkedinrss.cns.me/pulse/<slug>` -> redirects to author's newsletter or creates an "Articles by Author" feed.
  - **Caveat:** this only works for *Newsletters* and *Articles*, NOT regular feed posts. Feed posts (the short-form stuff most people write) are not exposed here.
  - **Bigger caveat:** it's a scraper hosted as a free service. One LinkedIn HTML change away from breaking. Self-hosted fork is the safer bet if you depend on it.

If the user starts a LinkedIn Newsletter and writes long-form there, this path is the cleanest read-side option.

### 3. Manual data file (the boring answer that doesn't break)

Just write `src/data/linkedin-posts.json` (or `.ts`) in the Astro repo. Each post: `{ url, excerpt, postedAt, screenshot? }`. Render at build time.

- Zero dependencies, zero ToS risk, zero runtime fragility.
- Marginal cost of adding a new post: 30 seconds of copy/paste at write time.
- For 3 posts/week, this is roughly 12 entries/month. Trivial.
- Pairs well with Astro Content Collections — could literally be `src/content/linkedin/*.md` with a zod schema.

This is the second-best option after reverse cross-posting, and the simplest to ship today.

---

## What doesn't work

### LinkedIn's official API for reading personal posts

- **`r_member_social` is a closed permission.** LinkedIn's own statement (cited across multiple sources): "not accepting access requests due to resource constraints."
- Even authors approved into the Marketing Developer Program have hit `403 Forbidden` on `/me` and `/posts` with the message "Not enough permissions to access: partnerApiMe.GET.20241101" (drmowinckels.io case study, 5-month attempt).
- `r_basicprofile` (the read scope you can get) only returns name, photo, headline. No posts.
- The Posts API + Community Management API exist but are scoped to *organizations* with marketing partner approval. Solo creators are not the target.
- No "Creator API" / "Individual Developer Tier" has been announced 2024-2026. Roadmap focus is the new Community Management API for brand pages.

Source: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-03

### RSS.app, Zapier, Make.com — all company-only for triggers

- RSS.app help docs (https://help.rss.app/en/articles/10656832): supported URL types are "company page, company newsletter, jobs search results page." **Personal profiles not listed.** When users try a personal profile URL, the feed populates inconsistently or pulls only meta description, not post content.
- Zapier LinkedIn integration: only triggers are `New Lead Gen Form Response` and `New LinkedIn Ads Event`. No "new post on profile" trigger exists. Zapier community thread confirms: "These limitations exist because LinkedIn's API does not expose these actions to third-party apps."
- Make.com community has open threads requesting personal-profile post triggers; Make staff response: not available.

### Scrapers (all of them, eventually)

LinkedIn's anti-bot has gotten ruthless in 2025-2026:

- **Proxycurl** (commercial scraper, ~$10M ARR) — sued by LinkedIn Jan 2025, **shut down July 2025**.
- **Apollo.io and Seamless.AI** — company pages deleted from LinkedIn March 2025 for ToS violations.
- LinkedIn ToS update Nov 3 2025 explicitly bans "software, scripts, robots, crawlers, browser plugins" for scraping.
- Independent attempts (cited from plainenglish.io and growwithghost.io): account ban after 47 profiles (first try), 2 days with rotating proxies (second try), 2,000 profiles with Selenium (third try). Pattern: it works briefly, then stops, then your account is gone.

Specific repos:

| Repo | Stars | Last commit | Status |
|---|---|---|---|
| `joeyism/linkedin_scraper` | 4,012 | Apr 2026 | Working but flaky — recent issues report security blocks, broken job search |
| `tomquirk/linkedin-api` (the canonical one) | gone | — | Repo no longer exists at original URL; `JNYH/linkedin_api` fork last updated Aug 2022, dead |
| `linkedtales/scrapedin` | 611 | Feb 2023 | Dead — README still says "working in 2020" |
| `josephlimtech/linkedin-profile-scraper-api` | 753 | Apr 2024 | Stale |
| `nsandman/linkedin-api` | 154 | Jul 2019 | Abandoned |

Tom Quirk's `linkedin-api` Python package (the one most people Google) — Medium article literally titled "How to get banned with linkedin-api python." Author confirms ToS violation under section 8.2; LinkedIn will ban accounts using it. Zero in-production deployments worth copying.

### Apify / PhantomBuster / Bright Data — paid services, same problems

- **Apify** has multiple LinkedIn personal-profile post scrapers (`apimaestro/linkedin-profile-posts`, `harvestapi/linkedin-profile-posts`). They work, sometimes. Reviews flag inconsistency at scale, broken runs, no SLA on selectors when LinkedIn ships detection updates.
- **PhantomBuster** is positioned for outreach, not feed scraping. Per-minute pricing, 1-10 profiles/min variance. Account-risk warnings everywhere in their docs.
- **Bright Data** has the most stable scraper (residential proxies + dataset cache) but pricing is enterprise-tier ($500+/mo) and you're still scraping — ToS risk persists, just paid by them instead of you.

For ~3 posts/week, the cost-per-post on these services is absurd vs. just maintaining a JSON file by hand.

---

## The patterns smart people actually use

After reading roughly 30 articles/threads/repos, the dominant pattern is:

1. **Author canonically on your own site.** Markdown in a content collection.
2. **Cross-post to LinkedIn** via the official write API (`w_member_social`) on publish, either via GitHub Actions or a simple webhook.
3. **Display LinkedIn engagement metrics** (likes, comments) only if you really want them — and only if you're willing to scrape, which most aren't.
4. **For the "look at my LinkedIn presence" section of the site:** hand-curated list of best posts as a JSON/markdown file. Update it when something pops off. Cost: 30 seconds.

The dev.to comparative review by Naveen Sharma (https://dev.to/naveen_sharma/how-i-added-a-linkedin-feed-to-my-website-and-what-actually-worked-3g05) tested 5 widget services (Taggbox, Tagembed, Juicer.io, SociableKIT, Walls.io). All are iframe widgets, all depend on LinkedIn not breaking the underlying scrape, all introduce a third-party runtime dep that doesn't fit a static-site philosophy.

---

## Specific recommendation for adeshgairola.com

Given the stack (Astro 6 static site, build-time RSS, ~3 LinkedIn posts/week of high-quality security/AI content) and the project intent in CLAUDE.md ("super sleek simple notepad, content-first, minimal dependencies"), here's the play:

### Primary: build a `linkedin` content collection

Add to `src/content.config.ts`:

```ts
const linkedin = defineCollection({
  loader: glob({ base: './src/content/linkedin', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    linkedinUrl: z.string().url(),
    postedAt: z.coerce.date(),
    pinned: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  }),
});
```

- Each post is a 5-line markdown file in `src/content/linkedin/`.
- Render on a `/linkedin` page or as a homepage section. Sort by `postedAt`, filter `pinned` for hero spots.
- Adding a new post = `pnpm dev`, paste excerpt, commit. ~30 seconds.

This fits the existing architecture (CLAUDE.md already documents the content collections pattern), zero external dependencies, no ToS risk, no breakage from LinkedIn changes.

### Secondary (if and only if user wants automation): cross-post Astro -> LinkedIn

When user publishes a `src/content/blog/*.md`, a GitHub Action posts a teaser + canonical URL to LinkedIn:

1. Create LinkedIn dev app at https://www.linkedin.com/developers/, add "Share on LinkedIn" product.
2. Generate access token (`w_member_social` scope).
3. Store as GitHub repo secret.
4. GitHub Action on push to `main` parses new blog frontmatter, calls `POST /v2/ugcPosts` with title + URL.

Reference implementation: https://github.com/Arisamiga/Linkedin-RSS (14 stars, last update Jan 2026 — small but the pattern is correct).

### What NOT to do

- Don't use `linkedin-api` (Python, Tom Quirk). Account ban risk under LinkedIn ToS 8.2.
- Don't use RSS.app or Zapier — they don't support personal profiles.
- Don't pay Apify/PhantomBuster/Bright Data for 3 posts/week of scraping. Cost-per-post nonsense.
- Don't embed third-party iframe widgets (Taggbox etc). Violates the "minimal, content-first" intent and adds a runtime dependency to a static site.
- Don't try to read engagement metrics (likes/comments) programmatically. Not possible without scraping.

---

## Sources

- LinkedIn Marketing API docs: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-03
- LinkedIn API access overview: https://learn.microsoft.com/en-us/linkedin/marketing/increasing-access?view=li-lms-2025-11
- Dr. Mowinckel 5-month case study (read 403): https://drmowinckels.io/blog/2025/linkedin-api/
- LinkedIn Posts API ugly truth: https://www.bitoff.org/linkedin-posts-api/
- chrisns LinkedIn newsletter RSS: https://github.com/chrisns/linkedin-newsletter-rss
- Tom Quirk ban warning: https://medium.com/@mhmdjmala51/how-to-get-banned-with-linkedin-api-python-c9ecaec93f5e
- Thunderbit GitHub scraper audit 2026: https://thunderbit.com/blog/linkedin-scraper-github-guide
- Vayne scraper ban-risk testing 2026: https://www.vayne.io/en/blog/best-linkedin-scrapers-2026
- "LinkedIn banned my scraper 3 times": https://plainenglish.io/web-scraping/linkedin-banned-my-scraper-3-times-here-s-the-architecture-that-finally-worked
- RSS.app LinkedIn help (no personal profile support): https://help.rss.app/en/articles/10656832-how-to-create-rss-feeds-from-linkedin
- Zapier RSS+LinkedIn (write only): https://zapier.com/apps/rss/integrations/linkedin
- dev.to LinkedIn-feed widget comparison: https://dev.to/naveen_sharma/how-i-added-a-linkedin-feed-to-my-website-and-what-actually-worked-3g05
- LinkedIn ToS update (Nov 2025): https://www.linkedin.com/help/linkedin/answer/a1341387/prohibited-software-and-extensions
- Proxycurl shutdown: https://nubela.co/blog/is-scraping-linkedin-legal-in-2026/
