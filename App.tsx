
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { MainMenu } from './components/MainMenu';
import { KnightChaseGame } from './components/KnightChaseGame';
import { AdventureMap, LevelConfig } from './components/AdventureMap';
import { Leaderboard } from './components/Leaderboard';
import { Settings } from './components/Settings';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

type View = 'menu' | 'ai_select' | 'game_pvp' | 'game_ai' | 'game_adventure' | 'game_online' | 'adventure' | 'online_lobby' | 'leaderboard' | 'settings';

type GameConfig = {
  mode: 'pvp' | 'ai' | 'adventure' | 'online';
  difficulty: 'easy' | 'medium' | 'hard';
  levelConfig?: LevelConfig;
};

export type PlayerNames = {
    p1: string;
    p2: string;
    ai: string;
};

export type GameTheme = 'pencil' | 'blue' | 'neon' | 'chalk';

export type GameModifiers = {
    coffeeSpill: boolean; // Feature 2
    sabotage: boolean;    // Feature 3 (Paper Plane)
    invisibleInk: boolean; // Feature 4
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('menu');
  const [config, setConfig] = useState<GameConfig>({ mode: 'ai', difficulty: 'medium' });
  
  // Global State
  const [playerSkin, setPlayerSkin] = useState<string>('knight');
  const [customSkin, setCustomSkin] = useState<string | null>(null);
  const [unlockedLevels, setUnlockedLevels] = useState<number>(1);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [playerNames, setPlayerNames] = useState<PlayerNames>({
      p1: "You",
      p2: "Player 2",
      ai: "PaperBot"
  });
  const [victoryDoodle, setVictoryDoodle] = useState<string | null>(null);
  
  // NEW FEATURES STATE
  const [gameTheme, setGameTheme] = useState<GameTheme>('pencil');
  const [modifiers, setModifiers] = useState<GameModifiers>({
      coffeeSpill: false,
      sabotage: false,
      invisibleInk: false
  });
  
  // Online Simulation State
  const [onlineStatus, setOnlineStatus] = useState<string>('');

  const handleNavigate = (target: string) => {
    if (target === 'game_pvp') {
        setConfig({ mode: 'pvp', difficulty: 'medium' });
        setView('game_pvp');
    } else if (target === 'ai_select') {
        setView('ai_select');
    } else if (target === 'online') {
        setView('online_lobby');
    } else {
        setView(target as View);
    }
  };

  const startGameAI = (difficulty: 'easy' | 'medium' | 'hard') => {
    setConfig({ mode: 'ai', difficulty });
    setView('game_ai');
  };

  const startAdventureLevel = (level: LevelConfig) => {
      setConfig({ mode: 'adventure', difficulty: level.difficulty, levelConfig: level });
      setView('game_adventure');
  };

  const handleLevelComplete = () => {
      if (config.levelConfig && config.levelConfig.id === unlockedLevels) {
          setUnlockedLevels(prev => prev + 1);
      }
      // Return to map after a delay or let the game component handle the UI
      setView('adventure');
  };

  const handleScoreUpdate = (points: number) => {
      setPlayerScore(prev => prev + points);
  };

  // Simulate Online Matchmaking
  useEffect(() => {
      if (view === 'online_lobby') {
          setOnlineStatus('Connecting to servers...');
          const t1 = setTimeout(() => setOnlineStatus('Searching for opponent...'), 1500);
          const t2 = setTimeout(() => setOnlineStatus('Opponent Found: ShadowKnight88'), 3500);
          const t3 = setTimeout(() => {
              setConfig({ mode: 'online', difficulty: 'hard' });
              setView('game_online');
          }, 4500);
          return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
      }
  }, [view]);

  const renderView = () => {
    switch (view) {
        case 'menu':
            return <MainMenu onNavigate={handleNavigate} />;
        case 'ai_select':
            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="w-full max-w-md space-y-4">
                        <button onClick={() => setView('menu')} className="mb-4 flex items-center text-zinc-500 hover:text-zinc-800 font-hand font-bold">
                            <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back
                        </button>
                        <h2 className="font-hand text-3xl font-bold text-center mb-6">Select Difficulty</h2>
                        
                        <button onClick={() => startGameAI('easy')} className="w-full sketch-button py-4 px-6 bg-green-50 hover:bg-green-100 flex items-center justify-between group">
                            <span className="font-hand text-2xl font-bold">Easy</span>
                            <span className="text-2xl group-hover:scale-125 transition-transform">🌱</span>
                        </button>
                        <button onClick={() => startGameAI('medium')} className="w-full sketch-button py-4 px-6 bg-yellow-50 hover:bg-yellow-100 flex items-center justify-between group">
                            <span className="font-hand text-2xl font-bold">Medium</span>
                            <span className="text-2xl group-hover:scale-125 transition-transform">🤖</span>
                        </button>
                        <button onClick={() => startGameAI('hard')} className="w-full sketch-button py-4 px-6 bg-red-50 hover:bg-red-100 flex items-center justify-between group">
                            <span className="font-hand text-2xl font-bold">Hard</span>
                            <span className="text-2xl group-hover:scale-125 transition-transform">🔥</span>
                        </button>
                    </div>
                </div>
            );
        case 'game_pvp':
        case 'game_ai':
        case 'game_online':
            return (
                <KnightChaseGame 
                    mode={config.mode} 
                    difficulty={config.difficulty} 
                    playerSkin={playerSkin}
                    customSkin={customSkin}
                    playerNames={playerNames}
                    victoryDoodle={victoryDoodle}
                    onBack={() => setView('menu')} 
                    onScoreUpdate={handleScoreUpdate}
                    // New Props
                    theme={gameTheme}
                    modifiers={modifiers}
                />
            );
        case 'game_adventure':
            return (
                <KnightChaseGame
                    mode="adventure"
                    playerSkin={playerSkin}
                    customSkin={customSkin}
                    playerNames={playerNames}
                    levelConfig={config.levelConfig}
                    victoryDoodle={victoryDoodle}
                    onBack={() => setView('adventure')}
                    onLevelComplete={handleLevelComplete}
                    onScoreUpdate={handleScoreUpdate}
                    // Adventure usually has fixed modifiers, but let's allow theme
                    theme={gameTheme}
                    modifiers={{ coffeeSpill: false, sabotage: false, invisibleInk: false }} 
                />
            );
        case 'adventure':
            return (
                <AdventureMap 
                    onBack={() => setView('menu')} 
                    onSelectLevel={startAdventureLevel} 
                    unlockedLevelCount={unlockedLevels}
                />
            );
        case 'leaderboard':
            return <Leaderboard onBack={() => setView('menu')} currentScore={playerScore} playerName={playerNames.p1} />;
        case 'settings':
            return (
                <Settings 
                    onBack={() => setView('menu')} 
                    currentSkin={playerSkin} 
                    onSkinChange={setPlayerSkin}
                    customSkin={customSkin}
                    onCustomSkinChange={setCustomSkin}
                    playerNames={playerNames}
                    onNamesChange={setPlayerNames}
                    victoryDoodle={victoryDoodle}
                    onVictoryDoodleChange={setVictoryDoodle}
                    // New Props
                    theme={gameTheme}
                    onThemeChange={setGameTheme}
                    modifiers={modifiers}
                    onModifiersChange={setModifiers}
                />
            );
        case 'online_lobby':
            return (
                 <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                     <h2 className="font-hand text-3xl font-bold mb-4">Online Multiplayer</h2>
                     <p className="font-hand text-xl text-zinc-500 mb-8 animate-pulse">{onlineStatus}</p>
                     <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                     <button onClick={() => setView('menu')} className="mt-12 text-zinc-400 hover:text-zinc-600 font-hand underline">Cancel</button>
                 </div>
            );
        default:
            return <MainMenu onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className={`min-h-screen overflow-x-hidden relative transition-colors duration-500 
        ${gameTheme === 'chalk' ? 'bg-zinc-900 text-white' : 'bg-paper text-zinc-800'}
    `}>
      {/* Decorative elements - Conditional based on Theme */}
      {gameTheme !== 'chalk' && (
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30 z-0">
             <div className="absolute top-10 left-10 w-32 h-1 bg-blue-200/50 -rotate-6 rounded-full"></div>
             <div className="absolute bottom-20 right-20 w-64 h-64 border-4 border-zinc-200 rounded-full opacity-20"></div>
          </div>
      )}

      <div className="relative z-10 w-full">
        {renderView()}
      </div>
    </div>
  );
};

export default App;
