import React, { useState, useEffect, useRef } from 'react';
import { Team, Match } from '../types';
import {
  sortGroupStandings,
  parseTimeToMinutes,
  computeTeamStats,
  normalizeCourtName,
  reorderMatchesByShift,
  reorderMatchesBySwap,
} from '../utils';
import {
  Layers,
  Trophy,
  Clock,
  MapPin,
  CheckCircle2,
  Play,
  Edit3,
  Sparkles,
  Lock,
  Calendar,
  Filter,
  Dices,
  HelpCircle,
  GripVertical,
  ArrowLeftRight,
  ShieldAlert,
  Users,
  Check,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  MoveUp,
  MoveDown,
} from 'lucide-react';
import ConfirmModal from './ConfirmModal';

interface GroupsTabProps {
  teams: Team[];
  matches: Match[];
  isAdmin: boolean;
  isTournamentStarted?: boolean;
  onStartTournament?: () => Promise<void>;
  onSwapTeams?: (team1Id: string, team2Id: string) => Promise<void>;
  onRebalanceGroups?: () => Promise<void>;
  onOpenScoreModal: (match: Match) => void;
  onNavigateToAvulsa: () => void;
  onGenerateKnockout: () => Promise<void>;
  onSimulateGroupMatches?: () => Promise<void>;
  onBatchUpdateMatches?: (updatedMatches: Match[]) => Promise<void>;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning', title?: string) => void;
}

