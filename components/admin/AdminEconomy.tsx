
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { translations } from '../../App';

interface AdminEconomyProps {
  lang: 'ar' | 'en';
}

export const AdminEconomy: React.FC<AdminEconomyProps> = ({ lang }) => {
  const [minBalance, setMinBalance] = useState<number>(500);
  const [exportPrice, setExportPrice] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    // جلب عتبة الـ VIP
    const unsubPriv = onSnapshot(doc(db, "settings", "privileges"), (snap) => {
      if (snap.exists()) setMinBalance(snap.data().minBalance || 500);
    });

    // جلب سعر التصدير
    const unsubEconomy = onSnapshot(doc(db, "settings", "economy"), (snap) => {
      if (snap.exists()) setExportPrice(snap.data().exportCost || 1);
    });

    return () => { unsubPriv(); unsubEconomy(); };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        setDoc(doc(db, "settings", "privileges"), { minBalance }, { merge: true }),
        setDoc(doc(db, "settings", "economy"), { exportCost: exportPrice }, { merge: true })
      ]);
      alert(lang === 'ar' ? "تم تحديث النظام المالي بنجاح ✅" : "Economy settings updated ✅");
    } catch (e) {
      alert("Error saving data");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`space-y-6 animate-in zoom-in duration-500 ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`}>
      
      {/* قسم سعر التصدير */}
      <div className={`p-8 bg-slate-900/60 border border-white/5 rounded-[3rem] shadow-2xl backdrop-blur-xl relative overflow-hidden ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
        <div className={`absolute top-0 ${lang === 'ar' ? 'right-0' : 'left-0'} w-1.5 h-full bg-sky-500 shadow-glow-sky`}></div>
        
        <div className="flex items-center gap-4 mb-6">
           <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-400 border border-sky-500/20">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           </div>
           <div>
              <h3 className="text-white font-black text-lg tracking-tight leading-none mb-1">{t.exportPriceLabel}</h3>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Single Export Unit Cost</p>
           </div>
        </div>

        <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5">
           <div className="flex items-center gap-4">
              <div className="flex-1">
                 <input 
                   type="number" 
                   value={exportPrice} 
                   onChange={(e) => setExportPrice(parseInt(e.target.value) || 0)}
                   className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-white text-3xl font-black outline-none focus:border-sky-500/50 transition-all text-center"
                 />
              </div>
              <div className="w-14 h-14 bg-sky-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
                 <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 10.5L12 22L19.5 10.5L12 2z"/></svg>
              </div>
           </div>
           <p className="mt-4 text-slate-600 text-[10px] font-bold leading-relaxed">{t.exportPriceDesc}</p>
        </div>
      </div>

      {/* قسم عتبة الـ VIP */}
      <div className={`p-8 bg-slate-900/60 border border-white/5 rounded-[3rem] shadow-2xl backdrop-blur-xl relative overflow-hidden ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
        <div className={`absolute top-0 ${lang === 'ar' ? 'right-0' : 'left-0'} w-1.5 h-full bg-amber-500 shadow-glow-amber`}></div>
        
        <div className="flex items-center gap-4 mb-6">
           <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/20">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
           </div>
           <div>
              <h3 className="text-white font-black text-lg tracking-tight leading-none mb-1">{t.minBalanceLabel}</h3>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Full Privilege Threshold</p>
           </div>
        </div>

        <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5">
           <div className="flex items-center gap-4">
              <div className="flex-1">
                 <input 
                   type="number" 
                   value={minBalance} 
                   onChange={(e) => setMinBalance(parseInt(e.target.value) || 0)}
                   className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-white text-3xl font-black outline-none focus:border-amber-500/50 transition-all text-center"
                 />
              </div>
              <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
                 <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 10.5L12 22L19.5 10.5L12 2z"/></svg>
              </div>
           </div>
           <p className="mt-4 text-slate-600 text-[10px] font-bold leading-relaxed">{t.minBalanceDesc}</p>
        </div>
      </div>

      <button 
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black rounded-3xl text-xs uppercase tracking-[0.2em] shadow-lg shadow-sky-500/20 active:scale-95 transition-all disabled:opacity-50"
      >
        {isSaving ? '...' : (lang === 'ar' ? 'حفظ التعديلات المالية' : 'Save Economy Settings')}
      </button>
    </div>
  );
};
