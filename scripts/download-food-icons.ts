const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Ingredients mapping with direct download URLs
// These are placeholder URLs - replace with actual Flaticon/Icons8 direct links
const ingredientUrls: Record<string, string> = {
  // Icons8 direct URLs (example format - replace with actual)
  'broccoli': 'https://img.icons8.com/color/128/broccoli.png',
  'chicken': 'https://img.icons8.com/color/128/chicken.png',
  'rice': 'https://img.icons8.com/color/128/rice-bowl.png',
  'quinoa': 'https://img.icons8.com/color/128/quinoa.png',
  'avocado': 'https://img.icons8.com/color/128/avocado.png',
  'edamame': 'https://img.icons8.com/color/128/soy.png',
  'pasta': 'https://img.icons8.com/color/128/spaghetti.png',
  'noodles': 'https://img.icons8.com/color/128/ramen-bowl.png',
  'sauce': 'https://img.icons8.com/color/128/sauce.png',
  'curry': 'https://img.icons8.com/color/128/curry.png',
  'basil': 'https://img.icons8.com/color/128/basil.png',
  'bread': 'https://img.icons8.com/color/128/bread.png',
  'egg': 'https://img.icons8.com/color/128/egg.png',
  'granola': 'https://img.icons8.com/color/128/cereal.png',
  'fruits': 'https://img.icons8.com/color/128/apple.png',
  'yogurt': 'https://img.icons8.com/color/128/yogurt.png',
  'vegetables': 'https://img.icons8.com/color/128/carrot.png',
  'proteins': 'https://img.icons8.com/color/128/steak.png',
  'carbs': 'https://img.icons8.com/color/128/wheat.png',
};

const outputDir = path.join(__dirname, '../public/food-icons');

function downloadFile(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        return downloadFile(response.headers.location!, filepath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

async function downloadAllIcons() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Starting download of food icons...\n');
  
  for (const [ingredient, url] of Object.entries(ingredientUrls)) {
    const filepath = path.join(outputDir, `${ingredient}.png`);
    try {
      console.log(`Downloading ${ingredient}...`);
      await downloadFile(url, filepath);
      console.log(`✓ ${ingredient} downloaded\n`);
    } catch (error) {
      console.error(`✗ Failed to download ${ingredient}: ${error}\n`);
    }
  }
  
  console.log('Download complete!');
}

// Run if called directly
if (require.main === module) {
  downloadAllIcons().catch(console.error);
}

export { downloadAllIcons, ingredientUrls };

