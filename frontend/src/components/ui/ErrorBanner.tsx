import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 mb-6 border border-rose-500/20 bg-rose-950/20 backdrop-blur-md rounded-xl max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 p-2 bg-rose-500/10 text-rose-400 rounded-lg">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h4 className="text-rose-200 font-semibold text-sm">Synchronisation Error</h4>
          <p className="text-rose-300/80 text-xs mt-0.5">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-100 rounded-lg text-xs font-semibold border border-rose-500/30 transition-all cursor-pointer"
        >
          <RefreshCw size={14} className="animate-spin-slow" />
          Retry Connection
        </button>
      )}
    </div>
  );
};
