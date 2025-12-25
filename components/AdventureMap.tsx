/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, LockClosedIcon, XMarkIcon, StarIcon, MapIcon, FlagIcon } from '@heroicons/react/24/solid';
import { playMusic } from '../src/lib/audio';

export type LevelConfig = {
    id: number;
    title: string;
    story: string;
    objective: string;
    initialBlocked: string[];
    p1Start: { x: number; y: number };
    p2Start: { x: number; y: number };
    difficulty: 'easy' | 'medium' | 'hard';
};

interface AdventureMapProps {
  onBack: () => void;
  onSelectLevel: (config: LevelConfig) => void;
  unlockedLevelCount: number;
}

// Level Definitions
const LEVELS: LevelConfig[] = [
    {
        id: 1,
        title: "Page 1: The Sketch",
        story: "You awake as a simple ink outline on a fresh page. But you are not alone. A crude, shadowy figure—The Rival—has been drawn in the opposite corner. The pencil god has spoken: 'Only one doodle can remain.' Prove you are worthy of the permanent marker!",
        objective: "Trap the rival or capture their square.",
        initialBlocked: [],
        p1Start: { x: 0, y: 0 },
        p2Start: { x: 7, y: 7 },
        difficulty: 'easy'
    },
    {
        id: 2,
        title: "Page 5: The Coffee Stain",
        story: "Disaster! The artist spilled their morning coffee. A massive, dark stain dominates the center of the battlefield. It is impassable. The Rival is using it for cover. You must navigate the treacherous rim of the stain to flank them.",
        objective: "Maneuver around the central obstacles and corner the enemy.",
        initialBlocked: ["3,3", "3,4", "4,3", "4,4", "2,2", "5,5"], 
        p1Start: { x: 0, y: 0 },
        p2Start: { x: 7, y: 7 },
        difficulty: 'easy'
    },
    {
        id: 3,
        title: "Page 12: The Margins",
        story: "The artist ran out of space. You are confined to a small box of scribbles in the margins of a math homework assignment. The walls are closing in. Every move counts. One mistake, and you'll be erased.",
        objective: "Win in a restricted 6x6 arena. Don't get trapped against the walls!",
        initialBlocked: [
            "0,0", "0,1", "0,2", "0,3", "0,4", "0,5", "0,6", "0,7",
            "7,0", "7,1", "7,2", "7,3", "7,4", "7,5", "7,6", "7,7",
            "1,0", "6,0", "1,7", "6,7"
        ],
        p1Start: { x: 1, y: 1 },
        p2Start: { x: 6, y: 6 },
        difficulty: 'medium'
    },
    {
        id: 4,
        title: "Page 24: The Maze",
        story: "This page is covered in chaotic doodles and crossed-out equations. A labyrinth of obstacles lies between you and your target. The enemy knows these paths better than you. Plan your route carefully, Knight.",
        objective: "Outsmart the AI in a complex maze environment.",
        initialBlocked: ["2,2", "2,5", "5,2", "5,5", "3,3", "3,4", "4,3", "4,4", "1,3", "6,4"],
        p1Start: { x: 0, y: 4 },
        p2Start: { x: 7, y: 3 },
        difficulty: 'medium'
    },
    {
        id: 5,
        title: "Page 33: Eraser Dust",
        story: "The artist tried to fix a mistake, leaving behind piles of rubber eraser dust. These mounds are slippery and treacherous. Watch your step as you navigate through the debris of a failed drawing.",
        objective: "Navigate through the scattered obstacles.",
        initialBlocked: ["1,1", "1,6", "6,1", "6,6", "3,3", "4,4", "2,5", "5,2"],
        p1Start: { x: 0, y: 0 },
        p2Start: { x: 7, y: 7 },
        difficulty: 'medium'
    },
    {
        id: 6,
        title: "Page 42: The Ruler",
        story: "Straight lines divide the battlefield. The artist used a ruler to draw strict boundaries. You must find the gaps in these imposing walls to reach your opponent.",
        objective: "Cross the barriers through narrow gaps.",
        initialBlocked: ["3,0", "3,1", "3,2", "3,4", "3,5", "3,6", "3,7", "4,0", "4,1", "4,3", "4,5", "4,6", "4,7"],
        p1Start: { x: 0, y: 0 },
        p2Start: { x: 7, y: 7 },
        difficulty: 'medium'
    },
    {
        id: 7,
        title: "Page 50: Folded Corner",
        story: "This page has been dog-eared! A massive triangular fold covers the top right corner. The battlefield is smaller than usual, and the geometry is strange. Adapt or perish.",
        objective: "Fight in a triangularly restricted arena.",
        initialBlocked: ["0,7", "0,6", "1,7", "0,5", "1,6", "2,7", "0,4", "1,5", "2,6", "3,7"],
        p1Start: { x: 0, y: 0 },
        p2Start: { x: 7, y: 0 },
        difficulty: 'medium'
    },
    {
        id: 8,
        title: "Page 58: Ink Blot",
        story: "A leaky pen caused a Rorschach test on this page. Symmetrical blobs of ink block the center. The battlefield is mirrored. Can you see the pattern of your defeat, or your victory?",
        objective: "Use the symmetry to your advantage.",
        initialBlocked: ["2,2", "5,5", "2,5", "5,2", "3,3", "4,4", "3,4", "4,3"],
        p1Start: { x: 0, y: 3 },
        p2Start: { x: 7, y: 4 },
        difficulty: 'hard'
    },
    {
        id: 9,
        title: "Page 65: The Grid",
        story: "This page is graph paper. The lines are thick and heavy. Movement is rigid. The enemy AI is calculating every probability. You must be unpredictable.",
        objective: "Defeat the logical AI on a structured grid.",
        initialBlocked: ["1,3", "3,1", "3,3", "3,5", "5,3", "1,5", "5,1", "5,5", "7,3", "3,7"],
        p1Start: { x: 0, y: 0 },
        p2Start: { x: 7, y: 7 },
        difficulty: 'hard'
    },
    {
        id: 10,
        title: "Page 72: Spiral Binding",
        story: "You are fighting near the spine of the notebook. Giant holes from the spiral binding threaten to swallow you whole. The edge of the world is perforated.",
        objective: "Don't fall into the holes on the left flank.",
        initialBlocked: ["0,0", "0,2", "0,4", "0,6", "1,1", "1,3", "1,5", "1,7"],
        p1Start: { x: 2, y: 3 },
        p2Start: { x: 6, y: 4 },
        difficulty: 'hard'
    },
    {
        id: 11,
        title: "Page 80: Highlighter",
        story: "Neon yellow ink floods the zone! It's blindingly bright. Key strategic points have been 'highlighted' (blocked) by the artist. The path is narrow and dangerous.",
        objective: "Navigate the narrow yellow corridors.",
        initialBlocked: ["2,0", "2,1", "2,2", "2,3", "5,4", "5,5", "5,6", "5,7", "0,5", "1,5", "6,2", "7,2"],
        p1Start: { x: 0, y: 0 },
        p2Start: { x: 7, y: 7 },
        difficulty: 'hard'
    },
    {
        id: 12,
        title: "Page 88: Torn Page",
        story: "Half of this page was ripped out in frustration. The battlefield is jagged and irregular. There is no symmetry here, only chaos and a steep drop into the void.",
        objective: "Survive on the jagged edge.",
        initialBlocked: ["0,0", "0,1", "0,2", "1,0", "1,1", "2,0", "5,7", "6,6", "6,7", "7,5", "7,6", "7,7"],
        p1Start: { x: 3, y: 3 },
        p2Start: { x: 4, y: 4 },
        difficulty: 'hard'
    },
    {
        id: 13,
        title: "Page 95: Sticky Note",
        story: "A giant pink sticky note has been slapped onto the page. It creates a massive square obstruction right in the middle. You'll have to run circles around it.",
        objective: "Flank the enemy around the central block.",
        initialBlocked: ["2,2", "2,3", "2,4", "2,5", "3,2", "3,3", "3,4", "3,5", "4,2", "4,3", "4,4", "4,5", "5,2", "5,3", "5,4", "5,5"],
        p1Start: { x: 0, y: 0 },
        p2Start: { x: 7, y: 7 },
        difficulty: 'medium'
    },
    {
        id: 14,
        title: "Page 101: Doodle War",
        story: "This page is a mess! Stick figures, tanks, and explosions are drawn everywhere. The debris of a thousand tiny battles litters the ground. Find a path through the madness.",
        objective: "Find the path through the chaotic drawings.",
        initialBlocked: ["1,2", "2,1", "1,6", "2,5", "5,1", "6,2", "5,6", "6,5", "3,3", "4,4", "0,3", "7,4"],
        p1Start: { x: 0, y: 0 },
        p2Start: { x: 7, y: 7 },
        difficulty: 'hard'
    },
    {
        id: 15,
        title: "Page 110: Coffee Ring",
        story: "Another coffee incident! This time, a perfect ring stain circles the center. Inside is a safe haven; outside is the wild. Control the ring, control the game.",
        objective: "Breach the ring and capture the center.",
        initialBlocked: ["2,3", "2,4", "3,2", "3,5", "4,2", "4,5", "5,3", "5,4"],
        p1Start: { x: 0, y: 0 },
        p2Start: { x: 3, y: 3 },
        difficulty: 'hard'
    },
    {
        id: 16,
        title: "Page 118: Red Pen",
        story: "The Teacher has arrived. Angry red corrections slash across the page. 'WRONG!' is written in giant letters, blocking your path. Avoid the teacher's wrath.",
        objective: "Dodge the red ink slashes.",
        initialBlocked: ["0,0", "1,1", "2,2", "3,3", "4,4", "5,5", "6,6", "7,7"],
        p1Start: { x: 0, y: 7 },
        p2Start: { x: 7, y: 0 },
        difficulty: 'hard'
    },
    {
        id: 17,
        title: "Page 125: Checkmate",
        story: "A chessboard pattern has been sketched here. Every other square is filled in. Movement is dizzying. The Knight piece (you) should feel at home, but so does the enemy.",
        objective: "Battle on a checkerboard pattern.",
        initialBlocked: ["0,1", "0,3", "0,5", "0,7", "2,1", "2,3", "2,5", "2,7", "4,1", "4,3", "4,5", "4,7", "6,1", "6,3", "6,5", "6,7"],
        p1Start: { x: 0, y: 0 },
        p2Start: { x: 7, y: 6 },
        difficulty: 'hard'
    },
    {
        id: 18,
        title: "Page 135: The Void",
        story: "The artist erased too hard and tore a hole through the paper. The center is gone. It's just empty desk surface underneath. Don't fall in.",
        objective: "Stay away from the central abyss.",
        initialBlocked: ["3,3", "3,4", "4,3", "4,4"],
        p1Start: { x: 2, y: 2 },
        p2Start: { x: 5, y: 5 },
        difficulty: 'hard'
    },
    {
        id: 19,
        title: "Page 142: The Gatekeeper",
        story: "You are one page away from the end. A heavy, intricate gate has been drawn. Only a narrow passage exists. The enemy guards it. You must break through.",
        objective: "Force your way through the choke point.",
        initialBlocked: ["0,3", "1,3", "2,3", "3,3", "5,3", "6,3", "7,3", "0,4", "1,4", "2,4", "3,4", "5,4", "6,4", "7,4"],
        p1Start: { x: 4, y: 0 },
        p2Start: { x: 4, y: 7 },
        difficulty: 'hard'
    },
    {
        id: 20,
        title: "Page 150: The Masterpiece",
        story: "You have reached the final page. Here resides the Dragon—a detailed, shaded, and ruthless drawing. It does not make mistakes. It does not show mercy. Defeat it, and become the Legend of the Notebook.",
        objective: "Defeat the 'Hard' AI. No handicaps. Pure skill.",
        initialBlocked: [],
        p1Start: { x: 3, y: 3 }, 
        p2Start: { x: 4, y: 4 },
        difficulty: 'hard'
    }
];

