import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const parts = [
  'part01.txt',
  'part02.txt',
  'part02b.txt',
  'part03.txt',
  'part04.txt',
  'part05.txt',
  'part06.txt',
  'part07.txt',
  'part08.txt',
];

const chunkDir = join(process.cwd(), 'assets', 'crest-chunks');
const base64 = (await Promise.all(parts.map((part) => readFile(join(chunkDir, part), 'utf8')))).join('');
const outputDir = join(process.cwd(), 'public');
await mkdir(outputDir, { recursive: true });
await writeFile(join(outputDir, 'ultimate-wrenchworks-crest.png'), Buffer.from(base64, 'base64'));
console.log('Built Ultimate Wrenchworks crest:', Buffer.from(base64, 'base64').length, 'bytes');
