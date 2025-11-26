
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, Float, Torus, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import { Activity, Play, Pause, RotateCcw, StepForward, BoxSelect, Settings2 } from 'lucide-react';
import * as THREE from 'three';

import { AlgorithmStatus, SortingMethod } from './types';
import { 
    bubbleSortGenerator, 
    selectionSortGenerator, 
    insertionSortGenerator,
    quickSortGenerator,
    mergeSortGenerator,
} from './utils/generators';
import { SortingModule } from './components/Modules';

// --- UI COMPONENTS ---

const CyberButton = ({ onClick, children, active = false, icon: Icon, color = 'cyan', disabled = false, className = '' }: any) => {
  const baseColors = {
    cyan: 'border-cyan-800 hover:text-cyan-400 hover:border-cyan-600 active:bg-cyan-500/20 active:text-cyan-300 active:border-cyan-400 active:shadow-[0_0_15px_rgba(6,182,212,0.5)]',
    green: 'border-green-800 hover:text-green-400 hover:border-green-600 active:bg-green-500/20 active:text-green-300 active:border-green-400',
    red: 'border-red-800 hover:text-red-400 hover:border-red-600 active:bg-red-500/20 active:text-red-300 active:border-red-400',
    amber: 'border-amber-800 hover:text-amber-400 hover:border-amber-600 active:bg-amber-500/20 active:text-amber-300 active:border-amber-400'
  };
  
  const activeClass = active 
    ? `bg-${color}-500/20 text-${color}-300 border-${color}-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]` 
    : `bg-slate-900/80 text-slate-400 ${baseColors[color as keyof typeof baseColors]}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-sm font-bold uppercase tracking-wider text-xs transition-all duration-300
        border backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed
        ${activeClass} ${className}
      `}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
};

