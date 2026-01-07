# 📄 Isometric Walls Depth Calculation Documentation

**Repository:** https://github.com/SerhiiDubei/isometric-game-prototype  
**Target files:** `TileRenderer.ts`, `tiles.ts`  
**Date:** 2026-01-07

## 🎯 1. Context & Goals

**Objective:** Implement correct depth ordering for isometric 2×1 straight walls and 2×2 corner walls with transparent pixel collision handling.

**Core depth rule:**
```typescript
effectiveX = x + 0.5
effectiveY = y + 0.5
depth = (effectiveX + effectiveY) * 100 + layerDepth + depthOffset + WALL_HEIGHT_OFFSET
```

**Critical requirement:** Depth must be calculated before sprite creation and container assignment to ensure correct Z-ordering.

## 🔍 2. Implementation Summary

### ✅ Positioning vs Depth Separation

**Positioning:** Uses TOP-LEFT grid corner `(x, y)` for sprite placement  
**Depth:** Uses CENTER `(x+0.5, y+0.5)` for Z-ordering

```typescript
// 1️⃣ Positioning: TOP-LEFT corner
const topLeftPoint: GridPoint = { x, y };
const { x: sx, y: sy } = this.iso.cellToScreen(topLeftPoint);

// 2️⃣ Depth: CENTER for Z-ordering
const depthCenterX = x + 0.5;
const depthCenterY = y + 0.5;
```

### ✅ Depth Calculation Formula

```typescript
const baseDepth = (depthCenterX + depthCenterY) * 100;
const layerDepth = layerType === 'object' ? 10 : 0;
const WALL_HEIGHT_OFFSET = 5; // Constant, NOT visual offset!

// Orientation-based depth offset
let depthOffset = 0;
if (tileId.includes('corner_se')) depthOffset = 400;
else if (tileId.includes('corner_sw')) depthOffset = 350;
else if (tileId.includes('corner_ne')) depthOffset = 150;
else if (tileId.includes('corner_nw')) depthOffset = 50;
else if (tileId.includes('corner_s')) depthOffset = 300;
else if (tileId.includes('corner_e')) depthOffset = 100;
else if (tileId.includes('corner_n') || tileId.includes('corner_w')) depthOffset = 0;
else if (tileId.includes('_s')) depthOffset = 300;
else if (tileId.includes('_e')) depthOffset = 100;
else if (tileId.includes('_n') || tileId.includes('_w')) depthOffset = 0;

const finalDepth = baseDepth + layerDepth + depthOffset + WALL_HEIGHT_OFFSET;
spr.setDepth(finalDepth);
```

### ✅ Hit Area Synchronization

Hit areas are created AFTER applying config offsets to ensure collision detection matches visual sprite position:

```typescript
// Apply offset BEFORE creating hit area
if (tileConfig?.offset) {
  spr.x += tileConfig.offset.x;
  spr.y += tileConfig.offset.y;
}

// Create hit area AFTER offset
if (isWallTile) {
  const isoWidth = W * gridW * scaleX;
  const isoHeight = H * gridH * scaleY;
  
  const wallBase = new Phaser.Geom.Polygon([
    0, -isoHeight,               // top
    isoWidth / 2, -isoHeight / 2, // right
    0, 0,                         // bottom (origin)
    -isoWidth / 2, -isoHeight / 2 // left
  ]);
  
  spr.setInteractive(wallBase, Phaser.Geom.Polygon.Contains);
}
```

## 🧱 3. Tile Configuration

### Wall Grid Sizes

| Tile Type | gridSize | Scale | Offset |
|-----------|----------|-------|--------|
| `stonewall_n/e/s/w` | `{ width: 2, height: 1 }` | `≈ { x: 1.28, y: 1.28 }` | `{ x: 0, y: 21 }` |
| `stonewall_corner_n/e/s/w` | `{ width: 2, height: 2 }` | `≈ { x: 1.28, y: 1.28 }` | `{ x: 0, y: 42 }` |

### Base Dimensions

- **ISO Tile:** 82×42px (GAME.tileW × GAME.tileH)
- **Wall Sprite:** 256×512px (original texture size)
- **Scale:** Base 0.64 × 2 = 1.28 (doubled)

## 📊 4. Depth Offset Values

| Orientation | depthOffset | Description |
|-------------|-------------|-------------|
| North/West | 0 | Front (rendered first) |
| East | 100 | Right side |
| South | 300 | Back (rendered last) |
| Corner NE | 150 | North-East |
| Corner SE | 400 | South-East |
| Corner SW | 350 | South-West |
| Corner NW | 50 | North-West |

