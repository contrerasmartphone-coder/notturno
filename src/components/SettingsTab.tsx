import React, { useState, useEffect } from 'react';
import { TournamentConfig, Match, QuarterFinalsMode, TournamentBackup, Team } from '../types';
import { parseTimeToMinutes, formatMinutesToTime } from '../utils';
import {
  Settings,
  Clock,
  Timer,
  Save,
  RefreshCw,
  Sliders,
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  Layers,
  Award,
  Zap,
  Shield,
  Database,
  History,
  Trash2,
  RotateCcw,
  Sparkles,
  Bookmark,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ConfirmModal from './ConfirmModal';

interface SettingsTabProps {
  config: TournamentConfig;
  matches: Match[];
  teams: Team[];
  isAdmin: boolean;
  backups: TournamentBackup[];
  onSaveConfig: (updatedConfig: TournamentConfig) => Promise<void>;
  onApplyScheduleToMatches: (
    startTime: string,
    durationSingleSet: number,
    durationBestOf3: number,
    courtName: string,
    quarterFinalsMode: QuarterFinalsMode
  ) => Promise<void>;
  onCreateBackup: (name: string) => Promise<void>;
  onRestoreBackup: (backup: TournamentBackup) => Promise<void>;
  onDeleteBackup: (backupId: string, backupName: string) => Promise<void>;
  onOpenAdminLogin: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info' | 'warning', title?: string) => void;
}

export default function SettingsTab({
  config,
  matches,
  teams,
  isAdmin,
  backups,
  onSaveConfig,
  onApplyScheduleToMatches,
  onCreateBackup,
  onRestoreBackup,
  onDeleteBackup,
  onOpenAdminLogin,
  onShowToast,
}: SettingsTabProps) {
  const [startTime, setStartTime] = useState(config.startTime || '20:30');
  const [durationSingleSet, setDurationSingleSet] = useState<number>(
    config.durationSingleSetMinutes || config.matchDurationMinutes || 25
  );
  const [durationBestOf3, setDurationBestOf3] = useState<number>(
    config.durationBestOf3Minutes || 50
  );
  const [courtName, setCourtName] = useState(config.courtName || 'Campo Palamelina');
  const [quarterFinalsMode, setQuarterFinalsMode] = useState<QuarterFinalsMode>(
    config.quarterFinalsMode || 'single_set_25'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isApplyingSchedule, setIsApplyingSchedule] = useState(false);
  const [isConfirmApplyOpen, setIsConfirmApplyOpen] = useState(false);

  // Backup Form State
  const [backupName, setBackupName] = useState('');
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupToRestore, setBackupToRestore] = useState<TournamentBackup | null>(null);
  const [backupToDelete, setBackupToDelete] = useState<TournamentBackup | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Sync state when config prop changes
  useEffect(() => {
    if (config.startTime) setStartTime(config.startTime);
    if (config.durationSingleSetMinutes) setDurationSingleSet(config.durationSingleSetMinutes);
    if (config.durationBestOf3Minutes) setDurationBestOf3(config.durationBestOf3Minutes);
    if (config.courtName) setCourtName(config.courtName);
    if (config.quarterFinalsMode) setQuarterFinalsMode(config.quarterFinalsMode);
  }, [config]);

  // Handle Save Config
  const handleSave = async () => {
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }

    if (!startTime || !startTime.includes(':')) {
      onShowToast('Inserisci un orario di inizio valido (es. 20:30).', 'warning', 'Orario Non Valido');
      return;
    }

    if (durationSingleSet < 5 || durationSingleSet > 180) {
      onShowToast('La durata del singolo set deve essere compresa tra 5 e 180 minuti.', 'warning', 'Durata Non Valida');
      return;
    }

    if (durationBestOf3 < 10 || durationBestOf3 > 240) {
      onShowToast('La durata delle partite 2 su 3 deve essere compresa tra 10 e 240 minuti.', 'warning', 'Durata Non Valida');
      return;
    }

    setIsSaving(true);
    try {
      const updatedConfig: TournamentConfig = {
        ...config,
        startTime,
        durationSingleSetMinutes: durationSingleSet,
        durationBestOf3Minutes: durationBestOf3,
        courtCount: 1,
        courtName: courtName.trim() || 'Campo Palamelina',
        quarterFinalsMode,
      };
      await onSaveConfig(updatedConfig);
      onShowToast('Impostazioni salvate con successo!', 'success', 'Configurazione Aggiornata');
    } catch {
      onShowToast('Errore durante il salvataggio delle impostazioni.', 'error', 'Errore');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Apply Schedule to existing matches
  const handleApplyScheduleConfirm = async () => {
    setIsApplyingSchedule(true);
    try {
      await onApplyScheduleToMatches(
        startTime,
        durationSingleSet,
        durationBestOf3,
        courtName.trim() || 'Campo Palamelina',
        quarterFinalsMode
      );
      onShowToast(
        `Orari ricalcolati su Campo Palamelina: inizio ore ${startTime}, durata set ${durationSingleSet}m / ${durationBestOf3}m.`,
        'success',
        'Orari Partite Aggiornati'
      );
    } catch {
      onShowToast('Errore durante il ricalcolo degli orari.', 'error', 'Errore');
    } finally {
      setIsApplyingSchedule(false);
    }
  };

  // Handle Create Backup
  const handleCreateBackupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onOpenAdminLogin();
      return;
    }

    const trimmed = backupName.trim();
    if (!trimmed) {
      onShowToast('Inserisci un nome descrittivo per il salvataggio di backup.', 'warning', 'Nome Richiesto');
      return;
    }

    setIsCreatingBackup(true);
    try {
      await onCreateBackup(trimmed);
      setBackupName('');
    } catch {
      onShowToast('Errore durante la creazione del backup.', 'error', 'Errore');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  // Handle Restore Backup Confirm
  const handleConfirmRestore = async () => {
    if (!backupToRestore) return;
    setIsRestoring(true);
    try {
      await onRestoreBackup(backupToRestore);
      setBackupToRestore(null);
    } catch {
      onShowToast('Errore durante il ripristino del backup.', 'error', 'Errore');
    } finally {
      setIsRestoring(false);
    }
  };

  // Handle Delete Backup Confirm
  const handleConfirmDelete = async () => {
    if (!backupToDelete) return;
    try {
      await onDeleteBackup(backupToDelete.id, backupToDelete.name);
      setBackupToDelete(null);
    } catch {
      onShowToast('Errore durante l\'eliminazione del backup.', 'error', 'Errore');
    }
  };

  // Calculations for Tournament Timeline
  const startMin = parseTimeToMinutes(startTime);

  // 15 matches Gironi (all single set)
  const gironiDuration = 15 * durationSingleSet;
  const endGironiMin = startMin + gironiDuration;

  // 7 matches Ottavi (single set)
  const ottaviDuration = 7 * durationSingleSet;
  const endOttaviMin = endGironiMin + ottaviDuration;

  // 4 matches Quarti (single set or best of 3)
  const qfMatchDuration = quarterFinalsMode === 'best_of_3_tb15' ? durationBestOf3 : durationSingleSet;
  const quartiDuration = 4 * qfMatchDuration;
  const endQuartiMin = endOttaviMin + quartiDuration;

  // 2 matches Semifinali (2 su 3)
  const semiDuration = 2 * durationBestOf3;
  const endSemiMin = endQuartiMin + semiDuration;

  // 2 matches Finali: 3°-4° (single set) + 1°-2° (2 su 3)
  const finaliDuration = durationSingleSet + durationBestOf3;
  const endTourneyMin = endSemiMin + finaliDuration;

  const totalTournamentMinutes = gironiDuration + ottaviDuration + quartiDuration + semiDuration + finaliDuration;
  const totalHours = Math.floor(totalTournamentMinutes / 60);
  const totalRemainingMinutes = totalTournamentMinutes % 60;

  const totalMatchesCount = 30; // 15 gironi + 7 ottavi + 4 quarti + 2 semifinali + 2 finali
  const existingMatchesCount = matches.length;

  return (
    <div id="settings-tab-root" className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Pannello Amministrazione & Impostazioni Torneo
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Orari, durate partite, vincolo di gioco su <strong className="text-amber-300">Campo Palamelina</strong> e gestione salvataggi di backup.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Accesso Riservato Amministratori
            </span>
          ) : (
            <button
              id="settings-admin-login-btn"
              onClick={onOpenAdminLogin}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              Sblocca Modifiche (Admin)
            </button>
          )}
        </div>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Orari e Durate */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Parametri Orari e Durata Partite
            </h3>

            {/* 1. Ora Inizio Torneo */}
            <div className="space-y-2">
              <label htmlFor="input-start-time" className="block text-sm font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Ora Inizio Torneo
                </span>
                <span className="text-xs text-slate-400 font-normal">Formato 24h</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="input-start-time"
                  type="time"
                  disabled={!isAdmin}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-40 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-2xl px-4 py-2.5 text-base font-mono font-bold text-white outline-none disabled:opacity-60"
                />
                <div className="flex flex-wrap gap-1.5">
                  {['19:30', '20:00', '20:30', '21:00', '21:30'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={!isAdmin}
                      onClick={() => setStartTime(preset)}
                      className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg border transition cursor-pointer disabled:opacity-40 ${
                        startTime === preset
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Orario di inizio della 1ª gara del Girone A su Campo Palamelina.
              </p>
            </div>

            <div className="border-t border-slate-800/80 my-4" />

            {/* 2. Durata Partita Singolo Set */}
            <div className="space-y-2">
              <label htmlFor="input-single-set-duration" className="block text-sm font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-amber-400" />
                  Durata Partita Singolo Set (a 25 punti)
                </span>
                <span className="text-xs text-amber-400 font-mono font-bold">{durationSingleSet} minuti</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="input-single-set-duration"
                  type="number"
                  min="5"
                  max="120"
                  step="5"
                  disabled={!isAdmin}
                  value={durationSingleSet}
                  onChange={(e) => setDurationSingleSet(Number(e.target.value) || 25)}
                  className="w-32 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-2xl px-4 py-2.5 text-base font-mono font-bold text-white outline-none disabled:opacity-60"
                />
                <div className="flex flex-wrap gap-1.5">
                  {[15, 20, 25, 30, 35].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={!isAdmin}
                      onClick={() => setDurationSingleSet(preset)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition cursor-pointer disabled:opacity-40 ${
                        durationSingleSet === preset
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {preset} min
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Utilizzato per le <strong>15 gare dei Gironi</strong>, i <strong>7 Ottavi di finale</strong> e la <strong>Finale 3°-4° posto</strong>.
              </p>
            </div>

            <div className="border-t border-slate-800/80 my-4" />

            {/* 3. Durata Partita 2 Set su 3 */}
            <div className="space-y-2">
              <label htmlFor="input-best-of-3-duration" className="block text-sm font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Durata Partita 2 Set su 3 (TB a 25 punti)
                </span>
                <span className="text-xs text-amber-400 font-mono font-bold">{durationBestOf3} minuti</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="input-best-of-3-duration"
                  type="number"
                  min="10"
                  max="180"
                  step="5"
                  disabled={!isAdmin}
                  value={durationBestOf3}
                  onChange={(e) => setDurationBestOf3(Number(e.target.value) || 50)}
                  className="w-32 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-2xl px-4 py-2.5 text-base font-mono font-bold text-white outline-none disabled:opacity-60"
                />
                <div className="flex flex-wrap gap-1.5">
                  {[40, 45, 50, 60].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={!isAdmin}
                      onClick={() => setDurationBestOf3(preset)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition cursor-pointer disabled:opacity-40 ${
                        durationBestOf3 === preset
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {preset} min
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Utilizzato per le <strong>2 Semifinali</strong> e la <strong>Grand Finale 1°-2° posto</strong>.
              </p>
            </div>
          </div>

          {/* Section 2: Campo Palamelina & Formula Quarti */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Campo di Gioco & Formula Quarti
            </h3>

            {/* Campo Palamelina Card */}
            <div className="bg-slate-950 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm text-center px-1">
                  PALA
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Campo Palamelina</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-bold">
                      Sequenza Continua
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Tutte le 30 partite del torneo si disputano consecutivamente su <strong>Campo Palamelina</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="input-court-name"
                  type="text"
                  disabled={!isAdmin}
                  value={courtName}
                  onChange={(e) => setCourtName(e.target.value)}
                  placeholder="Nome Campo (es. Campo Palamelina)"
                  className="bg-slate-900 border border-slate-700 text-xs text-white px-3 py-1.5 rounded-xl outline-none focus:border-amber-500 w-44 disabled:opacity-60 font-semibold"
                />
              </div>
            </div>

            {/* Formula Quarti di Finale */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-white flex items-center justify-between">
                <span>Formula Quarti di Finale (4 gare)</span>
                <span className="text-xs text-slate-400">Durata: {qfMatchDuration} min a gara</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={!isAdmin}
                  onClick={() => setQuarterFinalsMode('single_set_25')}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer disabled:opacity-50 ${
                    quarterFinalsMode === 'single_set_25'
                      ? 'bg-amber-500/15 border-amber-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Set Singolo a 25 punti</span>
                    {quarterFinalsMode === 'single_set_25' && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Durata rapida ({durationSingleSet} min) • Totale 4 Quarti: {4 * durationSingleSet} min
                  </p>
                </button>

                <button
                  type="button"
                  disabled={!isAdmin}
                  onClick={() => setQuarterFinalsMode('best_of_3_tb15')}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer disabled:opacity-50 ${
                    quarterFinalsMode === 'best_of_3_tb15'
                      ? 'bg-amber-500/15 border-amber-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">2 Set su 3 (TB a 15)</span>
                    {quarterFinalsMode === 'best_of_3_tb15' && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Formula estesa ({durationBestOf3} min) • Totale 4 Quarti: {4 * durationBestOf3} min
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons for Settings */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="save-settings-btn"
              type="button"
              disabled={!isAdmin || isSaving}
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-2xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Salvataggio...' : 'Salva Impostazioni'}
            </button>

            {existingMatchesCount > 0 && (
              <button
                id="apply-schedule-btn"
                type="button"
                disabled={!isAdmin || isApplyingSchedule}
                onClick={() => setIsConfirmApplyOpen(true)}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-2xl text-sm border border-slate-700 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isApplyingSchedule ? 'animate-spin' : ''}`} />
                <span>Ricalcola Orari su Gare Esistenti</span>
              </button>
            )}
          </div>

          {/* SECTION 3: BACKUP & RIPRISTINO TORNEO */}
          <div id="backup-management-section" className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Salvataggi di Backup & Punti di Ripristino
                  </h3>
                  <p className="text-xs text-slate-400">
                    Crea istantanee complete del torneo (squadre, gironi, punteggi e orari) per tornare indietro in caso di errori.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full">
                {backups.length} Backup
              </span>
            </div>

            {/* Create Backup Form */}
            <form onSubmit={handleCreateBackupSubmit} className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <label htmlFor="input-backup-name" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Nome del Nuovo Salvataggio di Backup
              </label>
              
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  id="input-backup-name"
                  type="text"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  placeholder="Es. Fine Gironi - Prima dei Quarti"
                  className="flex-1 bg-slate-900 border border-slate-700 focus:border-purple-400 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 outline-none"
                  disabled={isCreatingBackup}
                />
                <button
                  id="create-backup-submit-btn"
                  type="submit"
                  disabled={isCreatingBackup || !backupName.trim()}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 transition cursor-pointer whitespace-nowrap"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {isCreatingBackup ? 'Salvataggio...' : 'Crea Backup'}
                </button>
              </div>

              {/* Quick Name Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-500 mr-1">Suggerimenti:</span>
                {[
                  'Pre-Gironi',
                  'Fine Gironi',
                  'Prima dei Quarti',
                  'Prima delle Semifinali',
                  'Prima delle Finali',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBackupName(preset)}
                    className="text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 transition cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </form>

            {/* Backups List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-purple-400" />
                Salvataggi Disponibili
              </h4>

              {backups.length === 0 ? (
                <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl p-6 text-center space-y-2">
                  <Database className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-semibold">Nessun backup creato finora</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Crea un backup prima di modificare punteggi importanti o prima di generare la fase a eliminazione diretta.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {backups.map((b) => (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-950 p-4 rounded-2xl border border-slate-800/90 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{b.name}</span>
                          <span className="text-[10px] font-mono bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                            {b.createdAtFormatted}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                            👥 {b.teamsCount || (b.teams?.length ?? 0)} Squadre
                          </span>
                          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                            🏐 {b.matchesCount || (b.matches?.length ?? 0)} Partite
                          </span>
                          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                            ⏰ Inizio: {b.config?.startTime || '20:30'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          id={`restore-backup-${b.id}`}
                          type="button"
                          onClick={() => setBackupToRestore(b)}
                          className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                          title="Ripristina questo backup"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                          <span>Ripristina</span>
                        </button>

                        <button
                          id={`delete-backup-${b.id}`}
                          type="button"
                          onClick={() => setBackupToDelete(b)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition cursor-pointer"
                          title="Elimina backup"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Cronoprogramma & Timeline Stimata (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-6 sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Cronoprogramma Torneo
              </h3>
              <span className="text-xs px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-mono font-bold">
                Campo Palamelina
              </span>
            </div>

            {/* Summary Highlights Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Inizio Torneo</span>
                <span className="text-xl font-black font-mono text-amber-400">{startTime}</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Fine Stimata</span>
                <span className="text-xl font-black font-mono text-emerald-400">
                  {formatMinutesToTime(endTourneyMin)}
                </span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Durata Totale</span>
                <span className="text-base font-black text-white">
                  {totalHours}h {totalRemainingMinutes > 0 ? `${totalRemainingMinutes}m` : ''}
                </span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Partite Totali</span>
                <span className="text-base font-black text-white">{totalMatchesCount} gare</span>
              </div>
            </div>

            {/* Timeline Breakdown List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Svolgimento Fasi in Sequenza
              </h4>

              <div className="space-y-2.5">
                {/* 1. Gironi */}
                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">15 Partite Gironi</span>
                      <span className="text-[11px] text-slate-400">15 × {durationSingleSet} min</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {startTime} → {formatMinutesToTime(endGironiMin)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {Math.floor(gironiDuration / 60)}h {gironiDuration % 60}m
                    </span>
                  </div>
                </div>

                {/* 2. Ottavi */}
                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">7 Ottavi di Finale</span>
                      <span className="text-[11px] text-slate-400">7 × {durationSingleSet} min</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {formatMinutesToTime(endGironiMin)} → {formatMinutesToTime(endOttaviMin)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {Math.floor(ottaviDuration / 60)}h {ottaviDuration % 60}m
                    </span>
                  </div>
                </div>

                {/* 3. Quarti */}
                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">4 Quarti di Finale</span>
                      <span className="text-[11px] text-slate-400">4 × {qfMatchDuration} min</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {formatMinutesToTime(endOttaviMin)} → {formatMinutesToTime(endQuartiMin)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {Math.floor(quartiDuration / 60)}h {quartiDuration % 60}m
                    </span>
                  </div>
                </div>

                {/* 4. Semifinali */}
                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                      4
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">2 Semifinali (2 su 3)</span>
                      <span className="text-[11px] text-slate-400">2 × {durationBestOf3} min</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {formatMinutesToTime(endQuartiMin)} → {formatMinutesToTime(endSemiMin)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {Math.floor(semiDuration / 60)}h {semiDuration % 60}m
                    </span>
                  </div>
                </div>

                {/* 5. Finali */}
                <div className="p-3 bg-slate-950/80 rounded-2xl border border-amber-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">
                      5
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Finali 3°-4° e 1°-2° 🏆</span>
                      <span className="text-[11px] text-slate-400">
                        {durationSingleSet}m (3°-4°) + {durationBestOf3}m (1°-2°)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {formatMinutesToTime(endSemiMin)} → {formatMinutesToTime(endTourneyMin)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {Math.floor(finaliDuration / 60)}h {finaliDuration % 60}m
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>
                Gli orari calcolati su Campo Palamelina vengono automaticamente assegnati sia alla lista gare che al tabellone del torneo.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Apply Schedule Modal */}
      <ConfirmModal
        isOpen={isConfirmApplyOpen}
        title="Ricalcolare gli orari di tutte le partite?"
        message={`Verranno aggiornati gli orari di tutte le ${existingMatchesCount} partite del torneo in sequenza su Campo Palamelina, a partire dalle ore ${startTime}, con durata ${durationSingleSet} min (singolo set) e ${durationBestOf3} min (2 su 3).`}
        confirmLabel="Ricalcola Orari"
        cancelLabel="Annulla"
        isDestructive={false}
        onConfirm={() => {
          setIsConfirmApplyOpen(false);
          handleApplyScheduleConfirm();
        }}
        onClose={() => setIsConfirmApplyOpen(false)}
      />

      {/* Confirm Restore Backup Modal */}
      <ConfirmModal
        isOpen={!!backupToRestore}
        title={`Ripristinare il backup "${backupToRestore?.name || ''}"?`}
        message={`Attenzione: ripristinando questo salvataggio del ${backupToRestore?.createdAtFormatted || ''}, lo stato attuale del torneo (${matches.length} partite e ${teams.length} squadre) verrà sovrascritto con quello presente al momento del backup (${backupToRestore?.matchesCount ?? backupToRestore?.matches?.length ?? 0} partite e ${backupToRestore?.teamsCount ?? backupToRestore?.teams?.length ?? 0} squadre). Sei sicuro di voler procedere?`}
        confirmLabel={isRestoring ? 'Ripristino in corso...' : 'Conferma Ripristino'}
        cancelLabel="Annulla"
        isDestructive={true}
        onConfirm={handleConfirmRestore}
        onClose={() => setBackupToRestore(null)}
      />

      {/* Confirm Delete Backup Modal */}
      <ConfirmModal
        isOpen={!!backupToDelete}
        title={`Eliminare il backup "${backupToDelete?.name || ''}"?`}
        message={`Questa azione cancellerà definitivamente il salvataggio di backup creato in data ${backupToDelete?.createdAtFormatted || ''}.`}
        confirmLabel="Elimina Backup"
        cancelLabel="Annulla"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onClose={() => setBackupToDelete(null)}
      />
    </div>
  );
}
