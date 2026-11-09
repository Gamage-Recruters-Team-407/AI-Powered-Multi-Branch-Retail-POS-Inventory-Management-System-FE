import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

const BatchActions = ({ onApproveAll, onScheduleLater, onDismissAll }) => {
  return (
    <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-gray-100">
      <button
        onClick={onDismissAll}
        className="flex flex-1 items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <XCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Dismiss All</span>
      </button>

      <button
        onClick={onScheduleLater}
        className="flex flex-1 items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none"
      >
        <Clock className="w-4 h-4" />
        <span className="hidden sm:inline">Schedule</span>
      </button>

      <button
        onClick={onApproveAll}
        className="flex flex-1 items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm focus:outline-none"
      >
        <CheckCircle2 className="w-4 h-4" />
        <span className="hidden sm:inline">Approve All</span>
      </button>
    </div>
  );
};

export default BatchActions;
