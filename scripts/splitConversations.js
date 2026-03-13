import fs from 'fs';
import path from 'path';

const srcFile = 'data/conversations.json';
const destDir = 'data/conversations';

const data = JSON.parse(fs.readFileSync(srcFile, 'utf8'));

// Split banter
fs.writeFileSync(path.join(destDir, 'banter.json'), JSON.stringify(data.banter, null, 2) + "\n");

// Split reactions
fs.writeFileSync(path.join(destDir, 'reactions.json'), JSON.stringify(data.reactions, null, 2) + "\n");

// Split connectives
fs.writeFileSync(path.join(destDir, 'grampsConnectives.json'), JSON.stringify(data.grampsConnectives, null, 2) + "\n");

console.log('Conversations split successfully.');