## 🎯 5. Reference Values

### Sample Depth Calculations

| Tile | Grid (x,y) | depthCenter | baseDepth | layer | depthOffset | wallHeight | finalDepth |
|------|------------|-------------|-----------|-------|-------------|------------|------------|
| `stonewall_corner_n` | (100,100) | (100.5,100.5) | 20100 | 10 | 0 | 5 | 20115 ✅ |
| `stonewall_n` | (102,100) | (102.5,100.5) | 20300 | 10 | 0 | 5 | 20315 ✅ |
| `stonewall_corner_e` | (109,100) | (109.5,100.5) | 21000 | 10 | 100 | 5 | 21115 ✅ |
| `stonewall_w` | (100,109) | (100.5,109.5) | 21000 | 10 | 0 | 5 | 21015 ✅ |
| `stonewall_s` | (102,109) | (102.5,109.5) | 21200 | 10 | 300 | 5 | 21515 ✅ |
| `stonewall_corner_w` | (100,109) | (100.5,109.5) | 21000 | 10 | 0 | 5 | 21015 ✅ |

## 🔧 6. Key Insights

### Separation of Concerns

1. **Positioning:** Uses TOP-LEFT grid corner for sprite placement
2. **Depth:** Uses CENTER (x+0.5, y+0.5) for Z-ordering
3. **Visual offset:** Separate `config.offset` for sprite adjustment
4. **WALL_HEIGHT_OFFSET ≠ config.offset.y:**
   - `WALL_HEIGHT_OFFSET = 5`: Depth layering constant
   - `config.offset.y = 21/42`: Visual positioning adjustment
   - Must remain separate to avoid depth miscalculation

### Hit Area Synchronization

- Apply `config.offset` before creating hit area
- Ensures collision detection matches visual sprite position
- Diamond shape inherently excludes most transparent corner pixels

### Depth Ordering Robustness

- Center-based depth ensures consistency across multi-cell tiles
- Orientation-based offsets handle edge cases (N/E/S/W overlaps)
- Constant `WALL_HEIGHT_OFFSET` prevents depth calculation errors

## 📂 7. Code Locations

| Component | File | Lines | Description |
|-----------|------|-------|-------------|
| Depth center calculation | `TileRenderer.ts` | 189-191 | `depthCenterX/Y = x/y + 0.5` |
| Base depth formula | `TileRenderer.ts` | 331 | `baseDepth = (centerX + centerY) * 100` |
| depthOffset logic | `TileRenderer.ts` | 334-355 | Orientation-based offsets |
| WALL_HEIGHT_OFFSET | `TileRenderer.ts` | 360 | Constant = 5 |
| Final depth assignment | `TileRenderer.ts` | 363-364 | `spr.setDepth(finalDepth)` |
| Hit area creation | `TileRenderer.ts` | 291-311 | Diamond polygon with Contains |
| Wall config (straight) | `tiles.ts` | 75-108 | 2×1 walls with scale/offset |
| Wall config (corners) | `tiles.ts` | 111-145 | 2×2 corners with scale/offset |

## ✅ 8. Implementation Checklist

- ✅ Split positioning (TOP-LEFT) from depth (CENTER)
- ✅ Implement depth formula with center coordinates (x+0.5, y+0.5)
- ✅ Add orientation-based depthOffset logic
- ✅ Introduce WALL_HEIGHT_OFFSET constant (separate from visual offset)
- ✅ Remove SOUTH_OFFSET block
- ✅ Synchronize hit area with sprite offset
- ✅ Create diamond-shaped hit areas for walls
- ✅ Apply depth BEFORE container assignment
- ✅ Scale doubled (0.64 → 1.28)
- 🔄 Add unit tests for depth calculation
- 🔄 Run visual regression tests

## 🧪 9. Testing

See `TileRenderer.spec.ts` for unit tests covering:
- Depth calculation with center coordinates
- Orientation-based depth offsets
- Hit area synchronization
- Collision detection

## 📝 10. Commit History

- `75266fa`: Fix critical depth and positioning issues
- `4e40bbf`: Reduce wall sizes by 2x: restore scale from 1.28 to 0.64
- `35869a7`: Change wall gridSize from 2x2 to 2x1 (rectangle instead of square)
- `c8400cb`: Fix critical wall positioning and depth calculation issues

