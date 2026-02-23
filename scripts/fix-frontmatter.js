const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '..', 'src', 'content', 'post');

function findFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
}

function fixFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  // find all frontmatter blocks using CRLF-tolerant regex
  const fmRegex = /---\r?\n([\s\S]*?)\r?\n---/g;
  let match;
  const blocks = [];
  let lastIndex = 0;
  while ((match = fmRegex.exec(raw)) !== null) {
    blocks.push(match[1]);
    lastIndex = fmRegex.lastIndex;
    // prevent infinite loops
    if (fmRegex.lastIndex >= raw.length) break;
  }

  if (blocks.length <= 1) return false; // nothing to fix

  // take the last block as canonical frontmatter
  const goodFrontmatter = blocks[blocks.length - 1];
  const body = raw.slice(lastIndex);

  const newFile = `---\n${goodFrontmatter}\n---\n\n${body}`;
  fs.writeFileSync(filePath, newFile, 'utf8');
  return true;
}

function run() {
  if (!fs.existsSync(postsDir)) {
    console.error('Posts directory not found:', postsDir);
    process.exit(2);
  }

  const files = findFiles(postsDir);
  const fixed = [];
  for (const f of files) {
    const full = path.join(postsDir, f);
    const did = fixFile(full);
    if (did) fixed.push(full);
  }

  if (!fixed.length) {
    console.log('No malformed frontmatter found.');
    process.exit(0);
  }

  console.log('Fixed frontmatter for files:');
  fixed.forEach((f) => console.log('-', f));
  process.exit(0);
}

run();
