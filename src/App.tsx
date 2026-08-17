import React, { useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db, cleanObject, handleFirestoreError, OperationType } from './firebase';
import {
  Team,
  Match,
  NotificationLog,
  TeamLevel,
  Player,
  PlayerLevel,
  QuarterFinalsMode,
  TournamentConfig,
  TournamentBackup,
} from './types';
import {
  DEMO_TEAMS,
  getInitialTeamStats,
  splitTeamsIntoGroups,
  generateGroupMatches,
  computeClassificaAvulsa,
  generateKnockoutMatches,
  recalculateTournamentMatchTimes,
  parseTimeToMinutes,
  formatMinutesToTime,
  autoResolveAndPropagate,
  simulateAllGroupMatches,
  simulateKnockoutRound,
} from './utils';

import TeamsTab from './components/TeamsTab';
import GroupsTab from './components/GroupsTab';
import ClassificaAvulsaTab from './components/ClassificaAvulsaTab';
import BracketTab from './components/BracketTab';
import NotificationCenter from './components/NotificationCenter';
import SettingsTab from './components/SettingsTab';
import MatchScoreModal from './components/MatchScoreModal';
import AdminLoginModal from './components/AdminLoginModal';
import ToastContainer, { ToastMessage } from './components/ToastContainer';
import ConfirmModal from './components/ConfirmModal';

