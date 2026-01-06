// Скрипт для вирізання тайлів з Forests tileset
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.join(__dirname, '../public/gfx/tiles/forests_256x128.png');
const outputDir = path.join(__dirname, '../public/gfx/tiles/forests');

// Параметри з TSX файлу
const tileWidth = 256;
const tileHeight = 128;
const totalTiles = 18;
const columns = 3;
const rows = Math.ceil(totalTiles / columns); // 6

// Створюємо папку для вихідних файлів
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`✅ Створено папку: ${outputDir}`);
}

async function extractTiles() {
  console.log('🌲🌲🌲 ПОЧАТОК ВИРІЗАННЯ ТАЙЛІВ З FORESTS TILESET');
  console.log(`📁 Вхідний файл: ${inputFile}`);
  console.log(`📁 Вихідна папка: ${outputDir}`);
  console.log(`📊 Параметри: ${totalTiles} тайлів, ${columns} колонки x ${rows} рядки`);
  console.log(`📏 Розмір тайла: ${tileWidth}x${tileHeight}px\n`);

  try {
    // Читаємо зображення
    const image = sharp(inputFile);
    const metadata = await image.metadata();
    console.log(`📐 Розмір зображення: ${metadata.width}x${metadata.height}px\n`);

    // Вирізаємо кожен тайл
    for (let i = 0; i < totalTiles; i++) {
      const row = Math.floor(i / columns);
      const col = i % columns;
      const x = col * tileWidth;
      const y = row * tileHeight;
      
      // Перевіряємо, чи не виходимо за межі
      if (x + tileWidth > metadata.width || y + tileHeight > metadata.height) {
        console.warn(`⚠️ [${i.toString().padStart(2, '0')}] Пропущено: виходить за межі [${x}, ${y}]`);
        continue;
      }
      
      const outputFile = path.join(outputDir, `forest_tile_${i.toString().padStart(2, '0')}.png`);
      
      // Вирізаємо тайл та обробляємо прозорість чорного кольору (trans="000000")
      const extracted = await sharp(inputFile)
        .extract({
          left: x,
          top: y,
          width: tileWidth,
          height: tileHeight
        })
        .ensureAlpha() // Забезпечуємо наявність альфа-каналу
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Обробляємо пікселі: робимо чорний колір (rgb(0,0,0)) та дуже темні пікселі прозорими
      const { data, info } = extracted;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Якщо піксель чорний або дуже темний (менше 10 для кожного каналу), робимо його прозорим
        if (r < 10 && g < 10 && b < 10) {
          data[i + 3] = 0; // Встановлюємо альфа = 0 (прозорий)
        }
      }

      // Зберігаємо оброблене зображення з правильною обробкою прозорості
      await sharp(data, {
        raw: {
          width: info.width,
          height: info.height,
          channels: 4
        }
      })
        .png({
          compressionLevel: 9,
          adaptiveFiltering: true,
          force: true // Примусово використовуємо PNG з альфа-каналом
        })
        .toFile(outputFile);
      
      console.log(`✅ [${i.toString().padStart(2, '0')}] Вирізано: forest_tile_${i.toString().padStart(2, '0')}.png`);
      console.log(`   Позиція: [${x}, ${y}], Розмір: ${tileWidth}x${tileHeight}px`);
    }

    console.log(`\n🌲🌲🌲 УСПІШНО ВИРІЗАНО ${totalTiles} ТАЙЛІВ!`);
    console.log(`📁 Файли збережено в: ${outputDir}`);
    console.log(`📋 Список файлів:`);
    
    const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.png')).sort();
    files.forEach((file, index) => {
      const filePath = path.join(outputDir, file);
      const stats = fs.statSync(filePath);
      console.log(`   ${index + 1}. ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    });

  } catch (error) {
    console.error('❌ Помилка при вирізанні тайлів:', error);
    process.exit(1);
  }
}

extractTiles();

