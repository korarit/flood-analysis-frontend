import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { AlertOctagon, RotateCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  className = '',
}) => {
  const { isThai } = useLanguage();

  const defaultTitle = isThai ? 'เกิดข้อผิดพลาดในการโหลดข้อมูล' : 'Error Loading Data';
  const defaultMsg = isThai
    ? 'ไม่สามารถเชื่อมต่อกับบริการข้อมูลโทรมาตรได้ กรุณาลองใหม่อีกครั้ง'
    : 'Unable to connect to water telemetry services. Please try again.';
  const retryText = isThai ? 'ลองใหม่' : 'Retry';

  return (
    <div
      className={`rounded-3xl border border-rose-300 dark:border-rose-900/50 bg-rose-50/90 dark:bg-rose-950/20 p-8 text-center backdrop-blur-md flex flex-col items-center justify-center max-w-md mx-auto my-6 shadow-md dark:shadow-xl transition-colors ${className}`}
      role="alert"
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/40 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 shadow-sm">
        <AlertOctagon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-rose-900 dark:text-rose-200 mb-2">{title || defaultTitle}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">{message || defaultMsg}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-xs"
        >
          <RotateCw className="w-4 h-4" />
          <span>{retryText}</span>
        </button>
      )}
    </div>
  );
};
