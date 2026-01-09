/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { UserGroupIcon, PaperAirplaneIcon, MapIcon, GlobeAltIcon, TrophyIcon, Cog6ToothIcon, StarIcon, UserCircleIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';
import { playMusic, toggleMute, getIsMuted } from '../src/lib/audio';
import { t, LanguageCode } from '../src/lib/i18n';
import { User } from 'firebase/auth';
import { useState, useEffect } from 'react';

interface MainMenuProps {
  onNavigate: (view: string) => void;
  isPremium: boolean;
  onBuyPremium: () => void;
  lang: LanguageCode;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
}



const MenuButton = ({ 
    onClick, 
    colorClass, 
    icon: Icon, 
    title, 
    delay = 0 
}: { 
    onClick: () => void, 
    colorClass: string, 
    icon: React.ElementType, 
    title: string,
    delay?: number 
}) => (
    <button 
        onClick={onClick}
        className={`w-full sketch-button ${colorClass} py-4 px-6 flex items-center justify-between group animate-in slide-in-from-bottom-4 fade-in duration-500`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <span className="font-hand text-2xl font-bold text-zinc-800 tracking-tight group-hover:translate-x-2 transition-transform">{title}</span>
        <Icon className="w-8 h-8 text-zinc-700 group-hover:scale-110 transition-transform duration-300" />
    </button>
);

export const MainMenu: React.FC<MainMenuProps> = ({ onNavigate, isPremium, onBuyPremium, lang, user, onSignIn, onSignOut }) => {
  const [isMuted, setIsMuted] = useState(getIsMuted());

  const handleToggleMute = () => {
      toggleMute();
      setIsMuted(getIsMuted());
  };

  return (
    <div className="relative flex flex-col items-center min-h-[90vh] p-4 overflow-hidden gap-[15px]">

      {/* Top Header with Icons */}
      <div className="w-full flex justify-between items-start z-50 px-2">
        {/* Mute Button - Top Left */}
        <button 
            onClick={handleToggleMute}
            className="p-3 bg-white/90 backdrop-blur rounded-full border-2 border-zinc-800 shadow-lg hover:bg-white active:scale-95 transition-all"
        >
            {isMuted ? (
                <SpeakerXMarkIcon className="w-4 h-4 text-red-500" />
            ) : (
                <SpeakerWaveIcon className="w-4 h-4 text-zinc-800" />
            )}
        </button>

        {/* Profile Icon - Top Right */}
        <button 
            onClick={() => { playMusic('sfx_bg.mp3'); onNavigate('settings'); }}
            className="w-12 h-12 rounded-full bg-white border-2 border-zinc-800 shadow-lg flex items-center justify-center hover:bg-zinc-50 transition-transform active:scale-95"
        >
            {user && user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
                <UserCircleIcon className={`w-8 h-8 ${user ? 'text-blue-600' : 'text-zinc-600'}`} />
            )}
        </button>
      </div>

      <div className="flex flex-col items-center w-full max-w-sm mx-auto px-4 justify-center">
      
      <img src="/knight-chase-logo.png" alt="Knight Chase Logo" className="w-full max-w-xs mx-auto mb-6 animate-in fade-in zoom-in duration-700" />


      <div className="w-full space-y-4 relative z-10 mt-2">
        <MenuButton 
            onClick={() => { playMusic('sfx_bg.mp3'); onNavigate('ai_select'); }} 
            colorClass="btn-gray" 
            icon={PaperAirplaneIcon} 
            title={t('menu_ai_training', lang)} 
            delay={0}
        />
        
        <MenuButton 
            onClick={() => { playMusic('sfx_bg.mp3'); onNavigate('game_pvp'); }} 
            colorClass="btn-green" 
            icon={UserGroupIcon} 
            title={t('menu_duel', lang)} 
            delay={100}
        />

        <MenuButton 
            onClick={() => { playMusic('sfx_bg.mp3'); onNavigate('adventure'); }} 
            colorClass="btn-danger" 
            icon={MapIcon} 
            title={t('menu_adventure', lang)} 
            delay={200}
        />

        <MenuButton 
            onClick={() => { playMusic('sfx_bg.mp3'); onNavigate('online'); }} 
            colorClass="btn-purple" 
            icon={GlobeAltIcon} 
            title={t('menu_online', lang)} 
            delay={300}
        />

        <div className="grid grid-cols-2 gap-4">
            <MenuButton 
                onClick={() => { playMusic('sfx_bg.mp3'); onNavigate('leaderboard'); }} 
                colorClass="btn-yellow" 
                icon={TrophyIcon} 
                title={t('menu_rankings', lang)} 
                delay={400}
            />

            <MenuButton 
                onClick={() => { playMusic('sfx_bg.mp3'); onNavigate('settings'); }} 
                colorClass="btn-gray" 
                icon={Cog6ToothIcon} 
                title={t('menu_settings', lang)} 
                delay={500}
            />
        </div>
        
        {!isPremium && (
            <button 
                onClick={() => { playMusic('sfx_bg.mp3'); onBuyPremium(); }}
                className="w-full py-4 px-6 bg-yellow-400 hover:bg-yellow-500 rounded-lg flex items-center justify-between group shadow-lg border-2 border-yellow-600 animate-in slide-in-from-bottom-4 fade-in duration-500 mt-4"
                style={{ animationDelay: '600ms' }}
            >
                <div className="flex flex-col items-start">
                    <span className="font-hand text-xl font-bold text-white drop-shadow-md">{t('menu_unlock_premium', lang)}</span>
                    <span className="font-hand text-xs text-yellow-100">{t('menu_remove_ads', lang)}</span>
                </div>
                <StarIcon className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300 animate-pulse" />
            </button>
        )}
      </div>
      </div>

      <div className="text-center opacity-40">
        <div className="w-32 h-1 bg-zinc-400 rounded-full mx-auto mb-2"></div>
        <p className="font-hand text-xs text-zinc-500">v1.1.0 • Az in Game</p>
      </div>
    </div>
  );
};

