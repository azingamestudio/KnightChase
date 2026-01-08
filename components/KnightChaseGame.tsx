
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowPathIcon, HomeIcon, ShareIcon, FaceSmileIcon, FireIcon, HandThumbDownIcon, HandThumbUpIcon, TrashIcon, GiftIcon, BoltIcon, SparklesIcon, PaperAirplaneIcon, FlagIcon } from '@heroicons/react/24/outline';
import { LevelConfig } from './AdventureMap';
import { PlayerNames, GameTheme, GameModifiers } from '../App';
import { playSFX } from '../src/lib/audio';
import { t, LanguageCode } from '../src/lib/i18n';

type Player = 'p1' | 'p2';
type Position = { x: number; y: number };
type GameMode = 'pvp' | 'ai' | 'adventure' | 'online';
type Difficulty = 'easy' | 'medium' | 'hard';
type PowerUpType = 'teleport' | 'bomb' | 'freeze';

interface Sticker {
    id: number;
    emoji: string;
    x: number;
    y: number;
    rotation: number;
}

interface GameProps {
  mode: GameMode;
  difficulty?: Difficulty;
  playerSkin?: string;
  customSkin?: string | null;
  playerNames: PlayerNames;
  levelConfig?: LevelConfig;
  victoryDoodle?: string | null;
  onBack: () => void;
  onLevelComplete?: () => void;
  onScoreUpdate: (points: number) => void;
  isPremium: boolean;
  theme: GameTheme;
  modifiers: GameModifiers;
  socket?: any; // Socket.IO socket instance
  roomId?: string; // Room ID for online play
  playerType?: Player; // 'p1' or 'p2' for online play
  lang: LanguageCode;
  onRetry?: () => Promise<boolean> | boolean;
  onGameEnd?: () => Promise<void>;
}

const BOARD_SIZE = 8;

const isValidMove = (current: Position, target: Position, blocked: Set<string>, isTeleporting: boolean): boolean => {
  if (target.x < 0 || target.x >= BOARD_SIZE || target.y < 0 || target.y >= BOARD_SIZE) return false;
  if (isTeleporting) return !blocked.has(`${target.x},${target.y}`);

  const dx = Math.abs(current.x - target.x);
  const dy = Math.abs(current.y - target.y);
  if (!((dx === 2 && dy === 1) || (dx === 1 && dy === 2))) return false;
  if (blocked.has(`${target.x},${target.y}`)) return false;
  return true;
};

const getLegalMoves = (pos: Position, blocked: Set<string>, isTeleporting: boolean = false): Position[] => {
  const moves: Position[] = [];
  if (isTeleporting) {
      for(let y=0; y<BOARD_SIZE; y++) {
          for(let x=0; x<BOARD_SIZE; x++) {
              if (!blocked.has(`${x},${y}`) && (x !== pos.x || y !== pos.y)) {
                  moves.push({x, y});
              }
          }
      }
      return moves;
  }
  const offsets = [{x: 1, y: 2}, {x: 1, y: -2}, {x: -1, y: 2}, {x: -1, y: -2}, {x: 2, y: 1}, {x: 2, y: -1}, {x: -2, y: 1}, {x: -2, y: -1}];
  for (const off of offsets) {
    const target = { x: pos.x + off.x, y: pos.y + off.y };
    if (isValidMove(pos, target, blocked, false)) moves.push(target);
  }
  return moves;
};

// Simplified AI
const getAIMove = (myPos: Position, oppPos: Position, blocked: Set<string>, difficulty: Difficulty, isTeleporting: boolean): Position | null => {
  const legalMoves = getLegalMoves(myPos, blocked, isTeleporting);
  if (legalMoves.length === 0) return null;
  for (const move of legalMoves) {
    if (move.x === oppPos.x && move.y === oppPos.y) return move;
  }
  if (difficulty === 'easy') return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  let bestScore = -Infinity;
  let bestMove = legalMoves[0];
  for (const move of legalMoves) {
    if (isTeleporting) {
         const distToCenter = 3.5 - (Math.abs(move.x - 3.5) + Math.abs(move.y - 3.5));
         const distToEnemy = Math.abs(move.x - oppPos.x) + Math.abs(move.y - oppPos.y);
         const score = distToCenter * 2 - Math.abs(distToEnemy - 3);
         if (score > bestScore) { bestScore = score; bestMove = move; }
         continue;
    }
    const simBlocked = new Set(blocked);
    simBlocked.add(`${myPos.x},${myPos.y}`);
    const myFutureMoves = getLegalMoves(move, simBlocked).length;
    let oppFutureMoves = 0;
    if (difficulty === 'hard') oppFutureMoves = getLegalMoves(oppPos, simBlocked).length;
    let score = myFutureMoves * 10 - (oppFutureMoves * 15);
    if (difficulty === 'hard') {
        const distFromCenter = Math.abs(move.x - 3.5) + Math.abs(move.y - 3.5);
        score -= distFromCenter * 2; 
    }
    score += Math.random() * 5; 
    if (score > bestScore) { bestScore = score; bestMove = move; }
  }
  return bestMove;
};

