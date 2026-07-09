import React from 'react';
import { X, AlertCircle, AlertTriangle } from 'lucide-react';

const ActionCard = ({ action, onDismiss, onAction }) => {
  const isCritical = action.urgency === 'critical';

  return (
    <div className={`relative flex flex-col p-4 rounded-xl border ${
      isCritical ? 'bg-red-50/50 border-red-100' : 'bg-yellow-50/50 border-yellow-100'
    } mb-3 group transition-colors hover:shadow-sm`}>
      
      <button 
        onClick={() => onDismiss(action.id)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 mb-3">
        <div className={`mt-0.5 ${isCritical ? 'text-red-500' : 'text-yellow-500'}`}>
          {isCritical ? <AlertCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 text-sm pr-6">{action.title}</h4>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{action.description}</p>
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <button
          onClick={() => onAction(action)}
          className={`text-xs font-semibold px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 ${
            isCritical 
              ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 focus:ring-offset-1' 
              : 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400 focus:ring-offset-1'
          }`}
        >
          {action.actionText}
        </button>
      </div>
    </div>
  );
};

export default ActionCard;
