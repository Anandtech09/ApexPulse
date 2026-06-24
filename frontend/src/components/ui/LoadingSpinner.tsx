import React from "react";

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Syncing with Yahoo & Google Finance..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 my-12 glass-panel rounded-2xl max-w-md mx-auto">
      <div className="relative flex items-center justify-center w-16 h-16 mb-4">
        {/* Outer glowing pulsing ring */}
        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping opacity-75"></div>
        {/* Spinning loading arc */}
        <div className="absolute w-12 h-12 rounded-full border-4 border-transparent border-t-indigo-500 border-r-indigo-500 animate-spin"></div>
        {/* Core static dot */}
        <div className="w-4 h-4 bg-indigo-400 rounded-full"></div>
      </div>
      <p className="text-slate-200 font-medium text-sm text-center">{message}</p>
      <p className="text-slate-400 text-xs mt-1 text-center">Please wait while we compile the analytics...</p>
    </div>
  );
};
