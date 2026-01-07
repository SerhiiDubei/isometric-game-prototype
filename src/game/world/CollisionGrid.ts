// src/game/world/CollisionGrid.ts

export interface GridOccupant {
  id: string;        // tileId
  x: number;         // top-left grid coordinate
  y: number;
  gridWidth: number; // кількість клітин по X
  gridHeight: number; // кількість клітин по Y
}

export class CollisionGrid {
  private occupiedCells: Map<string, GridOccupant> = new Map();
  
  constructor(
    private worldWidth: number,
    private worldHeight: number
  ) {}

  // Додати об'єкт, що займає gridW × gridH клітин
  addOccupant(x: number, y: number, gridW: number, gridH: number, tileId: string): void {
    const occupant: GridOccupant = { id: tileId, x, y, gridWidth: gridW, gridHeight: gridH };
    
    // Реєструємо всі клітини, які займає об'єкт
    const occupiedCells: string[] = [];
    for (let dy = 0; dy < gridH; dy++) {
      for (let dx = 0; dx < gridW; dx++) {
        const cellKey = this.getCellKey(x + dx, y + dy);
        this.occupiedCells.set(cellKey, occupant);
        occupiedCells.push(`(${x + dx},${y + dy})`);
      }
    }
    
    console.log(`🔒 [WALL REGISTERED] ${tileId} occupies cells: ${occupiedCells.join(', ')}`);
  }

  // Перевірити, чи зайнята клітина
  isOccupied(x: number, y: number): boolean {
    const cellKey = this.getCellKey(x, y);
    return this.occupiedCells.has(cellKey);
  }

  // Перевірити, чи можна рухатись до клітини
  canMoveTo(x: number, y: number): boolean {
    if (x < 0 || x >= this.worldWidth || y < 0 || y >= this.worldHeight) {
      console.log(`🚫 [OUT OF BOUNDS] (${x},${y}) is outside world`);
      return false;
    }
    
    const occupied = this.isOccupied(x, y);
    const occupant = occupied ? this.getOccupant(x, y) : null;
    
    if (occupied) {
      console.log(`🚫 [MOVE CHECK] Cannot move to (${x},${y}) - cell occupied by ${occupant?.id || 'unknown'}`);
    } else {
      console.log(`✅ [MOVE CHECK] Can move to (${x},${y}) - cell is free`);
    }
    
    return !occupied;
  }

  private getCellKey(x: number, y: number): string {
    return `${Math.floor(x)},${Math.floor(y)}`;
  }

  // Отримати інформацію про occupant клітини
  getOccupant(x: number, y: number): GridOccupant | undefined {
    const cellKey = this.getCellKey(x, y);
    return this.occupiedCells.get(cellKey);
  }

  // Очистити всі occupancy (для регенерації карти)
  clear(): void {
    this.occupiedCells.clear();
    console.log('🧹 [COLLISION GRID] Cleared all occupants');
  }
}

