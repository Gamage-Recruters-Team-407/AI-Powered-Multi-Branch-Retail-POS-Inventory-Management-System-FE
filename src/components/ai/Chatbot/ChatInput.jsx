import React, { useState } from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ onSend, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-center gap-2 p-3 border-t border-gray-200 bg-white rounded-b-2xl"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        placeholder={disabled ? "AI is thinking..." : "Ask me anything..."}
        className="flex-grow bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-70"
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="flex items-center justify-center bg-blue-600 text-white rounded-xl px-4 py-2.5 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Send Message"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};

export default ChatInput;
