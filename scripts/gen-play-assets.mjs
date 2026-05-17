import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const OUT = 'C:/Users/Munir Yusuf/Desktop/play-listing';
fs.mkdirSync(OUT, { recursive: true });

const BRAND = '#0a2540';
const ACCENT = '#1e88ff';
const ICON_SRC = 'public/icons/icon-512.png';

// 1) App icon — flatten transparent icon onto solid brand background
async function buildAppIcon() {
  const out = path.join(OUT, 'app-icon-512.png');
  // Composite the icon centred on a solid brand square
  const bg = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 3,
      background: BRAND,
    },
  })
    .composite([{ input: ICON_SRC, gravity: 'center' }])
    .png()
    .toFile(out);
  console.log('App icon:', out, bg.size, 'bytes');
}

// 2) Feature graphic — 1024x500 banner
async function buildFeatureGraphic() {
  const W = 1024, H = 500;
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BRAND}"/>
      <stop offset="100%" stop-color="#0f3a6b"/>
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="30%" r="60%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- Decorative road lines -->
  <g opacity="0.12" stroke="#ffffff" stroke-width="2">
    <line x1="0"  y1="450" x2="1024" y2="450"/>
    <line x1="0"  y1="470" x2="1024" y2="470" stroke-dasharray="20 16"/>
  </g>

  <!-- Logo / wordmark -->
  <g transform="translate(70,140)">
    <circle cx="40" cy="40" r="40" fill="${ACCENT}"/>
    <text x="40" y="54" font-family="Inter, Arial, sans-serif" font-size="36" font-weight="800"
          fill="#ffffff" text-anchor="middle">RS</text>
  </g>

  <!-- Headline -->
  <text x="180" y="180" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="800" fill="#ffffff">
    One App
  </text>
  <text x="180" y="240" font-family="Inter, Arial, sans-serif" font-size="32" font-weight="600" fill="#cfe2ff">
    Book a ride. Pay with your wallet.
  </text>
  <text x="180" y="290" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="400" fill="#9fb6d6">
    Trusted drivers · Live tracking · Secure payments
  </text>

  <!-- Pin / map illustration on the right -->
  <g transform="translate(820,150)" opacity="0.95">
    <circle cx="60" cy="60" r="100" fill="#ffffff" opacity="0.06"/>
    <circle cx="60" cy="60" r="70"  fill="#ffffff" opacity="0.08"/>
    <path d="M60 10 C30 10 12 32 12 60 C12 100 60 150 60 150 C60 150 108 100 108 60 C108 32 90 10 60 10 Z"
          fill="${ACCENT}"/>
    <circle cx="60" cy="58" r="20" fill="#ffffff"/>
  </g>
</svg>`;
  const out = path.join(OUT, 'feature-graphic-1024x500.png');
  await sharp(Buffer.from(svg)).png().toFile(out);
  console.log('Feature graphic:', out);
}

await buildAppIcon();
await buildFeatureGraphic();
console.log('\nDone. Files in:', OUT);
