
import React from 'react';

interface WorkspacePlayerProps {
  playerRef: React.RefObject<HTMLDivElement>;
  aspectRatio: number;
  isPlaying: boolean;
  onPlayToggle: () => void;
  currentFrame: number;
  totalFrames: number;
  onFrameChange: (frame: number) => void;
}

export const WorkspacePlayer: React.FC<WorkspacePlayerProps> = ({ 
  playerRef, aspectRatio, isPlaying, onPlayToggle, currentFrame, totalFrames, onFrameChange 
}) => {
  return (
    <div className="bg-slate-900/40 rounded-[2rem] sm:rounded-[4rem] p-4 sm:p-10 border border-white/5 backdrop-blur-md shadow-3xl flex flex-col items-center">
      <div className="relative w-full aspect-video bg-[#020202] rounded-[1.5rem] sm:rounded-[3.5rem] border border-white/10 overflow-hidden flex items-center justify-center transparency-bg shadow-inner-glow group">
        <div className="relative flex items-center justify-center" style={{ width: aspectRatio > 1.77 ? '100%' : 'auto', height: aspectRatio > 1.77 ? 'auto' : '100%', maxWidth: '96%', maxHeight: '96%', aspectRatio }}>
          <div ref={playerRef} className="w-full h-full drop-shadow-[0_20px_60px_rgba(0,0,0,1)] transition-transform duration-1000"></div>
        </div>
      </div>

      <div className="w-full mt-4 sm:mt-6 bg-slate-950/80 backdrop-blur-3xl p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border border-white/5 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 shadow-2xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={onPlayToggle} className="w-12 h-12 sm:w-14 sm:h-14 bg-sky-500 hover:bg-sky-400 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-glow-sky transition-all active:scale-90 shrink-0">
            {isPlaying ? <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z"/></svg> : <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M4.5 3.5l11 6.5-11 6.5z"/></svg>}
          </button>
          <div className="flex flex-col text-right sm:text-left">
            <span className="text-sky-500 font-black text-[10px] sm:text-xs uppercase tracking-widest">تحكم مباشر</span>
            <span className="text-slate-500 text-[8px] sm:text-[10px] font-bold">{isPlaying ? 'يعرض الآن' : 'متوقف'}</span>
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col gap-2 sm:gap-3">
          <div className="flex justify-between items-center px-1 text-slate-500 text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-black text-xs px-2 py-1 bg-white/5 rounded-md border border-white/5">{currentFrame}</span>
              <span className="hidden xs:inline">الفريم</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="hidden xs:inline">إجمالي</span>
              <span className="text-slate-300">{totalFrames}</span>
            </div>
          </div>
          <div className="relative h-6 flex items-center">
            <div className="absolute inset-0 h-1 sm:h-1.5 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-sky-500/20" style={{ width: `${(currentFrame / (totalFrames || 1)) * 100}%` }}></div>
            </div>
            <input type="range" min="0" max={totalFrames || 1} value={currentFrame} onChange={(e) => onFrameChange(parseInt(e.target.value))} className="absolute inset-0 w-full h-full appearance-none bg-transparent accent-sky-500 cursor-pointer z-10" />
          </div>
        </div>
      </div>
    </div>
  );
};
