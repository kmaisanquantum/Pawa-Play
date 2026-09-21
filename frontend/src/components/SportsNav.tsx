import React from 'react';

interface SportsNavProps {
  selectedSport: string;
  onSelectSport: (sportId: string) => void;
}

export const SportsNav: React.FC<SportsNavProps> = ({ selectedSport, onSelectSport }) => {
  const sports = [
    { id: 'all', name: '🔥 All Sports', count: null },
    { id: 'rugby-league', name: '🏉 Rugby League', count: 12 },
    { id: 'football', name: '⚽ Football', count: 28 },
    { id: 'basketball', name: '🏀 Basketball', count: 15 },
    { id: 'tennis', name: '🎾 Tennis', count: 9 },
    { id: 'cricket', name: '🏏 Cricket', count: 6 },
    { id: 'esports', name: '🎮 eSports', count: 4 },
  ];

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 sticky top-16 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none py-2.5">
        <div className="flex items-center gap-2 min-w-max">
          {sports.map((sport) => {
            const isActive = selectedSport === sport.id;
            return (
              <button
                key={sport.id}
                onClick={() => onSelectSport(sport.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                }`}
              >
                <span>{sport.name}</span>
                {sport.count !== null && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-sky-700 text-white' : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {sport.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
