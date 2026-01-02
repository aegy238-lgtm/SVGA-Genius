
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  setDoc,
  serverTimestamp,
  limit,
  onSnapshot,
  doc,
  orderBy
} from 'firebase/firestore';
import { UserRecord } from '../types';
import { translations } from '../App';

const MASTER_ADMIN_EMAIL = "manager@genius.com";
const MASTER_ADMIN_PASSWORD = "150150";

interface LoginProps {
  onLogin: (user: UserRecord) => void;
  globalLang: 'ar' | 'en';
  onLangToggle: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, globalLang, onLangToggle }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isRegOpen, setIsRegOpen] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [branding, setBranding] = useState({ name: 'SVGA Genius', logo: null as string | null, subTitle: 'Quantum Suite' });

  const t = translations[globalLang];

  useEffect(() => {
    const unsubReg = onSnapshot(doc(db, "settings", "registration"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsRegOpen(data.isOpen !== false);
        setAutoApprove(data.autoApprove === true);
      }
    });

    const unsubBranding = onSnapshot(doc(db, "settings", "branding"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setBranding({ 
          name: data.name || 'SVGA Genius', 
          logo: data.logo || null,
          subTitle: data.subTitle || 'Quantum Suite'
        });
      }
    });

    return () => { unsubReg(); unsubBranding(); };
  }, []);

  const getNextSequentialId = async () => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("createdAt", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return "10001";
      const lastUser = querySnapshot.docs[0].data();
      return (parseInt(lastUser.id || "10000") + 1).toString();
    } catch (e) {
      return Math.floor(10001 + Math.random() * 9000).toString();
    }
  };

  const fetchAndCheckUser = async (userEmail: string) : Promise<UserRecord | null> => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", userEmail.toLowerCase()), limit(1));
    const querySnapshot = await getDocs(q);
    const isMaster = userEmail.toLowerCase() === MASTER_ADMIN_EMAIL;

    if (querySnapshot.empty) {
      if (!isSignUp && !isMaster) {
        setError(globalLang === 'ar' ? "هذا الحساب غير موجود" : "Account not found");
        return null;
      }
      const nextId = await getNextSequentialId();
      const newUser = {
        id: nextId, 
        name: isMaster ? t.adminName : (name || userEmail.split('@')[0]),
        email: userEmail.toLowerCase(),
        password: password || MASTER_ADMIN_PASSWORD, 
        role: isMaster ? 'admin' : 'user',
        isApproved: isMaster || autoApprove,
        status: (isMaster || autoApprove) ? 'active' : 'pending',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        diamonds: isMaster ? 999999 : 0
      };
      await setDoc(doc(db, "users", nextId), newUser);
      return { ...newUser } as any;
    } else {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as UserRecord;
      await updateDoc(userDoc.ref, { lastLogin: serverTimestamp() });
      return { ...userData } as any;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const user = await fetchAndCheckUser(email);
      if (user) {
        if (!isSignUp && user.password !== password && email.toLowerCase() !== MASTER_ADMIN_EMAIL) {
          setError(globalLang === 'ar' ? "كلمة المرور خاطئة" : "Incorrect password");
        } else {
          if (user.status === 'banned') {
            setError(globalLang === 'ar' ? "هذا الحساب محظور" : "Account banned");
          } else if (!user.isApproved && user.role !== 'admin') {
            if (isSignUp) {
              setSuccessMessage(globalLang === 'ar' ? "تم إرسال الطلب بنجاح" : "Request sent successfully");
              setIsSignUp(false); 
            } else {
              setError(globalLang === 'ar' ? "بانتظار موافقة الإدارة" : "Pending approval");
            }
          } else {
            onLogin(user);
          }
        }
      }
    } catch (err) {
      setError(globalLang === 'ar' ? "خطأ في النظام" : "System Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-full bg-[#020617] lg:bg-slate-900/60 backdrop-blur-3xl lg:border-l border-white/10 flex flex-col p-6 sm:p-12 lg:p-14 relative overflow-y-auto ${globalLang === 'ar' ? 'font-arabic' : 'font-sans'}`} dir={globalLang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top Banner Accent */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 shadow-glow-sky"></div>
      
      {/* Mobile-Only Header Branding */}
      <div className="lg:hidden flex flex-col items-center mb-10 pt-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-3xl flex items-center justify-center shadow-glow-sky border-4 border-slate-900 ring-2 ring-white/10 overflow-hidden mb-4">
          {branding.logo ? <img src={branding.logo} className="w-full h-full object-contain p-2" alt="Logo" /> : <span className="text-white text-4xl font-black italic">{branding.name?.[0]?.toUpperCase()}</span>}
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase">{branding.name}</h1>
        <p className="text-sky-500 font-bold uppercase tracking-[0.3em] text-[8px] mt-1">{branding.subTitle}</p>
      </div>

      <button 
        onClick={onLangToggle}
        className={`absolute top-6 ${globalLang === 'ar' ? 'left-6' : 'right-6'} lg:${globalLang === 'ar' ? 'left-10' : 'right-10'} w-11 h-11 bg-white/5 hover:bg-sky-500/20 border border-white/10 rounded-2xl flex items-center justify-center text-sky-400 transition-all active:scale-95 z-50 group shadow-lg`}
      >
        <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-8">
        <div className={`mb-8 sm:mb-10 ${globalLang === 'ar' ? 'text-right' : 'text-left'}`}>
          {!isRegOpen && isSignUp && <div className="mb-4 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 text-[9px] font-black text-center animate-pulse">{t.regClosed}</div>}
          <div className="inline-block px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 text-[8px] font-black uppercase tracking-widest mb-4">Secure Access v4.6</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tighter leading-tight">{isSignUp ? t.signupTitle : t.loginTitle}</h2>
          <p className="text-slate-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest leading-relaxed">{isSignUp ? t.signupSubtitle : t.loginSubtitle}</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[11px] font-bold text-center animate-in head-shake duration-300">{error}</div>}
        {successMessage && <div className="mb-6 p-5 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-[11px] font-bold text-center">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignUp && (
            <div className="space-y-2">
              <label className={`text-[9px] font-black text-slate-500 uppercase tracking-widest block px-2 ${globalLang === 'ar' ? 'text-right' : 'text-left'}`}>{t.fullName}</label>
              <input type="text" required disabled={isLoading || (!isRegOpen && isSignUp)} value={name} onChange={(e) => setName(e.target.value)} className={`w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-sky-500/50 transition-all ${globalLang === 'ar' ? 'text-right' : 'text-left'}`} placeholder={t.fullNamePlaceholder} />
            </div>
          )}
          <div className="space-y-2">
            <label className={`text-[9px] font-black text-slate-500 uppercase tracking-widest block px-2 ${globalLang === 'ar' ? 'text-right' : 'text-left'}`}>{t.email}</label>
            <input type="email" required disabled={isLoading} value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-sky-500/50 transition-all font-sans ${globalLang === 'ar' ? 'text-right' : 'text-left'}`} placeholder="designer@mail.com" />
          </div>
          <div className="space-y-2">
            <label className={`text-[9px] font-black text-slate-500 uppercase tracking-widest block px-2 ${globalLang === 'ar' ? 'text-right' : 'text-left'}`}>{t.password}</label>
            <input type="password" required disabled={isLoading} value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-sky-500/50 transition-all font-sans ${globalLang === 'ar' ? 'text-right' : 'text-left'}`} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={isLoading || (!isRegOpen && isSignUp)} className="w-full py-5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl hover:shadow-glow-sky active:scale-[0.98] transition-all">
            {isLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : (isSignUp ? t.signupBtn : t.loginBtn)}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-sky-400 hover:text-sky-300 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-colors">
            {isSignUp ? <>{t.haveAccount} <span className="underline decoration-2 underline-offset-4">{t.loginLink}</span></> : <>{t.noAccount} <span className="underline decoration-2 underline-offset-4">{t.signupLink}</span></>}
          </button>
        </div>
      </div>
      <div className="mt-auto text-center pb-4"><p className="text-[7.5px] text-slate-700 font-black uppercase tracking-[0.4em]">{t.securityActive}</p></div>
    </div>
  );
};
