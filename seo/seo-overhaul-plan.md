# Workout Quest — SEO Overhaul Plan

Date: 2026-08-07 · Domain: workoutquestapp.com
Sources: OpenSEO (site crawl, domain overview, backlinks, ranked keywords, keyword metrics, SERPs, Search Console) · built-HTML verification (.vercel/output/static) · code review. All figures verified 2026-08-06/07.

---

## 0. Diagnosis — the site is not invisible, it is un-machined

Search Console (28 days, 2026-07-06→08-03) contradicts the "0 traffic" read: the domain gets **206 clicks / ~5,600 impressions / month**, almost entirely from the gamified-fitness term family. DataForSEO only indexes terms with meaningful volume, and every term this site ranks for is ≤50 searches/month, so OpenSEO's "3 keywords, 0 traffic" is a tooling blind spot, not the real state.

| # | Problem | Evidence |
|---|---------|----------|
| 1 | **Catastrophic concentration**: homepage takes 200 of 206 clicks; 13 of 33 posts get zero impressions; only 20 pages have any impressions at all | GSC page table |
| 2 | **Zero internal linking, zero conversion paths**: no post body links to any other post; no post links to the app; no related-posts component | Content scan + SinglePost.astro:113-122 |
| 3 | **Structured data gaps (JSON-LD is emitted, but incomplete)**: homepage lacks Organization/WebSite schema; support/privacy have none; `og:title` ≠ `<title>` on posts (og:title skips the title template); `validate-seo` does not fail when JSON-LD is absent or titles/descriptions are out of band; no rel prev/next; no RSS feed despite `@astrojs/rss` being installed | Built-HTML verification (home has MobileApplication+FAQPage, posts Article+BreadcrumbList, archives BreadcrumbList; og:title on posts is untemplated) |
| 4 | **Keyword/content mismatch**: the 5 routine posts target phrasing nobody searches ("Best Four-Day Gym Workout Routine") instead of real queries ("4 day workout split" KD 0, 110/mo); the 3 "top apps" posts cannibalize one intent | GSC (zero routine impressions) + keyword metrics |
| 5 | **Metadata hygiene**: ~15 rendered titles >60 chars, 12 excerpts >160 chars, 11 tag descriptions <70 chars, `og:title` ≠ `<title>` on posts (og:title skips the template), no rel prev/next on pagination | Built-HTML scan + Metadata.astro / AstroSeo buildTags.ts:65-82,113-119 |
| 6 | **Dead weight**: ~10 near-duplicate "quest/recovery" posts (mostly zero-impression), stale 2024/2025 roundups, `daily-micro-habits-small-wins` uses `date:` instead of `publishDate:` so it re-sorts as "today" (blog.ts:47-49) | GSC + frontmatter scan |
| 7 | **Backlinks without authority**: 91 links / 43 domains, almost all rank-0; only Product Hunt (rank 11), apple.com citations, saashub, tinyalternatives, chrome-stats are real; factchecktool.com (23 links) looks like content-farm citations | OpenSEO backlinks overview |
| 8 | **AI Overview presence exists, unharnessed**: conversational queries ("are they free", "i'm on android", "rpg game style", "free ones plz") show the site at positions 1-6 — it is already being cited in AI answers with zero structured data behind it | GSC query table |

**Strategy in one line:** defend the gamified/RPG niche the site already owns (positions 1-20 on 40+ terms), re-machine the site so Google can read it (structured data, internal links, metadata), pivot dead content to real search vocabulary, and capture adjacent low-KD demand the site is one post away from.

---

## 1. Phase 0 — Technical foundation (week 1; in-repo; no credits)

Status: **executed and verified 2026-08-07** — `yarn build` clean (108 pages), hardened `validate-seo` passes, `check-canonicals` and `audit-frontmatter` pass. (Pre-existing lint debt in Footer.astro / support+privacy astro-parser errors was present on HEAD before this work; not part of Phase 0.)

1. **Structured data verified + completed.** Investigation showed JSON-LD **is** emitted correctly in the build (home: MobileApplication + FAQPage; posts: Article + BreadcrumbList; archives: BreadcrumbList) — the earlier "stripped" report was a grep artifact. Real gaps fixed:
   - Added `Organization` + `WebSite` schemas to the homepage (`src/pages/index.astro`).
   - Acceptance: every indexable page has ≥1 valid `application/ld+json` block after build.
