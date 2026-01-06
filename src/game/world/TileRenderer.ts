// src/game/world/TileRenderer.ts
import Phaser from "phaser";
import { Grid } from "./Grid";
import type { IsoTransform } from "../iso/isoTransofrm";
import type { GridPoint } from "../types/grid-types";
import { TILE_CONFIGS } from "../config/tiles";
import { getTilemapTileKey } from "../utils/tilemapLoader";

export class TileRenderer {
  private floorLayer!: Phaser.GameObjects.Container; // ✅ ШАР 1: Підлога (depth: 0)
  private objectLayer!: Phaser.GameObjects.Container; // ✅ ШАР 2: Об'єкти (depth: 10)
  public characterLayer!: Phaser.GameObjects.Container; // ✅ ШАР 3: Персонажі (depth: 20) - public для доступу ззовні

  public scene: Phaser.Scene;
  public grid: Grid;
  public iso: IsoTransform;

  constructor(scene: Phaser.Scene, grid: Grid, iso: IsoTransform) {
    this.scene = scene;
    this.grid = grid;
    this.iso = iso;
  }

  create() {
    this.createTileTextures();
    
    // ✅ Створюємо 3 окремі контейнери для багатошарового рендерингу
    this.floorLayer = this.scene.add.container(0, 0).setDepth(0);
    this.objectLayer = this.scene.add.container(0, 0).setDepth(10);
    this.characterLayer = this.scene.add.container(0, 0).setDepth(20);
    
    console.log('✅ Створено 3 шари: floor (depth 0) → object (depth 10) → character (depth 20)');
    
    this.redraw();
  }

  redraw() {
    this.floorLayer.removeAll(true);
    this.objectLayer.removeAll(true);
    // ✅ characterLayer НЕ очищаємо - там герой!
    
    const { tileW: W, tileH: H } = this.iso;
    
    // ✅ ПРОХІД 1: Малюємо підлогу (floor)
    this.renderLayer('floor');
    
    // ✅ ПРОХІД 2: Малюємо об'єкти (barrel та інші декорації) ПОВЕРХ
    this.renderLayer('object');
  }

