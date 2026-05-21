import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const OUT = 'C:/Users/Munir Yusuf/Desktop/rs-ride-app-store';
fs.mkdirSync(OUT, { recursive: true });

const LOGO_SRC = 'public/images/brand/logo.png';

const BLUE = '#1976D2';
const GREEN = '#7CB342';
const WHITE = '#FFFFFF';

const COVERS = [
  { name: 'rs-ride-cover-1242x2688.png', width: 1242, height: 2688, orientation: 'portrait' },
  { name: 'rs-ride-cover-2688x1242.png', width: 2688, height: 1242, orientation: 'landscape' },
  { name: 'rs-ride-cover-1284x2778.png', width: 1284, height: 2778, orientation: 'portrait' },
  { name: 'rs-ride-cover-2778x1284.png', width: 2778, height: 1284, orientation: 'landscape' },
];

function buildSvg({ width, height, orientation, logoSize, wordmarkY, taglineY, wordmarkPx, taglinePx }) {
  const gradient = orientation === 'portrait'
    ? `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
         <stop offset="0%" stop-color="${BLUE}"/>
         <stop offset="100%" stop-color="${GREEN}"/>
       </linearGradient>`
    : `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
         <stop offset="0%" stop-color="${BLUE}"/>
         <stop offset="100%" stop-color="${GREEN}"/>
       </linearGradient>`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    ${gradient}
    <radialGradient id="glow" cx="50%" cy="35%" r="55%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="textShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
      <feOffset dx="0" dy="3" result="offsetblur"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.45"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>

  <text x="${width / 2}" y="${wordmarkY}" text-anchor="middle"
        font-family="Inter, Arial, Helvetica, sans-serif" font-size="${wordmarkPx}" font-weight="800"
        fill="${WHITE}" filter="url(#textShadow)">RS Ride</text>

  <text x="${width / 2}" y="${taglineY}" text-anchor="middle"
        font-family="Inter, Arial, Helvetica, sans-serif" font-size="${taglinePx}" font-weight="500"
        fill="${WHITE}" fill-opacity="0.85" letter-spacing="2">Your Ride. Your Way.</text>
</svg>`;
}

async function buildCover(spec) {
  const { name, width, height, orientation } = spec;
  const short = Math.min(width, height);
  const logoSize = Math.round(short * 0.35);

  // Layout
  let logoTop, wordmarkY, taglineY, wordmarkPx, taglinePx;
  if (orientation === 'portrait') {
    logoTop = Math.round(height * 0.18);
    wordmarkPx = Math.round(short * 0.10);              // ~124px on 1242, ~128px on 1284
    taglinePx = Math.round(short * 0.045);              // ~56px / ~58px
    wordmarkY = logoTop + logoSize + Math.round(wordmarkPx * 1.4);
    taglineY = wordmarkY + Math.round(wordmarkPx * 0.9);
  } else {
    // landscape: logo centered vertically, text below
    wordmarkPx = Math.round(short * 0.085);             // ~106px / ~109px
    taglinePx = Math.round(short * 0.04);               // ~50px / ~51px
    const blockHeight = logoSize + Math.round(wordmarkPx * 1.4) + Math.round(wordmarkPx * 0.9);
    logoTop = Math.round((height - blockHeight) / 2);
    wordmarkY = logoTop + logoSize + Math.round(wordmarkPx * 1.4);
    taglineY = wordmarkY + Math.round(wordmarkPx * 0.9);
  }

  const svg = buildSvg({ width, height, orientation, logoSize, wordmarkY, taglineY, wordmarkPx, taglinePx });
  const bg = await sharp(Buffer.from(svg)).png().toBuffer();

  // Prepare resized logo
  const logo = await sharp(LOGO_SRC).resize({ width: logoSize, height: logoSize, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();

  // Soft drop shadow: blur a dark silhouette of the logo and place it slightly offset
  const shadowSilhouette = await sharp(LOGO_SRC)
    .resize({ width: logoSize, height: logoSize, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${logoSize}" height="${logoSize}"><rect width="${logoSize}" height="${logoSize}" fill="#000000"/></svg>`), blend: 'in' }])
    .blur(20)
    .png()
    .toBuffer();

  const logoLeft = Math.round((width - logoSize) / 2);

  const out = path.join(OUT, name);
  await sharp(bg)
    .composite([
      { input: shadowSilhouette, top: logoTop + 16, left: logoLeft },
      { input: logo, top: logoTop, left: logoLeft },
    ])
    .png()
    .toFile(out);

  const meta = await sharp(out).metadata();
  console.log(`✓ ${name}  ${meta.width}x${meta.height}`);
}

for (const spec of COVERS) {
  await buildCover(spec);
}
console.log('\nDone. Files in:', OUT);
