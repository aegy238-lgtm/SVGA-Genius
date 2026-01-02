
import React, { useState } from 'react';
import { UserRecord } from '../../types';

interface AdminUsersProps {
  users: (UserRecord & { firestoreId: string })[];
  onUpdateStatus: (firestoreId: string, updates: Partial<UserRecord>) => void;
  onDelete: (firestoreId: string) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ users, onUpdateStatus, onDelete }) => {
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 border-b border-white/5">
         <input 
           type="text" placeholder="بحث بالبريد، الاسم أو الـ ID..." 
           value={search} onChange={(e) => setSearch(e.target.value)}
           className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-5 text-xs text-white outline-none focus:border-sky-500/30 transition-all text-right font-bold"
         />
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-right border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-white/[0.03] text-slate-400 text-[8px] font-black uppercase tracking-widest border-b border-white/5">
              <th className="px-6 py-4">بيانات المستخدم (Gmail & ID)</th>
              <th className="px-6 py-4 text-center">رصيد الألماس 💎</th>
              <th className="px-6 py-4 text-center">VIP يدوي</th>
              <th className="px-6 py-4 text-center">الحالة / التحكم</th>
              <th className="px-6 py-4 text-center">حذف</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((user) => (
              <tr key={user.firestoreId} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    <div className="text-right">
                      <div className="text-white font-black text-xs">{user.name || 'مستخدم'}</div>
                      <div className="text-slate-500 text-[9px] font-bold font-sans lowercase">{user.email}</div>
                      <div className="text-sky-500/50 text-[7px] font-mono mt-1 select-all">ID: {user.id}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base bg-slate-800 text-sky-400 border border-white/5">
                      {(user.name?.[0] || 'U').toUpperCase()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <input 
                      type="number" 
                      value={user.diamonds || 0}
                      onChange={(e) => onUpdateStatus(user.firestoreId, { diamonds: parseInt(e.target.value) || 0 })}
                      className="w-20 bg-slate-900 border border-white/5 rounded-lg py-1 px-2 text-center text-xs font-black text-sky-400 outline-none focus:border-sky-500/50"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => onUpdateStatus(user.firestoreId, { manualVIP: !user.manualVIP })}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${user.manualVIP ? 'bg-amber-500 text-white border-amber-400 shadow-glow-amber-sm' : 'bg-white/5 text-slate-600 border-white/10 hover:border-amber-500/30'}`}
                    title={user.manualVIP ? 'Revoke VIP' : 'Grant VIP'}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg>
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {user.status === 'pending' && (
                      <button onClick={() => onUpdateStatus(user.firestoreId, { isApproved: true, status: 'active' })} className="px-4 py-2 bg-green-500 text-white rounded-lg text-[8px] font-black uppercase">موافقة</button>
                    )}
                    {user.status === 'active' && user.role !== 'admin' && (
                      <button onClick={() => onUpdateStatus(user.firestoreId, { isApproved: false, status: 'banned' })} className="px-4 py-2 bg-red-500/10 text-red-500 border-red-500/20 rounded-lg text-[8px] font-black uppercase">حظر</button>
                    )}
                    {user.status === 'banned' && (
                      <button onClick={() => onUpdateStatus(user.firestoreId, { isApproved: true, status: 'active' })} className="px-4 py-2 bg-sky-500/10 text-sky-500 border-sky-500/20 rounded-lg text-[8px] font-black uppercase">تنشيط</button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => onDelete(user.firestoreId)} className="p-2 bg-white/5 text-slate-500 hover:text-red-500 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
