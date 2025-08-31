'use client';

import React, { useState } from 'react';

interface TabItem {
  id: string;
  label: string;
  icon?: string;
  content: React.ReactNode;
}

interface TabNavigationProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  tabs, 
  defaultTab, 
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Headers */}
      <div className="tab-nav flex border-b border-primary-1/20 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center space-x-2 px-4 sm:px-6 py-3 font-medium text-sm sm:text-base
              border-b-2 transition-all duration-200 whitespace-nowrap touch-target
              ${activeTab === tab.id
                ? 'border-primary-1 text-primary-1 bg-primary-1/5'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400'
              }
            `}
          >
            {tab.icon && <span className="text-lg">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTabContent}
      </div>
    </div>
  );
};

export default TabNavigation;