const SidebarItem = ({ label, active, onClick, icon: Icon }: any) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-4 border-l-2 transition-all duration-200
      ${active 
        ? 'border-fuchsia-500 bg-gradient-to-r from-fuchsia-950/50 to-transparent text-fuchsia-300' 
        : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}
    `}
  >
    <Icon size={18} />
    <span className="font-mono text-sm tracking-widest">{label}</span>
  </button>
);

// --- SCENE COMPONENTS ---

const usePlanetTextureSet = () => {
  return useMemo(() => {
    const createTexture = (width: number, height: number, drawFn: (ctx: CanvasRenderingContext2D) => void) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            drawFn(ctx);
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    };

    // 1. Rocky Texture (Bump Map) - High contrast noise
    const rocky = createTexture(512, 512, (ctx) => {
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, 512, 512);
        // Craters / Noise
        for(let i=0; i<400; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 15 + 2;
            const shade = Math.floor(Math.random() * 100); 
            ctx.fillStyle = `rgba(${shade},${shade},${shade}, 0.3)`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI*2);
            ctx.fill();
        }
        // Fine grain
        for(let i=0; i<5000; i++) {
             ctx.fillStyle = `rgba(0,0,0,0.1)`;
             ctx.fillRect(Math.random()*512, Math.random()*512, 2, 2);
        }
    });

    // 2. Gas Texture (Albedo Map) - Horizontal Bands
    const gas = createTexture(512, 512, (ctx) => {
        // Create bands
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        let currentPos = 0;
        while(currentPos < 1) {
            const colorVal = Math.floor(Math.random() * 100 + 155); // Keep it light for tinting
            gradient.addColorStop(currentPos, `rgb(${colorVal}, ${colorVal}, ${colorVal})`);
            currentPos += Math.random() * 0.15;
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0,0,512,512);
        
        // Add subtle swirl lines
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 2;
        for(let i=0; i<20; i++) {
            const y = Math.random() * 512;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.bezierCurveTo(170, y + Math.random()*50, 340, y - Math.random()*50, 512, y);
            ctx.stroke();
        }
    });

    return { rocky, gas };
  }, []);
};

const RandomPlanets = () => {
  const { rocky, gas } = usePlanetTextureSet();

  // Generate 250 random planets with Royal Theme Palette
  const planets = useMemo(() => {
    const temp = [];
    const colors = [
        "#e2e8f0", // Silver
        "#fbbf24", // Gold
        "#f43f5e", // Rose/Ruby
        "#8b5cf6", // Violet
        "#10b981", // Emerald
        "#94a3b8"  // Slate
    ];
    
    for (let i = 0; i < 250; i++) {
      const radius = 80 + Math.random() * 250;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      const size = 0.5 + Math.random() * 3.5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const hasRing = Math.random() > 0.8;
      
      const type = Math.random() > 0.6 ? 'gas' : 'rocky';
      const metalness = type === 'gas' ? 0.1 : Math.random() * 0.5;
      const roughness = type === 'gas' ? 0.4 : 0.7 + Math.random() * 0.3;
      
      temp.push({ 
          pos: [x, y, z] as [number, number, number], 
          size, 
          color, 
          id: i, 
          hasRing, 
          metalness, 
          roughness,
          type 
      });
    }
    return temp;
  }, []);

  return (
    <group>
      {planets.map((planet) => (
        <Float key={planet.id} speed={0.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <group position={planet.pos}>
            <Sphere args={[planet.size, 32, 32]}>
              <meshStandardMaterial 
                color={planet.color} 
                roughness={planet.roughness} 
                metalness={planet.metalness}
                map={planet.type === 'gas' ? gas : undefined}
                bumpMap={planet.type === 'rocky' ? rocky : undefined}
                bumpScale={0.15}
              />
            </Sphere>
            {planet.hasRing && (
               <group rotation={[Math.random(), Math.random(), 0]}>
                   <Torus args={[planet.size * 1.8, planet.size * 0.15, 2, 32]} rotation={[Math.PI / 2, 0, 0]}>
                        <meshStandardMaterial color={planet.color} opacity={0.7} transparent side={THREE.DoubleSide} />
                   </Torus>
               </group>
            )}
          </group>
        </Float>
      ))}
    </group>
  )
}

const DeepSpaceEnvironment = () => {
  const { rocky } = usePlanetTextureSet();

  return (
    <group>
      {/* 1. Deep Void - Lightened to Deep Twilight Purple for brightness */}
      <Sphere args={[450, 64, 64]}>
        <meshBasicMaterial color="#1e1836" side={THREE.BackSide} /> 
      </Sphere>

      {/* 2. Royal Nebula Clouds - Increased Opacity for brightness/color */}
      {/* Gold Cloud - Right */}
      <Sphere args={[400, 64, 64]} position={[50, 0, 0]} rotation={[0, 0, 0.5]}>
         <meshBasicMaterial color="#d97706" transparent opacity={0.15} side={THREE.BackSide} depthWrite={false} />
      </Sphere>
      
      {/* Magenta Cloud - Left */}
      <Sphere args={[380, 64, 64]} position={[-50, 20, 0]} rotation={[0, 0, -0.5]}>
         <meshBasicMaterial color="#db2777" transparent opacity={0.15} side={THREE.BackSide} depthWrite={false} />
      </Sphere>

      {/* Teal/Mint Cloud - Bottom */}
      <Sphere args={[420, 64, 64]} position={[0, -50, 0]}>
         <meshBasicMaterial color="#0d9488" transparent opacity={0.12} side={THREE.BackSide} depthWrite={false} />
      </Sphere>

      <RandomPlanets />

      {/* --- HERO PLANETS --- */}

      {/* The Ruby Giant (Animated Surface) */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        <group position={[80, 30, -150]}>
            <Sphere args={[20, 128, 128]}>
                {/* Distort Material for "Living Planet" effect */}
                <MeshDistortMaterial 
                    color="#be123c" 
                    emissive="#881337"
                    emissiveIntensity={0.2}
                    roughness={0.4}
                    distort={0.3}
                    speed={1.5}
                />
            </Sphere>
             <Torus args={[30, 2, 2, 64]} rotation={[1.2, 0, 0]}>
                <meshStandardMaterial color="#fda4af" opacity={0.4} transparent side={THREE.DoubleSide} />
             </Torus>
        </group>
      </Float>

      {/* The Golden World (Textured Desert) */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <group position={[-90, 15, -120]}>
            {/* Core */}
            <Sphere args={[15, 64, 64]}>
                <meshStandardMaterial 
                    color="#b45309" // Amber 700
                    roughness={0.6} 
                    metalness={0.2}
                    bumpMap={rocky}
                    bumpScale={0.3}
                />
            </Sphere>
            {/* Atmosphere Layer */}
            <Sphere args={[15.8, 64, 64]}>
                <meshStandardMaterial 
                    color="#fbbf24" 
                    transparent 
                    opacity={0.15} 
                    side={THREE.DoubleSide}
                />
            </Sphere>
            {/* Surface Texture (Cities/Minerals) */}
            <Sparkles 
                count={50} 
                scale={16} 
                size={4} 
                speed={0.2} 
                opacity={0.8} 
                color="#fcd34d" 
            />
             <Torus args={[22, 0.5, 2, 64]} rotation={[2, 0.5, 0]}>
                <meshStandardMaterial color="#fcd34d" opacity={0.6} transparent side={THREE.DoubleSide} />
             </Torus>
        </group>
      </Float>
    </group>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [status, setStatus] = useState<AlgorithmStatus>(AlgorithmStatus.IDLE);
  const [speed, setSpeed] = useState<number>(50);
  const [logs, setLogs] = useState<string[]>([]);
  
  const [sortMethod, setSortMethod] = useState<SortingMethod>(SortingMethod.BUBBLE);
  const [sortData, setSortData] = useState<number[]>([]);
  const [sortHighlights, setSortHighlights] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);

  const [userInput, setUserInput] = useState<string>("");

  const generatorRef = useRef<Generator<any> | null>(null);
  const timerRef = useRef<any>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const initSorting = useCallback(() => {
    let arr: number[] = [];
    if (userInput.trim()) {
        const parsed = userInput.split(',')
            .map(s => {
                const parsedInt = parseInt(s.trim());
                return isNaN(parsedInt) ? null : parsedInt;
            })
            .filter((n): n is number => n !== null);
        if (parsed.length > 0) arr = parsed.slice(0, 14);
    }
    if (arr.length === 0) {
        arr = Array.from({ length: 14 }, () => Math.floor(Math.random() * 15) + 2);
    }
    setSortData(arr);
    setSortHighlights([]);
    setSortedIndices([]);
    generatorRef.current = null;
    setStatus(AlgorithmStatus.IDLE);
    setLogs([`System Ready. Algorithm: ${sortMethod}`, `Data Loaded: [${arr.join(', ')}]`]);
  }, [userInput, sortMethod]);

  useEffect(() => {
    stopAnimation();
    initSorting();
  }, [sortMethod]);

  const startAnimation = () => {
    if (status === AlgorithmStatus.RUNNING) return;
    if (status === AlgorithmStatus.COMPLETED) {
        generatorRef.current = null;
        initSorting(); 
        setTimeout(() => {
            startFreshGenerator();
            setStatus(AlgorithmStatus.RUNNING);
        }, 100);
        return;
    }
    if (!generatorRef.current) startFreshGenerator();
    setStatus(AlgorithmStatus.RUNNING);
  };

  const startFreshGenerator = () => {
    const dataCopy = [...sortData]; 
    switch (sortMethod) {
        case SortingMethod.BUBBLE: generatorRef.current = bubbleSortGenerator(dataCopy); break;
        case SortingMethod.SELECTION: generatorRef.current = selectionSortGenerator(dataCopy); break;
        case SortingMethod.INSERTION: generatorRef.current = insertionSortGenerator(dataCopy); break;
        case SortingMethod.QUICK: generatorRef.current = quickSortGenerator(dataCopy); break;
        case SortingMethod.MERGE: generatorRef.current = mergeSortGenerator(dataCopy); break;
        default: generatorRef.current = bubbleSortGenerator(dataCopy);
    }
  };

  const pauseAnimation = () => {
    setStatus(AlgorithmStatus.PAUSED);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const stopAnimation = () => {
    setStatus(AlgorithmStatus.IDLE);
    if (timerRef.current) clearTimeout(timerRef.current);
    generatorRef.current = null;
    setSortHighlights([]);
  };

  const stepAnimation = useCallback(() => {
    if (!generatorRef.current) return;
    const next = generatorRef.current.next();
    if (next.done) {
      setStatus(AlgorithmStatus.COMPLETED);
      setLogs(prev => [...prev, "Execution Finished."]);
      return;
    }
    const val = next.value;
    if (val.description) setLogs(prev => [...prev, val.description]);
    if (val.array) setSortData(val.array);
    if (val.highlights) setSortHighlights(val.highlights);
    if (val.sortedIndices) setSortedIndices(val.sortedIndices);
    if (val.completed) setStatus(AlgorithmStatus.COMPLETED);
  }, [sortData]);

  useEffect(() => {
    if (status === AlgorithmStatus.RUNNING) {
      timerRef.current = setTimeout(() => {
        stepAnimation();
      }, 200 - speed * 1.8); 
    }
    return () => { if(timerRef.current) clearTimeout(timerRef.current); };
  }, [status, speed, stepAnimation]);

  return (
    <div className="flex h-screen w-screen bg-[#02040a] text-white selection:bg-fuchsia-500/30">
      
      {/* SIDEBAR */}
      <div className="w-64 border-r border-slate-800 bg-[#020617] flex flex-col z-10 relative">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-400 to-amber-500 bg-clip-text text-transparent tracking-tighter">
            ALGO<span className="text-white">VERSE</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">3D Visualizer v2.1</p>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <SidebarItem 
            label="SORTING" 
            active={true} 
            onClick={() => {}}
            icon={BoxSelect}
          />
          <div className="px-4 mt-6">
             <div className="flex items-center gap-2 text-fuchsia-400 mb-2">
                <Settings2 size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Custom Data</span>
             </div>
             <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                <p className="text-[10px] text-slate-500 mb-2 leading-tight">
                    Enter numbers (max 14), comma separated.
                </p>
                <input 
                    type="text" 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="e.g. 12, 5, 8, 3..."
                    className="w-full bg-black border border-slate-700 text-white text-xs p-2 rounded focus:border-fuchsia-500 outline-none font-mono placeholder-slate-700"
                />
             </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
            <div className="text-[10px] text-slate-600 mb-2 font-mono">SYSTEM STATUS</div>
            <div className={`flex items-center gap-2 text-xs font-bold ${
                status === AlgorithmStatus.RUNNING || status === AlgorithmStatus.COMPLETED ? 'text-green-400' : 'text-slate-400'
            }`}>
                <div className={`w-2 h-2 rounded-full ${status === AlgorithmStatus.RUNNING ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
                {status}
            </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 6, 20], fov: 45 }}>
            <fog attach="fog" args={['#1e1836', 50, 350]} />
            
            {/* Brighter Ambient & Fill Light */}
            <ambientLight intensity={1.5} />
            <hemisphereLight skyColor="#a855f7" groundColor="#000000" intensity={1.0} />

            {/* Brighter Point Lights */}
            <pointLight position={[20, 20, 10]} intensity={4.0} color="#fbbf24" distance={100} />
            <pointLight position={[-20, 10, -10]} intensity={3.5} color="#f472b6" distance={100} />
            
            <Stars radius={300} depth={50} count={6000} factor={4} saturation={1} fade speed={1} />
            <DeepSpaceEnvironment />
            <group position={[0, 0, 0]}>
                <SortingModule data={sortData} highlights={sortHighlights} sortedIndices={sortedIndices} />
            </group>
            <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.8} />
          </Canvas>
        </div>

        {/* OVERLAY UI */}
        <div className="absolute top-6 right-6 z-10 flex flex-col gap-4 w-80">
            <div className="bg-slate-950/80 backdrop-blur-md border border-fuchsia-900/50 p-2 rounded shadow-2xl flex flex-col gap-1">
                <span className="text-[10px] uppercase text-slate-500 font-bold px-2">Select Algorithm</span>
                <select 
                    value={sortMethod}
                    onChange={(e) => setSortMethod(e.target.value as SortingMethod)}
                    className="bg-slate-900 border border-slate-700 text-fuchsia-400 text-xs p-2 rounded outline-none cursor-pointer hover:border-fuchsia-600 transition-colors"
                >
                    {Object.values(SortingMethod).map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>
            <div className="bg-slate-950/90 backdrop-blur-md border border-fuchsia-900/50 rounded shadow-2xl flex flex-col h-64">
                <div className="flex items-center justify-between p-3 border-b border-slate-800/50">
                    <h3 className="text-fuchsia-400 text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                        <Activity size={12} /> Process Log
                    </h3>
                    <span className="text-[10px] text-slate-600">{logs.length} steps</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 font-mono text-[10px] space-y-1 custom-scrollbar">
                   {logs.map((log, i) => (
                       <div key={i} className="text-slate-300 border-l-2 border-slate-800 pl-2 hover:border-fuchsia-500/50 transition-colors">
                           <span className="text-slate-600 mr-2">{(i+1).toString().padStart(3, '0')}</span>
                           {log}
                       </div>
                   ))}
                   <div ref={logsEndRef} />
                </div>
            </div>
        </div>

        {/* Control Deck */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 p-2 bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-lg shadow-2xl">
                    <CyberButton onClick={() => { stopAnimation(); initSorting(); }} icon={RotateCcw}>Reset</CyberButton>
                    <div className="w-px h-8 bg-slate-800 mx-2"></div>
                    {status === AlgorithmStatus.RUNNING ? (
                        <CyberButton onClick={pauseAnimation} icon={Pause} active color="amber">Pause</CyberButton>
                    ) : (
                        <CyberButton onClick={startAnimation} icon={Play} color="green">
                            {status === AlgorithmStatus.COMPLETED ? "Restart" : "Run"}
                        </CyberButton>
                    )}
                    <CyberButton onClick={stepAnimation} icon={StepForward}>Step</CyberButton>
                    <div className="w-px h-8 bg-slate-800 mx-2"></div>
                    <div className="flex items-center gap-3 px-4">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Speed</span>
                        <input 
                            type="range" min="1" max="100" value={speed} 
                            onChange={(e) => setSpeed(parseInt(e.target.value))}
                            className="w-24 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                        />
                    </div>
                </div>
                <div className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">
                   Drag to Rotate • Scroll to Zoom
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
