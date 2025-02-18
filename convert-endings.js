import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// Get all TypeScript and TSX files
const files = execSync('git ls-files "*.ts" "*.tsx"', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const converted = content.replace(/\r\n/g, '\n');
  writeFileSync(file, converted);
  console.log(`Converted ${file}`);
}
