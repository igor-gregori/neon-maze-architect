
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ControlPanel from './components/ControlPanel';
import { MazeGenerator } from './services/mazeService';
import { AlgorithmStatus, Wall, Cell } from './types';
import { COLORS, INITIAL_CONFIG } from './constants';

const App: React.FC = () => {
  const [status, setStatus] = useState<AlgorithmStatus>(AlgorithmStatus.IDLE);
  const [speed, setSpeed] = useState(INITIAL_CONFIG.speed);
  const [cellSize, setCellSize] = useState(INITIAL_CONFIG.cellSize);
  const [showDiagnostics, setShowDiagnostics] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [fps, setFps] = useState(0);
  const [solutionPath, setSolutionPath] = useState<Cell[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const generatorRef = useRef<MazeGenerator | null>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const stepAccumulatorRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // Audio refs
  const audioContextRef = useRef<AudioContext | null>(null);

  const playStepSound = useCallback(() => {
    if (isMuted) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    // Limit audio triggers at very high speeds to prevent distortion
    if (speed > 300 && Math.random() > 0.1) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Frequency based on walker's "height" in the grid for a musical effect
    const freq = 150 + (generatorRef.current?.current?.i || 0) * 5;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }, [isMuted, speed]);

  const initGenerator = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    generatorRef.current = new MazeGenerator(canvas.width, canvas.height, cellSize);
    setStatus(AlgorithmStatus.IDLE);
    setSolutionPath([]);
    stepAccumulatorRef.current = 0;
    draw();
  }, [cellSize]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const gen = generatorRef.current;
    if (!canvas || !gen) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const w = cellSize;
    const gridLineWidth = cellSize < 10 ? 0.5 : 1;

    // Background cells - Darker neutral black
    ctx.fillStyle = '#050505';
    for (const cell of gen.grid) {
      if (cell.visited) {
        ctx.fillRect(cell.j * w, cell.i * w, w, w);
      }
    }

    // Walls
    ctx.strokeStyle = COLORS.wallSubtle;
    ctx.lineWidth = gridLineWidth;
    ctx.beginPath();
    for (const cell of gen.grid) {
      const x = cell.j * w;
      const y = cell.i * w;
      if (cell.walls[Wall.Top]) { ctx.moveTo(x, y); ctx.lineTo(x + w, y); }
      if (cell.walls[Wall.Right]) { ctx.moveTo(x + w, y); ctx.lineTo(x + w, y + w); }
      if (cell.walls[Wall.Bottom]) { ctx.moveTo(x + w, y + w); ctx.lineTo(x, y + w); }
      if (cell.walls[Wall.Left]) { ctx.moveTo(x, y + w); ctx.lineTo(x, y); }
    }
    ctx.stroke();

    // Permanent paths
    ctx.strokeStyle = COLORS.neonCyan;
    ctx.lineWidth = Math.max(1, cellSize * 0.12);
    ctx.shadowBlur = 0;
    ctx.beginPath();
    for (const cell of gen.grid) {
      if (!cell.visited) continue;
      const x = cell.j * w + w/2;
      const y = cell.i * w + w/2;
      if (!cell.walls[Wall.Top]) { ctx.moveTo(x, y); ctx.lineTo(x, y - w/2); }
      if (!cell.walls[Wall.Right]) { ctx.moveTo(x, y); ctx.lineTo(x + w/2, y); }
      if (!cell.walls[Wall.Bottom]) { ctx.moveTo(x, y); ctx.lineTo(x, y + w/2); }
      if (!cell.walls[Wall.Left]) { ctx.moveTo(x, y); ctx.lineTo(x - w/2, y); }
    }
    ctx.stroke();

    // Active Search Stack
    if (gen.stack.length > 0 && status !== AlgorithmStatus.FINISHED) {
      ctx.strokeStyle = COLORS.neonMagenta;
      ctx.lineWidth = Math.max(2, cellSize * 0.25);
      ctx.shadowBlur = cellSize > 8 ? 12 : 0;
      ctx.shadowColor = COLORS.neonMagenta;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      
      for (let i = 0; i < gen.stack.length - 1; i++) {
        const c1 = gen.stack[i];
        const c2 = gen.stack[i+1];
        ctx.moveTo(c1.j * w + w/2, c1.i * w + w/2);
        ctx.lineTo(c2.j * w + w/2, c2.i * w + w/2);
      }
      
      if (gen.current) {
        const last = gen.stack[gen.stack.length - 1];
        ctx.moveTo(last.j * w + w/2, last.i * w + w/2);
        ctx.lineTo(gen.current.j * w + w/2, gen.current.i * w + w/2);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Solution Path
    if (solutionPath.length > 0) {
      ctx.strokeStyle = '#10b981'; // Emerald 500
      ctx.lineWidth = Math.max(3, cellSize * 0.4);
      ctx.shadowBlur = cellSize > 8 ? 20 : 0;
      ctx.shadowColor = '#10b981';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < solutionPath.length - 1; i++) {
        const c1 = solutionPath[i];
        const c2 = solutionPath[i+1];
        ctx.moveTo(c1.j * w + w/2, c1.i * w + w/2);
        ctx.lineTo(c2.j * w + w/2, c2.i * w + w/2);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Walker head
    if (gen.current && status !== AlgorithmStatus.FINISHED) {
      ctx.fillStyle = COLORS.neonYellow;
      ctx.shadowBlur = cellSize > 8 ? 20 : 0;
      ctx.shadowColor = COLORS.neonYellow;
      const pad = w * 0.15;
      ctx.fillRect(gen.current.j * w + pad, gen.current.i * w + pad, w - pad * 2, w - pad * 2);
      ctx.shadowBlur = 0;
    }

  }, [cellSize, solutionPath, status]);

  const animate = useCallback(() => {
    const now = performance.now();
    const delta = now - lastTimeRef.current;
    lastTimeRef.current = now;
    
    const currentFps = 1000 / Math.max(1, delta);
    setFps(prev => prev * 0.95 + currentFps * 0.05);

    if (status === AlgorithmStatus.GENERATING && generatorRef.current) {
      stepAccumulatorRef.current += speed * (delta / 1000);

      while (stepAccumulatorRef.current >= 1) {
        generatorRef.current.step();
        playStepSound();
        stepAccumulatorRef.current -= 1;
        if (generatorRef.current.finished) {
          setStatus(AlgorithmStatus.FINISHED);
          setSolutionPath(generatorRef.current.getSolutionPath());
          stepAccumulatorRef.current = 0;
          break;
        }
      }
    }
    
    draw();
    requestRef.current = requestAnimationFrame(animate);
  }, [status, speed, draw, playStepSound]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  useEffect(() => {
    const handleResize = () => {
      initGenerator();
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [initGenerator]);

  return (
    <div className="flex w-full h-screen bg-black overflow-hidden font-sans">
      <ControlPanel 
        status={status}
        speed={speed}
        cellSize={cellSize}
        showDiagnostics={showDiagnostics}
        isMuted={isMuted}
        setSpeed={setSpeed}
        setCellSize={setCellSize}
        setShowDiagnostics={setShowDiagnostics}
        setIsMuted={setIsMuted}
        onStart={() => setStatus(AlgorithmStatus.GENERATING)}
        onPause={() => setStatus(AlgorithmStatus.PAUSED)}
        onReset={() => {
          initGenerator();
        }}
      />

      <main ref={containerRef} className="flex-1 relative overflow-hidden bg-black">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#ffffff22 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <canvas 
          ref={canvasRef}
          className="block cursor-crosshair"
        />

        <div className="absolute bottom-8 right-8 flex flex-col items-end gap-2 pointer-events-none transition-all duration-500">
          <div className="px-5 py-2.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-3 shadow-2xl">
            <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px] ${status === AlgorithmStatus.FINISHED ? 'bg-emerald-400 shadow-emerald-400' : 'bg-cyan-400 shadow-cyan-400'}`}></div>
            <span className="text-[10px] font-bold text-white/70 tracking-widest uppercase">
              {status === AlgorithmStatus.FINISHED ? 'Structural Solve Complete' : 
               status === AlgorithmStatus.GENERATING ? 'Generating Neural Lattice...' : 
               status === AlgorithmStatus.PAUSED ? 'Temporal Sequence Suspended' : 'Kernel Engine Standby'}
            </span>
          </div>
        </div>

        {showDiagnostics && (
          <div className="absolute top-8 right-8 text-right pointer-events-none bg-black/60 p-4 rounded-xl border border-white/10 backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-2">
            <p className="text-[10px] text-white/50 font-mono tracking-tighter leading-relaxed">
              <span className="text-cyan-400 font-bold uppercase tracking-[0.2em] block mb-2 border-b border-white/5 pb-1">System Diagnostics</span>
              GRID_RES: {generatorRef.current?.cols} x {generatorRef.current?.rows}<br/>
              GEOM_DIM: {cellSize}px<br/>
              STACK_PTR: {generatorRef.current?.stack.length}<br/>
              SOLV_NODES: {solutionPath.length}<br/>
              <span className={`font-bold ${fps < 30 ? 'text-red-400' : 'text-white/30'}`}>
                REND_FPS: {Math.round(fps)}
              </span>
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
