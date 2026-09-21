import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { balance, currency, regulatoryMode, setIsDepositModalOpen, selections } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Sports', path: '/sports' },
    { name: 'Live', path: '/live', badge: 'DEMO' },
    { name: 'My Bets', path: '/my-bets' },
    { name: 'Wallet', path: '/wallet' },
    { name: 'Promotions', path: '/promotions' },
    { name: 'Account', path: '/account' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo & Regulatory Badge */}
          <div className="flex items-center gap-3">
            <NavLink to="/sports" className="flex items-center gap-2">
              <span className="text-2xl font-black bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent tracking-tight">
                PawaPlay
              </span>
            </NavLink>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                regulatoryMode === 'PRODUCTION'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {regulatoryMode ? `${regulatoryMode} MODE` : 'DEMO MODE'}
            </span>
          </div>

          {/* Desktop Main Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <span>{item.name}</span>
                {item.badge && (
                  <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Wallet Balance Widget */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-1 pr-1.5 pl-3">
              <div className="flex flex-col text-right mr-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Balance</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {currency} {Number(balance).toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => setIsDepositModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-md transition-colors shadow-sm"
              >
                Deposit
              </button>
            </div>

            {/* Profile Avatar Icon */}
            <NavLink
              to="/account"
              className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-sky-500 transition-colors"
              title="Account Settings"
            >
              👤
            </NavLink>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center justify-between">
                <span>{item.name}</span>
                {item.badge && (
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </div>
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};
