// src/game/scenes/IsoScene.ts
import Phaser from "phaser";
import { Grid } from "../world/Grid";
import { TileRenderer } from "../world/TileRenderer";
import { preloadSprites } from "../assets/AnimRegistry";
import { IsoCharacter } from "../entities/IsoCharacter";
import { PlayerController } from "../controllers/PlayerController";
import { IsoTransform } from "../iso/isoTransofrm";
import { GAME } from "../config/config";
import { TileEditor } from "../ui/TileEditor";
import { ControlsHint } from "../ui/ControlsHint"; // ✅ UI підказка
import { TILE_CONFIGS, TILES_BY_ID } from "../config/tiles";
import { preloadTinySwordsTilemaps, processTinySwordsTilemaps } from "../utils/tilemapLoader";

export class IsoScene extends Phaser.Scene {
  private iso!: IsoTransform;
  private grid!: Grid;
  private tiles!: TileRenderer;
  public tileEditor!: TileEditor; // ✅ Редактор тайлів (публічний для доступу з React)

  private player!: IsoCharacter;
  private controller!: PlayerController;
  private infoText!: Phaser.GameObjects.Text; // ✅ Текст з інформацією про персонажа
  private controlsHint!: ControlsHint; // ✅ UI підказка з клавішами
  private toggleHintKey!: Phaser.Input.Keyboard.Key; // ✅ Клавіша H для показу/приховування

  constructor() {
    super("IsoScene");
  }

  preload() {
    console.log('🎮 [SCENE] Starting preload...');
    const preloadStart = performance.now();
    
    preloadSprites(this);

    // ✅ Завантажуємо зображення для тайлів, якщо вони вказані
    for (const tileConfig of TILE_CONFIGS) {
      if (tileConfig.imageUrl) {
        const key = `tile-${tileConfig.id}`;
        this.load.image(key, tileConfig.imageUrl);
        console.log(`📥 Завантаження текстури: ${key}`);
      }
    }

    // ✅ Завантажуємо Tiny Swords Tilemap файли для вирізання тайлів
    preloadTinySwordsTilemaps(this);
    
    // ✅ Завантажуємо окремі файли Forests тайлів (18 штук) з прозорістю чорного кольору
    // Згідно з TSX: trans="000000" - чорний колір має бути прозорим
    for (let i = 0; i < 18; i++) {
      const tileNum = i.toString().padStart(2, '0');
      const key = `forest_tile_${tileNum}`;
      this.load.image(key, `/gfx/tiles/forests/${key}.png`);
    }
    
    // ✅ Завантажуємо DIRT тайли (ТАК САМО ЯК FOREST!)
    console.log('📥 Завантаження DIRT тайлів...');
    this.load.image('dirt_tiles_key', '/Isometric/dirtTiles_W.png');
    this.load.image('dirt_key', '/Isometric/dirt_W.png');
    
    // ✅ Завантажуємо Barrel текстуру
    console.log('📥 Завантаження barrel текстури...');
    this.load.image('barrel', '/Isometric/barrel_W.png');
    
    // ✅ Завантажуємо StoneWall текстури (всі орієнтації)
    console.log('📥 Завантаження stonewall текстур (N, E, S, W)...');
    this.load.image('stonewall_n', '/Isometric/stoneWall_N.png');
    this.load.image('stonewall_e', '/Isometric/stoneWall_E.png');
    this.load.image('stonewall_s', '/Isometric/stoneWall_S.png');
    this.load.image('stonewall_w', '/Isometric/stoneWall_W.png');
    
    const preloadEnd = performance.now();
    const preloadTime = (preloadEnd - preloadStart).toFixed(2);
    console.log(`✅ [SCENE] Preload completed in ${preloadTime}ms`);
  }