  private renderLayer(layerType: 'floor' | 'object') {
    const { tileW: W, tileH: H } = this.iso;
    const renderedTiles = new Set<string>(); // ✅ Відстежуємо вже відрендерені тайли
    let renderedCount = 0;

    // ✅ Вибираємо правильний контейнер для цього шару
    const targetContainer = layerType === 'floor' ? this.floorLayer : this.objectLayer;

    for (let y = 0; y < this.grid.rows; y++) {
      for (let x = 0; x < this.grid.cols; x++) {
        const p: GridPoint = { x, y };
        const cellKey = `${x},${y}`;

        // ✅ Пропускаємо, якщо ця клітинка вже частина більшого тайла
        if (renderedTiles.has(cellKey)) continue;

        // ✅ Отримуємо тип тайла в залежності від шару
        let tileId: string | null;
        if (layerType === 'floor') {
          tileId = this.grid.getTileType(p);
          // Для підлоги завжди має бути щось, інакше пропускаємо
          if (!tileId) continue;
        } else {
          tileId = this.grid.getObjectType(p);
          // Для об'єктів: якщо немає, пропускаємо
          if (!tileId) continue;
        }
        
        const tileConfig = TILE_CONFIGS.find((t) => t.id === tileId);
        if (!tileConfig) {
          console.warn(`⚠️ Конфіг для тайла ${tileId} не знайдено!`);
          continue;
        }
        
        // ✅ Визначаємо ключ текстури (з Tilemap або звичайний)
        let key: string;
        if (tileConfig?.dirtTilesetKey !== undefined) {
          // ✅ DIRT тайли (ТАК САМО ЯК FOREST!)
          if (tileConfig.dirtTilesetKey === "dirt_tiles") {
            key = "dirt_tiles_key";
          } else if (tileConfig.dirtTilesetKey === "dirt") {
            key = "dirt_key";
          } else {
            key = `tile-${tileId}`; // fallback
          }
        } else if (tileConfig?.directTextureKey !== undefined) {
          // ✅ Використовуємо прямий ключ текстури (вже оброблений!)
          key = tileConfig.directTextureKey;
        } else if (tileConfig?.forestsTilesetKey !== undefined) {
          // Використовуємо окремі файли Forests тайлів
          // Використовуємо випадковий індекс на основі позиції для різноманітності
          const seed = x * 31 + y * 17; // Простий seed на основі позиції
          const tileIndex = (seed % 18); // 18 тайлів в наборі
          const tileNum = tileIndex.toString().padStart(2, '0');
          key = `forest_tile_${tileNum}`;
        } else if (tileConfig?.tilemapKey !== undefined) {
          // Використовуємо тайл з Tiny Swords Tilemap (вирізаний)
          // Може бути tileIndex або row/col (для сумісності)
          if (tileConfig.tilemapRow !== undefined && tileConfig.tilemapCol !== undefined) {
            // Старий формат (row/col) - конвертуємо в індекс
            const tileIndex = (tileConfig.tilemapRow || 0) * 2 + (tileConfig.tilemapCol || 0);
            key = getTilemapTileKey(tileConfig.tilemapKey, tileIndex);
          } else if (tileConfig.tilemapIndex !== undefined) {
            // Новий формат (індекс 0-5)
            key = getTilemapTileKey(tileConfig.tilemapKey, tileConfig.tilemapIndex);
          } else {
            // За замовчуванням - перший тайл
            key = getTilemapTileKey(tileConfig.tilemapKey, 0);
          }
        } else {
          // Використовуємо звичайний тайл
          key = `tile-${tileId}`;
        }

        // ✅ Отримуємо розмір тайла в клітинках
        const gridSize = tileConfig?.gridSize ?? { width: 1, height: 1 };
        const gridW = gridSize.width;
        const gridH = gridSize.height;

        // ✅ Обчислюємо центр області тайла
        const centerX = x + (gridW - 1) / 2;
        const centerY = y + (gridH - 1) / 2;
        const centerPoint: GridPoint = { x: centerX, y: centerY };
        const { x: sx, y: sy } = this.iso.cellToScreen(centerPoint);

        // ✅ Перевіряємо, чи існує текстура
        if (!this.scene.textures.exists(key)) {
          console.warn(`⚠️ Текстура ${key} не знайдена для тайла ${tileId} на позиції (${x}, ${y})`);
          // Використовуємо fallback - кольоровий тайл
          const fallbackKey = `tile-${tileId}`;
          if (!this.scene.textures.exists(fallbackKey)) {
            continue; // Пропускаємо, якщо немає fallback
          }
          key = fallbackKey;
        }

        // ✅ Визначаємо origin в залежності від типу тайла
        const originX = 0.5;
        let originY = 0.5; // Для підлоги за замовчуванням
        
        // ✅ DIRT тайли мають ромб ВНИЗУ (як об'єкти)!
        const isDirtTile = tileConfig?.dirtTilesetKey !== undefined;
        
        if (layerType === 'object' || isDirtTile) {
          originY = 1; // ✅ Низ по центру (для об'єктів та DIRT!)
        }
        
        const spr = this.scene.add.image(sx, sy, key).setOrigin(originX, originY);

        // ✅ Застосовуємо масштабування з конфігурації
        const scale = tileConfig?.scale ?? 1;
        const scaleX = typeof scale === "number" ? scale : scale.x;
        const scaleY = typeof scale === "number" ? scale : scale.y;

        // ✅ Різна логіка для різних типів тайлів
        if (layerType === 'object') {
          // ✅ Об'єкти (barrel): оригінальний розмір з scale
          spr.setScale(scaleX, scaleY);
        } else if (isDirtTile) {
          // ✅ DIRT тайли: автоматичний scale під розмір тайла (82x42)
          const texture = spr.texture;
          const originalWidth = texture.source[0].width;
          const originalHeight = texture.source[0].height;
          
          // Розраховуємо scale так, щоб ширина відповідала W (82px)
          const autoScaleX = (W * gridW) / originalWidth;
          const autoScaleY = (H * gridH) / originalHeight;
          
          // Використовуємо менший scale, щоб зберегти пропорції
          const finalScale = Math.min(autoScaleX, autoScaleY);
          
          spr.setScale(finalScale * scaleX, finalScale * scaleY);
          
          console.log(`🟤 DIRT scale: ${originalWidth}x${originalHeight} → scale=${finalScale.toFixed(2)} → ${(originalWidth * finalScale).toFixed(0)}x${(originalHeight * finalScale).toFixed(0)}`);
        } else {
          // ✅ Для підлоги (forest, floor): розтягуємо на весь простір тайла
          const displayWidth = W * gridW * scaleX;
          const displayHeight = H * gridH * scaleY;
          spr.setDisplaySize(displayWidth, displayHeight);
        }

        // ✅ Застосовуємо offset якщо є
        if (tileConfig?.offset) {
          spr.x += tileConfig.offset.x;
          spr.y += tileConfig.offset.y;
        }

        // ✅ Вимкнемо фільтри та ефекти, які можуть додавати контур
        spr.setTint(0xffffff); // Без відтінку
        spr.setAlpha(1); // Повна непрозорість

        // ✅ Встановлюємо фільтр для уникнення артефактів при масштабуванні
        if (spr.texture) {
          spr.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        }

        targetContainer.add(spr); // ✅ Додаємо до правильного контейнера (floor або object)
        renderedCount++;

        // ✅ Позначаємо всі клітинки, які займає цей тайл
        for (let dy = 0; dy < gridH; dy++) {
          for (let dx = 0; dx < gridW; dx++) {
            const cellX = x + dx;
            const cellY = y + dy;
            if (cellX < this.grid.cols && cellY < this.grid.rows) {
              renderedTiles.add(`${cellX},${cellY}`);
            }
          }
        }
      }
    }
    
    console.log(`✅ Шар ${layerType}: відрендерено ${renderedCount} тайлів`);
  }

