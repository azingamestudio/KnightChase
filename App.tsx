
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MainMenu } from './components/MainMenu';
import { KnightChaseGame } from './components/KnightChaseGame';
import { AdventureMap, LevelConfig } from './components/AdventureMap';
import { Leaderboard } from './components/Leaderboard';
import { Settings } from './components/Settings';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { playMusic, stopMusic, toggleMute, getIsMuted } from './src/lib/audio';
import { initializeAdMob, showBannerAd, hideBannerAd, showInterstitialAd, prepareInterstitialAd } from './src/lib/admob';
import { initializeStore, registerPremiumListener, purchasePremium, restorePurchases } from './src/lib/store';
import { io, Socket } from 'socket.io-client';
import { API_URL, SOCKET_URL, registerUser, submitScore } from './src/lib/api';
import { getLanguage, setLanguage, LanguageCode, t } from './src/lib/i18n';
import { safeStorage } from './src/lib/storage';
import { initializeFirebase, auth, signInWithGoogle, signOut } from './src/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { syncUserData } from './src/lib/cloud-store';

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

interface Room {
  id: string;
  players: number;
  maxPlayers: number;
}

const App: React.FC = () => {
  const [view, setView] = useState<View>('menu');
  const [config, setConfig] = useState<GameConfig>({ mode: 'ai', difficulty: 'medium' });
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isMutedState, setIsMutedState] = useState<boolean>(getIsMuted());
  const [currentLang, setCurrentLang] = useState<LanguageCode>(getLanguage());
  const [user, setUser] = useState<User | null>(null);
  const [isAdMobReady, setIsAdMobReady] = useState<boolean>(false);

  // Adventure Mode Lives System
  const MAX_LIVES_FREE = 10;
  const MAX_LIVES_PREMIUM = 50;
  const REFILL_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  const [lives, setLives] = useState<number>(10);
  const [lastRefill, setLastRefill] = useState<number>(Date.now());
  const [gamesPlayedCount, setGamesPlayedCount] = useState<number>(0);

  const changeLanguage = (lang: LanguageCode) => {
      setLanguage(lang);
      setCurrentLang(lang);
  };

  // Initialization Effect
  useEffect(() => {
    // Audio
    setIsMutedState(getIsMuted());

    // Initialize Firebase
    initializeFirebase();

    // Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        setUser(user);
        if (user) {
            console.log('User signed in:', user.email);
            syncUserData();
        }
    });

    // Initialize AdMob
    initializeAdMob().then(() => {
        setIsAdMobReady(true);
        if (!isPremium) {
            prepareInterstitialAd();
        }
    });

    // Initialize Store (IAP)
    initializeStore();

    // Listen for Premium Status changes
    registerPremiumListener((status) => {
        setIsPremium(status);
    });

    return () => {
        unsubscribeAuth();
    };
  }, []);

  // Lives System Logic
  useEffect(() => {
    const storedLives = safeStorage.getItem('kc_lives');
    const storedRefill = safeStorage.getItem('kc_last_refill');
    const now = Date.now();
    
    let currentLives = storedLives ? parseInt(storedLives) : 10;
    let lastTime = storedRefill ? parseInt(storedRefill) : now;

    // Check refill
    if (now - lastTime > REFILL_INTERVAL) {
        const max = isPremium ? MAX_LIVES_PREMIUM : MAX_LIVES_FREE;
        currentLives = max; // Refill to max
        lastTime = now;
        safeStorage.setItem('kc_lives', max.toString());
        safeStorage.setItem('kc_last_refill', now.toString());
    } else {
        // If not refilled, ensure cap based on premium status?
        // Actually, if they upgraded, we should probably boost them, but let's stick to refill logic for now.
        // Or if they have > max (downgrade?), keep it.
        if (isPremium && currentLives < MAX_LIVES_PREMIUM && currentLives === MAX_LIVES_FREE && !storedLives) {
             // Initial load for premium user?
             currentLives = MAX_LIVES_PREMIUM;
             safeStorage.setItem('kc_lives', currentLives.toString());
        }
    }

    setLives(currentLives);
    setLastRefill(lastTime);

    // Set up an interval to check for refill every minute
    const interval = setInterval(() => {
        const now = Date.now();
        if (now - lastTime > REFILL_INTERVAL) {
            const max = isPremium ? MAX_LIVES_PREMIUM : MAX_LIVES_FREE;
            setLives(max);
            setLastRefill(now);
            safeStorage.setItem('kc_lives', max.toString());
            safeStorage.setItem('kc_last_refill', now.toString());
            lastTime = now; // Update local var for closure
        }
    }, 60000);

    return () => clearInterval(interval);
  }, [isPremium]);

  // AdMob Banner Management
  useEffect(() => {
      if (isPremium) {
          hideBannerAd();
      } else {
          showBannerAd();
      }
      return () => {
          hideBannerAd();
      };
  }, [isPremium]);

  // Socket.IO State
  const socketRef = useRef<Socket | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [playerType, setPlayerType] = useState<'p1' | 'p2' | null>(null);
  const [roomSearch, setRoomSearch] = useState<string>('');



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
        // Connect to socket when entering online lobby
        if (!socketRef.current) {
          socketRef.current = io(SOCKET_URL, {
            transports: ['websocket'], // Force websocket to avoid polling issues on mobile
          });
          socketRef.current.on('connect', () => {
            console.log('Connected to socket.io server');
          });
          socketRef.current.on('disconnect', () => {
            console.log('Disconnected from socket.io server');
            setCurrentRoomId(null);
            setPlayerType(null);
          });
          socketRef.current.on('roomList', (updatedRooms: Room[]) => {
            setRooms(updatedRooms);
          });
          socketRef.current.on('playerJoined', (playerId: string) => {
            console.log(`Player ${playerId} joined the room.`);
            // Optionally update UI or game state
          });
          socketRef.current.on('playerLeft', (playerId: string) => {
            console.log(`Player ${playerId} left the room.`);
            // Optionally update UI or game state
          });
        }
    } else {
        setView(target as View);
    }
  };

  const startGameAI = (difficulty: 'easy' | 'medium' | 'hard') => {
    setConfig({ mode: 'ai', difficulty });
    setView('game_ai');
  };

  const startAdventureLevel = (level: LevelConfig) => {
      if (lives <= 0) {
          // Double check logic for safety, though effect handles it
          alert(t('adventure_no_lives', currentLang));
          return;
      }
      
      // Deduct Life
      const newLives = lives - 1;
      setLives(newLives);
      safeStorage.setItem('kc_lives', newLives.toString());

      setConfig({ mode: 'adventure', difficulty: level.difficulty, levelConfig: level });
      setView('game_adventure');
  };

  const addLives = (amount: number) => {
      setLives(prev => {
          const max = isPremium ? MAX_LIVES_PREMIUM : MAX_LIVES_FREE;
          return Math.min(prev + amount, max);
      });
  };

  const retryAdventureLevel = () => {
      if (lives <= 0) {
          alert(t('adventure_no_lives', currentLang));
          setView('adventure');
          return false;
      }
      
      const newLives = lives - 1;
      setLives(newLives);
      safeStorage.setItem('kc_lives', newLives.toString());
      return true;
  };

  const handleLevelComplete = () => {
      if (config.levelConfig && config.levelConfig.id === unlockedLevels) {
          setUnlockedLevels(prev => prev + 1);
      }
      // Return to map after a delay or let the game component handle the UI
      setView('adventure');
  };

  const handleScoreUpdate = (score: number, isWin: boolean) => {
      setPlayerScore(prev => prev + score);
      // If logged in/named, submit score
      if (playerNames.p1 && playerNames.p1 !== 'Player 1') {
          submitScore(playerNames.p1, score, isWin);
      }
  };

  const handleAdTrigger = async () => {
      if (isPremium) return;

      const newCount = gamesPlayedCount + 1;
      setGamesPlayedCount(newCount);

      if (newCount % 4 === 0) {
          await showInterstitialAd();
      }
  };

  const createRoom = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('createRoom', (response: { success: boolean; roomId?: string }) => {
        if (response.success && response.roomId) {
          setCurrentRoomId(response.roomId);
          setPlayerType('p1'); // Creator is P1
          setConfig({ mode: 'online', difficulty: 'medium' }); // Default difficulty for online
          setView('game_online');
        } else {
          console.error('Failed to create room');
        }
      });
    }
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('joinRoom', roomId, (response: { success: boolean; roomId?: string; message?: string }) => {
        if (response.success && response.roomId) {
          setCurrentRoomId(response.roomId);
          setPlayerType('p2'); // Joiner is P2
          setConfig({ mode: 'online', difficulty: 'medium' }); // Default difficulty for online
          setView('game_online');
        } else {
          console.error('Failed to join room:', response.message);
        }
      });
    }
  }, []);

  // Simulate Online Matchmaking (Removed, replaced by actual socket logic)
  useEffect(() => {
      if (view === 'online_lobby' && socketRef.current) {
          setOnlineStatus('Waiting for rooms...');
      } else if (view !== 'online_lobby' && view !== 'game_online' && socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
  }, [view]);

  const renderView = () => {
    switch (view) {
        case 'menu':
            return <MainMenu 
                onNavigate={handleNavigate} 
                isPremium={isPremium} 
                onBuyPremium={purchasePremium} 
                lang={currentLang}
                user={user}
                onSignIn={signInWithGoogle}
                onSignOut={signOut}
            />;
        case 'ai_select':
            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-6 animate-in fade-in zoom-in duration-300 relative overflow-hidden">
                    {/* Background Doodles */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-zinc-900 rounded-full"></div>
                        <div className="absolute bottom-20 right-20 w-48 h-48 border-4 border-zinc-900 rotate-12"></div>
                    </div>

                    <div className="w-full max-w-md space-y-6 relative z-10">
                        <button onClick={() => setView('menu')} className="mb-2 flex items-center text-zinc-500 hover:text-zinc-800 font-hand font-bold transition-colors">
                            <ArrowLeftIcon className="w-6 h-6 mr-2" /> {t('game_back', currentLang)}
                        </button>
                        
                        <div className="text-center mb-8">
                            <h2 className="font-hand text-4xl font-black text-zinc-800 tracking-tight">Select Difficulty</h2>
                            <p className="font-hand text-zinc-500 mt-2">Choose your opponent wisely</p>
                        </div>
                        
                        {/* Easy Card */}
                        <button 
                            onClick={() => startGameAI('easy')} 
                            className="w-full group relative overflow-hidden rounded-2xl bg-white border-2 border-zinc-200 hover:border-green-500 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            <div className="absolute top-0 left-0 w-2 h-full bg-green-500 transition-all group-hover:w-full opacity-10"></div>
                            <div className="p-6 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform p-2.5">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-green-600">
                                            <path d="M12 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-3 7a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v5a1 1 0 0 0 1 1h1v2H7v-2h1a1 1 0 0 0 1-1V9Zm-4 11h14v2H5v-2Z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-hand text-2xl font-bold text-zinc-800 group-hover:text-green-700 transition-colors">Easy</span>
                                        <span className="block font-hand text-xs text-zinc-500">Perfect for beginners</span>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full border-2 border-zinc-200 group-hover:border-green-500 group-hover:bg-green-500 flex items-center justify-center transition-all">
                                    <svg className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                        </button>

                        {/* Medium Card */}
                        <button 
                            onClick={() => startGameAI('medium')} 
                            className="w-full group relative overflow-hidden rounded-2xl bg-white border-2 border-zinc-200 hover:border-yellow-500 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            <div className="absolute top-0 left-0 w-2 h-full bg-yellow-500 transition-all group-hover:w-full opacity-10"></div>
                            <div className="p-6 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center group-hover:scale-110 transition-transform p-2.5">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-yellow-600">
                                            <path d="M16 8a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM7 18h10v2H7v-2Zm3-6v2h4v-2h-4Zm-1-4h1.5l1-3 1.5 3H15l-1.5 6h-4l-1.5-6Z" />
                                            <path d="M12 2L9 6h6l-3-4Z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-hand text-2xl font-bold text-zinc-800 group-hover:text-yellow-700 transition-colors">Medium</span>
                                        <span className="block font-hand text-xs text-zinc-500">A balanced challenge</span>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full border-2 border-zinc-200 group-hover:border-yellow-500 group-hover:bg-yellow-500 flex items-center justify-center transition-all">
                                    <svg className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                        </button>

                        {/* Hard Card */}
                        <button 
                            onClick={() => startGameAI('hard')} 
                            className="w-full group relative overflow-hidden rounded-2xl bg-white border-2 border-zinc-200 hover:border-red-500 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            <div className="absolute top-0 left-0 w-2 h-full bg-red-500 transition-all group-hover:w-full opacity-10"></div>
                            <div className="p-6 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center group-hover:scale-110 transition-transform p-2.5">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-red-600">
                                            <path d="M12 2l2.5 4h-5L12 2Zm-5 5 1.5 6h7L17 7l3 3-4 6H5L1 10l3-3Zm-2 13h14v2H5v-2Zm1-4h12v2H6v-2Z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-hand text-2xl font-bold text-zinc-800 group-hover:text-red-700 transition-colors">Hard</span>
                                        <span className="block font-hand text-xs text-zinc-500">For true masters</span>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full border-2 border-zinc-200 group-hover:border-red-500 group-hover:bg-red-500 flex items-center justify-center transition-all">
                                    <svg className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
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
                    onBack={async () => {
                        await handleAdTrigger();
                        setView('menu');
                    }} 
                    onScoreUpdate={handleScoreUpdate}
                    // New Props
                    theme={gameTheme}
                    modifiers={modifiers}
                    socket={socketRef.current} // Pass socket to game component
                    roomId={currentRoomId}
                    playerType={playerType}
                    isPremium={isPremium} 
                    lang={currentLang}
                    onGameEnd={handleAdTrigger}
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
                    onBack={async () => {
                        await handleAdTrigger();
                        setView('adventure');
                    }}
                    onLevelComplete={handleLevelComplete}
                    onScoreUpdate={handleScoreUpdate}
                    // Adventure usually has fixed modifiers, but let's allow theme
                    theme={gameTheme}
                    modifiers={{ coffeeSpill: false, sabotage: false, invisibleInk: false }}
                    isPremium={isPremium} 
                    lang={currentLang}
                    onRetry={async () => {
                        const allowed = retryAdventureLevel();
                        if (allowed) {
                            await handleAdTrigger();
                            return true;
                        }
                        return false;
                    }}
                    onGameEnd={handleAdTrigger}
                />
            );
        case 'adventure':
            return (
                <AdventureMap 
                    onBack={() => setView('menu')} 
                    onSelectLevel={startAdventureLevel} 
                    unlockedLevelCount={unlockedLevels}
                    lives={lives}
                    onAddLives={addLives}
                    maxLives={isPremium ? MAX_LIVES_PREMIUM : MAX_LIVES_FREE}
                    nextRefill={lastRefill + REFILL_INTERVAL}
                    lang={currentLang}
                />
            );
        case 'leaderboard':
            return <Leaderboard onBack={() => setView('menu')} currentScore={playerScore} playerName={playerNames.p1} lang={currentLang} />;
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
                    isPremium={isPremium}
                    onBuyPremium={purchasePremium}
                    onRestorePurchases={restorePurchases}
                    onDebugTogglePremium={() => setIsPremium(!isPremium)}
                    lang={currentLang}
                    onLanguageChange={changeLanguage}
                    user={user}
                    onSignIn={signInWithGoogle}
                    onSignOut={signOut}
                />
            );
        case 'online_lobby':
            const filteredRooms = rooms.filter(room => room.id.toLowerCase().includes(roomSearch.toLowerCase()));
            return (
                 <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                     <h2 className="font-hand text-3xl font-bold mb-4">Online Multiplayer</h2>
                     {currentRoomId ? (
                       <div className="space-y-4">
                         <p className="font-hand text-xl text-zinc-500">Room ID: {currentRoomId}</p>
                         <p className="font-hand text-xl text-zinc-500 animate-pulse">Waiting for opponent...</p>
                         <button onClick={() => {
                           if (socketRef.current && currentRoomId) {
                             socketRef.current.emit('leaveRoom', currentRoomId, () => {
                               setCurrentRoomId(null);
                               setPlayerType(null);
                               setView('menu');
                             });
                           } else {
                             setCurrentRoomId(null);
                             setPlayerType(null);
                             setView('menu');
                           }
                         }} className="mt-4 text-zinc-400 hover:text-zinc-600 font-hand underline">Leave Room</button>
                       </div>
                     ) : (
                       <div className="space-y-4 w-full max-w-md">
                         <button onClick={createRoom} className="w-full sketch-button py-4 px-6 bg-blue-50 hover:bg-blue-100 flex items-center justify-center group">
                             <span className="font-hand text-2xl font-bold">Create Room</span>
                         </button>
                         
                         <div className="mt-8 mb-4">
                            <h3 className="font-hand text-2xl font-bold mb-2">Available Rooms</h3>
                            <input 
                                type="text" 
                                placeholder="Search Room ID..." 
                                value={roomSearch}
                                onChange={(e) => setRoomSearch(e.target.value)}
                                className="w-full p-2 border-2 border-zinc-300 rounded font-hand focus:outline-none focus:border-blue-400"
                            />
                         </div>

                         {filteredRooms.length === 0 ? (
                           <p className="font-hand text-xl text-zinc-500">No rooms found. Create one!</p>
                         ) : (
                           <ul className="space-y-2 max-h-64 overflow-y-auto">
                             {filteredRooms.map(room => (
                               <li key={room.id} className="flex justify-between items-center sketch-border p-4 bg-white/5">
                                 <span className="font-hand text-xl">Room: {room.id} ({room.players}/{room.maxPlayers})</span>
                                 <button onClick={() => joinRoom(room.id)} disabled={room.players >= room.maxPlayers} className="sketch-button px-4 py-2 bg-green-50 hover:bg-green-100 font-hand text-lg disabled:opacity-50">
                                   Join
                                 </button>
                               </li>
                             ))}
                           </ul>
                         )}
                         <button onClick={() => setView('menu')} className="mt-12 text-zinc-400 hover:text-zinc-600 font-hand underline">Back</button>
                       </div>
                     )}
                 </div>
            );
        default:
            return <MainMenu 
                onNavigate={handleNavigate} 
                isPremium={isPremium} 
                onBuyPremium={purchasePremium} 
                lang={currentLang}
                user={user}
                onSignIn={signInWithGoogle}
                onSignOut={signOut}
            />;
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