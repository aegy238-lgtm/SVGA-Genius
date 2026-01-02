
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, setDoc } from 'firebase/firestore';
import { UserRecord, ProcessLog } from '../types';
import { AdminSettings } from './admin/AdminSettings';
import { AdminUsers } from './admin/AdminUsers';
import { AdminLogs } from './admin/AdminLogs';
import { AdminEconomy } from './admin/AdminEconomy';
import { translations } from '../App';

interface AdminPanelProps {
  onLogout?: () => void;
  lang: 'ar' | 'en';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, lang }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'economy' | 'settings'>('users');
  const [users, setUsers] = useState<(UserRecord & { firestoreId: string })[]>([]);
  const [logs, setLogs] = useState<ProcessLog[]>([]);
  const [autoApprove, setAutoApprove] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    const unsubReg = onSnapshot(doc(db, "settings", "registration"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAutoApprove(data.autoApprove === true);
      }
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ 
        ...(doc.data() as UserRecord), 
        firestoreId: doc.id 
      }));
      setUsers(usersData);
    });

    const logsQuery = query(collection(db, "process_logs"), orderBy("timestamp", "desc"));
    const unsubLogs = onSnapshot(logsQuery, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProcessLog[];
      setLogs(logsData);
    });

    return () => { unsubReg(); unsubUsers(); unsubLogs(); };
  }, []);

  const toggleAutoApprove = async () => {
    const regRef = doc(db, "settings", "registration");
    await setDoc(regRef, { autoApprove: !autoApprove }, { merge: true });
  };

  const updateUserStatus = async (firestoreId: string, updates: Partial<UserRecord>) => {
    await updateDoc(doc(db, "users", firestoreId), updates);
  };

  const deleteUser = async (firestoreId: string) => {
    if (confirm(lang === 'ar' ? "حذف المستخدم نهائياً؟" : "Delete user permanently?")) {
      await deleteDoc(doc(db, "users", firestoreId));
    }
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return "...";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className={`animate-in fade-in slide-in-from-top-4 duration-700 pb-10 ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`}>
      <div className="flex flex-col items-center gap-6 mb-8">
        <div className={`w-full ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase mb-1">{t.adminPanel}</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Quantum Master Console</p>
        </div>
        
        <div className="grid grid-cols-4 bg-slate-950 p-1 rounded-2xl border border-white/5 w-full">
          <button onClick={() => setActiveTab('users')} className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${activeTab === 'users' ? 'bg-sky-500 text-white' : 'text-slate-500 hover:text-white'}`}>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </button>
          <button onClick={() => setActiveTab('economy')} className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${activeTab === 'economy' ? 'bg-amber-500 text-white shadow-glow-amber-sm' : 'text-slate-500 hover:text-white'}`}>
             <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 10.5L12 22L19.5 10.5L12 2z"/></svg>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${activeTab === 'settings' ? 'bg-sky-500 text-white' : 'text-slate-500 hover:text-white'}`}>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37-1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31-2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
          <button onClick={() => setActiveTab('logs')} className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${activeTab === 'logs' ? 'bg-sky-500 text-white' : 'text-slate-500 hover:text-white'}`}>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {activeTab === 'users' && (
          <>
            <AdminSettings autoApprove={autoApprove} onToggleApproval={toggleAutoApprove} />
            <div className="bg-slate-950/50 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-md">
               <AdminUsers users={users} onUpdateStatus={updateUserStatus} onDelete={deleteUser} />
            </div>
          </>
        )}

        {activeTab === 'logs' && (
          <div className="bg-slate-950/50 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-md">
             <AdminLogs logs={logs} formatTimestamp={formatTimestamp} />
          </div>
        )}

        {activeTab === 'economy' && (
          <AdminEconomy lang={lang} />
        )}

        {activeTab === 'settings' && (
           <div className="space-y-8">
             <AdminSettings autoApprove={autoApprove} onToggleApproval={toggleAutoApprove} />
           </div>
        )}
      </div>

      <div className="pt-6 border-t border-white/5 mt-8">
        <button onClick={onLogout} className="w-full py-5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-3xl transition-all duration-300 flex items-center justify-center gap-3 font-black text-xs uppercase shadow-lg active:scale-95">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          {t.logout}
        </button>
      </div>
      
      <style>{`
        .shadow-glow-sky-sm { box-shadow: 0 0 15px rgba(14, 165, 233, 0.4); }
        .shadow-glow-amber-sm { box-shadow: 0 0 15px rgba(245, 158, 11, 0.4); }
      `}</style>
    </div>
  );
};
