
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  setDoc,
  serverTimestamp,
  limit,
  onSnapshot,
  doc,
  orderBy
} from 'firebase/firestore';
import { UserRecord } from '../types';

const MASTER_ADMIN_EMAIL = "manager@genius.com";
const MASTER_ADMIN_PASSWORD = "150150";

interface LoginProps {
  onLogin: (user: UserRecord) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isRegOpen, setIsRegOpen] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);

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
      
      if (querySnapshot.empty) {
        return "10001";
      } else {
        const lastUser = querySnapshot.docs[0].data();
        const lastId = parseInt(lastUser.id) || 10000;
        return (lastId + 1).toString();
      }
    } catch (e) {
      console.error("Error generating ID", e);
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
        setError("هذا الحساب غير موجود، يرجى إنشاء حساب أولاً.");
        return null;
      }

      const allUsersSnapshot = await getDocs(query(collection(db, "users"), limit(1)));
      const isFirstUser = allUsersSnapshot.empty || isMaster;
      const shouldApproveNow = isFirstUser || autoApprove;
      const nextId = await getNextSequentialId();

      const newUser = {
        id: nextId, 
        name: isMaster ? "المدير العام" : (name || userEmail.split('@')[0]),
        email: userEmail.toLowerCase(),
        password: password || MASTER_ADMIN_PASSWORD, 
        role: isFirstUser ? 'admin' : 'user',
        isApproved: shouldApproveNow,
        status: shouldApproveNow ? 'active' : 'pending',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        diamonds: isFirstUser ? 999999 : 0
      };
      
      // نستخدم nextId كمعرف للوثيقة لسهولة التحكم
      await setDoc(doc(db, "users", nextId), newUser);
      return { ...newUser, docId: nextId } as any;
    } else {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as UserRecord;
      
      if (isMaster && userData.role !== 'admin') {
         await updateDoc(userDoc.ref, { 
           role: 'admin', 
           isApproved: true, 
           status: 'active',
           password: MASTER_ADMIN_PASSWORD
         });
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
      setError("عذراً، هذا الحساب محظور من قبل الإدارة.");
      return;
    }
    
    if (!user.isApproved && user.role !== 'admin') {
      if (fromSignup) {
        setSuccessMessage("تم إرسال طلب الانضمام بنجاح! حسابك بانتظار موافقة المسؤول.");
        setIsSignUp(false); 
      } else {
        setError("عذراً، حسابك بانتظار موافقة المسؤول.");
      }
      return;
    }
    
    onLogin(user);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const user = await fetchAndCheckUser(email);
      if (user) {
        if (!isSignUp && user.password !== password && email.toLowerCase() !== MASTER_ADMIN_EMAIL) {
          setError("كلمة المرور غير صحيحة.");
        } else {
          handleAuthResult(user, isSignUp);
        }
      }
    } catch (err) {
      setError("حدث خطأ في النظام.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-900/60 backdrop-blur-3xl lg:border-l border-white/10 flex flex-col p-6 sm:p-12 lg:p-14 relative overflow-y-auto font-arabic">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-indigo-600 shadow-glow-sky"></div>
      
      <div className="lg:hidden flex items-center justify-center gap-3 mb-8 pt-4">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-xl italic">S</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tighter">SVGA <span className="text-sky-400">GENIUS</span></h1>
      </div>

      <div className="flex-1 flex flex-col justify-center text-right max-w-sm mx-auto w-full">
        <div className="mb-6 sm:mb-10">
          {!isRegOpen && isSignUp && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-[9px] font-black text-center animate-pulse">
              ⚠️ التسجيل متوقف حالياً
            </div>
          )}
          <div className="inline-block px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-400 text-[8px] font-black uppercase tracking-widest mb-3">
            Diamond System v4.5
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 tracking-tighter leading-tight">
            {isSignUp ? 'طلب انضمام' : 'دخول المصممين'}
          </h2>
          <p className="text-slate-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest leading-relaxed">
            {isSignUp ? 'تقديم طلب دخول للمنصة' : 'أدخل بياناتك للمتابعة'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold text-center leading-loose">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-[10px] font-bold text-center leading-loose">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest block">الاسم بالكامل</label>
              <input 
                type="text" required disabled={isLoading || (!isRegOpen && isSignUp)} value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 px-5 text-white text-sm outline-none focus:border-sky-500/30 transition-all text-right disabled:opacity-50"
                placeholder="أدخل اسمك"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest block">البريد الإلكتروني</label>
            <input 
              type="email" required disabled={isLoading || (!isRegOpen && isSignUp)} value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 px-5 text-white text-sm outline-none focus:border-sky-500/30 transition-all text-left font-sans disabled:opacity-50"
              placeholder="example@mail.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest block">كلمة المرور</label>
            <input 
              type="password" required disabled={isLoading || (!isRegOpen && isSignUp)} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3 px-5 text-white text-sm outline-none focus:border-sky-500/30 transition-all text-left font-sans disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" disabled={isLoading || (!isRegOpen && isSignUp)}
            className={`w-full py-4 text-white font-black rounded-xl transition-all text-[11px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${(!isRegOpen && isSignUp) ? 'bg-slate-800 cursor-not-allowed' : 'bg-gradient-to-r from-sky-500 to-indigo-600 active:scale-95 shadow-lg shadow-sky-500/10'}`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (isSignUp ? 'إرسال الطلب' : 'دخول المنصة')}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/5 text-center">
          <button 
              type="button" onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccessMessage(null); }}
              className="text-sky-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
          >
              {isSignUp ? (
                <>لديك حساب؟ <span className="underline decoration-2 underline-offset-4">سجل دخولك</span></>
              ) : (
                <>ليس لديك حساب؟ <span className="underline decoration-2 underline-offset-4">اطلب انضمام</span></>
              )}
          </button>
        </div>
      </div>

      <div className="mt-auto text-center pb-2">
        <p className="text-[7px] text-slate-700 font-black uppercase tracking-[0.4em]">Quantum Security Active</p>
      </div>
    </div>
  );
};
