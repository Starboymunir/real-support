import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const src = path.join(root, 'public', 'images', 'brand', 'logo.png');
const iconsDir = path.join(root, 'public', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

const PRIMARY = '#0a2540';   // RS deep navy (matches site)
const ACCENT  = '#facc15';   // taxi yellow
const BG      = '#ffffff';

async function makeIcon(size, opts) {
  const inner = Math.round(size * (opts.maskable ? 0.62 : 0.78));
  const logoBuf = await sharp(src)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const bgSvg = Buffer.from(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g" cx="50%" cy="40%" r="75%">
          <stop offset="0%" stop-color="#13345f"/>
          <stop offset="100%" stop-color="${PRIMARY}"/>
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
    </svg>`);
  const outFile = opts.absPath || path.join(iconsDir, opts.name);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  await sharp(bgSvg)
    .composite([{ input: logoBuf, gravity: 'center' }])
    .png()
    .toFile(outFile);
  console.log('✓', outFile, size + 'x' + size);
}

async function makePlayStoreIcon() {
  const out = path.join(root, '..', 'play-store-rs-ride');
  fs.mkdirSync(out, { recursive: true });
  await makeIcon(512, { name: 'app-icon-512.png', absPath: path.join(out, 'app-icon-512.png') });

  // Feature graphic 1024x500
  const fgW = 1024, fgH = 500;
  const logoFG = await sharp(src)
    .resize(360, 360, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const fgSvg = Buffer.from(`
    <svg width="${fgW}" height="${fgH}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0a2540"/>
          <stop offset="60%" stop-color="#13345f"/>
          <stop offset="100%" stop-color="#0a2540"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <g opacity="0.08" stroke="#ffffff" stroke-width="3">
        <line x1="-20" y1="${fgH-40}" x2="${fgW+20}" y2="${fgH-40}"/>
        <line x1="-20" y1="${fgH-70}" x2="${fgW+20}" y2="${fgH-70}" stroke-dasharray="20 18"/>
      </g>
      <text x="460" y="190" font-family="Inter, Arial, sans-serif" font-size="80" font-weight="800" fill="#ffffff" letter-spacing="-1">One App</text>
      <text x="460" y="250" font-family="Inter, Arial, sans-serif" font-size="32" font-weight="600" fill="${ACCENT}">Local taxi rides in seconds</text>
      <text x="460" y="305" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="400" fill="#ffffff" opacity="0.85">Background-checked drivers,</text>
      <text x="460" y="338" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="400" fill="#ffffff" opacity="0.85">real-time tracking, secure payments.</text>
      <rect x="460" y="385" width="240" height="44" rx="22" fill="${ACCENT}"/>
      <text x="580" y="415" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" fill="#0a2540">real-support.co.uk</text>
    </svg>`);
  await sharp(fgSvg)
    .composite([{ input: logoFG, left: 50, top: Math.round((fgH - 360) / 2) }])
    .png()
    .toFile(path.join(root, '..', 'play-store-rs-ride', 'feature-graphic-1024x500.png'));
  console.log('✓ feature-graphic-1024x500.png');
}

async function main() {
  await makeIcon(192, { name: 'icon-192.png' });
  await makeIcon(512, { name: 'icon-512.png' });
  await makeIcon(512, { name: 'icon-maskable-512.png', maskable: true });
  await makePlayStoreIcon();

  // Manifest
  const manifest = {
    name: 'One App',
    short_name: 'One App',
    description: 'One App – local taxi service. Background-checked drivers, real-time tracking, secure payments.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: BG,
    theme_color: PRIMARY,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ],
  };
  fs.writeFileSync(path.join(root, 'public', 'manifest.webmanifest'), JSON.stringify(manifest, null, 2));
  console.log('✓ manifest.webmanifest');
}

main().catch((e) => { console.error(e); process.exit(1); });
