import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

interface SingleToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const SingleToastItem: React.FC<SingleToastItemProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const getIconAndStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          border: 'border-emerald-500/40 bg-slate-900/95 text-slate-100 shadow-emerald-500/10',
          titleColor: 'text-emerald-400',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
          border: 'border-red-500/40 bg-slate-900/95 text-slate-100 shadow-red-500/10',
          titleColor: 'text-red-400',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          border: 'border-amber-500/40 bg-slate-900/95 text-slate-100 shadow-amber-500/10',
          titleColor: 'text-amber-400',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
          border: 'border-sky-500/40 bg-slate-900/95 text-slate-100 shadow-sky-500/10',
          titleColor: 'text-sky-400',
        };
    }
  };

  const style = getIconAndStyle();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto border rounded-2xl p-4 shadow-xl backdrop-blur-md flex items-start gap-3 ${style.border}`}
    >
      {style.icon}
      <div className="flex-1 text-xs space-y-0.5">
        {toast.title && <h5 className={`font-bold ${style.titleColor}`}>{toast.title}</h5>}
        <p className="text-slate-300 leading-relaxed">{toast.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      id="toast-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <SingleToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
