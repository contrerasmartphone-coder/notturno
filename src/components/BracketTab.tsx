import React, { useState } from 'react';
import { Match, Team, QuarterFinalsMode } from '../types';
import { Trophy, Clock, MapPin, Edit3, Award, Sparkles, CheckCircle2, ChevronRight, Settings2, Dices } from 'lucide-react';
import { motion } from 'motion/react';
import ConfirmModal from './ConfirmModal';

interface BracketTabProps {
  matches: Match[];
  teams?: Team[];
  isAdmin: boolean;
  quarterFinalsMode: QuarterFinalsMode;
  onOpenScoreModal: (match: Match) => void;
  onUpdateQuarterFinalsMode: (mode: QuarterFinalsMode) => Promise<void>;
  onGenerateKnockout: () => Promise<void>;
  onSimulateKnockoutRound?: () => Promise<void>;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning', title?: string) => void;
}

export default function BracketTab({
  matches,
  teams = [],
  isAdmin,
  quarterFinalsMode,
  onOpenScoreModal,
  onUpdateQuarterFinalsMode,
  onGenerateKnockout,
  onSimulateKnockoutRound,
  onShowToast,
}: BracketTabProps) {
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

  const getTeamName = (team: Team | null | undefined, fallback: string = 'TBD'): string => {
    if (!team) return fallback;
    const found = teams.find((t) => t.id === team.id);
    return found ? found.name : team.name || fallback;
  };

  const knockoutMatches = matches.filter((m) => m.phase === 'eliminazione' || m.round >= 2);

  const ottavi = knockoutMatches.filter((m) => m.round === 2);
  const quarti = knockoutMatches.filter((m) => m.round === 3);
  const semifinali = knockoutMatches.filter((m) => m.round === 4);
  const finale34 = knockoutMatches.find((m) => m.id === 'm-fin-3-4' || (m.round === 5 && m.position === 1));
  const finale12 = knockoutMatches.find((m) => m.id === 'm-fin-1-2' || (m.round === 5 && m.position === 2));

  const isTournamentFinished = finale12 && finale12.status === 'completed' && finale12.winnerId;
  const firstPlaceTeam = isTournamentFinished
    ? finale12.winnerId === finale12.team1?.id
      ? finale12.team1
      : finale12.team2
    : null;
  const secondPlaceTeam = isTournamentFinished
    ? finale12.winnerId === finale12.team1?.id
      ? finale12.team2
      : finale12.team1
    : null;
  const thirdPlaceTeam =
    finale34 && finale34.status === 'completed' && finale34.winnerId
      ? finale34.winnerId === finale34.team1?.id
        ? finale34.team1
        : finale34.team2
      : null;

  if (knockoutMatches.length === 0) {
    return (
      <div
        id="bracket-empty-state"
        className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-xl"
      >
        <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Tabellone Fase Finale non ancora generato</h3>
        <p className="text-slate-400 text-sm mb-6">
          Il tabellone a eliminazione diretta (Ottavi con BYE per la 1ª, Quarti, Semifinali e Finali) si genera in base alla
          Classifica Avulsa una volta giocate tutte le partite dei gironi.
        </p>
        {isAdmin && (
          <button
            id="generate-knockout-initial-btn"
            onClick={onGenerateKnockout}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm shadow-md inline-flex items-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Genera Tabellone Eliminazione Diretta
          </button>
        )}
      </div>
    );
  }

  const renderMatchCard = (m: Match, highlightSpecial?: boolean) => {
    const isCompleted = m.status === 'completed';
    const isLive = m.status === 'live';

    return (
      <div
        key={m.id}
        id={`bracket-match-${m.id}`}
        className={`bg-slate-900 border rounded-2xl p-3 sm:p-4 shadow-md transition flex flex-col justify-between ${
          highlightSpecial
            ? 'border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-slate-900 shadow-amber-500/5'
            : isCompleted
            ? 'border-slate-800/90'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex justify-between items-center text-[11px] sm:text-xs text-slate-400 mb-2.5 gap-2">
            <span className="font-semibold text-amber-400 text-xs sm:text-sm break-words leading-tight flex-1">{m.roundLabel}</span>
            <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-slate-300 shrink-0">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                {m.court}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-sky-400 shrink-0" />
                {m.time}
              </span>
            </div>
          </div>

          {/* Seed indicator if present */}
          {m.matchSeedLabel && (
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mb-2">Accoppiamento: {m.matchSeedLabel}</div>
          )}

          {/* Team 1 */}
          <div
            className={`flex justify-between items-center py-2 px-2 sm:px-2.5 rounded-xl transition gap-1.5 ${
              m.winnerId && m.winnerId === m.team1?.id
                ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30'
                : m.team1
                ? 'text-white'
                : 'text-slate-500 italic'
            }`}
          >
            <div className="flex items-center gap-1.5 flex-1 pr-1">
              <span className="text-xs sm:text-sm font-semibold break-words whitespace-normal leading-tight">
                {m.team1
                  ? getTeamName(m.team1)
                  : m.round === 3 && m.position === 1
                  ? '1ª Classificata (BYE)'
                  : 'TBD'}
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs sm:text-sm shrink-0">
              {m.sets && m.sets.length > 0 ? (
                m.sets.map((s, idx) => (
                  <span
                    key={idx}
                    className={`px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-xs ${
                      s.team1 > s.team2 ? 'bg-amber-500/30 text-amber-200 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {s.team1}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-600">-</span>
              )}
              <span className="font-bold text-slate-200 ml-1 text-xs sm:text-sm bg-slate-800/80 px-1.5 sm:px-2 py-0.5 rounded">
                {m.team1Score}
              </span>
            </div>
          </div>

          {/* Team 2 */}
          <div
            className={`flex justify-between items-center py-2 px-2 sm:px-2.5 rounded-xl mt-1.5 transition gap-1.5 ${
              m.winnerId && m.winnerId === m.team2?.id
                ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30'
                : m.team2
                ? 'text-white'
                : 'text-slate-500 italic'
            }`}
          >
            <div className="flex items-center gap-1.5 flex-1 pr-1">
              <span className="text-xs sm:text-sm font-semibold break-words whitespace-normal leading-tight">{getTeamName(m.team2)}</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs sm:text-sm shrink-0">
              {m.sets && m.sets.length > 0 ? (
                m.sets.map((s, idx) => (
                  <span
                    key={idx}
                    className={`px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-xs ${
                      s.team2 > s.team1 ? 'bg-amber-500/30 text-amber-200 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {s.team2}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-600">-</span>
              )}
              <span className="font-bold text-slate-200 ml-1 text-xs sm:text-sm bg-slate-800/80 px-1.5 sm:px-2 py-0.5 rounded">
                {m.team2Score}
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex justify-between items-center gap-2 flex-wrap">
          <span
            className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              isCompleted
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : isLive
                ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isCompleted ? 'Concluso' : isLive ? 'Live In Corso' : 'In attesa'}
          </span>

          {isAdmin && (
            <button
              id={`bracket-edit-score-${m.id}`}
              onClick={() => onOpenScoreModal(m)}
              disabled={!m.team1 || !m.team2}
              className="px-2 sm:px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-30 text-amber-400 border border-amber-500/30 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Punteggio / Ora
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div id="bracket-tab-container" className="space-y-8 max-w-7xl mx-auto">
      {/* Header with Format Selector & Simulation */}
      <div
        id="bracket-header-card"
        className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Tabellone a Eliminazione Diretta</h2>
              <p className="text-sm text-slate-400">
                Ottavi (1 set a 25, 1° con BYE) • Quarti • Semifinali (2/3 a 25 con TB a 25) • Finali
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Simulate Next Round Button */}
          {isAdmin && onSimulateKnockoutRound && !isTournamentFinished && (
            <button
              id="simulate-knockout-btn"
              onClick={() => setIsSimulateModalOpen(true)}
              className="px-3.5 py-2 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Dices className="w-4 h-4 text-purple-400" />
              Simula Turno Tabellone
            </button>
          )}

          {/* Quarti Formula Selector */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-800/60 p-2 rounded-2xl border border-slate-700/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold pl-1">
              <Settings2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Formula Quarti:</span>
            </div>

            {isAdmin ? (
              <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-700">
                <button
                  id="qf-mode-single-set-btn"
                  onClick={() => onUpdateQuarterFinalsMode('single_set_25')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    quarterFinalsMode === 'single_set_25'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Set Unico a 25
                </button>
                <button
                  id="qf-mode-best-of-3-btn"
                  onClick={() => onUpdateQuarterFinalsMode('best_of_3_tb15')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    quarterFinalsMode === 'best_of_3_tb15'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2 su 3 (TB a 15)
                </button>
              </div>
            ) : (
              <span className="text-xs font-bold text-amber-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
                {quarterFinalsMode === 'single_set_25' ? 'Set Unico a 25 punti' : '2 su 3 (TB a 15)'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Podium Celebration Banner */}
      {isTournamentFinished && firstPlaceTeam && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-amber-500/20 via-amber-600/15 to-slate-900 border border-amber-500/40 rounded-3xl p-8 shadow-2xl text-center space-y-6"
        >
          <div className="inline-flex p-3 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/40">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-amber-400">
              Torneo Notturno Completato
            </span>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mt-1">Podio & Vincitori</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-2">
            {/* 2nd Place */}
            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-5 order-2 md:order-1 flex flex-col justify-between">
              <div>
                <span className="text-2xl mb-1 block">🥈</span>
                <span className="text-xs uppercase font-bold text-slate-400">2° Classificato</span>
                <h4 className="text-lg font-bold text-white mt-1">{getTeamName(secondPlaceTeam)}</h4>
              </div>
              <span className="text-xs text-slate-500 mt-2 font-medium">Medaglia d'Argento</span>
            </div>

            {/* 1st Place */}
            <div className="bg-gradient-to-b from-amber-500/20 to-slate-900 border-2 border-amber-500 rounded-2xl p-6 order-1 md:order-2 shadow-xl shadow-amber-500/10 flex flex-col justify-between">
              <div>
                <span className="text-4xl mb-1 block">🏆</span>
                <span className="text-xs uppercase font-bold text-amber-400">Campioni del Torneo Notturno</span>
                <h4 className="text-xl font-black text-white mt-1">{getTeamName(firstPlaceTeam)}</h4>
              </div>
              <span className="text-xs text-amber-300 font-bold mt-2">1° Posto • Vincitori Ufficiali</span>
            </div>

            {/* 3rd Place */}
            <div className="bg-slate-900/90 border border-amber-700/60 rounded-2xl p-5 order-3 flex flex-col justify-between">
              <div>
                <span className="text-2xl mb-1 block">🥉</span>
                <span className="text-xs uppercase font-bold text-amber-600">3° Classificato</span>
                <h4 className="text-lg font-bold text-white mt-1">{getTeamName(thirdPlaceTeam)}</h4>
              </div>
              <span className="text-xs text-slate-500 mt-2 font-medium">Medaglia di Bronzo</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bracket Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {/* Column 1: Ottavi di Finale */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <h3 className="font-bold text-white text-sm">Ottavi di Finale</h3>
            <span className="text-[11px] text-slate-400">7 gare • Singolo set a 25</span>
          </div>

          <div className="space-y-3">{ottavi.map((m) => renderMatchCard(m))}</div>
        </div>

        {/* Column 2: Quarti di Finale */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <h3 className="font-bold text-white text-sm">Quarti di Finale</h3>
            <span className="text-[11px] text-amber-400">
              {quarterFinalsMode === 'single_set_25' ? '4 gare • Set a 25' : '4 gare • 2 su 3 (TB a 15)'}
            </span>
          </div>

          <div className="space-y-3">{quarti.map((m) => renderMatchCard(m, m.position === 1))}</div>
        </div>

        {/* Column 3: Semifinali */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <h3 className="font-bold text-white text-sm">Semifinali</h3>
            <span className="text-[11px] text-sky-400">2 gare • 2 su 3 a 25 (TB a 25)</span>
          </div>

          <div className="space-y-4 pt-4">{semifinali.map((m) => renderMatchCard(m))}</div>
        </div>

        {/* Column 4: Finali */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <h3 className="font-bold text-white text-sm">Finali</h3>
            <span className="text-[11px] text-emerald-400">Podio & Titolo</span>
          </div>

          <div className="space-y-5 pt-2">
            {/* Grand Final 1°/2° Posto */}
            {finale12 && (
              <div className="space-y-1.5">
                <span className="text-xs uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> Finale 1° e 2° Posto (2/3 a 25)
                </span>
                {renderMatchCard(finale12, true)}
              </div>
            )}

            {/* Finale 3°/4° Posto */}
            {finale34 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-xs uppercase tracking-wider font-bold text-amber-600 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Finale 3° e 4° Posto
                </span>
                {renderMatchCard(finale34)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Knockout Simulation */}
      <ConfirmModal
        isOpen={isSimulateModalOpen}
        title="Simula Turno Tabellone"
        message="Vuoi simulare i risultati per il turno corrente del tabellone a eliminazione diretta? I vincitori avanzeranno automaticamente al turno successivo."
        confirmLabel="Simula Turno"
        onConfirm={async () => {
          if (onSimulateKnockoutRound) {
            await onSimulateKnockoutRound();
            if (onShowToast) {
              onShowToast('Partite del tabellone simulate con successo!', 'success', 'Simulazione Eseguita');
            }
          }
        }}
        onClose={() => setIsSimulateModalOpen(false)}
      />
    </div>
  );
}
