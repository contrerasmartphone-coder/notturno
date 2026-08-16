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
      {/* Header Card */}
      <div id="avulsa-header-card" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Classifica Avulsa Generale (1° - 15°)</h2>
              <p className="text-sm text-slate-400">
                Graduatoria unificata post-gironi per la determinazione del seeding e degli accoppiamenti
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              id="rebuild-knockout-btn"
              onClick={onGenerateKnockout}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Rigenera Tabellone Finale
            </button>
          )}

          <button
            id="go-to-bracket-tab-btn"
            onClick={onNavigateToBracket}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer"
          >
            <span>Visualizza Tabellone</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1st Place Golden Banner */}
      {rankedTeams.length > 0 && (
        <div id="first-place-bye-banner" className="bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md">
              1°
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">1ª Classificata nel Torneo</span>
                <span className="text-xs bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded font-bold">BYE DIRETTO</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-0.5">{rankedTeams[0].name}</h3>
              <p className="text-xs text-slate-300">
                {rankedTeams[0].group} • {rankedTeams[0].points} Punti • Set {rankedTeams[0].setsWon}-{rankedTeams[0].setsLost} • Punti {rankedTeams[0].pointsWon}-{rankedTeams[0].pointsLost}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-amber-500/30 px-4 py-2.5 rounded-xl text-right">
            <span className="text-xs text-slate-400 block">Fase Successiva</span>
            <span className="text-sm font-bold text-amber-300">Quarti di Finale (Gara Q1)</span>
          </div>
        </div>
      )}

      {/* Unified Table */}
      <div id="avulsa-table-card" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          <span>Tabella Graduatoria Completa</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-400 bg-slate-800/40">
                <th className="py-3 px-3 rounded-l-lg">Pos</th>
                <th className="py-3 px-3">Squadra</th>
                <th className="py-3 px-3">Girone Origine</th>
                <th className="py-3 px-3 text-center">Pos. Girone</th>
                <th className="py-3 px-3 text-center font-bold text-amber-400">Punti</th>
                <th className="py-3 px-3 text-center">V - P</th>
                <th className="py-3 px-3 text-center">Q. Set</th>
                <th className="py-3 px-3 text-center">Punti F/S</th>
                <th className="py-3 px-3 text-center">Diff</th>
                <th className="py-3 px-3 rounded-r-lg">Accoppiamento Fase Finale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rankedTeams.map((team, idx) => {
                const rank = idx + 1;
                const matchup = getMatchupLabel(rank);
                const diff = team.pointsWon - team.pointsLost;
                const qSet = team.setsLost === 0 ? (team.setsWon > 0 ? 'MAX' : '0.00') : (team.setsWon / team.setsLost).toFixed(2);

                return (
                  <tr
                    key={team.id}
                    className={`transition hover:bg-slate-800/40 ${
                      rank === 1 ? 'bg-amber-500/5 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        rank === 1 ? 'bg-amber-500 text-slate-950 shadow-sm' :
                        rank <= 5 ? 'bg-slate-700 text-amber-300 font-bold' :
                        rank <= 10 ? 'bg-slate-800 text-sky-300' :
                        'bg-slate-800/80 text-slate-400'
                      }`}>
                        {rank}°
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white">{team.name}</div>
                      {isAdmin && <div className="text-xs text-slate-500">Livello: {team.level}</div>}
                    </td>
                    <td className="py-3.5 px-3 text-slate-300">
                      <span className="text-xs bg-slate-800 px-2 py-1 rounded font-medium border border-slate-700/60">
                        {team.group || 'Girone'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="text-xs font-bold text-slate-300">
                        {team.rankInGroup ? `${team.rankInGroup}°` : '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-amber-400 text-base">
                      {team.points}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-300">
                      {team.wins} - {team.losses}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-300">
                      {qSet} ({team.setsWon}/{team.setsLost})
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-xs text-slate-300">
                      {team.pointsWon} / {team.pointsLost}
                    </td>
                    <td className={`py-3.5 px-3 text-center font-semibold ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                      {diff > 0 ? `+${diff}` : diff}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-lg ${matchup.badgeColor}`}>
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
          Criteri di Ordinamento della Classifica Avulsa
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
          <div className="space-y-1.5">
            <p><span className="text-slate-200 font-semibold">1. Posizione nel proprio girone:</span> Le 1ᵉ classificate occupano i posti 1-5, le 2ᵉ i posti 6-10, le 3ᵉ i posti 11-15.</p>
            <p><span className="text-slate-200 font-semibold">2. Punti classifica:</span> Maggior numero di punti conquistati nel girone (3 pt per vittoria).</p>
            <p><span className="text-slate-200 font-semibold">3. Quoziente Set:</span> Rapporto tra i set vinti e i set persi (Set Vinti / Set Persi).</p>
          </div>
          <div className="space-y-1.5">
            <p><span className="text-slate-200 font-semibold">4. Quoziente Punti:</span> Rapporto tra punti fatti e punti subiti in tutte le gare del girone.</p>
            <p><span className="text-slate-200 font-semibold">5. Differenza Punti:</span> Punti vinti meno punti persi.</p>
            <p>
              <span className="text-slate-200 font-semibold">6. {isAdmin ? 'Livello & Ordine Iscrizione' : 'Criterio di Sorteggio'}:</span>{' '}
              {isAdmin ? "Priorità di livello (Avanzato > Intermedio > Base) e data d'ingresso." : "Ordine di iscrizione ufficiale."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
