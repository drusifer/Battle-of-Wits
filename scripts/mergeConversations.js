import fs from 'fs';
import path from 'path';

const destFile = 'data/conversations.json';
const srcDir = 'data/conversations';
const reactionsDir = path.join(srcDir, 'reactions');

const banter = JSON.parse(fs.readFileSync(path.join(srcDir, 'banter.json'), 'utf8'));
const grampsConnectives = JSON.parse(fs.readFileSync(path.join(srcDir, 'grampsConnectives.json'), 'utf8'));

const reactions = {};
const reactionFiles = fs.readdirSync(reactionsDir).filter(f => f.endsWith('.json'));

for (const file of reactionFiles) {
  const charName = path.basename(file, '.json');
  reactions[charName] = JSON.parse(fs.readFileSync(path.join(reactionsDir, file), 'utf8'));
}

const mergedData = {
  banter,
  reactions,
  grampsConnectives
};

fs.writeFileSync(destFile, JSON.stringify(mergedData, null, 2) + "\n");
console.log(`Successfully merged conversation files into ${destFile}`);