// --- SVG Icons ---
const PlayerIcon = ({ skin = 'knight', customSkin, color }: { skin: string, customSkin?: string | null, color: string }) => {
    if (skin === 'custom' && customSkin) {
        return <div className="w-full h-full rounded-full overflow-hidden border-2 shadow-sm bg-white" style={{borderColor: color}}><img src={customSkin} alt="Player" className="w-full h-full object-cover" /></div>;
    }
    if (skin === 'king') {
        return <svg viewBox="0 0 24 24" fill={color} className="w-full h-full drop-shadow-md"><path d="M12 2L15 5H9L12 2Z" stroke="currentColor" strokeWidth="1" /><path d="M6 6L18 6V9L12 12L6 9V6Z" stroke="currentColor" strokeWidth="1"/><path d="M6 10V18H18V10L12 13L6 10Z" stroke="currentColor" strokeWidth="1"/><rect x="5" y="19" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1"/></svg>;
    }
    if (skin === 'wizard') {
        return <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full drop-shadow-md"><path d="M12 2L4 20h16L12 2z" fill={color} fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5"/><path d="M12 2v18" stroke="currentColor"/><path d="M8 12h8" stroke="currentColor"/><circle cx="12" cy="8" r="1.5" fill="currentColor" stroke="currentColor"/></svg>;
    }
    if (skin === 'ghost') {
        return <svg viewBox="0 0 24 24" fill={color} className="w-full h-full drop-shadow-md"><path d="M12 2C7 2 4 6 4 11v6l3-2 2 2 3-2 3 2 2-2 3 2v-6c0-5-3-9-8-9z" stroke="currentColor" strokeWidth="1.5"/><circle cx="9" cy="10" r="1.5" fill="white"/><circle cx="15" cy="10" r="1.5" fill="white"/></svg>;
    }
    // Default 'knight' skin - now using blue.png
    return <img src="/blue.png" alt="Player 1" className="w-full h-full object-contain drop-shadow-md" />;
};

