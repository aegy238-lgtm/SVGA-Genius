
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Uploader } from './components/Uploader';
import { Workspace } from './components/Workspace';
import { Login } from './components/Login';
import { AdminPanel } from './components/AdminPanel';
import { ImageCompressor } from './components/ImageCompressor';
import { AppState, FileMetadata, MaterialAsset, UserRecord } from './types';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';

declare var SVGA: any;

// القاموس العالمي للترجمة
export const translations = {
  ar: {
    appName: "SVGA Genius",
    tagline: "معالج الأنيميشن الكمي",
    dropFiles: "أفلت الملفات الآن",
    processingNow: "سأقوم بمعالجة الملفات فورا",
    masterControl: "لوحة التحكم الرئيسية",
    footerNote: "محرك التشفير الكمي نشط",
    uploaderTitle: "رفع ملفات SVGA",
    uploaderSub: "أسقط ملف الأنيميشن هنا للبدء في التعديل",
    batchTitle: "ضغط الصور الجماعي",
    batchSub: "معالجة أكثر من 400 صورة بضغطة واحدة",
    optActive: "تحسين الأداء نشط",
    autoQuality: "جودة تلقائية",
    zipPackage: "حزمة ZIP",
    loginTitle: "دخول المصممين",
    signupTitle: "طلب انضمام",
    loginSubtitle: "أدخل بياناتك للمتابعة",
    signupSubtitle: "تقديم طلب دخول للمنصة",
    fullName: "الاسم بالكامل",
    fullNamePlaceholder: "أدخل اسمك",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    loginBtn: "دخول المنصة",
    signupBtn: "إرسال الطلب",
    haveAccount: "لديك حساب؟",
    noAccount: "ليس لديك حساب؟",
    loginLink: "سجل دخولك",
    signupLink: "اطلب انضمام",
    regClosed: "⚠️ التسجيل متوقف حالياً",
    adminName: "المدير العام",
    platinumDesigner: "مصمم بلاتيني",
    securityActive: "تأمين النظام نشط",
    logout: "تسجيل الخروج",
    adminPanel: "لوحة الإدارة",
    usersTab: "الأعضاء",
    logsTab: "السجلات",
    closeProfile: "إغلاق الملف الشخصي",
    idMember: "معرف العضو",
    copied: "تم النسخ",
    balance: "الرصيد الماسي"
  },
  en: {
    appName: "SVGA Genius",
    tagline: "Quantum Animation Processor",
    dropFiles: "Drop Files Now",
    processingNow: "I will process files immediately",
    masterControl: "Master Control Panel",
    footerNote: "QUANTUM ENGINE ACTIVE",
    uploaderTitle: "Upload SVGA Files",
    uploaderSub: "Drop your animation file here to start editing",
    batchTitle: "Batch Image Compression",
    batchSub: "Process over 400+ images in one click",
    optActive: "Quantum Optimization Active",
    autoQuality: "Auto Quality",
    zipPackage: "ZIP Package",
    loginTitle: "Designers Login",
    signupTitle: "Join Request",
    loginSubtitle: "Enter your credentials to continue",
    signupSubtitle: "Submit an access request to the platform",
    fullName: "Full Name",
    fullNamePlaceholder: "Enter your name",
    email: "Email Address",
    password: "Password",
    loginBtn: "Enter Platform",
    signupBtn: "Submit Request",
    haveAccount: "Have an account?",
    noAccount: "Don't have an account?",
    loginLink: "Sign In",
    signupLink: "Join Now",
    regClosed: "⚠️ Registration is closed",
    adminName: "General Manager",
    platinumDesigner: "Platinum Designer",
    securityActive: "Quantum Security Active",
    logout: "Logout",
    adminPanel: "Admin Panel",
    usersTab: "Users",
    logsTab: "Logs",
    closeProfile: "Close Profile",
    idMember: "Member ID",
    copied: "Copied",
    balance: "Diamond Balance"
  }
};

