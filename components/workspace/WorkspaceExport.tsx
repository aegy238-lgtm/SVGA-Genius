
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, updateDoc, increment, doc } from 'firebase/firestore';
import { translations } from '../../App';

interface WorkspaceExportProps {
  formats: string[];
  selectedFormat: string;
  onFormatSelect: (f: string) => void;
  onExport: () => void;
  onFrameExport: () => void;
  onAssetsExport: () => void;
  lang: 'ar' | 'en';
}

export const WorkspaceExport: React.FC<WorkspaceExportProps> = ({ 
  formats, selectedFormat, onFormatSelect, onExport, onFrameExport, onAssetsExport, lang 
}) => {
  const [userBalance, setUserBalance] = useState<number>(0);
  const [exportCost, setExportCost] = useState<number>(1);
  const [minPrivilegeBalance, setMinPrivilegeBalance] = useState<number>(999999);
  const [userDocId, setUserDocId] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManualVIP, setIsManualVIP] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    const savedUser = localStorage.getItem('svga_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setIsAdmin(user.role === 'admin');

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", user.email));
      
      const unsubUser = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          setUserDocId(docSnap.id);
          const data = docSnap.data();
          setUserBalance(data.diamonds || 0);
          setIsManualVIP(data.manualVIP === true);
        }
      });

      const unsubSettings = onSnapshot(doc(db, "settings", "economy"), (snap) => {
        if (snap.exists()) setExportCost(snap.data().exportCost || 1);
      });

      const unsubPrivileges = onSnapshot(doc(db, "settings", "privileges"), (snap) => {
        if (snap.exists()) setMinPrivilegeBalance(snap.data().minBalance || 999999);
      });

      return () => { unsubUser(); unsubSettings(); unsubPrivileges(); };
    }
  }, []);

  const handleGuardedExport = async (action: () => void) => {
    const hasFullPrivileges = isAdmin || isManualVIP || userBalance >= minPrivilegeBalance;
    if (hasFullPrivileges) {
      action();
      return;
    }
    if (!userDocId) return;
    if (userBalance < exportCost) {
      alert(lang === 'ar' ? `⚠️ رصيدك غير كافٍ. التكلفة: ${exportCost} 💎` : `⚠️ Insufficient balance. Cost: ${exportCost} 💎`);
      return;
    }
    const confirmMsg = lang === 'ar' ? `هل تريد خصم ${exportCost} ألماس مقابل التصدير؟` : `Deduct ${exportCost} diamonds for export?`;
    if (confirm(confirmMsg)) {
      try {
        await updateDoc(doc(db, "users", userDocId), { diamonds: increment(-exportCost) });
        action();
      } catch (e) { alert("Error."); }
    }
  };

  const isLowBalance = userBalance < exportCost && !isAdmin && !isManualVIP && userBalance < minPrivilegeBalance;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full">
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-5">
        <button 
          onClick={() => handleGuardedExport(onFrameExport)} 
          className={`group p-5 sm:p-7 rounded-3xl text-white border transition-all flex items-center gap-4 sm:gap-6 ${isLowBalance ? 'bg-slate-800/40 opacity-50 border-white/5 cursor-not-allowed shadow-none' : 'bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-500/20 shadow-glow-indigo-sm'}`}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
            <span className="text-base sm:text-xl font-black block leading-none mb-1">{t.imgSequence}</span>
            <span className="text-[8px] sm:text-[10px] opacity-40 uppercase tracking-widest">{t.zipNote}</span>
          </div>
        </button>
        <button 
          onClick={() => handleGuardedExport(onAssetsExport)} 
          className={`group p-5 sm:p-7 rounded-3xl text-white border transition-all flex items-center gap-4 sm:gap-6 ${isLowBalance ? 'bg-slate-800/40 opacity-50 border-white/5 cursor-not-allowed shadow-none' : 'bg-slate-900/60 hover:bg-slate-800 border-white/5'}`}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-sky-500/10 rounded-2xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </div>
          <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
            <span className="text-base sm:text-xl font-black text-sky-400 block leading-none mb-1">{t.downloadLayers}</span>
            <span className="text-[8px] sm:text-[10px] text-slate-600 uppercase tracking-widest">{t.exportRaw}</span>
          </div>
        </button>
      </div>

      <div className="bg-slate-900/60 rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-10 border border-white/5 flex flex-col gap-6 sm:gap-10 shadow-3xl backdrop-blur-3xl relative">
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-6 ${lang === 'en' ? 'sm:flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 w-full sm:w-auto ${lang === 'en' ? 'justify-end sm:justify-start' : 'justify-start'}`}>
            <div className="w-1.5 h-6 bg-sky-500 rounded-full shadow-glow-sky-sm"></div>
            <h3 className="text-white font-black text-xs sm:text-sm uppercase tracking-[0.2em] opacity-80">{t.convertFormat}</h3>
          </div>
          
          <div className="w-full sm:w-auto flex justify-center">
            <div className="flex items-center gap-2 px-6 py-3 bg-[#0a1a2f] border border-sky-500/40 rounded-full shadow-inner-lg min-w-[160px] justify-center transition-all group hover:border-sky-500">
               {userBalance >= minPrivilegeBalance || isAdmin || isManualVIP ? (
                 <span className="text-[11px] sm:text-[13px] font-black text-amber-500 uppercase tracking-tight flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 10.5L12 22L19.5 10.5L12 2z"/></svg>
                    VIP ACCESS
                 </span>
               ) : (
                 <div className={`flex items-center gap-2.5 ${lang === 'en' ? 'flex-row-reverse' : ''}`}>
                   <svg className="w-4.5 h-4.5 text-sky-400 animate-pulse" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 10.5L12 22L19.5 10.5L12 2z"/></svg>
                   <span className="text-[12px] sm:text-[14px] font-black text-sky-400 tracking-tighter">
                      {t.costLabel} {exportCost}
                   </span>
                 </div>
               )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-4 gap-3 sm:gap-5">
          {formats.map(f => (
            <button key={f} onClick={() => onFormatSelect(f)} className={`py-4 sm:py-6 rounded-2xl sm:rounded-3xl text-[11px] sm:text-[13px] font-black border transition-all ${selectedFormat === f ? 'bg-sky-500 text-white border-sky-400 shadow-glow-sky-sm scale-105' : 'bg-slate-950/60 border-white/5 text-slate-600 hover:text-slate-300 hover:border-white/10'}`}>
              {f === 'PNG' ? 'PNG (ZIP)' : f}
            </button>
          ))}
        </div>

        <button 
          onClick={() => handleGuardedExport(onExport)} 
          className={`w-full py-6 sm:py-8 text-white text-[12px] sm:text-[15px] font-black rounded-3xl sm:rounded-[4rem] transition-all flex items-center justify-center gap-4 group shadow-2xl ${isLowBalance ? 'bg-slate-800/40 border border-white/5 cursor-not-allowed opacity-50 shadow-none' : 'bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-700 hover:shadow-glow-sky active:scale-[0.97]'}`}
        >
          <span className="uppercase tracking-[0.3em]">{t.exportBtn} {selectedFormat}</span>
          <svg className={`w-5 h-5 group-hover:translate-x-2 transition-transform ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </button>
      </div>
      
      <style>{`
        .shadow-inner-lg {
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.5), 0 0 20px rgba(14, 165, 233, 0.1);
        }
      `}</style>
    </div>
  );
};
