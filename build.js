const fs = require('node:fs');
const path = require('node:path');

const source = path.join(__dirname, 'byteneza-website-seo');
const output = path.join(__dirname, 'dist');

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
  if (entry.name === 'api' || entry.name === 'README.md' || entry.name === '.gitignore' || entry.name.startsWith('.env')) continue;
  fs.cpSync(path.join(source, entry.name), path.join(output, entry.name), { recursive: true });
}

console.log('Built static site into dist/');
