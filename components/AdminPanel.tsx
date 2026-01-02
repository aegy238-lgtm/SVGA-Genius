
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, setDoc } from 'firebase/firestore';
import { UserRecord, ProcessLog } from '../types';
import { AdminSettings } from './admin/AdminSettings';
import { AdminUsers } from './admin/AdminUsers';
import { AdminLogs } from './admin/AdminLogs';

interface AdminPanelProps {
  onLogout?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [users, setUsers] = useState<(UserRecord & { firestoreId: string })[]>([]);
  const [logs, setLogs] = useState<ProcessLog[]>([]);
  const [autoApprove, setAutoApprove] = useState(false);

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
    // نستخدم firestoreId للتحديث لضمان الوصول للوثيقة الصحيحة
    await updateDoc(doc(db, "users", firestoreId), updates);
  };

  const deleteUser = async (firestoreId: string) => {
    if (confirm("حذف المستخدم نهائياً؟")) {
      await deleteDoc(doc(db, "users", firestoreId));
    }
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return "...";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-700 pb-10">
      <div className="flex flex-col items-center gap-6 mb-8">
        <div className="text-right w-full">
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase mb-1">لوحة الإدارة</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Quantum Master Console</p>
        </div>
        
        <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-2xl border border-white/5 w-full font-arabic">
          <button onClick={() => setActiveTab('users')} className={`px-2 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'users' ? 'bg-sky-500 text-white shadow-glow-sky-sm' : 'text-slate-500 hover:text-white'}`}>الأعضاء</button>
          <button onClick={() => setActiveTab('logs')} className={`px-2 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'logs' ? 'bg-sky-500 text-white shadow-glow-sky-sm' : 'text-slate-500 hover:text-white'}`}>السجلات</button>
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
      </div>

      <div className="pt-6 border-t border-white/5 mt-8">
        <button onClick={onLogout} className="w-full py-5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-3xl transition-all duration-300 flex items-center justify-center gap-3 font-black text-xs uppercase shadow-lg active:scale-95">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          تسجيل الخروج
        </button>
      </div>
      
      <style>{`
        .shadow-glow-sky-sm { box-shadow: 0 0 15px rgba(14, 165, 233, 0.4); }
      `}</style>
    </div>
  );
};
