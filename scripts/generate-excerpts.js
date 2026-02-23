const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const postsDir = path.join(__dirname, '..', 'src', 'content', 'post');

function readFile(file) {
  return fs.readFileSync(file, 'utf8');
}

function writeFile(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { front: null, body: content };
  const front = yaml.load(m[1]) || {};
  const body = content.slice(m[0].length);
  return { front, body };
}

function buildFrontmatter(obj) {
  return `---\n${yaml.dump(obj)}---\n\n`;
}

function stripMarkdown(md) {
  let txt = md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/#+\s*/g, '')
    .replace(/>\s*/g, '')
    .replace(/\*\*|__|\*|_/g, '')
    .replace(/\n{2,}/g, '\n\n')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return txt;
}

function generateExcerpt(text, max = 160) {
  if (!text) return '';
  const short = text.trim().slice(0, 400);
  // prefer full sentence ending
  const sentences = short.match(/[^.!?]+[.!?]?/g) || [short];
  let out = '';
  for (const s of sentences) {
    if ((out + s).length <= max) {
      out += s;
    } else {
      if (!out) out = s.slice(0, max).trim();
      break;
    }
  }
  out = out.trim();
  if (out.length > max) out = out.slice(0, max).trim();
  return out;
}

function run() {
  if (!fs.existsSync(postsDir)) {
    console.error('Posts directory not found:', postsDir);
    process.exit(2);
  }

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
  const updated = [];

  for (const file of files) {
    const full = path.join(postsDir, file);
    const content = readFile(full);
    const { front, body } = parseFrontmatter(content);
    const fm = front || {};

    const existingDesc = (fm.metadata && fm.metadata.description) || fm.description || fm.excerpt || '';
    if (existingDesc && existingDesc.trim().length >= 50) continue; // skip if good

    const plain = stripMarkdown(body);
    const firstParagraph = plain.split('\n\n')[0] || plain;
    const excerpt = generateExcerpt(firstParagraph, 160);
    if (!excerpt) continue;

    // prefer putting into top-level 'excerpt' (compatible with audit script)
    fm.excerpt = excerpt;

    const newContent = buildFrontmatter(fm) + body;
    writeFile(full, newContent);
    updated.push({ file: full, excerpt });
  }

  if (!updated.length) {
    console.log('No files required excerpts.');
    process.exit(0);
  }

  console.log('Updated files with generated excerpts:');
  updated.forEach((u) => console.log('-', u.file));
  process.exit(0);
}

run();
