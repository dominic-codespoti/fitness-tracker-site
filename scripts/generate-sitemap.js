const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const projectRoot = path.join(__dirname, '..');
const outDir = path.join(projectRoot, '.vercel', 'output', 'static');
const configPath = path.join(projectRoot, 'src', 'config.yaml');

function loadSiteUrl() {
  try {
    const cfg = yaml.load(fs.readFileSync(configPath, 'utf8'));
    return cfg.site && cfg.site.site ? cfg.site.site.replace(/\/+$/, '') : null;
  } catch (err) {
    return null;
  }
}

function findHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) return findHtmlFiles(full);
    if (d.isFile() && d.name.endsWith('.html')) return [full];
    return [];
  });
}

function extractRobots(content) {
  const re = /<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i;
  const m = re.exec(content);
  return m ? m[1].toLowerCase() : null;
}

function extractCanonical(content) {
  const re = /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i;
  const m = re.exec(content);
  return m ? m[1] : null;
}

function deriveUrlFromFile(siteUrl, file) {
  const rel = path.relative(outDir, file).replace(/\\/g, '/');
  if (rel === 'index.html') return siteUrl + '/';
  if (rel.endsWith('/index.html')) return siteUrl + '/' + rel.replace(/index.html$/, '').replace(/\/\/$/, '');
  if (rel.endsWith('.html')) return siteUrl + '/' + rel.replace(/\.html$/, '');
  return siteUrl + '/' + rel;
}

function buildSitemap(urls) {
  const header = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const urlsetClose = '</urlset>';
  const body = urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n');
  return header + urlsetOpen + body + '\n' + urlsetClose;
}

(function main() {
  const siteUrl = loadSiteUrl();
  if (!siteUrl) {
    console.error('Could not read site URL from src/config.yaml');
    process.exit(2);
  }

  const htmlFiles = findHtmlFiles(outDir);
  const urls = [];

  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const robots = extractRobots(content);
    if (robots && robots.includes('noindex')) continue;
    const canonical = extractCanonical(content);
    if (canonical) {
      // prefer canonical when absolute or root-relative
      if (/^https?:\/\//i.test(canonical)) {
        urls.push(canonical.replace(/\/+$/, ''));
        continue;
      }
      if (canonical.startsWith('/')) {
        urls.push(siteUrl.replace(/\/+$/, '') + canonical.replace(/\/+$/, ''));
        continue;
      }
    }
    // fallback: derive from file path
    urls.push(deriveUrlFromFile(siteUrl, file).replace(/\/+$/, ''));
  }

  const unique = Array.from(new Set(urls));
  const sitemap = buildSitemap(unique);

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'sitemap-0.xml'), sitemap, 'utf8');
  fs.writeFileSync(path.join(outDir, 'sitemap-index.xml'), `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${siteUrl}/sitemap-0.xml</loc></sitemap></sitemapindex>`, 'utf8');

  console.log('Regenerated sitemap excluding noindex pages.');
})();
