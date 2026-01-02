
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, Unsubscribe } from 'firebase/firestore';

interface HeaderProps {
  onLogoClick: () => void;
  isAdmin?: boolean;
  userName?: string;
  onAdminToggle?: () => void;
  onLogout?: () => void;
  isAdminOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onLogoClick, isAdmin, userName, onAdminToggle, onLogout, isAdminOpen }) => {
  const [diamonds, setDiamonds] = useState<number>(0);
  const [userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [showProfile, setShowProfile] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);
  
  // Branding & Social State
  const [socialLinks, setSocialLinks] = useState({ whatsapp: '', tiktok: '' });
  const [branding, setBranding] = useState({ name: 'SVGA Genius', subTitle: 'Quantum Suite', logo: null as string | null });

  useEffect(() => {
    const savedUser = localStorage.getItem('svga_user');
    let unsubUser: Unsubscribe | null = null;

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (!user) return;

        setUserId(user.id || '');
        setUserEmail(user.email || '');
        
        if (user.email) {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", user.email));
          unsubUser = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
              const data = snapshot.docs[0].data();
              setDiamonds(data.diamonds || 0);
            }
          });
        }
      } catch (e) {
        console.error("Error loading user data", e);
      }
    }

    // Listen to social links settings
    const unsubSocial = onSnapshot(doc(db, "settings", "social"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSocialLinks({
          whatsapp: data.whatsapp || '',
          tiktok: data.tiktok || ''
        });
      }
    });

    // Listen to branding settings
    const unsubBranding = onSnapshot(doc(db, "settings", "branding"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBranding({
          name: data.name || 'SVGA Genius',
          subTitle: data.subTitle || 'Quantum Suite',
          logo: data.logo || null
        });
      }
    });

    return () => { 
      if (unsubUser) unsubUser(); 
      unsubSocial();
      unsubBranding();
    };
  }, []);

  const copyToClipboard = () => {
    if (!userId) return;
    navigator.clipboard.writeText(userId);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 backdrop-blur-2xl bg-slate-950/80 font-arabic">
      <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-2">
        
        {/* Logo Section */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 cursor-pointer group" onClick={onLogoClick}>
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transition-all group-hover:scale-110 ring-2 ring-white/5 overflow-hidden">
            {branding.logo ? (
              <img src={branding.logo} className="w-full h-full object-contain" alt="Logo" />
            ) : (
              <span className="text-white font-black text-base sm:text-xl italic">{branding.name?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <div className="flex flex-col hidden sm:flex text-right">
            <span className="text-sm sm:text-lg font-black text-white tracking-tighter leading-none uppercase">{branding.name}</span>
            <span className="text-[6px] sm:text-[7px] font-black text-slate-500 uppercase tracking-[0.4em] mt-0.5">{branding.subTitle}</span>
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex-1 flex items-center justify-start px-2 sm:px-4 gap-2.5 overflow-x-auto no-scrollbar">
          {socialLinks.whatsapp && (
            <a 
              href={`https://wa.me/${socialLinks.whatsapp}`} 
              target="_blank" 
              className="w-9 h-9 sm:w-10 sm:h-10 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white rounded-xl transition-all border border-[#25D366]/20 active:scale-90 shadow-glow-green-sm flex items-center justify-center shrink-0 group/wa" 
              title="تواصل واتساب"
            >
               <svg className="w-5 h-5 group-hover/wa:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.408.001 12.045a11.811 11.811 0 001.592 5.911L0 24l6.147-1.613a11.773 11.773 0 005.907 1.577h.005c6.632 0 12.042-5.41 12.046-12.048a11.811 11.811 0 00-3.536-8.409z"/></svg>
            </a>
          )}
          {socialLinks.tiktok && (
            <a 
              href={socialLinks.tiktok} 
              target="_blank" 
              className="w-9 h-9 sm:w-10 sm:h-10 bg-black/60 hover:bg-black text-white rounded-xl transition-all border border-white/10 active:scale-90 flex items-center justify-center shrink-0 shadow-lg group/tt relative overflow-hidden" 
              title="تيك توك"
            >
               <div className="absolute inset-0 bg-gradient-to-tr from-[#00f2ea]/20 via-transparent to-[#ff0050]/20 opacity-40 group-hover/tt:opacity-100 transition-opacity"></div>
               <svg className="w-5 h-5 group-hover/tt:scale-110 transition-transform relative z-10" fill="currentColor" viewBox="0 0 448 512"><path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z"/></svg>
            </a>
          )}
        </div>

        {/* Right Section Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-xl shadow-inner shrink-0">
             <span className="text-[10px] sm:text-xs font-black text-sky-400">{diamonds}</span>
             <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shadow-glow-sky" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 10.5L12 22L19.5 10.5L12 2z"/></svg>
          </div>

          <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 p-1 bg-white/5 hover:bg-sky-500/20 rounded-xl border border-white/10 transition-all group pr-2 sm:pr-3">
            <div className="flex flex-col text-right hidden md:flex">
                <span className="text-[9px] font-black text-white uppercase tracking-tight">{userName}</span>
                <span className="text-[7px] text-sky-500 font-bold uppercase tracking-widest">المصمم البلاتيني</span>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-slate-800 text-sky-400 rounded-lg group-hover:bg-sky-500 group-hover:text-white transition-all font-black text-xs overflow-hidden">
               {branding.logo ? <img src={branding.logo} className="w-full h-full object-cover" /> : (userName?.[0]?.toUpperCase() || 'U')}
            </div>
          </button>

          <nav className="flex items-center gap-1 sm:gap-2 border-l border-white/10 pl-1.5 sm:pl-3">
            {isAdmin && (
              <button onClick={(e) => { e.preventDefault(); onAdminToggle?.(); }} className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all border ${isAdminOpen ? 'bg-amber-500 text-white border-amber-400 shadow-glow-amber scale-110' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-amber-500/20 hover:text-amber-500 hover:border-amber-500/20'}`}>
                <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37-1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31(2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </button>
            )}
            <button onClick={(e) => { e.preventDefault(); onLogout?.(); }} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl border border-white/10 transition-all active:scale-90">
              <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </nav>
        </div>
      </div>

      {showProfile && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-300 font-arabic">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl" onClick={() => setShowProfile(false)}></div>
          
          <div className="relative w-full max-w-[420px] bg-[#0c1222] border border-white/10 rounded-[3.5rem] shadow-3xl overflow-hidden flex flex-col transform animate-in zoom-in-95 duration-500">
             
             <div className="relative bg-gradient-to-b from-sky-500/10 to-transparent p-6 pb-2 text-center border-b border-white/5">
                <button onClick={() => setShowProfile(false)} className="absolute top-6 right-8 w-9 h-9 bg-slate-900/50 hover:bg-red-500/20 text-white/50 hover:text-red-500 rounded-2xl flex items-center justify-center transition-all border border-white/5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-[2.2rem] flex items-center justify-center mx-auto mb-4 shadow-glow-sky border-4 border-slate-900 ring-4 ring-sky-500/20 relative overflow-hidden">
                   {branding.logo ? <img src={branding.logo} className="w-full h-full object-cover" /> : <span className="text-white text-3xl font-black italic">{userName?.[0]?.toUpperCase() || 'U'}</span>}
                   <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-green-500 border-4 border-slate-900 rounded-full animate-pulse"></div>
                </div>
                
                <h3 className="text-xl font-black text-white tracking-tight leading-none mb-1">{userName}</h3>
                <span className="text-sky-500 text-[9px] font-black uppercase tracking-[0.2em] bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">Platinum Designer</span>
             </div>

             <div className="p-8 flex-1 overflow-hidden flex flex-col min-h-[400px]">
                  <div className="space-y-4 animate-in slide-in-from-right-10 duration-500">
                     <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2.5rem] border border-white/5 p-5 flex flex-col items-center justify-center relative overflow-hidden shadow-xl">
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">الرصيد الماسي المتاح</span>
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-500/20">
                              <svg className="w-6 h-6 text-sky-400 shadow-glow-sky" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 10.5L12 22L19.5 10.5L12 2z"/></svg>
                           </div>
                           <span className="text-white font-black text-4xl tracking-tighter">{diamonds}</span>
                        </div>
                     </div>

                     <div className="bg-slate-950/40 p-4 rounded-[1.8rem] border border-white/5 text-center">
                        <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest block mb-1">البريد الإلكتروني</span>
                        <p className="text-slate-400 text-[11px] font-medium tracking-tight">{userEmail}</p>
                     </div>

                     <div className="bg-slate-950/40 p-4 rounded-[1.8rem] border border-white/5 text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500/40"></div>
                        <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest block mb-1">اسم المستخدم</span>
                        <p className="text-white text-sm font-black tracking-tight">{userName}</p>
                     </div>

                     <div onClick={copyToClipboard} className="bg-slate-950/40 p-4 rounded-[1.8rem] border border-white/5 text-center relative overflow-hidden cursor-pointer group hover:bg-slate-900 transition-all">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/40"></div>
                        <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest block mb-1">معرف العضو (ID)</span>
                        <div className="flex items-center justify-center gap-2">
                           <p className="text-sky-400 text-base font-mono font-black">{userId || '10001'}</p>
                           <svg className={`w-3.5 h-3.5 ${copyStatus ? 'text-green-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1" /></svg>
                        </div>
                        {copyStatus && <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[8px] font-black px-3 py-1 rounded-full shadow-glow-green">تم النسخ</span>}
                     </div>
                  </div>
             </div>

             <div className="p-8 pt-0">
                <button onClick={() => setShowProfile(false)} className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] transition-all border border-white/5 active:scale-[0.98]">
                   إغلاق الملف الشخصي
                </button>
             </div>
          </div>
        </div>
      )}
      
      <style>{`
        .shadow-glow-sky { filter: drop-shadow(0 0 10px rgba(14, 165, 233, 0.6)); }
        .shadow-glow-green-sm { filter: drop-shadow(0 0 8px rgba(37, 211, 102, 0.5)); }
        .shadow-glow-sky-sm { box-shadow: 0 0 15px rgba(14, 165, 233, 0.3); }
        .shadow-glow-amber { box-shadow: 0 0 20px rgba(245, 158, 11, 0.5); }
        .shadow-3xl { box-shadow: 0 50px 150px -20px rgba(0,0,0,1); }
        .font-arabic { font-family: 'Inter', 'Cairo', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.1); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </header>
  );
};