export default function GroupsTab({
  teams,
  matches,
  isAdmin,
  isTournamentStarted = false,
  onStartTournament,
  onSwapTeams,
  onRebalanceGroups,
  onOpenScoreModal,
  onNavigateToAvulsa,
  onGenerateKnockout,
  onSimulateGroupMatches,
  onBatchUpdateMatches,
  onShowToast,
}: GroupsTabProps) {
  const groupNames = ['Girone A', 'Girone B', 'Girone C', 'Girone D', 'Girone E'];
  const [viewMode, setViewMode] = useState<'groups' | 'chronological'>('groups');
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);

  // Drag and Drop State for Teams (Pre-Torneo)
  const [draggedTeamId, setDraggedTeamId] = useState<string | null>(null);
  const [dragOverTeamId, setDragOverTeamId] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);

  // Drag and Drop State for Matches (Chronological View Reordering)
  const [draggedMatchId, setDraggedMatchId] = useState<string | null>(null);
  const [dragOverMatchId, setDragOverMatchId] = useState<string | null>(null);
  const [selectedMatchForSwapId, setSelectedMatchForSwapId] = useState<string | null>(null);
  const [reorderMode, setReorderMode] = useState<'swap' | 'shift'>('swap');
  const [isReorderingMatches, setIsReorderingMatches] = useState<boolean>(false);
  const [matchToReorder, setMatchToReorder] = useState<Match | null>(null);
  const [modalReorderMode, setModalReorderMode] = useState<'swap' | 'shift'>('shift');

  // Auto-scroll state & animation loop during drag
  const dragClientYRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!draggedTeamId) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      dragClientYRef.current = null;
      return;
    }

    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
      dragClientYRef.current = e.clientY;
    };

    const handleGlobalDragEnd = () => {
      dragClientYRef.current = null;
    };

    window.addEventListener('dragover', handleGlobalDragOver, { passive: false });
    window.addEventListener('dragend', handleGlobalDragEnd);
    window.addEventListener('drop', handleGlobalDragEnd);

    // Continuous smooth auto-scroll loop
    const scrollStep = () => {
      const y = dragClientYRef.current;
      if (y !== null && y >= 0) {
        const topThreshold = 180;
        const bottomThreshold = window.innerHeight - 180;

        if (y < topThreshold) {
          const ratio = (topThreshold - y) / topThreshold;
          const speed = Math.max(4, Math.round(ratio * 28));
          window.scrollBy({ top: -speed, behavior: 'auto' });
        } else if (y > bottomThreshold && y <= window.innerHeight) {
          const ratio = (y - bottomThreshold) / (window.innerHeight - bottomThreshold);
          const speed = Math.max(4, Math.round(ratio * 28));
          window.scrollBy({ top: speed, behavior: 'auto' });
        }
      }
      animFrameRef.current = requestAnimationFrame(scrollStep);
    };

    animFrameRef.current = requestAnimationFrame(scrollStep);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      window.removeEventListener('dragover', handleGlobalDragOver);
      window.removeEventListener('dragend', handleGlobalDragEnd);
      window.removeEventListener('drop', handleGlobalDragEnd);
    };
  }, [draggedTeamId]);

  // Manual Swap Modal State (For mobile / tap-to-swap support)
  const [teamToSwap, setTeamToSwap] = useState<Team | null>(null);

  const getTeamName = (team: Team | null | undefined, fallback: string = 'TBD'): string => {
    if (!team) return fallback;
    const found = teams.find((t) => t.id === team.id);
    return found ? found.name : team.name || fallback;
  };

  const groupMatches = matches.filter((m) => m.phase === 'gironi' || m.groupName);
  const completedGroupMatches = groupMatches.filter((m) => m.status === 'completed');
  const totalGroupMatches = groupMatches.length || 15;
  const isGroupStageComplete = groupMatches.length === 15 && completedGroupMatches.length === 15;

  const hasGroupsGenerated = groupMatches.length > 0 || teams.some((t) => !!t.group);
  const isKnockoutGenerated = matches.some((m) => m.phase === 'eliminazione' || (m.round && m.round >= 2));

  if (teams.length < 15 || !hasGroupsGenerated) {
    return (
      <div
        id="groups-not-ready"
        className="bg-zinc-950/80 border border-zinc-800 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-xl space-y-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">Gironi non ancora generati</h3>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          {teams.length < 15
            ? `Il torneo prevede 15 squadre. Attualmente ci sono ${teams.length} squadre iscritte.`
            : 'Le 15 squadre sono iscritte. Avvia la generazione dei 5 gironi dalla scheda "Squadre" per sbloccare la composizione e le partite dei gironi.'}
        </p>
        <div className="inline-block bg-zinc-900 border border-zinc-700 text-amber-300 text-xs px-4 py-2 rounded-xl font-medium">
          {teams.length < 15
            ? 'Completa le 15 iscrizioni nella scheda "Squadre".'
            : 'Vai nella scheda "Squadre" e clicca su "Genera i 5 gironi".'}
        </div>
      </div>
    );
  }

  // Drag and Drop Event Handlers (Strictly target-team specific)
  const handleDragStart = (e: React.DragEvent, teamId: string) => {
    if (isTournamentStarted || isSwapping) {
      e.preventDefault();
      return;
    }
    setDraggedTeamId(teamId);
    e.dataTransfer.setData('text/plain', teamId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTeamId(null);
    setDragOverTeamId(null);
  };

  const handleDragOverTeam = (e: React.DragEvent, targetTeamId: string) => {
    if (isTournamentStarted || isSwapping) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTeamId !== targetTeamId) {
      setDragOverTeamId(targetTeamId);
    }
  };

  const handleDropOnTeam = async (e: React.DragEvent, targetTeamId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (isTournamentStarted || isSwapping) return;

    const sourceTeamId = e.dataTransfer.getData('text/plain') || draggedTeamId;
    if (sourceTeamId && sourceTeamId !== targetTeamId && onSwapTeams) {
      try {
        setIsSwapping(true);
        await onSwapTeams(sourceTeamId, targetTeamId);
      } finally {
        setIsSwapping(false);
      }
    }
    handleDragEnd();
  };

  // Chronologically sorted matches (Ordered by start time)
  const chronologicalMatches = [...groupMatches].sort((a, b) => {
    const tA = parseTimeToMinutes(a.time);
    const tB = parseTimeToMinutes(b.time);
    if (tA !== tB) return tA - tB;
    return a.court.localeCompare(b.court);
  });

  const pendingChronologicalMatches = chronologicalMatches.filter((m) => m.status !== 'completed');

  // Match Reordering Drag and Drop Logic (Elenco Gare)
  const handleMatchDragStart = (e: React.DragEvent, matchId: string) => {
    const match = groupMatches.find((m) => m.id === matchId);
    if (!isAdmin || !match || match.status === 'completed' || isReorderingMatches) return;
    e.dataTransfer.setData('text/plain', matchId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedMatchId(matchId);
  };

  const handleMatchDragOver = (e: React.DragEvent, matchId: string) => {
    const targetMatch = groupMatches.find((m) => m.id === matchId);
    if (
      !isAdmin ||
      !draggedMatchId ||
      draggedMatchId === matchId ||
      !targetMatch ||
      targetMatch.status === 'completed' ||
      isReorderingMatches
    ) {
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverMatchId !== matchId) {
      setDragOverMatchId(matchId);
    }
  };

  const handleMatchDragEnd = () => {
    setDraggedMatchId(null);
    setDragOverMatchId(null);
  };

  // Touch Drag & Drop Handlers for Mobile / iOS
  const handleMatchTouchStart = (e: React.TouchEvent, matchId: string) => {
    const match = groupMatches.find((m) => m.id === matchId);
    if (!isAdmin || !match || match.status === 'completed' || isReorderingMatches) return;
    setDraggedMatchId(matchId);
  };

  const handleMatchTouchMove = (e: React.TouchEvent) => {
    if (!draggedMatchId) return;
    const touch = e.touches[0];
    if (!touch) return;
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!targetElement) return;
    const cardElement = targetElement.closest('[data-chrono-match-id]');
    if (cardElement) {
      const targetId = cardElement.getAttribute('data-chrono-match-id');
      if (targetId && targetId !== draggedMatchId) {
        const targetMatch = groupMatches.find((m) => m.id === targetId);
        if (targetMatch && targetMatch.status !== 'completed') {
          setDragOverMatchId(targetId);
        }
      }
    }
  };

  const handleMatchTouchEnd = async () => {
    const sourceId = draggedMatchId;
    const targetId = dragOverMatchId;
    setDraggedMatchId(null);
    setDragOverMatchId(null);
    if (!sourceId || !targetId || sourceId === targetId || !isAdmin) return;
    await executeMatchReorder(sourceId, targetId, reorderMode);
  };

  const handleCardTapSelect = async (matchId: string) => {
    if (!isAdmin) return;
    const match = groupMatches.find((m) => m.id === matchId);
    if (!match || match.status === 'completed' || isReorderingMatches) return;

    if (!selectedMatchForSwapId) {
      setSelectedMatchForSwapId(matchId);
    } else if (selectedMatchForSwapId === matchId) {
      setSelectedMatchForSwapId(null);
    } else {
      const sourceId = selectedMatchForSwapId;
      setSelectedMatchForSwapId(null);
      await executeMatchReorder(sourceId, matchId, reorderMode);
    }
  };

  const executeMatchReorder = async (
    sourceId: string,
    targetId: string,
    mode: 'swap' | 'shift'
  ) => {
    if (!onBatchUpdateMatches) return;

    const sourceMatch = groupMatches.find((m) => m.id === sourceId);
    const targetMatch = groupMatches.find((m) => m.id === targetId);
    if (!sourceMatch || !targetMatch) return;

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

    try {
      setIsReorderingMatches(true);
      const result =
        mode === 'shift'
          ? reorderMatchesByShift(groupMatches, sourceId, targetId)
          : reorderMatchesBySwap(groupMatches, sourceId, targetId);

      if (!result.success) {
        if (onShowToast) {
          onShowToast(result.error || 'Impossibile riordinare le gare.', 'error', 'Errore');
        }
        return;
      }

      await onBatchUpdateMatches(result.updated);
      if (onShowToast) {
        if (mode === 'shift') {
          onShowToast(
            `Gara "${sourceMatch.roundLabel}" riposizionata con slittamento sequenziale degli orari da disputare.`,
            'success',
            'Slittamento Eseguito'
          );
        } else {
          onShowToast(
            `Orari scambiati tra "${sourceMatch.roundLabel}" e "${targetMatch.roundLabel}".`,
            'success',
            'Inversione Eseguita'
          );
        }
      }
    } catch (err) {
      console.error('Error reordering matches:', err);
      if (onShowToast) {
        onShowToast('Errore durante lo spostamento delle gare.', 'error', 'Errore');
      }
    } finally {
      setIsReorderingMatches(false);
    }
  };

  const handleMatchDrop = async (e: React.DragEvent, targetMatchId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedMatchId;
    handleMatchDragEnd();

    if (!sourceId || sourceId === targetMatchId || !isAdmin) return;
    await executeMatchReorder(sourceId, targetMatchId, reorderMode);
  };

  const handleMoveMatchStep = async (matchId: string, direction: -1 | 1) => {
    const currentIdx = pendingChronologicalMatches.findIndex((m) => m.id === matchId);
    if (currentIdx === -1) return;
    const targetIdx = currentIdx + direction;
    if (targetIdx < 0 || targetIdx >= pendingChronologicalMatches.length) return;

    const targetMatch = pendingChronologicalMatches[targetIdx];
    await executeMatchReorder(matchId, targetMatch.id, reorderMode);
  };

  // Group teams mapping
  const groupTeamsMap: Record<string, Team[]> = {
    'Girone A': [],
    'Girone B': [],
    'Girone C': [],
    'Girone D': [],
    'Girone E': [],
  };
  teams.forEach((t) => {
    let g = t.group;
    if (!g) {
      const matchWithGroup = groupMatches.find((m) => m.team1?.id === t.id || m.team2?.id === t.id);
      g = matchWithGroup?.groupName || (matchWithGroup?.team1?.id === t.id ? matchWithGroup.team1.group : matchWithGroup?.team2?.group) || 'Girone A';
    }
    if (groupTeamsMap[g]) {
      groupTeamsMap[g].push({ ...t, group: g });
    }
  });

  const isGroupsImbalanced = groupNames.some((g) => (groupTeamsMap[g] || []).length !== 3);

  /* ------------------------------------------------------------- */
  /* PHASE 1: PRE-TORNEO (Gironi in Card Mode con Drag & Drop)    */
  /* ------------------------------------------------------------- */
  if (!isTournamentStarted) {
    return (
      <div id="groups-tab-container" className="space-y-6 max-w-6xl mx-auto relative">
        {/* Visual Auto-Scroll Assist Bars when Dragging */}
        {draggedTeamId && (
          <>
            <div
              id="drag-autoscroll-top-zone"
              onDragOver={(e) => {
                e.preventDefault();
                window.scrollBy({ top: -35, behavior: 'auto' });
              }}
              className="fixed top-12 left-0 right-0 z-50 bg-amber-500/95 text-slate-950 font-black py-2.5 px-4 text-center text-xs shadow-2xl flex items-center justify-center gap-2 border-b border-amber-300 backdrop-blur-md cursor-pointer select-none"
            >
              <ChevronUp className="w-4 h-4 animate-bounce" />
              <span>Trascina qui per scorrere la pagina verso l'alto</span>
              <ChevronUp className="w-4 h-4 animate-bounce" />
            </div>

            <div
              id="drag-autoscroll-bottom-zone"
              onDragOver={(e) => {
                e.preventDefault();
                window.scrollBy({ top: 35, behavior: 'auto' });
              }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-amber-500/95 text-slate-950 font-black py-2.5 px-4 text-center text-xs shadow-2xl flex items-center justify-center gap-2 border-t border-amber-300 backdrop-blur-md cursor-pointer select-none"
            >
              <ChevronDown className="w-4 h-4 animate-bounce" />
              <span>Trascina qui per scorrere la pagina verso il basso</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </div>
          </>
        )}

        {/* Imbalance Warning Banner with Auto-Rebalance Action */}
        {isGroupsImbalanced && (
          <div
            id="groups-imbalance-banner"
            className="bg-amber-500/15 border border-amber-500/40 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-amber-200"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-0.5 text-center sm:text-left">
                <h4 className="text-sm font-bold text-amber-300">Distribuzione squadre non uniforme</h4>
                <p className="text-xs text-slate-300">
                  Tutti i 5 gironi devono contenere esattamente 3 squadre. Ribilancia i gironi per continuare.
                </p>
              </div>
            </div>
            {isAdmin && onRebalanceGroups && (
              <button
                id="rebalance-groups-btn"
                onClick={onRebalanceGroups}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer whitespace-nowrap transition transform active:scale-95"
              >
                Ribilancia a 3 squadre per girone
              </button>
            )}
          </div>
        )}

        {/* Pre-Tournament Header Card with "Inizio Torneo" Action */}
        <div
          id="groups-prestart-header-card"
          className="bg-zinc-950/90 border border-zinc-800/90 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
            <div className="p-3.5 bg-amber-500/15 text-amber-400 rounded-2xl border border-amber-500/30 shadow-inner flex items-center justify-center shrink-0">
              <Layers className="w-7 h-7 text-amber-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                <h2 className="text-2xl font-black text-white tracking-tight">Composizione Gironi</h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <ArrowLeftRight className="w-3 h-3" />
                  Drag & Drop Attivo
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Trascina le squadre per scambiarle tra i 5 gironi. Quando la composizione è definitiva, clicca su{' '}
                <strong className="text-amber-300 font-semibold">Inizio Torneo</strong> per bloccare i gironi e attivare classifiche e calendario gare.
              </p>
            </div>
          </div>

          {/* Action Button: Inizio Torneo */}
          <div className="flex items-center justify-center md:justify-end gap-3 w-full md:w-auto shrink-0">
            <button
              id="start-tournament-btn"
              onClick={() => {
                if (isGroupsImbalanced) {
                  if (onShowToast) {
                    onShowToast(
                      'Tutti i 5 gironi devono contenere esattamente 3 squadre prima di iniziare il torneo.',
                      'warning',
                      'Gironi non uniformi'
                    );
                  }
                  return;
                }
                setIsStartModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 transition transform active:scale-95 cursor-pointer border border-amber-300/40"
            >
              <Play className="w-4 h-4 fill-current text-slate-950" />
              <span>Inizio Torneo</span>
            </button>
          </div>
        </div>

        {/* 5 Group Cards Grid (Card Mode) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groupNames.map((gName, gIdx) => {
            const gTeams = groupTeamsMap[gName] || [];

            return (
              <div
                key={gName}
                id={`group-card-${gName.replace(/\s+/g, '-').toLowerCase()}`}
                className="bg-zinc-950/80 border border-zinc-800/90 hover:border-zinc-700 rounded-3xl p-5 shadow-xl transition-all flex flex-col justify-between"
              >
                {/* Group Card Header */}
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-sm flex items-center justify-center shadow-inner">
                      {String.fromCharCode(65 + gIdx)}
                    </span>
                    <div>
                      <h3 className="text-base font-black text-white">{gName}</h3>
                      <span className="text-[11px] text-slate-400">Set unico a 25 punti</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-slate-300">
                    {gTeams.length} / 3 Squadre
                  </span>
                </div>

                {/* Team Items inside Group Card with Drag & Drop */}
                <div className="space-y-2.5 flex-1">
                  {gTeams.map((team, idx) => {
                    const isDragging = draggedTeamId === team.id;
                    const isDragOver = dragOverTeamId === team.id;

                    return (
                      <div
                        key={team.id}
                        id={`team-item-${team.id}`}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, team.id)}
                        onDragEnd={handleDragEnd}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (dragOverTeamId !== team.id) setDragOverTeamId(team.id);
                        }}
                        onDragOver={(e) => handleDragOverTeam(e, team.id)}
                        onDragLeave={(e) => {
                          e.stopPropagation();
                          if (dragOverTeamId === team.id && e.currentTarget === e.target) {
                            setDragOverTeamId(null);
                          }
                        }}
                        onDrop={(e) => handleDropOnTeam(e, team.id)}
                        className={`group relative border rounded-2xl p-3.5 transition-all flex items-center justify-between gap-3 select-none cursor-grab active:cursor-grabbing ${
                          isDragging
                            ? 'opacity-40 border-dashed border-amber-400 bg-zinc-900'
                            : isDragOver
                            ? 'border-amber-400 bg-amber-500/10 scale-[1.02] shadow-lg shadow-amber-500/20'
                            : 'border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-700'
                        }`}
                      >
                        {/* Drag Handle & Team Information */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="text-zinc-500 group-hover:text-amber-400 transition shrink-0">
                            <GripVertical className="w-4 h-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-zinc-500">{idx + 1}.</span>
                              <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-amber-300 transition">
                                {team.name}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                                  team.level === 'Avanzato'
                                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                    : team.level === 'Intermedio'
                                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                }`}
                              >
                                {team.level}
                              </span>
                              {team.players && team.players.length > 0 && (
                                <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                                  <Users className="w-3 h-3 text-zinc-500" />
                                  {team.players.length} atleti
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick Swap Button (For Mobile/Touch Screen Tap) */}
                        <button
                          id={`swap-btn-${team.id}`}
                          onClick={() => setTeamToSwap(team)}
                          className="p-2 rounded-xl bg-zinc-800/80 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-300 border border-zinc-700/60 hover:border-amber-500/40 transition cursor-pointer shrink-0"
                          title="Scambia con un'altra squadra"
                          aria-label={`Scambia ${team.name} con un'altra squadra`}
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Quick Swap Picker for Mobile/Accessibility */}
        {teamToSwap && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/15 text-amber-400 rounded-xl border border-amber-500/30">
                    <ArrowLeftRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Scambia Squadra</h3>
                    <p className="text-xs text-slate-400">
                      Scambia <strong className="text-amber-300">{teamToSwap.name}</strong> ({teamToSwap.group})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTeamToSwap(null)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Seleziona la squadra con cui vuoi scambiare posto:
              </p>

              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {groupNames
                  .filter((g) => g !== teamToSwap.group)
                  .map((gName) => {
                    const gTeams = groupTeamsMap[gName] || [];
                    return (
                      <div key={gName} className="space-y-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                          {gName}
                        </span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {gTeams.map((t) => (
                            <button
                              key={t.id}
                              onClick={async () => {
                                if (onSwapTeams) {
                                  await onSwapTeams(teamToSwap.id, t.id);
                                }
                                setTeamToSwap(null);
                              }}
                              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-amber-500/15 border border-zinc-800 hover:border-amber-500/40 text-left flex items-center justify-between transition cursor-pointer"
                            >
                              <div>
                                <span className="text-xs font-bold text-white block">{t.name}</span>
                                <span className="text-[10px] text-slate-400">{t.level}</span>
                              </div>
                              <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-500 hover:text-amber-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="pt-2 border-t border-zinc-800 flex justify-end">
                <button
                  onClick={() => setTeamToSwap(null)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-slate-300 text-xs font-bold rounded-xl border border-zinc-700 transition cursor-pointer"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Start Tournament Confirmation */}
        <ConfirmModal
          isOpen={isStartModalOpen}
          title="Inizio Torneo Notturno"
          message="Sei sicuro di voler avviare il torneo? I 5 gironi verranno bloccati definitivamente, il calendario delle 15 partite verrà finalizzato e non sarà più possibile scambiare squadre tra i gironi. Si passerà alla visualizzazione delle classifiche e delle partite."
          confirmLabel="Inizia Torneo Ufficialmente"
          onConfirm={async () => {
            if (onStartTournament) {
              await onStartTournament();
            }
            setIsStartModalOpen(false);
          }}
          onClose={() => setIsStartModalOpen(false)}
        />
      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /* PHASE 2: POST-INIZIO TORNEO (Strictly 2 Views: Gironi / Gare)  */
  /* ------------------------------------------------------------- */
  return (
    <div id="groups-tab-container" className="space-y-6 max-w-6xl mx-auto">
      {/* Header Info & Actions */}
      <div
        id="groups-header-card"
        className="bg-zinc-950/90 border border-zinc-800/90 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
          <div className="p-3.5 bg-sky-500/15 text-sky-400 rounded-2xl border border-sky-500/30 shadow-inner flex items-center justify-center shrink-0">
            <Layers className="w-7 h-7 text-sky-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
              <h2 className="text-2xl font-black text-white tracking-tight">Fase 1: Gironi di Qualificazione</h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 uppercase tracking-wider">
                <Lock className="w-3 h-3" />
                TORNEO IN CORSO
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 w-full md:w-auto shrink-0">
          {/* Group Match Progress Counter */}
          <div className="px-3.5 py-2 bg-zinc-900 border border-zinc-700/80 rounded-xl flex items-center gap-2 text-xs shadow-sm">
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
              <span>Simula Gare</span>
            </button>
          )}
        </div>
      </div>

      {/* Banner Notifica: Tutte le gare dei gironi completate -> Tasto Genera Tabellone */}
      {isGroupStageComplete && (
        <div
          id="group-stage-completed-banner"
          className="bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-amber-500/20 border-2 border-amber-400/60 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5 backdrop-blur-md"
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="p-3.5 bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 rounded-2xl shrink-0 shadow-lg shadow-amber-500/25">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h3 className="text-lg font-black text-white">Fase a Gironi Conclusa (15/15 Gare Disputate)!</h3>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-[11px] font-bold">
                  Classifiche Definitive
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Tutti i punteggi sono stati registrati. La Classifica Avulsa (1ª-15ª) è calcolata: puoi ora generare il Tabellone ad Eliminazione Diretta (Ottavi, Quarti, Semifinali e Finali).
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              id="banner-generate-bracket-btn"
              disabled={isKnockoutGenerated}
              onClick={onGenerateKnockout}
              className={`w-full md:w-auto px-6 py-3.5 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition shrink-0 border ${
                isKnockoutGenerated
                  ? 'bg-zinc-800 text-zinc-400 border-zinc-700 cursor-not-allowed opacity-70'
                  : 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-200 text-slate-950 shadow-amber-500/30 transform active:scale-95 cursor-pointer border-amber-200'
              }`}
            >
              <Trophy className={`w-4 h-4 ${isKnockoutGenerated ? 'text-zinc-400' : 'fill-slate-950'}`} />
              <span>{isKnockoutGenerated ? 'Tabellone Già Generato' : 'Genera Tabellone'}</span>
            </button>
          )}
        </div>
      )}

      {/* Main View Mode Switcher - EXACTLY 2 VIEWS AS REQUESTED:
          1. Vista gironi (visualizza in sequenza tutti i gironi con classifiche e partite)
          2. Elenco gare (Tutte le gare ordinate in ordine di inizio) */}
      <div className="flex justify-center sm:justify-start items-center gap-2 bg-zinc-950/80 border border-zinc-800 rounded-2xl p-2">
        <button
          id="view-mode-groups-btn"
          onClick={() => setViewMode('groups')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            viewMode === 'groups'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Vista Gironi</span>
        </button>

        <button
          id="view-mode-chrono-btn"
          onClick={() => setViewMode('chronological')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            viewMode === 'chronological'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Elenco Gare</span>
        </button>
      </div>

      {/* VISTA 1: VISTA GIRONI (Visualizza in sequenza tutti i gironi con classifiche e partite) */}
      {viewMode === 'groups' && (
        <div className="space-y-6">
          {groupNames.map((groupName, gIdx) => {
            const computedTeams = computeTeamStats(teams, groupMatches);
            const gMatches = groupMatches.filter((m) => m.groupName === groupName);
            const groupTeamIds = new Set<string>();
            computedTeams.filter((t) => t.group === groupName).forEach((t) => groupTeamIds.add(t.id));
            gMatches.forEach((m) => {
              if (m.team1?.id) groupTeamIds.add(m.team1.id);
              if (m.team2?.id) groupTeamIds.add(m.team2.id);
            });
            const groupTeams = computedTeams.filter((t) => groupTeamIds.has(t.id));
            const sortedTeams = sortGroupStandings(groupTeams, gMatches);

            return (
              <div
                key={groupName}
                id={`group-section-${groupName.replace(/\s+/g, '-').toLowerCase()}`}
                className="bg-zinc-950/80 border border-zinc-800/90 rounded-3xl p-6 shadow-xl space-y-6"
              >
                {/* Group Title */}
                <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-sm flex items-center justify-center shadow-inner">
                      {String.fromCharCode(65 + gIdx)}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-white">{groupName}</h3>
                      <span className="text-xs text-slate-400">Classifica e Gare Girone</span>
                    </div>
                  </div>
                  <span className="text-xs bg-zinc-900 text-slate-400 px-3 py-1 rounded-full border border-zinc-800 font-medium">
                    Set unico a 25 punti
                  </span>
                </div>

                {/* Standings Table for this Group */}
                <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-[10px] sm:text-xs font-semibold uppercase text-slate-400 bg-zinc-900/60">
                        <th className="py-2.5 px-2 sm:px-3 rounded-l-xl text-center w-10">Pos</th>
                        <th className="py-2.5 px-2 sm:px-3 min-w-[120px] sm:min-w-[150px]">Squadra</th>
                        {isAdmin && <th className="py-2.5 px-2 sm:px-3 text-center">Livello</th>}
                        <th className="py-2.5 px-2 sm:px-3 text-center font-bold text-amber-400">Punti</th>
                        <th className="py-2.5 px-1.5 sm:px-3 text-center">V-P</th>
                        <th className="py-2.5 px-1.5 sm:px-3 text-center">Set V-P</th>
                        <th className="py-2.5 px-1.5 sm:px-3 text-center">Punti V-P</th>
                        <th className="py-2.5 px-1.5 sm:px-3 text-center rounded-r-xl">Diff</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 text-xs sm:text-sm">
                      {sortedTeams.map((team, idx) => {
                        const diff = team.pointsWon - team.pointsLost;
                        return (
                          <tr key={team.id} className="hover:bg-zinc-900/40 transition">
                            <td className="py-2.5 px-2 sm:px-3 text-center">
                              <span
                                className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-xs font-bold ${
                                  idx === 0
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : idx === 1
                                    ? 'bg-zinc-800 text-slate-300'
                                    : 'bg-zinc-900 text-slate-400'
                                }`}
                              >
                                {idx + 1}°
                              </span>
                            </td>
                            <td className="py-2.5 px-2 sm:px-3 font-semibold text-white text-xs sm:text-sm leading-snug break-words whitespace-normal">
                              {getTeamName(team)}
                            </td>
                            {isAdmin && (
                              <td className="py-2.5 px-2 sm:px-3 text-center">
                                <span className="text-[10px] sm:text-xs bg-zinc-900 text-slate-300 px-2 py-0.5 rounded border border-zinc-800 whitespace-nowrap">
                                  {team.level}
                                </span>
                              </td>
                            )}
                            <td className="py-2.5 px-2 sm:px-3 text-center font-bold text-amber-400 text-sm sm:text-base">
                              {team.points}
                            </td>
                            <td className="py-2.5 px-1.5 sm:px-3 text-center text-slate-300 text-[11px] sm:text-xs font-mono whitespace-nowrap">
                              {team.wins}-{team.losses}
                            </td>
                            <td className="py-2.5 px-1.5 sm:px-3 text-center text-slate-300 text-[11px] sm:text-xs font-mono whitespace-nowrap">
                              {team.setsWon}-{team.setsLost}
                            </td>
                            <td className="py-2.5 px-1.5 sm:px-3 text-center text-slate-300 text-[11px] sm:text-xs font-mono whitespace-nowrap">
                              {team.pointsWon}-{team.pointsLost}
                            </td>
                            <td
                              className={`py-2.5 px-1.5 sm:px-3 text-center font-semibold text-[11px] sm:text-xs ${
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
                          className={`border rounded-2xl p-4 transition flex flex-col justify-between ${
                            isCompleted
                              ? 'bg-zinc-900/80 border-zinc-700/80'
                              : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-center text-[11px] sm:text-xs text-slate-400 mb-2.5">
                              <span className="flex items-center gap-1 text-slate-300 font-semibold">
                                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                                {normalizeCourtName(match.court)}
                              </span>
                              <span className="flex items-center gap-1 font-mono text-sky-400 font-bold">
                                <Clock className="w-3 h-3 text-sky-400 shrink-0" />
                                {match.time || '20:30'}
                              </span>
                            </div>

                            <div className="space-y-2">
                              <div
                                className={`flex justify-between items-center gap-2 ${
                                  match.winnerId === match.team1?.id ? 'text-amber-400 font-bold' : 'text-slate-200'
                                }`}
                              >
                                <span className="text-xs sm:text-sm font-semibold break-words leading-tight flex-1">
                                  {getTeamName(match.team1)}
                                </span>
                                <span className="text-xs sm:text-sm font-mono font-bold px-2 py-0.5 bg-zinc-950 rounded shrink-0">
                                  {set1 ? set1.team1 : '-'}
                                </span>
                              </div>

                              <div
                                className={`flex justify-between items-center gap-2 ${
                                  match.winnerId === match.team2?.id ? 'text-amber-400 font-bold' : 'text-slate-200'
                                }`}
                              >
                                <span className="text-xs sm:text-sm font-semibold break-words leading-tight flex-1">
                                  {getTeamName(match.team2)}
                                </span>
                                <span className="text-xs sm:text-sm font-mono font-bold px-2 py-0.5 bg-zinc-950 rounded shrink-0">
                                  {set1 ? set1.team2 : '-'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-zinc-800 flex justify-between items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                                isCompleted
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : match.status === 'live'
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse'
                                  : 'bg-zinc-800 text-slate-400'
                              }`}
                            >
                              {isCompleted ? 'Terminata' : match.status === 'live' ? 'In Corso' : 'Da Giocare'}
                            </span>

                            {isAdmin && (
                              <button
                                id={`edit-score-btn-${match.id}`}
                                onClick={() => onOpenScoreModal(match)}
                                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>{isCompleted ? 'Modifica' : 'Punteggio / Ora'}</span>
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

          {/* FIPAV Rules Card */}
          <div id="fipav-rules-card" className="bg-zinc-950/60 border border-zinc-800 rounded-3xl p-5 shadow-lg">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-2.5">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              Criteri di Classifica nei Gironi (Art. 42 Regolamento Gare FIPAV)
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              In caso di arrivo a pari punti di due o più squadre all'interno dello stesso girone, la graduatoria viene determinata secondo il seguente ordine di priorità:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3">
                <span className="text-amber-400 font-bold block mb-1">1. Gare Vinte</span>
                <span className="text-slate-300">Maggior numero di partite vinte nell'arco del girone.</span>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3">
                <span className="text-amber-400 font-bold block mb-1">2. Quoziente Set</span>
                <span className="text-slate-300">Rapporto tra set vinti e set persi (Set Vinti / Set Persi).</span>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3">
                <span className="text-amber-400 font-bold block mb-1">3. Quoziente Punti</span>
                <span className="text-slate-300">Rapporto tra punti fatti e subiti (Punti Fatti / Punti Subiti).</span>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3">
                <span className="text-amber-400 font-bold block mb-1">4. Scontri Diretti</span>
                <span className="text-slate-300">Esito delle partite giocate tra le squadre in situazione di parità.</span>
              </div>
            </div>
          </div>

          {/* Bottom Genera Tabellone CTA in Vista Gironi */}
          {isGroupStageComplete && (
            <div className="bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-amber-500/20 border-2 border-amber-400/50 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <span className="text-base font-black text-white block">Tutte le 15 partite dei gironi sono state disputate!</span>
                <span className="text-xs text-slate-300">La classifica di ogni girone e la classifica avulsa generale sono definitive. Puoi generare il tabellone a eliminazione diretta.</span>
              </div>
              {isAdmin && (
                <button
                  disabled={isKnockoutGenerated}
                  onClick={onGenerateKnockout}
                  className={`w-full sm:w-auto px-6 py-3 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition shrink-0 ${
                    isKnockoutGenerated
                      ? 'bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-not-allowed opacity-70'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/30 cursor-pointer'
                  }`}
                >
                  <Trophy className={`w-4 h-4 ${isKnockoutGenerated ? 'text-zinc-400' : 'fill-slate-950'}`} />
                  <span>{isKnockoutGenerated ? 'Tabellone Già Generato' : 'Genera Tabellone'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: ELENCO GARE (Tutte le 15 gare ordinate in ordine di inizio) */}
      {viewMode === 'chronological' && (
        <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>Elenco Gare</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Gare ordinate per ora inizio {isAdmin && '• Trascina le gare per riordinare gli orari'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Selector for Drag & Drop Reordering Mode */}
              {isAdmin && (
                <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-2xl text-xs">
                  <button
                    type="button"
                    onClick={() => setReorderMode('swap')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      reorderMode === 'swap'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-zinc-800'
                    }`}
                    title="Inversione oraria: Scambia l'orario direttamente tra le due gare trascinate"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Inversione (Swap)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReorderMode('shift')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      reorderMode === 'shift'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-zinc-800'
                    }`}
                    title="Slittamento sequenziale: Sposta la gara e fa slittare gli orari in sequenza ordinata"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>Slittamento (Shift)</span>
                  </button>
                </div>
              )}

              <span className="text-xs bg-zinc-900 text-slate-300 font-semibold px-3 py-1.5 rounded-xl border border-zinc-700">
                {chronologicalMatches.length} gare
              </span>
            </div>
          </div>

          {isAdmin && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs text-amber-300/90 gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Modalità {reorderMode === 'swap' ? 'Inversione' : 'Slittamento'}:</strong>{' '}
                  {reorderMode === 'swap'
                    ? "Trascina una riga gara sopra un'altra (o usa le frecce su/giù) per scambiare i rispettivi orari di gioco."
                    : "Trascina una gara nella nuova posizione (o usa le frecce su/giù): tutti gli orari slitteranno in automatico senza creare sovrapposizioni."}
                </span>
              </div>
              {isReorderingMatches && (
                <span className="text-amber-400 font-bold animate-pulse shrink-0">Salvataggio in corso...</span>
              )}
            </div>
          )}

          <div className="space-y-3">
            {chronologicalMatches.map((m, mIdx) => {
              const isCompleted = m.status === 'completed';
              const set1 = m.sets && m.sets[0] ? m.sets[0] : null;
              const isDraggingThis = draggedMatchId === m.id;
              const isDragOverThis = dragOverMatchId === m.id;
              const isSelectedForSwap = selectedMatchForSwapId === m.id;
              const pendingIdx = pendingChronologicalMatches.findIndex((p) => p.id === m.id);
              const isFirstPending = pendingIdx === 0;
              const isLastPending = pendingIdx === pendingChronologicalMatches.length - 1;

              return (
                <div
                  key={m.id}
                  id={`chrono-match-row-${m.id}`}
                  data-chrono-match-id={m.id}
                  draggable={isAdmin && !isCompleted && !isReorderingMatches}
                  onDragStart={(e) => !isCompleted && handleMatchDragStart(e, m.id)}
                  onDragEnter={(e) => {
                    if (!isAdmin || isCompleted || isReorderingMatches) return;
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
                  onTouchMove={handleMatchTouchMove}
                  onTouchEnd={handleMatchTouchEnd}
                  className={`p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl transition duration-150 ${
                    isDraggingThis
                      ? 'opacity-40 border-2 border-dashed border-amber-400 bg-amber-500/5'
                      : isDragOverThis || isSelectedForSwap
                      ? 'border-2 border-amber-400 bg-amber-500/15 scale-[1.01] shadow-xl shadow-amber-500/20'
                      : isCompleted
                      ? 'bg-zinc-950/60 border-2 border-zinc-700/80 sm:border-zinc-800/80 opacity-90 shadow-md'
                      : 'bg-zinc-900/80 sm:bg-zinc-900/40 hover:bg-zinc-900 border-2 border-zinc-700/90 sm:border-zinc-800/80 shadow-md'
                  }`}
                >
                  {/* Left: Drag Handle, Quick Move Arrows, Time, Court, Round Label */}
                  <div className="flex items-center gap-2 sm:gap-3 md:w-1/3">
                    {isAdmin && (
                      <div className="flex items-center gap-1 shrink-0">
                        {isCompleted ? (
                          <div
                            className="p-1 text-zinc-600 rounded-lg"
                            title="Gara già disputata (orario fisso non modificabile)"
                          >
                            <Lock className="w-4 h-4" />
                          </div>
                        ) : (
                          <>
                            {/* Drag / Touch / Tap Handle */}
                            <button
                              type="button"
                              onTouchStart={(e) => handleMatchTouchStart(e, m.id)}
                              onClick={() => handleCardTapSelect(m.id)}
                              className={`p-1.5 text-zinc-400 hover:text-amber-400 active:text-amber-300 rounded-xl hover:bg-zinc-800 transition cursor-grab active:cursor-grabbing touch-none ${
                                isSelectedForSwap ? 'text-amber-400 bg-amber-500/20 border border-amber-400/50' : ''
                              }`}
                              title="Trascina o tocca per selezionare e scambiare l'ora della gara"
                            >
                              <GripVertical className="w-4 h-4" />
                            </button>
                            {/* Step Move Up/Down buttons */}
                            <div className="flex items-center gap-1.5">
                              <div className="flex flex-col gap-0.5">
                                <button
                                  type="button"
                                  disabled={isFirstPending || isReorderingMatches}
                                  onClick={() => handleMoveMatchStep(m.id, -1)}
                                  className="w-7 h-7 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 active:bg-amber-500/20 text-zinc-300 hover:text-amber-300 disabled:opacity-20 disabled:hover:text-zinc-400 rounded-lg transition cursor-pointer border border-zinc-700/50"
                                  title="Anticipa orario"
                                >
                                  <MoveUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={isLastPending || isReorderingMatches}
                                  onClick={() => handleMoveMatchStep(m.id, 1)}
                                  className="w-7 h-7 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 active:bg-amber-500/20 text-zinc-300 hover:text-amber-300 disabled:opacity-20 disabled:hover:text-zinc-400 rounded-lg transition cursor-pointer border border-zinc-700/50"
                                  title="Posticipa orario"
                                >
                                  <MoveDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <div className="w-12 sm:w-14 text-center py-1 bg-zinc-900 text-sky-400 font-mono font-bold text-xs sm:text-sm rounded-xl border border-zinc-800 shrink-0">
                      {m.time || '20:30'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-300 font-semibold">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        {normalizeCourtName(m.court)}
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 block">{m.roundLabel}</span>
                    </div>
                  </div>

                  {/* Center: Teams & Score */}
                  <div className="flex-1 grid grid-cols-5 items-center bg-zinc-900/60 border border-zinc-800/80 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 gap-1 sm:gap-2">
                    <div className="col-span-2 text-left">
                      <span
                        className={`text-xs sm:text-sm font-semibold break-words whitespace-normal leading-tight block ${
                          m.winnerId === m.team1?.id ? 'text-amber-400 font-bold' : 'text-white'
                        }`}
                      >
                        {getTeamName(m.team1)}
                      </span>
                    </div>

                    <div className="col-span-1 text-center font-mono font-bold text-xs sm:text-sm">
                      {isCompleted && set1 ? (
                        <span className="bg-zinc-950 px-2 py-0.5 rounded text-amber-300 whitespace-nowrap">
                          {set1.team1}-{set1.team2}
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-[10px] sm:text-xs">VS</span>
                      )}
                    </div>

                    <div className="col-span-2 text-right">
                      <span
                        className={`text-xs sm:text-sm font-semibold break-words whitespace-normal leading-tight block ${
                          m.winnerId === m.team2?.id ? 'text-amber-400 font-bold' : 'text-white'
                        }`}
                      >
                        {getTeamName(m.team2)}
                      </span>
                    </div>
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 md:w-1/4">
                    <span
                      className={`text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : m.status === 'live'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse'
                          : 'bg-zinc-800 text-slate-400'
                      }`}
                    >
                      {isCompleted ? 'Completata' : m.status === 'live' ? 'Live' : 'Programmata'}
                    </span>

                    {isAdmin && (
                      <button
                        onClick={() => onOpenScoreModal(m)}
                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition cursor-pointer"
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

          {/* Bottom Callout in Elenco Gare if stage complete */}
          {isGroupStageComplete && (
            <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20">
              <div className="text-center sm:text-left">
                <span className="text-sm font-bold text-white block">Tutte le 15 gare disputate</span>
                <span className="text-xs text-slate-400">Tutti i punteggi sono registrati: genera il tabellone a eliminazione diretta.</span>
              </div>
              {isAdmin && (
                <button
                  disabled={isKnockoutGenerated}
                  onClick={onGenerateKnockout}
                  className={`w-full sm:w-auto px-5 py-2.5 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition shrink-0 ${
                    isKnockoutGenerated
                      ? 'bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-not-allowed opacity-70'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/20 cursor-pointer'
                  }`}
                >
                  <Trophy className={`w-4 h-4 ${isKnockoutGenerated ? 'text-zinc-400' : 'fill-slate-950'}`} />
                  <span>{isKnockoutGenerated ? 'Tabellone Già Generato' : 'Genera Tabellone'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile Quick Match Reorder Modal */}
      {matchToReorder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/15 text-amber-400 rounded-xl border border-amber-500/30">
                  <ArrowUpDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Sposta / Riordina Gara (Mobile)</h3>
                  <p className="text-xs text-slate-400">
                    {matchToReorder.roundLabel} ({matchToReorder.time} - {normalizeCourtName(matchToReorder.court)})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMatchToReorder(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between bg-zinc-900 p-2 rounded-2xl border border-zinc-800">
              <span className="text-xs text-slate-300 font-semibold px-2">Modalità riordino:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setModalReorderMode('swap')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                    modalReorderMode === 'swap' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Inversione (Swap)
                </button>
                <button
                  type="button"
                  onClick={() => setModalReorderMode('shift')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                    modalReorderMode === 'shift' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Slittamento (Shift)
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Seleziona la gara di destinazione con cui effettuare {modalReorderMode === 'swap' ? "l'inversione dell'orario" : "lo slittamento"}:
            </p>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {pendingChronologicalMatches
                .filter((p) => p.id !== matchToReorder.id)
                .map((target) => (
                  <button
                    key={target.id}
                    onClick={async () => {
                      await executeMatchReorder(matchToReorder.id, target.id, modalReorderMode);
                      setMatchToReorder(null);
                    }}
                    className="w-full p-3 rounded-2xl bg-zinc-900 hover:bg-amber-500/15 border border-zinc-800 hover:border-amber-500/40 text-left flex items-center justify-between transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-zinc-950 text-sky-400 font-mono font-bold text-xs rounded-xl border border-zinc-800">
                        {target.time || '20:30'}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-white group-hover:text-amber-300 block">
                          {target.roundLabel} ({normalizeCourtName(target.court)})
                        </span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[220px] sm:max-w-xs block">
                          {getTeamName(target.team1)} vs {getTeamName(target.team2)}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 shrink-0">
                      {modalReorderMode === 'swap' ? 'Scambia' : 'Sposta qui'}
                    </span>
                  </button>
                ))}
            </div>

            <div className="pt-2 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setMatchToReorder(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-slate-300 text-xs font-bold rounded-xl border border-zinc-700 transition cursor-pointer"
              >
                Chiudi
              </button>
            </div>
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
          }
        }}
        onClose={() => setIsSimulateModalOpen(false)}
      />
    </div>
  );
}
