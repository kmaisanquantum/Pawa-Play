import React from 'react';
import { CompetitionSection } from '../components/CompetitionSection';
import { MatchData } from '../components/MatchCard';
import { BetSlip } from '../components/BetSlip';

export const LiveView: React.FC = () => {
  const liveMatches: MatchData[] = [
    {
      id: 'live-001',
      homeTeam: 'PNG Hunters',
      awayTeam: 'Townsville Blackhawks',
      leagueName: 'Hostplus Cup (Live)',
      sportName: 'Rugby League',
      startTime: '2nd Half 58\'',
      status: 'LIVE',
      score: '18 - 12',
      markets: [
        {
          id: 'mkt-live-1',
          name: 'Match Winner (1X2)',
          selections: [
            { id: 'sel-live-1-home', name: 'PNG Hunters', odds: 1.45 },
            { id: 'sel-live-1-draw', name: 'Draw', odds: 22.00 },
            { id: 'sel-live-1-away', name: 'Townsville Blackhawks', odds: 3.10 },
          ],
        },
      ],
    },
    {
      id: 'live-002',
      homeTeam: 'Goroka Lahanis',
      awayTeam: 'Mendi Muruks',
      leagueName: 'PNG Digicel Cup (Live)',
      sportName: 'Rugby League',
      startTime: '1st Half 32\'',
      status: 'LIVE',
      score: '6 - 10',
      markets: [
        {
          id: 'mkt-live-2',
          name: 'Match Winner (1X2)',
          selections: [
            { id: 'sel-live-2-home', name: 'Goroka Lahanis', odds: 2.10 },
            { id: 'sel-live-2-draw', name: 'Draw', odds: 16.00 },
            { id: 'sel-live-2-away', name: 'Mendi Muruks', odds: 1.75 },
          ],
        },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-9 space-y-6">
          <div className="bg-rose-950/40 border border-rose-500/30 rounded-2xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">In-Play Betting</span>
              </div>
              <h1 className="text-xl font-black text-white">Live Sports Betting</h1>
              <p className="text-xs text-slate-300 mt-1">
                ⚠️ Live odds update in real time. Live data is simulated in Demo mode.
              </p>
            </div>
          </div>

          <CompetitionSection title="Live In-Play Matches" countryFlag="🔴" matches={liveMatches} />
        </div>

        <div className="lg:col-span-3">
          <BetSlip />
        </div>

      </div>
    </div>
  );
};