  create() {
    console.log('🎮 [SCENE] Starting create...');
    const createStart = performance.now();
    
    this.cameras.main.setBackgroundColor("#0b0b0f");

    this.iso = new IsoTransform(GAME.tileW, GAME.tileH, GAME.cols, GAME.rows);
    this.iso.recalcOrigin(this.scale.width, this.scale.height);

    this.grid = new Grid(GAME.cols, GAME.rows);
    // ✅ Не встановлюємо демо-стіни, щоб не конфліктувати з редактором

    // ✅ Обробляємо Tiny Swords Tilemap після завантаження (вирізаємо тайли)
    processTinySwordsTilemaps(this);
    
    // ✅ Перевіряємо завантажені Forests тайли і робимо чорний прозорим
    console.log('\n🌲 ОБРОБКА FORESTS ТАЙЛІВ (видалення чорного):');
    for (let i = 0; i < 18; i++) {
      const tileNum = i.toString().padStart(2, '0');
      const key = `forest_tile_${tileNum}`;
      const exists = this.textures.exists(key);
      if (exists) {
        const texture = this.textures.get(key);
        console.log(`   🔄 ${key}: ${texture.source[0]?.width}x${texture.source[0]?.height}px - обробка...`);
        this.makeBlackTransparent(key);
      } else {
        console.warn(`   ❌ ${key}: не знайдено`);
      }
    }

    // ✅ Barrel вже має прозорість в PNG, не потрібна обробка!
    console.log('\n🛢️ Barrel завантажено (PNG з прозорістю)!');

    // ✅ Обробляємо DIRT тайли (З БІЛЬШИМ THRESHOLD = 150!)
    console.log('\n🟤 ОБРОБКА DIRT ТАЙЛІВ (видалення темного фону, threshold=150):');
    if (this.textures.exists('dirt_tiles_key')) {
      const texture = this.textures.get('dirt_tiles_key');
      console.log(`   🔄 dirt_tiles_key: ${texture.source[0]?.width}x${texture.source[0]?.height}px - обробка...`);
      this.makeDarkTransparent('dirt_tiles_key', 150); // ✅ THRESHOLD 150 - видаляє більше темних пікселів!
    } else {
      console.error('   ❌ dirt_tiles_key НЕ завантажено!');
    }
    if (this.textures.exists('dirt_key')) {
      const texture = this.textures.get('dirt_key');
      console.log(`   🔄 dirt_key: ${texture.source[0]?.width}x${texture.source[0]?.height}px - обробка...`);
      this.makeDarkTransparent('dirt_key', 150); // ✅ THRESHOLD 150 - видаляє більше темних пікселів!
    } else {
      console.error('   ❌ dirt_key НЕ завантажено!');
    }
    
    // ✅ Обробляємо StoneWall всі орієнтації (видаляємо темний фон)
    console.log('\n🏰 ОБРОБКА STONEWALL (видалення темного фону, threshold=150):');
    const stonewallKeys = ['stonewall_n', 'stonewall_e', 'stonewall_s', 'stonewall_w'];
    for (const key of stonewallKeys) {
      if (this.textures.exists(key)) {
        const texture = this.textures.get(key);
        console.log(`   🔄 ${key}: ${texture.source[0]?.width}x${texture.source[0]?.height}px - обробка...`);
        this.makeDarkTransparent(key, 150);
      } else {
        console.error(`   ❌ ${key} НЕ завантажено!`);
      }
    }
    
    // ✅ АНАЛІЗУЄМО StoneWall текстури (знаходимо правильний scale та offset)
    console.log('\n📐 АНАЛІЗ STONEWALL (обрізка та вимірювання):');
    const tileW = 82; // Ширина тайла
    const tileH = 42; // Висота тайла
    
    for (const key of stonewallKeys) {
      if (this.textures.exists(key)) {
        const result = this.cropAndMeasureTexture(key, tileW, tileH);
        if (result) {
          console.log(`   ✅ ${key} ПРОАНАЛІЗОВАНО!`);
        }
      }
    }
    
    // ✅ Barrel вже має прозорість в PNG, не потрібна обробка!
    console.log('\n🛢️ Barrel завантажено (PNG з прозорістю)!');

    this.tiles = new TileRenderer(this, this.grid, this.iso);
    this.tiles.create();

    // ✅ Створюємо редактор тайлів
    this.tileEditor = new TileEditor(this, this.grid, this.iso, this.tiles);
    this.tileEditor.create();
    this.tileEditor.loadTiles(); // ✅ Завантажуємо збережені тайли

    // ✅ Якщо тайлів немає, генеруємо якісну багатошарову карту
    if (this.grid.getTilesData().length === 0) {
      this.grid.generateQualityMap((tileId) => TILES_BY_ID.get(tileId));
      this.tiles.redraw();
    }

    // ✅ Спавн персонажа
    this.player = new IsoCharacter(this, this.iso, "warrior", { x: 20 * 4, y: 25 * 4 });
    
    // ✅ Додаємо спрайт героя в characterLayer (depth 20) - поверх об'єктів
    this.tiles.characterLayer.add(this.player.sprite);
    console.log('✅ Герой доданий в characterLayer (depth 20)');
    
    this.controller = new PlayerController(
      this,
      this.grid,
      this.iso,
      this.player,
      this.tileEditor // ✅ Передаємо редактор для перевірки режиму
    );

    // ✅ Створюємо інформаційний текст
    this.infoText = this.add.text(10, 10, "", {
      fontSize: "16px",
      color: "#00ff00",
      backgroundColor: "#000000aa",
      padding: { x: 8, y: 4 },
    });
    this.infoText.setScrollFactor(0);
    this.infoText.setDepth(1000);
    this.updateInfoText();

    // ✅ Створюємо UI підказку з клавішами
    this.controlsHint = new ControlsHint(this);

    // ✅ Клавіша H для показу/приховування підказки
    this.toggleHintKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.H);