  private createTileTextures() {
    const { tileW: W, tileH: H } = this.iso;

    // ✅ Створюємо текстури для всіх типів тайлів
    for (const tileConfig of TILE_CONFIGS) {
      // ✅ Пропускаємо тайли з Tilemap, Forests tileset, DIRT тайлами та прямими текстурами (вони вже оброблені)
      if (tileConfig.tilemapKey !== undefined) continue;
      if (tileConfig.forestsTilesetKey !== undefined) continue;
      if (tileConfig.dirtTilesetKey !== undefined) continue; // ✅ Пропускаємо DIRT (як forest)!
      if (tileConfig.directTextureKey !== undefined) continue; // ✅ Пропускаємо з прямими ключами!

      const key = `tile-${tileConfig.id}`;
      if (this.scene.textures.exists(key)) continue;

      if (!tileConfig.imageUrl) {
        // ✅ Fallback: програмне малювання з кольором (без контуру)
        const g = this.scene.add.graphics();
        g.fillStyle(tileConfig.color, 1);
        // ✅ Прибираємо контур для чистішого вигляду
        g.beginPath();
        g.moveTo(W / 2, 0);
        g.lineTo(W, H / 2);
        g.lineTo(W / 2, H);
        g.lineTo(0, H / 2);
        g.closePath();
        g.fillPath();
        // ✅ Не додаємо strokePath() щоб не було контуру
        g.generateTexture(key, W, H);
        g.destroy();
      }
      // Якщо imageUrl вказано, зображення вже завантажено через preload
      // Використовуємо його безпосередньо
    }
  }
}