2. **Hardened `validate-seo`** (`scripts/validate-seo.js`): now fails when an indexable page has zero JSON-LD, a rendered `<title>` >60 chars, or a meta description outside 70-160 chars (tag/404 pages excluded).
3. **Title/excerpt pass** — 29 titles shortened to ≤46 raw chars (rendered ≤60 with the `Workout Quest:` prefix) and 12 excerpts trimmed to ≤155 chars, applied per the measured list in §3.
4. **Fixed `og:title`** to use the same templated title as `<title>` (`src/components/common/Metadata.astro` passes the resolved title into openGraph).
5. **Fixed `publishDate` bug** — `daily-micro-habits-small-wins.mdx`: `date:` → `publishDate:`.
6. **Fixed the duplicate H1** — removed the `# ` heading from `gamify-your-progress-workout-quest-quests.mdx`.
7. **Tag-page descriptions** raised to ~110 chars in `[...blog]/[tag]/[...page].astro`.
8. **rel prev/next** added to blog/category/tag pagination (`Pagination.astro`).
9. **RSS feed added** — `src/pages/rss.xml.ts` (via `@astrojs/rss`, already a dependency), linked in `<head>` on every page.
10. **Verify:** `yarn build && yarn validate-seo && yarn check-canonicals && yarn audit-frontmatter` (in progress).

---

## 2. Phase 1 — Content restructuring (weeks 2-3; the traffic engine)

Status: **executed and verified 2026-08-07** — 33 posts → 27 posts (+5 new, -11 merged/deleted), 103 pages built; build + hardened validate-seo + check-canonicals + audit-frontmatter all pass.
- §2a executed Option A: new evergreen canonical `/best-gamified-fitness-apps` (2,088 words, 12-app comparison table), 3 dated posts 301'd into it.
- §2b executed: recovery hub `smart-recovery-quests-wearables` expanded 443 → 1,777 words; `balanced-wearable-leaderboards` → 1,264; 8 posts deleted and 301'd to keepers (incl. `micro-quests-for-active-recovery` → new `/active-recovery`).
- §2c executed: all 5 routine posts retitled (Phase 0) + bodies reworked to split vocabulary, "who this split suits" paragraphs, series cross-links + link to `/upper-lower-split-guide`.
- §2d executed: 4 new posts (upper-lower-split-guide 1,137w; best-free-workout-apps 1,109w; deload-week 1,120w; active-recovery 996w) + 4 upgrades (bands 1,084w; warm-up 1,086w; pre-workout 1,096w with all 2023 claims removed; TUT 1,095w).
- §2e executed: `findRelatedPosts` helper + `RelatedPosts.astro` + `AppCta.astro` wired into every post; category intro paragraphs; homepage quickReads repointed away from deleted slugs; all 11 redirects live in vercel.json.
- 11 vercel.json 301s cover every deleted URL.

### 2a. Consolidate the "top apps" cannibalization (highest-leverage content move)
Three posts split one intent. The 2024 Android/iOS post has **496 impressions @45.3** (most equity); the 2025 post is the best keeper content (broadest list, 1,012 words, 124 imp @32.1); the 2024 AI post has 58 imp @42.4.
- **Option A (recommended): fresh evergreen canonical** `/best-gamified-fitness-apps/` — refresh the 2025 post's content into an undated "Best Gamified Fitness Apps" page at a clean slug, and 301 all three dated posts into it (vercel.json redirects). Solves the dated-slug staleness permanently; all three posts' equity merges.
- Option B (zero redirect risk): keep the 2024 Android/iOS URL (496 impressions), refresh content + title to "Best Gamified Fitness Apps (2026)", 301 the other two into it.
- Either way: include Workout Quest in the list honestly, and link competitor names to comparison pages (§3).
- **Acceptance:** the canonical URL moves toward top 10 on the "gamified fitness apps" family (GSC: gamified fitness apps 75 imp @13.6, gamified fitness 70 imp @33.5, gamified workout app 114 imp @9.1 — all in striking distance).

### 2b. Prune the quest/recovery cluster
10 posts, most with zero impressions, repeating the same wearable/readiness/XP angle. Keep three survivors and merge the rest:
- Keepers: `smart-recovery-quests-wearables` (evergreen title, latest date, broadest wearable/rest/readiness intent — becomes the recovery hub), `balanced-wearable-leaderboards` (13 imp, distinct leaderboard angle), `questing-for-recovery` (21 imp, motivation angle, retitle to drop the quest framing if needed).
- Merge into the hub (or the new Active Recovery post, §2d): `readiness-micro-quests`, `readiness-community-quests`, `ethical-recovery-quests`, `rest-rally-recharge-quest`, `micro-quests-for-active-recovery`, `smart-recovery-quests-2026` (content folds in; URL 301s).
- `inclusive-leaderboards-wearable-wellness` and `story-driven-streaks-habit-quests` become sections of the leaderboard/streaks posts or 301 to the hub (both near-zero impressions; story-driven is 381 words of thin content).
- Net effect: crawl budget and link equity stop leaking into 6-8 dead URLs; survivors get the merged depth (these are the thin-content offenders).

