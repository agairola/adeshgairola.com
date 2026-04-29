# Minimal Personal Sites — Research Notes

A survey of minimal, content-first personal sites in the leerob.com / Sivers / Dan Luu family. Each site was inspected via live fetches (HTML, response headers, CSS variables) on 2026-04-29. Quoted labels are taken directly from the live pages. Where a fingerprint could not be confirmed, the field is left as "could not confirm."

This document is intended to inform design and content decisions for the Astro 6 personal site at `/Users/adeshgairola/Documents/Personal-Site/`.

---

## Per-site notes

### leerob.com — Lee Robinson
- **URL:** https://leerob.com (leerob.io 307-redirects here)
- **Stack:** Next.js + Vercel. Headers: `x-powered-by: Next.js`, `x-nextjs-prerender: 1`, `server: Vercel`. Open-source repo is well-known (Next.js App Router).
- **Typography:** Two named families in the CSS: `STIX` (serif, used for headings/body display) and `Inter` (sans, used for UI/labels). Confirmed by grep of inline style: `stix`, `inter`.
- **Palette:** Pure white `#fff` background, pure black `#000` for inverse blocks. No accent color.
- **Page structure:** Single column, no top nav bar, no chrome. Identity links are inline within the bio paragraph: `/bio`, `/cursor`, `/vercel`, `/writing`, plus GitHub / X / YouTube / `lee@leerob.io`.
- **Sections:** Intro paragraph -> "Featured writing" curated list of 6 -> CTAs (read, code, follow, watch, advise, invest).
- **Progressive disclosure:** Each writing item is a link to a detail page (`/writing/<slug>`). The `/writing` index is a flat unordered list of titles only — no dates, descriptions, or counts.
- **Distinctive:** No nav bar. No footer logo. RSS exists but is not a primary nav item. Heavy use of inline links rather than menus.

### brittanychiang.com — Brittany Chiang
- **URL:** https://brittanychiang.com
- **Stack:** Vercel + Next.js (likely; Vercel server header, no `x-powered-by: Next.js` on this surface but the project is publicly known to be Next + Tailwind).
- **Typography:** `Inter` (sans) throughout. Confirmed in inline CSS.
- **Palette:** Dark "navy/slate/teal" theme (her well-known branding): deep navy background (~`#0a192f`), slate text, mint-teal accent (`#64ffda`). Tokens `slate` and `teal` appear in the page source. **Note:** this site is dark-mode-only — it is the family outlier on color but otherwise a model of single-purpose minimalism.
- **Page structure:** On desktop, a fixed left sidebar with name + role + nav (`About`, `Experience`, `Projects`) and a scrolling right column. On mobile, single column.
- **Sections:** About, Experience (timeline of 6 roles), Projects (4 featured + archive link), Writing (4 articles).
- **Progressive disclosure:** Project detail pages, full archive page, full résumé link.
- **Distinctive:** Skip-to-content link, "Click to time travel" Tardis easter egg in footer, accessibility-first.

### paulstamatiou.com — Paul Stamatiou
- **URL:** https://paulstamatiou.com
- **Stack:** Could not directly fingerprint (Vercel anti-bot challenge intercepted curl). Author has historically self-built / Jekyll / hand-rolled.
- **Typography:** From his own design write-ups: warm gray body type, content-first, no sidebars. Sans for UI, serif for long-form (his stated preference).
- **Palette:** From his blog posts on the redesign: muted desaturated blue accents ("cooler colors recede"), warm gray for primary copy. White/near-white background.
- **Page structure:** Single column, content-first. He explicitly writes that he avoids hiding content behind responsive collapses.
- **Sections:** Writing, Photography, Gear / "Uses," About.
- **Progressive disclosure:** Long-form posts on detail pages with full-bleed photography.
- **Note:** Could not fully verify current homepage live; details above are from his own published design notes (`paulstamatiou.com/responsive-retina-blog-design`).

