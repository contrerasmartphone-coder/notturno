import React, { useState } from 'react';
import { NotificationLog, Team } from '../types';
import { Bell, Send, Check, Sparkles, Smartphone, Calendar, Trash2, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationCenterProps {
  isAdmin: boolean;
  notifications: NotificationLog[];
  teams: Team[];
  onAddNotification: (notification: NotificationLog) => void;
  onClearNotifications: () => void;
}

export default function NotificationCenter({
  isAdmin,
  notifications,
  teams,
  onAddNotification,
  onClearNotifications,
}: NotificationCenterProps) {
  const [pushTitle, setPushTitle] = useState('Aggiornamento Orari Torneo ⏰');
  const [pushMessage, setPushMessage] = useState('Tutte le squadre sono pregate di presentarsi al campo 5 minuti prima del match.');
  const [pushType, setPushType] = useState<NotificationLog['type']>('schedule_change');
  const [successSent, setSuccessSent] = useState(false);

  const handleSendCustomNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushMessage.trim()) return;

    const newNotification: NotificationLog = {
      id: `notif-manual-${Date.now()}`,
      title: pushTitle.trim(),
      message: pushMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: pushType,
    };

    onAddNotification(newNotification);
    setPushMessage('');
    setSuccessSent(true);
    setTimeout(() => {
      setSuccessSent(false);
    }, 3000);
  };

  const loadTemplate = (title: string, msg: string, type: NotificationLog['type']) => {
    setPushTitle(title);
    setPushMessage(msg);
    setPushType(type);
  };

  return (
    <div id="notification-tab-root" className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {/* Admin Dispatcher Console */}
      {isAdmin && (
        <div id="dispatcher-console" className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Invia Notifica Live</h4>
                <p className="text-xs text-slate-400">Broadcast a tutti i partecipanti</p>
              </div>
            </div>

            <form onSubmit={handleSendCustomNotification} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Titolo *
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:border-amber-400 focus:outline-none"
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Categoria
                </label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:border-amber-400 focus:outline-none"
                  value={pushType}
                  onChange={(e) => setPushType(e.target.value as NotificationLog['type'])}
                >
                  <option value="schedule_change">Variazione Orari / Campi ⏰</option>
                  <option value="live_update">Aggiornamento Live 🎙️</option>
                  <option value="result">Risultato / Classifica 🏆</option>
                  <option value="system">Comunicazione Organizzativa 🏐</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Messaggio *
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-xs focus:border-amber-400 focus:outline-none"
                  placeholder="Scrivi qui il messaggio..."
                  value={pushMessage}
                  onChange={(e) => setPushMessage(e.target.value)}
                />
              </div>

              {successSent && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  Notifica trasmessa a tutte le squadre!
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                Pubblica Notifica
              </button>
            </form>

            {/* Quick Templates */}
            <div className="mt-6 border-t border-slate-800 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2.5">
                Modelli Preimpostati
              </span>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => loadTemplate('Riscaldamento Campo Palamelina 🏐', 'Inizio riscaldamento ufficiale su Campo Palamelina. Squadre pronte!', 'live_update')}
                  className="w-full text-left p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700/60 text-xs text-slate-300 transition"
                >
                  🏐 Riscaldamento in corso
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate('Spostamento Campo 🏟️', 'Il prossimo incontro degli Ottavi si disputerà sul Campo 1 anziché sul Campo 3.', 'schedule_change')}
                  className="w-full text-left p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700/60 text-xs text-slate-300 transition"
                >
                  🏟️ Variazione campo di gioco
                </button>
                <button
                  type="button"
                  onClick={() => loadTemplate('Premiazione Finale 🏆', 'Tutte le 15 squadre sono invitate al podio al termine della finale per le premiazioni.', 'system')}
                  className="w-full text-left p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700/60 text-xs text-slate-300 transition"
                >
                  🏆 Cerimonia di premiazione
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Feed */}
      <div
        id="notifications-feed-card"
        className={`bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-[650px] ${
          isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'
        }`}
      >
        <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Bacheca Notifiche & Aggiornamenti</h3>
            <p className="text-xs text-slate-400">Feed live delle notizie, variazioni e risultati del torneo</p>
          </div>
          {isAdmin && notifications.length > 0 && (
            <button
              onClick={onClearNotifications}
              className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-xl border border-red-500/30 hover:bg-red-500/10 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Svuota Feed
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center text-slate-500 py-12">
              <Bell className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-sm font-semibold text-slate-400">Nessuna notifica presente</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                I risultati delle partite e le comunicazioni dello staff appariranno automaticamente qui in tempo reale.
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {notifications.map((notif) => {
                const getBadge = (type: NotificationLog['type']) => {
                  switch (type) {
                    case 'live_update':
                      return { label: 'LIVE 🎙️', border: 'border-l-4 border-l-red-500 bg-red-500/5' };
                    case 'result':
                      return { label: 'RISULTATO 🏆', border: 'border-l-4 border-l-amber-500 bg-amber-500/5' };
                    case 'schedule_change':
                      return { label: 'ORARI ⏰', border: 'border-l-4 border-l-sky-500 bg-sky-500/5' };
                    case 'system':
                    default:
                      return { label: 'COMUNICAZIONE 🏐', border: 'border-l-4 border-l-emerald-500 bg-emerald-500/5' };
                  }
                };

                const badge = getBadge(notif.type);

                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border border-slate-800 bg-slate-900/90 ${badge.border} space-y-1.5`}
                  >
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-amber-400">{badge.label}</span>
                      <span className="font-mono text-slate-400">{notif.time}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                      {notif.message}
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
