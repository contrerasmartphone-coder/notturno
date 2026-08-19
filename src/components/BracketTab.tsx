import React, { useState } from 'react';
import { Match, Team, QuarterFinalsMode } from '../types';
import { normalizeCourtName, reorderMatchesBySwap, parseTimeToMinutes } from '../utils';
import { Trophy, Clock, MapPin, Edit3, Award, Sparkles, CheckCircle2, ChevronRight, Settings2, Dices, Lock, GripVertical } from 'lucide-react';
import { motion } from 'motion/react';
import ConfirmModal from './ConfirmModal';

interface BracketTabProps {
  matches: Match[];
  teams?: Team[];
  isAdmin: boolean;
  quarterFinalsMode: QuarterFinalsMode;
  onOpenScoreModal: (match: Match) => void;
  onUpdateQuarterFinalsMode?: (mode: QuarterFinalsMode) => Promise<void>;
  onGenerateKnockout: () => Promise<void>;
  onSimulateKnockoutRound?: () => Promise<void>;
  onBatchUpdateMatches?: (updatedMatches: Match[]) => Promise<void>;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning', title?: string) => void;
}

export default function BracketTab({
  matches,
  teams = [],
  isAdmin,
  quarterFinalsMode,
  onOpenScoreModal,
  onGenerateKnockout,
  onSimulateKnockoutRound,
  onBatchUpdateMatches,
  onShowToast,
}: BracketTabProps) {
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [draggedMatchId, setDraggedMatchId] = useState<string | null>(null);
  const [dragOverMatchId, setDragOverMatchId] = useState<string | null>(null);
  const [selectedMatchForSwapId, setSelectedMatchForSwapId] = useState<string | null>(null);

  const handleMatchDragStart = (e: React.DragEvent, matchId: string) => {
    if (!isAdmin) return;
    const m = matches.find((item) => item.id === matchId);
    if (!m || m.status === 'completed') return;
    setDraggedMatchId(matchId);
    e.dataTransfer.setData('text/plain', matchId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleMatchDragOver = (e: React.DragEvent, matchId: string) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleMatchDragEnd = () => {
    setDraggedMatchId(null);
    setDragOverMatchId(null);
  };

  const executeBracketSwap = async (sourceId: string, targetMatchId: string) => {
    if (!sourceId || sourceId === targetMatchId || !isAdmin || !onBatchUpdateMatches) return;
    const sourceMatch = matches.find((m) => m.id === sourceId);
    const targetMatch = matches.find((m) => m.id === targetMatchId);
    if (!sourceMatch || !targetMatch) return;

    // Must be same phase/round (e.g. both round 2 / ottavi, round 3 / quarti, round 4 / semi)
    if (sourceMatch.round !== targetMatch.round) {
      if (onShowToast) {
        onShowToast(
          'Puoi spostare o scambiare le partite solo all’interno della stessa fase (es. solo tra gli ottavi, o tra i quarti, o tra le semi).',
          'warning',
          'Fase non corrispondente'
        );
      }
      return;
    }

    if (sourceMatch.status === 'completed' || targetMatch.status === 'completed') {
      if (onShowToast) {
        onShowToast(
          'È consentito spostare o scambiare solo le partite ancora da disputare.',
          'warning',
          'Azione non consentita'
        );
      }
      return;
    }

    const result = reorderMatchesBySwap(matches, sourceId, targetMatchId);
    if (!result.success) {
      if (onShowToast) {
        onShowToast(result.error || 'Impossibile invertire le gare.', 'error', 'Errore');
      }
      return;
    }

    await onBatchUpdateMatches(result.updated);
    if (onShowToast) {
      onShowToast(
        `Orari scambiati tra "${sourceMatch.roundLabel}" e "${targetMatch.roundLabel}".`,
        'success',
        'Inversione Eseguita'
      );
    }
  };

  const handleBracketTouchStart = (e: React.TouchEvent, matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (!isAdmin || !match || match.status === 'completed') return;
    setDraggedMatchId(matchId);
  };

  const handleBracketTouchMove = (e: React.TouchEvent) => {
    if (!draggedMatchId) return;
    const touch = e.touches[0];
    if (!touch) return;
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!targetElement) return;
    const cardElement = targetElement.closest('[data-bracket-match-id]');
    if (cardElement) {
      const targetId = cardElement.getAttribute('data-bracket-match-id');
      if (targetId && targetId !== draggedMatchId) {
        const targetMatch = matches.find((m) => m.id === targetId);
        const sourceMatch = matches.find((m) => m.id === draggedMatchId);
        if (
          targetMatch &&
          targetMatch.status !== 'completed' &&
          sourceMatch &&
          sourceMatch.round === targetMatch.round
        ) {
          setDragOverMatchId(targetId);
        }
      }
    }
  };

  const handleBracketTouchEnd = async () => {
    const sourceId = draggedMatchId;
    const targetId = dragOverMatchId;
    setDraggedMatchId(null);
    setDragOverMatchId(null);
    if (!sourceId || !targetId || sourceId === targetId || !isAdmin) return;
    await executeBracketSwap(sourceId, targetId);
  };

  const handleBracketCardTapSelect = async (matchId: string) => {
    if (!isAdmin) return;
    const match = matches.find((m) => m.id === matchId);
    if (!match || match.status === 'completed') return;

    if (!selectedMatchForSwapId) {
      setSelectedMatchForSwapId(matchId);
      if (onShowToast) {
        onShowToast(
          `Gara "${match.roundLabel}" selezionata. Tocca un'altra gara dello stesso turno per scambiare l'orario.`,
          'info',
          'Selezionata per Scambio'
        );
      }
    } else if (selectedMatchForSwapId === matchId) {
      setSelectedMatchForSwapId(null);
    } else {
      const sourceId = selectedMatchForSwapId;
      setSelectedMatchForSwapId(null);
      await executeBracketSwap(sourceId, matchId);
    }
  };

  const handleMatchDrop = async (e: React.DragEvent, targetMatchId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedMatchId;
    handleMatchDragEnd();
    if (!sourceId || sourceId === targetMatchId || !isAdmin) return;
    await executeBracketSwap(sourceId, targetMatchId);
  };

  const getTeamName = (team: Team | null | undefined, fallback: string = 'TBD'): string => {
    if (!team) return fallback;
    const found = teams.find((t) => t.id === team.id);
    return found ? found.name : team.name || fallback;
  };

  const knockoutMatches = matches.filter((m) => m.phase === 'eliminazione' || m.round >= 2);

  const sortByTime = (a: Match, b: Match) => {
    const timeA = parseTimeToMinutes(a.time || '');
    const timeB = parseTimeToMinutes(b.time || '');
    if (timeA !== timeB) return timeA - timeB;
    return (a.position || 0) - (b.position || 0);
  };

  const ottavi = knockoutMatches.filter((m) => m.round === 2).sort(sortByTime);
  const quarti = knockoutMatches.filter((m) => m.round === 3).sort(sortByTime);
  const semifinali = knockoutMatches.filter((m) => m.round === 4).sort(sortByTime);
  const finale12 = knockoutMatches.find((m) => m.id === 'm-fin-1-2' || m.round === 5);

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

  const semifinalLosers = semifinali
    .filter((m) => m.status === 'completed' && m.winnerId)
    .map((m) => (m.winnerId === m.team1?.id ? m.team2 : m.team1))
    .filter(Boolean) as Team[];

  if (knockoutMatches.length === 0) {
    return (
      <div
        id="bracket-empty-state"
        className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-xl space-y-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">Tabellone Finale non ancora generato</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Il tabellone a eliminazione diretta (Ottavi con BYE per la 1ª classificata, Quarti, Semifinali e Finali) sarà visibile non appena verrà generato dalla scheda "Classifica Avulsa" al termine dei gironi.
        </p>
        {isAdmin && (
          <button
            id="generate-knockout-initial-btn"
            onClick={onGenerateKnockout}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-wider shadow-md inline-flex items-center gap-2 transition cursor-pointer"
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
    const isDraggingThis = draggedMatchId === m.id;
    const isDragOverThis = dragOverMatchId === m.id;
    const isSelectedForSwap = selectedMatchForSwapId === m.id;

    return (
      <div
        key={m.id}
        id={`bracket-match-${m.id}`}
        data-bracket-match-id={m.id}
        draggable={isAdmin && !isCompleted}
        onDragStart={(e) => !isCompleted && handleMatchDragStart(e, m.id)}
        onDragEnter={(e) => {
          if (!isAdmin || isCompleted) return;
          e.preventDefault();
          e.stopPropagation();
          if (dragOverMatchId !== m.id) setDragOverMatchId(m.id);
        }}
        onDragOver={(e) => !isCompleted && handleMatchDragOver(e, m.id)}
        onDragLeave={(e) => {
          e.stopPropagation();
          if (dragOverMatchId === m.id && e.currentTarget === e.target) {
            setDragOverMatchId(null);
          }
        }}
        onDragEnd={handleMatchDragEnd}
        onDrop={(e) => !isCompleted && handleMatchDrop(e, m.id)}
        onTouchMove={handleBracketTouchMove}
        onTouchEnd={handleBracketTouchEnd}
        className={`bg-slate-900 border rounded-2xl p-3 sm:p-4 shadow-md transition flex flex-col justify-between ${
          isDraggingThis
            ? 'opacity-40 border-2 border-dashed border-amber-400 bg-amber-500/5'
            : isDragOverThis || isSelectedForSwap
            ? 'border-2 border-amber-400 bg-amber-500/15 scale-[1.01] shadow-xl shadow-amber-500/20'
            : highlightSpecial
            ? 'border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-slate-900 shadow-amber-500/5'
            : isCompleted
            ? 'border-slate-800/90'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex flex-col gap-1.5 mb-2.5 text-[11px] sm:text-xs text-slate-400">
            <div className="flex items-center gap-1.5 min-w-0">
              {isAdmin && !isCompleted && (
                <button
                  type="button"
                  onTouchStart={(e) => handleBracketTouchStart(e, m.id)}
                  onClick={() => handleBracketCardTapSelect(m.id)}
                  className={`p-1 text-zinc-400 hover:text-amber-400 active:text-amber-300 rounded-lg hover:bg-zinc-800 transition cursor-grab active:cursor-grabbing shrink-0 touch-none ${
                    isSelectedForSwap ? 'text-amber-400 bg-amber-500/20 border border-amber-400/50' : ''
                  }`}
                  title="Trascina o tocca per scambiare con un'altra partita della stessa fase"
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="font-semibold text-amber-400 text-xs sm:text-sm break-words leading-tight whitespace-nowrap">{m.phase === 'eliminazione' ? m.roundLabel.replace(/\s*\(.*?\)/g, '') : m.roundLabel}</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-slate-300 text-[11px] pl-0 sm:pl-5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                {normalizeCourtName(m.court)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-sky-400 shrink-0" />
                {m.time}
              </span>
            </div>
          </div>



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
                Ottavi (1 set a 25, 1° con BYE) • Quarti • Semifinali (2/3 a 25 con TB a 15) • Finali
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

            {/* 3rd Place / Semifinalists */}
            <div className="bg-slate-900/90 border border-amber-700/60 rounded-2xl p-5 order-3 flex flex-col justify-between">
              <div>
                <span className="text-2xl mb-1 block">🥉</span>
                <span className="text-xs uppercase font-bold text-amber-600">3° Classificate (Semifinaliste)</span>
                <div className="mt-1 space-y-1">
                  {semifinalLosers.length > 0 ? (
                    semifinalLosers.map((t) => (
                      <h4 key={t.id} className="text-sm sm:text-base font-bold text-white">
                        {getTeamName(t)}
                      </h4>
                    ))
                  ) : (
                    <h4 className="text-base font-bold text-white">Semifinaliste</h4>
                  )}
                </div>
              </div>
              <span className="text-xs text-slate-500 mt-2 font-medium">Bronzo a pari merito</span>
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
              {quarterFinalsMode === 'single_set_25'
                ? '4 gare • Set a 25'
                : quarterFinalsMode === 'best_of_3_15'
                ? '4 gare • 2 su 3 a 15'
                : '4 gare • 2 su 3 a 25 (TB 15)'}
            </span>
          </div>

          <div className="space-y-3">{quarti.map((m) => renderMatchCard(m, m.position === 1))}</div>
        </div>

        {/* Column 3: Semifinali */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <h3 className="font-bold text-white text-sm">Semifinali</h3>
            <span className="text-[11px] text-sky-400">2 gare • 2 su 3 a 25 (TB a 15)</span>
          </div>

          <div className="space-y-4 pt-4">{semifinali.map((m) => renderMatchCard(m))}</div>
        </div>

        {/* Column 4: Grand Finale 1° e 2° Posto */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <h3 className="font-bold text-white text-sm">Grand Finale</h3>
            <span className="text-[11px] text-amber-400">1° e 2° Posto • Titolo 🏆</span>
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
          }
        }}
        onClose={() => setIsSimulateModalOpen(false)}
      />
    </div>
  );
}