const App: React.FC = () => {
  const [lang, setLang] = useState<'ar' | 'en'>(() => (localStorage.getItem('app_lang') as 'ar' | 'en') || 'ar');
  const [state, setState] = useState<AppState>(AppState.LOGIN);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(null);
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
  
  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    const savedUser = localStorage.getItem('svga_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setState(AppState.IDLE);
      } catch (e) {
        localStorage.removeItem('svga_user');
      }
    }

    const unsubBranding = onSnapshot(doc(db, "settings", "branding"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        document.title = `${data.name || 'SVGA Genius'} - ${data.subTitle || 'Quantum Suite'}`;
      }
    });

    return () => unsubBranding();
  }, []);

  const handleLogin = (user: UserRecord) => {
    setCurrentUser(user);
    localStorage.setItem('svga_user', JSON.stringify(user));
    setState(AppState.IDLE);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('svga_user');
    setShowAdminPanel(false);
    setState(AppState.LOGIN);
  };

  const handleBatchImages = (files: File[]) => {
    setBatchFiles(files);
    setState(AppState.IMAGE_COMPRESSION);
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file || !file.name.toLowerCase().endsWith('.svga')) return;
    const fileUrl = URL.createObjectURL(file);
    try {
      const parser = new SVGA.Parser();
      parser.load(fileUrl, (videoItem: any) => {
        URL.revokeObjectURL(fileUrl);
        const images = videoItem.images || {};
        const assets: MaterialAsset[] = Object.keys(images).map((key, index) => ({
          id: `asset-${index}`, type: 'image', name: key, size: 'Raw', dimensions: 'Dynamic'
        }));
        const meta: FileMetadata = {
          name: file.name, size: file.size, type: 'SVGA',
          dimensions: { width: videoItem.videoSize?.width || 0, height: videoItem.videoSize?.height || 0 },
          fps: videoItem.FPS || 30, frames: videoItem.frames || 0, assets, videoItem,
          fileUrl: ""
        };
        setFileMetadata(meta);
        setState(AppState.PROCESSING);
      }, () => {
        URL.revokeObjectURL(fileUrl);
        setState(AppState.IDLE);
      });
    } catch (err) {
      setState(AppState.IDLE);
    }
  }, []);

  const handleReset = useCallback(() => {
    setState(AppState.IDLE);
    setFileMetadata(null);
    setBatchFiles([]);
    setShowAdminPanel(false);
  }, []);

  if (state === AppState.LOGIN) {
    return (
      <div className={`flex flex-col lg:flex-row h-screen bg-[#020617] overflow-hidden ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`}>
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative p-20 border-r border-white/5">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-500/10 blur-[150px] rounded-full animate-pulse"></div>
          <div className="relative z-10 text-center">
            <div className="w-40 h-40 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-3xl mx-auto mb-10 transform -rotate-12 hover:rotate-0 transition-all duration-700 overflow-hidden ring-4 ring-white/5 p-4">
               <span className="text-white text-7xl font-black italic">S</span>
            </div>
            <h1 className="text-6xl font-black text-white tracking-tighter mb-4 uppercase">{t.appName}</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.5em] text-xs max-w-md mx-auto leading-relaxed">{t.tagline}</p>
          </div>
        </div>
        
        <div className="w-full lg:w-[480px] h-full shadow-3xl z-50 overflow-y-auto relative">
          <Login onLogin={handleLogin} globalLang={lang} onLangToggle={() => setLang(l => l === 'ar' ? 'en' : 'ar')} />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden relative ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`}>
      <Header 
        onLogoClick={handleReset} 
        isAdmin={currentUser?.role === 'admin'} 
        userName={currentUser?.name}
        onAdminToggle={() => setShowAdminPanel(!showAdminPanel)}
        onLogout={handleLogout}
        isAdminOpen={showAdminPanel}
        lang={lang}
        onLangToggle={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
      />
      
      {isDraggingGlobal && (
        <div className="fixed inset-0 z-[1000] bg-sky-500/20 backdrop-blur-md border-[10px] border-dashed border-sky-500 flex items-center justify-center animate-in fade-in duration-300">
          <div className="text-center p-10 bg-slate-900/90 rounded-[4rem] shadow-glow-sky border border-sky-500/30">
             <div className="w-24 h-24 bg-sky-500 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
             </div>
             <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">{t.dropFiles}</h2>
             <p className="text-sky-400 font-black text-xs uppercase tracking-[0.4em]">{t.processingNow}</p>
          </div>
        </div>
      )}

      <div className="flex pt-20 h-screen overflow-hidden relative">
        <main className={`flex-1 overflow-y-auto transition-all duration-700 custom-scrollbar ${showAdminPanel ? (lang === 'ar' ? 'lg:mr-[450px]' : 'lg:ml-[450px]') + ' opacity-20 lg:opacity-40 blur-sm' : ''}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
            {state === AppState.IDLE && (
              <div className="py-10 sm:py-20 animate-in fade-in zoom-in duration-700">
                <Uploader onUpload={handleFileUpload} onBatchImages={handleBatchImages} isUploading={false} lang={lang} />
              </div>
            )}

            {state === AppState.PROCESSING && fileMetadata && (
              <Workspace metadata={fileMetadata} onCancel={handleReset} lang={lang} />
            )}

            {state === AppState.IMAGE_COMPRESSION && (
              <ImageCompressor files={batchFiles} onCancel={handleReset} lang={lang} />
            )}
          </div>
          <footer className="border-t border-white/5 py-8 text-center mt-10 sm:mt-20">
            <p className="text-[8px] sm:text-[9px] text-slate-700 font-black uppercase tracking-[0.4em]">{t.appName} • {t.footerNote}</p>
          </footer>
        </main>

        <aside 
          className={`fixed top-0 lg:top-20 ${lang === 'ar' ? 'right-0' : 'left-0'} bottom-0 w-full lg:w-[450px] bg-[#020617]/95 lg:bg-slate-900/90 backdrop-blur-3xl border-x border-white/10 z-[200] lg:z-[110] transition-transform duration-500 shadow-3xl overflow-y-auto ${showAdminPanel ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')}`}
        >
          <div className="p-6 sm:p-8 pt-24 lg:pt-8">
            <div className={`flex justify-between items-center mb-8 sm:mb-10 ${lang === 'en' ? 'flex-row-reverse' : ''}`}>
              <button 
                 onClick={() => setShowAdminPanel(false)}
                 className="w-12 h-12 lg:w-10 lg:h-10 bg-white/5 hover:bg-red-500/20 text-white rounded-2xl lg:rounded-xl flex items-center justify-center transition-all group border border-white/10"
               >
                 <svg className="w-6 h-6 lg:w-5 lg:h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
               <h3 className="text-white font-black uppercase text-xs sm:text-sm tracking-widest">{t.masterControl}</h3>
            </div>
            <AdminPanel onLogout={handleLogout} lang={lang} />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default App;
