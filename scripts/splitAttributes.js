import fs from 'fs';
import path from 'path';

const inputFile = './data/attributes.json';
const outputDir = './data/attributes';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

for (const [category, variants] of Object.entries(data)) {
  const filePath = path.join(outputDir, `${category}.json`);
  fs.writeFileSync(filePath, JSON.stringify(variants, null, 2));
  console.log(`Created ${filePath}`);
}
