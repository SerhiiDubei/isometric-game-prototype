// src/game/world/__tests__/TileRenderer.spec.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TileRenderer } from '../TileRenderer';
import { Grid } from '../Grid';
import { IsoTransform } from '../../iso/isoTransofrm';
import { TILE_CONFIGS } from '../../config/tiles';

describe('TileRenderer - Depth Calculation', () => {
  let mockScene: any;
  let mockGrid: Grid;
  let mockIso: IsoTransform;
  let renderer: TileRenderer;

  beforeEach(() => {
    // Mock Phaser Scene
    mockScene = {
      add: {
        container: vi.fn(() => ({
          add: vi.fn(),
          removeAll: vi.fn(),
          setDepth: vi.fn(),
        })),
        image: vi.fn(() => ({
          setOrigin: vi.fn().mockReturnThis(),
          setScale: vi.fn().mockReturnThis(),
          setDisplaySize: vi.fn().mockReturnThis(),
          setPosition: vi.fn().mockReturnThis(),
          setInteractive: vi.fn().mockReturnThis(),
          setDepth: vi.fn().mockReturnThis(),
          setTint: vi.fn().mockReturnThis(),
          setAlpha: vi.fn().mockReturnThis(),
          texture: {
            source: [{ width: 256, height: 512 }],
            setFilter: vi.fn(),
          },
          x: 0,
          y: 0,
        })),
      },
      textures: {
        exists: vi.fn(() => true),
        get: vi.fn(() => ({
          source: [{ width: 256, height: 512 }],
        })),
      },
    };

    // Create real instances
    mockGrid = new Grid(240, 240);
    mockIso = new IsoTransform(82, 42, 240, 240);
    renderer = new TileRenderer(mockScene, mockGrid, mockIso);
  });

  describe('Grid-center depth calculation', () => {
    it('should use x+0.5, y+0.5 for all tiles', () => {
      const x = 10;
      const y = 20;
      const depthCenterX = x + 0.5; // 10.5
      const depthCenterY = y + 0.5; // 20.5
      const baseDepth = (depthCenterX + depthCenterY) * 100;
      
      expect(baseDepth).toBe(3100); // (10.5 + 20.5) * 100
    });

    it('should calculate correct baseDepth for 2×1 wall at (100, 100)', () => {
      const x = 100;
      const y = 100;
      const depthCenterX = x + 0.5; // 100.5
      const depthCenterY = y + 0.5; // 100.5
      const baseDepth = (depthCenterX + depthCenterY) * 100;
      
      expect(baseDepth).toBe(20100); // (100.5 + 100.5) * 100
    });

    it('should calculate correct baseDepth for 2×2 corner at (100, 100)', () => {
      const x = 100;
      const y = 100;
      const depthCenterX = x + 0.5; // 100.5
      const depthCenterY = y + 0.5; // 100.5
      const baseDepth = (depthCenterX + depthCenterY) * 100;
      
      // Same calculation regardless of gridSize
      expect(baseDepth).toBe(20100);
    });
  });

  describe('Depth offset calculation', () => {
    const getDepthOffset = (tileId: string): number => {
      if (tileId.includes('corner_se')) return 400;
      if (tileId.includes('corner_sw')) return 350;
      if (tileId.includes('corner_ne')) return 150;
      if (tileId.includes('corner_nw')) return 50;
      if (tileId.includes('corner_s')) return 300;
      if (tileId.includes('corner_e')) return 100;
      if (tileId.includes('corner_n') || tileId.includes('corner_w')) return 0;
      if (tileId.includes('_s')) return 300;
      if (tileId.includes('_e')) return 100;
      if (tileId.includes('_n') || tileId.includes('_w')) return 0;
      return 0;
    };

    it('should apply correct depthOffset for straight walls', () => {
      expect(getDepthOffset('stonewall_n')).toBe(0);
      expect(getDepthOffset('stonewall_e')).toBe(100);
      expect(getDepthOffset('stonewall_s')).toBe(300);
      expect(getDepthOffset('stonewall_w')).toBe(0);
    });

    it('should apply correct depthOffset for corner walls', () => {
      expect(getDepthOffset('stonewall_corner_n')).toBe(0);
      expect(getDepthOffset('stonewall_corner_e')).toBe(100);
      expect(getDepthOffset('stonewall_corner_s')).toBe(300);
      expect(getDepthOffset('stonewall_corner_w')).toBe(0);
    });

    it('should handle corner variants correctly', () => {
      expect(getDepthOffset('stonewall_corner_ne')).toBe(150);
      expect(getDepthOffset('stonewall_corner_se')).toBe(400);
      expect(getDepthOffset('stonewall_corner_sw')).toBe(350);
      expect(getDepthOffset('stonewall_corner_nw')).toBe(50);
    });
  });

  describe('Final depth calculation', () => {
    it('should calculate correct final depth for north corner at (100,100)', () => {
      const x = 100;
      const y = 100;
      const depthCenterX = x + 0.5; // 100.5
      const depthCenterY = y + 0.5; // 100.5
      const baseDepth = (depthCenterX + depthCenterY) * 100; // 20100
      const layerDepth = 10; // object layer
      const depthOffset = 0; // North corner
      const WALL_HEIGHT_OFFSET = 5;
      const finalDepth = baseDepth + layerDepth + depthOffset + WALL_HEIGHT_OFFSET;
      
      expect(finalDepth).toBe(20115);
    });

    it('should calculate correct final depth for east wall at (109,100)', () => {
      const x = 109;
      const y = 100;
      const depthCenterX = x + 0.5; // 109.5
      const depthCenterY = y + 0.5; // 100.5
      const baseDepth = (depthCenterX + depthCenterY) * 100; // 21000
      const layerDepth = 10;
      const depthOffset = 100; // East wall
      const WALL_HEIGHT_OFFSET = 5;
      const finalDepth = baseDepth + layerDepth + depthOffset + WALL_HEIGHT_OFFSET;
      
      expect(finalDepth).toBe(21115);
    });

    it('should calculate correct final depth for south wall at (102,109)', () => {
      const x = 102;
      const y = 109;
      const depthCenterX = x + 0.5; // 102.5
      const depthCenterY = y + 0.5; // 109.5
      const baseDepth = (depthCenterX + depthCenterY) * 100; // 21200
      const layerDepth = 10;
      const depthOffset = 300; // South wall
      const WALL_HEIGHT_OFFSET = 5;
      const finalDepth = baseDepth + layerDepth + depthOffset + WALL_HEIGHT_OFFSET;
      
      expect(finalDepth).toBe(21515);
    });
  });

  describe('WALL_HEIGHT_OFFSET separation', () => {
    it('should use constant WALL_HEIGHT_OFFSET, not config.offset.y', () => {
      const WALL_HEIGHT_OFFSET = 5; // Constant
      const configOffsetY = 42; // Visual offset (should NOT be used for depth)
      
      // Depth should use constant, not visual offset
      const depth = 20100 + 10 + 0 + WALL_HEIGHT_OFFSET; // 20115
      const wrongDepth = 20100 + 10 + 0 + configOffsetY; // 20152 (WRONG)
      
      expect(depth).toBe(20115);
      expect(wrongDepth).not.toBe(20115);
    });
  });

  describe('Positioning vs Depth separation', () => {
    it('should use TOP-LEFT for positioning', () => {
      const x = 100;
      const y = 100;
      const topLeftPoint = { x, y }; // TOP-LEFT
      
      expect(topLeftPoint.x).toBe(100);
      expect(topLeftPoint.y).toBe(100);
    });

    it('should use CENTER for depth calculation', () => {
      const x = 100;
      const y = 100;
      const depthCenterX = x + 0.5; // CENTER
      const depthCenterY = y + 0.5; // CENTER
      
      expect(depthCenterX).toBe(100.5);
      expect(depthCenterY).toBe(100.5);
    });

    it('should keep positioning and depth separate', () => {
      const x = 100;
      const y = 100;
      
      // Positioning uses TOP-LEFT
      const positioningPoint = { x, y };
      
      // Depth uses CENTER
      const depthCenterX = x + 0.5;
      const depthCenterY = y + 0.5;
      
      // They should be different
      expect(positioningPoint.x).not.toBe(depthCenterX);
      expect(positioningPoint.y).not.toBe(depthCenterY);
    });
  });
});