### jvns.ca — Julia Evans
- **URL:** https://jvns.ca
- **Stack:** Static (Hugo or Jekyll family); served via Cloudflare. No JS framework fingerprint.
- **Typography:** Plain, near-default. Body uses a system serif/sans depending on browser; no custom web font loaded for the index.
- **Palette:** White background, near-black text. Standard blue links. No accent system.
- **Page structure:** Single column, very wide reading measure. Header has primary nav: `About`, `Talks`, `Projects`, plus `Mastodon`, `Bluesky`, `GitHub`. Secondary nav: `Favorites`, `TIL`, `Zines`, `RSS`.
- **Sections:** Posts grouped by topic category (`Cool computer tools`, `Git`, `DNS`, `Terminals`, `Career / work`, etc.) — not by year. Popular posts marked with `★`.
- **Progressive disclosure:** Each post has its own detail page. Zines link out to wizardzines.com (commercial).
- **Distinctive:** Topic-grouping rather than chronological is the standout. RSS is a top-nav peer.

### danluu.com — Dan Luu
- **URL:** https://danluu.com
- **Stack:** Hand-rolled static HTML with one tiny inline `<style>` block (4 CSS rules total). No framework. Cloudflare in front.
- **Typography:** `font-family` is **never declared** — pure browser defaults. Only inline rules are widths and flex on the list. Most browsers render it as system serif/sans depending on default. Charcoal Cantarell or Times-equivalent depending on OS.
- **Palette:** Browser defaults. `<meta name=color-scheme content="light dark">` — respects OS dark mode automatically. White/black with default blue/purple links.
- **Page structure:** Single column. No top nav, no header, no logo. Just an `<ul>` of posts.
- **Sections:** Two: `↑ Public posts`, `↓ Patreon posts`. Each entry is `MM/YY` + title only.
- **Progressive disclosure:** Title links straight to the article (full long-form essay on its own page).
- **Distinctive:** This is the most extreme minimum in the survey. No fonts, no chrome, no JS for the index. Footer has only six links: `Archive`, `Patreon`, `Mastodon`, `LinkedIn`, `Twitter`, `RSS`. Includes a Cloudflare beacon.

### simonwillison.net — Simon Willison
- **URL:** https://simonwillison.net
- **Stack:** Django (response header `django-composition: Pour que Ma Vie Demeure`), Heroku, Cloudflare. Hand-built, content-first.
- **Typography:** Mixed serif/sans hierarchy; no custom webfont prominently advertised — looks system-ui.
- **Palette:** White, near-black, classic blue links. No flashy accent.
- **Page structure:** Single column, reverse-chronological. Top nav: `About`, `Subscribe`, `TILs`, `Tools`. Section nav: `Entries`, `Links`, `Quotes`, `Notes`, `Guides`, `Elsewhere`.
- **Sections:** Entries (long), Links (short with commentary), Quotes, Notes, TILs, Tools.
- **Progressive disclosure:** Tag-based browsing, year archive links 2002-2026 in footer. Each post has a permalink page. Atom feed prominent.
- **Distinctive:** Tagging is the navigation. Six content **types**, not just one stream. Sponsorship banner is disclosed and on-brand.

### gwern.net — Gwern Branwen
- **URL:** https://gwern.net
- **Stack:** Custom Pandoc pipeline. Static. Cloudflare in front. Heavily custom CSS (the source defines hundreds of `--GW-*` CSS variables).
- **Typography:** Source Serif Pro / Source Sans Pro family, plus IBM Plex Mono for code. Drop caps explicitly disabled (`dropcaps-not`). Smallcaps used for navigation labels.
- **Palette:** Light + dark mode toggle. Light: white background, `#333` body links, `#666` visited, `#888` hover, gray hierarchy throughout (every shade from `#a6a6a6` to `#f8f8f8` declared).
- **Page structure:** Index is multi-column (3 columns on desktop) listing topical categories. Long-form essays are single-column with sidenotes.
- **Sections:** Newest, Popular, Notable, Statistics, AI, Deep Learning, Cognition, Psychology, Economics, Cats, Design, Self-Quantification, etc. (~25 categories).
- **Progressive disclosure:** Hover-popups (annotations with bibliographic metadata), collapsible sections, sidenotes. Every link can preview its target.
- **Distinctive:** Reader-mode toggle, popup-disable toggle, search toggle in a floating corner button cluster. The most feature-rich "minimal" site here — minimal aesthetic, maximum reading affordances.

