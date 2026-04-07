/**
 * generate-posters.mjs
 * 
 * Renders each GLB model from dishes.json using puppeteer-core + model-viewer
 * and saves high-quality poster images to public/Images/posters/
 * 
 * Usage:
 *   1. Start the dev server first:  npm run dev
 *   2. In another terminal:         node scripts/generate-posters.mjs
 */

import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// ─── Config ───────────────────────────────────────────────────
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEV_SERVER = 'http://localhost:5173';
const RENDER_PAGE = `${DEV_SERVER}/model-render.html`;
const OUTPUT_DIR = path.join(projectRoot, 'public', 'Images', 'posters');
const VIEWPORT = { width: 800, height: 600 };
const WAIT_AFTER_LOAD_MS = 3000;   // extra wait for render to stabilize
const MAX_WAIT_MS = 25000;         // max wait for model to load

// ─── Load dishes.json ─────────────────────────────────────────
const dishesPath = path.join(projectRoot, 'public', 'dishes.json');
const dishes = JSON.parse(fs.readFileSync(dishesPath, 'utf-8'));

// Filter to only dishes that have a 3D model
const dishesWithModels = dishes.filter(d => d.modelUrl && d.modelUrl.trim() !== '');

console.log(`\n🍽️  Found ${dishesWithModels.length} dishes with 3D models\n`);

// ─── Ensure output directory exists ───────────────────────────
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ─── Sanitize filename ───────────────────────────────────────
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Launching Chrome...');
  
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--use-gl=angle',
      '--enable-features=Vulkan',
      '--ignore-gpu-blocklist',
      '--disable-gpu-driver-bug-workarounds',
      '--window-size=800,600'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  const results = [];
  
  for (let i = 0; i < dishesWithModels.length; i++) {
    const dish = dishesWithModels[i];
    const slug = slugify(dish.name);
    const outputFile = path.join(OUTPUT_DIR, `${slug}.png`);
    
    console.log(`\n[${i + 1}/${dishesWithModels.length}] 🔄 Rendering: ${dish.name}`);
    console.log(`   Model: ${dish.modelUrl}`);
    
    try {
      // Navigate to the render page with the model URL
      const renderUrl = `${RENDER_PAGE}?model=${encodeURIComponent(dish.modelUrl)}`;
      await page.goto(renderUrl, { 
        waitUntil: 'networkidle0', 
        timeout: 30000 
      });

      // Wait for model to be ready (or timeout)
      const startTime = Date.now();
      let ready = false;
      
      while (Date.now() - startTime < MAX_WAIT_MS) {
        const status = await page.evaluate(() => {
          return {
            ready: window.__MODEL_READY__ === true,
            error: window.__MODEL_ERROR__ === true,
            statusText: document.getElementById('status')?.textContent || ''
          };
        });
        
        if (status.ready) {
          ready = true;
          console.log(`   ✅ Model loaded in ${Date.now() - startTime}ms`);
          break;
        }
        
        if (status.error) {
          throw new Error(`Model loading error: ${status.statusText}`);
        }
        
        await new Promise(r => setTimeout(r, 500));
      }

      if (!ready) {
        console.log(`   ⚠️  Timed out waiting for model, taking screenshot anyway...`);
      }

      // Extra wait for rendering to fully stabilize
      await new Promise(r => setTimeout(r, WAIT_AFTER_LOAD_MS));

      // Hide the status overlay before screenshot
      await page.evaluate(() => {
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.style.display = 'none';
      });

      // Take screenshot of just the model-viewer element
      const viewerElement = await page.$('#viewer');
      if (viewerElement) {
        await viewerElement.screenshot({
          path: outputFile,
          type: 'png',
          omitBackground: false
        });
      } else {
        // Fallback: screenshot the full page
        await page.screenshot({
          path: outputFile,
          type: 'png'
        });
      }

      console.log(`   📸 Saved: ${outputFile}`);
      results.push({
        id: dish.id,
        name: dish.name,
        posterPath: `/Images/posters/${slug}.png`,
        success: true
      });

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      results.push({
        id: dish.id,
        name: dish.name,
        posterPath: null,
        success: false,
        error: error.message
      });
    }
  }

  await browser.close();

  // ─── Summary ──────────────────────────────────────────────
  console.log('\n\n═══════════════════════════════════════');
  console.log('  📊 GENERATION SUMMARY');
  console.log('═══════════════════════════════════════');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`  ✅ Success: ${successful.length}`);
  console.log(`  ❌ Failed:  ${failed.length}`);
  console.log('');
  
  if (failed.length > 0) {
    console.log('  Failed dishes:');
    failed.forEach(r => console.log(`    - ${r.name}: ${r.error}`));
    console.log('');
  }

  // ─── Update dishes.json with poster paths ─────────────────
  console.log('📝 Updating dishes.json with poster image paths...');
  
  const updatedDishes = dishes.map(dish => {
    const result = successful.find(r => r.id === dish.id);
    if (result) {
      return { ...dish, posterImage: result.posterPath };
    }
    return dish;
  });
  
  fs.writeFileSync(dishesPath, JSON.stringify(updatedDishes, null, 2), 'utf-8');
  console.log('✅ dishes.json updated!\n');

  // ─── Output the poster mapping for reference ─────────────
  console.log('📋 Poster mapping:');
  successful.forEach(r => {
    console.log(`   ${r.name} → ${r.posterPath}`);
  });
  console.log('\n🎉 Done!\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
