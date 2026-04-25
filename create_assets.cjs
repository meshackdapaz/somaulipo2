const sharp = require('sharp');

const iconSvg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#000000" />
  <text x="512" y="750" font-family="Arial, sans-serif" font-weight="900" font-size="800" fill="#ffffff" text-anchor="middle">S</text>
</svg>`;

const splashSvg = `<svg width="2732" height="2732" xmlns="http://www.w3.org/2000/svg">
  <rect width="2732" height="2732" fill="#000000" />
  <text x="1366" y="1650" font-family="Arial, sans-serif" font-weight="900" font-size="1000" fill="#ffffff" text-anchor="middle">S</text>
</svg>`;

async function generate() {
  try {
    await sharp(Buffer.from(iconSvg)).png().toFile('assets/icon.png');
    await sharp(Buffer.from(splashSvg)).png().toFile('assets/splash.png');
    console.log('Images generated successfully!');
  } catch (error) {
    console.error('Failed to generate images:', error);
  }
}

generate();
