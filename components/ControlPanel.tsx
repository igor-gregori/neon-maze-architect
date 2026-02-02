
import React from 'react';
import { AlgorithmStatus } from '../types';
import { Play, Pause, RotateCcw, Zap, LayoutGrid, Info, Plus, Minus, Eye, EyeOff, Github, Volume2, VolumeX } from 'lucide-react';

interface ControlPanelProps {
  status: AlgorithmStatus;
  speed: number;
  cellSize: number;
  showDiagnostics: boolean;
  isMuted: boolean;
  setSpeed: (v: number) => void;
  setCellSize: (v: number) => void;
  setShowDiagnostics: (v: boolean) => void;
  setIsMuted: (v: boolean) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  status,
  speed,
  cellSize,
  showDiagnostics,
  isMuted,
  setSpeed,
  setCellSize,
  setShowDiagnostics,
  setIsMuted,
  onStart,
  onPause,
  onReset
}) => {
  const handleSpeedChange = (delta: number) => {
    setSpeed(Math.min(2000, Math.max(1, speed + delta)));
  };

  const handleDensityChange = (delta: number) => {
    if (status === AlgorithmStatus.GENERATING || status === AlgorithmStatus.PAUSED) return;
    setCellSize(Math.min(100, Math.max(4, cellSize + delta)));
  };

  return (
    <aside className="w-80 h-full bg-[#050505] border-r border-white/10 p-6 flex flex-col z-20 shadow-2xl overflow-y-auto custom-scrollbar">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
          <span className="text-cyan-400">🌀</span> Neon Maze
        </h1>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">Architect Engine v1.5</p>
      </div>

      <div className="space-y-8 flex-1">
        {/* Speed Control */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3 text-yellow-400" /> Temporal Velocity
            </label>
            <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-mono font-bold text-cyan-400 border border-white/10">
              {speed}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleSpeedChange(-10)}
              className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/50 transition-colors shadow-sm"
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
              className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <button 
              onClick={() => handleSpeedChange(10)}
              className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/50 transition-colors shadow-sm"
              title="Increase Speed"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-white/30 mt-3 text-center font-mono opacity-80">
            {speed} STEPS PER SECOND
          </p>
        </div>

        {/* Density Control */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-wider">
              <LayoutGrid className="w-3 h-3 text-pink-400" /> Geometric Density
            </label>
            <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-mono font-bold text-pink-400 border border-white/10">
              {cellSize}px
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              disabled={status === AlgorithmStatus.GENERATING || status === AlgorithmStatus.PAUSED}
              onClick={() => handleDensityChange(-1)}
              className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/50 transition-colors disabled:opacity-10 disabled:cursor-not-allowed shadow-sm"
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
              className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-10"
            />
            <button 
              disabled={status === AlgorithmStatus.GENERATING || status === AlgorithmStatus.PAUSED}
              onClick={() => handleDensityChange(1)}
              className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/50 transition-colors disabled:opacity-10 disabled:cursor-not-allowed shadow-sm"
              title="Lower Density"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex justify-between mt-2 text-[9px] text-white/20 font-bold uppercase tracking-tight">
            <span>High Density</span>
            <span>Low Density</span>
          </div>
        </div>

        {/* Visibility & Sound Toggles */}
        <div className="pt-4 border-t border-white/5 space-y-2">
          <button 
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/70 transition-all border border-white/10"
          >
            <span className="flex items-center gap-2">
              {showDiagnostics ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              Diagnostics HUD
            </span>
            <span className={showDiagnostics ? "text-cyan-400" : "text-white/20"}>
              {showDiagnostics ? "ON" : "OFF"}
            </span>
          </button>

          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/70 transition-all border border-white/10"
          >
            <span className="flex items-center gap-2">
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              Audio Feedback
            </span>
            <span className={!isMuted ? "text-cyan-400" : "text-white/20"}>
              {!isMuted ? "ON" : "OFF"}
            </span>
          </button>
        </div>

        {/* Algorithm Info */}
        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 mb-2">
            <Info className="w-3 h-3" /> DFS RECURSIVE BACKTRACKER
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed font-medium">
            Symmetric kernel processing. This algorithm utilizes a backtracker stack to ensure a perfect maze with zero unreachable nodes and zero loops.
          </p>
        </div>
      </div>

      <div className="mt-auto pt-6 space-y-3">
        <div className="flex gap-3">
          {status === AlgorithmStatus.GENERATING ? (
            <button 
              onClick={onPause}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/10"
            >
              <Pause className="w-4 h-4" /> Pause
            </button>
          ) : (
            <button 
              onClick={onStart}
              disabled={status === AlgorithmStatus.FINISHED}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:bg-white/5 disabled:text-white/10 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg border border-cyan-400/20"
            >
              <Play className="w-4 h-4" /> {status === AlgorithmStatus.IDLE ? 'Initialize' : 'Resume'}
            </button>
          )}
        </div>
        
        <button 
          onClick={onReset}
          className="w-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/10"
        >
          <RotateCcw className="w-4 h-4" /> Clear Lattice
        </button>

        <div className="pt-4 flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[9px] font-bold text-white/20 uppercase tracking-tighter">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-[1px] bg-cyan-400/80"></div> Path</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-[1px] bg-pink-500 shadow-[0_0_5px_#f472b6]"></div> Search</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-[1px] bg-emerald-400 shadow-[0_0_5px_#10b981]"></div> Solved</span>
          </div>
          
          <a 
            href="https://github.com/igor-gregori" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[10px] font-bold text-white/20 hover:text-cyan-400 transition-colors py-2 px-4 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 group mb-2"
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
