/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useEffect } from 'react';
// Corrected imports: Replaced TargetIcon with BoltIcon which exists in the solid set.
import { ArrowLeftIcon, LockClosedIcon, XMarkIcon, StarIcon, MapIcon, FireIcon, BeakerIcon, PencilIcon, FlagIcon, BoltIcon, ShieldCheckIcon, HeartIcon } from '@heroicons/react/24/solid';
import { t, LanguageCode } from '../src/lib/i18n';

export type ChallengeType = 'CAPTURE' | 'PATH' | 'ASSASSIN' | 'SURVIVE';

export type LevelConfig = {
    id: number;
    chapter: number;
    type: ChallengeType;
    title: string;
    story: string;
    objective: string;
    initialBlocked: string[];
    p1Start: { x: number; y: number };
    p2Start: { x: number; y: number };
    goal?: { x: number; y: number };
    moveLimit?: number;
    difficulty: 'easy' | 'medium' | 'hard';
};

interface AdventureMapProps {
  onBack: () => void;
  onSelectLevel: (config: LevelConfig) => void;
  unlockedLevelCount: number;
  lives: number;
  maxLives: number;
  nextRefill: number;
  lang: LanguageCode;
}

const LEVELS: LevelConfig[] = [
    // CHAPTER 1: GRAPHITE TRAILS (1-8) - Tutorial & Easy
    { id: 1, chapter: 1, type: 'CAPTURE', title: "The First Sketch", story: "You are just an ink outline. Show the Rival how a Knight moves!", objective: "Capture the opponent.", initialBlocked: [], p1Start: { x: 0, y: 0 }, p2Start: { x: 1, y: 3 }, difficulty: 'easy' },
    { id: 2, chapter: 1, type: 'PATH', title: "Direct Route", story: "The pencil broke, leaving debris. You need to reach the corner!", objective: "Reach (7,7) in 10 moves.", moveLimit: 10, goal: { x: 7, y: 7 }, initialBlocked: ["6,1", "1,2"], p1Start: { x: 0, y: 0 }, p2Start: { x: 4, y: 4 }, difficulty: 'easy' },
    { id: 3, chapter: 1, type: 'ASSASSIN', title: "Quick Strike", story: "The Rival is distracted. Strike now!", objective: "Capture in 6 moves.", moveLimit: 6, initialBlocked: [], p1Start: { x: 2, y: 2 }, p2Start: { x: 5, y: 3 }, difficulty: 'easy' },
    { id: 4, chapter: 1, type: 'PATH', title: "Zig-Zag Drill", story: "Follow the rhythm of the lines.", objective: "Reach (3,4) in 8 moves.", moveLimit: 8, goal: { x: 3, y: 4 }, initialBlocked: ["1,1", "1,2"], p1Start: { x: 0, y: 0 }, p2Start: { x: 7, y: 7 }, difficulty: 'easy' },
    { id: 5, chapter: 1, type: 'SURVIVE', title: "Cornered", story: "Don't let yourself get trapped.", objective: "Survive 5 turns.", moveLimit: 5, initialBlocked: ["0,1", "1,0"], p1Start: { x: 0, y: 0 }, p2Start: { x: 4, y: 4 }, difficulty: 'easy' },
    { id: 6, chapter: 1, type: 'ASSASSIN', title: "The Trap", story: "Use the notebook's edge to your advantage.", objective: "Capture in 8 moves.", moveLimit: 8, initialBlocked: ["5,5", "6,6"], p1Start: { x: 3, y: 3 }, p2Start: { x: 6, y: 6 }, difficulty: 'easy' },
    { id: 7, chapter: 1, type: 'PATH', title: "Ink Blot Leap", story: "A large ink drop is in your way.", objective: "Reach (5,5) in 8 moves.", moveLimit: 8, goal: { x: 5, y: 5 }, initialBlocked: ["3,3", "3,4", "4,3", "4,4"], p1Start: { x: 1, y: 1 }, p2Start: { x: 7, y: 7 }, difficulty: 'medium' },
    { id: 8, chapter: 1, type: 'CAPTURE', title: "Graphite Guardian", story: "The Graphite Guardian won't let you pass.", objective: "Defeat the Guardian.", initialBlocked: ["3,0", "4,0", "3,7", "4,7"], p1Start: { x: 0, y: 0 }, p2Start: { x: 7, y: 7 }, difficulty: 'medium' },

    // CHAPTER 2: THE GEOMETRY EXAM (9-17) - Medium
    { id: 9, chapter: 2, type: 'PATH', title: "Pi is exactly 3", story: "Move in precise circles.", objective: "Reach (4,4) in 8 moves.", moveLimit: 8, goal: { x: 4, y: 4 }, initialBlocked: ["3,3", "2,2"], p1Start: { x: 0, y: 0 }, p2Start: { x: 7, y: 7 }, difficulty: 'medium' },
    { id: 10, chapter: 2, type: 'ASSASSIN', title: "Acute Angle", story: "Find the narrowest path to victory.", objective: "Capture in 6 moves.", moveLimit: 6, initialBlocked: ["2,0", "2,1"], p1Start: { x: 0, y: 0 }, p2Start: { x: 3, y: 2 }, difficulty: 'medium' },
    { id: 11, chapter: 2, type: 'SURVIVE', title: "Logic Gate", story: "The board acts like a circuit. Stay connected.", objective: "Survive 8 turns.", moveLimit: 8, initialBlocked: ["2,2", "5,5"], p1Start: { x: 0, y: 0 }, p2Start: { x: 6, y: 6 }, difficulty: 'medium' },
    { id: 12, chapter: 2, type: 'PATH', title: "Hypotenuse", story: "The shortest distance is a series of L-shapes.", objective: "Reach (7,0) in 10 moves.", moveLimit: 10, goal: { x: 7, y: 0 }, initialBlocked: ["3,4", "4,3"], p1Start: { x: 0, y: 0 }, p2Start: { x: 3, y: 3 }, difficulty: 'medium' },
    { id: 13, chapter: 2, type: 'CAPTURE', title: "Parallel Duel", story: "Two lines, one winner.", objective: "Trap the opponent.", initialBlocked: ["0,2", "7,2", "0,5", "7,5"], p1Start: { x: 0, y: 0 }, p2Start: { x: 7, y: 7 }, difficulty: 'medium' },
    { id: 14, chapter: 2, type: 'ASSASSIN', title: "Equation Solver", story: "Solve for X.", objective: "Capture in 8 moves.", moveLimit: 8, initialBlocked: ["3,3", "4,4"], p1Start: { x: 1, y: 1 }, p2Start: { x: 5, y: 5 }, difficulty: 'medium' },
    { id: 15, chapter: 2, type: 'PATH', title: "Graph Theory", story: "Connect the dots.", objective: "Reach (6,6) in 8 moves.", moveLimit: 8, goal: { x: 6, y: 6 }, initialBlocked: ["5,5", "4,5"], p1Start: { x: 2, y: 2 }, p2Start: { x: 0, y: 0 }, difficulty: 'hard' },
    { id: 16, chapter: 2, type: 'SURVIVE', title: "Zero Sum", story: "Everything must balance out.", objective: "Survive 10 turns.", moveLimit: 10, initialBlocked: [], p1Start: { x: 3, y: 3 }, p2Start: { x: 4, y: 4 }, difficulty: 'medium' },
    { id: 17, chapter: 2, type: 'CAPTURE', title: "The Professor", story: "Can you out-calculate the master?", objective: "Defeat the Professor.", initialBlocked: ["1,1", "6,6"], p1Start: { x: 0, y: 0 }, p2Start: { x: 7, y: 7 }, difficulty: 'hard' },

    // CHAPTER 3: ARTIST'S ACCIDENTS (18-26) - Hard
    { id: 18, chapter: 3, type: 'PATH', title: "Coffee Spill", story: "Avoid the sticky stain!", objective: "Reach (7,7) in 12 moves.", moveLimit: 12, goal: { x: 7, y: 7 }, initialBlocked: ["3,3", "3,4", "4,3", "4,4"], p1Start: { x: 0, y: 0 }, p2Start: { x: 5, y: 5 }, difficulty: 'medium' },
    { id: 19, chapter: 3, type: 'ASSASSIN', title: "Eraser Rubble", story: "Hide and strike.", objective: "Capture in 10 moves.", moveLimit: 10, initialBlocked: ["1,1", "3,3", "5,5"], p1Start: { x: 0, y: 0 }, p2Start: { x: 6, y: 6 }, difficulty: 'medium' },
    { id: 20, chapter: 3, type: 'SURVIVE', title: "Wet Paint", story: "The paint is still drying.", objective: "Survive 12 turns.", moveLimit: 12, initialBlocked: [], p1Start: { x: 0, y: 0 }, p2Start: { x: 7, y: 7 }, difficulty: 'hard' },
    { id: 21, chapter: 3, type: 'PATH', title: "Color Wheel", story: "Move through the spectrum.", objective: "Reach (3,3) in 8 moves.", moveLimit: 8, goal: { x: 3, y: 3 }, initialBlocked: ["2,2", "4,4"], p1Start: { x: 0, y: 0 }, p2Start: { x: 7, y: 7 }, difficulty: 'hard' },
    { id: 22, chapter: 3, type: 'ASSASSIN', title: "Splatter Attack", story: "A sudden burst of ink.", objective: "Capture in 8 moves.", moveLimit: 8, initialBlocked: ["4,4", "4,5"], p1Start: { x: 2, y: 2 }, p2Start: { x: 6, y: 5 }, difficulty: 'hard' },
    { id: 23, chapter: 3, type: 'CAPTURE', title: "The Critic", story: "Show him your substance.", objective: "Defeat the Critic.", initialBlocked: ["0,0", "7,7"], p1Start: { x: 3, y: 3 }, p2Start: { x: 4, y: 4 }, difficulty: 'hard' },
    { id: 24, chapter: 3, type: 'PATH', title: "Canvas Edge", story: "Don't fall off!", objective: "Reach (0,7) in 10 moves.", moveLimit: 10, goal: { x: 0, y: 7 }, initialBlocked: ["1,1", "1,2"], p1Start: { x: 7, y: 0 }, p2Start: { x: 4, y: 4 }, difficulty: 'hard' },
    { id: 25, chapter: 3, type: 'SURVIVE', title: "Sticky Tape", story: "Break free.", objective: "Survive 15 turns.", moveLimit: 15, initialBlocked: ["3,3", "4,4"], p1Start: { x: 0, y: 0 }, p2Start: { x: 7, y: 7 }, difficulty: 'hard' },
    { id: 26, chapter: 3, type: 'CAPTURE', title: "Abstract Nightmare", story: "A world without rules.", objective: "Win by any means.", initialBlocked: ["1,1", "3,3", "5,5", "6,6", "2,4", "4,2"], p1Start: { x: 0, y: 0 }, p2Start: { x: 7, y: 7 }, difficulty: 'hard' },

    // CHAPTER 4: THE DRAGON'S LAIR (27-35) - Expert
    { id: 27, chapter: 4, type: 'PATH', title: "Bridge of Fire", story: "Cross the lava river.", objective: "Reach (7,7) in 15 moves.", moveLimit: 15, goal: { x: 7, y: 7 }, initialBlocked: ["0,4", "1,4", "2,4", "3,4", "4,4", "5,4", "6,4"], p1Start: { x: 0, y: 0 }, p2Start: { x: 7, y: 0 }, difficulty: 'hard' },
    { id: 28, chapter: 4, type: 'ASSASSIN', title: "Scaly Defense", story: "The Dragon's scales are hard to pierce.", objective: "Capture in 12 moves.", moveLimit: 12, initialBlocked: ["3,3", "4,4"], p1Start: { x: 0, y: 0 }, p2Start: { x: 5, y: 5 }, difficulty: 'hard' },
    { id: 29, chapter: 4, type: 'SURVIVE', title: "Dragon's Breath", story: "Stay in the safe zones.", objective: "Survive 15 turns.", moveLimit: 15, initialBlocked: ["0,0", "7,7"], p1Start: { x: 3, y: 3 }, p2Start: { x: 4, y: 4 }, difficulty: 'hard' },
    { id: 30, chapter: 4, type: 'PATH', title: "Treasure Hoard", story: "The golden star is buried.", objective: "Reach (5,5) in 10 moves.", moveLimit: 10, goal: { x: 5, y: 5 }, initialBlocked: ["4,4", "6,6"], p1Start: { x: 1, y: 1 }, p2Start: { x: 7, y: 7 }, difficulty: 'hard' },
    { id: 31, chapter: 4, type: 'ASSASSIN', title: "Smoke Screen", story: "The air is thick.", objective: "Capture in 10 moves.", moveLimit: 10, initialBlocked: ["3,3", "4,4"], p1Start: { x: 0, y: 7 }, p2Start: { x: 2, y: 5 }, difficulty: 'hard' },
    { id: 32, chapter: 4, type: 'SURVIVE', title: "The Roar", story: "The sound shakes the board.", objective: "Survive 20 turns.", moveLimit: 20, initialBlocked: ["3,0", "0,3"], p1Start: { x: 0, y: 0 }, p2Start: { x: 7, y: 7 }, difficulty: 'hard' },
    { id: 33, chapter: 4, type: 'CAPTURE', title: "The Wyvern", story: "Defeat the lieutenant.", objective: "Capture the Wyvern.", initialBlocked: ["1,1", "6,6"], p1Start: { x: 0, y: 0 }, p2Start: { x: 7, y: 7 }, difficulty: 'hard' },
    { id: 34, chapter: 4, type: 'PATH', title: "The Final Gate", story: "One last hurdle.", objective: "Reach (7,7) in 12 moves.", moveLimit: 12, goal: { x: 7, y: 7 }, initialBlocked: ["6,0", "6,1", "6,2"], p1Start: { x: 0, y: 0 }, p2Start: { x: 3, y: 3 }, difficulty: 'hard' },
    { id: 35, chapter: 4, type: 'CAPTURE', title: "Legend of the Notebook", story: "The Legend ends here. Defeat the Great Dragon.", objective: "Defeat the Great Dragon.", initialBlocked: [], p1Start: { x: 3, y: 3 }, p2Start: { x: 4, y: 4 }, difficulty: 'hard' },
];

