
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useState } from 'react';
import { ArrowLeftIcon, MusicalNoteIcon, SpeakerWaveIcon, UserIcon, PencilSquareIcon, SwatchIcon, BeakerIcon, InformationCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { PlayerNames, GameTheme, GameModifiers } from '../App';
import { setSFXVolume, setMusicVolume } from '../src/lib/audio';
import { DoodleCanvas } from './DoodleCanvas';
import { registerUser } from '../src/lib/api';

interface SettingsProps {
  onBack: () => void;
  currentSkin: string;
  onSkinChange: (skin: string) => void;
  customSkin: string | null;
  onCustomSkinChange: (dataUrl: string) => void;
  playerNames: PlayerNames;
  onNamesChange: (names: PlayerNames) => void;
  victoryDoodle: string | null;
  onVictoryDoodleChange: (dataUrl: string) => void;
  
  theme: GameTheme;
  onThemeChange: (theme: GameTheme) => void;
  modifiers: GameModifiers;
  onModifiersChange: (mods: GameModifiers) => void;
  isPremium: boolean;
  onBuyPremium: () => void;
  onRestorePurchases: () => void;
  onDebugTogglePremium: () => void; // For testing
}

export const Settings: React.FC<SettingsProps> = ({ 
    onBack, 
    currentSkin, 
    onSkinChange, 
    customSkin, 
    onCustomSkinChange,
    playerNames,
    onNamesChange,
    victoryDoodle,
    onVictoryDoodleChange,
    theme,
    onThemeChange,
    modifiers,
    onModifiersChange,
    isPremium,
    onBuyPremium,
    onRestorePurchases,
    onDebugTogglePremium
}) => {
  const [musicVolume, setMusicVolumeState] = useState(1);
  const [sfxVolume, setSfxVolumeState] = useState(1);
  const [showDoodleCanvas, setShowDoodleCanvas] = useState(false);
  const [activeInfo, setActiveInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleUsernameRegister = async () => {
      setUsernameStatus('checking');
      const res = await registerUser(playerNames.p1);
      if (res.success) {
          setUsernameStatus('success');
          setStatusMessage(res.message);
      } else {
          setUsernameStatus('error');
          setStatusMessage(res.error || 'Failed to register');
      }
  };

  const skins = [
    { id: 'knight', name: 'Knight', icon: '♞', premium: false },
    { id: 'king', name: 'King', icon: '♚', premium: true }, // Premium
    { id: 'wizard', name: 'Wizard', icon: '🧙‍♂️', premium: true }, // Premium
    { id: 'ghost', name: 'Ghost', icon: '👻', premium: true }, // Premium
    { id: 'custom', name: 'Custom', icon: '🖼️', premium: true } // Premium
  ];

  const themes: {id: GameTheme, name: string, color: string, premium: boolean}[] = [
      { id: 'pencil', name: 'Classic Pencil', color: '#e5e7eb', premium: false },
      { id: 'blue', name: 'Blue Ink', color: '#bfdbfe', premium: false },
      { id: 'neon', name: 'Highlighter', color: '#fef08a', premium: true }, // Premium
      { id: 'chalk', name: 'Chalkboard', color: '#27272a', premium: true } // Premium
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
              if (e.target?.result) {
                  onCustomSkinChange(e.target.result as string);
                  onSkinChange('custom');
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const InfoModal = ({ title, desc, onClose }: { title: string, desc: string, onClose: () => void }) => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
          <div className="bg-white sketch-modal p-6 max-w-xs w-full" onClick={e => e.stopPropagation()}>
              <h4 className="font-hand text-xl font-bold mb-2">{title}</h4>
              <p className="font-hand text-sm text-zinc-600 mb-4">{desc}</p>
              <button onClick={onClose} className="w-full sketch-button py-2 text-sm font-bold">Got it!</button>
          </div>
      </div>
  );

  return (
    <>
    <div className="flex flex-col w-full max-w-md mx-auto min-h-screen p-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-zinc-100 rounded-full">
            <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="font-hand text-3xl font-bold">Settings</h2>
        <div className="w-10"></div>
      </div>

      <div className="space-y-8 pb-10">
          
        {/* Premium Status & Debug */}
        <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
                <span className="font-hand font-bold text-lg">Premium Status:</span>
                <span className={`font-hand font-bold ${isPremium ? 'text-green-600' : 'text-zinc-500'}`}>
                    {isPremium ? 'ACTIVE 👑' : 'Free Plan'}
                </span>
            </div>
            {!isPremium && (
                <button onClick={onBuyPremium} className="w-full sketch-button py-2 bg-yellow-400 hover:bg-yellow-500 mb-2">
                    <span className="font-hand font-bold text-white">Unlock Premium</span>
                </button>
            )}
            <button onClick={onRestorePurchases} className="w-full text-xs text-zinc-500 underline mb-4">
                Restore Purchases
            </button>
            
            {/* Developer Debug Area - Remove in production if desired, or keep hidden */}
            <div className="border-t border-yellow-200 pt-2 mt-2">
                <p className="text-[10px] text-zinc-400 font-mono mb-1">DEVELOPER ZONE</p>
                <button 
                    onClick={onDebugTogglePremium} 
                    className="w-full py-1 bg-zinc-200 hover:bg-zinc-300 rounded text-xs font-mono text-zinc-600"
                >
                    [Debug] Force Toggle Premium
                </button>
            </div>
        </div>

        {/* Audio Settings */}
        <div className="sketch-border bg-white p-6">
            <div className="flex items-center space-x-3 mb-4">
                <SpeakerWaveIcon className="w-6 h-6 text-zinc-600" />
                <span className="font-hand text-xl font-bold text-zinc-800">Volume</span>
            </div>
            <div className="space-y-4">
                <div>
                    <label htmlFor="music-volume" className="block font-hand text-sm font-bold text-zinc-700 mb-2">Music Volume</label>
                    <input
                        id="music-volume"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={musicVolume}
                        onChange={(e) => {
                            const vol = parseFloat(e.target.value);
                            setMusicVolumeState(vol);
                            setMusicVolume(vol);
                        }}
                        className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="sfx-volume" className="block font-hand text-sm font-bold text-zinc-700 mb-2">SFX Volume</label>
                    <input
                        id="sfx-volume"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={sfxVolume}
                        onChange={(e) => {
                            const vol = parseFloat(e.target.value);
                            setSfxVolumeState(vol);
                            setSFXVolume(vol);
                        }}
                        className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>
            </div>
        </div>

        {/* 1. VISUAL STYLE (Theme) - Feature 5 */}
        <div className="sketch-border bg-white p-6">
            <div className="flex items-center space-x-3 mb-4">
                <SwatchIcon className="w-6 h-6 text-zinc-600" />
                <span className="font-hand text-xl font-bold text-zinc-800">Visual Style</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {themes.map(t => (
                    <button
                        key={t.id}
                        onClick={() => onThemeChange(t.id)}
                        disabled={!isPremium && t.premium} // Premium değilse tıklenamaz
                        className={`
                            p-3 rounded-lg border-2 font-hand font-bold text-sm flex items-center gap-2 relative
                            ${theme === t.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-zinc-200 hover:border-zinc-400'}
                            ${!isPremium && t.premium ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        style={{ background: t.id === 'chalk' ? '#27272a' : 'white' }}
                    >
                        <div className="w-4 h-4 rounded-full border border-black/10" style={{backgroundColor: t.color}}></div>
                        <span style={{ color: t.id === 'chalk' ? 'white' : '#27272a' }}>{t.name}</span>
                        {!isPremium && t.premium && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                                <LockClosedIcon className="w-6 h-6 text-white" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>

        {/* 2. GAME RULES (Modifiers) - Features 2,3,4 */}
        <div className="sketch-border bg-white p-6">
             <div className="flex items-center space-x-3 mb-4">
                <BeakerIcon className="w-6 h-6 text-zinc-600" />
                <span className="font-hand text-xl font-bold text-zinc-800">Game Rules</span>
             </div>
             
             {/* Coffee Spill */}
             <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-100">
                 <div className="flex items-center gap-2">
                     <span className="text-2xl">☕</span>
                     <div>
                         <p className="font-hand font-bold leading-none">Spilled Coffee Mode</p>
                         <p className="text-[10px] text-zinc-400 font-mono">Battle Royale Zone</p>
                     </div>
                     <button onClick={() => setActiveInfo('coffee')} className="text-blue-400 hover:text-blue-600"><InformationCircleIcon className="w-5 h-5" /></button>
                 </div>
                 <button 
                    onClick={() => onModifiersChange({...modifiers, coffeeSpill: !modifiers.coffeeSpill})}
                    className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 border-2 border-zinc-800 ${modifiers.coffeeSpill ? 'bg-green-400' : 'bg-zinc-200'}`}
                 >
                    <div className={`w-4 h-4 bg-white rounded-full border-2 border-zinc-800 transition-transform duration-300 ${modifiers.coffeeSpill ? 'translate-x-5' : 'translate-x-0'}`}></div>
                 </button>
             </div>

             {/* Sabotage (Paper Plane) */}
             <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-100">
                 <div className="flex items-center gap-2">
                     <span className="text-2xl">✈️</span>
                     <div>
                         <p className="font-hand font-bold leading-none">Paper Plane Sabotage</p>
                         <p className="text-[10px] text-zinc-400 font-mono">Distraction Attack</p>
                     </div>
                     <button onClick={() => setActiveInfo('plane')} className="text-blue-400 hover:text-blue-600"><InformationCircleIcon className="w-5 h-5" /></button>
                 </div>
                 <button 
                    onClick={() => onModifiersChange({...modifiers, sabotage: !modifiers.sabotage})}
                    className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 border-2 border-zinc-800 ${modifiers.sabotage ? 'bg-green-400' : 'bg-zinc-200'}`}
                 >
                    <div className={`w-4 h-4 bg-white rounded-full border-2 border-zinc-800 transition-transform duration-300 ${modifiers.sabotage ? 'translate-x-5' : 'translate-x-0'}`}></div>
                 </button>
             </div>

             {/* Invisible Ink */}
             <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                     <span className="text-2xl">🕶️</span>
                     <div>
                         <p className="font-hand font-bold leading-none">Invisible Ink</p>
                         <p className="text-[10px] text-zinc-400 font-mono">Hardcore Memory</p>
                     </div>
                     <button onClick={() => setActiveInfo('ink')} className="text-blue-400 hover:text-blue-600"><InformationCircleIcon className="w-5 h-5" /></button>
                 </div>
                 <button 
                    onClick={() => onModifiersChange({...modifiers, invisibleInk: !modifiers.invisibleInk})}
                    className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 border-2 border-zinc-800 ${modifiers.invisibleInk ? 'bg-green-400' : 'bg-zinc-200'}`}
                 >
                    <div className={`w-4 h-4 bg-white rounded-full border-2 border-zinc-800 transition-transform duration-300 ${modifiers.invisibleInk ? 'translate-x-5' : 'translate-x-0'}`}></div>
                 </button>
             </div>
        </div>

        {/* Skin Selection */}
        <div className="sketch-border bg-white p-6">
             <div className="flex items-center space-x-3 mb-4">
                <UserIcon className="w-6 h-6 text-zinc-600" />
                <span className="font-hand text-xl font-bold text-zinc-800">Player Skin</span>
             </div>
             <div className="grid grid-cols-4 gap-2">
                {skins.map((skin) => (
                    <button
                        key={skin.id}
                        onClick={() => {
                            if (skin.id === 'custom') {
                                fileInputRef.current?.click();
                            } else {
                                onSkinChange(skin.id);
                            }
                        }}
                        disabled={!isPremium && skin.premium} // Premium değilse tıklenamaz
                        className={`
                            relative h-20 rounded-lg flex flex-col items-center justify-center border-2 transition-all overflow-hidden
                            ${currentSkin === skin.id 
                                ? 'bg-blue-50 border-blue-500 scale-105 shadow-md' 
                                : 'bg-zinc-50 border-zinc-200 hover:border-zinc-400'
                            }
                            ${!isPremium && skin.premium ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        {skin.id === 'custom' && customSkin ? (
                             <img src={customSkin} alt="Custom" className="w-8 h-8 object-contain mb-1" />
                        ) : (
                            <span className="text-3xl mb-1">{skin.icon}</span>
                        )}
                        
                        <span className="text-[10px] font-bold font-hand uppercase">{skin.name}</span>
                        
                        {currentSkin === skin.id && (
                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs z-10">
                                ✓
                            </div>
                        )}
                        {!isPremium && skin.premium && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                                <LockClosedIcon className="w-6 h-6 text-white" />
                            </div>
                        )}
                    </button>
                ))}
             </div>
             <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
             />
        </div>

        {/* Victory Doodle Section */}
        <div className="sketch-border bg-white p-6 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-16 h-16 bg-yellow-300 rotate-12 z-0 opacity-50 rounded-full"></div>
            <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-2">
                    <PencilSquareIcon className="w-6 h-6 text-zinc-600" />
                    <span className="font-hand text-xl font-bold text-zinc-800">Victory Doodle</span>
                </div>
                <p className="font-hand text-xs text-zinc-500 mb-4">
                    Draw your own "Finisher" stamp!
                </p>
                
                <div 
                    onClick={() => setShowDoodleCanvas(true)}
                    className="w-full h-32 border-2 border-dashed border-zinc-300 rounded-lg bg-paper flex items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors relative group"
                >
                    {victoryDoodle ? (
                        <img src={victoryDoodle} alt="Your Doodle" className="max-h-full max-w-full p-2 rotate-[-2deg] group-hover:scale-105 transition-transform" />
                    ) : (
                        <div className="flex flex-col items-center text-zinc-400 group-hover:text-blue-500">
                            <PencilSquareIcon className="w-8 h-8 mb-1" />
                            <span className="font-hand font-bold text-sm">Tap to Draw</span>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Player Names */}
        <div className="sketch-border bg-white p-6">
            <h3 className="font-hand text-xl font-bold mb-4">Player Identity</h3>
            <div className="space-y-4">
                <div>
                    <label className="block font-hand text-sm mb-1 text-zinc-600">Your Username (Online & High Scores)</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={playerNames.p1} 
                            onChange={(e) => onNamesChange({ ...playerNames, p1: e.target.value })}
                            className="w-full p-2 border-2 border-zinc-300 rounded font-hand focus:border-zinc-800 outline-none uppercase"
                            maxLength={12}
                        />
                        <button 
                            onClick={handleUsernameRegister}
                            className="px-4 bg-zinc-800 text-white font-hand rounded hover:bg-zinc-700"
                        >
                            Save
                        </button>
                    </div>
                    {statusMessage && (
                        <p className={`font-hand text-xs mt-1 ${usernameStatus === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                            {statusMessage}
                        </p>
                    )}
                </div>
            </div>
        </div>

        
      </div>
    </div>
    
    {showDoodleCanvas && (
        <DoodleCanvas 
            initialImage={victoryDoodle}
            onSave={(data) => {
                onVictoryDoodleChange(data);
                setShowDoodleCanvas(false);
            }}
            onCancel={() => setShowDoodleCanvas(false)}
        />
    )}

    {/* Info Modals */}
    {activeInfo === 'coffee' && <InfoModal title="Spilled Coffee Mode" desc="The battlefield shrinks over time! A dark stain spreads from the edges every few turns, blocking squares. Don't get caught in the spill!" onClose={() => setActiveInfo(null)} />}
    {activeInfo === 'plane' && <InfoModal title="Paper Plane Sabotage" desc="Fill your sabotage bar by moving. When full, launch a Paper Plane to distract your opponent and temporarily block a random square!" onClose={() => setActiveInfo(null)} />}
    {activeInfo === 'ink' && <InfoModal title="Invisible Ink" desc="Test your memory! The 'X' marks where you've been will vanish after a few seconds, but the squares remain blocked. Don't step on your own trail!" onClose={() => setActiveInfo(null)} />}
    </>
  );
};
