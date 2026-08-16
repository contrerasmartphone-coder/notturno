import React, { useState } from 'react';
import { Match, SetScore } from '../types';
import { isSetFinished, swapMatchTimes, shiftMatchesOnCourt, parseTimeToMinutes, formatMinutesToTime } from '../utils';
import { X, Trophy, Save, Clock, MapPin, AlertTriangle, CheckCircle2, ArrowLeftRight, FastForward, Check, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface MatchScoreModalProps {
  match: Match;
  allMatches?: Match[];
  onClose: () => void;
  onSaveScore: (matchId: string, updatedData: Partial<Match>) => Promise<void>;
  onBatchUpdateMatches?: (updatedMatches: Match[]) => Promise<void>;
  onShowToast?: (message: string, type: 'success' | 'error' | 'info' | 'warning', title?: string) => void;
}

export default function MatchScoreModal({
  match,
  allMatches = [],
  onClose,
  onSaveScore,
  onBatchUpdateMatches,
  onShowToast,
}: MatchScoreModalProps) {
  const isBestOf3 = match.maxSets === 3;
  const targetPoints = match.pointsPerSet || 25;
  const tieBreakTarget = match.tieBreakPoints || (isBestOf3 && match.round === 3 ? 15 : 25);

  const [sets, setSets] = useState<SetScore[]>(() => {
    if (match.sets && match.sets.length > 0) {
      return [...match.sets];
    }
    return [{ team1: 0, team2: 0 }];
  });

  const [status, setStatus] = useState<'scheduled' | 'live' | 'completed'>(match.status || 'scheduled');
  const [court, setCourt] = useState<string>(match.court || 'Campo 1');
  const [time, setTime] = useState<string>(match.time || '20:30');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check for time/court overlap conflict with other matches
  const conflictingMatch = allMatches.find(
    (m) =>
      m.id !== match.id &&
      m.court.trim().toLowerCase() === court.trim().toLowerCase() &&
      m.time.trim() === time.trim()
  );

  // Calculate sets won
  let t1SetsWon = 0;
  let t2SetsWon = 0;

  sets.forEach((s, idx) => {
    const target = idx === 2 && isBestOf3 ? tieBreakTarget : targetPoints;
    if (isSetFinished(s.team1, s.team2, target)) {
      if (s.team1 > s.team2) t1SetsWon++;
      else if (s.team2 > s.team1) t2SetsWon++;
    }
  });

  const requiredSetsToWin = isBestOf3 ? 2 : 1;
  const isMatchComplete = t1SetsWon >= requiredSetsToWin || t2SetsWon >= requiredSetsToWin;
  const winnerId = isMatchComplete
    ? t1SetsWon > t2SetsWon
      ? match.team1?.id
      : match.team2?.id
    : undefined;

  const handleSetScoreChange = (setIdx: number, team: 'team1' | 'team2', value: number) => {
    const updated = [...sets];
    while (updated.length <= setIdx) {
      updated.push({ team1: 0, team2: 0 });
    }
    const val = Math.max(0, value);
    updated[setIdx] = {
      ...updated[setIdx],
      [team]: val,
    };
    setSets(updated);
  };

  const handleAdjustPoints = (setIdx: number, team: 'team1' | 'team2', delta: number) => {
    const current = sets[setIdx] ? sets[setIdx][team] : 0;
    handleSetScoreChange(setIdx, team, current + delta);
  };

  const handleQuickScore = (setIdx: number, p1: number, p2: number) => {
    const updated = [...sets];
    while (updated.length <= setIdx) {
      updated.push({ team1: 0, team2: 0 });
    }
    updated[setIdx] = { team1: p1, team2: p2 };
    setSets(updated);
  };

  // Adjust time helper
  const handleAdjustTime = (deltaMinutes: number) => {
    const currentMin = parseTimeToMinutes(time);
    const newMin = Math.max(0, currentMin + deltaMinutes);
    setTime(formatMinutesToTime(newMin));
  };

  // Save ONLY schedule (time & court) without changing sets
  const handleSaveOnlySchedule = async () => {
    setIsSavingSchedule(true);
    setErrorMessage(null);
    try {
      await onSaveScore(match.id, {
        court: court.trim(),
        time: time.trim(),
      });
      if (onShowToast) {
        onShowToast(`Orario aggiornato: ${court} alle ${time}`, 'success', 'Orario Salvato');
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Errore durante il salvataggio dell\'orario');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  // Resolve conflict: Swap times with conflicting match
  const handleResolveSwapTimes = async () => {
    if (!conflictingMatch || !onBatchUpdateMatches) return;
    setIsSavingSchedule(true);
    setErrorMessage(null);
    try {
      const swapped = swapMatchTimes(allMatches, match.id, conflictingMatch.id);
      await onBatchUpdateMatches(swapped);
      if (onShowToast) {
        onShowToast(
          `Orari scambiati tra "${match.roundLabel}" e "${conflictingMatch.roundLabel}"`,
          'success',
          'Inversione Orari Eseguita'
        );
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Errore durante l\'inversione degli orari');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  // Resolve conflict: Shift conflicting and all subsequent matches forward by 25 min
  const handleResolveShiftFollowing = async () => {
    if (!onBatchUpdateMatches) return;
    setIsSavingSchedule(true);
    setErrorMessage(null);
    try {
      const shifted = shiftMatchesOnCourt(allMatches, match.id, time, court, 25);
      await onBatchUpdateMatches(shifted);
      if (onShowToast) {
        onShowToast(
          `Gare successive su ${court} posticipate di 25 minuti.`,
          'success',
          'Scorrimento Orari Eseguito'
        );
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Errore durante lo scorrimento degli orari');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  // Full score save
  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const finalStatus = isMatchComplete ? 'completed' : status;
      await onSaveScore(match.id, {
        sets: sets.filter((s) => s.team1 > 0 || s.team2 > 0),
        team1Score: t1SetsWon,
        team2Score: t2SetsWon,
        winnerId: winnerId,
        status: finalStatus,
        court: court.trim(),
        time: time.trim(),
      });
      if (onShowToast) {
        onShowToast(
          isMatchComplete
            ? `Partita completata! Vincitore: ${winnerId === match.team1?.id ? match.team1?.name : match.team2?.name}`
            : 'Dati partita salvati correttamente.',
          'success',
          'Salvataggio Riuscito'
        );
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Errore durante il salvataggio');
    } finally {
      setIsSaving(false);
    }
  };

  const isThirdSetNeeded = isBestOf3 && t1SetsWon === 1 && t2SetsWon === 1;

  return (
    <div
      id="match-score-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3.5">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
              {match.roundLabel}
            </span>
            <h3 className="text-xl font-bold text-white mt-0.5">Gestione Punteggio & Orario</h3>
            <p className="text-xs text-slate-400">
              {isBestOf3
                ? `Formula: 2 set su 3 a 25 punti (Tie-Break a ${tieBreakTarget})`
                : 'Formula: Set Singolo a 25 punti (minimo 2 punti di scarto)'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* Teams Matchup Header */}
        <div className="grid grid-cols-5 items-center bg-slate-800/40 border border-slate-800 rounded-xl p-4 text-center">
          <div className="col-span-2 text-left">
            <span className="text-[11px] text-slate-400 block font-medium">Squadra 1</span>
            <span className="text-base font-bold text-white block truncate">{match.team1?.name || 'TBD'}</span>
            <span className="text-xs text-amber-400 font-semibold">{t1SetsWon} set vinti</span>
          </div>

          <div className="col-span-1 text-center">
            <span className="text-xs font-bold bg-slate-700/60 text-slate-300 px-2.5 py-1 rounded-full border border-slate-600/60">
              VS
            </span>
          </div>

          <div className="col-span-2 text-right">
            <span className="text-[11px] text-slate-400 block font-medium">Squadra 2</span>
            <span className="text-base font-bold text-white block truncate">{match.team2?.name || 'TBD'}</span>
            <span className="text-xs text-amber-400 font-semibold">{t2SetsWon} set vinti</span>
          </div>
        </div>

        {/* Time & Court Management Section */}
        <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Programmazione Orario & Campo</span>
            </h4>

            {/* Save Only Time button */}
            <button
              type="button"
              onClick={handleSaveOnlySchedule}
              disabled={isSavingSchedule}
              className="text-xs bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              Salva Solo Orario/Campo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                Campo di Gioco
              </label>
              <select
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="Campo 1">Campo 1</option>
                <option value="Campo 2">Campo 2</option>
                <option value="Campo 3">Campo 3</option>
                <option value="Campo Centrale 1">Campo Centrale 1</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                Orario Previsto (HH:MM)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="20:30"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:border-amber-400 focus:outline-none text-center"
                />
                <button
                  type="button"
                  onClick={() => handleAdjustTime(-5)}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition"
                  title="-5 minuti"
                >
                  -5m
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustTime(+5)}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition"
                  title="+5 minuti"
                >
                  +5m
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustTime(+25)}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition"
                  title="+25 minuti (durata standard gara)"
                >
                  +25m
                </button>
              </div>
            </div>
          </div>

          {/* Overlap / Conflict Alert with 2 Resolution Actions */}
          {conflictingMatch && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-amber-300 block">
                    Sovrapposizione Rilevata su {court} alle ore {time}
                  </span>
                  <span className="text-slate-300 block mt-0.5">
                    È già programmata:{' '}
                    <strong className="text-white">
                      {conflictingMatch.roundLabel} ({conflictingMatch.team1?.name || 'TBD'} vs{' '}
                      {conflictingMatch.team2?.name || 'TBD'})
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleResolveSwapTimes}
                  disabled={isSavingSchedule}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  Inverti Orario con l'altra gara
                </button>

                <button
                  type="button"
                  onClick={handleResolveShiftFollowing}
                  disabled={isSavingSchedule}
                  className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  Fai Scorrere le gare a seguire (+25m)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Set Score Editors */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Punteggi dei Set</h4>

          {/* Set 1 */}
          <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">1° Set (a 25 punti)</span>
              {isSetFinished(sets[0]?.team1 || 0, sets[0]?.team2 || 0, 25) && (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Vinto da {sets[0].team1 > sets[0].team2 ? match.team1?.name : match.team2?.name}
                </span>
              )}
            </div>

            <div className="grid grid-cols-11 gap-2 items-center">
              {/* T1 controls */}
              <div className="col-span-5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAdjustPoints(0, 'team1', -1)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center transition"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={sets[0]?.team1 ?? 0}
                  onChange={(e) => handleSetScoreChange(0, 'team1', parseInt(e.target.value, 10) || 0)}
                  className="w-full text-center text-xl font-bold bg-slate-900 border border-slate-700 rounded-lg py-1 text-white focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAdjustPoints(0, 'team1', +1)}
                  className="w-8 h-8 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold flex items-center justify-center transition"
                >
                  +
                </button>
              </div>

              <div className="col-span-1 text-center font-bold text-slate-500">:</div>

              {/* T2 controls */}
              <div className="col-span-5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAdjustPoints(0, 'team2', -1)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center transition"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={sets[0]?.team2 ?? 0}
                  onChange={(e) => handleSetScoreChange(0, 'team2', parseInt(e.target.value, 10) || 0)}
                  className="w-full text-center text-xl font-bold bg-slate-900 border border-slate-700 rounded-lg py-1 text-white focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAdjustPoints(0, 'team2', +1)}
                  className="w-8 h-8 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold flex items-center justify-center transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick Set 1 buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 self-center mr-1">Rapidi:</span>
              <button
                type="button"
                onClick={() => handleQuickScore(0, 25, 20)}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded transition cursor-pointer"
              >
                25-20
              </button>
              <button
                type="button"
                onClick={() => handleQuickScore(0, 25, 23)}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded transition cursor-pointer"
              >
                25-23
              </button>
              <button
                type="button"
                onClick={() => handleQuickScore(0, 20, 25)}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded transition cursor-pointer"
              >
                20-25
              </button>
              <button
                type="button"
                onClick={() => handleQuickScore(0, 23, 25)}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded transition cursor-pointer"
              >
                23-25
              </button>
            </div>
          </div>

          {/* Set 2 (if Best of 3) */}
          {isBestOf3 && (
            <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">2° Set (a 25 punti)</span>
                {isSetFinished(sets[1]?.team1 || 0, sets[1]?.team2 || 0, 25) && (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Vinto da {sets[1].team1 > sets[1].team2 ? match.team1?.name : match.team2?.name}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-11 gap-2 items-center">
                <div className="col-span-5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdjustPoints(1, 'team1', -1)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={sets[1]?.team1 ?? 0}
                    onChange={(e) => handleSetScoreChange(1, 'team1', parseInt(e.target.value, 10) || 0)}
                    className="w-full text-center text-xl font-bold bg-slate-900 border border-slate-700 rounded-lg py-1 text-white focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAdjustPoints(1, 'team1', +1)}
                    className="w-8 h-8 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>

                <div className="col-span-1 text-center font-bold text-slate-500">:</div>

                <div className="col-span-5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdjustPoints(1, 'team2', -1)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={sets[1]?.team2 ?? 0}
                    onChange={(e) => handleSetScoreChange(1, 'team2', parseInt(e.target.value, 10) || 0)}
                    className="w-full text-center text-xl font-bold bg-slate-900 border border-slate-700 rounded-lg py-1 text-white focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAdjustPoints(1, 'team2', +1)}
                    className="w-8 h-8 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 self-center mr-1">Rapidi:</span>
                <button
                  type="button"
                  onClick={() => handleQuickScore(1, 25, 20)}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded transition cursor-pointer"
                >
                  25-20
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickScore(1, 25, 23)}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded transition cursor-pointer"
                >
                  25-23
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickScore(1, 20, 25)}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded transition cursor-pointer"
                >
                  20-25
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickScore(1, 23, 25)}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded transition cursor-pointer"
                >
                  23-25
                </button>
              </div>
            </div>
          )}

          {/* Set 3 / Tie-Break (if Best of 3 and tied 1-1) */}
          {isBestOf3 && (
            <div
              className={`border rounded-xl p-4 space-y-3 ${
                isThirdSetNeeded ? 'bg-amber-500/5 border-amber-500/30' : 'bg-slate-800/20 border-slate-800/60 opacity-80'
              }`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-amber-400">3° Set / Tie-Break (a {tieBreakTarget} punti)</span>
                {isSetFinished(sets[2]?.team1 || 0, sets[2]?.team2 || 0, tieBreakTarget) && (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Vinto da {sets[2].team1 > sets[2].team2 ? match.team1?.name : match.team2?.name}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-11 gap-2 items-center">
                <div className="col-span-5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdjustPoints(2, 'team1', -1)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={sets[2]?.team1 ?? 0}
                    onChange={(e) => handleSetScoreChange(2, 'team1', parseInt(e.target.value, 10) || 0)}
                    className="w-full text-center text-xl font-bold bg-slate-900 border border-slate-700 rounded-lg py-1 text-white focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAdjustPoints(2, 'team1', +1)}
                    className="w-8 h-8 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>

                <div className="col-span-1 text-center font-bold text-slate-500">:</div>

                <div className="col-span-5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdjustPoints(2, 'team2', -1)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={sets[2]?.team2 ?? 0}
                    onChange={(e) => handleSetScoreChange(2, 'team2', parseInt(e.target.value, 10) || 0)}
                    className="w-full text-center text-xl font-bold bg-slate-900 border border-slate-700 rounded-lg py-1 text-white focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAdjustPoints(2, 'team2', +1)}
                    className="w-8 h-8 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Match Outcome Banner */}
        {isMatchComplete && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-300 block">
                Vincitore: {winnerId === match.team1?.id ? match.team1?.name : match.team2?.name} ({t1SetsWon} - {t2SetsWon})
              </span>
              <span className="text-slate-400">
                Il risultato verrà salvato e la classifica/tabellone si aggiornerà automaticamente.
              </span>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4" />
            Salva Risultato Completo
          </button>
        </div>
      </motion.div>
    </div>
  );
}
