import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import toIco from 'to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const svgPath = path.join(root, 'public', 'brand-icon.svg');

const svg = fs.readFileSync(svgPath);
const buf48 = await sharp(svg).resize(48, 48).png().toBuffer();
const buf32 = await sharp(svg).resize(32, 32).png().toBuffer();
const buf16 = await sharp(svg).resize(16, 16).png().toBuffer();

const ico = await toIco([buf48, buf32, buf16]);
fs.writeFileSync(path.join(root, 'public', 'favicon.ico'), ico);
console.log('Wrote public/favicon.ico');

const touch = await sharp(svg).resize(180, 180).png().toBuffer();
fs.writeFileSync(path.join(root, 'public', 'apple-touch-icon.png'), touch);
console.log('Wrote public/apple-touch-icon.png');

const pwa192 = await sharp(svg).resize(192, 192).png().toBuffer();
fs.writeFileSync(path.join(root, 'public', 'pwa-192.png'), pwa192);
console.log('Wrote public/pwa-192.png');

const pwa512 = await sharp(svg).resize(512, 512).png().toBuffer();
fs.writeFileSync(path.join(root, 'public', 'pwa-512.png'), pwa512);
console.log('Wrote public/pwa-512.png');