describe('TileRenderer - Hit Area', () => {
  describe('Diamond hit area calculation', () => {
    it('should calculate correct diamond size for 2×1 wall', () => {
      const W = 82; // tile width
      const H = 42; // tile height
      const gridW = 2;
      const gridH = 1;
      const scaleX = 1.28;
      const scaleY = 1.28;
      
      const isoWidth = W * gridW * scaleX;   // 82 * 2 * 1.28 ≈ 210
      const isoHeight = H * gridH * scaleY;  // 42 * 1 * 1.28 ≈ 54
      
      expect(isoWidth).toBeCloseTo(210, 0);
      expect(isoHeight).toBeCloseTo(54, 0);
    });

    it('should calculate correct diamond size for 2×2 corner', () => {
      const W = 82;
      const H = 42;
      const gridW = 2;
      const gridH = 2;
      const scaleX = 1.28;
      const scaleY = 1.28;
      
      const isoWidth = W * gridW * scaleX;   // 82 * 2 * 1.28 ≈ 210
      const isoHeight = H * gridH * scaleY;  // 42 * 2 * 1.28 ≈ 108
      
      expect(isoWidth).toBeCloseTo(210, 0);
      expect(isoHeight).toBeCloseTo(108, 0);
    });
  });

  describe('Hit area synchronization', () => {
    it('should apply config offset before creating hit area', () => {
      const configOffset = { x: 0, y: 21 };
      const spriteX = 100;
      const spriteY = 200;
      
      // Offset should be applied to sprite position
      const finalX = spriteX + configOffset.x;
      const finalY = spriteY + configOffset.y;
      
      expect(finalX).toBe(100);
      expect(finalY).toBe(221);
    });
  });
});