    // камера
    this.cameras.main.centerOn(this.player.sprite.x, this.player.sprite.y);
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);

    this.scale.on("resize", () => {
      this.iso.recalcOrigin(this.scale.width, this.scale.height);
      this.tiles.redraw();
      this.player.place(this.player.cell);
      this.cameras.main.centerOn(this.player.sprite.x, this.player.sprite.y);
    });
    
    const createEnd = performance.now();
    const createTime = (createEnd - createStart).toFixed(2);
    console.log(`✅ [SCENE] Create completed in ${createTime}ms`);
    console.log(`🎮 [SCENE] 🎉 GAME READY! Total time: ${createTime}ms`);
  }

  // ✅ ОБРІЗАЄМО текстуру до реального вмісту і вираховуємо правильний scale
  cropAndMeasureTexture(textureKey: string, targetWidth: number, targetHeight: number) {
    try {
      const texture = this.textures.get(textureKey);
      if (!texture || !texture.source[0]) {
        console.error(`❌ Текстура ${textureKey} не знайдена`);
        return null;
      }

      const width = texture.source[0].width;
      const height = texture.source[0].height;
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;

      ctx.drawImage(texture.source[0].source as HTMLImageElement, 0, 0);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // Знаходимо bounding box (мінімальний прямокутник з непрозорими пікселями)
      let minX = width, minY = height, maxX = 0, maxY = 0;
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const alpha = data[i + 3];
          
          // Якщо піксель НЕ прозорий
          if (alpha > 10) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      const contentWidth = maxX - minX + 1;
      const contentHeight = maxY - minY + 1;
      
      // Розраховуємо scale щоб вмістити в target розмір
      const scaleX = targetWidth / contentWidth;
      const scaleY = targetHeight / contentHeight;
      const scale = Math.min(scaleX, scaleY);
      
      // Розраховуємо offset (зміщення від центру PNG до центру вмісту)
      const centerOriginalX = width / 2;
      const centerOriginalY = height;
      const centerContentX = (minX + maxX) / 2;
      const centerContentY = maxY; // Низ вмісту
      
      const offsetX = (centerContentX - centerOriginalX) * scale;
      const offsetY = (centerContentY - centerOriginalY) * scale;
      
      console.log(`   📐 ${textureKey}:`);
      console.log(`      PNG: ${width}x${height}px`);
      console.log(`      Вміст: ${contentWidth}x${contentHeight}px на позиції (${minX}, ${minY})`);
      console.log(`      Рекомендований scale: ${scale.toFixed(3)}`);
      console.log(`      Рекомендований offset: (${offsetX.toFixed(1)}, ${offsetY.toFixed(1)})`);
      
      return {
        scale: scale,
        offset: { x: offsetX, y: offsetY },
        contentSize: { width: contentWidth, height: contentHeight },
        contentPos: { x: minX, y: minY }
      };
    } catch (error) {
      console.error(`❌ Помилка при аналізі ${textureKey}:`, error);
      return null;
    }
  }

  // ✅ Робимо ТЕМНИЙ колір прозорим (З НАЛАШТУВАННЯМ THRESHOLD)
  makeDarkTransparent(textureKey: string, threshold: number) {
    try {
      const texture = this.textures.get(textureKey);
      if (!texture || !texture.source[0]) {
        console.error(`❌ Текстура ${textureKey} не знайдена`);
        return;
      }

      const width = texture.source[0].width;
      const height = texture.source[0].height;
      const totalPixels = width * height;
      
      console.log(`   📐 Розмір: ${width}x${height} (${totalPixels} пікселів), threshold=${threshold}`);

      // Створюємо canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) {
        console.error(`❌ Не вдалось створити canvas context`);
        return;
      }

      // Малюємо оригінальну текстуру
      const sourceImage = texture.source[0].source as HTMLImageElement;
      ctx.drawImage(sourceImage, 0, 0);

      // Отримуємо піксельні дані
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      let transparentCount = 0;
      
      // РОБИМО ТЕМНИЙ ПРОЗОРИМ!
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Якщо піксель ТЕМНИЙ (< threshold) - робимо ПРОЗОРИМ
        const isDark = r + g + b < threshold; // ✅ ВИКОРИСТОВУЄМО threshold!
        if (isDark) {
          data[i + 3] = 0; // Alpha = 0 (ПРОЗОРИЙ!)
          transparentCount++;
        }
      }

      const percentTransparent = ((transparentCount / totalPixels) * 100).toFixed(1);
      console.log(`   ✅ Зроблено прозорих: ${transparentCount} (${percentTransparent}%)`);

      // Записуємо оброблені дані назад
      ctx.putImageData(imageData, 0, 0);

      // Видаляємо стару текстуру і створюємо нову з canvas
      this.textures.remove(textureKey);
      this.textures.addCanvas(textureKey, canvas);
      
      console.log(`   ✅ ${textureKey} оброблено та замінено (threshold=${threshold})!`);
      
      // FINAL CHECK
      const newTexture = this.textures.get(textureKey);
      if (newTexture) {
        console.log(`   ✔️ FINAL CHECK: Нова текстура ${textureKey} створена!`);
      } else {
        console.error(`   ❌ FINAL CHECK: Текстура ${textureKey} НЕ створена!`);
      }
    } catch (error) {
      console.error(`❌ Помилка при обробці ${textureKey}:`, error);
    }
  }

  // ✅ Робимо чорний колір прозорим (як у Diablo trans="000000")
  makeBlackTransparent(textureKey: string) {
    try {
      const texture = this.textures.get(textureKey);
      if (!texture || !texture.source[0]) {
        console.error(`❌ Текстура ${textureKey} не знайдена`);
        return;
      }

      const width = texture.source[0].width;
      const height = texture.source[0].height;
      const totalPixels = width * height;
      
      console.log(`   📐 Розмір: ${width}x${height} (${totalPixels} пікселів)`);

      // Створюємо canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) {
        console.error(`❌ Не вдалось створити canvas context`);
        return;
      }

      // Малюємо оригінальну текстуру
      const sourceImage = texture.source[0].source as HTMLImageElement;
      ctx.drawImage(sourceImage, 0, 0);

      // Отримуємо піксельні дані
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      let transparentCount = 0;
      let blackPixels = 0;
      let darkPixels = 0;
      let coloredPixels = 0;
      const samplePixels = [];
      
      // РОБИМО ЧОРНИЙ ПРОЗОРИМ!
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        // Зберігаємо зразки для перевірки (різні типи пікселів)
        if (samplePixels.length < 20) {
          const brightness = r + g + b;
          if (brightness === 0 || (brightness < 30 && samplePixels.length < 5) || 
              (brightness > 100 && samplePixels.length < 15)) {
            samplePixels.push({ r, g, b, a, brightness });
          }
        }
        
        const brightness = r + g + b;
        
        // Статистика
        if (brightness === 0) blackPixels++;
        else if (brightness < 50) darkPixels++;
        else coloredPixels++;
        
        // Якщо піксель ТЕМНИЙ (< 50) - робимо ПРОЗОРИМ (для FOREST працює відмінно!)
        const isDark = r + g + b < 50; // ✅ ТОЙ САМИЙ threshold що працював для FOREST!
        if (isDark) {
          data[i + 3] = 0; // Alpha = 0 (ПРОЗОРИЙ!)
          transparentCount++;
        }
      }

      const percentTransparent = ((transparentCount / totalPixels) * 100).toFixed(1);
      const percentBlack = ((blackPixels / totalPixels) * 100).toFixed(1);
      const percentDark = ((darkPixels / totalPixels) * 100).toFixed(1);
      const percentColored = ((coloredPixels / totalPixels) * 100).toFixed(1);
      
      console.log(`   📊 СТАТИСТИКА ПІКСЕЛІВ:`);
      console.log(`      • Чорні (0-0-0): ${blackPixels} (${percentBlack}%)`);
      console.log(`      • Темні (1-49): ${darkPixels} (${percentDark}%)`);
      console.log(`      • Кольорові (50+): ${coloredPixels} (${percentColored}%)`);
      console.log(`   ✅ Зроблено прозорих: ${transparentCount} (${percentTransparent}%)`);
      console.log(`   🔍 Зразки пікселів (R,G,B,brightness):`, samplePixels.slice(0, 10).map(p => `${p.r},${p.g},${p.b}(${p.brightness})`));

      // DOUBLE CHECK - перевіряємо результат
      let checkTransparent = 0;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] === 0) checkTransparent++;
      }
      console.log(`   ✔️ DOUBLE CHECK: ${checkTransparent} прозорих пікселів після обробки`);

      // Записуємо оброблені дані назад
      ctx.putImageData(imageData, 0, 0);

      // Видаляємо стару текстуру і створюємо нову з canvas
      this.textures.remove(textureKey);
      this.textures.addCanvas(textureKey, canvas);
      
      console.log(`   ✅ ${textureKey} оброблено та замінено!`);
      
      // FINAL CHECK
      const newTexture = this.textures.get(textureKey);
      if (newTexture) {
        console.log(`   ✔️ FINAL CHECK: Нова текстура ${textureKey} створена!`);
      } else {
        console.error(`   ❌ FINAL CHECK: Текстура ${textureKey} НЕ створена!`);
      }
    } catch (error) {
      console.error(`❌ Помилка при обробці ${textureKey}:`, error);
    }
  }

  updateInfoText() {
    // ✅ Отримуємо актуального player з controller (може змінитися після switchCharacter)
    const currentPlayer = this.controller.player;
    let charName = "Unknown";
    
    if (currentPlayer.id === "hero") {
      charName = "Hero";
    } else if (currentPlayer.id === "cyberpunkMarsian") {
      charName = "Cyberpunk Marsian";
    } else if (currentPlayer.id === "warrior") {
      charName = "Warrior ⚔️";
    }
    
    this.infoText.setText(
      `Character: ${charName}\nC - switch character\n🏠 Explore 3 large houses with rooms!`
    );
  }

  update() {
    this.controller.update();
    this.updateInfoText();
    
    // ✅ Обробка клавіші H для показу/приховування підказки
    if (Phaser.Input.Keyboard.JustDown(this.toggleHintKey)) {
      this.controlsHint.toggle();
    }
  }
}