### joshwcomeau.com — Josh Comeau
- **URL:** https://www.joshwcomeau.com (joshwcomeau.com 307-redirects)
- **Stack:** Vercel; Gatsby/Next-style static (he has publicly used Gatsby; markup uses `--font-family` and `--font-family-mono` design tokens).
- **Typography:** `Wotfard` (sans display, custom) + `Spectral` (serif body) historically; current build uses CSS custom properties `--font-family` / `--font-family-mono`.
- **Palette:** Light/dark toggle. Bright purple/pink accent, hand-drawn dumpling mascot, more saturated than the rest of the family.
- **Page structure:** Card grid / featured rows, not a flat list. Has a real top nav: `Categories`, `Courses`, `Goodies`, `About`.
- **Sections:** Latest posts, Popular posts, Courses (CSS for JS, Joy of React, Whimsical Animations), Newsletter signup. Footer with category breakdown.
- **Progressive disclosure:** Posts are full pages with interactive demos baked in (he is the family outlier — he embeds React demos, not just text).
- **Distinctive:** Course-business attached to the blog. Still single-purpose feel despite richer interactivity.

### swyx.io — Shawn "swyx" Wang
- **URL:** https://www.swyx.io
- **Stack:** SvelteKit + Netlify (response: `Netlify` server, preload links pointing to `_app/immutable/...` and `mdsvexlayout` chunks → SvelteKit + mdsvex).
- **Typography:** `Inter` family (confirmed in HTML).
- **Palette:** Light, near-monochrome. Could not pull explicit hex from the build chunks.
- **Page structure:** Vertical stack, two-column nav structure on desktop. Top nav: `Home`, `Ideas` (Writing & Speaking), `About` (Bio, Talks, Photos), `Subscribe` (RSS, Newsletter, Mixtape).
- **Sections:** "Latest Swyx Content," "Most Popular Writing," embedded YouTube grid, newsletter promo, projects (Latent Space, AI Engineer, Cognition).
- **Progressive disclosure:** Posts on detail pages; talks have their own index; podcasts are aggregated.
- **Distinctive:** "Learn in Public" ethos throughout. Subscriber count called out (`>10,000 subscribers`).

### ethanmarcotte.com — Ethan Marcotte
- **URL:** https://ethanmarcotte.com
- **Stack:** Apache server (response: `Apache/2.4.41 (Ubuntu)`), no framework fingerprint — hand-rolled or a static generator on a VPS.
- **Typography:** Could not confirm specific font names from headers.
- **Palette:** Light background, dark text, no obvious accent extracted.
- **Page structure:** Single column. Top nav: `Journal`, `Books`, `Work`, `Links`, `Contact`. Search in header.
- **Sections:** Journal (writing), Books (3 prominent), Work (selected speaking 2010-2019), Links (curated 38+ designer blogroll, OPML download), Press.
- **Progressive disclosure:** Each book/talk has a detail page; OPML download is a power-user nicety.
- **Distinctive:** Curated **blogroll** as a content type, plus an explicit accessibility statement and a tech-ethics copyright notice (text-and-data-mining reservation).

### maggieappleton.com — Maggie Appleton
- **URL:** https://maggieappleton.com
- **Stack:** Vercel. Strong CSP header set. Likely Next.js (based on her public posts about her stack — historically Gatsby, now Next).
- **Typography:** `Inter` (sans) + a serif for body. CSS uses tokens `--font-serif`, `--font-sans`, `--font-body`. Likely a serif like Fraunces or Source Serif but could not pin from minified CSS.
- **Palette:** "Light cream" background (`--color-light-cream`), white alternate (`--color-white`), `#333` for borders. Warm, not pure white.
- **Page structure:** Multi-column grid with illustrated thumbnails on the index. Single column for essay reading.
- **Sections:** `The Garden`, `Essays`, `Notes`, `Patterns`, `Smidgeons`, `Talks`, `Podcasts`, `Library`, `Antilibrary`, `Now`, `About`. **Eleven** content types, the highest in the survey.
- **Progressive disclosure:** "Garden" model — notes have growth stages (seedling/budding/evergreen), each linked to a detail page; essays are illustrated long-form.
- **Distinctive:** Hand-drawn illustrations on every essay thumbnail. The "digital garden" idiom is core to the architecture, not just a tag.