const CHAPTERS = [
    { id: 1, name: "Graphite Trails", icon: PencilIcon, color: "text-zinc-500", bg: "bg-zinc-50" },
    { id: 2, name: "Geometry Exam", icon: BeakerIcon, color: "text-blue-500", bg: "bg-blue-50" },
    { id: 3, name: "Artist's Accidents", icon: MapIcon, color: "text-orange-500", bg: "bg-orange-50" },
    { id: 4, name: "The Dragon's Lair", icon: FireIcon, color: "text-red-500", bg: "bg-red-50" },
];

export const AdventureMap: React.FC<AdventureMapProps> = ({ 
    onBack, 
    onSelectLevel, 
    unlockedLevelCount,
    lives,
    maxLives,
    nextRefill,
    lang
}) => {
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig | null>(null);
  const [activeChapter, setActiveChapter] = useState(1);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Countdown timer for refill
  useEffect(() => {
      if (lives >= maxLives) {
          setTimeLeft('');
          return;
      }
      
      const updateTimer = () => {
          const now = Date.now();
          const diff = nextRefill - now;
          if (diff <= 0) {
              setTimeLeft('00:00:00'); 
          } else {
              const h = Math.floor(diff / (1000 * 60 * 60));
              const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              const s = Math.floor((diff % (1000 * 60)) / 1000);
              setTimeLeft(`${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
          }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
  }, [lives, maxLives, nextRefill]);

  const filteredLevels = useMemo(() => 
    LEVELS.filter(l => l.chapter === activeChapter), 
  [activeChapter]);

  const getChallengeIcon = (type: ChallengeType) => {
      switch(type) {
          case 'PATH': return <FlagIcon className="w-4 h-4 text-green-500" />;
          // Replaced non-existent TargetIcon with BoltIcon for ASSASSIN challenge type.
          case 'ASSASSIN': return <BoltIcon className="w-4 h-4 text-red-500" />;
          case 'SURVIVE': return <ShieldCheckIcon className="w-4 h-4 text-blue-500" />;
          default: return <StarIcon className="w-4 h-4 text-yellow-500" />;
      }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto h-screen overflow-hidden bg-paper relative doodle-font">
      
      {/* Header */}
      <div className="p-6 flex items-center justify-between relative z-10 bg-white/90 backdrop-blur-sm border-b-2 border-zinc-800 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-xl transition-all border-2 border-transparent hover:border-zinc-800">
            <ArrowLeftIcon className="w-6 h-6 text-zinc-700" />
        </button>
        <div className="text-center">
            <h2 className="font-hand text-4xl font-bold text-zinc-800 tracking-tight">{t('menu_adventure', lang)}</h2>
            <div className="flex items-center justify-center gap-4 mt-1">
                {/* Progress */}
                <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-zinc-200 rounded-full overflow-hidden border border-zinc-800">
                        <div 
                            className="h-full bg-blue-500 transition-all duration-1000" 
                            style={{ width: `${(unlockedLevelCount / LEVELS.length) * 100}%` }}
                        ></div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                        {unlockedLevelCount} / {LEVELS.length}
                    </span>
                </div>

                {/* Lives */}
                <div className="flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">
                    <HeartIcon className="w-4 h-4 text-red-500 animate-pulse" />
                    <span className={`font-hand font-bold text-sm ${lives === 0 ? 'text-red-600' : 'text-zinc-700'}`}>
                        {lives}/{maxLives}
                    </span>
                </div>
            </div>
            {/* Refill Timer */}
            {lives < maxLives && timeLeft && (
                <div className="text-[10px] text-zinc-400 font-bold mt-1">
                    {t('adventure_refill_in', lang)} {timeLeft}
                </div>
            )}
        </div>
        <div className="w-10"></div>
      </div>

      {/* Chapter Tabs */}
      <div className="flex p-2 bg-zinc-100/50 border-b border-zinc-200 gap-2 overflow-x-auto scrollbar-hide">
          {CHAPTERS.map(ch => {
              const Icon = ch.icon;
              const isChapterLocked = LEVELS.find(l => l.chapter === ch.id)?.id! > unlockedLevelCount && ch.id !== 1;
              return (
                  <button
                    key={ch.id}
                    onClick={() => !isChapterLocked && setActiveChapter(ch.id)}
                    className={`
                        flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all
                        ${activeChapter === ch.id ? 'bg-white border-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-transparent border-transparent opacity-60'}
                        ${isChapterLocked ? 'grayscale cursor-not-allowed' : 'hover:bg-white/50'}
                    `}
                  >
                      <Icon className={`w-5 h-5 ${ch.color}`} />
                      <span className="font-hand font-bold text-sm whitespace-nowrap">{t(`adv_ch${ch.id}_name`, lang)}</span>
                      {isChapterLocked && <LockClosedIcon className="w-3 h-3 text-zinc-400" />}
                  </button>
              );
          })}
      </div>

      {/* Map Content */}
      <div className="flex-1 overflow-y-auto p-8 pb-24 scrollbar-hide bg-paper">
        <div className="relative flex flex-col items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full relative z-10">
                {filteredLevels.map((level) => {
                    const isLocked = level.id > unlockedLevelCount;
                    const isCompleted = level.id < unlockedLevelCount;
                    const isCurrent = level.id === unlockedLevelCount;
                    
                    return (
                        <button
                            key={level.id}
                            disabled={isLocked}
                            onClick={() => setSelectedLevel(level)}
                            className={`
                                relative flex flex-col p-6 rounded-2xl border-4 transition-all text-left
                                ${isLocked ? 'bg-zinc-100 border-zinc-200 opacity-60' : 'bg-white border-zinc-800 hover:scale-[1.02] active:scale-95 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}
                                ${isCurrent ? 'ring-4 ring-blue-400 ring-offset-4 animate-scribble' : ''}
                            `}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-hand text-4xl font-black text-zinc-300">#{level.id}</span>
                                <div className="flex gap-1">
                                    {getChallengeIcon(level.type)}
                                    {isLocked ? (
                                        <LockClosedIcon className="w-6 h-6 text-zinc-300" />
                                    ) : isCompleted ? (
                                        <StarIcon className="w-8 h-8 text-yellow-400 drop-shadow-sm" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <h3 className="font-hand text-2xl font-bold text-zinc-800 leading-tight mb-1">{t(`adv_l${level.id}_title`, lang)}</h3>
                            <p className="font-hand text-xs text-zinc-500 uppercase tracking-widest font-bold">
                                {t('adventure_difficulty', lang)}: {level.difficulty}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
      </div>

      {/* Mission Briefing Modal */}
      {selectedLevel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
              <div className="sketch-modal bg-white w-full max-w-sm relative overflow-hidden flex flex-col max-h-[90vh] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-4 border-zinc-800 rounded-3xl">
                  <div className="bg-zinc-50 p-6 border-b-2 border-zinc-800 flex justify-between items-center pt-4">
                      <div>
                        <h3 className="font-hand text-sm font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">{t('adventure_page', lang)} {selectedLevel.id}</h3>
                        <h2 className="font-hand text-3xl font-black text-zinc-800 leading-none">{t(`adv_l${selectedLevel.id}_title`, lang)}</h2>
                      </div>
                      <button 
                        onClick={() => setSelectedLevel(null)}
                        className="p-2 hover:bg-zinc-200 rounded-full transition-colors border-2 border-transparent hover:border-zinc-800"
                      >
                          <XMarkIcon className="w-6 h-6 text-zinc-600" />
                      </button>
                  </div>

                  <div className="p-8 overflow-y-auto space-y-6">
                      <div>
                          <h4 className="font-hand text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">{t('adventure_story', lang)}</h4>
                          <p className="font-hand text-xl text-zinc-700 leading-relaxed italic border-l-4 border-blue-200 pl-4 py-1">
                              "{t(`adv_l${selectedLevel.id}_story`, lang)}"
                          </p>
                      </div>

                      <div className="bg-orange-50 p-5 rounded-2xl border-2 border-orange-200 relative overflow-hidden">
                          <h4 className="font-hand text-xs font-bold uppercase tracking-widest text-orange-600 mb-2">{t('adventure_objective', lang)}</h4>
                          <p className="font-hand text-xl font-bold text-zinc-800 relative z-10">
                              {t(`adv_l${selectedLevel.id}_obj`, lang)}
                          </p>
                      </div>
                  </div>

                  <div className="p-6 bg-zinc-50 border-t-2 border-zinc-800">
                      {lives <= 0 && (
                        <div className="mb-4 p-3 bg-red-50 border-2 border-red-100 rounded-xl text-center">
                            <p className="font-hand font-bold text-red-500 text-sm mb-1">{t('adventure_no_lives', lang)}</p>
                            <p className="font-hand font-bold text-zinc-400 text-xs">{t('adventure_refill_in', lang)} {timeLeft}</p>
                        </div>
                      )}
                      <button 
                        onClick={() => onSelectLevel(selectedLevel)}
                        disabled={lives <= 0}
                        className={`w-full sketch-button py-5 font-hand font-black text-2xl transition-all rounded-2xl
                            ${lives > 0 
                            ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none' 
                            : 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none'}
                        `}
                      >
                          {t('adventure_start', lang)}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
