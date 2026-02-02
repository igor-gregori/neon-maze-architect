
import { Cell, Wall } from '../types';

export class MazeGenerator {
  public grid: Cell[] = [];
  public stack: Cell[] = [];
  public current: Cell | null = null;
  public rows: number = 0;
  public cols: number = 0;
  public finished: boolean = false;

  constructor(width: number, height: number, cellSize: number) {
    this.cols = Math.max(1, Math.floor(width / cellSize));
    this.rows = Math.max(1, Math.floor(height / cellSize));

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.grid.push({
          i,
          j,
          walls: [true, true, true, true],
          visited: false,
        });
      }
    }

    if (this.grid.length > 0) {
      const startIndex = Math.floor(Math.random() * this.grid.length);
      this.current = this.grid[startIndex];
      if (this.current) {
        this.current.visited = true;
      }
    } else {
      this.finished = true;
    }
  }

  private index(i: number, j: number): number {
    if (i < 0 || j < 0 || i >= this.rows || j >= this.cols) return -1;
    return j + i * this.cols;
  }

  public step() {
    if (this.finished || !this.current) return;

    const neighbors = this.getUnvisitedNeighbors(this.current);

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      next.visited = true;
      this.stack.push(this.current);
      this.removeWalls(this.current, next);
      this.current = next;
    } else if (this.stack.length > 0) {
      this.current = this.stack.pop() || null;
    } else {
      this.finished = true;
      this.current = null;
    }
  }

  private getUnvisitedNeighbors(cell: Cell): Cell[] {
    const neighbors: Cell[] = [];
    const { i, j } = cell;

    const topIdx = this.index(i - 1, j);
    const rightIdx = this.index(i, j + 1);
    const bottomIdx = this.index(i + 1, j);
    const leftIdx = this.index(i, j - 1);

    const top = topIdx !== -1 ? this.grid[topIdx] : null;
    const right = rightIdx !== -1 ? this.grid[rightIdx] : null;
    const bottom = bottomIdx !== -1 ? this.grid[bottomIdx] : null;
    const left = leftIdx !== -1 ? this.grid[leftIdx] : null;

    if (top && !top.visited) neighbors.push(top);
    if (right && !right.visited) neighbors.push(right);
    if (bottom && !bottom.visited) neighbors.push(bottom);
    if (left && !left.visited) neighbors.push(left);

    return neighbors;
  }

  private removeWalls(a: Cell, b: Cell) {
    const di = a.i - b.i;
    if (di === 1) {
      a.walls[Wall.Top] = false;
      b.walls[Wall.Bottom] = false;
    } else if (di === -1) {
      a.walls[Wall.Bottom] = false;
      b.walls[Wall.Top] = false;
    }

    const dj = a.j - b.j;
    if (dj === 1) {
      a.walls[Wall.Left] = false;
      b.walls[Wall.Right] = false;
    } else if (dj === -1) {
      a.walls[Wall.Right] = false;
      b.walls[Wall.Left] = false;
    }
  }

  /**
   * Solves the maze from (0,0) to (rows-1, cols-1) using BFS.
   * Since it's a perfect maze, only one path exists.
   */
  public getSolutionPath(): Cell[] {
    if (this.grid.length === 0) return [];
    
    const start = this.grid[0];
    const end = this.grid[this.grid.length - 1];
    
    const queue: Cell[] = [start];
    const visited = new Set<string>();
    const parentMap = new Map<string, Cell>();
    
    visited.add(`${start.i},${start.j}`);
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === end) {
        // Reconstruct path
        const path: Cell[] = [];
        let curr: Cell | undefined = end;
        while (curr) {
          path.push(curr);
          curr = parentMap.get(`${curr.i},${curr.j}`);
        }
        return path.reverse();
      }
      
      const neighbors = this.getAccessibleNeighbors(current);
      for (const neighbor of neighbors) {
        const key = `${neighbor.i},${neighbor.j}`;
        if (!visited.has(key)) {
          visited.add(key);
          parentMap.set(key, current);
          queue.push(neighbor);
        }
      }
    }
    
    return [];
  }

  private getAccessibleNeighbors(cell: Cell): Cell[] {
    const accessible: Cell[] = [];
    const { i, j } = cell;
    
    // Check all 4 walls. If false, neighbor is accessible.
    if (!cell.walls[Wall.Top]) {
      const n = this.grid[this.index(i - 1, j)];
      if (n) accessible.push(n);
    }
    if (!cell.walls[Wall.Right]) {
      const n = this.grid[this.index(i, j + 1)];
      if (n) accessible.push(n);
    }
    if (!cell.walls[Wall.Bottom]) {
      const n = this.grid[this.index(i + 1, j)];
      if (n) accessible.push(n);
    }
    if (!cell.walls[Wall.Left]) {
      const n = this.grid[this.index(i, j - 1)];
      if (n) accessible.push(n);
    }
    
    return accessible;
  }
}
