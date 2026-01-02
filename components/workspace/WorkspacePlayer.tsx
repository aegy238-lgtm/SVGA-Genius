
import React, { useState } from 'react';
import { translations } from '../../App';

interface WorkspacePlayerProps {
  playerRef: React.RefObject<HTMLDivElement>;
  aspectRatio: number;
  isPlaying: boolean;
  onPlayToggle: () => void;
  currentFrame: number;
  totalFrames: number;
  onFrameChange: (frame: number) => void;
  lang: 'ar' | 'en';
}

const BG_COLORS = [
  { id: 'transparent', value: 'transparent', label: '🏁' },
  { id: 'black', value: '#000000', label: '' },
  { id: 'white', value: '#ffffff', label: '' },
  { id: 'green', value: '#00ff00', label: '' },
  { id: 'blue', value: '#0000ff', label: '' },
  { id: 'yellow', value: '#ffff00', label: '' },
];

export const WorkspacePlayer: React.FC<WorkspacePlayerProps> = ({ 
  playerRef, aspectRatio, isPlaying, onPlayToggle, currentFrame, totalFrames, onFrameChange, lang 
}) => {
  const t = translations[lang];
  const [bgColor, setBgColor] = useState('transparent');

  return (
    <div className="bg-slate-900/40 rounded-[2.5rem] sm:rounded-[4rem] p-3 sm:p-10 border border-white/5 backdrop-blur-md shadow-3xl flex flex-col w-full overflow-hidden">
      
      {/* 
          Main Display Container 
      */}
      <div 
        className={`relative w-full aspect-square sm:aspect-video rounded-[2rem] sm:rounded-[3.5rem] border border-white/10 overflow-hidden shadow-inner-glow flex items-center justify-center transition-colors duration-500 ${bgColor === 'transparent' ? 'transparency-bg' : ''}`}
        style={{ backgroundColor: bgColor !== 'transparent' ? bgColor : undefined }}
      >
        <div 
          className="w-full h-full flex items-center justify-center p-4 sm:p-8"
          style={{ position: 'relative' }}
        >
          <div 
            ref={playerRef} 
            className="animation-canvas-wrapper"
            style={{ 
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
          </div>
        </div>
      </div>

      {/* 
          Background Color Switcher - Moved to the Red Box Area
      */}
      <div className={`flex items-center gap-2 mt-6 mb-2 px-6 sm:px-8 ${lang === 'ar' ? 'justify-start' : 'justify-end'}`}>
        <div className="flex items-center gap-2 p-1.5 bg-black/20 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl">
          {BG_COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => setBgColor(color.value)}
              title={color.id}
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-xl border-2 transition-all flex items-center justify-center text-[10px] ${bgColor === color.value ? 'border-sky-500 scale-110 shadow-glow-sky-sm' : 'border-white/10 hover:border-white/30 hover:scale-105'}`}
              style={{ 
                backgroundColor: color.value === 'transparent' ? '#1e293b' : color.value,
              }}
            >
              {color.label}
            </button>
          ))}
        </div>
        <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest hidden sm:block">
          {lang === 'ar' ? 'خلفية العرض' : 'Preview BG'}
        </span>
      </div>

      {/* Control Console */}
      <div className="w-full bg-slate-950/95 backdrop-blur-3xl p-5 sm:p-7 rounded-[2.5rem] sm:rounded-[3rem] border border-white/5 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 shadow-2xl">
        
        <div className={`flex items-center gap-5 w-full sm:w-auto ${lang === 'en' ? 'flex-row-reverse' : ''}`}>
          <button 
            onClick={onPlayToggle} 
            className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-500 hover:bg-sky-400 text-white rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center shadow-glow-sky transition-all active:scale-90 shrink-0"
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z"/></svg>
            ) : (
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4.5 3.5l11 6.5-11 6.5z"/></svg>
            )}
          </button>
          
          <div className={`flex flex-col ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <span className="text-sky-500 font-black text-xs sm:text-sm uppercase tracking-widest mb-1">{t.liveControl}</span>
            <span className="text-slate-500 text-[10px] sm:text-[12px] font-bold">{isPlaying ? t.nowShowing : t.paused}</span>
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col gap-4">
          <div className={`flex justify-between items-center px-1 text-slate-500 text-[10px] sm:text-[12px] font-black uppercase tracking-widest ${lang === 'en' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2.5 ${lang === 'en' ? 'flex-row-reverse' : ''}`}>
               <span className="text-white font-black text-sm px-3 py-1.5 bg-sky-500/10 rounded-xl border border-sky-500/20">{currentFrame}</span>
               <span className="opacity-50">{t.frameLabel}</span>
            </div>
            <div className={`flex items-center gap-2.5 ${lang === 'en' ? 'flex-row-reverse' : ''}`}>
               <span className="opacity-50">{t.totalLabel}</span>
               <span className="text-slate-200">{totalFrames}</span>
            </div>
          </div>
          
          <div className="relative h-10 flex items-center group/slider">
            <div className="absolute inset-0 h-2 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-gradient-to-r from-sky-600 via-sky-400 to-indigo-500 shadow-glow-sky-sm" style={{ width: `${(currentFrame / (totalFrames || 1)) * 100}%` }}></div>
            </div>
            <input 
              type="range" 
              min="0" 
              max={totalFrames || 1} 
              value={currentFrame} 
              onChange={(e) => onFrameChange(parseInt(e.target.value))} 
              className="absolute inset-0 w-full h-full appearance-none bg-transparent accent-sky-500 cursor-pointer z-20" 
            />
          </div>
        </div>
      </div>

      <style>{`
        .shadow-inner-glow {
          box-shadow: inset 0 0 100px rgba(0,0,0,1), 0 30px 80px -20px rgba(0,0,0,0.8);
        }
        
        .animation-canvas-wrapper canvas {
          display: block !important;
          margin: auto !important;
          max-width: 100% !important;
          max-height: 100% !important;
          width: auto !important;
          height: auto !important;
          object-fit: contain !important;
          position: relative !important;
          left: auto !important;
          top: auto !important;
          transform: none !important;
          filter: drop-shadow(0 0 20px rgba(0,0,0,0.5));
        }

        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 28px;
          width: 28px;
          border-radius: 50%;
          background: #0ea5e9;
          box-shadow: 0 0 20px rgba(14, 165, 233, 0.8);
          cursor: pointer;
          border: 5px solid #020617;
          margin-top: -10px;
        }

        .transparency-bg {
          background-image: 
            linear-gradient(45deg, #080808 25%, transparent 25%), 
            linear-gradient(-45deg, #080808 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #080808 75%), 
            linear-gradient(-45deg, transparent 75%, #080808 75%);
          background-size: 30px 30px;
          background-position: 0 0, 0 15px, 15px -15px, -15px 0px;
        }
      `}</style>
    </div>
  );
};
