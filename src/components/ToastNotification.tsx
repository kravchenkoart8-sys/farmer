import React from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'warning' | 'info' | 'harvest';
  title?: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map(toast => {
        let borderColor = 'border-[#634832]/20';
        let iconColor = 'text-[#634832]';
        let titleColor = 'text-[#634832]';
        let Icon = Info;

        if (toast.type === 'success') {
          borderColor = 'border-[#5A7D6C]/40';
          iconColor = 'text-[#5A7D6C]';
          titleColor = 'text-[#5A7D6C]';
          Icon = CheckCircle2;
        } else if (toast.type === 'warning') {
          borderColor = 'border-[#D97757]/40';
          iconColor = 'text-[#D97757]';
          titleColor = 'text-[#D97757]';
          Icon = AlertCircle;
        } else if (toast.type === 'harvest') {
          borderColor = 'border-[#D97757]/60';
          iconColor = 'text-[#D97757]';
          titleColor = 'text-[#D97757]';
          Icon = Sparkles;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl bg-[#FDF8F1] ${borderColor} border-2 shadow-xl backdrop-blur-md flex items-center gap-3 transition-all duration-300 animate-slide-up`}
          >
            <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
            <div className="flex-1 text-xs font-sans">
              {toast.title && <div className={`font-serif font-bold text-sm leading-tight ${titleColor}`}>{toast.title}</div>}
              <div className="text-[#2C2C2C] mt-0.5">{toast.message}</div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#634832]/50 hover:text-[#634832] text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};

