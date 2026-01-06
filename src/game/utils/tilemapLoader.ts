// src/game/utils/tilemapLoader.ts
// Система для роботи з Tilemap з Tiny Swords Pack
// Згідно з документацією: Tilemap grid: 64x64 pixels

import Phaser from "phaser";

/**
 * Константи для Tiny Swords Tilemap
 */
export const TINY_SWORDS_TILE_SIZE = 64; // Розмір тайла в пікселях (64x64)
export const TINY_SWORDS_TILEMAP_KEYS = [
  'tilemap_color1',
  'tilemap_color2', 
  'tilemap_color3',
  'tilemap_color4',
  'tilemap_color5'
] as const;

/**
 * Мапа назв тайлів - який тайл що означає
 * Ключ: "tilemapKey_row_col", Значення: назва тайла
 */
export const TILEMAP_TILE_NAMES = new Map<string, string>();

/**
 * Створює назви для вирізаних тайлів
 * Це базова версія - можна розширити для конкретних Tilemap
 */
function createTileName(tilemapKey: string, row: number, col: number, tilesPerRow: number): string {
  const tileIndex = row * tilesPerRow + col;
  
  // Базові назви - можна розширити після аналізу Tilemap
  const baseNames = [
    'grass', 'grass_variant_1', 'grass_variant_2', 'dirt', 'dirt_variant',
    'stone', 'stone_variant', 'cobblestone', 'cobblestone_variant', 'brick',
    'water', 'water_variant', 'sand', 'sand_variant', 'clay',
    'wood', 'wood_variant', 'floor', 'floor_variant_1', 'floor_variant_2',
    'wall', 'wall_variant_1', 'wall_variant_2', 'marble', 'marble_variant',
    'tile_floor', 'tile_floor_variant', 'rock', 'rock_variant', 'ground',
  ];
  
  // Використовуємо індекс або створюємо унікальну назву
  if (tileIndex < baseNames.length) {
    return baseNames[tileIndex];
  }
  
  // Якщо індекс більший - створюємо назву з індексом
  return `tile_${tileIndex}`;
}

/**
 * Отримує назву тайла за ключем
 */
export function getTileName(tileKey: string): string | undefined {
  return TILEMAP_TILE_NAMES.get(tileKey);
}

/**
 * Отримує всі вирізані тайли з назвами
 */
export function getAllExtractedTiles(): Array<{ key: string; name: string }> {
  const result: Array<{ key: string; name: string }> = [];
  TILEMAP_TILE_NAMES.forEach((name, key) => {
    result.push({ key, name });
  });
  return result;
}

/**
 * Завантажує Tilemap файл як spritesheet та вирізає окремі тайли
 * @param scene Phaser Scene
 * @param tilemapKey Ключ завантаженого Tilemap
 * @param tileSize Розмір тайла в пікселях (64 для Tiny Swords)
 */
/**
 * ✅ ВИРІЗАЄ 6 ОКРЕМИХ КАРТИНОК З TILEMAP
 * Tilemap_color1.png містить 6 окремих зображень, а не grid 64x64
 */
