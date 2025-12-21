/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { UserGroupIcon, PaperAirplaneIcon, MapIcon, GlobeAltIcon, TrophyIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

interface MainMenuProps {
  onNavigate: (view: string) => void;
}

const Logo = () => (
  <div className="relative w-full max-w-xs mx-auto mb-6 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
    <svg className="w-full h-auto drop-shadow-xl filter" viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="watercolor" x="-50%" y="-50%" width="200%" height="200%">
                <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" />
            </filter>
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap');
                .logo-text { font-family: 'Architects Daughter', cursive; font-weight: 900; }
                `}
            </style>
        </defs>
        
        {/* Watercolor Blobs Background */}
        <g opacity="0.8">
             {/* Blue Blob (Left) */}
            <path d="M80 40C40 50 20 100 40 140C50 170 90 180 120 160C150 140 140 60 110 40C90 30 80 40 80 40Z" 
                  fill="#3b82f6" filter="url(#watercolor)" transform="translate(-10, 0)" />
            
            {/* Orange/Red Blob (Right) */}
            <path d="M180 40C150 50 160 110 170 150C190 180 240 170 260 130C270 90 240 30 210 30C190 30 180 40 180 40Z" 
                  fill="#f97316" filter="url(#watercolor)" transform="translate(10, 0)" />
        </g>

        {/* Knight Helmet (Left Side) */}
        <g transform="translate(50, 20) scale(1.2)">
            <path d="M45 10C30 10 20 25 20 45V65C20 75 30 80 45 80C60 80 70 70 70 60V40C70 20 60 10 45 10Z" fill="white" stroke="#1e3a8a" strokeWidth="2.5" strokeLinejoin="round"/>
            <path d="M70 40H20" stroke="#1e3a8a" strokeWidth="2"/>
            <path d="M30 40V65" stroke="#1e3a8a" strokeWidth="2"/>
            <path d="M40 40V65" stroke="#1e3a8a" strokeWidth="2"/>
            <path d="M50 40V65" stroke="#1e3a8a" strokeWidth="2"/>
            <path d="M60 40V65" stroke="#1e3a8a" strokeWidth="2"/>
            <path d="M45 10V40" stroke="#1e3a8a" strokeWidth="1.5"/>
            <path d="M25 18L35 18" stroke="#1e3a8a" strokeWidth="1.5" />
        </g>

        {/* Dragon Head (Right Side) */}
        <g transform="translate(160, 20) scale(1.2)">
             <path d="M30 55C20 55 10 45 15 30C20 15 40 5 60 10C75 15 80 30 75 45C70 60 55 70 30 55Z" fill="white" stroke="#9a3412" strokeWidth="2.5" strokeLinejoin="round"/>
             <path d="M60 10L70 0" stroke="#9a3412" strokeWidth="3" strokeLinecap="round"/> 
             <path d="M65 15L80 10" stroke="#9a3412" strokeWidth="3" strokeLinecap="round"/> 
             <path d="M30 55L25 65L35 60" fill="white" stroke="#9a3412" strokeWidth="2.5" strokeLinejoin="round"/> 
             <circle cx="50" cy="25" r="3" fill="#9a3412"/> 
             <path d="M20 30Q30 35 30 50" stroke="#9a3412" strokeWidth="2" strokeLinecap="round"/>
        </g>

        {/* Game Title Text */}
        <g transform="translate(150, 140)">
            <text x="0" y="0" textAnchor="middle" className="logo-text" fontSize="58" fill="white" stroke="#27272a" strokeWidth="6" strokeLinejoin="round">KNIGHT</text>
            <text x="0" y="0" textAnchor="middle" className="logo-text" fontSize="58" fill="white">KNIGHT</text>
            
            <text x="0" y="45" textAnchor="middle" className="logo-text" fontSize="58" fill="white" stroke="#27272a" strokeWidth="6" strokeLinejoin="round">CHASE</text>
            <text x="0" y="45" textAnchor="middle" className="logo-text" fontSize="58" fill="white">CHASE</text>
        </g>

        {/* Decorative Underline */}
        <path d="M60 195C100 200 200 190 240 195" stroke="#27272a" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  </div>
);

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

export const MainMenu: React.FC<MainMenuProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 py-8 min-h-screen justify-center">
      
      <Logo />

      <div className="w-full space-y-4 relative z-10 mt-2">
        <MenuButton 
            onClick={() => onNavigate('ai_select')} 
            colorClass="btn-gray" 
            icon={PaperAirplaneIcon} 
            title="Play vs AI" 
            delay={0}
        />
        
        <MenuButton 
            onClick={() => onNavigate('game_pvp')} 
            colorClass="btn-orange" 
            icon={UserGroupIcon} 
            title="Local 2 Players" 
            delay={100}
        />

        <MenuButton 
            onClick={() => onNavigate('adventure')} 
            colorClass="btn-green" 
            icon={MapIcon} 
            title="Adventure" 
            delay={200}
        />

        <MenuButton 
            onClick={() => onNavigate('online')} 
            colorClass="btn-purple" 
            icon={GlobeAltIcon} 
            title="Play Online" 
            delay={300}
        />

        <div className="grid grid-cols-2 gap-4">
            <MenuButton 
                onClick={() => onNavigate('leaderboard')} 
                colorClass="btn-yellow" 
                icon={TrophyIcon} 
                title="Leaderboard" 
                delay={400}
            />

            <MenuButton 
                onClick={() => onNavigate('settings')} 
                colorClass="btn-gray" 
                icon={Cog6ToothIcon} 
                title="Settings" 
                delay={500}
            />
        </div>
      </div>

      <div className="mt-8 text-center opacity-40">
        <div className="w-32 h-1 bg-zinc-400 rounded-full mx-auto mb-2"></div>
        <p className="font-hand text-xs text-zinc-500">v1.2.0 • PaperOS</p>
      </div>
    </div>
  );
};