### 2c. Pivot the routine posts to real search vocabulary
All five get zero impressions. The query language exists and is nearly free to rank for (KD 0-8):

| Current post (title) | Real query it should target | Vol | KD |
|---|---|---|---|
| best-two-day… | 2 day workout split | 30 | 0 |
| best-three-day… | 3 day workout split | 70 | 2 |
| best-four-day… | 4 day workout split | 110 | 0 |
| best-five-day… | 5 day workout split | 70 | 8 |
| best-six-day… | 6 day workout split | 140 | 4 |

Keep URLs; retitle, rewrite h1 + first H2, add "split" vocabulary and a schedule table to each. Once retitled, the five stop cannibalizing (each targets a distinct split term) — cross-link them as a series plus the new Upper/Lower hub (first internal-linking win). SERP evidence: Hevy (an app vendor like Workout Quest) holds #3 AND #18 on "upper lower split" — app sites can win these. Fallback if retitles underperform in 60 days: consolidate to a frequency hub per the content audit's keeper analysis.

### 2d. New posts that fill measured demand (write in priority order)

| New page | Vol | KD | Why / notes |
|---|---|---|---|
| Upper/Lower Split: The Complete Guide | 1300 | 8 | The single best new post. Hevy ranks #3+#18 — copy that pattern: day-by-day tables, sets/reps, 2/3/4-day variants. Link from all 5 routine posts. |
| Best Free Workout Apps (2026) | 880 | 25 | Commercial intent, product is free. Position Workout Quest among 8-10 apps honestly; SERP shows listicles (garagegymreviews, reddit) + Hevy #6 + Jefit #11 — app vendors belong. |
| What Is a Deload Week? | 480 | 0 | Practically free to rank. Fold in the recovery cluster's content. |
| Resistance Band Exercises: Full-Body Guide | 2900 | 11 | Upgrade the existing 552-word post to a real guide (exercises per muscle group, programs). |
| Pre-Workout Supplements (refresh) | 1000 | 0 | Existing post says "top choices for 2023" — refresh date + content, keep URL. |
| Warm-Up Exercises (refresh) | 1000 | 36 | Existing 743-word post; expand with sport-specific warmups to justify the KD. |
| Time Under Tension guide | 320 | 6 | Upgrade the 351-word `optimizing-rep-performance-for-hypertrophy` post. |
| Active Recovery: What Actually Works | 590 | 8 | Absorbs the merged recovery cluster content (§2b). |
| Hevy vs Strong / app alternatives | 70-1000 | 0-39 | §3 (Phase 2) — brand-intent capture. |

Also: `future-of-fitness-gamification-trends-2025` keeps its URL (284 impressions — do not 301); retitle to evergreen ("Gamification trends in fitness") and strip the year-stamped framing while keeping the slug. `hydration-and-electrolytes...` (443 words, 0 imp) and `elevate-your-workout-top-gym-accessories` (463 words, 0 imp) get one upgrade pass each or 301 to /blog — decide after the merge wave, they are the lowest priority. `mastering-muscle-growth...` becomes the "how to track progressive overload" supporting post (distinct from the 2,400/mo KD 48 head term; target the how-to long-tail).

### 2e. Internal linking + conversion (code)
- **Related-posts component** in `SinglePost.astro` (3 posts, same category/tag) — fixes the flat catalog.
- **App-download CTA component** (App Store + Play badges) at the end of every post — the site sells an app and never links to it. Also add one contextual in-body link in the top 10 posts.
- Link homepage highlights → top posts (exists), blog list → top posts, category pages → their posts with 1-2 sentence intros (categories are thin at ~650 words).
- AI-Overview hardening: FAQ schema + explicit "free / iOS+Android / offline" facts in homepage copy (the conversational queries already cite the site).

---

## 3. Phase 2 — Authority & demand capture (weeks 4-6)

Status: **content + playbook executed 2026-08-07** — 2 comparison posts live (hub-first per §6 recommendation), outreach playbook written. Build + all checks green; RSS at 29 items; 105 pages.
- `/hevy-vs-strong` (1,281 words, verified pricing/free-limits/migration via web search), `/workout-tracker-app-alternatives` (1,298 words, 7-app matrix), and `/zombies-run-alternatives` (1,293 words, verified Zombies Run state, 7-app comparison) — mutually linked, all link into the app catalog.
- `seo/link-building.md`: verified prospect table (SaaSHub claim, AlternativeTo suggest, Product Hunt refresh plan, Garage Gym Reviews contact form, niche roundup blogs), 4 copy-paste outreach drafts, linkable-asset map, factchecktool.com audit note, credit-queued steps.
- Credit-queued: `get_serp_results` prospect batches and `get_backlinks_profile` for the factchecktool audit (account at 33 credits).

