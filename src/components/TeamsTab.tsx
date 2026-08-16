import React, { useState } from 'react';
import { Team, TeamLevel } from '../types';
import { sortTeamsByRanking } from '../utils';
import { Users, Plus, Trash2, Edit3, Shield, CheckCircle2, AlertCircle, Sparkles, Layers, ArrowDownUp, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ConfirmModal from './ConfirmModal';

interface TeamsTabProps {
  teams: Team[];
  isAdmin: boolean;
  onAddTeam: (name: string, level: TeamLevel) => Promise<void>;
  onUpdateTeam: (id: string, name: string, level: TeamLevel) => Promise<void>;
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
  onDeleteTeam,
  onClearTeams,
  onLoadDemoTeams,
  onGenerateGroups,
  onResetTournament,
  onShowToast,
}: TeamsTabProps) {
  const [name, setName] = useState('');
  const [level, setLevel] = useState<TeamLevel>('Intermedio');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editName, setEditName] = useState('');
  const [editLevel, setEditLevel] = useState<TeamLevel>('Intermedio');
  const [editError, setEditError] = useState<string | null>(null);

  // In-App Confirm Modals
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
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
      await onUpdateTeam(editingTeam.id, cleanName, editLevel);
      setEditingTeam(null);
      if (onShowToast) {
        onShowToast(`Squadra modificata in "${cleanName}" (${editLevel}).`, 'success', 'Modifica Salvata');
      }
    } catch (err: any) {
      setEditError(err?.message || 'Errore durante la modifica.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLevelBadgeClass = (lvl: TeamLevel) => {
    switch (lvl) {
      case 'Avanzato':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 'Intermedio':
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/30';
      case 'Base':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    }
  };

  return (
    <div id="teams-tab-container" className="space-y-8 max-w-6xl mx-auto">
      {/* Header Info Banner */}
      <div
        id="teams-header-card"
        className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Iscrizione Squadre</h2>
              <p className="text-sm text-slate-400">
                {isAdmin
                  ? 'Classifica ordinata per: 1. Livello di gioco (Avanzato → Base) • 2. Ordine di inserimento'
                  : 'Elenco ufficiale delle squadre iscritte al torneo notturno'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 bg-slate-800/80 border border-slate-700/70 rounded-xl flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Posti Disponibili</span>
            <span className={`text-lg font-bold ${teams.length === 15 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {teams.length} / {maxTeams}
            </span>
          </div>

          {isAdmin && teams.length > 0 && (
            <button
              id="clear-teams-list-btn"
              onClick={() => setIsClearModalOpen(true)}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/30 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Svuota Lista Squadre
            </button>
          )}

          {isAdmin && teams.length === 0 && (
            <button
              id="load-demo-teams-btn"
              onClick={onLoadDemoTeams}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Carica 15 Squadre Demo
            </button>
          )}

          {isAdmin && teams.length === 15 && (
            <button
              id="generate-groups-btn"
              onClick={onGenerateGroups}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer text-xs"
            >
              <Layers className="w-4 h-4" />
              Genera i 5 Gironi FIPAV
            </button>
          )}
        </div>
      </div>

      {/* Admin Registration Form */}
      {isAdmin && !isFull && (
        <div
          id="add-team-form-card"
          className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 shadow-lg space-y-4"
        >
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-400" />
            Aggiungi Nuova Squadra
          </h3>

          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              {formError}
            </div>
          )}

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-7">
              <label
                htmlFor="team-name-input"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
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
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm"
                required
              />
            </div>

            <div className="md:col-span-3">
              <label
                htmlFor="team-level-select"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
              >
                Livello *
              </label>
              <select
                id="team-level-select"
                value={level}
                onChange={(e) => setLevel(e.target.value as TeamLevel)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition text-sm"
              >
                <option value="Avanzato">Avanzato</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Base">Base</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                id="submit-team-btn"
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Plus className="w-4 h-4" />
                Registra
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teams Grid (Ordered by Ranking Criteria: Level desc, then insertion order) */}
      <div id="teams-grid-section" className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Classifica Squadre Iscritte</span>
            <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-semibold border border-slate-700">
              {teams.length} totali
            </span>
          </h3>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <span className="text-xs text-slate-400 hidden sm:inline-flex items-center gap-1">
                <ArrowDownUp className="w-3.5 h-3.5 text-amber-400" />
                Ordinamento: Livello &rarr; Ordine iscrizione
              </span>
            )}
            {teams.length === 15 && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Tabellone Completo (15/15)
              </span>
            )}
          </div>
        </div>

        {sortedTeams.length === 0 ? (
          <div
            id="no-teams-empty-state"
            className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center"
          >
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-slate-300 mb-1">Nessuna squadra iscritta</h4>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              {isAdmin
                ? 'Registra manualmente le squadre con Nome e Livello oppure carica le 15 squadre di test.'
                : 'Le iscrizioni sono in corso. Le squadre registrate appariranno qui.'}
            </p>
            {isAdmin && (
              <button
                id="empty-load-demo-btn"
                onClick={onLoadDemoTeams}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-sm font-semibold rounded-xl border border-slate-700 inline-flex items-center gap-2 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Carica 15 Squadre Demo per il Torneo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTeams.map((team, index) => (
              <motion.div
                key={team.id}
                id={`team-card-${team.id}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                        #{index + 1}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">Pos. Ingresso</span>
                    </div>
                    {isAdmin && (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${getLevelBadgeClass(team.level)}`}>
                        {team.level}
                      </span>
                    )}
                  </div>

                  <h4 className="text-lg font-bold text-white mb-1.5 leading-snug">{team.name}</h4>

                  {team.group && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg font-medium mt-1">
                      <Layers className="w-3.5 h-3.5" />
                      Assegnata a: {team.group}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span>{team.registeredAt ? `Iscritta: ${team.registeredAt}` : 'Iscritta'}</span>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        id={`edit-team-btn-${team.id}`}
                        onClick={() => startEdit(team)}
                        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                        title="Modifica squadra"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        id={`delete-team-btn-${team.id}`}
                        onClick={() => setTeamToDelete(team)}
                        className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition cursor-pointer"
                        title="Elimina squadra"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* In-App Confirm Modal: Delete Single Team */}
      <ConfirmModal
        isOpen={teamToDelete !== null}
        title="Elimina Squadra"
        message={`Sei sicuro di voler eliminare la squadra "${teamToDelete?.name}"?`}
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

      {/* In-App Confirm Modal: Clear All Teams */}
      <ConfirmModal
        isOpen={isClearModalOpen}
        title="Svuota Lista Squadre"
        message="Sei sicuro di voler cancellare TUTTE le squadre iscritte? Questa operazione resetterà anche i gironi e le partite."
        confirmLabel="Svuota Tutto"
        isDestructive={true}
        onConfirm={async () => {
          await onClearTeams();
          if (onShowToast) {
            onShowToast('Tutte le squadre iscritte sono state rimosse.', 'info', 'Lista Svuotata');
          }
        }}
        onClose={() => setIsClearModalOpen(false)}
      />

      {/* Edit Team Modal */}
      <AnimatePresence>
        {editingTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <h3 className="text-xl font-bold text-white">Modifica Squadra</h3>

              {editError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  {editError}
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Nome della Squadra
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      if (editError) setEditError(null);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Livello
                  </label>
                  <select
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value as TeamLevel)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400 text-sm"
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
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition cursor-pointer"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !editName.trim()}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition cursor-pointer"
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