export function loadTinySwordsTilemap(
  scene: Phaser.Scene,
  tilemapKey: string,
  tileSize: number = TINY_SWORDS_TILE_SIZE
) {
  if (!scene.textures.exists(tilemapKey)) {
    console.warn(`⚠️ Tilemap ${tilemapKey} не завантажено!`);
    return;
  }

  const texture = scene.textures.get(tilemapKey);
  const source = texture.source[0];
  const image = source.image as HTMLImageElement;
  
  console.log(`\n📐 РОЗМІР ЗОБРАЖЕННЯ ${tilemapKey}: ${image.width}x${image.height}px`);
  
  // ✅ ВИЗНАЧАЄМО СТРУКТУРУ: 6 ОКРЕМИХ КАРТИНОК
  // Можливо, це 2 колонки по 3 рядки, або 3 колонки по 2 рядки
  // Або просто 6 картинок в ряд
  
  // Спробуємо визначити структуру автоматично
  // Якщо це 6 картинок, то можливо це 2x3 або 3x2
  const totalTiles = 6;
  
  // Припускаємо, що це 2 колонки по 3 рядки (або навпаки)
  // Або 6 картинок в один ряд
  // Потрібно визначити розмір кожної картинки
  
  // Для початку - спробуємо як 2 колонки по 3 рядки
  const cols = 2;
  const rows = 3;
  const tileWidth = Math.floor(image.width / cols);
  const tileHeight = Math.floor(image.height / rows);
  
  console.log(`🔪 ВИРІЗАЄМО ${totalTiles} ОКРЕМИХ КАРТИНОК`);
  console.log(`📏 Розмір кожної картинки: ~${tileWidth}x${tileHeight}px`);
  console.log(`📊 Структура: ${cols} колонки x ${rows} рядки`);

  // ✅ ВИРІЗАЄМО КОЖНУ З 6 КАРТИНОК
  const createdTiles: Array<{ key: string; name: string; row: number; col: number; width: number; height: number }> = [];
  let tileIndex = 0;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const frameKey = `${tilemapKey}_tile_${tileIndex}`;
      const x = col * tileWidth;
      const y = row * tileHeight;
      
      // ✅ ВИРІЗАЄМО КАРТИНКУ (не 64x64, а реальний розмір!)
      texture.add(frameKey, 0, x, y, tileWidth, tileHeight);
      
      // ✅ СТВОРЮЄМО НАЗВУ ДЛЯ КАРТИНКИ
      const tileNames = [
        'hedge_large',      // 0 - великий кущ
        'hedge_tall',       // 1 - високий кущ
        'hedge_wide',       // 2 - широкий кущ
        'hedge_small',      // 3 - маленький кущ
        'moss_rock_left',   // 4 - мох на камені (лівий)
        'moss_rock_right',  // 5 - мох на камені (правий)
      ];
      const tileName = tileNames[tileIndex] || `tile_${tileIndex}`;
      
      // ✅ ЗБЕРІГАЄМО НАЗВУ В МАПУ
      TILEMAP_TILE_NAMES.set(frameKey, tileName);
      
      createdTiles.push({ 
        key: frameKey, 
        name: tileName, 
        row, 
        col,
        width: tileWidth,
        height: tileHeight
      });
      
      console.log(`  ✅ Вирізано: ${frameKey} -> "${tileName}" (${tileWidth}x${tileHeight}px) з позиції [${x}, ${y}]`);
      
      tileIndex++;
      if (tileIndex >= totalTiles) break;
    }
    if (tileIndex >= totalTiles) break;
  }
  
  console.log(`\n✅✅✅ ВИРІЗАНО ${createdTiles.length} ОКРЕМИХ КАРТИНОК З ${tilemapKey}`);
  console.log(`📝 Мапа назв містить ${TILEMAP_TILE_NAMES.size} записів`);
  
  // Перевіряємо, що тайли дійсно збережені
  const firstTileKey = `${tilemapKey}_tile_0`;
  if (scene.textures.exists(firstTileKey)) {
    const frame = scene.textures.getFrame(firstTileKey);
    const tileName = TILEMAP_TILE_NAMES.get(firstTileKey);
    console.log(`✅ Перевірка: картинка "${firstTileKey}" (${tileName}) існує! Розмір: ${frame?.width}x${frame?.height}px`);
  } else {
    console.error(`❌ ПОМИЛКА: картинка "${firstTileKey}" НЕ знайдено в texture cache!`);
  }
  
  return {
    tilesPerRow: cols,
    tilesPerCol: rows,
    totalTiles: createdTiles.length,
    createdTiles, // Повертаємо інформацію про вирізані картинки
    tileWidth,
    tileHeight
  };
}

/**
 * Отримує ключ тайла з Tilemap за індексом (0-5 для 6 картинок)
 */
export function getTilemapTileKey(
  tilemapKey: string, 
  tileIndex: number
): string {
  return `${tilemapKey}_tile_${tileIndex}`;
}

/**
 * Завантажує всі Tilemap файли з Tiny Swords Pack
 */
export function preloadTinySwordsTilemaps(scene: Phaser.Scene) {
  TINY_SWORDS_TILEMAP_KEYS.forEach((key, index) => {
    const url = `/gfx/tiles/Tilemap_color${index + 1}.png`;
    scene.load.image(key, url);
  });
  
  // Також завантажуємо Water та Shadow
  scene.load.image('water_background', '/gfx/tiles/Water Background color.png');
  scene.load.image('water_foam', '/gfx/tiles/Water Foam.png');
  scene.load.image('shadow', '/gfx/tiles/Shadow.png');
}

/**
 * Обробляє всі завантажені Tilemap після create()
 */
/**
 * ✅ ВИРІЗАЄ ТАЙЛИ З FORESTS TILESET (256x128, 18 тайлів, 3 колонки)
 * Згідно з TSX: tilewidth="256" tileheight="128" tilecount="18" columns="3" width="768" height="768"
 */
