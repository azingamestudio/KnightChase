
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { ArrowLeftIcon, LockClosedIcon, XMarkIcon, StarIcon } from '@heroicons/react/24/solid';

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
        title: "Page 50: The Masterpiece",
        story: "You have reached the final page. Here resides the Dragon—a detailed, shaded, and ruthless drawing. It does not make mistakes. It does not show mercy. Defeat it, and become the Legend of the Notebook.",
        objective: "Defeat the 'Hard' AI. No handicaps. Pure skill.",
        initialBlocked: [],
        p1Start: { x: 3, y: 3 }, 
        p2Start: { x: 4, y: 4 },
        difficulty: 'hard'
    }
];

export const AdventureMap: React.FC<AdventureMapProps> = ({ onBack, onSelectLevel, unlockedLevelCount }) => {
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig | null>(null);

  return (
    <div className="flex flex-col w-full max-w-md mx-auto h-screen overflow-hidden bg-paper relative">
      
      {/* Header */}
      <div className="p-6 flex items-center justify-between relative z-10 bg-paper/90 backdrop-blur-sm border-b border-zinc-200/50 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ArrowLeftIcon className="w-6 h-6 text-zinc-700" />
        </button>
        <div className="text-center">
            <h2 className="font-hand text-3xl font-bold text-zinc-800">Adventure</h2>
            <p className="text-xs font-sans text-zinc-500 font-bold tracking-wider uppercase text-blue-500">{unlockedLevelCount} / {LEVELS.length} Unlocked</p>
        </div>
        <div className="w-8"></div> {/* Spacer */}
      </div>

      {/* Map Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-24 scrollbar-hide">
        <div className="relative min-h-[700px] pt-10">
            {/* Simple Central Path Line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-transparent border-l-4 border-dashed border-zinc-300/60" style={{ zIndex: 0 }}></div>

            <div className="flex flex-col items-center gap-20 relative z-10">
                {LEVELS.map((level) => {
                    const isLocked = level.id > unlockedLevelCount;
                    const isCompleted = level.id < unlockedLevelCount;
                    return (
                        <div key={level.id} className="relative group flex flex-col items-center">
                             <button
                                onClick={() => {
                                    if (!isLocked) setSelectedLevel(level);
                                }}
                                disabled={isLocked}
                                className={`
                                    relative w-24 h-24 flex flex-col items-center justify-center
                                    transition-all duration-300 
                                    ${isLocked ? 'opacity-60 grayscale' : 'hover:scale-110 cursor-pointer'}
                                `}
                            >
                                <div className={`
                                    w-20 h-20 rounded-full border-[3px] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]
                                    ${isLocked ? 'border-zinc-300 bg-zinc-100' : isCompleted ? 'border-green-600 bg-green-50 sketch-button' : 'border-zinc-800 bg-white sketch-button'}
                                `}>
                                    {isLocked ? (
                                        <LockClosedIcon className="w-8 h-8 text-zinc-400" />
                                    ) : isCompleted ? (
                                        <StarIcon className="w-10 h-10 text-green-500" />
                                    ) : (
                                        <span className="font-hand text-3xl font-bold">{level.id}</span>
                                    )}
                                </div>
                            </button>
                            
                            {/* Level Title Tag */}
                            <div className={`
                                absolute -bottom-10 bg-white border border-zinc-800 px-3 py-2 rounded-md rotate-[-2deg] shadow-sm transition-all
                                ${isLocked ? 'opacity-50' : 'opacity-100'}
                            `}>
                                <span className="font-hand font-bold text-sm whitespace-nowrap block text-center">
                                    {isLocked ? 'Locked' : level.title}
                                </span>
                            </div>
                        </div>
                    );
                })}
                
                {/* Boss Node */}
                <div className="mt-12 opacity-80 text-center">
                    <div className="w-20 h-20 mx-auto rounded-full border-4 border-dashed border-red-300 bg-red-50 flex items-center justify-center animate-pulse">
                        <span className="text-3xl">👑</span>
                    </div>
                    <p className="mt-4 font-hand text-sm font-bold text-red-400 uppercase tracking-widest">Boss Fight</p>
                </div>
            </div>
        </div>
      </div>

      {/* Mission Briefing Modal */}
      {selectedLevel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
              <div className="sketch-modal bg-white w-full max-w-sm relative overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="bg-zinc-100 p-4 border-b border-zinc-200 flex justify-between items-center">
                      <h3 className="font-hand text-2xl font-bold text-zinc-800">Mission Briefing</h3>
                      <button 
                        onClick={() => setSelectedLevel(null)}
                        className="p-1 hover:bg-zinc-200 rounded-full transition-colors"
                      >
                          <XMarkIcon className="w-6 h-6 text-zinc-600" />
                      </button>
                  </div>

                  <div className="p-6 overflow-y-auto">
                      <h2 className="font-hand text-3xl font-bold text-blue-600 mb-4 leading-none">{selectedLevel.title}</h2>
                      
                      <div className="mb-6">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400 mb-2 border-b border-zinc-100 pb-1">The Story</h4>
                          <p className="font-hand text-lg text-zinc-700 leading-relaxed italic">
                              "{selectedLevel.story}"
                          </p>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 border-dashed relative">
                          <div className="absolute -top-3 -left-2 bg-yellow-400 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider">
                              Objective
                          </div>
                          <p className="font-hand font-bold text-zinc-800 mt-1">
                              {selectedLevel.objective}
                          </p>
                      </div>
                  </div>

                  <div className="p-6 bg-zinc-50 border-t border-zinc-200">
                      <button 
                        onClick={() => onSelectLevel(selectedLevel)}
                        className="w-full sketch-button bg-green-400 hover:bg-green-500 text-white py-4 font-hand font-bold text-xl shadow-lg transform transition-transform hover:-translate-y-1"
                        style={{textShadow: '1px 1px 0 rgba(0,0,0,0.2)'}}
                      >
                          Start Mission
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