1. **Comparison pages** targeting competitor brands — every one has an app-vendor or listicle precedent in the SERPs, and Reddit crowding means a clean table wins:
   - `Hevy vs Strong` (70/mo, KD 0) — direct feature/price/free-limit table, migration guide.
   - `Strong app alternative` (10, —), `Jefit alternative` (10, —), `Fitbod alternative` (10, —) — one consolidated "Workout tracker app alternatives" hub + per-brand pages; each links to Workout Quest.
   - `Zombies Run alternatives` / `Habitica for fitness` (habitica 1900/mo KD 21 informational — capture the "habitica fitness" long-tail) — gamified-adjacent, on-theme.
2. **Link earning** (the backlink profile is 43 domains of mostly rank-0):
   - Refresh/amplify the Product Hunt presence (11 links already, rank 11 — the strongest asset; a "what we shipped in 2026" launch update).
   - Outreach to the exact listicle formats that rank for "best workout apps": garagegymreviews-style roundups accept submissions; pitch the free + gamified angle.
   - Make the Upper/Lower guide and the gamification explainer the two linkable assets (data tables, printable PDFs, embeddable calculators).
   - `factchecktool.com` (23 links): audit the profile; no disavow needed at this scale, but do not chase more of that class.
3. **ASO note (out of scope for this repo)**: app-store listing keywords compound the site's work — the apple.com citations are already the 2nd-best backlink source.

---

## 4. Phase 3 — Measure & compound (weeks 6+, ongoing)

Status: **operating loop defined 2026-08-07** — deploys are on Vercel Git integration; broken Pages CI removed; rank tracker config is a UI action in the OpenSEO app (no create tool is mounted).

### Monthly operating loop (30-45 min, first week of each month)
1. **GSC review** — `mcp__openseo_get_search_console_performance`, 28-day window, `dimensions: ["query","page"]`, rowLimit 100 + paginate. Compare vs baseline (206 clicks / 5.6k impressions / month, captured 2026-08-06). Watch: striking-distance terms (position 5-20 with impressions), the gamified family (moat defense), the split terms ("4 day workout split" etc. — should appear within 60-90 days of the 2026-08-07 retitle), and the new posts (upper-lower-split-guide, best-free-workout-apps, deload-week, active-recovery).
2. **Rank tracker** — create one in the OpenSEO app (project a3b4b0be): two groups — (a) gamified moat: gamified fitness apps, gamified workout app, gamified fitness apps free, gamification fitness apps, best gamified fitness apps, gamified workout tracker; (b) split terms: 2/3/4/5/6 day workout split; (c) demand posts: upper lower split, best free workout app, deload week, active recovery. Read results monthly via `get_rank_tracker` (free).
3. **Content batch** — 2 posts/month in the three pillars (splits/routines, recovery science, gamification & app comparisons), each cross-linked per the Phase 1 pattern. Refresh year-stamped assets before the next year.
4. **Validator gate** — `yarn build && yarn validate-seo && yarn check-canonicals && yarn audit-frontmatter` on every content PR; the hardened validator now fails on long titles, out-of-band descriptions, and missing JSON-LD.
5. **Quarterly competitor analysis** — 2 of {hevyapp.com, strong.app, jefit.com, habitica.com, muscleandstrength.com, aworkoutroutine.com} via `get_domain_overview` + `get_ranked_keywords`.

### Credit budget (current: 33; top up ~500 for the quarter)
- Monthly: 1 `research_keywords` (1-3 seeds, ~96-288) per content batch + 1 `get_keyword_metrics` hydration (~100) for the striking-distance list from step 1.
- Quarterly: 2 competitor `get_domain_overview` (~100-300 each) + `get_backlinks_overview` (~50).
- Queued one-offs: `get_serp_results` prospect batches for link-building (10 queries/call), `get_backlinks_profile` for the factchecktool.com audit (23-link domain).

### Success metrics (from §5, with dates)
- 2026-09-07 (30d): GSC clicks 206 → 350+; "gamified fitness apps" family position improvement from the canonical consolidation.
- 2026-10-07 (60d): first split-term top 10; top-apps canonical ≤ pos 15.
- 2027-02 (180d): clicks 3-5x; "best free workout app" top 10; referring domains 43 → 60+.

