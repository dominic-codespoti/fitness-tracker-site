# AGENTS.md

## Reality Check
- This repo is an Astro 3 static marketing/content site for Workout Quest. The `README.md` is describing the React Native product being marketed, not this repository's implementation details.
- Trust `package.json`, `astro.config.mjs`, and `src/` for how this repo is built and run.
- CI deploys GitHub Pages with `npm run build` on Node 20 (`.github/workflows/deploy.yml`), but the repo tracks `yarn.lock` and ignores `package-lock.json` / `pnpm-lock.yaml`. Prefer `yarn` locally unless you need to match CI exactly.
- Minimum supported Node version is `>=18.14.1` (`package.json`).

## Commands
- Dev server: `yarn dev`
- Production build: `yarn build`
- Lint: `yarn lint:eslint`
- Format: `yarn format`
- SEO/build checks: `yarn validate-seo`, `yarn check-canonicals`, `yarn audit-frontmatter`
- Content helpers that modify posts in place: `yarn generate-excerpts`; `node scripts/fix-frontmatter.js`
- If you need a focused verification pass for content/SEO changes, use:
  `yarn build && yarn validate-seo && yarn check-canonicals && yarn audit-frontmatter`

## Build Output Gotchas
- The custom SEO scripts read built HTML from `.vercel/output/static`, not from `dist/` and not from source files.
- Run `yarn build` before `validate-seo`, `check-canonicals`, or `regen-sitemap`, otherwise they fail with "No built HTML files found".
- `scripts/generate-sitemap.js` writes sitemap files directly into `.vercel/output/static`.
- `src/utils/tasks.mjs` patches the built `robots.txt` after Astro build to append/update the sitemap URL. Edit `public/robots.txt` as the source of truth, not the built file.

## Config That Drives Routing/SEO
- Site-wide metadata, canonical base URL, trailing slash behavior, analytics, and blog settings all come from `src/config.yaml`, loaded through `src/utils/config.ts`.
- `astro.config.mjs` uses `SITE.site`, `SITE.base`, and `SITE.trailingSlash` from that YAML. If URLs or canonical behavior change, update `src/config.yaml` first.
- The `~/*` import alias points to `src/*` (`tsconfig.json`, `astro.config.mjs`).

## Content Model
- Blog content lives in `src/content/post/*.mdx`; schema is enforced in `src/content/config.ts`.
- Posts are loaded through `src/utils/blog.ts`; drafts are excluded there.
- Blog list routes live under `src/pages/[...blog]/`, but individual post URLs currently come from `apps.blog.post.permalink` in `src/config.yaml`, which is set to `/%slug%`. Do not assume posts live under `/blog/...`.
- `audit-frontmatter.js` expects canonical URLs to match `https://site/<slug>` for posts and flags descriptions shorter than 50 chars.
- `generate-excerpts.js` writes a top-level `excerpt` into post frontmatter when metadata/description is too short.

## Key Entry Points
- Home page: `src/pages/index.astro`
- Shared page shell: `src/layouts/PageLayout.astro` -> `src/layouts/Layout.astro`
- Header/footer nav links: `src/navigation.js`
- Blog routing and pagination: `src/utils/blog.ts` plus `src/pages/[...blog]/...`

## Style Constraints Worth Remembering
- Formatting is Prettier with `singleQuote: true`, semicolons, and `printWidth: 120` (`.prettierrc.js`).
- ESLint covers `.astro`, `.ts`, and `.js`; TypeScript unused args prefixed with `_` are intentionally ignored (`.eslintrc.js`).

## OpenSEO (SEO Research)
- OpenSEO MCP is configured in `.omp/mcp.json` (`openseo`, streamable HTTP at `https://app.openseo.so/mcp`). It requires OAuth: run `/mcp reload` then `/mcp reauth openseo` (or restart the session) and sign in once. Tools mount as `mcp__openseo_*` (e.g. `research_keywords`, `get_keyword_metrics`, `get_serp_results`, `list_projects`).
- SEO workflow skills live in `.agents/skills/` (8 skills: `seo-project-setup`, `seo-coach`, `seo-audit`, `keyword-research`, `keyword-clustering`, `competitive-landscape`, `competitor-analysis`, `link-prospecting`). Read them via `skill://<name>`; they complement the local `yarn validate-seo` scripts, which only check built HTML.
- Reinstall/update skills with `npx skills add every-app/open-seo -s '*' -a agents -y --copy` from the repo root.
