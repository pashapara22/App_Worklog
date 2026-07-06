import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Check, X, Clock, ShieldAlert, UserPlus, ShieldCheck } from 'lucide-react';

export default function AccessRequests() {
  const { registeredUsers, approveUser, rejectUser } = useAuth();
  
  // Filter for pending users (instructors only, admins are approved in Overview)
  const pendingUsers = registeredUsers.filter(u => u.status === 'pending' && u.role === 'instructor');
  // Optional: show recently approved or rejected for history
  const historyUsers = registeredUsers.filter(u => u.status === 'approved' || u.status === 'rejected').filter(u => u.role !== 'admin');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-primary-600" />
          Access Requests
        </h1>
        <p className="text-sm text-text-secondary mt-1">Review and manage instructor sign-up requests</p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200 bg-white flex items-center justify-between">
          <h2 className="font-bold text-text-primary flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-500" />
            Pending Approvals
          </h2>
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
            {pendingUsers.length} Pending
          </span>
        </div>
        
        {pendingUsers.length === 0 ? (
          <div className="p-12 text-center bg-slate-50/50">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-base font-bold text-text-primary">All Caught Up!</h3>
            <p className="text-sm text-text-secondary mt-1">There are no pending access requests at this time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Instructor</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {pendingUsers.map(user => (
                  <tr key={user.employeeId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-bold text-text-primary">{user.fullName}</div>
                        <div className="text-xs text-text-secondary mt-0.5">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {user.employeeId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-600">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => rejectUser(user.employeeId)}
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Reject Request"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => approveUser(user.employeeId)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-lg text-sm font-semibold transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* History (Optional, just to see what happened) */}
      {historyUsers.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Recent Activity</h3>
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-200">
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-100 bg-white">
                {historyUsers.slice().reverse().slice(0, 5).map(user => (
                  <tr key={user.employeeId} className="bg-slate-50/30">
                    <td className="px-6 py-3">
                      <div className="text-sm font-semibold text-text-primary">{user.fullName}</div>
                      <div className="text-xs text-text-secondary font-mono">{user.employeeId}</div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {user.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <Check className="w-3.5 h-3.5" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                          <X className="w-3.5 h-3.5" /> Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