import {
  Users,
  Layers,
  Trophy,
  GitBranch,
  Bell,
  Settings,
  Lock,
  Unlock,
  Sparkles,
  RotateCcw,
  Moon,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import notteDaLeoniBanner from './assets/images/notte_leoni_ultrawide_1786991381890.jpg';
import logo90100Night from './assets/images/logo_90100_night_1786998231449.jpg';
import logoVolleyPartinico from './assets/images/logo_volley_partinico_1786998242526.jpg';
import logoContrera from './assets/images/logo_contrera_powered_1786998548772.jpg';

export default function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [backups, setBackups] = useState<TournamentBackup[]>([]);
  const [activeTab, setActiveTab] = useState<'teams' | 'groups' | 'avulsa' | 'bracket' | 'notifications' | 'settings'>('teams');
  const [quarterFinalsMode, setQuarterFinalsMode] = useState<QuarterFinalsMode>('single_set_25');
  const [config, setConfig] = useState<TournamentConfig>({
    tournamentName: 'Notturno 21 Agosto',
    tournamentDate: '21 Agosto',
    tournamentLocation: 'Campo Palamelina',
    quarterFinalsMode: 'single_set_25',
    courtCount: 1,
    courtName: 'Campo Palamelina',
    startTime: '20:30',
    durationSingleSetMinutes: 25,
    durationBestOf3Minutes: 50,
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('volley_admin_auth') === 'true';
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [editingMatchForScore, setEditingMatchForScore] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  // In-app Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // In-app Reset Tournament confirmation modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const addToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    title?: string
  ) => {
    const newToast: ToastMessage = {
      id: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      type,
      duration: 4000,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Real-time Firestore Listeners
  useEffect(() => {
    const unsubTeams = onSnapshot(
      collection(db, 'teams'),
      (snapshot) => {
        const list: Team[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Team);
        });
        setTeams(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'teams');
      }
    );

    const unsubMatches = onSnapshot(
      collection(db, 'matches'),
      (snapshot) => {
        const list: Match[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Match);
        });
        setMatches(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'matches');
      }
    );

    const unsubNotifs = onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => {
        const list: NotificationLog[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as NotificationLog);
        });
        list.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
        setNotifications(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'notifications');
      }
    );

    const unsubConfig = onSnapshot(
      doc(db, 'config', 'settings'),
      (docSnap) => {
        if (docSnap.exists()) {
          const cfg = docSnap.data() as TournamentConfig;
          setConfig((prev) => ({
            ...prev,
            ...cfg,
            courtCount: 1,
            courtName: cfg.courtName || 'Campo Palamelina',
            startTime: cfg.startTime || '20:30',
            durationSingleSetMinutes: cfg.durationSingleSetMinutes || 25,
            durationBestOf3Minutes: cfg.durationBestOf3Minutes || 50,
            quarterFinalsMode: cfg.quarterFinalsMode || 'single_set_25',
          }));
          if (cfg.quarterFinalsMode) {
            setQuarterFinalsMode(cfg.quarterFinalsMode);
          }
        }
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'config/settings');
        setLoading(false);
      }
    );

    const unsubBackups = onSnapshot(
      collection(db, 'backups'),
      (snapshot) => {
        const list: TournamentBackup[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as TournamentBackup);
        });
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setBackups(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'backups');
      }
    );

    return () => {
      unsubTeams();
      unsubMatches();
      unsubNotifs();
      unsubConfig();
      unsubBackups();
    };
  }, []);

  // Admin Auth Handlers
  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    sessionStorage.setItem('volley_admin_auth', 'true');
    addToast('Accesso Amministratore effettuato con successo.', 'success', 'Benvenuto Admin');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('volley_admin_auth');
    if (activeTab === 'settings') {
      setActiveTab('teams');
    }
    addToast('Sessione amministratore terminata.', 'info', 'Logout Eseguito');
  };

  // Team Actions
  const handleAddTeam = async (name: string, level: TeamLevel) => {
    if (teams.length >= 15) {
      addToast('Il torneo prevede un massimo di 15 squadre.', 'warning', 'Limite Raggiunto');
      return;
    }

    const cleanName = name.trim();
    const isDuplicate = teams.some(
      (t) => t.name.trim().toLowerCase() === cleanName.toLowerCase()
    );
    if (isDuplicate) {
      addToast(`Una squadra con il nome "${cleanName}" è già registrata.`, 'error', 'Nome Duplicato');
      return;
    }

    const now = Date.now();
    const newTeam: Team = getInitialTeamStats({
      id: `team_${now}_${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      level,
      registeredAt: new Date(now).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' }),
      createdAt: now,
    });

    try {
      await setDoc(doc(db, 'teams', newTeam.id), cleanObject(newTeam));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `teams/${newTeam.id}`);
    }
  };

  const handleUpdateTeam = async (id: string, name: string, level: TeamLevel, players?: Player[]) => {
    const existing = teams.find((t) => t.id === id);
    if (!existing) return;

    const cleanName = name.trim();
    const isDuplicate = teams.some(
      (t) => t.id !== id && t.name.trim().toLowerCase() === cleanName.toLowerCase()
    );
    if (isDuplicate) {
      addToast(`Una squadra con il nome "${cleanName}" è già registrata.`, 'error', 'Nome Duplicato');
      return;
    }

    const updated: Team = {
      ...existing,
      name: cleanName,
      level,
      ...(players !== undefined ? { players } : {}),
    };
    try {
      const batch = writeBatch(db);
      // 1. Update the team doc
      batch.set(doc(db, 'teams', id), cleanObject(updated));

      // 2. Cascade team name & level updates across all existing matches (Gironi & Tabellone)
      const updatedMatches = matches.map((m) => {
        let nextM = { ...m };

        if (nextM.team1 && nextM.team1.id === id) {
          nextM.team1 = {
            ...nextM.team1,
            name: cleanName,
            level,
            ...(players !== undefined ? { players } : {}),
          };
        }

        if (nextM.team2 && nextM.team2.id === id) {
          nextM.team2 = {
            ...nextM.team2,
            name: cleanName,
            level,
            ...(players !== undefined ? { players } : {}),
          };
        }

        return nextM;
      });

      // Auto resolve propagation in case bracket winners were carried forward
      const fullyResolved = autoResolveAndPropagate(updatedMatches);
      fullyResolved.forEach((m) => {
        const mRef = doc(db, 'matches', m.id);
        batch.set(mRef, cleanObject(m));
      });

      await batch.commit();
      addToast(`Squadra "${cleanName}" aggiornata anche nei gironi e nel tabellone.`, 'success', 'Squadra Aggiornata');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `teams/${id}`);
    }
  };

  const handleUpdateTeamPlayers = async (teamId: string, players: Player[]) => {
    const existing = teams.find((t) => t.id === teamId);
    if (!existing) return;

    const updated: Team = { ...existing, players };
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'teams', teamId), cleanObject(updated));

      // Propagate players to matches
      matches.forEach((m) => {
        let changed = false;
        let nextM = { ...m };
        if (nextM.team1 && nextM.team1.id === teamId) {
          nextM.team1 = { ...nextM.team1, players };
          changed = true;
        }
        if (nextM.team2 && nextM.team2.id === teamId) {
          nextM.team2 = { ...nextM.team2, players };
          changed = true;
        }
        if (changed) {
          batch.set(doc(db, 'matches', m.id), cleanObject(nextM));
        }
      });

      await batch.commit();
      addToast(`Rosa atleti per "${existing.name}" salvata con successo.`, 'success', 'Atleti Aggiornati');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `teams/${teamId}`);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'teams', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `teams/${id}`);
    }
  };

  // Clear all teams list
  const handleClearTeams = async () => {
    try {
      const batch = writeBatch(db);
      const teamsSnap = await getDocs(collection(db, 'teams'));
      teamsSnap.forEach((d) => batch.delete(d.ref));
      const matchesSnap = await getDocs(collection(db, 'matches'));
      matchesSnap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      addToast('Tutte le squadre sono state rimosse e i gironi resettati.', 'info', 'Lista Svuotata');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'teams');
    }
  };

  const handleLoadDemoTeams = async () => {
    try {
      const batch = writeBatch(db);
      DEMO_TEAMS.forEach((demo) => {
        const teamObj = getInitialTeamStats(demo);
        const ref = doc(db, 'teams', teamObj.id);
        batch.set(ref, cleanObject(teamObj));
      });
      await batch.commit();
      addToast('15 Squadre Demo caricate con successo!', 'success', 'Squadre Caricate');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'teams');
    }
  };

  // Generate 5 Groups (Girone A, B, C, D, E) via FIPAV Round Robin 3 criteria
  const handleGenerateGroups = async () => {
    if (teams.length !== 15) {
      addToast('Per generare i 5 gironi sono necessarie esattamente 15 squadre.', 'warning', 'Squadre Insufficienti');
      return;
    }

    try {
      const groups = splitTeamsIntoGroups(teams);
      const groupMatches = generateGroupMatches(
        groups,
        config.startTime || '20:30',
        1,
        config.durationSingleSetMinutes || 25,
        config.courtName || 'Campo Palamelina'
      );

      const batch = writeBatch(db);

      // Update teams with their assigned group
      Object.entries(groups).forEach(([gName, gTeams]) => {
        gTeams.forEach((t) => {
          const tRef = doc(db, 'teams', t.id);
          batch.set(tRef, cleanObject({ ...t, group: gName }));
        });
      });

      // Clear previous knockout matches if any, and save group matches
      const existingMatchesSnap = await getDocs(collection(db, 'matches'));
      existingMatchesSnap.forEach((d) => batch.delete(d.ref));

      groupMatches.forEach((m) => {
        const mRef = doc(db, 'matches', m.id);
        batch.set(mRef, cleanObject(m));
      });

      // Add a notification log
      const notifRef = doc(db, 'notifications', `notif_groups_${Date.now()}`);
      batch.set(
        notifRef,
        cleanObject({
          id: `notif_groups_${Date.now()}`,
          title: 'Gironi FIPAV Generati 🏐',
          message:
            'I 5 gironi da 3 squadre con criterio FIPAV a scorrimento e il calendario gare (set a 25 punti su Campo Palamelina) sono pronti!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'system',
        })
      );

      await batch.commit();
      addToast('I 5 gironi FIPAV e le 15 partite a set unico a 25 punti su Campo Palamelina sono stati generati!', 'success', 'Gironi Pronti');
      setActiveTab('groups');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'matches');
    }
  };

  // Generate Knockout Stage from Classifica Avulsa
  const handleGenerateKnockout = async () => {
    const groupMatches = matches.filter((m) => m.phase === 'gironi' || m.groupName);
    const completedGroupMatches = groupMatches.filter((m) => m.status === 'completed');

    if (groupMatches.length !== 15 || completedGroupMatches.length !== 15) {
      addToast(
        `Il tabellone finale è bloccato: devi prima completare tutte le 15 gare dei gironi (${completedGroupMatches.length}/15 completate).`,
        'warning',
        'Tabellone Bloccato'
      );
      return;
    }

    try {
      const rankedTeams = computeClassificaAvulsa(teams, matches);
      const startKnockoutMinutes =
        parseTimeToMinutes(config.startTime || '20:30') + 15 * (config.durationSingleSetMinutes || 25);
      const knockoutMatches = generateKnockoutMatches(
        rankedTeams,
        config.quarterFinalsMode || quarterFinalsMode,
        formatMinutesToTime(startKnockoutMinutes),
        1,
        config.durationSingleSetMinutes || 25,
        config.durationBestOf3Minutes || 50,
        config.courtName || 'Campo Palamelina'
      );

      const batch = writeBatch(db);
      knockoutMatches.forEach((m) => {
        const mRef = doc(db, 'matches', m.id);
        batch.set(mRef, cleanObject(m));
      });

      // Add notification
      const notifRef = doc(db, 'notifications', `notif_ko_${Date.now()}`);
      batch.set(
        notifRef,
        cleanObject({
          id: `notif_ko_${Date.now()}`,
          title: 'Tabellone Eliminazione Diretta Pubblicato 🏆',
          message: `Classifica avulsa determinata! ${rankedTeams[0]?.name || 'La 1ª classificata'} accede direttamente ai Quarti (BYE). Gli Ottavi di finale sono programmati su Campo Palamelina.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'live_update',
        })
      );

      await batch.commit();
      addToast('Tabellone finale a eliminazione diretta generato con successo!', 'success', 'Tabellone Pubblicato');
      setActiveTab('bracket');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'matches');
    }
  };

  // Simulate all group matches
  const handleSimulateGroupMatches = async () => {
    try {
      const simulated = simulateAllGroupMatches(matches);
      const batch = writeBatch(db);
      simulated.forEach((m) => {
        const mRef = doc(db, 'matches', m.id);
        batch.set(mRef, cleanObject(m));
      });
      await batch.commit();
      addToast('Tutte le partite dei gironi sono state simulate!', 'success', 'Simulazione Completata');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'matches');
    }
  };

  // Simulate current knockout round
  const handleSimulateKnockoutRound = async () => {
    try {
      const simulated = simulateKnockoutRound(matches);
      const batch = writeBatch(db);
      simulated.forEach((m) => {
        const mRef = doc(db, 'matches', m.id);
        batch.set(mRef, cleanObject(m));
      });
      await batch.commit();
      addToast('Turno del tabellone simulato con successo!', 'success', 'Simulazione Completata');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'matches');
    }
  };

  // Batch update matches (e.g. For time swap / ripple shift)
  const handleBatchUpdateMatches = async (updatedMatches: Match[]) => {
    try {
      const batch = writeBatch(db);
      updatedMatches.forEach((m) => {
        const mRef = doc(db, 'matches', m.id);
        batch.set(mRef, cleanObject(m));
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'matches');
    }
  };

  // Save Match Score & Propagate
  const handleSaveMatchScore = async (matchId: string, updatedData: Partial<Match>) => {
    try {
      const currentMatch = matches.find((m) => m.id === matchId);
      if (!currentMatch) return;

      const mergedMatch: Match = {
        ...currentMatch,
        ...updatedData,
      };

      // Build updated list and propagate to downstream matches
      const updatedMatches = matches.map((m) => (m.id === matchId ? mergedMatch : m));
      const fullyResolved = autoResolveAndPropagate(updatedMatches);

      const batch = writeBatch(db);
      fullyResolved.forEach((m) => {
        const mRef = doc(db, 'matches', m.id);
        batch.set(mRef, cleanObject(m));
      });

      // If match was completed, generate a score result notification
      if (mergedMatch.status === 'completed' && mergedMatch.winnerId) {
        const winner =
          mergedMatch.winnerId === mergedMatch.team1?.id ? mergedMatch.team1 : mergedMatch.team2;
        const loser =
          mergedMatch.winnerId === mergedMatch.team1?.id ? mergedMatch.team2 : mergedMatch.team1;

        let scoreStr = '';
        if (mergedMatch.sets && mergedMatch.sets.length > 0) {
          scoreStr = mergedMatch.sets.map((s) => `${s.team1}-${s.team2}`).join(', ');
        }

        const notifRef = doc(db, 'notifications', `notif_score_${Date.now()}`);
        batch.set(
          notifRef,
          cleanObject({
            id: `notif_score_${Date.now()}`,
            title: `Risultato: ${mergedMatch.roundLabel} 🏐`,
            message: `${winner?.name || 'Vincitore'} batte ${loser?.name || 'Sconfitto'} (${scoreStr})`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'result',
            matchId: mergedMatch.id,
          })
        );
      }

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `matches/${matchId}`);
    }
  };

  // Update Quarter Finals Mode in Config & Matches
  const handleUpdateQuarterFinalsMode = async (mode: QuarterFinalsMode) => {
    try {
      setQuarterFinalsMode(mode);
      const isBestOf3 = mode === 'best_of_3_tb15';

      const batch = writeBatch(db);
      const cfgRef = doc(db, 'config', 'settings');
      batch.set(cfgRef, cleanObject({ quarterFinalsMode: mode }), { merge: true });

      // Update Quarti matches (round 3)
      matches
        .filter((m) => m.round === 3)
        .forEach((m) => {
          const mRef = doc(db, 'matches', m.id);
          batch.set(
            mRef,
            cleanObject({
              ...m,
              maxSets: isBestOf3 ? 3 : 1,
              tieBreakPoints: isBestOf3 ? 15 : 25,
            })
          );
        });

      await batch.commit();
      addToast(
        `Formula Quarti di Finale impostata su: ${isBestOf3 ? '2 su 3 (TB a 15)' : 'Set Unico a 25'}`,
        'success',
        'Formula Aggiornata'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/settings');
    }
  };

  // Save Tournament Configuration (Settings Tab)
  const handleSaveConfig = async (updatedConfig: TournamentConfig) => {
    try {
      setConfig(updatedConfig);
      setQuarterFinalsMode(updatedConfig.quarterFinalsMode);
      await setDoc(doc(db, 'config', 'settings'), cleanObject(updatedConfig), { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/settings');
      throw err;
    }
  };

  // Apply sequential Single-Court schedule to all existing matches
  const handleApplyScheduleToMatches = async (
    startTime: string,
    durationSingleSet: number,
    durationBestOf3: number,
    courtName: string,
    qfMode: QuarterFinalsMode
  ) => {
    try {
      const updated = recalculateTournamentMatchTimes(
        matches,
        startTime,
        durationSingleSet,
        durationBestOf3,
        courtName,
        qfMode
      );
      const batch = writeBatch(db);
      updated.forEach((m) => {
        const ref = doc(db, 'matches', m.id);
        batch.set(ref, cleanObject(m));
      });

      const cfgRef = doc(db, 'config', 'settings');
      batch.set(
        cfgRef,
        cleanObject({
          startTime,
          durationSingleSetMinutes: durationSingleSet,
          durationBestOf3Minutes: durationBestOf3,
          courtName,
          courtCount: 1,
          quarterFinalsMode: qfMode,
        }),
        { merge: true }
      );

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'matches');
      throw err;
    }
  };

  // Notification Actions
  const handleAddNotification = async (notification: NotificationLog) => {
    try {
      await setDoc(doc(db, 'notifications', notification.id), cleanObject(notification));
      addToast('Avviso pubblicato sulla bacheca del torneo.', 'success', 'Notifica Inviata');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `notifications/${notification.id}`);
    }
  };

  const handleClearNotifications = async () => {
    try {
      const snap = await getDocs(collection(db, 'notifications'));
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      addToast('Bacheca notifiche svuotata.', 'info', 'Bacheca Pulita');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'notifications');
    }
  };

  // Backup and Restore Handlers
  const handleCreateBackup = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const now = Date.now();
    const backupId = `backup_${now}_${Math.random().toString(36).substring(2, 6)}`;
    const backup: TournamentBackup = {
      id: backupId,
      name: trimmed,
      createdAt: now,
      createdAtFormatted: new Date(now).toLocaleString('it-IT', {
        dateStyle: 'short',
        timeStyle: 'medium',
      }),
      createdBy: 'Amministratore',
      teams: teams,
      matches: matches,
      config: config,
      notifications: notifications,
      teamsCount: teams.length,
      matchesCount: matches.length,
    };

    try {
      await setDoc(doc(db, 'backups', backupId), cleanObject(backup));
      addToast(`Backup "${trimmed}" salvato con successo!`, 'success', 'Punto di Ripristino Creato');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `backups/${backupId}`);
      throw err;
    }
  };

  const handleRestoreBackup = async (backup: TournamentBackup) => {
    try {
      const batch = writeBatch(db);

      // 1. Delete and overwrite teams
      const teamsSnap = await getDocs(collection(db, 'teams'));
      teamsSnap.forEach((d) => batch.delete(d.ref));
      if (backup.teams && backup.teams.length > 0) {
        backup.teams.forEach((t) => {
          const ref = doc(db, 'teams', t.id);
          batch.set(ref, cleanObject(t));
        });
      }

      // 2. Delete and overwrite matches
      const matchesSnap = await getDocs(collection(db, 'matches'));
      matchesSnap.forEach((d) => batch.delete(d.ref));
      if (backup.matches && backup.matches.length > 0) {
        backup.matches.forEach((m) => {
          const ref = doc(db, 'matches', m.id);
          batch.set(ref, cleanObject(m));
        });
      }

      // 3. Overwrite config
      if (backup.config) {
        const cfgRef = doc(db, 'config', 'settings');
        batch.set(cfgRef, cleanObject(backup.config));
      }

      // 4. Overwrite notifications
      const notifsSnap = await getDocs(collection(db, 'notifications'));
      notifsSnap.forEach((d) => batch.delete(d.ref));
      if (backup.notifications && backup.notifications.length > 0) {
        backup.notifications.forEach((n) => {
          const ref = doc(db, 'notifications', n.id);
          batch.set(ref, cleanObject(n));
        });
      }

      // Add a restore event notification
      const restoreNotifRef = doc(db, 'notifications', `notif_restore_${Date.now()}`);
      batch.set(
        restoreNotifRef,
        cleanObject({
          id: `notif_restore_${Date.now()}`,
          title: 'Torneo Ripristinato da Backup 🔄',
          message: `Stato ripristinato al salvataggio "${backup.name}" (creato il ${backup.createdAtFormatted}).`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'system',
        })
      );

      await batch.commit();
      addToast(
        `Torneo ripristinato allo stato di "${backup.name}" (${backup.createdAtFormatted}).`,
        'success',
        'Ripristino Eseguito'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'backups/restore');
      throw err;
    }
  };

  const handleDeleteBackup = async (backupId: string, backupName: string) => {
    try {
      await deleteDoc(doc(db, 'backups', backupId));
      addToast(`Backup "${backupName}" eliminato con successo.`, 'info', 'Backup Eliminato');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `backups/${backupId}`);
      throw err;
    }
  };

  // Reset entire tournament
  const handleResetTournament = async () => {
    try {
      const batch = writeBatch(db);
      const teamsSnap = await getDocs(collection(db, 'teams'));
      teamsSnap.forEach((d) => batch.delete(d.ref));
      const matchesSnap = await getDocs(collection(db, 'matches'));
      matchesSnap.forEach((d) => batch.delete(d.ref));
      const notifsSnap = await getDocs(collection(db, 'notifications'));
      notifsSnap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      setActiveTab('teams');
      addToast('Il torneo è stato completamente resettato.', 'info', 'Reset Eseguito');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'all');
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Ambient Light Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-48 bg-amber-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Full-width Neon Marquee Sign at Top of Page */}
      <div className="w-full bg-black border-b border-amber-500/30 relative overflow-hidden flex items-center justify-center shadow-2xl shadow-amber-950/90">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 pointer-events-none" />
        <div className="w-full flex justify-center items-center bg-black overflow-hidden">
          <img
            src={notteDaLeoniBanner}
            alt="Una Notte da Leoni - Torneo Notturno di Pallavolo"
            referrerPolicy="no-referrer"
            id="main-title-logo"
            className="w-full h-auto max-h-48 sm:max-h-64 md:max-h-80 lg:max-h-96 object-cover sm:object-contain object-center select-none scale-[1.03] sm:scale-100 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Main Header Bar */}
      <header id="main-header" className="sticky top-0 z-40 bg-black/95 border-b border-amber-500/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Subtitle & Event info */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              Notturno 21 Agosto • Campo Palamelina
            </span>
            <span className="text-xs text-slate-400 hidden md:inline">
              Pallavolo 15 Squadre • 5 Gironi • Tabellone Finale
            </span>
          </div>

          {/* Admin Toggle: Simple Open / Closed Padlock without text */}
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <button
                  id="admin-logout-btn"
                  onClick={handleAdminLogout}
                  className="p-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 rounded-xl border border-emerald-500/40 transition cursor-pointer flex items-center justify-center shadow-sm shadow-emerald-500/10"
                  title="Admin attivo - Clicca per uscire"
                  aria-label="Admin attivo - Clicca per uscire"
                >
                  <Unlock className="w-4 h-4 text-emerald-400" />
                </button>
                <button
                  id="reset-tournament-btn"
                  onClick={() => setIsResetModalOpen(true)}
                  className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-xl transition cursor-pointer"
                  title="Reset completo torneo"
                  aria-label="Reset completo torneo"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="admin-login-open-btn"
                onClick={() => setIsAdminLoginOpen(true)}
                className="p-2 bg-zinc-900/90 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 rounded-xl border border-amber-500/30 hover:border-amber-500/60 transition cursor-pointer flex items-center justify-center shadow-sm"
                title="Accedi all'area amministratore"
                aria-label="Accedi all'area amministratore"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto">
          <nav className="flex space-x-1 sm:space-x-2 py-1">
            <button
              id="tab-btn-teams"
              onClick={() => setActiveTab('teams')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'teams'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Squadre</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  activeTab === 'teams' ? 'bg-black/20 text-black font-bold' : 'bg-zinc-900 text-slate-400'
                }`}
              >
                {teams.length}/15
              </span>
            </button>

            <button
              id="tab-btn-groups"
              onClick={() => setActiveTab('groups')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'groups'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Gironi (5 da 3)</span>
            </button>

            <button
              id="tab-btn-avulsa"
              onClick={() => setActiveTab('avulsa')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'avulsa'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Classifica Avulsa</span>
            </button>

            <button
              id="tab-btn-bracket"
              onClick={() => setActiveTab('bracket')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'bracket'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>Tabellone Finale</span>
            </button>

            <button
              id="tab-btn-notifications"
              onClick={() => setActiveTab('notifications')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'notifications'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Bacheca Notifiche</span>
              {notifications.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeTab === 'notifications'
                      ? 'bg-black text-amber-300'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {notifications.length}
                </span>
              )}
            </button>

            {isAdmin && (
              <button
                id="tab-btn-settings"
                onClick={() => setActiveTab('settings')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                  activeTab === 'settings'
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Impostazioni</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'teams' && (
            <motion.div
              key="teams"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <TeamsTab
                teams={teams}
                isAdmin={isAdmin}
                onAddTeam={handleAddTeam}
                onUpdateTeam={handleUpdateTeam}
                onUpdatePlayers={handleUpdateTeamPlayers}
                onDeleteTeam={handleDeleteTeam}
                onClearTeams={handleClearTeams}
                onLoadDemoTeams={handleLoadDemoTeams}
                onGenerateGroups={handleGenerateGroups}
                onResetTournament={handleResetTournament}
                onShowToast={addToast}
              />
            </motion.div>
          )}

          {activeTab === 'groups' && (
            <motion.div
              key="groups"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <GroupsTab
                teams={teams}
                matches={matches}
                isAdmin={isAdmin}
                onOpenScoreModal={(m) => setEditingMatchForScore(m)}
                onNavigateToAvulsa={() => setActiveTab('avulsa')}
                onGenerateKnockout={handleGenerateKnockout}
                onSimulateGroupMatches={handleSimulateGroupMatches}
                onShowToast={addToast}
              />
            </motion.div>
          )}

          {activeTab === 'avulsa' && (
            <motion.div
              key="avulsa"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ClassificaAvulsaTab
                teams={teams}
                matches={matches}
                isAdmin={isAdmin}
                onNavigateToBracket={() => setActiveTab('bracket')}
                onGenerateKnockout={handleGenerateKnockout}
              />
            </motion.div>
          )}

          {activeTab === 'bracket' && (
            <motion.div
              key="bracket"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <BracketTab
                matches={matches}
                teams={teams}
                isAdmin={isAdmin}
                quarterFinalsMode={quarterFinalsMode}
                onOpenScoreModal={(m) => setEditingMatchForScore(m)}
                onUpdateQuarterFinalsMode={handleUpdateQuarterFinalsMode}
                onGenerateKnockout={handleGenerateKnockout}
                onSimulateKnockoutRound={handleSimulateKnockoutRound}
                onShowToast={addToast}
              />
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <NotificationCenter
                isAdmin={isAdmin}
                notifications={notifications}
                teams={teams}
                onAddNotification={handleAddNotification}
                onClearNotifications={handleClearNotifications}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && isAdmin && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SettingsTab
                config={config}
                matches={matches}
                teams={teams}
                isAdmin={isAdmin}
                backups={backups}
                onSaveConfig={handleSaveConfig}
                onApplyScheduleToMatches={handleApplyScheduleToMatches}
                onCreateBackup={handleCreateBackup}
                onRestoreBackup={handleRestoreBackup}
                onDeleteBackup={handleDeleteBackup}
                onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
                onShowToast={addToast}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Page Bottom Footer with Official Logos Side by Side and Powered By */}
      <footer
        id="app-bottom-logos-footer"
        className="border-t border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md py-8 px-4 mt-12"
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-6">
          {/* Main Organization Logos */}
          <div className="flex flex-row items-center justify-center gap-6 sm:gap-12 flex-wrap">
            {/* Logo 1: 90.100 Night */}
            <div
              id="footer-logo-90100-container"
              className="flex items-center justify-center p-2 rounded-2xl bg-black border border-zinc-800 shadow-md"
            >
              <img
                id="footer-logo-90100"
                src={logo90100Night}
                alt="90.100 Night"
                referrerPolicy="no-referrer"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
              />
            </div>

            {/* Logo 2: A.S.D. Volley Partinico */}
            <div
              id="footer-logo-partinico-container"
              className="flex items-center justify-center p-2 rounded-2xl bg-white border border-zinc-200 shadow-md"
            >
              <img
                id="footer-logo-partinico"
                src={logoVolleyPartinico}
                alt="A.S.D. Volley Partinico"
                referrerPolicy="no-referrer"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="w-16 h-px bg-zinc-800/80" />

          {/* Powered By Contrera */}
          <div id="footer-powered-by-section" className="flex flex-col items-center justify-center gap-2">
            <span className="text-[11px] font-semibold tracking-widest uppercase text-slate-400">
              powered by
            </span>
            <div
              id="footer-logo-contrera-container"
              className="flex items-center justify-center p-2 rounded-2xl bg-black border border-zinc-800 shadow-md"
            >
              <img
                id="footer-logo-contrera"
                src={logoContrera}
                alt="CONTRERA"
                referrerPolicy="no-referrer"
                className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
              />
            </div>
          </div>
        </div>
      </footer>

      {/* Match Score & Time Management Modal */}
      {editingMatchForScore && (
        <MatchScoreModal
          match={editingMatchForScore}
          allMatches={matches}
          teams={teams}
          onClose={() => setEditingMatchForScore(null)}
          onSaveScore={handleSaveMatchScore}
          onBatchUpdateMatches={handleBatchUpdateMatches}
          onShowToast={addToast}
        />
      )}

      {/* Admin Login Modal (Password: 90100) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* In-app Reset Tournament Confirm Modal */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        title="Reset Completo del Torneo"
        message="Attenzione: questa operazione cancellerà tutte le squadre iscritte, i gironi generati, i punteggi salvati e le notifiche. Sei sicuro di voler procedere?"
        confirmLabel="Reset Totale"
        isDestructive={true}
        onConfirm={handleResetTournament}
        onClose={() => setIsResetModalOpen(false)}
      />

      {/* Global In-App Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
