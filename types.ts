
export enum Wall {
  Top = 0,
  Right = 1,
  Bottom = 2,
  Left = 3
}

export interface Cell {
  i: number; // grid row
  j: number; // grid column
  walls: [boolean, boolean, boolean, boolean]; // T, R, B, L
  visited: boolean;
}

export interface MazeConfig {
  cellSize: number;
  speed: number;
  neonCyan: string;
  neonMagenta: string;
  neonYellow: string;
}

export enum AlgorithmStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED'
}