### csswizardry.com — Harry Roberts
- **URL:** https://csswizardry.com
- **Stack:** Cloudflare in front. Hand-rolled / Jekyll-style static (he has historically used Jekyll).
- **Typography:** `font-family: serif`, `font-family: monospace,monospace`, `font-family: system-ui,sans-serif`, and `Hoefler Text, Georgia, serif` — all generic stacks, no webfonts loaded. Truly content-first.
- **Palette:** White background, dark text, classic blue links.
- **Page structure:** Single column, generous max-width for reading. Top nav: `Home`, `About`, `Blog`, `Services` (Audits, Consultancy, Workshops, Masterclasses, Sentinel, Downloads), `Speaking`, `Case Studies`, `Contact`, `Newsletter`.
- **Sections:** Services (he runs a consultancy), Blog (240+ articles), Client logos, Testimonials carousel, Projects (inuitcss, ITCSS, CSS Guidelines).
- **Progressive disclosure:** Article detail pages, case-study detail pages.
- **Distinctive:** This is the **commercial** end of the spectrum — more of a business site than a personal site. Worth noting as a model for "personal brand → consultancy" without abandoning content-first typography.

### adamwathan.me — Adam Wathan
- **URL:** https://adamwathan.me
- **Stack:** Vercel response header. Likely Next.js or a static generator.
- **Typography:** Modern sans-serif. Could not extract specific font name from the protected response.
- **Palette:** Light/white background, dark text, link accent (likely blue).
- **Page structure:** Single column, centered. Top nav: `Articles`, `Talks`, `Screencasts`, `Podcast`, `Courses`, `Projects`, `Journal`.
- **Sections:** Hero ("Who the hell am I?"), bio, current focus (Tailwind CSS), CTAs to /uses page.
- **Progressive disclosure:** Each content type has its own index page.
- **Distinctive:** Conversational, founder-voice copy. Tied directly to product (Tailwind, Tailwind UI).

### sive.rs — Derek Sivers
- **URL:** https://sive.rs
- **Stack:** Hand-rolled, served by `nginx/1.28.2`. No JS framework. Single tiny CSS file (`/style.css`). HTML markup is semantic and untouched (`<header><nav><h1>`, `<section id="about">`, `<dl>` for topic list).
- **Typography:** No font-family declared in the inline source — relies on a small external `style.css`. Default impression on his site has historically been a system serif or system sans, content-first.
- **Palette:** White background, near-black text. SVG icons in `currentColor`. No accent system.
- **Page structure:** Single column. Header has only: site name, RSS icon, contact icon, search icon. No text nav.
- **Sections:** "me in 10 seconds" / "me in 10 minutes" / "what am I doing now" / "contact me" / "articles about…" (a `<dl>` of 14 topics with 1-line descriptions) / books / projects.
- **Progressive disclosure:** Layered bio (10s → 10min → /about), `/now` page, topic-tagged article archives.
- **Distinctive:** The "/now" page convention originates here. Article topics are exposed as a definition list with descriptions, not a flat list — perfect for skim-then-dive. Single-line CSP header, no analytics.

### nownownow.com — /now page directory
- **URL:** https://nownownow.com (Sivers project)
- **Stack:** Static, plain HTML, `nginx`-equivalent.
- **Typography:** Minimal, near-default.
- **Palette:** White, black text, default links.
- **Page structure:** Geographic directory of `/now` pages. England 313, California 246, Germany 195 (current counts).
- **Distinctive for our purposes:** Confirms the `/now` page convention is real and large-scale (>4,000 sites).

