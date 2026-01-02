
import React from 'react';

interface WorkspaceAssetsProps {
  layerImages: Record<string, string>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onReplaceClick: (key: string) => void;
  onDownloadClick: (key: string, data: string) => void;
  modifiedKeys: Set<string>;
}

export const WorkspaceAssets: React.FC<WorkspaceAssetsProps> = ({ 
  layerImages, searchQuery, onSearchChange, onReplaceClick, onDownloadClick, modifiedKeys 
}) => {
  const filteredKeys = Object.keys(layerImages)
    .filter(key => key.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => (parseInt(a.match(/\d+/)?.[0] || '0') - parseInt(b.match(/\d+/)?.[0] || '0')));

  return (
    <div className="bg-slate-950 rounded-[3rem] p-6 sm:p-10 border border-white/5 flex flex-col h-auto xl:h-[850px] shadow-3xl relative overflow-hidden">
      <div className="mb-8 relative z-10">
        <h3 className="text-white font-black text-2xl tracking-tighter uppercase mb-1">المحتويات المستخرجة</h3>
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">Genius Assets Navigator</p>
      </div>

      <div className="relative mb-8 z-10">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <input type="text" placeholder="ابحث عن صورة معينة..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="w-full bg-slate-900/40 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm text-slate-200 placeholder-slate-700 outline-none focus:border-sky-500/40 transition-all text-right font-black" />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[650px] xl:max-h-none pb-10 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          {filteredKeys.map(key => (
            <div key={key} className="group bg-slate-900/30 rounded-[2.5rem] border border-white/[0.03] hover:border-sky-500/40 transition-all duration-700 p-4 shadow-2xl flex flex-col">
              <div className="aspect-square w-full rounded-[2rem] bg-black/60 flex items-center justify-center transparency-bg-card relative overflow-hidden border border-white/[0.02]">
                <img src={layerImages[key]} className="max-w-[80%] max-h-[80%] object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-700" alt={key} />
                <div className="absolute inset-0 bg-slate-950/90 opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col items-center justify-center gap-3 backdrop-blur-xl translate-y-4 group-hover:translate-y-0">
                  <button onClick={() => onReplaceClick(key)} className="w-12 h-12 bg-sky-500 text-white rounded-xl flex items-center justify-center shadow-glow-sky hover:scale-110 transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
                  <button onClick={() => onDownloadClick(key, layerImages[key])} className="w-12 h-12 bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-xl hover:scale-110 transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></button>
                </div>
              </div>
              <div className="mt-4 text-center">
                <span className="text-[10px] text-slate-500 font-black truncate block uppercase">{key}</span>
                {modifiedKeys.has(key) && <span className="text-[8px] text-amber-500 font-black uppercase mt-1 inline-block bg-amber-500/10 px-2 py-0.5 rounded-full">Modified</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
