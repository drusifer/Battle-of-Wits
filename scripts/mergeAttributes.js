import fs from 'fs';
import path from 'path';

const attrDir = './data/attributes';
const outputFile = './data/attributes.json';

const merged = {};
const files = fs.readdirSync(attrDir).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const catName = path.basename(file, '.json');
  const filePath = path.join(attrDir, file);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  merged[catName] = content;
});

fs.writeFileSync(outputFile, JSON.stringify(merged, null, 2));
console.log(`Successfully merged ${files.length} categories into ${outputFile}`);
