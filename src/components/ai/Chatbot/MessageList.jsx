import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const MessageList = ({ messages, isTyping }) => {
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  return (
    <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50 flex flex-col no-scrollbar">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-2 opacity-60">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
            <span className="text-2xl">👋</span>
          </div>
          <p className="text-sm font-medium">I'm your AI Retail Assistant.</p>
          <p className="text-xs">Ask me about inventory, sales, or trends!</p>
        </div>
      )}
      
      {messages.map((msg, index) => (
        <MessageBubble key={index} message={msg} />
      ))}
      
      {isTyping && <TypingIndicator />}
      
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;
