import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
// png-to-ico en vez de to-ico: este último lleva años sin mantenimiento y
// arrastraba jimp, request, minimist y mkdirp, que entre los cuatro eran la
// mayor parte de las vulnerabilidades críticas del proyecto.
import pngToIco from 'png-to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');

/**
 * Dos fuentes, no una.
 *
 * `brand-icon.svg` trae el azulejo con esquinas redondeadas y sirve para la
 * interfaz y el favicon. `brand-icon-square.svg` va a sangre y alimenta los
 * iconos que el sistema operativo enmascara por su cuenta: iOS compone sobre
 * negro cualquier esquina transparente del apple-touch-icon, y Android
 * recorta los iconos PWA con su propia forma.
 */
const rounded = fs.readFileSync(path.join(publicDir, 'brand-icon.svg'));
const square = fs.readFileSync(path.join(publicDir, 'brand-icon-square.svg'));

const render = (svg, size) => sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();

const write = (name, buffer) => {
  fs.writeFileSync(path.join(publicDir, name), buffer);
  console.log(`Wrote public/${name}`);
};

// Favicon: tres tamaños en un solo .ico, desde la variante redondeada.
const ico = await pngToIco([
  await render(rounded, 16),
  await render(rounded, 32),
  await render(rounded, 48),
]);
write('favicon.ico', ico);

write('apple-touch-icon.png', await render(square, 180));
write('pwa-192.png', await render(square, 192));
write('pwa-512.png', await render(square, 512));