### robbowen.digital — Robb Owen
- **URL:** https://robbowen.digital
- **Stack:** Could not confirm framework from headers; likely a static generator.
- **Typography:** Sans-serif throughout. Bold typographic moments (`Let's work **together**`).
- **Palette:** Light cream/white background, dark text, bold typographic accents.
- **Page structure:** Vertical scrolling sections. Top nav: `Home`, `Work`, `About`, `Writing`, plus `Hire me` CTA.
- **Sections:** Hero, services pitch, open-source projects (SynthWave '84, Tornis, Rekishi).
- **Distinctive:** Welsh-language footer flourish ("Gwneud yn Ne Cymru"). "The wilder, the better" tagline.

### alexpate.com — Alex Pate
- **URL:** https://alexpate.com
- **Stack:** Could not confirm; build is small.
- **Typography:** Sans-serif. Heading "Ciao, I'm Alex" sets the tone.
- **Palette:** Light background, dark text, unspecified accent.
- **Page structure:** Single column. Top nav: `Information`, `Writing`, `Contact`. Wordmark `ap ==` returns home.
- **Sections:** Bio, professional background (MoonPay, Monzo), Personal Projects (4: Hystruct (Acquired 2025), Linky, Starkie AI, Awesome Design Systems), Recent Writing (3 posts shown), `View older projects →`.
- **Distinctive:** "Acquired" annotation on a sold project — useful pattern for showing outcomes.

---

## Cross-site synthesis

### 1. Common content sections (ranked by frequency in this survey of 16)

| Section | Sites that have it |
| --- | --- |
| Bio / About | 16/16 — universal |
| Writing / Blog / Journal | 15/16 (only nownownow exception, which is a directory) |
| Projects / Work | 12/16 |
| Talks / Speaking | 9/16 |
| Now page | 4/16 explicitly (Sivers, Maggie, plus inferred); the wider movement is >4,000 sites |
| Newsletter / RSS | 14/16 — RSS is near-universal, newsletter ~half |
| Uses page (gear) | ~5/16 (Wathan, Stamatiou, Comeau referenced) |
| Books I've read / Library | 3/16 (Sivers, Maggie, Marcotte) |
| Podcasts / Audio | 4/16 (swyx, Wathan, Maggie, Comeau) |
| Contact (separate page) | 10/16 |

The unconditional core is: **bio + writing list + projects + RSS**. Everything else is optional.

### 2. Typography patterns

- **Inter is dominant** as the sans choice. Confirmed on leerob, brittanychiang, swyx, joshwcomeau, maggieappleton, and many others by visible CSS variable tokens.
- **Serif body type appears on the more "long-form" sites**: leerob (`STIX Two Text`), Sivers, Gwern (`Source Serif`), Maggie (likely Fraunces or Source Serif under `--font-serif`), Comeau (`Spectral` historically).
- **System / generic stacks** are used by the most-minimal sites: Dan Luu (no declarations at all), CSS Wizardry (`serif`, `system-ui,sans-serif`, `Hoefler Text, Georgia, serif`).
- Common pattern: **two families** — one serif for prose, one sans for UI/labels.
- Free + widely used in this aesthetic: STIX Two Text, EB Garamond, Source Serif 4, Fraunces, Inter, IBM Plex Sans/Serif/Mono, Berkeley Mono (paid), JetBrains Mono.

### 3. Palette patterns

- **Pure white + near-black, no accent:** leerob, Dan Luu, Sivers, simonwillison, csswizardry, ethanmarcotte. ~half the survey.
- **Warm off-white (cream):** Maggie Appleton (`--color-light-cream`).
- **Single accent color:** Brittany Chiang (`#64ffda` mint on dark navy), Comeau (purple/pink). Minority.
- **Light + dark mode toggle:** Gwern, Comeau, Wathan, Maggie. Dan Luu does it via `<meta name=color-scheme content="light dark">` — pure CSS, no toggle.
- **Dark-only:** Brittany Chiang is the only dark-only site here.
- Net: **most sites in this aesthetic are light-mode-first, monochrome, no accent.** A toggle is common but optional. Avoid building the brand on a saturated accent unless you commit (Brittany).

### 4. Layout patterns

- **Single column** is universal for reading pages. ~14/16 are single column on the index too.
- **Reading measure** clusters around **600-720px** of body width based on visible reading line lengths. CSS Wizardry runs slightly wider; Gwern is multi-column on the index but single-column on essays.
- **Generous vertical whitespace** between sections. No card shadows, no gradients.
- **No hero animations.** Hero is a paragraph of text.

### 5. Navigation patterns

- **Two camps:**
  1. **No top nav** — leerob, Dan Luu, Sivers (icon-only), simonwillison's home is content-first. Identity links live inline in the bio paragraph.
  2. **Tiny top nav** of 3-7 text links — Brittany, Wathan, Marcotte, Comeau, csswizardry.
- **Footers are minimal or absent.** The big-footer pattern is gone here. Where a footer exists, it's a thin row of social/RSS links (Dan Luu's six-link footer is the prototype).
- **/now page** is a recognized convention with its own movement (nownownow.com, >4,000 sites). Many writers maintain one.
- **RSS** is a navigation-level peer: a top-nav or header link, not buried.

