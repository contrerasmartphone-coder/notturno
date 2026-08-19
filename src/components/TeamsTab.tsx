import React, { useState } from 'react';
import { Team, TeamLevel, Player, PlayerLevel } from '../types';
import { sortTeamsByRanking } from '../utils';
import {
  Users,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowDownUp,
  UserPlus,
  X,
  UserCheck,
  Shield,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ConfirmModal from './ConfirmModal';

interface TeamsTabProps {
  teams: Team[];
  isAdmin: boolean;
  onAddTeam: (name: string, level: TeamLevel) => Promise<void>;
  onUpdateTeam: (id: string, name: string, level: TeamLevel, players?: Player[]) => Promise<void>;
  onUpdatePlayers?: (teamId: string, players: Player[]) => Promise<void>;
  onDeleteTeam: (id: string) => Promise<void>;
  onClearTeams: () => Promise<void>;
  onLoadDemoTeams: () => Promise<void>;
  onGenerateGroups: () => Promise<void>;
  onResetTournament: () => Promise<void>;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning', title?: string) => void;
}

export default function TeamsTab({
  teams,
  isAdmin,
  onAddTeam,
  onUpdateTeam,
  onUpdatePlayers,
  onDeleteTeam,
  onClearTeams,
  onLoadDemoTeams,
  onGenerateGroups,
  onShowToast,
}: TeamsTabProps) {
  const hasGroupsGenerated = teams.some((t) => !!t.group);
  const [name, setName] = useState('');
  const [level, setLevel] = useState<TeamLevel>('Intermedio');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editName, setEditName] = useState('');
  const [editLevel, setEditLevel] = useState<TeamLevel>('Intermedio');
  const [editError, setEditError] = useState<string | null>(null);

  // Roster / Player Management Modal
  const [rosterTeam, setRosterTeam] = useState<Team | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerLevel, setNewPlayerLevel] = useState<PlayerLevel>('Regionale');
  const [playerFormError, setPlayerFormError] = useState<string | null>(null);

  // In-App Confirm Modals
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  const maxTeams = 15;
  const isFull = teams.length >= maxTeams;

  // Teams sorted according to criteria:
  // 1. Level (Avanzato > Intermedio > Base)
  // 2. Order of insertion
  const sortedTeams = sortTeamsByRanking(teams);

  // Check if name is duplicate (case-insensitive & trimmed)
  const isNameDuplicate = (checkName: string, excludeId?: string): boolean => {
    const clean = checkName.trim().toLowerCase();
    return teams.some((t) => t.id !== excludeId && t.name.trim().toLowerCase() === clean);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    if (isNameDuplicate(cleanName)) {
      setFormError(`Esiste già una squadra registrata con il nome "${cleanName}". Inserisci un nome univoco.`);
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    try {
      await onAddTeam(cleanName, level);
      setName('');
      setLevel('Intermedio');
      if (onShowToast) {
        onShowToast(`Squadra "${cleanName}" (${level}) registrata con successo.`, 'success', 'Squadra Iscritta');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Errore durante la registrazione.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (team: Team) => {
    setEditingTeam(team);
    setEditName(team.name);
    setEditLevel(team.level);
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    const cleanName = editName.trim();
    if (!cleanName) return;

    if (isNameDuplicate(cleanName, editingTeam.id)) {
      setEditError(`Esiste già un'altra squadra con il nome "${cleanName}".`);
      return;
    }

    setEditError(null);
    setIsSubmitting(true);
    try {
      await onUpdateTeam(editingTeam.id, cleanName, editLevel, editingTeam.players);
      setEditingTeam(null);
    } catch (err: any) {
      setEditError(err?.message || 'Errore durante la modifica.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Player / Roster Management Handlers
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rosterTeam) return;
    const pName = newPlayerName.trim();
    if (!pName) return;

    const currentPlayers = rosterTeam.players || [];
    const newPlayer: Player = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: pName,
      level: newPlayerLevel,
    };

    const updatedPlayers = [...currentPlayers, newPlayer];
    const updatedTeam = { ...rosterTeam, players: updatedPlayers };
    setRosterTeam(updatedTeam);
    setNewPlayerName('');
    setPlayerFormError(null);

    if (onUpdatePlayers) {
      await onUpdatePlayers(rosterTeam.id, updatedPlayers);
    } else {
      await onUpdateTeam(rosterTeam.id, rosterTeam.name, rosterTeam.level, updatedPlayers);
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (!rosterTeam) return;
    const currentPlayers = rosterTeam.players || [];
    const updatedPlayers = currentPlayers.filter((p) => p.id !== playerId);
    const updatedTeam = { ...rosterTeam, players: updatedPlayers };
    setRosterTeam(updatedTeam);

    if (onUpdatePlayers) {
      await onUpdatePlayers(rosterTeam.id, updatedPlayers);
    } else {
      await onUpdateTeam(rosterTeam.id, rosterTeam.name, rosterTeam.level, updatedPlayers);
    }
  };

  // Sort players descending by level: Nazionale -> Regionale -> Provinciale -> CSI -> Non Tesserato
  const PLAYER_LEVEL_WEIGHTS: Record<PlayerLevel, number> = {
    Nazionale: 5,
    Regionale: 4,
    Provinciale: 3,
    CSI: 2,
    'Non Tesserato': 1,
  };

  const sortPlayersByLevel = (playersList: Player[]): Player[] => {
    return [...playersList].sort((a, b) => {
      const weightDiff = (PLAYER_LEVEL_WEIGHTS[b.level] || 0) - (PLAYER_LEVEL_WEIGHTS[a.level] || 0);
      if (weightDiff !== 0) return weightDiff;
      return a.name.localeCompare(b.name);
    });
  };

  const getTeamLevelBadgeClass = (lvl: TeamLevel) => {
    switch (lvl) {
      case 'Avanzato':
        return 'bg-amber-500/15 text-amber-300 border border-amber-500/40';
      case 'Intermedio':
        return 'bg-sky-500/15 text-sky-300 border border-sky-500/40';
      case 'Base':
      default:
        return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40';
    }
  };

  const getPlayerLevelBadge = (lvl: PlayerLevel) => {
    switch (lvl) {
      case 'Nazionale':
        return {
          badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          dotClass: 'bg-purple-400',
        };
      case 'Regionale':
        return {
          badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          dotClass: 'bg-sky-400',
        };
      case 'Provinciale':
        return {
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dotClass: 'bg-emerald-400',
        };
      case 'CSI':
        return {
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dotClass: 'bg-amber-400',
        };
      case 'Non Tesserato':
      default:
        return {
          badgeClass: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
          dotClass: 'bg-slate-400',
        };
    }
  };

  return (
    <div id="teams-tab-container" className="space-y-8 max-w-6xl mx-auto">
      {/* Header Info Banner: Shown in Admin mode for registration management */}
      {isAdmin && (
        <div
          id="teams-header-card"
          className="bg-zinc-950/90 border border-zinc-800/90 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4">
            <div className="p-3.5 bg-amber-500/15 text-amber-400 rounded-2xl border border-amber-500/30 shadow-inner flex items-center justify-center shrink-0">
              <Users className="w-7 h-7 text-amber-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                <h2 className="text-2xl font-black text-white tracking-tight">Iscrizione Squadre</h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                Gestione iscrizioni e registrazione atleti
              </p>
            </div>
          </div>

          {/* Action Controls & Available Slots - Centered & Aligned */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
            <div className="px-4 py-2 bg-zinc-900/90 border border-zinc-700/80 rounded-2xl flex items-center gap-2.5 shadow-sm">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Posti</span>
              <span
                className={`text-base font-black px-2 py-0.5 rounded-xl ${
                  teams.length === 15 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {teams.length} / {maxTeams}
              </span>
            </div>

            {teams.length === 0 && (
              <button
                id="load-demo-teams-btn"
                onClick={onLoadDemoTeams}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-amber-400 text-xs font-bold rounded-2xl border border-amber-500/30 hover:border-amber-500/60 flex items-center gap-2 transition cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Carica 15 Squadre Ufficiali</span>
              </button>
            )}

            {teams.length === 15 && isAdmin && (
              <button
                id="generate-groups-btn"
                disabled={hasGroupsGenerated}
                onClick={hasGroupsGenerated ? undefined : onGenerateGroups}
                className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 transition text-xs uppercase tracking-wider font-black ${
                  hasGroupsGenerated
                    ? 'bg-zinc-900 text-zinc-500 border border-zinc-800 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20 cursor-pointer'
                }`}
                title={hasGroupsGenerated ? 'I 5 gironi sono già stati generati' : 'Genera i 5 gironi'}
              >
                {hasGroupsGenerated ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Gironi già generati</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    <span>Genera i 5 gironi</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Admin Registration Form: Centered & Harmonious Layout */}
      {isAdmin && !isFull && (
        <div
          id="add-team-form-card"
          className="bg-zinc-950/80 border border-zinc-800/90 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5"
        >
          <div className="border-b border-zinc-800/80 pb-3.5 space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2.5 whitespace-nowrap">
              <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-xl shrink-0">
                <Plus className="w-4 h-4" />
              </span>
              <span>Aggiungi Nuova Squadra</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium block">
              * Campi obbligatori
            </span>
          </div>

          {formError && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-6">
              <label
                htmlFor="team-name-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2"
              >
                Nome della Squadra *
              </label>
              <input
                id="team-name-input"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="Es. I Schiacciatori Notturni"
                className="w-full h-11 bg-zinc-900 border border-zinc-700/90 rounded-2xl px-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm font-medium"
                required
              />
            </div>

            <div className="md:col-span-3">
              <label
                htmlFor="team-level-select"
                className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2"
              >
                Livello Squadra *
              </label>
              <select
                id="team-level-select"
                value={level}
                onChange={(e) => setLevel(e.target.value as TeamLevel)}
                className="w-full h-11 bg-zinc-900 border border-zinc-700/90 rounded-2xl px-3 text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm font-medium cursor-pointer"
              >
                <option value="Avanzato">Avanzato</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Base">Base</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <button
                id="submit-team-btn"
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="w-full h-11 px-5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer text-sm shadow-md shadow-amber-500/10"
              >
                <Plus className="w-4 h-4" />
                <span>Registra Squadra</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Structured & Neat Explanation: Sorting Criteria (Shown in Admin Mode) */}
      {isAdmin && (
        <div
          id="sorting-criteria-box"
          className="bg-zinc-950/70 border border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3.5"
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <ArrowDownUp className="w-4 h-4 text-amber-400" />
            <span>Criteri ordinamento lista</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            <div className="flex items-start gap-3 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-black shrink-0 border border-amber-500/30">
                1
              </span>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">Livello Tecnico Dichiarato</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Le squadre vengono ordinate per categoria decrescente:
                  <span className="text-amber-300 font-semibold ml-1">Avanzato</span> &rarr;
                  <span className="text-sky-300 font-semibold mx-1">Intermedio</span> &rarr;
                  <span className="text-emerald-300 font-semibold">Base</span>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-black shrink-0 border border-amber-500/30">
                2
              </span>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">Ordine Cronologico Iscrizione</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  A parità di livello, la posizione d'ingresso è determinata rigorosamente dall'ordine temporale (data e orario) di registrazione.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teams Grid: "Lista d'Ingresso" */}
      <div id="teams-grid-section" className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <span>Lista d'Ingresso</span>
          </h3>
        </div>

        {sortedTeams.length === 0 ? (
          <div
            id="no-teams-empty-state"
            className="bg-zinc-950/50 border border-dashed border-zinc-800 rounded-3xl p-12 text-center"
          >
            <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-slate-300 mb-1">Nessuna squadra iscritta</h4>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              {isAdmin
                ? 'Registra manualmente le squadre con Nome, Livello e Roster oppure carica le 15 squadre di test.'
                : 'Le iscrizioni sono in corso. Le squadre registrate appariranno qui.'}
            </p>
            {isAdmin && (
              <button
                id="empty-load-demo-btn"
                onClick={onLoadDemoTeams}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-amber-400 text-sm font-semibold rounded-2xl border border-zinc-700 inline-flex items-center gap-2 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Carica 15 Squadre Ufficiali e Roster
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTeams.map((team, index) => {
              const players = sortPlayersByLevel(team.players || []);
              return (
                <motion.div
                  key={team.id}
                  id={`team-card-${team.id}`}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700/80 rounded-3xl p-5 shadow-lg transition flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Seed & Level */}
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-xl">
                        #{index + 1}
                      </span>
                      {isAdmin && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${getTeamLevelBadgeClass(team.level)}`}>
                          {team.level}
                        </span>
                      )}
                    </div>

                    {/* Team Name */}
                    <div>
                      <h4 className="text-lg font-black text-white leading-snug">{team.name}</h4>
                    </div>

                    {/* Athletes / Roster Preview */}
                    <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span>Roster ({players.length})</span>
                        </span>

                        <button
                          onClick={() => {
                            setRosterTeam(team);
                            setNewPlayerName('');
                            setPlayerFormError(null);
                          }}
                          className="text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-lg transition cursor-pointer flex items-center gap-1"
                        >
                          {isAdmin ? <UserPlus className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                          <span>{isAdmin ? 'Gestisci' : 'Dettagli'}</span>
                        </button>
                      </div>

                      {players.length === 0 ? (
                        <p className="text-[11px] text-slate-500 italic">Nessun atleta registrato</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {players.slice(0, 4).map((p) => {
                            const badge = getPlayerLevelBadge(p.level);
                            return (
                              <span
                                key={p.id}
                                className={`text-[10px] font-medium px-2 py-0.5 rounded-lg border flex items-center gap-1.5 ${badge.badgeClass}`}
                                title={`${p.name} (${p.level})`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                                <span className="font-semibold">{p.name}</span>
                                <span className="opacity-75 text-[9px]">({p.level})</span>
                              </span>
                            );
                          })}
                          {players.length > 4 && (
                            <span className="text-[10px] text-slate-400 px-1.5 py-0.5 font-bold">
                              +{players.length - 4} altri
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Meta (Visible only to Admin) */}
                  {isAdmin && (
                    <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-slate-500">
                      <span className="text-[11px]">
                        {team.registeredAt ? `Iscritta: ${team.registeredAt}` : 'Registrata'}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          id={`edit-team-btn-${team.id}`}
                          onClick={() => startEdit(team)}
                          className="p-1.5 hover:bg-zinc-800 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                          title="Modifica squadra"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          id={`delete-team-btn-${team.id}`}
                          onClick={() => setTeamToDelete(team)}
                          className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl transition cursor-pointer"
                          title="Elimina squadra"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Roster & Athletes Modal */}
      <AnimatePresence>
        {rosterTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-zinc-800/80 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-black text-white">{rosterTeam.name}</h3>
                    {isAdmin && (
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-xl ${getTeamLevelBadgeClass(
                          rosterTeam.level
                        )}`}
                      >
                        {rosterTeam.level}
                      </span>
                    )}
                  </div>
                  {isAdmin && (
                    <p className="text-xs text-slate-400">
                      Roster atleti partecipanti • Livelli: Nazionale, Regionale, Provinciale, CSI
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setRosterTeam(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-zinc-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Admin Add Player Form */}
              {isAdmin && (
                <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4" />
                    <span>Aggiungi Atleta al Roster</span>
                  </h4>

                  {playerFormError && (
                    <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs font-medium">
                      {playerFormError}
                    </div>
                  )}

                  <form onSubmit={handleAddPlayer} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Nome e Cognome Atleta *
                      </label>
                      <input
                        type="text"
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        placeholder="Es. Mario Rossi"
                        className="w-full h-10 bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Livello Tecnico *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {(['Nazionale', 'Regionale', 'Provinciale', 'CSI', 'Non Tesserato'] as PlayerLevel[]).map((lvl) => {
                          const isSelected = newPlayerLevel === lvl;
                          const badge = getPlayerLevelBadge(lvl);
                          return (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => setNewPlayerLevel(lvl)}
                              className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                                isSelected
                                  ? `${badge.badgeClass} ring-2 ring-amber-400/50`
                                  : 'bg-zinc-900/80 border-zinc-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${badge.dotClass}`} />
                              <span>{lvl}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!newPlayerName.trim()}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Inserisci Giocatore nel Roster</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Athletes List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Componenti del Roster ({rosterTeam.players?.length || 0})
                  </span>
                </div>

                {(!rosterTeam.players || rosterTeam.players.length === 0) ? (
                  <div className="text-center py-6 border border-dashed border-zinc-800 rounded-2xl text-slate-500 text-xs">
                    Nessun atleta inserito nel roster.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {sortPlayersByLevel(rosterTeam.players).map((player) => {
                      const badge = getPlayerLevelBadge(player.level);
                      return (
                        <div
                          key={player.id}
                          className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-3 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-amber-300">
                              {player.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-sm font-bold text-white block">{player.name}</span>
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.2 rounded-md border mt-0.5 ${badge.badgeClass}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                                <span>Livello {player.level}</span>
                              </span>
                            </div>
                          </div>

                          {isAdmin && (
                            <button
                              onClick={() => handleRemovePlayer(player.id)}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
                              title="Rimuovi giocatore dal roster"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="pt-3 border-t border-zinc-800/80 flex justify-end">
                <button
                  type="button"
                  onClick={() => setRosterTeam(null)}
                  className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-slate-200 font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer border border-zinc-700"
                >
                  Chiudi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* In-App Confirm Modal: Delete Single Team */}
      <ConfirmModal
        isOpen={teamToDelete !== null}
        title="Elimina Squadra"
        message={`Sei sicuro di voler eliminare la squadra "${teamToDelete?.name}"? Verranno rimossi anche gli atleti associati.`}
        confirmLabel="Elimina Squadra"
        isDestructive={true}
        onConfirm={() => {
          if (teamToDelete) {
            onDeleteTeam(teamToDelete.id);
            if (onShowToast) {
              onShowToast(`Squadra "${teamToDelete.name}" eliminata.`, 'info', 'Squadra Rimossa');
            }
            setTeamToDelete(null);
          }
        }}
        onClose={() => setTeamToDelete(null)}
      />

      {/* Edit Team Modal */}
      <AnimatePresence>
        {editingTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <h3 className="text-xl font-black text-white">Modifica Squadra</h3>

              {editError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  {editError}
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Nome della Squadra
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      if (editError) setEditError(null);
                    }}
                    className="w-full h-11 bg-zinc-900 border border-zinc-700 rounded-2xl px-4 text-white focus:outline-none focus:border-amber-400 text-sm font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Livello
                  </label>
                  <select
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value as TeamLevel)}
                    className="w-full h-11 bg-zinc-900 border border-zinc-700 rounded-2xl px-3 text-white focus:outline-none focus:border-amber-400 text-sm font-medium cursor-pointer"
                  >
                    <option value="Avanzato">Avanzato</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Base">Base</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTeam(null);
                      setEditError(null);
                    }}
                    className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-slate-300 rounded-2xl text-sm font-medium transition cursor-pointer border border-zinc-700"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !editName.trim()}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-2xl text-sm transition cursor-pointer shadow-md shadow-amber-500/10"
                  >
                    Salva Modifiche
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
