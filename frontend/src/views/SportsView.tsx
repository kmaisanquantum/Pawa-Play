import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import { SportsNav } from '../components/SportsNav';
import { SportSidebar } from '../components/SportSidebar';
import { CompetitionSection } from '../components/CompetitionSection';
import { MatchData } from '../components/MatchCard';
import { BetSlip } from '../components/BetSlip';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';

export const SportsView: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedSidebarCategory, setSelectedSidebarCategory] = useState<string>('all');
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSports = async () => {
    setLoading(true);
    setError(null);

    const res = await apiFetch<any>('/sports');
    setLoading(false);

    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      // Map API data if structured
      setMatches(res.data);
    } else {
      // Fallback sample matches with valid seed IDs and generic selection IDs
      const demoMatches: MatchData[] = [
        {
          id: 'match-001',
          homeTeam: 'Arsenal',
          awayTeam: 'Manchester United',
          leagueName: 'Premier League',
          sportName: 'Football',
          startTime: 'Today, 21:00',
          status: 'SCHEDULED',
          markets: [
            {
              id: 'mkt-001',
              name: 'Match Winner (1X2)',
              selections: [
                { id: '00000000-0000-0000-0000-000000000016', name: 'Arsenal', odds: 1.85 },
                { id: '00000000-0000-0000-0000-000000000017', name: 'Draw', odds: 3.40 },
                { id: '00000000-0000-0000-0000-000000000018', name: 'Man United', odds: 2.10 },
              ],
            },
          ],
        },
        {
          id: 'match-002',
          homeTeam: 'PNG Hunters',
          awayTeam: 'Brisbane Tigers',
          leagueName: 'PNG Digicel & QRL Hostplus Cup',
          sportName: 'Rugby League',
          startTime: 'Tomorrow, 15:00',
          status: 'SCHEDULED',
          markets: [
            {
              id: 'mkt-002',
              name: 'Match Winner (1X2)',
              selections: [
                { id: 'sel-match1-home', name: 'PNG Hunters', odds: 1.85 },
                { id: 'sel-match1-draw', name: 'Draw', odds: 15.00 },
                { id: 'sel-match1-away', name: 'Brisbane Tigers', odds: 2.10 },
              ],
            },
          ],
        },
        {
          id: 'match-003',
          homeTeam: 'Lae Snax Tigers',
          awayTeam: 'Rabaul Gurias',
          leagueName: 'PNG Digicel Cup',
          sportName: 'Rugby League',
          startTime: 'Sat, 14:00',
          status: 'SCHEDULED',
          markets: [
            {
              id: 'mkt-003',
              name: 'Match Winner (1X2)',
              selections: [
                { id: 'sel-match2-home', name: 'Lae Tigers', odds: 1.65 },
                { id: 'sel-match2-draw', name: 'Draw', odds: 18.00 },
                { id: 'sel-match2-away', name: 'Rabaul Gurias', odds: 2.45 },
              ],
            },
          ],
        },
      ];
      setMatches(demoMatches);
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  // Filter matches based on category
  const filteredMatches = matches.filter((m) => {
    if (selectedSport !== 'all') {
      const sportSlug = m.sportName.toLowerCase().replace(/\s+/g, '-');
      if (selectedSport === 'rugby-league' && !m.sportName.toLowerCase().includes('rugby')) return false;
      if (selectedSport === 'football' && !m.sportName.toLowerCase().includes('football')) return false;
    }
    return true;
  });

  // Group matches by league
  const groupedLeagues = filteredMatches.reduce<Record<string, MatchData[]>>((acc, match) => {
    const key = match.leagueName || 'Featured Competitions';
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Category Navigator */}
      <SportsNav selectedSport={selectedSport} onSelectSport={setSelectedSport} />

      {/* 3-Column Sportsbook Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Sidebar (3 cols on desktop) */}
          <div className="hidden lg:block lg:col-span-3">
            <SportSidebar
              activeCategory={selectedSidebarCategory}
              onSelectCategory={setSelectedSidebarCategory}
            />
          </div>

          {/* Middle Column: Matches Feed (6 cols on desktop) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Promo Banner Header */}
            <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-blue-950 border border-sky-500/30 rounded-2xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <span className="bg-sky-500/20 text-sky-300 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-sky-500/30 mb-2 inline-block">
                  Featured Matches
                </span>
                <h1 className="text-xl font-black text-white">Rugby League & Digicel Cup</h1>
                <p className="text-xs text-slate-300 mt-1">
                  Place bets on live and upcoming PNG & international events with instant payout.
                </p>
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton type="card" count={3} />
            ) : error ? (
              <ErrorState title="Could not load matches" message={error} onRetry={fetchSports} />
            ) : Object.keys(groupedLeagues).length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
                No matches found for the selected category.
              </div>
            ) : (
              Object.entries(groupedLeagues).map(([leagueName, leagueMatches]) => (
                <CompetitionSection
                  key={leagueName}
                  title={leagueName}
                  matches={leagueMatches}
                />
              ))
            )}
          </div>

          {/* Right Column: Bet Slip (3 cols on desktop) */}
          <div className="lg:col-span-3">
            <BetSlip />
          </div>

        </div>
      </div>
    </div>
  );
};
