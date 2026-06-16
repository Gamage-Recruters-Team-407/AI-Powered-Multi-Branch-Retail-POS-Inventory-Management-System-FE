import React from 'react';

const QuickActions = ({ onSelect }) => {
  const actions = ["Low Stock", "Top Sellers", "Sales Report", "Trending", "Help"];

  return (
    <div className="flex overflow-x-auto py-2 px-4 gap-2 no-scrollbar border-t border-gray-100 bg-white">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => onSelect(action)}
          className="whitespace-nowrap text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-colors focus:outline-none"
        >
          {action}
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
