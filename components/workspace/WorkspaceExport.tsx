
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, updateDoc, increment, doc } from 'firebase/firestore';

interface WorkspaceExportProps {
  formats: string[];
  selectedFormat: string;
  onFormatSelect: (f: string) => void;
  onExport: () => void;
  onFrameExport: () => void;
  onAssetsExport: () => void;
}

export const WorkspaceExport: React.FC<WorkspaceExportProps> = ({ 
  formats, selectedFormat, onFormatSelect, onExport, onFrameExport, onAssetsExport 
}) => {
  const [userBalance, setUserBalance] = useState<number>(0);
  const [exportCost, setExportCost] = useState<number>(1);
  const [userDocId, setUserDocId] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);

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
          setUserBalance(docSnap.data().diamonds || 0);
        }
      });

      const unsubSettings = onSnapshot(doc(db, "settings", "economy"), (snap) => {
        if (snap.exists()) setExportCost(snap.data().exportCost || 1);
      });

      return () => { unsubUser(); unsubSettings(); };
    }
  }, []);

  const handleGuardedExport = async (action: () => void) => {
    if (isAdmin) {
      action();
      return;
    }
    if (!userDocId) {
      alert("يرجى تسجيل الدخول مرة أخرى.");
      return;
    }
    if (userBalance < exportCost) {
      alert(`⚠️ رصيدك غير كافٍ. التكلفة: ${exportCost} 💎، رصيدك: ${userBalance} 💎`);
      return;
    }
    if (confirm(`خصم ${exportCost} ألماس مقابل التصدير؟`)) {
      try {
        await updateDoc(doc(db, "users", userDocId), {
          diamonds: increment(-exportCost)
        });
        action();
      } catch (e) {
        alert("حدث خطأ في الخصم.");
      }
    }
  };

  const isLowBalance = userBalance < exportCost && !isAdmin;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 font-arabic">
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
        <button 
          onClick={() => handleGuardedExport(onFrameExport)} 
          className={`group p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-white border transition-all flex items-center gap-4 sm:gap-6 ${isLowBalance ? 'bg-slate-800/40 opacity-50 border-white/5 cursor-not-allowed shadow-none' : 'bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-500/20 shadow-glow-indigo-sm'}`}
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <div className="text-right">
            <span className="text-sm sm:text-lg font-black block">تسلسل الصور</span>
            <span className="text-[7px] sm:text-[9px] opacity-50 uppercase tracking-widest">ملف ZIP مضغوط</span>
          </div>
        </button>
        <button 
          onClick={() => handleGuardedExport(onAssetsExport)} 
          className={`group p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-white border transition-all flex items-center gap-4 sm:gap-6 ${isLowBalance ? 'bg-slate-800/40 opacity-50 border-white/5 cursor-not-allowed shadow-none' : 'bg-slate-900/60 hover:bg-slate-800 border-white/5'}`}
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </div>
          <div className="text-right">
            <span className="text-sm sm:text-lg font-black text-sky-400 block">تحميل الطبقات</span>
            <span className="text-[7px] sm:text-[9px] text-slate-600 uppercase tracking-widest">تصدير العناصر الخام</span>
          </div>
        </button>
      </div>

      <div className="bg-slate-900/60 rounded-[2rem] sm:rounded-[3rem] p-5 sm:p-8 border border-white/5 flex flex-col gap-6 sm:gap-8 shadow-3xl backdrop-blur-3xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-sky-500 rounded-full"></div>
            <h3 className="text-white font-black text-[9px] sm:text-xs uppercase tracking-widest opacity-80">تحويل الصيغة</h3>
          </div>
          <span className="px-2 py-0.5 bg-sky-500/10 rounded-lg text-[7px] sm:text-[8px] font-black text-sky-400 uppercase tracking-widest border border-sky-500/20">التكلفة: {exportCost} 💎</span>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
          {formats.map(f => (
            <button key={f} onClick={() => onFormatSelect(f)} className={`py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black border transition-all ${selectedFormat === f ? 'bg-sky-500 text-white border-sky-400 shadow-glow-sky-sm' : 'bg-slate-950/40 border-white/5 text-slate-700 hover:text-slate-400'}`}>
              {f === 'PNG' ? 'PNG (ZIP)' : f}
            </button>
          ))}
        </div>

        <button 
          onClick={() => handleGuardedExport(onExport)} 
          className={`w-full py-4 sm:py-6 text-white text-[10px] sm:text-[12px] font-black rounded-xl sm:rounded-[2.5rem] transition-all flex items-center justify-center gap-3 group ${isLowBalance ? 'bg-slate-800/40 border border-white/5 cursor-not-allowed opacity-50 shadow-none' : 'bg-gradient-to-r from-sky-500 to-indigo-700 hover:shadow-glow-sky active:scale-[0.98]'}`}
        >
          <span>تصدير بصيغة {selectedFormat}</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </button>
      </div>
    </div>
  );
};
