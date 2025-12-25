
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { fetchLeaderboard } from '../src/lib/api';
import { t, LanguageCode } from '../src/lib/i18n';

interface LeaderboardProps {
  onBack: () => void;
  currentScore: number;
  playerName: string;
  lang: LanguageCode;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBack, currentScore, playerName, lang }) => {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        const data = await fetchLeaderboard();
        setLeaderboardData(data);
        setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="flex flex-col w-full max-w-md mx-auto min-h-screen p-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-zinc-100 rounded-full">
            <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="font-hand text-3xl font-bold">{t('leaderboard_title', lang)}</h2>
        <TrophyIcon className="w-6 h-6 text-yellow-500" />
      </div>

      <div className="bg-white sketch-border p-6 w-full flex-1">
        {loading ? (
            <div className="flex justify-center py-10">
                <p className="font-hand text-zinc-400 animate-pulse">{t('leaderboard_loading', lang)}</p>
            </div>
        ) : (
            <div className="space-y-4">
                {leaderboardData.map((player, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border-b border-zinc-100`}>
                        <div className="flex items-center space-x-4">
                            <span className={`
                                font-hand font-bold text-xl w-8 h-8 flex items-center justify-center rounded-full
                                ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                  idx === 1 ? 'bg-zinc-100 text-zinc-600' : 
                                  idx === 2 ? 'bg-orange-100 text-orange-700' : 'text-zinc-400'}
                            `}>
                                {idx + 1}
                            </span>
                            <div className="flex flex-col">
                                <span className="font-hand font-bold text-lg text-zinc-700">{player.username}</span>
                                <span className="font-hand text-[10px] text-zinc-400">{player.total_wins} {t('leaderboard_wins', lang)}</span>
                            </div>
                        </div>
                        <span className="font-mono text-zinc-500 font-bold">{player.best_score || 0}</span>
                    </div>
                ))}
            </div>
        )}
        
        <div className="mt-8 text-center p-4 bg-zinc-50 rounded-lg border border-dashed border-zinc-300">
            <p className="font-hand text-sm text-zinc-500">{t('leaderboard_tip', lang)}</p>
        </div>
      </div>
    </div>
  );
};

