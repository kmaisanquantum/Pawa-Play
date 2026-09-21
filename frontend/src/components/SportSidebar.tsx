import React from 'react';

interface SportSidebarProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export const SportSidebar: React.FC<SportSidebarProps> = ({ activeCategory, onSelectCategory }) => {
  const categories = [
    { id: 'top-leagues', label: '⭐ Top Leagues', isHeader: true },
    { id: 'png-digicel', label: '🇵🇬 PNG Digicel Cup', icon: '🏉' },
    { id: 'nrl', label: '🇦🇺 NRL Telstra Premiership', icon: '🏉' },
    { id: 'epl', label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 English Premier League', icon: '⚽' },
    { id: 'nba', label: '🇺🇸 NBA Basketball', icon: '🏀' },

    { id: 'quick-links', label: '⚡ Quick Links', isHeader: true },
    { id: 'live-now', label: '🔴 Live Matches (Demo)', icon: '🔥' },
    { id: 'today', label: '📅 Today\'s Matches', icon: '⏰' },
    { id: 'upcoming', label: '🚀 Upcoming Featured', icon: '🏆' },
  ];

  return (
    <aside className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-4">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
          Sports Navigation
        </h3>
        <div className="space-y-1">
          {categories.map((cat, i) => {
            if (cat.isHeader) {
              return (
                <div
                  key={i}
                  className="pt-3 pb-1 px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-800/80 first:border-0 first:pt-0"
                >
                  {cat.label}
                </div>
              );
            }

            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                  isActive
                    ? 'bg-sky-600/20 text-sky-400 border border-sky-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
