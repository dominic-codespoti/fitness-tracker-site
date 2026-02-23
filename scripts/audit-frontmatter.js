const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const postsDir = path.join(__dirname, '..', 'src', 'content', 'post');
const configPath = path.join(__dirname, '..', 'src', 'config.yaml');

function loadSiteUrl() {
  try {
    const cfg = yaml.load(fs.readFileSync(configPath, 'utf8'));
    return cfg.site && cfg.site.site ? cfg.site.site.replace(/\/+$/, '') : null;
  } catch (err) {
    return null;
  }
}

function readFrontmatter(file) {
  const content = fs.readFileSync(file, 'utf8');
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  try {
    return yaml.load(m[1]);
  } catch (err) {
    return null;
  }
}

function run() {
  const siteUrl = loadSiteUrl();
  if (!siteUrl) {
    console.error('Could not read site URL from config');
    process.exit(2);
  }

  if (!fs.existsSync(postsDir)) {
    console.error('No posts dir found at', postsDir);
    process.exit(2);
  }

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
  const results = [];

  for (const file of files) {
    const full = path.join(postsDir, file);
    const fm = readFrontmatter(full) || {};
    const slug = path.basename(file).replace(/\.mdx?$|\.md?$/, '');
    const expectedCanonical = `${siteUrl}/${slug}`;

    // canonical may be at top-level 'canonical' or under 'metadata.canonical'
    let canonical = fm.canonical || (fm.metadata && fm.metadata.canonical) || null;
    if (canonical && typeof canonical !== 'string') canonical = String(canonical);

    // description/excerpt preference: metadata.description -> excerpt -> undefined
    const description = (fm.metadata && fm.metadata.description) || fm.description || fm.excerpt || '';

    const issues = [];
    if (canonical && canonical.replace(/\/+$/, '') !== expectedCanonical.replace(/\/+$/, '')) {
      issues.push({ type: 'canonical_mismatch', expected: expectedCanonical, found: canonical });
    }
    if (!description || description.trim().length < 50) {
      issues.push({ type: 'short_description', length: (description || '').trim().length });
    }

    if (issues.length) {
      results.push({ file: full, slug, issues, title: fm.title || '' });
    }
  }

  if (!results.length) {
    console.log('No frontmatter issues found.');
    process.exit(0);
  }

  console.log('Frontmatter issues found:');
  for (const r of results) {
    console.log(`\n- ${path.relative(process.cwd(), r.file)} (${r.title || r.slug})`);
    for (const issue of r.issues) {
      if (issue.type === 'canonical_mismatch') {
        console.log(`  * canonical_mismatch: expected=${issue.expected} found=${issue.found}`);
      } else if (issue.type === 'short_description') {
        console.log(`  * short_description: length=${issue.length} (recommended >=50)`);
      } else {
        console.log('  *', issue);
      }
    }
  }

  process.exit(1);
}

run();
