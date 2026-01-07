// src/game/world/__tests__/CollisionGrid.spec.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { CollisionGrid } from '../CollisionGrid';

describe('CollisionGrid', () => {
  let collisionGrid: CollisionGrid;

  beforeEach(() => {
    collisionGrid = new CollisionGrid(240, 240);
  });

  describe('addOccupant', () => {
    it('should register single-cell occupant', () => {
      collisionGrid.addOccupant(10, 20, 1, 1, 'barrel');
      
      expect(collisionGrid.isOccupied(10, 20)).toBe(true);
      expect(collisionGrid.isOccupied(11, 20)).toBe(false);
      expect(collisionGrid.isOccupied(10, 21)).toBe(false);
    });

    it('should register 2x1 wall occupant', () => {
      collisionGrid.addOccupant(100, 100, 2, 1, 'stonewall_n');
      
      // Both cells should be occupied
      expect(collisionGrid.isOccupied(100, 100)).toBe(true);
      expect(collisionGrid.isOccupied(101, 100)).toBe(true);
      expect(collisionGrid.isOccupied(100, 101)).toBe(false);
      expect(collisionGrid.isOccupied(101, 101)).toBe(false);
    });

    it('should register 2x2 corner occupant', () => {
      collisionGrid.addOccupant(50, 50, 2, 2, 'stonewall_corner_n');
      
      // All 4 cells should be occupied
      expect(collisionGrid.isOccupied(50, 50)).toBe(true);
      expect(collisionGrid.isOccupied(51, 50)).toBe(true);
      expect(collisionGrid.isOccupied(50, 51)).toBe(true);
      expect(collisionGrid.isOccupied(51, 51)).toBe(true);
    });

    it('should overwrite previous occupant when adding to same cell', () => {
      collisionGrid.addOccupant(10, 10, 1, 1, 'barrel');
      collisionGrid.addOccupant(10, 10, 1, 1, 'stonewall_n');
      
      const occupant = collisionGrid.getOccupant(10, 10);
      expect(occupant?.id).toBe('stonewall_n');
    });
  });

  describe('isOccupied', () => {
    it('should return false for empty cells', () => {
      expect(collisionGrid.isOccupied(0, 0)).toBe(false);
      expect(collisionGrid.isOccupied(100, 100)).toBe(false);
    });

    it('should return true for occupied cells', () => {
      collisionGrid.addOccupant(5, 5, 1, 1, 'barrel');
      expect(collisionGrid.isOccupied(5, 5)).toBe(true);
    });
  });

  describe('canMoveTo', () => {
    it('should allow movement to free cells', () => {
      expect(collisionGrid.canMoveTo(10, 10)).toBe(true);
    });

    it('should block movement to occupied cells', () => {
      collisionGrid.addOccupant(10, 10, 1, 1, 'barrel');
      expect(collisionGrid.canMoveTo(10, 10)).toBe(false);
    });

    it('should block movement outside world bounds', () => {
      expect(collisionGrid.canMoveTo(-1, 10)).toBe(false);
      expect(collisionGrid.canMoveTo(10, -1)).toBe(false);
      expect(collisionGrid.canMoveTo(240, 10)).toBe(false);
      expect(collisionGrid.canMoveTo(10, 240)).toBe(false);
    });

    it('should allow movement to edge cells (within bounds)', () => {
      expect(collisionGrid.canMoveTo(0, 0)).toBe(true);
      expect(collisionGrid.canMoveTo(239, 239)).toBe(true);
    });

    it('should block movement to cells occupied by 2x1 wall', () => {
      collisionGrid.addOccupant(100, 100, 2, 1, 'stonewall_n');
      
      expect(collisionGrid.canMoveTo(100, 100)).toBe(false);
      expect(collisionGrid.canMoveTo(101, 100)).toBe(false);
      expect(collisionGrid.canMoveTo(100, 101)).toBe(true);
      expect(collisionGrid.canMoveTo(101, 101)).toBe(true);
    });

    it('should block movement to cells occupied by 2x2 corner', () => {
      collisionGrid.addOccupant(50, 50, 2, 2, 'stonewall_corner_n');
      
      expect(collisionGrid.canMoveTo(50, 50)).toBe(false);
      expect(collisionGrid.canMoveTo(51, 50)).toBe(false);
      expect(collisionGrid.canMoveTo(50, 51)).toBe(false);
      expect(collisionGrid.canMoveTo(51, 51)).toBe(false);
      expect(collisionGrid.canMoveTo(52, 50)).toBe(true);
      expect(collisionGrid.canMoveTo(50, 52)).toBe(true);
    });
  });

  describe('getOccupant', () => {
    it('should return occupant information for occupied cell', () => {
      collisionGrid.addOccupant(10, 20, 2, 1, 'stonewall_n');
      
      const occupant = collisionGrid.getOccupant(10, 20);
      expect(occupant).toBeDefined();
      expect(occupant?.id).toBe('stonewall_n');
      expect(occupant?.x).toBe(10);
      expect(occupant?.y).toBe(20);
      expect(occupant?.gridWidth).toBe(2);
      expect(occupant?.gridHeight).toBe(1);
    });

    it('should return same occupant for all cells of multi-cell object', () => {
      collisionGrid.addOccupant(100, 100, 2, 2, 'stonewall_corner_n');
      
      const occupant1 = collisionGrid.getOccupant(100, 100);
      const occupant2 = collisionGrid.getOccupant(101, 100);
      const occupant3 = collisionGrid.getOccupant(100, 101);
      const occupant4 = collisionGrid.getOccupant(101, 101);
      
      expect(occupant1?.id).toBe('stonewall_corner_n');
      expect(occupant2?.id).toBe('stonewall_corner_n');
      expect(occupant3?.id).toBe('stonewall_corner_n');
      expect(occupant4?.id).toBe('stonewall_corner_n');
    });

    it('should return undefined for empty cells', () => {
      expect(collisionGrid.getOccupant(0, 0)).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should clear all occupants', () => {
      collisionGrid.addOccupant(10, 10, 1, 1, 'barrel');
      collisionGrid.addOccupant(20, 20, 2, 1, 'stonewall_n');
      
      expect(collisionGrid.isOccupied(10, 10)).toBe(true);
      expect(collisionGrid.isOccupied(20, 20)).toBe(true);
      
      collisionGrid.clear();
      
      expect(collisionGrid.isOccupied(10, 10)).toBe(false);
      expect(collisionGrid.isOccupied(20, 20)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle fractional coordinates', () => {
      collisionGrid.addOccupant(10, 10, 1, 1, 'barrel');
      
      // getCellKey should floor coordinates
      expect(collisionGrid.isOccupied(10.5, 10.5)).toBe(true);
      expect(collisionGrid.isOccupied(10.9, 10.9)).toBe(true);
    });

    it('should handle overlapping occupants', () => {
      collisionGrid.addOccupant(10, 10, 2, 1, 'stonewall_n');
      collisionGrid.addOccupant(11, 10, 2, 1, 'stonewall_e');
      
      // Cell (11, 10) should be occupied by the last added occupant
      const occupant = collisionGrid.getOccupant(11, 10);
      expect(occupant?.id).toBe('stonewall_e');
    });
  });
});

