import React from 'react';
import { Team, Match } from '../types';
import { computeClassificaAvulsa } from '../utils';
import { Trophy, Award, Shield, ArrowRight, CheckCircle2, HelpCircle, Sparkles, Layers } from 'lucide-react';

interface ClassificaAvulsaTabProps {
  teams: Team[];
  matches: Match[];
  isAdmin: boolean;
  onNavigateToBracket: () => void;
  onGenerateKnockout: () => Promise<void>;
}

export default function ClassificaAvulsaTab({
  teams,
  matches,
  isAdmin,
  onNavigateToBracket,
  onGenerateKnockout,
}: ClassificaAvulsaTabProps) {
  const rankedTeams = computeClassificaAvulsa(teams, matches);

  const getTeamName = (team: Team | null | undefined, fallback: string = 'TBD'): string => {
    if (!team) return fallback;
    const found = teams.find((t) => t.id === team.id);
    return found ? found.name : team.name || fallback;
  };

  const getMatchupLabel = (rank: number): { label: string; badgeColor: string; isBye?: boolean } => {
    switch (rank) {
      case 1:
        return {
          label: '🌟 BYE: Qualificata Direttamente ai Quarti',
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
          isBye: true,
        };
      case 8:
        return {
          label: 'Ottavi: vs 9° Classificato (Winner vs 1°)',
          badgeColor: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
        };
      case 9:
        return {
          label: 'Ottavi: vs 8° Classificato (Winner vs 1°)',
          badgeColor: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
        };
      case 4:
        return {
          label: 'Ottavi: vs 13° Classificato',
          badgeColor: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
        };
      case 13:
        return {
          label: 'Ottavi: vs 4° Classificato',
          badgeColor: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
        };
      case 5:
        return {
          label: 'Ottavi: vs 12° Classificato',
          badgeColor: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
        };
      case 12:
        return {
          label: 'Ottavi: vs 5° Classificato',
          badgeColor: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
        };
      case 2:
        return {
          label: 'Ottavi: vs 15° Classificato',
          badgeColor: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
        };
      case 15:
        return {
          label: 'Ottavi: vs 2° Classificato',
          badgeColor: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
        };
      case 7:
        return {
          label: 'Ottavi: vs 10° Classificato',
          badgeColor: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
        };
      case 10:
        return {
          label: 'Ottavi: vs 7° Classificato',
          badgeColor: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
        };
      case 3:
        return {
          label: 'Ottavi: vs 14° Classificato',
          badgeColor: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
        };
      case 14:
        return {
          label: 'Ottavi: vs 3° Classificato',
          badgeColor: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
        };
      case 6:
        return {
          label: 'Ottavi: vs 11° Classificato',
          badgeColor: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
        };
      case 11:
        return {
          label: 'Ottavi: vs 6° Classificato',
          badgeColor: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
        };
      default:
        return {
          label: `Ottavi di Finale`,
          badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
        };
    }
  };

  return (
    <div id="classifica-avulsa-container" className="space-y-8 max-w-6xl mx-auto">
      {/* 1st Place Golden Banner */}
      {rankedTeams.length > 0 && (
        <div id="first-place-bye-banner" className="bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg sm:text-xl shadow-md shrink-0">
              1°
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-amber-400 font-bold">1a CLASSIFICATA NELLA FASE A GIRONI</span>
                <span className="text-[10px] sm:text-xs bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded font-bold">BYE DIRETTO AI QUARTI</span>
              </div>
              <h3 className="text-base sm:text-xl font-bold text-white mt-0.5 leading-tight break-words">{getTeamName(rankedTeams[0])}</h3>
              <p className="text-[11px] sm:text-xs text-slate-300">
                {rankedTeams[0].group} • {rankedTeams[0].points} Punti • Set {rankedTeams[0].setsWon}-{rankedTeams[0].setsLost} • Punti {rankedTeams[0].pointsWon}-{rankedTeams[0].pointsLost}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-amber-500/30 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:text-right w-full sm:w-auto">
            <span className="text-[10px] sm:text-xs text-slate-400 block">Fase Successiva</span>
            <span className="text-xs sm:text-sm font-bold text-amber-300">Quarti di Finale (Gara Q1)</span>
          </div>
        </div>
      )}

      {/* Unified Table */}
      <div id="avulsa-table-card" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span>Classifica Avulsa</span>
          </h3>
          <span className="text-[10px] text-slate-400 sm:hidden italic">
            ↔ Scorri per visualizzare tutti i coefficienti
          </span>
        </div>

        <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] sm:text-xs font-semibold uppercase text-slate-400 bg-slate-800/40">
                <th className="py-2.5 px-2 sm:px-3 rounded-l-lg text-center w-8">Pos</th>
                <th className="py-2.5 px-2 sm:px-3 min-w-[120px] sm:min-w-[150px]">Squadra</th>
                <th className="py-2.5 px-1.5 sm:px-3 text-center">Girone</th>
                <th className="py-2.5 px-1.5 sm:px-3 text-center">Pos. Gir</th>
                <th className="py-2.5 px-1.5 sm:px-3 text-center font-bold text-amber-400">Pti (G)</th>
                <th className="py-2.5 px-1.5 sm:px-3 text-center">Q. Pti/G</th>
                <th className="py-2.5 px-1.5 sm:px-3 text-center">V-P</th>
                <th className="py-2.5 px-1.5 sm:px-3 text-center">Q. Set</th>
                <th className="py-2.5 px-1.5 sm:px-3 text-center">Q. Pti</th>
                <th className="py-2.5 px-1.5 sm:px-3 text-center">Diff</th>
                <th className="py-2.5 px-2 sm:px-3 rounded-r-lg">Accoppiamento Fase Finale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
              {rankedTeams.map((team, idx) => {
                const rank = idx + 1;
                const matchup = getMatchupLabel(rank);
                const diff = team.pointsWon - team.pointsLost;
                const matchesPlayed = team.wins + team.losses;
                const qPtsGare = matchesPlayed > 0 ? (team.points / matchesPlayed).toFixed(2) : '0.00';
                const qSet = team.setsLost === 0 ? (team.setsWon > 0 ? 'MAX' : '0.00') : (team.setsWon / team.setsLost).toFixed(2);
                const qPts = team.pointsLost === 0 ? (team.pointsWon > 0 ? 'MAX' : '0.00') : (team.pointsWon / team.pointsLost).toFixed(2);

                return (
                  <tr
                    key={team.id}
                    className={`transition hover:bg-slate-800/40 ${
                      rank === 1 ? 'bg-amber-500/5 font-semibold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-2 sm:px-3 text-center">
                      <span className={`inline-flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 rounded-full text-[10px] sm:text-xs font-bold ${
                        rank === 1 ? 'bg-amber-500 text-slate-950 shadow-sm' :
                        rank <= 5 ? 'bg-slate-700 text-amber-300 font-bold' :
                        rank <= 10 ? 'bg-slate-800 text-sky-300' :
                        'bg-slate-800/80 text-slate-400'
                      }`}>
                        {rank}°
                      </span>
                    </td>
                    <td className="py-2.5 px-2 sm:px-3 font-bold text-white text-xs sm:text-sm leading-snug break-words whitespace-normal">
                      <div>{getTeamName(team)}</div>
                      {isAdmin && <div className="text-[10px] sm:text-xs text-slate-500 font-normal">Livello: {team.level}</div>}
                    </td>
                    <td className="py-2.5 px-1.5 sm:px-3 text-center text-slate-300">
                      <span className="text-[10px] sm:text-xs bg-slate-800 px-1.5 sm:px-2 py-0.5 rounded font-medium border border-slate-700/60 whitespace-nowrap">
                        {team.group || 'Girone'}
                      </span>
                    </td>
                    <td className="py-2.5 px-1.5 sm:px-3 text-center">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-300">
                        {team.rankInGroup ? `${team.rankInGroup}°` : '-'}
                      </span>
                    </td>
                    <td className="py-2.5 px-1.5 sm:px-3 text-center font-bold text-amber-400 text-xs sm:text-base whitespace-nowrap">
                      {team.points} <span className="text-[10px] sm:text-xs font-normal text-slate-400">({matchesPlayed})</span>
                    </td>
                    <td className="py-2.5 px-1.5 sm:px-3 text-center font-mono text-[11px] sm:text-xs text-slate-200">
                      {qPtsGare}
                    </td>
                    <td className="py-2.5 px-1.5 sm:px-3 text-center text-slate-300 text-[11px] sm:text-xs whitespace-nowrap font-mono sm:font-sans">
                      {team.wins}-{team.losses}
                    </td>
                    <td className="py-2.5 px-1.5 sm:px-3 text-center font-mono text-[11px] sm:text-xs text-slate-300 whitespace-nowrap">
                      {qSet} <span className="text-[9px] sm:text-[10px] text-slate-500">({team.setsWon}/{team.setsLost})</span>
                    </td>
                    <td className="py-2.5 px-1.5 sm:px-3 text-center font-mono text-[11px] sm:text-xs text-slate-300 whitespace-nowrap">
                      {qPts} <span className="text-[9px] sm:text-[10px] text-slate-500">({team.pointsWon}/{team.pointsLost})</span>
                    </td>
                    <td className={`py-2.5 px-1.5 sm:px-3 text-center font-semibold text-[11px] sm:text-xs ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                      {diff > 0 ? `+${diff}` : diff}
                    </td>
                    <td className="py-2.5 px-2 sm:px-3">
                      <span className={`inline-block text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg whitespace-nowrap ${matchup.badgeColor}`}>
                        {matchup.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tiebreaker Rules Explanatory Box */}
      <div id="rules-explanation-card" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          Criteri Ufficiali Classifica Avulsa (Art. 43 Regolamento Gare FIPAV)
        </h4>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          L'articolo 43 del Regolamento Gare FIPAV disciplina la Classifica Avulsa per confrontare e mettere in graduatoria complessiva squadre appartenenti a gironi diversi del torneo:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
          <div className="space-y-2">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
              <span className="text-amber-400 font-bold block mb-1">1. Miglior Posizione nel Girone</span>
              <span className="text-slate-300">
                Si confrontano prima le prime classificate (pos. 1-5), poi le seconde (pos. 6-10), poi le terze (pos. 11-15). Una seconda classificata non può mai superare una prima, a prescindere dai punti.
              </span>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
              <span className="text-amber-400 font-bold block mb-1">2. Miglior Quoziente Punti / Gare</span>
              <span className="text-slate-300">
                Rapporto tra punti conquistati in classifica e numero di partite giocate (Punti Classifica / Partite Disputate).
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
              <span className="text-amber-400 font-bold block mb-1">3. Miglior Quoziente Set</span>
              <span className="text-slate-300">
                Rapporto matematico tra tutti i set vinti e i set persi nel girone (Set Vinti / Set Persi).
              </span>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
              <span className="text-amber-400 font-bold block mb-1">4. Miglior Quoziente Punti & 5. Sorteggio</span>
              <span className="text-slate-300">
                Rapporto tra tutti i punti realizzati e subiti (Punti Fatti / Punti Subiti). In caso di assoluta parità, criterio di sorteggio/ordine iscrizione ufficiale.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
