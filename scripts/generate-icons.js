const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const inputPath = path.join(__dirname, '..', 'public', 'logo_eatreal_transparent.png');
  const outputDir = path.join(__dirname, '..', 'public');

  try {
    // Générer l'icône 192x192
    await sharp(inputPath)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(outputDir, 'icon-192x192.png'));
    
    console.log('✅ Icon 192x192 generated');

    // Générer l'icône 512x512
    await sharp(inputPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(outputDir, 'icon-512x512.png'));
    
    console.log('✅ Icon 512x512 generated');

    console.log('\n🎉 All icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

