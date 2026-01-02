
import React, { useState } from 'react';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { SupportMessage } from '../../types';

interface AdminSupportProps {
  messages: SupportMessage[];
}

export const AdminSupport: React.FC<AdminSupportProps> = ({ messages }) => {
  const [replies, setReplies] = useState<Record<string, string>>({});

  const handleReply = async (msgId: string) => {
    const text = replies[msgId];
    if (!text?.trim()) return;
    try {
      await updateDoc(doc(db, "support_messages", msgId), {
        reply: text,
        status: 'replied'
      });
      setReplies(p => {
        const n = {...p};
        delete n[msgId];
        return n;
      });
      alert("تم إرسال الرد بنجاح");
    } catch (e) {
      alert("خطأ في الرد");
    }
  };

  return (
    <div className="flex flex-col gap-6 text-right font-arabic">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <span className="text-sky-400 font-black text-xs px-3 py-1 bg-sky-500/10 rounded-full">{messages.filter(m => m.status === 'new').length} رسالة جديدة</span>
        <h3 className="text-white font-black text-sm uppercase tracking-widest">طلبات الدعم</h3>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-slate-700 py-10 font-black text-[10px] uppercase">لا توجد طلبات دعم حالياً</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 transition-all hover:border-sky-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full ${msg.status === 'new' ? 'bg-amber-500/20 text-amber-500' : 'bg-green-500/20 text-green-500'}`}>
                  {msg.status === 'new' ? 'غير مردود' : 'تم الرد'}
                </span>
                <div className="text-right">
                  <p className="text-white font-black text-[10px]">{msg.userName}</p>
                  <p className="text-slate-500 text-[8px]">{msg.userEmail}</p>
                </div>
              </div>
              
              <div className="bg-slate-950/50 p-3 rounded-xl mb-3 border border-white/5">
                <p className="text-slate-300 text-[11px] leading-relaxed">{msg.text}</p>
              </div>

              {msg.reply && (
                 <div className="bg-sky-500/10 p-3 rounded-xl mb-3 border-r-2 border-sky-500">
                    <p className="text-sky-400 text-[10px] font-black mb-1 italic">رد الإدارة:</p>
                    <p className="text-sky-200 text-[10px]">{msg.reply}</p>
                 </div>
              )}

              <div className="flex gap-2">
                <button 
                  onClick={() => handleReply(msg.id)}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-[9px] font-black uppercase transition-all"
                >
                  رد
                </button>
                <input 
                  type="text" 
                  placeholder="اكتب ردك هنا..." 
                  value={replies[msg.id] || ''}
                  onChange={(e) => setReplies(p => ({...p, [msg.id]: e.target.value}))}
                  className="flex-1 bg-slate-950/80 border border-white/5 rounded-lg px-3 text-[10px] text-white outline-none focus:border-sky-500/30 text-right"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
