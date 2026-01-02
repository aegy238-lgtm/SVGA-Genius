
import React from 'react';
import { ProcessLog } from '../../types';

interface AdminLogsProps {
  logs: ProcessLog[];
  formatTimestamp: (ts: any) => string;
}

export const AdminLogs: React.FC<AdminLogsProps> = ({ logs, formatTimestamp }) => {
  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-right border-collapse min-w-[320px]">
        <thead>
          <tr className="bg-white/[0.03] text-slate-400 text-[8px] font-black uppercase tracking-widest border-b border-white/5">
            <th className="px-4 sm:px-8 py-4 sm:py-6">الملف</th>
            <th className="px-4 sm:px-8 py-4 sm:py-6 text-center">التاريخ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {logs.length === 0 ? (
            <tr><td colSpan={2} className="py-20 text-center text-slate-700 text-[8px] font-black uppercase tracking-[0.4em]">لا توجد سجلات حالياً</td></tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/[0.02]">
                <td className="px-4 sm:px-8 py-4 sm:py-6">
                  <div className="text-right">
                    <div className="text-white font-bold text-xs truncate max-w-[150px]">{log.fileName || 'ملف'}</div>
                    <div className="text-slate-600 text-[8px] font-black uppercase tracking-widest opacity-60">{log.userName}</div>
                  </div>
                </td>
                <td className="px-4 sm:px-8 py-4 sm:py-6 text-center">
                  <div className="text-slate-500 text-[8px] font-mono bg-white/5 px-3 py-1 rounded-lg inline-block">{formatTimestamp(log.timestamp)}</div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
