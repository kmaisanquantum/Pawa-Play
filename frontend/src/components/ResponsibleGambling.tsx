import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ResponsibleGambling: React.FC = () => {
  const { currency, showToast } = useApp();
  const [dailyLimit, setDailyLimit] = useState<string>('100');
  const [weeklyLimit, setWeeklyLimit] = useState<string>('500');
  const [timeoutDays, setTimeoutDays] = useState<string>('7');

  const handleSaveLimits = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Responsible Gambling limits saved: Daily ${currency} ${dailyLimit}, Weekly ${currency} ${weeklyLimit}`, 'success');
  };

  const handleSelfExclude = () => {
    if (confirm('Are you sure you want to request self-exclusion? This is a simulated demo action.')) {
      showToast('Simulated Self-Exclusion request activated.', 'warning');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🛡️</span>
          <h1 className="text-2xl font-black text-white">Responsible Gambling Controls</h1>
        </div>
        <p className="text-xs text-emerald-200/90 leading-relaxed max-w-2xl">
          PawaPlay is committed to providing a safe, transparent, and entertaining environment.
          Manage your deposit limits, wagering thresholds, or take a temporary timeout anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deposit & Bet Limits Form */}
        <form onSubmit={handleSaveLimits} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <span>⚙️</span> Set Deposit & Wagering Limits
          </h3>

          <div className="space-y-3">
            <div>
              <label htmlFor="daily-deposit-limit" className="block text-xs font-semibold text-slate-300 mb-1">
                Daily Deposit Limit ({currency})
              </label>
              <input
                id="daily-deposit-limit"
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-sm font-bold text-white"
              />
            </div>

            <div>
              <label htmlFor="weekly-deposit-limit" className="block text-xs font-semibold text-slate-300 mb-1">
                Weekly Deposit Limit ({currency})
              </label>
              <input
                id="weekly-deposit-limit"
                type="number"
                value={weeklyLimit}
                onChange={(e) => setWeeklyLimit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl font-mono text-sm font-bold text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
          >
            Save Limit Settings
          </button>
        </form>

        {/* Timeout & Self Exclusion */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
              <span>🛑</span> Take a Timeout / Self-Exclusion
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Block your account from placing bets for a set cooling-off period or request long-term self-exclusion.
            </p>

            <div className="space-y-3">
              <div>
                <label htmlFor="timeout-days-select" className="block text-xs font-semibold text-slate-300 mb-1">
                  Temporary Timeout Duration
                </label>
                <select
                  id="timeout-days-select"
                  value={timeoutDays}
                  onChange={(e) => setTimeoutDays(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white"
                >
                  <option value="1">24 Hours Cooling Off</option>
                  <option value="7">7 Days Timeout</option>
                  <option value="30">30 Days Break</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={handleSelfExclude}
              className="w-full py-2.5 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
            >
              Request Self-Exclusion
            </button>
            <div className="text-[11px] text-center text-slate-500">
              Need assistance? Call helpline: +675 1800-GAMBLE (Simulated)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
