
import React, { useState, useEffect, useRef } from 'react';
import { FileMetadata } from '../types';
import { SUPPORTED_OUTPUTS } from '../constants';
import { WorkspacePlayer } from './workspace/WorkspacePlayer';
import { WorkspaceAssets } from './workspace/WorkspaceAssets';
import { WorkspaceExport } from './workspace/WorkspaceExport';

declare var SVGA: any;
declare var JSZip: any;
declare var gifshot: any;

interface WorkspaceProps {
  metadata: FileMetadata;
  onCancel: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ metadata, onCancel }) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState('WebP');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportPhase, setExportPhase] = useState('');
  const [svgaInstance, setSvgaInstance] = useState<any>(null);
  const [layerImages, setLayerImages] = useState<Record<string, string>>({});
  const [modifiedKeys, setModifiedKeys] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [replacingAssetKey, setReplacingAssetKey] = useState<string | null>(null);

  const videoWidth = metadata.dimensions?.width || 500;
  const videoHeight = metadata.dimensions?.height || 500;
  const aspectRatio = videoWidth / videoHeight;

  useEffect(() => {
    if (!metadata.videoItem) return;
    const loadImages = async () => {
      const extracted: Record<string, string> = {};
      const source = metadata.videoItem.images || {};
      for (const key of Object.keys(source)) {
        const img = source[key];
        if (typeof img === 'string') extracted[key] = img.startsWith('data:') ? img : `data:image/png;base64,${img}`;
        else if (img instanceof HTMLImageElement || img instanceof HTMLCanvasElement) {
            const canv = document.createElement('canvas');
            canv.width = (img as any).naturalWidth || img.width;
            canv.height = (img as any).naturalHeight || img.height;
            canv.getContext('2d')?.drawImage(img, 0, 0);
            extracted[key] = canv.toDataURL('image/png');
        }
      }
      setLayerImages(extracted);
    };
    loadImages();
  }, [metadata.videoItem]);

  useEffect(() => {
    if (playerRef.current && metadata.videoItem && typeof SVGA !== 'undefined') {
      const player = new SVGA.Player(playerRef.current);
      player.loops = 0;
      player.setVideoItem(metadata.videoItem);
      player.startAnimation();
      player.onFrame((f: number) => setCurrentFrame(f));
      setSvgaInstance(player);
      return () => { player.stopAnimation(); player.clear(); };
    }
  }, [metadata.videoItem]);

  const handlePlayToggle = () => {
    if (!svgaInstance) return;
    isPlaying ? svgaInstance.pauseAnimation() : svgaInstance.startAnimation();
    setIsPlaying(!isPlaying);
  };

  const handleFrameChange = (f: number) => {
    if (svgaInstance) {
      svgaInstance.stepToFrame(f, false);
      setCurrentFrame(f);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const wasPlaying = isPlaying;
    if (wasPlaying) svgaInstance.pauseAnimation();

    if (selectedFormat === 'GIF') {
      const gifshotObj = (window as any).gifshot;
      if (!gifshotObj) {
        alert("خطأ: مكتبة معالجة GIF غير متوفرة حالياً. يرجى التحقق من اتصال الإنترنت وإعادة المحاولة.");
        setIsExporting(false);
        if (wasPlaying) svgaInstance.startAnimation();
        return;
      }

      setExportPhase('جاري التقاط الفريمات لـ GIF...');
      const frames = [];
      const canvas = document.createElement('canvas');
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      const ctx = canvas.getContext('2d');
      
      for (let i = 0; i < (metadata.frames || 1); i++) {
        svgaInstance.stepToFrame(i, false);
        await new Promise(r => setTimeout(r, 20));
        const pCanvas = playerRef.current?.querySelector('canvas');
        if (pCanvas && ctx) {
          ctx.clearRect(0, 0, videoWidth, videoHeight);
          ctx.drawImage(pCanvas, 0, 0, videoWidth, videoHeight);
          frames.push(canvas.toDataURL('image/png'));
        }
        setProgress(Math.floor((i / (metadata.frames || 1)) * 50));
      }

      setExportPhase('جاري إنشاء ملف GIF...');
      gifshotObj.createGIF({
        images: frames,
        gifWidth: videoWidth,
        gifHeight: videoHeight,
        interval: 1 / (metadata.fps || 30),
        numFrames: metadata.frames,
        sampleInterval: 10
      }, (obj: any) => {
        if (!obj.error) {
          const link = document.createElement('a');
          link.href = obj.image;
          link.download = `${metadata.name}.gif`;
          link.click();
        } else {
          alert("حدث خطأ أثناء توليد ملف GIF.");
        }
        setIsExporting(false);
        if (wasPlaying) svgaInstance.startAnimation();
      });
    } else {
      setExportPhase(`جاري تصدير ${selectedFormat} Sequence...`);
      const zip = new JSZip();
      const canvas = document.createElement('canvas');
      canvas.width = videoWidth; canvas.height = videoHeight;
      const ctx = canvas.getContext('2d');
      const mimeType = selectedFormat === 'WebP' ? 'image/webp' : 'image/png';
      
      for (let i = 0; i < (metadata.frames || 1); i++) {
          svgaInstance.stepToFrame(i, false);
          await new Promise(r => setTimeout(r, 20));
          const pCanvas = playerRef.current?.querySelector('canvas');
          if (pCanvas && ctx) {
              ctx.clearRect(0, 0, videoWidth, videoHeight);
              ctx.drawImage(pCanvas, 0, 0, videoWidth, videoHeight);
              zip.file(`frame_${i.toString().padStart(4, '0')}.${selectedFormat.toLowerCase()}`, 
                canvas.toDataURL(mimeType).split(',')[1], { base64: true });
          }
          setProgress(Math.floor((i / (metadata.frames || 1)) * 100));
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${metadata.name}_${selectedFormat.toLowerCase()}.zip`;
      link.click();
      setIsExporting(false);
      if (wasPlaying) svgaInstance.startAnimation();
    }
  };

  const handleDownloadAllLayers = async () => {
    setIsExporting(true); setExportPhase('تجميع الطبقات...'); setProgress(20);
    const zip = new JSZip();
    Object.entries(layerImages).forEach(([key, data]) => zip.file(`${key}.png`, (data as string).split(',')[1], { base64: true }));
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${metadata.name}_assets.zip`;
    link.click();
    setIsExporting(false);
  };

  return (
    <div className="flex flex-col gap-8 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000 font-arabic select-none">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file && replacingAssetKey && svgaInstance) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            svgaInstance.setImage(base64, replacingAssetKey);
            setLayerImages(p => ({ ...p, [replacingAssetKey]: base64 }));
            setModifiedKeys(p => new Set(p).add(replacingAssetKey));
            setReplacingAssetKey(null);
          };
          reader.readAsDataURL(file);
        }
      }} />

      <div className="flex flex-col lg:flex-row items-center justify-between p-6 sm:p-8 rounded-[3.5rem] border border-white/5 bg-slate-900/60 backdrop-blur-3xl shadow-2xl gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-[2rem] flex items-center justify-center text-3xl shadow-glow-sky">✨</div>
          <div className="text-right">
            <h2 className="text-2xl font-black text-white">{metadata.name}</h2>
            <div className="flex gap-2 mt-1">
               <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black text-slate-400 uppercase border border-white/5">{metadata.frames} Frames</span>
               <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black text-slate-400 uppercase border border-white/5">{videoWidth}x{videoHeight}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-2">
           <span className="px-5 py-1.5 bg-sky-500/10 rounded-xl text-[10px] font-black text-sky-400 uppercase tracking-widest border border-sky-500/20">منصة المصمم الذكية</span>
           <span className="text-[8px] text-slate-500 uppercase font-bold tracking-[0.3em]">Drop any SVGA file to switch</span>
        </div>

        <button onClick={onCancel} className="px-8 py-4 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-[2rem] border border-white/10 transition-all font-black text-[10px] tracking-widest uppercase">إغلاق</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-7 flex flex-col gap-8">
          <WorkspacePlayer playerRef={playerRef} aspectRatio={aspectRatio} isPlaying={isPlaying} onPlayToggle={handlePlayToggle} currentFrame={currentFrame} totalFrames={metadata.frames || 0} onFrameChange={handleFrameChange} />
          <WorkspaceExport formats={SUPPORTED_OUTPUTS} selectedFormat={selectedFormat} onFormatSelect={setSelectedFormat} onExport={handleExport} onFrameExport={handleExport} onAssetsExport={handleDownloadAllLayers} />
        </div>

        <div className="xl:col-span-5">
          <WorkspaceAssets layerImages={layerImages} searchQuery={searchQuery} onSearchChange={setSearchQuery} onReplaceClick={(key) => { setReplacingAssetKey(key); fileInputRef.current?.click(); }} onDownloadClick={(k, d) => { const a = document.createElement('a'); a.href = d; a.download = `${k}.png`; a.click(); }} modifiedKeys={modifiedKeys} />
        </div>
      </div>

      {isExporting && (
        <div className="fixed inset-0 z-[200] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-6">
          <div className="bg-slate-900/80 p-12 sm:p-20 rounded-[5rem] w-full max-w-lg text-center border border-white/10 shadow-glow-sky">
            <div className="relative w-40 h-40 mx-auto mb-12">
              <div className="absolute inset-0 border-[8px] border-sky-500/10 rounded-full"></div>
              <div className="absolute inset-0 border-[8px] border-sky-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white">{progress}%</span>
                <span className="text-[9px] text-sky-400 font-black uppercase tracking-widest">Quantum Engine</span>
              </div>
            </div>
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">{exportPhase}</h3>
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">يرجى عدم إغلاق النافذة أثناء المعالجة</p>
          </div>
        </div>
      )}
      
      <style>{`
        .shadow-glow-indigo-sm { box-shadow: 0 0 15px rgba(79, 70, 229, 0.4); }
        .shadow-glow-sky { box-shadow: 0 0 30px rgba(14, 165, 233, 0.4); }
      `}</style>
    </div>
  );
};
