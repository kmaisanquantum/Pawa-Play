import React from 'react';
import { NavLink } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-10 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Persistent Responsible Gambling Box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <div className="font-bold text-slate-200">Responsible Gambling</div>
              <p className="text-[11px] text-slate-400">
                Betting should be fun. Play responsibly and within your limits. Age 18+ only.
              </p>
            </div>
          </div>
          <NavLink
            to="/responsible-gambling"
            className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-300 hover:text-white font-semibold text-xs rounded-xl transition-all whitespace-nowrap"
          >
            Responsible Gaming Tools →
          </NavLink>
        </div>

        {/* Footer Navigation & Legal Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-slate-800/80">
          <div className="space-y-2">
            <div className="font-bold text-white text-sm">PawaPlay</div>
            <p className="text-[11px] text-slate-500">
              Mobile-first sportsbook platform for PNG and South Pacific sports fans.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Sports</div>
            <ul className="space-y-1 text-[11px]">
              <li><NavLink to="/sports" className="hover:text-white">Rugby League</NavLink></li>
              <li><NavLink to="/sports" className="hover:text-white">Football / Soccer</NavLink></li>
              <li><NavLink to="/live" className="hover:text-white">Live In-Play</NavLink></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Account</div>
            <ul className="space-y-1 text-[11px]">
              <li><NavLink to="/my-bets" className="hover:text-white">My Bets</NavLink></li>
              <li><NavLink to="/wallet" className="hover:text-white">Wallet & Deposits</NavLink></li>
              <li><NavLink to="/account" className="hover:text-white">Profile & Security</NavLink></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Legal & Support</div>
            <ul className="space-y-1 text-[11px]">
              <li><NavLink to="/responsible-gambling" className="hover:text-white">Responsible Gambling</NavLink></li>
              <li><span className="text-slate-500">Terms & Conditions</span></li>
              <li><span className="text-slate-500">Privacy Policy</span></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-[11px] text-slate-500 pt-4 border-t border-slate-900">
          © {new Date().getFullYear()} PawaPlay. All rights reserved. Operating in Demo/Sandbox Mode.
        </div>
      </div>
    </footer>
  );
};
