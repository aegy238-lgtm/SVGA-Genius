
import React, { useState, useEffect } from 'react';

declare var JSZip: any;

interface ImageCompressorProps {
  files: File[];
  onCancel: () => void;
}

export const ImageCompressor: React.FC<ImageCompressorProps> = ({ files, onCancel }) => {
  const [quality, setQuality] = useState(85);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('جاهز للضغط...');
  const [isDone, setIsDone] = useState(false);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [savedSize, setSavedSize] = useState<number>(0);
  const [totalOriginalSize, setTotalOriginalSize] = useState<number>(0);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const startProcessing = async () => {
    setIsProcessing(true);
    setProgress(0);
    const zip = new JSZip();
    const total = files.length;
    let totalSaved = 0;
    let originalSizeAcc = 0;
    
    files.forEach(f => originalSizeAcc += f.size);
    setTotalOriginalSize(originalSizeAcc);

    setStatus(`جاري ضغط ${total} صورة PNG بجودة ${quality}%...`);

    for (let i = 0; i < total; i++) {
      const file = files[i];
      const result = await compressPngSmart(file, quality / 100);
      
      const savedInThisFile = file.size - result.blob.size;
      if (savedInThisFile > 0) totalSaved += savedInThisFile;
      setSavedSize(totalSaved);

      // الحفاظ على صيغة PNG
      const fileName = file.name.replace(/\.[^/.]+$/, "") + ".png";
      zip.file(fileName, result.blob);
      
      const currentProgress = Math.floor(((i + 1) / total) * 90);
      setProgress(currentProgress);
      setStatus(`تم ضغط: ${file.name} ✅`);
    }

    setStatus('تجميع الملفات النهائية...');
    const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 9 } });
    setZipUrl(URL.createObjectURL(content));
    setProgress(100);
    setStatus(`اكتملت العملية! وفرت ${formatSize(totalSaved)} من المساحة.`);
    setIsDone(true);
  };

  const compressPngSmart = (file: File, q: number): Promise<{ blob: Blob }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { alpha: true });
          if (!ctx) return resolve({ blob: file });

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          // تقنية Posterization لضغط PNG فعلياً
          // كلما قلت الجودة، قللنا عدد المستويات اللونية مما يقلل حجم ملف PNG النهائي
          if (q < 1) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const levels = Math.max(2, Math.floor(q * 255));
            const step = 256 / levels;
            
            for (let i = 0; i < data.length; i += 4) {
              data[i] = Math.round(data[i] / step) * step;     // Red
              data[i+1] = Math.round(data[i+1] / step) * step; // Green
              data[i+2] = Math.round(data[i+2] / step) * step; // Blue
              // نحافظ على Alpha (الشفافية) كما هي دون تلاعب
            }
            ctx.putImageData(imageData, 0, 0);
          }

          canvas.toBlob((blob) => {
            resolve({ blob: blob || file });
          }, 'image/png');
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-8 sm:p-12 bg-slate-900/80 backdrop-blur-3xl rounded-[3rem] sm:rounded-[5rem] border border-white/10 shadow-3xl text-center font-arabic animate-in fade-in zoom-in duration-700">
      
      {!isProcessing ? (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6 uppercase tracking-tighter">إعدادات الضغط الفائق</h2>
          
          <div className="bg-slate-950/50 p-8 rounded-[3rem] border border-white/5 mb-10 shadow-inner">
             <div className="flex justify-between items-center mb-6 px-4">
                <span className="text-sky-400 font-black text-2xl">{quality}%</span>
                <span className="text-slate-400 font-black text-xs uppercase tracking-widest">جودة الصورة النهائية</span>
             </div>
             
             <input 
               type="range" min="5" max="100" value={quality} 
               onChange={(e) => setQuality(parseInt(e.target.value))}
               className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-sky-500 mb-4"
             />
             
             <div className="flex justify-between text-[10px] text-slate-600 font-black uppercase px-2">
                <span>أعلى ضغط</span>
                <span>توازن ذكي</span>
                <span>جودة أصلية</span>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={startProcessing}
              className="px-12 py-5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-glow-sky hover:scale-105 transition-all"
            >
              ابدأ الضغط الآن
            </button>
            <button onClick={onCancel} className="px-12 py-5 bg-white/5 text-slate-400 rounded-[2rem] font-black text-xs uppercase border border-white/10 hover:bg-white/10 transition-all">إلغاء</button>
          </div>
        </div>
      ) : (
        <div className="animate-in zoom-in">
          <div className="flex justify-center mb-10">
            <div className="relative w-32 h-32 sm:w-44 sm:h-44">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                 <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" 
                   className="text-sky-500 transition-all duration-1000"
                   strokeDasharray="283"
                   strokeDashoffset={283 - (283 * progress) / 100}
                   strokeLinecap="round"
                 />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl sm:text-5xl font-black text-white">{progress}%</span>
                  <span className="text-[8px] text-sky-400 font-black uppercase tracking-[0.2em]">Optimizing PNG</span>
               </div>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">{isDone ? 'تم الضغط بنجاح' : 'جاري معالجة البكسلات'}</h2>
          <p className="text-slate-500 text-[10px] sm:text-xs font-bold mb-8 max-w-md mx-auto">{status}</p>

          {savedSize > 0 && (
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-10">
               <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                  <span className="block text-[8px] text-slate-500 font-black uppercase mb-1">الحجم الأصلي</span>
                  <span className="text-white font-black text-sm">{formatSize(totalOriginalSize)}</span>
               </div>
               <div className="p-4 bg-green-500/10 rounded-3xl border border-green-500/10">
                  <span className="block text-[8px] text-green-500 font-black uppercase mb-1">تم توفير</span>
                  <span className="text-green-400 font-black text-sm">{formatSize(savedSize)}</span>
               </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isDone ? (
              <a 
                href={zipUrl!} 
                download="Compressed_PNG_Assets.zip"
                className="w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-glow-sky hover:scale-105 transition-all flex items-center justify-center gap-3"
              >
                تحميل الملفات المضغوطة (PNG)
              </a>
            ) : (
              <div className="w-full max-w-xs h-2 bg-white/5 rounded-full overflow-hidden mx-auto">
                 <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            )}
            
            <button onClick={onCancel} className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-[2rem] font-black text-[10px] uppercase border border-white/10 transition-all">
              {isDone ? 'إغلاق' : 'إيقاف'}
            </button>
          </div>
        </div>
      )}

      <div className="mt-12 flex flex-wrap justify-center gap-4">
         <div className="px-4 py-2 bg-slate-950/50 rounded-xl border border-white/5 text-[8px] text-slate-500 font-black uppercase tracking-widest">Format: PNG</div>
         <div className="px-4 py-2 bg-slate-950/50 rounded-xl border border-white/5 text-[8px] text-slate-500 font-black uppercase tracking-widest">Alpha Channel Preserved</div>
         <div className="px-4 py-2 bg-slate-950/50 rounded-xl border border-white/5 text-[8px] text-slate-500 font-black uppercase tracking-widest">Smart Quantization</div>
      </div>
      
      <style>{`
        .shadow-glow-sky { box-shadow: 0 0 40px rgba(14, 165, 233, 0.3); }
        .shadow-3xl { box-shadow: 0 60px 100px -20px rgba(0,0,0,0.8); }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #0ea5e9;
          box-shadow: 0 0 15px rgba(14, 165, 233, 0.5);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
