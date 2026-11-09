import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import QuickActions from './QuickActions';
import ChatInput from './ChatInput';

const ChatWindow = ({ isOpen, isMinimized, onClose, onMinimize, messages, isTyping, onSendMessage }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          height: isMinimized ? 'auto' : '500px'
        }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-[90px] right-5 z-50 flex flex-col w-[380px] max-w-[calc(100vw-40px)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        <ChatHeader onClose={onClose} onMinimize={onMinimize} />
        
        {!isMinimized && (
          <>
            <MessageList messages={messages} isTyping={isTyping} />
            <QuickActions onSelect={onSendMessage} />
            <ChatInput onSend={onSendMessage} disabled={isTyping} />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatWindow;
