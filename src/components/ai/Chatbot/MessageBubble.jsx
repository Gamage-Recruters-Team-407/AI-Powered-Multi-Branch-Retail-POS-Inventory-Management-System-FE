import React from 'react';

const renderFormattedText = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    // Parse bold text
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const lineContent = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
      // Remove the '* ' or '- ' prefix from the first part
      const content = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        if (i === 0) {
           return part.replace(/^\s*[*|-]\s/, '');
        }
        return part;
      });

      return (
        <div key={idx} className="flex gap-2 my-1.5 ml-2">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0" />
          <span>{content}</span>
        </div>
      );
    }

    return (
      <div key={idx} className={`${idx > 0 && trimmedLine ? 'mt-3' : ''} min-h-[1em]`}>
        {lineContent}
      </div>
    );
  });
};

const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-blue-600 text-white rounded-tr-sm' 
            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
        }`}
      >
        <div className="text-[14px] leading-relaxed break-words">
          {renderFormattedText(message.text)}
        </div>
        <div 
          className={`text-[10px] mt-1.5 text-right ${
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
