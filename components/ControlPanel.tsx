
import React from 'react';
import { AlgorithmStatus } from '../types';
import { Play, Pause, RotateCcw, Zap, LayoutGrid, Info, Plus, Minus, Eye, EyeOff, Github } from 'lucide-react';

interface ControlPanelProps {
  status: AlgorithmStatus;
  speed: number;
  cellSize: number;
  showDiagnostics: boolean;
  setSpeed: (v: number) => void;
  setCellSize: (v: number) => void;
  setShowDiagnostics: (v: boolean) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  status,
  speed,
  cellSize,
  showDiagnostics,
  setSpeed,
  setCellSize,
  setShowDiagnostics,
  onStart,
  onPause,
  onReset
}) => {
  const handleSpeedChange = (delta: number) => {
    // Linear speed: 1 to 2000 steps per second
    setSpeed(Math.min(2000, Math.max(1, speed + delta)));
  };

  const handleDensityChange = (delta: number) => {
    if (status === AlgorithmStatus.GENERATING || status === AlgorithmStatus.PAUSED) return;
    setCellSize(Math.min(100, Math.max(4, cellSize + delta)));
  };

  return (
    <aside className="w-80 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-700 p-6 flex flex-col z-20 shadow-2xl overflow-y-auto custom-scrollbar">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
          <span className="text-cyan-400">🌀</span> Neon Maze
        </h1>
        <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">Architect Engine v1.4</p>
      </div>

      <div className="space-y-8 flex-1">
        {/* Speed Control */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3 text-yellow-400" /> Temporal Velocity
            </label>
            <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-mono font-bold text-cyan-400 border border-slate-700">
              {speed}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleSpeedChange(-10)}
              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shadow-sm"
              title="Decrease Speed"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input 
              type="range" 
              min="1" 
              max="2000" 
              value={speed} 
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <button 
              onClick={() => handleSpeedChange(10)}
              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shadow-sm"
              title="Increase Speed"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 text-center font-mono opacity-80">
            {speed} STEPS PER SECOND
          </p>
        </div>

        {/* Density Control */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-wider">
              <LayoutGrid className="w-3 h-3 text-pink-400" /> Geometric Density
            </label>
            <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-mono font-bold text-pink-400 border border-slate-700">
              {cellSize}px
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              disabled={status === AlgorithmStatus.GENERATING || status === AlgorithmStatus.PAUSED}
              onClick={() => handleDensityChange(-1)}
              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              title="Higher Density"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <input 
              type="range" 
              min="4" 
              max="100" 
              step="1"
              value={cellSize} 
              disabled={status === AlgorithmStatus.GENERATING || status === AlgorithmStatus.PAUSED}
              onChange={(e) => setCellSize(parseInt(e.target.value))}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-30"
            />
            <button 
              disabled={status === AlgorithmStatus.GENERATING || status === AlgorithmStatus.PAUSED}
              onClick={() => handleDensityChange(1)}
              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
              title="Lower Density"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex justify-between mt-2 text-[9px] text-slate-600 font-bold uppercase">
            <span>High (4px)</span>
            <span>Low (100px)</span>
          </div>
        </div>

        {/* Visibility Toggle */}
        <div className="pt-4 border-t border-slate-800">
          <button 
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-all border border-slate-700/50"
          >
            <span className="flex items-center gap-2">
              {showDiagnostics ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              Diagnostics HUD
            </span>
            <span className={showDiagnostics ? "text-cyan-400" : "text-slate-500"}>
              {showDiagnostics ? "ENABLED" : "DISABLED"}
            </span>
          </button>
        </div>

        {/* Algorithm Info */}
        <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
          <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 mb-2">
            <Info className="w-3 h-3" /> DFS RECURSIVE BACKTRACKER
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
            Linear kernel processing enabled. This algorithm explores until it hits a node with no unvisited neighbors, then pops from the stack to resume branching.
          </p>
        </div>
      </div>

      <div className="mt-auto pt-6 space-y-3">
        <div className="flex gap-3">
          {status === AlgorithmStatus.GENERATING ? (
            <button 
              onClick={onPause}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700 shadow-inner"
            >
              <Pause className="w-4 h-4" /> Pause
            </button>
          ) : (
            <button 
              onClick={onStart}
              disabled={status === AlgorithmStatus.FINISHED}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800/50 disabled:text-slate-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-900/30 border-t border-cyan-400/20"
            >
              <Play className="w-4 h-4" /> {status === AlgorithmStatus.IDLE ? 'Initialize' : 'Resume'}
            </button>
          )}
        </div>
        
        <button 
          onClick={onReset}
          className="w-full bg-slate-800/30 hover:bg-slate-800/80 text-slate-400 hover:text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700/50"
        >
          <RotateCcw className="w-4 h-4" /> Clear Lattice
        </button>

        <div className="pt-4 flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-[1px] bg-cyan-400/80"></div> Path</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-[1px] bg-pink-500 shadow-[0_0_5px_#f472b6]"></div> Search</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-[1px] bg-emerald-400 shadow-[0_0_5px_#10b981]"></div> Solved</span>
          </div>
          
          <a 
            href="https://github.com/igor-gregori" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-cyan-400 transition-colors py-2 px-4 rounded-lg bg-slate-950/30 border border-slate-800/50 hover:border-cyan-500/30 group mb-2"
          >
            <Github className="w-3 h-3 transition-transform group-hover:scale-110" />
            igor-gregori
          </a>
        </div>
      </div>
    </aside>
  );
};

export default ControlPanel;
