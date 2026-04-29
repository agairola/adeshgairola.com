# Answer Engine Optimization (AEO) — research notes

Date: 2026-04-29
Author: research pass for adeshgairola.com
Scope: how AEO actually works in 2026, with concrete actions for a one-page Astro personal site.

---

## 1. What AEO actually is (and how it differs from SEO)

**Working definition.** AEO is the practice of structuring a site so that AI answer engines — ChatGPT search, Perplexity, Claude (web), Google AI Overviews / AI Mode, Bing Copilot, You.com — surface, quote, and cite the site when answering a user's natural-language query. Output is a synthesised paragraph with a small set of inline citations, not a ranked list of ten blue links.

**Real differences vs. classical SEO:**

- **Source selection happens at the passage level, not the page level.** Google has explicitly shifted AI Overviews from "rank the page" to "rank the passage that best answers a generated sub-question." Stackmatix's analysis of AI Overview source selection found that **only 38% of AI-Overview-cited pages also rank in the organic top 10**, down from 76% seven months earlier. ([source](https://www.stackmatix.com/blog/ai-overview-source-selection))
- **AI crawlers don't render JavaScript.** GPTBot, ClaudeBot, and PerplexityBot fetch raw HTML and move on. They don't wait for hydration, don't retry, and don't run a headless Chrome. Googlebot is currently the only major crawler that does full JS rendering. ([Vercel analysis](https://vercel.com/blog/the-rise-of-the-ai-crawler), [Lantern](https://www.asklantern.com/blogs/ai-crawlers-do-not-render-javascript))
- **There are now two crawler classes per vendor: training vs. retrieval.** This matters and is regularly conflated. (Detail in section 3.)
- **Citation churn is high.** SEMrush / similar measurement work finds ~40–60% of cited sources change month-to-month on Google AI Mode and ChatGPT — far more volatile than organic rankings. ([Superlines AI Search Statistics 2026](https://www.superlines.io/articles/ai-search-statistics/))
- **What gets quoted is short.** AI Overview extracts cluster around 134–167 words; ~62% of featured passages sit in the 100–300 word band. ([Stackmatix](https://www.stackmatix.com/blog/ai-overview-source-selection))

**What's the same as SEO:** crawlability, canonical URLs, sitemaps, semantic HTML, fast servers, real backlinks. AEO is additive, not a replacement.

---

## 2. The `llms.txt` convention

**What it is.** A markdown file at site root (`/llms.txt`) that gives an LLM a curated map of the site: H1 project name, blockquote summary, then H2 sections of links pointing to clean markdown versions of important pages. Optional companion `/llms-full.txt` inlines the full content.

**Who proposed it.** Jeremy Howard / Answer.AI, September 2024. ([Original post](https://www.answer.ai/posts/2024-09-03-llmstxt.html), [spec at llmstxt.org](https://llmstxt.org/), [Howard tweet](https://x.com/jeremyphoward/status/1831089138571133290))

**Adoption.** Real and growing among technical-doc sites: Anthropic ships both `llms.txt` (~8K tokens) and `llms-full.txt` (~481K tokens) covering the API docs; Stripe, Cloudflare, Cursor, Pinecone, Mintlify-hosted docs all publish one. BuiltWith reported ~844K sites with the file as of late October 2025. ([Mintlify breakdown](https://www.mintlify.com/blog/real-llms-txt-examples))

**Do AI engines actually read it in 2026? Honest answer: not really, yet.**
- A 2025 study tracking 1,000 domains saw **zero hits** from GPTBot, ClaudeBot, PerplexityBot, or Google-Extended on `/llms.txt` over a 30-day window. ([machinecontext.ai](https://www.machinecontext.ai/blog/llms-txt-nobody-reads-it), [Search Engine Land tracking 10 sites](https://searchengineland.com/does-llms-txt-matter-467740))
- Google's John Mueller publicly stated "no AI system currently uses llms.txt."
- Anthropic and Cursor *officially support* the format on the publishing side but neither has confirmed using it as a retrieval signal.

**Verdict for a personal site.** Low cost, near-zero current value, mild upside if/when retrieval pipelines start honouring it. Adding one is a 15-minute hedge. Don't overinvest in `llms-full.txt` for a single-page site — the current `index.astro` *is* the full content.

---

## 3. AI crawlers — what to allow, what to block (training vs. retrieval)

The single most important conceptual move: **separate training crawlers from retrieval/answer crawlers**. Different user agents, different stakes.

| Vendor | Training crawler | Live-retrieval crawler | User-triggered fetch |
|---|---|---|---|
| OpenAI | `GPTBot` | `OAI-SearchBot` | `ChatGPT-User` |
| Anthropic | `ClaudeBot` | `Claude-SearchBot` | `Claude-User` |
| Google | `Google-Extended` (control flag, not a separate UA) | (uses Googlebot index for AI Overviews) | n/a |
| Perplexity | `PerplexityBot` | (same) | `Perplexity-User` |
| Microsoft | `Bingbot` (single bot feeds search and Copilot) | `Bingbot` | n/a |
| Common Crawl | `CCBot` (used by many open models) | n/a | n/a |

Sources: [OpenAI bot docs](https://developers.openai.com/api/docs/bots), [Anthropic crawler docs](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), [Perplexity crawler docs](https://docs.perplexity.ai/docs/resources/perplexity-crawlers), [Google-Extended explainer](https://www.amicited.com/glossary/google-extended/).

**Key behavioural notes:**

- **Google-Extended is a control token, not a fetcher.** It piggybacks on Googlebot's existing crawl; setting `Disallow` for `Google-Extended` opts the content out of Gemini/AI-Overview *training and grounding* but does not affect classic Search ranking.
- **`OAI-SearchBot` no longer collects training data** per OpenAI's late-2025 documentation revision. Allowing it is a pure visibility play.
- **`ChatGPT-User` is user-initiated and OpenAI removed robots.txt compliance language for it** — it will fetch when a user pastes/links your URL into ChatGPT regardless. Same pattern with `Claude-User` and `Perplexity-User`.
- **Perplexity has been caught using stealth user agents** that ignore robots.txt. ([Cloudflare investigation](https://blog.cloudflare.com/perplexity-is-using-stealth-undeclared-crawlers-to-evade-website-no-crawl-directives/), [Robb Knight](https://rknight.me/blog/perplexity-ai-is-lying-about-its-user-agent/)) Blocking via robots.txt is therefore advisory; WAF / Cloudflare bot rules are the enforcement layer if you ever care.

**Recommendation for adeshgairola.com:** allow everything. The whole site is public personal-brand content. No private docs, no paywalled material. Default-allow is the right posture; the goal is to be cited.

---

## 4. Content patterns that actually get cited

This is where the data gets interesting. Findings from the largest public studies:

- **Wikipedia, Reddit, YouTube dominate.** Across 680M citations sampled, ChatGPT cites Wikipedia 7.8%, Reddit 1.8%, Forbes 1.1%, G2 1.1%; Perplexity over-indexes on YouTube, Wikipedia, Apple, Google. ([SEMrush study](https://www.semrush.com/blog/how-to-optimize-content-for-ai-search-engines/))
- **Headings matter a lot.** Pages with well-organised H2/H3 structure are **2.8× more likely** to be cited. ([Geneo](https://geneo.app/blog/ai-optimized-content-cited-chatgpt-perplexity-best-practices/))
- **Quotes from named experts boost AI Overview visibility ~37%.** Citations to recognised sources boost it ~132%. ([Stackmatix AI Overview source selection](https://www.stackmatix.com/blog/ai-overview-source-selection))
- **Per-platform priors differ.** Perplexity and AI Overviews weight word/sentence count and structure; ChatGPT weights domain rating and Flesch readability. ([Frase AEO guide](https://www.frase.io/blog/what-is-answer-engine-optimization-the-complete-guide-to-getting-cited-by-ai))

**Patterns that get pulled into answers:**

1. **Direct claim → evidence in the next sentence.** Mirrors how a model would lift a quotable line. "X is Y because Z." not "There are many considerations around X..."
2. **Q&A or "what is X?" framings.** Even without `FAQPage` schema, an H2 phrased as a question + a 2–4 sentence answer below is the highest-citation unit.
3. **Numbered or named lists.** "Three properties of safe AI agents:" with bullets gets quoted intact.
4. **Definitions in the first 2 sentences of a section.** Models reach for definitional sentences when grounding.
5. **Concrete numbers, dates, named systems.** "$4M ARR across 150+ engagements" is far more quotable than "led a successful consulting practice."

**What is genuinely new vs. classic SEO:** the *unit* of optimisation has shrunk from "page that answers the query" to "passage that survives extractive summarisation."

---

## 5. Structured data — signal vs. noise

Schema findings (from [Discoverability](https://discoverability.co/resources/schema-markup-guide/), [Frase FAQ schema](https://www.frase.io/blog/faq-schema-ai-search-geo-aeo), [Stackmatix structured-data analysis](https://www.stackmatix.com/blog/structured-data-ai-search)):

| Schema type | Signal strength for a personal site | Notes |
|---|---|---|
| `Person` (already shipped) | High | Your knowledge-graph anchor. Keep `sameAs`, `knowsAbout`, `worksFor`. |
| `ProfilePage` (wraps `Person`) | Medium-high | Google added `ProfilePage` as a first-class type for author entities; an obvious add for a personal site. |
| `FAQPage` | Medium (and falling) | Citation rates rose ~30–67% in some studies, but Google's March 2026 core update **reduced rich-result display for FAQ on non-primary content**. Use it only if you genuinely have FAQs about you/your work. |
| `Article` / `BlogPosting` | Low for the index page, high for any future writing pages | If you ever add `/posts/...`, mark them up. |
| `BreadcrumbList` | Low | A one-page site has no breadcrumb. Skip. |
| `Organization` (raxIT) | Medium | Worth adding as a separate JSON-LD block — establishes the entity edge from `Person.worksFor`. |
| `Event` for AI Engineer Melbourne / AI Security Circle | Medium | Speaking + organising are quotable proof of authority. |
| `CreativeWork` / `SoftwareSourceCode` for the OSS projects | Low-medium | More noise than signal unless GitHub already covers it. |

**Heuristic:** "3–4 complementary schema types per page" was the cited sweet spot — pages stacking `Article + FAQPage + BreadcrumbList` got cited 2× more than single-schema pages. For a one-pager, `Person + ProfilePage + Organization (+ optionally Event)` is the right depth.

---

## 6. Authority signals AI engines actually weight

Triangulating across the studies:

- **Backlinks still matter, but less.** ChatGPT is correlated with domain rating; AI Overviews are correlated more with topical density and entity authority than raw DR.
- **Citations from authoritative third-party sites > self-published authority claims.** Being quoted in TechCrunch / a16z / OWASP is worth more than restating credentials on your own page.
- **Entity verification via `sameAs`.** LinkedIn, GitHub, Wikipedia, Wikidata, ORCID, Crunchbase, Substack — every additional verifiable cross-reference strengthens the entity. The `Person.sameAs` array is genuinely load-bearing for whether models treat "Adesh Gairola" as a known entity.
- **Wikipedia and Wikidata are uniquely powerful.** A Wikidata item with a few statements (occupation, employer, founder-of) often does more for entity recognition than a year of blog posts.
- **Domain age & content stability** matter mildly; brand-new domains with shifting content get cited less.
- **Reddit and YouTube** function as "authority laundering" channels — being mentioned in a relevant subreddit thread or appearing in a YouTube transcript that Whisper can index is a real (if uncomfortable) AEO lever.

---

## 7. E-E-A-T mapped to AI answer engines

Google's framework (Experience, Expertise, Authoritativeness, Trustworthiness) is documented in the [Search Quality Rater Guidelines](https://services.google.com/fh/files/misc/hsw-sqrg.pdf). Stackmatix's analysis of AI Overview citations claims **96% come from sources with strong E-E-A-T signals**. The March 2026 core update explicitly amplified the **Experience** dimension. ([Digital Applied summary](https://www.digitalapplied.com/blog/e-e-a-t-march-2026-google-rewards-experience-content-guide))

Concrete signals on a personal site:

- **Experience:** "I built X." First-person, dated, with specifics (numbers, customers, scale). The current `index.astro` already does this well — "$4M ARR," "150+ engagements," "11 specialists across AU/NZ/SG/IN/KR/JP" are textbook Experience signals.
- **Expertise:** credentials block (CCIE, AWS Specialty, OWASP LLM Top 10 contributor) — already present.
- **Authoritativeness:** `sameAs` cross-references, speaking slots, OSS projects with stars, third-party citations.
- **Trustworthiness:** real email, real location, dated entries, last-built timestamp, HTTPS, no dark patterns. All present.

The site is already on the strong side of E-E-A-T. The gap is **dates on more entries** (only some `selectedWork` items have them) and **outbound source links** when making claims.

---

## 8. Anti-patterns — what kills citation chances

- **Client-side-rendered content.** AI crawlers see an empty shell. Astro static SSG already wins this round.
- **Login walls / paywalls / cookie-gated content.** Crawler sees a banner, not the content.
- **Walls of unbroken prose.** Without H2/H3 and short paragraphs, passage-extraction can't find a clean unit.
- **Vague filler ("In today's rapidly evolving...").** Models look for definitive claims with concrete nouns. Filler dilutes the extractable signal.
- **Marketing voice.** Studies consistently show plainspoken, declarative writing gets quoted; superlatives get skipped.
- **Hidden / collapsed accordions** that need JS to open. Same problem as CSR.
- **Stale dates, especially "© 2022" footers.** Freshness signal goes wrong way.
- **Excessive identical schema across many pages** (the "FAQPage abuse" pattern Google demoted in March 2026).
- **Blocking AI crawlers in robots.txt while wanting to be cited.** Self-evident, still common.

---

## 9. Measuring AEO

**Free / DIY:**

- **Server log analysis.** Grep for `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`, `Perplexity-User`, `Google-Extended`, `Bingbot`. If you're on Vercel/Netlify/Cloudflare, the access logs / analytics surface user-agent breakdowns.
- **Referrer analytics.** Watch for `chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com` in referrer logs — these mean a user clicked a citation back to your site.
- **Manual prompt testing.** Run target queries ("AI security consultant Sydney", "threat modeling for AI agents", "MAESTRO threat modeling") in each engine weekly, screenshot citations, track over time.

**Paid tools (real products, not vapour):**

- [Profound](https://www.tryprofound.com/) — G2 Winter 2026 AEO Leader, citation tracking across major engines.
- [HubSpot AEO Grader](https://www.hubspot.com/aeo-grader) — free entry-point.
- [Frase AI Search Audit](https://www.frase.io/) — covers ChatGPT, Perplexity, Claude, Gemini, AI Overviews, Grok, Copilot, DeepSeek.
- [Peec.ai](https://peec.ai/), [LLMrefs](https://llmrefs.com/), [Otterly.AI](https://otterly.ai/) — analytics-style dashboards starting around $29–49/mo.

For a personal site, **manual tracking + log greps** is enough. Paid tools are calibrated for B2B SaaS marketing teams.

---

## 10. AEO for a one-page personal site (what's actually relevant)

Most AEO advice assumes you have 50–500 marketing pages and a content calendar. For a one-pager, the relevant subset is narrower:

1. **The page is the entity.** Everything is about making "Adesh Gairola = AI security founder, ex-AWS, Sydney, raxIT, MAESTRO/STRIDE threat modeling for AI agents" a stable entity in the model's world-view. Structured data + cross-references + plain-text repetition of the same identity claims do this.
2. **Scope is your moat.** Generic "AI security" queries will return Anthropic, OpenAI, Google. Specific queries — "AI security consultant Sydney", "MAESTRO threat modeling framework", "AI agent governance startup Australia", "Australian ISM-2072 model file requirements" — are winnable. Make those specifics quotable.
3. **One-page = high-density citation surface.** A model asked "who works on AI security in Sydney?" reads the entire page in one shot. Every paragraph competes for the citation. Short, declarative, dated paragraphs win.
4. **External proof points carry the brand.** Most authority signal will come from raxITlabs.com posts, talks at AI Engineer Melbourne, Lu.ma events, OSS repos, and any third-party coverage. The personal site's job is to *connect* these as one entity, not to host all the content.

---

## Concrete actions for adeshgairola.com

Prioritised high → low. Effort estimates assume the existing Astro setup.

### Tier 1 — high leverage, low effort

**1. Move robots.txt to explicit AI-crawler allowlist.** *(15 min, easy)*
Currently `User-agent: * / Allow: /` covers it implicitly, but explicit named allowances are a stronger signal and survive future tightening of `*` defaults by hosting providers / CDNs. Update `astro-robots-txt` config in `astro.config.mjs` to enumerate `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`, `Perplexity-User`, `Google-Extended`, `Bingbot`, `CCBot` with `Allow: /`. Sends a "yes, please cite me" signal and is greppable in your own logs.
*Why it works:* explicit allow > implicit; vendor docs all read these tokens.
*Astro fit:* easy — `robotsTxt({ policy: [...] })` already supports this.

**2. Add `ProfilePage` + `Organization` JSON-LD blocks.** *(30 min, easy)*
Already have `Person`. Wrap it as `ProfilePage` (the [schema.org](https://schema.org/ProfilePage) type Google added explicitly for author entities) and add a sibling `Organization` block for raxIT with its own `sameAs` to LinkedIn company page, GitHub org, and the raxitlabs.com domain. Adds the entity edge models look for.
*Why it works:* Stackmatix data shows 3–4 complementary schemas → 2× citation rate. The `Person → worksFor → Organization` graph is exactly what Google's entity layer wants.
*Astro fit:* easy — add a second `<script type="application/ld+json">` in `BaseHead.astro`.

**3. Expand `Person.sameAs` aggressively.** *(15 min + 1 hr ongoing)*
Current array: LinkedIn, GitHub, Substack, YouTube. Add: Wikidata Q-item (create one if not yet — 10 min on wikidata.org), ORCID, Crunchbase founder profile, raxITlabs.com `/about` (if it exists), Lu.ma organiser profile, AI Engineer Melbourne speaker page, Threat Composer GitHub. Each `sameAs` is a verifiable bridge to an external entity.
*Why it works:* entity disambiguation is the single biggest factor in whether "Adesh Gairola" becomes a stable graph node vs. a fuzzy mention. Wikidata in particular punches far above its weight.
*Astro fit:* trivial — append to the array in `BaseHead.astro`.

**4. Add an `llms.txt` at site root.** *(15 min)*
For a one-page site, this is a 30-line file: H1 "Adesh Gairola", blockquote one-liner, sections linking to the canonical page, raxITlabs.com, Substack, GitHub orgs, the AI Engineer Melbourne talk page. Won't move the needle today, but cheap insurance for whenever retrieval pipelines start using it (Anthropic and Cursor publish their own — they understand the format).
*Why it works:* Currently speculative — explicitly noted as such. Any actual lift would come from future adoption by retrieval pipelines, not current crawlers.
*Astro fit:* drop a static file in `/public/llms.txt`. No build pipeline changes.

### Tier 2 — medium leverage, medium effort

**5. Add an FAQ section on the page (with `FAQPage` schema).** *(1 hr)*
Three to six real questions framed exactly the way someone might ask an AI engine: "Who is Adesh Gairola?", "What is raxIT?", "What's the MAESTRO threat-modeling framework?", "What is Australian ISM-2072?", "Where does the AI Security Circle Sydney meet?". 2–4 sentence answer per question, each with a concrete fact. This is the single highest-citation content shape AI engines pull. Caveat: don't stuff it. Google's March 2026 core update demoted FAQ-schema abuse on non-primary content. Genuine FAQs only.
*Why it works:* Q→A passages with FAQPage schema have the highest documented citation rates across Perplexity / ChatGPT / AI Overviews. Also lets you control how key entities (raxIT, MAESTRO, ISM-2072) are *defined* in the answer model.
*Astro fit:* easy — add a section to `index.astro`, emit an additional JSON-LD block.

**6. Date every entry and add a visible "Updated" timestamp.** *(30 min)*
Several `selectedWork` and all `featuredWriting` entries lack dates. The build already has `lastBuilt`; surface it more prominently and add explicit `dateModified` to the `Person`/`ProfilePage` schema. Recency is a real ranking signal in AI Overviews.
*Why it works:* freshness signal; Experience pillar of E-E-A-T benefits from dated experience.
*Astro fit:* easy.

**7. Tighten the page for passage extraction.** *(2–3 hrs, ongoing)*
Audit each section for a "definitional first sentence + concrete evidence" pattern. Current copy is already good; the tax is consistency. Examples:
- "AI Security Circle Sydney" → lead with "AI Security Circle Sydney is a monthly practitioners-only meetup I founded in 2025." instead of starting at "Founder and organiser."
- "Selected work" entries → ensure each first sentence is a standalone definitional claim ("X is Y, deployed Z, achieved W").
*Why it works:* matches the 134–167-word extract window AI Overviews favour. Each section becomes a cleanly liftable answer unit.
*Astro fit:* pure copy edit.

**8. Add an `Event` schema block for AI Engineer Melbourne talk.** *(30 min)*
Speaking is a strong Authority signal and dated upcoming events are exactly the kind of fact engines like to surface. Mark it up: name, startDate, location, performer (you).
*Astro fit:* one more JSON-LD block.

### Tier 3 — lower leverage but worth knowing

**9. Server log monitoring for AI bot UAs.** *(1 hr setup, ongoing)*
If hosted on Cloudflare/Vercel/Netlify, set a saved query / dashboard for the user-agent strings listed in section 9. This is your only ground-truth signal that any of the above is working.

**10. Manual citation tracking spreadsheet.** *(30 min setup, 15 min weekly)*
Ten target queries × five engines = 50 cells/week. Track citation, screenshot, note drift. Beats every paid AEO tool at this scale.

**11. External authority compounding.** *(ongoing)*
The biggest AEO lever for a personal site is *not on the personal site*. It's getting cited by sites the engines already trust:
- A Wikidata item (≠ Wikipedia article) with verifiable claims.
- One conference talk recording on YouTube with a clean transcript.
- A handful of guest posts or podcast appearances.
- raxITlabs.com posts that link back to adeshgairola.com with proper anchor text.
This is where the actual graph weight gets built. The personal site is the canonical landing surface; the rest of the internet does the citation work.

### Tier 4 — explicitly *not* recommended

- **Don't add `BreadcrumbList`.** No breadcrumbs on a one-pager.
- **Don't bulk-add `Article` / `BlogPosting` to non-existent posts.** Wait until you actually move writing onto the site.
- **Don't pay for an AEO platform.** $29–$300/mo tools are calibrated for marketing teams tracking 100+ keywords. Manual works at this scale.
- **Don't block AI crawlers** "to negotiate licensing." Not your business model. You're trying to be cited.
- **Don't add JS-rendered content** for any visible text. Astro static SSG is the right architecture; keep it that way.

---

## Sources

Authoritative / first-party:
- [Jeremy Howard / Answer.AI — `/llms.txt` proposal](https://www.answer.ai/posts/2024-09-03-llmstxt.html)
- [llmstxt.org spec](https://llmstxt.org/)
- [OpenAI — Overview of OpenAI Crawlers](https://developers.openai.com/api/docs/bots)
- [Anthropic — How site owners can manage Claude crawlers](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Perplexity — crawler documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)
- [Perplexity — robots.txt FAQ](https://www.perplexity.ai/help-center/en/articles/10354969-how-does-perplexity-follow-robots-txt)
- [Google Search Quality Rater Guidelines (E-E-A-T)](https://services.google.com/fh/files/misc/hsw-sqrg.pdf)
- [Cloudflare — Perplexity stealth crawlers investigation](https://blog.cloudflare.com/perplexity-is-using-stealth-undeclared-crawlers-to-evade-website-no-crawl-directives/)
- [Vercel — The rise of the AI crawler](https://vercel.com/blog/the-rise-of-the-ai-crawler)

Analytical / studies:
- [SEMrush — How to Optimize Content for AI Search Engines (2026)](https://www.semrush.com/blog/how-to-optimize-content-for-ai-search-engines/)
- [Stackmatix — AI Overview Source Selection Algorithm Analysis](https://www.stackmatix.com/blog/ai-overview-source-selection)
- [Stackmatix — Structured Data for AI Search](https://www.stackmatix.com/blog/structured-data-ai-search)
- [Search Engine Land — Does llms.txt matter? Tracking 10 sites](https://searchengineland.com/does-llms-txt-matter-467740)
- [Mintlify — Real llms.txt examples](https://www.mintlify.com/blog/real-llms-txt-examples)
- [Frase — AEO complete guide 2026](https://www.frase.io/blog/what-is-answer-engine-optimization-the-complete-guide-to-getting-cited-by-ai)
- [Robb Knight — Perplexity user-agent analysis](https://rknight.me/blog/perplexity-ai-is-lying-about-its-user-agent/)
- [Lantern — AI crawlers do not render JavaScript](https://www.asklantern.com/blogs/ai-crawlers-do-not-render-javascript)
- [Superlines — AI Search Statistics 2026](https://www.superlines.io/articles/ai-search-statistics/)
- [Digital Applied — E-E-A-T after March 2026 core update](https://www.digitalapplied.com/blog/e-e-a-t-march-2026-google-rewards-experience-content-guide)
- [Geneo — content cited by ChatGPT & Perplexity](https://geneo.app/blog/ai-optimized-content-cited-chatgpt-perplexity-best-practices/)

Speculative / unverified at time of writing:
- Specific citation-rate percentages (FAQPage 67%, schema-stacking 2×, headings 2.8×) are reported by individual analysts on commercial blogs and have not been independently reproduced. Treat as directional, not load-bearing.
- The claim "no major AI engine reads `/llms.txt` in production" is broadly supported but vendors do not publish negative confirmations. Adoption could change quickly and silently.