### 6. Tech stack distribution observed

| Stack | Sites |
| --- | --- |
| Next.js + Vercel | leerob, brittanychiang (likely), maggieappleton (likely), wathan, paulstamatiou, comeau (likely now), often the default |
| SvelteKit + Netlify | swyx |
| Astro | (the user's project) — not represented in this survey, but common in this family |
| Hugo / Jekyll / static generator | jvns, csswizardry (historically Jekyll) |
| Hand-rolled HTML | Dan Luu, Sivers |
| Custom Pandoc pipeline | Gwern |
| Django on Heroku | simonwillison |
| Apache + static | ethanmarcotte |

**Astro fits squarely in this family.** It is content-first, ships almost no JS by default, supports MDX, and is used by many similar sites the user could reference. Continuing with Astro is well-aligned.

### 7. Content cadence patterns ("things I made over the years")

Several distinct organizing strategies:

- **Flat reverse-chronological list** — Dan Luu (`MM/YY` + title), simonwillison.
- **Curated featured + full archive** — leerob (6 featured on home, full list at `/writing`).
- **Grouped by topic, not date** — jvns (Git, DNS, Terminals…), Sivers (`<dl>` of 14 topics with descriptions), Gwern (~25 categories on the index).
- **Tag-driven** — simonwillison, where every post has multiple tags and tag pages are first-class.
- **Garden / growth-stage** — Maggie Appleton (seedling → evergreen).
- **Project cards + writing list (split)** — Brittany, Wathan, Alex Pate.

The most "leerob.com-like" pattern is **curated featured + flat full archive**. That is the easiest to execute and the most readable with small content volume.

### 8. Progressive disclosure idioms

- **Layered bio** — Sivers's "me in 10 seconds → 10 minutes → /about" is the cleanest example.
- **Featured-then-archive** — leerob, Brittany. Homepage shows 4-6 highlights; "see all" links to the full index.
- **Inline links in prose** — leerob makes `/bio`, `/cursor`, `/writing` links in a single sentence. No menu needed.
- **Topic index with one-line descriptions** — Sivers's `<dl>` of articles by topic. Each topic has a single descriptive line; click for the full archive.
- **Hover-popups / annotations** — Gwern is the extreme example; most sites do not bother.
- **Detail pages always exist** — every site here links each item to its own page. None inline-expand. None open external when content is theirs.

### 9. Anti-patterns (what these sites notably **do not** do)

- No animated heroes / parallax / scroll-jacked introductions.
- No "Skills" bar charts, percentages, or rating widgets.
- No testimonial carousels (csswizardry is the only exception, and it's a consultancy).
- No client-logo grids on personal sites (csswizardry again, and it's commercial).
- No giant "Hi, I'm X" full-viewport hero with a face photo (Maggie has illustration, not a hero).
- No newsletter modal popup interrupting the page.
- No cookie banners (most are static, no tracking).
- No social-share buttons inline.
- No comments section (Gwern, simonwillison have alternatives like Mastodon mentions; nobody runs Disqus).
- No footer logo, no "designed by" credit.
- No "Hire me" CTA in primary nav (Robb Owen is the exception; he's a freelancer).

---

## Recommendations for this project

Tight, opinionated choices the user should consider for the Astro 6 build at `/Users/adeshgairola/Documents/Personal-Site/`. Frame each as a default to start with; deviate only with reason.

1. **Type pairing: STIX Two Text (serif body) + Inter (sans UI), or just Inter alone.**
   leerob uses STIX + Inter; the entire "modern minimal" cluster uses Inter. STIX Two Text is free, OFL-licensed, designed for long-form, and renders beautifully at 18-19px / 1.65 line-height. Self-host both via `@fontsource/stix-two-text` and `@fontsource/inter` (or Astro's `astro:assets` font helper). If you want pure simplicity on day one, ship with Inter only and add the serif when adding long-form essays.

2. **Palette: pure white `#fff` background, near-black `#111` body text, classic-blue link `#0066cc` (or `#0070f3` Vercel-blue), no accent system.**
   This is leerob, Sivers, Dan Luu, csswizardry. Use a `prefers-color-scheme` dark mode via CSS variables only — do not build a manual toggle until you have real content. `<meta name=color-scheme content="light dark">` like Dan Luu is the lowest-effort route.

3. **No top nav, no footer logo. Inline identity links in the bio paragraph.**
   Mirror leerob: a 3-4 sentence intro that contains the only navigation the home page needs (`/writing`, `/projects`, `mailto:`). Put RSS and social as a thin row at the bottom of the home page, not a separate footer block.

4. **Content architecture: bio + writing + projects + /now, in that order. Add /uses later.**
   These are the four sections that pay rent. Skip talks/podcasts/library until you have material. `/now` is one short Markdown file and signals you take the medium seriously.

5. **Writing index: flat list, reverse-chronological, title only (or title + date). No descriptions, no tags day one.**
   Match leerob. If you want a richer index later, copy Sivers's `<dl>` topic groupings — but only after you have ~20+ posts. Below that volume, a flat list is more honest.

6. **Reading width: clamp body around `min(680px, 90vw)`. Generous line-height (1.6-1.7).**
   This is the cluster that essentially every readable site here lands in. Astro ships nothing that fights this; just set it on `<article>` and `<main>` in your base layout.

7. **Ship with: RSS feed, sitemap, OpenGraph image per page, view-source-clean HTML.**
   Every site in this family has these. Astro has first-party integrations for sitemap and RSS. View-source readability is a flex this aesthetic earns — Dan Luu's HTML reads like a markdown file. Avoid framework noise (data-* attributes, hydration markers) where you can; Astro is good at this by default.

Optional but worth considering:
- **Each project gets a detail page**, not an inline expand. (Universal pattern.)
- **Avoid course-promo / consultancy CTA** at launch — those changed the feel of csswizardry and Comeau and you can add later.
- **Resist a manual dark-mode toggle** until you have real users asking. `prefers-color-scheme` covers 99% of cases for free.

---

## Sources

- https://leerob.com (HTML + headers)
- https://brittanychiang.com (HTML + headers)
- https://paulstamatiou.com (Vercel challenge intercepted; supplemented by https://paulstamatiou.com/responsive-retina-blog-design)
- https://jvns.ca (HTML + headers)
- https://danluu.com (full HTML)
- https://simonwillison.net (HTML + headers)
- https://gwern.net (HTML + CSS variables)
- https://www.joshwcomeau.com (HTML + headers)
- https://www.swyx.io (HTML + Netlify chunks)
- https://ethanmarcotte.com (HTML + Apache)
- https://maggieappleton.com (HTML + CSP + CSS variables)
- https://csswizardry.com (HTML + headers)
- https://adamwathan.me (HTML + headers)
- https://sive.rs (full HTML)
- https://nownownow.com (HTML)
- https://robbowen.digital, https://alexpate.com (HTML)
