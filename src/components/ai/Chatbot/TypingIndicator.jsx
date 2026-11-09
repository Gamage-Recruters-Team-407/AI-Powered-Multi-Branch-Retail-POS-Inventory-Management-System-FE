import React from 'react';
import { motion } from 'framer-motion';

const TypingIndicator = () => {
  return (
    <div className="flex w-full mb-4 justify-start">
      <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
        <motion.div
          className="w-1.5 h-1.5 bg-gray-400 rounded-full"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0 }}
        />
        <motion.div
          className="w-1.5 h-1.5 bg-gray-400 rounded-full"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.div
          className="w-1.5 h-1.5 bg-gray-400 rounded-full"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
      </div>
    </div>
  );
};

export default TypingIndicator;
