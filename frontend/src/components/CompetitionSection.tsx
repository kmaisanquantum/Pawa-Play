import React from 'react';
import { MatchCard, MatchData } from './MatchCard';

interface CompetitionSectionProps {
  title: string;
  countryFlag?: string;
  matches: MatchData[];
}

export const CompetitionSection: React.FC<CompetitionSectionProps> = ({
  title,
  countryFlag = '🏆',
  matches,
}) => {
  if (!matches.length) return null;

  return (
    <section className="space-y-3 mb-6">
      <div className="flex items-center gap-2 px-1">
        <span className="text-lg">{countryFlag}</span>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">{title}</h2>
        <span className="text-xs bg-slate-800 text-slate-400 font-medium px-2 py-0.5 rounded-full border border-slate-700">
          {matches.length}
        </span>
      </div>

      <div className="space-y-3">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  );
};
