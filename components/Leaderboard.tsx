
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { ArrowLeftIcon, TrophyIcon } from '@heroicons/react/24/outline';

interface LeaderboardProps {
  onBack: () => void;
  currentScore: number;
  playerName: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBack, currentScore, playerName }) => {
  const scores = [
    { name: "KnightMaster", score: 2450, rank: 1 },
    { name: "PawnStar", score: 2100, rank: 2 },
    { name: "GridLocked", score: 1850, rank: 3 },
    { name: "SketchyMove", score: 1600, rank: 4 },
  ];

  // Merge current player into scores for display
  const allScores = [...scores, { name: playerName, score: currentScore, rank: 0 }];
  
  // Sort scores
  allScores.sort((a, b) => b.score - a.score);
  
  // Recalculate ranks
  const rankedScores = allScores.map((s, i) => ({ ...s, rank: i + 1 }));

  return (
    <div className="flex flex-col w-full max-w-md mx-auto min-h-screen p-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-zinc-100 rounded-full">
            <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="font-hand text-3xl font-bold">Leaderboard</h2>
        <TrophyIcon className="w-6 h-6 text-yellow-500" />
      </div>

      <div className="bg-white sketch-border p-6 w-full flex-1">
        <div className="space-y-4">
            {rankedScores.map((player, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border-b border-zinc-100 ${player.name === playerName ? 'bg-blue-50 border-blue-100' : ''}`}>
                    <div className="flex items-center space-x-4">
                        <span className={`
                            font-hand font-bold text-xl w-8 h-8 flex items-center justify-center rounded-full
                            ${player.rank === 1 ? 'bg-yellow-100 text-yellow-700' : 
                              player.rank === 2 ? 'bg-zinc-100 text-zinc-600' : 
                              player.rank === 3 ? 'bg-orange-100 text-orange-700' : 'text-zinc-400'}
                        `}>
                            {player.rank}
                        </span>
                        <span className="font-hand font-bold text-lg text-zinc-700">{player.name}</span>
                    </div>
                    <span className="font-mono text-zinc-500 font-bold">{player.score}</span>
                </div>
            ))}
        </div>
        
        <div className="mt-8 text-center p-4 bg-zinc-50 rounded-lg border border-dashed border-zinc-300">
            <p className="font-hand text-sm text-zinc-500">Win matches vs AI Hard (+300pts) to climb faster!</p>
        </div>
      </div>
    </div>
  );
};
