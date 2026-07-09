import React from 'react';
import { Bot, Minus, X } from 'lucide-react';

const ChatHeader = ({ onClose, onMinimize }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-t-2xl shadow-sm">
      <div className="flex items-center gap-2">
        <div className="bg-white/20 p-1.5 rounded-lg">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">AI Retail Assistant</h3>
          <p className="text-xs text-blue-100 opacity-80">Online</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button 
          onClick={onMinimize}
          className="p-1.5 hover:bg-white/20 rounded-md transition-colors focus:outline-none"
          aria-label="Minimize"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-white/20 rounded-md transition-colors focus:outline-none"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
