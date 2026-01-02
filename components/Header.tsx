
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, Unsubscribe } from 'firebase/firestore';
import { translations } from '../App';

interface HeaderProps {
  onLogoClick: () => void;
  isAdmin?: boolean;
  userName?: string;
  onAdminToggle?: () => void;
  onLogout?: () => void;
  isAdminOpen?: boolean;
  lang: 'ar' | 'en';
  onLangToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onLogoClick, isAdmin, userName, onAdminToggle, onLogout, isAdminOpen, lang, onLangToggle 
}) => {
  const [diamonds, setDiamonds] = useState<number>(0);
  const [userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [showProfile, setShowProfile] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);
  const [branding, setBranding] = useState({ name: 'SVGA Genius', subTitle: 'Quantum Suite', logo: null as string | null });

  const t = translations[lang];

  useEffect(() => {
    const savedUser = localStorage.getItem('svga_user');
    let unsubUser: Unsubscribe | null = null;
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUserId(user.id || '');
        setUserEmail(user.email || '');
        if (user.email) {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", user.email));
          unsubUser = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) setDiamonds(snapshot.docs[0].data().diamonds || 0);
          });
        }
      } catch (e) {}
    }

    const unsubBranding = onSnapshot(doc(db, "settings", "branding"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBranding({ name: data.name || 'SVGA Genius', subTitle: data.subTitle || 'Quantum Suite', logo: data.logo || null });
      }
    });

    return () => { if (unsubUser) unsubUser(); unsubBranding(); };
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userId);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 backdrop-blur-2xl bg-slate-950/80">
      <div className={`max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-2 ${lang === 'en' ? 'flex-row-reverse' : ''}`}>
        
        {/* Logo Section */}
        <div className={`flex items-center gap-3 shrink-0 cursor-pointer group ${lang === 'en' ? 'flex-row-reverse' : ''}`} onClick={onLogoClick}>
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transition-all group-hover:scale-110 ring-2 ring-white/5 overflow-hidden">
            {branding.logo ? <img src={branding.logo} className="w-full h-full object-contain" alt="Logo" /> : <span className="text-white font-black text-xl italic">{branding.name?.[0]?.toUpperCase()}</span>}
          </div>
          <div className={`flex flex-col hidden sm:flex ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <span className="text-sm sm:text-lg font-black text-white tracking-tighter leading-none uppercase">{branding.name}</span>
            <span className="text-[6px] sm:text-[7px] font-black text-slate-500 uppercase tracking-[0.4em] mt-0.5">{branding.subTitle}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className={`flex items-center gap-1.5 sm:gap-3 shrink-0 ${lang === 'en' ? 'flex-row-reverse' : ''}`}>
          
          {/* Language Toggle Button */}
          <button 
            onClick={onLangToggle}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-white/5 hover:bg-sky-500/20 text-sky-400 rounded-xl border border-white/10 transition-all flex items-center justify-center group"
            title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
          >
            <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-xl shadow-inner shrink-0">
             <span className="text-[10px] sm:text-xs font-black text-sky-400">{diamonds}</span>
             <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 10.5L12 22L19.5 10.5L12 2z"/></svg>
          </div>

          <button onClick={() => setShowProfile(true)} className={`flex items-center gap-2 p-1 bg-white/5 hover:bg-sky-500/20 rounded-xl border border-white/10 transition-all group ${lang === 'ar' ? 'pr-2' : 'pl-2'}`}>
            <div className={`flex flex-col hidden md:flex ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <span className="text-[9px] font-black text-white uppercase tracking-tight">{userName}</span>
                <span className="text-[7px] text-sky-500 font-bold uppercase tracking-widest">{t.platinumDesigner}</span>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-slate-800 text-sky-400 rounded-lg group-hover:bg-sky-500 group-hover:text-white transition-all font-black text-xs">
               {userName?.[0]?.toUpperCase() || 'U'}
            </div>
          </button>

          <nav className={`flex items-center gap-1 sm:gap-2 border-slate-800 ${lang === 'ar' ? 'border-l pl-1.5' : 'border-r pr-1.5'} ${lang === 'en' ? 'flex-row-reverse' : ''}`}>
            {isAdmin && (
              <button onClick={onAdminToggle} className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl transition-all border ${isAdminOpen ? 'bg-amber-500 text-white border-amber-400' : 'bg-white/5 text-slate-400 border-white/10 hover:text-amber-500'}`}>
                <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37-1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31(2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </button>
            )}
            <button onClick={onLogout} className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl border border-white/10 transition-all">
              <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </nav>
        </div>
      </div>

      {showProfile && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl" onClick={() => setShowProfile(false)}></div>
          <div className={`relative w-full max-w-[420px] bg-[#0c1222] border border-white/10 rounded-[3.5rem] shadow-3xl overflow-hidden flex flex-col transform animate-in zoom-in-95 duration-500 ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
             <div className="relative bg-gradient-to-b from-sky-500/10 to-transparent p-6 pb-2 text-center border-b border-white/5">
                <button onClick={() => setShowProfile(false)} className={`absolute top-6 ${lang === 'ar' ? 'right-8' : 'left-8'} w-9 h-9 bg-slate-900/50 hover:bg-red-500/20 text-white/50 hover:text-red-500 rounded-2xl flex items-center justify-center border border-white/5`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-[2.2rem] flex items-center justify-center mx-auto mb-4 shadow-glow-sky border-4 border-slate-900 ring-4 ring-sky-500/20 overflow-hidden">
                   <span className="text-white text-3xl font-black italic">{userName?.[0]?.toUpperCase()}</span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight leading-none mb-1">{userName}</h3>
                <span className="text-sky-500 text-[9px] font-black uppercase tracking-[0.2em] bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">{t.platinumDesigner}</span>
             </div>

             <div className="p-8 flex-1 flex flex-col min-h-[400px]">
                  <div className="space-y-4">
                     <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2.5rem] border border-white/5 p-5 flex flex-col items-center justify-center shadow-xl">
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">{t.balance}</span>
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center border border-sky-500/20">
                              <svg className="w-6 h-6 text-sky-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 10.5L12 22L19.5 10.5L12 2z"/></svg>
                           </div>
                           <span className="text-white font-black text-4xl tracking-tighter">{diamonds}</span>
                        </div>
                     </div>
                     <div className="bg-slate-950/40 p-4 rounded-[1.8rem] border border-white/5 text-center">
                        <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest block mb-1">{t.email}</span>
                        <p className="text-slate-400 text-[11px] font-medium tracking-tight">{userEmail}</p>
                     </div>
                     <div onClick={copyToClipboard} className="bg-slate-950/40 p-4 rounded-[1.8rem] border border-white/5 text-center relative overflow-hidden cursor-pointer group hover:bg-slate-900 transition-all">
                        <div className={`absolute top-0 ${lang === 'ar' ? 'right-0' : 'left-0'} w-1 h-full bg-amber-500/40`}></div>
                        <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest block mb-1">{t.idMember}</span>
                        <div className="flex items-center justify-center gap-2">
                           <p className="text-sky-400 text-base font-mono font-black">{userId || '10001'}</p>
                           <svg className={`w-3.5 h-3.5 ${copyStatus ? 'text-green-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1" /></svg>
                        </div>
                        {copyStatus && <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[8px] font-black px-3 py-1 rounded-full shadow-glow-green">{t.copied}</span>}
                     </div>
                  </div>
             </div>
             <div className="p-8 pt-0">
                <button onClick={() => setShowProfile(false)} className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] transition-all border border-white/5">{t.closeProfile}</button>
             </div>
          </div>
        </div>
      )}
    </header>
  );
};
