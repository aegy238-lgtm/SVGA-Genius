
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
  const [social, setSocial] = useState({ whatsapp: '', tiktok: '' });

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

    const unsubSocial = onSnapshot(doc(db, "settings", "social"), (snap) => {
      if (snap.exists()) {
        setSocial({ whatsapp: snap.data().whatsapp || '', tiktok: snap.data().tiktok || '' });
      }
    });

    return () => { if (unsubUser) unsubUser(); unsubBranding(); unsubSocial(); };
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
          
          {/* Social Links */}
          <div className="hidden md:flex items-center gap-2 mr-2 ml-2">
            {social.whatsapp && (
              <a href={`https://wa.me/${social.whatsapp}`} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg border border-green-500/20 transition-all">
                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            )}
            {social.tiktok && (
              <a href={social.tiktok} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg border border-sky-500/20 transition-all">
                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a6.417 6.417 0 01-1.87-1.52v9.33c.02 1.44-.22 2.92-.85 4.21-.63 1.28-1.68 2.39-2.99 3.04-1.3.66-2.82.91-4.26.75-1.44-.17-2.85-.72-3.99-1.64-1.14-.92-1.95-2.23-2.31-3.63-.37-1.4-.24-2.92.35-4.22.59-1.31 1.64-2.43 2.96-3.11 1.32-.67 2.87-.9 4.31-.72 1.45.18 2.84.75 3.96 1.68V7.22c-.01-2.4-.01-4.8-.02-7.2zm-5.23 14.26c-1.24-.07-2.42.39-3.34 1.21-.92.82-1.45 2.05-1.45 3.3.01 1.25.55 2.46 1.48 3.27.93.81 2.13 1.24 3.38 1.15 1.25-.09 2.42-.66 3.19-1.65.77-.99 1.13-2.28 1.01-3.52-.12-1.24-.76-2.37-1.78-3.09-.92-.64-2.04-.93-3.09-.67z"/></svg>
              </a>
            )}
          </div>

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