export const KnightChaseGame: React.FC<GameProps> = ({
    mode,
    difficulty = 'medium',
    playerSkin = 'knight',
    customSkin,
    playerNames,
    levelConfig,
    victoryDoodle,
    onBack,
    onLevelComplete,
    onScoreUpdate,
    isPremium,
    theme,
    modifiers,
    socket,
    roomId,
    playerType,
    lang,
    onRetry,
    onGameEnd
}) => {
  const initialP1 = levelConfig ? levelConfig.p1Start : { x: 0, y: 0 };
  const initialP2 = levelConfig ? levelConfig.p2Start : { x: 7, y: 7 };
  const initialBlocked = levelConfig ? new Set(levelConfig.initialBlocked) : new Set<string>();
  const activeDifficulty = levelConfig ? levelConfig.difficulty : difficulty;

  const [p1Pos, setP1Pos] = useState<Position>(initialP1);
  const [isConnected, setIsConnected] = useState(true);
  const [p2Pos, setP2Pos] = useState<Position>(initialP2);
  const [blocked, setBlocked] = useState<Set<string>>(initialBlocked);
  const [turn, setTurn] = useState<Player>('p1');
  const [turnCount, setTurnCount] = useState(0); // For coffee Logic
  const [winner, setWinner] = useState<Player | null>(null);
  const [winReason, setWinReason] = useState<string>('');
  const [scoreProcessed, setScoreProcessed] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  
  // Feature States
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [isCrumpled, setIsCrumpled] = useState(false);
  
  // Animation States
  const [p1Scale, setP1Scale] = useState(1);
  const [p2Scale, setP2Scale] = useState(1);
  const [effects, setEffects] = useState<{id: number, x: number, y: number}[]>([]);

  const addEffect = (x: number, y: number) => {
      const id = Date.now() + Math.random();
      setEffects(prev => [...prev, {id, x, y}]);
      setTimeout(() => setEffects(prev => prev.filter(e => e.id !== id)), 500);
  };
  
  // Sabotage State
  const [p1Sabotage, setP1Sabotage] = useState(0); // 0-100
  const [showPlane, setShowPlane] = useState(false);

  // Mystery Box State
  const [mysteryPos, setMysteryPos] = useState<Position | null>(null);
  const [activePowerUp, setActivePowerUp] = useState<{player: Player, type: PowerUpType} | null>(null);
  const [powerUpMessage, setPowerUpMessage] = useState<string | null>(null);

  const [oppName] = useState(mode === 'online' ? `Guest_${Math.floor(Math.random() * 999)}` : (mode === 'pvp' ? playerNames.p2 : playerNames.ai));
  const [chatMsg, setChatMsg] = useState<string | null>(null);

  // --- LOGIC FOR COFFEE SPILL (Feature 2) ---
  useEffect(() => {
      if (modifiers.coffeeSpill && turnCount > 0 && turnCount % 4 === 0 && !winner) {
          // Every 4 turns, expand blocked zone
          const newBlocked = new Set(blocked);
          // Simple algorithm: block edges inward
          const layer = Math.floor(turnCount / 4) - 1;
          if (layer < 4) { // Don't block entire board
              for(let i = layer; i < BOARD_SIZE - layer; i++) {
                  newBlocked.add(`${i},${layer}`); // Top
                  newBlocked.add(`${i},${BOARD_SIZE-1-layer}`); // Bottom
                  newBlocked.add(`${layer},${i}`); // Left
                  newBlocked.add(`${BOARD_SIZE-1-layer},${i}`); // Right
              }
              setBlocked(newBlocked);
              setPowerUpMessage(`${t('mod_coffee', lang)} ☕`);
              setTimeout(() => setPowerUpMessage(null), 2000);
          }
      }
  }, [turnCount, modifiers.coffeeSpill, winner, lang]);

  // --- SPAWN MYSTERY BOX ---
  useEffect(() => {
      if (winner || mysteryPos || activePowerUp) return;
      
      // Online: Only Host (P1) spawns
      if (mode === 'online' && playerType !== 'p1') return;

      if (Math.random() < 0.15) {
          let x, y;
          let attempts = 0;
          do {
              x = Math.floor(Math.random() * BOARD_SIZE);
              y = Math.floor(Math.random() * BOARD_SIZE);
              attempts++;
          } while (
              (blocked.has(`${x},${y}`) || (p1Pos.x === x && p1Pos.y === y) || (p2Pos.x === x && p2Pos.y === y)) && attempts < 20
          );
          if (attempts < 20) {
              const newPos = {x, y};
              setMysteryPos(newPos);
              
              if (mode === 'online' && socket && roomId) {
                  const currentGameState = {
                      p1Pos, p2Pos, blocked: Array.from(blocked), turn, turnCount, winner, winReason,
                      mysteryPos: newPos,
                      activePowerUp, powerUpMessage, p1Sabotage
                  };
                  socket.emit('updateGameState', { roomId, gameState: currentGameState });
              }
          }
      }
  }, [turn, blocked, p1Pos, p2Pos, mysteryPos, winner, activePowerUp, mode, playerType, socket, roomId]);

  const resetGame = () => {
    setIsCrumpled(false);
    setWinner(null); // Clear winner immediately to prevent modal flash
    setWinReason('');
    
    setTimeout(() => {
        setP1Pos(initialP1);
        setP2Pos(initialP2);
        setBlocked(new Set(levelConfig?.initialBlocked || []));
        setTurn('p1');
        setTurnCount(0);
        setChatMsg(null);
        setScoreProcessed(false);
        setStickers([]);
        setMysteryPos(null);
        setActivePowerUp(null);
        setPowerUpMessage(null);
        setP1Sabotage(0);
    }, 300);
  };

  const handlePlayAgain = async () => {
    if (mode === 'adventure' && onRetry) {
        const allowed = await onRetry();
        if (!allowed) return; 
    }

    if (onGameEnd) {
        await onGameEnd();
    }

    // Online Sync: Reset game for opponent too
    if (mode === 'online' && socket && roomId) {
         const resetState = {
             p1Pos: initialP1,
             p2Pos: initialP2,
             blocked: Array.from(initialBlocked),
             turn: 'p1',
             turnCount: 0,
             winner: null,
             winReason: '',
             mysteryPos: null,
             activePowerUp: null,
             powerUpMessage: null,
             p1Sabotage: 0
         };
         socket.emit('updateGameState', { roomId, gameState: resetState });
    }

    resetGame();
  };

  const checkWin = useCallback((currentP1: Position, currentP2: Position, currentBlocked: Set<string>, currentTurn: Player, isTeleporting: boolean) => {
    if (currentP1.x === currentP2.x && currentP1.y === currentP2.y) {
      const w = currentTurn === 'p1' ? 'p1' : 'p2';
      setWinner(w); setWinReason(t('game_captured', lang));
      if (w !== 'p1') setIsCrumpled(true);
      return true;
    }
    const nextPlayer = currentTurn === 'p1' ? 'p2' : 'p1';
    const nextPos = nextPlayer === 'p1' ? currentP1 : currentP2;
    const nextPlayerHasTeleport = activePowerUp?.player === nextPlayer && activePowerUp?.type === 'teleport';
    const nextMoves = getLegalMoves(nextPos, currentBlocked, nextPlayerHasTeleport);
    if (nextMoves.length === 0) {
      setWinner(currentTurn); setWinReason(t('game_trapped', lang));
      if (currentTurn !== 'p1') setIsCrumpled(true);
      return true;
    }
    return false;
  }, [activePowerUp, lang]);

  useEffect(() => {
      if (winner === 'p1' && !scoreProcessed && mode !== 'pvp') {
          let points = 0;
          if (activeDifficulty === 'easy') points = 100;
          else if (activeDifficulty === 'medium') points = 200;
          else if (activeDifficulty === 'hard') points = 300;
          onScoreUpdate(points);
          setScoreProcessed(true);
      }
  }, [winner, scoreProcessed, activeDifficulty, onScoreUpdate, mode]);

  const applyPowerUp = (player: Player, type: PowerUpType, pos: Position, currentBlocked: Set<string>): {newBlocked: Set<string>, skipTurnSwitch: boolean} => {
      let newBlocked = new Set(currentBlocked);
      let skipTurnSwitch = false;
      if (type === 'bomb') {
          for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                  newBlocked.delete(`${pos.x + dx},${pos.y + dy}`);
              }
          }
          setPowerUpMessage(`${player === 'p1' ? playerNames.p1 : oppName} used BOMB!`);
      } else if (type === 'freeze') {
          skipTurnSwitch = true;
          setPowerUpMessage(`${player === 'p1' ? playerNames.p1 : oppName} used FREEZE!`);
      }
      return { newBlocked, skipTurnSwitch };
  };

  const launchSabotage = () => {
      if (p1Sabotage < 100) return;
      setShowPlane(true);
      setP1Sabotage(0);
      
      setTimeout(() => {
          // Block random square
          let x, y;
          do {
              x = Math.floor(Math.random() * BOARD_SIZE);
              y = Math.floor(Math.random() * BOARD_SIZE);
          } while (blocked.has(`${x},${y}`));
          
          const newBlocked = new Set(blocked);
          newBlocked.add(`${x},${y}`);
          setBlocked(newBlocked);
          setShowPlane(false);
          setPowerUpMessage(`${t('mod_sabotage', lang)}! ✈️`);
          setTimeout(() => setPowerUpMessage(null), 2000);
      }, 1000); // Hit halfway through animation
  };

  const makeMove = async (target: Position) => {
    if (winner) return;
    
    // Online Turn Check
    if (mode === 'online' && socket && roomId && playerType && playerType !== turn) {
        console.log("It's not your turn!");
        return;
    }

    playSFX('sfx_pencil.mp3');
    const currentPos = turn === 'p1' ? p1Pos : p2Pos;

    // Animation Triggers: Pick Up & Squash
    if (turn === 'p1') {
        setP1Scale(1.15); // Pick up
        setTimeout(() => setP1Scale(0.9), 300); // Squash on land
        setTimeout(() => setP1Scale(1), 450); // Recover
    } else {
        setP2Scale(1.15);
        setTimeout(() => setP2Scale(0.9), 300);
        setTimeout(() => setP2Scale(1), 450);
    }
    
    // Trigger dust on landing (delayed slightly)
    setTimeout(() => addEffect(target.x, target.y), 300);

    // Sabotage Gain
    let nextP1Sabotage = p1Sabotage;
    if (turn === 'p1' && modifiers.sabotage) {
        nextP1Sabotage = Math.min(100, p1Sabotage + 20);
        setP1Sabotage(nextP1Sabotage);
    }

    // Mystery Box Collection
    let collectedPowerUp: PowerUpType | null = null;
    let nextMysteryPos = mysteryPos;
    if (mysteryPos && target.x === mysteryPos.x && target.y === mysteryPos.y) {
        const types: PowerUpType[] = ['teleport', 'bomb', 'freeze'];
        collectedPowerUp = types[Math.floor(Math.random() * types.length)];
        nextMysteryPos = null;
        setMysteryPos(null);
    }

    // Base Blocked Update
    const newBlocked = new Set(blocked);
    newBlocked.add(`${currentPos.x},${currentPos.y}`);
    setBlocked(newBlocked);

    // Update Positions
    let nextP1 = p1Pos;
    let nextP2 = p2Pos;
    if (turn === 'p1') { nextP1 = target; setP1Pos(target); }
    else { nextP2 = target; setP2Pos(target); }

    // Active PowerUp Cleanup
    let nextActivePowerUp = activePowerUp;
    let nextPowerUpMessage = powerUpMessage;
    if (activePowerUp && activePowerUp.player === turn && activePowerUp.type === 'teleport') {
        nextActivePowerUp = null; 
        nextPowerUpMessage = null;
        setActivePowerUp(null); 
        setPowerUpMessage(null);
    }

    // Apply Collected PowerUp
    let nextBlocked = newBlocked;
    let skipSwitch = false;

    if (collectedPowerUp) {
        if (collectedPowerUp === 'teleport') {
            nextActivePowerUp = { player: turn, type: 'teleport' };
            nextPowerUpMessage = `${turn === 'p1' ? playerNames.p1 : oppName} got TELEPORT!`;
            setActivePowerUp(nextActivePowerUp);
            setPowerUpMessage(nextPowerUpMessage);
        } else {
            const res = applyPowerUp(turn, collectedPowerUp, target, newBlocked);
            nextBlocked = res.newBlocked;
            if (res.skipTurnSwitch) skipSwitch = true;
            
            nextPowerUpMessage = `${turn === 'p1' ? playerNames.p1 : oppName} used ${collectedPowerUp.toUpperCase()}!`;
            setPowerUpMessage(nextPowerUpMessage);
            setTimeout(() => setPowerUpMessage(null), 2000);
        }
    }
    setBlocked(nextBlocked);

    // Check Win (Duplicate logic to ensure sync)
    let nextWinner = null;
    let nextWinReason = '';

    // Check Adventure Goal (PATH)
    if (levelConfig && levelConfig.type === 'PATH' && levelConfig.goal) {
        // Only P1 (Player) can win by reaching goal
        if (nextP1.x === levelConfig.goal.x && nextP1.y === levelConfig.goal.y) {
            nextWinner = 'p1';
            nextWinReason = t('game_victory', lang);
            setWinner(nextWinner); setWinReason(nextWinReason);
        }
    }
    
    // Check Capture
    if (!nextWinner && nextP1.x === nextP2.x && nextP1.y === nextP2.y) {
        // In PATH mode, capturing does not end the game (unless it's the goal, handled above)
        if (levelConfig?.type !== 'PATH') {
            nextWinner = turn === 'p1' ? 'p1' : 'p2';
            nextWinReason = t('game_captured', lang);
            setWinner(nextWinner); setWinReason(nextWinReason);
            if (nextWinner !== 'p1') setIsCrumpled(true);
        }
    } else if (!nextWinner) {
        // Check Trapped
        const nextPlayer = turn === 'p1' ? 'p2' : 'p1';
        const nextPos = nextPlayer === 'p1' ? nextP1 : nextP2;
        const nextPlayerHasTeleport = nextActivePowerUp?.player === nextPlayer && nextActivePowerUp?.type === 'teleport';
        const nextMoves = getLegalMoves(nextPos, nextBlocked, nextPlayerHasTeleport);
        
        if (nextMoves.length === 0) {
            nextWinner = turn;
            nextWinReason = t('game_trapped', lang);
            setWinner(nextWinner); setWinReason(nextWinReason);
            if (turn !== 'p1') setIsCrumpled(true);
        }
    }

    // Check Move Limit (Adventure Mode)
    if (!nextWinner && levelConfig?.moveLimit) {
        const movesMade = Math.ceil(turnCount / 2) + (turn === 'p1' ? 1 : 0);
        if (movesMade >= levelConfig.moveLimit) {
             nextWinner = 'p2';
             nextWinReason = t('game_out_of_moves', lang);
             setWinner(nextWinner); setWinReason(nextWinReason);
             setIsCrumpled(true);
        }
    }

    // Switch Turn
    let nextTurn = turn;
    let nextTurnCount = turnCount;
    if (!nextWinner && !skipSwitch) {
        nextTurn = turn === 'p1' ? 'p2' : 'p1';
        nextTurnCount = turnCount + 1;
        setTurn(nextTurn);
        setTurnCount(nextTurnCount);
    }

    // ONLINE SYNC
    if (mode === 'online' && socket && roomId) {
         const newGameState = {
            p1Pos: nextP1,
            p2Pos: nextP2,
            blocked: Array.from(nextBlocked),
            turn: nextTurn,
            turnCount: nextTurnCount,
            winner: nextWinner,
            winReason: nextWinReason,
            mysteryPos: nextMysteryPos,
            activePowerUp: nextActivePowerUp,
            powerUpMessage: nextPowerUpMessage,
            p1Sabotage: nextP1Sabotage,
        };
        console.log('Sending gameMove:', newGameState);
        socket.emit('gameMove', { roomId, fromPosition: currentPos, toPosition: target, playerTurn: playerType, newGameState });
    }
  };

  // Online oyun için socket olaylarını dinle
  useEffect(() => {
    if (mode === 'online' && socket && roomId && playerType) {
      // Not: Sunucu 'gameMove' olayına karşılık 'gameStateUpdate' gönderiyor.
      // Bu yüzden 'gameMove' dinleyicisine gerek yok, tüm güncellemeler 'gameStateUpdate' ile yapılacak.

      const handleGameStateUpdate = (gameState: any) => {
        console.log('Received gameStateUpdate:', gameState);
        // Sunucudan gelen tüm oyun durumunu güncelle
        setP1Pos(gameState.p1Pos);
        setP2Pos(gameState.p2Pos);
        setBlocked(new Set(gameState.blocked));
        setTurn(gameState.turn);
        setTurnCount(gameState.turnCount);
        setWinner(gameState.winner);
        setWinReason(gameState.winReason);
        setMysteryPos(gameState.mysteryPos);
        setActivePowerUp(gameState.activePowerUp);
        setPowerUpMessage(gameState.powerUpMessage);
        setP1Sabotage(gameState.p1Sabotage);
        setIsGameStarted(true);

        // Fallback Win Check for Online (Safety Net)
        if (!gameState.winner) {
             if (gameState.p1Pos.x === gameState.p2Pos.x && gameState.p1Pos.y === gameState.p2Pos.y) {
                 setWinner(gameState.turn);
                 setWinReason(t('game_captured', lang));
             }
        }

        // Online Defeat/Victory Effect
        if (gameState.winner) {
            if (gameState.winner !== playerType) {
                // Kaybeden oyuncu
                setIsCrumpled(true);
            } else {
                // Kazanan oyuncu
                setIsCrumpled(false);
            }
        } else {
            setIsCrumpled(false);
        }
      };

      socket.on('gameStateUpdate', handleGameStateUpdate);

      return () => {
        socket.off('gameStateUpdate', handleGameStateUpdate);
      };
    }
  }, [mode, socket, roomId, playerType, lang]);

  // Safety Net: Check if I am trapped when it becomes my turn (Online Mode)
  // This ensures the game ends even if the opponent's client failed to detect the win condition.
  useEffect(() => {
    if (mode === 'online' && isGameStarted && turn === playerType && !winner) {
       const currentPos = playerType === 'p1' ? p1Pos : p2Pos;
       const myPowerUp = activePowerUp?.player === playerType ? activePowerUp : null;
       const hasTeleport = myPowerUp?.type === 'teleport';
       const legalMoves = getLegalMoves(currentPos, blocked, hasTeleport);
       
       if (legalMoves.length === 0) {
           console.log("Detected I am trapped! Admitting defeat.");
           const opponent = playerType === 'p1' ? 'p2' : 'p1';
           
           // Construct final game state with winner set to opponent
           const finalState = {
               p1Pos, p2Pos, blocked: Array.from(blocked),
               turn, turnCount,
               winner: opponent, 
               winReason: t('game_trapped', lang),
               mysteryPos, activePowerUp, powerUpMessage, p1Sabotage
           };

           if (socket && roomId) {
               socket.emit('updateGameState', { roomId, gameState: finalState });
           }
       }
    }
  }, [mode, isGameStarted, turn, playerType, winner, p1Pos, p2Pos, blocked, activePowerUp, socket, roomId, lang]);

  // Handle socket connection/disconnection
  useEffect(() => {
    if (mode === 'online' && socket) {
      socket.on('disconnect', () => {
        setIsConnected(false);
        setWinReason('Connection Lost! Reconnecting...');
      });

      socket.on('connect', () => {
        setIsConnected(true);
        setWinReason(''); // Clear message on reconnect
      });

      return () => {
        socket.off('disconnect');
        socket.off('connect');
      };
    }
  }, [mode, socket]);

  // AI Loop (Online modda devre dışı bırak)
  useEffect(() => {
    if (mode === 'online') return; // Online modda AI'yı devre dışı bırak

    const isOpponentTurn = turn === 'p2';
    const isAI = mode === 'ai' || mode === 'adventure'; // Online mod kaldırıldı

    if (isAI && isOpponentTurn && !winner) {
      const delay = 800; // Online mod için gecikme kaldırıldı

      const timer = setTimeout(() => {
        const diff = activeDifficulty; // Online mod için zorluk kaldırıldı
        const isTeleporting = activePowerUp?.player === 'p2' && activePowerUp?.type === 'teleport';
        const move = getAIMove(p2Pos, p1Pos, blocked, diff, isTeleporting);
        if (move) makeMove(move);
        else {
          setWinner('p1'); setWinReason(t('game_trapped', lang));
        }
      }, delay); 
      return () => clearTimeout(timer);
    }
  }, [turn, mode, winner, p2Pos, p1Pos, blocked, activeDifficulty, checkWin, activePowerUp, lang]);

  const addSticker = (emoji: string) => {
      const id = Date.now();
      const x = Math.random() * 80 + 10; 
      const y = Math.random() * 80 + 10;
      const rotation = Math.random() * 40 - 20;
      setStickers(prev => [...prev, { id, emoji, x, y, rotation }]);
      setTimeout(() => setStickers(prev => prev.filter(s => s.id !== id)), 3000);
  };

  const renderCell = (x: number, y: number) => {
    // const isP1 = p1Pos.x === x && p1Pos.y === y; // Removed for overlay rendering
    // const isP2 = p2Pos.x === x && p2Pos.y === y; // Removed for overlay rendering
    const isP1 = false; 
    const isP2 = false;
    const isBlocked = blocked.has(`${x},${y}`);
    const isMystery = mysteryPos && mysteryPos.x === x && mysteryPos.y === y;
    const isGoal = levelConfig?.type === 'PATH' && levelConfig.goal?.x === x && levelConfig.goal?.y === y;

    
    const p1HasTeleport = activePowerUp?.player === 'p1' && activePowerUp?.type === 'teleport';
    const isLegal = !winner && ((mode === 'online' && playerType === 'p1' && turn === 'p1') || (mode !== 'online' && turn === 'p1')) && isValidMove(p1Pos, {x, y}, blocked, !!p1HasTeleport);
      const p2HasTeleport = activePowerUp?.player === 'p2' && activePowerUp?.type === 'teleport';
      const isLegalP2 = !winner && ((mode === 'online' && playerType === 'p2' && turn === 'p2') || (mode !== 'online' && turn === 'p2')) && isValidMove(p2Pos, {x, y}, blocked, !!p2HasTeleport);

    return (
      <div
        key={`${x},${y}`}
        onClick={() => {
            if (isLegal) makeMove({x, y});
            if (isLegalP2) makeMove({x, y});
        }}
        className={`
          relative w-full pb-[100%] border-r border-b 
          ${theme === 'chalk' ? 'border-zinc-600' : 'border-zinc-300/50'}
          ${(isLegal || isLegalP2) ? (theme === 'chalk' ? 'cursor-pointer hover:bg-white/10' : 'cursor-pointer hover:bg-blue-50/30') : ''}
          ${isBlocked ? (theme === 'chalk' ? 'bg-white/5' : 'bg-zinc-100/50') : ''}
          ${isLegal && p1HasTeleport ? 'bg-purple-50/20' : ''} 
        `}
      >
        <div className="absolute inset-0 flex items-center justify-center">
            {isBlocked && !isP1 && !isP2 && (
                <div className={`w-full h-full flex items-center justify-center animate-in zoom-in duration-300 ${modifiers.invisibleInk ? 'invisible-fade' : ''}`}>
                    <svg viewBox="0 0 24 24" className="w-3/4 h-3/4 drop-shadow-sm" style={{color: '#ef4444', filter: 'drop-shadow(1px 1px 0px rgba(0,0,0,0.1))'}} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M 5 5 C 9 8 15 16 19 19 M 19 5 C 15 8 9 16 5 19" />
                    </svg>
                </div>
            )}
            {isMystery && !isP1 && !isP2 && (
                <div className="w-3/4 h-3/4 animate-bounce">
                    <div className="w-full h-full bg-yellow-100 border-2 border-yellow-400 rounded flex items-center justify-center shadow-md">
                        <GiftIcon className="w-5 h-5 text-yellow-600" />
                    </div>
                </div>
            )}
            {isGoal && !isP1 && !isP2 && (
                <div className="w-3/4 h-3/4 animate-bounce">
                    <div className="w-full h-full bg-green-100 border-2 border-green-400 rounded flex items-center justify-center shadow-md">
                        <FlagIcon className="w-5 h-5 text-green-600" />
                    </div>
                </div>
            )}
            {/* Players moved to overlay */}
            {(isLegal || isLegalP2) && ( <div className={`w-3 h-3 rounded-full animate-pulse ${p1HasTeleport || p2HasTeleport ? 'bg-purple-400' : (theme === 'chalk' ? 'bg-green-400' : 'bg-green-400/30')}`}></div> )}
            {winner === 'p1' && isP2 && victoryDoodle && (
                <div className="absolute inset-0 z-30 pointer-events-none animate-[stamp_0.4s_cubic-bezier(0.25,1,0.5,1)_forwards]" style={{ transformOrigin: 'center center' }}>
                     <img src={victoryDoodle} alt="Victory Stamp" className="w-full h-full object-contain scale-150" />
                     <style>{`@keyframes stamp { 0% { opacity: 0; transform: scale(2) rotate(-10deg); } 70% { opacity: 1; transform: scale(0.9) rotate(0deg); } 100% { opacity: 1; transform: scale(1) rotate(0deg); } }`}</style>
                </div>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden relative theme-${theme}`}>

      
      {powerUpMessage && (
          <div className="absolute top-20 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
              <div className="bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-yellow-600" />
                  <span className="font-hand font-bold text-lg">{powerUpMessage}</span>
              </div>
          </div>
      )}

      {mode === 'online' && !isConnected && (
        <div className="absolute top-20 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
            <div className="bg-red-100 border-2 border-red-400 text-red-800 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <ArrowPathIcon className="w-5 h-5 text-red-600 animate-spin" />
                <span className="font-hand font-bold text-lg">Connection Lost! Reconnecting...</span>
            </div>
        </div>
      )}

      {/* Header */}
      <div className={`w-full flex items-center justify-between mb-6 max-w-md transition-opacity duration-500 ${isCrumpled ? 'opacity-0' : 'opacity-100'}`}>
        <button onClick={onBack} className={`p-2 rounded-full transition-colors border border-transparent ${theme === 'chalk' ? 'hover:bg-white/10 hover:border-zinc-500 text-white' : 'hover:bg-zinc-200 hover:border-zinc-300 text-zinc-600'}`}>
            <HomeIcon className="w-6 h-6" />
        </button>
        <div className={`flex flex-col items-center px-4 py-1 rounded-lg border shadow-sm transform rotate-1 ${theme === 'chalk' ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-white border-zinc-200 text-zinc-800'}`}>
            <h2 className="font-hand text-xl font-bold">{levelConfig ? t(`adv_l${levelConfig.id}_title`, lang) : (mode === 'online' ? t('menu_online', lang) : (mode === 'pvp' ? t('menu_duel', lang) : t('menu_ai_training', lang)))}</h2>
            <span className="text-[10px] font-mono opacity-60 uppercase tracking-widest">{winner ? t('game_match_ended', lang) : (mode === 'online' ? (turn === playerType ? t('game_turn_you', lang) : t('game_turn_opponent', lang)) : (turn === 'p1' ? t('game_turn_you', lang) : t('game_turn_thinking', lang)))}</span>
            {levelConfig?.moveLimit && (
                <span className={`text-xs font-hand font-bold mt-1 block ${theme === 'chalk' ? 'text-zinc-400' : 'text-zinc-500'} ${(levelConfig.moveLimit - Math.ceil(turnCount / 2)) <= 3 ? 'text-red-500 animate-pulse' : ''}`}>
                     Moves: {Math.ceil(turnCount / 2)} / {levelConfig.moveLimit}
                </span>
            )}
        </div>
        <button onClick={handlePlayAgain} className={`p-2 rounded-full transition-colors border border-transparent ${theme === 'chalk' ? 'hover:bg-white/10 hover:border-zinc-500 text-white' : 'hover:bg-zinc-200 hover:border-zinc-300 text-zinc-600'}`}>
            <ArrowPathIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Sabotage Bar */}
      {modifiers.sabotage && !winner && (
          <div className="w-full max-w-[300px] sm:max-w-[400px] mb-2 flex items-center gap-2">
              <button 
                onClick={launchSabotage} 
                disabled={p1Sabotage < 100}
                className={`p-2 rounded-full border-2 transition-all ${p1Sabotage >= 100 ? 'bg-red-500 border-red-700 text-white animate-pulse cursor-pointer' : 'bg-zinc-200 border-zinc-300 text-zinc-400 cursor-not-allowed'}`}
              >
                  <PaperAirplaneIcon className="w-5 h-5" />
              </button>
              <div className="flex-1 h-3 bg-zinc-200 rounded-full border border-zinc-300 overflow-hidden">
                  <div className="h-full bg-red-500 transition-all duration-300" style={{width: `${p1Sabotage}%`}}></div>
              </div>
          </div>
      )}

      {/* Game Board Container */}
      <div className="relative mb-8 perspective-1000">
        {console.log('isGameStarted:', isGameStarted, 'mode:', mode)}
        {mode === 'online' && !isGameStarted && (
            <div key="online-waiting-screen" className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-90 z-50">
                <div className="text-center text-white font-hand text-3xl animate-pulse">
                    {t('game_waiting_opponent', lang)}
                    {roomId && <div className="text-xl mt-2">{t('game_room_id', lang)} {roomId}</div>}
                </div>
            </div>
        )}
        {/* Paper Plane Overlay */}
        {showPlane && (
            <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
                <PaperAirplaneIcon className="w-24 h-24 text-red-600 animate-plane absolute top-0 left-0" />
            </div>
        )}
        {/* Removed bg-paper-variant and replaced with solid bg to avoid double lines */}
        <div className={`relative p-2 sketch-border shadow-2xl rotate-1 transition-all duration-1000 ${isCrumpled ? 'opacity-0' : ''}`} style={{backgroundColor: theme === 'chalk' ? '#3f3f46' : '#fff'}}>
            {console.log('Rendering game board. isGameStarted:', isGameStarted)}
            <div className={`grid grid-cols-8 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] border-l border-t select-none relative ${theme === 'chalk' ? 'border-zinc-600' : 'border-zinc-300/50'}`}>
            {Array.from({ length: BOARD_SIZE }).map((_, y) => Array.from({ length: BOARD_SIZE }).map((_, x) => renderCell(x, y)))}
            
            {/* Player Overlays - Smooth Movement */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="relative w-full h-full">
                    {/* P1 Token */}
                    <div 
                        className="absolute transition-bounce z-20 will-change-transform" 
                        style={{ 
                            left: `${p1Pos.x * 12.5}%`, 
                            top: `${p1Pos.y * 12.5}%`, 
                            width: '12.5%', 
                            height: '12.5%',
                            transform: `scale(${p1Scale})`,
                            zIndex: p1Scale > 1 ? 30 : 20 // Bring to front when picked up
                        }}
                    >
                        <div className="relative w-full h-full flex items-center justify-center">
                            <div className="relative w-4/5 h-4/5 transition-all duration-300 animate-scribble drop-shadow-xl z-10" style={{ boxShadow: p1Scale > 1 ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : '' }}>
                                <PlayerIcon skin={playerSkin} customSkin={customSkin} color={theme === 'chalk' ? '#38bdf8' : '#2563eb'} />
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[8px] font-hand font-bold bg-white px-1.5 py-0.5 rounded border border-zinc-200 whitespace-nowrap shadow-sm text-black">
                                    {playerNames.p1}
                                </div>
                                {activePowerUp?.player === 'p1' && activePowerUp?.type === 'teleport' && ( 
                                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                                        <BoltIcon className="w-3 h-3 text-white" />
                                    </div> 
                                )}
                            </div>
                        </div>
                    </div>

                    {/* P2 Token */}
                    <div 
                        className="absolute transition-bounce z-20 will-change-transform" 
                        style={{ 
                            left: `${p2Pos.x * 12.5}%`, 
                            top: `${p2Pos.y * 12.5}%`, 
                            width: '12.5%', 
                            height: '12.5%',
                            transform: `scale(${p2Scale})`,
                            zIndex: p2Scale > 1 ? 30 : 20
                        }}
                    >
                        <div className="relative w-full h-full flex items-center justify-center">
                             <div className="relative w-4/5 h-4/5 transition-all duration-300 drop-shadow-xl z-10 text-red-500" style={{ boxShadow: p2Scale > 1 ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : '' }}>
                                <img src="/red.png" alt="Player 2" className="w-full h-full object-contain" />
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-hand font-bold bg-white px-1.5 py-0.5 rounded border border-zinc-200 shadow-sm text-black">{oppName}</div>
                                {chatMsg && ( <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white border border-zinc-800 rounded p-1.5 text-[9px] whitespace-nowrap shadow-md font-hand z-20 animate-in zoom-in duration-200 text-black">{chatMsg}</div> )}
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Landing Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {effects.map(effect => (
                    <div 
                        key={effect.id} 
                        className="absolute w-[12.5%] h-[12.5%] flex items-center justify-center"
                        style={{ left: `${effect.x * 12.5}%`, top: `${effect.y * 12.5}%` }}
                    >
                        <div className={`w-3/4 h-3/4 rounded-full animate-dust blur-sm ${theme === 'chalk' ? 'bg-white/30' : 'bg-zinc-400/30'}`}></div>
                    </div>
                ))}
            </div>

            </div>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {stickers.map(sticker => (
                    <div key={sticker.id} className="absolute text-4xl sticker-pop drop-shadow-md filter" style={{ left: `${sticker.x}%`, top: `${sticker.y}%`, ['--rot' as any]: `${sticker.rotation}deg`} as React.CSSProperties}>{sticker.emoji}</div>
                ))}
            </div>
             {/* Paper Plane Overlay */}
             {showPlane && (
                 <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
                     <PaperAirplaneIcon className="w-24 h-24 text-red-600 animate-plane absolute top-0 left-0" />
                 </div>
             )}
          </div>



          {isCrumpled && <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-1000 delay-500"><TrashIcon className="w-32 h-32 text-zinc-300/50" /></div>}
      </div>

      {/* Sticker Bar */}
      {!winner && (
          <div className={`flex items-center gap-2 backdrop-blur border rounded-full px-4 py-2 shadow-sm mb-4 animate-in slide-in-from-bottom-4 ${theme === 'chalk' ? 'bg-zinc-800/80 border-zinc-600 text-white' : 'bg-white/80 border-zinc-200'}`}>
              <span className="text-[10px] font-bold font-hand opacity-50 uppercase mr-2">React:</span>
              <button onClick={() => addSticker('👏')} className="hover:scale-125 transition-transform text-xl">👏</button>
              <button onClick={() => addSticker('🔥')} className="hover:scale-125 transition-transform text-xl">🔥</button>
              <button onClick={() => addSticker('😱')} className="hover:scale-125 transition-transform text-xl">😱</button>
              <button onClick={() => addSticker('🤔')} className="hover:scale-125 transition-transform text-xl">🤔</button>
          </div>
      )}

      {/* Winner Modal */}
      {winner && ((mode === 'online' && playerType === winner) || (mode !== 'online' && !isCrumpled)) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
              <div className="sketch-modal bg-white p-8 max-w-sm w-full text-center relative overflow-visible">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-zinc-800 flex items-center justify-center shadow-lg"><span className="text-3xl">🏆</span></div>
                  <div className="mt-6">
                    <h3 className="font-hand text-4xl font-black mb-2 text-blue-600">{t('game_victory', lang)}</h3>
                    <p className="font-hand text-lg text-zinc-500 font-bold uppercase tracking-wide mb-4">{winReason}</p>
                    {victoryDoodle && <div className="mb-6 p-2 bg-paper border-2 border-dashed border-blue-200 rounded rotate-1"><p className="text-[10px] font-bold font-hand uppercase text-zinc-400 mb-1">Signature Move</p><img src={victoryDoodle} alt="Signature" className="w-24 h-24 mx-auto object-contain" /></div>}
                    {mode !== 'pvp' && <div className="mb-8 transform scale-110"><div className="inline-block bg-yellow-50 px-6 py-3 rounded-xl border-2 border-yellow-300 border-dashed relative"><p className="font-hand text-xs text-yellow-600 uppercase font-bold absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-100 px-2 text-nowrap">Score Up!</p><p className="font-hand text-4xl font-black text-yellow-500 drop-shadow-sm">+{activeDifficulty === 'easy' ? 100 : activeDifficulty === 'medium' ? 200 : 300}</p></div></div>}
                    <div className="space-y-3">
                        {mode === 'adventure' && onLevelComplete ? (<button onClick={() => onLevelComplete()} className="w-full sketch-button py-3 font-hand font-bold text-xl bg-green-100 hover:bg-green-200 text-green-900">Next Level →</button>) : (<button onClick={handlePlayAgain} className="w-full sketch-button py-3 font-hand font-bold text-xl hover:bg-blue-50 text-black">{t('game_play_again', lang)}</button>)}
                        <button onClick={onBack} className="w-full py-2 font-hand text-zinc-400 hover:text-zinc-800 text-sm">{t('game_back', lang)}</button>
                    </div>
                  </div>
              </div>
          </div>
      )}

      {/* Defeat Modal */}
      {isCrumpled && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="sketch-modal bg-white/95 p-8 max-w-xs w-full text-center pointer-events-auto animate-in slide-in-from-bottom-10 duration-500 shadow-2xl border-red-200 border-4 transform rotate-2">
                   <div className="mb-4"><span className="text-6xl">🗑️</span></div>
                   <h3 className="font-hand text-3xl font-black mb-2 text-red-600">{t('game_defeat', lang)}</h3>
                   <p className="font-hand text-sm text-zinc-500 mb-6 italic">"Better luck next time..."</p>
                   <button onClick={handlePlayAgain} className="w-full sketch-button py-3 font-hand font-bold text-lg bg-zinc-100 hover:bg-white text-black">Uncrumple ({t('game_play_again', lang)})</button>
                   <button onClick={onBack} className="mt-4 text-xs font-hand text-zinc-400 hover:text-zinc-600 underline">{t('game_back', lang)}</button>
              </div>
          </div>
      )}
    </div>
  );
};
