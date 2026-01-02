
import React, { useEffect, useState, useRef } from 'react';
import { db } from '../../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

interface AdminSettingsProps {
  autoApprove: boolean;
  onToggleApproval: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ 
  autoApprove, 
  onToggleApproval 
}) => {
  const [exportCost, setExportCost] = useState<number>(1);
  const [whatsapp, setWhatsapp] = useState('');
  const [tiktok, setTiktok] = useState('');
  
  // Branding States
  const [appName, setAppName] = useState('SVGA Genius');
  const [mainTitle, setMainTitle] = useState('The Quantum Animation Processor');
  const [subTitle, setSubTitle] = useState('Quantum Suite');
  const [logo, setLogo] = useState<string | null>(null);
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubEconomy = onSnapshot(doc(db, "settings", "economy"), (snap) => {
      if (snap.exists()) setExportCost(snap.data().exportCost || 1);
    });
    
    const unsubSocial = onSnapshot(doc(db, "settings", "social"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setWhatsapp(data.whatsapp || '');
        setTiktok(data.tiktok || '');
      }
    });

    const unsubBranding = onSnapshot(doc(db, "settings", "branding"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAppName(data.name || 'SVGA Genius');
        setMainTitle(data.mainTitle || 'The Quantum Animation Processor');
        setSubTitle(data.subTitle || 'Quantum Suite');
        setLogo(data.logo || null);
      }
    });

    return () => { unsubEconomy(); unsubSocial(); unsubBranding(); };
  }, []);

  const updateExportCost = async (newVal: number) => {
    if (newVal < 0) return;
    setExportCost(newVal);
    await setDoc(doc(db, "settings", "economy"), { exportCost: newVal }, { merge: true });
  };

  const updateSocialLinks = async () => {
    await setDoc(doc(db, "settings", "social"), { whatsapp, tiktok }, { merge: true });
    alert("تم تحديث روابط التواصل بنجاح ✅");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("حجم اللوجو كبير جداً، يرجى استخدام صورة أقل من 1 ميجابايت.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveBranding = async () => {
    setIsSavingBranding(true);
    try {
      await setDoc(doc(db, "settings", "branding"), {
        name: appName,
        mainTitle,
        subTitle,
        logo: logo
      }, { merge: true });
      alert("تم تحديث هوية الموقع والشعار بالكامل بنجاح ✅");
    } catch (e) {
      alert("فشل تحديث البيانات، يرجى المحاولة لاحقاً.");
    } finally {
      setIsSavingBranding(false);
    }
  };

  return (
    <div className="space-y-4 mb-8 font-arabic">
      
      {/* قسم الهوية والبراندنج */}
      <div className="p-6 bg-slate-900/60 border border-white/5 rounded-[2.5rem] shadow-xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1 h-full bg-sky-500 shadow-glow-sky"></div>
        <div className="flex items-center justify-between mb-6">
           <button 
             onClick={saveBranding} 
             disabled={isSavingBranding}
             className="px-6 py-2.5 bg-sky-500 text-white rounded-xl text-[10px] font-black uppercase hover:shadow-glow-sky-sm transition-all disabled:opacity-50 shadow-lg active:scale-95"
           >
             {isSavingBranding ? 'جاري الحفظ...' : 'حفظ الهوية الجديدة'}
           </button>
           <h4 className="text-white text-sm font-black flex items-center gap-2">
             تغيير شعار وهوية الموقع
             <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
           </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* رفع اللوجو */}
           <div className="flex flex-col items-center gap-4 p-4 bg-slate-950/50 rounded-3xl border border-white/5 group">
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">تحميل اللوجو الرئيسي</span>
              <div 
                onClick={() => logoInputRef.current?.click()}
                className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/10 hover:border-sky-500/50 cursor-pointer flex items-center justify-center overflow-hidden transition-all bg-slate-900 relative group"
              >
                {logo ? (
                  <>
                    <img src={logo} className="w-full h-full object-contain p-2" alt="Logo Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-[8px] font-black uppercase">تغيير</span>
                    </div>
                  </>
                ) : (
                  <svg className="w-8 h-8 text-slate-700 group-hover:text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                )}
              </div>
              <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
              <p className="text-[8px] text-slate-600 text-center leading-relaxed">اضغط لرفع اللوجو (PNG/JPG)<br/>سيتم استخدامه في كامل الموقع</p>
           </div>

           {/* الحقول النصية */}
           <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                 <label className="text-[8px] text-slate-500 font-black uppercase text-right pr-2">اسم الموقع الكامل</label>
                 <input 
                   type="text" value={appName} onChange={(e) => setAppName(e.target.value)}
                   className="w-full bg-slate-950 border border-white/5 rounded-xl py-2.5 px-4 text-white text-xs text-right outline-none focus:border-sky-500/30 font-bold"
                 />
              </div>
              <div className="flex flex-col gap-1.5">
                 <label className="text-[8px] text-slate-500 font-black uppercase text-right pr-2">العنوان الفرعي (Subtitle)</label>
                 <input 
                   type="text" value={subTitle} onChange={(e) => setSubTitle(e.target.value)}
                   className="w-full bg-slate-950 border border-white/5 rounded-xl py-2.5 px-4 text-white text-xs text-right outline-none focus:border-sky-500/30 font-bold"
                 />
              </div>
              <div className="flex flex-col gap-1.5">
                 <label className="text-[8px] text-slate-500 font-black uppercase text-right pr-2">نص واجهة الدخول</label>
                 <textarea 
                   value={mainTitle} onChange={(e) => setMainTitle(e.target.value)}
                   className="w-full bg-slate-950 border border-white/5 rounded-xl py-2.5 px-4 text-white text-[11px] text-right outline-none focus:border-sky-500/30 h-16 resize-none font-medium"
                 />
              </div>
           </div>
        </div>
      </div>

      {/* باقي الإعدادات */}
      <div className="p-5 sm:p-6 bg-slate-900/60 border border-white/5 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-1 h-full bg-amber-500 shadow-glow-amber"></div>
        <div className="text-right w-full sm:w-auto">
          <h4 className="text-white text-xs sm:text-sm font-black mb-1 flex items-center gap-2 justify-end">
             نظام تفعيل الحسابات
             <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </h4>
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest leading-relaxed">
            {autoApprove ? 'الدخول تلقائي فور التسجيل' : 'الموافقة اليدوية مطلوبة'}
          </p>
        </div>
        <button 
          onClick={onToggleApproval}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
            autoApprove 
              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' 
              : 'bg-sky-500/10 text-sky-500 border-sky-500/20 hover:bg-sky-500/20'
          }`}
        >
          {autoApprove ? 'تفعيل القبول اليدوي' : 'تفعيل القبول التلقائي'}
        </button>
      </div>

      <div className="p-6 bg-slate-900/60 border border-white/5 rounded-[2rem] shadow-xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1 h-full bg-green-500"></div>
        <div className="flex items-center justify-between mb-4">
           <button onClick={updateSocialLinks} className="px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-[9px] font-black uppercase hover:bg-green-500 hover:text-white transition-all">حفظ الروابط</button>
           <h4 className="text-white text-xs font-black">روابط التواصل الاجتماعي</h4>
        </div>
        <div className="space-y-3">
           <div className="flex flex-col gap-1.5">
              <label className="text-[8px] text-slate-500 font-black uppercase text-right pr-2">رقم الواتساب (بدون +)</label>
              <input 
                type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="مثال: 201234567890"
                className="w-full bg-slate-950 border border-white/5 rounded-xl py-2.5 px-4 text-white text-xs text-right outline-none focus:border-green-500/30"
              />
           </div>
           <div className="flex flex-col gap-1.5">
              <label className="text-[8px] text-slate-500 font-black uppercase text-right pr-2">رابط التيك توك الكامل</label>
              <input 
                type="text" value={tiktok} onChange={(e) => setTiktok(e.target.value)}
                placeholder="https://tiktok.com/@username"
                className="w-full bg-slate-950 border border-white/5 rounded-xl py-2.5 px-4 text-white text-xs text-right outline-none focus:border-sky-500/30"
              />
           </div>
        </div>
      </div>
    </div>
  );
};
