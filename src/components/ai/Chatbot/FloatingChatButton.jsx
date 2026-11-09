import React from 'react';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const FloatingChatButton = ({ onClick, unreadCount = 0 }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-5 right-5 z-50 flex items-center justify-center w-15 h-15 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300"
      style={{ width: '60px', height: '60px' }}
      aria-label="Open AI Assistant"
    >
      <MessageSquare className="w-8 h-8" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full">
          {unreadCount}
        </span>
      )}
    </motion.button>
  );
};

export default FloatingChatButton;
