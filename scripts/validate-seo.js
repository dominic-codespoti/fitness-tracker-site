const fs = require('fs');
const path = require('path');

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

function extractJsonLd(content) {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const matches = [];
  let m;
  while ((m = re.exec(content))) {
    matches.push(m[1].trim());
  }
  return matches;
}

(async () => {
  const htmlFiles = findHtmlFiles(outDir);
  if (!htmlFiles.length) {
    console.error('No built HTML files found in', outDir);
    process.exit(2);
  }

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
  }

  if (hadError) {
    console.error('\nSEO validation failed: invalid JSON-LD found.');
    process.exit(1);
  }

  console.log('SEO validation passed: all JSON-LD blocks parse as JSON.');
  process.exit(0);
})();
