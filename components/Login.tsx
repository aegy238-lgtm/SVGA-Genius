
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

  const t = translations[globalLang];

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "registration"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsRegOpen(data.isOpen !== false);
        setAutoApprove(data.autoApprove === true);
      }
    });
    return () => unsub();
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
      const allUsersSnapshot = await getDocs(query(collection(db, "users"), limit(1)));
      const isFirstUser = allUsersSnapshot.empty || isMaster;
      const shouldApproveNow = isFirstUser || autoApprove;
      const nextId = await getNextSequentialId();
      const newUser = {
        id: nextId, 
        name: isMaster ? t.adminName : (name || userEmail.split('@')[0]),
        email: userEmail.toLowerCase(),
        password: password || MASTER_ADMIN_PASSWORD, 
        role: isFirstUser ? 'admin' : 'user',
        isApproved: shouldApproveNow,
        status: shouldApproveNow ? 'active' : 'pending',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        diamonds: isFirstUser ? 999999 : 0
      };
      await setDoc(doc(db, "users", nextId), newUser);
      return { ...newUser, docId: nextId } as any;
    } else {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as UserRecord;
      if (isMaster && userData.role !== 'admin') {
         await updateDoc(userDoc.ref, { role: 'admin', isApproved: true, status: 'active', password: MASTER_ADMIN_PASSWORD });
         userData.role = 'admin';
         userData.isApproved = true;
         userData.status = 'active';
      }
      await updateDoc(userDoc.ref, { lastLogin: serverTimestamp() });
      return { ...userData, docId: userDoc.id } as any;
    }
  };

  const handleAuthResult = (user: UserRecord, fromSignup: boolean = false) => {
    if (user.status === 'banned') {
      setError(globalLang === 'ar' ? "هذا الحساب محظور" : "Account banned");
      return;
    }
    if (!user.isApproved && user.role !== 'admin') {
      if (fromSignup) {
        setSuccessMessage(globalLang === 'ar' ? "تم إرسال الطلب بنجاح" : "Request sent successfully");
        setIsSignUp(false); 
      } else {
        setError(globalLang === 'ar' ? "بانتظار موافقة الإدارة" : "Pending approval");
      }
      return;
    }
    onLogin(user);
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
          handleAuthResult(user, isSignUp);
        }
      }
    } catch (err) {
      setError(globalLang === 'ar' ? "خطأ في النظام" : "System Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-full bg-slate-900/60 backdrop-blur-3xl lg:border-l border-white/10 flex flex-col p-6 sm:p-12 lg:p-14 relative overflow-y-auto ${globalLang === 'ar' ? 'font-arabic' : 'font-sans'}`} dir={globalLang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-indigo-600 shadow-glow-sky"></div>
      
      <button 
        onClick={onLangToggle}
        className={`absolute top-6 ${globalLang === 'ar' ? 'left-6' : 'right-6'} lg:${globalLang === 'ar' ? 'left-10' : 'right-10'} w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-sky-400 transition-all active:scale-95 z-50 group`}
      >
        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className={`mb-6 sm:mb-10 ${globalLang === 'ar' ? 'text-right' : 'text-left'}`}>
          {!isRegOpen && isSignUp && <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-[9px] font-black text-center animate-pulse">{t.regClosed}</div>}
          <div className="inline-block px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 text-[8px] font-black uppercase tracking-widest mb-3">Diamond v4.5</div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 tracking-tighter leading-tight">{isSignUp ? t.signupTitle : t.loginTitle}</h2>
          <p className="text-slate-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest leading-relaxed">{isSignUp ? t.signupSubtitle : t.loginSubtitle}</p>
        </div>

        {error && <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold text-center">{error}</div>}
        {successMessage && <div className="mb-5 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-[10px] font-bold text-center">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className={`text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest block ${globalLang === 'ar' ? 'text-right' : 'text-left'}`}>{t.fullName}</label>
              <input type="text" required disabled={isLoading || (!isRegOpen && isSignUp)} value={name} onChange={(e) => setName(e.target.value)} className={`w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 px-5 text-white text-sm outline-none focus:border-sky-500/30 ${globalLang === 'ar' ? 'text-right' : 'text-left'}`} placeholder={t.fullNamePlaceholder} />
            </div>
          )}
          <div className="space-y-1.5">
            <label className={`text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest block ${globalLang === 'ar' ? 'text-right' : 'text-left'}`}>{t.email}</label>
            <input type="email" required disabled={isLoading} value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 px-5 text-white text-sm outline-none focus:border-sky-500/30 font-sans ${globalLang === 'ar' ? 'text-right' : 'text-left'}`} placeholder="example@mail.com" />
          </div>
          <div className="space-y-1.5">
            <label className={`text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest block ${globalLang === 'ar' ? 'text-right' : 'text-left'}`}>{t.password}</label>
            <input type="password" required disabled={isLoading} value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 px-5 text-white text-sm outline-none focus:border-sky-500/30 font-sans ${globalLang === 'ar' ? 'text-right' : 'text-left'}`} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={isLoading || (!isRegOpen && isSignUp)} className="w-full py-4 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black rounded-xl text-[11px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg">{isLoading ? '...' : (isSignUp ? t.signupBtn : t.loginBtn)}</button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/5 text-center">
          <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-sky-400 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
            {isSignUp ? <>{t.haveAccount} <span className="underline">{t.loginLink}</span></> : <>{t.noAccount} <span className="underline">{t.signupLink}</span></>}
          </button>
        </div>
      </div>
      <div className="mt-auto text-center pb-2"><p className="text-[7px] text-slate-700 font-black uppercase tracking-[0.4em]">{t.securityActive}</p></div>
    </div>
  );
};
