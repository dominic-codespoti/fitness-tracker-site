const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const outDir = path.join(__dirname, '..', '.vercel', 'output', 'static');

function findHtmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) return findHtmlFiles(full);
    if (d.isFile() && d.name.endsWith('.html')) return [full];
    return [];
  });
}

function extractCanonical(content) {
  const re = /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i;
  const m = re.exec(content);
  return m ? m[1] : null;
}

function mapCanonicalToLocal(href) {
  try {
    let pathname = null;
    if (/^https?:\/\//i.test(href)) {
      const url = new URL(href);
      pathname = decodeURIComponent(url.pathname || '/');
    } else if (href && href.startsWith('/')) {
      pathname = decodeURIComponent(href);
    } else {
      return null;
    }

    if (pathname === '/' || pathname === '') return path.join(outDir, 'index.html');
    if (path.extname(pathname)) return path.join(outDir, pathname.replace(/^\//, ''));
    return path.join(outDir, pathname.replace(/^\//, ''), 'index.html');
  } catch (err) {
    return null;
  }
}

(function main() {
  const htmlFiles = findHtmlFiles(outDir);
  if (!htmlFiles.length) {
    console.error('No built HTML files found in', outDir);
    process.exit(2);
  }

  const missing = [];

  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const canonical = extractCanonical(content);
    if (!canonical) continue;
    const mapped = mapCanonicalToLocal(canonical);
    if (!mapped || !fs.existsSync(mapped)) {
      missing.push({ file, canonical, mapped });
    }
  }

  if (missing.length) {
    console.error('Found canonical links that map to missing built pages:');
    missing.forEach((m) => {
      console.error('- Source:', m.file);
      console.error('  Canonical:', m.canonical);
      console.error('  Mapped local file:', m.mapped || 'invalid URL');
    });
    process.exit(1);
  }

  console.log('All canonical links map to existing built pages.');
  process.exit(0);
})();
