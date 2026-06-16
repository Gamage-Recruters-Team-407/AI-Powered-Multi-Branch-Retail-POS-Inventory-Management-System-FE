import React from 'react';

const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl ${
          isUser 
            ? 'bg-blue-600 text-white rounded-tr-sm' 
            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
        }`}
      >
        <p className="text-[14px] leading-relaxed break-words">{message.text}</p>
        <div 
          className={`text-[10px] mt-1 text-right ${
            isUser ? 'text-blue-200' : 'text-gray-400'
          }`}
        >
          {message.timestamp}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
