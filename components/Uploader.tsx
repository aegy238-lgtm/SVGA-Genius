
import React, { useState, useRef } from 'react';

interface UploaderProps {
  onUpload: (file: File) => void;
  onBatchImages: (files: File[]) => void;
  isUploading: boolean;
}

export const Uploader: React.FC<UploaderProps> = ({ onUpload, onBatchImages, isUploading }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const svgaInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);

  const handleSvgaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const handleBatchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onBatchImages(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Fixed: Cast Array.from result to File[] to resolve 'unknown' type errors on name and type properties.
      const files = Array.from(e.dataTransfer.files) as File[];
      const firstFile = files[0];
      
      if (firstFile.name.toLowerCase().endsWith('.svga')) {
        onUpload(firstFile);
      } else if (firstFile.type.startsWith('image/')) {
        onBatchImages(files.filter(f => f.type.startsWith('image/')));
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-arabic">
      <div 
        className={`relative h-64 sm:h-80 rounded-[3rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 sm:gap-6 p-6 sm:p-10 cursor-pointer shadow-3xl
          ${isDragOver ? 'border-sky-500 bg-sky-500/10 scale-[1.01]' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/80'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => svgaInputRef.current?.click()}
      >
        <input 
          ref={svgaInputRef}
          type="file" 
          accept=".svga"
          className="hidden"
          onChange={handleSvgaChange}
        />
        
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-400 border border-sky-500/20 shadow-glow-sky-sm">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        
        <div className="text-center">
          <h3 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tighter uppercase">رفع ملفات SVGA</h3>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[8px] sm:text-[9px]">أسقط ملف الأنيميشن هنا للبدء في التعديل</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* زر ضغط الصور الجماعي الجديد */}
        <div 
          onClick={() => batchInputRef.current?.click()}
          className="group relative p-8 bg-gradient-to-br from-indigo-900/20 to-slate-900/60 border border-indigo-500/10 rounded-[2.5rem] hover:border-indigo-500/40 transition-all cursor-pointer overflow-hidden shadow-2xl"
        >
          <input 
            ref={batchInputRef}
            type="file" 
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleBatchChange}
          />
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-24 h-24 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          
          <div className="relative z-10 flex items-center gap-6">
             <div className="w-16 h-16 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-glow-indigo group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
             </div>
             <div className="text-right flex-1">
                <h4 className="text-lg font-black text-white uppercase tracking-tighter">ضغط الصور الجماعي</h4>
                <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em] mt-1">معالجة أكثر من 400 صورة بضغطة واحدة</p>
             </div>
          </div>
        </div>

        <div className="p-8 bg-slate-900/40 border border-white/5 rounded-[2.5rem] flex items-center justify-center text-center">
            <div className="space-y-2">
               <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">Quantum Optimization Active</span>
               <div className="flex gap-3 justify-center">
                  <span className="px-3 py-1 bg-white/5 rounded-full text-[7px] text-slate-500 font-black border border-white/5">Auto Quality</span>
                  <span className="px-3 py-1 bg-white/5 rounded-full text-[7px] text-slate-500 font-black border border-white/5">ZIP Package</span>
               </div>
            </div>
        </div>
      </div>
      
      <style>{`
        .shadow-3xl { box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.6); }
        .shadow-glow-sky-sm { box-shadow: 0 0 20px rgba(14, 165, 233, 0.2); }
        .shadow-glow-indigo { box-shadow: 0 0 25px rgba(99, 102, 241, 0.4); }
      `}</style>
    </div>
  );
};
