const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const outDir = path.join(__dirname, '..', '.vercel', 'output', 'static');
const configPath = path.join(__dirname, '..', 'src', 'config.yaml');

function findHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) return findHtmlFiles(full);
    if (d.isFile() && d.name.endsWith('.html')) return [full];
    return [];
  });
}

function extractJsonLd(content) {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const matches = [];
  let m;
  while ((m = re.exec(content))) {
    matches.push(m[1].trim());
  }
  return matches;
}

function hasBreadcrumbSchema(content) {
  return extractJsonLd(content).some((block) => block.includes('"@type":"BreadcrumbList"'));
}

function loadSiteUrl() {
  try {
    const cfg = yaml.load(fs.readFileSync(configPath, 'utf8'));
    return cfg.site && cfg.site.site ? cfg.site.site.replace(/\/+$/, '') : null;
  } catch (_err) {
    return null;
  }
}

function extractMeta(content, attr, value) {
  const re = new RegExp(`<meta[^>]*${attr}=["']${value}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i');
  const m = re.exec(content);
  return m ? m[1] : null;
}

function extractCanonicals(content) {
  const re = /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  const matches = [];
  let m;
  while ((m = re.exec(content))) {
    matches.push(m[1]);
  }
  return matches;
}

function deriveUrlFromFile(siteUrl, file) {
  const rel = path.relative(outDir, file).replace(/\\/g, '/');
  if (rel === 'index.html') return siteUrl;
  if (rel.endsWith('/index.html')) return `${siteUrl}/${rel.replace(/index\.html$/, '').replace(/\/$/, '')}`;
  if (rel.endsWith('.html')) return `${siteUrl}/${rel.replace(/\.html$/, '')}`;
  return `${siteUrl}/${rel}`;
}

function extractSitemapUrls(content) {
  return Array.from(content.matchAll(/<loc>([^<]+)<\/loc>/g)).map((match) => match[1].replace(/\/+$/, ''));
}

function normalizeRelativePath(file) {
  return path.relative(outDir, file).replace(/\\/g, '/');
}

(async () => {
  const siteUrl = loadSiteUrl();
  const htmlFiles = findHtmlFiles(outDir);
  if (!htmlFiles.length) {
    console.error('No built HTML files found in', outDir);
    process.exit(2);
  }
  if (!siteUrl) {
    console.error('Could not read site URL from src/config.yaml');
    process.exit(2);
  }

  const sitemapFile = path.join(outDir, 'sitemap-0.xml');
  const sitemapUrls = fs.existsSync(sitemapFile)
    ? new Set(extractSitemapUrls(fs.readFileSync(sitemapFile, 'utf8')))
    : new Set();

  let hadError = false;

  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const jsonLdBlocks = extractJsonLd(content);
    for (const block of jsonLdBlocks) {
      try {
        JSON.parse(block.replace(/^{\s*\{\s*JSON.stringify\(/, '{'));
      } catch (err) {
        console.error(`JSON-LD parse error in ${file}:`, err.message);
        hadError = true;
      }
    }

    const canonicalTags = extractCanonicals(content);
    if (canonicalTags.length > 1) {
      console.error(`Duplicate canonical tags found in ${file}`);
      hadError = true;
    }

    const canonical = canonicalTags[0] || null;
    const robots = (extractMeta(content, 'name', 'robots') || '').toLowerCase();
    const ogImage = extractMeta(content, 'property', 'og:image');
    const ogUrl = extractMeta(content, 'property', 'og:url');
    const relativePath = normalizeRelativePath(file);
    const is404 = relativePath === '404.html';
    const isNoindex = robots.includes('noindex');
    const builtUrl = deriveUrlFromFile(siteUrl, file).replace(/\/+$/, '');
    const isTagPage = relativePath.startsWith('tag/');
    const isCategoryPage = relativePath.startsWith('category/');
    const isFirstCategoryPage = isCategoryPage && /^category\/[^/]+\/index\.html$/.test(relativePath);
    const isBlogPage = relativePath.startsWith('blog/');
    const hasArticleSchema = jsonLdBlocks.some((block) => block.includes('"@type":"Article"'));
    const requiresBreadcrumbs = isBlogPage || isCategoryPage || isTagPage || hasArticleSchema;

    if (!is404 && !isNoindex && !canonical) {
      console.error(`Missing canonical tag on indexable page: ${file}`);
      hadError = true;
    }

    if (ogImage !== null && !ogImage.trim()) {
      console.error(`Empty og:image content in ${file}`);
      hadError = true;
    }

    if (ogUrl !== null && !/^https?:\/\//i.test(ogUrl)) {
      console.error(`Non-absolute og:url in ${file}: ${ogUrl}`);
      hadError = true;
    }

    if (is404 && canonical) {
      console.error(`404 page should not emit a canonical tag: ${file}`);
      hadError = true;
    }

    if (isNoindex && sitemapUrls.has(builtUrl)) {
      console.error(`Noindex page leaked into sitemap: ${file} -> ${builtUrl}`);
      hadError = true;
    }

    if (isTagPage && !isNoindex) {
      console.error(`Tag archive should be noindex: ${file}`);
      hadError = true;
    }

    if (isTagPage && sitemapUrls.has(builtUrl)) {
      console.error(`Tag archive should not appear in sitemap: ${file} -> ${builtUrl}`);
      hadError = true;
    }

    if (isFirstCategoryPage && isNoindex) {
      console.error(`Primary category archive should remain indexable: ${file}`);
      hadError = true;
    }

    if (requiresBreadcrumbs && !hasBreadcrumbSchema(content)) {
      console.error(`Missing BreadcrumbList schema on key route: ${file}`);
      hadError = true;
    }
  }

  if (hadError) {
    console.error('\nSEO validation failed.');
    process.exit(1);
  }

  console.log('SEO validation passed: JSON-LD, canonicals, OG tags, and sitemap/indexability checks succeeded.');
  process.exit(0);
})();