- **Fix and extend the audit tooling**: validate-seo fails on missing JSON-LD; add a title-length check (>60) and description-length check (70-160) so regressions fail CI.
- **Monthly cadence** (2 posts/month, always cross-linked into the three pillars): splits/routines, recovery science, gamification & app comparisons. Refresh the "2026" assets before 2027.
- **OpenSEO usage** (33 credits remaining; top up for the next cycle):
  - `get_rank_tracker` on the gamified family (the moat) + the 5 split terms + "best free workout app".
  - Monthly `get_search_console_performance` striking-distance review (positions 5-20 → next content batch).
  - `keyword-research` per pillar before writing; `get_domain_keyword_suggestions` on hevyapp/strong.app/jefit quarterly.
- **Quarterly**: competitor-analysis on 2 of {hevyapp.com, strong.app, jefit.com, habitica.com, muscleandstrength.com, aworkoutroutine.com}.

---

## 5. Success metrics

| Horizon | Metric | Baseline → Target |
|---|---|---|
| 30 days | GSC clicks / month | 206 → 350+ (metadata + consolidation + split retitles) |
| 30 days | top-apps canonical position | 45 → top 15 on "gamified fitness apps" (75 imp @13.6 already) |
| 90 days | gamified family | positions 5-20 → 1-5 across 40+ terms (moat defense) |
| 90 days | first split-term top 10 | "4 day workout split" / "6 day workout split" |
| 180 days | GSC clicks / month | 3-5x (206 → 600-1000) via new posts + comparisons |
| 180 days | "best free workout app" | top 10 |
| 180 days | referring domains | 43 → 60+, with ≥10 rank>0 |

## 6. Decisions needed

1. **Top-apps URL**: keep `/top-gamified-fitness-apps-for-android-and-ios-in-2024` (recommended, zero redirect risk) vs 301 to a clean slug.
2. **Quest-cluster survivors**: my pick (4 keepers listed in §2b) — confirm before merging/deleting ~6 posts.
3. **Comparison pages**: brand-name pages ("Hevy vs Strong") vs one alternatives hub first (recommend hub first, it covers all brands with one linkable asset).

## Appendix A — GSC query evidence (top non-branded, 28 days)

Closest to ranking (position 5-20, real impressions): gamified workout app (114 imp @9.1), gamified fitness apps (75 @13.6), gamified fitness (70 @33.5), gamification fitness apps (59 @18.5), gamified exercise (45 @32.5), gamify fitness (36 @37.0), gamification fitness (31 @52.6), gamified workout (16 @12.9), fitness progress tracker (14 @42.9), quest workout (13 @3.7), gamification workout (11 @30.5), fitness quests (6 @20.2), gym quest (29 @5.7).

Already winning (position <5): workout quest (33 clicks, 26% CTR), gamified fitness apps free (6 clicks @2.1), workout quest app (6 @2.5), free gamified fitness apps (1 @2.3), free gamified workout app (2 @5.4), quest exercise (5 @3.2), quest workout (13 @3.7).

AI-Overview citations (position 1-6, conversational): "are they free", "i'm on android", "rpg game style", "free ones plz", "for weight lifting", "give me the link", "i want it free", "ios and free".

## Appendix B — Keyword opportunity matrix (US, hydrated 2026-08-07)

Top 20 by (volume × winnability): resistance band exercises 2900/KD11 · progressive overload 2400/48 · habitica 1900/21 · push pull legs routine 1300/36 · upper lower split 1300/8 · hevy app 1000/39 · pre workout supplements 1000/0 · ring fit adventure 1000/12 · warm up exercises 1000/36 · best free workout app 880/25 · fitbod 880/16 · active recovery 590/8 · jefit 590/33 · strong app 590/8 · workout tracker app 590/58 · deload week 480/0 · strength training app 480/32 · best workout tracker app 320/58 · home workout app 320/42 · time under tension 320/6.

Gamified family (defend, don't chase volume): all 10-50/mo, KD unmeasured, near-zero competition — the site's moat.

## Appendix C — Technical verification state (2026-08-06)

- Crawl 51d8a847: 50/50 pages, Lighthouse 20/20, 77 issues (30 long titles, 12 long descriptions, 11 short descriptions, 11 noindex [intentional], 10 heading-order, 2 thin, 1 double-H1).
- Built site: 108 pages, canonicals clean, sitemap 39 URLs, robots.txt correct, all pages 200, single H1 (except gamify post), alt text present, hero video lazy-loaded.
- Code gaps: JSON-LD stripped in build; no related posts; no app CTA; no rel prev/next; no RSS; og:title untemplated; publishDate bug in one post.
