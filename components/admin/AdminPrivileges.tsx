
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { translations } from '../../App';

interface AdminPrivilegesProps {
  lang: 'ar' | 'en';
}

export const AdminPrivileges: React.FC<AdminPrivilegesProps> = ({ lang }) => {
  const [minBalance, setMinBalance] = useState<number>(500);
  const [isSaving, setIsSaving] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "privileges"), (snap) => {
      if (snap.exists()) {
        setMinBalance(snap.data().minBalance || 500);
      }
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "settings", "privileges"), { minBalance }, { merge: true });
      alert(lang === 'ar' ? "تم تحديث نظام الصلاحيات بنجاح ✅" : "Privileges updated successfully ✅");
    } catch (e) {
      alert("Error saving data");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`p-8 bg-slate-900/60 border border-white/5 rounded-[3rem] shadow-2xl backdrop-blur-xl relative overflow-hidden animate-in zoom-in duration-500 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
      <div className={`absolute top-0 ${lang === 'ar' ? 'right-0' : 'left-0'} w-1.5 h-full bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]`}></div>
      
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 mb-2">
           <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
           </div>
           <div>
              <h3 className="text-white font-black text-lg tracking-tight leading-none mb-1">{t.privilegesTab}</h3>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Master Access Threshold</p>
           </div>
        </div>

        <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5">
           <label className="block text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">{t.minBalanceLabel}</label>
           <div className="flex items-center gap-4">
              <div className="flex-1">
                 <input 
                   type="number" 
                   value={minBalance} 
                   onChange={(e) => setMinBalance(parseInt(e.target.value) || 0)}
                   className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-white text-2xl font-black outline-none focus:border-amber-500/50 transition-all text-center"
                 />
              </div>
              <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
                 <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 10.5L12 22L19.5 10.5L12 2z"/></svg>
              </div>
           </div>
           <p className="mt-4 text-slate-600 text-[10px] font-bold leading-relaxed">{t.minBalanceDesc}</p>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-white font-black rounded-3xl text-xs uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSaving ? '...' : (lang === 'ar' ? 'تحديث الإعدادات' : 'Update Settings')}
        </button>
      </div>
    </div>
  );
};