export function loadForestsTileset(scene: Phaser.Scene, tilesetKey: string = 'forests_256x128') {
  if (!scene.textures.exists(tilesetKey)) {
    console.warn(`⚠️ Tileset ${tilesetKey} не завантажено!`);
    return;
  }

  const texture = scene.textures.get(tilesetKey);
  const source = texture.source[0];
  const image = source.image as HTMLImageElement;
  
  console.log(`\n🌲🌲🌲 ПОЧАТОК ВИРІЗАННЯ ТАЙЛІВ З ${tilesetKey}`);
  console.log(`📐 РОЗМІР ЗОБРАЖЕННЯ: ${image.width}x${image.height}px`);
  
  // Згідно з TSX: tilewidth="256" tileheight="128" tilecount="18" columns="3"
  const tileWidth = 256;
  const tileHeight = 128;
  const totalTiles = 18;
  const columns = 3;
  const rows = Math.ceil(totalTiles / columns); // 6 рядків
  
  console.log(`🌲 ПАРАМЕТРИ ВИРІЗАННЯ:`);
  console.log(`   - Кількість тайлів: ${totalTiles}`);
  console.log(`   - Розмір тайла: ${tileWidth}x${tileHeight}px`);
  console.log(`   - Структура: ${columns} колонки x ${rows} рядки`);
  console.log(`   - Очікуваний розмір: ${columns * tileWidth}x${rows * tileHeight} = ${columns * tileWidth}x${rows * tileHeight}px`);

  const createdTiles: Array<{ key: string; index: number; x: number; y: number }> = [];
  
  // ✅ ВИРІЗАЄМО КОЖЕН ТАЙЛ
  for (let i = 0; i < totalTiles; i++) {
    const row = Math.floor(i / columns);
    const col = i % columns;
    const frameKey = `${tilesetKey}_tile_${i}`;
    const x = col * tileWidth;
    const y = row * tileHeight;
    
    // ✅ Перевіряємо, чи не виходимо за межі зображення
    if (x + tileWidth > image.width || y + tileHeight > image.height) {
      console.warn(`  ⚠️ Тайл ${i} виходить за межі: [${x}, ${y}] + [${tileWidth}, ${tileHeight}] > [${image.width}, ${image.height}]`);
      continue;
    }
    
    // ✅ ВИРІЗАЄМО ТАЙЛ (додаємо frame до текстури)
    texture.add(frameKey, 0, x, y, tileWidth, tileHeight);
    
    // ✅ Перевіряємо, чи frame створено
    const frame = texture.get(frameKey);
    if (frame) {
      createdTiles.push({ key: frameKey, index: i, x, y });
      console.log(`  ✅ [${i.toString().padStart(2, '0')}] Вирізано: ${frameKey}`);
      console.log(`     Позиція: [${x}, ${y}], Розмір frame: ${frame.width}x${frame.height}px`);
    } else {
      console.error(`  ❌ Помилка: не вдалося створити frame ${frameKey}`);
    }
  }
  
  console.log(`\n🌲🌲🌲 РЕЗУЛЬТАТ ВИРІЗАННЯ:`);
  console.log(`   ✅ Успішно вирізано: ${createdTiles.length} з ${totalTiles} тайлів`);
  console.log(`   📍 Збережені ключі: ${createdTiles.map(t => t.key).join(', ')}`);
  console.log(`\n💾 ТАЙЛИ ЗБЕРЕЖЕНІ В PHASER TEXTURE CACHE`);
  console.log(`   Використовуйте ключі: ${tilesetKey}_tile_0 до ${tilesetKey}_tile_${totalTiles - 1}`);
  
  return { totalTiles, tileWidth, tileHeight, columns, rows, createdTiles };
}

/**
 * ✅ ОСНОВНА ФУНКЦІЯ: ВИРІЗАЄ ВСІ ТАЙЛИ З TILEMAP ТА ДАЄ ЇМ НАЗВИ
 * Викликається ОДИН РАЗ при завантаженні гри
 */
export function processTinySwordsTilemaps(scene: Phaser.Scene) {
  console.log('🔪🔪🔪 ПОЧАТОК ВИРІЗАННЯ ВСІХ ТАЙЛІВ З TILEMAP...');
  console.log('📦 Доступні текстури в cache:', Object.keys(scene.textures.list));
  
  const allExtractedTiles: Array<{ tilemap: string; tiles: any }> = [];
  
  TINY_SWORDS_TILEMAP_KEYS.forEach((key) => {
    if (scene.textures.exists(key)) {
      console.log(`\n🔪 ВИРІЗАЄМО ВСІ ТАЙЛИ З: ${key}`);
      const result = loadTinySwordsTilemap(scene, key);
      if (result) {
        allExtractedTiles.push({ tilemap: key, tiles: result });
      }
    } else {
      console.warn(`⚠️ Tilemap ${key} не знайдено в texture cache!`);
    }
  });
  
  console.log('\n📊📊📊 ПІСЛЯ ВИРІЗАННЯ ВСІХ ТАЙЛІВ:');
  const allTextures = Object.keys(scene.textures.list);
  const tilemapTiles = allTextures.filter(t => t.includes('tilemap_') && t.includes('_'));
  console.log(`✅ ВСЬОГО вирізано ${tilemapTiles.length} тайлів з усіх Tilemap`);
  console.log(`📝 Мапа назв містить ${TILEMAP_TILE_NAMES.size} записів`);
  console.log('📋 Приклади вирізаних тайлів:', tilemapTiles.slice(0, 30));
  
  // Показуємо статистику по кожному Tilemap
  allExtractedTiles.forEach(({ tilemap, tiles }) => {
    console.log(`  ${tilemap}: ${tiles.totalTiles} тайлів (${tiles.tilesPerRow}x${tiles.tilesPerCol})`);
  });
  
  console.log('\n✅✅✅ ВСІ ТАЙЛИ ВИРІЗАНІ ТА НАЗВАНІ! Тепер можна використовувати для генерації карти!');
}