// Helper to generate zigzag positions for N levels
const generatePositions = (count: number) => {
    const positions = [];
    for (let i = 0; i < count; i++) {
        // y goes from ~95% (bottom) to ~5% (top)
        const y = 95 - (i * (90 / (count - 1)));
        
        // x zigzags: Center -> Left -> Center -> Right -> Center ...
        // Pattern: 50 -> 20 -> 50 -> 80 -> 50 ...
        const remainder = i % 4;
        let x = 50;
        if (remainder === 1) x = 20;      // Left
        else if (remainder === 2) x = 50; // Center
        else if (remainder === 3) x = 80; // Right
        
        // Add some random jitter for "hand-drawn" feel
        const jitter = (Math.random() * 10) - 5;
        
        positions.push({ x: x + jitter, y });
    }
    return positions;
};

const LEVEL_POSITIONS = generatePositions(LEVELS.length);

export const AdventureMap: React.FC<AdventureMapProps> = ({ onBack, onSelectLevel, unlockedLevelCount }) => {
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest unlocked level on mount
  useEffect(() => {
    if (containerRef.current) {
        // Calculate scroll position based on unlocked level
        // Level 1 is at bottom (high scrollY), Level 20 at top (low scrollY)
        // Map height is 3000px.
        const totalHeight = 3000;
        const levelIndex = unlockedLevelCount - 1;
        const pos = LEVEL_POSITIONS[levelIndex];
        
        // We want the current level to be centered in the viewport (viewport h approx 800)
        // pos.y is percentage from top.
        const targetY = (pos.y / 100) * totalHeight;
        
        containerRef.current.scrollTop = targetY - 300; // Offset to center
    }
  }, [unlockedLevelCount]);

  const handleLevelClick = (level: LevelConfig) => {
      playMusic('sfx_bg.mp3'); 
      setSelectedLevel(level);
  };

  // Generate SVG Path dynamically
  const generatePath = () => {
      if (LEVEL_POSITIONS.length === 0) return '';
      let d = `M ${LEVEL_POSITIONS[0].x}% ${LEVEL_POSITIONS[0].y}%`;
      for (let i = 0; i < LEVEL_POSITIONS.length - 1; i++) {
          const current = LEVEL_POSITIONS[i];
          const next = LEVEL_POSITIONS[i + 1];
          
          // Control points for bezier curve
          // We want a curve that goes "up" from current and "down" to next
          // Since Y decreases as we go up the map (0 is top), "up" means lower Y value
          const distY = current.y - next.y;
          
          const cp1x = current.x;
          const cp1y = current.y - (distY * 0.5);
          
          const cp2x = next.x;
          const cp2y = next.y + (distY * 0.5);
          
          d += ` C ${cp1x}% ${cp1y}%, ${cp2x}% ${cp2y}%, ${next.x}% ${next.y}%`;
      }
      return d;
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto h-screen overflow-hidden bg-paper relative">
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between relative z-20 bg-paper/90 backdrop-blur-sm border-b border-zinc-200/50 shadow-sm">
        <button onClick={() => { playMusic('sfx_bg.mp3'); onBack(); }} className="p-2 -ml-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ArrowLeftIcon className="w-6 h-6 text-zinc-700" />
        </button>
        <div className="text-center">
            <h2 className="font-hand text-3xl font-bold text-zinc-800">Adventure Map</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
                <div className="h-2 w-24 bg-zinc-200 rounded-full overflow-hidden border border-zinc-300">
                    <div 
                        className="h-full bg-green-500 transition-all duration-500" 
                        style={{ width: `${(unlockedLevelCount / LEVELS.length) * 100}%` }}
                    ></div>
                </div>
                <span className="text-xs font-sans text-zinc-500 font-bold">{unlockedLevelCount}/{LEVELS.length}</span>
            </div>
        </div>
        <div className="w-8"></div>
      </div>

      {/* Map Content */}
      <div ref={containerRef} className="flex-1 overflow-y-auto relative scrollbar-hide bg-paper">
        {/* Background Decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden h-[3000px]">
            {/* Random Doodles - More of them for the longer map */}
            <div className="absolute top-[2%] left-[10%] rotate-12 text-zinc-400 text-4xl font-hand">~ ~ ~</div>
            <div className="absolute top-[5%] right-[15%] -rotate-6 text-zinc-400 text-6xl font-hand">#</div>
            <div className="absolute top-[10%] left-[5%] rotate-45 w-16 h-16 border-2 border-dashed border-zinc-400 rounded-full"></div>
            <div className="absolute top-[15%] right-[5%] -rotate-12 w-12 h-12 border border-zinc-400"></div>
            <div className="absolute top-[20%] left-[40%] text-zinc-300 text-8xl opacity-30">?</div>
            
            <div className="absolute top-[35%] right-[20%] rotate-90 text-zinc-400 text-5xl font-hand">:)</div>
            <div className="absolute top-[45%] left-[15%] -rotate-12 w-24 h-24 border-b-2 border-zinc-300 rounded-full"></div>
            <div className="absolute top-[60%] right-[10%] rotate-45 text-zinc-300 text-9xl opacity-20">*</div>
            <div className="absolute top-[75%] left-[30%] -rotate-6 text-zinc-400 font-hand text-xl">blah blah</div>
            <div className="absolute top-[85%] right-[25%] rotate-180 w-20 h-20 border-2 border-dotted border-zinc-400"></div>
        </div>

        <div className="relative w-full h-[3000px]">
            {/* Connecting Path (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                <path 
                    d={generatePath()}
                    fill="none"
                    stroke="#d4d4d8" 
                    strokeWidth="4"
                    strokeDasharray="12 12"
                    strokeLinecap="round"
                />
            </svg>

            {/* Levels */}
            {LEVELS.map((level, index) => {
                const pos = LEVEL_POSITIONS[index];
                const isLocked = level.id > unlockedLevelCount;
                const isCompleted = level.id < unlockedLevelCount;
                const isCurrent = level.id === unlockedLevelCount;
                const isBoss = index === LEVELS.length - 1;

                return (
                    <div 
                        key={level.id} 
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
                        style={{ left: `${pos.x}%`, top: `${pos.y}%`, zIndex: 10 }}
                    >
                        {/* Interactive Node */}
                        <button
                            onClick={() => {
                                if (!isLocked) handleLevelClick(level);
                            }}
                            disabled={isLocked}
                            className={`
                                relative flex items-center justify-center transition-all duration-300
                                ${isBoss ? 'w-24 h-24' : 'w-16 h-16'}
                                ${isLocked ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}
                                ${isCurrent ? 'animate-bounce-slow' : ''}
                            `}
                        >
                            {/* Node Circle */}
                            <div className={`
                                w-full h-full rounded-full border-[3px] flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]
                                ${isLocked ? 'border-zinc-300 bg-zinc-100' : 
                                  isCompleted ? 'border-green-600 bg-green-50' : 
                                  isBoss ? 'border-red-500 bg-red-50' : 'border-zinc-800 bg-white'}
                                sketch-button
                            `}>
                                {isLocked ? (
                                    <LockClosedIcon className="w-6 h-6 text-zinc-400" />
                                ) : isCompleted ? (
                                    <StarIcon className="w-8 h-8 text-green-500" />
                                ) : isBoss ? (
                                    <span className="text-3xl">👑</span>
                                ) : (
                                    <span className="font-hand text-2xl font-bold text-zinc-800">{level.id}</span>
                                )}
                            </div>

                            {/* Current Level Indicator */}
                            {isCurrent && (
                                <div className="absolute -top-8 animate-bounce">
                                    <div className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md uppercase tracking-wide">
                                        Here
                                    </div>
                                    <div className="w-2 h-2 bg-blue-500 rotate-45 mx-auto -mt-1"></div>
                                </div>
                            )}
                        </button>
                        
                        {/* Label */}
                        {!isLocked && (
                            <div className={`
                                mt-2 bg-white/90 backdrop-blur-sm border border-zinc-800 px-2 py-1 rounded-md rotate-[-2deg] shadow-sm
                                transition-all duration-300 opacity-0 group-hover:opacity-100 absolute top-full pointer-events-none whitespace-nowrap z-20
                            `}>
                                <span className="font-hand font-bold text-xs block text-center">
                                    {level.title}
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>

      {/* Mission Briefing Modal */}
      {selectedLevel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
              <div className="sketch-modal bg-white w-full max-w-sm relative overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
                  {/* Modal Header */}
                  <div className="bg-zinc-100 p-4 border-b border-zinc-200 flex justify-between items-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-50"></div>
                      <h3 className="font-hand text-2xl font-bold text-zinc-800 relative z-10 flex items-center gap-2">
                          <MapIcon className="w-6 h-6 text-zinc-500" />
                          Mission Briefing
                      </h3>
                      <button 
                        onClick={() => { playMusic('sfx_bg.mp3'); setSelectedLevel(null); }}
                        className="p-1 hover:bg-zinc-200 rounded-full transition-colors relative z-10"
                      >
                          <XMarkIcon className="w-6 h-6 text-zinc-600" />
                      </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 overflow-y-auto custom-scrollbar">
                      <div className="flex items-start justify-between mb-2">
                        <h2 className="font-hand text-2xl font-bold text-blue-600 leading-tight">{selectedLevel.title}</h2>
                        <span className={`
                            px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border
                            ${selectedLevel.difficulty === 'easy' ? 'bg-green-100 text-green-700 border-green-200' : 
                              selectedLevel.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                              'bg-red-100 text-red-700 border-red-200'}
                        `}>
                            {selectedLevel.difficulty}
                        </span>
                      </div>
                      
                      <div className="mb-6 relative">
                          <div className="absolute -left-2 top-2 bottom-2 w-1 bg-zinc-200 rounded-full"></div>
                          <p className="font-hand text-lg text-zinc-600 leading-relaxed italic pl-4">
                              "{selectedLevel.story}"
                          </p>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border-2 border-dashed border-yellow-200 relative group">
                          <div className="absolute -top-3 -left-2 bg-yellow-400 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider flex items-center gap-1">
                              <FlagIcon className="w-3 h-3" />
                              Objective
                          </div>
                          <p className="font-hand font-bold text-zinc-800 mt-1 group-hover:scale-[1.01] transition-transform">
                              {selectedLevel.objective}
                          </p>
                      </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-5 bg-zinc-50 border-t border-zinc-200">
                      <button 
                        onClick={() => { playMusic('sfx_bg.mp3'); onSelectLevel(selectedLevel); }}
                        className="w-full sketch-button bg-green-400 hover:bg-green-500 text-white py-4 font-hand font-bold text-xl shadow-lg transform transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
                        style={{textShadow: '1px 1px 0 rgba(0,0,0,0.2)'}}
                      >
                          <span>Start Mission</span>
                          <ArrowLeftIcon className="w-5 h-5 rotate-180" />
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
