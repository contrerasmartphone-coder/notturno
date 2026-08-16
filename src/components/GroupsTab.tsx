import React, { useState } from 'react';
import { Team, Match } from '../types';
import { sortGroupStandings, parseTimeToMinutes } from '../utils';
import {
  Layers,
  Trophy,
  Clock,
  MapPin,
  CheckCircle2,
  Play,
  Edit3,
  ArrowRight,
  Sparkles,
  Lock,
  Calendar,
  Filter,
  Dices,
  Eye,
} from 'lucide-react';
import { motion } from 'motion/react';
import ConfirmModal from './ConfirmModal';

interface GroupsTabProps {
  teams: Team[];
  matches: Match[];
  isAdmin: boolean;
  onOpenScoreModal: (match: Match) => void;
  onNavigateToAvulsa: () => void;
  onGenerateKnockout: () => Promise<void>;
  onSimulateGroupMatches?: () => Promise<void>;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning', title?: string) => void;
}

export default function GroupsTab({
  teams,
  matches,
  isAdmin,
  onOpenScoreModal,
  onNavigateToAvulsa,
  onGenerateKnockout,
  onSimulateGroupMatches,
  onShowToast,
}: GroupsTabProps) {
  const groupNames = ['Girone A', 'Girone B', 'Girone C', 'Girone D', 'Girone E'];
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'groups' | 'chronological'>('groups');
  const [courtFilter, setCourtFilter] = useState<string>('all');
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

  const groupMatches = matches.filter((m) => m.phase === 'gironi' || m.groupName);
  const completedGroupMatches = groupMatches.filter((m) => m.status === 'completed');
  const totalGroupMatches = groupMatches.length || 15;
  const isGroupStageComplete = groupMatches.length === 15 && completedGroupMatches.length === 15;

  if (teams.length < 15) {
    return (
      <div
        id="groups-not-ready"
        className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-xl"
      >
        <Layers className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Gironi in attesa di completamento iscrizioni</h3>
        <p className="text-slate-400 text-sm mb-4">
          Il torneo prevede esattamente 15 squadre suddivise in 5 gironi da 3. Attualmente ci sono {teams.length} squadre
          iscritte.
        </p>
        <div className="inline-block bg-slate-800/80 border border-slate-700 text-amber-300 text-xs px-4 py-2 rounded-xl font-medium">
          Completa le 15 iscrizioni nella scheda "Squadre" per visualizzare i gironi e il calendario gare.
        </div>
      </div>
    );
  }

  // Chronologically sorted matches
  const chronologicalMatches = [...groupMatches]
    .sort((a, b) => {
      const tA = parseTimeToMinutes(a.time);
      const tB = parseTimeToMinutes(b.time);
      if (tA !== tB) return tA - tB;
      return a.court.localeCompare(b.court);
    })
    .filter((m) => {
      if (courtFilter === 'all') return true;
      return m.court.trim().toLowerCase() === courtFilter.toLowerCase();
    });

  const displayedGroups = selectedGroup === 'all' ? groupNames : [selectedGroup];

  return (
    <div id="groups-tab-container" className="space-y-6 max-w-6xl mx-auto">
      {/* Header Info & Actions */}
      <div
        id="groups-header-card"
        className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Fase 1: Gironi di Qualificazione</h2>
              <p className="text-sm text-slate-400">
                5 gironi da 3 squadre (Criterio FIPAV Round Robin 3). Set singolo a 25 punti.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Group Match Progress Counter */}
          <div className="px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl flex items-center gap-2 text-xs">
            <span className="text-slate-400 uppercase font-semibold">Gare Fase 1:</span>
            <span
              className={`font-bold ${
                isGroupStageComplete ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {completedGroupMatches.length} / {totalGroupMatches}
            </span>
          </div>

          {/* Simulate Matches Button */}
          {isAdmin && onSimulateGroupMatches && !isGroupStageComplete && (
            <button
              id="simulate-groups-btn"
              onClick={() => setIsSimulateModalOpen(true)}
              className="px-3.5 py-2 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              title="Simula risultati per test rapido"
            >
              <Dices className="w-4 h-4 text-purple-400" />
              Simula Gare Gironi
            </button>
          )}

          {/* Classifica Avulsa button */}
          <button
            id="view-classifica-avulsa-btn"
            onClick={onNavigateToAvulsa}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 transition cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            Classifica Avulsa (1°-15°)
          </button>

          {/* Generate Knockout Button - STRICTLY LOCKED until all 15 matches are completed */}
          {isAdmin && (
            <button
              id="generate-knockout-phase-btn"
              onClick={() => {
                if (!isGroupStageComplete) {
                  if (onShowToast) {
                    onShowToast(
                      `Devi completare tutte le 15 partite dei gironi prima di generare il tabellone finale (${completedGroupMatches.length}/15 giocate).`,
                      'warning',
                      'Tabellone Finale Bloccato'
                    );
                  }
                  return;
                }
                onGenerateKnockout();
              }}
              disabled={!isGroupStageComplete}
              className={`px-4 py-2 text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition ${
                isGroupStageComplete
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 cursor-pointer shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-75'
              }`}
              title={
                !isGroupStageComplete
                  ? `Completate ${completedGroupMatches.length}/15 gare. Gioca tutte le partite per sbloccare.`
                  : 'Genera il tabellone a eliminazione diretta'
              }
            >
              {!isGroupStageComplete ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tabellone Bloccato ({completedGroupMatches.length}/15)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Genera Tabellone Finale</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main View Mode Switcher (Gironi vs Elenco Cronologico) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-2.5">
        <div className="flex items-center gap-1.5">
          <button
            id="view-mode-groups-btn"
            onClick={() => setViewMode('groups')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              viewMode === 'groups'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Vista per Gironi (A-B-C-D-E)
          </button>

          <button
            id="view-mode-chrono-btn"
            onClick={() => setViewMode('chronological')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              viewMode === 'chronological'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Elenco Gare in Ordine Temporale
          </button>
        </div>

        {/* Sub-Filters */}
        {viewMode === 'groups' ? (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedGroup('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedGroup === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              Tutti (A-E)
            </button>
            {groupNames.map((gName) => (
              <button
                key={gName}
                onClick={() => setSelectedGroup(gName)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedGroup === gName
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {gName}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={courtFilter}
              onChange={(e) => setCourtFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-400"
            >
              <option value="all">Tutti i Campi</option>
              {Array.from(new Set(groupMatches.map((m) => m.court || 'Campo Palamelina'))).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* VIEW 1: Standings and Matches per Group */}
      {viewMode === 'groups' && (
        <div className="space-y-6">
          {displayedGroups.map((groupName) => {
            const groupTeams = teams.filter((t) => t.group === groupName);
            const gMatches = groupMatches.filter((m) => m.groupName === groupName);
            const sortedTeams = sortGroupStandings(groupTeams, gMatches);

            return (
              <div
                key={groupName}
                id={`group-section-${groupName.replace(/\s+/g, '-').toLowerCase()}`}
                className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6"
              >
                {/* Group Title */}
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <h3 className="text-xl font-bold text-white">{groupName}</h3>
                  </div>
                  <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700 font-medium">
                    Set unico a 25 punti
                  </span>
                </div>

                {/* Standings Table for this Group */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-400 bg-slate-800/30">
                        <th className="py-2.5 px-3 rounded-l-lg">Pos</th>
                        <th className="py-2.5 px-3">Squadra</th>
                        {isAdmin && <th className="py-2.5 px-3 text-center">Livello</th>}
                        <th className="py-2.5 px-3 text-center font-bold text-amber-400">Punti</th>
                        <th className="py-2.5 px-3 text-center">V - P</th>
                        <th className="py-2.5 px-3 text-center">Set V-P</th>
                        <th className="py-2.5 px-3 text-center">Punti V-P</th>
                        <th className="py-2.5 px-3 text-center rounded-r-lg">Diff</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {sortedTeams.map((team, idx) => {
                        const diff = team.pointsWon - team.pointsLost;
                        return (
                          <tr key={team.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-3 px-3">
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                  idx === 0
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : idx === 1
                                    ? 'bg-slate-700 text-slate-300'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {idx + 1}°
                              </span>
                            </td>
                            <td className="py-3 px-3 font-semibold text-white">{team.name}</td>
                            {isAdmin && (
                              <td className="py-3 px-3 text-center">
                                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60">
                                  {team.level}
                                </span>
                              </td>
                            )}
                            <td className="py-3 px-3 text-center font-bold text-amber-400 text-base">
                              {team.points}
                            </td>
                            <td className="py-3 px-3 text-center text-slate-300">
                              {team.wins} - {team.losses}
                            </td>
                            <td className="py-3 px-3 text-center text-slate-300">
                              {team.setsWon} - {team.setsLost}
                            </td>
                            <td className="py-3 px-3 text-center text-slate-300">
                              {team.pointsWon} - {team.pointsLost}
                            </td>
                            <td
                              className={`py-3 px-3 text-center font-semibold ${
                                diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-slate-400'
                              }`}
                            >
                              {diff > 0 ? `+${diff}` : diff}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Group Matches */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Partite del {groupName}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {gMatches.map((match, mIdx) => {
                      const isCompleted = match.status === 'completed';
                      const set1 = match.sets && match.sets[0] ? match.sets[0] : null;

                      return (
                        <div
                          key={match.id}
                          id={`match-card-${match.id}`}
                          className={`border rounded-xl p-4 transition flex flex-col justify-between ${
                            isCompleted
                              ? 'bg-slate-800/50 border-slate-700/80'
                              : 'bg-slate-800/20 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-center text-xs text-slate-400 mb-2.5">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-amber-400" />
                                {match.court || `Campo ${(mIdx % 3) + 1}`}
                              </span>
                              <span className="flex items-center gap-1 font-mono text-slate-300 font-semibold">
                                <Clock className="w-3 h-3 text-sky-400" />
                                {match.time || '20:30'}
                              </span>
                            </div>

                            <div className="space-y-2">
                              <div
                                className={`flex justify-between items-center ${
                                  match.winnerId === match.team1?.id ? 'text-amber-400 font-bold' : 'text-slate-200'
                                }`}
                              >
                                <span className="text-sm truncate pr-2">{match.team1?.name || 'TBD'}</span>
                                <span className="text-sm font-mono font-bold px-2 py-0.5 bg-slate-900 rounded">
                                  {set1 ? set1.team1 : '-'}
                                </span>
                              </div>

                              <div
                                className={`flex justify-between items-center ${
                                  match.winnerId === match.team2?.id ? 'text-amber-400 font-bold' : 'text-slate-200'
                                }`}
                              >
                                <span className="text-sm truncate pr-2">{match.team2?.name || 'TBD'}</span>
                                <span className="text-sm font-mono font-bold px-2 py-0.5 bg-slate-900 rounded">
                                  {set1 ? set1.team2 : '-'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex justify-between items-center">
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                isCompleted
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : match.status === 'live'
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse'
                                  : 'bg-slate-700/50 text-slate-400'
                              }`}
                            >
                              {isCompleted ? 'Terminata (Set a 25)' : match.status === 'live' ? 'In Corso' : 'Da Giocare'}
                            </span>

                            {isAdmin && (
                              <button
                                id={`edit-score-btn-${match.id}`}
                                onClick={() => onOpenScoreModal(match)}
                                className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                {isCompleted ? 'Modifica' : 'Punteggio / Ora'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: Chronological Match List (Elenco Gare in Ordine Temporale) */}
      {viewMode === 'chronological' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>Calendario Cronologico Gare Fase a Gironi</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Elenco di tutte le 15 partite ordinate temporalmente per orario di inizio e campo
              </p>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-3 py-1 rounded-full border border-slate-700">
              {chronologicalMatches.length} gare
            </span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {chronologicalMatches.map((m, idx) => {
              const isCompleted = m.status === 'completed';
              const set1 = m.sets && m.sets[0] ? m.sets[0] : null;

              return (
                <div
                  key={m.id}
                  id={`chrono-match-row-${m.id}`}
                  className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-800/30 px-3 rounded-xl transition"
                >
                  {/* Left: Time, Court, Round Label */}
                  <div className="flex items-center gap-3 md:w-1/4">
                    <div className="w-14 text-center py-1 bg-slate-800 text-sky-400 font-mono font-bold text-sm rounded-lg border border-slate-700">
                      {m.time || '20:30'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        {m.court || 'Campo 1'}
                      </div>
                      <span className="text-[11px] text-slate-400 block">{m.roundLabel}</span>
                    </div>
                  </div>

                  {/* Center: Teams & Score */}
                  <div className="flex-1 grid grid-cols-5 items-center bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2.5">
                    <div className="col-span-2 text-left">
                      <span
                        className={`text-sm font-semibold truncate block ${
                          m.winnerId === m.team1?.id ? 'text-amber-400 font-bold' : 'text-white'
                        }`}
                      >
                        {m.team1?.name || 'TBD'}
                      </span>
                    </div>

                    <div className="col-span-1 text-center font-mono font-bold text-sm">
                      {isCompleted && set1 ? (
                        <span className="bg-slate-800 px-2.5 py-1 rounded text-amber-300">
                          {set1.team1} - {set1.team2}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">VS</span>
                      )}
                    </div>

                    <div className="col-span-2 text-right">
                      <span
                        className={`text-sm font-semibold truncate block ${
                          m.winnerId === m.team2?.id ? 'text-amber-400 font-bold' : 'text-white'
                        }`}
                      >
                        {m.team2?.name || 'TBD'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 md:w-1/4">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : m.status === 'live'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isCompleted ? 'Completata' : m.status === 'live' ? 'Live' : 'Programmata'}
                    </span>

                    {isAdmin && (
                      <button
                        onClick={() => onOpenScoreModal(m)}
                        className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isCompleted ? 'Modifica' : 'Inserisci / Ora'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Simulating Matches */}
      <ConfirmModal
        isOpen={isSimulateModalOpen}
        title="Simulazione Risultati Gironi"
        message="Vuoi simulare automaticamente i punteggi di tutte le partite dei gironi ancora da disputare? Verranno inseriti risultati a set singolo a 25 punti e aggiornate le classifiche."
        confirmLabel="Simula Risultati"
        onConfirm={async () => {
          if (onSimulateGroupMatches) {
            await onSimulateGroupMatches();
            if (onShowToast) {
              onShowToast('Partite dei gironi simulate con successo!', 'success', 'Simulazione Completata');
            }
          }
        }}
        onClose={() => setIsSimulateModalOpen(false)}
      />
    </div>
  );
}
