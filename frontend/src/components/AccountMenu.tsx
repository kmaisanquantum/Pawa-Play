import React from 'react';
import { useApp } from '../context/AppContext';

export const AccountMenu: React.FC = () => {
  const { regulatoryMode } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Account Overview Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-sky-600/20 border border-sky-500/30 text-sky-400 flex items-center justify-center text-3xl font-bold">
          👤
        </div>
        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl font-bold text-white">Demo Customer Account</h1>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
              KYC VERIFIED (DEMO)
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400">Mobile: +675 7000 0000 • User ID: 00000000-0000-0000-0000-000000000001</p>
          <div className="text-[11px] text-amber-300 pt-1">
            ⚠️ Regulatory Mode: {regulatoryMode}. Account & KYC data are simulated for sandbox evaluation.
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <span>📋</span> Profile Details (Simulated)
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">First Name:</span>
              <span className="font-semibold text-slate-200">Demo</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Last Name:</span>
              <span className="font-semibold text-slate-200">User</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Date of Birth:</span>
              <span className="font-semibold text-slate-200">1995-01-01</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Jurisdiction:</span>
              <span className="font-semibold text-slate-200">Papua New Guinea (PG)</span>
            </div>
          </div>
        </div>

        {/* Security & Verification */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <span>🔐</span> Security & PIN (Simulated)
          </h3>
          <div className="space-y-3 text-xs">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">4-Digit Security PIN</div>
                <div className="text-[11px] text-slate-400">Used for fast login and withdrawal authorization</div>
              </div>
              <button
                type="button"
                onClick={() => alert('Demo PIN Change')}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs font-semibold rounded-lg text-white"
              >
                Change
              </button>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Two-Factor OTP</div>
                <div className="text-[11px] text-slate-400">SMS OTP protection enabled for transactions</div>
              </div>
              <span className="text-emerald-400 font-bold">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
